/* ═══════════════════════════════════════════════════════════════
   drift-wall.js —— 斜切透视、逐列漂移的截图墙

   移植自 React Bits 的 DriftWall。原组件是 React + CSS 变量；这里是 classic script，
   不依赖任何库。行为一比一：
     · 瓷片按列分配（第 i 张进第 i % columns 列），每列复制若干份首尾相接，
       按 speed × 列系数 × 方向 匀速漂移，奇偶列反向；
     · 鼠标在墙上：整面墙按 parallax 微倾（阻尼 0.12s）；停在哪一张，那一列停、那张抬起（lift）；
     · 首屏和边缘用蒙版渐隐（fade），闲置瓷片压暗（dim），可选灰度。
   和原组件不同的三处：
     1. 瓷片来源是宿主里现成的 <a><img></a> —— 出包脚本靳的静态扫描只认 src=""/href=""，
        写在 JSON 里的图路径不会被打进包，所以图必须以标签形式留在 HTML 里；
     2. 不在视口 / 页面隐藏 / 所在 tab 没激活（clientWidth 为 0）时不渲染；
        原组件常驻 rAF，这个页面上已经有两块 WebGL 在跑，不能再养一个闲循环；
     3. 窄屏降级：两列、瓷片缩到 55%、关视差。
   面板里的每一项都能在 data-dw 的 JSON 里覆盖，键名和 React 的 props 一致。
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var DEF = {
    columns: 4, tileW: 280, tileH: 188, gap: 18, radius: 14,
    tilt: 16, turn: -14, roll: 0, perspective: 1200, depth: 120,
    speed: 42, direction: 'up', variance: 0.45, parallax: 0.6,
    pauseOnHover: false, lift: 64, fade: 0.6, dim: 0.55, grayscale: false,
    overlay: '#060010'
  };

  /* 每列一个不同的速度系数，用黄金分割撒开，看起来像各走各的 */
  function colFactor(i, v) { var p = ((i * 0.6180339887 + 0.35) % 1) * 2 - 1; return 1 + v * p; }

  var instances = [];

  function mount(hostSel, opt) {
    var host = typeof hostSel === 'string' ? document.querySelector(hostSel) : hostSel;
    if (!host || host.__dw) return host && host.__dw || null;
    var o = Object.assign({}, DEF, opt || {});
    try { Object.assign(o, JSON.parse(host.getAttribute('data-dw') || '{}')); } catch (e) {}

    /* 瓷片：宿主里的 <img>，外面若包着 <a href> 就当作「点开看大图」 */
    var tiles = [].slice.call(host.querySelectorAll('img')).map(function (im) {
      var a = im.closest('a');
      return { src: im.getAttribute('src'), alt: im.getAttribute('alt') || '', href: a ? a.getAttribute('href') : '' };
    });
    if (!tiles.length) return null;
    host.innerHTML = '';

    var reduced = !!(root.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var narrow = root.innerWidth < 700;
    var columns = narrow ? Math.min(2, o.columns) : o.columns;
    var tileW = narrow ? Math.round(o.tileW * 0.55) : o.tileW;
    var tileH = narrow ? Math.round(o.tileH * 0.55) : o.tileH;
    var parallax = narrow ? 0 : o.parallax;

    host.classList.add('dw'); if (reduced) host.classList.add('dw--reduced');
    var vars = {
      '--dw-tile-w': tileW + 'px', '--dw-tile-h': tileH + 'px', '--dw-gap': o.gap + 'px',
      '--dw-radius': o.radius + 'px', '--dw-perspective': o.perspective + 'px', '--dw-lift': o.lift + 'px',
      '--dw-dim': o.dim, '--dw-gray': o.grayscale ? 1 : 0, '--dw-overlay': o.overlay,
      '--dw-edge': Math.max(0, (1 - o.fade) * 100) + '%'
    };
    for (var k in vars) host.style.setProperty(k, vars[k]);

    /* 分列 */
    var cols = []; for (var c = 0; c < columns; c++) cols.push([]);
    tiles.forEach(function (t, i) { cols[i % columns].push(t); });
    cols = cols.map(function (col) { return col.length ? col : tiles.slice(0, 1); });

    var unit = tileH + o.gap;
    var plane = document.createElement('div'); plane.className = 'dw__plane'; host.appendChild(plane);
    var tracks = [], meta = [], offsets = [], vel = [];
    var H = host.clientHeight || 600;
    var activeEl = null, hoveredCol = -1, wallHovered = false;

    function setActive(el, col) {
      if (activeEl === el) return;
      if (activeEl) activeEl.classList.remove('is-active');
      activeEl = el; hoveredCol = col;
      if (el) el.classList.add('is-active');
    }
    function release() { setActive(null, -1); }

    function buildTracks() {
      plane.innerHTML = ''; tracks = []; meta = [];
      cols.forEach(function (col, c) {
        var copyH = Math.max(unit, col.length * unit);
        var copies = Math.max(2, Math.ceil((H * 1.6) / copyH) + 1);
        meta.push({ copyH: copyH, copies: copies });
        var colEl = document.createElement('div'); colEl.className = 'dw__col';
        var track = document.createElement('div'); track.className = 'dw__track';
        for (var k = 0; k < copies; k++) col.forEach(function (t) {
          /* 有 onOpen 回调：瓷片是按钮，点了在页内放大（同 .si-open 弹层）；否则退回 <a> 跳大图 */
          var tile = document.createElement(!o.onOpen && t.href ? 'a' : 'div');
          tile.className = 'dw__tile'; tile.setAttribute('data-col', c); tile.setAttribute('aria-label', t.alt || 'tile');
          if (!o.onOpen && t.href) { tile.href = t.href; tile.target = '_blank'; tile.rel = 'noopener noreferrer'; }
          else {
            tile.tabIndex = 0; tile.setAttribute('role', o.onOpen ? 'button' : 'img');
            if (o.onOpen) {
              var fire = function () { o.onOpen({ src: t.href || t.src, alt: t.alt }, tile); };
              tile.addEventListener('click', fire);
              tile.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); } });
            }
          }
          var inner = document.createElement('span'); inner.className = 'dw__inner';
          var img = document.createElement('img'); img.src = t.src; img.alt = t.alt; img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
          var ov = document.createElement('span'); ov.className = 'dw__overlay'; ov.setAttribute('aria-hidden', 'true');
          inner.appendChild(img); inner.appendChild(ov); tile.appendChild(inner); track.appendChild(tile);
          tile.addEventListener('focus', function () { setActive(tile, c); });
          tile.addEventListener('blur', release);
        });
        colEl.appendChild(track); plane.appendChild(colEl); tracks.push(track);
      });
      offsets = meta.map(function (m, c) { return m.copyH * ((c * 0.37) % 1); });
      vel = meta.map(function () { return 0; });
    }
    buildTracks();

    var dirSign = o.direction === 'up' ? 1 : -1;
    var baseV = cols.map(function (_, c) { return o.speed * colFactor(c, o.variance) * dirSign * (c % 2 === 0 ? 1 : -1); });

    var ptr = { x: 0, y: 0 }, ptrD = { x: 0, y: 0 }, last = null, raf = 0, visible = true, frames = 0;

    function onMove(e) {
      var r = host.getBoundingClientRect();
      if (parallax > 0 && !reduced) ptr = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
      var hit = document.elementFromPoint(e.clientX, e.clientY);
      var tile = hit && hit.closest ? hit.closest('.dw__tile') : null;
      if (!tile) return;
      setActive(tile, +tile.getAttribute('data-col'));
    }
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerenter', function () { wallHovered = true; });
    host.addEventListener('pointerleave', function () { wallHovered = false; ptr = { x: 0, y: 0 }; release(); });

    function planeTransform(px, py) {
      plane.style.transform = 'translate(-50%,-50%) scale(1.18) rotateX(' + (o.tilt + py) + 'deg) rotateY(' + (o.turn + px) + 'deg) rotateZ(' + o.roll + 'deg) translateZ(' + (-o.depth) + 'px)';
    }

    /* 推进一步。dt 秒。抽出来是为了测试钩子能同步走帧（隐藏面板里 rAF 不走） */
    function step(dt) {
      var maxTilt = parallax * 8, tx = ptr.x * maxTilt, ty = -ptr.y * maxTilt, d = 1 - Math.exp(-dt / 0.12);
      ptrD.x += (tx - ptrD.x) * d; ptrD.y += (ty - ptrD.y) * d;
      planeTransform(ptrD.x, ptrD.y);
      for (var c = 0; c < tracks.length; c++) {
        var m = meta[c];
        if (!reduced) {
          var paused = wallHovered && o.pauseOnHover;
          var target = baseV[c] * ((paused || hoveredCol === c) ? 0 : 1);
          var ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
          vel[c] += (target - vel[c]) * ease;
          var n = offsets[c] + vel[c] * dt;
          offsets[c] = ((n % m.copyH) + m.copyH) % m.copyH;
        }
        tracks[c].style.transform = 'translate3d(0,' + (-offsets[c]) + 'px,0)';
      }
      frames++;
    }
    function tick(ts) {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || !host.clientWidth) { last = null; return; }
      if (last === null) last = ts;
      var dt = Math.min(0.05, Math.max(0, ts - last) / 1000); last = ts;
      step(dt);
    }
    raf = requestAnimationFrame(tick);

    if (root.ResizeObserver) new ResizeObserver(function (es) {
      var h = es[0].contentRect.height || 600;
      if (Math.abs(h - H) > 1) { H = h; buildTracks(); }
    }).observe(host);
    var io = null;
    if (root.IntersectionObserver) { io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }); io.observe(host); }
    step(0);

    var api = {
      el: host,
      step: function (dt) { step(dt == null ? 1 / 60 : dt); return frames; },
      stats: function () {
        return { 瓷片: tiles.length, 列: columns, 每列副本: meta.map(function (m) { return m.copies; }), 容器高: H, 已渲染帧: frames,
                 可见: visible, 偏移: offsets.map(Math.round), 基速: baseV.map(Math.round), 窄屏: narrow, 减动效: reduced,
                 瓷片尺寸: tileW + '×' + tileH, 蒙版边: vars['--dw-edge'] };
      },
      destroy: function () { cancelAnimationFrame(raf); if (io) io.disconnect(); host.innerHTML = ''; host.__dw = null; }
    };
    host.__dw = api; instances.push(api);
    return api;
  }

  function mountAll(sel, opt) { return [].slice.call(document.querySelectorAll(sel || '.dw')).map(function (el) { return mount(el, opt); }); }

  root.DriftWall = { mount: mount, mountAll: mountAll, all: instances };
})(window);

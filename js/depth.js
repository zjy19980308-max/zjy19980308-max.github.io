/* depth.js —— 可切换的图册（深度层叠）。维护：网站交互调整。
   owner 2026-09-17：「看不清啊，点他也不放大，你这里做成可切换的图册」，并给了 DepthCarousel 的 React 实现做参照。
   这里把那份实现搬成原生 JS（站里是传统 script，不能用模块），行为对齐参照：
   · 卡片沿 Z 轴层叠，越靠后越远、越偏、越暗、越糊；当前那张正对镜头；
   · 拖 / 滚轮 / 方向键 / 点后面的卡片 / 箭头 / 圆点都能切；拖动带甩动惯性（按速度预测落点）；
   · 缓动用 GSAP，prefers-reduced-motion 时不做补间。
   跟参照不同的两处（作品图不是等比素材图）：
   · 卡片按每张图自己的比例算宽高，图用 contain 不裁切——海报是竖的、排版是横的，裁了就废了；
   · 默认不自动播放，作品要停得住。
   用法：V7Depth.open(items, startIndex, title)，items = ['a.jpg', …] 或 [{src, alt}]。 */
(function () {
  'use strict';
  var gsap = window.gsap; if (!gsap) return;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CFG = { depth: 230, tilt: 22, dir: 1, visible: 4, falloff: .2, blur: 6, dur: .7, ease: 'power3.out' };

  function create(root, items, opts) {
    opts = opts || {};
    var n = items.length, pos = 0, focus = 0, tween = null, cards = [], nominal = 320;
    var stage = document.createElement('div'); stage.className = 'dcar__stage';
    root.appendChild(stage);

    items.forEach(function (it, i) {
      var c = document.createElement('div'); c.className = 'dcar__card';
      c.innerHTML = '<img src="' + it.src + '" alt="' + (it.alt || '') + '" draggable="false">'
        + '<span class="dcar__tint"></span>';
      c.addEventListener('click', function () { if (!drag || !drag.moved) go(i, true); });
      stage.appendChild(c);
      cards.push({ el: c, tint: c.querySelector('.dcar__tint'), img: c.querySelector('img'), ar: it.ar || 0 });
      /* 图读到了再定卡片的宽高：海报竖、排版横，各按各的比例 */
      var im = cards[i].img;
      im.addEventListener('load', function () { cards[i].ar = im.naturalWidth / im.naturalHeight; size(); }, { once: true });
    });

    function size() {
      var r = root.getBoundingClientRect();
      var H = clamp(r.height * .72, 200, 820), maxW = r.width * .5;
      nominal = 0;
      cards.forEach(function (c) {
        var ar = c.ar || .72, w = H * ar, h = H;
        if (w > maxW) { w = maxW; h = w / ar; }
        c.el.style.width = Math.round(w) + 'px'; c.el.style.height = Math.round(h) + 'px';
        nominal = Math.max(nominal, w);
      });
      layout(pos);
    }

    var LOOP = n > 4;   /* 三五张图不做无限循环：环绕会把最后一张算成 d<0，甩到相机这一侧 */
    function layout(p) {
      var spread = nominal * .34;
      for (var i = 0; i < n; i++) {
        var c = cards[i], d = i - p;
        if (LOOP && n > 1) { d = ((d % n) + n) % n; if (d > n / 2) d -= n; }
        var back = Math.max(0, d), az = Math.abs(d), shown = az <= CFG.visible + .5;
        var tz = -CFG.depth * d, tx = CFG.dir * spread * d, ry = CFG.dir * CFG.tilt * clamp(d, 0, 1);
        var op = d < 0 ? Math.max(0, 1 + d) : 1; if (!shown) op = 0;
        c.el.style.transform = 'translate(-50%,-50%) translateX(' + tx.toFixed(1) + 'px) translateZ(' + tz.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg)';
        c.el.style.opacity = op.toFixed(3);
        c.el.style.filter = 'brightness(' + Math.max(.15, 1 - back * CFG.falloff).toFixed(3) + ') blur(' + Math.min(CFG.blur, back / Math.max(1, CFG.visible) * CFG.blur).toFixed(2) + 'px)';
        /* 层级按「离前景多远」算，不按正负：d<0 是正在淡出的那张，
           以前用 2000-d*20 会让它拿到比前景更高的层级，静止时就常驻在最前面挡住主卡（owner：「后边的会挡住」）。 */
        c.el.style.zIndex = String(Math.round(2000 - Math.abs(d) * 20));
        c.el.style.pointerEvents = shown && op > .05 ? 'auto' : 'none';
        c.tint.style.opacity = clamp(back * CFG.falloff * 1.25, 0, .86).toFixed(3);
      }
    }

    function tweenTo(target, animate) {
      tween && tween.kill();
      var o = { p: pos };
      tween = gsap.to(o, {
        p: target, duration: animate && !reduce ? CFG.dur : 0, ease: CFG.ease,
        onUpdate: function () { pos = o.p; layout(pos); },
        onComplete: function () { pos = LOOP ? ((pos % n) + n) % n : clamp(pos, 0, n - 1); layout(pos); }
      });
    }
    function go(raw, animate) {
      var idx = LOOP ? ((raw % n) + n) % n : clamp(raw, 0, n - 1), delta = idx - pos;
      if (LOOP && n > 1) { delta = ((delta % n) + n) % n; if (delta > n / 2) delta -= n; }
      tweenTo(pos + delta, animate);
      if (idx !== focus) { focus = idx; opts.onChange && opts.onChange(idx); }
    }

    /* 拖 */
    var drag = null;
    root.addEventListener('pointerdown', function (e) {
      if (n < 2 || e.target.closest('.dcar__btn,.dcar__dot')) return;
      tween && tween.kill();
      drag = { x: e.clientX, from: pos, lastX: e.clientX, lastT: performance.now(), v: 0, moved: false, id: e.pointerId };
    });
    root.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var stepPx = Math.max(nominal * .55, 40), dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; root.setPointerCapture && root.setPointerCapture(drag.id); }
      if (!drag.moved) return;
      var now = performance.now(), dt = Math.max(now - drag.lastT, 1);
      drag.v = (e.clientX - drag.lastX) / dt; drag.lastX = e.clientX; drag.lastT = now;
      pos = drag.from - dx / stepPx; layout(pos);
    });
    function end() {
      if (!drag) return; var d = drag; drag = null;
      if (!d.moved) return;
      var stepPx = Math.max(nominal * .55, 40);
      go(Math.round(pos - d.v * 180 / stepPx), true);
    }
    root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);

    /* 滚轮 */
    var wt = null;
    root.addEventListener('wheel', function (e) {
      if (n < 2) return; e.preventDefault(); tween && tween.kill();
      var raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      pos += clamp((e.deltaMode === 1 ? raw * 24 : raw) / (nominal * .9), -.6, .6); layout(pos);
      clearTimeout(wt); wt = setTimeout(function () { go(Math.round(pos), true); }, 130);
    }, { passive: false });

    var ro = 'ResizeObserver' in window ? new ResizeObserver(size) : null;
    ro && ro.observe(root);
    size();
    return { go: go, next: function () { go(focus + 1, true); }, prev: function () { go(focus - 1, true); }, size: size, index: function () { return focus; }, destroy: function () { ro && ro.disconnect(); tween && tween.kill(); } };
  }

  /* ── 全屏图册 ── */
  var box = null, car = null, onKey = null;
  function open(list, start, title) {
    close();
    var items = list.map(function (x) { return typeof x === 'string' ? { src: x } : x; }).filter(function (x) { return x && x.src; });
    if (!items.length) return;
    box = document.createElement('div'); box.className = 'dcar';
    box.innerHTML = '<div class="dcar__bg" data-close></div>'
      + '<div class="dcar__head"><span class="dcar__t"></span><span class="dcar__n"></span>'
      + '<button class="dcar__close" type="button" data-close aria-label="关闭">关闭</button></div>'
      + '<div class="dcar__view"></div>'
      + '<button class="dcar__btn dcar__btn--prev" type="button" aria-label="上一张"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      + '<button class="dcar__btn dcar__btn--next" type="button" aria-label="下一张"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
      + '<div class="dcar__dots"></div>';
    document.body.appendChild(box);
    box.querySelector('.dcar__t').textContent = title || '';
    var dots = box.querySelector('.dcar__dots');
    dots.innerHTML = items.map(function (_, i) { return '<button class="dcar__dot" type="button" aria-label="第 ' + (i + 1) + ' 张"></button>'; }).join('');
    var num = box.querySelector('.dcar__n');
    function mark(i) {
      num.textContent = (i + 1) + ' / ' + items.length;
      [].forEach.call(dots.children, function (d, k) { d.classList.toggle('is-on', k === i); });
    }
    car = create(box.querySelector('.dcar__view'), items, { onChange: mark });
    mark(0);
    if (start) car.go(start, false);
    [].forEach.call(dots.children, function (d, k) { d.addEventListener('click', function () { car.go(k, true); }); });
    box.querySelector('.dcar__btn--prev').addEventListener('click', function () { car.prev(); });
    box.querySelector('.dcar__btn--next').addEventListener('click', function () { car.next(); });
    box.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
    onKey = function (e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); car.prev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); car.next(); }
    };
    addEventListener('keydown', onKey);
    document.documentElement.classList.add('dcar-on');
    window.__v7lenis && window.__v7lenis.stop();
    requestAnimationFrame(function () { box.classList.add('is-on'); });
  }
  function close() {
    if (!box) return;
    var b = box; box = null; car && car.destroy(); car = null;
    removeEventListener('keydown', onKey); onKey = null;
    b.classList.remove('is-on');
    document.documentElement.classList.remove('dcar-on');
    window.__v7lenis && window.__v7lenis.start();
    setTimeout(function () { b.remove(); }, 280);
  }
  window.V7Depth = { create: create, open: open, close: close };
})();

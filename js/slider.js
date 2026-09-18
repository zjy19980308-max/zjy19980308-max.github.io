/* slider.js —— 横滑图（首页精选项目、项目页剩余页面共用）。维护：网站交互调整。
   手感照原站 leoparpeix.com projectBlock 逐帧（scratchpad lp/w3）：
   · 静止：图宽 72.57vw，间隙约 15px，一张居中、左右露出邻图，无限循环；
   · 拖动：每张图的「窗口」变窄（离中心越远收得越多），里面的截图不缩放、且比窗口移动得慢——像被遮住 / 揭开，手风琴一样；随速度轻微倾斜；
   · 松手：先带惯性，再 .8s 吸附到最近一张居中；
   · 进视口：整排从右边滑进来（2s reveal）。
   owner 2026-09-16：「视觉设计这里呈现作品本身也会缓慢滚动」→ opts.auto = true 时，这一排自己往左匀速流（约 18px/s），拖动 / 惯性期间让位，松手停 1.2s 再接上，且不做吸附。
   用法：V7Slider.create(el, ['assets/shots/a.webp', …, null = 「未完待续」占位], { onOpen(index, src), auto: true, fit: true })  → 轻点（没拖动）时回调，用来开大图。
   opts.fit（owner 2026-09-17「不要撑满，要根据我给你的图片大小来」）：每张卡的宽度 = 行高 × 这张图自己的宽高比，不裁切；位置累加着算，不再是等宽网格。 */
(function () {
  'use strict';
  var gsap = window.gsap; if (!gsap) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var all = [];
  function en(t) { return '<span class="enTag" lang="en" aria-hidden="true">' + t + '</span>'; }

  function create(el, shots, opts) {
    opts = opts || {};
    var S = { el: el, shots: shots, items: [], offset: 0, vel: 0, drag: 0, dir: 0, down: false, lastX: 0, lastT: 0, inView: false, intro: reduce ? 1 : 0, shown: false, w: 0, moved: 0, auto: !!opts.auto && !reduce, autoHold: 0, autoS: 0, fit: !!opts.fit, total: 0 };
    function relayout() {                          /* fit：每张卡宽度不一样，位置得累加着算 */
      var x = 0;
      for (var i = 0; i < S.items.length; i++) { var it = S.items[i]; it.x0 = x; x += it.w; }
      S.total = x || 1;
      S.w = S.items.length ? S.total / S.items.length : 1;   /* 平均宽：手感参数（吸附、收窄幅度）还按它算 */
    }
    S.relayout = relayout;
    function build() {
      el.innerHTML = '';
      el.classList.toggle('projectBlock__slider--fit', S.fit);   /* fit 的框要跟卡片一样宽，见 style.css */
      var H = el.getBoundingClientRect().height || innerWidth * .419;
      S.w = innerWidth * (innerWidth <= 760 ? .86 : .725694);
      var need = S.fit ? Math.ceil((innerWidth + H * 3.2) / (H * .55)) : Math.ceil((innerWidth + S.w * 3) / S.w);
      var list = [], idx = [];
      while (list.length < Math.max(need, S.shots.length * (S.fit ? 2 : 1))) { list = list.concat(S.shots); idx = idx.concat(S.shots.map(function (_, i) { return i; })); }
      S.items = list.map(function (src, i) {
        var d = document.createElement('div'); d.className = 'slider__media';
        d.innerHTML = '<div class="media__frame">' + (src ? '<img class="media__image" src="' + src + '" alt="" draggable="false" loading="' + (i < 3 ? 'eager' : 'lazy') + '">' : '<div class="media__soon"><b>未完待续</b>' + en('To be continued') + '</div>') + '</div>';
        el.appendChild(d);
        var it = { el: d, frame: d.firstChild, k: idx[i], src: src, w: S.w, x0: 0 };
        if (S.fit) {
          /* owner 2026-09-17：「不要撑满，要根据我给你的图片大小来」→ 卡片宽度 = 行高 × 这张图自己的宽高比。
             比例从 js/visual-ar.js 这张生成的表里取：图是 loading="lazy" 的，没进视口就不触发 load，
             靠 DOM 量比例根本量不到（那几张会一直用默认宽，左右被吃掉 → owner：「有遮挡啊」）。
             表里没有的才退回去听 load，作兜底。 */
          var AR = window.V7AR || {};
          it.ar = AR[src] || 0;
          /* 宽度有上限：banner 是 3.24 的超宽比例，按「行高 × 比例」算出来快 2000px，比屏还宽，
             只能看见中间一块（owner：banner 放的太大了，看不到全貌）。
             超过上限就改成压高度、在行内垂直居中，整张就都看得见了。 */
          var MAXW = innerWidth * (innerWidth <= 760 ? .86 : .78);
          it.w = Math.min(H * (it.ar || .72), MAXW);
          it.h = Math.min(H, it.w / (it.ar || .72));
          d.style.width = it.w.toFixed(1) + 'px';
          d.style.height = it.h.toFixed(1) + 'px';
          d.style.top = ((H - it.h) / 2).toFixed(1) + 'px';
          var im = d.querySelector('img');
          if (im && !it.ar) {
            var apply = function () {
              if (!im.naturalWidth) return;
              it.ar = im.naturalWidth / im.naturalHeight;
              var MX = innerWidth * (innerWidth <= 760 ? .86 : .78);
              it.w = Math.min(H * it.ar, MX); it.h = Math.min(H, it.w / it.ar);
              d.style.width = it.w.toFixed(1) + 'px'; d.style.height = it.h.toFixed(1) + 'px';
              d.style.top = ((H - it.h) / 2).toFixed(1) + 'px'; relayout();
            };
            if (im.complete) apply(); else im.addEventListener('load', apply, { once: true });
          }
        }
        return it;
      });
      relayout();
    }
    build(); S.build = build;

    el.addEventListener('pointerdown', function (e) {
      if (e.button) return; gsap.killTweensOf(S, 'offset'); S.snapping = false; S.down = true; S.moved = 0; S.lastX = e.clientX; S.lastT = performance.now(); S.vel = 0;
      S.downTarget = e.target.closest('.slider__media');
      el.setPointerCapture && el.setPointerCapture(e.pointerId); el.classList.add('is-dragging');
    });
    el.addEventListener('pointermove', function (e) {
      if (!S.down) return;
      var now = performance.now(), dx = e.clientX - S.lastX, dt = Math.max(1, now - S.lastT);
      S.offset += dx; S.moved += Math.abs(dx);
      S.vel = S.vel * .6 + (dx / dt * 16.67) * .4;   /* 每帧像素 */
      S.lastX = e.clientX; S.lastT = now;
    });
    function up() {
      if (!S.down) return; S.down = false; S.released = true; el.classList.remove('is-dragging');
      if (performance.now() - S.lastT > 80) S.vel = 0;
      if (S.moved < 6 && S.downTarget && opts.onOpen) {   /* 轻点 = 开大图 */
        var hit = S.items.filter(function (it) { return it.el === S.downTarget; })[0];
        if (hit && hit.src) opts.onOpen(hit.k, hit.src);
      }
    }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { gsap.killTweensOf(S, 'offset'); S.snapping = false; S.offset -= e.deltaX; S.vel = -e.deltaX * .3; S.released = true; e.preventDefault(); } }, { passive: false });
    all.push(S);
    return S;
  }

  /* owner 2026-09-15：「拖动的交互，还是变成之前那样的吧」→ 还原到上一版：
     间距固定，拖动时每张图的窗口收窄（离中心越远收得越多，靠后一侧收得多），画面不缩放、比窗口移动得慢（像被遮住），随速度轻微倾斜；
     松手惯性后 .8s 吸附到最近一张居中。（「拖得快窗口收到一半、图紧挨着收拢」那一版已撤。） */
  function step(S, dt) {
    var r = S.el.getBoundingClientRect(), vh = innerHeight;
    S.inView = r.bottom > -50 && r.top < vh + 50;
    if (!S.shown && r.top < vh * .9) { S.shown = true; if (!reduce) gsap.to(S, { intro: 1, duration: 2, ease: 'reveal' }); }
    if (!S.inView) return;
    var k = dt / 16.67, w = S.w;
    if (!S.down && !S.snapping) {
      S.offset += S.vel * k; S.vel *= Math.pow(.92, k);
      if (Math.abs(S.vel) < 1.2 && S.released && !S.auto) {   /* 惯性快停了：吸附到最近一张（自动流的那排不吸附） */
        S.released = false; S.vel = 0; S.snapping = true;
        gsap.to(S, { offset: Math.round(S.offset / w) * w, duration: .8, ease: 'power3.out', onComplete: function () { S.snapping = false; } });
      }
    }
    if (S.auto) {                                   /* 自己缓慢往左流：手一碰就让位，松手歇一会儿再接上 */
      if (S.down || Math.abs(S.vel) > 1.5) { S.autoHold = 1.2; S.released = false; }
      else if (S.autoHold > 0) S.autoHold -= dt / 1000;
      S.autoS += (((S.down || S.autoHold > 0) ? 0 : 1) - S.autoS) * (1 - Math.pow(1 - .04, k));
      S.offset -= 18 * (dt / 1000) * S.autoS;
    }
    S.drag += ((S.down || Math.abs(S.vel) > 2 ? 1 : 0) - S.drag) * (1 - Math.pow(1 - .1, k));
    var n = S.items.length, total = S.fit ? S.total : w * n, cx = innerWidth / 2;
    var tilt = Math.max(-5, Math.min(5, S.vel * .12));
    var introX = (1 - S.intro) * w * .55, GAP = 7.5;
    var base = S.fit ? cx - (S.items[0] ? S.items[0].w : w) / 2 : 0;
    for (var i = 0; i < n; i++) {
      var it = S.items[i], iw = S.fit ? it.w : w, left, d, x;
      if (S.fit) {
        x = it.x0 + S.offset + introX;
        x = ((x % total) + total) % total;
        left = base + x;
        if (left > innerWidth) { x -= total; left = base + x; }
        d = (left + iw / 2 - cx) / w;
      } else {
        x = i * w + S.offset + introX;
        x = ((x % total) + total) % total;
        if (x > total - w * 1.5) x -= total;
        left = cx - w / 2 + x; d = x / w;   /* d：离中间几张（0 = 正中） */
      }
      var squeeze = S.drag * (iw * .012 + iw * .045 * Math.min(1.4, Math.abs(d)));   /* 窗口收窄量，离中心越远越多 */
      var inL = GAP + squeeze * (d > 0 ? .35 : 1), inR = GAP + squeeze * (d > 0 ? 1 : .35), inV = S.drag * iw * .012;
      it.el.style.transform = 'translate3d(' + left.toFixed(1) + 'px,0,0) perspective(1600px) rotateY(' + tilt.toFixed(2) + 'deg)';
      it.el.style.clipPath = 'inset(' + inV.toFixed(1) + 'px ' + inR.toFixed(1) + 'px ' + inV.toFixed(1) + 'px ' + inL.toFixed(1) + 'px)';
      /* fit 模式下卡片就是这张图本身的比例，再做「图比窗口慢」会拖出底色，所以不动 */
      it.frame.style.transform = S.fit ? 'none' : 'translate3d(' + (-d * w * .14).toFixed(1) + 'px,0,0)';
      it.frame.style.opacity = String(Math.min(1, .2 + S.intro));
    }
  }

  /* ── 拖动提示：黄色胶囊跟着鼠标缓动；移动越快越大，并按水平速度左右摇晃（原站 cursorIndication「DRAG」） ── */
  var pill = document.createElement('div'); pill.className = 'dragPill'; pill.setAttribute('aria-hidden', 'true');
  pill.innerHTML = '<span class="dragPill__in">拖动<i lang="en">Drag</i></span>'; document.body.appendChild(pill);
  var pin = pill.firstChild, P = { x: -200, y: -200, tx: -200, ty: -200, vx: 0, s: 0, ts: 0, rot: 0 }, hoverEl = null;
  if (matchMedia('(hover: hover)').matches) {
    addEventListener('pointermove', function (e) {
      P.tx = e.clientX; P.ty = e.clientY;
      var hit = e.target.closest && e.target.closest('.projectBlock__slider');
      hoverEl = hit; P.ts = hit ? 1 : 0;
      P.idle = 0;                                   /* 一动就重新计时 */
    }, { passive: true });
    document.addEventListener('pointerleave', function () { P.ts = 0; });
  }
  var last = performance.now();
  gsap.ticker.add(function () {
    var now = performance.now(), dt = Math.min(50, now - last); last = now;
    for (var i = 0; i < all.length; i++) step(all[i], dt);
    var k = dt / 16.67, px = P.x;
    P.x += (P.tx - P.x) * (1 - Math.pow(1 - .16, k)); P.y += (P.ty - P.y) * (1 - Math.pow(1 - .16, k));
    var vx = (P.x - px) / Math.max(k, .001); P.vx += (vx - P.vx) * .3;
    /* owner：鼠标停一会儿就让它缩小消失，别一直挂在那儿。动一下又回来。 */
    P.idle = (P.idle || 0) + dt;
    if (P.ts && P.idle > 1100 && Math.abs(P.vx) < .6) P.ts = 0;
    var sp = Math.min(1, Math.abs(P.vx) / 30);
    P.s += (P.ts * (1 + .45 * sp) - P.s) * (1 - Math.pow(1 - .14, k));          /* 出现 / 随速度变大 */
    P.rot += (Math.max(-16, Math.min(16, P.vx * .9)) - P.rot) * (1 - Math.pow(1 - .12, k));   /* 左右摇晃 */
    if (P.s < .01 && !P.ts) { pill.style.visibility = 'hidden'; return; }
    pill.style.visibility = 'visible';
    pill.style.transform = 'translate3d(' + P.x.toFixed(1) + 'px,' + P.y.toFixed(1) + 'px,0)';
    pin.style.transform = 'translate(-50%,-50%) rotate(' + P.rot.toFixed(2) + 'deg) scale(' + P.s.toFixed(3) + ')';
  });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { all.forEach(function (S) { S.build(); }); }, 150); });
  window.V7Slider = { create: create, all: all };
})();

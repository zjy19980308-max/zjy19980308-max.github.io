/* ═══════════════════════════════════════════════════════════════
   letter-magnet.js —— 字母磁场（光标推开 + 旋转 + 垂直交叠）
   ───────────────────────────────────────────────────────────────
   用法：
     <script src="assets/letter-magnet.js"></script>
     <script>LetterMagnet.mount('.hero-line1, .hero-line2');</script>

   可选参数（都有合理默认，一般不用传）：
     LetterMagnet.mount(selector, {
       radius: 2.4,    // 作用半径 = 字号 × 这个倍数
       push:   0.46,   // 推开距离 = 字号 × 这个倍数
       bias:   0.30,   // 垂直偏置 = 字号 × 这个倍数（造成字母交叠）
       rot:    26,     // 最大旋转角度
       k:      0.11,   // 弹簧刚度
       d:      0.80,   // 阻尼
       gate:   true    // 是否启用设备能力闸门（触屏/小屏/低端机不跑）
     })

   ★ 为什么常数是「倍数」不是像素：
     写死像素（例如 R=230）是按某个字号调的。换到 240px 的标题上，
     230px 连一个字母高都不到，效果几乎看不见。全部由实测字号推导，
     换字号、换屏幕都不用重调。

   ★ 为什么要有垂直偏置：
     光标落在基线上时 dy≈0，纯径向力会退化成"整行水平滑动"。
     给每个字母交替的上下偏置，字母才会真正交叠、散开。
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function capable() {
    var mq = function (q) { return root.matchMedia && matchMedia(q).matches; };
    return !(
      mq('(pointer: coarse)') || mq('(hover: none)') ||     // 触屏没有光标
      mq('(prefers-reduced-motion: reduce)') ||             // 系统关了动效
      Math.min(innerWidth, innerHeight) < 760 ||            // 小屏
      (navigator.hardwareConcurrency || 8) <= 4 ||          // 低端机
      (navigator.deviceMemory || 8) <= 4 ||
      !!(navigator.connection && navigator.connection.saveData)
    );
  }

  var instances = [];

  function mount(selector, opt) {
    opt = opt || {};
    if (opt.gate !== false && !capable()) return null;

    var lines = [].slice.call(document.querySelectorAll(selector));
    if (!lines.length) return null;

    var MUL_R = opt.radius != null ? opt.radius : 2.4;
    var MUL_P = opt.push   != null ? opt.push   : 0.46;
    var MUL_B = opt.bias   != null ? opt.bias   : 0.30;
    var ROT   = opt.rot    != null ? opt.rot    : 26;
    var K     = opt.k      != null ? opt.k      : 0.11;
    var D     = opt.d      != null ? opt.d      : 0.80;

    var L = [], raf = 0, vis = true, mx = -1e5, my = -1e5;
    var FS = 100, R = 240, PUSH = 46, VB = 30;

    /* 拆字：每个字符包进 <i>，保留空格 */
    lines.forEach(function (line) {
      if (line.dataset.lmDone) return;
      var txt = line.textContent;
      line.textContent = '';
      for (var i = 0; i < txt.length; i++) {
        var el = document.createElement('i');
        el.textContent = txt[i];
        el.style.cssText = 'display:inline-block;white-space:pre;will-change:transform;font-style:inherit';
        line.appendChild(el);
        L.push({ el: el, x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0, cx: 0, cy: 0,
                 s: (L.length % 2 ? 1 : -1) });
      }
      line.dataset.lmDone = '1';
    });
    if (!L.length) return null;

    function measure() {
      FS = parseFloat(getComputedStyle(lines[0]).fontSize) || 100;
      R = FS * MUL_R; PUSH = FS * MUL_P; VB = FS * MUL_B;
      L.forEach(function (o) {
        o.el.style.transform = '';
        var r = o.el.getBoundingClientRect();
        o.cx = r.left + r.width / 2 + scrollX;
        o.cy = r.top + r.height / 2 + scrollY;
      });
    }

    function frame() {
      raf = 0;
      for (var i = 0; i < L.length; i++) {
        var o = L[i];
        var dx = o.cx - mx, dy = o.cy - my, d2 = dx * dx + dy * dy;
        var tx = 0, ty = 0, tr = 0;
        if (d2 < R * R) {
          var d = Math.sqrt(d2) || 0.001, f = 1 - d / R; f = f * f;
          tx = dx / d * f * PUSH;
          ty = dy / d * f * PUSH + o.s * f * VB;
          tr = (dx > 0 ? 1 : -1) * f * ROT;
        }
        o.vx = (o.vx + (tx - o.x) * K) * D; o.x += o.vx;
        o.vy = (o.vy + (ty - o.y) * K) * D; o.y += o.vy;
        o.vr = (o.vr + (tr - o.r) * K) * D; o.r += o.vr;
        o.el.style.transform =
          'translate(' + o.x.toFixed(2) + 'px,' + o.y.toFixed(2) + 'px) rotate(' + o.r.toFixed(2) + 'deg)';
      }
      tick();
    }
    function tick() { if (!raf && vis) raf = requestAnimationFrame(frame); }

    var onMove = function (e) { mx = e.clientX + scrollX; my = e.clientY + scrollY; tick(); };
    var onLeave = function () { mx = my = -1e5; tick(); };
    var t, onReflow = function () { clearTimeout(t); t = setTimeout(measure, 160); };
    var onVis = function () {
      vis = !document.hidden;
      if (vis) tick(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    };

    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerleave', onLeave);
    addEventListener('resize', onReflow);
    addEventListener('scroll', onReflow, { passive: true });
    document.addEventListener('visibilitychange', onVis);

    /* 网络字体就位后重新量，否则量到的是回退字体的字宽 */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    measure(); tick();

    var api = {
      remeasure: measure,
      stats: function () { return { FS: FS, R: R, PUSH: PUSH, VB: VB, ROT: ROT, n: L.length }; },
      setPointer: function (x, y) { mx = x + scrollX; my = y + scrollY; },
      step: function (n) { for (var i = 0; i < (n || 1); i++) { var r = raf; raf = 1; frame(); raf = r; } },
      destroy: function () {
        cancelAnimationFrame(raf); raf = 0;
        removeEventListener('pointermove', onMove);
        removeEventListener('pointerleave', onLeave);
        removeEventListener('resize', onReflow);
        removeEventListener('scroll', onReflow);
        document.removeEventListener('visibilitychange', onVis);
        L.forEach(function (o) { o.el.style.transform = ''; });
      }
    };
    instances.push(api);
    return api;
  }

  root.LetterMagnet = {
    mount: mount,
    capable: capable,
    all: instances,
    destroyAll: function () { instances.splice(0).forEach(function (i) { i.destroy(); }); }
  };
})(window);

/* ═══════════════════════════════════════════════════════════════
   card-glow.js —— 卡片炫彩微光（光标聚光 · 边缘辉光 · 浮尘 · 轻微磁吸）

   移植自 React Bits 的 MagicBento。原版依赖 GSAP，但它用到的只是
   「补间 + 缓动」，这个作品集是纯静态页、已经有一套 rAF 平滑逻辑，
   再引 70KB 的库不划算，所以自己补一个 tween。

   ★ 调子按「淡淡的」来定：
     原版是 rgba(132,0,255) 的紫，透明度给到 0.8，很跳。
     这里换成作品集自己的紫罗兰／薰衣草／靛蓝三色轮转，
     峰值透明度压到 0.18 上下，只在光标附近才看得出来。

   用法：
     CardGlow.mount('.proj-cards', '.folder-body');
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  /* 能力闸门：触屏没有光标，低端机跑不动；系统关了动效就别动 */
  function capable() {
    var mq = function (q) { return root.matchMedia && matchMedia(q).matches; };
    return !(
      mq('(pointer: coarse)') || mq('(hover: none)') ||
      mq('(prefers-reduced-motion: reduce)') ||
      innerWidth < 900 ||
      (navigator.hardwareConcurrency || 8) <= 4 ||
      (navigator.deviceMemory || 8) <= 4
    );
  }

  var instances = [];

  function mount(sectionSel, cardSel, opt) {
    if (!capable()) return null;
    var section = typeof sectionSel === 'string'
      ? document.querySelector(sectionSel) : sectionSel;
    if (!section) return null;
    var cards = [].slice.call(section.querySelectorAll(cardSel));
    if (!cards.length) return null;

    opt = opt || {};
    var o = {
      /* 淡：峰值透明度只有原版的四分之一 */
      glowPeak:     opt.glowPeak     != null ? opt.glowPeak     : 0.18,
      spotlightR:   opt.spotlightR   != null ? opt.spotlightR   : 320,
      glowRadius:   opt.glowRadius   != null ? opt.glowRadius   : 220,
      particles:    opt.particles    != null ? opt.particles    : 7,
      magnetism:    opt.magnetism    != null ? opt.magnetism    : 0.018,
      tilt:         opt.tilt         != null ? opt.tilt         : 2.2,
      clickRipple:  opt.clickRipple  !== false,
      /* 炫彩：三色轮转，不是单一紫 */
      hues: opt.hues || ['122,87,208', '90,120,235', '181,180,237']
    };

    section.classList.add('cg-section');
    cards.forEach(function (c, i) {
      c.classList.add('cg-card');
      c.style.setProperty('--cg-hue', o.hues[i % o.hues.length]);
      c.style.setProperty('--cg-radius', o.glowRadius + 'px');
    });

    /* ── 全局柔光：跟着光标，只在这一段内出现 ── */
    var spot = document.createElement('div');
    spot.className = 'cg-spotlight';
    document.body.appendChild(spot);

    /* ── 一个 rAF 统一补间，替掉 GSAP ── */
    var tweens = [];
    var raf = 0, last = 0;
    function tick(now) {
      /* dt 必须双向夹紧。只写上限的话，一旦 now < last
         （跨窗口调用、时间原点不一致、手动步进之后接上真实 rAF），
         dt 为负 → k = 1 - e^(正数) 变成大负数 → 每帧朝反方向放大，
         补间直接发散。 */
      var dt = (now - last) / 1000;
      dt = dt > 0.05 ? 0.05 : (dt > 0 ? dt : 0);
      last = now;
      var alive = false;
      for (var i = 0; i < tweens.length; i++) {
        var t = tweens[i];
        if (!t) continue;
        var k = 1 - Math.exp(-dt / t.tau);
        var next = t.cur + (t.to - t.cur) * k;
        /* 再兜一层：插值结果不允许越过目标 */
        if ((t.to - t.cur) * (t.to - next) < 0) next = t.to;
        t.cur = Math.abs(t.to - next) < t.eps ? t.to : next;
        t.apply(t.cur);
        if (t.cur !== t.to) alive = true;
      }
      raf = alive ? requestAnimationFrame(tick) : 0;
    }
    function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }
    function tween(tau, eps, apply) {
      var t = { cur: 0, to: 0, tau: tau, eps: eps, apply: apply };
      tweens.push(t); return t;
    }

    var spotA = tween(0.22, 0.004, function (v) { spot.style.opacity = v.toFixed(3); });

    /* ── 每张卡的状态 ── */
    var st = cards.map(function (card) {
      return {
        el: card,
        glow: tween(0.16, 0.004, function (v) { card.style.setProperty('--cg-glow', v.toFixed(3)); }),
        mx: tween(0.20, 0.02, null),
        my: tween(0.20, 0.02, null),
        rx: tween(0.14, 0.02, null),
        ry: tween(0.14, 0.02, null),
        parts: [],
        on: false
      };
    });
    /* 位移和旋转要一起写进同一个 transform，所以单独接一个应用函数 */
    st.forEach(function (s) {
      var apply = function () {
        s.el.style.transform =
          'translate3d(' + s.mx.cur.toFixed(2) + 'px,' + s.my.cur.toFixed(2) + 'px,0)' +
          ' rotateX(' + s.rx.cur.toFixed(2) + 'deg) rotateY(' + s.ry.cur.toFixed(2) + 'deg)';
      };
      s.mx.apply = s.my.apply = s.rx.apply = s.ry.apply = apply;
    });

    function onMove(e) {
      var r = section.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top  && e.clientY <= r.bottom;
      if (!inside) { reset(); return; }

      spot.style.left = e.clientX + 'px';
      spot.style.top  = e.clientY + 'px';

      var near = Infinity;
      st.forEach(function (s) {
        var b = s.el.getBoundingClientRect();
        var cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        var d = Math.max(0, Math.hypot(e.clientX - cx, e.clientY - cy)
                            - Math.max(b.width, b.height) / 2);
        near = Math.min(near, d);

        var prox = o.spotlightR * 0.5, fade = o.spotlightR * 0.75;
        var g = d <= prox ? 1 : d <= fade ? (fade - d) / (fade - prox) : 0;
        s.glow.to = g * o.glowPeak;

        /* 辉光落点：光标在卡内的相对位置 */
        s.el.style.setProperty('--cg-x', (((e.clientX - b.left) / b.width) * 100).toFixed(1) + '%');
        s.el.style.setProperty('--cg-y', (((e.clientY - b.top) / b.height) * 100).toFixed(1) + '%');

        var over = e.clientX >= b.left && e.clientX <= b.right &&
                   e.clientY >= b.top  && e.clientY <= b.bottom;
        if (over) {
          var lx = e.clientX - b.left - b.width / 2;
          var ly = e.clientY - b.top - b.height / 2;
          s.mx.to = lx * o.magnetism;
          s.my.to = ly * o.magnetism;
          s.rx.to = -(ly / (b.height / 2)) * o.tilt;
          s.ry.to =  (lx / (b.width / 2))  * o.tilt;
          if (!s.on) { s.on = true; spawn(s); }
        } else {
          s.mx.to = s.my.to = s.rx.to = s.ry.to = 0;
          if (s.on) { s.on = false; clear(s); }
        }
      });

      var pr = o.spotlightR * 0.5, fd = o.spotlightR * 0.75;
      spotA.to = near <= pr ? 0.55 : near <= fd ? ((fd - near) / (fd - pr)) * 0.55 : 0;
      kick();
    }

    function reset() {
      spotA.to = 0;
      st.forEach(function (s) {
        s.glow.to = 0; s.mx.to = s.my.to = s.rx.to = s.ry.to = 0;
        if (s.on) { s.on = false; clear(s); }
      });
      kick();
    }

    /* ── 浮尘：小而淡，进场错开，离开就撤 ── */
    function spawn(s) {
      var b = s.el.getBoundingClientRect();
      for (var i = 0; i < o.particles; i++) {
        (function (i) {
          var id = setTimeout(function () {
            if (!s.on) return;
            var p = document.createElement('i');
            p.className = 'cg-dot';
            p.style.left = (Math.random() * b.width) + 'px';
            p.style.top  = (Math.random() * b.height) + 'px';
            p.style.setProperty('--dx', ((Math.random() - 0.5) * 46).toFixed(1) + 'px');
            p.style.setProperty('--dy', ((Math.random() - 0.5) * 46).toFixed(1) + 'px');
            p.style.animationDuration = (2.6 + Math.random() * 2.2).toFixed(2) + 's';
            s.el.appendChild(p);
            s.parts.push(p);
          }, i * 90);
          s.parts.push(id);
        })(i);
      }
    }
    function clear(s) {
      s.parts.forEach(function (p) {
        if (typeof p === 'number') clearTimeout(p);
        else if (p.parentNode) { p.classList.add('cg-dot--out'); setTimeout(function () {
          if (p.parentNode) p.parentNode.removeChild(p);
        }, 320); }
      });
      s.parts = [];
    }

    /* ── 点击涟漪 ── */
    function onClick(e) {
      if (!o.clickRipple) return;
      var s = st.filter(function (x) { return x.el.contains(e.target); })[0];
      if (!s) return;
      var b = s.el.getBoundingClientRect();
      var x = e.clientX - b.left, y = e.clientY - b.top;
      var far = Math.max(Math.hypot(x, y), Math.hypot(x - b.width, y),
                         Math.hypot(x, y - b.height), Math.hypot(x - b.width, y - b.height));
      var rp = document.createElement('i');
      rp.className = 'cg-ripple';
      rp.style.width = rp.style.height = (far * 2) + 'px';
      rp.style.left = (x - far) + 'px';
      rp.style.top  = (y - far) + 'px';
      s.el.appendChild(rp);
      setTimeout(function () { if (rp.parentNode) rp.parentNode.removeChild(rp); }, 760);
    }

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', reset);
    section.addEventListener('click', onClick);

    var api = {
      cards: cards.length,
      /* 验证用 */
      state: function () {
        return st.map(function (s) {
          return {
            辉光: +s.glow.cur.toFixed(3),
            位移: [+s.mx.cur.toFixed(2), +s.my.cur.toFixed(2)],
            倾斜: [+s.rx.cur.toFixed(2), +s.ry.cur.toFixed(2)],
            浮尘: s.el.querySelectorAll('.cg-dot').length
          };
        });
      },
      spotlight: function () { return +spotA.cur.toFixed(3); },
      setPointer: function (x, y) { onMove({ clientX: x, clientY: y }); },
      step: function (n) {
        for (var i = 0; i < (n || 1); i++) tick(last + (i + 1) * 16.7);
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      },
      destroy: function () {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerleave', reset);
        section.removeEventListener('click', onClick);
        if (raf) cancelAnimationFrame(raf);
        if (spot.parentNode) spot.parentNode.removeChild(spot);
        st.forEach(function (s) { clear(s); s.el.style.transform = ''; });
      }
    };
    instances.push(api);
    return api;
  }

  root.CardGlow = { mount: mount, capable: capable, all: instances };
})(window);

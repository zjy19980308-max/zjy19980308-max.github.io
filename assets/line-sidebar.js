/* ═══════════════════════════════════════════════════════════════
   line-sidebar.js —— 章节导航（光标邻近产生位移 · 变色 · 标线伸缩）

   移植自 React Bits 的 LineSidebar。这个作品集是纯静态 HTML、没有
   构建流程，所以不能直接用那份 jsx —— 类名、CSS 自定义属性、
   衰减曲线、rAF 指数平滑全部照搬，只把 React 的部分改写成原生。

   用法：
     <script src="assets/line-sidebar.js"></script>
     <script>
       LineSidebar.mount('#nav-rail', {
         items: [{ num: '01', label: '为什么要做', target: el }, ...],
         onItemClick: (i, item) => { ... }
       });
     </script>

   ★ 为什么用 rAF 做缓动而不是 CSS transition：
     位移、变色、标线缩放三个属性要严格同步。分别写 transition
     会因为各自的插值节奏不同而错开，看起来是「散」的。
     统一由一个 --effect（0~1）驱动，只有一处在动。

   ★ 平滑用的是帧率无关的指数衰减：k = 1 - e^(-dt/τ)。
     直接写 cur += (target - cur) * 0.1 这种固定系数，
     在 120Hz 屏上会比 60Hz 快一倍。
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var FALLOFF = {
    linear: function (p) { return p; },
    smooth: function (p) { return p * p * (3 - 2 * p); },
    sharp:  function (p) { return p * p * p; }
  };

  var instances = [];

  function mount(host, opt) {
    host = typeof host === 'string' ? document.querySelector(host) : host;
    if (!host) return null;
    opt = opt || {};

    var items = opt.items || [];
    if (!items.length) return null;

    var o = {
      accentColor:     opt.accentColor     != null ? opt.accentColor     : '#B5B4ED',
      textColor:       opt.textColor       != null ? opt.textColor       : '#8C8CA0',
      markerColor:     opt.markerColor     != null ? opt.markerColor     : '#3A3A44',
      showIndex:       opt.showIndex       !== false,
      showMarker:      opt.showMarker      !== false,
      proximityRadius: opt.proximityRadius != null ? opt.proximityRadius : 100,
      maxShift:        opt.maxShift        != null ? opt.maxShift        : 22,
      falloff:         opt.falloff         || 'smooth',
      markerLength:    opt.markerLength    != null ? opt.markerLength    : 52,
      markerGap:       opt.markerGap       != null ? opt.markerGap       : 0,
      tickScale:       opt.tickScale       != null ? opt.tickScale       : 0.5,
      scaleTick:       opt.scaleTick       !== false,
      itemGap:         opt.itemGap         != null ? opt.itemGap         : 18,
      fontSize:        opt.fontSize        != null ? opt.fontSize        : 0.86,
      smoothing:       opt.smoothing       != null ? opt.smoothing       : 100,
      defaultActive:   opt.defaultActive   != null ? opt.defaultActive   : 0,
      onItemClick:     opt.onItemClick,
      className:       opt.className       || ''
    };

    /* ── 结构 ── */
    var nav = document.createElement('nav');
    nav.className = 'line-sidebar'
      + (o.showMarker ? ' line-sidebar--markers' : '')
      + (o.scaleTick ? ' line-sidebar--scale-tick' : '')
      + (o.className ? ' ' + o.className : '');
    nav.style.cssText =
      '--accent-color:' + o.accentColor +
      ';--text-color:' + o.textColor +
      ';--marker-color:' + o.markerColor +
      ';--marker-length:' + o.markerLength + 'px' +
      ';--marker-gap:' + o.markerGap + 'px' +
      ';--tick-scale:' + o.tickScale +
      ';--max-shift:' + o.maxShift + 'px' +
      ';--item-gap:' + o.itemGap + 'px' +
      ';--font-size:' + o.fontSize + 'rem' +
      ';--smoothing:' + o.smoothing + 'ms';

    var list = document.createElement('ul');
    list.className = 'line-sidebar__list';
    nav.appendChild(list);

    var els = [];
    items.forEach(function (it, i) {
      var li = document.createElement('li');
      li.className = 'line-sidebar__item' + (it.level === 1 ? ' line-sidebar__item--lv1' : '');
      if (o.showMarker) {
        var mk = document.createElement('span');
        mk.className = 'line-sidebar__marker';
        mk.setAttribute('aria-hidden', 'true');
        li.appendChild(mk);
      }
      var lab = document.createElement('span');
      lab.className = 'line-sidebar__label';
      if (o.showIndex) {
        var idx = document.createElement('span');
        idx.className = 'line-sidebar__index';
        /* 用条目自己的编号。小标题上本来就带 01/02，
           没有编号的（h2 那一级）就留空占位 ——
           补一个顺序号会和页面上的编号撞成两套体系。 */
        idx.textContent = (it.num != null && it.num !== '') ? it.num : '';
        if (!idx.textContent) idx.classList.add('line-sidebar__index--empty');
        lab.appendChild(idx);
      }
      var txt = document.createElement('span');
      txt.className = 'line-sidebar__text';
      txt.textContent = it.label;
      lab.appendChild(txt);
      li.appendChild(lab);
      li.addEventListener('click', function () { setActive(i, true); });
      list.appendChild(li);
      els.push(li);
    });

    host.appendChild(nav);

    /* ── 状态 ── */
    var targets = new Array(els.length).fill(0);
    var current = new Array(els.length).fill(0);
    var raf = 0, last = 0, active = o.defaultActive;

    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      var tau = Math.max(o.smoothing, 1) / 1000;
      var k = 1 - Math.exp(-dt / tau);

      var moving = false;
      for (var i = 0; i < els.length; i++) {
        var target = Math.max(targets[i] || 0, active === i ? 1 : 0);
        var cur = current[i] || 0;
        var next = cur + (target - cur) * k;
        var settled = Math.abs(target - next) < 0.0015;
        var v = settled ? target : next;
        current[i] = v;
        els[i].style.setProperty('--effect', v.toFixed(4));
        if (!settled) moving = true;
      }
      raf = moving ? requestAnimationFrame(frame) : 0;
    }

    function start() {
      if (raf) cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function onMove(e) {
      var rect = list.getBoundingClientRect();
      var y = e.clientY - rect.top;
      var ease = FALLOFF[o.falloff] || FALLOFF.linear;
      for (var i = 0; i < els.length; i++) {
        var c = els[i].offsetTop + els[i].offsetHeight / 2;
        targets[i] = ease(Math.max(0, 1 - Math.abs(y - c) / o.proximityRadius));
      }
      start();
    }
    function onLeave() { targets = targets.map(function () { return 0; }); start(); }

    list.addEventListener('pointermove', onMove);
    list.addEventListener('pointerleave', onLeave);

    function setActive(i, fromClick) {
      if (i === active) { if (fromClick) fire(i); return; }
      active = i;
      els.forEach(function (el, k) {
        if (k === i) el.setAttribute('aria-current', 'true');
        else el.removeAttribute('aria-current');
      });
      start();
      if (fromClick) fire(i);
    }
    function fire(i) {
      if (o.onItemClick) o.onItemClick(i, items[i]);
    }

    setActive(active === null ? -1 : active, false);
    start();

    var api = {
      el: nav,
      setActive: function (i) { setActive(i, false); },
      getActive: function () { return active; },
      count: els.length,
      /* 验证用：读回每一项当前的 --effect */
      effects: function () { return current.map(function (v) { return +v.toFixed(3); }); },
      step: function (n) {                    /* 无头环境 rAF 不推进，手动步进 */
        for (var i = 0; i < (n || 1); i++) frame(last + (i + 1) * 16.7);
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      },
      setPointer: function (y) {              /* y 为相对列表顶部的像素 */
        var ease = FALLOFF[o.falloff] || FALLOFF.linear;
        for (var i = 0; i < els.length; i++) {
          var c = els[i].offsetTop + els[i].offsetHeight / 2;
          targets[i] = ease(Math.max(0, 1 - Math.abs(y - c) / o.proximityRadius));
        }
      },
      destroy: function () {
        if (raf) cancelAnimationFrame(raf);
        list.removeEventListener('pointermove', onMove);
        list.removeEventListener('pointerleave', onLeave);
        if (nav.parentNode) nav.parentNode.removeChild(nav);
      }
    };
    instances.push(api);
    return api;
  }

  root.LineSidebar = {
    mount: mount,
    all: instances,
    destroyAll: function () {
      instances.splice(0).forEach(function (i) { i.destroy(); });
    }
  };
})(window);

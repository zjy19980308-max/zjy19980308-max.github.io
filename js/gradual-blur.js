/* ═══════════════════════════════════════════════════════════════
   gradual-blur.js —— 贴边的渐进模糊（移植 React Bits GradualBlur）

   原理：在宿主的一条边上叠 divCount 层 backdrop-filter，每层模糊值递增、
   各自用一段线性渐变蒙版只露出自己那一截，叠起来就是「越靠边越糊」。
   preset / curve / exponential / hoverIntensity / animated:'scroll' 和原组件一致，
   键名照搬 React 的 props。target:'page' 时挂到 body 上 fixed；否则挂进宿主 absolute。
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  var DEF = { position: 'bottom', strength: 2, height: '6rem', divCount: 5, exponential: false, zIndex: 1000,
              animated: false, duration: '0.3s', easing: 'ease-out', opacity: 1, curve: 'linear', responsive: false,
              target: 'parent', className: '', hoverIntensity: 0, width: '' };
  var PRESETS = {
    top: { position: 'top', height: '6rem' }, bottom: { position: 'bottom', height: '6rem' },
    left: { position: 'left', height: '6rem' }, right: { position: 'right', height: '6rem' },
    subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
    intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
    smooth: { height: '8rem', curve: 'bezier', divCount: 10 }, sharp: { height: '5rem', curve: 'linear', divCount: 4 },
    header: { position: 'top', height: '8rem', curve: 'ease-out' }, footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
    sidebar: { position: 'left', height: '6rem', strength: 2.5 },
    'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
    'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 }
  };
  var CURVE = {
    linear: function (p) { return p; }, bezier: function (p) { return p * p * (3 - 2 * p); },
    'ease-in': function (p) { return p * p; }, 'ease-out': function (p) { return 1 - Math.pow(1 - p, 2); },
    'ease-in-out': function (p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  };
  var DIR = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' };
  var instances = [];

  function mount(hostSel, opt) {
    opt = opt || {};
    var host = typeof hostSel === 'string' ? document.querySelector(hostSel) : hostSel;
    var cfg = Object.assign({}, DEF, PRESETS[opt.preset] || {}, opt);
    var page = cfg.target === 'page';
    if (!host && !page) return null;
    var wrap = document.createElement('div');
    wrap.className = 'gradual-blur ' + (page ? 'gradual-blur-page' : 'gradual-blur-parent') + ' ' + cfg.className;
    var inner = document.createElement('div'); inner.className = 'gradual-blur-inner'; wrap.appendChild(inner);
    var vertical = cfg.position === 'top' || cfg.position === 'bottom';
    var st = wrap.style;
    st.position = page ? 'fixed' : 'absolute'; st.pointerEvents = cfg.hoverIntensity ? 'auto' : 'none';
    st.zIndex = page ? cfg.zIndex + 100 : cfg.zIndex; st.opacity = cfg.animated === 'scroll' ? 0 : 1;
    if (cfg.animated) st.transition = 'opacity ' + cfg.duration + ' ' + cfg.easing;
    if (vertical) { st.height = cfg.height; st.width = cfg.width || '100%'; st[cfg.position] = 0; st.left = 0; st.right = 0; }
    else { st.width = cfg.width || cfg.height; st.height = '100%'; st[cfg.position] = 0; st.top = 0; st.bottom = 0; }
    var hovered = false;
    function build() {
      inner.innerHTML = '';
      var inc = 100 / cfg.divCount, strength = hovered && cfg.hoverIntensity ? cfg.strength * cfg.hoverIntensity : cfg.strength;
      var curve = CURVE[cfg.curve] || CURVE.linear;
      for (var i = 1; i <= cfg.divCount; i++) {
        var progress = curve(i / cfg.divCount);
        var blur = cfg.exponential ? Math.pow(2, progress * 4) * 0.0625 * strength : 0.0625 * (progress * cfg.divCount + 1) * strength;
        var p1 = Math.round((inc * i - inc) * 10) / 10, p2 = Math.round(inc * i * 10) / 10, p3 = Math.round((inc * i + inc) * 10) / 10, p4 = Math.round((inc * i + inc * 2) * 10) / 10;
        var g = 'transparent ' + p1 + '%, black ' + p2 + '%'; if (p3 <= 100) g += ', black ' + p3 + '%'; if (p4 <= 100) g += ', transparent ' + p4 + '%';
        var d = document.createElement('div'); var ds = d.style;
        ds.position = 'absolute'; ds.inset = '0';
        ds.webkitMaskImage = ds.maskImage = 'linear-gradient(' + (DIR[cfg.position] || 'to bottom') + ', ' + g + ')';
        ds.webkitBackdropFilter = ds.backdropFilter = 'blur(' + blur.toFixed(3) + 'rem)';
        ds.opacity = cfg.opacity;
        if (cfg.animated && cfg.animated !== 'scroll') ds.transition = 'backdrop-filter ' + cfg.duration + ' ' + cfg.easing;
        inner.appendChild(d);
      }
    }
    build();
    if (cfg.hoverIntensity) { wrap.addEventListener('mouseenter', function () { hovered = true; build(); }); wrap.addEventListener('mouseleave', function () { hovered = false; build(); }); }
    var io = null;
    if (cfg.animated === 'scroll' && root.IntersectionObserver) { io = new IntersectionObserver(function (es) { st.opacity = es[0].isIntersecting ? 1 : 0; }, { threshold: 0.1 }); io.observe(wrap); }
    (page ? document.body : host).appendChild(wrap);
    var api = { el: wrap, cfg: cfg, layers: function () { return [].slice.call(inner.children).map(function (d) { return d.style.backdropFilter; }); },
                destroy: function () { if (io) io.disconnect(); wrap.remove(); } };
    instances.push(api); return api;
  }
  root.GradualBlur = { mount: mount, PRESETS: PRESETS, CURVE: CURVE, all: instances };
})(window);

/* ═══════════════════════════════════════════════════════════════
   shape-blur.js —— 跟着鼠标呼吸的圆角描边（套在照片外面）

   移植自 React Bits 的 ShapeBlur（variation 0：圆角矩形描边）。
   原理：透明画布上用 SDF 画一圈白色圆角描边；描边的「软硬」由一个跟着
   鼠标走的软圆控制 —— 鼠标靠近哪一段，那一段边就晕开、变亮。
   它不模糊照片本身，只是给照片套一圈会呼吸的框。

   和原组件不同的三处：
   1. 原组件的坐标系是 letterbox 成正方形再算的，矩形大小是个抽象比例（1.2 / 4.2）。
      这里直接用像素：矩形 = 画布减去 bleed，圆角 = CSS 的 8px。框就精确落在照片边上。
   2. 画布比照片各边大一圈（bleed），因为 .portrait-slot 是 overflow:hidden，
      晕开的光要能溢出照片边缘，画布就不能放在它里面。
   3. 只在鼠标真在动 / 阻尼没停时渲染；不在视口、切走 tab、页面隐藏都停帧。
      原组件是常驻 rAF，放进一个已有两块 WebGL 的页面里太奢侈。

   依赖全局 THREE，但顶层不碰它 —— 只在 mount() 里用，
   所以可以在 three.bundle.js 之前加载，跟 lanyard.js 一样挂在按需注入那条链上。
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var VERT = [
    'varying vec2 vUv;',
    'void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
  ].join('\n');

  /* 全部按像素算：u_res 是画布物理像素，u_dpr 把 CSS 像素参数换成物理像素 */
  var FRAG = [
    'precision highp float;',
    'uniform vec2  u_res;      // 画布物理像素',
    'uniform vec2  u_mouse;    // 鼠标（画布 CSS 像素，左上原点，阻尼后）',
    'uniform float u_dpr;',
    'uniform float u_inset;    // 框到画布边的距离（CSS px）= bleed',
    'uniform float u_radius;   // 圆角（CSS px）',
    'uniform float u_border;   // 描边宽（CSS px）',
    'uniform float u_circle;   // 鼠标软圆半径（CSS px）',
    'uniform float u_csoft;    // 软圆边缘过渡（CSS px）',
    'uniform float u_soft;     // 鼠标处描边最大晕开（CSS px）',
    'uniform float u_gain;     // 鼠标处亮度增益',
    '',
    'float sdRoundRect(vec2 p, vec2 b, float r){',
    '  vec2 d = abs(p) - b + vec2(r);',
    '  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;',
    '}',
    '',
    'void main(){',
    '  vec2 p = gl_FragCoord.xy - u_res * 0.5;                     // 画布中心为原点，y 向上',
    '  vec2 b = u_res * 0.5 - vec2(u_inset * u_dpr);               // 框的半宽半高',
    '  float d = sdRoundRect(p, b, u_radius * u_dpr);',
    '',
    '  vec2 m = vec2(u_mouse.x, -u_mouse.y) * u_dpr + vec2(-u_res.x, u_res.y) * 0.5;  // 鼠标转到同一坐标系',
    '  float dm = length(p - m);',
    '  float near = 1.0 - smoothstep((u_circle - u_csoft) * u_dpr, (u_circle + u_csoft) * u_dpr, dm);',
    '',
    '  float e = mix(0.75, u_soft * u_dpr, near);                  // 远处 0.75px 抗锯齿，近处大幅晕开',
    '  float w = u_border * u_dpr * 0.5;',
    '  float a = smoothstep(-e, e, d + w) - smoothstep(-e, e, d - w);',
    '  a = clamp(a * (1.0 + u_gain * near), 0.0, 1.0);',
    '  gl_FragColor = vec4(vec3(1.0), a);',
    '}'
  ].join('\n');

  var instances = [];

  function mount(hostSel, opt) {
    var THREE = root.THREE;
    var host = typeof hostSel === 'string' ? document.querySelector(hostSel) : hostSel;
    if (!host || !THREE) return null;
    var slot = host.querySelector(opt.slot || '.portrait-slot') || host;
    var o = Object.assign({
      bleed: 28,      // 画布比照片各边多出来的 CSS px；也是框到画布边的距离
      radius: 8,      // 跟 .portrait-slot 的 border-radius 一致
      border: 1.5,    // 描边宽 CSS px（原组件 borderSize 0.05 在它的比例里约等于这个观感）
      circle: 90,     // 鼠标影响半径 CSS px
      csoft: 60,      // 影响区边缘过渡
      soft: 22,       // 鼠标处描边晕开到多宽
      gain: 2.2,      // 鼠标处亮度增益（原组件 ×4 的观感，白底会过曝，收一点）
      damp: 8         // 阻尼（原组件 MathUtils.damp(…, 8, dt)）
    }, opt || {});

    /* 原组件那套归一化滑杆（Roundness / Border Size / Circle Size / Circle Edge）
       换算到这里的 CSS 像素单位。换算基准是照片短边 S，系数是拿现在这套
       像素值反推出来的：border 1.5 ↔ 0.05、circle 90 ↔ 0.25、csoft 60 ↔ 1.0，
       所以给这三个填参考值时观感不变，只有 roundness 是真的在改。 */
    var NORM = null;
    function applyNorm() {
      if (NORM === null) return;
      var r = slot.getBoundingClientRect(), S = Math.min(r.width, r.height);
      if (!S) return;
      if (NORM.roundness  != null) {
        o.radius = NORM.roundness * S * 0.5;
        /* 描边要贴着照片走，所以照片自己的圆角也跟着这个值改 ——
           不然描边是个大圆角、照片还是 8px 直角，两条轮廓对不上。 */
        slot.style.borderRadius = o.radius + 'px';
        var im = slot.querySelector('img');
        if (im) im.style.borderRadius = o.radius + 'px';
      }
      if (NORM.borderSize != null) o.border = NORM.borderSize * S * 0.12;
      if (NORM.circleSize != null) o.circle = NORM.circleSize * S * 1.44;
      if (NORM.circleEdge != null) o.csoft  = NORM.circleEdge * S * 0.24;
    }
    if (opt && (opt.roundness != null || opt.borderSize != null ||
                opt.circleSize != null || opt.circleEdge != null)) {
      NORM = { roundness: opt.roundness, borderSize: opt.borderSize,
               circleSize: opt.circleSize, circleEdge: opt.circleEdge };
      applyNorm();
    }

    var wrap = document.createElement('div');
    wrap.className = 'portrait-fx';
    wrap.style.setProperty('--fx-bleed', o.bleed + 'px');
    host.appendChild(wrap);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: true });
    } catch (err) { wrap.remove(); return null; }
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var cam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1); cam.position.z = 1;
    var uni = {
      u_res:    { value: new THREE.Vector2(1, 1) },
      u_mouse:  { value: new THREE.Vector2(-9999, -9999) },
      u_dpr:    { value: 1 },
      u_inset:  { value: o.bleed },
      u_radius: { value: o.radius },
      u_border: { value: o.border },
      u_circle: { value: o.circle },
      u_csoft:  { value: o.csoft },
      u_soft:   { value: o.soft },
      u_gain:   { value: o.gain }
    };
    var mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: uni, transparent: true, depthTest: false, depthWrite: false });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat));

    var w = 1, h = 1, dpr = 1;
    var target = new THREE.Vector2(-9999, -9999);   // 鼠标目标（画布 CSS 像素）
    var pos    = new THREE.Vector2(-9999, -9999);   // 阻尼后
    var visible = true, frames = 0, raf = 0, last = 0, io = null, warm = 3;

    function resize() {
      var r = slot.getBoundingClientRect();
      if (!r.width || !r.height) return;              // display:none 时不动
      if (NORM) {                                     // 归一化参数跟着短边重算
        applyNorm();
        uni.u_radius.value = o.radius; uni.u_border.value = o.border;
        uni.u_circle.value = o.circle; uni.u_csoft.value  = o.csoft;
      }
      w = Math.round(r.width + o.bleed * 2); h = Math.round(r.height + o.bleed * 2);
      dpr = Math.min(root.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
      renderer.domElement.style.width = w + 'px'; renderer.domElement.style.height = h + 'px';
      uni.u_res.value.set(w * dpr, h * dpr); uni.u_dpr.value = dpr;
      warm = 3;
    }

    function onMove(e) {
      var r = renderer.domElement.getBoundingClientRect();
      target.set(e.clientX - r.left, e.clientY - r.top);
    }
    function onLeave() { target.set(-9999, -9999); }   // 鼠标离开窗口：软圆漂走，框收回成细线
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    root.addEventListener('blur', onLeave);

    function render() {
      uni.u_mouse.value.copy(pos);
      renderer.render(scene, cam);
      frames++;
    }
    function tick(now) {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || !w) return;
      var dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      var dx = target.x - pos.x, dy = target.y - pos.y;
      var still = Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05;
      if (still && warm <= 0) return;                  // 鼠标没动、阻尼已停：不渲染
      pos.x = THREE.MathUtils.damp(pos.x, target.x, o.damp, dt);
      pos.y = THREE.MathUtils.damp(pos.y, target.y, o.damp, dt);
      if (warm > 0) warm--;
      render();
    }

    resize();
    if (root.ResizeObserver) new ResizeObserver(function () { resize(); }).observe(slot);
    root.addEventListener('resize', resize);
    if (root.IntersectionObserver) {
      io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) { warm = 3; resize(); } }, { threshold: 0 });
      io.observe(wrap);
    }
    raf = requestAnimationFrame(tick);

    var api = {
      el: wrap,
      /* 测试钩子：同步渲染 n 帧并把鼠标钉到某点（隐藏面板里 rAF 不走） */
      step: function (n, mx, my) {
        if (mx != null) { target.set(mx, my); pos.set(mx, my); }
        for (var i = 0; i < (n || 1); i++) render();
        return frames;
      },
      /* 读几个采样点的 alpha：框上应该有墨，框内外应该透明 */
      sample: function () {
        var gl = renderer.getContext(), W = w * dpr, H = h * dpr, px = new Uint8Array(4);
        function at(xCss, yCss) {   // CSS 像素（左上原点）→ 读物理像素（左下原点）
          gl.readPixels(Math.round(xCss * dpr), Math.round(H - yCss * dpr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
          return px[3];
        }
        render();
        return {
          框上_顶边中点: at(w / 2, o.bleed),
          框上_左边中点: at(o.bleed, h / 2),
          框内_中心:     at(w / 2, h / 2),
          框外_角落:     at(4, 4)
        };
      },
      stats: function () {
        return { 画布CSS: w + '×' + h, 物理: (w * dpr) + '×' + (h * dpr), dpr: dpr, 已渲染帧: frames, 可见: visible,
                 鼠标: [Math.round(pos.x), Math.round(pos.y)], 目标: [Math.round(target.x), Math.round(target.y)],
                 参数: { bleed: o.bleed, radius: o.radius, border: o.border, circle: o.circle, soft: o.soft, gain: o.gain } };
      },
      destroy: function () {
        cancelAnimationFrame(raf); if (io) io.disconnect();
        document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave);
        root.removeEventListener('resize', resize); root.removeEventListener('blur', onLeave);
        mat.dispose(); renderer.dispose(); wrap.remove();
      }
    };
    instances.push(api);
    return api;
  }

  root.ShapeBlur = { mount: mount, all: instances };
})(window);

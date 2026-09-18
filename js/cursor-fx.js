/* cursor-fx.js —— 全局鼠标波纹覆盖层。维护：网站交互调整。
   owner 2026-09-15：波纹要全局，首屏以下也要有。
   限制：WebGL 取不到网页文字和图片的像素，没法像首屏那样真的扭曲它们。
   做法：整页最上面盖一张透明画布（不挡点击），用和首屏同一套波纹位移场（RippleDistortion 的圆章 + 生长 / 衰减），只画「效果层」：
     glow  ：暖白雾 + 颗粒边（按位移场强度，边缘用噪声抖动成颗粒），盖在文字图片上就是雾化提亮；
     chroma：从位移场梯度算出边缘，画红蓝错开的彩色描边；首屏里 scene.js 已做真色差，这里只画首屏以下。
   参数：js/fx-config.js。 */
(function () {
  'use strict';
  var THREE = window.THREE, gsap = window.gsap, FX = window.V7FX; if (!THREE || !FX) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;   /* 触屏没有悬浮 */
  var LOOK = FX.look, L = FX.looks[LOOK], P = FX.ripple;
  var MAX_WAVES = 100, QUALITY_SCALE = { low: .4, medium: .7, high: 1 }, START_SCALE = 1.5, LIFE_CONSTANT = Math.log(500);
  var header = document.getElementById('header');

  var host = document.createElement('div'); host.className = 'cursorFx'; host.setAttribute('aria-hidden', 'true'); document.body.appendChild(host);
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true }); }
  catch (e) { host.remove(); return; }
  var DPR = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR); renderer.setClearColor(0x000000, 0); renderer.autoClear = false;
  host.appendChild(renderer.domElement);

  /* 位移场：与 scene.js 同一套着色器 */
  var waveVertex = 'precision highp float;\nattribute vec2 position; attribute vec2 uv; attribute vec2 iOffset; attribute vec2 iScale; attribute float iOpacity;\nvarying vec2 vUv; varying float vOpacity;\nvoid main() { vUv = uv; vOpacity = iOpacity; gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0); }';
  var waveFragment = 'precision highp float;\nvarying vec2 vUv; varying float vOpacity;\nuniform float uRings;\nconst float PI = 3.141592653589793;\nconst float EDGE = 0.006737947;\nvoid main() {\n  vec2 p = vUv * 2.0 - 1.0; float r = dot(p, p); if (r > 1.0) discard;\n  float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);\n  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);\n  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);\n}';
  var screenVertex = 'precision highp float;\nattribute vec2 position; attribute vec2 uv; varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }';
  var overlayFragment = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D uDisplacement; uniform vec2 uTexel; uniform vec2 uResolution;',
    'uniform float uFog; uniform vec3 uFogColor; uniform float uGrain; uniform float uFringe; uniform float uTime; uniform float uCutY;',
    'float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
    'void main() {',
    '  float amount = texture2D(uDisplacement, vUv).r;',
    '  vec4 outc = vec4(0.0);',
    '  if (uFog > 0.001) {',
    /* 水面：不再铺整片白雾，只取位移场的坡度当成水面法线，算一道很淡的高光（像光在水面上掠过）+ 极淡的整体提亮。
       owner：深色底上太明显，要像水，能感到有变化就行。 */
    '    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;',
    '    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;',
    '    vec3 nrm = normalize(vec3(-ex * 14.0, -ey * 14.0, 1.0));',
    '    float spec = pow(max(dot(nrm, normalize(vec3(-0.4, 0.6, 1.0))), 0.0), 18.0) - pow(normalize(vec3(-0.4, 0.6, 1.0)).z, 18.0);',
    '    float a = clamp(spec * 3.0, 0.0, 1.0) * 0.9 + smoothstep(0.0, 1.2, amount) * 0.12;',
    '    float alpha = clamp(a * uFog, 0.0, 1.0);',
    '    outc = vec4(uFogColor * alpha, alpha);',
    '  }',
    '  if (uFringe > 0.001) {',
    /* 彩色描边：位移场梯度 → 朝向 +梯度画红、-梯度画蓝；只画 uCutY 以下（首屏里 scene.js 已有真色差） */
    '    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;',
    '    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;',
    '    float g = clamp(length(vec2(ex, ey)) * 7.0, 0.0, 1.0);',
    '    float side = clamp((ex + ey) * 9.0, -1.0, 1.0);',
    '    vec3 col = side > 0.0 ? vec3(1.0, 0.18, 0.28) : vec3(0.12, 0.55, 1.0);',
    '    float alpha = g * abs(side) * uFringe;',
    '    float below = step(gl_FragCoord.y, uCutY);',   /* 画布 y 向上：首屏以下 = y 小于首屏底边换算值 */
    '    alpha *= below;',
    '    outc = vec4(col * alpha, alpha) + outc * (1.0 - alpha);',
    '  }',
    '  gl_FragColor = outc;',
    '}'
  ].join('\n');

  var dispRT = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType });
  var offsets = new Float32Array(MAX_WAVES * 2), scales = new Float32Array(MAX_WAVES * 2), opacities = new Float32Array(MAX_WAVES);
  var waves = []; for (var i = 0; i < MAX_WAVES; i++) waves.push({ x: 0, y: 0, scale: START_SCALE, target: START_SCALE, size: 1, opacity: 0 });
  var current = 0;
  var geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), 2));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), 2));
  var aOff = new THREE.InstancedBufferAttribute(offsets, 2), aScale = new THREE.InstancedBufferAttribute(scales, 2), aOp = new THREE.InstancedBufferAttribute(opacities, 1);
  [aOff, aScale, aOp].forEach(function (a) { a.setUsage(THREE.DynamicDrawUsage); });
  geo.setAttribute('iOffset', aOff); geo.setAttribute('iScale', aScale); geo.setAttribute('iOpacity', aOp);
  geo.instanceCount = MAX_WAVES; geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
  var waveMesh = new THREE.Mesh(geo, new THREE.RawShaderMaterial({
    vertexShader: waveVertex, fragmentShader: waveFragment, uniforms: { uRings: { value: P.rings } },
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor
  }));
  waveMesh.frustumCulled = false;
  var waveScene = new THREE.Scene(); waveScene.add(waveMesh);

  function hexToRGB(hex) { var n = parseInt(hex.replace('#', ''), 16); return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); }
  var U = {
    uDisplacement: { value: dispRT.texture }, uTexel: { value: new THREE.Vector2(1, 1) }, uResolution: { value: new THREE.Vector2(1, 1) },
    uFog: { value: L.fog }, uFogColor: { value: hexToRGB(L.fogColor) }, uGrain: { value: L.grain }, uFringe: { value: L.fringe }, uTime: { value: 0 }, uCutY: { value: 0 }
  };
  var tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2));
  tri.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  tri.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
  var overlay = new THREE.Mesh(tri, new THREE.RawShaderMaterial({
    vertexShader: screenVertex, fragmentShader: overlayFragment, uniforms: U, depthTest: false, depthWrite: false, transparent: true,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor
  }));
  overlay.frustumCulled = false;
  var overlayScene = new THREE.Scene(); overlayScene.add(overlay);
  var cam = new THREE.Camera();

  var width = 1, height = 1;
  function size() {
    width = Math.max(1, innerWidth); height = Math.max(1, innerHeight);
    renderer.setSize(width, height, false);
    var q = QUALITY_SCALE[P.quality] || 1, fw = Math.max(2, Math.round(width * q)), fh = Math.max(2, Math.round(height * q));
    dispRT.setSize(fw, fh); U.uTexel.value.set(1 / fw, 1 / fh); U.uResolution.value.set(width, height);
  }
  size(); addEventListener('resize', size);

  var prevX = 0, prevY = 0;
  function setNewWave(x, y, power) {
    var w = waves[current]; current = (current + 1) % MAX_WAVES;
    w.x = x; w.y = y; w.scale = START_SCALE * power; w.target = START_SCALE * Math.max(1, P.spread) * power; w.size = Math.max(1, P.brushSize); w.opacity = 1;
  }
  /* owner：首页浅色「北京 / AI 产品 / 设计师」大字上悬浮要看得出发光；深色区保持隐约（之前嫌太明显）→ 按鼠标所在区块切换强度 */
  var fogBase = U.uFog.value, fogTarget = fogBase, BRIGHT = document.querySelectorAll('#hero, .page--about #abHero');
  addEventListener('pointermove', function (e) {
    var over = e.target && e.target.closest && e.target.closest('#hero');
    fogTarget = over ? Math.max(fogBase, .6) : fogBase;
    if (P.trigger === 'click') return;
    var x = e.clientX, y = height - e.clientY, step = Math.max(1, P.spacing);
    if (Math.abs(x - prevX) > step || Math.abs(y - prevY) > step) { setNewWave(x, y, 1); prevX = x; prevY = y; }
  }, { passive: true });
  addEventListener('pointerdown', function (e) { if (P.trigger === 'hover') return; setNewWave(e.clientX, height - e.clientY, Math.max(1, P.clickStrength)); }, { passive: true });

  var prevTime = 0, idle = false, t0 = performance.now();
  function frame() {
    var now = performance.now(), delta = prevTime ? Math.min(.05, (now - prevTime) / 1000) : 0; prevTime = now;
    var growth = 1 - Math.exp(-delta * 1.09), decay = Math.exp((-delta * LIFE_CONSTANT) / Math.max(.15, P.fade)), any = false;
    for (var i = 0; i < MAX_WAVES; i++) {
      var w = waves[i];
      if (w.opacity <= 0) { opacities[i] = 0; continue; }
      w.opacity *= decay; w.scale += (w.target - w.scale) * growth;
      if (w.opacity < .002) { w.opacity = 0; opacities[i] = 0; continue; }
      any = true;
      var half = (w.scale * w.size) / 2;
      offsets[i * 2] = (w.x / width) * 2 - 1; offsets[i * 2 + 1] = (w.y / height) * 2 - 1;
      scales[i * 2] = (half / width) * 2; scales[i * 2 + 1] = (half / height) * 2;
      opacities[i] = w.opacity;
    }
    if (!any) { if (!idle) { renderer.setRenderTarget(null); renderer.clear(); idle = true; } return; }   /* 没有波纹时不画 */
    idle = false;
    aOff.needsUpdate = true; aScale.needsUpdate = true; aOp.needsUpdate = true;
    U.uTime.value = ((now - t0) / 1000) % 100;
    U.uFog.value += (fogTarget - U.uFog.value) * .08;
    /* 色差版只画首屏以下：首屏底边在屏幕上的位置（画布 y 向上，按设备像素） */
    var hb = header ? header.getBoundingClientRect().bottom : 0;
    U.uCutY.value = LOOK === 'chroma' ? (height - Math.min(height, Math.max(0, hb))) * DPR : 0;
    renderer.setRenderTarget(dispRT); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(waveScene, cam);
    renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(overlayScene, cam);
  }
  if (gsap) gsap.ticker.add(frame); else (function loop() { frame(); requestAnimationFrame(loop); })();
  window.__v7CursorFx = { look: LOOK, uniforms: U };
})();

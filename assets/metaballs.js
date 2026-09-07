/* ═══════════════════════════════════════════════════════════════
   metaballs.js —— 「未完待续」块的融球（WebGL2 片元着色器）

   移植自 React Bits 的 MetaBalls。原版依赖 ogl，这里只需要
   建 program、每帧传 uniform、画一个三角形 —— 原生 WebGL2 就够了。
   GLSL 一个字没改（原组件就是 #version 300 es）；
   球的初始参数用的 hash31 / hash33 也逐行照抄，所以球的轨迹和原组件一致。

   ★ 只挂在一块区域上，不铺整页：光标只有进了这块才被融球跟着走，
     出了这块就回到默认的绕圈轨迹（原组件的 pointerenter / leave 逻辑）。
   ★ 这块住在非激活的 tab 里：加载时 display:none → clientWidth 为 0。
     所以尺寸跟 ResizeObserver 走，切回来那一刻自动重算；
     离开视口、切到后台、系统关了动效，一律停帧。

   用法：
     <script src="assets/metaballs.js"></script>
     <script>MetaBalls.mount('#cses-tbc', { ballCount: 7, animationSize: 29 });</script>
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var VERT = [
    '#version 300 es',
    'precision highp float;',
    'layout(location = 0) in vec2 position;',
    'void main() {',
    '  gl_Position = vec4(position, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAG = [
    '#version 300 es',
    'precision highp float;',
    'uniform vec3 iResolution;',
    'uniform float iTime;',
    'uniform vec3 iMouse;',
    'uniform vec3 iColor;',
    'uniform vec3 iCursorColor;',
    'uniform float iAnimationSize;',
    'uniform int iBallCount;',
    'uniform float iCursorBallSize;',
    'uniform vec3 iMetaBalls[50];',
    'uniform float iClumpFactor;',
    'uniform bool enableTransparency;',
    'out vec4 outColor;',
    'const float PI = 3.14159265359;',
    '',
    'float getMetaBallValue(vec2 c, float r, vec2 p) {',
    '  vec2 d = p - c;',
    '  float dist2 = dot(d, d);',
    '  return (r * r) / dist2;',
    '}',
    '',
    'void main() {',
    '  vec2 fc = gl_FragCoord.xy;',
    '  float scale = iAnimationSize / iResolution.y;',
    '  vec2 coord = (fc - iResolution.xy * 0.5) * scale;',
    '  vec2 mouseW = (iMouse.xy - iResolution.xy * 0.5) * scale;',
    '  float m1 = 0.0;',
    '  for (int i = 0; i < 50; i++) {',
    '    if (i >= iBallCount) break;',
    '    m1 += getMetaBallValue(iMetaBalls[i].xy, iMetaBalls[i].z, coord);',
    '  }',
    '  float m2 = getMetaBallValue(mouseW, iCursorBallSize, coord);',
    '  float total = m1 + m2;',
    '  float f = smoothstep(-1.0, 1.0, (total - 1.3) / min(1.0, fwidth(total)));',
    '  vec3 cFinal = vec3(0.0);',
    '  if (total > 0.0) {',
    '    float alpha1 = m1 / total;',
    '    float alpha2 = m2 / total;',
    '    cFinal = iColor * alpha1 + iCursorColor * alpha2;',
    '  }',
    '  outColor = vec4(cFinal * f, enableTransparency ? f : 1.0);',
    '}'
  ].join('\n');

  /* ── 原组件里的三个纯函数，逐行照抄 ── */
  function parseHexColor(hex) {
    var c = hex.replace('#', '');
    return [
      parseInt(c.substring(0, 2), 16) / 255,
      parseInt(c.substring(2, 4), 16) / 255,
      parseInt(c.substring(4, 6), 16) / 255
    ];
  }
  function fract(x) { return x - Math.floor(x); }
  function hash31(p) {
    var r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);
    var r_yzx = [r[1], r[2], r[0]];
    var dotVal = r[0] * (r_yzx[0] + 33.33) + r[1] * (r_yzx[1] + 33.33) + r[2] * (r_yzx[2] + 33.33);
    for (var i = 0; i < 3; i++) r[i] = fract(r[i] + dotVal);
    return r;
  }
  function hash33(v) {
    var p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);
    var p_yxz = [p[1], p[0], p[2]];
    var dotVal = p[0] * (p_yxz[0] + 33.33) + p[1] * (p_yxz[1] + 33.33) + p[2] * (p_yxz[2] + 33.33);
    var i;
    for (i = 0; i < 3; i++) p[i] = fract(p[i] + dotVal);
    var p_xxy = [p[0], p[0], p[1]];
    var p_yxx = [p[1], p[0], p[0]];
    var p_zyx = [p[2], p[1], p[0]];
    var result = [];
    for (i = 0; i < 3; i++) result[i] = fract((p_xxy[i] + p_yxx[i]) * p_zyx[i]);
    return result;
  }

  function capable() {
    var mq = function (q) { return root.matchMedia && matchMedia(q).matches; };
    return !(
      mq('(prefers-reduced-motion: reduce)') ||
      !!(navigator.connection && navigator.connection.saveData)
    );
  }

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error('着色器编译失败：' + log);
    }
    return sh;
  }

  var instances = [];

  function mount(hostSel, opt) {
    var host = typeof hostSel === 'string' ? document.querySelector(hostSel) : hostSel;
    if (!host) return null;
    opt = opt || {};
    var o = {
      color:                  opt.color                  != null ? opt.color                  : '#ffffff',
      speed:                  opt.speed                  != null ? opt.speed                  : 0.3,
      enableMouseInteraction: opt.enableMouseInteraction != null ? opt.enableMouseInteraction : true,
      hoverSmoothness:        opt.hoverSmoothness        != null ? opt.hoverSmoothness        : 0.05,
      animationSize:          opt.animationSize          != null ? opt.animationSize          : 30,
      ballCount:              opt.ballCount              != null ? opt.ballCount              : 15,
      clumpFactor:            opt.clumpFactor            != null ? opt.clumpFactor            : 1,
      cursorBallSize:         opt.cursorBallSize         != null ? opt.cursorBallSize         : 3,
      cursorBallColor:        opt.cursorBallColor        != null ? opt.cursorBallColor        : '#ffffff',
      enableTransparency:     opt.enableTransparency     != null ? opt.enableTransparency     : true,
      force:                  !!opt.force
    };
    if (!o.force && !capable()) return null;

    var cv = document.createElement('canvas');
    cv.className = 'metaballs-canvas';
    var gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) return null;      /* 没有 WebGL2 就什么都不挂，块留着当静态占位 */
    host.appendChild(cv);

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('着色器链接失败：' + gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    /* ogl 的 Triangle：一个盖满裁剪空间的大三角 */
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['iResolution', 'iTime', 'iMouse', 'iColor', 'iCursorColor', 'iAnimationSize',
     'iBallCount', 'iCursorBallSize', 'iMetaBalls', 'iClumpFactor', 'enableTransparency']
      .forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    var c1 = parseHexColor(o.color), c2 = parseHexColor(o.cursorBallColor);
    gl.uniform3f(U.iColor, c1[0], c1[1], c1[2]);
    gl.uniform3f(U.iCursorColor, c2[0], c2[1], c2[2]);
    gl.uniform1f(U.iAnimationSize, o.animationSize);
    gl.uniform1i(U.iBallCount, o.ballCount);
    gl.uniform1f(U.iCursorBallSize, o.cursorBallSize);
    gl.uniform1f(U.iClumpFactor, o.clumpFactor);
    gl.uniform1i(U.enableTransparency, o.enableTransparency ? 1 : 0);
    gl.clearColor(0, 0, 0, o.enableTransparency ? 0 : 1);

    var MAX = 50;
    var n = Math.min(o.ballCount, MAX);
    var ballData = new Float32Array(MAX * 3);
    var params = [];
    for (var i = 0; i < n; i++) {
      var idx = i + 1;
      var h1 = hash31(idx);
      var st = h1[0] * (2 * Math.PI);
      var dtFactor = 0.1 * Math.PI + h1[1] * (0.4 * Math.PI - 0.1 * Math.PI);
      var baseScale = 5.0 + h1[1] * (10.0 - 5.0);
      var h2 = hash33(h1);
      var toggle = Math.floor(h2[0] * 2.0);
      var radius = 0.5 + h2[2] * (2.0 - 0.5);
      params.push({ st: st, dtFactor: dtFactor, baseScale: baseScale, toggle: toggle, radius: radius });
    }

    var mouse = { x: 0, y: 0 };
    var inside = false, px = 0, py = 0;
    var visible = true, frames = 0, raf = 0;
    var dpr = 1;                 /* 原组件写死 dpr = 1 */

    function resize() {
      var w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;      /* 藏在 display:none 的 tab 里，等 RO 再来 */
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform3f(U.iResolution, cv.width, cv.height, 0);
    }

    function onMove(e) {
      if (!o.enableMouseInteraction) return;
      var r = host.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * cv.width;
      py = (1 - (e.clientY - r.top) / r.height) * cv.height;
    }
    function onEnter() { if (o.enableMouseInteraction) inside = true; }
    function onLeave() { if (o.enableMouseInteraction) inside = false; }
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('pointerleave', onLeave);

    var t0 = performance.now();
    function render(now) {
      if (!cv.width) return;
      var t = ((now != null ? now : performance.now()) - t0) * 0.001;
      gl.uniform1f(U.iTime, t);
      for (var i = 0; i < n; i++) {
        var p = params[i];
        var dt = t * o.speed * p.dtFactor;
        var th = p.st + dt;
        ballData[i * 3]     = Math.cos(th) * p.baseScale * o.clumpFactor;
        ballData[i * 3 + 1] = Math.sin(th + dt * p.toggle) * p.baseScale * o.clumpFactor;
        ballData[i * 3 + 2] = p.radius;
      }
      gl.uniform3fv(U.iMetaBalls, ballData);

      var tx, ty;
      if (inside) { tx = px; ty = py; }
      else {
        tx = cv.width * 0.5 + Math.cos(t * o.speed) * cv.width * 0.15;
        ty = cv.height * 0.5 + Math.sin(t * o.speed) * cv.height * 0.15;
      }
      mouse.x += (tx - mouse.x) * o.hoverSmoothness;
      mouse.y += (ty - mouse.y) * o.hoverSmoothness;
      gl.uniform3f(U.iMouse, mouse.x, mouse.y, 0);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frames++;
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      render(now);
    }

    var io = null, ro = null;
    if (root.IntersectionObserver) {
      io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 });
      io.observe(host);
    }
    if (root.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(host); }
    else addEventListener('resize', resize);
    resize();
    raf = requestAnimationFrame(loop);

    var api = {
      canvas: cv, host: host,
      set: function (k, v) { if (k in o) o[k] = v; },
      /* 验证用 */
      stats: function () {
        return {
          缓冲区: [cv.width, cv.height],
          已渲染帧: frames, 在视口内: visible, 光标在块内: inside,
          球数: n, 尺寸: o.animationSize, 速度: o.speed, 聚拢: o.clumpFactor,
          光标球: o.cursorBallSize, 平滑: o.hoverSmoothness
        };
      },
      /* 不依赖 rAF 的同步绘制 + 当场读像素（无头环境里 rAF 会停摆）。
         默认 preserveDrawingBuffer:false，必须在同一帧内画完立刻读。 */
      drawNow: function (fakeMs) {
        resize(); render(fakeMs != null ? t0 + fakeMs : undefined);
        var w = cv.width, h = cv.height;
        if (!w) return { 缓冲区: [0, 0] };
        var px4 = new Uint8Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px4);
        var lit = 0, alpha = 0;
        for (var k = 0; k < w * h; k++) { if (px4[k * 4 + 3] > 8) lit++; if (px4[k * 4 + 3] > 200) alpha++; }
        return { 缓冲区: [w, h], 有色像素占比: +(lit / (w * h) * 100).toFixed(1), 实心像素占比: +(alpha / (w * h) * 100).toFixed(1) };
      },
      destroy: function () {
        cancelAnimationFrame(raf);
        if (io) io.disconnect();
        if (ro) ro.disconnect(); else removeEventListener('resize', resize);
        host.removeEventListener('pointermove', onMove);
        host.removeEventListener('pointerenter', onEnter);
        host.removeEventListener('pointerleave', onLeave);
        cv.remove();
        var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext();
      }
    };
    instances.push(api);
    return api;
  }

  root.MetaBalls = { mount: mount, capable: capable, all: instances };
})(window);

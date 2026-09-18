/* scene.js —— v7 首屏背景：owner 的 Figma 稿「新图标 · 首页」(bZerotp4ghGEbPOJgDBKOj · 1078:2464) 做成 3D，再叠 React Bits 的 RippleDistortion 鼠标波纹。维护：网站交互调整。

   ① 漂浮的方块，两种玩法：
   · home（默认，owner 2026-09-15 第二版）：方块留在稿面原位，各自小范围漂浮；鼠标推走后被弹簧缓慢拉回原位；投影用画布按稿面 CSS 投影参数画好、跟着方块移动。参数 HOME。
   · gather（?tiles=gather，第一版）：像在太空里漂浮，慢慢往中间聚拢，各自有体积不穿模，鼠标划过把它们顶开。参数 PHY。
   方块形状取自稿面：22 块，宽高与四角圆角（98.743，按 CSS 规则超边时等比缩小）照稿；挤出厚 34、倒角 7。
   物理用 cannon.js 0.6.2（本地 js/vendor/cannon.min.js）：零重力；每块受一股指向中心的弱引力（z 方向加倍，让团块贴近画面平面）+ 阻尼，
   所以会慢慢漂向中间聚成松散的一团（离中心 260 像素内不再往里拉）；碰撞体是与方块同尺寸的长方体，互相挤开不穿插（圆角处碰撞体比外形多出一点，所以圆角边会留一丝缝）。
   平时每块有随时间缓慢变化的推力与扭矩，保持漂浮翻转；另有一股弱回正扭矩，让方块正面慢慢转向镜头，形状看得清。
   鼠标：首屏里一个看不见的球体跟着鼠标走（运动学刚体），碰到方块就把它们顶开；靠近时再加一股轻微排斥力，顶开的感觉更柔。
   稿面的投影在太空里没有地面可落，改成方块之间互相投影。
   减少动态效果时不跑物理，方块按稿面原位摆放。

   ② 鼠标波纹（owner 提供的 RippleDistortion 源码，React + ogl → 这里改写成 three.js，着色器与默认参数原样）
   方块场景先渲染进离屏画面；鼠标每移动 spacing 像素在「位移场」里盖一个带环纹的圆章，圆章按 growth / decay 放大并淡出；
   最后一遍全屏着色器按位移场的值旋转方向、推动取样坐标，得到水面般的扭曲。参数见下方 RIPPLE。

   坐标：3D 世界单位 = 稿面像素，稿面中心在原点，y 向上。 */
(function () {
  'use strict';
  var THREE = window.THREE, gsap = window.gsap; if (!THREE) return;
  var host = document.getElementById('scene'), header = document.getElementById('header');
  if (!host || !header) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 波纹参数在 js/fx-config.js（与全局覆盖层共用） */
  var FX = window.V7FX, LOOK = FX.look, L = FX.looks[LOOK], RIPPLE = {};
  for (var rk in FX.ripple) RIPPLE[rk] = FX.ripple[rk];
  RIPPLE.strength = L.strength; RIPPLE.dispersion = L.dispersion; RIPPLE.grayscale = false;
  var MAX_WAVES = 100, QUALITY_SCALE = { low: .4, medium: .7, high: 1 }, START_SCALE = 1.5, LIFE_CONSTANT = Math.log(500);

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { host.classList.add('is-fallback'); return; }
  var DPR = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.autoClear = false;
  host.appendChild(renderer.domElement);

  /* ════════ ① 太空漂浮的方块 ════════ */
  var CANNON = window.CANNON;
  var FW = 1920, FH = 1080, R = 98.743, T = 70, BEV = 14, U = 100;   /* owner：厚度加大（34 → 70），倒角 7 → 14 更圆润 */   /* U：物理单位 1 = 100 稿面像素 */
  var TILES = [   /* x, y, w, h, 圆角位, Figma 节点 —— 稿面原位只在「减少动态效果」时用 */
    [269, 25, 197, 170, 'tl br', '1078:2486'], [466, 25, 198, 170, 'tl bl', '1078:2476'], [1256.23, 24.69, 197.49, 170.22, 'tl bl', '1078:2501'],
    [71, 195, 198, 170, 'br', '1078:2477'], [1454, 195, 197, 170, '', '1078:2493'], [1651, 195, 198, 170, 'br', '1078:2478'],
    [269, 365, 197, 170, 'tr', '1078:2479'], [1454, 365, 197, 170, 'tl tr br bl', '1078:2480'],
    [71, 535, 198, 171, 'bl', '1078:2487'], [269, 535, 197, 171, 'tl tr br bl', '1078:2481'], [1651, 535, 198, 171, 'tr bl', '1078:2482'],
    [269, 706, 197, 170, 'br', '1078:2488'], [1454, 706, 197, 170, 'bl', '1078:2483'], [1651, 706, 198, 170, 'tl tr', '1078:2475'],
    [71.31, 875.78, 197.49, 170.22, 'br bl', '1078:2503'], [269, 876, 197, 170, 'tr', '1078:2489'], [466, 876, 198, 170, 'tl br', '1078:2484'],
    [664, 876, 197, 170, '', '1078:2492'], [861, 876, 198, 170, 'br', '1078:2491'], [1059, 876, 197, 170, 'tr bl', '1078:2490'],
    [1256, 876, 198, 170, 'br', '1078:2485'], [1454, 876, 395, 170, 'br', '1078:2505']
  ];
  /* 物理参数 —— 调手感改这里 */
  /* 两种玩法：home（默认）方块留在稿面原位小范围漂浮，推开后缓慢回位；gather（地址加 ?tiles=gather）从画面外漂进来聚成一圈 */
  var MODE = /[?&]tiles=gather/.test(location.search) ? 'gather' : 'home';
  var HOME = {
    k: .85, zk: 1.6, max: 4,     /* 回位弹簧：力 = -k × 偏离原位的距离（z 用 zk），上限 max；越小回得越慢 */
    linDamp: .78, angDamp: .82,  /* 阻尼：回位时不来回晃，缓慢停住 */
    floatXY: .04, floatZ: .16,   /* 原位漂浮幅度（单位）：xy ±4 像素、z ±16 像素 */
    repel: 24, pusherMaxV: 18,   /* 鼠标排斥与撞击速度（原位版单独加大，推开更明显） */
    tilt: .05,                   /* 漂浮时的轻微倾斜（弧度） */
    rotK: 2.6,                   /* 回正弹簧：把方块转回平放 */
    collider: .93,               /* 碰撞体比外形小一圈：稿面里方块紧挨着，原尺寸会一直互相挤、把方块挤歪 */
    startZ: -7                   /* 进场前沉在后面 7 单位，进场时浮上来 */
  };
  var PHY = {
    pull: .42,           /* 指向中心的引力系数：只拉离中心超过 rest 的部分，所以聚成松散的一团而不是挤成一坨 */
    rest: 2.6,           /* 团块半径（单位）≈ 260 像素内不再往里拉 */
    zPull: 4,            /* 前后方向拉得更紧，方块铺在画面平面上，不叠成一摞 */
    pullMax: 2.4,        /* 引力上限；离得很远（> farR）时放宽到 farMax，推飞了也能回来 */
    farR: 7, farMax: 6,
    linDamp: .72, angDamp: .6,
    drift: .22,          /* 漂浮推力幅度 */
    spin: .05,           /* 漂浮扭矩幅度 */
    startR: [10, 15],    /* 进场前散在中心外 10–15 单位的一圈 */
    inward: .07,         /* 进场时朝内的初速度比例（越小越慢） */
    pusherR: 1.2,        /* 鼠标球半径（单位）≈ 120 像素 */
    pusherMaxV: 13,      /* 鼠标球最大速度（单位 / 秒）：限制撞击力度，免得把方块轰出画面 */
    face: .9,            /* 回正：把方块正面慢慢转向镜头的扭矩强度（0 关闭）；漂浮扭矩仍在，所以会轻轻晃 */
    repelR: 2.4, repel: 9,
    friction: .1, restitution: .12
  };


  function radii(w, h, flags) {   /* CSS 规则：同一边两角之和超过边长时，全部角等比缩小 */
    var r = { tl: 0, tr: 0, br: 0, bl: 0 };
    flags.split(' ').forEach(function (k) { if (k) r[k] = R; });
    var f = 1;
    [[w, r.tl + r.tr], [w, r.bl + r.br], [h, r.tl + r.bl], [h, r.tr + r.br]].forEach(function (p) { if (p[1] > 0) f = Math.min(f, p[0] / p[1]); });
    for (var k in r) r[k] *= f;
    return r;
  }
  function shapeOf(w, h, r) {   /* 中心为原点、y 向上 */
    var s = new THREE.Shape(), x0 = -w / 2, x1 = w / 2, y0 = -h / 2, y1 = h / 2;
    s.moveTo(x0 + r.bl, y0);
    s.lineTo(x1 - r.br, y0); if (r.br) s.absarc(x1 - r.br, y0 + r.br, r.br, -Math.PI / 2, 0, false);
    s.lineTo(x1, y1 - r.tr); if (r.tr) s.absarc(x1 - r.tr, y1 - r.tr, r.tr, 0, Math.PI / 2, false);
    s.lineTo(x0 + r.tl, y1); if (r.tl) s.absarc(x0 + r.tl, y1 - r.tl, r.tl, Math.PI / 2, Math.PI, false);
    s.lineTo(x0, y0 + r.bl); if (r.bl) s.absarc(x0 + r.bl, y0 + r.bl, r.bl, Math.PI, Math.PI * 1.5, false);
    return s;
  }

  var scene = new THREE.Scene(); scene.background = new THREE.Color(0xf2f2f2);   /* owner：比稿面纯白稍灰一点 */
  var camera = new THREE.PerspectiveCamera(30, 1, 10, 40000);
  var world = new THREE.Group(); scene.add(world);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  /* r155+ Lambert 带 1/π，强度乘 π 才等于 1。环境 .72 + 主光 .42：朝向镜头的面接近纯白，翻过去的面落到环境光，翻转时明暗有变化 */
  /* 体积感：环境反射给倒角和侧面柔和的明暗过渡；主光左上前方，补光右下偏后，侧面不会一片死白 */
  var pmrem = new THREE.PMREMGenerator(renderer);
  if (THREE.RoomEnvironment) { scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), .04).texture; scene.environmentIntensity = .28; }
  scene.add(new THREE.AmbientLight(0xffffff, Math.PI * .22));
  var fillLight = new THREE.DirectionalLight(0xffffff, Math.PI * .08); fillLight.position.set(900, -700, 600); scene.add(fillLight);
  var key = new THREE.DirectionalLight(0xffffff, Math.PI * .42);
  key.position.set(-900, 1100, 2200); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  var kc = key.shadow.camera; kc.left = -1800; kc.right = 1800; kc.top = 1400; kc.bottom = -1400; kc.near = 200; kc.far = 6000;
  key.shadow.bias = -.0006; key.shadow.normalBias = 1.5;
  scene.add(key);

  var tileMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: .7, metalness: 0 });
  /* 原位版投影：不用实时阴影（VSM 在范围边缘会出一大块斜影），改用画布按稿面 CSS 投影参数画好的柔影，
     每帧跟着方块的位置、朝向、离地高度移动，天然抗锯齿。稿面投影 x27.429 y27.429 模糊 109.714 黑 10%。 */
  var SH = { x: 27.429, y: 27.429, blur: 109.714, a: .1, z: -150 };
  var SHPAD = Math.ceil(SH.blur * 1.25);
  function shadowTexture(w, h, r) {   /* canvas shadowBlur 与 CSS box-shadow blur 同定义（σ = 值 / 2） */
    var cw = Math.ceil(w + SHPAD * 2), ch = Math.ceil(h + SHPAD * 2);
    var cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
    var g = cv.getContext('2d'), OFF = 20000, x0 = SHPAD - OFF, y0 = SHPAD;
    g.shadowColor = 'rgba(0,0,0,' + SH.a + ')'; g.shadowBlur = SH.blur; g.shadowOffsetX = OFF;
    g.beginPath();
    g.moveTo(x0 + r.tl, y0);
    g.lineTo(x0 + w - r.tr, y0); if (r.tr) g.arc(x0 + w - r.tr, y0 + r.tr, r.tr, -Math.PI / 2, 0);
    g.lineTo(x0 + w, y0 + h - r.br); if (r.br) g.arc(x0 + w - r.br, y0 + h - r.br, r.br, 0, Math.PI / 2);
    g.lineTo(x0 + r.bl, y0 + h); if (r.bl) g.arc(x0 + r.bl, y0 + h - r.bl, r.bl, Math.PI / 2, Math.PI);
    g.lineTo(x0, y0 + r.tl); if (r.tl) g.arc(x0 + r.tl, y0 + r.tl, r.tl, Math.PI, Math.PI * 1.5);
    g.closePath(); g.fillStyle = '#000'; g.fill();
    var tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
    return { tex: tx, w: cw, h: ch };
  }
  if (MODE === 'home') renderer.shadowMap.enabled = false;

  /* 物理世界 */
  var phys = null, pusher = null;
  if (CANNON && !reduce) {
    phys = new CANNON.World(); phys.gravity.set(0, 0, 0);
    phys.broadphase = new CANNON.SAPBroadphase(phys); phys.solver.iterations = 12; phys.allowSleep = false;
    var tileM = new CANNON.Material('tile'), pushM = new CANNON.Material('pusher');
    phys.addContactMaterial(new CANNON.ContactMaterial(tileM, tileM, { friction: PHY.friction, restitution: PHY.restitution }));
    phys.addContactMaterial(new CANNON.ContactMaterial(tileM, pushM, { friction: 0, restitution: .15 }));
    pusher = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, material: pushM });
    pusher.addShape(new CANNON.Sphere(PHY.pusherR)); pusher.position.set(0, 0, 60); phys.addBody(pusher);
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  var tiles = TILES.map(function (d, i) {
    var w = d[2], h = d[3], r = radii(w, h, d[4]);
    var inner = { tl: Math.max(0, r.tl - BEV), tr: Math.max(0, r.tr - BEV), br: Math.max(0, r.br - BEV), bl: Math.max(0, r.bl - BEV) };
    var geo = new THREE.ExtrudeGeometry(shapeOf(w - BEV * 2, h - BEV * 2, inner), { depth: T - BEV * 2, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 18, curveSegments: 48 });
    geo.translate(0, 0, -(T - BEV * 2) / 2);   /* 以体积中心为原点，和刚体中心对齐 */
    var mesh = new THREE.Mesh(geo, tileMat); mesh.castShadow = MODE !== 'home'; mesh.receiveShadow = MODE !== 'home'; world.add(mesh);
    var shadow = null, shMat = null;
    if (MODE === 'home') {
      var st = shadowTexture(w, h, r); shMat = new THREE.MeshBasicMaterial({ map: st.tex, transparent: true, depthWrite: false, opacity: 0 });
      shadow = new THREE.Mesh(new THREE.PlaneGeometry(st.w, st.h), shMat); shadow.position.z = SH.z; shadow.renderOrder = -1; world.add(shadow);
    }
    var t = { mesh: mesh, shadow: shadow, shMat: shMat, w: w, h: h, seed: Math.random() * 100, body: null,
      home: new THREE.Vector3(d[0] + w / 2 - FW / 2, FH / 2 - (d[1] + h / 2), 0) };
    if (phys) {
      var isHome = MODE === 'home', cs = isHome ? HOME.collider : 1;
      var b = new CANNON.Body({ mass: w * h / (198 * 170), material: tileM, linearDamping: isHome ? HOME.linDamp : PHY.linDamp, angularDamping: isHome ? HOME.angDamp : PHY.angDamp });
      b.addShape(new CANNON.Box(new CANNON.Vec3(w / 2 / U * cs, h / 2 / U * cs, T / 2 / U)));
      if (isHome) {
        b.position.set(t.home.x / U, t.home.y / U, HOME.startZ);
        b.quaternion.setFromEuler(rnd(-.5, .5), rnd(-.5, .5), rnd(-.3, .3));
      } else {
        var ang = rnd(0, Math.PI * 2), rad = rnd(PHY.startR[0], PHY.startR[1]);
        b.position.set(Math.cos(ang) * rad * 1.35, Math.sin(ang) * rad * .8, rnd(-5, 2));
        b.quaternion.setFromEuler(rnd(-.9, .9), rnd(-.9, .9), rnd(-Math.PI, Math.PI));
        b.velocity.set(-Math.sin(ang) * rnd(.3, .9), Math.cos(ang) * rnd(.3, .9), 0);   /* 先绕着转一点，再慢慢被吸进来 */
        b.angularVelocity.set(rnd(-.35, .35), rnd(-.35, .35), rnd(-.35, .35));
      }
      phys.addBody(b); t.body = b;
    } else {
      mesh.position.copy(t.home);
    }
    return t;
  });
  var pulling = !phys;   /* 进场前不吸，方块在画面外漂着 */

  /* 关于页：方块框正中间放 owner 的 Figma logo（1079:2599）3D 金色件。页面在 scene.js 之前设 window.V7_SCENE_LOGO = true 即开启。
     稿面框的空心区域是 x 466–1454、y 195–876，中心正好在画面原点，logo 高 380 稿面像素。 */
  var centerLogo = null, logoSt = { zoom: window.V7_SCENE_LOGO ? 0 : 1 };
  if (window.V7_SCENE_LOGO && window.V7Logo3D) {
    centerLogo = window.V7Logo3D.create({ size: 380, depth: .2, bevel: .04, material: new THREE.MeshStandardMaterial({ color: 0xDAAB00, metalness: .5, roughness: .32, envMapIntensity: 2.4 }) });
    centerLogo.position.set(0, 0, 90); world.add(centerLogo);
    if (MODE === 'home') {   /* 投影：同方块的画布柔影，圆角方形 */
      var lst = shadowTexture(380, 380, { tl: 110, tr: 110, br: 110, bl: 110 });
      var lsm = new THREE.MeshBasicMaterial({ map: lst.tex, transparent: true, depthWrite: false, opacity: 0 });
      centerLogo.userData.shadow = new THREE.Mesh(new THREE.PlaneGeometry(lst.w, lst.h), lsm); centerLogo.userData.shadow.position.set(SH.x + 40, -SH.y - 40, SH.z); world.add(centerLogo.userData.shadow);
    }
    if (phys) {   /* 物理里给它一个静止的碰撞体，方块推过来不会穿进去 */
      var lb = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC }); lb.addShape(new CANNON.Sphere(2.2)); lb.position.set(0, 0, .9); phys.addBody(lb);
    }
  }

  /* ════════ ② RippleDistortion（three.js 版） ════════ */
  var waveVertex = [
    'precision highp float;',
    'attribute vec2 position; attribute vec2 uv; attribute vec2 iOffset; attribute vec2 iScale; attribute float iOpacity;',
    'varying vec2 vUv; varying float vOpacity;',
    'void main() { vUv = uv; vOpacity = iOpacity; gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0); }'
  ].join('\n');
  var waveFragment = [
    'precision highp float;',
    'varying vec2 vUv; varying float vOpacity;',
    'uniform float uRings;',
    'const float PI = 3.141592653589793;',
    'const float EDGE = 0.006737947;',
    'void main() {',
    '  vec2 p = vUv * 2.0 - 1.0; float r = dot(p, p); if (r > 1.0) discard;',
    '  float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);',
    '  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);',
    '  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);',
    '}'
  ].join('\n');
  var screenVertex = [
    'precision highp float;',
    'attribute vec2 position; attribute vec2 uv; varying vec2 vUv;',
    'void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }'
  ].join('\n');
  var compositeFragment = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D uTexture; uniform sampler2D uDisplacement;',
    'uniform vec2 uResolution; uniform vec2 uTextureSize; uniform vec2 uTexel;',
    'uniform vec3 uTint; uniform vec3 uHighlight;',
    'uniform float uStrength; uniform float uSwirl; uniform float uDispersion; uniform float uGlint; uniform float uTintAmount; uniform float uGrayscale;',
    'uniform float uTime; uniform float uBlur; uniform float uScatter; uniform float uGlow; uniform vec3 uGlowColor;',
    'float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
    'const float TAU = 6.283185307179586;',
    'vec2 coverUV(vec2 uv) { vec2 safe = max(uTextureSize, vec2(1.0)); vec2 s = uResolution / safe; vec2 scaledSize = safe * max(s.x, s.y); vec2 offset = (uResolution - scaledSize) * 0.5; return (uv * uResolution - offset) / scaledSize; }',
    /* 离屏画面是线性色，最后转回 sRGB 再输出（原组件读的是 sRGB 图片，不需要这一步） */
    'vec3 toSRGB(vec3 c) { c = clamp(c, 0.0, 1.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }',
    'vec3 toLinear(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }',
    'void main() {',
    '  float amount = texture2D(uDisplacement, vUv).r;',
    '  vec2 base = coverUV(vUv);',
    '  float theta = amount * uSwirl * TAU;',
    '  vec2 dir = vec2(sin(theta), cos(theta));',
    '  vec2 push = dir * amount * uStrength;',
    '  vec3 color;',
    /* 颗粒扩散：每个像素按噪声随机挪一点，挪多少跟位移场强度走 → 原站那种颗粒状的雾边 */
    '  vec2 grain = (vec2(hash(gl_FragCoord.xy + uTime * 61.0), hash(gl_FragCoord.yx + uTime * 97.0)) - 0.5) * amount * uScatter;',
    '  vec2 at = base + push + grain;',
    '  if (uDispersion > 0.001) { float split = uDispersion * 0.25; color.r = texture2D(uTexture, at + push * split).r; color.g = texture2D(uTexture, at).g; color.b = texture2D(uTexture, at - push * split).b; }',
    '  else if (uBlur > 0.0001) {',
    /* 模糊：12 点圆盘取样，半径跟位移场强度走 */
    '    float rad = amount * uBlur; vec3 acc = texture2D(uTexture, at).rgb; float ang = hash(gl_FragCoord.xy) * 6.2831;',
    '    for (int k = 0; k < 12; k++) { float fk = float(k); float a2 = ang + fk * 2.39996; float rr = rad * sqrt((fk + 0.5) / 12.0); acc += texture2D(uTexture, at + vec2(cos(a2), sin(a2)) * rr * vec2(uResolution.y / uResolution.x, 1.0)).rgb; }',
    '    color = acc / 13.0;',
    '  }',
    '  else { color = texture2D(uTexture, at).rgb; }',
    '  color = toSRGB(color);',
    /* 发亮：往暖白里抬，边缘柔化；再叠一层按强度的柔光（screen 混合） */
    '  if (uGlow > 0.001) { float g = smoothstep(0.0, 0.9, amount) * uGlow; color = 1.0 - (1.0 - color) * (1.0 - uGlowColor * g); }',
    '  if (uGrayscale > 0.001) { color = mix(color, vec3(dot(color, vec3(0.2126, 0.7152, 0.0722))), uGrayscale); }',
    '  if (uTintAmount > 0.001) { color = mix(color, color * uTint * 1.9, clamp(amount * 1.6, 0.0, 1.0) * uTintAmount); }',
    '  if (uGlint > 0.001) {',
    '    float ex = texture2D(uDisplacement, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDisplacement, vUv - vec2(uTexel.x, 0.0)).r;',
    '    float ey = texture2D(uDisplacement, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDisplacement, vUv - vec2(0.0, uTexel.y)).r;',
    '    vec3 normal = normalize(vec3(-ex * 26.0, -ey * 26.0, 1.0)); vec3 light = normalize(vec3(-0.35, 0.55, 1.0));',
    '    float raw = pow(max(dot(normal, light), 0.0), 22.0); float flatSpec = pow(max(light.z, 0.0), 22.0);',
    '    color += uHighlight * clamp((raw - flatSpec) / max(1.0 - flatSpec, 0.0001), 0.0, 1.0) * uGlint;',
    '  }',
    '  gl_FragColor = vec4(color, 1.0);',
    '}'
  ].join('\n');
  function hexToRGB(hex) {
    var clean = hex.replace('#', ''), full = clean.length === 3 ? clean.split('').map(function (c) { return c + c; }).join('') : clean, n = parseInt(full, 16);
    if (isNaN(n)) return new THREE.Vector3(1, 1, 1);
    return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  }

  /* 离屏画面：方块场景（4× 多重采样抗锯齿）；位移场：按 quality 缩小 */
  var sceneRT = new THREE.WebGLRenderTarget(2, 2, { samples: 4, depthBuffer: true, type: THREE.HalfFloatType });
  var dispRT = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType });

  var offsets = new Float32Array(MAX_WAVES * 2), scales = new Float32Array(MAX_WAVES * 2), opacities = new Float32Array(MAX_WAVES);
  var waves = []; for (var wi = 0; wi < MAX_WAVES; wi++) waves.push({ x: 0, y: 0, scale: START_SCALE, target: START_SCALE, size: 1, opacity: 0 });
  var current = 0;

  var waveGeo = new THREE.InstancedBufferGeometry();
  waveGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), 2));
  waveGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), 2));
  var aOff = new THREE.InstancedBufferAttribute(offsets, 2), aScale = new THREE.InstancedBufferAttribute(scales, 2), aOp = new THREE.InstancedBufferAttribute(opacities, 1);
  aOff.setUsage(THREE.DynamicDrawUsage); aScale.setUsage(THREE.DynamicDrawUsage); aOp.setUsage(THREE.DynamicDrawUsage);
  waveGeo.setAttribute('iOffset', aOff); waveGeo.setAttribute('iScale', aScale); waveGeo.setAttribute('iOpacity', aOp);
  waveGeo.instanceCount = MAX_WAVES;
  /* 只用两维坐标，three 自动算包围球会得到 NaN；位置在着色器里算，给一个无限大的包围球即可 */
  waveGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
  var waveMat = new THREE.RawShaderMaterial({
    vertexShader: waveVertex, fragmentShader: waveFragment, uniforms: { uRings: { value: RIPPLE.rings } },
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor
  });
  var waveMesh = new THREE.Mesh(waveGeo, waveMat); waveMesh.frustumCulled = false;
  var waveScene = new THREE.Scene(); waveScene.add(waveMesh);

  var compositeUniforms = {
    uTexture: { value: sceneRT.texture }, uDisplacement: { value: dispRT.texture },
    uResolution: { value: new THREE.Vector2(1, 1) }, uTextureSize: { value: new THREE.Vector2(1, 1) }, uTexel: { value: new THREE.Vector2(1, 1) },
    uTint: { value: hexToRGB(RIPPLE.tint) }, uHighlight: { value: hexToRGB(RIPPLE.highlightColor) },
    uStrength: { value: RIPPLE.strength }, uSwirl: { value: RIPPLE.swirl }, uDispersion: { value: RIPPLE.dispersion },
    uGlint: { value: RIPPLE.glint }, uTintAmount: { value: RIPPLE.tintAmount }, uGrayscale: { value: RIPPLE.grayscale ? 1 : 0 },
    uTime: { value: 0 }, uBlur: { value: L.blur }, uScatter: { value: L.scatter }, uGlow: { value: 0 }, uGlowColor: { value: hexToRGB(L.fogColor) }   /* 发亮交给全局覆盖层，这里不再提亮，免得首屏叠两遍 */
  };
  var triGeo = new THREE.BufferGeometry();   /* 全屏三角形（ogl 的 Triangle 同款） */
  triGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2));
  triGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  triGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
  var compositeMesh = new THREE.Mesh(triGeo, new THREE.RawShaderMaterial({ vertexShader: screenVertex, fragmentShader: compositeFragment, uniforms: compositeUniforms, depthTest: false, depthWrite: false }));
  compositeMesh.frustumCulled = false;
  var compositeScene = new THREE.Scene(); compositeScene.add(compositeMesh);
  var rawCam = new THREE.Camera();

  /* ── 尺寸 ── */
  var FOV = 30, TAN = Math.tan(FOV * Math.PI / 360), baseDist = 2000, width = 1, height = 1;
  function size() {
    width = Math.max(1, innerWidth); height = Math.max(1, innerHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    baseDist = Math.max(FH / (2 * TAN), (FW / camera.aspect) / (2 * TAN));   /* 1920×1080 的范围完整落进视口 */
    camera.far = baseDist * 6; camera.updateProjectionMatrix();
    sceneRT.setSize(Math.round(width * DPR), Math.round(height * DPR));
    compositeUniforms.uResolution.value.set(width, height);
    compositeUniforms.uTextureSize.value.set(width, height);   /* 离屏画面与画布同尺寸：coverUV 为恒等 */
    var q = QUALITY_SCALE[RIPPLE.quality] || 1, fw = Math.max(2, Math.round(width * q)), fh = Math.max(2, Math.round(height * q));
    dispRT.setSize(fw, fh); compositeUniforms.uTexel.value.set(1 / fw, 1 / fh);
  }
  size(); addEventListener('resize', size);

  /* ── 鼠标：只在首屏露出的区域里盖波纹、推方块 ── */
  function setNewWave(x, y, power) {
    var w = waves[current]; current = (current + 1) % MAX_WAVES;
    w.x = x; w.y = y; w.scale = START_SCALE * power; w.target = START_SCALE * Math.max(1, RIPPLE.spread) * power; w.size = Math.max(1, RIPPLE.brushSize); w.opacity = 1;
  }
  function localPoint(clientX, clientY) {
    var hb = header.getBoundingClientRect(), bottom = Math.min(height, hb.bottom);
    if (clientX < 0 || clientX > width || clientY < 0 || clientY > bottom) return null;
    return [clientX, height - clientY];
  }
  var prevX = 0, prevY = 0, mouse = { x: 0, y: 0, in: false };
  addEventListener('pointermove', function (e) {
    var p = localPoint(e.clientX, e.clientY);
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.in = !!p;
    if (reduce || RIPPLE.trigger === 'click' || !p) return;
    var step = Math.max(1, RIPPLE.spacing);
    if (Math.abs(p[0] - prevX) > step || Math.abs(p[1] - prevY) > step) { setNewWave(p[0], p[1], 1); prevX = p[0]; prevY = p[1]; }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.in = false; });
  addEventListener('pointerdown', function (e) {
    if (reduce || RIPPLE.trigger === 'hover') return;
    var p = localPoint(e.clientX, e.clientY); if (!p) return;
    setNewWave(p[0], p[1], Math.max(1, RIPPLE.clickStrength));
  }, { passive: true });

  /* 鼠标投到 z = 0 平面（世界组会随滚动后仰，先换到组的本地坐标） */
  var ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), invM = new THREE.Matrix4(), ro = new THREE.Vector3(), rd = new THREE.Vector3();
  function mouseOnPlane() {
    ndc.set(mouse.x / width * 2 - 1, -(mouse.y / height) * 2 + 1);
    ray.setFromCamera(ndc, camera); world.updateMatrixWorld(); invM.copy(world.matrixWorld).invert();
    ro.copy(ray.ray.origin).applyMatrix4(invM); rd.copy(ray.ray.direction).transformDirection(invM);
    if (Math.abs(rd.z) < 1e-5) return null;
    var k = -ro.z / rd.z; return { x: (ro.x + rd.x * k) / U, y: (ro.y + rd.y * k) / U };
  }

  /* ── 进场：加载器退场时由 app.js 调；开始往中间吸，并给每块一点朝内的初速度 ── */
  var introduced = reduce || !phys;
  function intro() {
    if (introduced) return; introduced = true; pulling = true;
    if (MODE === 'gather') tiles.forEach(function (t) { var p = t.body.position; t.body.velocity.set(-p.x * PHY.inward, -p.y * PHY.inward, -p.z * PHY.inward); });
  }
  window.__v7Scene = { intro: intro, ripple: RIPPLE, look: LOOK, uniforms: compositeUniforms, phy: PHY, home: HOME, mode: MODE, tiles: tiles,
    logoZoom: function (dur, from, ease) { if (!centerLogo || !gsap) return; logoSt.zoom = from || 0; gsap.to(logoSt, { zoom: 1, duration: dur, ease: ease || 'expo.out' }); } };

  /* ── 每帧 ── */
  var visible = true, prevTime = 0, t0 = performance.now(), force = CANNON ? new CANNON.Vec3() : null, torque = CANNON ? new CANNON.Vec3() : null, zAxis = CANNON ? new CANNON.Vec3(0, 0, 1) : null, nrm = CANNON ? new CANNON.Vec3() : null;
  function scrollY() { return window.__v7lenis ? window.__v7lenis.animatedScroll : window.scrollY; }
  function stepPhysics(dt, time) {
    var mp = mouse.in ? mouseOnPlane() : null;
    /* 鼠标球：设速度去追鼠标（运动学刚体靠速度撞开别人）；不在首屏时挪到远处 */
    if (mp) { pusher.velocity.set((mp.x - pusher.position.x) / Math.max(dt, 1 / 120), (mp.y - pusher.position.y) / Math.max(dt, 1 / 120), (0 - pusher.position.z) / Math.max(dt, 1 / 120)); var vmax = MODE === 'home' ? HOME.pusherMaxV : PHY.pusherMaxV, vl = pusher.velocity.norm(); if (vl > vmax) pusher.velocity.scale(vmax / vl, pusher.velocity); }
    else { pusher.velocity.set(0, 0, 0); pusher.position.set(0, 0, 60); }
    if (MODE === 'home') { stepHome(mp, time); phys.step(1 / 60, dt, 4); syncMeshes(); return; }
    tiles.forEach(function (t) {
      var b = t.body, p = b.position, s = t.seed;
      if (pulling) {
        var dxy = Math.sqrt(p.x * p.x + p.y * p.y), over = Math.max(0, dxy - PHY.rest);
        var kxy = dxy > .001 ? PHY.pull * over / dxy : 0;
        force.set(-p.x * kxy, -p.y * kxy, -p.z * PHY.pull * PHY.zPull);
        var cap = dxy > PHY.farR ? PHY.farMax : PHY.pullMax, fl = force.norm(); if (fl > cap) force.scale(cap / fl, force);
      } else force.set(0, 0, 0);
      /* 漂浮：慢变的正弦推力和扭矩 */
      force.x += Math.sin(time * .31 + s) * PHY.drift; force.y += Math.cos(time * .27 + s * 1.7) * PHY.drift; force.z += Math.sin(time * .23 + s * 2.3) * PHY.drift * .6;
      if (mp) {
        var dx = p.x - mp.x, dy = p.y - mp.y, dd = Math.sqrt(dx * dx + dy * dy + p.z * p.z);
        if (dd < PHY.repelR && dd > .001) { var k = PHY.repel * Math.pow(1 - dd / PHY.repelR, 2) / dd; force.x += dx * k; force.y += dy * k; force.z += p.z * k * .5; }
      }
      b.force.vadd(force, b.force);
      torque.set(Math.sin(time * .19 + s * 3.1) * PHY.spin, Math.cos(time * .21 + s * .7) * PHY.spin, Math.sin(time * .17 + s * 1.3) * PHY.spin);
      if (pulling && PHY.face > 0) {
        /* 方块本地 z 轴（正面法线）转到世界里，与镜头方向 (0,0,±1) 做叉乘得到回正扭矩；正反面都算正面，取离得近的那个 */
        b.quaternion.vmult(zAxis, nrm);
        var sign = nrm.z >= 0 ? 1 : -1;
        torque.x += (nrm.y * sign) * PHY.face; torque.y += (-nrm.x * sign) * PHY.face;   /* τ = n × (0,0,±1)，把法线转向镜头 */
      }
      b.torque.vadd(torque, b.torque);
    });
    phys.step(1 / 60, dt, 4);
    syncMeshes();
  }
  var eul = CANNON ? new CANNON.Vec3() : null;
  function syncMeshes() {
    tiles.forEach(function (t) {
      var b = t.body;
      t.mesh.position.set(b.position.x * U, b.position.y * U, b.position.z * U);
      t.mesh.quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
      if (t.shadow) {
        /* 投影：原位时 = 稿面偏移；方块浮得越高（z 越大）偏移越远、越大、越淡；沉下去（进场前）则看不见 */
        var z = b.position.z * U, up = Math.max(-200, z);
        b.quaternion.toEuler(eul);
        t.shadow.position.set(t.mesh.position.x + SH.x + up * .35, t.mesh.position.y - SH.y - up * .35, SH.z);
        t.shadow.rotation.z = eul.z;
        t.shadow.scale.set(Math.cos(eul.y) * (1 + Math.max(0, up) * .002), Math.cos(eul.x) * (1 + Math.max(0, up) * .002), 1);
        t.shMat.opacity = Math.max(0, Math.min(1, 1 + z / 300)) * (1 - Math.min(.5, Math.max(0, up) * .004));
      }
    });
  }
  /* 原位版每块受两根弹簧：位置拉回「原位 + 慢漂偏移」，姿态拉回「平放 + 轻微倾斜」；鼠标附近另加排斥 */
  var qTarget = CANNON ? new CANNON.Quaternion() : null, qInv = CANNON ? new CANNON.Quaternion() : null, qErr = CANNON ? new CANNON.Quaternion() : null;
  function stepHome(mp, time) {
    tiles.forEach(function (t) {
      var b = t.body, p = b.position, s = t.seed;
      var tx = t.home.x / U + Math.sin(time * .43 + s) * HOME.floatXY;
      var ty = t.home.y / U + Math.cos(time * .37 + s * 1.9) * HOME.floatXY;
      var tz = Math.sin(time * .51 + s * 2.7) * HOME.floatZ;
      if (pulling) {
        force.set((tx - p.x) * HOME.k, (ty - p.y) * HOME.k, (tz - p.z) * HOME.zk);
        var fl = force.norm(); if (fl > HOME.max) force.scale(HOME.max / fl, force);
      } else force.set(0, 0, 0);
      if (mp) {
        var dx = p.x - mp.x, dy = p.y - mp.y, dd = Math.sqrt(dx * dx + dy * dy + p.z * p.z);
        if (dd < PHY.repelR && dd > .001) { var k = HOME.repel * Math.pow(1 - dd / PHY.repelR, 2) / dd; force.x += dx * k; force.y += dy * k; force.z += (p.z + .4) * k * .6; }
      }
      b.force.vadd(force, b.force);
      /* 姿态误差 = 目标姿态 × 当前姿态的逆，取其虚部作为转轴（小角度近似），乘系数得回正扭矩 */
      qTarget.setFromEuler(Math.sin(time * .29 + s * 1.3) * HOME.tilt, Math.cos(time * .33 + s * 2.1) * HOME.tilt, 0);
      b.quaternion.conjugate(qInv); qTarget.mult(qInv, qErr);
      var sg = qErr.w < 0 ? -1 : 1;
      torque.set(qErr.x * sg * 2 * HOME.rotK, qErr.y * sg * 2 * HOME.rotK, qErr.z * sg * 2 * HOME.rotK);
      if (pulling) b.torque.vadd(torque, b.torque);
    });
  }
  function frame() {
    var now = performance.now(), delta = prevTime ? Math.min(.05, (now - prevTime) / 1000) : 0; prevTime = now;
    var sy = scrollY(), hh = header.offsetHeight, prog = Math.max(0, Math.min(1, sy / hh));
    var show = sy < hh + 4; if (show !== visible) { visible = show; host.style.visibility = show ? '' : 'hidden'; }
    var time = (now - t0) / 1000;
    if (phys && delta > 0) stepPhysics(delta, time);   /* 看不见时也继续算，回到首屏时状态是连续的 */
    if (!visible) return;
    var e = prog * prog * (3 - 2 * prog);
    compositeUniforms.uTime.value = time % 100;

    /* 镜头：滚动首屏时前推 22%、画面后仰 .32 rad */
    world.rotation.x = -.32 * e;
    camera.position.set(0, 0, baseDist * (1 - .22 * e)); camera.lookAt(0, -FH * .08 * e, 0);

    /* 波纹：原组件同一套生长 / 衰减 */
    var growth = reduce ? 0 : 1 - Math.exp(-delta * 1.09);
    var decay = reduce ? 1 : Math.exp((-delta * LIFE_CONSTANT) / Math.max(.15, RIPPLE.fade));
    for (var i = 0; i < MAX_WAVES; i++) {
      var w = waves[i];
      if (w.opacity <= 0) { opacities[i] = 0; continue; }
      w.opacity *= decay; w.scale += (w.target - w.scale) * growth;
      if (w.opacity < .002) { w.opacity = 0; opacities[i] = 0; continue; }
      var half = (w.scale * w.size) / 2;
      offsets[i * 2] = (w.x / width) * 2 - 1; offsets[i * 2 + 1] = (w.y / height) * 2 - 1;
      scales[i * 2] = (half / width) * 2; scales[i * 2 + 1] = (half / height) * 2;
      opacities[i] = w.opacity;
    }
    aOff.needsUpdate = true; aScale.needsUpdate = true; aOp.needsUpdate = true;

    if (centerLogo) {
      var zs = Math.max(.0001, logoSt.zoom);
      centerLogo.scale.setScalar(zs * 380 / window.V7Logo3D.W);
      centerLogo.rotation.set(-.12 + (mouse.in ? (mouse.y / height - .5) * .5 : 0) + Math.sin(time * .6) * .05, time * .5 + (mouse.in ? (mouse.x / width - .5) * .8 : 0), Math.sin(time * .4) * .03);
      centerLogo.position.z = 90 + Math.sin(time * .8) * 10;
      if (centerLogo.userData.shadow) { centerLogo.userData.shadow.material.opacity = Math.min(1, logoSt.zoom) * .9; centerLogo.userData.shadow.scale.setScalar(Math.max(.0001, logoSt.zoom)); }
    }
    renderer.setRenderTarget(sceneRT); renderer.setClearColor(0xf2f2f2, 1); renderer.clear(); renderer.render(scene, camera);
    renderer.setRenderTarget(dispRT); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(waveScene, rawCam);
    renderer.setRenderTarget(null); renderer.clear(); renderer.render(compositeScene, rawCam);
  }
  if (gsap) gsap.ticker.add(frame); else (function loop() { frame(); requestAnimationFrame(loop); })();
})();

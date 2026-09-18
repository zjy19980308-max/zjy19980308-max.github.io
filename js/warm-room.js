/* warm-room.js —— 首页大字过渡屏（#workStatement）的背景：暖色 3D 房间，阳光从后墙三扇拱窗洒进来。维护：网站交互调整。
   owner 2026-09-15：「这一屏搭一个暖色的 3D 场景，有阳光洒进来」。原站这一屏是作者自己的书房 3D 场景，不拿、不仿形；
   房间、窗、陈设沿用本会话早先自建的暖色房间（_废弃/张竞元作品集-v7-首屏暖色房间/scene.js），这里改成：
   · 太阳放到后墙外、高处，透过拱窗在地板上投出窗格光斑（后墙投影，窗洞漏光）；
   · 沿日光方向加几道空气光柱 + 光柱里缓慢漂浮的尘埃；
   · 房间正中立 owner 的金色 3D logo（Figma 1079:2599）在石台上慢转，接住阳光；
   · 镜头随这一屏的滚动进度缓慢前推、微升，鼠标轻微视差；只在这一屏可见时渲染。
   依赖 three r185（window.THREE）、RoomEnvironment、logo3d.js。 */
(function () {
  'use strict';
  var THREE = window.THREE; if (!THREE) return;
  var block = document.getElementById('workStatement'); if (!block) return;
  var host = document.createElement('div'); host.className = 'statementBlock__bg'; host.setAttribute('aria-hidden', 'true');
  var stick = document.createElement('div'); stick.className = 'statementBlock__stick'; host.appendChild(stick);
  block.insertBefore(host, block.firstChild);
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { block.classList.add('is-fallback'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stick.appendChild(renderer.domElement);

  var C = { wall: 0xe9d9c5, wallShade: 0xcdb398, frame: 0xa9825f, floor: 0xcfab86, plinth: 0xe8d9c6, clay: 0xf0e4d4, stone: 0xddcdb8, yellow: 0xf2d53c, wood: 0x9f7755 };
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(C.wall);
  scene.fog = new THREE.Fog(0xd9bf9f, 18, 38);
  var camera = new THREE.PerspectiveCamera(38, 1, .1, 80);

  var pmrem = new THREE.PMREMGenerator(renderer);
  if (THREE.RoomEnvironment) { scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), .04).texture; scene.environmentIntensity = .2; }
  scene.add(new THREE.HemisphereLight(0xffeedd, 0xa87e56, .55));
  /* 太阳在后墙外高处，斜着往屋里照：后墙挡光，只有窗洞漏进来，地板上落下拱窗形的光斑 */
  var sun = new THREE.DirectionalLight(0xffd2a0, 7.5);
  sun.position.set(-7, 11, -18); sun.target.position.set(1.5, 0, 4);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  var sc = sun.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 60;
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .03; sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  var fill = new THREE.PointLight(0xffe0bd, 7, 24, 1.6); fill.position.set(2, 4.8, 7); scene.add(fill);
  var bounce = new THREE.PointLight(0xffc98e, 5, 12, 1.8); bounce.position.set(0, .6, 2); scene.add(bounce);   /* 地上光斑反上来的暖光 */

  function mat(color, rough) { return new THREE.MeshStandardMaterial({ color: color, roughness: rough == null ? .92 : rough, metalness: 0 }); }
  function shadowy(m) { m.castShadow = true; m.receiveShadow = true; return m; }

  /* ── 房间：宽 18、深 16、高 7.6；后墙 z = -4.5，三扇拱窗是墙上的洞，窗外一块天空 ── */
  var W = 18, H = 7.6, BACK = -4.5;
  var floorMat = mat(C.floor, .8);
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(W, 22), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.z = 4; floor.receiveShadow = true; scene.add(floor);
  /* 木地板缝：一张画布纹理，人字拼太抢，这里用长条错缝 */
  (function () {
    var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1024; var g = cv.getContext('2d');
    g.fillStyle = '#cfab86'; g.fillRect(0, 0, 1024, 1024);
    for (var r = 0; r < 16; r++) {
      var y = r * 64, off = (r % 2) * 180;
      for (var x = -off; x < 1024; x += 360) {
        var t = .9 + Math.random() * .16; g.fillStyle = 'rgba(' + Math.round(207 * t) + ',' + Math.round(171 * t) + ',' + Math.round(134 * t) + ',1)'; g.fillRect(x + 1, y + 1, 358, 62);
      }
      g.fillStyle = 'rgba(120,88,60,.28)'; g.fillRect(0, y, 1024, 1.5);
    }
    var tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(3, 3.6); tx.anisotropy = 8;
    floorMat.map = tx; floorMat.color.set(0xffffff); floorMat.needsUpdate = true;
  })();

  var WIN = [-5.2, 0, 5.2], WW = 3.3, WY = 1.05, WH = 3.4, WR = WW / 2;
  var wallShape = new THREE.Shape();
  wallShape.moveTo(-W / 2, 0); wallShape.lineTo(W / 2, 0); wallShape.lineTo(W / 2, H); wallShape.lineTo(-W / 2, H); wallShape.lineTo(-W / 2, 0);
  WIN.forEach(function (cx) {
    var h = new THREE.Path();
    h.moveTo(cx - WR, WY); h.lineTo(cx + WR, WY); h.lineTo(cx + WR, WY + WH);
    h.absarc(cx, WY + WH, WR, 0, Math.PI, false); h.lineTo(cx - WR, WY);
    wallShape.holes.push(h);
  });
  var back = shadowy(new THREE.Mesh(new THREE.ExtrudeGeometry(wallShape, { depth: .45, bevelEnabled: false, curveSegments: 40 }), mat(C.wall)));
  back.position.z = BACK - .45; scene.add(back);
  /* 侧墙 + 天花 */
  var side = new THREE.PlaneGeometry(22, H);
  var lw = new THREE.Mesh(side, mat(C.wallShade)); lw.receiveShadow = true;   /* 左墙不挡光，让日光进屋 */ lw.rotation.y = Math.PI / 2; lw.position.set(-W / 2, H / 2, 6.5); scene.add(lw);
  var rw = shadowy(new THREE.Mesh(side, mat(C.wallShade))); rw.rotation.y = -Math.PI / 2; rw.position.set(W / 2, H / 2, 6.5); scene.add(rw);
  var ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, 22), mat(0xe6d6c2)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, 6.5); scene.add(ceil);
  /* 踢脚线 */
  var skirt = shadowy(new THREE.Mesh(new THREE.BoxGeometry(W, .28, .08), mat(0xdccfbe))); skirt.position.set(0, .14, BACK + .04); scene.add(skirt);

  /* 窗框：外圈拱形 + 一根竖梃 + 两根横梃 */
  var frameMat = mat(C.frame, .7);
  WIN.forEach(function (cx) {
    var outer = new THREE.Shape(), inner = new THREE.Path(), t = .12;
    outer.moveTo(cx - WR, WY); outer.lineTo(cx + WR, WY); outer.lineTo(cx + WR, WY + WH); outer.absarc(cx, WY + WH, WR, 0, Math.PI, false); outer.lineTo(cx - WR, WY);
    inner.moveTo(cx - WR + t, WY + t); inner.lineTo(cx + WR - t, WY + t); inner.lineTo(cx + WR - t, WY + WH); inner.absarc(cx, WY + WH, WR - t, 0, Math.PI, false); inner.lineTo(cx - WR + t, WY + t);
    outer.holes.push(inner);
    var fr = shadowy(new THREE.Mesh(new THREE.ExtrudeGeometry(outer, { depth: .16, bevelEnabled: false, curveSegments: 40 }), frameMat)); fr.position.z = BACK - .3; scene.add(fr);
    var v = shadowy(new THREE.Mesh(new THREE.BoxGeometry(.07, WH + WR - .1, .08), frameMat)); v.position.set(cx, WY + (WH + WR) / 2, BACK - .22); scene.add(v);
    [WY + WH * .36, WY + WH * .72].forEach(function (y) { var hb = shadowy(new THREE.Mesh(new THREE.BoxGeometry(WW - .2, .07, .08), frameMat)); hb.position.set(cx, y, BACK - .22); scene.add(hb); });
    var sill = shadowy(new THREE.Mesh(new THREE.BoxGeometry(WW + .5, .1, .5), mat(0xe6d9c8))); sill.position.set(cx, WY - .05, BACK + .05); scene.add(sill);
  });

  /* 窗外天空：渐变 + 几团柔云（自发光，不受室内光影响） */
  (function () {
    var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512; var g = cv.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#9dbccd'); gr.addColorStop(.6, '#bcd2dc'); gr.addColorStop(1, '#e2e4de'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    function cloud(x, y, s) { for (var k = 0; k < 9; k++) { var rx = x + (Math.random() - .5) * 170 * s, ry = y + (Math.random() - .5) * 42 * s, rr = (38 + Math.random() * 46) * s; var cg = g.createRadialGradient(rx, ry, 0, rx, ry, rr); cg.addColorStop(0, 'rgba(246,240,231,.95)'); cg.addColorStop(.62, 'rgba(242,235,226,.72)'); cg.addColorStop(1, 'rgba(240,234,226,0)'); g.fillStyle = cg; g.beginPath(); g.arc(rx, ry, rr, 0, Math.PI * 2); g.fill(); } }
    cloud(170, 330, 1.2); cloud(520, 250, .9); cloud(820, 360, 1.3); cloud(380, 430, 1); cloud(700, 140, .7); cloud(960, 220, .8);
    var tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
    var sky = new THREE.Mesh(new THREE.PlaneGeometry(34, 17), new THREE.MeshBasicMaterial({ map: tx, fog: false }));
    sky.position.set(0, 5.2, BACK - 7); scene.add(sky);
  })();

  /* ── 圆角方块（软陶质感）：圆角矩形截面挤出 + 倒角 ── */
  function rbox(w, h, d, r) {
    var s = new THREE.Shape(), x = -w / 2 + r, y = -d / 2 + r, iw = w - 2 * r, id = d - 2 * r;
    s.moveTo(x, y - r + r); s.lineTo(x + iw, y); s.lineTo(x + iw, y + id); s.lineTo(x, y + id); s.lineTo(x, y);
    var g = new THREE.ExtrudeGeometry(s, { depth: Math.max(.001, h - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 6, curveSegments: 8 });
    g.rotateX(-Math.PI / 2); g.computeBoundingBox(); var bb = g.boundingBox; g.translate(0, -bb.min.y, -(bb.max.z + bb.min.z) / 2); g.computeVertexNormals();
    return g;
  }


  /* ── 主体：石台 + 金色 logo（owner 的 Figma logo 3D 版），慢转，接住阳光 ── */
  var hero = new THREE.Group(); hero.position.set(.2, 0, .4); scene.add(hero);
  var plinth = shadowy(new THREE.Mesh(rbox(2.2, 1.1, 2.2, .06), mat(C.plinth, .9))); hero.add(plinth);
  var logo = null;
  if (window.V7Logo3D) {
    logo = window.V7Logo3D.create({ size: 1.9, depth: .22, bevel: .045, material: new THREE.MeshStandardMaterial({ color: 0xDAAB00, metalness: .55, roughness: .3, envMapIntensity: 1.6 }) });
    logo.position.y = 2.25; logo.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); hero.add(logo);
  }

  /* ── 陈设：两只基座 + 低多边形石块、一张木凳、一张长桌 ── */
  function pedestal(x, z, w, h, top) {
    var p = shadowy(new THREE.Mesh(rbox(w, h, w, .03), mat(C.plinth, .9))); p.position.set(x, 0, z); scene.add(p);
    top.position.set(x, h + .36, z); scene.add(shadowy(top));
  }
  var rock1 = new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 0), mat(C.stone, .95)); rock1.material.flatShading = true; rock1.rotation.set(.4, .7, .2);
  pedestal(-4.3, 1.2, 1.25, 2.1, rock1);
  var rock2 = new THREE.Mesh(new THREE.OctahedronGeometry(.46, 0), mat(0xe9dfd2, .95)); rock2.material.flatShading = true; rock2.scale.set(1, 1.25, .9); rock2.rotation.set(.2, .5, .1);
  pedestal(4.6, .4, 1.1, 2.5, rock2);
  (function stool(x, z) {
    var g = new THREE.Group(), wd = mat(C.wood, .75);
    var seat = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .08, 40), wd)); seat.position.y = 1.55; g.add(seat);
    for (var k = 0; k < 3; k++) { var a = k / 3 * Math.PI * 2, leg = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(.03, .04, 1.62, 10), wd)); leg.position.set(Math.cos(a) * .3, .78, Math.sin(a) * .3); leg.rotation.z = Math.cos(a) * .12; leg.rotation.x = -Math.sin(a) * .12; g.add(leg); }
    var ring = shadowy(new THREE.Mesh(new THREE.TorusGeometry(.33, .02, 8, 40), wd)); ring.rotation.x = Math.PI / 2; ring.position.y = .55; g.add(ring);
    g.position.set(x, 0, z); scene.add(g);
  })(-6.4, 2.6);
  (function table(x, z) {
    var g = new THREE.Group(), wd = mat(C.wood, .75);
    var top = shadowy(new THREE.Mesh(new THREE.BoxGeometry(2.6, .1, 1), wd)); top.position.y = 1.65; g.add(top);
    [[-1.2, -.42], [1.2, -.42], [-1.2, .42], [1.2, .42]].forEach(function (p) { var l = shadowy(new THREE.Mesh(new THREE.BoxGeometry(.08, 1.6, .08), wd)); l.position.set(p[0], .8, p[1]); g.add(l); });
    var bowl = shadowy(new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xd9c9b5, .85))); bowl.rotation.x = Math.PI; bowl.position.set(-.6, 1.92, 0); g.add(bowl);
    g.position.set(x, 0, z); scene.add(g);
  })(6.6, -2.2);


  /* ── 光柱：沿日光方向的半透明加色长条，从每扇窗斜向地面 ── */
  var dir = new THREE.Vector3().subVectors(sun.target.position, sun.position).normalize();
  var shafts = [];
  (function () {
    var cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; var g = cv.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,232,196,.0)'); gr.addColorStop(.18, 'rgba(255,232,196,.75)'); gr.addColorStop(1, 'rgba(255,232,196,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
    var hg = g.createLinearGradient(0, 0, 64, 0); hg.addColorStop(0, 'rgba(0,0,0,1)'); hg.addColorStop(.5, 'rgba(0,0,0,0)'); hg.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = hg; g.fillRect(0, 0, 64, 256);
    var tx = new THREE.CanvasTexture(cv);
    WIN.forEach(function (cx, k) {
      var len = 13, m = new THREE.Mesh(new THREE.PlaneGeometry(WW * .95, len), new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide }));
      var start = new THREE.Vector3(cx, WY + WH * .7, BACK);
      m.position.copy(start).addScaledVector(dir, len / 2);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);   /* 平面长边沿光线方向 */
      m.rotateY(.35);
      scene.add(m); shafts.push({ m: m, base: .2 - k * .03, k: k });
    });
  })();

  /* ── 尘埃：光柱范围里缓慢飘的小亮点 ── */
  var DUST = 260, dustGeo = new THREE.BufferGeometry(), dpos = new Float32Array(DUST * 3), dseed = new Float32Array(DUST);
  for (var i = 0; i < DUST; i++) {
    var t = Math.random() * 11, w = WIN[i % 3];
    dpos[i * 3] = w + dir.x * t + (Math.random() - .5) * 2.6; dpos[i * 3 + 1] = WY + WH * .7 + dir.y * t + (Math.random() - .5) * 1.2; dpos[i * 3 + 2] = BACK + dir.z * t + (Math.random() - .5) * 1.4;
    dseed[i] = Math.random() * 100;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  var dustBase = dpos.slice();
  var dotCv = document.createElement('canvas'); dotCv.width = dotCv.height = 32; var dg = dotCv.getContext('2d'); var rg = dg.createRadialGradient(16, 16, 0, 16, 16, 16); rg.addColorStop(0, 'rgba(255,240,215,1)'); rg.addColorStop(1, 'rgba(255,240,215,0)'); dg.fillStyle = rg; dg.fillRect(0, 0, 32, 32);
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: .06, map: new THREE.CanvasTexture(dotCv), transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  scene.add(dust);

  /* ── 镜头：这一屏的滚动进度 p 驱动（进屏 0 → 离屏 1），缓慢前推、微升；鼠标轻微视差 ── */
  var mx = 0, my = 0, smx = 0, smy = 0;
  addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  function size() {
    var w = innerWidth, h = innerHeight; renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w / h < 1 ? 56 : 40; camera.updateProjectionMatrix();
  }
  size(); addEventListener('resize', size);

  var t0 = performance.now(), frames = 0;
  function render(now) {
    var r = block.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -40 || r.top > vh + 40) return;
    var p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
    var e = p * p * (3 - 2 * p);
    smx += (mx - smx) * .05; smy += (my - smy) * .05;
    camera.position.set(-.6 + e * 1.2 + smx * .4, 2.1 + e * .9 - smy * .15, 12.5 - e * 4.2);
    camera.lookAt(smx * .15 + .3, 2.4 + e * .3, -1);
    var t = (now - t0) / 1000;
    if (!reduce) {
      if (logo) { logo.rotation.y = t * .35; logo.position.y = 2.25 + Math.sin(t * .9) * .05; }
      shafts.forEach(function (s) { s.m.material.opacity = s.base * (.85 + .15 * Math.sin(t * .6 + s.k * 1.7)); });
      var arr = dustGeo.attributes.position.array;
      for (var i = 0; i < DUST; i++) {
        var sd = dseed[i];
        arr[i * 3] = dustBase[i * 3] + Math.sin(t * .13 + sd) * .35;
        arr[i * 3 + 1] = dustBase[i * 3 + 1] + Math.sin(t * .09 + sd * 1.3) * .28;
        arr[i * 3 + 2] = dustBase[i * 3 + 2] + Math.cos(t * .11 + sd * .7) * .3;
      }
      dustGeo.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera); frames++;
  }
  if (window.gsap) window.gsap.ticker.add(function () { render(performance.now()); });
  else (function loop(n) { render(n); requestAnimationFrame(loop); })(performance.now());
  window.__v7room = { scene: scene, camera: camera, sun: sun, frames: function () { return frames; } };
})();

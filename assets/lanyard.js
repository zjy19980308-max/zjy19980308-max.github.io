/* ═══════════════════════════════════════════════════════════════
   lanyard.js —— 可拖拽的挂绳工牌

   移植自 React Bits 的 Lanyard。原组件依赖 5 个包：
   @react-three/fiber / drei / rapier / meshline / three，
   还要一个 card.glb 模型和一张 lanyard.png 贴图。
   这个作品集是纯静态页、没有构建流程，前四个都用不了，
   模型和贴图也不在手上。所以：

     rapier（物理）    → verlet 绳 + 一根复摆（下面 stepPhysics）
     meshline（带子）  → 切线 × 视线得到侧向量，拼永远正对镜头的带面
     card.glb（模型）  → ExtrudeGeometry 倒角卡体 + 扣环 + 夹子
     drei Environment  → PMREMGenerator.fromScene，见 buildEnv
     fiber / drei      → 直接用已经打包好的 three.bundle.js

   ★ 为什么之前「怎么调都不像参考稿」
     参考稿的 <Environment> 里包着 4 个 <Lightformer>：三条
     100×0.1 的细长条 + 一块 100×10 的大板，都绕 Z 转了 60°。
     卡面上那几道斜着扫过去的白光条，就是 clearcoat 反射它们。
     没有环境贴图时：
       · clearcoat 只能反射点光源 —— 一个针尖大的高光点，不是光条
       · metalness 0.8 直接变全黑（金属没有漫反射，只有反射）
     所以参考稿的材质参数必须连同环境一起搬，单抄数字只会更糟。
     buildEnv() 就是把那 4 个 Lightformer 原样重建再过 PMREM。

   用法：
     <script src="assets/vendor/three.bundle.js"></script>
     <script src="assets/lanyard.js"></script>
     <script>Lanyard.mount('#lanyard', {…});</script>
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function capable() {
    var mq = function (q) { return root.matchMedia && matchMedia(q).matches; };
    return !(
      mq('(prefers-reduced-motion: reduce)') ||
      innerWidth < 900 ||
      (navigator.hardwareConcurrency || 8) <= 4 ||
      (navigator.deviceMemory || 8) <= 4 ||
      !!(navigator.connection && navigator.connection.saveData)
    );
  }

  var instances = [];

  /* 卡面画布基准。世界尺寸按同一比例推，改一处两边一起动。 */
  var FW = 620, FH = 940;
  /* 二维码在卡面上的位置（画布像素），单独做一张贴图 —— 见下面注释 */
  var QSZ = 420, QX = (FW - QSZ) / 2, QY = 300;   /* 真码 37×37 比占位的 25×25 密，
     必须给足屏幕像素：每模块低于 4px 扫不出来。420/620 = 卡宽的 68%。 */

  /* ── 环境贴图：复刻参考稿 <Environment blur={0.75}> 的 4 个 Lightformer ──
     drei 的 <Lightformer> = 一个 PlaneGeometry + MeshBasicMaterial，
     material.color 先取 color 再 multiplyScalar(intensity)，toneMapped=false。
     照这个重建，再交给 PMREMGenerator.fromScene(scene, 0.75) 生成
     和 blur={0.75} 一致的辐照度贴图。 */
  function buildEnv(renderer) {
    var es = new THREE.Scene();
    function lf(intensity, px, py, pz, rx, ry, rz, sx, sy) {
      var m = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false })
      );
      m.material.color.setRGB(1, 1, 1).multiplyScalar(intensity);
      m.position.set(px, py, pz);
      m.rotation.set(rx, ry, rz);
      m.scale.set(sx, sy, 1);
      es.add(m);
    }
    var P3 = Math.PI / 3;
    lf(2,    0, -1,  5,  0, 0,           P3, 100, 0.1);
    lf(3,   -1, -1,  1,  0, 0,           P3, 100, 0.1);
    lf(3,    1,  1,  1,  0, 0,           P3, 100, 0.1);
    lf(10, -10,  0, 14,  0, Math.PI / 2, P3, 100, 10);

    var pm = new THREE.PMREMGenerator(renderer);
    var rt = pm.fromScene(es, 0.75);
    pm.dispose();
    es.traverse(function (n) {
      if (n.geometry) n.geometry.dispose();
      if (n.material) n.material.dispose();
    });
    return rt.texture;
  }

  /* ── 圆角矩形 Shape，给 ExtrudeGeometry 用 ── */
  function roundedRect(w, h, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);   s.quadraticCurveTo(x + w, y,         x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h,   x + w - r, y + h);
    s.lineTo(x + r, y + h);   s.quadraticCurveTo(x, y + h,         x, y + h - r);
    s.lineTo(x, y + r);       s.quadraticCurveTo(x, y,             x + r, y);
    return s;
  }

  /* ShapeGeometry / ExtrudeGeometry 的默认 UV 生成器用的是形状坐标本身，
     不是 0~1。贴图要对得上就得按包围盒重新归一化。 */
  function planarUV(geo) {
    geo.computeBoundingBox();
    var b = geo.boundingBox, p = geo.attributes.position;
    var w = b.max.x - b.min.x, h = b.max.y - b.min.y;
    var uv = new Float32Array(p.count * 2);
    for (var i = 0; i < p.count; i++) {
      uv[i * 2]     = (p.getX(i) - b.min.x) / w;
      uv[i * 2 + 1] = (p.getY(i) - b.min.y) / h;
    }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return geo;
  }

  function makeFace() {
    var S = 2, cv = document.createElement('canvas');
    cv.width = FW * S; cv.height = FH * S;
    var g = cv.getContext('2d'); g.scale(S, S);
    return { canvas: cv, ctx: g };
  }

  function cardBg(g) {
    g.fillStyle = '#F4F4F7'; g.fillRect(0, 0, FW, FH);
    var gr = g.createLinearGradient(0, 0, FW, FH);
    gr.addColorStop(0, 'rgba(255,255,255,.98)');
    gr.addColorStop(1, 'rgba(232,232,242,.45)');
    g.fillStyle = gr; g.fillRect(0, 0, FW, FH);
  }

  function logo(g, o, cx, cy, h) {
    if (!o.logoPath) return;
    g.save();
    var k = h / 149.866;                    /* logo.svg 的 viewBox 高 */
    g.translate(cx - (h / 2), cy); g.scale(k, k);
    g.fillStyle = '#0E0E14';
    try { g.fill(new Path2D(o.logoPath)); } catch (e) {}
    g.restore();
  }

  /* 正面：标志 + 名字 + 二维码位（白底留给单独那张贴图）+ 角色 */
  function drawFront(g, o) {
    cardBg(g);
    logo(g, o, FW / 2, 100, 54);

    g.textAlign = 'center';
    g.fillStyle = '#0E0E14';
    g.font = '600 72px "Bricolage Grotesque","PingFang SC",system-ui,sans-serif';
    g.fillText(o.name || '张竞元', FW / 2, 244);

    /* 二维码底板。码本身是另一张会动的贴图，压在这块白底上。 */
    g.fillStyle = '#FFFFFF';
    g.beginPath(); g.roundRect(QX - 18, QY - 18, QSZ + 36, QSZ + 36, 16); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.09)'; g.lineWidth = 1; g.stroke();

    /* 这几行原来是 #6E6E80 / #9A9AAC —— 在渲染出来的卡上几乎看不见。
       卡片在页面里只有 ~250px 高，620px 画布上的 24px 字落地不到 10px，
       再被覆膜高光一冲就没了。所以加深加大。 */
    g.fillStyle = '#2E2E3C';
    g.font = '500 30px "PingFang SC",system-ui,sans-serif';
    g.fillText(o.role || 'AI 产品设计师', FW / 2, 790);

    g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(130, 826); g.lineTo(FW - 130, 826); g.stroke();

    g.fillStyle = '#5A5A6C';
    g.font = '500 22px "JetBrains Mono",ui-monospace,monospace';
    g.fillText('PORTFOLIO · 2026 · BEIJING', FW / 2, 888);
  }

  /* 背面：参考稿的 card.glb 正反两面走同一张图集的左右半边，
     所以卡是有背面的。翻过去要有东西看，否则「翻页」没有意义。 */
  function drawBack(g, o) {
    cardBg(g);
    g.textAlign = 'center';
    logo(g, o, FW / 2, 250, 150);

    g.fillStyle = '#0E0E14';
    g.font = '600 52px "Bricolage Grotesque","PingFang SC",system-ui,sans-serif';
    g.fillText(o.name || '张竞元', FW / 2, 560);

    g.fillStyle = '#2E2E3C';
    g.font = '500 30px "PingFang SC",system-ui,sans-serif';
    g.fillText(o.role || 'AI 产品设计师', FW / 2, 608);

    g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(150, 660); g.lineTo(FW - 150, 660); g.stroke();

    g.fillStyle = '#5A5A6C';
    g.font = '500 21px "JetBrains Mono",ui-monospace,monospace';
    g.fillText('ZHANG JINGYUAN', FW / 2, 708);
    g.fillText('PORTFOLIO · 2026 · BEIJING', FW / 2, 866);
  }

  /* ── 挂绳织带贴图 ────────────────────────────────────────
     参考稿是一张 lanyard.png，repeat=[-4,1] 沿带长重复。
     手上没有那张图，就按织带的样子画一个可无缝平铺的单元：
     字宽先量再定字号，保证整数个单元正好铺满画布宽度，接缝处对得上。 */
  function makeStrapTex() {
    var W = 512, H = 64, REP = 2;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var g = cv.getContext('2d');

    g.fillStyle = '#15151E'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.06)';
    g.fillRect(0, 7, W, 1); g.fillRect(0, H - 8, W, 1);

    var unit = 'ZHANG JINGYUAN · AI PRODUCT DESIGNER · ';
    var base = 20;
    g.font = '600 ' + base + 'px "JetBrains Mono",ui-monospace,monospace';
    var wpx = g.measureText(unit).width || 1;
    var size = base * (W / REP) / wpx;      /* 缩到正好 W/REP，接缝无错位 */
    g.font = '600 ' + size.toFixed(2) + 'px "JetBrains Mono",ui-monospace,monospace';
    g.textBaseline = 'middle';
    g.fillStyle = 'rgba(181,180,237,.78)';
    for (var i = 0; i < REP; i++) g.fillText(unit, i * (W / REP), H / 2);

    var t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(4, 1);
    t.anisotropy = 8;
    return t;
  }

  function mount(hostSel, opt) {
    var host = typeof hostSel === 'string' ? document.querySelector(hostSel) : hostSel;
    if (!host || typeof THREE === 'undefined') return null;
    opt = opt || {};
    if (opt.gate !== false && !capable()) return null;

    var o = {
      name: opt.name || '张竞元',
      role: opt.role || 'AI 产品设计师',
      logoPath: opt.logoPath || '',
      /* 尺寸按可视范围反推，见下面 CH/anchorY 处的注释 */
      segments: opt.segments || 11,
      segLen:   opt.segLen   != null ? opt.segLen   : 0.50,
      anchorY:  opt.anchorY  != null ? opt.anchorY  : 6.9,
      cardH:    opt.cardH    != null ? opt.cardH    : 5.4,
      gravity:  opt.gravity  != null ? opt.gravity  : -26,
      damping:  opt.damping  != null ? opt.damping  : 0.972,
      iterations: opt.iterations != null ? opt.iterations : 9,   /* 14 太刚，绳子像铁丝 */
      spin:     opt.spin     != null ? opt.spin     : 2.6,
      /* 余量「上限」和「软硬」必须是两个数。写成同一个 0.35 时，
         余量小 ⇒ 建立也快：实测光标拉到 6 之后卡片就锁死在 5.35，
         再拖到 14 也纹丝不动 —— 这就是「拉力太紧」。
         上限由画面边界反推：锚点 − 绳长 − (挂点 3.29 + 卡半高 2.70) ≥ −5.10。
         锚点 6.6 时余量只能给 0.71，实测拉到底剩 0.03 —— 太贴边。
         锚点抬到 6.9（本来就在画面外），换来 0.3 的下行余地。
         软硬单列，K 越大阻力建立得越慢、手感越松。 */
      stretch:  opt.stretch  != null ? opt.stretch  : 0.65,  /* 余量上限 */
      give:     opt.give     != null ? opt.give     : 2.2,   /* 软硬：越大越松 */
    };

    var cvs = document.createElement('canvas');
    cvs.className = 'lanyard-canvas';
    host.appendChild(cvs);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
    } catch (e) { cvs.remove(); return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;   /* R3F 的默认值 */
    renderer.toneMappingExposure = 1.0;

    var scene = new THREE.Scene();
    /* 参考稿 camera={{position:[0,0,30], fov:20}} —— 长焦，卡面几乎不透视变形。
       这里画布是宽扁的一条，把镜头再收一点让卡占满高度。 */
    var cam = new THREE.PerspectiveCamera(24, 1, 0.1, 200);
    cam.position.set(0, 0, 24);

    var envTex = null;
    try { envTex = buildEnv(renderer); scene.environment = envTex; } catch (e) {}
    /* 参考稿是 ambientLight intensity={Math.PI}。但那份场景的漫射几乎全靠它，
       这里 PMREM 环境已经在供漫射了，再叠一个 π 等于重复计一遍，
       结果就是整张卡发飘、小字看不清。 */
    scene.add(new THREE.AmbientLight(0xffffff, 1.15));

    /* ── 绳子：verlet 质点 ──────────────────────────────────
       绳长按可视范围反推，不是拍的：
       fov 24 / z 24 ⇒ z=0 平面可视半高 ±5.10。
       卡高 5.40（半高 2.70），挂点到卡心 3.29。

       ★ 锚点故意放在画面外（6.6 > 5.10）。
         先前锚点压在顶边 5.0、绳长只能给 3.4，卡片一大就几乎拉不动。
         把锚点抬出画面、绳长放到 5.0，静止位置一模一样
         （6.6-5.0 = 5.0-3.4 = 1.6），可动范围却多了 47%，
         而且带子从顶边外进来，正是参考稿的样子。 */
    var N = o.segments, SEG = o.segLen, TOP = o.anchorY;
    var pos = [], old = [];
    for (var i = 0; i < N; i++) {
      pos.push(new THREE.Vector3(0, TOP - i * SEG, 0));
      old.push(pos[i].clone());
    }
    var anchor = pos[0].clone();

    /* ── 带子：扁平织带，不是细管 ──────────────────────────
       meshline 的原理：沿曲线取切线，与视线方向叉乘得到侧向量，
       每个采样点左右各推半个带宽，拼成永远正对镜头的带面。
       材质跟参考稿一样是不受光的（MeshLineMaterial 本身就是 basic），
       depthTest:false 让它始终压在卡片上，穿过扣环时不会被切断。 */
    var curve = new THREE.CatmullRomCurve3(pos.slice(), false, 'catmullrom', 0.5);
    var BAND_W = 0.40, BAND_SEG = 64;   /* 半宽。参考稿带宽≈卡宽的 1/4 */
    var strapTex = makeStrapTex();
    var bandMat = new THREE.MeshBasicMaterial({
      map: strapTex, side: THREE.DoubleSide, depthTest: false, toneMapped: false
    });
    var bandGeo = new THREE.BufferGeometry();
    var bandPos = new Float32Array((BAND_SEG + 1) * 2 * 3);
    var bandUv  = new Float32Array((BAND_SEG + 1) * 2 * 2);
    var bandIdx = [];
    for (var bi = 0; bi < BAND_SEG; bi++) {
      var a0 = bi * 2;
      bandIdx.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2);
    }
    bandGeo.setAttribute('position', new THREE.BufferAttribute(bandPos, 3));
    bandGeo.setAttribute('uv', new THREE.BufferAttribute(bandUv, 2));
    bandGeo.setIndex(bandIdx);
    var band = new THREE.Mesh(bandGeo, bandMat);
    band.renderOrder = 10;
    band.frustumCulled = false;
    scene.add(band);

    var _t = new THREE.Vector3(), _s = new THREE.Vector3(), _v = new THREE.Vector3();
    function rebuildBand() {
      curve.points = pos;
      var pts = curve.getPoints(BAND_SEG);
      for (var i = 0; i <= BAND_SEG; i++) {
        var p = pts[i];
        var q = pts[Math.min(i + 1, BAND_SEG)], r = pts[Math.max(i - 1, 0)];
        _t.copy(q).sub(r);
        if (_t.lengthSq() < 1e-9) _t.set(0, -1, 0); else _t.normalize();
        _v.copy(cam.position).sub(p).normalize();
        _s.crossVectors(_t, _v);
        if (_s.lengthSq() < 1e-9) _s.set(1, 0, 0); else _s.normalize();
        var o3 = i * 6, o2 = i * 4, u = i / BAND_SEG;
        bandPos[o3]     = p.x - _s.x * BAND_W; bandPos[o3 + 1] = p.y - _s.y * BAND_W; bandPos[o3 + 2] = p.z - _s.z * BAND_W;
        bandPos[o3 + 3] = p.x + _s.x * BAND_W; bandPos[o3 + 4] = p.y + _s.y * BAND_W; bandPos[o3 + 5] = p.z + _s.z * BAND_W;
        /* 长度方向走 U，织带贴图才能沿带长平铺（参考稿 repeat=[-4,1] 同理） */
        bandUv[o2] = u; bandUv[o2 + 1] = 0;
        bandUv[o2 + 2] = u; bandUv[o2 + 3] = 1;
      }
      bandGeo.attributes.position.needsUpdate = true;
      bandGeo.attributes.uv.needsUpdate = true;
      bandGeo.computeBoundingSphere();
    }

    /* ── 工牌本体 ────────────────────────────────────────────
       group 的原点放在扣环，不是卡心 —— 参考稿的
       useSphericalJoint(j3, card, [[0,0,0],[0,1.5,0]]) 就是把关节
       挂在卡心上方 1.5。支点错了摆动就不对。 */
    var CH = o.cardH, CW = CH * FW / FH;
    var TH = 0.10, BT = 0.03, BS = 0.035;      /* 厚度 / 倒角厚 / 倒角宽 */
    var HANG = CH / 2 + 0.59;                  /* 扣环 → 卡心 */
    var FZ = TH / 2 + BT + 0.002;              /* 倒角后的正面在这个 z */

    var badge = new THREE.Group();
    scene.add(badge);

    var bodyGeo = new THREE.ExtrudeGeometry(roundedRect(CW, CH, 0.20), {
      depth: TH, bevelEnabled: true, bevelThickness: BT, bevelSize: BS,
      bevelSegments: 3, curveSegments: 14
    });
    bodyGeo.translate(0, 0, -TH / 2);
    var edgeMat = new THREE.MeshPhysicalMaterial({
      color: 0xe4e4ec, roughness: 0.5, metalness: 0.14,
      clearcoat: 1, clearcoatRoughness: 0.15, envMapIntensity: 1.15
    });
    var body = new THREE.Mesh(bodyGeo, edgeMat);
    body.position.y = -HANG;
    badge.add(body);

    /* 正反两面各一张贴图。参考稿的 metalness 0.8 / roughness 0.9 是
       「粗糙金属」——反照率被完整保留成反射率，黑字仍然是黑的，
       白底则变成一片被环境照亮的漫反射高光。有环境贴图才成立。 */
    var fFace = makeFace(), bFace = makeFace();
    drawFront(fFace.ctx, o); drawBack(bFace.ctx, o);
    function faceTex(f) {
      var t = new THREE.CanvasTexture(f.canvas);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16;
      return t;
    }
    function faceMat(t) {
      /* 参考稿是 roughness 0.9 / metalness 0.8 / clearcoat 1 —— 那是配它
         那张深色卡图的。搬到「白底 + 细字 + 二维码」上有两个坑：
           · metalness 0.8 砍掉 80% 漫反射，整张卡压成灰的；
           · clearcoat 1 配强环境，会在全卡面加一层近似恒定的高光，
             把黑抬向白 —— 小字和二维码直接被冲没。
         所以覆膜光泽保留但收住：clearcoat 给 0.35，环境强度给 0.55。
         该抄的是「有环境贴图」这件事本身，不是这几个数字。 */
      return new THREE.MeshPhysicalMaterial({
        map: t, roughness: 0.5, metalness: 0.05,
        clearcoat: 0.35, clearcoatRoughness: 0.2, envMapIntensity: 0.55
      });
    }
    var faceGeo = planarUV(new THREE.ShapeGeometry(
      roundedRect(CW - 2 * BS, CH - 2 * BS, 0.20 - BS), 14));

    var front = new THREE.Mesh(faceGeo, faceMat(faceTex(fFace)));
    front.position.set(0, -HANG, FZ);
    badge.add(front);

    var back = new THREE.Mesh(faceGeo, faceMat(faceTex(bFace)));
    back.position.set(0, -HANG, -FZ);
    back.rotation.y = Math.PI;
    badge.add(back);

    /* ── 二维码 ───────────────────────────────────────────────
       自己拿矩阵自己画。上一版是去扒 qr.js 那张画布，等于把工牌绑死在
       另一个模块的 rAF、滚动进场判定、DPR 和 fetch 上 —— 任何一环没起来，
       卡面就是块白板，而且这些条件在「切标签页」「file:// 双击打开」下
       正好全都不成立。现在只依赖一个常量矩阵，没有运行时耦合。 */
    var QRM = opt.qrMatrix || (root.__QR_MATRIX && root.__QR_MATRIX.m) || null;
    var QN = QRM ? QRM.length : 0;
    var qrMesh = null, qrTex = null, qrPad = null, qrPadCtx = null;
    var qrMods = [], qrClock = 0, QR_TOTAL = 1150, QR_SPREAD = 620, qrSettled = false;

    if (QN) {
      qrPad = document.createElement('canvas');
      qrPad.width = qrPad.height = 768;                 /* 模块边缘要锐，给足像素 */
      qrPadCtx = qrPad.getContext('2d', { alpha: false });

      var QPAD = Math.round(768 * 0.04), QCELL = (768 - QPAD * 2) / QN;
      for (var qr_ = 0; qr_ < QN; qr_++) {
        for (var qc_ = 0; qc_ < QN; qc_++) {
          if (!QRM[qr_][qc_]) continue;
          var mx = QPAD + qc_ * QCELL, my = QPAD + qr_ * QCELL;
          var dx0 = (mx + QCELL / 2) - 384, dy0 = (my + QCELL / 2) - 768;
          qrMods.push({ x: mx, y: my, d: Math.sqrt(dx0 * dx0 + dy0 * dy0),
                        a: Math.random() * Math.PI * 2, r: 40 + Math.random() * 150 });
        }
      }
      qrMods.sort(function (a, b) { return a.d - b.d; });
      for (var qi = 0; qi < qrMods.length; qi++) {
        qrMods[qi].start = (qi / Math.max(qrMods.length - 1, 1)) * QR_SPREAD;
      }

      qrTex = new THREE.CanvasTexture(qrPad);
      qrTex.colorSpace = THREE.SRGBColorSpace;
      qrTex.anisotropy = 16;
      /* 关键：必须关掉 mipmap。768px 的码贴图缩到屏幕上只有 200 来像素，
         四倍缩小时 mipmap 会把相邻模块糊成一片 —— 实测开着 mipmap
         在 1 倍屏下 cv2 完全扫不出来，关掉立刻能扫。 */
      qrTex.generateMipmaps = false;
      qrTex.minFilter = THREE.LinearFilter;

      var qw = QSZ / FW * CW, qh = QSZ / FH * CH;
      var qcy = ((FH / 2) - (QY + QSZ / 2)) / FH * CH;
      qrMesh = new THREE.Mesh(new THREE.PlaneGeometry(qw, qh),
        new THREE.MeshPhysicalMaterial({
          map: qrTex, roughness: 0.55, metalness: 0.0,
          clearcoat: 0.2, clearcoatRoughness: 0.25, envMapIntensity: 0.4
        }));
      qrMesh.position.set(0, -HANG + qcy, FZ + 0.003);
      badge.add(qrMesh);
      drawQRCode();
    }

    function drawQRCode() {
      if (!qrPadCtx) return;
      var g = qrPadCtx, S = 768;
      g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, S, S);
      g.fillStyle = '#0B0B11';
      var cell = (S - Math.round(S * 0.04) * 2) / QN;
      for (var i = 0; i < qrMods.length; i++) {
        var m = qrMods[i];
        var t = (qrClock - m.start) / (QR_TOTAL - QR_SPREAD);
        if (t <= 0) continue;
        if (t >= 1) { g.globalAlpha = 1; g.fillRect(m.x, m.y, cell + 0.6, cell + 0.6); continue; }
        var e = 1 - Math.pow(1 - t, 5);                 /* 和 qr.js 同一条缓动 */
        g.globalAlpha = e;
        var off = (1 - e) * m.r;
        g.fillRect(m.x + Math.cos(m.a) * off, m.y + Math.sin(m.a) * off,
                   cell + 0.6, cell + 0.6);
      }
      g.globalAlpha = 1;
      qrTex.needsUpdate = true;
    }

    /* 金属件：夹座跨在卡片上沿，扣环在夹座之上，绳子从环里穿过去。
       参考稿是 card.glb 里的 clip / clamp 两个 mesh 配 materials.metal。 */
    var metal = new THREE.MeshPhysicalMaterial({
      color: 0xc6c6d2, roughness: 0.28, metalness: 1, clearcoat: 0.6
    });
    var clampGeo = new THREE.ExtrudeGeometry(roundedRect(0.96, 0.30, 0.10), {
      depth: TH + 2 * BT + 0.07, bevelEnabled: true,
      bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 8
    });
    clampGeo.translate(0, 0, -(TH + 2 * BT + 0.07) / 2);
    var clamp = new THREE.Mesh(clampGeo, metal);
    clamp.position.y = -0.59;                 /* = -(HANG - CH/2)，正好骑在上沿 */
    badge.add(clamp);

    var clip = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.048, 10, 28), metal);
    clip.position.y = -0.22;                  /* 环顶正好在 group 原点，即绳子末端 */
    badge.add(clip);

    /* ── 交互 ── */
    var ray = new THREE.Raycaster(), ndc = new THREE.Vector2(-2, -2);
    var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    var hit = new THREE.Vector3(), grabOff = new THREE.Vector3(), _drag = new THREE.Vector3();
    var dragging = false, hovering = false;

    function toNDC(e) {
      var r = cvs.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    }
    function pick() {
      ray.setFromCamera(ndc, cam);
      return ray.intersectObject(body, false).length > 0;
    }
    cvs.addEventListener('pointerdown', function (e) {
      toNDC(e);
      if (!pick()) return;
      dragging = true;
      cvs.setPointerCapture(e.pointerId);
      ray.setFromCamera(ndc, cam);
      ray.ray.intersectPlane(plane, hit);
      grabOff.copy(pos[N - 1]).sub(hit);
      cvs.style.cursor = 'grabbing';
    });
    cvs.addEventListener('pointermove', function (e) {
      toNDC(e);
      if (!dragging) {
        var h = pick();
        if (h !== hovering) { hovering = h; cvs.style.cursor = h ? 'grab' : ''; }
        return;
      }
      ray.setFromCamera(ndc, cam);
      ray.ray.intersectPlane(plane, hit);
    });
    function release(e) {
      if (!dragging) return;
      dragging = false; cvs.style.cursor = hovering ? 'grab' : '';
      try { cvs.releasePointerCapture(e.pointerId); } catch (x) {}
    }
    cvs.addEventListener('pointerup', release);
    cvs.addEventListener('pointercancel', release);

    /* ── 物理 ──
       绳子是 verlet；卡片是挂在扣环上的复摆 + 一个绕竖轴的自由转动。 */
    var roll = 0, rollV = 0;       /* 绕 Z 摆动（复摆） */
    var yaw = 0, yawV = 0;         /* 绕 Y 自转 —— 翻页 */
    var lastTipX = pos[N - 1].x, lastTipY = pos[N - 1].y;

    function stepPhysics(dt) {
      var g = o.gravity * dt * dt;
      for (var i = 1; i < N; i++) {
        var p = pos[i], q = old[i];
        var vx = (p.x - q.x) * o.damping, vy = (p.y - q.y) * o.damping, vz = (p.z - q.z) * o.damping;
        q.copy(p);
        p.x += vx; p.y += vy + g; p.z += vz;
      }
      pos[0].copy(anchor);
      if (dragging) {
        /* 超出绳长不硬夹死。硬夹的手感是「撞墙」——到了半径就一动不动。
           但也不能用 log1p：它无上界，实测拉远一点绳长就从 3.4 抻到 5.54
           （+63%），那是橡皮筋。织带几乎不可拉伸，只该有一丁点余量，
           所以用饱和式：再怎么拽，最多多给 o.stretch。 */
        var t = _drag.copy(hit).add(grabOff).sub(anchor);
        var maxLen = SEG * (N - 1);
        var over = t.length() - maxLen;
        if (over > 0) t.setLength(maxLen + o.stretch * (1 - Math.exp(-over / o.give)));
        pos[N - 1].copy(anchor).add(t);
        /* ⚠️ 这里绝不能写 old[N-1].copy(pos[N-1])。
           verlet 的速度就是 pos-old，那一行等于每帧把速度清零，
           松手时惯性为 0 —— 就是「拉着没有弹力、一松手就直接停」。
           old 保留上一帧的位置，拖拽速度自然被差分出来带进自由运动。 */
      }
      for (var it = 0; it < o.iterations; it++) {
        for (var j = 0; j < N - 1; j++) {
          var a = pos[j], b = pos[j + 1];
          var dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
          var d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
          var diff = (d - SEG) / d * 0.5;
          var ox = dx * diff, oy = dy * diff, oz = dz * diff;
          if (j !== 0) { a.x += ox; a.y += oy; a.z += oz; }
          else { b.x -= ox * 2; b.y -= oy * 2; b.z -= oz * 2; continue; }
          if (!(dragging && j + 1 === N - 1)) { b.x -= ox; b.y -= oy; b.z -= oz; }
        }
        pos[0].copy(anchor);
      }

      var tip = pos[N - 1];
      var vX = (tip.x - lastTipX) / dt, vY = (tip.y - lastTipY) / dt;
      lastTipX = tip.x; lastTipY = tip.y;

      /* 复摆：绕扣环转动。重力把卡片拽回竖直，挂点的加速度给它一个惯性力。
         力矩 = r × F，r 是挂点到卡心（长 HANG），
         F = m(g - a_pivot)。除以 I ≈ m·HANG² 得角加速度。 */
      var G = -o.gravity;
      var aX = vX / Math.max(dt, 1e-3) * 0;             /* 位置驱动，横向惯性由下式的 vX 承担 */
      var alpha = (Math.sin(roll) * (-G) - Math.cos(roll) * (aX + vX * 1.6)) / HANG;
      rollV += alpha * dt;
      rollV *= Math.exp(-2.6 * dt);
      roll  += rollV * dt;

      /* 自转（翻页）：横向甩动给角动量。回复力用 sin(2·yaw)，
         0 和 π 都是稳定点 —— 真实的工牌正反面都能停住，
         参考稿的 angvel.y -= rot.y*0.25 只有正面一个稳定点。 */
      yawV += -vX * o.spin * dt;
      yawV += -5.5 * Math.sin(2 * yaw) * dt;
      yawV *= Math.exp(-1.5 * dt);
      yaw  += yawV * dt;
      if (yaw >  Math.PI * 4) yaw -= Math.PI * 4;
      if (yaw < -Math.PI * 4) yaw += Math.PI * 4;
    }

    function sync() {
      rebuildBand();
      var tip = pos[N - 1];
      badge.position.copy(tip);
      badge.rotation.set(0, yaw, roll);
    }

    var W = 0, H = 0;
    function resize() {
      var w = host.clientWidth, h = host.clientHeight;
      if (!w || !h || (w === W && h === H)) return;
      W = w; H = h;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    }

    var raf = 0, last = 0, visible = true, frames = 0, noDraw = false, vtick = 0;

    /* 可见性不能只靠 IntersectionObserver：实测它在某些情况下
       首次判定 false 之后就不再回调，主循环于是一帧都不渲染。
       这里每 10 帧自己量一次矩形兜底，代价是一次 layout，可以忽略。 */
    function checkVisible() {
      var r = host.getBoundingClientRect();
      var v = r.bottom > 0 && r.top < (innerHeight || 0) &&
              r.right > 0 && r.left < (innerWidth || 0);
      visible = v;
    }

    function tick(dt) {
      stepPhysics(dt);
      sync();
      /* 二维码拼合动画由工牌自己的时钟推进。拼完就不再重画 ——
         卡面那张 1240×1880 本来就是静态的，稳态下每帧零贴图上传。 */
      if (!qrSettled && QN) {
        qrClock += dt * 1000;
        if (qrClock >= QR_TOTAL) { qrClock = QR_TOTAL; qrSettled = true; }
        drawQRCode();
      }
      frames++;
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if ((vtick++ % 10) === 0) checkVisible();
      if (!visible || document.hidden) return;
      var dt = (now - last) / 1000; last = now;
      dt = dt > 1 / 30 ? 1 / 30 : (dt > 0 ? dt : 1 / 60);
      resize();
      tick(dt);
      if (!noDraw) renderer.render(scene, cam);
    }

    var io = null;
    if (root.IntersectionObserver) {
      io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) visible = true; },
                                    { threshold: 0 });
      io.observe(host);
    }
    addEventListener('resize', resize);
    addEventListener('scroll', function () { vtick = 0; }, { passive: true });
    resize(); checkVisible(); last = performance.now();
    raf = requestAnimationFrame(frame);

    var _box = new THREE.Box3();
    var api = {
      canvas: cvs,
      poll: function () { checkVisible(); return visible; },
      /* 无头环境 rAF 不推进，用它确定性地推物理 */
      step: function (n) {
        var r = raf; n = n || 1;
        for (var i = 0; i < n; i++) {
          noDraw = i < n - 1; tick(1 / 60);
          if (!noDraw) renderer.render(scene, cam);
        }
        noDraw = false; cancelAnimationFrame(raf); raf = r;
      },
      drag: function (x, y) { dragging = true; hit.set(x, y, 0); grabOff.set(0, 0, 0); },
      drop: function () { dragging = false; },
      tipVel: function () { return +pos[N-1].distanceTo(old[N-1]).toFixed(4); },
      spin: function (v) { yawV += v; },
      setYaw: function (a) { yaw = a; yawV = 0; sync(); },
      stats: function () {
        var len = 0;
        for (var i = 0; i < N - 1; i++) len += pos[i].distanceTo(pos[i + 1]);
        _box.setFromObject(badge);
        var halfH = Math.tan(cam.fov * Math.PI / 360) * cam.position.z;
        return {
          绳长: +(SEG * (N - 1)).toFixed(3), 实测绳长: +len.toFixed(3),
          拉伸误差: +(len - SEG * (N - 1)).toFixed(4),
          卡宽高: [+CW.toFixed(2), +CH.toFixed(2)],
          可视半高: +halfH.toFixed(2), 可视半宽: +(halfH * cam.aspect).toFixed(2),
          包围盒下缘: +_box.min.y.toFixed(2), 包围盒上缘: +_box.max.y.toFixed(2),
          包围盒左缘: +_box.min.x.toFixed(2), 包围盒右缘: +_box.max.x.toFixed(2),
          自转角度: +(yaw * 180 / Math.PI).toFixed(1),
          自转角速度: +yawV.toFixed(2),
          正面朝前: Math.cos(yaw) > 0,
          摆角: +(roll * 180 / Math.PI).toFixed(1),
          环境贴图: !!envTex, 已渲染帧: frames, 在视口内: visible,
          二维码: QN ? (QN + '×' + QN + ' · ' + qrMods.length + ' 模块 · ' +
                        (qrSettled ? '已拼合' : Math.round(qrClock / QR_TOTAL * 100) + '%')) : '无矩阵',
          带子面数: bandIdx.length / 3
        };
      },
      destroy: function () {
        cancelAnimationFrame(raf); removeEventListener('resize', resize);
        if (io) io.disconnect(); cvs.remove();
      }
    };
    instances.push(api);
    return api;
  }

  root.Lanyard = { mount: mount, capable: capable, all: instances };
})(window);

/* tiger3d.js —— 实验场的小老虎（替代原站的蜜蜂）。维护：网站交互调整。
   owner 2026-09-15：「蜜蜂换成小老虎，抽象的也行，要建模」。原站蜜蜂是作者自己的模型，不拿；这里用 three.js 基本体自建一只几何低面数的抽象小老虎：
   · 身体、头是 flatShading 的多面体，橙色主色 #E9781E（黄底上要压得住，比橙黄更深一档），深绿 #022016 条纹（和站点深绿同色，黄底上压得住），白色口鼻与腹部；
   · 动作：待机时轻微上下浮动、尾巴摆、偶尔眨眼；jump() 原地起跳转一圈（点击大字换组 / 点小老虎时用）；lookAt(x, y) 头朝向鼠标；setSpeed(0~1) 决定四条腿的步幅步频（跑步腿）。
   用法：var t = V7Tiger.create(); scene.add(t.group); 每帧 t.update(dt, time)。 */
(function () {
  'use strict';
  function create() {
    var THREE = window.THREE; if (!THREE) return null;
    var ORANGE = 0xE9781E, STRIPE = 0x022016, CREAM = 0xFFF4E2, NOSE = 0x3A1F12;
    function mat(c, rough) { return new THREE.MeshStandardMaterial({ color: c, roughness: rough == null ? .72 : rough, metalness: 0, flatShading: true }); }
    var mOrange = mat(ORANGE), mStripe = mat(STRIPE, .6), mCream = mat(CREAM, .8), mNose = mat(NOSE, .5), mEye = mat(0x0b0b0b, .3);
    function mesh(geo, m, parent, p, r, s) {
      var o = new THREE.Mesh(geo, m); if (p) o.position.set(p[0], p[1], p[2]); if (r) o.rotation.set(r[0], r[1], r[2]); if (s) o.scale.set(s[0], s[1], s[2]);
      o.castShadow = true; parent.add(o); return o;
    }
    var root = new THREE.Group(), body = new THREE.Group(); root.add(body);

    /* 身体：拉长的二十面体 + 腹部 */
    var torso = mesh(new THREE.IcosahedronGeometry(1, 1), mOrange, body, [0, 0, 0], null, [1.25, .82, .9]);
    mesh(new THREE.IcosahedronGeometry(1, 1), mCream, body, [.05, -.32, .12], null, [.9, .45, .72]);
    /* 身体条纹：几条压扁的深绿环 */
    [-.78, -.38, .02, .4].forEach(function (x, k) {   /* 四道背纹：环半径按身体椭球在该截面的大小算，缩放和身体一致，贴着表面 */
      var r = Math.sqrt(Math.max(.05, 1 - Math.pow(x / 1.25, 2)));
      mesh(new THREE.TorusGeometry(r, .09, 4, 14, Math.PI * .85), mStripe, body, [x, 0, 0], [0, Math.PI / 2, .075 * Math.PI + (k % 2 ? .06 : -.06)], [1.02, .84, .93]);
    });

    /* 头 */
    var head = new THREE.Group(); head.position.set(1.18, .55, 0); body.add(head);
    mesh(new THREE.IcosahedronGeometry(.72, 1), mOrange, head, [0, 0, 0], null, [1, .92, 1.02]);
    mesh(new THREE.IcosahedronGeometry(.36, 1), mCream, head, [.46, -.18, 0], null, [.9, .7, 1.25]);   /* 口鼻 */
    mesh(new THREE.TetrahedronGeometry(.1, 0), mNose, head, [.8, -.06, 0], [0, 0, Math.PI / 4]);
    /* 耳朵 */
    [-1, 1].forEach(function (sd) {
      var ear = mesh(new THREE.ConeGeometry(.2, .32, 4), mOrange, head, [-.05, .6, sd * .38], [sd * .35, 0, -.2]);
      mesh(new THREE.ConeGeometry(.1, .16, 4), mStripe, ear, [0, .02, 0]);
    });
    /* 额头「王」字简化成三道横纹 + 眉心竖纹 */
    [.34, .46, .58].forEach(function (y, k) { mesh(new THREE.BoxGeometry(.05, .035, k === 1 ? .34 : .24), mStripe, head, [.52 - k * .06, y - .12, 0], [0, 0, -.5]); });
    /* 脸颊条纹 */
    [-1, 1].forEach(function (sd) {
      [0, 1].forEach(function (k) { mesh(new THREE.BoxGeometry(.03, .05, .22), mStripe, head, [.16 - k * .12, -.08 - k * .1, sd * .64], [0, sd * .3, .2]); });
    });
    /* 眼睛（眨眼时压扁 y） */
    var eyes = [-1, 1].map(function (sd) { return mesh(new THREE.OctahedronGeometry(.085, 0), mEye, head, [.55, .16, sd * .26], null, [.6, 1, 1]); });

    /* 腿：四根短柱 + 爪 */
    var legs = [[.62, .45], [.62, -.45], [-.62, .45], [-.62, -.45]].map(function (p) {
      var g = new THREE.Group(); g.position.set(p[0], -.55, p[1]); body.add(g);
      mesh(new THREE.CylinderGeometry(.17, .15, .55, 6), mOrange, g, [0, -.22, 0]);
      mesh(new THREE.BoxGeometry(.05, .04, .3), mStripe, g, [0, -.12, 0]);
      mesh(new THREE.IcosahedronGeometry(.19, 0), mCream, g, [.05, -.5, 0], null, [1.1, .6, 1]);
      return g;
    });

    /* 尾巴：一串小段，尾尖深绿 */
    var tail = new THREE.Group(); tail.position.set(-1.2, .2, 0); body.add(tail);
    var segs = [], prev = tail;
    for (var i = 0; i < 6; i++) {
      var sg = new THREE.Group(); sg.position.set(i ? -.2 : 0, i ? .08 : 0, 0); prev.add(sg);
      mesh(new THREE.CylinderGeometry(.09 - i * .008, .1 - i * .008, .24, 5), i === 5 || i === 3 ? mStripe : mOrange, sg, [-.1, 0, 0], [0, 0, Math.PI / 2]);
      segs.push(sg); prev = sg;
    }

    root.scale.setScalar(1);
    var st = { jump: 0, spin: 0, blink: 0, nextBlink: 2, lookX: 0, lookY: 0, tx: 0, ty: 0, spd: 0, spdT: 0, gait: 0 };
    /* owner 2026-09-16：「腿部要有摆动跟随移动，就像在跑步一样」。外部每帧把移动速度（0 站住 ~ 1 全速）喂进来，腿按对角步幅摆。 */
    function setSpeed(v) { st.spdT = Math.max(0, Math.min(1, v || 0)); }
    function jump() {
      if (!window.gsap || st.busy) return; st.busy = true;
      var tl = window.gsap.timeline({ onComplete: function () { st.busy = false; st.spin = 0; } });
      tl.to(st, { jump: 1, duration: .35, ease: 'power2.out' })
        .to(st, { spin: Math.PI * 2, duration: .7, ease: 'power2.inOut' }, 0)
        .to(st, { jump: 0, duration: .45, ease: 'bounce.out' }, .35);
    }
    function lookAt(nx, ny) { st.tx = Math.max(-1, Math.min(1, nx)); st.ty = Math.max(-1, Math.min(1, ny)); }
    function update(dt, t) {
      st.lookX += (st.tx - st.lookX) * .08; st.lookY += (st.ty - st.lookY) * .08;
      st.spd += (st.spdT - st.spd) * Math.min(1, dt * 6);
      st.gait += dt * (2.2 + st.spd * 9.5);                    /* 走得越快，步频越高 */
      body.position.y = Math.sin(t * 2) * .06 + Math.abs(Math.sin(st.gait)) * st.spd * .14 + st.jump * 1.1;
      body.rotation.z = Math.sin(st.gait * 2) * st.spd * .045;  /* 跑起来身子随步子起伏 */
      body.rotation.y = st.spin;
      head.rotation.y = -st.lookX * .5; head.rotation.z = st.lookY * .25 + Math.sin(t * 1.3) * .03;
      /* 尾巴（owner 2026-09-16：晃得太快，要慢慢晃）：频率降到原来的三分之一，两端用幂次做停顿感，
         根部到尖端有相位延迟、幅度递增，甩起来是一条软尾巴而不是整根一起摆；跑动时只略快一点。 */
      var tw = t * (1.15 + st.spd * 1.8);
      segs.forEach(function (sg, k) {
        var s1 = Math.sin(tw - k * .42);
        var e1 = (s1 < 0 ? -1 : 1) * Math.pow(Math.abs(s1), .62);        /* 到两端会停一下，不是匀速来回 */
        sg.rotation.z = e1 * (.16 + k * .045 + st.spd * .06) + .12;
        var s2 = Math.sin(tw * .72 - k * .34);
        sg.rotation.y = (s2 < 0 ? -1 : 1) * Math.pow(Math.abs(s2), .62) * (.05 + k * .022);
      });
      var amp = .07 + st.spd * .62;
      legs.forEach(function (g, k) {                             /* 对角步：右前 + 左后 同相，另一对反相 */
        var ph = (k === 0 || k === 3) ? 0 : Math.PI, s = Math.sin(st.gait + ph);
        g.rotation.z = st.jump * (k < 2 ? -.6 : .6) + s * amp + Math.sin(t * 2 + k) * .02;
        g.position.y = -.55 + Math.max(0, s) * st.spd * .16;     /* 迈步时抬脚 */
      });
      st.nextBlink -= dt; if (st.nextBlink < 0) { st.blink = 1; st.nextBlink = 2.5 + Math.random() * 3; }
      st.blink = Math.max(0, st.blink - dt * 7);
      eyes.forEach(function (e) { e.scale.y = 1 - Math.sin(st.blink * Math.PI) * .9; });
      torso.scale.y = .82 + Math.sin(t * 2) * .01;
    }
    return { group: root, update: update, jump: jump, lookAt: lookAt, setSpeed: setSpeed, body: body };
  }
  window.V7Tiger = { create: create };
})();

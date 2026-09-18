/* transition.js —— 页面切场动画。维护：网站交互调整。
   对照原站 leoparpeix.com 点「About」的逐帧录像（真 GPU，每帧约 120 毫秒）：
     入场：深绿圆从屏幕正中心放大，约 .35 秒铺满（起步快、收尾慢）；中心一个小 3D 标志跟着从 0 放大。
     停留：满屏深绿约 1.1 秒，标志在中间慢慢转。
     出场：圆向中心收缩，约 .45 秒缩成点（越缩越快）；标志先缩小；新页面随后放大进场。
   我们：底色 #083D2A（owner 指定），标志换成 owner 的 Figma logo（1079:2599）3D 版，金色 #DAAB00。
   跨页做法（双击打开也能用）：点链接 → 播入场 → 记 sessionStorage → 跳页；新页面 <head> 里的小脚本看到记号就先加 html.pt-arriving，
   CSS 让遮罩一开始就是满屏深绿（不闪白），本脚本等页面就绪后播出场，并发 'v7:pt-revealed' 事件给页面启动自己的进场。 */
(function () {
  'use strict';
  var THREE = window.THREE, gsap = window.gsap;
  var KEY = 'v7-pt', root = document.documentElement;
  var el = document.getElementById('pageTransition'); if (!el || !gsap) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T = { enter: .38, hold: .25, exit: .5, logoIn: .6, logoOut: .3 };   /* owner 2026-09-15 嫌切换慢：hold .75 → .25 */   /* 秒；hold 是跳页前最少停留，加上新页面载入就接近原站的 1.1 秒 */
  var LOGO_PX = 64;   /* 标志在屏幕上的宽度（原站花朵约 30 像素，owner 的 logo 细节多，放大一倍） */

  function cover() { return Math.hypot(innerWidth, innerHeight) / 2 + 2; }
  var st = { r: root.classList.contains('pt-arriving') ? cover() : 0, logo: root.classList.contains('pt-arriving') ? 1 : 0, spin: 0 };
  function applyClip() { el.style.clipPath = 'circle(' + st.r.toFixed(1) + 'px at 50% 50%)'; el.style.visibility = st.r > .5 ? 'visible' : 'hidden'; }
  applyClip();

  /* ── 3D 标志 ── */
  var renderer = null, scene, camera, logo;
  if (THREE && window.V7Logo3D) {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
      el.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      if (THREE.RoomEnvironment) { var pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new THREE.RoomEnvironment(), .04).texture; scene.environmentIntensity = .7; }
      scene.add(new THREE.AmbientLight(0xffffff, .35));
      var key = new THREE.DirectionalLight(0xfff2d6, 2.2); key.position.set(-1.2, 1.5, 2.2); scene.add(key);
      var rim = new THREE.DirectionalLight(0x9fe0c0, .8); rim.position.set(1.5, -1, -1); scene.add(rim);   /* 背面一点绿色轮廓光，和深绿底呼应 */
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 20); camera.position.set(0, 0, 8);
      logo = window.V7Logo3D.create({ size: 1, depth: .18, bevel: .035, material: new THREE.MeshStandardMaterial({ color: 0xDAAB00, metalness: .45, roughness: .36 }) });
      scene.add(logo);
    } catch (e) { renderer = null; }
  }
  function size() {
    if (!renderer) return;
    var w = innerWidth, h = innerHeight; renderer.setSize(w, h, false);
    /* 正交相机：1 世界单位 = LOGO_PX 像素 */
    var hw = w / 2 / LOGO_PX, hh = h / 2 / LOGO_PX;
    camera.left = -hw; camera.right = hw; camera.top = hh; camera.bottom = -hh; camera.updateProjectionMatrix();
  }
  size(); addEventListener('resize', function () { size(); if (running === 'covered') { st.r = cover(); applyClip(); } });

  var running = st.r > 0 ? 'covered' : 'idle', t0 = performance.now();
  function frame() {
    if (st.r <= .5 && running === 'idle') return;
    applyClip();
    if (!renderer) return;
    var t = (performance.now() - t0) / 1000;
    var s = Math.max(.0001, st.logo);
    logo.scale.setScalar(s / window.V7Logo3D.W);
    logo.rotation.set(Math.sin(t * 1.3) * .28, st.spin + t * 1.9, Math.sin(t * .9) * .06);   /* 绕竖轴匀速转，前后轻轻点头 */
    renderer.render(scene, camera);
  }
  gsap.ticker.add(frame);

  /* ── 入场 → 跳页 ── */
  function go(href) {
    if (running === 'entering' || running === 'covered') return;
    if (reduce) { location.href = href; return; }
    running = 'entering';
    try { sessionStorage.setItem(KEY, String(Date.now())); } catch (e) {}
    el.classList.add('is-on');
    gsap.killTweensOf(st);
    var tl = gsap.timeline({ onComplete: function () { running = 'covered'; gsap.delayedCall(T.hold, function () { location.href = href; }); } });
    tl.to(st, { r: cover(), duration: T.enter, ease: 'power3.out' }, 0)
      .fromTo(st, { logo: 0 }, { logo: 1, duration: T.logoIn, ease: 'back.out(1.8)' }, .08);
  }

  /* ── 新页面：出场 ── */
  function reveal() {
    running = 'exiting';
    gsap.timeline({ onComplete: function () { running = 'idle'; st.r = 0; applyClip(); el.classList.remove('is-on'); root.classList.remove('pt-arriving'); window.dispatchEvent(new CustomEvent('v7:pt-revealed')); } })
      .to(st, { logo: 0, duration: T.logoOut, ease: 'power2.in' }, 0)
      .to(st, { r: 0, duration: T.exit, ease: 'power3.in' }, .12)
      .call(function () { window.dispatchEvent(new CustomEvent('v7:pt-exit-start')); }, null, .12 + T.exit * .45);
  }
  var arriving = root.classList.contains('pt-arriving');
  try { sessionStorage.removeItem(KEY); } catch (e) {}
  if (arriving) {
    el.classList.add('is-on');
    /* 不再等 load：项目页里的实时预览 / 大图要好几秒，揭幕被卡住。脚本在 body 末尾执行时 DOM 已就绪，停 .25s 就放 */
    var ready = function () { gsap.delayedCall(.25, reveal); };
    if (document.readyState !== 'loading') ready(); else addEventListener('DOMContentLoaded', ready);
  }

  /* ── 站内链接：带 data-pt 的走切场 ── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-pt]'); if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault(); go(a.getAttribute('href'));
  });
  /* 从浏览器后退回到这个页面时（bfcache），遮罩可能停在满屏：直接收起 */
  addEventListener('pageshow', function (e) { if (e.persisted && running !== 'idle') { running = 'idle'; st.r = 0; st.logo = 0; applyClip(); el.classList.remove('is-on'); } });

  window.V7Transition = { go: go, isArriving: function () { return arriving; }, T: T };
})();

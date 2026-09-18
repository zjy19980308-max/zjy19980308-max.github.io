/* app.js —— v7 第一段：加载器时序、导航、首屏视差淡出、文字逐行进场、大字段进场与点击换组、光标提示。
   全部数值来自原站包里的常量（见 _规划.md「原站动画参数」）。依赖 gsap 3.13 + lenis 1.3（本地 vendor）。维护：网站交互调整。 */
(function () {
  'use strict';
  var C = window.V7, gsap = window.gsap;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var REVEAL = 'cubic-bezier(.4,0,0,1)';
  gsap.registerEase && (function () {})();
  /* 原站 CustomEase("reveal", ".4,0,0,1")：这里不带 CustomEase 插件，用 4 点贝塞尔近似实现 */
  function bez(p0, p1, p2, p3) { /* 标准 cubic-bezier 求 y(x) */
    function A(a, b) { return 1 - 3 * b + 3 * a; } function B(a, b) { return 3 * b - 6 * a; } function Cc(a) { return 3 * a; }
    function calc(t, a, b) { return ((A(a, b) * t + B(a, b)) * t + Cc(a)) * t; }
    function slope(t, a, b) { return 3 * A(a, b) * t * t + 2 * B(a, b) * t + Cc(a); }
    return function (x) { var t = x; for (var i = 0; i < 8; i++) { var s = slope(t, p0, p2); if (!s) break; var e = calc(t, p0, p2) - x; t -= e / s; } return calc(t, p1, p3); };
  }
  var easeReveal = bez(.4, 0, 0, 1);
  gsap.registerEase('reveal', easeReveal);
  var F3D = { force3D: true };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function q(id) { return document.getElementById(id); }
  function lines(arr) { return arr.map(function (l) { return '<span class="line-mask" aria-hidden="true"><span class="line">' + esc(l) + '</span></span>'; }).join(''); }
  function chars(s) { return s.split('').map(function (c, k) { return '<span class="agency-char" style="--k:' + (k + 1) + '">' + esc(c) + '</span>'; }).join(''); }

  /* ── 填字 ── */
  q('ldTitle').textContent = C.name; q('ldInfos').textContent = C.role; q('ldText').textContent = C.loader.progress;
  q('navName').textContent = C.name; q('navRole').textContent = C.role;
  /* owner 2026-09-16：当前在哪一页要看得出来 —— 选中的那条常显下划线（.mainButton 本来就有这条线，只是平时收着） */
  var here = (location.pathname.split('/').pop() || 'index.html');
  q('navLinks').innerHTML = C.nav.links.map(function (l) {
    var about = l[1] === '#about', page = /\.html$/.test(l[1]);
    var href = about ? 'about.html' : esc(l[1]);
    var cur = href === here || (here === 'index.html' && l[1] === '#work') || (here === '' && l[1] === '#work');
    return '<a class="mainButton links__link' + (cur ? ' links__link--current' : '') + '" href="' + href + '"'
      + (cur ? ' aria-current="page"' : (about || page ? ' data-pt' : '')) + '>' + esc(l[0]) + '</a>';
  }).join('');   /* 「关于」是独立页，走切场动画 */;
  q('headerDesc').setAttribute('aria-label', C.header.lines.join('')); q('headerDesc').innerHTML = lines(C.header.lines);
  q('headerScroll').innerHTML = '<span class="line-mask"><span class="line">' + String(C.header.scroll).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '<span class="enTag" lang="en" aria-hidden="true">Scroll down</span></span></span>';   /* 英文点缀 */
  q('heroLeft').innerHTML = esc(C.hero.left[0]) + '<br>' + esc(C.hero.left[1]);
  q('heroRight').innerHTML = '<div>' + C.hero.right[0].map(function (t) {
    return '<div class="infos__text">' + (t.charAt(0) === '@' ? '<div class="wrapper"><a class="agencyLink" href="#" onclick="return false">' + chars(t) + '</a></div>' : '<p>' + esc(t) + '</p>') + '</div>';
  }).join('') + '</div>' + (C.hero.right[1] ? '<div class="infos__agencies"><div class="agencies__text">' + esc(C.hero.right[1][0]) + '</div><a class="agencyLink" href="#" onclick="return false">' + chars(C.hero.right[1][1]) + '</a></div>' : '');
  function titlesHtml(arr, alt) { return arr.map(function (t, k) { return '<div class="titles__wrapper"><div class="wrapper"><h2 class="title' + (alt ? ' title--' + (k + 1) : '') + '" lang="' + (/[一-鿿]/.test(t) ? 'zh' : 'en') + '">' + esc(t) + '</h2></div></div>'; }).join(''); }
  q('titlesA').innerHTML = titlesHtml(C.hero.titles, false); q('titlesB').innerHTML = titlesHtml(C.hero.titlesAlt, true);
  q('beeHint').innerHTML = lines([C.hero.indication]);
  q('introBaseline').innerHTML = C.intro.baseline.map(function (t, k) { return '<div class="textComponent baseline__text--' + k + '"><p class="textComponent__content" data-split>' + esc(t) + '</p></div>'; }).join('');
  q('introTexts').innerHTML = C.intro.texts.map(function (t) { return '<div class="textComponent"><p class="textComponent__content" data-split>' + esc(t) + '</p></div>'; }).join('');
  /* 按真实排版断行（原站 SplitText）：先把每个字 / 单词包成 span，读它们的 top 分组成行，再重建成 line-mask */
  function splitLines(p) {
    var text = p.textContent, toks = text.match(/[A-Za-z0-9@_%.\-]+|\s+|[\s\S]/g) || [];
    p.innerHTML = toks.map(function (t) { return '<span class="tk">' + esc(t) + '</span>'; }).join('');   /* 空格也包起来，拼回时不丢（「五年 B 端」不会变成「五年B端」） */
    var rows = [], last = null;
    [].forEach.call(p.querySelectorAll('.tk'), function (sp) {
      var r0 = sp.getBoundingClientRect();
      if (/^\s+$/.test(sp.textContent)) { if (rows.length && r0.width) rows[rows.length - 1].push(sp.textContent); return; }
      var top = Math.round(r0.top);
      if (last === null || Math.abs(top - last) > 2) { rows.push([]); last = top; }
      rows[rows.length - 1].push(sp.textContent);
    });
    p.innerHTML = lines(rows.map(function (r) { return r.join(''); }));
  }
  function splitAll() { [].forEach.call(document.querySelectorAll('[data-split]'), splitLines); }
  splitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { [].forEach.call(document.querySelectorAll('[data-split]'), function (p) { if (!p.closest('.textComponent').dataset.in) { p.textContent = p.textContent; splitLines(p); gsap.set(p.querySelectorAll('.line'), { yPercent: 110, force3D: true }); } }); });

  /* ── 平滑滚动：原站 Lenis，桌面 lerp .085 ── */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: .085, smoothWheel: true, syncTouch: !matchMedia('(pointer:coarse)').matches, wheelMultiplier: .45 })   /* wheelMultiplier 滚轮倍率（owner 2026-09-18：滚一下别翻太多页）。
       触控板一次手势会连发几十个 wheel 事件，累计位移很大，这个系数整体缩放。
       js/app.js · about.js · lab.js · project.js 四处要一起改。 */;
    window.__v7lenis = lenis;
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
  }
  function scrollY() { return lenis ? lenis.animatedScroll : window.scrollY; }

  /* ── 加载器：delay 1.5s 三段升起（1s reveal，交错 .15）；3.75s 后三段上移 -100%（.45 power2.out）、底板淡出（.35）、导航显现 ── */
  var ld = q('loader'), ldT = q('ldTitle'), ldI = q('ldInfos'), ldP = q('ldProg'), loaderDone = false;
  document.documentElement.style.overflow = 'hidden';
  var arriving = document.documentElement.classList.contains('pt-arriving');   /* 从关于页切回来：不播加载器，等切场遮罩收拢再进场 */
  if (arriving) {
    ld.remove(); q('nav').classList.add('is-instant', 'visible'); document.documentElement.style.overflow = ''; loaderDone = true;
    addEventListener('v7:pt-exit-start', function () { if (window.__v7Scene) window.__v7Scene.intro(); gsap.delayedCall(.3, revealHeader); }, { once: true });
  }
  else if (reduce) { ld.remove(); q('nav').classList.add('visible'); document.documentElement.style.overflow = ''; loaderDone = true; }
  else {
    var tl = gsap.timeline({ delay: 1.5 });
    tl.to(ldT, { y: 0, rotate: 0, duration: 1, ease: 'reveal' }, 0).to(ldI, { y: 0, rotate: 0, duration: 1, ease: 'reveal' }, .15).to(ldP, { y: 0, rotate: 0, duration: 1, ease: 'reveal' }, .3);
    q('nav').classList.add('visible');   /* 原站：挂载即加 visible，CSS 过渡自带 3.75s 延迟 */
    var out = gsap.timeline({ delay: 3.75, onStart: function () { if (window.__v7Scene) window.__v7Scene.intro(); }, onComplete: function () { ld.remove(); loaderDone = true; document.documentElement.style.overflow = ''; gsap.delayedCall(.91, revealHeader); } });
    out.to([ldT, ldI, ldP], { yPercent: -100, duration: .45, ease: 'power2.out' }, 0).to(ld, { opacity: 0, duration: .35, ease: 'power2.out' }, 0);
  }

  /* ── 文字进场（原站 TextComponent）：yPercent 110 → 0，duration 1.125，stagger .1，ease reveal ── */
  function revealText(el, opts) {
    opts = opts || {}; var ls = el.querySelectorAll('.line'); if (!ls.length || el.dataset.in) return gsap.timeline();
    el.dataset.in = '1';
    return gsap.to(ls, { yPercent: 0, y: 0, duration: opts.duration || 1.125, ease: 'reveal', stagger: opts.stagger != null ? opts.stagger : .1, delay: opts.delay || 0, force3D: true });
  }
  gsap.set(document.querySelectorAll('.line'), { yPercent: 110, force3D: true });
  function revealHeader() { revealText(q('headerDesc')); revealText(q('headerScroll'), { delay: .25 }); }

  /* ── 滚动到可视区再进场（其余 textComponent）：进入即播，只播一次 ── */
  var pending = [].slice.call(document.querySelectorAll('.introBlock .textComponent, .beeBlock .indication'));

  /* ── 首屏内容视差：进度 p = scroll / 首屏块高；translateY(p*800%)，opacity 在 p .2→.45 从 1 到 0 ── */
  var header = q('header'), hc = q('headerContent');
  function headerScroll(sy) {
    var h = header.offsetHeight, p = Math.max(0, Math.min(1, sy / h));
    if (p <= 0) { hc.style.transform = ''; hc.style.opacity = ''; return; }
    hc.style.transform = 'translateY(' + (p * 800) + '%)';
    var f = Math.max(0, Math.min(1, (p - .2) / .25)); hc.style.opacity = String(1 - f);
  }

  /* ── 大字段：块进入视口即进场（fromTo y 100% x ±5% → 0，duration 1，stagger .115，delay .115）；点击换组 ── */
  var bee = q('bee'), A = [].slice.call(q('titlesA').querySelectorAll('.title')), B = [].slice.call(q('titlesB').querySelectorAll('.title'));
  var beeShown = false, alt = false, swapTl = null;
  A.forEach(function (el, k) { gsap.set(el, { y: '100%', x: k % 2 ? '-5%' : '5%', force3D: true }); });
  B.forEach(function (el, k) { gsap.set(el, { y: '100%', x: k % 2 ? '-5%' : '5%', force3D: true }); });
  function revealTitles(arr) {
    var t = gsap.timeline({ delay: .115 });
    arr.forEach(function (el, k) { t.fromTo(el, { y: '100%', x: k % 2 ? '-5%' : '5%' }, { y: '0%', x: '0%', ease: 'reveal', duration: 1, force3D: true }, k * .115); });
    return t;
  }
  function swapTitles() { /* 原站 Pl = 2：出去的 power4.inOut 1.5s；进来的 reveal 2s，起点 k*.1 + .63 */
    var outA = alt ? B : A, inB = alt ? A : B; alt = !alt;
    swapTl && swapTl.kill(); swapTl = gsap.timeline();
    outA.forEach(function (el, k) {
      swapTl.to(el, { y: '100%', x: k % 2 ? '-5%' : '5%', ease: 'power4.inOut', duration: 1.5, force3D: true }, k * .115);
      swapTl.to(inB[k], { y: '0%', x: '0%', ease: 'reveal', duration: 2, force3D: true }, k * .1 + .63);
    });
  }
  q('beeBox').addEventListener('click', function () { if (beeShown) swapTitles(); });

  /* ── 每帧：视差、可视区进场 ── */
  function frame() {
    var sy = scrollY(), vh = innerHeight;
    headerScroll(sy);
    if (!loaderDone) return;
    if (!beeShown) { var r = bee.getBoundingClientRect(); if (r.top < vh && r.bottom > 0) { beeShown = true; revealTitles(A); } }
    for (var i = pending.length - 1; i >= 0; i--) { var b = pending[i].getBoundingClientRect(); if (b.top < vh * .96 && b.bottom > 0) { revealText(pending[i]); pending.splice(i, 1); } }
  }
  gsap.ticker.add(frame);
  window.__v7 = { state: function () { return { loaderDone: loaderDone, beeShown: beeShown, alt: alt, pending: pending.length, sy: scrollY() }; }, revealTitles: revealTitles, A: A };

  /* ── 导航锚点走 Lenis ── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.querySelector(a.getAttribute('href')); if (!t) return; e.preventDefault();
    if (lenis) lenis.scrollTo(t, { duration: 1.4 }); else t.scrollIntoView({ behavior: 'smooth' });
  });

  /* owner 2026-09-15：不看演示了，右侧视频位去掉，两段文字挪到那里；光标胶囊一起去掉 */
  window.__v7splitLines = splitLines;
})();

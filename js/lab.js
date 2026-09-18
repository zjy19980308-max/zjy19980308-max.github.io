/* lab.js —— v7 实验场（lab.html）。维护：网站交互调整。
   结构与数值照原站 leoparpeix.com/playground（2026-09-15 抓包 + 截帧，scratchpad lp/pg）：
   ① HeroBlock：顶部一句小字 + 三行大字，点一下换组（同首页大字：出 power4.inOut 1.5s / 进 reveal 2s）；进场整块 scale .65 → 1（直接打开 2.5s expo.inOut，切场进来 2s expo.out 从 0）。
   ② ContentBlock：12 栏错落作品流，行内一大一小，每张带 标题 + 类型；每张图随滚动视差（原站 parallaxAmount -120～80 交替）、进视口时遮罩 9% 收拢、图从 1.125 缩到 1；第四行一张图 + 一段话。
   ③ Footer(yellow)：大字点一下换组 + 底部联系方式。
   ④ 小老虎（替代蜜蜂）：固定全屏透明画布；首屏蹲在大字右上，作品流里沿波浪路径随滚动走动，页脚再出现在大字旁；点小老虎或点大字 → 起跳转一圈并换组；头跟着鼠标。 */
(function () {
  'use strict';
  var C = window.V7, L = C && C.lab, gsap = window.gsap, THREE = window.THREE;
  if (!L || !gsap) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bez(p0, p1, p2, p3) {
    function a(x, y) { return 1 - 3 * y + 3 * x; } function b(x, y) { return 3 * y - 6 * x; } function c(x) { return 3 * x; }
    function calc(t, x, y) { return ((a(x, y) * t + b(x, y)) * t + c(x)) * t; } function slope(t, x, y) { return 3 * a(x, y) * t * t + 2 * b(x, y) * t + c(x); }
    return function (x) { var t = x; for (var i = 0; i < 8; i++) { var s = slope(t, p0, p2); if (!s) break; t -= (calc(t, p0, p2) - x) / s; } return calc(t, p1, p3); };
  }
  gsap.registerEase('reveal', bez(.4, 0, 0, 1));
  function q(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function en(t) { return '<span class="enTag" lang="en" aria-hidden="true">' + esc(t) + '</span>'; }
  function lines(arr) { return arr.map(function (l) { return '<span class="line-mask"><span class="line">' + esc(l) + '</span></span>'; }).join(''); }
  function titlesHtml(arr, alt) { return (arr || []).map(function (t, k) { return '<div class="titles__wrapper"><div class="wrapper"><h2 class="title' + (alt ? ' title--' + (k + 1) : '') + '" lang="zh">' + esc(t).replace(/ /g, '<span class="pmSpace"> </span>') + '</h2></div></div>'; }).join(''); }

  /* ── 导航 ── */
  q('navName').textContent = C.name; q('navRole').textContent = C.role;
  q('navLinks').innerHTML = [['作品', 'index.html', 0], ['关于', 'about.html', 0], ['实验场', 'lab.html', 1]].map(function (l) {
    return '<a class="mainButton links__link' + (l[2] ? ' links__link--current' : '') + '" href="' + l[1] + '"' + (l[2] ? ' aria-current="page"' : ' data-pt') + '>' + esc(l[0]) + '</a>';
  }).join('');

  /* ── 首屏 ── */
  q('labText').innerHTML = esc(L.text) + en('Playground');
  q('labTitlesA').innerHTML = titlesHtml(L.titles); q('labTitlesB').innerHTML = titlesHtml(L.titlesAlt || L.titles, true);
  q('labHint').innerHTML = lines([L.indication || '']);

  /* ── 作品流：行位照原站 contentBlock__row--0…5（桌面栏位 / 宽高比 / 行尾错位） ── */
  var ROWS = [
    [{ col: '2 / span 4', ar: '454/641', px: -120 }, { col: '8 / span 4', ar: '454/301', end: '-7.57rem', px: 80 }],
    [{ col: '2 / span 4', ar: '454/641', px: 60 }, { col: '8 / span 5', ar: '573/380', end: '-12.14rem', px: -100 }],
    [{ col: '3 / span 4', ar: '454/301', px: -80 }, { col: '8 / span 4', ar: '454/641', px: 120 }],
    [{ col: '1 / span 4', ar: '307/217', px: 40 }, { text: true, col: '8 / span 4' }],   /* owner 2026-09-18：这格太小，2 栏→ 4 栏 */   /* owner 2026-09-17：这格改成横的小格——录屏和字体实验都是横的，横内容多过横格位了 */
    [{ col: '3 / span 3', ar: '335/473', top: '22.29rem', px: -120 }, { col: '8 / span 5', ar: '573/380', px: 80 }],
    [{ col: '10 / span 2', ar: '220/306', top: '-6rem', px: -60 }]
  ];
  /* ── 交互小案例（owner 2026-09-17 定的样子）：格子里放一小段示例视频，点开才是能上手的真页面。
        slot = 放在第几格（那一格的宽高比正好对得上这个案例），ar 用案例自己的比例覆盖格子的。 ── */
  /* 活页 / 视频 / 首帧都要带版本号：这些是 iframe 和 <video> 的地址，改了文件不带版本，
     浏览器照样吃旧的缓存（owner 那边球面菜单全屏一片黑，就是吃到了镜头还没拉远的那一版）。 */
  var V = '?v=5';
  var LIVE = {
    '悬停菜单': { hint: '鼠标划过每一行，盖板从最近那条边推进来', url: 'lab/case-menu.html' + V, video: 'assets/lab/menu.mp4' + V, poster: 'assets/lab/menu.jpg' + V, ar: '454/641', slot: 2 },
    '弧形画廊': { hint: '拖 / 滚轮 / 左右方向键都能用', url: 'lab/case-gallery.html' + V, video: 'assets/lab/gallery.mp4' + V, poster: 'assets/lab/gallery.jpg' + V, ar: '573/380', slot: 3 },
    '球面菜单': { hint: '拖动转球，松手吸附到正面那一张', url: 'lab/case-sphere.html' + V, video: 'assets/lab/sphere.mp4' + V, poster: 'assets/lab/sphere.jpg' + V, ar: '454/641', slot: 5 },
    '弹性滑块': { hint: '拖到头还能接着拖，松手会弹回来', url: 'lab/case-slider.html' + V, video: 'assets/lab/slider.mp4' + V, poster: 'assets/lab/slider.jpg' + V, ar: '573/380', slot: 8 },
    '弹跳卡片': { hint: '鼠标停在任意一张上，两边的卡会让开', url: 'lab/case-bounce.html' + V, video: 'assets/lab/bounce.mp4' + V, poster: 'assets/lab/bounce.jpg' + V, ar: '908/602', slot: 4 },
    '网站交互尝试': { video: 'assets/lab/site.mp4' + V, poster: 'assets/lab/site.jpg' + V, ar: '1280/800', slot: 1 }   /* 本站自己的交互录屏：只有视频，没有可点开的活页 */
  };
  /* 排布：有 slot 的先钉到指定格（那一格的宽高比正好配得上这个案例），
     其余的按 copy.js 里的原顺序依次填空位。用「钉位 + 填空」而不是逐个 splice——
     splice 会互相挤位，条数一变（文案会话把 10 条改成 9 条）就全乱。 */
  var src = (L.items || []).slice(), slotted = [], rest = [];
  src.forEach(function (it) { (LIVE[it.title] && LIVE[it.title].slot != null ? slotted : rest).push(it); });
  var items = [];
  slotted.forEach(function (it) { items[LIVE[it.title].slot] = it; });
  for (var si = 0, ri = 0; si < src.length; si++) if (!items[si]) items[si] = rest[ri++];
  items = items.filter(Boolean);
  var idx = 0, html = '';
  ROWS.forEach(function (row, r) {
    html += '<div class="gridWrapper hasPadding labRow labRow--' + r + '">';
    row.forEach(function (cell) {
      if (cell.text) { html += '<div class="labRow__text" style="grid-column:' + cell.col + '"><p class="rv">' + esc(L.paragraph || '') + '</p></div>'; return; }
      var it = items[idx++]; if (!it) return;
      var lv = LIVE[it.title];
      html += '<figure class="labMedia" style="grid-column:' + cell.col + (cell.end ? ';align-self:end;margin-bottom:' + cell.end : '') + (cell.top ? ';margin-top:' + cell.top : '') + '" data-px="' + cell.px + '">'
        + '<div class="labMedia__frame' + (lv ? ' labMedia__frame--live' : '') + '" style="aspect-ratio:' + (lv ? lv.ar : cell.ar) + '"><div class="labMedia__inner">'
        + (lv && lv.video ? '<video class="labMedia__live" data-src="' + esc(lv.video) + '" poster="' + esc(lv.poster || '') + '" muted loop playsinline preload="none" tabindex="-1" aria-label="' + esc(it.title) + ' 示例"></video>'
              : lv ? '<iframe class="labMedia__live" data-src="' + esc(lv.url) + '" tabindex="-1" scrolling="no" title="' + esc(it.title) + '"></iframe>'
              : it.src ? '<img src="' + esc(it.src) + '" alt="' + esc(it.title) + '" loading="lazy">'
              : '<div class="labMedia__soon"><b>未完待续</b>' + en('To be continued') + '</div>')
        + '</div>' + (lv && lv.url ? '<button class="labLive" type="button" data-live="' + esc(lv.url) + '" data-live-t="' + esc(it.title) + '"><span class="labLive__tag">点开可以自己上手</span></button>' : '')
        + '</div><figcaption class="labMedia__text"><span class="text__title">' + esc(it.title) + '</span><span class="text__date">' + esc(it.date || it.type || '') + '</span></figcaption></figure>';
    });
    html += '</div>';
  });
  q('labRows').innerHTML = html;

  /* 懒加载：进视口前 400px 才给 src；视频离开视口就暂停，别在后台空转 */
  function loadLive(f) { if (!f.src) f.src = f.getAttribute('data-src'); if (f.play) { var p = f.play(); p && p.catch && p.catch(function () {}); } }
  var fIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var f = e.target;
      if (e.isIntersecting) loadLive(f);
      else if (f.pause) f.pause();
    });
  }, { rootMargin: '400px 0px' }) : null;
  [].forEach.call(document.querySelectorAll('[data-src]'), function (f) { if (fIO) fIO.observe(f); else loadLive(f); });

  /* 点开 = 全屏浮层，里面那份带 ?i=1，可以点、可以拿鼠标推 */
  var stage = document.createElement('div');
  stage.className = 'pjStage pjStage--dark'; stage.hidden = true;
  stage.innerHTML = '<div class="pjStage__bg" data-close></div><div class="pjStage__box"><div class="pjStage__bar"><b id="labStageT"></b>'
    + '<span class="pjStage__hint" id="labStageHint"></span>'
    + '<a class="pjStage__btn" id="labStageNew" target="_blank" rel="noopener">在新窗口打开</a>'
    + '<button class="pjStage__btn" type="button" data-close>关闭</button></div><div class="pjStage__wrap" id="labStageWrap"></div></div>';
  document.body.appendChild(stage);
  function openStage(u, title) {
    document.getElementById('labStageWrap').innerHTML = '<iframe src="' + u + '" title="' + title + '"></iframe>';
    document.getElementById('labStageT').textContent = title;
    /* 提示按案例来：别写页面里没有的操作（owner：球面菜单没做滚轮，就别写滚轮） */
    document.getElementById('labStageHint').textContent = (LIVE[title] && LIVE[title].hint) || '这是真页面，直接上手';
    document.getElementById('labStageNew').href = u;
    stage.hidden = false; document.documentElement.classList.add('pjStage-on');
    lenis && lenis.stop();
    requestAnimationFrame(function () { stage.classList.add('is-on'); });
  }
  function closeStage() {
    stage.classList.remove('is-on'); document.documentElement.classList.remove('pjStage-on');
    lenis && lenis.start();
    setTimeout(function () { stage.hidden = true; document.getElementById('labStageWrap').innerHTML = ''; }, 260);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-live]');
    if (b) { e.preventDefault(); openStage(b.getAttribute('data-live'), b.getAttribute('data-live-t')); return; }
    if (e.target.closest && e.target.closest('.pjStage [data-close]')) closeStage();
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !stage.hidden) closeStage(); });

  /* ── 页脚（黄底）：大字与联系方式沿用关于页页脚的文字 ── */
  var F = (C.about && C.about.footer) || {};
  q('labFootA').innerHTML = titlesHtml(F.titles); q('labFootB').innerHTML = titlesHtml(F.titlesAlt || F.titles, true);
  q('labFootLeft').innerHTML = esc(C.name) + en('Contact');
  q('labFootLinks').innerHTML = (F.links || []).filter(function (l) { return l[2] === 'copy'; }).map(function (l) { return '<button class="footer__link" type="button" data-copy="' + esc(l[1]) + '">' + esc(l[0]) + '</button>'; }).join('<span class="footer__dot" aria-hidden="true"></span>');
  q('labFootCopy').textContent = F.copyright || '© 2026 ' + C.name;
  var toast = document.createElement('div'); toast.className = 'aboutToast'; document.body.appendChild(toast);
  document.addEventListener('click', function (e) {
    var bt = e.target.closest && e.target.closest('[data-copy]'); if (!bt) return;
    var v = bt.getAttribute('data-copy'), done = function () { toast.textContent = '已复制 ' + v; toast.classList.add('is-on'); clearTimeout(toast._t); toast._t = setTimeout(function () { toast.classList.remove('is-on'); }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, done); else done();
  });

  /* ── 平滑滚动 ── */
  var lenis = null;
  if (!reduce && window.Lenis) { lenis = new Lenis({ lerp: .085, smoothWheel: true, syncTouch: true, wheelMultiplier: .45 }); window.__v7lenis = lenis; gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ── 大字换组（同首页 / 关于页） ── */
  function beeTitles(boxId, aId, bId, onSwap) {
    var A = [].slice.call(q(aId).querySelectorAll('.title')), B = [].slice.call(q(bId).querySelectorAll('.title')), alt = false, shown = false, tl = null;
    A.concat(B).forEach(function (el, k) { gsap.set(el, { y: '100%', x: (k % 3) % 2 ? '-5%' : '5%', force3D: true }); });
    function show(delay) {
      if (shown) return; shown = true;
      var t = gsap.timeline({ delay: delay == null ? .115 : delay });
      A.forEach(function (el, k) { t.fromTo(el, { y: '100%', x: k % 2 ? '-5%' : '5%' }, { y: '0%', x: '0%', ease: 'reveal', duration: 1, force3D: true }, k * .115); });
    }
    function swap() {
      if (!shown) return;
      var out = alt ? B : A, inn = alt ? A : B; alt = !alt;
      tl && tl.kill(); tl = gsap.timeline();
      out.forEach(function (el, k) {
        tl.to(el, { y: '100%', x: k % 2 ? '-5%' : '5%', ease: 'power4.inOut', duration: 1.5, force3D: true }, k * .115);
        tl.to(inn[k], { y: '0%', x: '0%', ease: 'reveal', duration: 2, force3D: true }, k * .1 + .63);
      });
      onSwap && onSwap();
    }
    q(boxId).addEventListener('click', swap);
    return { show: show, swap: swap, el: q(boxId) };
  }
  var tiger = null;
  var heroT = beeTitles('labBox', 'labTitlesA', 'labTitlesB', function () { tiger && tiger.jump(); });
  var footT = beeTitles('labFootBox', 'labFootA', 'labFootB', function () { tiger && tiger.jump(); });
  gsap.set(q('labHint').querySelectorAll('.line'), { y: 0, yPercent: 110 });

  /* ── 进场：整块 scale .65 → 1（原站 INITIAL_LOAD 2.5s expo.inOut；PAGE_TRANSITION 2s expo.out 从 0） ── */
  var inner = q('labHeroInner'), started = false;
  gsap.set(inner, { scale: .65, transformOrigin: '50% 50%' });
  function start(fromTransition) {
    if (started) return; started = true;
    window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    if (fromTransition) gsap.fromTo(inner, { scale: 0 }, { scale: 1, duration: 2, ease: 'expo.out' });
    else gsap.to(inner, { scale: 1, duration: reduce ? 0 : 2.5, ease: 'expo.inOut' });
    heroT.show(fromTransition ? .35 : .9);
    gsap.to(q('labHint').querySelectorAll('.line'), { yPercent: 0, duration: 1.125, ease: 'reveal', delay: fromTransition ? 1 : 1.6 });
    gsap.fromTo(q('labText'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1, ease: 'reveal', delay: fromTransition ? .2 : .7 });
  }
  if (window.V7Transition && window.V7Transition.isArriving()) addEventListener('v7:pt-exit-start', function () { start(true); }, { once: true });
  else if (document.readyState === 'complete') start(false); else addEventListener('load', function () { start(false); }, { once: true });
  setTimeout(function () { start(false); }, 2500);

  /* ── 行距自适应：原站那套错位（align-self:end + 负 margin）会让上一行的卡片探进下一行，
        再叠上视差最大位移，下一行的图就会盖住上一行的标题（owner：下边压住上边了）。
        这里按「上一行标题的最低沿 + 两边视差最大位移 + 24px 安全区」重算每一行的下边距，
        只加不减，错位的观感保留。 ── */
  var SAFE = 24;
  function fixRows() {
    var rows = [].slice.call(document.querySelectorAll('.labRow'));
    var all = [].slice.call(document.querySelectorAll('.labMedia'));
    var keep = all.map(function (m) { var t = m.style.transform; m.style.transform = 'none'; return t; });   /* 先把视差摘掉再量 */
    rows.forEach(function (r) { r.style.marginBottom = ''; });
    for (var i = 0; i < rows.length - 1; i++) {
      var need = 0;
      [].forEach.call(rows[i].querySelectorAll('.labMedia'), function (m) {
        var cap = m.querySelector('.labMedia__text'); if (!cap) return;
        var cr = cap.getBoundingClientRect(), pa = Math.abs(+m.getAttribute('data-px') || 0) / 2;
        [].forEach.call(rows[i + 1].querySelectorAll('.labMedia'), function (n) {
          var fr = n.querySelector('.labMedia__frame').getBoundingClientRect();
          if (Math.min(fr.right, cr.right) - Math.max(fr.left, cr.left) <= 1) return;   /* 不同列，压不着 */
          var pb = Math.abs(+n.getAttribute('data-px') || 0) / 2;
          var gap = fr.top - cr.bottom - pa - pb;
          if (gap < SAFE) need = Math.max(need, SAFE - gap);
        });
      });
      if (need > 0) rows[i].style.marginBottom = (parseFloat(getComputedStyle(rows[i]).marginBottom) + need).toFixed(1) + 'px';
    }
    all.forEach(function (m, k) { m.style.transform = keep[k]; });
  }
  fixRows();
  addEventListener('load', fixRows);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fixRows);
  var rzT; addEventListener('resize', function () { clearTimeout(rzT); rzT = setTimeout(fixRows, 160); });

  /* ── 滚动：作品视差 + 遮罩收拢、文字进场、页脚大字进场 ── */
  var medias = [].slice.call(document.querySelectorAll('.labMedia')), rv = [].slice.call(document.querySelectorAll('.lab .rv, .labMedia__text'));
  if (!reduce) gsap.set(rv, { opacity: 0, y: 14 });
  var footShown = false;
  function tick() {
    var vh = innerHeight;
    medias.forEach(function (m) {
      var r = m.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      var p = (vh - r.top) / (vh + r.height);                            /* 0 → 1 穿过视口 */
      var amt = +m.getAttribute('data-px') || 0;
      m.style.transform = reduce ? '' : 'translate3d(0,' + ((p - .5) * amt).toFixed(1) + 'px,0)';
      var e = Math.max(0, Math.min(1, (vh - r.top) / (vh * .7)));        /* 进视口 70% 屏高内完成揭开 */
      var fr = m.firstChild; fr.style.clipPath = 'inset(' + ((1 - e) * 9).toFixed(2) + '% round .43rem)';
      fr.firstChild.style.transform = 'scale(' + (1 + (1 - e) * .125).toFixed(4) + ')';
    });
    for (var i = rv.length - 1; i >= 0; i--) { var b = rv[i].getBoundingClientRect(); if (b.top < vh * .92) { gsap.to(rv[i], { opacity: 1, y: 0, duration: .9, ease: 'reveal' }); rv.splice(i, 1); } }
    if (!footShown && q('labFootBox').getBoundingClientRect().top < vh * .85) { footShown = true; footT.show(); }
  }
  gsap.ticker.add(tick);

  /* ════════ 小老虎 ════════ */
  var cvs = q('labTiger');
  if (THREE && window.V7Tiger) {
    try {
      var renderer = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 100); cam.position.set(0, 0, 20);
      scene.add(new THREE.HemisphereLight(0xfff6d8, 0x8a6a1a, 1.6));
      var key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 8); scene.add(key);
      var rim = new THREE.DirectionalLight(0xfff0a0, 1); rim.position.set(-6, 2, -4); scene.add(rim);
      tiger = window.V7Tiger.create(); scene.add(tiger.group);
      var halfH = Math.tan(15 * Math.PI / 180) * 20;   /* z=0 平面可视半高 */
      var W = 1, H = 1;
      function size() { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); }
      size(); addEventListener('resize', size);
      function toWorld(px, py) { var k = halfH * 2 / H; return [(px - W / 2) * k, -(py - H / 2) * k]; }
      var pos = { x: W * .7, y: H * .3, s: 0, face: -1 }, target = { x: W * .7, y: H * .3, s: 1, face: -1 }, mouse = [0, 0];
      /* owner 2026-09-16：「他自己本身也会缓慢行走，在自身周围逛，滚动只是他会跟着下来」。
         anchor = 滚动决定的落脚区域；wander = 在 anchor 周围自己挑点慢慢遛，走到了停一会儿再挑下一个。 */
      var wander = { x: 0, y: 0, tx: 0, ty: 0, wait: .8 };
      addEventListener('pointermove', function (e) { mouse = [e.clientX, e.clientY]; }, { passive: true });

      /* 点小老虎：射线检测（画布不接收事件，页面照常可点） */
      var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
      addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('a,button,.beeBlock__container')) return;
        ndc.set(e.clientX / W * 2 - 1, -(e.clientY / H) * 2 + 1); ray.setFromCamera(ndc, cam);
        if (ray.intersectObject(tiger.group, true).length) {
          var fr = q('labFoot' + 'Box').getBoundingClientRect();
          if (fr.top < H && fr.bottom > 0) footT.swap(); else if (q('labBox').getBoundingClientRect().bottom > 0) heroT.swap(); else tiger.jump();
        }
      });

      var last = performance.now(), t0 = last, flyS = 0, pitch = 0;
      function sm(x) { x = Math.max(0, Math.min(1, x)); return x * x * x * (x * (x * 6 - 15) + 10); }   /* 原站的 Sr：smoothstep */
      function seg(p, a, b, va, vb) { return va + (vb - va) * sm((p - a) / (b - a)); }
      gsap.ticker.add(function () {
        var now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; var t = (now - t0) / 1000;
        var hero = q('labBox').getBoundingClientRect(), content = q('labContent').getBoundingClientRect(), foot = q('labFootBox').getBoundingClientRect();
        var size = Math.max(54, Math.min(96, W * .056));   /* owner 2026-09-16：小老虎改小一点 */
        var ancX, ancY, ancFace, sky = 0, inFlow = false;
        if (hero.bottom > H * .25) {                      /* 首屏：跟大字一起出现，站在大字旁边，不占角落 */
          ancX = hero.left + hero.width * .78; ancY = hero.bottom - hero.height * .12; ancFace = -1;
        } else if (foot.top < H * .9) {                  /* 页脚：大字左上，另起一段 */
          ancX = foot.left + foot.width * .06; ancY = foot.top + foot.height * .05; ancFace = 1;
        } else {
          inFlow = true;
          /* 作品流：照原站蜜蜂那条轨迹（lpmain.js 的常量）——
             竖直 从画面上方 +2.65 halfCam 飞进来 → 穿过作品流时归零 → 收尾降到 −2.3 halfCam 从下方出去；
             水平 −0.5 →(.4) +1.55 →(.6) +1.75 →(1) −0.9；缓动用 smoothstep 6t⁵−15t⁴+10t³，不是线性；
             高度 approach 在 .52 升满、.55 开始回落、.85 归零，skyZ = 5×approach：中途拔高远离画面、再俯冲下来。 */
          var pa = Math.max(0, Math.min(1, (-content.top + H * .08) / Math.max(1, content.height - H + H * .43)));
          var uW = pa < .14 ? seg(pa, 0, .14, 2.65, 0) : (pa > .88 ? seg(pa, .88, 1, 0, -2.3) : 0);
          var aW = pa < .4 ? seg(pa, 0, .4, -.5, 1.55) : (pa < .6 ? seg(pa, .4, .6, 1.55, 1.75) : seg(pa, .6, 1, 1.75, -.9));
          var aW2 = pa + .004 < .4 ? seg(pa + .004, 0, .4, -.5, 1.55) : (pa + .004 < .6 ? seg(pa + .004, .4, .6, 1.55, 1.75) : seg(pa + .004, .6, 1, 1.75, -.9));
          var appr = pa <= .52 ? sm(pa / .52) : (pa < .55 ? 1 : (pa < .85 ? 1 - sm((pa - .55) / .3) : 0));
          sky = 5 * appr;
          var HC = H * .5, hx = Math.min(HC, W * .5 / 1.82);   /* 水平也按 halfCam 算，缩一点让最右刚好不出屏 */
          ancX = W * .5 + aW * hx;
          ancY = H * .5 - uW * HC;
          ancFace = aW2 >= aW ? 1 : -1;                        /* 朝着飞行方向 */
        }
        flyS += (sky - flyS) * Math.min(1, dt * 5);
        /* 自己遛弯：anchor 周围随机挑点，走到了歇一会儿 */
        var fly = Math.min(1, flyS / 5);
        var rx = size * 2.1 * (1 - fly * .85), ry = size * .85 * (1 - fly * .85);
        if (wander.wait > 0) { wander.wait -= dt; }
        else {
          var wdx = wander.tx - wander.x, wdy = wander.ty - wander.y, wd = Math.sqrt(wdx * wdx + wdy * wdy);
          if (wd < 3) { wander.tx = (Math.random() * 2 - 1) * rx; wander.ty = (Math.random() * 2 - 1) * ry; wander.wait = .5 + Math.random() * 2.2; }
          else { var v = Math.min(wd, 44 * dt); wander.x += wdx / wd * v; wander.y += wdy / wd * v; }
        }
        var mg = size * .95;
        /* 作品流那一段要能从画面上方进、下方出，所以竖直方向不夹在屏内 */
        var loY = inFlow ? -H * .8 : mg, hiY = inFlow ? H * 1.8 : H - mg;
        target.x = Math.max(mg, Math.min(W - mg, ancX + wander.x));
        target.y = Math.max(loY, Math.min(hiY, ancY + wander.y));
        var k = 1 - Math.pow(1 - .06, dt * 60), px0 = pos.x, py0 = pos.y;
        pos.x += (target.x - pos.x) * k; pos.y += (target.y - pos.y) * k;
        /* 走多快 → 腿摆多大；朝向跟着走的方向，站住了再转回锚点朝向 */
        var vx = pos.x - px0, vy = pos.y - py0, vpx = Math.sqrt(vx * vx + vy * vy) / Math.max(dt, .001);
        tiger.setSpeed && tiger.setSpeed(Math.min(1, vpx / (size * 2.2)));
        target.face = Math.abs(vx) > dt * 9 ? (vx > 0 ? 1 : -1) : ancFace;
        pos.face += (target.face - pos.face) * (1 - Math.pow(1 - .08, dt * 60));
        pos.s += ((started ? 1 : 0) - pos.s) * (1 - Math.pow(1 - .05, dt * 60));
        var w = toWorld(pos.x, pos.y), scale = size / H * halfH * 2 / 2.4 * pos.s / (1 + flyS * .09);   /* 拔高 = 离画面远 = 变小 */
        tiger.group.position.set(w[0], w[1], 0); tiger.group.scale.setScalar(Math.max(.0001, scale));
        tiger.group.rotation.y = pos.face > 0 ? (1 - pos.face) * Math.PI / 2 : Math.PI - (1 + pos.face) * Math.PI / 2;   /* 朝向：1 朝右，-1 朝左 */
        pitch += (Math.max(-.34, Math.min(.34, -vy / Math.max(1, size * 2.6))) * (pos.face > 0 ? 1 : -1) - pitch) * Math.min(1, dt * 5);
        tiger.group.rotation.x = .15;
        tiger.group.rotation.z = pitch;                                                   /* 俯冲抬头，按路径曲率来 */
        tiger.lookAt((mouse[0] - pos.x) / W * 2 * (pos.face > 0 ? 1 : -1), (pos.y - mouse[1]) / H * 2);
        tiger.update(dt, t);
        renderer.render(scene, cam);
      });
    } catch (err) { cvs.style.display = 'none'; }
  }

  window.__v7lab = { tiger: function () { return tiger; }, hero: heroT, foot: footT };
})();

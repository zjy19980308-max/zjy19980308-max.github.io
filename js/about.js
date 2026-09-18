/* about.js —— v7 关于页。维护：网站交互调整。
   结构与动效照原站 leoparpeix.com/about（逐屏截帧 + 包里常量），内容是 owner 自己的（js/copy.js 的 V7.about）。
   ① 首屏：浅灰底上一个大的 3D 金色标志（owner 的 Figma logo），慢转 + 跟鼠标轻微倾斜；从切场过来时按原站 PAGE_TRANSITION 从 0 放大（2s expo.out）；滚动时镜头推近、淡出。左下三行字同首页。
   ② 深绿大字屏 #083D2A、米色字 #EED6C8：上方三段信息，三行大字进视口后错位升起，点一下换一组（同首页大字参数）。
   ③ 大照片：进视口时遮罩从 10% 收到 0、图片从 1.1 缩到 1（原站 parallax-mask 10 / scale .1）；下面地点、时间、署名一行，再两段居中文字。
   ④ 大字宣言：原站 flowersBlock，8 行大字左右错开，指定行后面嵌小标志（原站是 3D 小花），逐行进场。
   ⑤ 经历卡片：白卡片按年份列经历，当前那条带黄色标签。
   ⑥ 产出与模块：左边大字一句 + 肖像 + 两段；右边「可核对的产出」计数表、「做过的模块」两列名单。
   ⑦ 页脚：深绿底三行大字，点一下换一组；底部联系方式可复制。 */
(function () {
  'use strict';
  var C = window.V7, gsap = window.gsap, THREE = window.THREE;
  /* 文案会话随时会改 copy.js 的值和字段；这里给每个字段兜底，缺了也不让页面崩 */
  var A = (function (a) {
    a = a || {};
    function o(x) { return x || {}; }
    var d = {
      header: o(a.header), hero: o(a.hero), intro: o(a.intro), statement: o(a.statement), profile: o(a.profile), strengths: o(a.strengths), experience: o(a.experience), recognition: o(a.recognition), footer: o(a.footer)
    };
    d.header.lines = d.header.lines || []; d.hero.titles = d.hero.titles || []; d.hero.titlesAlt = d.hero.titlesAlt || d.hero.titles;
    d.intro.texts = d.intro.texts || []; d.statement.lines = d.statement.lines || [];
    d.statement.logoAfter = d.statement.logoAfter || [1, 4, 7];   /* 第几行后面插小标志（从 0 数）；文案没给就按原站第 2、5、8 行 */
    d.experience.items = d.experience.items || []; d.profile.rows = d.profile.rows || []; d.profile.tags = d.profile.tags || []; d.strengths.items = d.strengths.items || [];
    /* recognition 两种写法都认：{ stats: [[名, 数]…], statsTitle, list: [名…], listTitle, paragraphs } 或 { stats: { title, rows }, list: { title, names }, paragraph: [...] } */
    var r = d.recognition, st = r.stats, li = r.list;
    r.paragraphs = r.paragraphs || (Array.isArray(r.paragraph) ? r.paragraph : (r.paragraph ? [r.paragraph] : []));
    r.statsTitle = r.statsTitle || (st && !Array.isArray(st) ? st.title : '') || '';
    r.stats = Array.isArray(st) ? st : ((st && st.rows) || []);
    r.statsTotal = r.statsTotal || '（' + r.stats.length + '）';
    r.listTitle = r.listTitle || (li && !Array.isArray(li) ? li.title : '') || '';
    r.list = Array.isArray(li) ? li : ((li && li.names) || []);
    /* owner 2026-09-16：名单要分组（产品 / 平台模块）。两种写法都认 ——
       groups: [{ title, names: [...] }, ...]，或者老的扁平 list（自动当成一组，不显示小标题）。 */
    r.groups = Array.isArray(r.groups) && r.groups.length
      ? r.groups.map(function (g) { return { title: g.title || '', names: g.names || [] }; })
      : (r.list.length ? [{ title: '', names: r.list }] : []);
    d.footer.titles = d.footer.titles || []; d.footer.titlesAlt = d.footer.titlesAlt || d.footer.titles; d.footer.links = d.footer.links || [];
    return d;
  })(C.about);
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bez(p0, p1, p2, p3) {
    function a(x, y) { return 1 - 3 * y + 3 * x; } function b(x, y) { return 3 * y - 6 * x; } function c(x) { return 3 * x; }
    function calc(t, x, y) { return ((a(x, y) * t + b(x, y)) * t + c(x)) * t; } function slope(t, x, y) { return 3 * a(x, y) * t * t + 2 * b(x, y) * t + c(x); }
    return function (x) { var t = x; for (var i = 0; i < 8; i++) { var s = slope(t, p0, p2); if (!s) break; t -= (calc(t, p0, p2) - x) / s; } return calc(t, p1, p3); };
  }
  gsap.registerEase('reveal', bez(.4, 0, 0, 1));
  function q(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function lines(arr) { return arr.map(function (l) { return '<span class="line-mask" aria-hidden="true"><span class="line">' + esc(l) + '</span></span>'; }).join(''); }
  function splitLines(p) {   /* 按真实排版断行（原站 SplitText） */
    var text = p.textContent, toks = text.match(/[A-Za-z0-9@_%.\-]+|\s+|[\s\S]/g) || [];
    p.innerHTML = toks.map(function (t) { return '<span class="tk">' + esc(t) + '</span>'; }).join('');   /* 空格也包起来，断行后拼回时不丢（「AI 产品」不会变成「AI产品」） */
    var rows = [], last = null;
    [].forEach.call(p.querySelectorAll('.tk'), function (sp) { var r0 = sp.getBoundingClientRect(); if (/^\s+$/.test(sp.textContent) && rows.length) { if (r0.width) rows[rows.length - 1].push(sp.textContent); return; } var top = Math.round(r0.top); if (last === null || Math.abs(top - last) > 2) { rows.push([]); last = top; } rows[rows.length - 1].push(sp.textContent); });
    p.setAttribute('aria-label', text); p.innerHTML = lines(rows.map(function (r) { return r.join(''); }));
  }
  function titlesHtml(arr, alt) { return arr.map(function (t, k) { return '<div class="titles__wrapper"><div class="wrapper"><h2 class="title' + (alt ? ' title--' + (k + 1) : '') + '" lang="zh">' + esc(t) + '</h2></div></div>'; }).join(''); }
  var LOGO_SVG = 'assets/logo/figma-1079-2599.svg';
  /* 英文点缀（owner：不重要的位置加一点英文做陪衬）：小号、弱化，只装饰不承载信息，所以写在结构里、不进 copy.js */
  function en(t) { return '<span class="enTag" lang="en" aria-hidden="true">' + esc(t) + '</span>'; }
  [].forEach.call(document.querySelectorAll('.sectionTag[data-en]'), function (el) { el.innerHTML = en('(' + el.getAttribute('data-en') + ')'); });

  /* ── 填字 ── */
  q('navName').textContent = C.name; q('navRole').textContent = C.role;
  var navLinks = [['作品', 'index.html', false], ['关于', 'about.html', true], ['实验场', 'lab.html', false]];
  q('navLinks').innerHTML = navLinks.map(function (l) { return '<a class="mainButton links__link' + (l[2] ? ' links__link--current' : '') + '" href="' + l[1] + '"' + (l[2] ? ' aria-current="page"' : ' data-pt') + '>' + esc(l[0]) + '</a>'; }).join('');

  q('abHeader').innerHTML = lines(A.header.lines); q('abScroll').innerHTML = '<span class="line-mask"><span class="line">' + esc(A.header.scroll) + en('Scroll down') + '</span></span>';
  q('abHeroLeft').textContent = A.hero.left; q('abHeroCenter').textContent = A.hero.center; q('abHeroRight').textContent = A.hero.right;
  q('abTitlesA').innerHTML = titlesHtml(A.hero.titles, false); q('abTitlesB').innerHTML = titlesHtml(A.hero.titlesAlt, true);
  q('abHint').innerHTML = lines([A.hero.indication]);
  q('abPlace').innerHTML = esc(A.intro.place) + en('Beijing, CN'); q('abDate').textContent = A.intro.date; q('abCredit').innerHTML = esc(A.intro.credit) + en('Product Designer');
  q('abTexts').innerHTML = A.intro.texts.map(function (t) { return '<div class="textComponent"><p class="textComponent__content" data-split>' + esc(t) + '</p></div>'; }).join('');

  /* 大字屏：owner 要求左对齐（不用原站的左右错落），指定行后插小标志 */
  q('abLines').innerHTML = '<p class="statement__lead textComponent"><span class="textComponent__content" data-split>' + esc(A.statement.lead) + '</span></p><p class="sectionTag">' + en('(Strengths)') + '</p>'
    + A.statement.lines.map(function (t, k) {
      var logoAfter = A.statement.logoAfter.indexOf(k) >= 0;
      return '<div class="statement__line"><span class="line-mask"><span class="line"><span class="line__title">' + esc(t) + '</span>' + (logoAfter ? '<img class="line__logo" src="' + LOGO_SVG + '" alt="">' : '') + '</span></span></div>';
    }).join('')
    + '<p class="statement__tail textComponent"><span class="textComponent__content" data-split>' + esc(A.statement.tail) + '</span></p>';

  var P = A.profile;   /* 基本信息：排法照 v1 .about-meta（左标签灰、右值、带「复制」按钮），放在页脚 */
  q('abProfileRows').innerHTML = P.rows.map(function (r) {
    var copy = /^copy:/.test(r[2] || '') ? r[2].slice(5) : '';
    return '<dt>' + esc(r[0]) + '</dt><dd><span class="am-val">' + esc(r[1]) + '</span>' + (copy ? '<button type="button" class="am-copy" data-copy="' + esc(copy) + '" aria-label="复制' + esc(r[0]) + '">复制</button>' : '') + '</dd>';
  }).join('');
  q('abTagsTitle').textContent = P.tagsTitle || '';
  q('abProfileTags').innerHTML = P.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');

  var S = A.strengths;   /* 个人优势：排法照 v1 .about-str-list */
  q('abStrTitle').textContent = S.title || '';
  q('abStrList').innerHTML = S.items.map(function (it) { return '<li class="rv"><b>' + esc(it[0]) + '</b>' + esc(it[1]) + '</li>'; }).join('');

  var E = A.experience;
  /* 经历卡：卡片里用 v1 工作经历的三栏排法（时间 + 职位 ｜ 公司 ｜ 条目） */
  q('abCard').innerHTML = '<div class="card__top"><span class="card__badge"><i></i>' + esc(E.badge) + '</span><span class="card__count">(' + E.items.length + ')</span></div>'
    + '<div class="v1Head"><h2 class="v1Head__title">' + esc(E.title) + '</h2><span class="v1Head__en" lang="en">WORK EXPERIENCE</span></div>'
    + E.items.map(function (it) {
      return '<div class="about-exp-item rv"><div class="ae-date">' + esc(it[0]) + (it[3] ? en('Now') : '') + '<span>' + esc(it[2]) + '</span></div>'
        + '<div class="ae-co">' + esc(it[1]) + '</div>'
        + '<ul class="ae-bullets">' + (it[4] || []).map(function (pt) { return '<li><b>' + esc(pt[0]) + '</b>' + esc(pt[1]) + '</li>'; }).join('') + '</ul></div>';
    }).join('');

  var R = A.recognition;
  q('abRecStatement').textContent = R.statement;   /* owner：正常写标题「做过的项目」，不要大字宣言 */
  q('abRecParas').innerHTML = [].map(function (t, k) { return '<div class="textComponent left__text left__text--' + k + '"><p class="textComponent__content" data-split>' + esc(t) + '</p></div>'; }).join('');
  q('abStats').remove();   /* owner：「可核对的数」整块不要 */

  /* 名字带括注的（AI Workflow Agent（工作流与审批））在两列里放不下，实测要 336px、一列只有 252px。
     不硬塞也不截断：括注拆到第二行，小一号、弱一点，看起来是有意排的。没有括注的条目不受影响。 */
  function recItem(n) {
    var m = /^(.*?)（(.+)）$/.exec(n);
    return m
      ? '<li class="rv"><span class="li__main">' + esc(m[1].trim()) + '</span><span class="li__note">' + esc(m[2]) + '</span></li>'
      : '<li class="rv">' + esc(n) + '</li>';
  }
  /* 每一组自己两列铺开；只有一组且没标题时，跟原来一模一样 */
  q('abList').innerHTML = R.groups.map(function (g) {
    var half = Math.ceil(g.names.length / 2);
    return '<div class="recGroup">'
      + (g.title ? '<h4 class="recGroup__t rv">' + esc(g.title) + '<em>' + g.names.length + '</em></h4>' : '')
      + '<div class="list__wrapper"><ul>' + g.names.slice(0, half).map(recItem).join('') + '</ul>'
      + '<ul>' + g.names.slice(half).map(recItem).join('') + '</ul></div></div>';
  }).join('');

  var F = A.footer;
  q('abFootA').innerHTML = titlesHtml(F.titles, false); q('abFootB').innerHTML = titlesHtml(F.titlesAlt, true);
  q('abFootLeft').innerHTML = esc(C.name) + en('Contact');
  q('abFootLinks').innerHTML = F.links.filter(function (l) { return l[2] !== 'link'; }).map(function (l) {
    return l[2] === 'copy' ? '<button class="footer__link" type="button" data-copy="' + esc(l[1]) + '">' + esc(l[0]) + '</button>' : '<a class="footer__link" href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(l[0]) + ' ↗</a>';
  }).join('<span class="footer__dot" aria-hidden="true"></span>');
  q('abFootCopy').textContent = F.copyright;

  [].forEach.call(document.querySelectorAll('[data-split]'), splitLines);
  gsap.set(document.querySelectorAll('.line'), { y: 0, yPercent: 110, force3D: true });   /* 先把 CSS 的 translateY(110%) 换算出的像素偏移清零，否则只动 yPercent 回不到原位 */

  /* ── 平滑滚动（原站 Lenis lerp .085） ── */
  var lenis = null;
  if (!reduce && window.Lenis) { lenis = new Lenis({ lerp: .085, smoothWheel: true, syncTouch: !matchMedia('(pointer:coarse)').matches, wheelMultiplier: .45 }); window.__v7lenis = lenis; gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
  function scrollY() { return lenis ? lenis.animatedScroll : window.scrollY; }

  /* ── 文字进场（原站 TextComponent：yPercent 110 → 0，1.125s，交错 .1，reveal） ── */
  function revealLines(el, opts) {
    opts = opts || {}; if (!el || el.dataset.in) return; el.dataset.in = '1';
    var ls = el.classList.contains('line') ? [el] : el.querySelectorAll('.line'); if (!ls.length) return;
    gsap.to(ls, { y: 0, yPercent: 0, duration: opts.duration || 1.125, ease: 'reveal', stagger: opts.stagger != null ? opts.stagger : .1, delay: opts.delay || 0, force3D: true });
  }

  /* ── 大字进场与换组（同首页：y 100% x ±5% → 0，1s，交错 .115；换组 出 1.5s power4.inOut / 进 2s reveal） ── */
  function beeTitles(boxId, aId, bId) {
    var Aset = [].slice.call(q(aId).querySelectorAll('.title')), Bset = [].slice.call(q(bId).querySelectorAll('.title')), alt = false, shown = false, tl = null;
    Aset.concat(Bset).forEach(function (el, k) { gsap.set(el, { y: '100%', x: (k % 3) % 2 ? '-5%' : '5%', force3D: true }); });
    function show() {
      if (shown) return; shown = true;
      var t = gsap.timeline({ delay: .115 });
      Aset.forEach(function (el, k) { t.fromTo(el, { y: '100%', x: k % 2 ? '-5%' : '5%' }, { y: '0%', x: '0%', ease: 'reveal', duration: 1, force3D: true }, k * .115); });
    }
    q(boxId).addEventListener('click', function () {
      if (!shown) return;
      var out = alt ? Bset : Aset, inn = alt ? Aset : Bset; alt = !alt;
      tl && tl.kill(); tl = gsap.timeline();
      out.forEach(function (el, k) {
        tl.to(el, { y: '100%', x: k % 2 ? '-5%' : '5%', ease: 'power4.inOut', duration: 1.5, force3D: true }, k * .115);
        tl.to(inn[k], { y: '0%', x: '0%', ease: 'reveal', duration: 2, force3D: true }, k * .1 + .63);
      });
    });
    return { show: show, el: q(boxId) };
  }
  var heroBee = beeTitles('abBeeBox', 'abTitlesA', 'abTitlesB');
  var footBee = beeTitles('abFootBox', 'abFootA', 'abFootB');

  /* ── 滚动触发 ── */
  var watch = [];
  function onView(el, fn, ratio) { if (el) watch.push({ el: el, fn: fn, ratio: ratio == null ? .92 : ratio }); }
  onView(q('abHeroCenter'), function () { gsap.fromTo([q('abHeroLeft'), q('abHeroCenter'), q('abHeroRight')], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .9, stagger: .08, ease: 'reveal' }); });
  onView(heroBee.el, heroBee.show, .8);
  onView(q('abHint'), function () { revealLines(q('abHint')); });
  [].forEach.call(document.querySelectorAll('#abTexts .textComponent, .statement__lead, .statement__tail, #abRecParas .textComponent'), function (el) { onView(el, function () { revealLines(el); }); });
  [].forEach.call(document.querySelectorAll('.statement__line .line'), function (el) { onView(el.parentNode, function () { revealLines(el, { duration: 1.2 }); }, .96); });
  [].forEach.call(document.querySelectorAll('.rv'), function (el) { gsap.set(el, { opacity: 0, y: 14 }); onView(el, function () { gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'reveal' }); }); });
  onView(q('abCard'), function () { gsap.fromTo(q('abCard'), { y: 80, rotate: -3, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 1.2, ease: 'reveal' }); }, .85);
  onView(footBee.el, footBee.show, .85);
  /* 大照片：遮罩收拢 + 图片缩放（原站 parallax-mask 10 / scale .1），随滚动持续变化 */
  var media = q('abMedia'), mediaImg = media.querySelector('img');
  function mediaScroll() {
    var r = media.getBoundingClientRect(), vh = innerHeight, p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
    var inset = Math.max(0, 10 - p * 22);   /* 进来时两侧各收 10%，到中段完全展开 */
    media.style.clipPath = 'inset(' + (inset * .5).toFixed(2) + '% ' + inset.toFixed(2) + '% round .43rem)';
    mediaImg.style.transform = 'scale(' + (1.03 - p * .03).toFixed(4) + ') translateY(' + ((p - .5) * -1.5).toFixed(2) + '%)';   /* owner：完整显示照片，视差缩放减到 3% */
  }

  /* 工牌的洞：进视口后随滚动从小变大（滚一点大一点，scroll-linked，不是一次性动画） */
  var hole = q('lanyard');
  function holeScroll() {
    if (!hole || hole.style.display === 'none') return;
    var r = hole.getBoundingClientRect(), vh = innerHeight;
    var p = Math.max(0, Math.min(1, (vh - r.top) / (vh * .75)));   /* 洞顶到视口底 → 0；再往上滚 75% 屏高 → 1 */
    var e = 1 - Math.pow(1 - p, 2), iv = (1 - e) * 30, ih = (1 - e) * 34;
    hole.style.clipPath = 'inset(' + iv.toFixed(2) + '% ' + ih.toFixed(2) + '% round ' + (1 + (1 - e) * 1.5).toFixed(2) + 'rem)';
  }

  /* 首屏文字视差（同首页 HeaderBlock） */
  var header = q('header'), hc = q('headerContent');
  function headerScroll(sy) {
    var h = header.offsetHeight, p = Math.max(0, Math.min(1, sy / h));
    if (p <= 0) { hc.style.transform = ''; hc.style.opacity = ''; return; }
    hc.style.transform = 'translateY(' + (p * 800) + '%)'; hc.style.opacity = String(1 - Math.max(0, Math.min(1, (p - .2) / .25)));
  }

  var started = false;
  function tick() {
    var sy = scrollY(), vh = innerHeight;
    headerScroll(sy); mediaScroll(); holeScroll();
    /* 导航压在深绿区上时变米色 */
    var navDark = false; [q('abHero'), q('abIntro'), q('abStatement'), q('abStrengths'), q('abExp'), q('abRecog'), q('abFooter')].some(function (s) { var r = s.getBoundingClientRect(); if (r.top <= 40 && r.bottom >= 40) { navDark = true; return true; } return false; });
    q('nav').classList.toggle('is-dark', navDark);
    if (!started) return;
    for (var i = watch.length - 1; i >= 0; i--) { var b = watch[i].el.getBoundingClientRect(); if (b.top < vh * watch[i].ratio) { watch[i].fn(); watch.splice(i, 1); } }
  }
  gsap.ticker.add(tick);

  /* ── 复制联系方式 ── */
  var toast = document.createElement('div'); toast.className = 'aboutToast'; document.body.appendChild(toast);
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]'); if (!b) return;
    var v = b.getAttribute('data-copy'), done = function () { toast.textContent = '已复制 ' + v; if (b.classList.contains('am-copy')) { b.textContent = '已复制'; b.classList.add('is-done'); clearTimeout(b._t); b._t = setTimeout(function () { b.textContent = '复制'; b.classList.remove('is-done'); }, 1600); } toast.classList.add('is-on'); clearTimeout(toast._t); toast._t = setTimeout(function () { toast.classList.remove('is-on'); }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, done); else done();
  });

  /* ════════ ① 首屏：方块场景 + 正中 3D logo 由 js/scene.js 画（about.html 设 V7_SCENE_LOGO），这里只负责启动时机 ════════ */

  /* ── 启动：从切场来 → 等遮罩收拢；直接打开 → 立刻开始（原站 INITIAL_LOAD 2.5s expo.inOut 从 .65；PAGE_TRANSITION 2s expo.out 从 0） ── */
  function start(fromTransition) {
    if (started) return; started = true;
    var S3 = window.__v7Scene;   /* scene.js 在本脚本之后加载，启动时已就绪 */
    if (S3) { S3.intro(); if (fromTransition) S3.logoZoom(2, 0, 'expo.out'); else S3.logoZoom(2.5, .65, 'expo.inOut'); }
    gsap.delayedCall(fromTransition ? .2 : .5, function () { revealLines(q('abHeader')); revealLines(q('abScroll'), { delay: .25 }); });
  }
  if (window.V7Transition && window.V7Transition.isArriving()) addEventListener('v7:pt-exit-start', function () { start(true); }, { once: true });
  else if (document.readyState === 'complete') start(false); else addEventListener('load', function () { start(false); }, { once: true });
  window.__v7about = { started: function () { return started; }, watch: function () { return watch.length; }, start: start };

  /* 工牌：v1 的 lanyard 组件，进到页脚附近再启动（three 已在页面里） */
  if (window.Lanyard && Lanyard.capable()) onView(q('lanyard'), function () {
    Lanyard.mount('#lanyard', { name: C.name, role: C.role, logoPath: window.__V7_LOGO_D || '', logoVB: 49.19, logoColor: '#083D2A', qrMatrix: (window.__QR_MATRIX || {}).m });
  }, 1.3);
  else q('lanyard').style.display = 'none';

  /* 锚点走 Lenis */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.querySelector(a.getAttribute('href')); if (!t) return; e.preventDefault();
    if (lenis) lenis.scrollTo(t, { duration: 1.4 }); else t.scrollIntoView({ behavior: 'smooth' });
  });
})();

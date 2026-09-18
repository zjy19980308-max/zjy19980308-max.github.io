/* work.js —— v7 第二段：精选项目 / 大字过渡 / 其他作品。维护：网站交互调整。
   结构、尺寸照原站 leoparpeix.com（2026-09-15 真 GPU 逐帧截图 + 包里 CSS，见 _规划.md「第二段」）：
   ① projectBlock：每个项目一条横滑图。图宽 72.57vw、高 41.94vw，首图居中、左右露出邻图，无限循环；按住拖动，
      拖动时每张图缩小、间隙拉开，松手带惯性滑行、不吸附，图再回到原大。原站图在 WebGL 里画，这里用 DOM transform 做同样的手感。
      下方信息行：编号 / 名称 / 类型（灰）｜ 一个数 ｜ 时间 ｜ 团队；第二行 查看项目 ↗ ｜ 角色。
   ② webglSectionBlock：200dvh 大字，底字暗、随滚动逐字亮起。原站底图是它自己的 3D 场景（不拿），这里用 #083D2A 深绿。
   ③ archivesBlock：一行一条，点开高度过渡 1.4s cubic-bezier(.16,1,.1,1)，展开露出说明 + 图 + 链接，箭头转 180°。
   内容全部在 copy.js 的 V7.work。依赖 gsap（app.js 已注册 'reveal' 缓动）。 */
(function () {
  'use strict';
  var C = window.V7, W = C && C.work, gsap = window.gsap;
  var host = document.getElementById('work'); if (!W || !host || !gsap) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function en(t) { return '<span class="enTag" lang="en" aria-hidden="true">' + esc(t) + '</span>'; }
  var ARROW = '<svg viewBox="0 0 8 8" fill="none" aria-hidden="true"><path d="M7.475 5H6.475V1.657L.707 7.425 0 6.718 5.718 1H2.475V0h5v5z" fill="currentColor"/></svg>';
  function arrowButton(label, href, cls, internal) {   /* 原站 arrowButton：文字 + 小斜箭头，底线常显 20%，悬浮时实线从左画过、箭头换一支 */
    return '<a class="arrowButton alwaysVisible ' + (cls || '') + '" href="' + esc(href) + '"' + (internal ? ' data-pt' : ' target="_blank" rel="noopener"') + '><span class="arrowButton__text">' + esc(label) + '</span>'
      + '<span class="arrowButton__wrapper"><span class="arrowButton__arrows"><span class="arrows__arrow arrows__arrow--default">' + ARROW + '</span><span class="arrows__arrow arrows__arrow--hover">' + ARROW + '</span></span></span></a>';
  }
  function arrowBtnEl(label, cls, attrs) {   /* 跟 arrowButton 同一套样式，只是这个不跳转，点开图册 */
    return '<button type="button" class="arrowButton alwaysVisible ' + (cls || '') + '"' + (attrs || '') + '><span class="arrowButton__text">' + esc(label) + '</span>'
      + '<span class="arrowButton__wrapper"><span class="arrowButton__arrows"><span class="arrows__arrow arrows__arrow--default">' + ARROW + '</span><span class="arrows__arrow arrows__arrow--hover">' + ARROW + '</span></span></span></button>';
  }
  var EN_TYPE = ['Design Ops', 'AI Native', 'AI Automation', 'AI Agent', 'Collaboration', 'Enterprise'];   /* 英文点缀，跟在类型后面 */

  /* ════════ 渲染 ════════ */
  var P = W.projects || [], COV = W.covers || {}, html = '';
  /* owner 2026-09-15：项目展示改成 v5（张竞元作品集-v5/index.html）那种卡片错落网格——大卡占两栏两行、小卡占一栏一行，
     左大 → 右上小 → 右大 → 左小 → 左大 依次交错，留白也照 v5；样式用 v7 的（浅底、深绿字、细描边、庞门标题）；
     封面不用图，只放文字：左上英文小标、右上标签、两三条「— 要点」、左下标题 + 一句、右下淡色大编号。 */
  var SLOTS = ['big l', 'small r1', 'big r', 'small l', 'big l2', 'small r2', 'big r2', 'small l2'];
  html += '<section class="workCards" id="workCards"><div class="gridWrapper hasPadding workCards__head"><h3 class="title__text">' + esc(W.title) + en('Projects') + '</h3></div>'
    + '<div class="workCards__grid">' + P.map(function (p, k) {
      var c = COV[p.key] || {}, slot = SLOTS[k % SLOTS.length];
      return '<a class="workCard workCard--' + slot.split(' ')[0] + ' workCard--' + slot.split(' ')[1] + ' rv" href="project.html?p=' + esc(p.key) + '" data-pt>'
        + '<span class="workCard__top"><span class="workCard__en" lang="en">' + esc(c.en || '') + '</span><span class="workCard__tags">' + (c.tags || [p.type]).map(function (t) { return '<i>' + esc(t) + '</i>'; }).join('') + '</span></span>'
        + '<span class="workCard__points">' + (c.points || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</span>'
        + '<span class="workCard__foot"><b class="workCard__title">' + esc(p.name) + '</b><span class="workCard__sub">' + esc(c.sub || p.note || '') + '</span></span>'
        + '<span class="workCard__no" lang="en" aria-hidden="true">' + String(k + 1).padStart(2, '0') + '</span>'
        + '<span class="workCard__go" aria-hidden="true"><svg viewBox="0 0 8 8" fill="none"><path d="M7.475 5H6.475V1.657L.707 7.425 0 6.718 5.718 1H2.475V0h5v5z" fill="currentColor"/></svg></span>'
        + '</a>';
    }).join('') + '</div></section>';
  if (W.statement) {
    var chars = function (line) { return line.split('').map(function (ch) { return '<span class="st-char' + (ch === ' ' ? ' st-space' : '') + '">' + esc(ch) + '</span>'; }).join(''); };
    html += '<section class="statementBlock" id="workStatement"><div class="statementBlock__inner"><p class="statementBlock__text" aria-label="' + esc(W.statement.concat(W.statementSub || []).join('，')) + '">'
      + W.statement.map(function (line) { return '<span class="text__line">' + chars(line) + '</span>'; }).join('')
      + ((W.statementSub || []).length ? '<span class="text__line text__line--sub">' + W.statementSub.map(function (t) { return '<span class="st-item">' + chars(t) + '</span>'; }).join('<span class="st-dot" aria-hidden="true">·</span>') + '</span>' : '')
      + '</p></div></section>';
  }
  /* 视觉设计四块：沿用之前精选项目的横滑拖动版式（大图横滑 + 下方编号 / 名称 / 英文） */
  var V = W.visual || [];
  if (V.length) {
    html += '<section class="visualWorks" id="visual">' + V.map(function (v, k) {
      return '<div class="projectBlock projectBlock--visual" data-k="' + k + '">'
        + (k === 0 ? '<div class="gridWrapper hasPadding projectBlock__title"><h3 class="title__text">视觉设计' + en('Visual design') + '</h3></div>' : '')
        + '<div class="projectBlock__slider" data-visual="' + k + '" aria-label="' + esc(v.name) + '，可左右拖动"></div>'
        + '<div class="projectBlock__informations"><div class="gridWrapper hasPadding informations__top">'
        + '<div class="top__title rv"><div class="title__number">' + String(k + 1).padStart(2, '0') + '</div><h4 class="title__name">' + esc(v.name) + '</h4><div class="title__type">' + en(v.en) + '</div></div>'
        + '<div class="top__recognitions rv">' + esc(v.note || '') + '</div>'
        + '</div></div></div>';
    }).join('') + '</section>';
  }
  host.innerHTML = html;

  var A = W.archives || [], base = P.length;
  document.getElementById('archTitle').innerHTML = esc(W.archivesTitle) + en('Archives');
  var CHEV = '<svg class="items__arrow" viewBox="0 0 8 5" aria-hidden="true"><path d="M0 .7.7 0 4 3.3 7.3 0l.7.7L4 4.7z" fill="currentColor"/></svg>';
  document.getElementById('archList').innerHTML = A.map(function (a, k) {
    return '<div class="gridWrapper hasPadding archivesBlock__items" data-k="' + k + '">'
      + '<div class="items__mask" aria-hidden="true"></div>'
      + '<div class="items__separator items__separator--top"></div>'
      + '<button class="items__hit" type="button" aria-expanded="false" aria-label="' + esc(a[0]) + '，展开"></button>'
      + '<div class="items__title"><span class="title__number">' + (base + k + 1) + '</span><span class="title__name">' + esc(a[0]) + '</span><span class="title__type">' + esc(a[1]) + '</span></div>'
      + '<div class="items__roles">' + esc(a[2]) + '</div><div class="items__date">' + esc(a[3]) + '</div><div class="items__agency">' + esc(a[4]) + '</div>' + CHEV
      + '<div class="items__text"><p class="text__infos">' + esc(a[5]) + '</p>'
      + (a[7] ? arrowButton(/^project\.html/.test(a[7]) ? (/#/.test(a[7]) ? '查看模块' : '查看项目') : '打开', a[7], 'text__link', /^project\.html/.test(a[7]))
              : (a[8] && a[8].length) ? arrowBtnEl('看几屏', 'text__link', ' data-gal="' + k + '"') : '')   /* 没详情页的，点开可切换图册（js/depth.js） */
      + '</div>'
      + '<div class="items__media"><div class="media__inner"><img class="media__content" src="assets/shots/' + esc(a[6]) + '.webp" alt="' + esc(a[0]) + '" loading="lazy" draggable="false"></div></div>'
      + '</div>';
  }).join('');

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-gal]');
    if (!b || !window.V7Depth) return;
    var a = A[+b.getAttribute('data-gal')];
    if (a && a[8]) V7Depth.open(a[8], 0, a[0]);
  });

  /* ── 第三段：页脚（owner：这里还没做）。文案与关于页共用 V7.about.footer，
        大字点一下换一组、进视口逐行升起，联系方式点击复制。 ── */
  (function () {
    var F = (C.about && C.about.footer) || null, box = document.getElementById('hfBox');
    if (!F || !box) return;
    function titlesHtml(arr, alt) {
      return (arr || []).map(function (t, k) {
        return '<div class="titles__wrapper"><div class="wrapper"><h2 class="title' + (alt ? ' title--' + (k + 1) : '') + '" lang="zh">' + esc(t) + '</h2></div></div>';
      }).join('');
    }
    document.getElementById('hfA').innerHTML = titlesHtml(F.titles, false);
    document.getElementById('hfB').innerHTML = titlesHtml(F.titlesAlt || F.titles, true);
    document.getElementById('hfLeft').innerHTML = esc(C.name) + en('Contact');
    document.getElementById('hfLinks').innerHTML = (F.links || []).map(function (l) {
      return l[2] === 'copy'
        ? '<button class="footer__link" type="button" data-copy="' + esc(l[1]) + '">' + esc(l[0]) + '</button>'
        : '<a class="footer__link" href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(l[0]) + ' ↗</a>';
    }).join('<span class="footer__dot" aria-hidden="true"></span>');
    document.getElementById('hfCopy').textContent = F.copyright || '© 2026 ' + C.name;

    var Aset = [].slice.call(document.querySelectorAll('#hfA .title')),
        Bset = [].slice.call(document.querySelectorAll('#hfB .title')), alt = false, shown = false, tl = null;
    if (!reduce) Aset.concat(Bset).forEach(function (el, k) { gsap.set(el, { y: '100%', x: (k % 3) % 2 ? '-5%' : '5%', force3D: true }); });
    function show() {
      if (shown || reduce) return; shown = true;
      var t = gsap.timeline({ delay: .115 });
      Aset.forEach(function (el, k) { t.fromTo(el, { y: '100%', x: k % 2 ? '-5%' : '5%' }, { y: '0%', x: '0%', ease: 'reveal', duration: 1, force3D: true }, k * .115); });
    }
    box.addEventListener('click', function () {
      if (!shown || reduce) return;
      var out = alt ? Bset : Aset, inn = alt ? Aset : Bset; alt = !alt;
      tl && tl.kill(); tl = gsap.timeline();
      out.forEach(function (el, k) {
        tl.to(el, { y: '100%', x: k % 2 ? '-5%' : '5%', ease: 'power4.inOut', duration: 1.5, force3D: true }, k * .115);
        tl.to(inn[k], { y: '0%', x: '0%', ease: 'reveal', duration: 2, force3D: true }, k * .1 + .63);
      });
    });
    gsap.ticker.add(function () { if (!shown && box.getBoundingClientRect().top < innerHeight * .85) show(); });

    var toast = document.createElement('div'); toast.className = 'aboutToast'; document.body.appendChild(toast);
    document.addEventListener('click', function (e) {
      var bt = e.target.closest && e.target.closest('#hfLinks [data-copy]'); if (!bt) return;
      var v = bt.getAttribute('data-copy'), done = function () {
        toast.textContent = '已复制 ' + v; toast.classList.add('is-on');
        clearTimeout(toast._t); toast._t = setTimeout(function () { toast.classList.remove('is-on'); }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, done); else done();
    });
  })();

  var sliders = [].map.call(host.querySelectorAll('[data-visual]'), function (el) {
    var v = V[+el.getAttribute('data-visual')], shots = (v.shots || []).slice();
    /* owner 2026-09-17：「看不清啊，点他也不放大」→ 轻点开全屏图册（js/depth.js），在里面左右切 */
    return window.V7Slider ? window.V7Slider.create(el, shots.length ? shots : [null, null, null], {
      auto: true,
      fit: true,                                  /* 每张按图自己的比例，不裁切 */
      onOpen: function (i) { window.V7Depth && window.V7Depth.open(shots, i, v.name); }
    }) : null;   /* 没图：三块「未完待续」；auto：这一排自己缓慢流 */
  });

  /* ════════ ② 大字逐字亮起 ════════ */
  var stBlock = document.getElementById('workStatement'), stChars = stBlock ? [].slice.call(stBlock.querySelectorAll('.st-char')) : [];
  function stepStatement() {
    if (!stBlock) return;
    var r = stBlock.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    var p = (vh - r.top) / (vh + r.height);   /* 0：块顶刚进底边；1：块底离开顶边 */
    var a = (p - .28) / .3, n = stChars.length;   /* 原站帧：块中段文字从上到下逐字亮完 */
    for (var i = 0; i < n; i++) {
      var t = Math.max(0, Math.min(1, a * n - i));
      stChars[i].style.opacity = (.2 + .8 * t).toFixed(3);
    }
  }

  /* ════════ 信息行进场 ════════ */
  var rv = [].slice.call(document.querySelectorAll('.workCards .rv, .visualWorks .rv'));
  if (!reduce) gsap.set(rv, { opacity: 0, y: 14 });
  function stepReveal() {
    if (reduce) return;
    for (var i = rv.length - 1; i >= 0; i--) {
      var b = rv[i].getBoundingClientRect();
      if (b.top < innerHeight * .94) { gsap.to(rv[i], { opacity: 1, y: 0, duration: .9, ease: 'reveal', delay: (i % 4) * .06 }); rv.splice(i, 1); }
    }
  }

  var last = performance.now();
  gsap.ticker.add(function () {
    var now = performance.now(), dt = Math.min(50, now - last); last = now;
    stepStatement(); stepReveal();
  });
  
  /* ════════ ③ 其他作品：点开 / 收起（同一时间只开一条） ════════ */
  var rows = [].slice.call(document.querySelectorAll('.archivesBlock__items'));
  function closedH(row) { return row.querySelector('.items__title').getBoundingClientRect().bottom - row.getBoundingClientRect().top + parseFloat(getComputedStyle(row).fontSize) * 1.1; }
  function setOpen(row, open) {
    row.classList.toggle('expanded', open);
    row.querySelector('.items__hit').setAttribute('aria-expanded', String(open));
    row.style.height = (open ? row.scrollHeight : closedH(row)) + 'px';
  }
  function layoutRows() { rows.forEach(function (row) { row.style.transition = 'none'; row.style.height = (row.classList.contains('expanded') ? row.scrollHeight : closedH(row)) + 'px'; row.offsetHeight; row.style.transition = ''; }); }
  rows.forEach(function (row) {
    row.querySelector('.items__hit').addEventListener('click', function () {
      var open = !row.classList.contains('expanded');
      rows.forEach(function (o) { if (o !== row && o.classList.contains('expanded')) setOpen(o, false); });
      setOpen(row, open);
      setTimeout(function () { window.__v7lenis && window.__v7lenis.resize && window.__v7lenis.resize(); }, 1450);
    });
  });
  layoutRows();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutRows);
  addEventListener('resize', layoutRows);

  window.__v7work = { sliders: sliders, rows: rows };
})();

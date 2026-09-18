/* project.js —— v7 项目页渲染。维护：网站交互调整。
   内容：js/projects.js 的 window.V7P[slug]（{ kicker, title, year, status, blocks }），首页 V7.work.projects 给名称 / 类型 / 顺序。
   块类型（键名归本会话，值归文案会话）：
     section {title, en}                         大章节：庞门标题 + 英文小字，上方一条线
     intro   {lead, rows:[[键, 值]]}              一句话大字 + 右侧信息行
     sub     {num, title, en}                     小节标题行
     caps    {items:[[标签, 标题, 正文]]}          策略卡，3 或 4 列
     fig     {src, cap}                           提炼图（深绿底），进视口时遮罩展开
     page    {n, title, sub, body?, shots?, live?, tags?, steps?, grid?}   逐页讲解：左侧文字吸顶，右侧图竖排；没图有可点原型时放预览窗
     act     {text}                               幕分隔
     gallery {lead?, shots:[[图, 说明]]}           剩余页面：首页同款横滑，点开大图
     windows {items:[[小标, 标题, 正文, 链接]]}     证据卡（带页面预览）
     note    {label, title, body[]}               深绿整宽的一段
     steps   {items:[{n, title, live}]}           步骤列表
     modules {items:[[标题, 标签, 正文]]}          模块入口，点击滚到同名 section
     lead    {text}                               一段说明
     todo    {text}                               待补内容占位（AI Workflow Agent 用）
   页脚：下一个项目（按首页顺序循环），走切场动画。 */
(function () {
  'use strict';
  var C = window.V7, PJ = window.V7P || {}, gsap = window.gsap;
  var root = document.getElementById('pj'); if (!root || !gsap) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bez(p0, p1, p2, p3) {
    function a(x, y) { return 1 - 3 * y + 3 * x; } function b(x, y) { return 3 * y - 6 * x; } function c(x) { return 3 * x; }
    function calc(t, x, y) { return ((a(x, y) * t + b(x, y)) * t + c(x)) * t; } function slope(t, x, y) { return 3 * a(x, y) * t * t + 2 * b(x, y) * t + c(x); }
    return function (x) { var t = x; for (var i = 0; i < 8; i++) { var s = slope(t, p0, p2); if (!s) break; t -= (calc(t, p0, p2) - x) / s; } return calc(t, p1, p3); };
  }
  gsap.registerEase('reveal', bez(.4, 0, 0, 1));
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function en(t) { return t ? '<span class="enTag" lang="en" aria-hidden="true">' + esc(t) + '</span>' : ''; }
  function q(id) { return document.getElementById(id); }
  var ARROW = '<svg viewBox="0 0 8 8" fill="none" aria-hidden="true"><path d="M7.475 5H6.475V1.657L.707 7.425 0 6.718 5.718 1H2.475V0h5v5z" fill="currentColor"/></svg>';
  function arrowButton(label, href, cls, internal) {
    return '<a class="arrowButton alwaysVisible ' + (cls || '') + '" href="' + esc(href) + '"' + (internal ? ' data-pt' : ' target="_blank" rel="noopener"') + '><span class="arrowButton__text">' + esc(label) + '</span>'
      + '<span class="arrowButton__wrapper"><span class="arrowButton__arrows"><span class="arrows__arrow arrows__arrow--default">' + ARROW + '</span><span class="arrows__arrow arrows__arrow--hover">' + ARROW + '</span></span></span></a>';
  }
  var CHEV = '<svg class="pjModule__arrow" viewBox="0 0 8 8" aria-hidden="true"><path d="M7.475 5H6.475V1.657L.707 7.425 0 6.718 5.718 1H2.475V0h5v5z" fill="currentColor"/></svg>';
  function pm(t) { return esc(t).replace(/ /g, '<span class="pmSpace"> </span>'); }   /* 庞门的空格太宽，收窄 */
  function localAsset(u) { var m = String(u || '').match(/zjy19980308-max\.github\.io\/((?:raw-[a-z]+\.html)|(?:flow\/.+))$/); return m ? m[1] : u; }   /* 设计系统资产页、flow/ 可点原型都已放进 v7，线上 v1 地址换成本地（快、离线也能开） */   /* 设计系统资产四页已放进 v7（三级页），线上 v1 地址换成本地 */
  function cleanLabel(s) { return String(s || '').replace(/\s*→\s*$/, '').replace(/\s+/g, ' ').trim(); }

  /* ── 哪个项目 ── */
  var order = ((C.work && C.work.projects) || []).map(function (p) { return p.key; }).filter(Boolean);
  if (!order.length) order = ['flow', 'nota', 'plan', 'agent', 'doc', 'cses'];
  Object.keys(PJ).forEach(function (k) { if (order.indexOf(k) < 0) order.push(k); });   /* 首页没列出的项目（企业协作平台只在「其他作品」里放模块）也能打开，并排进翻页顺序 */
  var slug = (location.search.match(/[?&]p=([a-z]+)/) || [])[1] || order[0];
  if (order.indexOf(slug) < 0) slug = order[0];
  var meta = ((C.work && C.work.projects) || []).filter(function (p) { return p.key === slug; })[0] || {};
  function nameOf(k) { var m = ((C.work && C.work.projects) || []).filter(function (p) { return p.key === k; })[0]; return (PJ[k] && PJ[k].title) || (m && m.name) || k; }
  var P = PJ[slug] || (slug === 'agent' ? agentSkeleton() : { title: meta.name || slug, blocks: [] });
  var index = order.indexOf(slug);
  document.title = (meta.name || P.title) + ' — ' + C.name;

  /* AI Workflow Agent 还没有内容：先按同事项目的骨架排好位置（项目介绍 → 竞品分析 → 设计方案），文案会话写进 V7P.agent 后自动替换 */
  function agentSkeleton() {
    return { kicker: '项目四 · Case study', title: 'AI Workflow Agent', year: '2026', status: '整理中', blocks: [
      { t: 'section', title: '项目介绍', en: 'Overview' },
      { t: 'intro', lead: '【待定】一句话说清这个 Agent 解决什么问题。', rows: [['我的角色', '【待定】'], ['目标用户', '【待定】'], ['时间', '2026'], ['状态', '整理中']] },
      { t: 'sub', num: '01', title: '为什么做这个题目', en: 'Why this' },
      { t: 'caps', items: [['01', '【待定】', '【待定】'], ['02', '【待定】', '【待定】'], ['03', '【待定】', '【待定】']] },
      { t: 'sub', num: '02', title: '用户画像', en: 'Persona' },
      { t: 'todo', text: '用户画像：角色、日常任务、现在的难处。' },
      { t: 'section', title: '竞品分析', en: 'Competitors' },
      { t: 'todo', text: '实测结论与定位。' },
      { t: 'section', title: '设计方案', en: 'Design' },
      { t: 'sub', num: '01', title: '用户旅程', en: 'User journey' },
      { t: 'todo', text: '用户旅程图：一条线串起关键屏（动态，线缓慢流过）。' },
      { t: 'sub', num: '02', title: '逐屏讲解', en: 'Screens' },
      { t: 'page', n: '1', title: '【待定】', sub: '【待定】' },
      { t: 'page', n: '2', title: '【待定】', sub: '【待定】' }
    ] };
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ── 返回：固定在左上，滚到哪儿都在（v1 做法）；有来路就回来路，否则回首页作品列表 ── */
  var back = document.createElement('a'); back.className = 'pjBack'; back.href = 'index.html#work'; back.setAttribute('data-pt', '');
  back.innerHTML = '<span class="pjBack__arrow" aria-hidden="true">←</span><span>返回作品</span>' + en('Back');
  document.body.appendChild(back);

  /* ── 导航 ── */
  q('navName').textContent = C.name; q('navRole').textContent = C.role;
  var navLinks = [['作品', 'index.html'], ['关于', 'about.html'], ['实验场', 'lab.html']];   /* owner 2026-09-17：导航点「作品」回首页头部；「返回 / 全部项目」那两个按钮才落到作品网格 */
  q('navLinks').innerHTML = navLinks.map(function (l) { return '<a class="mainButton links__link" href="' + l[1] + '" data-pt>' + esc(l[0]) + '</a>'; }).join('');

  /* ════════ 渲染 ════════ */
  var gallerySets = [], sliderQueue = [], html = '';
  var kickerEn = 'Case study · ' + String(index + 1).padStart(2, '0');
  html += '<section class="pjHero gridWrapper hasPadding">'
    + '<p class="pjHero__kicker rv">' + esc((meta.type || '').trim() || (P.kicker || '').replace(/\s*·\s*CASE STUDY/i, '')) + en(kickerEn) + '</p>'
    + '<p class="pjHero__meta rv"><span>' + esc(P.year || meta.date || '') + '</span><span>' + esc(P.status || '') + '</span></p>'
    + '<h1 class="pjHero__title">' + splitTitle(P.title || meta.name) + '</h1>'
    + '</section>';

  function splitTitle(t) {   /* 标题按「 · 」分行，每行一个遮罩，进场逐行升起 */
    return String(t).split(/\s*·\s*/).map(function (l) { return '<span class="line-mask"><span class="line">' + pm(l) + '</span></span>'; }).join('');
  }
  var sectionIds = {};
  (P.blocks || []).forEach(function (b, bi) { html += block(b, bi); });

  function shotFig(s, set, i, extra) {
    return '<button class="pjShot rv' + (extra || '') + '" type="button" data-set="' + set + '" data-i="' + i + '"><span class="pjShot__frame"><img src="' + esc(s[0]) + '" alt="' + esc(s[1] || '') + '" loading="lazy" draggable="false"></span>'
      + (s[1] ? '<span class="pjShot__cap">' + esc(s[1]) + '</span>' : '') + '</button>';
  }
  function preview(l) {
    /* 可点原型的实时缩略：整页按 1440 渲染再缩进框里（懒加载）。
       owner 2026-09-16：要能在页面里直接点 —— 点遮罩就在浮层里 1:1 打开，真的能操作，不是跳走。 */
    var u = localAsset(l[1]);
    return '<div class="pjPreview rv"><iframe data-src="' + esc(u) + '" loading="lazy" tabindex="-1" scrolling="no" title="' + esc(cleanLabel(l[0])) + '"></iframe>'
      + '<button class="pjPreview__cover" type="button" data-live="' + esc(u) + '" data-live-t="' + esc(cleanLabel(l[0])) + '" aria-label="打开并操作 ' + esc(cleanLabel(l[0])) + '">'
      + '<span>' + esc(cleanLabel(l[0])) + '</span><em>点开可以直接操作</em></button></div>';
  }
  function stepsList(items, own) {   /* 步骤：编号 / 标题 / 一句说明 / 三级页面缩略图（点开跳转） */
    return '<ol class="pjSteps' + (own ? ' gridWrapper hasPadding' : '') + '">' + items.map(function (st) {
      return '<li class="rv"><span class="pjSteps__n" lang="en">' + esc(st.n) + '</span><div class="pjSteps__head"><b class="pjSteps__title">' + esc(st.title) + '</b>' + (st.text ? '<p class="pjSteps__text">' + esc(st.text) + '</p>' : '') + '</div>'
        + ((st.live || []).length ? '<div class="pjThumbs">' + st.live.map(function (l) {
          var u = localAsset(l[1]);
          return '<a class="pjThumb" href="' + esc(u) + '" target="_blank" rel="noopener"><span class="pjThumb__view"><iframe data-src="' + esc(u) + '" tabindex="-1" scrolling="no" title="' + esc(cleanLabel(l[0])) + '"></iframe></span><span class="pjThumb__label">' + esc(cleanLabel(l[0])) + '<i aria-hidden="true">' + ARROW + '</i></span></a>';
        }).join('') + '</div>' : '') + '</li>';
    }).join('') + '</ol>';
  }
  function liveList(lv) {
    return (lv || []).length ? '<div class="pjLive">' + lv.map(function (l) { return arrowButton(cleanLabel(l[0]) || '打开原型', localAsset(l[1]), 'pjLive__link'); }).join('') + '</div>' : '';
  }
  function block(b, bi) {
    switch (b.t) {
      case 'section':
        var id = 'sec-' + bi; sectionIds[b.title] = id;
        return '<section class="pjSection gridWrapper hasPadding" id="' + id + '" data-anchor="' + esc(b.title) + '"><h2 class="pjSection__title"><span class="line-mask"><span class="line">' + pm(b.title.replace(/^[一二三四五六七八九十]+\s*·\s*/, '')) + '</span></span></h2><p class="pjSection__en rv" lang="en">' + esc(b.en || '') + '</p></section>';
      case 'intro':
        return '<div class="pjIntro gridWrapper hasPadding"><p class="pjIntro__lead rv">' + esc(b.lead) + '</p><dl class="pjIntro__rows">' + (b.rows || []).map(function (r) { return '<div class="rv"><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl></div>';
      case 'sub':
        return '<h3 class="pjSub gridWrapper hasPadding rv" data-anchor="' + esc(b.title) + '"><span class="pjSub__num" lang="en">' + esc(b.num) + '</span><span class="pjSub__title">' + esc(b.title) + '</span><span class="pjSub__en" lang="en">' + esc(b.en || '') + '</span></h3>';
      case 'caps':
        var n = (b.items || []).length;
        return '<div class="pjCaps gridWrapper hasPadding pjCaps--' + (n >= 4 ? 4 : 3) + '">' + (b.items || []).map(function (it) { return '<article class="pjCap rv"><span class="pjCap__label" lang="en">' + esc(it[0]) + '</span><h4 class="pjCap__title">' + esc(it[1]) + '</h4><p class="pjCap__desc">' + esc(it[2]) + '</p></article>'; }).join('') + '</div>';
      case 'fig':
        return '<figure class="pjFig gridWrapper hasPadding"><div class="pjFig__frame"><img src="' + esc(b.src) + '" alt="' + esc(b.cap) + '" loading="lazy"></div><figcaption class="pjFig__cap rv"><span lang="en">Fig.</span>' + esc(b.cap) + '</figcaption></figure>';
      case 'act':
        return '<p class="pjAct gridWrapper hasPadding rv"><span>' + esc(b.text) + '</span></p>';
      case 'lead':
        return '<p class="pjLead gridWrapper hasPadding"><span class="rv">' + esc(b.text) + '</span></p>';
      case 'scatter': {
        /* 二维散点：横轴生成能力、纵轴上线之后的治理能力。同类产品挤在右下，本项目在右上。 */
        var pts = b.points || [], W2 = 760, H2 = 420, PADL = 62, PADB = 52, PADT = 18, PADR = 18;
        function px(v) { return PADL + (W2 - PADL - PADR) * (v / 100); }
        function py(v) { return H2 - PADB - (H2 - PADB - PADT) * (v / 100); }
        return '<div class="pjChart gridWrapper hasPadding rv">'
          + (b.lead ? '<p class="pjTable__lead">' + esc(b.lead) + '</p>' : '')
          + '<div class="pjChart__box"><svg viewBox="0 0 ' + W2 + ' ' + H2 + '" role="img" aria-label="' + esc(b.alt || '生成能力与治理能力的分布') + '">'
          + '<line class="ax" x1="' + PADL + '" y1="' + (H2 - PADB) + '" x2="' + (W2 - PADR) + '" y2="' + (H2 - PADB) + '"/>'
          + '<line class="ax" x1="' + PADL + '" y1="' + PADT + '" x2="' + PADL + '" y2="' + (H2 - PADB) + '"/>'
          + '<text class="axl" x="' + (W2 - PADR) + '" y="' + (H2 - PADB + 30) + '" text-anchor="end">' + esc((b.axis || [])[0] || '生成能力') + ' →</text>'
          /* 纵轴标签贴着轴外侧放，别压在轴线上 */
          + '<text class="axl" x="' + (PADL - 13) + '" y="' + (PADT + 4) + '" transform="rotate(-90 ' + (PADL - 13) + ' ' + (PADT + 4) + ')" text-anchor="end">← ' + esc((b.axis || [])[1] || '治理能力') + '</text>'
          + (b.zone ? '<rect class="zone" x="' + px(b.zone[0]) + '" y="' + py(b.zone[3]) + '" width="' + (px(b.zone[2]) - px(b.zone[0])) + '" height="' + (py(b.zone[1]) - py(b.zone[3])) + '" rx="10"/>'
              /* 区域标签放在框的上沿外侧、靠右 —— 放框内底部会和右下角那些点的标签叠印（文案会话量出来的） */
              + '<text class="zl" x="' + px(b.zone[2]) + '" y="' + (py(b.zone[3]) - 9) + '" text-anchor="end">' + esc(b.zoneLabel || '') + '</text>' : '')
          + pts.map(function (p2) {
              var x = px(p2.x), y = py(p2.y), me = p2.me;
              return '<g class="pt' + (me ? ' is-me' : '') + '"><circle cx="' + x + '" cy="' + y + '" r="' + (me ? 8 : 5.5) + '"/>'
                + '<text x="' + (x + (p2.side === 'l' ? -13 : 13)) + '" y="' + (y + 4.5) + '"' + (p2.side === 'l' ? ' text-anchor="end"' : '') + '>' + esc(p2.t) + '</text></g>';
            }).join('')
          + '</svg></div>'
          + (b.note ? '<p class="pjChart__note">' + esc(b.note) + '</p>' : '') + '</div>';
      }
      case 'divide': {
        /* 分界线：左边是同类产品做的事，右边是我们做的事，中间一条竖线，右半加重 */
        var L = b.left || {}, R = b.right || {};
        return '<div class="pjDiv gridWrapper hasPadding rv">'
          + (b.lead ? '<p class="pjTable__lead">' + esc(b.lead) + '</p>' : '')
          + '<div class="pjDiv__box"><div class="pjDiv__c"><h5>' + esc(L.title || '') + '</h5>'
          + '<ul>' + (L.items || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>'
          + '<div class="pjDiv__line"><span>' + esc(b.mid || '分界') + '</span></div>'
          + '<div class="pjDiv__c pjDiv__c--me"><h5>' + esc(R.title || '') + '</h5>'
          + '<ul>' + (R.items || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div></div></div>';
      }
      case 'explode': {
        /* 拆解：中间一句话，右边拆成几件事 */
        return '<div class="pjExp gridWrapper hasPadding rv">'
          + (b.lead ? '<p class="pjTable__lead">' + esc(b.lead) + '</p>' : '')
          + '<div class="pjExp__box"><div class="pjExp__src"><i lang="en">INPUT</i><b>' + esc(b.source || '') + '</b></div>'
          + '<div class="pjExp__arrow" aria-hidden="true"></div>'
          + '<ol class="pjExp__out">' + (b.items || []).map(function (t, k) {
              return '<li><span lang="en">' + String(k + 1).padStart(2, '0') + '</span><b>' + esc(t[0]) + '</b><em>' + esc(t[1] || '') + '</em></li>';
            }).join('') + '</ol></div>'
          + (b.note ? '<p class="pjChart__note">' + esc(b.note) + '</p>' : '') + '</div>';
      }
      case 'timeline': {
        /* 极简时间轴：一条线几个节点，出问题的那个标红 */
        return '<div class="pjTl gridWrapper hasPadding rv">'
          + (b.lead ? '<p class="pjTable__lead">' + esc(b.lead) + '</p>' : '')
          + '<ol class="pjTl__box">' + (b.items || []).map(function (t) {
              return '<li class="' + (t[2] ? 'is-bad' : '') + '"><i></i><b>' + esc(t[0]) + '</b><span>' + esc(t[1] || '') + '</span></li>';
            }).join('') + '</ol></div>';
      }
      case 'journey': {
        /* 旅程线：六个阶段沿横轴排开，上面一条起伏曲线表示顺不顺，下面每阶段挂一句。
           两类标记分开 —— 红的是要解决的痛点，蓝的是我们故意设的关卡。 */
        /* 曲线整条留在横轴上方：轴下面是阶段名和说明，压上去就糊了（第一版 v<50 的点正好落在阶段名上）。 */
        var st2 = b.stages || [], n2 = st2.length, W3 = 880, H3 = 250, BASE = 152, FLOOR = 18, AMP = 74;
        function sx(i) { return 70 + (W3 - 140) * (n2 > 1 ? i / (n2 - 1) : .5); }
        function sy(v) { return BASE - FLOOR - AMP * (v / 100); }
        var d = st2.map(function (x, i) {
          var X = sx(i), Y = sy(x.v);
          if (!i) return 'M' + X + ' ' + Y;
          var pX = sx(i - 1), pY = sy(st2[i - 1].v), mid = (pX + X) / 2;
          return 'C' + mid + ' ' + pY + ' ' + mid + ' ' + Y + ' ' + X + ' ' + Y;
        }).join(' ');
        return '<div class="pjJn gridWrapper hasPadding rv">'
          + (b.lead ? '<p class="pjTable__lead">' + esc(b.lead) + '</p>' : '')
          + '<div class="pjJn__box"><svg viewBox="0 0 ' + W3 + ' ' + H3 + '" role="img" aria-label="' + esc(b.alt || '用户旅程的起伏') + '">'
          + '<line class="jax" x1="52" y1="' + BASE + '" x2="' + (W3 - 52) + '" y2="' + BASE + '"/>'
          + '<path class="jln" d="' + d + '"/>'
          + st2.map(function (x, i) {
              var X = sx(i), Y = sy(x.v), k = x.k || '';
              return '<g class="jpt' + (k ? ' k-' + k : '') + '">'
                + '<line class="jtick" x1="' + X + '" y1="' + Y + '" x2="' + X + '" y2="' + BASE + '"/>'
                + '<circle cx="' + X + '" cy="' + Y + '" r="' + (k ? 7 : 5) + '"/>'
                + '<text class="jst" x="' + X + '" y="' + (BASE + 26) + '" text-anchor="middle">' + esc(x.name) + '</text>'
                + '<text class="jsd" x="' + X + '" y="' + (BASE + 48) + '" text-anchor="middle">' + esc(x.note || '') + '</text>'
                + (k ? '<text class="jsk" x="' + X + '" y="' + (Y - 15) + '" text-anchor="middle">' + (k === 'pain' ? '痛点' : '有意设的关卡') + '</text>' : '')
                + '</g>';
            }).join('')
          + '</svg></div>'
          + '<ul class="pjJn__key"><li class="k-pain">红色 · 现在靠人肉，是要解决的</li><li class="k-gate">蓝色 · 故意设的关卡，不是问题</li></ul></div>';
      }
      case 'table': {
        /* 对照表：第一列当行头；窄屏整张横向滚动。最后一行如果是「本项目」，单独加重。 */
        var hd = b.head || [], rw = b.rows || [];
        return '<div class="pjTable gridWrapper hasPadding rv">'
          + (b.lead ? '<p class="pjTable__lead">' + esc(b.lead) + '</p>' : '')
          + '<div class="pjTable__wrap"><table><thead><tr>'
          + hd.map(function (h, i) { return '<th' + (i ? '' : ' class="rowhead"') + '>' + esc(h) + '</th>'; }).join('')
          + '</tr></thead><tbody>'
          + rw.map(function (r) {
              var mine = /本项目|本方案/.test(String(r[0] || ''));
              return '<tr' + (mine ? ' class="mine"' : '') + '>'
                + r.map(function (c, i) { return i ? '<td>' + esc(c) + '</td>' : '<th class="rowhead">' + esc(c) + '</th>'; }).join('')
                + '</tr>';
            }).join('')
          + '</tbody></table></div>'
          + '<p class="pjTable__hint">表格可左右拖动查看</p></div>';
      }
      case 'swim': {
        /* 用户旅程泳道图：四条泳道 × 六个阶段。格子里标两类记号 ——
           痛点（现在靠人肉的地方）和 AI 介入点（按 A / B / C 三档给颜色）。 */
        var st = b.stages || [], ln = b.lanes || [];
        return '<div class="pjSwim gridWrapper hasPadding rv">'
          + (b.lead ? '<p class="pjTable__lead">' + esc(b.lead) + '</p>' : '')
          + '<div class="pjSwim__wrap"><div class="pjSwim__grid" style="grid-template-columns:8.2rem repeat(' + st.length + ',minmax(8.6rem,1fr))">'
          + '<div class="pjSwim__corner"></div>'
          + st.map(function (x, i) { return '<div class="pjSwim__stage"><span lang="en">' + String(i + 1).padStart(2, '0') + '</span>' + esc(x) + '</div>'; }).join('')
          + ln.map(function (l) {
              return '<div class="pjSwim__lane' + (l.ai ? ' is-ai' : '') + '">' + esc(l.name) + '</div>'
                + st.map(function (x, i) {
                    var c = (l.cells || [])[i];
                    if (!c || !c.t) return '<div class="pjSwim__c pjSwim__c--none">—</div>';
                    return '<div class="pjSwim__c' + (c.k ? ' k-' + c.k : '') + '">'
                      + (c.k === 'pain' ? '<i class="pjSwim__tag">痛点</i>' : (c.k ? '<i class="pjSwim__tag">' + c.k.toUpperCase() + '</i>' : ''))
                      + '<span>' + esc(c.t) + '</span></div>';
                  }).join('');
            }).join('')
          + '</div></div>'
          + '<ul class="pjSwim__key"><li class="k-pain">痛点 · 现在靠人记、靠人盯</li>'
          + '<li class="k-a">A 只读，Agent 全自动</li><li class="k-b">B 可撤销，自动执行留撤销入口</li>'
          + '<li class="k-c">C 不可逆，必须人确认</li></ul></div>';
      }
      case 'axis': {
        /* AI 边界图：一条从「AI 自动」到「必须人确认」的轴，三段各挂几个典型动作 */
        var sg = b.segs || [];
        return '<div class="pjAxis gridWrapper hasPadding rv">'
          + (b.lead ? '<p class="pjTable__lead">' + esc(b.lead) + '</p>' : '')
          + '<div class="pjAxis__ends"><span>' + esc((b.ends || [])[0] || 'AI 自动') + '</span><span>' + esc((b.ends || [])[1] || '必须人确认') + '</span></div>'
          + '<div class="pjAxis__bar">' + sg.map(function (g) { return '<i class="k-' + g.k + '"></i>'; }).join('') + '</div>'
          + '<div class="pjAxis__segs">' + sg.map(function (g) {
              return '<div class="pjAxis__s k-' + g.k + '"><b><span class="pjAxis__k">' + esc(g.k.toUpperCase()) + '</span>' + esc(g.name) + '</b>'
                + '<p>' + esc(g.note || '') + '</p>'
                + '<ul>' + (g.acts || []).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul></div>';
            }).join('') + '</div></div>';
      }
      case 'rel': {
        /* 在平台里的位置：中间是本产品，四周是它真正会调用 / 被调用的板块。
           SVG 用固定 viewBox + width:100%，宽屏看图；窄屏换成下面那份同源的列表。 */
        var it = b.items || [], C = b.center || ['审批', ''];
        var POS = [[96, 60], [712, 60], [96, 300], [712, 300]];      /* 左上 右上 左下 右下 */
        var boxes = '', lines = '';
        it.slice(0, 4).forEach(function (m, k) {
          var x = POS[k][0], y = POS[k][1], cx = x + 96, cy = y + 44;
          lines += '<path d="M' + cx + ' ' + cy + ' C' + (cx + (k % 2 ? -110 : 110)) + ' ' + cy + ' ' + (500 + (k % 2 ? 110 : -110)) + ' ' + (k < 2 ? 140 : 300) + ' 500 ' + (k < 2 ? 178 : 262) + '" class="pjRel__ln"/>';
          boxes += '<g class="pjRel__m"><rect x="' + x + '" y="' + y + '" width="192" height="88" rx="10"/>'
            + '<text x="' + (x + 18) + '" y="' + (y + 34) + '" class="pjRel__nm">' + esc(m[0]) + '</text>'
            + '<text x="' + (x + 18) + '" y="' + (y + 58) + '" class="pjRel__tg">' + esc(m[2] || '') + '</text></g>';
        });
        return '<section class="pjRel gridWrapper hasPadding">'
          + (b.lead ? '<p class="pjLead"><span class="rv">' + esc(b.lead) + '</span></p>' : '')
          + '<div class="pjRel__svg rv"><svg viewBox="0 0 1000 452" role="img" aria-label="' + esc(C[0]) + ' 与平台其他板块的关系">'
          + lines + boxes
          + '<g class="pjRel__c"><rect x="404" y="178" width="192" height="84" rx="12"/>'
          + '<text x="500" y="212" text-anchor="middle" class="pjRel__cn">' + esc(C[0]) + '</text>'
          + '<text x="500" y="238" text-anchor="middle" class="pjRel__ct">' + esc(C[1] || '') + '</text></g>'
          + '</svg></div>'
          + '<ul class="pjRel__list">' + it.map(function (m) {
              return '<li class="rv"><b>' + esc(m[0]) + '<i>' + esc(m[2] || '') + '</i></b><span>' + esc(m[1]) + '</span></li>';
            }).join('') + '</ul></section>';
      }
      case 'todo':
        return '<div class="pjTodo gridWrapper hasPadding"><p class="rv"><b>待补</b>' + en('To be written') + '<span>' + esc(b.text) + '</span></p></div>';
      case 'page':
        var set = gallerySets.push((b.shots || []).map(function (s) { return s; })) - 1;
        var right = '';
        var hasBA = (b.tags || []).length && (b.shots || []).length && (b.live || []).length;
        if (hasBA) {   /* owner：重点展示改版后（大），改版前缩成小图放旁边，点开才看大图 */
          right += '<div class="pjBA rv"><span class="pjBA__tag pjBA__tag--new">' + esc(b.tags[1] || '改版后') + '</span>' + preview(b.live[0])
            + '<div class="pjBA__before"><span class="pjBA__tag pjBA__tag--old">' + esc(b.tags[0] || '改版前') + '<i>点开看大图</i></span>'
            + '<div class="pjBA__thumbs">' + b.shots.map(function (sh, i) { return '<button class="pjShot pjShot--mini" type="button" data-set="' + set + '" data-i="' + i + '" title="' + esc(sh[1] || '') + '"><span class="pjShot__frame"><img src="' + esc(sh[0]) + '" alt="' + esc(sh[1] || '') + '" loading="lazy" draggable="false"></span></button>'; }).join('') + '</div></div></div>';
        } else {
          if (b.tags && b.tags.length) right += '<div class="pjPage__tags rv">' + b.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>';
          if ((b.shots || []).length) right += b.shots.map(function (s, i) { return shotFig(s, set, i); }).join('');
          else if ((b.live || []).length) right += b.live.map(preview).join('');
          else right += '<div class="pjPlaceholder rv"><b>待补图</b>' + en('Image to come') + '</div>';
        }
        if ((b.grid || []).length) right += '<ul class="pjGrid rv">' + b.grid.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul>';
        return '<article class="pjPage gridWrapper hasPadding"><div class="pjPage__text">'
          + (b.n ? '<span class="pjPage__n" lang="en">' + esc(String(b.n).padStart(2, '0')) + '</span>' : '')
          + (b.title ? '<h4 class="pjPage__title rv">' + esc(b.title) + '</h4>' : '')
          + (b.sub ? '<p class="pjPage__sub rv">' + esc(b.sub) + '</p>' : '')
          + (b.body || []).map(function (p) { return '<p class="pjPage__body rv">' + esc(p) + '</p>'; }).join('')
          + ((b.steps || []).length ? '<ol class="pjPage__steps rv">' + b.steps.map(function (s) { return '<li><b>' + esc(s[0]) + '</b>' + esc(s[1]) + '</li>'; }).join('') + '</ol>' : '')
          + liveList(b.live)
          + '</div><div class="pjPage__media">' + right + '</div></article>';
      case 'ds':
        /* 设计系统横滚板块搬到 js/ds.js，首页和这里共用一份 */
        return window.V7DS ? window.V7DS.html({ lead: b.lead, hint: b.hint }) : '';
      case 'gallery':
        var gs = gallerySets.push(b.shots || []) - 1;
        sliderQueue.push(gs);
        return '<section class="pjGallery">' + (b.lead ? '<p class="pjLead gridWrapper hasPadding"><span class="rv">' + esc(b.lead) + '</span></p>' : '')
          + '<div class="gridWrapper hasPadding pjGallery__wrap"><div class="pjWall" data-set="' + gs + '">' + (b.shots || []).map(function (sh) { return '<a href="' + esc(sh[0]) + '"><img src="' + esc(sh[0]) + '" alt="' + esc(sh[1] || '') + '" loading="lazy"></a>'; }).join('') + '</div></div>'
          + '<p class="pjGallery__hint gridWrapper hasPadding rv"><span>鼠标停在哪一张，那一列就停；点开看大图</span>' + en('Hover to pause · Click to enlarge') + '</p></section>';
      case 'windows':
        return '<div class="pjWindows gridWrapper hasPadding">' + (b.items || []).map(function (w) {
          var u = localAsset(w[3]), local = u !== w[3] || !/^https?:/.test(u);
          return '<article class="pjWin rv"><a class="pjWin__view" href="' + esc(u) + '"' + (local ? '' : ' target="_blank" rel="noopener"') + ' aria-label="打开' + esc(w[1]) + '"><iframe data-src="' + esc(u) + '" loading="lazy" tabindex="-1" scrolling="no" title="' + esc(w[1]) + '"></iframe></a>'
            + '<span class="pjWin__kk" lang="en">' + esc(w[0]) + '</span><h4 class="pjWin__title"><a href="' + esc(u) + '"' + (local ? '' : ' target="_blank" rel="noopener"') + '>' + esc(w[1]) + '</a></h4><p class="pjWin__text">' + esc(w[2]) + '</p>' + (local ? '<a class="arrowButton alwaysVisible pjWin__go" href="' + esc(u) + '"><span class="arrowButton__text">打开</span><span class="arrowButton__wrapper"><span class="arrowButton__arrows"><span class="arrows__arrow arrows__arrow--default">' + ARROW + '</span><span class="arrows__arrow arrows__arrow--hover">' + ARROW + '</span></span></span></a>' : arrowButton('打开', u, 'pjWin__go')) + '</article>';
        }).join('') + '</div>';
      case 'note':
        return '<section class="pjNote"><div class="gridWrapper hasPadding"><p class="pjNote__label rv" lang="en">' + esc(b.label) + '</p><h3 class="pjNote__title rv">' + esc(b.title) + '</h3><div class="pjNote__body">' + (b.body || []).map(function (p) { return '<p class="rv">' + esc(p) + '</p>'; }).join('') + '</div></div></section>';
      case 'modes':   /* 流水线执行流程的三种模式（单页面 / 多页面 / 改动与微调），顶部切换 */
        var mid = 'modes-' + bi;
        return '<div class="pjModes gridWrapper hasPadding" id="' + mid + '"><div class="pjModes__tabs rv" role="tablist">' + (b.items || []).map(function (m, i) {
            return '<button class="pjModes__tab' + (i ? '' : ' is-on') + '" type="button" role="tab" aria-selected="' + (i ? 'false' : 'true') + '" data-i="' + i + '"><b>' + esc(m.label) + '</b>' + en(m.en) + '</button>';
          }).join('') + '</div>'
          + (b.items || []).map(function (m, i) {
            return '<div class="pjModes__panel" role="tabpanel" data-i="' + i + '"' + (i ? ' hidden' : '') + '><p class="pjModes__lead">' + esc(m.lead || '') + '</p>' + stepsList(m.steps || []) + '</div>';
          }).join('') + '</div>';
      case 'steps':   /* owner：三级页面直接放缩略图（页面实时预览），点开跳转，和 v1.1 一样 */
        return stepsList(b.items || [], true);
        return '<ol class="pjSteps gridWrapper hasPadding">' + (b.items || []).map(function (st) {
          return '<li class="rv"><span class="pjSteps__n" lang="en">' + esc(st.n) + '</span><b class="pjSteps__title">' + esc(st.title) + '</b>'
            + ((st.live || []).length ? '<div class="pjThumbs">' + st.live.map(function (l) {
              return '<a class="pjThumb" href="' + esc(localAsset(l[1])) + '" target="_blank" rel="noopener"><span class="pjThumb__view"><iframe data-src="' + esc(localAsset(l[1])) + '" loading="lazy" tabindex="-1" scrolling="no" title="' + esc(cleanLabel(l[0])) + '"></iframe></span><span class="pjThumb__label">' + esc(cleanLabel(l[0])) + '<i aria-hidden="true">' + ARROW + '</i></span></a>';
            }).join('') + '</div>' : '') + '</li>';
        }).join('') + '</ol>';
      case 'modules':
        return '<div class="pjModules">' + (b.items || []).map(function (m, i) {
          return '<a class="pjModule gridWrapper hasPadding rv" href="#" data-module="' + esc(m[0].replace(/\s*\d+\s*屏.*$/, '').trim()) + '"><span class="pjModule__n" lang="en">' + String(i + 1).padStart(2, '0') + '</span><b class="pjModule__title">' + esc(m[0].replace(/\s*\d+\s*屏.*$/, '').trim()) + '</b><span class="pjModule__desc">' + esc(m[2]) + '</span>' + CHEV + '</a>';
        }).join('') + '</div>';
      default: return '';
    }
  }

  /* 下一个项目 */
  var nextKey = order[(index + 1) % order.length], nextMeta = ((C.work && C.work.projects) || []).filter(function (p) { return p.key === nextKey; })[0] || {};
  html += '<section class="pjNext"><a class="pjNext__link" href="project.html?p=' + nextKey + '" data-pt><span class="pjNext__label">下一个项目' + en('Next project') + '</span><span class="pjNext__title">' + pm(nameOf(nextKey)) + '</span><span class="pjNext__type">' + esc(nextMeta.type || (PJ[nextKey] || {}).status || '') + '</span><span class="pjNext__bar" aria-hidden="true"><i></i></span><span class="pjNext__hint">继续向下滚动' + en('Keep scrolling') + '</span></a>'
    + '<div class="gridWrapper hasPadding pjNext__bottom"><a class="mainButton" href="index.html#work" data-pt>全部项目</a><span>© 2026 ' + esc(C.name) + '</span></div></section>';
  root.innerHTML = html;

  /* 模块入口 → 滚到同名 section */
  [].forEach.call(root.querySelectorAll('.pjModule'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault(); var id = sectionIds[a.getAttribute('data-module')]; var t = id && q(id); if (!t) return;
      if (lenis) lenis.scrollTo(t, { offset: -40, duration: 1.4 }); else t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ── 模式切换 ── */
  [].forEach.call(root.querySelectorAll('.pjModes'), function (box) {
    box.addEventListener('click', function (e) {
      var t = e.target.closest('.pjModes__tab'); if (!t) return; var i = t.getAttribute('data-i');
      [].forEach.call(box.querySelectorAll('.pjModes__tab'), function (x) { var on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); });
      [].forEach.call(box.querySelectorAll('.pjModes__panel'), function (pn) {
        var on = pn.getAttribute('data-i') === i; pn.hidden = !on;
        if (on) { [].forEach.call(pn.querySelectorAll('.rv'), function (el) { gsap.set(el, { opacity: 1, y: 0 }); }); requestAnimationFrame(function () { fitPreviews(); watchFrames(); }); }
      });
    });
  });

  /* ── iframe 懒加载：进视口前 600px 才赋 src（owner 嫌项目页慢：之前 7 个线上原型一进页就加载，拖住整页） ── */
  var frameIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en2) { if (en2.isIntersecting) { var f = en2.target; if (!f.src && f.getAttribute('data-src')) f.src = f.getAttribute('data-src'); frameIO.unobserve(f); } });
  }, { rootMargin: '600px 0px' }) : null;
  function watchFrames() { [].forEach.call(root.querySelectorAll('iframe[data-src]:not([src])'), function (f) { if (frameIO) frameIO.observe(f); else f.src = f.getAttribute('data-src'); }); }
  watchFrames();
  bindDsScroll();

  /* ── 点开操作：浮层里放一个 1440×900 的真页面，缩到视口里，能点能填 ── */
  var live = document.createElement('div');
  live.className = 'pjStage'; live.hidden = true;
  live.innerHTML = '<div class="pjStage__bg" data-close></div>'
    + '<div class="pjStage__box"><div class="pjStage__bar"><b id="pjStageT"></b>'
    + '<span class="pjStage__hint">这是真的页面，直接点就行</span>'
    + '<a class="pjStage__btn" id="pjStageNew" target="_blank" rel="noopener">在新窗口打开</a>'
    + '<button class="pjStage__btn" type="button" data-close>关闭</button></div>'
    + '<div class="pjStage__wrap" id="pjStageWrap"></div></div>';
  document.body.appendChild(live);
  var stageW = 1440, stageH = 1024;   /* owner：所有界面按 1440×1024 渲染，不然整体变形 */
  function fitStage() {
    var wrap = document.getElementById('pjStageWrap'), f = wrap.firstChild; if (!f) return;
    var k = Math.min(wrap.clientWidth / stageW, wrap.clientHeight / stageH);
    f.style.width = stageW + 'px'; f.style.height = stageH + 'px';
    f.style.transform = 'translate(-50%,-50%) scale(' + k.toFixed(5) + ')';
  }
  function openStage(u, title) {
    var wrap = document.getElementById('pjStageWrap');
    wrap.innerHTML = '<iframe src="' + u + '" title="' + title + '"></iframe>';
    document.getElementById('pjStageT').textContent = title;
    document.getElementById('pjStageNew').href = u;
    live.hidden = false; document.documentElement.classList.add('pjStage-on');
    requestAnimationFrame(function () { live.classList.add('is-on'); fitStage(); });
  }
  function closeStage() {
    live.classList.remove('is-on'); document.documentElement.classList.remove('pjStage-on');
    setTimeout(function () { live.hidden = true; document.getElementById('pjStageWrap').innerHTML = ''; }, 260);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-live]');
    if (b) { e.preventDefault(); openStage(b.getAttribute('data-live'), b.getAttribute('data-live-t') || '可点页面'); return; }
    if (e.target.closest && e.target.closest('.pjStage [data-close]')) closeStage();
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !live.hidden) closeStage(); });
  addEventListener('resize', fitStage);

  /* ── 实时预览（可点原型 / 三级页缩略 / 资产卡）：页面按 1440 宽渲染，再整体缩到框宽，完整不裁 ── */
  function fitPreviews() {
    [].forEach.call(root.querySelectorAll('.pjPreview iframe, .pjThumb__view iframe, .pjWin__view iframe'), function (f) {
      var box = f.parentNode, w = box.clientWidth, h = box.clientHeight; if (!w) return;
      var k = w / 1440;
      f.style.width = '1440px'; f.style.height = Math.ceil(h / k) + 'px'; f.style.transform = 'scale(' + k.toFixed(5) + ')';
    });
  }
  fitPreviews(); addEventListener('resize', fitPreviews); addEventListener('load', fitPreviews);

  /* ── 横滑（剩余页面） ── */
  /* 剩余页面：v1.1 的瀑布流截图墙（owner：横滑拖不动，保留之前那种流动的交互）。参数照 v1.1：3 列、瓷片 400×284、速度 24、视差 1.7、渐隐 .22 */
  [].forEach.call(root.querySelectorAll('.pjWall'), function (el) {
    var set = +el.getAttribute('data-set'), shots = gallerySets[set];
    if (!window.DriftWall) return;
    /* 列数按图片数量定：DriftWall 每列会把自己那份复制几遍首尾相接，
       一份的高度不到一屏，同一张就会在一屏里出现两次（owner：同一列出现了重复的）。
       实测每张瓷片在 3D 透视下约占 130px，所以每列至少要有 7 张，一份才撑得过 900px 的视口。 */
    var cols = shots.length >= 21 ? 3 : shots.length >= 14 ? 2 : 1;
    window.DriftWall.mount(el, { columns: cols, tileW: cols === 1 ? 560 : cols === 2 ? 460 : 400, tileH: cols === 1 ? 398 : cols === 2 ? 327 : 284, gap: 16, radius: 14, tilt: 16, turn: -14, roll: 0, perspective: 1200, depth: 120, speed: 24, direction: 'up', variance: .35, parallax: 1.7, pauseOnHover: false, lift: 64, fade: .22, dim: .96, grayscale: false, overlay: '#f7f7f7',
      onOpen: function (t) { var i = shots.map(function (x) { return x[0]; }).indexOf(t.src); openLb(set, Math.max(0, i)); } });
  });

  /* ── 大图 ── */
  var lb = q('pjLightbox'), lbImg = lb.querySelector('.lb__img'), lbCap = lb.querySelector('.lb__cap'), lbSet = 0, lbI = 0;
  function showLb() { var s = gallerySets[lbSet][lbI]; if (!s) return; lbImg.src = s[0]; lbImg.alt = s[1] || ''; lbCap.textContent = (s[1] || '') + '　' + (lbI + 1) + ' / ' + gallerySets[lbSet].length; lb.querySelector('.lb__prev').hidden = lb.querySelector('.lb__next').hidden = gallerySets[lbSet].length < 2; }
  function openLb(set, i) { lbSet = set; lbI = i; showLb(); lb.hidden = false; lenis && lenis.stop(); requestAnimationFrame(function () { lb.classList.add('is-on'); }); }
  function closeLb() { lb.classList.remove('is-on'); lenis && lenis.start(); setTimeout(function () { lb.hidden = true; }, 300); }
  function stepLb(d) { var n = gallerySets[lbSet].length; lbI = (lbI + d + n) % n; showLb(); }
  root.addEventListener('click', function (e) { var b = e.target.closest('.pjShot'); if (b) openLb(+b.getAttribute('data-set'), +b.getAttribute('data-i')); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lb__close')) closeLb(); else if (e.target.closest('.lb__prev')) stepLb(-1); else if (e.target.closest('.lb__next')) stepLb(1); });
  addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') stepLb(-1); if (e.key === 'ArrowRight') stepLb(1); });

  /* ── 平滑滚动 ── */
  var lenis = null;
  if (!reduce && window.Lenis) { lenis = new Lenis({ lerp: .085, smoothWheel: true, syncTouch: true, wheelMultiplier: .45 }); window.__v7lenis = lenis; gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
  /* 进项目页一律从顶上开始（owner：有时进来不在最上方）：Lenis 建好后、load 后、从后退缓存回来时各压一次；带锚点进来除外 */
  /* 设计系统横滚：鼠标拖动 + 竖滚轮转横滚（不抢页面滚动，到头就放手） */
  function bindDsScroll() {
    [].forEach.call(document.querySelectorAll('[data-dsscroll]'), function (el) {
      var down = false, sx = 0, sl = 0, moved = 0;
      el.addEventListener('pointerdown', function (e) {
        if (e.button) return; down = true; moved = 0; sx = e.clientX; sl = el.scrollLeft;
        el.classList.add('is-drag'); el.setPointerCapture && el.setPointerCapture(e.pointerId);
      });
      el.addEventListener('pointermove', function (e) {
        if (!down) return; var d = e.clientX - sx; moved = Math.max(moved, Math.abs(d)); el.scrollLeft = sl - d;
      });
      function up() { down = false; el.classList.remove('is-drag'); }
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      el.addEventListener('wheel', function (e) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        var max = el.scrollWidth - el.clientWidth;
        if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return;
        el.scrollLeft += e.deltaY; e.preventDefault();
      }, { passive: false });
    });
  }

  function toTop() { if (location.hash) return; window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); }
  toTop(); addEventListener('load', toTop); addEventListener('pageshow', function (e) { if (e.persisted) toTop(); });

  /* ── 进场 ── */
  var lines = [].slice.call(root.querySelectorAll('.line')), rv = [].slice.call(root.querySelectorAll('.rv')), figs = [].slice.call(root.querySelectorAll('.pjFig__frame'));
  if (!reduce) { gsap.set(lines, { y: 0, yPercent: 110 }); gsap.set(rv, { opacity: 0, y: 16 });  }
  var started = false;
  function tick() {
    if (!started || reduce) return;
    var vh = innerHeight;
    for (var i = lines.length - 1; i >= 0; i--) { var r = lines[i].parentNode.getBoundingClientRect(); if (r.top < vh * .95) { gsap.to(lines[i], { yPercent: 0, duration: 1.125, ease: 'reveal', delay: (lines[i].closest('.pjHero') ? .1 * i : 0) }); lines.splice(i, 1); } }
    for (var j = rv.length - 1; j >= 0; j--) { var b = rv[j].getBoundingClientRect(); if (b.top < vh * .94) { gsap.to(rv[j], { opacity: 1, y: 0, duration: .9, ease: 'reveal' }); rv.splice(j, 1); } }
    for (var k = 0; k < figs.length; k++) {   /* owner：往下滚时背景展开露出里面的内容（同关于页大照片） */
      var f = figs[k], fr = f.getBoundingClientRect();
      if (fr.bottom < -50 || fr.top > vh + 50) continue;
      var p = Math.max(0, Math.min(1, (vh - fr.top) / (vh * .85))), e = 1 - Math.pow(1 - p, 3);
      var ix = (1 - e) * 16, iy = (1 - e) * 9;
      f.style.clipPath = 'inset(' + iy.toFixed(2) + '% ' + ix.toFixed(2) + '% round ' + (.43 + (1 - e) * 1.2).toFixed(2) + 'rem)';
      var im = f.firstChild; if (im) im.style.transform = 'scale(' + (1.12 - .12 * e).toFixed(4) + ')';
    }
  }
  gsap.ticker.add(tick);
  function start() { started = true; }
  if (window.V7Transition && window.V7Transition.isArriving()) addEventListener('v7:pt-exit-start', start, { once: true });
  else if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
  setTimeout(start, 2500);   /* 兜底：切场事件没来也要进场 */

  /* ── 滚到页底继续滚：进度线慢慢长满，满了跳下一个项目（沿用 v1.1 章末「下一页」参数，owner 嫌多后累计改 1800：
       累计 1800、单次滚轮最多计 70、刚到底 400ms 内不计、停 1.5s 归零；约 38 格滚轮长满） ── */
  var np = root.querySelector('.pjNext__link'), npBar = root.querySelector('.pjNext__bar i');
  /* 翻章条：TH 累计阈值、CAP 单个 wheel 事件最多计多少、ARM 到底后「上膛」延迟、DECAY 停多久衰减归零。
     owner 2026-09-18：原来要滚 5 下，改成 3 下 → 阈值降到 0.6 倍；
     顺带缩短上膛延迟、把衰减从 1.5s 放宽到 2.2s，免得两下之间的停顿把进度吃回去。 */
  var TH = 1080, CAP = 70, ARM = 250, DECAY = 2200, acc = 0, decayT = 0, lock = 0, armedAt = 0;
  function sy() { return lenis ? lenis.animatedScroll : window.scrollY; }
  function atBottom() { return innerHeight + sy() >= document.documentElement.scrollHeight - 60; }
  function setP(p) { p = Math.max(0, Math.min(1, p)); npBar.style.transform = 'scaleX(' + p.toFixed(4) + ')'; np.classList.toggle('is-filling', p > 0); }
  function goNext() {
    if (lock) return; lock = 1; setP(1);
    var href = np.getAttribute('href');
    if (window.V7Transition) window.V7Transition.go(href); else location.href = href;
  }
  addEventListener('wheel', function (e) {
    if (lock || e.deltaY <= 0 || !matchMedia('(min-width:761px)').matches) return;
    if (!atBottom()) { armedAt = 0; return; }
    if (!armedAt) { armedAt = Date.now(); return; }
    if (Date.now() - armedAt < ARM) return;
    acc += Math.min(e.deltaY, CAP); setP(acc / TH);
    clearTimeout(decayT); decayT = setTimeout(function () { var o = { v: acc / TH }; acc = 0; gsap.to(o, { v: 0, duration: .5, ease: 'power2.out', onUpdate: function () { setP(o.v); } }); }, DECAY);
    if (acc >= TH) goNext();
  }, { passive: true });
  addEventListener('scroll', function () { if (!lock && acc && !atBottom()) { acc = 0; armedAt = 0; setP(0); } }, { passive: true });
  addEventListener('pageshow', function (e) { if (e.persisted) { lock = 0; acc = 0; setP(0); } });

  /* ── 带锚点进来（首页「其他作品」→ 企业协作平台的某个模块）：等图片撑开后滚到对应章节。
       支持 #sec-<块序号>，也支持更稳的 #t-<章节标题>（块顺序改了也不失效） ── */
  function hashTarget() {
    var h = decodeURIComponent(location.hash || '').slice(1); if (!h) return null;
    if (/^t-/.test(h)) { var t = h.slice(2); return [].filter.call(root.querySelectorAll('[data-anchor]'), function (el) { return el.getAttribute('data-anchor') === t; })[0] || null; }
    return q(h);
  }
  function toHash(immediate) { var t = hashTarget(); if (!t) return; var y = t.getBoundingClientRect().top + sy() - 60; if (lenis) lenis.scrollTo(y, { immediate: !!immediate, duration: 1.2, force: true }); else window.scrollTo(0, y); }
  if (location.hash) {
    [].forEach.call(root.querySelectorAll('img[loading="lazy"]'), function (im) { im.loading = 'eager'; });   /* 锚点在后面：先把前面的图都载完，位置才准 */
    var once = function () { toHash(true); setTimeout(function () { toHash(true); }, 600); setTimeout(function () { toHash(true); }, 1500); };
    if (document.readyState === 'complete') once(); else addEventListener('load', once, { once: true });
  }

  window.__v7project = { slug: slug, sets: gallerySets, np: { setP: setP, go: goNext } };
})();

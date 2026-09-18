/* ui.js —— AI Workflow Agent 页面外壳（左侧导航 + 顶栏）与公共交互。维护：网站交互调整。
   每个页面只写自己的内容，<body> 上用 data- 属性声明上下文：
     data-nav="flows|chat|builder|check|review|runs|exc|versions|rules"
     data-title="页面标题"  data-flow="供应商付款审批"  data-ver="v4 草稿"  data-state="待体检"
   file:// 下直接可用：不用模块、不用 fetch。 */
(function () {
  'use strict';
  /* ── 平台外框开关：true = 套上中企云链的框架（标签栏 + 一级导航 + 圆角内容卡），false = 只留产品本身 ── */
  var FRAME = true;
  var I = {   /* 图标：1.6px 线，统一 16px 画框 */
    flows: '<path d="M3 4.5h10M3 8h7M3 11.5h4"/><circle cx="12.5" cy="11.5" r="2"/>',
    chat: '<path d="M2.5 3.5h11v7.5h-6L4 13.5V11H2.5z"/><path d="M5.5 7h5"/>',
    builder: '<rect x="2" y="5.5" width="4" height="5" rx="1"/><rect x="10" y="2.5" width="4" height="4" rx="1"/><rect x="10" y="9.5" width="4" height="4" rx="1"/><path d="M6 8h2.2a1.8 1.8 0 0 0 1.8-1.8V4.5M6 8h2.2a1.8 1.8 0 0 1 1.8 1.8v1.7"/>',
    check: '<path d="M8 1.8 13.5 4v4.1c0 3-2.3 5-5.5 6.1-3.2-1.1-5.5-3.1-5.5-6.1V4z"/><path d="M5.8 8.1 7.3 9.6l3-3.2"/>',
    review: '<path d="M4.5 2.5h7l2 2v9h-9z"/><path d="M6 7.5h4M6 10h2.5"/>',
    runs: '<circle cx="8" cy="8" r="5.8"/><path d="M8 4.8V8l2.2 1.4"/>',
    exc: '<path d="M8 2.4 14 13H2z"/><path d="M8 6.4v3M8 11.1h.01"/>',
    versions: '<circle cx="4.4" cy="4" r="1.8"/><circle cx="4.4" cy="12" r="1.8"/><circle cx="11.6" cy="8" r="1.8"/><path d="M4.4 5.8v4.4M6.2 4h2.2a1.6 1.6 0 0 1 1.6 1.6v.8M6.2 12h2.2a1.6 1.6 0 0 0 1.6-1.6v-.8"/>',
    rules: '<path d="M3.5 2.5h9v11h-9z"/><path d="M5.8 5.8h4.4M5.8 8.4h4.4M5.8 11h2.4"/>',
    approve: '<path d="M4 2.5h6.2L13 5.3v8.2H4z"/><path d="M6.2 8.6 7.6 10l2.6-2.8"/>',
    work: '<rect x="2.5" y="4" width="11" height="8.5" rx="1.4"/><path d="M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M2.5 7.5h11"/>',
    mine: '<path d="M4 2.5h8v11l-4-2.6-4 2.6z"/>',
    done: '<circle cx="8" cy="8" r="5.8"/><path d="M5.6 8.2 7.2 9.8l3.2-3.4"/>',
    cc: '<path d="M2.5 4h11v8h-11z"/><path d="m2.5 4.6 5.5 4 5.5-4"/>',
    build: '<rect x="2.5" y="2.5" width="5" height="5" rx="1.2"/><rect x="8.5" y="8.5" width="5" height="5" rx="1.2"/><path d="M7.5 5h3a1 1 0 0 1 1 1v2.5"/>',
    tpl: '<rect x="2.5" y="3" width="11" height="10" rx="1.4"/><path d="M2.5 6.2h11M6 6.2V13"/>',
    new: '<circle cx="8" cy="8" r="5.8"/><path d="M8 5.4v5.2M5.4 8h5.2"/>',
    swap: '<path d="M3 6h9l-2.2-2.2M13 10H4l2.2 2.2"/>',
    set: '<circle cx="8" cy="8" r="2.1"/><path d="M8 1.9v1.6M8 12.5v1.6M14.1 8h-1.6M3.5 8H1.9M12.3 3.7l-1.1 1.1M4.8 11.2l-1.1 1.1M12.3 12.3l-1.1-1.1M4.8 4.8 3.7 3.7"/>',
    back: '<path d="M9.5 3.5 5 8l4.5 4.5"/>',
    x: '<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>',
    ok: '<path d="M3 8.4 6.4 11.8 13 4.6"/>',
    spark: '<path d="M8 2.2l1.5 3.9 3.9 1.5-3.9 1.5L8 13l-1.5-3.9L2.6 7.6l3.9-1.5z"/>',
    warn: '<circle cx="8" cy="8" r="6"/><path d="M8 5v3.4M8 10.6h.01"/>',
    arr: '<path d="M3.5 8h9M9 4.5 12.5 8 9 11.5"/>',
    search: '<circle cx="7.2" cy="7.2" r="4.4"/><path d="M10.6 10.6 14 14"/>',
    bell: '<path d="M8 2.2a4 4 0 0 0-4 4v2.4L2.8 11h10.4L12 8.6V6.2a4 4 0 0 0-4-4z"/><path d="M6.6 11a1.4 1.4 0 0 0 2.8 0"/>'
  };
  function svg(k, w) { return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="' + (w || 1.5) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[k] + '</svg>'; }
  window.AGIcon = svg;

  /* owner 2026-09-16：「咱们得分成前台和后台吧？前台就是大家可能需要去审批的，后台就是流程搭建之类的」
     → 两个应用两套导航：前台（审批工作台）全员用，后台（流程中台）只有流程管理员进。<body data-app="front|admin">。 */
  /* owner 2026-09-16：「根据他登录的身份在右上角有个流程中台的按钮」
     → 身份决定入口：只有带 admin 角色的人，前台右上角才会出现「流程中台」。审批页面本身不动。 */
  /* owner 2026-09-16：「头像去用真实头像」→ 画一组扁平人像当头像（本地 SVG，不引外部图，也不用任何真人照片） */
  var FACES = {
    孙悦: ['#F3D3C4', '#3B2B26', 'f1', '#C9D6F5'],
    周宁: ['#F6DCC8', '#4A3A33', 'f2', '#D8D2F0'],
    高远: ['#EFD0B8', '#2F2A27', 'f3', '#CFE0D6'],
    陈立: ['#F2D6C0', '#37312D', 'f4', '#E4D9C6'],
    林珊: ['#FADFCD', '#2E2622', 'f5', '#F0D3DA'],
    郑敏: ['#F5DAC6', '#3A2E29', 'f2', '#D6E2EF'],
    Agent: ['#DCE0F7', '#4857e2', 'ai', '#EEF0FC']
  };
  function face(name, size) {
    var f = FACES[name] || FACES['周宁'], sk = f[0], hair = f[1], sty = f[2], bg = f[3];
    var hairPath = {
      f1: '<path d="M11 19c0-6 3.6-9.4 9-9.4S29 13 29 19c0 2-.6 3.4-.6 3.4s.4-6.6-3.6-7.8c-3 2.6-9.4 3-12.2 1.6-1.4 1.6-1.2 6.2-1.2 6.2S11 21 11 19z" fill="' + hair + '"/><path d="M11 18c-1.6 4-1.2 9.6-.4 12.4l2.2-1.6c-1-3.4-1-8-.4-10.8zM29 18c1.6 4 1.2 9.6.4 12.4l-2.2-1.6c1-3.4 1-8 .4-10.8z" fill="' + hair + '"/>',
      f2: '<path d="M11.4 20.4C11 13.6 15 10 20 10s9 3.6 8.6 10.4c-.2 2.6-1 3.4-1 3.4s.2-4.4-1.6-6c-2.6 1.8-9.6 2-12.4.4-1 1.4-1.2 5.6-1.2 5.6s-.8-.8-1-3.4z" fill="' + hair + '"/>',
      f3: '<path d="M12 19c0-5.4 3.4-8.6 8-8.6S28 13.6 28 19c0 1-.2 1.8-.2 1.8s-.6-4-2.6-5c-2.8 1.6-7.6 1.6-10.4 0-2 1-2.6 5-2.6 5S12 20 12 19z" fill="' + hair + '"/>',
      f4: '<path d="M12.4 19.6c0-5 3.2-8.2 7.6-8.2s7.6 3.2 7.6 8.2c0 .8-.2 1.4-.2 1.4s-.8-3.4-2.2-4.2c-2.6 1.2-7.8 1.2-10.4 0-1.4.8-2.2 4.2-2.2 4.2s-.2-.6-.2-1.4z" fill="' + hair + '"/><path d="M14.6 21.6h4v1.2h-4zM21.4 21.6h4v1.2h-4zM18.6 22h2.8v.6h-2.8z" fill="#2F3B52" opacity=".55"/>',
      f5: '<path d="M11.6 20c0-6 3.8-9.6 8.4-9.6s8.4 3.6 8.4 9.6c0 1.4-.4 2.6-.4 2.6s-.6-5.4-3-6.6c-3 2-8.8 2.2-11.6.8-1 1.6-1.4 5.8-1.4 5.8S11.6 21.4 11.6 20z" fill="' + hair + '"/><path d="M27.6 22c2.6 1.6 3.4 5.6 2.4 8.6l-2.8-1.4c.8-2.4.8-5.2.4-7.2z" fill="' + hair + '"/>',
      ai: '<path d="M20 10.6l1.9 4.9 4.9 1.9-4.9 1.9-1.9 4.9-1.9-4.9-4.9-1.9 4.9-1.9z" fill="' + hair + '"/>'
    }[sty];
    var s2 = size || 40;
    return '<svg viewBox="0 0 40 40" width="' + s2 + '" height="' + s2 + '" aria-hidden="true">'
      + '<circle cx="20" cy="20" r="20" fill="' + bg + '"/>'
      + (sty === 'ai' ? hairPath : '<path d="M20 22.6c3.4 0 6.2-2.8 6.2-6.6S23.4 9.4 20 9.4s-6.2 2.8-6.2 6.6 2.8 6.6 6.2 6.6z" fill="' + sk + '"/>'
        + '<path d="M20 24c6 0 10.6 3.6 11.6 9.2A19.9 19.9 0 0 1 20 40a19.9 19.9 0 0 1-11.6-6.8C9.4 27.6 14 24 20 24z" fill="#FFFFFF" opacity=".92"/>'
        + '<path d="M20 24c5.4 0 9.8 3 11.2 7.8A19.9 19.9 0 0 1 20 40a19.9 19.9 0 0 1-11.2-8.2C10.2 27 14.6 24 20 24z" fill="' + hair + '" opacity=".14"/>'
        + hairPath
        + '<circle cx="17.2" cy="16.6" r=".9" fill="#2A2320"/><circle cx="22.8" cy="16.6" r=".9" fill="#2A2320"/>'
        + '<path d="M18.4 19.4c.9.7 2.3.7 3.2 0" stroke="#2A2320" stroke-width=".8" stroke-linecap="round" fill="none"/>')
      + '</svg>';
  }
  window.AGFace = face;

  var USERS = {
    sun: { ini: '孙', name: '孙悦', role: '应付会计 · 财务运营部', admin: false },
    zhou: { ini: '周', name: '周宁', role: '流程管理员 · 财务运营部', admin: true }
  };
  function who() {
    /* owner 2026-09-16：默认就是有后台权限的身份，不再做前台/后台两套人 */
    var k = 'zhou';
    return k;
  }
  function setWho(k) { try { localStorage.setItem('ag_user', k); } catch (e) {} location.reload(); }

  var APPS = {
    admin: {
      name: '流程中台', org: '明远集团 · 后台',
      me: ['周', '周宁', '流程管理员 · 财务运营部'],
      other: ['审批工作台', 'workbench.html'],
      nav: [
        ['概览', [
          ['home', '工作台', 'home.html'],
          ['runs', '运行监控', 'runs.html'],
          ['exc', '异常处理', 'exceptions.html', 2]
        ]],
        ['构建', [
          ['flows', '流程管理', 'flows.html'],
          ['chat', '描述对话', 'chat.html'],
          ['builder', '流程配置', 'builder.html'],
          ['check', '上线前体检', 'check.html'],
          ['review', '变更审阅', 'review.html']
        ]],
        ['治理', [
          ['versions', '版本与回退', 'versions.html'],
          ['rules', '检查项库', 'rules.html', 2, 'soft']
        ]]
      ]
    },
    front: {
      name: '审批工作台', org: '明远集团 · 前台',
      me: ['孙', '孙悦', '应付会计 · 财务运营部'],
      other: ['流程中台', 'home.html'],
      nav: [
        ['我的', [
          ['new', '发起申请', 'apply.html'],
          ['work', '工作台', 'workbench.html'],
          ['approve', '待我处理', 'approvals.html', 3],
          ['done', '已处理的', 'approvals.html?tab=done'],
          ['mine', '我发起的', 'approvals.html?tab=mine'],
          ['cc', '抄送我的', 'approvals.html?tab=cc'],
          ['cross', '跨组织审批', 'approvals.html?tab=cross', 1]
        ]],
        ['搭建', [
          ['build', '搭建', 'build.html']
        ]]
      ]
    }
  };

  /* 平台一级应用（外框的一级导航）：我们的产品是平台里的「审批」这一格 */
  var PLAT = [['work', '工作台'], ['chat', '消息'], ['builder', '项目'], ['runs', '会议'], ['rules', '文档库'], ['approve', '审批', 1], ['versions', '日程'], ['mine', '人事']];
  function frame() {
    if (!FRAME) return;
    var d = document.body.dataset, front = d.app === 'front';
    var host = document.querySelector('.shell'); if (!host || document.querySelector('.frame')) return;
    document.documentElement.classList.add('has-frame');
    var tabs = front
      ? [['审批工作台', 1], ['工作台', 0], ['文档库', 0]]
      : [['流程中台', 1], ['审批工作台', 0], ['工作台', 0]];
    var f = document.createElement('div'); f.className = 'frame';
    f.innerHTML =
      '<div class="tabbar"><div class="tabbar__l">'
      + '<span class="wc"><i></i><i></i><i></i></span>'
      + '<span class="tabbar__s" data-toast="全局搜索：单号、流程名、人名都能搜">' + svg('search', 1.5) + '搜索</span>'
      + tabs.map(function (x) { return '<span class="tb' + (x[1] ? ' is-on' : '') + '" data-tb="' + x[0] + '">' + x[0] + (x[1] ? '<i>✕</i>' : '') + '</span>'; }).join('')
      + '</div><div class="tabbar__r">'
      + '<span class="tbn" data-toast="2 条新通知：付款申请待你确认、体检有 3 项未通过">' + svg('bell', 1.5) + '<em>2</em></span>'
      + '</div></div>'
      + '<div class="fbody"><div class="rail">'
      + '<span class="rail__logo">' + svg('spark', 1.3) + '</span><nav class="rail__n">'
      + PLAT.map(function (a) { return '<a class="ra' + (a[2] ? ' is-on' : '') + '" href="' + (a[2] ? (front ? 'workbench.html' : 'flows.html') : '#') + '">' + svg(a[0]) + '<span>' + a[1] + '</span></a>'; }).join('')
      + '</nav></div><div class="content-wrapper"></div></div>';
    host.parentNode.insertBefore(f, host);
    f.querySelector('.content-wrapper').appendChild(host);
  }

  function shell() {
    var d = document.body.dataset, side = document.getElementById('side'), top = document.getElementById('top');
    var app = APPS[d.app === 'front' ? 'front' : 'admin'];
    if (side) {
      var h = '<div class="side__brand"><div class="side__mark">' + svg('spark', 1.3) + '</div><div><div class="side__name">' + app.name + '</div><div class="side__org">' + app.org + '</div></div></div>'
        + '<div class="side__search">' + svg('search', 1.5) + '<span>' + (d.app === 'front' ? '搜索单据' : '搜索流程、运行') + '</span><kbd>⌘K</kbd></div>'
        + '<nav class="side__nav">';
      app.nav.forEach(function (g) {
        h += '<div class="side__group">' + g[0] + '</div>';
        g[1].forEach(function (it) {
          var on = d.nav === it[0];
          /* owner 2026-09-16：二级导航不要图标，只留文字 */
          h += '<a class="nav__i' + (on ? ' is-on' : '') + '" href="' + it[2] + '"><span>' + it[1] + '</span>'
            + (it[3] ? '<span class="nav__b"' + (it[4] === 'soft' ? ' style="background:var(--warn);"' : '') + '>' + it[3] + '</span>' : '') + '</a>';
        });
      });
      h += '</nav>';   /* owner：左下角的人员不要了 */
      side.innerHTML = h;
    }
    if (top) {
      /* owner 2026-09-16：一级页不要头部，面包屑只出现在二级页（有返回链接的才是二级页） */
      var t = '', sub = !!d.back;
      var tl = document.getElementById('topLeft');
      if (tl) { t += '<div class="top__left">' + tl.innerHTML + '</div>'; tl.remove(); }
      if (sub) {
        t += '<a class="top__back" href="' + d.back + '">' + svg('back') + (d.backText || '返回流程管理') + '</a>';
        /* owner 2026-09-16：返回和面包屑不能同时存在。带流程名的页面（编辑器 / 体检 / 审阅 / 版本）
           顶栏只留「返回 + 流程名 + 版本 + 状态」，页面标题交给下面的步骤条；不带流程名的短链照旧显示标题。 */
        if (!d.flow) t += '<h1>' + (d.title || '') + '</h1>';
        if (d.flow) t += '<h1>' + d.flow + '</h1>';
        if (d.ver) t += '<span class="tag mono">' + d.ver + '</span>';
        if (d.state) t += '<span class="tag ' + (d.stateTone ? 'tag--' + d.stateTone : '') + '">' + d.state + '</span>';
      }
      var meta = document.getElementById('topMeta');
      if (meta) { t += meta.innerHTML; meta.remove(); }   /* owner：相对 vN / 已保存 跟在「编辑中」后面 */
      var ctr = document.getElementById('topCenter');
      if (ctr) { t += '<div class="top__center">' + ctr.innerHTML + '</div>'; ctr.remove(); }   /* owner：编辑器/执行记录 居中 */
      var extra = document.getElementById('topActions') ? document.getElementById('topActions').innerHTML : '';
      var portal = '';
      /* owner 2026-09-16：不展示头像，默认就按有后台权限的身份来；编辑器里连应用切换也不出现 */
      /* owner 2026-09-16：换应用的按钮只出现在各自的工作台，别的页面不放 */
      if (!d.editor && d.nav === (d.app === 'front' ? 'work' : 'home')) {
        if (d.app === 'front') portal = '<a class="btn btn--portal" href="home.html">管理后台<i class="pdot"></i></a>';
        else portal = '<a class="btn btn--portal" href="workbench.html">审批工作台</a>';
      }
      t += '<div class="top__right">' + extra
        + portal
        + '</div>';
      top.innerHTML = t;
      top.classList.toggle('top--bare', !sub);
      /* 左边没面包屑、右边也没东西的头部，整条去掉 */
      if (!sub && !top.querySelector('.top__right').children.length && !top.querySelector('.top__left')) top.remove();
      var ta = document.getElementById('topActions'); if (ta) ta.remove();
    }
  }

  /* ── 公共交互：tab / 抽屉 / 弹窗 / toast ── */
  function tabs() {
    [].forEach.call(document.querySelectorAll('[data-tabs]'), function (box) {
      box.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-tab]'); if (!b) return;
        [].forEach.call(box.querySelectorAll('button[data-tab]'), function (x) { x.classList.toggle('is-on', x === b); });
        var scope = document.querySelector(box.dataset.tabs) || document;
        [].forEach.call(scope.querySelectorAll('[data-tab-panel]'), function (p) { p.classList.toggle('is-on', p.dataset.tabPanel === b.dataset.tab); });
      });
    });
  }
  var scrim;
  function getScrim() {
    if (!scrim) { scrim = document.createElement('div'); scrim.className = 'scrim'; document.body.appendChild(scrim); scrim.addEventListener('click', closeAll); }
    return scrim;
  }
  function open(el) { getScrim().classList.add('is-on'); el.classList.add('is-on'); }
  function closeAll() {
    getScrim().classList.remove('is-on');
    [].forEach.call(document.querySelectorAll('.drawer.is-on,.modal.is-on'), function (e) { e.classList.remove('is-on'); });
  }
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  var toastEl;
  function toast(msg, icon) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.innerHTML = svg(icon || 'ok') + '<span>' + msg + '</span>';
    toastEl.classList.add('is-on'); clearTimeout(toastEl.__t);
    toastEl.__t = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2600);
  }

  function autoBind() {
    document.addEventListener('click', function (e) {
      /* 平台外框的标签页与一级导航：本作品只做「审批」这一格，其余给一句说明 */
      var tb = e.target.closest('[data-tb]');
      if (tb) {
        var n = tb.dataset.tb;
        if (n === '审批工作台') { location.href = 'workbench.html'; return; }
        if (n === '流程中台') { location.href = 'home.html'; return; }
        toast('「' + n + '」是平台里的其他应用，这次只做了「审批」这一格');
        return;
      }
      var ra = e.target.closest('.ra:not(.is-on)');
      if (ra && ra.getAttribute('href') === '#') { e.preventDefault(); toast('「' + ra.textContent.trim() + '」是平台的其他应用，本作品只做「审批」'); return; }
      var o = e.target.closest('[data-open]'); if (o) { var t = document.querySelector(o.dataset.open); if (t) { e.preventDefault(); open(t); } return; }
      if (e.target.closest('[data-close]')) { e.preventDefault(); closeAll(); return; }
      var tt = e.target.closest('[data-toast]'); if (tt) { e.preventDefault(); toast(tt.dataset.toast, tt.dataset.toastIcon); }
    });
    /* 单选卡片组 */
    [].forEach.call(document.querySelectorAll('[data-optgroup]'), function (g) {
      g.addEventListener('click', function (e) {
        var o = e.target.closest('.opt'); if (!o) return;
        [].forEach.call(g.querySelectorAll('.opt'), function (x) { x.classList.toggle('is-on', x === o); });
        g.dispatchEvent(new CustomEvent('optchange', { detail: o }));
      });
    });
  }

  /* ── 全平台 AI 助手：右下角的圆形悬浮按钮（owner：做成一个圆的悬浮按钮，当全平台的 AI 助手）──
        问什么跟当前在哪一页有关；编辑器里不出现，那儿左边已经有一个专门改流程的助手了。 */
  var ASK = {
    approve: [['这张单该不该批？', 'Agent 的结论是「建议通过」：三单匹配一致、金额命中 5 万以下档、供应商不在黑名单。下一步是不可逆的执行付款，通过之后仍要有人做付款前确认。'],
              ['谁卡住了？', '你这三张里，「付款申请 ¥86,500」已转人工 40 分钟，卡在发票抬头与合同主体不一致。']],
    home:    [['今天有什么要我拍板的？', '三件：供应商付款有一条超时 26 小时（陈立出差没配代理人）、客户退款体检 2 项未过、2 条复盘生成的检查项等你批。'],
              ['哪条流程最容易出事？', '供应商付款审批。近 7 天转人工 9 次，都集中在「财务总监审批」这一步。']],
    flows:   [['哪条流程有不可逆节点？', '供应商付款审批（执行付款）、对外发文审批（对外发送）、费用报销（打款，已暂停）。这三条的不可逆节点前面都有人工确认。'],
              ['未发布的两条为什么没上线？', '客户退款审批体检 2 项未通过；员工离职回收还在对话生成中。']],
    runs:    [['现在有几条在跑？', '5 条进行中、2 条等待人工确认、1 条超时转人工。平均耗时 6 小时 20 分。']],
    exc:     [['这条异常怎么处理最快？', '陈立出差期间没配代理人，建议直接指定刘恒代理并补一条检查项：审批人出差必须配代理人。']],
    rules:   [['这两条待审批的检查项该批吗？', 'CK-19 来自 v4 回退的复盘，建议批；CK-20 涉及母子公司判定口径，建议先跟财务对一次再批。']]
  };
  var ASK_D = [['这个页面能做什么？', '我能按当前页面回答：单子该不该批、流程卡在哪、哪条流程有不可逆节点。换一页问我，答案跟着换。']];
  function aiFab() {
    var d = document.body.dataset;
    if (d.editor) return;                       /* 编辑器里左边已经有一个改流程的助手 */
    if (document.querySelector('.aifab')) return;
    var list = ASK[d.nav] || ASK_D;
    var fab = document.createElement('button');
    fab.className = 'aifab'; fab.type = 'button'; fab.setAttribute('aria-label', 'AI 助手');
    fab.innerHTML = svg('spark', 1.5) + '<em>1</em>';
    /* 有浮起操作条的页面：按操作条实际高度让位，不写死数值（窄屏操作条会换行变高） */
    function lift() {
      var bar = document.querySelector('.actbar__c');
      var b = bar && bar.offsetParent !== null ? Math.round(bar.getBoundingClientRect().height) + 42 : 26;
      fab.style.bottom = b + 'px'; pop.style.bottom = (b + 62) + 'px';
    }
    var pop = document.createElement('div');
    pop.className = 'aipop';
    pop.innerHTML = '<div class="aipop__h">' + svg('spark', 1.4) + '<b>AI 助手</b><button class="x" type="button" aria-label="收起">✕</button></div>'
      + '<div class="aipop__d">全平台通用。它看得到你正在看的这一页，问什么都按这一页回答。</div>'
      + '<div class="aipop__q">' + list.map(function (q, i) { return '<button type="button" data-q="' + i + '">' + q[0] + '</button>'; }).join('') + '</div>'
      + '<div class="aipop__a" hidden></div>'
      + '<div class="aipop__in"><input placeholder="问点别的" aria-label="问 AI 助手">'
      + '<button type="button" data-send>' + svg('arr', 1.8) + '</button></div>';
    document.body.appendChild(fab); document.body.appendChild(pop);
    lift(); addEventListener('resize', lift);
    if (window.MutationObserver) new MutationObserver(lift).observe(document.body, { childList: true, subtree: true });
    function toggle(on) { pop.classList.toggle('on', on); if (on) { var e = fab.querySelector('em'); if (e) e.remove(); } }
    fab.addEventListener('click', function () { toggle(!pop.classList.contains('on')); });
    pop.addEventListener('click', function (e) {
      if (e.target.closest('.x')) return toggle(false);
      var q = e.target.closest('[data-q]');
      if (q) {
        var a = pop.querySelector('.aipop__a');
        a.hidden = false; a.innerHTML = '<b>' + list[+q.dataset.q][0] + '</b><br>' + list[+q.dataset.q][1];
        return;
      }
      if (e.target.closest('[data-send]')) {
        var inp = pop.querySelector('input'), v = inp.value.trim();
        var a2 = pop.querySelector('.aipop__a'); a2.hidden = false;
        a2.innerHTML = v ? '<b>' + v + '</b><br>这一问我得看这一页的数据才敢答，先挑上面那几条试试。' : '说一句就行，比如上面那两条。';
        inp.value = '';
      }
    });
    document.addEventListener('click', function (e) {
      if (!pop.classList.contains('on')) return;
      if (e.target.closest('.aipop') || e.target.closest('.aifab')) return;
      toggle(false);
    });
  }

  window.AG = { shell: shell, open: open, close: closeAll, toast: toast, svg: svg };
  document.addEventListener('DOMContentLoaded', function () { frame(); shell(); tabs(); autoBind(); aiFab(); });
})();

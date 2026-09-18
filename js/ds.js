/* ds.js —— 设计系统横滚板块。首页（工作卡片下面）和 CSES 项目页共用这一份，别再各写一套。
   内容取自平台自己的 token（raw-variables.html）：主色 #4857e2、中性六阶 + 状态四色、字阶 32/24/18/14/12、
   16×16 图标规范与十二个同规范图标、控件库。维护：网站交互调整。 */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function en(t) { return '<span class="enTag" lang="en" aria-hidden="true">' + esc(t) + '</span>'; }

  function html(o) {
    o = o || {};

          /* 设计系统：横向滚动的规范条（照 owner 给的设计规范稿骨架：色彩 / 文字 / 图标规范 / 图标集 / 控件），
             内容用 CSES 自己的 token（raw-variables.html 里的值），不是抄稿子里的酒店配色。 */
          var SW = [
            ['#4857e2', '主色', '按钮、选中、链接'], ['#4958de', '主色 · 悬停', ''], ['#4351cd', '主色 · 按下', ''],
            ['#a4aeff', '主色 · 浅', '弱提示底'], ['#ced3ff', '主色 · 禁用', '']
          ];
          var NEU = [['#282626', '正文'], ['#525252', '次级'], ['#a1a1a1', '占位'], ['#e5e5e5', '描边'], ['#f5f5f5', '面'], ['#ffffff', '底']];
          var ST = [['#00c950', '成功'], ['#f0b100', '警告'], ['#fb2c36', '危险'], ['#00a6f4', '信息']];
          var TYPE = [['32 / 700', '页面大标题', 'font-size:32px;font-weight:700;letter-spacing:-.02em'],
            ['24 / 700', '区块标题', 'font-size:24px;font-weight:700'],
            ['18 / 600', '卡片标题', 'font-size:18px;font-weight:600'],
            ['14 / 400', '正文', 'font-size:14px'],
            ['12 / 400', '辅助说明', 'font-size:12px;color:#a1a1a1']];
          var ICONS = [
            ['首页', 'M3 7.2 8 3l5 4.2V13H3z'], ['审批', 'M4 2.5h6.2L13 5.3v8.2H4z M6.2 8.6 7.6 10l2.6-2.8'],
            ['任务', 'M3 4.5h10M3 8h10M3 11.5h6'], ['文档', 'M4.5 2.5h5l3 3v8h-8z M9.5 2.5v3h3'],
            ['日程', 'M3 4.5h10v9H3z M3 7h10M6 2.5v3M10 2.5v3'], ['消息', 'M2.5 3.5h11v7.5h-6L4 13.5V11H2.5z'],
            ['成员', 'M8 3.2a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8z M3.4 13.2c.5-2.2 2.4-3.3 4.6-3.3s4.1 1.1 4.6 3.3'],
            ['权限', 'M8 1.8 13.5 4v4.1c0 3-2.3 5-5.5 6.1-3.2-1.1-5.5-3.1-5.5-6.1V4z'],
            ['报表', 'M2.5 13.5V8M6.5 13.5V4M10.5 13.5v-7M14 13.5V2.5'], ['搜索', 'M7.2 2.8a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8z M10.6 10.6 14 14'],
            ['通知', 'M8 2.6a3.6 3.6 0 0 0-3.6 3.6v2.2L3.2 11h9.6l-1.2-2.6V6.2A3.6 3.6 0 0 0 8 2.6z M6.6 11a1.4 1.4 0 0 0 2.8 0'],
            ['设置', 'M8 5.9a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2z M8 2.2v1.4M8 12.4v1.4M13.8 8h-1.4M3.6 8H2.2M12 4l-1 1M5 11l-1 1M12 12l-1-1M5 5 4 4']
          ];
          function ic(p2) { return '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="' + p2 + '"/></svg>'; }
          function swat(list, big) {
            return '<div class="dsSw' + (big ? ' dsSw--big' : '') + '">' + list.map(function (c) {
              return '<div class="dsSw__i"><span style="background:' + c[0] + '"></span><b>' + c[0].toUpperCase() + '</b><i>' + c[1] + (c[2] ? ' · ' + c[2] : '') + '</i></div>';
            }).join('') + '</div>';
          }
          var panels = [
            ['01', '主色', '整套平台只有一个主色。选中、主按钮、链接都用它；其余一律中性色。',
              swat(SW, 1) + '<p class="dsNote">RGB 72 · 87 · 226　　变量名 --cs-color-primary</p>'],
            ['02', '中性与状态', '中性色负责层级，状态色只在出事时出现，四个就够了。',
              swat(NEU) + '<div class="dsGap"></div>' + swat(ST)],
            ['03', '文字', '一套字阶用到底，中文 Noto Sans SC，数字走等宽对齐。',
              '<div class="dsType">' + TYPE.map(function (t) {
                return '<div class="dsType__r"><span>' + t[0] + '</span><b style="' + t[2] + '">' + t[1] + '</b></div>';
              }).join('') + '</div>'],
            ['04', '图标规范', '16×16 画框，1px 安全区，1.4px 笔触，圆头圆角。所有图标同一套骨架。',
              '<div class="dsGrid"><div class="dsGrid__g">' + ic(ICONS[3][1]) + '</div>'
              + '<ul class="dsGrid__m"><li>16 × 16 PX 规范大小</li><li>1 PX 安全区</li><li>1.4 PX 笔触</li><li>圆头端点 · 圆角拐角</li></ul></div>'],
            ['05', '图标集', '十二个高频图标，按同一规范画的。',
              '<div class="dsIcons">' + ICONS.map(function (x, k) {
                return '<div class="dsIcons__i"><span>' + String(k + 1).padStart(2, '0') + '</span>' + ic(x[1]) + '<b>' + x[0] + '</b></div>';
              }).join('') + '</div>'],
            ['06', '控件库', '按钮、标签、开关、输入框——五个模块拼在一起不打架，靠的是这几个。',
              '<div class="dsCtl">'
              + '<div class="dsCtl__r"><button class="dsBtn dsBtn--p">主按钮</button><button class="dsBtn">次按钮</button><button class="dsBtn dsBtn--g">文字按钮</button><button class="dsBtn" disabled>禁用</button></div>'
              + '<div class="dsCtl__r"><span class="dsTag dsTag--a">进行中</span><span class="dsTag dsTag--o">已通过</span><span class="dsTag dsTag--w">待处理</span><span class="dsTag dsTag--r">已驳回</span></div>'
              + '<div class="dsCtl__r"><span class="dsSwitch on"></span><span class="dsSwitch"></span><span class="dsInput">输入框</span></div>'
              + '</div>']
          ];
          var out = '<section class="dsBlock">'
            + (o.lead ? '<p class="pjLead gridWrapper hasPadding"><span class="rv">' + esc(o.lead) + '</span></p>' : '')
            + '<div class="dsScroll" data-dsscroll><div class="dsTrack">'
            + panels.map(function (p2) {
                return '<article class="dsPanel"><div class="dsPanel__h"><span lang="en">' + p2[0] + '</span><h4>' + p2[1] + '</h4></div>'
                  + '<p class="dsPanel__d">' + p2[2] + '</p>' + p2[3] + '</article>';
              }).join('')
            + '</div></div>'
            + '<p class="dsHint gridWrapper hasPadding"><span>' + esc(o.hint || '横向拖动查看') + '</span>' + en('Drag sideways') + '</p></section>';
      return out;
  }

  /* 横滚：按住拖 + 滚轮转横向 */
  function bind(root) {
    [].forEach.call((root || document).querySelectorAll('[data-dsscroll]'), function (el) {
      if (el.__dsBound) return; el.__dsBound = 1;
      var down = false, sx = 0, sl = 0;
      el.addEventListener('pointerdown', function (e) {
        if (e.button) return; down = true; sx = e.clientX; sl = el.scrollLeft;
        el.classList.add('is-drag'); el.setPointerCapture && el.setPointerCapture(e.pointerId);
      });
      el.addEventListener('pointermove', function (e) { if (down) el.scrollLeft = sl - (e.clientX - sx); });
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

  window.V7DS = { html: html, bind: bind };
})();

/* =============================================================================
   CsChart · 仪表盘图表组件（echarts option 工厂）
   - 自包含：不依赖调用页内部变量，只依赖全局 echarts + 设计系统 CSS 变量。
   - 零硬编码：颜色全读 var(--cs-color-*) token，hex/rgba 仅作 token 缺失兜底。
   - 用法：window.CsChart.option(type, cfg)  → 返回 echarts option（图表类）
           window.CsChart.html(type, cfg)    → 返回 HTML 字符串（词云/透视/指标等非 echarts 类）
           window.CsChart.TYPES               → 全类型清单 [{key,name,group,kind}]
   - kind: 'echarts' | 'html'
   ============================================================================= */
(function () {
  var css = getComputedStyle(document.documentElement);
  function tok(n, f) { return (css.getPropertyValue(n).trim()) || f; }

  /* ---- 设计 token（读一次；主题切换由实例 setOption(color) 覆盖，不改这里）---- */
  var C = {
    blue:   tok('--cs-color-chart-blue', '#306ce4'),
    teal:   tok('--cs-color-chart-teal', '#18ccb4'),
    yellow: tok('--cs-color-chart-yellow', '#fcc000'),
    purple: tok('--cs-color-chart-purple', '#8d7be8'),
    red:    tok('--cs-color-chart-red', '#f0653e'),
    axis:   tok('--cs-color-text-light2', '#999999'),
    split:  tok('--cs-color-border', '#eeeeee'),
    text:   tok('--cs-color-text', '#1d1d1d'),
    textL:  tok('--cs-color-text-light', '#666666'),
    white:  tok('--cs-color-white', '#ffffff'),
    ttBg:   tok('--cs-color-chart-tooltip-bg', 'rgba(28,26,40,.94)'),
    ttText: tok('--cs-color-chart-tooltip-text', '#ffffff'),
    ok:     tok('--cs-color-success', '#22b07d'),
    warn:   tok('--cs-color-warning', '#f5a623'),
    danger: tok('--cs-color-error', '#f0653e')
  };
  var FONT = tok('--font-family-cn', 'sans-serif');
  var PALETTE = [C.blue, C.teal, C.yellow, C.purple, C.red];
  /* 配色方案（配置面板「配色」项·def/blue/warm）·主题面板另走 setOption(color) 覆盖 */
  function paletteOf(p) {
    if (p === 'blue') return [C.blue, hexA(C.blue, .72), hexA(C.blue, .5), hexA(C.blue, .34), hexA(C.blue, .2)];
    if (p === 'warm') return [C.yellow, C.red, C.purple, C.teal, C.blue];
    return PALETTE;
  }

  function hexA(hex, a) {
    if (hex.charAt(0) !== '#') return hex;               // 已是 rgba/关键字直接返回
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    return 'rgba(' + parseInt(hex.substr(0, 2), 16) + ',' + parseInt(hex.substr(2, 2), 16) + ',' + parseInt(hex.substr(4, 2), 16) + ',' + a + ')';
  }

  /* ---- 通用小工具 ---- */
  var TT = { trigger: 'axis', backgroundColor: C.ttBg, borderWidth: 0, padding: [10, 14],
    textStyle: { color: C.ttText, fontSize: 12, fontFamily: FONT },
    extraCssText: 'border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.28)',
    axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(255,255,255,.06)' } } };
  var TTi = Object.assign({}, TT, { trigger: 'item' });
  function gridB(e) { return Object.assign({ left: 8, right: 14, top: 22, bottom: 6, containLabel: true }, e || {}); }
  function axL() { return { color: C.axis, fontSize: 11, fontFamily: FONT }; }
  function catAxis(d) { return { type: 'category', data: d, axisLine: { lineStyle: { color: C.split } }, axisTick: { show: false }, axisLabel: axL() }; }
  function valAxis(e) { return Object.assign({ type: 'value', axisLine: { show: false }, axisTick: { show: false }, axisLabel: axL(), splitLine: { lineStyle: { color: C.split, type: 'dashed' } } }, e || {}); }
  function valLabel() { return { show: true, position: 'top', color: C.axis, fontSize: 10, fontFamily: FONT, formatter: function (p) { return p.value > 0 ? p.value : ''; } }; }
  function pairSort(cats, vals, sort) {
    var a = cats.map(function (c, i) { return [c, vals[i]]; });
    if (sort === 'asc') a.sort(function (x, y) { return x[1] - y[1]; });
    if (sort === 'desc') a.sort(function (x, y) { return y[1] - x[1]; });
    return { cats: a.map(function (x) { return x[0]; }), vals: a.map(function (x) { return x[1]; }) };
  }

  /* ---- 示例数据源（config.dim 选维度；真接数据时由外部覆盖）---- */
  var DIM = {
    area:    ['华北区', '华南区', '华东区', '西南区', '华中区'],
    project: ['运营外包', '设计外包', '开发外包', '集团项目', '系统开发'],
    month:   ['1月', '2月', '3月', '4月', '5月']
  };
  var BASEVALS = [35000, 93000, 50000, 21000, 42000];

  /* =========================================================================
     图表类 option（echarts）
     ========================================================================= */
  function option(type, cfg) {
    cfg = cfg || {};
    var s = pairSort(DIM[cfg.dim] || DIM.area, BASEVALS, cfg.sort), cats = s.cats, vals = s.vals;
    var base = { animationDuration: 700, textStyle: { fontFamily: FONT }, color: paletteOf(cfg.palette), tooltip: TT };
    /* ---- 样式/专属开关（cfg 驱动·配置面板控件实时改这几项）---- */
    var showLabel  = cfg.label  !== false;   // 数据标签，默认显示
    var showLegend = cfg.legend !== false;   // 图例，默认显示
    var smooth     = cfg.smooth !== false;   // 折线/面积平滑，默认平滑
    var noLabel    = { show: false };

    if (type === 'bar') return Object.assign(base, { grid: gridB(), xAxis: catAxis(cats), yAxis: valAxis(), series: [{ type: 'bar', data: vals, itemStyle: { color: C.blue, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 40, label: showLabel ? valLabel() : noLabel }] });

    if (type === 'hbar') return Object.assign(base, { grid: gridB({ left: 8, right: 40 }), yAxis: Object.assign(catAxis(cats), { inverse: true, axisLabel: { color: C.axis, fontSize: 10, fontFamily: FONT, width: 64, overflow: 'break' } }), xAxis: valAxis(), series: [{ type: 'bar', data: vals, itemStyle: { color: C.blue, borderRadius: [0, 3, 3, 0] }, barMaxWidth: 16, label: showLabel ? { show: true, position: 'right', color: C.axis, fontSize: 9, fontFamily: FONT } : noLabel }] });

    if (type === 'line') return Object.assign(base, { grid: gridB(), xAxis: Object.assign(catAxis(cats), { boundaryGap: false }), yAxis: valAxis(), series: [{ type: 'line', data: vals, smooth: smooth, symbol: 'circle', symbolSize: 6, lineStyle: { color: C.blue, width: 2 }, itemStyle: { color: C.blue }, label: showLabel ? { show: true, position: 'top', color: C.axis, fontSize: 10, fontFamily: FONT } : noLabel }] });

    if (type === 'area') return Object.assign(base, { grid: gridB(), xAxis: Object.assign(catAxis(cats), { boundaryGap: false }), yAxis: valAxis(), series: [{ type: 'line', data: vals, smooth: smooth, symbol: 'none', lineStyle: { color: C.teal, width: 2 }, label: showLabel ? { show: true, position: 'top', color: C.axis, fontSize: 10, fontFamily: FONT } : noLabel, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: hexA(C.teal, .34) }, { offset: 1, color: hexA(C.teal, .02) }]) } }] });

    if (type === 'pie' || type === 'donut' || type === 'rose') {
      return Object.assign(base, { tooltip: TTi, legend: { show: showLegend, bottom: 0, textStyle: { color: C.axis, fontSize: 11, fontFamily: FONT } },
        series: [{ type: 'pie', radius: type === 'donut' ? ['45%', '66%'] : (type === 'rose' ? ['22%', '70%'] : '62%'), center: ['50%', showLegend ? '46%' : '50%'], roseType: type === 'rose' ? 'area' : false,
          data: cats.map(function (c, i) { return { name: c, value: vals[i] }; }), label: showLabel ? { color: C.text, fontSize: 11, fontFamily: FONT } : noLabel, labelLine: { show: showLabel }, itemStyle: { borderColor: C.white, borderWidth: 2 } }] });
    }

    if (type === 'scatter') return Object.assign(base, { grid: gridB(), xAxis: valAxis(), yAxis: valAxis(), series: [{ type: 'scatter', symbolSize: 14, data: vals.map(function (v, i) { return [i * 20 + 10, v]; }), itemStyle: { color: C.purple, opacity: .8 } }] });

    if (type === 'combo') { var lineName = cfg.secondary || '回款率';
      return Object.assign(base, { grid: gridB({ right: 36 }), legend: { show: showLegend, top: 0, textStyle: { color: C.axis, fontSize: 11, fontFamily: FONT }, data: ['金额', lineName] }, xAxis: catAxis(cats),
      yAxis: [valAxis(), valAxis({ splitLine: { show: false }, axisLabel: { color: C.axis, fontSize: 10, fontFamily: FONT, formatter: '{value}%' } })],
      series: [{ name: '金额', type: 'bar', data: vals, itemStyle: { color: C.blue, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 32, label: showLabel ? valLabel() : noLabel },
        { name: lineName, type: 'line', yAxisIndex: 1, data: vals.map(function (v, i) { return 40 + ((i * 13) % 50); }), smooth: smooth, symbol: 'circle', symbolSize: 6, lineStyle: { color: C.yellow, width: 2 }, itemStyle: { color: C.yellow } }] }); }

    if (type === 'funnel') return Object.assign(base, { tooltip: TTi, legend: { show: showLegend, bottom: 0, textStyle: { color: C.axis, fontSize: 11, fontFamily: FONT } }, series: [{ type: 'funnel', left: '6%', right: '6%', top: 12, bottom: showLegend ? 26 : 8, minSize: '26%', gap: 2, label: showLabel ? { color: C.white, fontSize: 11, fontFamily: FONT, formatter: '{b} {c}' } : noLabel, labelLine: { show: false }, itemStyle: { borderColor: C.white, borderWidth: 1 }, data: cats.map(function (c, i) { return { name: c, value: vals[i] }; }).sort(function (a, b) { return b.value - a.value; }) }] });

    if (type === 'progress') { var tot = vals.reduce(function (a, b) { return a + b; }, 0), pct = cfg.target != null ? Math.round(cfg.target) : (Math.round(vals[0] / tot * 100) || 62);
      return Object.assign(base, { tooltip: { show: false }, series: [{ type: 'gauge', startAngle: 90, endAngle: -270, radius: '78%', center: ['50%', '52%'], pointer: { show: false }, progress: { show: true, width: 15, roundCap: true, itemStyle: { color: C.blue } }, axisLine: { lineStyle: { width: 15, color: [[1, hexA(C.blue, .12)]] } }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, anchor: { show: false }, title: { show: false }, detail: { valueAnimation: true, offsetCenter: [0, 0], fontSize: 28, fontWeight: 'bold', fontFamily: FONT, color: C.text, formatter: '{value}%' }, data: [{ value: pct }] }] }); }

    /* ---- 新增：雷达图 ---- */
    if (type === 'radar') {
      var maxV = Math.max.apply(null, vals) * 1.15;
      var rdata = [{ value: vals, name: '本期', itemStyle: { color: C.blue }, areaStyle: { color: hexA(C.blue, .18) }, lineStyle: { color: C.blue } }];
      if (cfg.compareR !== 'none') rdata.push({ value: vals.map(function (v) { return Math.round(v * 0.7); }), name: '上期', itemStyle: { color: C.teal }, areaStyle: { color: hexA(C.teal, .14) }, lineStyle: { color: C.teal } });
      return Object.assign(base, { tooltip: TTi, legend: { show: showLegend, bottom: 0, textStyle: { color: C.axis, fontSize: 11, fontFamily: FONT }, data: cfg.compareR !== 'none' ? ['本期', '上期'] : ['本期'] },
        radar: { center: ['50%', '48%'], radius: '62%', indicator: cats.map(function (c) { return { name: c, max: maxV }; }), axisName: { color: C.axis, fontSize: 10, fontFamily: FONT }, splitLine: { lineStyle: { color: C.split } }, splitArea: { areaStyle: { color: [hexA(C.blue, .03), hexA(C.blue, .06)] } }, axisLine: { lineStyle: { color: C.split } } },
        series: [{ type: 'radar', data: rdata }] });
    }

    /* ---- 新增：仪表图（速度表）---- */
    if (type === 'gauge') { var g = cfg.target != null ? Math.round(cfg.target) : Math.round((vals[0] / (Math.max.apply(null, vals) || 1)) * 100);
      return Object.assign(base, { tooltip: { show: false }, series: [{ type: 'gauge', radius: '86%', center: ['50%', '58%'], startAngle: 210, endAngle: -30, min: 0, max: 100,
        progress: { show: true, width: 12, itemStyle: { color: C.blue } }, pointer: { width: 4, length: '62%', itemStyle: { color: C.blue } },
        axisLine: { lineStyle: { width: 12, color: [[1, hexA(C.blue, .14)]] } }, axisTick: { distance: -16, splitNumber: 5, lineStyle: { color: C.axis, width: 1 } }, splitLine: { distance: -18, length: 8, lineStyle: { color: C.axis, width: 2 } },
        axisLabel: { distance: -6, color: C.axis, fontSize: 9, fontFamily: FONT }, anchor: { show: false }, title: { show: false },
        detail: { valueAnimation: true, offsetCenter: [0, '38%'], fontSize: 22, fontWeight: 'bold', fontFamily: FONT, color: C.text, formatter: '{value}' }, data: [{ value: g }] }] });
    }

    /* ---- 新增：瀑布图（堆叠透明底 + 增量）---- */
    if (type === 'waterfall') {
      var wc = ['期初', '收入', '成本', '税费', '期末'], help = [0], show = [vals[0]], run = vals[0];
      for (var i = 1; i < wc.length - 1; i++) { var d = (i % 2 ? 1 : -1) * Math.round(vals[i] * 0.5); help.push(d > 0 ? run : run + d); show.push(Math.abs(d)); run += d; }
      help.push(0); show.push(run);
      return Object.assign(base, { grid: gridB(), xAxis: catAxis(wc), yAxis: valAxis(),
        series: [
          { type: 'bar', stack: 'wf', itemStyle: { color: 'transparent' }, data: help, silent: true },
          { type: 'bar', stack: 'wf', barMaxWidth: 34, itemStyle: { color: C.blue, borderRadius: [3, 3, 0, 0] }, data: show, label: showLabel ? { show: true, position: 'top', color: C.axis, fontSize: 9, fontFamily: FONT } : noLabel }
        ] });
    }

    /* ---- 新增：桑基图（流向）---- */
    if (type === 'sankey') {
      var nodes = [{ name: '总收入' }, { name: '华北' }, { name: '华南' }, { name: '已回款' }, { name: '应收' }, { name: '坏账' }];
      var links = [
        { source: '总收入', target: '华北', value: 55 }, { source: '总收入', target: '华南', value: 45 },
        { source: '华北', target: '已回款', value: 32 }, { source: '华北', target: '应收', value: 23 },
        { source: '华南', target: '已回款', value: 28 }, { source: '华南', target: '应收', value: 13 }, { source: '华南', target: '坏账', value: 4 }
      ];
      return Object.assign(base, { tooltip: TTi, series: [{ type: 'sankey', left: 8, right: 8, top: 12, bottom: 12, nodeWidth: 14, nodeGap: 10, data: nodes, links: links, label: showLabel ? { color: C.text, fontSize: 10, fontFamily: FONT } : noLabel, lineStyle: { color: 'gradient', opacity: .38 }, itemStyle: { borderWidth: 0 } }] });
    }

    /* ---- 新增：热力图（星期 × 时段）---- */
    if (type === 'heatmap') {
      var hx = ['周一', '周二', '周三', '周四', '周五'], hy = ['上午', '下午', '晚上'], hd = [], mx = 0;
      for (var y = 0; y < hy.length; y++) for (var x = 0; x < hx.length; x++) { var v = ((x * 7 + y * 13 + 5) % 20) + 1; hd.push([x, y, v]); if (v > mx) mx = v; }
      return Object.assign(base, { tooltip: TTi, grid: { left: 8, right: 14, top: 10, bottom: 40, containLabel: true },
        xAxis: { type: 'category', data: hx, splitArea: { show: true }, axisLine: { lineStyle: { color: C.split } }, axisTick: { show: false }, axisLabel: axL() },
        yAxis: { type: 'category', data: hy, splitArea: { show: true }, axisLine: { lineStyle: { color: C.split } }, axisTick: { show: false }, axisLabel: axL() },
        visualMap: { min: 0, max: mx, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, itemWidth: 12, itemHeight: 80, textStyle: { color: C.axis, fontSize: 10, fontFamily: FONT }, inRange: { color: [hexA(C.blue, .12), C.blue] } },
        series: [{ type: 'heatmap', data: hd, label: showLabel ? { show: true, color: C.white, fontSize: 9, fontFamily: FONT } : noLabel, itemStyle: { borderColor: C.white, borderWidth: 1, borderRadius: 2 } }] });
    }

    /* ---- 新增：排行榜（降序条 + 名次）---- */
    if (type === 'rank') {
      var r = pairSort(DIM[cfg.dim] || DIM.project, BASEVALS, 'desc');
      return Object.assign(base, { grid: gridB({ left: 8, right: 44 }), xAxis: valAxis(), yAxis: Object.assign(catAxis(r.cats), { inverse: true, axisLabel: { color: C.text, fontSize: 11, fontFamily: FONT, formatter: function (v, i) { return (i + 1) + '. ' + v; } } }),
        series: [{ type: 'bar', data: r.vals, barMaxWidth: 16, itemStyle: { color: function (p) { return p.dataIndex === 0 ? C.blue : (p.dataIndex === 1 ? C.teal : hexA(C.blue, .55)); }, borderRadius: [0, 4, 4, 0] }, label: showLabel ? { show: true, position: 'right', color: C.axis, fontSize: 10, fontFamily: FONT } : noLabel }] });
    }

    /* ---- 新增：NPS 图（三色区 gauge）---- */
    if (type === 'nps') { var nps = cfg.target != null ? Math.round(cfg.target * 2 - 100) : 42;
      return Object.assign(base, { tooltip: { show: false }, series: [{ type: 'gauge', radius: '88%', center: ['50%', '60%'], startAngle: 200, endAngle: -20, min: -100, max: 100,
        axisLine: { lineStyle: { width: 14, color: [[0.33, C.danger], [0.66, C.warn], [1, C.ok]] } }, pointer: { width: 4, length: '58%', itemStyle: { color: C.text } }, progress: { show: false },
        axisTick: { distance: -18, splitNumber: 4, lineStyle: { color: C.axis } }, splitLine: { distance: -20, length: 8, lineStyle: { color: C.axis, width: 2 } }, axisLabel: { distance: -4, color: C.axis, fontSize: 9, fontFamily: FONT }, anchor: { show: false }, title: { show: false },
        detail: { valueAnimation: true, offsetCenter: [0, '40%'], fontSize: 24, fontWeight: 'bold', fontFamily: FONT, color: C.text, formatter: 'NPS {value}' }, data: [{ value: nps }] }] });
    }

    return base;
  }

  /* =========================================================================
     非 echarts 类（HTML 字符串）
     ========================================================================= */
  function metricHTML(cfg) {
    cfg = cfg || {}; var v = BASEVALS.slice(), r;
    if (cfg.stat === 'avg') r = Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length);
    else if (cfg.stat === 'max') r = Math.max.apply(null, v); else if (cfg.stat === 'min') r = Math.min.apply(null, v);
    else if (cfg.stat === 'count') r = v.length; else r = v.reduce(function (a, b) { return a + b; }, 0);
    var pre = cfg.stat === 'count' ? '' : '¥';
    var delta = '';
    if (cfg.compare === 'mom' || cfg.compare === 'yoy') {
      var pct = cfg.compare === 'mom' ? 12.5 : 8.2, up = pct >= 0;
      delta = '<div class="mc-delta ' + (up ? 'up' : 'down') + '"><i class="cses-' + (up ? 'up' : 'down') + '"></i>' + (up ? '+' : '') + pct + '% <em>' + (cfg.compare === 'mom' ? '环比' : '同比') + '</em></div>';
    }
    return '<div class="metric-fill"><div class="mc-label">' + (cfg.measure || '金额') + '·' + ({ sum: '求和', avg: '平均', max: '最大', min: '最小', count: '计数' }[cfg.stat] || '求和') + '</div><div class="mc-value">' + pre + r.toLocaleString('en-US') + '</div>' + delta + '</div>';
  }
  function wordcloudHTML() {
    var W = [['项目回款', 34], ['应收账款', 27], ['华南区', 22], ['系统开发', 25], ['已回款', 19], ['运营外包', 21], ['集团项目', 16], ['设计外包', 20], ['重点客户', 18], ['本月新增', 23], ['逾期预警', 15], ['结算完成', 17], ['华北区', 19], ['开发外包', 16]];
    var cs = [C.blue, C.teal, C.yellow, C.purple, C.red];
    return '<div class="wc-cloud">' + W.map(function (w, i) { return '<span style="font-size:' + w[1] + 'px;color:' + cs[i % cs.length] + '">' + w[0] + '</span>'; }).join('') + '</div>';
  }
  function pivotHTML() {
    var head = ['项目', '应收(元)', '已回(元)', '剩余(元)'];
    var rows = [['运营外包', 35000, 3000, 32000], ['设计外包', 13000, 7000, 6000], ['开发外包', 25000, 5000, 20000], ['集团项目', 69000, 17000, 52000]];
    var f = function (n) { return '¥' + n.toLocaleString('en-US'); };
    var thead = '<tr>' + head.map(function (h, i) { return '<th class="' + (i ? 'num' : '') + '">' + h + '</th>'; }).join('') + '</tr>';
    var body = rows.map(function (rw) { return '<tr><td>' + rw[0] + '</td><td class="num">' + f(rw[1]) + '</td><td class="num">' + f(rw[2]) + '</td><td class="num">' + f(rw[3]) + '</td></tr>'; }).join('');
    var sum = rows.reduce(function (a, rw) { return [a[0] + rw[1], a[1] + rw[2], a[2] + rw[3]]; }, [0, 0, 0]);
    var foot = '<tr class="tot"><td>合计</td><td class="num">' + f(sum[0]) + '</td><td class="num">' + f(sum[1]) + '</td><td class="num">' + f(sum[2]) + '</td></tr>';
    return '<div class="pv-wrap"><table class="pv-table">' + thead + body + foot + '</table></div>';
  }
  function html(type, cfg) {
    if (type === 'metric') return metricHTML(cfg);
    if (type === 'wordcloud') return wordcloudHTML(cfg);
    if (type === 'pivot') return pivotHTML(cfg);
    return '';
  }

  /* ---- 全类型清单（供面板/白名单引用，不再各页硬写）---- */
  var TYPES = [
    { key: 'metric', name: '指标卡', group: 'chart', kind: 'html' },
    { key: 'bar', name: '柱状图', group: 'chart', kind: 'echarts' },
    { key: 'line', name: '折线图', group: 'chart', kind: 'echarts' },
    { key: 'hbar', name: '条形图', group: 'chart', kind: 'echarts' },
    { key: 'area', name: '面积图', group: 'chart', kind: 'echarts' },
    { key: 'pie', name: '饼图', group: 'chart', kind: 'echarts' },
    { key: 'donut', name: '环形图', group: 'chart', kind: 'echarts' },
    { key: 'combo', name: '组合图', group: 'chart', kind: 'echarts' },
    { key: 'radar', name: '雷达图', group: 'chart', kind: 'echarts' },
    { key: 'scatter', name: '散点图', group: 'chart', kind: 'echarts' },
    { key: 'funnel', name: '漏斗图', group: 'chart', kind: 'echarts' },
    { key: 'wordcloud', name: '词云', group: 'chart', kind: 'html' },
    { key: 'sankey', name: '桑基图', group: 'ext', kind: 'echarts' },
    { key: 'heatmap', name: '热力图', group: 'ext', kind: 'echarts' },
    { key: 'waterfall', name: '瀑布图', group: 'ext', kind: 'echarts' },
    { key: 'gauge', name: '仪表图', group: 'ext', kind: 'echarts' },
    { key: 'rose', name: '玫瑰图', group: 'ext', kind: 'echarts' },
    { key: 'pivot', name: '透视表', group: 'other', kind: 'html' },
    { key: 'rank', name: '排行榜', group: 'other', kind: 'echarts' },
    { key: 'progress', name: '进度图', group: 'other', kind: 'echarts' },
    { key: 'nps', name: 'NPS图', group: 'other', kind: 'echarts' }
  ];

  /* ---- 组件图标（单色 currentColor·div 拼非 svg·对齐标杆下拉的干净观感）---- */
  var SHAPE = {
    bar: 'bars', waterfall: 'bars', combo: 'combo', hbar: 'hbar', rank: 'podium', v_gantt: 'gantt',
    line: 'line', area: 'area', pie: 'pie', rose: 'pie', donut: 'ring', gauge: 'gauge', nps: 'gauge',
    radar: 'radar', scatter: 'dots', heatmap: 'grid', funnel: 'funnel', wordcloud: 'cloud',
    pivot: 'pivot', v_table: 'table', v_cal: 'calendar', v_kanban: 'kanban', v_gallery: 'layout', layout: 'layout',
    sankey: 'sankey', slicer: 'filter'
  };
  var SHAPE_HTML = {
    bars:   '<b style="height:44%"></b><b style="height:82%"></b><b style="height:60%"></b>',
    combo:  '<b style="height:46%"></b><b style="height:74%"></b><b style="height:58%"></b><i class="cln"></i>',
    hbar:   '<b style="width:88%"></b><b style="width:58%"></b><b style="width:72%"></b>',
    line:   '<i></i>', area: '<i></i>', pie: '<i></i>', ring: '<i></i>', gauge: '<i></i>', radar: '<i></i>',
    dots:   '<b></b><b></b><b></b><b></b><b></b>',
    grid:   '<b></b><b></b><b></b><b></b><b></b><b></b>',
    funnel: '<b style="width:100%"></b><b style="width:66%"></b><b style="width:34%"></b>',
    cloud:  '<i class="cl"></i><b class="w1"></b><b class="w2"></b>',
    table:  '<i></i>', pivot: '<i></i>', calendar: '<i></i>',
    kanban: '<b></b><b></b><b></b>',
    gantt:  '<b style="width:62%"></b><b style="width:44%;margin-left:30%"></b><b style="width:52%;margin-left:12%"></b>',
    layout: '<b></b><b></b><b></b><b></b>',
    sankey: '<b class="n1"></b><b class="n2"></b><i class="lk"></i>',
    podium: '<b style="height:56%"></b><b style="height:100%"></b><b style="height:72%"></b>',
    filter: '<i></i>'
  };
  function icon(type) {
    if (type === 'metric')    return '<span class="ci ci-glyph">123</span>';
    if (type === 'text')      return '<span class="ci ci-glyph ci-tt">Tt</span>';
    if (type === 'button')    return '<span class="ci ci-plus">+</span>';
    if (type === 'progress')  return '<span class="ci ci-prog"><i class="pv">75%</i><i class="pb"></i></span>';
    if (type === 'countdown') return '<span class="ci ci-cd"><i></i><i></i></span>';
    var sh = SHAPE[type] || 'bars';
    return '<span class="ci ci-' + sh + '">' + (SHAPE_HTML[sh] || '') + '</span>';
  }

  /* ---- 迷你 option（瓦片图标用·真实图形·无轴无标签无数据·单色）---- */
  function miniOption(type, color) {
    color = color || C.blue;
    var d = [6, 10, 7], cats = ['a', 'b', 'c'];
    var noAx = { animation: false, grid: { left: 1, right: 1, top: 1, bottom: 1 }, xAxis: { show: false, type: 'category', data: cats }, yAxis: { show: false, type: 'value' } };
    if (type === 'bar' || type === 'waterfall' || type === 'combo') return { animation: false, grid: { left: 1, right: 1, top: 1, bottom: 1 }, xAxis: { show: false, type: 'category', data: cats }, yAxis: { show: false, type: 'value' }, series: [{ type: 'bar', data: d, itemStyle: { color: color, borderRadius: [1, 1, 0, 0] }, barCategoryGap: '32%' }] };
    if (type === 'hbar' || type === 'rank') return { animation: false, grid: { left: 1, right: 1, top: 1, bottom: 1 }, yAxis: { show: false, type: 'category', data: cats }, xAxis: { show: false, type: 'value' }, series: [{ type: 'bar', data: [10, 6, 8], itemStyle: { color: color, borderRadius: [0, 1, 1, 0] }, barCategoryGap: '32%' }] };
    if (type === 'line') return { animation: false, grid: { left: 1, right: 1, top: 2, bottom: 1 }, xAxis: { show: false, type: 'category', data: [1, 2, 3, 4], boundaryGap: false }, yAxis: { show: false, type: 'value' }, series: [{ type: 'line', data: [4, 9, 6, 10], symbol: 'none', smooth: true, lineStyle: { color: color, width: 1.6 } }] };
    if (type === 'area') return { animation: false, grid: { left: 1, right: 1, top: 2, bottom: 1 }, xAxis: { show: false, type: 'category', data: [1, 2, 3, 4], boundaryGap: false }, yAxis: { show: false, type: 'value' }, series: [{ type: 'line', data: [4, 9, 6, 10], symbol: 'none', smooth: true, lineStyle: { color: color, width: 1.4 }, areaStyle: { color: color, opacity: .3 } }] };
    if (type === 'pie') return { animation: false, series: [{ type: 'pie', radius: '90%', label: { show: false }, labelLine: { show: false }, data: [{ value: 6, itemStyle: { color: color } }, { value: 3, itemStyle: { color: hexA(color, .55) } }, { value: 2, itemStyle: { color: hexA(color, .3) } }] }] };
    if (type === 'donut' || type === 'progress' || type === 'gauge' || type === 'nps') return { animation: false, series: [{ type: 'pie', radius: ['50%', '90%'], label: { show: false }, labelLine: { show: false }, data: [{ value: 6, itemStyle: { color: color } }, { value: 3, itemStyle: { color: hexA(color, .28) } }] }] };
    if (type === 'rose') return { animation: false, series: [{ type: 'pie', radius: ['15%', '92%'], roseType: 'area', label: { show: false }, labelLine: { show: false }, data: [{ value: 5, itemStyle: { color: hexA(color, .5) } }, { value: 8, itemStyle: { color: color } }, { value: 3, itemStyle: { color: hexA(color, .35) } }, { value: 6, itemStyle: { color: hexA(color, .7) } }] }] };
    if (type === 'scatter' || type === 'heatmap') return { animation: false, grid: { left: 1, right: 1, top: 1, bottom: 1 }, xAxis: { show: false, type: 'value', min: 0, max: 10 }, yAxis: { show: false, type: 'value', min: 0, max: 10 }, series: [{ type: 'scatter', symbolSize: 4, itemStyle: { color: color }, data: [[2, 3], [5, 7], [7, 4], [4, 6], [8, 8], [3, 8]] }] };
    if (type === 'radar') return { animation: false, radar: { radius: '68%', splitNumber: 2, axisName: { show: false }, indicator: [{ max: 10 }, { max: 10 }, { max: 10 }, { max: 10 }, { max: 10 }], splitLine: { lineStyle: { color: hexA(color, .35) } }, axisLine: { lineStyle: { color: hexA(color, .35) } }, splitArea: { show: false } }, series: [{ type: 'radar', symbol: 'none', data: [{ value: [7, 4, 8, 5, 6], areaStyle: { color: hexA(color, .3) }, lineStyle: { color: color, width: 1 } }] }] };
    if (type === 'funnel') return { animation: false, series: [{ type: 'funnel', left: 1, right: 1, top: 1, bottom: 1, gap: 1, label: { show: false }, itemStyle: { color: color, borderWidth: 0 }, data: [{ value: 10 }, { value: 7 }, { value: 4 }] }] };
    if (type === 'sankey') return { animation: false, series: [{ type: 'sankey', left: 1, right: 1, top: 1, bottom: 1, nodeWidth: 3, nodeGap: 4, label: { show: false }, itemStyle: { color: color, borderWidth: 0 }, lineStyle: { color: 'source', opacity: .35 }, data: [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }], links: [{ source: 'a', target: 'c', value: 3 }, { source: 'a', target: 'd', value: 1 }, { source: 'b', target: 'c', value: 2 }] }] };
    return null;   /* metric/wordcloud/pivot/视图/文本… 非 echarts → 用 CSS icon */
  }

  /* ---- 灰占位缩略图（预览用·透视表自己的样式·无真实数字）---- */
  function thumb(type) {
    if (type === 'pivot') {
      var rows = '';
      for (var i = 0; i < 4; i++) rows += '<div class="pt-row"><span class="pt-rh"></span><span class="pt-c"></span><span class="pt-c"></span><span class="pt-c"></span></div>';
      return '<div class="pv-thumb"><div class="pt-row pt-head"><span class="pt-rh"></span><span class="pt-c"></span><span class="pt-c"></span><span class="pt-c"></span></div>' + rows + '<div class="pt-row pt-tot"><span class="pt-rh"></span><span class="pt-c"></span><span class="pt-c"></span><span class="pt-c"></span></div></div>';
    }
    return null;   /* 其余 html 类暂用真实内容 */
  }

  window.CsChart = { option: option, html: html, icon: icon, thumb: thumb, miniOption: miniOption, TYPES: TYPES, tokens: C, palette: PALETTE, tooltip: TT };
})();

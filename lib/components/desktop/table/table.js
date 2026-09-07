/*
 * 表格组件交互 (cs-table 行为层)
 * 沉淀自 org-backend 部门表 95:7790 · 2026-06-30
 *
 * 提供两类行为，对任意 <cs-table> 生效：
 *   1) 钉右列阴影：含 th/td[data-sticky-right] 时，横向溢出(操作列遮住内容)才在
 *      cs-table 上加 data-ovf → CSS 显示左缘淡阴影；铺满不溢出则隐藏。
 *   2) 表头拖拽换列：th[data-reorder] 可点住拖动换位（pointer + FLIP 让位 +
 *      ghost 浮层 + 静态 slot 定位防闪），非 data-reorder 的列（如首列/操作列）固定。
 *
 * 用法：
 *   - 静态表格：引入本文件，自动对页面所有 <cs-table> 初始化。
 *   - 动态渲染表格(行是 JS 生成的)：渲染完调用 window.CSTable.init(csTableEl) 即可。
 */
(function () {
  'use strict';

  function rowsOf(table) {
    var head = table.querySelector('thead tr');
    var body = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
    return head ? [head].concat(body) : body;
  }

  /* ---------- 1) 钉右列阴影：溢出才显 ---------- */
  function initStickyShadow(cs) {
    var wrap = cs.querySelector('.table-wrapper');
    var table = cs.querySelector('table');
    if (!wrap || !table) return;
    if (!table.querySelector('[data-sticky-right],[data-sticky-left]')) return;
    var ovf = function () {
      // 右列左缘阴影：未滚到最右(右侧还有内容被遮)；左列右缘阴影：已横滚(scrollLeft>0)
      cs.toggleAttribute('data-ovf-r', wrap.scrollLeft + wrap.clientWidth < wrap.scrollWidth - 1);
      cs.toggleAttribute('data-ovf-l', wrap.scrollLeft > 0);
    };
    if (!cs._csOvfBound) {
      cs._csOvfBound = true;
      wrap.addEventListener('scroll', ovf);
      if (window.ResizeObserver) new ResizeObserver(ovf).observe(wrap);
      window.addEventListener('resize', ovf);
    }
    // 布局结算后多次兜底（display:none→显示、动态渲染等时机）
    [0, 60, 200, 450].forEach(function (d) { setTimeout(ovf, d); });
    requestAnimationFrame(ovf);
  }

  /* ---------- 2) 表头拖拽换列（静态 slot 防闪） ---------- */
  function initColReorder(cs) {
    var table = cs.querySelector('table');
    var thead = table && table.querySelector('thead tr');
    if (!thead || cs._csReorderBound) return;
    cs._csReorderBound = true;

    function ths() { return Array.prototype.slice.call(thead.children); }

    function moveCol(from, to) {
      rowsOf(table).forEach(function (row) {
        var cell = row.children[from], ref = row.children[to];
        if (!cell || !ref) return;
        if (from < to) row.insertBefore(cell, ref.nextSibling);
        else row.insertBefore(cell, ref);
      });
    }

    // FLIP：移动前记每格 left，移动后反向位移再过渡归零 → 平滑让位
    function flip(doMove) {
      var cells = Array.prototype.slice.call(table.querySelectorAll('th, td'));
      var firsts = cells.map(function (c) { return c.getBoundingClientRect().left; });
      doMove();
      cells.forEach(function (c, i) {
        var dx = firsts[i] - c.getBoundingClientRect().left;
        if (dx) { c.style.transition = 'none'; c.style.transform = 'translateX(' + dx + 'px)'; }
      });
      requestAnimationFrame(function () {
        cells.forEach(function (c) { if (c.style.transform) { c.style.transition = 'transform .2s ease'; c.style.transform = ''; } });
      });
    }

    var drag = null;
    thead.addEventListener('pointerdown', function (e) {
      // 表头里的交互控件（搜索输入框 / 排序 / 筛选 / 勾选 / 按钮 / 链接）不触发列拖拽——否则点进输入框会被当成拖列
      if (e.target.closest('input, textarea, select, button, a, .th-search, .th-sort, .th-flt, .ck, [contenteditable], [data-col], [data-sort]')) return;
      var th = e.target.closest('th[data-reorder]'); if (!th) return;
      e.preventDefault();
      var all = ths();
      var r = th.getBoundingClientRect();
      // 拖动全程不变的静态 slot 边界（不读动画中的 rect → 防自激闪动）
      var slots = all.map(function (t) { var rr = t.getBoundingClientRect(); return { left: rr.left, right: rr.right }; });
      var dIdx = []; all.forEach(function (t, i) { if (t.hasAttribute('data-reorder')) dIdx.push(i); });
      if (!dIdx.length) return;
      var ghost = document.createElement('div');
      ghost.className = 'cs-col-ghost'; ghost.textContent = th.textContent.trim();
      ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px'; ghost.style.top = r.top + 'px';
      document.body.appendChild(ghost);
      drag = { th: th, ghost: ghost, offX: e.clientX - r.left, slots: slots, minD: dIdx[0], maxD: dIdx[dIdx.length - 1], curIdx: all.indexOf(th) };
      ghost.style.left = (e.clientX - drag.offX) + 'px';
      th.classList.add('col-dragging');
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });

    function onMove(e) {
      if (!drag) return;
      drag.ghost.style.left = (e.clientX - drag.offX) + 'px';
      var x = e.clientX, to = drag.curIdx;
      if (x <= drag.slots[drag.minD].right) to = drag.minD;
      else if (x >= drag.slots[drag.maxD].left) to = drag.maxD;
      else { for (var i = drag.minD; i <= drag.maxD; i++) { var s = drag.slots[i]; if (x >= s.left && x <= s.right) { to = i; break; } } }
      if (to !== drag.curIdx) { var from = drag.curIdx; flip(function () { moveCol(from, to); }); drag.curIdx = to; }
    }
    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (drag) {
        drag.ghost.remove(); drag.th.classList.remove('col-dragging');
        cs.dispatchEvent(new CustomEvent('cs-col-reorder', { detail: { th: drag.th } }));
        drag = null;
        initStickyShadow(cs); // 列宽可能变，重算阴影
      }
    }
  }

  function initTable(cs) {
    if (!cs) return;
    initStickyShadow(cs);
    initColReorder(cs);
  }

  function boot() { document.querySelectorAll('cs-table').forEach(initTable); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.CSTable = { init: initTable };
})();

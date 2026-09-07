/*
 * cs-date-picker 交互脚本
 *
 * 职责：
 *   1. 点击触发器 → toggle 面板（开/关切换）
 *   2. 点击面板外部 → 关闭所有打开的面板
 *   3. 点击日期单元格：
 *      - 单值模式：标记 data-selected，回填触发器，关闭面板
 *      - 范围模式（data-range）：
 *          第 1 次点 → 标 range-start，等待选终点，面板不关
 *          第 2 次点 → 标 range-end，中间格标 in-range，回填两侧触发器并关闭面板
 *                     若第 2 次点在第 1 次之前，自动作为新起点
 *   4. ESC → 关闭所有面板
 *
 * 状态：data-open 控制面板可见；data-range-state 标记当前范围选择进度
 * 本脚本不做真正的日历翻页（静态演示页）。
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-date-picker[data-open]').forEach(function (el) {
      if (el !== except) el.removeAttribute('data-open');
    });
  }

  function clearRangeMarks(dpc) {
    dpc.querySelectorAll('.date-picker-cell[data-range-start], .date-picker-cell[data-range-end], .date-picker-cell[data-in-range]').forEach(function (c) {
      c.removeAttribute('data-range-start');
      c.removeAttribute('data-range-end');
      c.removeAttribute('data-in-range');
    });
  }

  function formatCell(dpc, cell) {
    if (!cell) return '';
    var title = dpc.querySelector('.date-picker-title');
    var ym = title ? title.textContent.trim() : '';
    var day = cell.textContent.trim();
    return ym + ' ' + day.padStart(2, '0');
  }

  function cellIndex(dpc, cell) {
    var cells = dpc.querySelectorAll('.date-picker-grid .date-picker-cell');
    return Array.prototype.indexOf.call(cells, cell);
  }

  function markInRange(dpc, fromIdx, toIdx) {
    var cells = dpc.querySelectorAll('.date-picker-grid .date-picker-cell');
    for (var i = fromIdx + 1; i < toIdx; i++) {
      var c = cells[i];
      if (!c) continue;
      if (c.hasAttribute('data-range-start') || c.hasAttribute('data-range-end')) continue;
      c.setAttribute('data-in-range', '');
    }
  }

  function setRangeInput(dpc, field, cell) {
    var input = dpc.querySelector('.date-picker-input[data-range-field="' + field + '"]');
    if (!input) return;
    if (cell) {
      input.textContent = formatCell(dpc, cell);
      input.removeAttribute('data-placeholder');
    } else {
      input.textContent = field === 'start' ? '开始日期' : '结束日期';
      input.setAttribute('data-placeholder', '');
    }
  }

  function handleRangeClick(dpc, cell) {
    var state = dpc.getAttribute('data-range-state');

    if (state !== 'pick-end') {
      // 第一次点击（或重置）：清除旧标记，开始新范围
      clearRangeMarks(dpc);
      cell.setAttribute('data-range-start', '');
      dpc.setAttribute('data-range-state', 'pick-end');
      setRangeInput(dpc, 'start', cell);
      setRangeInput(dpc, 'end', null);
      // 面板保持打开，等待选终点
      return;
    }

    // 第二次点击：确定终点
    var startCell = dpc.querySelector('.date-picker-cell[data-range-start]');
    if (!startCell) {
      // 容错：没找到起点，当作第一次点
      cell.setAttribute('data-range-start', '');
      setRangeInput(dpc, 'start', cell);
      return;
    }

    if (cell === startCell) {
      // 同一格：起点=终点
      cell.setAttribute('data-range-end', '');
      setRangeInput(dpc, 'end', cell);
    } else {
      var sIdx = cellIndex(dpc, startCell);
      var eIdx = cellIndex(dpc, cell);
      if (eIdx < sIdx) {
        // 逆序：交换
        startCell.removeAttribute('data-range-start');
        startCell.setAttribute('data-range-end', '');
        cell.setAttribute('data-range-start', '');
        markInRange(dpc, eIdx, sIdx);
        setRangeInput(dpc, 'start', cell);
        setRangeInput(dpc, 'end', startCell);
      } else {
        cell.setAttribute('data-range-end', '');
        markInRange(dpc, sIdx, eIdx);
        setRangeInput(dpc, 'end', cell);
      }
    }

    dpc.removeAttribute('data-range-state');
    dpc.removeAttribute('data-open');
  }

  document.addEventListener('click', function (e) {
    // 1. 触发器
    var trigger = e.target.closest('.date-picker-trigger');
    if (trigger) {
      var dp = trigger.closest('cs-date-picker');
      if (!dp || dp.hasAttribute('data-disabled')) return;
      e.preventDefault();
      e.stopPropagation();
      var isOpen = dp.hasAttribute('data-open');
      closeAll(dp);
      if (isOpen) {
        dp.removeAttribute('data-open');
      } else {
        dp.setAttribute('data-open', '');
      }
      return;
    }

    // 2. 点日期格
    var cell = e.target.closest('.date-picker-cell');
    if (cell && !cell.hasAttribute('data-disabled')) {
      var dpc = cell.closest('cs-date-picker');
      if (!dpc) return;

      if (dpc.hasAttribute('data-range')) {
        handleRangeClick(dpc, cell);
        return;
      }

      // 单值模式
      dpc.querySelectorAll('.date-picker-cell[data-selected]').forEach(function (c) {
        c.removeAttribute('data-selected');
      });
      cell.setAttribute('data-selected', '');
      var input = dpc.querySelector('.date-picker-input');
      if (input) {
        input.textContent = formatCell(dpc, cell);
        input.removeAttribute('data-placeholder');
      }
      dpc.removeAttribute('data-open');
      return;
    }

    // 3. 点面板内其它区域 — 不处理
    if (e.target.closest('.date-picker-panel')) return;

    // 4. 外部点击 — 关闭
    closeAll(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

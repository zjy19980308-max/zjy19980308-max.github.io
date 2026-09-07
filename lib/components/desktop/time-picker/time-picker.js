/*
 * cs-time-picker 交互脚本
 *
 * 职责：
 *   1. 点击触发器 → toggle 面板
 *   2. 点击列内时/分/秒项 → 更新该列选中 → 回填触发器
 *   3. 点击外部 / ESC → 关闭
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-time-picker[data-open]').forEach(function (el) {
      if (el !== except) el.removeAttribute('data-open');
    });
  }

  function updateInput(tp) {
    var cols = tp.querySelectorAll('.time-picker-column');
    var parts = [];
    cols.forEach(function (col) {
      var sel = col.querySelector('.time-picker-cell[data-selected]');
      parts.push(sel ? sel.textContent.trim().padStart(2, '0') : '00');
    });
    var input = tp.querySelector('.time-picker-input');
    if (input) {
      input.textContent = parts.join(':');
      input.removeAttribute('data-placeholder');
    }
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.time-picker-trigger');
    if (trigger) {
      var tp = trigger.closest('cs-time-picker');
      if (!tp || tp.hasAttribute('data-disabled')) return;
      e.preventDefault();
      e.stopPropagation();
      var isOpen = tp.hasAttribute('data-open');
      closeAll(tp);
      if (isOpen) {
        tp.removeAttribute('data-open');
      } else {
        tp.setAttribute('data-open', '');
      }
      return;
    }

    var cell = e.target.closest('.time-picker-cell');
    if (cell && !cell.hasAttribute('data-disabled')) {
      var col = cell.closest('.time-picker-column');
      var tpc = cell.closest('cs-time-picker');
      if (col && tpc) {
        col.querySelectorAll('.time-picker-cell[data-selected]').forEach(function (c) {
          c.removeAttribute('data-selected');
        });
        cell.setAttribute('data-selected', '');
        updateInput(tpc);
      }
      return;
    }

    if (e.target.closest('.time-picker-panel')) return;
    closeAll(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

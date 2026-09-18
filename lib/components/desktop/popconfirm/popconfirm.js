/*
 * cs-popconfirm 交互脚本
 *
 * 职责：
 *   1. 点击触发器 → toggle
 *   2. 点击 .popconfirm-btn → 关闭面板（业务逻辑应另行监听 click）
 *   3. 点击外部 → 关闭所有
 *   4. ESC 键 → 关闭所有
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-popconfirm[data-open]').forEach(function (pc) {
      if (pc !== except) pc.removeAttribute('data-open');
    });
  }

  document.addEventListener('click', function (e) {
    // 按钮（cancel / ok）
    var btn = e.target.closest('.popconfirm-btn');
    if (btn) {
      var pcBtn = btn.closest('cs-popconfirm');
      if (pcBtn) {
        pcBtn.removeAttribute('data-open');
      }
      return;
    }

    // 触发器
    var trigger = e.target.closest('.popconfirm-trigger');
    if (trigger) {
      var pc = trigger.closest('cs-popconfirm');
      if (!pc || pc.hasAttribute('data-disabled')) return;
      e.preventDefault();
      e.stopPropagation();
      var isOpen = pc.hasAttribute('data-open');
      closeAll(pc);
      if (isOpen) {
        pc.removeAttribute('data-open');
      } else {
        pc.setAttribute('data-open', '');
      }
      return;
    }

    // 点击面板内部 - 不处理
    if (e.target.closest('.popconfirm-panel')) return;

    closeAll(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

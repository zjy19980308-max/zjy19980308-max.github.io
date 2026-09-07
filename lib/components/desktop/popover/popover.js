/*
 * cs-popover 交互脚本
 *
 * 职责：
 *   1. 点击触发器 → toggle 卡片（开/关切换）
 *   2. 点击卡片外部 → 关闭所有打开的卡片
 *   3. ESC 键 → 关闭所有打开的卡片
 *   4. 点击 .popover-close → 关闭当前卡片
 *
 * 状态：通过 data-open 属性控制卡片可见性
 * 兼容禁用态：cs-popover[data-disabled] 不响应任何点击
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-popover[data-open]').forEach(function (pp) {
      if (pp !== except) pp.removeAttribute('data-open');
    });
  }

  document.addEventListener('click', function (e) {
    // 关闭按钮（.popover-close）
    var closeBtn = e.target.closest('.popover-close');
    if (closeBtn) {
      var ppClose = closeBtn.closest('cs-popover');
      if (ppClose) {
        e.preventDefault();
        ppClose.removeAttribute('data-open');
      }
      return;
    }

    // 触发器
    var trigger = e.target.closest('.popover-trigger');
    if (trigger) {
      var pp = trigger.closest('cs-popover');
      if (!pp || pp.hasAttribute('data-disabled')) return;
      e.preventDefault();
      e.stopPropagation();
      var isOpen = pp.hasAttribute('data-open');
      closeAll(pp);
      if (isOpen) {
        pp.removeAttribute('data-open');
      } else {
        pp.setAttribute('data-open', '');
      }
      return;
    }

    // 点击面板内部 - 不处理（让按钮等原生事件冒泡）
    if (e.target.closest('.popover-panel')) return;

    // 点击外部 - 关闭全部
    closeAll(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

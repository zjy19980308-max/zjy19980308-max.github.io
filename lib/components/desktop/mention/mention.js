/*
 * cs-mention 交互脚本
 *
 * 职责：
 *   1. 输入框 focus → 弹出候选列表
 *   2. 输入框 blur → 收起（延迟以允许点击候选项）
 *   3. 点击候选项 → 填充到输入框 + 关闭
 *   4. ESC 键 → 关闭当前
 *
 * 状态：通过 data-open 属性控制弹窗可见性
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-mention[data-open]').forEach(function (m) {
      if (m !== except) m.removeAttribute('data-open');
    });
  }

  // focus 打开
  document.addEventListener('focusin', function (e) {
    var input = e.target.closest('.mention-input');
    if (!input) return;
    var m = input.closest('cs-mention');
    if (!m || m.hasAttribute('data-disabled')) return;
    closeAll(m);
    m.setAttribute('data-open', '');
  });

  // click 委托：候选项 / 外部
  document.addEventListener('click', function (e) {
    var option = e.target.closest('.mention-option');
    if (option) {
      var m = option.closest('cs-mention');
      if (!m) return;
      var label = option.querySelector('.mention-option-label');
      var input = m.querySelector('.mention-input');
      if (input && label) {
        var txt = label.textContent.trim();
        input.value = (input.value || '').replace(/@[^\s]*$/, '') + '@' + txt + ' ';
      }
      m.removeAttribute('data-open');
      return;
    }

    // 点击外部（非输入框 + 非下拉）
    if (e.target.closest('.mention-input') || e.target.closest('.mention-dropdown')) return;
    closeAll(null);
  });

  // ESC 关闭
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

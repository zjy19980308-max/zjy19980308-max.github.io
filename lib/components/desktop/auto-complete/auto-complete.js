/*
 * cs-auto-complete 交互脚本
 *
 * 职责：
 *   1. 输入框 focus → 弹出候选
 *   2. 输入框 blur (点击外部) → 关闭
 *   3. 点击候选项 → 替换输入框文本 + 关闭
 *   4. 点击 .ac-clear → 清空输入框
 *   5. ESC 键 → 关闭
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-auto-complete[data-open]').forEach(function (ac) {
      if (ac !== except) ac.removeAttribute('data-open');
    });
  }

  // focus 打开
  document.addEventListener('focusin', function (e) {
    var input = e.target.closest('.ac-input');
    if (!input) return;
    var ac = input.closest('cs-auto-complete');
    if (!ac || ac.hasAttribute('data-disabled')) return;
    closeAll(ac);
    ac.setAttribute('data-open', '');
  });

  document.addEventListener('click', function (e) {
    // 清除按钮
    var clear = e.target.closest('.ac-clear');
    if (clear) {
      var acClear = clear.closest('cs-auto-complete');
      if (acClear) {
        var inp = acClear.querySelector('.ac-input');
        if (inp) inp.value = '';
        e.preventDefault();
      }
      return;
    }

    // 候选项
    var option = e.target.closest('.ac-option');
    if (option) {
      var acO = option.closest('cs-auto-complete');
      if (!acO) return;
      var label = option.querySelector('.ac-option-label');
      var input = acO.querySelector('.ac-input');
      if (input && label) input.value = label.textContent.trim();
      acO.removeAttribute('data-open');
      return;
    }

    // 点击外部
    if (e.target.closest('.ac-input') || e.target.closest('.ac-dropdown')) return;
    closeAll(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

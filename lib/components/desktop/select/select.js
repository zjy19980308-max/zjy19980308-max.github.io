/*
 * 选择器组件交互 (cs-select 行为层)
 *
 * 职责：
 *   1. 点触发区 → toggle 展开（data-open）
 *   2. 点选项 → 回填 .select-value（取 data-value 或选项文字）+ 移动选中勾 + 收起
 *   3. 点外部 / ESC → 收起
 *   禁用（data-disabled）不响应。选中变化派发 cs-select-change 事件。
 *
 * 用法：引入本文件，自动对页面所有 <cs-select> 生效，无需初始化。
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-select[data-open]').forEach(function (s) {
      if (s !== except) s.removeAttribute('data-open');
    });
  }

  document.addEventListener('click', function (e) {
    // 1. 点选项
    var opt = e.target.closest('.select-option');
    if (opt) {
      var sel = opt.closest('cs-select');
      if (!sel || sel.hasAttribute('data-disabled')) return;
      var val = sel.querySelector('.select-value');
      var text = opt.getAttribute('data-value') || opt.textContent.trim();
      if (val) val.textContent = text;
      sel.querySelectorAll('.select-option').forEach(function (o) { o.removeAttribute('data-active'); });
      opt.setAttribute('data-active', '');
      sel.removeAttribute('data-open');
      sel.dispatchEvent(new CustomEvent('cs-select-change', { detail: { value: text }, bubbles: true }));
      return;
    }

    // 2. 点触发区（cs-select 内、非菜单内）→ toggle
    var s = e.target.closest('cs-select');
    if (s) {
      if (s.hasAttribute('data-disabled')) return;
      if (e.target.closest('.select-menu')) return;   // 菜单内空白不 toggle
      var open = s.hasAttribute('data-open');
      closeAll(s);
      if (open) s.removeAttribute('data-open'); else s.setAttribute('data-open', '');
      return;
    }

    // 3. 点外部
    closeAll(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });

  window.CSSelect = { close: closeAll };
})();

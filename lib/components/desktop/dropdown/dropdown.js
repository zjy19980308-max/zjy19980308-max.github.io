/*
 * cs-dropdown 交互脚本
 *
 * 职责：
 *   1. 点击触发器 → toggle 菜单（开/关切换）
 *   2. 点击菜单外部 → 关闭所有打开的菜单
 *   3. 点击菜单项 → 关闭菜单（除 data-keep-open）
 *   4. ESC 键 → 关闭所有打开的菜单
 *
 * 状态：通过 data-open 属性控制菜单可见性
 *
 * 使用：在 dropdown.html 末尾 <script src="dropdown.js"></script>，
 *      自动绑定 document 级事件，无需手动初始化。
 *
 * 兼容禁用态：cs-dropdown[data-disabled] 不响应任何点击
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-dropdown[data-open]').forEach(function (dd) {
      if (dd !== except) dd.removeAttribute('data-open');
    });
  }

  // 主点击委托
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.dropdown-trigger');

    // 1. 点击触发器
    if (trigger) {
      var dd = trigger.closest('cs-dropdown');
      if (!dd || dd.hasAttribute('data-disabled')) return;
      e.preventDefault();
      e.stopPropagation();
      var isOpen = dd.hasAttribute('data-open');
      closeAll(dd);
      if (isOpen) {
        dd.removeAttribute('data-open');
      } else {
        dd.setAttribute('data-open', '');
      }
      return;
    }

    // 2. 点击菜单项
    var item = e.target.closest('.dropdown-item');
    if (item) {
      if (item.hasAttribute('data-disabled')) {
        e.preventDefault();
        return;
      }
      var ddOfItem = item.closest('cs-dropdown');
      if (ddOfItem && !item.hasAttribute('data-keep-open')) {
        ddOfItem.removeAttribute('data-open');
      }
      return;
    }

    // 3. 点击菜单内部其它区域 — 不做处理
    if (e.target.closest('.dropdown-menu')) return;

    // 4. 点击外部 — 关闭全部
    closeAll(null);
  });

  // ESC 关闭
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

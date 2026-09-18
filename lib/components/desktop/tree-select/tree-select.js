/*
 * cs-tree-select 交互脚本
 *
 * 职责：
 *   1. 点击触发器 → toggle 树面板
 *   2. 点击 .ts-node-toggle → 折叠/展开当前节点
 *   3. 点击 .ts-node-row（label 区域） → 选中该节点 + 写入触发器 + 关闭
 *   4. 点击外部 / ESC → 关闭
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-tree-select[data-open]').forEach(function (ts) {
      if (ts !== except) ts.removeAttribute('data-open');
    });
  }

  document.addEventListener('click', function (e) {
    // 触发器
    var trigger = e.target.closest('.ts-trigger');
    if (trigger) {
      var ts = trigger.closest('cs-tree-select');
      if (!ts || ts.hasAttribute('data-disabled')) return;
      e.preventDefault();
      e.stopPropagation();
      var isOpen = ts.hasAttribute('data-open');
      closeAll(ts);
      if (isOpen) {
        ts.removeAttribute('data-open');
      } else {
        ts.setAttribute('data-open', '');
      }
      return;
    }

    // 折叠/展开按钮
    var toggle = e.target.closest('.ts-node-toggle');
    if (toggle && !toggle.hasAttribute('data-leaf')) {
      e.stopPropagation();
      var node = toggle.closest('.ts-node');
      if (!node) return;
      if (node.hasAttribute('data-expanded')) {
        node.removeAttribute('data-expanded');
      } else {
        node.setAttribute('data-expanded', '');
      }
      return;
    }

    // 节点行 - 选中
    var row = e.target.closest('.ts-node-row');
    if (row) {
      var node2 = row.closest('.ts-node');
      if (!node2 || node2.hasAttribute('data-disabled')) return;
      var tsR = row.closest('cs-tree-select');
      if (!tsR) return;

      // 清除其它 active
      tsR.querySelectorAll('.ts-node[data-active]').forEach(function (n) {
        n.removeAttribute('data-active');
      });
      node2.setAttribute('data-active', '');

      // 写入触发器
      var lb = node2.querySelector(':scope > .ts-node-row > .ts-node-label');
      var triggerLabel = tsR.querySelector('.ts-trigger-label');
      if (triggerLabel && lb) {
        triggerLabel.textContent = lb.textContent.trim();
        triggerLabel.removeAttribute('data-placeholder');
      }
      tsR.removeAttribute('data-open');
      return;
    }

    // 点击面板内部 - 不处理
    if (e.target.closest('.ts-panel')) return;

    closeAll(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

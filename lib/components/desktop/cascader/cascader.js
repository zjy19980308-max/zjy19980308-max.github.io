/*
 * cs-cascader 交互脚本
 *
 * 职责：
 *   1. 点击触发器 → toggle 多级面板
 *   2. 点击带子级的选项 → 该选项 active + 通过 data-target 显示对应子级面板
 *      （若使用静态 demo，所有面板预渲染，hover 时动态切换）
 *   3. 点击叶子选项 → 收集路径 + 写入触发器 label + 关闭
 *   4. 点击外部 / ESC → 关闭
 *
 * 实现策略（适合静态 demo）：
 *   - 所有 .cascader-panel 预渲染，每列固定显示一组
 *   - 点击 .cascader-option 仅切换该列的 data-active；
 *     业务层若需要异步加载子级，自行替换 panel 内容。
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-cascader[data-open]').forEach(function (cs) {
      if (cs !== except) cs.removeAttribute('data-open');
    });
  }

  document.addEventListener('click', function (e) {
    // 点击触发器
    var trigger = e.target.closest('.cascader-trigger');
    if (trigger) {
      var cs = trigger.closest('cs-cascader');
      if (!cs || cs.hasAttribute('data-disabled')) return;
      e.preventDefault();
      e.stopPropagation();
      var isOpen = cs.hasAttribute('data-open');
      closeAll(cs);
      if (isOpen) {
        cs.removeAttribute('data-open');
      } else {
        cs.setAttribute('data-open', '');
      }
      return;
    }

    // 点击选项
    var option = e.target.closest('.cascader-option');
    if (option) {
      if (option.hasAttribute('data-disabled')) return;
      var csO = option.closest('cs-cascader');
      var panel = option.closest('.cascader-panel');
      if (!csO || !panel) return;

      // 同列单选高亮
      panel.querySelectorAll('.cascader-option[data-active]').forEach(function (o) {
        o.removeAttribute('data-active');
      });
      option.setAttribute('data-active', '');

      // 叶子节点：收集路径并关闭
      var isLeaf = !option.querySelector('.cascader-option-arrow');
      if (isLeaf) {
        var labels = [];
        csO.querySelectorAll('.cascader-option[data-active]').forEach(function (o) {
          var lb = o.querySelector('.cascader-option-label');
          if (lb) labels.push(lb.textContent.trim());
        });
        var triggerLabel = csO.querySelector('.cascader-trigger-label');
        if (triggerLabel) {
          triggerLabel.textContent = labels.join(' / ');
          triggerLabel.removeAttribute('data-placeholder');
        }
        csO.removeAttribute('data-open');
      }
      return;
    }

    // 点击面板内部 - 不处理
    if (e.target.closest('.cascader-panels')) return;

    closeAll(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();

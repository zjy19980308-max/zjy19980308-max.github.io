/*
 * cs-color-picker 交互脚本
 *
 * 职责：
 *   1. 点击触发器 → toggle 颜色面板
 *   2. 点击 .cp-swatch → 设为当前色 + 写入触发器 + 关闭
 *   3. 点击外部 / ESC → 关闭
 */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('cs-color-picker[data-open]').forEach(function (cp) {
      if (cp !== except) cp.removeAttribute('data-open');
    });
  }

  function applyColor(cp, color) {
    if (!cp || !color) return;
    var swatch = cp.querySelector('.cp-trigger-swatch');
    var label = cp.querySelector('.cp-trigger-label');
    if (swatch) swatch.style.background = color;
    if (label) label.textContent = color;

    // 单选高亮
    cp.querySelectorAll('.cp-swatch[data-active]').forEach(function (s) {
      s.removeAttribute('data-active');
    });
  }

  document.addEventListener('click', function (e) {
    // 触发器
    var trigger = e.target.closest('.cp-trigger');
    if (trigger) {
      var cp = trigger.closest('cs-color-picker');
      if (!cp || cp.hasAttribute('data-disabled')) return;
      e.preventDefault();
      e.stopPropagation();
      var isOpen = cp.hasAttribute('data-open');
      closeAll(cp);
      if (isOpen) {
        cp.removeAttribute('data-open');
      } else {
        cp.setAttribute('data-open', '');
      }
      return;
    }

    // 色块
    var swatch = e.target.closest('.cp-swatch');
    if (swatch) {
      var cpS = swatch.closest('cs-color-picker');
      if (!cpS) return;
      var color = swatch.getAttribute('data-color') || swatch.style.background;
      applyColor(cpS, color);
      swatch.setAttribute('data-active', '');
      cpS.removeAttribute('data-open');
      return;
    }

    // 点击面板内部 - 不处理（保留 input 等交互）
    if (e.target.closest('.cp-panel')) return;

    closeAll(null);
  });

  // hex 输入框 enter 提交
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAll(null);
      return;
    }
    if (e.key === 'Enter') {
      var hex = e.target.closest('.cp-hex-input');
      if (hex) {
        var cp = hex.closest('cs-color-picker');
        var val = (hex.value || '').trim();
        if (val && /^#?[0-9a-fA-F]{3,8}$/.test(val)) {
          if (val.charAt(0) !== '#') val = '#' + val;
          applyColor(cp, val.toUpperCase());
          cp && cp.removeAttribute('data-open');
        }
      }
    }
  });
})();

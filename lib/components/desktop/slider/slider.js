/*
 * cs-slider 拖拽脚本
 *
 * 职责：
 *   pointerdown 在 handle 或 track → 进入拖拽态
 *   pointermove → 按百分比更新 CSS 变量
 *     单值：--cs-slider-value
 *     范围：--cs-slider-from / --cs-slider-to
 *   pointerup → 释放
 *
 * 支持：
 *   data-orientation="horizontal"(默认) / "vertical"
 *   data-range（双滑块）
 *   data-disabled（禁用）
 *
 * 约束：
 *   范围模式下 from 不能超过 to，反之亦然（不允许交叉）。
 *   数值以 CSS 百分比存储，由业务层自行映射到实际值域。
 */
(function () {
  'use strict';

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function pctFromEvent(slider, clientX, clientY) {
    var isVertical = slider.getAttribute('data-orientation') === 'vertical';
    var rect = slider.getBoundingClientRect();
    var pct;
    if (isVertical) {
      // 垂直方向：底部为 0%，顶部为 100%
      pct = (1 - (clientY - rect.top) / rect.height) * 100;
    } else {
      pct = ((clientX - rect.left) / rect.width) * 100;
    }
    return clamp(pct, 0, 100);
  }

  function getPct(slider, name, fallback) {
    var raw = slider.style.getPropertyValue(name);
    if (!raw) raw = getComputedStyle(slider).getPropertyValue(name);
    var n = parseFloat(raw);
    return isNaN(n) ? fallback : n;
  }

  function setPct(slider, name, pct) {
    slider.style.setProperty(name, pct.toFixed(2) + '%');
  }

  document.addEventListener('pointerdown', function (e) {
    var slider = e.target.closest && e.target.closest('cs-slider');
    if (!slider) return;
    if (slider.hasAttribute('data-disabled')) return;

    var isRange = slider.hasAttribute('data-range');
    var handle = e.target.closest('.slider-handle');
    var pct = pctFromEvent(slider, e.clientX, e.clientY);
    var targetVar;

    if (isRange) {
      if (handle) {
        // 按 DOM 顺序：第 1 个 handle → from，第 2 个 → to
        var handles = slider.querySelectorAll('.slider-handle');
        var idx = Array.prototype.indexOf.call(handles, handle);
        targetVar = idx <= 0 ? '--cs-slider-from' : '--cs-slider-to';
      } else {
        // 点击轨道：选离点击位置更近的那个 handle 跟随
        var from = getPct(slider, '--cs-slider-from', 20);
        var to = getPct(slider, '--cs-slider-to', 70);
        targetVar = Math.abs(pct - from) <= Math.abs(pct - to) ? '--cs-slider-from' : '--cs-slider-to';
        // 直接跳转到点击位置
        if (targetVar === '--cs-slider-from') {
          setPct(slider, targetVar, Math.min(pct, to));
        } else {
          setPct(slider, targetVar, Math.max(pct, from));
        }
      }
    } else {
      targetVar = '--cs-slider-value';
      if (!handle) {
        setPct(slider, targetVar, pct);
      }
    }

    e.preventDefault();

    function onMove(ev) {
      var p = pctFromEvent(slider, ev.clientX, ev.clientY);
      if (isRange) {
        var from = getPct(slider, '--cs-slider-from', 20);
        var to = getPct(slider, '--cs-slider-to', 70);
        if (targetVar === '--cs-slider-from') {
          p = Math.min(p, to);
        } else {
          p = Math.max(p, from);
        }
      }
      setPct(slider, targetVar, p);
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  });
})();

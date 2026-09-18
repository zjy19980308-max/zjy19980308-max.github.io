/*
 * cs-splitter 拖拽脚本
 *
 * 职责：
 *   mousedown 在 .splitter-bar → 计算相邻前后两个 .splitter-panel 的当前尺寸
 *   mousemove → 按拖动偏移更新两个 panel 的 flex-basis（总尺寸保持不变）
 *   mouseup → 释放
 *
 * 支持：
 *   data-direction="horizontal"（默认，左右）
 *   data-direction="vertical"（上下）
 *
 * 约束：
 *   最小面板尺寸 40px（避免拖没）
 */
(function () {
  'use strict';

  var MIN = 40;

  function findAdjacent(bar) {
    var prev = bar.previousElementSibling;
    while (prev && !prev.classList.contains('splitter-panel')) {
      prev = prev.previousElementSibling;
    }
    var next = bar.nextElementSibling;
    while (next && !next.classList.contains('splitter-panel')) {
      next = next.nextElementSibling;
    }
    return { prev: prev, next: next };
  }

  document.addEventListener('mousedown', function (e) {
    var bar = e.target.closest && e.target.closest('.splitter-bar');
    if (!bar) return;
    var splitter = bar.closest('cs-splitter');
    if (!splitter) return;

    var adj = findAdjacent(bar);
    if (!adj.prev || !adj.next) return;

    e.preventDefault();

    var isVertical = splitter.getAttribute('data-direction') === 'vertical';
    var prevRect = adj.prev.getBoundingClientRect();
    var nextRect = adj.next.getBoundingClientRect();
    var startPos = isVertical ? e.clientY : e.clientX;
    var startPrev = isVertical ? prevRect.height : prevRect.width;
    var startNext = isVertical ? nextRect.height : nextRect.width;
    var total = startPrev + startNext;

    var prevCursor = document.body.style.cursor;
    var prevSelect = document.body.style.userSelect;
    document.body.style.cursor = isVertical ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';

    function onMove(ev) {
      var cur = isVertical ? ev.clientY : ev.clientX;
      var delta = cur - startPos;
      var newPrev = startPrev + delta;
      if (newPrev < MIN) newPrev = MIN;
      if (newPrev > total - MIN) newPrev = total - MIN;
      var newNext = total - newPrev;
      adj.prev.style.flex = '0 0 ' + newPrev + 'px';
      adj.next.style.flex = '0 0 ' + newNext + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
})();

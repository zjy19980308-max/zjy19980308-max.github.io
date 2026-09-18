/* nav-theme.js —— 导航滚到深色区域时转白。维护：网站交互调整。
   owner 2026-09-17：「上方的名字还有岗位和 tab 切换到深色区域要变成白色」。
   做法不维护「哪些区块是深色」的名单（那种名单一定会漏）：
   直接在导航条下方取两个点，用 elementFromPoint 往上找第一个不透明背景，算亮度。
   导航条本身是 pointer-events:none，取点会穿过去，取到的就是它压着的那块底色。 */
(function () {
  'use strict';
  var nav = document.getElementById('nav') || document.querySelector('.navbarBlock');
  if (!nav) return;
  function bgAt(x, y) {
    var el = document.elementFromPoint(x, y);
    while (el) {
      var c = getComputedStyle(el).backgroundColor, m = c && c.match(/rgba?\(([^)]+)\)/);
      if (m) {
        var p = m[1].split(',').map(parseFloat);
        if (p.length < 4 || p[3] > .5) return p;
      }
      el = el.parentElement;
    }
    return [255, 255, 255];
  }
  function lum(p) { return .2126 * p[0] + .7152 * p[1] + .0722 * p[2]; }
  var dark = false;
  function check() {
    var r = nav.getBoundingClientRect(), y = Math.max(2, Math.min(innerHeight - 2, r.top + r.height / 2));
    var a = lum(bgAt(Math.min(innerWidth - 2, 80), y)), b = lum(bgAt(Math.max(2, innerWidth - 80), y));
    var d = Math.min(a, b) < 110;                      /* 两头有一头压在深底上就转白 */
    if (d !== dark) { dark = d; nav.classList.toggle('is-onDark', d); }
  }
  var t = 0;
  function loop() { var n = performance.now(); if (n - t > 100) { t = n; check(); } requestAnimationFrame(loop); }
  addEventListener('load', check); addEventListener('resize', check);
  requestAnimationFrame(loop);
})();

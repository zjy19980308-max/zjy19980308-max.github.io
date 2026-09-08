/* ═══════════════════════════════════════════════════════════════
   cs-hub.js —— 协作平台章二级页的两件事

   1) 返回键悬浮：首屏停在它自己那个位置，往下滚就钉在页顶模糊带的下沿，
      跟着那条边界一起走，在任何一屏都能直接返回。
      实体挂在 body 上——.view 是 z-index:2 的层叠上下文，
      装在里面的元素再高也压不过 z-index 30 的模糊带，会被糊住。
   2) 分步切换：带「下一步」的页面（考勤确认三步、核算薪资四步）
      在图下面给一条 上一步 / 下一步，图和说明一起换，不必为每一步单开一屏。
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  /* ── 1 · 悬浮返回键 ─────────────────────────────────────────── */
  function backbar() {
    var bar  = document.getElementById('cs-backbar');
    var view = document.getElementById('view-p-cses');
    if (!bar || !view) return;

    var nav = document.querySelector('.nav-inner') || document.querySelector('.nav');

    function activeSlot() {
      if (!view.classList.contains('active')) return null;
      var sub = view.querySelector('.cs-sub:not([hidden])');
      return sub ? sub.querySelector('.cs-backslot') : null;
    }

    /* 钉住的位置 = 模糊带下沿减去按钮自己的高度，让它正好压在那条边界上；
       模糊带的高度直接量 DOM（另一处随屏宽在 9rem / 5rem 之间换），
       量不到就退回「导航下面一点」。任何情况下不越到导航上面去。 */
    function pinTop(barH) {
      var navBottom = nav ? nav.getBoundingClientRect().bottom : 76;
      var blur = document.querySelector('.gradual-blur-page');
      var blurH = 0;
      if (blur) {
        var r = blur.getBoundingClientRect();
        if (r.top < 4) blurH = r.height;         /* 只认页顶那条，页底那条不算 */
      }
      var atEdge = blurH ? blurH - barH - 6 : 0;
      return Math.max(navBottom + 12, atEdge);
    }

    var raf = 0, lastTop = -1, lastLeft = -1;
    function place() {
      raf = 0;
      var slot = activeSlot();
      if (!slot) { if (!bar.hidden) bar.hidden = true; return; }
      if (bar.hidden) bar.hidden = false;

      var s = slot.getBoundingClientRect();
      var barH = bar.offsetHeight || 36;
      var top  = Math.max(pinTop(barH), Math.round(s.top));
      var left = Math.round(s.left);
      if (top !== lastTop)   { bar.style.top  = top + 'px';  lastTop = top; }
      if (left !== lastLeft) { bar.style.left = left + 'px'; lastLeft = left; }
    }
    /* 页面不在前台时 rAF 是冻住的，队列里的回调不会回来，
       raf 这个哨兵就永远解不开——直接同步跑一次，别排队。 */
    function schedule() {
      if (document.hidden) { place(); return; }
      if (!raf) raf = requestAnimationFrame(place);
    }

    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    addEventListener('load', schedule);

    /* 显示哪一层是路由改 hidden 属性决定的 —— 直接盯这个属性，
       比让路由再回调一次可靠（切 tab 也走同一条路）。 */
    if (root.MutationObserver) {
      var mo = new MutationObserver(schedule);
      view.querySelectorAll('.cs-sub').forEach(function (el) {
        mo.observe(el, { attributes: true, attributeFilter: ['hidden'] });
      });
      mo.observe(view, { attributes: true, attributeFilter: ['class'] });
    }
    bar.addEventListener('click', function (e) {
      e.preventDefault();
      if (root.__csShow) root.__csShow(null);
    });
    place();
  }

  /* ── 2 · 分步切换 ───────────────────────────────────────────── */
  function steppers() {
    document.querySelectorAll('.pg-steps').forEach(function (box) {
      var steps;
      try { steps = JSON.parse(box.getAttribute('data-steps') || '[]'); } catch (e) { return; }
      if (steps.length < 2) return;

      var link = box.querySelector('.pg-shot');
      var img  = link && link.querySelector('img');
      var tEl  = box.querySelector('.ps-t');
      var dEl  = box.querySelector('.ps-d');
      var prev = box.querySelector('.ps-prev');
      var next = box.querySelector('.ps-next');
      var dots = box.querySelector('.ps-dots');
      if (!link || !img || !prev || !next) return;

      if (dots && !dots.children.length)
        steps.forEach(function () { dots.appendChild(document.createElement('i')); });

      var i = 0;
      function render() {
        var s = steps[i];
        var title = s.t + ' · ' + s.d;
        link.href = 'assets/shots/' + s.f + '.webp';
        link.setAttribute('data-title', title);
        img.src = 'assets/shots/thumb/' + s.f + '.webp';
        img.alt = title;
        if (tEl) tEl.textContent = s.t;
        if (dEl) dEl.textContent = s.d;
        prev.disabled = i === 0;
        next.disabled = i === steps.length - 1;
        if (dots) [].forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === i); });
      }
      prev.addEventListener('click', function () { if (i > 0) { i--; render(); } });
      next.addEventListener('click', function () { if (i < steps.length - 1) { i++; render(); } });
      render();
    });
  }

  function init() { backbar(); steppers(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);

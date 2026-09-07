/*
 * 弹窗组件交互 (cs-modal 行为层)
 *
 * 对任意 <cs-modal> 生效：
 *   - 打开：window.CSModal.open(el) → 加 data-open（CSS 负责淡入 + 卡片微弹）
 *   - 关闭：window.CSModal.close(el) / 点蒙层空白 / 点 [data-modal-close] / 按 ESC
 * 触发：按钮上写 data-modal-open="弹窗id"，或代码调 CSModal.open(el)。
 */
(function () {
  'use strict';

  // 内嵌 iframe 时通知父壳：弹窗开合 → 父壳全界面极淡蒙层罩住顶栏+侧栏（design.md §九）
  function notifyParent(isOpen) {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'cs-modal', open: isOpen }, '*');
      }
    } catch (e) {}
  }
  function open(el) { if (el) { el.setAttribute('data-open', ''); notifyParent(true); } }
  function close(el) { if (el) { el.removeAttribute('data-open'); notifyParent(false); } }

  document.addEventListener('click', function (e) {
    var trig = e.target.closest('[data-modal-open]');
    if (trig) { open(document.getElementById(trig.getAttribute('data-modal-open'))); return; }

    var closer = e.target.closest('[data-modal-close]');
    if (closer) { close(closer.closest('cs-modal')); return; }

    // 点蒙层空白（点到 cs-modal 本身、非卡片内部）关闭
    if (e.target.tagName === 'CS-MODAL' && e.target.hasAttribute('data-open')) { close(e.target); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var opened = document.querySelectorAll('cs-modal[data-open]');
    if (opened.length) close(opened[opened.length - 1]);
  });

  window.CSModal = { open: open, close: close };
})();

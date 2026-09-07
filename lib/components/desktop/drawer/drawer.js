/*
 * 抽屉组件交互 (cs-drawer 行为层)
 *
 * 提供开关行为，对任意 <cs-drawer> 生效：
 *   - 打开：window.CSDrawer.open(el)  → 加 data-open（CSS 负责滑入 + 蒙层淡入）
 *   - 关闭：window.CSDrawer.close(el) / 点蒙层空白 / 点 [data-drawer-close] / 按 ESC
 *
 * 用法：
 *   静态引入本文件即可；触发按钮上写 data-drawer-open="抽屉id"，或代码调 CSDrawer.open(el)。
 */
(function () {
  'use strict';

  // 内嵌 iframe 时通知父壳：抽屉开合 → 父壳出/收全屏蒙层（罩住壳顶栏+侧栏，抽屉自身蒙层只能罩 iframe 舞台）
  function notifyParent(isOpen) {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'cs-drawer', open: isOpen }, '*');
      }
    } catch (e) {}
  }

  function open(el) {
    if (!el) return;
    el.setAttribute('data-open', '');
    notifyParent(true);
  }
  function close(el) {
    if (!el) return;
    el.removeAttribute('data-open');
    notifyParent(false);
  }

  document.addEventListener('click', function (e) {
    // 触发器：[data-drawer-open="id"]
    var trig = e.target.closest('[data-drawer-open]');
    if (trig) {
      open(document.getElementById(trig.getAttribute('data-drawer-open')));
      return;
    }
    // 关闭键
    var closer = e.target.closest('[data-drawer-close]');
    if (closer) {
      close(closer.closest('cs-drawer'));
      return;
    }
    // 页签切换：.drawer-tab[data-tab] → 显示 .drawer-body 内 [data-tab-panel] 匹配项
    var tab = e.target.closest('.drawer-tab[data-tab]');
    if (tab) {
      var ddt = tab.closest('cs-drawer');
      if (ddt) {
        var name = tab.getAttribute('data-tab');
        ddt.querySelectorAll('.drawer-tab').forEach(function (t) { t.classList.toggle('is-active', t === tab); });
        ddt.querySelectorAll('[data-tab-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-tab-panel') !== name; });
      }
      return;
    }
    // 点蒙层空白（点到 cs-drawer 本身、非面板内部）关闭
    if (e.target.tagName === 'CS-DRAWER' && e.target.hasAttribute('data-open')) {
      close(e.target);
    }
  });

  // ESC 关闭最上层已打开的抽屉
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var opened = document.querySelectorAll('cs-drawer[data-open]');
    if (opened.length) close(opened[opened.length - 1]);
  });

  // 父壳点全屏蒙层 → 通知 iframe 关抽屉
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'cs-drawer-close') {
      var opened = document.querySelectorAll('cs-drawer[data-open]');
      if (opened.length) close(opened[opened.length - 1]);
    }
  });

  window.CSDrawer = { open: open, close: close };
})();

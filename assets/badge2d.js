/* ═══════════════════════════════════════════════════════════════
   badge2d.js —— 静态工牌（手机 / 不跑 three 的机器）
   卡面用的是 lanyard.js 同一套画法（Lanyard.paintFront），所以和桌面版
   three 工牌是同一张脸。倾斜靠 CSS 3D：有陀螺仪跟陀螺仪，没有就跟手指或鼠标。
   长按卡片弹出导出图（只有卡，1240×1880），再长按图片走系统「保存图片」，
   微信里也能存进相册，扫一扫用。
   ═══════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  function clamp(v, m) { return v < -m ? -m : v > m ? m : v; }

  function mount(sel, opt) {
    var host = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!host || !root.Lanyard || !Lanyard.paintFront) return null;
    opt = opt || {};

    var stage = host.querySelector('.b2-stage'),
        card  = host.querySelector('.b2-card'),
        gloss = host.querySelector('.b2-gloss'),
        ask   = host.querySelector('.b2-ask');
    if (!stage || !card) return null;

    /* ── 卡面 ──
       字体到位前先画一版，fonts.ready 后再画一次；导出图也用最后这张。 */
    var face = null, cv = document.createElement('canvas');
    cv.className = 'b2-face';
    card.insertBefore(cv, card.firstChild);
    function paint() {
      face = Lanyard.paintFront(opt);
      cv.width = face.width; cv.height = face.height;
      cv.getContext('2d').drawImage(face, 0, 0);
    }
    paint();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);

    host.hidden = false;

    /* ── 倾斜 ── */
    var GAIN = opt.gain || 1.8, MAX = opt.max || 38;
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function frame() {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      card.style.transform = 'rotateX(' + cx.toFixed(2) + 'deg) rotateY(' + cy.toFixed(2) + 'deg)';
      if (gloss) {
        var a = 115 + cy * 1.6, s = 46 - cx * 0.9;
        gloss.style.background = 'linear-gradient(' + a + 'deg, rgba(255,255,255,0) ' + (s - 14) + '%, rgba(255,255,255,.30) ' + s + '%, rgba(255,255,255,0) ' + (s + 16) + '%)';
      }
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(frame);
      else raf = 0;
    }
    function set(x, y) {
      tx = clamp(x, MAX); ty = clamp(y, MAX);
      if (!raf) raf = requestAnimationFrame(frame);
    }

    /* 陀螺仪：第一帧的前后倾角当零点（人拿手机本来就是斜的），之后按差值走。
       gamma（左右）直接用；beta（前后）取差值。灵敏度 GAIN 按 owner 要求偏高。 */
    var base = null, gyroOn = false;
    function onOri(e) {
      if (e.beta == null || e.gamma == null) return;
      if (base == null) base = e.beta;
      set((e.beta - base) * -GAIN * 0.9, e.gamma * GAIN);
    }
    function startGyro() {
      if (gyroOn) return;
      gyroOn = true;
      addEventListener('deviceorientation', onOri, true);
      host.classList.add('b2-gyro');
    }
    var DOE = root.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      /* iOS 13+：必须在用户手势里申请，给一个「开启感应」按钮 */
      if (ask) {
        ask.hidden = false;
        ask.addEventListener('click', function () {
          DOE.requestPermission().then(function (s) {
            if (s === 'granted') { startGyro(); ask.hidden = true; }
          }).catch(function () {});
        });
      }
    } else if (DOE && ('ontouchstart' in root)) {
      startGyro();
    }

    /* 没陀螺仪（桌面、iOS 未授权）时跟指针 */
    stage.addEventListener('pointermove', function (e) {
      if (gyroOn && e.pointerType === 'touch') return;
      var r = stage.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      set(-py * MAX * 1.6, px * MAX * 1.6);
    });
    stage.addEventListener('pointerleave', function () { if (!gyroOn) set(0, 0); });

    /* ── 长按导出 ── */
    var pressT = 0, sx = 0, sy = 0;
    function cancel() { if (pressT) { clearTimeout(pressT); pressT = 0; } host.classList.remove('b2-press'); }
    card.addEventListener('pointerdown', function (e) {
      sx = e.clientX; sy = e.clientY;
      host.classList.add('b2-press');
      pressT = setTimeout(function () { pressT = 0; host.classList.remove('b2-press'); exportPNG(); }, 550);
    });
    card.addEventListener('pointermove', function (e) {
      if (pressT && (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10)) cancel();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { card.addEventListener(n, cancel); });
    card.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    var ov = null;
    function exportPNG() {
      if (!face) return;
      var W = face.width, H = face.height;
      /* 圆角和 three 版一致：roundedRect(CW, CH, 0.20)，0.20 / CW ≈ 5.6% 卡宽 */
      var R = Math.round(W * (Lanyard.cornerRatio || 0.056));
      var out = document.createElement('canvas');
      out.width = W; out.height = H;
      var g = out.getContext('2d');
      g.beginPath();
      if (g.roundRect) g.roundRect(0, 0, W, H, R); else g.rect(0, 0, W, H);
      g.clip();
      g.drawImage(face, 0, 0);
      var url;
      try { url = out.toDataURL('image/png'); } catch (e) { return; }
      if (!ov) {
        ov = document.createElement('div');
        ov.className = 'b2-export';
        ov.innerHTML =
          '<div class="b2-ex-box">' +
            '<img alt="张竞元 · 工牌">' +
            '<p>长按图片保存到相册 · 微信扫一扫加我</p>' +
            '<button type="button" class="b2-ex-close" aria-label="关闭">×</button>' +
          '</div>';
        document.body.appendChild(ov);
        ov.addEventListener('click', function (e) {
          if (e.target === ov || e.target.classList.contains('b2-ex-close')) ov.classList.remove('on');
        });
      }
      ov.querySelector('img').src = url;
      ov.classList.add('on');
    }

    return { set: set, exportPNG: exportPNG, repaint: paint };
  }

  root.Badge2D = { mount: mount };
})(window);

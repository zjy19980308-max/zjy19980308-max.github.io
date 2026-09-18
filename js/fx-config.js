/* fx-config.js —— 鼠标波纹的共用参数。首屏 3D 背景（scene.js）和全局覆盖层（cursor-fx.js）都读这里。维护：网站交互调整。
   来源：owner 贴的 React Bits RippleDistortion 默认参数；tintAmount 默认 .1 会染出粉紫，owner 不要，已关。
   两种观感（owner 2026-09-15：不要粉色，要高反差色差，或者原站那种发亮起雾）。地址栏加 ?ripple=chroma 看色差版，默认发亮版。
   glow  ：首屏方块真扭曲 + 模糊 + 颗粒扩散；全局覆盖层画暖白雾 + 颗粒边，文字图片经过时被雾化提亮。
   chroma：首屏方块红绿蓝三路错开取样；首屏以下覆盖层在波纹边缘画彩色描边。 */
window.V7FX = (function () {
  var look = /[?&]ripple=chroma/.test(location.search) ? 'chroma' : 'glow';
  return {
    look: look,
    ripple: { brushSize: 150, swirl: 1, rings: 4, spread: 5, fade: 3, spacing: 15, glint: 0, tint: '#a855f7', tintAmount: 0, highlightColor: '#ffffff', trigger: 'hover', clickStrength: 2, quality: 'low' },
    looks: {
      /* strength 扭曲强度；blur 模糊半径；scatter 颗粒扩散；fog 覆盖层雾的浓度；grain 雾边颗粒感（0 平滑 → 1 全是颗粒） */
      glow:   { strength: .12, blur: .018, scatter: 0,    dispersion: 0,   fog: .15, fogColor: '#ffffff', grain: 0,   fringe: 0 },   /* fog 现在是水面高光的强度上限：.15 ≈ 深色底上隐约可见，像水面反光 */   /* owner：黑字上颗粒感明显 → 颗粒边与颗粒扩散都关掉，只留平滑雾 + 模糊 */
      chroma: { strength: .26, blur: 0,    scatter: 0,    dispersion: 1.4, fog: 0,   fogColor: '#ffffff', grain: 0,   fringe: .9 }
    }
  };
})();

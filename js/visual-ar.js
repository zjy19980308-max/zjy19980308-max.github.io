/* visual-ar.js —— 图片宽高比表，由 tools/gen-ar.py 生成，勿手改。维护：网站交互调整。
   为什么要这张表：首页视觉三排是「卡片宽 = 行高 x 这张图的比例」，
   但图是 loading=lazy 的，没进视口就永远不触发 load，靠 DOM 量比例量不到。
   把比例写成数据，第一帧布局就是准的，懒加载照旧。 */
window.V7AR = {
  'assets/visual/banner-01.jpg': 3.2441,   /* 1382x426 */
  'assets/visual/banner-02.jpg': 3.2441,   /* 1382x426 */
  'assets/visual/banner-03.jpg': 3.2441,   /* 1382x426 */
  'assets/visual/banner-04.jpg': 3.2441,   /* 1382x426 */
  'assets/visual/layout-01.jpg': 1.5,   /* 1056x704 */
  'assets/visual/layout-02.jpg': 1.5,   /* 1056x704 */
  'assets/visual/layout-03.jpg': 1.5,   /* 1056x704 */
  'assets/visual/layout-04.jpg': 1.5,   /* 1056x704 */
  'assets/visual/layout-05.jpg': 1.5,   /* 1056x704 */
  'assets/visual/layout-06.jpg': 1.5,   /* 1056x704 */
  'assets/visual/poster-01.jpg': 0.6767,   /* 900x1330 */
  'assets/visual/poster-02.jpg': 0.5609,   /* 746x1330 */
  'assets/visual/poster-03.jpg': 0.5609,   /* 746x1330 */
  'assets/visual/poster-04.jpg': 0.5609,   /* 746x1330 */
  'assets/visual/poster-05.jpg': 0.7068,   /* 940x1330 */
  'assets/visual/poster-06.jpg': 0.7068,   /* 940x1330 */
  'assets/visual/poster-07.jpg': 0.7068,   /* 940x1330 */
  'assets/visual/type-01.jpg': 1.4129,   /* 1266x896 */
  'assets/visual/type-02.jpg': 1.4129,   /* 1266x896 */
  'assets/visual/type-03.jpg': 1.4129,   /* 1266x896 */
  'assets/visual/type-04.jpg': 1.7744,   /* 1164x656 */
  'assets/visual/type-05.jpg': 0.5199,   /* 288x554 */
};

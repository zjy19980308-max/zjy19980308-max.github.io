/* logo3d.js —— owner 的 Figma logo「Left Logo」(bZerotp4ghGEbPOJgDBKOj · 1079:2599) 做成 3D。维护：网站交互调整。
   原件：assets/logo/figma-1079-2599.svg，49.191 × 49.19，一条路径（金色 #DAAB00，带镂空）。
   这里自己解析 SVG 路径（只有 M L H V C Z 绝对指令），转成 three 的 ShapePath → 带倒角挤出。切场动画与关于页首屏共用。
   用法：var g = V7Logo3D.create({ size: 1, depth: .16, bevel: .03 })  → THREE.Group，宽高 = size（单位随调用方），中心在原点。 */
(function () {
  'use strict';
  var D = 'M30.0019 0C35.0101 4.74308e-06 39.9003 1.97277 43.5595 5.63184C47.2073 9.27959 49.1758 14.1781 49.1748 19.1729H49.1738L49.1904 29.8477C49.2241 34.9234 47.2681 39.8813 43.5752 43.5742C39.8822 47.2672 34.9075 49.24 29.8486 49.1895H19.3427C14.267 49.2232 9.30917 47.2672 5.61618 43.5742C1.92321 39.8812 -0.0496078 34.9065 0.000947977 29.8477V19.3418C-0.0479335 14.2661 1.90789 9.30821 5.58396 5.61523C9.24316 1.97289 14.1168 7.67972e-05 19.125 0H30.0019Z';
  var W = 49.191, H = 49.1904, GOLD = 0xDAAB00;

  function loadPath() {   /* 从页面里的 SVG 原件取完整路径；取不到（file:// 下 fetch 被拦）就用内嵌的外轮廓兜底 */
    return window.__V7_LOGO_D || D;
  }
  function parse(d) {
    var THREE = window.THREE, sp = new THREE.ShapePath();
    var tok = d.match(/[MLHVCZmlhvcz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) || [];
    var i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0;
    function n() { return parseFloat(tok[i++]); }
    function isNum(t) { return t != null && !/^[MLHVCZ]$/i.test(t); }
    function Y(v) { return H - v; }   /* SVG y 向下 → three y 向上 */
    while (i < tok.length) {
      if (!isNum(tok[i])) cmd = tok[i++];
      switch (cmd) {
        case 'M': x = n(); y = n(); sx = x; sy = y; sp.moveTo(x, Y(y)); cmd = 'L'; break;
        case 'L': x = n(); y = n(); sp.lineTo(x, Y(y)); break;
        case 'H': x = n(); sp.lineTo(x, Y(y)); break;
        case 'V': y = n(); sp.lineTo(x, Y(y)); break;
        case 'C': { var x1 = n(), y1 = n(), x2 = n(), y2 = n(); x = n(); y = n(); sp.bezierCurveTo(x1, Y(y1), x2, Y(y2), x, Y(y)); break; }
        case 'Z': case 'z': x = sx; y = sy; if (sp.currentPath) sp.currentPath.closePath(); break;
        default: i++;
      }
    }
    return sp;
  }
  var cache = null;
  function geometry(depth, bevel) {
    var THREE = window.THREE;
    var sp = parse(loadPath());
    /* 路径里有外轮廓 + 镂空 + 镂空里的实心块，按面积排序后用「环绕数」判断谁是洞：比 toShapes 的顺逆时针判断稳 */
    var shapes = THREE.ShapeUtils ? sp.toShapes(false) : sp.toShapes();
    var geo = new THREE.ExtrudeGeometry(shapes, { depth: depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * .8, bevelSegments: 6, curveSegments: 18 });
    geo.translate(-W / 2, -H / 2, -depth / 2);
    geo.computeVertexNormals();
    return geo;
  }
  function create(opts) {
    var THREE = window.THREE; if (!THREE) return null;
    opts = opts || {};
    var size = opts.size || 1, depth = (opts.depth == null ? .16 : opts.depth) * W, bevel = (opts.bevel == null ? .03 : opts.bevel) * W;
    var key = depth + '|' + bevel;
    if (!cache || cache.key !== key) cache = { key: key, geo: geometry(depth, bevel) };
    var mat = opts.material || new THREE.MeshStandardMaterial({ color: GOLD, metalness: .55, roughness: .32 });
    var mesh = new THREE.Mesh(cache.geo, mat);
    var g = new THREE.Group(); g.add(mesh); g.scale.setScalar(size / W);
    g.userData.mesh = mesh;
    return g;
  }
  window.V7Logo3D = { create: create, parse: parse, W: W, H: H, GOLD: GOLD };
})();

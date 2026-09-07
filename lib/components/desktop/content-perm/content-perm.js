/* =============================================================================
   内容权限弹窗组件（content-perm）· Figma 电子表格 2017:9239
   - 自注入：把弹窗 DOM 追加到 <body>，自动绑定页面里所有「内容权限」按钮
     （匹配 [data-content-perm] 或 title="内容权限" 的元素）。
   - 用法：引 content-perm.css + 本文件即可，无需页面写任何弹窗结构。
     页面另需引 cs-radio / cs-checkbox / cs-switch 的 CSS 与 cses 图标字体。
   - 资源基址（数据源 svg 图标）从本脚本自身 src 推导，故与页面所在层级无关。
   - 零硬编码颜色：样式全在 content-perm.css 走 token。
   - API：window.ContentPerm.open() / .close()
   ============================================================================= */
(function () {
  'use strict';
  if (window.__contentPermLoaded) return; window.__contentPermLoaded = true;

  /* 资源基址：.../workspace/components/desktop/content-perm/content-perm.js → .../workspace */
  var src = (document.currentScript && document.currentScript.src) || '';
  var ASSET = src.replace(/\/components\/desktop\/content-perm\/content-perm\.js.*$/, '') || '../../../../../../../workspace';

  var HTML =
    '<div class="perm-overlay" id="permOverlay" role="dialog" aria-modal="true" aria-label="内容权限">'
    + '<div class="perm-modal">'
    + '<div class="perm-head">'
    + '<span class="perm-head-ico"><i class="cses-table"></i></span>'
    + '<span class="perm-head-title">内容权限</span>'
    + '<span class="perm-head-div"></span>'
    + '<cs-switch data-checked data-size="sm" id="permGrantSwitch"><div class="switch-track"><div class="switch-knob"></div></div></cs-switch>'
    + '<div class="perm-grant-wrap">'
    + '<span class="perm-head-grant" id="permGrantLabel"><span class="perm-grant-txt">允许通过分享授权</span><i class="cses-xiala"></i></span>'
    + '<div class="perm-grant-menu" id="permGrantMenu">'
    + '<div class="perm-grant-opt on" data-grant="允许通过分享授权">允许通过分享授权<i class="cses-yiduduigou perm-grant-tick"></i></div>'
    + '<div class="perm-grant-opt" data-grant="不允许通过分享授权">不允许通过分享授权<i class="cses-yiduduigou perm-grant-tick"></i></div>'
    + '<div class="perm-grant-opt" data-grant="允许但需审核">允许但需审核<i class="cses-yiduduigou perm-grant-tick"></i></div>'
    + '</div>'
    + '</div>'
    + '<span class="perm-x" id="permClose"><i class="cses-guanbi"></i></span>'
    + '</div>'
    + '<div class="perm-body">'
    + '<div class="perm-roles" id="permRoles">'
    + '<div class="perm-rgroup-t">系统角色</div>'
    + '<div class="perm-role" data-role="owner"><i class="cses-user"></i>所有者</div>'
    + '<div class="perm-role" data-role="admin"><i class="cses-user"></i>管理员</div>'
    + '<div class="perm-role" data-role="editor"><i class="cses-user"></i>编辑者</div>'
    + '<div class="perm-role" data-role="reader"><i class="cses-user"></i>阅读者</div>'
    + '<div class="perm-rgroup-t">自定义角色</div>'
    + '<div class="perm-role on" data-role="normal"><i class="cses-user"></i>普通用户</div>'
    + '<div class="perm-role perm-role-add"><i class="cses-add"></i>添加角色</div>'
    + '<div class="perm-help"><i class="cses-lianjiewenti"></i>帮助中心</div>'
    + '</div>'
    + '<div class="perm-main">'
    + '<div class="perm-main-head">'
    + '<span class="perm-main-title" id="permRoleTitle">普通用户</span>'
    + '<span class="perm-member-cluster" id="permMemberCluster"></span>'
    + '<div class="perm-addmember-wrap">'
    + '<span class="perm-addmember" id="permAddMember"><i class="cses-add"></i>添加成员</span>'
    + '<div class="perm-mem-pop" id="permMemPop">'
    + '<div class="perm-mem-search"><i class="cses-search"></i><input type="text" class="perm-mem-search-in" id="permMemSearch" placeholder="搜索成员"></div>'
    + '<div class="perm-mem-list" id="permMemList"></div>'
    + '<div class="perm-mem-foot"><span class="perm-mem-ok" id="permMemOk">确定</span></div>'
    + '</div>'
    + '</div>'
    + '<span class="perm-owner-av" id="permOwnerAv">竟元</span>'
    + '</div>'
    + '<div class="perm-tabs" id="permTabs">'
    + '<span class="perm-tab on" data-tab="data">数据权限</span>'
    + '<span class="perm-tab" data-tab="dash">仪表盘权限</span>'
    + '<span class="perm-tab" data-tab="auto">自动化权限</span>'
    + '<span class="perm-tab" data-tab="other">其他功能权限</span>'
    + '</div>'
    + '<div class="perm-pane on" data-pane="data">'
    + '<div class="perm-data">'
    + '<div class="perm-src" id="permSrc">'
    + '<div class="perm-search"><i class="cses-search"></i><input type="text" class="perm-search-in" placeholder="搜索数据表或者仪表盘"></div>'
    + '<div class="perm-srcitem on" data-src="table"><img src="' + ASSET + '/assets/icon/st-nav/shujubiao.svg" alt=""><span class="nm">项目回款记录</span><span class="lv">可编辑</span></div>'
    + '<div class="perm-srcitem" data-src="dash"><img src="' + ASSET + '/assets/icon/st-nav/yibiaopan.svg" alt=""><span class="nm">经营分析仪表盘</span><span class="lv">仅可阅读</span></div>'
    + '</div>'
    + '<div class="perm-detail" id="permDetail"></div>'
    + '</div>'
    + '</div>'
    + '<div class="perm-pane" data-pane="dash" id="permPaneDash"></div>'
    + '<div class="perm-pane" data-pane="auto" id="permPaneAuto"></div>'
    + '<div class="perm-pane" data-pane="other" id="permPaneOther"></div>'
    + '</div>'
    + '</div>'
    + '<div class="perm-foot">'
    + '<span class="perm-btn perm-btn-cancel" id="permCancel">取消</span>'
    + '<span class="perm-btn perm-btn-save" id="permSave">保存</span>'
    + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="perm-toast" id="permToast"></div>';

  function init() {
    if (document.getElementById('permOverlay')) return;
    var host = document.createElement('div');
    host.innerHTML = HTML;
    while (host.firstChild) document.body.appendChild(host.firstChild);

    var overlay = document.getElementById('permOverlay');
    function open() { overlay.classList.add('on'); }
    function close() { overlay.classList.remove('on'); }
    document.getElementById('permClose').addEventListener('click', close);
    document.getElementById('permCancel').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('on')) close(); });

    /* 绑定页面里所有「内容权限」入口按钮 */
    document.querySelectorAll('[data-content-perm], [title="内容权限"]').forEach(function (b) { b.addEventListener('click', open); });
    window.ContentPerm = { open: open, close: close };

    /* ---- 角色模型（locked=所有者：全部权限固定·控件禁用）---- */
    var ROLES = { owner: { title: '所有者', locked: true, avatar: '竟元', tbl: '可管理', dash: '可管理' }, admin: { title: '管理员', locked: false, tbl: '可管理', dash: '可管理' }, editor: { title: '编辑者', locked: false, tbl: '可编辑', dash: '仅可阅读' }, reader: { title: '阅读者', locked: false, tbl: '仅可阅读', dash: '仅可阅读' }, normal: { title: '普通用户', locked: false, tbl: '可编辑', dash: '仅可阅读' } };
    var curRole = 'normal', curSrc = 'table';
    var customRoleSeq = 0;

    /* ---- 候选成员（组件内假数据）· 头像底色走 chart/语义 token（av0~av5 轮换）---- */
    var MEMBERS = [
      { id: 'm1', name: '张三' }, { id: 'm2', name: '李四' }, { id: 'm3', name: '王五' },
      { id: 'm4', name: '赵敏' }, { id: 'm5', name: '周洁' }, { id: 'm6', name: '孙武' }
    ];
    MEMBERS.forEach(function (m, i) { m.av = i % 6; m.ch = m.name.slice(-1); });
    /* 每个角色已加成员 id 集合 */
    var roleMembers = {};
    function membersOf(role) { return (roleMembers[role] = roleMembers[role] || []); }

    function radio(val, label, checked, dis) { return '<cs-radio data-val="' + val + '"' + (checked ? ' data-checked' : '') + (dis ? ' data-disabled' : '') + '><span class="radio-inner"><span class="radio-dot"></span></span><span class="radio-label">' + label + '</span></cs-radio>'; }
    function cbox(label, checked, dis) { return '<label class="perm-cb' + (dis ? ' dis' : '') + '"><cs-checkbox' + (checked ? ' data-checked' : '') + (dis ? ' data-disabled' : '') + '></cs-checkbox><span>' + label + '</span></label>'; }
    function fgroup(t, body) { return '<div class="perm-fgroup"><div class="perm-fgroup-t">' + t + '</div><div class="perm-fgroup-body">' + body + '</div></div>'; }
    function fsub(t) { return '<div class="perm-fsub">' + t + '</div>'; }

    var DETAIL = { record: { label: '记录权限', icon: 'cses-liebiao', opts: ['全部可编辑', '全部可阅读', '仅本人创建可编辑', '无权限'], cur: '全部可编辑' },
      field: { label: '字段权限', icon: 'cses-set_field', opts: ['全部可编辑', '全部可阅读', '自定义字段权限'], cur: '全部可编辑' },
      view: { label: '视图权限', icon: 'cses-lattice_view', opts: ['可增删改，全部可阅读', '仅可阅读', '自定义视图权限'], cur: '可增删改，全部可阅读' } };
    function drow(key, dis) { var d = DETAIL[key];
      var opts = d.opts.map(function (o) { return '<label class="perm-dopt" data-opt="' + o + '">' + radio('o', o, o === d.cur, dis) + '</label>'; }).join('');
      return '<div class="perm-ditem" data-key="' + key + '"><div class="perm-drow"><i class="' + d.icon + ' di"></i><span class="dn">' + d.label + '</span><span class="dv">' + d.cur + '<i class="cses-xiala"></i></span></div><div class="perm-dexpand">' + opts + '</div></div>';
    }
    var TABLE_LVL = '可编辑';
    function detailTable(dis) {
      return '<div class="perm-detail-head"><i class="cses-table hi"></i><span class="t">数据表权限</span><span class="perm-lvl" id="permTblLvl">' + TABLE_LVL + '<i class="cses-shang"></i></span></div>'
        + '<div class="perm-radios" data-grp="table">' + radio('manage', '可管理', TABLE_LVL === '可管理', dis) + radio('edit', '可编辑', TABLE_LVL === '可编辑', dis) + radio('read', '仅可阅读', TABLE_LVL === '仅可阅读', dis) + radio('none', '无权限', TABLE_LVL === '无权限', dis) + '</div>'
        + '<div class="perm-sub-t">详细权限</div>'
        + '<div class="perm-detailperm">' + drow('record', dis) + drow('field', dis) + drow('view', dis) + '</div>';
    }
    function detailDash(dis) { var lvl = ROLES[curRole].dash || '可管理';
      return '<div class="perm-detail-head"><i class="cses-table hi"></i><span class="t">经营分析仪表盘</span><span class="perm-lvl">' + lvl + '<i class="cses-shang"></i></span></div>'
        + '<div class="perm-radios" data-grp="dash">' + radio('manage', '可管理', lvl === '可管理', dis) + radio('read', '仅可阅读', lvl === '仅可阅读', dis) + radio('none', '无权限', lvl === '无权限', dis) + '</div>';
    }
    function renderDetail() { document.getElementById('permDetail').innerHTML = curSrc === 'table' ? detailTable(ROLES[curRole].locked) : detailDash(ROLES[curRole].locked); }

    function paneDash(L) { return fgroup('开启权限', cbox('开启仪表盘权限设置', true, L)) + fgroup('基础功能', cbox('创建仪表盘', true, L) + cbox('删除自建的仪表盘', true, L) + cbox('分享仪表盘', true, L)); }
    function paneAuto(L) { return fgroup('开启权限', cbox('开启自动化权限设置', true, L))
      + fgroup('基础功能', cbox('新建工作流', true, L) + cbox('删除自己创建的工作流', true, L))
      + fgroup('触发器', cbox('多维表格数据变更触发', true, L) + fsub('定时触发') + cbox('一次触发', true, L) + cbox('周期触发', true, L))
      + fgroup('执行操作', fsub('消息通知') + cbox('限制单次通知人数', true, L) + fsub('多维表格数据') + cbox('更新多维表格的数据', true, L)); }
    function paneOther(L) { return fgroup('其他', cbox('复制多维表格内容', true, L) + cbox('创建副本、下载、打印多维表格', true, L) + cbox('管理沙箱', true, L)); }

    function renderCluster() {
      var wrap = document.getElementById('permMemberCluster');
      var ids = membersOf(curRole);
      if (!ids.length || ROLES[curRole].locked) { wrap.innerHTML = ''; return; }
      var shown = ids.slice(0, 3), extra = ids.length - shown.length, h = '';
      shown.forEach(function (id) { var m = MEMBERS.find(function (x) { return x.id === id; }); if (m) h += '<span class="perm-av perm-av-' + m.av + '">' + m.ch + '</span>'; });
      if (extra > 0) h += '<span class="perm-av perm-av-more">+' + extra + '</span>';
      wrap.innerHTML = h;
    }

    function renderAll() { var R = ROLES[curRole], L = R.locked;
      document.getElementById('permRoleTitle').textContent = R.title;
      document.getElementById('permAddMember').style.display = L ? 'none' : '';
      renderCluster();
      var av = document.getElementById('permOwnerAv'); av.style.display = L ? 'flex' : 'none'; if (L && R.avatar) av.textContent = R.avatar;
      TABLE_LVL = R.tbl || '可编辑';
      var tl = document.querySelector('#permSrc .perm-srcitem[data-src="table"] .lv'); if (tl) tl.textContent = R.tbl;
      var dl = document.querySelector('#permSrc .perm-srcitem[data-src="dash"] .lv'); if (dl) dl.textContent = R.dash;
      renderDetail();
      document.getElementById('permPaneDash').innerHTML = paneDash(L);
      document.getElementById('permPaneAuto').innerHTML = paneAuto(L);
      document.getElementById('permPaneOther').innerHTML = paneOther(L);
    }
    renderAll();

    document.getElementById('permRoles').addEventListener('click', function (e) { var r = e.target.closest('.perm-role[data-role]'); if (!r) return;
      document.querySelectorAll('#permRoles .perm-role').forEach(function (x) { x.classList.remove('on'); }); r.classList.add('on');
      curRole = r.getAttribute('data-role'); curSrc = 'table';
      document.querySelectorAll('#permSrc .perm-srcitem').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-src') === 'table'); });
      renderAll();
    });

    document.getElementById('permTabs').addEventListener('click', function (e) { var t = e.target.closest('.perm-tab'); if (!t) return;
      document.querySelectorAll('#permTabs .perm-tab').forEach(function (x) { x.classList.remove('on'); }); t.classList.add('on');
      var p = t.getAttribute('data-tab'); document.querySelectorAll('.perm-pane').forEach(function (pn) { pn.classList.toggle('on', pn.getAttribute('data-pane') === p); });
    });

    document.getElementById('permSrc').addEventListener('click', function (e) { var it = e.target.closest('.perm-srcitem'); if (!it) return;
      document.querySelectorAll('#permSrc .perm-srcitem').forEach(function (x) { x.classList.remove('on'); }); it.classList.add('on'); curSrc = it.getAttribute('data-src'); renderDetail();
    });

    var LVLMAP = { manage: '可管理', edit: '可编辑', read: '仅可阅读', none: '无权限' };
    document.getElementById('permDetail').addEventListener('click', function (e) {
      if (ROLES[curRole].locked) return;
      var head = e.target.closest('.perm-drow');
      if (head) { var item = head.closest('.perm-ditem'); item.classList.toggle('open'); return; }
      var opt = e.target.closest('.perm-dopt');
      if (opt) { var item2 = opt.closest('.perm-ditem'), key = item2.getAttribute('data-key'), val = opt.getAttribute('data-opt');
        DETAIL[key].cur = val; item2.querySelector('.dv').innerHTML = val + '<i class="cses-xiala"></i>';
        item2.querySelectorAll('.perm-dopt cs-radio').forEach(function (rd) { rd.removeAttribute('data-checked'); });
        opt.querySelector('cs-radio').setAttribute('data-checked', ''); item2.classList.remove('open'); return; }
      var rd2 = e.target.closest('.perm-radios[data-grp="table"] cs-radio');
      if (rd2) { document.querySelectorAll('.perm-radios[data-grp="table"] cs-radio').forEach(function (x) { x.removeAttribute('data-checked'); }); rd2.setAttribute('data-checked', '');
        var lvl = LVLMAP[rd2.getAttribute('data-val')] || '可编辑'; TABLE_LVL = lvl;
        var lb = document.getElementById('permTblLvl'); if (lb) lb.innerHTML = lvl + '<i class="cses-shang"></i>';
        var si = document.querySelector('#permSrc .perm-srcitem[data-src="table"] .lv'); if (si) si.textContent = lvl; return; }
    });

    overlay.addEventListener('click', function (e) { var row = e.target.closest('.perm-pane .perm-cb'); if (!row) return; var cb = row.querySelector('cs-checkbox'); if (!cb || cb.hasAttribute('data-disabled')) return; cb.toggleAttribute('data-checked'); });
    document.getElementById('permGrantSwitch').addEventListener('click', function () { this.toggleAttribute('data-checked'); });

    /* ---- 顶部「授权方式」下拉三选一 ---- */
    var grantWrap = overlay.querySelector('.perm-grant-wrap');
    var grantLabel = document.getElementById('permGrantLabel');
    var grantMenu = document.getElementById('permGrantMenu');
    function closeGrant() { grantMenu.classList.remove('on'); grantLabel.classList.remove('open'); }
    grantLabel.addEventListener('click', function (e) { e.stopPropagation(); grantMenu.classList.toggle('on'); grantLabel.classList.toggle('open'); });
    grantMenu.addEventListener('click', function (e) {
      var opt = e.target.closest('.perm-grant-opt'); if (!opt) return;
      grantMenu.querySelectorAll('.perm-grant-opt').forEach(function (x) { x.classList.remove('on'); });
      opt.classList.add('on');
      grantLabel.querySelector('.perm-grant-txt').textContent = opt.getAttribute('data-grant');
      closeGrant();
    });
    overlay.addEventListener('click', function (e) { if (!grantWrap.contains(e.target)) closeGrant(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeGrant(); });

    var toast = document.getElementById('permToast'), tmr;
    function showToast(msg) { toast.textContent = msg; toast.classList.add('on'); clearTimeout(tmr); tmr = setTimeout(function () { toast.classList.remove('on'); }, 1800); }
    document.getElementById('permSave').addEventListener('click', function () { showToast('「' + ROLES[curRole].title + '」权限已保存'); close(); });

    /* ---- 1. 搜索数据源：按 .nm 文字筛选 .perm-srcitem ---- */
    var srcSearch = overlay.querySelector('.perm-search-in');
    srcSearch.addEventListener('input', function () {
      var kw = this.value.trim();
      document.querySelectorAll('#permSrc .perm-srcitem').forEach(function (it) {
        var nm = (it.querySelector('.nm') || {}).textContent || '';
        it.style.display = (!kw || nm.indexOf(kw) > -1) ? '' : 'none';
      });
    });

    /* ---- 2. 添加角色：就地变输入态，确认后新增自定义角色并选中 ---- */
    var addRoleEl = overlay.querySelector('.perm-role-add');
    var addRoleHTML = addRoleEl.innerHTML;
    function resetAddRole() { addRoleEl.classList.remove('editing'); addRoleEl.innerHTML = addRoleHTML; }
    function commitAddRole() {
      var inp = addRoleEl.querySelector('.perm-role-in'); if (!inp) return;
      var name = inp.value.trim();
      if (!name) { resetAddRole(); return; }
      customRoleSeq += 1; var key = 'custom-' + customRoleSeq;
      ROLES[key] = { title: name, locked: false, tbl: '可编辑', dash: '仅可阅读' };
      var el = document.createElement('div');
      el.className = 'perm-role'; el.setAttribute('data-role', key);
      el.innerHTML = '<i class="cses-user"></i>' + name;
      addRoleEl.parentNode.insertBefore(el, addRoleEl);
      resetAddRole();
      document.querySelectorAll('#permRoles .perm-role').forEach(function (x) { x.classList.remove('on'); });
      el.classList.add('on'); curRole = key; curSrc = 'table';
      document.querySelectorAll('#permSrc .perm-srcitem').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-src') === 'table'); });
      renderAll();
    }
    addRoleEl.addEventListener('click', function (e) {
      if (addRoleEl.classList.contains('editing')) return;
      addRoleEl.classList.add('editing');
      addRoleEl.innerHTML = '<i class="cses-user"></i><input type="text" class="perm-role-in" placeholder="角色名"><span class="perm-role-ok"><i class="cses-yiduduigou"></i></span>';
      var inp = addRoleEl.querySelector('.perm-role-in'); inp.focus();
      inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); commitAddRole(); } else if (ev.key === 'Escape') { ev.stopPropagation(); resetAddRole(); } });
      inp.addEventListener('blur', function () { setTimeout(function () { if (addRoleEl.classList.contains('editing') && !addRoleEl.contains(document.activeElement)) resetAddRole(); }, 120); });
      addRoleEl.querySelector('.perm-role-ok').addEventListener('mousedown', function (ev) { ev.preventDefault(); commitAddRole(); });
    });

    /* ---- 3. 添加成员：按钮下方弹面板 · 勾选 → 确定 → 头像簇 + toast ---- */
    var memWrap = overlay.querySelector('.perm-addmember-wrap');
    var memBtn = document.getElementById('permAddMember');
    var memPop = document.getElementById('permMemPop');
    var memList = document.getElementById('permMemList');
    var memSearch = document.getElementById('permMemSearch');
    function renderMemList(kw) {
      var picked = membersOf(curRole);
      memList.innerHTML = MEMBERS.filter(function (m) { return !kw || m.name.indexOf(kw) > -1; }).map(function (m) {
        var on = picked.indexOf(m.id) > -1;
        return '<label class="perm-mem-item" data-id="' + m.id + '">'
          + '<cs-checkbox' + (on ? ' data-checked' : '') + '></cs-checkbox>'
          + '<span class="perm-av perm-av-' + m.av + '">' + m.ch + '</span>'
          + '<span class="perm-mem-nm">' + m.name + '</span></label>';
      }).join('');
    }
    function openMemPop() { renderMemList(''); memSearch.value = ''; memPop.classList.add('on'); memSearch.focus(); }
    function closeMemPop() { memPop.classList.remove('on'); }
    memBtn.addEventListener('click', function (e) { e.stopPropagation(); if (memPop.classList.contains('on')) closeMemPop(); else openMemPop(); });
    memSearch.addEventListener('input', function () { renderMemList(this.value.trim()); });
    memList.addEventListener('click', function (e) {
      var item = e.target.closest('.perm-mem-item'); if (!item) return;
      e.preventDefault();
      var cb = item.querySelector('cs-checkbox'); cb.toggleAttribute('data-checked');
    });
    document.getElementById('permMemOk').addEventListener('click', function () {
      var picked = [];
      memList.querySelectorAll('.perm-mem-item').forEach(function (item) {
        if (item.querySelector('cs-checkbox').hasAttribute('data-checked')) picked.push(item.getAttribute('data-id'));
      });
      var arr = membersOf(curRole);
      var added = 0;
      picked.forEach(function (id) { if (arr.indexOf(id) === -1) { arr.push(id); added += 1; } });
      closeMemPop();
      renderCluster();
      if (added > 0) showToast('已添加 ' + added + ' 名成员到「' + ROLES[curRole].title + '」');
    });
    memPop.addEventListener('click', function (e) { e.stopPropagation(); });
    overlay.addEventListener('click', function (e) { if (memPop.classList.contains('on') && !memWrap.contains(e.target)) closeMemPop(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && memPop.classList.contains('on')) closeMemPop(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* flow/guide.js —— 会议活页的页内引导与循环。
   由会议页自己加载；作品集只通过地址 hash 传参：#loop=KEY 让页面循环演示，#guide=KEY 挂引导。
   页面尺寸变化通过 postMessage 回传给父页，父页按宽度缩放。全程不需要父页读 iframe 内部，file:// 下也能跑。 */
(function(){
  var d=document, w=window;

  /* 元素查找：'css' / 'text:正则' / 'in:容器css|text:正则' ；先取可见的，找不到退回隐藏的 */
  function rectOK(el){ if(!el) return false; var r=el.getBoundingClientRect(); return (r.width>0||r.height>0) && r.bottom>0 && r.right>-40; }
  function find(d,q){
    var scope=d, m=/^in:(.+?)\|(.+)$/.exec(q); if(m){ scope=d.querySelector(m[1]); if(!scope) return null; q=m[2]; }
    var hid=null, list;
    if(q.indexOf('text:')===0){ var re=new RegExp(q.slice(5)); list=[].slice.call(scope.querySelectorAll('button,[role="button"],a'));
      for(var i=0;i<list.length;i++){ var b=list[i], lab=(b.getAttribute('aria-label')||'')+' '+(b.title||'')+' '+b.textContent.replace(/\s+/g,' '); if(re.test(lab)){ if(rectOK(b)) return b; hid=hid||b; } } return hid; }
    list=[].slice.call(scope.querySelectorAll(q)); for(var j=0;j<list.length;j++){ if(rectOK(list[j])) return list[j]; } return list[0]||null;
  }
  function fire(el){ var r=el.getBoundingClientRect(), x=r.left+(r.width||40)/2, y=r.top+(r.height||20)/2, w=el.ownerDocument.defaultView;
    ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(t){ try{ el.dispatchEvent(new w.MouseEvent(t,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0})); }catch(e){} }); }
  function click(d,q){ var el=find(d,q); if(el) fire(el); return !!el; }
  /* 内容进会议只剩拖拽一条路（卡上那几颗是可见范围标志，不是按钮），所以引导要能演示拖 */
  function dragTo(d,q,intoSel){
    var el=find(d,q), tgt=d.querySelector(intoSel||'#grid'); if(!el||!tgt) return false;
    var w=d.defaultView, dt; try{ dt=new w.DataTransfer(); }catch(e){ return false; }
    function ev(t,node){ try{ node.dispatchEvent(new w.DragEvent(t,{bubbles:true,cancelable:true,dataTransfer:dt})); }catch(e){} }
    ev('dragstart',el); ev('dragover',tgt); ev('drop',tgt); ev('dragend',el); return true;
  }
  function fill(d,q,val){ var el=d.querySelector(q); if(!el) return false; el.value=val; el.dispatchEvent(new d.defaultView.Event('input',{bubbles:true})); return true; }
  function isSolo(d){ return d.body.classList.contains('is-solo'); }
  function paused(d){ return !!d.querySelector('.mt-transcript.is-tr-off'); }

  /* ── 循环剧本：数组，元素为 [动作, 等待ms]；动作是函数(d) 或 css 选择器；'reload' 重载页面 ── */
  var LOOPS = {
    ai:     [['.mt-orb',2600],['.mt-nota-stop',1800]],
    cols:   [[function(d){ if(paused(d)) click(d,'.mt-tr__pill'); },2400],['.mt-ctrl[aria-label="协同画板"]',3200],['.mt-board__x',1400],[function(d){ if(!paused(d)) click(d,'.mt-tr__pill'); },1200]],
    tr:     [[function(d){ if(paused(d)) click(d,'.mt-tr__pill'); },2600],[function(d){ if(!paused(d)) click(d,'.mt-tr__pill'); },1800]],
    variants:[[function(d){ if(isSolo(d)) click(d,'.mt-tr__solo'); if(paused(d)) click(d,'.mt-tr__pill'); },2400],[function(d){ if(!isSolo(d)) click(d,'.mt-tr__solo'); },2600],[function(d){ if(!paused(d)) click(d,'.mt-tr__pill'); },2200]],
    main:   [['.mt-glass[aria-label="放大"]',2600],['text:退出全屏|恢复|缩小',600],['.mt-glass[aria-label="放大"]',0],[function(d){},1800]],
    kr:     [['.mt-ctrl[aria-label="更多"]',900],['text:KR 填写',1200],['#btnKrPick',1000],['.mt-menu.show button',1000],['#btnKrNewOk',1800],[function(d){ var t=d.querySelectorAll('.mt-kr__in'); if(t[0]&&!t[0].value){ t[0].value='把承接链路的失败原因当场记下来'; t[1].value='每条结论都指名到人'; } },900],['#btnKrSubmit',2400],[function(d){ if(d.defaultView.__setHost) d.defaultView.__setHost(true); },700],['#btnVote',1600],['.mt-vote__card',1200],['#btnVoteSubmit',2400],['.mt-voted__row',2600],['.mt-voted__tag',2400],['reload',900]],
    task:   [['drag:.mt-stage-source-card--task',3400],['.mt-tile--content',2600],['.mt-ctile-modal .mt-local-stage__close',2000],['.mt-tile--content [data-tilemenu]',1100],['in:.mt-menu.show|text:设为主画面|放大到主屏',3400],['.mt-nota-task-proposal__primary:not(:disabled)',2600],['reload',800]],
    doc:    [['drag:.mt-stage-source-card--document',3400],['.mt-tile--content',4000],['[data-proposal-accept]',2600],['.mt-ctile-modal .mt-local-stage__close',1800],['reload',800]],
    krold:  [[function(d){ d.defaultView.__krOld('fill'); },2600],[function(d){ d.defaultView.__krOld('vote'); },2800],[function(d){ d.defaultView.__krOld('res'); },2600],[function(d){ d.defaultView.__krOld('float'); },3000]],
    space:  [['.mt-tr__solo',1400],['.mt-ctrl[aria-label="更多"]',900],['.mt-menu.show .mt-menu__actlb',1800],['.mt-ctrl[aria-label="更多"]',900],['text:KR 填写',1200],['#btnKrPick',1000],['.mt-menu.show button',1000],['#btnKrNewOk',2200],['#btnSpaceSwitch',1800],['.mt-deck__dots > i:not(.is-on), .mt-deck__card:not(.is-focus)',2600],['reload',800]]
  };
  /* ── 引导剧本：tour = 分步光点；switch = 顶部状态按钮 ── */
  var GUIDES = {
    ai:    { mode:'tour', title:'AI 召唤 · 1 步', steps:[
      { q:'.mt-orb', t:'点右下角的「AI 助手」。Nota 以一格成员位进入，动画切换，不是弹窗；再点它头像上的「退出 Nota」它就离开。' } ] },
    cols:  { mode:'tour', title:'三列 · 2 步', steps:[
      { q:'.mt-tr__pill', t:'第 1 步 · 点「开启 AI 转写」。中间一列开始按发言人分段记录，下方生成待办。' },
      { q:'.mt-ctrl[aria-label="协同画板"]', t:'第 2 步 · 点底部「协同画板」。右侧打开画板，三列各对应一个 agent。' } ] },
    tr:    { mode:'tour', title:'转写 · 2 步', steps:[
      { q:'.mt-orb', t:'第 1 步 · 点右下角「AI 助手」。' },
      { q:'.mt-tr__pill', t:'第 2 步 · 点「开启 AI 转写」。转写占据中间一列，按发言人分段，下方直接生成待办。' } ] },
    kr:    { mode:'tour', title:'KR 填写 · 投票 · 11 步', steps:[
      { q:'.mt-ctrl[aria-label="更多"]', t:'第 1 步 · 点底部的「更多」。KR 不是常驻按钮，只在需要时从这里进。' },
      { q:'text:KR 填写', t:'第 2 步 · 点「KR 填写」。普通会议没有现成的 KR 主题，先弹出「创建 KR 填写」。' },
      { q:'#btnKrPick', t:'第 3 步 · 点「选择KR」，从本场会议关联的 KR 里选主题。' },
      { q:'.mt-menu.show button', t:'第 4 步 · 选一条 KR 作为这一轮的主题。' },
      { q:'#btnKrNewOk', t:'第 5 步 · 点「创建」。KR 填写面板占右侧一列，会议画面照常，不被遮挡。' },
      { q:'#btnKrSubmit', pre:function(d){ var t=d.querySelectorAll('.mt-kr__in'); if(t[0]&&!t[0].value){ t[0].value='把承接链路的失败原因当场记下来'; t[1].value='每条结论都指名到人'; } },
        t:'第 6 步 · 框里已经替你写了两条想法，点「提交我的想法」。填写过程匿名。' },
      { q:'#btnVote', pre:function(d){ if(d.defaultView.__setHost) d.defaultView.__setHost(true); },
        t:'第 7 步 · 提交后三个框变只读，中间长出「已提交」，底部按钮变成等待态。开启投票是主持人专属，这里已替你切到主持人视角，点中间那颗「开启投票」。' },
      { q:'.mt-vote__card', t:'第 8 步 · AI 把大家填的 KR 按关键词归了类，一组一个关键词。点一张卡投它一票。' },
      { q:'#btnVoteSubmit', t:'第 9 步 · 点「投出我的想法」。' },
      { q:'.mt-voted__row', t:'第 10 步 · 投完之后这一栏换成「我投票的KR」，等主持人结束。点一条你觉得最好的，只能选一条。' },
      { q:'.mt-voted__tag', t:'第 11 步 · 给它加个评语标签，也可以写一句十字以内的评语。整条链路里 KR 始终只占右侧一列，不留常驻浮窗。' } ] },
    task:  { mode:'tour', title:'任务工作项 · 8 步', steps:[
      { q:'.mt-stage-source-card--task', drag:true, done:function(d){ return !!d.querySelector('.mt-tile--content'); },
        t:'第 1 步 · 把「任务视图」这张卡拖到中间的会议画面里。它会占一格，和成员卡片一样大，格子里是任务列表的缩略图，不抢主屏。卡片上那几颗小标志是可见范围，不是按钮。' },
      { q:'.mt-tile--content', t:'第 2 步 · 点这一格。任务列表在独立弹窗里打开，可以直接操作。' },
      { q:'[data-stage-view="kanban"]', t:'第 3 步 · 弹窗右上角点「看板」，同一批任务换一种看法。' },
      { q:'.mt-ctile-modal .mt-local-stage__close', t:'第 4 步 · 点 × 关掉弹窗。这段时间转写接着 Nota 的对话，已经生成一条待确认任务。' },
      { q:'.mt-tile--content [data-tilemenu]', t:'第 5 步 · 要让它上主讲位，点这一格右上角的三个点，入口和成员卡片一致。' },
      { q:'in:.mt-menu.show|text:设为主画面|放大到主屏', t:'第 6 步 · 主持人选「设为主画面」，所有人都会看到；其他人这里是「放大到主屏」，只有自己看到。选一个，它到主讲位置铺满，可以直接编辑。' },
      { q:'.mt-nota-task-proposal__primary:not(:disabled)', t:'第 7 步 · 点待确认任务卡上的「确认创建」。任务进入项目的任务列表，会后不需要再录一次。' },
      { q:'.mt-nota-task-proposal.is-created', t:'第 8 步 · 点已创建的任务卡，任务详情在独立弹窗里打开，可以直接改负责人和截止时间。' } ] },
    doc:   { mode:'tour', title:'协作文档 · 3 步', steps:[
      { q:'.mt-stage-source-card--document', drag:true, done:function(d){ return !!d.querySelector('.mt-tile--content'); },
        t:'第 1 步 · 把「协作文档」这张卡拖到中间的会议画面里。它占一格，缩略图就是文档本身。卡上的显示器标志表示这场会的人都能看，末尾那颗是文档的存放位置。' },
      { q:'.mt-tile--content', t:'第 2 步 · 点这一格。文档在独立弹窗里打开，可以直接编辑，别人也在同一份上改。' },
      { q:'[data-proposal-accept]', t:'第 3 步 · 转写走到这里，Nota 在文档上标出 2 处修改建议。点「采纳全部」，修改直接写进文档，不用会后再对一遍。' } ] },
    main:  { mode:'tour', title:'主视图 · 4 步', steps:[
      { q:'.mt-glass[aria-label="放大"]', t:'第 1 步 · 点任一成员格上的「放大」，切成主讲视图；再点一次回到四格等大。' },
      { q:'text:会议信息|会议详情', t:'第 2 步 · 点标题旁的「会议信息」，详情悬浮查看，不常驻占位。' },
      { q:'.mt-ctrl[aria-label="更多"]', t:'第 3 步 · 点底部「更多」。' },
      { q:'text:KR 填写', t:'第 4 步 · 点「KR 填写」，看动态按钮区如何出现。' } ] },
    space: { mode:'tour', title:'自定义空间 · 9 步', steps:[
      { q:'.mt-tr__solo', t:'第 1 步 · 点转写卡右上角的「独占一列」。右侧出现空间条，当前空间叫「自定义空间1」。' },
      { q:'.mt-ctrl[aria-label="更多"]', t:'第 2 步 · 点底部的「更多」。' },
      { q:'.mt-menu.show .mt-menu__actlb', t:'第 3 步 · 点菜单里的「协同画板」。它不会顶掉转写，而是自动新开「自定义空间2」，转写退到后台。' },
      { q:'.mt-ctrl[aria-label="更多"]', t:'第 4 步 · 再点一次「更多」，准备发起 KR 填写。' },
      { q:'text:KR 填写', t:'第 5 步 · 点「KR 填写」。普通会议没有现成的 KR 主题，先弹出「创建 KR 填写」。' },
      { q:'#btnKrPick', t:'第 6 步 · 点「选择KR」，从本场会议关联的 KR 里选主题。' },
      { q:'.mt-menu.show button', t:'第 7 步 · 选一条 KR 作为填写主题。' },
      { q:'#btnKrNewOk', t:'第 8 步 · 点「创建」。KR 填写面板独占一列，不与其他面板合并，自动新开「自定义空间3」。' },
      { q:'#btnSpaceSwitch', t:'第 9 步 · 点空间条右侧的「切换空间」，展开这一列里的三个空间卡片；点另一张卡片即可切换，空间名可以点击直接修改。' } ] },
    krold: { mode:'switch', title:'KR 填写 · 改版前', states:[
      { name:'填写', t:'改版前：填写要开一整块弹窗，压在会议画面上。会议这时看不见，也做不了别的事。', run:function(d){ d.defaultView.__krOld('fill'); } },
      { name:'投票', t:'投票同样是整块弹窗，左侧分组卡片、右侧已选，屏幕被占满。', run:function(d){ d.defaultView.__krOld('vote'); } },
      { name:'结果与评语', t:'结果和写评语还在同一块弹窗里，整个流程从头到尾没让出画面。', run:function(d){ d.defaultView.__krOld('res'); } },
      { name:'填完之后', t:'关掉弹窗也没结束：顶部横幅提醒未填写的人，右下角「KR 填写中」浮窗常驻，谁填了几条一直挂着，会中没法做别的。', run:function(d){ d.defaultView.__krOld('float'); } } ] },
    variants: { mode:'switch', title:'转写列 · 三个变体', states:[
      { name:'并列', t:'转写和任务卡并列在右侧一列（默认）。', run:function(d){ if(isSolo(d)) click(d,'.mt-tr__solo'); if(paused(d)) click(d,'.mt-tr__pill'); } },
      { name:'独占一列', t:'转写占满一列，任务卡退到后台空间。', run:function(d){ if(!isSolo(d)) click(d,'.mt-tr__solo'); if(paused(d)) click(d,'.mt-tr__pill'); } },
      { name:'收起', t:'暂停转写，内容收起只留一行提示。', run:function(d){ if(!paused(d)) click(d,'.mt-tr__pill'); } } ] }
  };

  var CSS = '.tg-ring{position:fixed;z-index:99998;border:2px solid #4857e2;border-radius:10px;pointer-events:none;box-shadow:0 0 0 4px rgba(72,87,226,.18);animation:tgp 1.4s ease-out infinite}'
    + '@keyframes tgp{0%{box-shadow:0 0 0 2px rgba(72,87,226,.45)}100%{box-shadow:0 0 0 16px rgba(72,87,226,0)}}'
    + '.tg-tip{position:fixed;z-index:99999;max-width:320px;background:#0b0b10;color:#fff;font:13px/1.6 -apple-system,"PingFang SC","Noto Sans SC",sans-serif;padding:10px 32px 10px 14px;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.28);pointer-events:none}'
    + '.tg-tip__x{position:absolute;right:6px;top:6px;width:20px;height:20px;border:0;border-radius:6px;background:rgba(255,255,255,.12);color:#fff;font:14px/1 -apple-system,sans-serif;cursor:pointer;pointer-events:auto;display:flex;align-items:center;justify-content:center;padding:0}'
    + '.tg-tip__x:hover{background:rgba(255,255,255,.24)}'
    + '.tg-ask{position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;background:rgba(8,8,12,.55);backdrop-filter:blur(3px)}'
    + '.tg-ask__box{width:min(420px,86vw);background:#fff;color:#0b0b10;border-radius:14px;padding:22px 24px 18px;box-shadow:0 24px 70px rgba(0,0,0,.4);font:13px/1.7 -apple-system,"PingFang SC","Noto Sans SC",sans-serif;text-align:center}'
    + '.tg-ask__box h4{margin:0 0 6px;font-size:16px;font-weight:600}'
    + '.tg-ask__box p{margin:0 0 16px;color:#6a6a76}'
    + '.tg-ask__row{display:flex;gap:10px}'
    + '.tg-ask__row button{flex:1;border:1px solid #e6e6ec;background:#fff;border-radius:9px;padding:10px 12px;font:14px inherit;cursor:pointer;color:#0b0b10}'
    + '.tg-ask__row button.pri{background:#0b0b10;color:#fff;border-color:#0b0b10}'
    + '.tg-ask__row button:hover{border-color:#4857e2;color:#4857e2}'
    + '.tg-ask__row button.pri:hover{background:#2a2a38;color:#fff;border-color:#2a2a38}\''
    + '.tg-tip:after{content:"";position:absolute;left:18px;top:-6px;border:6px solid transparent;border-bottom-color:#0b0b10;border-top:0}.tg-tip.up:after{top:auto;bottom:-6px;border-bottom:0;border-top:6px solid #0b0b10}'
    + '.tg-panel{position:fixed;left:12px;top:10px;z-index:99999;width:auto;max-width:340px;background:#fff;color:#0b0b10;border:1px solid #e6e6ec;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.16);font:12.5px/1.5 -apple-system,"PingFang SC","Noto Sans SC",sans-serif;padding:6px 8px 6px 10px}'
    + '.tg-panel h5{margin:0;font-size:12.5px;font-weight:700;display:flex;align-items:center;gap:8px;white-space:nowrap}.tg-panel h5 em{font-style:normal;font-weight:500;color:#4857e2}.tg-panel h5 .tg-tg{flex:none;border:1px solid #e6e6ec;background:#fff;border-radius:6px;padding:2px 8px;font:12px inherit;cursor:pointer;color:#0b0b10}.tg-panel.open h5 .tg-tg{background:#0b0b10;color:#fff;border-color:#0b0b10}.tg-panel h5 i{font-style:normal;font:500 10px ui-monospace,Menlo,monospace;color:#4857e2;border:1px solid rgba(72,87,226,.4);border-radius:4px;padding:1px 6px;letter-spacing:.1em}'
    + '.tg-panel ol{display:none;margin:8px 0 6px;padding:8px 0 0;list-style:none;border-top:1px solid #f0f0f4;white-space:normal}.tg-panel.open ol{display:block}.tg-panel li{display:flex;gap:8px;padding:3px 0;color:#8a8a94}.tg-panel li b{font-weight:500;color:#c8c8d0;width:14px}.tg-panel li.cur{color:#0b0b10}.tg-panel li.cur b{color:#4857e2}.tg-panel li.done{color:#0b0b10}.tg-panel li.done b{color:#22c55e}'
    + '.tg-panel .row{display:flex;gap:6px;margin-left:6px}.tg-panel .row button{flex:none;border:1px solid #e6e6ec;background:#fff;border-radius:6px;padding:3px 9px;font:12px inherit;cursor:pointer;color:#0b0b10}.tg-panel .row button.pri{background:#0b0b10;color:#fff;border-color:#0b0b10}.tg-panel .row button:disabled{opacity:.45;cursor:default}'
    + '.tg-cursor{position:fixed;z-index:100000;width:22px;height:22px;pointer-events:none;transition:left .6s cubic-bezier(.2,.7,.2,1),top .6s cubic-bezier(.2,.7,.2,1);opacity:0}.tg-cursor.on{opacity:1}.tg-cursor.dn{transform:scale(.8)}.tg-cursor svg{width:22px;height:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))}'
    + '.tg-bar{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99999;display:flex;gap:4px;padding:5px;background:rgba(11,11,16,.92);border-radius:999px;box-shadow:0 8px 28px rgba(0,0,0,.28);font:13px -apple-system,"PingFang SC","Noto Sans SC",sans-serif}'
    + '.tg-bar button{border:0;background:transparent;color:#c8c8d0;padding:7px 16px;border-radius:999px;cursor:pointer;font:inherit}.tg-bar button.on{background:#fff;color:#0b0b10;font-weight:600}'
    + '.tg-bar-tip{position:fixed;left:50%;top:60px;transform:translateX(-50%);z-index:99999;background:#0b0b10;color:#fff;font:12.5px/1.6 -apple-system,"PingFang SC","Noto Sans SC",sans-serif;padding:7px 14px;border-radius:8px;pointer-events:none;white-space:nowrap}';
  var CUR='<svg viewBox="0 0 24 24"><path d="M5 3l14 8-6 2-3 6z" fill="#fff" stroke="#0b0b10" stroke-width="1.6" stroke-linejoin="round"/></svg>';


  /* ── 尺寸回传：父页据此缩放 ── */
  var lastW=0; function report(){ var sw=d.documentElement.scrollWidth, sh=d.documentElement.scrollHeight;
    /* 内容比视口窄的页面（列表 1043、看板 1265、文档 968）上报内容宽，父页缩略图按内容宽放大填满 */
    try{ var bw=d.body.scrollWidth; if(bw>320 && bw<sw) sw=bw; }catch(e){}
    if(sw!==lastW){ lastW=sw; try{ w.parent.postMessage({t:'guide-size',w:sw,h:sh},'*'); }catch(e){} } }
  setInterval(report,700); w.addEventListener('load',report);
  function refit(){ lastW=0; report(); }

  function mountTour(g){
    var st=d.createElement('style'); st.textContent=CSS; d.head.appendChild(st);
    var ring=d.createElement('div'); ring.className='tg-ring';
    var tip=d.createElement('div'); tip.className='tg-tip';
    tip.innerHTML='<span class="tg-tip__t"></span><button type="button" class="tg-tip__x" aria-label="关闭提示">×</button>';
    var tipText=tip.querySelector('.tg-tip__t');
    var cur=d.createElement('div'); cur.className='tg-cursor'; cur.innerHTML=CUR;
    var panel=d.createElement('div'); panel.className='tg-panel'; panel.id='tgPanel';
    panel.innerHTML='<h5><i>GUIDE</i><span>'+g.title.replace(/ · \d+ 步$/,'')+'</span><em id="tgCnt">1/'+g.steps.length+'</em><button type="button" class="tg-tg" id="tgTg">步骤</button><span class="row"><button type="button" class="pri" id="tgAuto">▶ 自动演示</button><button type="button" id="tgHint">提示</button><button type="button" id="tgReset">重来</button></span></h5><ol>'+g.steps.map(function(x,i){return '<li><b>'+(i+1)+'</b><span>'+x.t.replace(/^第 \d 步 · /,'')+'</span></li>'}).join('')+'</ol>';
    d.body.appendChild(ring); d.body.appendChild(tip); d.body.appendChild(panel); d.body.appendChild(cur);
    var i=0, target=null, timer=null, auto=false, done=false;
    /* mode: 'ask' 未选 · 'auto' 自动演示（不出字）· 'self' 自己点（出分步提示）
       tipsOn: 提示是否显示。点了别处就收起，点「提示」再叫回来。 */
    var mode='ask', tipsOn=false;
    /* 🔴 owner 2026-09-08：「这个不能移到空白区域吗？」—— 页面里没有空白，1440×910 是排满的。
       真正的空白在**页面外**：作品集蒙层的顶栏。所以把这条引导交给父页去画，
       父页应答 guide-host-ok 之后，页内这条就藏起来。独立打开（没有父页应答）时照旧留在页内。 */
    var hosted=false;
    function post(){ if(w.parent===w) return; try{ w.parent.postMessage({ t:'guide-panel', title:g.title,
      steps:g.steps.map(function(x){ return x.t.replace(/^第 \d 步 · /,''); }), i:i, n:g.steps.length, done:done, auto:auto, tips:(mode==='self'&&tipsOn) },'*'); }catch(e){} }
    w.addEventListener('message',function(e){ var m=e.data; if(!m||!m.t) return;
      if(m.t==='guide-host-ok'){ hosted=true; panel.style.display='none'; }
      if(m.t==='guide-cmd'){ if(m.cmd==='auto') runAuto(); else if(m.cmd==='reset') w.location.reload(); else if(m.cmd==='hint'){ mode='self'; tipsOn=true; place(); post(); } } });
    function place(){ var showRing=(mode==='auto')||(mode==='self'&&tipsOn), showTip=(mode==='self'&&tipsOn);
      if(!target||!rectOK(target)||!showRing){ ring.style.display='none'; tip.style.display='none'; return; }
      var r=target.getBoundingClientRect(); ring.style.display='block'; tip.style.display=showTip?'block':'none';
      if(!showTip) return;
      var pad=5;
      ring.style.left=(r.left-pad)+'px'; ring.style.top=(r.top-pad)+'px';
      ring.style.width=(r.width+pad*2)+'px'; ring.style.height=(r.height+pad*2)+'px';
      var br=0; try{ br=parseFloat(w.getComputedStyle(target).borderRadius)||0; }catch(e){}
      ring.style.borderRadius=(br>=Math.min(r.width,r.height)/2-1 ? '999px' : Math.max(6,br+pad)+'px');
      var tw=tip.offsetWidth, th=tip.offsetHeight, W=w.innerWidth, H=w.innerHeight;
      var left=Math.min(Math.max(8,r.left-10),W-tw-8); var below=r.bottom+14+th<H; tip.classList.toggle('up',!below);
      tip.style.left=left+'px'; tip.style.top=(below? r.bottom+14 : r.top-14-th)+'px'; }
    function setStep(k){ i=k; var lis=panel.querySelectorAll('li'); for(var a=0;a<lis.length;a++){ lis[a].className=a<k?'done':(a===k?'cur':''); } var cnt=d.getElementById('tgCnt'); if(cnt) cnt.textContent=(Math.min(k+1,g.steps.length))+'/'+g.steps.length+(k>=g.steps.length?' ✓':''); post();
      clearInterval(timer); refit();
      if(k>=g.steps.length){ done=true; target=null; place(); if(mode==='self'&&tipsOn){ tip.style.display='block'; tipText.textContent='走完了 · 现在可以随意试'; tip.style.left='16px'; tip.style.top='16px'; tip.classList.remove('up'); } return; }
      tipText.textContent=g.steps[k].t; target=null; var tries=0;
      timer=setInterval(function(){ if(!target){ var el=find(d,g.steps[k].q); if(el&&rectOK(el)) target=el; tries++; } place(); if(tries%7===0) refit();
        /* 拖拽没有「点中目标」这一下，只能看结果有没有出现 */
        if(g.steps[k].done){ try{ if(g.steps[k].done(d)){ clearInterval(timer); setTimeout(function(){ setStep(k+1); },600); } }catch(e){} }
      },120); }
    d.addEventListener('click',function(e){ if(done||auto||!target) return; if(target===e.target||target.contains(e.target)){ setTimeout(function(){ setStep(i+1); },700); } },true);
    /* owner 2026-09-08：「如果他操作了别的提示消失就行了」 */
    d.addEventListener('click',function(e){ if(mode!=='self'||!tipsOn||auto) return;
      if(e.target.closest&&e.target.closest('.tg-tip,.tg-panel,.tg-ask')) return;
      if(target&&(target===e.target||target.contains(e.target))) return;
      tipsOn=false; place(); post(); },true);
    tip.querySelector('.tg-tip__x').addEventListener('click',function(e){ e.stopPropagation(); tipsOn=false; place(); post(); });
    function runAuto(){ if(auto) return; mode='auto'; tipsOn=false; auto=true; d.getElementById('tgAuto').disabled=true; cur.classList.add('on'); place(); post();
      cur.style.left=(w.innerWidth/2)+'px'; cur.style.top=(w.innerHeight/2)+'px';
      (function step(){ if(i>=g.steps.length){ auto=false; cur.classList.remove('on'); d.getElementById('tgAuto').disabled=false; post(); return; }
        var t0=Date.now(); (function wait(){ var el=find(d,g.steps[i].q); if(!el||!rectOK(el)){ if(Date.now()-t0<9000) return setTimeout(wait,200); auto=false; cur.classList.remove('on'); d.getElementById('tgAuto').disabled=false; return; }
          if(g.steps[i].pre){ try{ g.steps[i].pre(d); }catch(e){} }
          if(g.steps[i].drag){ var r0=el.getBoundingClientRect(); cur.style.left=(r0.left+r0.width/2)+'px'; cur.style.top=(r0.top+r0.height/2)+'px';
            setTimeout(function(){ cur.classList.add('dn'); dragTo(d,g.steps[i].q); setTimeout(function(){ cur.classList.remove('dn'); setStep(i+1); setTimeout(step,1000); },420); },700); return; }
          var r=el.getBoundingClientRect(); cur.style.left=(r.left+(r.width||40)/2)+'px'; cur.style.top=(r.top+(r.height||20)/2)+'px';
          setTimeout(function(){ cur.classList.add('dn'); fire(el); setTimeout(function(){ cur.classList.remove('dn'); setStep(i+1); setTimeout(step,1000); },220); },700);
        })(); })(); }
    d.getElementById('tgAuto').addEventListener('click',runAuto);
    d.getElementById('tgTg').addEventListener('click',function(){ panel.classList.toggle('open'); });
    d.getElementById('tgHint').addEventListener('click',function(){ mode='self'; tipsOn=true; place(); post(); });
    /* 开场先问一句，别一上来就糊一层字 */
    var ask=d.createElement('div'); ask.className='tg-ask';
    ask.innerHTML='<div class="tg-ask__box"><h4>'+g.title+'</h4><p>想怎么看这一页？</p><div class="tg-ask__row">'+
      '<button type="button" class="pri" id="tgAskAuto">▶ 自动演示</button><button type="button" id="tgAskSelf">自己点点看</button></div></div>';
    d.body.appendChild(ask);
    function closeAsk(){ if(ask.parentNode) ask.parentNode.removeChild(ask); }
    d.getElementById('tgAskAuto').addEventListener('click',function(){ closeAsk(); runAuto(); });
    d.getElementById('tgAskSelf').addEventListener('click',function(){ closeAsk(); mode='self'; tipsOn=true; place(); post(); });
    setTimeout(post,60); setTimeout(post,600);
    d.getElementById('tgReset').addEventListener('click',function(){ clearInterval(timer); w.location.reload(); });
    setStep(0);
  }
  function mountSwitch(g){
    var st=d.createElement('style'); st.textContent=CSS; d.head.appendChild(st);
    var bar=d.createElement('div'); bar.className='tg-bar'; bar.id='tgBar'; var tip=d.createElement('div'); tip.className='tg-bar-tip';
    g.states.forEach(function(sx,k){ var b=d.createElement('button'); b.textContent=sx.name; b.dataset.k=k; bar.appendChild(b); });
    d.body.appendChild(bar); d.body.appendChild(tip);
    function go(k){ [].forEach.call(bar.children,function(b,j){ b.classList.toggle('on',j===k); }); tip.textContent=g.states[k].t; try{ g.states[k].run(d); }catch(e){} setTimeout(refit,500); setTimeout(refit,1500); }
    bar.addEventListener('click',function(e){ var b=e.target.closest('button'); if(b) go(+b.dataset.k); });
    go(0);
  }
  function startLoop(key){ var L=LOOPS[key]; if(!L) return; var idx=0; d.documentElement.setAttribute('data-loop',key);
    function tick(){ d.documentElement.setAttribute('data-loop-idx',idx); if(d.hidden){ setTimeout(tick,800); return; } var step=L[idx%L.length], act=step[0];
      try{ if(act==='reload'){ w.location.reload(); return; } if(typeof act==='function') act(d); else if(act.indexOf('drag:')===0) dragTo(d,act.slice(5)); else click(d,act); }catch(e){}
      idx++; refit(); setTimeout(tick,step[1]||1500); }
    setTimeout(tick,1600); }

  /* 缩略图/引导态：页面自己的 focus() / scrollIntoView() 会把外面的作品集页整页拽到这块活页上
     （浏览器聚焦时会连祖先文档一起滚动）。这两种态下一律不许滚外面。 */
  (function(){ var h=w.location.hash||''; if(!/(?:^#|&)(?:loop|guide|auto)=/.test(h)) return;
    var of=HTMLElement.prototype.focus; HTMLElement.prototype.focus=function(o){ var opt=Object.assign({},o||{}); opt.preventScroll=true; return of.call(this,opt); };
    if(/(?:^#|&)loop=/.test(h)){ Element.prototype.scrollIntoView=function(){}; } })();
  /* ── 演示用的两条切换（视角 / 会议类型）也交给父页去画 ──
     owner 2026-09-08：「这块有那个主持人、协同共创会等切换，你也放到空白区域」。
     它们压在视频区左上角，页面里没有空白，只能挪到蒙层顶栏。 */
  (function(){
    if(w.parent===w) return;
    var kb=d.getElementById('kindBar'), rb=d.getElementById('roleBar');
    if(!kb&&!rb) return;
    function read(bar,attr){ var out=[],on=''; if(!bar) return {items:out,on:on};
      [].forEach.call(bar.querySelectorAll('button['+attr+']'),function(b){ out.push({v:b.getAttribute(attr),t:b.textContent.trim()}); if(b.classList.contains('is-on')) on=b.getAttribute(attr); });
      return {items:out,on:on}; }
    function post(){ try{ w.parent.postMessage({ t:'demo-bars', kind:read(kb,'data-kind'), role:read(rb,'data-role') },'*'); }catch(e){} }
    w.addEventListener('message',function(e){ var m=e.data; if(!m||!m.t) return;
      if(m.t==='demo-host-ok'){ if(kb) kb.style.display='none'; if(rb) rb.style.display='none'; }
      if(m.t==='demo-cmd'){
        /* 🔴 直接调 __setHost / __setMeetKind 只改了状态，条上的 is-on 和滑块不会动，
           父页读回来还是旧的。去点页面里那颗真按钮，让它自己那套逻辑跑完整。 */
        var bar = m.set==='kind' ? kb : rb, attr = m.set==='kind' ? 'data-kind' : 'data-role';
        var btn = bar && bar.querySelector('button['+attr+'="'+m.value+'"]');
        if(btn) btn.click();
        else if(m.set==='kind'&&w.__setMeetKind) w.__setMeetKind(m.value);
        else if(m.set==='role'&&w.__setHost) w.__setHost(m.value==='host');
        setTimeout(post,120); setTimeout(post,600);
      } });
    setTimeout(post,80); setTimeout(post,700); setInterval(post,2000);
  })();
  function boot(){ var h=w.location.hash.replace(/^#/,''); var m; d.documentElement.setAttribute('data-guide-boot',h||'none');
    if((m=/(?:^|&)guide=(\w+)/.exec(h))&&GUIDES[m[1]]){ var g=GUIDES[m[1]]; if(g.mode==='switch') mountSwitch(g); else mountTour(g); }
    if((m=/(?:^|&)loop=(\w+)/.exec(h))&&LOOPS[m[1]]) startLoop(m[1]);
    if(/(?:^|&)auto=1/.test(h)){ setTimeout(function(){ var b=d.getElementById('tgAuto'); if(b) b.click(); },800); } }
  if(d.readyState==='complete'||d.readyState==='interactive') setTimeout(boot,300); else w.addEventListener('DOMContentLoaded',function(){ setTimeout(boot,300); });
})();

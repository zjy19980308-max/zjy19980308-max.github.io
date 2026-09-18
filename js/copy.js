/* copy.js —— v7 全站文字。每个键对应页面一个位置，改这里即可。维护：网站交互调整 / 文案和图例优化。
   位置说明见 _规划.md「文字位」。中文一律全角标点。第一段定稿 2026-09-15，同日按 owner「项目外展示什么」重写（文案和图例优化）；第二、三段待搭好后补。 */
window.V7 = {
  name: '张竞元',
  role: 'AI 产品设计师',
  loader: { progress: '加载中' },                                        /* 原站「World building」，≤ 6 字 */
  nav: { links: [['作品', '#work'], ['关于', '#about'], ['实验场', 'lab.html']] },   /* owner 2026-09-16：线上 1.0 外链按钮已去掉，nav.ext 键一并清理 */
  header: {
    lines: ['AI 产品设计师，', '五年 B 端，', '需求到上线全程负责。'],                     /* 原站三行 24px，每行 ≤ 10 字；只立主张，不讲细节 */
    scroll: '向下滚动'                                                       /* 原站「Scroll down」 */
  },
  hero: {
    left: ['五年 B 端设计', '现在开始接触 AI 产品'],                              /* 原站「Raised in France / Designing worldwide」：B 端仍在做，AI 产品是加上的，不是转行 */
    right: [['目前在', '@中企云链', '把 AI 融进设计流程做产品']],   /* owner 2026-09-15：「曾在」那行不要 */  /* 原站「Currently pushing design boundaries at @… and in freelance」「Former : @…」 */
    titles: ['北京', 'AI 产品', '设计师'],                                    /* 大字 162px · 默认三行，每行 ≤ 5 字，连读「北京 AI 产品设计师」 */
    titlesAlt: ['五年', 'B 端', '全链路'],                             /* 大字 · 点击后换成的三行 */
    indication: '（点击切换）'                                        /* 原站「(Click to feed the bee)」，蜜蜂做好后再换 */
  },
  intro: {
    baseline: ['你好，', '我是张竞元，AI 产品设计师，在北京。'],                   /* 34px 两段，第二段 ≤ 30 字：一句说清角色 */
    texts: [
      '五年 B 端产品设计。团队没有产品岗，需求确认、方案、设计到上线由我负责。',   /* 第一段：干什么 + 怎么干，不放数字 */
      '下面是五个项目，企业协作平台的业务模块收在「其他项目」里，每一个都能点开看逐页说明。'   /* 第二段：引到项目；数字和判断细节留给项目页 */
    ],
    reel: '看演示'                                                           /* 原站「Watch Reel」；没有 reel，指向可点原型集锦 */
  },
  /* ═══ 首页第二段：精选项目 / 大字过渡 / 其他作品（结构照原站 Selected projects · 大字 · Archives）· 键名：网站交互调整 2026-09-15 · 初稿取自 v6 定稿，文案和图例优化可改值 ═══ */
  /* 配图建议（图与动效归网站交互调整，这里只标位置）：
     流水线 → 产线环图（v6 fig-a 构图）慢速转动，输入在左输出在右；
     NOTA → 发言到任务链（fig-e）七步逐个点亮；
     计划实施 → 用户旅程做成一条线缓慢流过（领到任务 → 推进 → 交付），闸门处停一下；
     AI Workflow Agent → 设计已完成，七个页面可直接操作；
     文档库 → 连接器示意：一篇文档向任务 / 会议 / 知识库三条线发散；
     协作平台 → 岗位 × 角色两条线叠在一个人身上（fig-h 风格双区）。 */
  work: {
    title: '项目',   /* owner：改名为「项目」 */                                                     /* 原站「Selected projects」 */
    /* 每条：name 名称 / type 类型（灰）/ date 时间 / team 两行 / roles 角色 / note 一个数（可空）/ link [文字, 地址] / shots 横滑图（assets/shots 文件名；空 = 制作中） */
    projects: [
      { key: 'flow', name: 'AI 设计流水线', type: '设计工程化', date: '2026', team: ['独立完成', '多个固定 AI 会话'], roles: ['规则制定', '验收'], note: '规矩由程序执行', link: ['查看项目', 'project.html?p=flow'], shots: ['nc-hifi', 'raw-components', 'nc-skeleton', 'raw-variables', 'nc-qa', 'raw-icons', 'raw-framework'] },
      { key: 'nota', name: 'NOTA 会议', type: 'AI 原生产品', date: '2026', team: ['独立完成', '开发方接手实现'], roles: ['需求到高保真', 'AI 功能范围'], note: '会议产出物直接成为任务', link: ['查看项目', 'project.html?p=nota'], shots: ['meet-00', 'meet-07', 'meet-03', 'meet-10', 'meet-08', 'meet-12'] },
      { key: 'plan', name: '计划实施', type: 'AI 自动任务', date: '2025 — 2026', team: ['独立完成', '开发方实现'], roles: ['全链路设计', 'AI 规则'], note: '每处改动对应真实反馈', link: ['查看项目', 'project.html?p=plan'], shots: ['task-v-list', 'task-v-board', 'task-templates', 'task-v-saveview', 'task-v-docs', 'task-v-chat', 'task-03', 'task-04'] },
      { key: 'agent', name: 'AI Workflow Agent', type: 'AI 工作流', date: '2026', team: ['独立完成', '自建产品方案'], roles: ['产品定义', '界面设计'], note: '上线前必过检查项', link: ['查看项目', 'project.html?p=agent'], shots: [] },
      { key: 'cses', name: '企业协作平台', type: '平台级 B 端', date: '2023 — 2025', team: ['团队协作', '我负责多个业务模块'], roles: ['模块设计', '规范统一'], note: '一套权限模型贯穿各模块', link: ['查看项目', 'project.html?p=cses'], shots: ['org-08', 'cs-hire-transcript', 'cs-pay-calc', 'cs-att-shift'] }   /* 交互会话换成实际存在的四张 */,
      { key: 'doc', name: 'CSES 文档库', type: 'B 端协同', date: '2025', team: ['独立完成', ''], roles: ['全链路设计'], note: '各模块的连接器', link: ['查看项目', 'project.html?p=doc'], shots: ['dl-s-home', 'dl-l-list', 'dl-x-space-grid', 'dl-s-perm', 'dl-14', 'dl-k-lib-home-3', 'dl-i-sync', 'dl-i-gantt', 'dl-i-mind-open', 'dl-n-graph'] }
    ],
    statement: ['UI 设计'],                                               /* owner 2026-09-15：上面大字 UI 设计 */
    statementSub: ['海报设计', '排版设计', '字体设计', 'Banner 设计'],        /* 下面一行：排版 / 字体 / 海报 / Logo（owner） */                /* 项目之间的大字过渡，逐字随滚动亮起；平实写做什么，不写宣言 */
    statementAfter: 3,                                                     /* 插在第几个项目之后 */
    /* 项目卡封面（owner：封面不用图，只放文字，干干净净）。每条：en 英文小标 / tags 右上标签 / points 两三条「— 要点」/ sub 标题下一句。初稿取自 v1 的项目卡文字，已去掉具体数字，文案会话可改值 */
    covers: {
      flow: { en: 'AI Design Pipeline', tags: ['B 端', '设计工程化'], points: ['需求进入，可交付页面产出；工序交给 AI', '写入时由程序校验，不合规的产物无法保存', '每道工序由固定的 AI 负责，返工回到原处'], sub: '规矩由程序执行的多 Agent 设计产线' },
      nota: { en: 'NOTA · AI Native Meeting', tags: ['B 端', 'AI 交互'], points: ['会议的产出物不是记录，是任务', 'AI 全程在场、按需介入，发言时不打断'], sub: '公司第一个 AI 原生产品的完整设计方案' },
      plan: { en: 'Plan & Execution', tags: ['B 端', 'AI 自动任务'], points: ['平台用户反馈最集中的模块', '核心问题是操作之后得不到确认'], sub: '任务从「谁来做」到「做到哪一步」的全流程' },
      agent: { en: 'AI Workflow Agent', tags: ['AI 工作流', '设计已完成'], points: ['流程上线前先过检查项，未通过不可上线', '运行全程留痕，异常转人工，出错可回退'], sub: '面向流程搭建者的 AI 工作流治理方案' },
      doc: { en: 'Document Library', tags: ['B 端', '内容协作'], points: ['各条业务线都会经过的协同中枢', '会议、任务、知识库的产出统一沉淀在文档中'], sub: '不是网盘，是各模块的连接器' },
      cses: { en: 'Enterprise Platform', tags: ['平台级', '多模块'], points: ['组织、岗位、角色、权限共用一套模型', '招聘、薪酬、考勤在同一套规范下展开'], sub: '企业协作平台里我负责的业务模块' }
    },
    /* 视觉设计：大字过渡下面，沿用之前的横滑拖动展示（owner：排版设计 · 字体设计 · 海报设计 · Logo 设计 摆在这里）。shots 放图文件路径（相对站点根目录），空 = 「制作中」占位 */
    visual: [
      { key: 'poster', name: '海报设计', en: 'Poster', note: '活动与品牌的视觉表达', shots: ['assets/visual/poster-01.jpg', 'assets/visual/poster-02.jpg', 'assets/visual/poster-03.jpg', 'assets/visual/poster-04.jpg', 'assets/visual/poster-05.jpg', 'assets/visual/poster-06.jpg', 'assets/visual/poster-07.jpg'] },
      { key: 'layout', name: '排版设计', en: 'Layout', note: '信息层级与留白的判断', shots: ['assets/visual/layout-01.jpg', 'assets/visual/layout-02.jpg', 'assets/visual/layout-03.jpg', 'assets/visual/layout-04.jpg', 'assets/visual/layout-05.jpg', 'assets/visual/layout-06.jpg'] },
      { key: 'type', name: '字体设计', en: 'Typography', note: '字形结构与字体气质', shots: ['assets/visual/type-01.jpg', 'assets/visual/type-02.jpg', 'assets/visual/type-03.jpg', 'assets/visual/type-04.jpg', 'assets/visual/type-05.jpg'] },
      { key: 'banner', name: 'Banner 设计', en: 'Banner', note: '活动与投放的视觉延展', shots: ['assets/visual/banner-01.jpg', 'assets/visual/banner-02.jpg', 'assets/visual/banner-03.jpg', 'assets/visual/banner-04.jpg'] }
    ],
    archivesTitle: '其他项目',   /* owner：最后叫「其他项目」 */                                             /* 原站「Archives」 */
    /* 每条：[名称, 类型, 做什么, 时间, 归属, 展开后的说明, 图（assets/shots 文件名）, 链接] */
    archives: [   /* owner 2026-09-15：其他作品只放项目——企业协作平台的五个业务模块，点「打开」进 cses 项目页对应章节；企业协作平台不再单列精选 */
      ["组织权限后台", "企业协作平台", "权限模型设计", "2023 — 2025", "中企云链", "组织、岗位、角色、权限与安全底座；岗位定位置、角色定权限，平台端与企业端共用一套模型。", "org-08", "project.html?p=cses#t-组织权限后台"],
      ["招聘", "企业协作平台", "招聘流程设计", "2023 — 2025", "中企云链", "覆盖职位、候选人、面试、Offer 与报表的完整链路；面试空间具备实时转写与 AI 标签。", "cs-hire-transcript", "project.html?p=cses#t-招聘"],
      ["薪酬管理", "企业协作平台", "核算流程设计", "2023 — 2025", "中企云链", "薪酬看板、分步核算与工资条发送；计算不交给 AI，AI 只在发放前提示异常。", "cs-pay-calc", "project.html?p=cses#t-薪酬管理"],
      ["考勤管理", "企业协作平台", "考勤流程设计", "2023 — 2025", "中企云链", "考勤概览、排班、分步考勤确认、存证与假期额度。", "cs-att-shift", "project.html?p=cses#t-考勤管理"],
      ["极氪 001 HMI", "车机中控", "车载界面设计", "2023", "北京艾阁广告有限公司", "中控首页把开关门、空调与音乐放在驾驶位可达区域；大按钮与滑块降低行驶中的误触，另有夜间模式。", "zeekr-hmi", "project.html?p=zeekr"]
    ]
  },
  /* ═══ 关于页 about.html · 七屏，键名按网站交互调整 2026-09-15 派单 · 定稿：文案和图例优化 ═══ */
  about: {
    header: {
      lines: ['张竞元，', 'AI 产品设计师，', '设计出身，五年 B 端。'],            /* 原站「Bringing depth and / personality to every / creation.」 */
      scroll: '向下滚动'
    },
    hero: {
      left: '设计出身',                                                   /* 原站「Raised in France」 */
      center: '下面是我的基本信息、个人优势和工作经历。',       /* 原站「More or less successful experiences…」≤ 40 字 */
      right: '做 B 端，也做 AI',                                            /* 原站「Working worldwide」 */
      titles: ['基本信息', '个人优势', '工作经历'],                                     /* 原站「WHO IS THIS / CURIOUS / FELLOW」，每行 ≤ 4 字 */
      titlesAlt: ['设计出身', '做产品', '也做 AI'],                          /* 原站「COLORBLIND / BUT SEES / VIBES」 */
      indication: '（点击切换）'                                            /* 原站「(Wanna know ?)」 */
    },
    intro: {
      place: '北京',                                                       /* 原站地点 */
      date: '2023 — 至今',                                                  /* 原站季节 */
      credit: '产品设计师',                                                  /* 原站拍摄地 */
      texts: [
        'AI 产品设计师 · 北京。五年 B 端设计与产品经验，产品与设计双角色。',
        "需求由业务负责人当面提出，没有现成文档，我负责确认使用者、场景与功能边界，形成可执行方案后再进入设计，从信息架构、原型到高保真与交互标注独立完成。CSES 企业协作平台用一套设计跑通组织权限、文档库、薪酬、考勤、招聘、人事六条业务线，岗位定组织位置、角色定权限集合，是从 0 到 1 建企业级协同办公生态的完整经验。"
      ]                                                                    /* owner 2026-09-15：用 v1「关于我」原文，不写俏皮话 */
    },
    statement: {
      lead: '个人优势',                                                    /* owner：用 v1 的个人优势；大字左对齐 */
      lines: ['五年 B 端', '全链路', 'AI 产线', '搭建者', 'AI 原生', '交互实践', '设计系统', '与工程化'],   /* 8 行 ≤ 6 字，对应五条优势的前四条 */
      logoAfter: [1, 3, 5],
      tail: '界面之外，视觉与排版基本功。'                                    /* 第五条优势 */
    },
    profile: {                                                             /* 新增块（2026-09-15）：v1「关于我」基本信息 + 项目类型，左对齐 */
      rows: [['城市', '北京', ''], ['学历', '本科 · 北京联合大学', ''], ['手机', '159\u00a00143\u00a01031', 'copy:15901431031'], ['邮箱', '983972532@qq.com', 'copy:983972532@qq.com'], ['微信', 'Ethen_Z', 'copy:Ethen_Z']],
      tagsTitle: '项目类型',
      tags: ['B 端中后台', 'AI 原生产品', '0→1 全链路', 'AI 产品边界判断', '设计工程化']
    },
    strengths: {                                                           /* 新增块（2026-09-15）：v1「个人优势」五条原文，标题 + 正文，左对齐排 */
      title: '个人优势',
      items: [["5 年 B 端全链路 · 产品与设计双角色", "需求由业务负责人当面提出，没有现成文档，我负责确认使用者、场景与功能边界，形成可执行方案后再进入设计，从信息架构、原型到高保真与交互标注独立完成。CSES 企业协作平台用一套设计跑通组织权限、文档库、薪酬、考勤、招聘、人事六条业务线，岗位定组织位置、角色定权限集合，是从 0 到 1 建企业级协同办公生态的完整经验。"], ["AI 设计流水线的搭建者", "把设计流程做成能反复跑、规矩由程序管的产线：五个环节各固定一个 AI 负责，三个门卫程序在文件写入那一刻校验，不合规的产物根本落不了盘；页面做完还有一个只看不改的 AI 出检查报告。规则与验收标准由我定义，代码由 AI 实现，我验收。产出的页面与检查项都可在作品中核对。"], ["AI 原生交互的实践者", "NOTA 是公司第一个 AI 原生产品，完整设计方案由我出。核心判断是会议的产出物不是记录，是任务；AI 全程在场，但人正在说话时它不插嘴。计划实施同理，全平台反馈里最大的一个集群落在这一块，用户的痛苦不在视觉层，在「我做的操作有没有真的生效」。这两个项目沉淀的是人机分工、任务编排与过程留痕的设计判断。"], ["设计系统与工程化", "组件注入前端平台直接调用，样式变量、图标、锁死框架块沉淀成同一套底座，保证多端一致。「优先复用组件」写成流水线里的强制规则，不合规的产出直接拦掉。"], ["界面之外的视觉与排版基本功", "具备字体设计、版式设计、IP 形象、海报与 Banner / H5 的完整能力。B 端界面的难点不在堆组件，在信息密度、层级与留白的判断。"]]
    },
    experience: {
      badge: '五年以上经验',
      title: '工作经历',
      /* 每条 [时间, 公司, 职位, 是否当前, 条目[[标题, 正文]…]] —— 条目是 v1 原文，页面按左对齐列表排；公司名按规矩打码 */
      items: [["2023.07 — 至今", "中企云链（北京）信息科技有限公司", "产品设计师 · PRODUCT DESIGNER", true, [["需求定义与方案设计", "善于从模糊需求出发，自主完成竞品调研、用户场景界定与功能边界梳理，输出可执行方案，确保设计输入质量。同时兼任产品与设计双角色，深度参与从需求分析到开发落地的全生命周期。"], ["B 端全链路产品设计", "从 0 到 1 主导搭建企业协同办公生态，独立完成业务规划至上线全流程，覆盖 AI 原生应用会议 NOTA、任务、表单、审批、文档、HR、薪酬、考勤等核心业务模块，并完成信息架构、原型、高保真及交互全流程设计。"], ["用户反馈驱动体验迭代", "建立系统化的用户反馈收集与分类机制，精准区分表层体验问题与深层结构性问题，通过优先级排序驱动版本迭代，形成「收集 — 诊断 — 落地 — 验证」的体验优化闭环。"], ["设计交付与效果追踪", "深度跟进开发实现过程，严格执行设计走查与还原度修正，确保上线质量；同时建立上线后使用数据回收机制，为后续迭代提供客观决策依据。"], ["设计系统与组件化建设", "主导企业级组件库搭建，借助 Claude 生成动态组件并接入物料平台，实现设计资产的高效复用与团队协作提效。"], ["AI 驱动的设计与工作流创新", "自研五环节 AI 流水线 + AI Agent 设计工作流，沉淀可复用组件，该流程已被开发团队采纳复用。"]]], ["2022.08 — 2023.05", "北京艾阁广告有限公司", "UX 设计师 · UX DESIGNER", false, [["数字媒体平台 UI 设计", "负责平台端界面设计，配合开发跟进还原度，确保上线与设计稿一致。"], ["跨角色协同与品牌一致性", "协同项目经理、视觉及开发团队，在需求、视觉与技术间建立对齐机制，确保交付符合客户诉求与品牌形象。"], ["多端设计实践", "并行负责后台管理系统与移动应用，针对 B 端高信息密度与操作效率、C 端交互流畅度与场景适配，分别制定差异化设计策略。"], ["产品调研与数据驱动", "参与产品调研与策略讨论，从数据变化反观体验问题，依据数据判定优化优先级。"], ["用户反馈驱动迭代", "收集客户与用户反馈，转化为设计优化方案，持续推动功能与体验迭代升级。"], ["设计规范共建", "参与设计规范制定与维护，统一组件用法、间距体系与视觉语言，降低协作风格偏差。"]]], ["2020.10 — 2022.06", "北京联合大学王晨设计工作室", "视觉设计师兼 UI 设计师 · VISUAL & UI", false, [["界面设计 + 功能把关", "设计阶段同步判断信息层级与操作路径合理性，确保功能可达。"], ["多品类视觉", "覆盖书籍排版、Logo、H5、IP 形象等平面与数字载体。"], ["调研定方向", "动手前调研同类产品与用户偏好，确定视觉策略。"], ["需求整理", "将口头需求梳理为明确的设计目标与交付清单。"], ["协作对齐", "多人分工项目中同步进度、收敛意见，确保方案一致。"], ["打磨到交付", "细化视觉 + 规划交互跳转，交付可开发的完整方案。"]]]]
    },
    recognition: {
      statement: '做过的项目',                                              /* 原站「Awards and recognition」 */
      /* owner 2026-09-16：不分组——这些都在同一个企业协作平台上，只有 NOTA 会议会独立打包。 */
      list: ['NOTA 会议', 'AI Workflow Agent（工作流与审批）', '计划实施', 'AI 自动任务',
             '文档库', '知识库', '组织权限', '招聘管理', '薪酬管理', '考勤管理']
    },
    footer: {
      titles: ['期待', '加入', '团队'],   /* owner：在找工作，不要「合作」 */                              /* 原站「LET'S CREATE / A REMARKABLE / JOURNEY」 */
      titlesAlt: ['北京', 'AI 产品', '设计师'],                                 /* 原站「YOUR GATEWAY / TO EXCITEMENT / STARTS HERE !」 */
      links: [['Ethen_Z', 'Ethen_Z', 'copy'], ['983972532@qq.com', '983972532@qq.com', 'copy'], ['159\u00a00143\u00a01031', '15901431031', 'copy']],   /* owner 2026-09-15：页脚直接显示真实微信 / 邮箱 / 手机，点击复制；不要作品集 v1 */
      copyright: '© 2026 张竞元'
    }
  },
  /* ═══ 实验场（结构照原站 /playground：黄底 #f6e016 · 首屏小字 + 三行大字点击换组 · 两两一行的作品流、中间插一段话 · 黄色页脚）· 文案和图例优化 2026-09-15 ═══
     owner：工作之外自己玩的设计尝试——用 Claude 搭网页、非工作的大胆海报等。原站的蜜蜂换成（抽象）小老虎，3D 建模归网站交互调整。
     items 每条：title 名称（≤ 12 字）/ type 类别 / date 年份（owner 供，空则不显示）/ src 图或视频（空 = 「未完待续」占位）。 */
  lab: {
    text: '工作之外的日常练习：海报、排版与字体，也用 Claude 做一些交互。',   /* owner 2026-09-17：往日常练习方向说；没有 3D，交互是用 Claude 做的 */   /* 原站首屏小字 */
    titles: ['欢迎来到', '我的设计', '实验场'],                               /* 原站「Welcome on / my design / playground」，每行 ≤ 4 字 */
    titlesAlt: ['不设限', '多尝试', '再往前'],                                 /* 原站「Always / Pushing / Further」 */
    indication: '（点击小老虎）',                                            /* 原站「(Click to feed the bee)」 */
    paragraph: '没有需求方，也不考虑落地，只看一个想法能推到多远。',            /* 原站作品流中间那段话，插在第四行 */
    /* 顺序 = js/lab.js 里 ROWS 的格位顺序，竖版作品要落在竖格、横版落在横格，别让 cover 裁掉。
       交互案例没有 src：它们在 lab.js 的 LIVE 里注册，格子里放示例视频，点开是真页面。 */
    items: [
      { title: '海报练习', type: '海报设计', date: '', src: 'assets/lab/practice-01.jpg' },
      { title: '版式练习', type: '排版设计', date: '', src: 'assets/visual/layout-02.jpg' },
      { title: '弧形画廊', type: '交互案例', date: '', src: '' },
      { title: '字体实验', type: '字体设计', date: '', src: 'assets/visual/type-01.jpg' },
      { title: '悬停菜单', type: '交互案例', date: '', src: '' },
      { title: '网站交互尝试', type: '网页搭建', date: '', src: '' },   /* 这个站本身：用 Claude 搭出来的，转场、滚动、3D 都在里面 */
      { title: '球面菜单', type: '交互案例', date: '', src: '' },
      { title: '弹性滑块', type: '交互案例', date: '', src: '' },
      { title: '弹跳卡片', type: '交互案例', date: '', src: '' },
      { title: '持续更新', type: '感受设计', date: '', src: '' }   /* owner 2026-09-17：这一格作为「未完待续」位 */
    ]
  }
};

/* projects.js —— v7 项目页内容，由 tools/extract_projects.py 从 v1.1 作品集本稿.html 抽出（2026-09-15），之后由「文案和图例优化」直接改值。
   键名与块类型归「网站交互调整」（见 js/project.js 顶部注释）。中文全角标点；按 owner 规矩：正规专业、不摆数字、高度提炼、公司名用真名。 */
window.V7P = {
 "flow": {
  "kicker": "项目一 · CASE STUDY",
  "title": "AI 设计流水线",
  "year": "2026 — 至今",
  "status": "持续迭代中",
  "blocks": [
   {
    "t": "section",
    "title": "项目介绍",
    "en": "OVERVIEW"
   },
   {
    "t": "intro",
    "lead": "把「需求到可交互页面」拆成固定工序，每道工序由固定的 AI 负责，设计规范由程序在写入时校验。规则与验收标准由我定义，代码由 AI 实现，我负责验收。",
    "rows": [
     [
      "项目用户",
      "设计师 · 产品经理 · 内部工具搭建者"
     ],
     [
      "使用工具",
      "Claude · Figma"
     ],
     [
      "我的角色",
      "独立负责 · 规则制定与验收"
     ],
     [
      "产出",
      "可交互页面 · 组件库 · 设计系统资产"
     ]
    ]
   },
   {
    "t": "fig",
    "src": "assets/fig/A-pipeline-loop.svg",
    "cap": "流水线总图 · 需求进入，可交互页面产出；工序在环内，校验在环上"
   },
   {
    "t": "sub",
    "num": "01",
    "title": "设计策略",
    "en": "STRATEGY"
   },
   {
    "t": "caps",
    "items": [
     [
      "01",
      "规范前置到写入环节",
      "颜色只取样式变量，图标只取字体图标，外框只取锁定框架。三类规则由门卫程序在文件写入时校验，不依赖 AI 自觉遵守。"
     ],
     [
      "02",
      "一道工序对应一个 AI",
      "需求、骨架、高保真、交互、检查各由一个长期会话负责，返工回到原会话，无需重复交代背景；检查环节只出报告，不改产物。"
     ],
     [
      "03",
      "按任务规模分流",
      "单页走快速通道，整套系统逐页推进、逐页验收，小幅调整直接进入高保真并自动留痕。结构方案须多选一，由我决定。"
     ],
     [
      "04",
      "问题沉淀为检查项",
      "验收中发现的每处疏漏都转为回归检查项，规则变更后全量重跑；通过率如实记录，不挑选口径。"
     ]
    ]
   },
   {
    "t": "fig",
    "src": "assets/fig/B-evolution.svg",
    "cap": "架构演进 · 三次调整，一次否决：放弃共享记忆，改为共享文件、隔离上下文"
   },
   {
    "t": "sub",
    "num": "02",
    "title": "设计系统资产",
    "en": "FOUNDATION"
   },
   {
    "t": "windows",
    "items": [
     [
      "FOUNDATION · 01",
      "样式变量",
      "规定系统可用的颜色、字号梯度、间距、圆角与阴影；分默认层与主题层，页面挂上主题标识即整体切换配色。",
      "raw-variables.html"
     ],
     [
      "FOUNDATION · 02",
      "组件库",
      "按钮、输入框、表格、抽屉、弹窗等组件，各由规则说明、样式、结构与行为构成，调用前必须先读规则说明。",
      "raw-components.html"
     ],
     [
      "FOUNDATION · 03",
      "图标库",
      "面性图标来自业务总库，线性图标来自 Stratis，统一打包为字体图标；索引自动生成，使用前校验能否渲染。",
      "raw-icons.html"
     ],
     [
      "FOUNDATION · 04",
      "锁定框架",
      "导航栏、侧边栏、内容头、筛选栏、标签栏、弹窗、抽屉等布局块统一锁定，页面外层不允许自行拼装。",
      "raw-framework.html"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "03",
    "title": "执行流程",
    "en": "EXECUTION FLOW"
   },
   {
    "t": "modes",
    "items": [
     {
      "label": "单页面",
      "en": "ONE PAGE",
      "lead": "适用于一张表单、一个列表或一个弹窗这类独立单元，当天交付。以通知中心为例，每一步的原件都可打开。",
      "steps": [
       {
        "n": "1",
        "title": "明确需求",
        "text": "明确为什么做、给谁用、做什么，一次性确认完需求，由主控会话直接调度。",
        "live": [
         [
          "需求文档 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/notification-center-20260907/requirement.html"
         ]
        ]
       },
       {
        "n": "2",
        "title": "结构骨架",
        "text": "用灰色占位块搭建结构，不带业务色彩，必须基于统一布局框架。",
        "live": [
         [
          "骨架流程 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/notification-center-20260907/skeleton-flow.html"
         ],
         [
          "骨架本体 · 打开页面 →",
          "https://zjy19980308-max.github.io/flow/notification-center-20260907/skeleton.html"
         ]
        ]
       },
       {
        "n": "3",
        "title": "高保真实现",
        "text": "先核对所需组件、颜色与图标是否齐备，缺失的先补充，再替换为真实组件。",
        "live": [
         [
          "高保真过程 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/notification-center-20260907/hifi-flow.html"
         ],
         [
          "高保真本体 · 打开页面 →",
          "https://zjy19980308-max.github.io/flow/notification-center-20260907/hifi.html"
         ]
        ]
       },
       {
        "n": "4",
        "title": "交互实现",
        "text": "每个可点击元素都有响应，没有无效按钮。",
        "live": [
         [
          "交互过程 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/notification-center-20260907/interaction-flow.html"
         ],
         [
          "交互本体 · 打开页面 →",
          "https://zjy19980308-max.github.io/flow/notification-center-20260907/interaction.html"
         ]
        ]
       },
       {
        "n": "5",
        "title": "检查与验收",
        "text": "每一步须经机器检查与本人签字两道确认，验收方独立于制作方，只出报告不改产物。",
        "live": [
         [
          "验收报告 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/notification-center-20260907/qa.html"
         ]
        ]
       }
      ]
     },
     {
      "label": "多页面",
      "en": "MULTI PAGE",
      "lead": "适用于一整套系统，例如包含列表、详情、配置、通知等页面的后台平台，逐页推进、逐页验收。以报销申请为例。",
      "steps": [
       {
        "n": "1",
        "title": "需求问答",
        "text": "逐问确认使用者、高频场景与页面拆分，产出需求文档与页面清单；未完成问答不能进入下一步。",
        "live": [
         [
          "问答原件 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/expense-claim-20260903/q-bank.html"
         ]
        ]
       },
       {
        "n": "2",
        "title": "逐页需求分析",
        "text": "每一页单独产出需求文档与用户用例，并拆清模块、字段与每条信息的用途。",
        "live": [
         [
          "需求原件 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/expense-claim-20260903/md.html"
         ]
        ]
       },
       {
        "n": "3",
        "title": "结构骨架 · 多方案",
        "text": "用灰块搭建多个结构方案，每个方案须有独特价值；方案取舍由我决定。",
        "live": [
         [
          "骨架流程 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/expense-claim-20260903/skeleton.html"
         ],
         [
          "骨架本体 · 打开页面 →",
          "https://zjy19980308-max.github.io/flow/expense-claim-20260903/skeleton-my-claims.html"
         ]
        ]
       },
       {
        "n": "4",
        "title": "高保真实现",
        "text": "先补齐所需组件、颜色与图标，再替换为真实组件；色值、图标与间距在写入时校验。",
        "live": [
         [
          "高保真过程 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/expense-claim-20260903/2-real.html"
         ]
        ]
       },
       {
        "n": "5",
        "title": "交互实现",
        "text": "没有无效按钮；尚未建立的下级页面先接占位并登记，由主控会话统一补建。",
        "live": [
         [
          "交互原件 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/expense-claim-20260903/interaction.html"
         ]
        ]
       },
       {
        "n": "6",
        "title": "逐页验收",
        "text": "逐页推进、逐页验收，同一环节由同一个 AI 负责到底。",
        "live": [
         [
          "验收原件 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/expense-claim-20260903/self-check.html"
         ]
        ]
       }
      ]
     },
     {
      "label": "改动与微调",
      "en": "EDIT & TWEAK",
      "lead": "并非所有任务都需要走完整流程。以下两类不出骨架、不走完整阶段，但都保留记录，便于追溯。",
      "steps": [
       {
        "n": "1",
        "title": "微小单元 · 直接进入高保真",
        "text": "确认提示框这类结构简单的元素，经我确认后直接进入高保真；系统自动留痕，产物同样经过校验。"
       },
       {
        "n": "2",
        "title": "改动型 · 在现有页面上调整",
        "text": "调整样式、文案或数据，页面结构不变，由专职修改角色处理，不重走完整流程。",
        "live": [
         [
          "成果文件夹改动案例 · 查看过程 →",
          "https://zjy19980308-max.github.io/flow/single-page-lab/lab.html"
         ]
        ]
       }
      ]
     }
    ]
   }
  ]
 },
 "nota": {
  "kicker": "项目二 · CASE STUDY",
  "title": "NOTA 会议",
  "year": "2026",
  "status": "AI 原生会议 · 设计完成，待开发",
  "blocks": [
   {
    "t": "section",
    "title": "项目介绍",
    "en": "OVERVIEW"
   },
   {
    "t": "intro",
    "lead": "公司第一个 AI 原生产品。会议的产出物不是纪要而是任务：AI 全程在场、按需介入，产物在会中生成、会后由本人确认。AI 的功能范围由我界定。",
    "rows": [
     [
      "我的角色",
      "独立完成 · 需求到高保真"
     ],
     [
      "目标用户",
      "全体员工"
     ],
     [
      "设计方向",
      "产出物前置 · 会中协同 · AI 按需介入"
     ],
     [
      "交付",
      "高保真设计稿 · 可交互原型"
     ]
    ]
   },
   {
    "t": "fig",
    "src": "assets/fig/E-speech-to-task.svg",
    "cap": "发言到任务 · 一条链路不出平台，本人确认后生效"
   },
   {
    "t": "sub",
    "num": "01",
    "title": "设计策略",
    "en": "STRATEGY"
   },
   {
    "t": "caps",
    "items": [
     [
      "01",
      "产出物前置到会中",
      "转写识别行动项，按岗位、部门与近期任务判定归属，生成任务框架；本人确认后进入任务列表，会后无需二次录入。"
     ],
     [
      "02",
      "AI 按需召唤，不主动介入",
      "AI 不常驻界面，被召唤后以成员位进入；提示悬浮显示、不遮挡他人，有人发言时不打断。这一边界由我界定。"
     ],
     [
      "03",
      "把屏幕空间让给协同",
      "收起使用率低的详情、成员与聊天区域，界面划分为人与文件、实时转写、个人工作区三块；底部按钮按功能分区，流程动作仅在需要时出现。"
     ]
    ]
   },
   {
    "t": "fig",
    "src": "assets/fig/D-nota-timing.svg",
    "cap": "竞品对比 · AI 介入的时机与产物去向"
   },
   {
    "t": "fig",
    "src": "assets/fig/F-space.svg",
    "cap": "空间重分配 · 三块区域各由一个 agent 负责"
   },
   {
    "t": "sub",
    "num": "02",
    "title": "逐屏讲解",
    "en": "PROTOTYPES"
   },
   {
    "t": "page",
    "shots": [
     [
      "assets/meeting/old-main.png",
      "改版前 · 主讲大屏、右侧信息列、按钮全部外露"
     ]
    ],
    "live": [
     [
      "主视图 · 跟随引导体验 →",
      "https://zjy19980308-max.github.io/flow/meeting-20260813/page.html"
     ]
    ],
    "tags": [
     "BEFORE · 改版前",
     "AFTER · NOTA 主视图"
    ],
    "n": "1",
    "title": "主视图",
    "sub": "人物等大，信息收起，按钮分区"
   },
   {
    "t": "page",
    "n": "2",
    "title": "AI 召唤",
    "sub": "不常驻界面，按需以成员位进入",
    "live": [
     [
      "AI 召唤 · 跟随引导体验 →",
      "https://zjy19980308-max.github.io/flow/meeting-20260813/page.html"
     ]
    ]
   },
   {
    "t": "page",
    "n": "3",
    "title": "三列协同 · 转写生成任务",
    "sub": "人、转写、任务各占一列，发言直接生成任务",
    "live": [
     [
      "任务工作项 · 跟随引导体验 →",
      "https://zjy19980308-max.github.io/flow/meeting-dev-20260907/index.html"
     ],
     [
      "协作文档 · 跟随引导体验 →",
      "https://zjy19980308-max.github.io/flow/meeting-dev-20260907/index.html"
     ]
    ]
   },
   {
    "t": "page",
    "n": "4",
    "title": "转写列 · 三种形态",
    "sub": "独占一列、并列、收起",
    "live": [
     [
      "三种形态 · 点击切换 →",
      "https://zjy19980308-max.github.io/flow/meeting-20260813/page.html"
     ]
    ]
   },
   {
    "t": "page",
    "n": "5",
    "title": "KR 填写与投票",
    "sub": "由整块弹窗改为侧列，流程结束后按钮自动收起",
    "shots": [
     [
      "assets/meeting/kr-old/krold-1-fill.webp",
      "改版前 · 填写（整块弹窗盖住会议）"
     ],
     [
      "assets/meeting/kr-old/krold-2-vote.webp",
      "改版前 · 投票（同一块弹窗，左选右已选）"
     ],
     [
      "assets/meeting/kr-old/krold-3-result.webp",
      "改版前 · 结果与评语（仍在同一块弹窗里）"
     ],
     [
      "assets/meeting/kr-old/krold-4-float.webp",
      "改版前 · 填完之后（横幅与浮窗常驻不走）"
     ]
    ],
    "live": [
     [
      "改版后 · 跟随引导体验 →",
      "https://zjy19980308-max.github.io/flow/meeting-dev-20260907/index.html"
     ]
    ],
    "tags": [
     "BEFORE · 改版前"
    ]
   },
   {
    "t": "page",
    "live": [
     [
      "自定义空间 · 跟随引导体验 →",
      "https://zjy19980308-max.github.io/flow/meeting-dev-20260907/index.html"
     ]
    ],
    "n": "6",
    "title": "自定义空间",
    "sub": "一列叠放多个面板，切换不丢失内容"
   },
   {
    "t": "sub",
    "num": "03",
    "title": "剩余页面",
    "en": "MORE SCREENS"
   },
   {
    "t": "gallery",
    "shots": [
     [
      "assets/shots/meet-00.webp",
      "桌面端主视图"
     ],
     [
      "assets/shots/meet-01.webp",
      "主讲视图"
     ],
     [
      "assets/shots/meet-02.webp",
      "单人全屏"
     ],
     [
      "assets/shots/meet-03.webp",
      "AI助理召唤"
     ],
     [
      "assets/shots/meet-04.webp",
      "成员信息展开"
     ],
     [
      "assets/shots/meet-05.webp",
      "消息弹窗 · 水滴悬浮"
     ],
     [
      "assets/shots/meet-07.webp",
      "实时转写独占列 · A"
     ],
     [
      "assets/shots/meet-08.webp",
      "实时转写独占列 · B"
     ],
     [
      "assets/shots/meet-09.webp",
      "实时转写独占列 · C"
     ],
     [
      "assets/shots/meet-10.webp",
      "KR拓展空间展开"
     ],
     [
      "assets/shots/meet-11.webp",
      "协同画板自由定位"
     ],
     [
      "assets/shots/meet-12.webp",
      "KR填写 · 开启"
     ],
     [
      "assets/shots/meet-13.webp",
      "KR填写 · 完成A"
     ],
     [
      "assets/shots/meet-14.webp",
      "KR填写 · 完成B"
     ],
     [
      "assets/shots/meet-15.webp",
      "投票 · 开启"
     ],
     [
      "assets/shots/meet-17.webp",
      "投票 · 完成"
     ]
    ],
    "lead": "主视图与主讲、单人全屏、AI 助理召唤、成员面板、消息提醒、转写列各形态、KR 拓展与填写、协同画板、投票开启与完成。"
   }
  ]
 },
 "plan": {
  "kicker": "项目三 · CASE STUDY",
  "title": "计划实施",
  "year": "2025 — 2026",
  "status": "AI 自动任务 · 设计完成，规则内部测试中",
  "blocks": [
   {
    "t": "section",
    "title": "项目介绍",
    "en": "OVERVIEW"
   },
   {
    "t": "intro",
    "lead": "全平台反馈中最大的一个集群落在任务模块，指向同一个问题：操作之后得不到确认。任务模块收拢文档、群聊与会议；AI 进入执行链路，但每一步产物都经人工确认。",
    "rows": [
     [
      "我的角色",
      "全链路独立负责 · AI 规则制定"
     ],
     [
      "目标用户",
      "任务参与者 · 项目负责人"
     ],
     [
      "设计依据",
      "平台真实用户反馈"
     ],
     [
      "交付",
      "高保真设计稿"
     ]
    ]
   },
   {
    "t": "fig",
    "src": "assets/fig/I-feedback-map.svg",
    "cap": "反馈分布 · 最大集群集中在任务、甘特、依赖与视图"
   },
   {
    "t": "sub",
    "num": "01",
    "title": "设计策略",
    "en": "STRATEGY"
   },
   {
    "t": "caps",
    "items": [
     [
      "01",
      "结构由创建者定，视图由使用者选",
      "新建工作项时选择行业模版与默认视图，结构一次配置完成；使用者在多种视图间切换、多级分组，筛选结果可另存为个人视图。"
     ],
     [
      "02",
      "AI 进入执行链路，产物经人工确认",
      "运维异常由 AI 生成待确认任务，人工确认后才进入任务池；执行过程以事件流呈现，每一步产物可查验，AI 不越过人工。"
     ],
     [
      "03",
      "以可逆性划定 AI 边界",
      "只读类诊断全自动执行，修改代码、创建任务、关闭误报等不可逆操作必须人工确认；AI 的完成状态与业务的完成状态分开管理。"
     ]
    ]
   },
   {
    "t": "fig",
    "src": "assets/fig/G-auto-task-gate.svg",
    "cap": "自动任务闸门 · AI 生成、人工放行，每次产物经人查验"
   },
   {
    "t": "fig",
    "src": "assets/fig/H-reversibility.svg",
    "cap": "可逆性分区 · 可逆操作自动执行，不可逆操作必须人工确认"
   },
   {
    "t": "sub",
    "num": "02",
    "title": "逐页讲解",
    "en": "PAGES"
   },
   {
    "t": "page",
    "n": "1",
    "title": "工作项首页 · 多视图",
    "sub": "列表、看板、甘特图、日历、工时在同一工作项内切换",
    "shots": [
     [
      "assets/shots/task-v-list.webp",
      "工作项首页 · 列表视图"
     ],
     [
      "assets/shots/task-v-board.webp",
      "看板视图 · 按状态分列"
     ],
     [
      "assets/shots/task-v-gantt.webp",
      "甘特图 · 时间条"
     ],
     [
      "assets/shots/task-v-gantt2.webp",
      "甘特图 · 展开左侧字段"
     ],
     [
      "assets/shots/task-v-cal.webp",
      "日历视图 · 按月"
     ],
     [
      "assets/shots/task-v-hours.webp",
      "工时视图 · 按成员"
     ]
    ]
   },
   {
    "t": "page",
    "n": "2",
    "title": "自定义视图",
    "sub": "按条件筛选后另存为个人视图",
    "shots": [
     [
      "assets/shots/task-v-saveview.webp",
      "自定义视图 · 按条件筛选后另存为个人视图"
     ]
    ]
   },
   {
    "t": "page",
    "n": "3",
    "title": "新建工作项 · 选择模版",
    "sub": "选择所属空间、行业模版与默认视图",
    "shots": [
     [
      "assets/shots/task-newitem.webp",
      "新建工作项 · 选择空间与模版"
     ],
     [
      "assets/shots/task-templates.webp",
      "选择工作项模版 · 行业模版"
     ]
    ]
   },
   {
    "t": "page",
    "n": "4",
    "title": "工作项 · 卡片视图",
    "sub": "空间内的工作项以卡片形式平铺",
    "shots": [
     [
      "assets/shots/task-10.webp",
      "工作项 · 卡片视图 · 空间内的工作项以卡片形式平铺"
     ]
    ]
   },
   {
    "t": "page",
    "n": "5",
    "title": "工作项 · 文档",
    "sub": "相关文档拖入工作项，与任务集中管理",
    "shots": [
     [
      "assets/shots/task-v-docs.webp",
      "工作项 · 文档 · 相关文档拖入工作项，与任务集中管理"
     ]
    ]
   },
   {
    "t": "page",
    "n": "6",
    "title": "工作项 · 群聊与 AI 助手",
    "sub": "工作项自带群聊，AI 助手可添加文档、发起会议、导入成员",
    "shots": [
     [
      "assets/shots/task-v-chat.webp",
      "工作项 · 群聊与 AI 助手 · 工作项自带群聊，AI 助手可添加文档、发起会议、导入成员"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "03",
    "title": "剩余页面",
    "en": "MORE SCREENS"
   },
   {
    "t": "gallery",
    "shots": [
     [
      "assets/shots/task-05.webp",
      "空间权限 · 角色矩阵"
     ],
     [
      "assets/shots/task-06.webp",
      "工作项空态 · 有工作项没任务"
     ],
     [
      "assets/shots/task-08.webp",
      "新建空间 · 个人 / 内部 / 外部"
     ],
     [
      "assets/shots/task-09.webp",
      "首次进入 · 按组织架构推荐空间"
     ],
     [
      "assets/shots/task-basic.webp",
      "空间设置 · 基本信息"
     ],
     [
      "assets/shots/task-folders.webp",
      "空间设置 · 文件夹配置"
     ],
     [
      "assets/shots/task-newtask.webp",
      "新建任务 · 抽屉"
     ],
     [
      "assets/shots/task-01.webp",
      "我的任务 · 待办列表"
     ],
     [
      "assets/shots/task-03.webp",
      "任务详情 · 聊天 / 文件 / 子任务 / 检视点"
     ],
     [
      "assets/shots/task-04.webp",
      "工作项聊天 · AI agent 助手"
     ],
     [
      "assets/shots/task-07.webp",
      "空间成员 · 邀请协作者"
     ],
     [
      "assets/shots/task-11.webp",
      "预览工作项模版"
     ]
    ],
    "lead": "待办列表、任务详情、工作项群聊、空间设置与成员、空态、新建空间与任务、模版预览。"
   }
  ]
 },
 "agent": {
  "kicker": "项目四 · CASE STUDY",
  "title": "AI Workflow Agent",
  "year": "2026",
  "status": "自建产品方案 · 页面可直接操作",
  "blocks": [
   {
    "t": "section",
    "title": "项目介绍",
    "en": "OVERVIEW"
   },
   {
    "t": "intro",
    "lead": "面向流程搭建者的 AI 工作流治理方案。生成流程只是起点，本项目关注流程上线之后：规则由程序执行，上线前经过检查，运行中每一步产物经人工确认，出错可发现、可拦截、可回退。",
    "rows": [
     [
      "我的角色",
      "独立完成 · 产品定义到界面设计"
     ],
     [
      "目标用户",
      "企业流程管理员 · 业务负责人"
     ],
     [
      "核心问题",
      "上线前校验 · 运行中确认 · 出错可回退"
     ],
     [
      "交付",
      "可直接操作的页面 · 演示数据"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "01",
    "title": "为什么做",
    "en": "WHY"
   },
   {
    "t": "caps",
    "items": [
     [
      "01",
      "生成之后的风险更高",
      "AI 搭建流程的门槛在降低，但流程上线后一旦出错，影响的是审批放行、单据流转与通知发送，代价远高于搭建阶段。"
     ],
     [
      "02",
      "搭建者难以逐项审查",
      "流程管理员多为非技术岗位，难以逐个节点审查 AI 生成的规则与分支，需要系统在上线前替他们把关。"
     ],
     [
      "03",
      "已有方法可以迁移",
      "设计流水线中的门卫校验与回归检查项、计划实施中的可逆性分级，都可以迁移到工作流的上线与运行环节。"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "02",
    "title": "目标用户",
    "en": "PERSONA"
   },
   {
    "t": "note",
    "label": "PERSONA",
    "title": "流程管理员",
    "body": [
     "行政、财务或人事岗，负责把公司制度落到系统流程里。熟悉业务规则，不写代码，也没有测试环境。",
     "典型做法是照着制度改一版流程直接发布，再靠同事反馈发现问题——最担心的不是搭不出来，而是上线后出错没人发现。"
    ]
   },
   {
    "t": "note",
    "label": "PERSONA",
    "title": "业务负责人",
    "body": [
     "分管一条业务线，流程出问题时要承担后果，但平时不会逐条看流程配置。",
     "只关心两件事：这次改动会影响谁，出事之后能不能收回来。"
    ]
   },
   {
    "t": "section",
    "title": "竞品分析",
    "en": "TEARDOWN"
   },
   {
    "t": "sub",
    "num": "01",
    "title": "调研方法",
    "en": "METHOD"
   },
   {
    "t": "lead",
    "text": "三条线同时看：自己在企业协作平台里做过的审批、报销、招聘、薪酬等流程模块；主流工作流与低代码产品的实际试用；以及公开可查的流程事故复盘。统一按四个维度比对：上线前是否校验、变更是否可审阅、运行中是否可确认、出错后是否可回退。"
   },
   {
    "t": "sub",
    "num": "02",
    "title": "现场观察",
    "en": "FINDINGS"
   },
   {
    "t": "caps",
    "items": [
     [
      "01",
      "制度靠人转述",
      "制度写在文件里，流程写在系统里，中间靠管理员口头翻译。翻译得对不对，没有第二个人复核。"
     ],
     [
      "02",
      "没有测试环境",
      "业务岗搭完流程直接发布，用真实单据试错，问题往往由下游同事先发现。"
     ],
     [
      "03",
      "出错才回头看",
      "多数平台把日志做得很全，但都在事后；没有一处在发布之前拦住明显有问题的流程。"
     ]
    ]
   },
   {
    "t": "timeline",
    "lead": "现在一条新规则从制定到出事，大致是这么走的。",
    "items": [
     [
      "写制度",
      "行政或财务出一份文件",
      0
     ],
     [
      "人转述",
      "管理员照着文件理解一遍",
      0
     ],
     [
      "直接发布",
      "没有检查环节，发了就生效",
      1
     ],
     [
      "同事发现问题",
      "单据停在半路，或者款已经付出去了",
      1
     ]
    ]
   },
   {
    "t": "sub",
    "num": "03",
    "title": "竞品对照",
    "en": "TEARDOWN"
   },
   {
    "t": "lead",
    "text": "把五类产品放在同一张表里比对。生成能力这一层已经很拥挤，差距集中在后面三列；表末「本项目」一行是本方案设定的目标，不是实测结论。"
   },
   {
    "t": "table",
    "head": [
     "产品类型",
     "上线前校验",
     "变更审阅",
     "运行中确认",
     "出错回退"
    ],
    "rows": [
     [
      "表单型低代码",
      "无，发布即生效",
      "无，改完立刻对所有人生效",
      "无，按配置自动执行",
      "弱，只能改回配置，已发起的单据不管"
     ],
     [
      "即时通讯内置审批",
      "无",
      "无",
      "部分，人审批本身是确认，但自动动作不可控",
      "无"
     ],
     [
      "流程自动化工具",
      "部分，有测试运行",
      "部分，有版本与环境，面向技术岗",
      "无，失败靠重试，不区分动作能否撤销",
      "部分，能重跑，不能撤销已发生的动作"
     ],
     [
      "工程级 BPM",
      "部分，靠部署校验与自写用例",
      "部分，有版本与实例迁移",
      "部分，人工任务需自行开发",
      "强，但需要工程能力"
     ],
     [
      "AI 流程编排",
      "无",
      "无",
      "无，Agent 直接执行",
      "无"
     ],
     [
      "本项目",
      "强制，阻断项未通过不予提交",
      "必经，差异、影响与来源逐条呈现",
      "分级，只读自动、可撤销留入口、不可逆必须人确认",
      "三步回退，原因转为新的检查项"
     ]
    ]
   },
   {
    "t": "act",
    "text": "结论：会不会生成已经不是差距，差距在生成之后没人管。"
   },
   {
    "t": "scatter",
    "lead": "把五类产品放到两根轴上：横轴是「把一句话变成流程」的能力，纵轴是「上线之后管得住」的能力。",
    "axis": [
     "生成能力",
     "上线之后的治理能力"
    ],
    "zone": [
     52,
     4,
     100,
     40
    ],
    "zoneLabel": "生成能力强，上线之后基本不管",
    "points": [
     {
      "t": "表单型低代码",
      "x": 58,
      "y": 14
     },
     {
      "t": "即时通讯内置审批",
      "x": 46,
      "y": 10,
      "side": "l"
     },
     {
      "t": "流程自动化工具",
      "x": 76,
      "y": 30
     },
     {
      "t": "工程级 BPM",
      "x": 64,
      "y": 62,
      "side": "l"
     },
     {
      "t": "AI 流程编排",
      "x": 92,
      "y": 8,
      "side": "l"
     },
     {
      "t": "本项目",
      "x": 84,
      "y": 86,
      "me": 1,
      "side": "l"
     }
    ],
    "note": "工程级 BPM 的治理能力不弱，但要有工程团队才用得起来；同时靠右上的位置，是本方案设定的目标。"
   },
   {
    "t": "sub",
    "num": "04",
    "title": "定位",
    "en": "POSITIONING"
   },
   {
    "t": "lead",
    "text": "不重复「生成得对不对」这一层，专注「上线之后会不会出事」：把校验、确认与回退做成工作流的默认能力，而不是事后补救。"
   },
   {
    "t": "divide",
    "lead": "这条线左右两边，是两种完全不同的问题。",
    "mid": "分界",
    "left": {
     "title": "生成得对不对",
     "items": [
      "把一句话变成流程图",
      "节点识别得准不准",
      "字段和条件有没有漏",
      "模板够不够多"
     ]
    },
    "right": {
     "title": "上线之后会不会出事",
     "items": [
      "发布之前有没有人检查过",
      "改了什么、影响谁，说不说得清",
      "跑起来的时候谁能喊停",
      "出了事退不退得回去",
      "这次的教训会不会变成下次的规矩"
     ]
    }
   },
   {
    "t": "section",
    "title": "AI 的边界",
    "en": "BOUNDARY"
   },
   {
    "t": "sub",
    "num": "01",
    "title": "为什么用 AI",
    "en": "WHY AI"
   },
   {
    "t": "lead",
    "text": "引入 AI 不是为了「能生成」。真正费时的是把制度翻译成流程：一句「超过十万要总监签字」落到系统里，是条件、分档、审批人、代理人和超时五件事。AI 负责翻译和提醒，判断权和执行权留给人。"
   },
   {
    "t": "explode",
    "lead": "真正费时间的不是画流程图，是把一句制度翻译成系统能执行的规则。",
    "source": "超过十万要总监签字",
    "items": [
     [
      "判断条件",
      "按哪个字段判、含不含税"
     ],
     [
      "金额分档",
      "十万是上一档还是下一档"
     ],
     [
      "审批人",
      "总监是哪个岗位、跨部门算谁"
     ],
     [
      "代理人",
      "他出差这几天谁来批"
     ],
     [
      "超时",
      "停多久算超时、超了转给谁"
     ]
    ],
    "note": "一句话背后是五件要定的事。Agent 省掉的是这道翻译，定还是人来定。"
   },
   {
    "t": "sub",
    "num": "02",
    "title": "三档权限",
    "en": "LEVELS"
   },
   {
    "t": "caps",
    "items": [
     [
      "A",
      "只读，可自动",
      "查询、匹配、校验、起草。做错了重做一次即可，AI 自动执行，事后可查。"
     ],
     [
      "B",
      "可撤销，留入口",
      "生成指令、发送通知。AI 可以执行，但必须留撤销入口并记录执行者。"
     ],
     [
      "C",
      "不可逆，必须人确认",
      "付款、对外发送、删除数据、变更权限。AI 只能准备，确认动作只能由人完成。"
     ]
    ]
   },
   {
    "t": "axis",
    "lead": "同一个 Agent，在不同动作上权限不同。分档不是按「难不难」，是按「错了能不能收回来」。",
    "ends": [
     "AI 自动执行",
     "必须人确认"
    ],
    "segs": [
     {
      "k": "a",
      "name": "只读",
      "note": "只查询、不改变任何东西。错了重跑一次即可，Agent 全自动。",
      "acts": [
       "查供应商",
       "三单匹配",
       "字段校验",
       "命中规则判断"
      ]
     },
     {
      "k": "b",
      "name": "可撤销",
      "note": "会改数据，但能撤回。Agent 自动执行，全程留痕并保留撤销入口。",
      "acts": [
       "生成付款指令草稿",
       "发内部通知",
       "回写单据状态",
       "建任务"
      ]
     },
     {
      "k": "c",
      "name": "不可逆",
      "note": "执行后收不回来。Agent 一律停在这一步等人点，体检会强制它前面有一道人工确认。",
      "acts": [
       "执行付款",
       "对外发送",
       "删除数据",
       "修改权限"
      ]
     }
    ]
   },
   {
    "t": "sub",
    "num": "03",
    "title": "介入规定",
    "en": "RULES"
   },
   {
    "t": "lead",
    "text": "每个环节 AI 能做什么、不能做什么，写进程序，不靠自觉。"
   },
   {
    "t": "table",
    "head": [
     "环节",
     "AI 可以做",
     "AI 不可以做"
    ],
    "rows": [
     [
      "描述",
      "把用户的话拆成规则，补齐缺项并标注来源",
      "不替用户假定金额、人员与范围，说不清就标待确认"
     ],
     [
      "配置",
      "建议节点、条件与代理人",
      "不改可逆等级，等级只能由人设定"
     ],
     [
      "上线",
      "给出体检结论与修改建议",
      "不能发布，阻断项不可豁免"
     ],
     [
      "运行",
      "自动执行只读动作，生成可撤销的草稿",
      "不执行不可逆动作"
     ],
     [
      "异常",
      "给出证据与倾向性建议",
      "不选择处理方式，不代人签字"
     ],
     [
      "回退",
      "起草复盘与新的检查项",
      "不自行回退，新规则须经人审批才生效"
     ]
    ]
   },
   {
    "t": "act",
    "text": "一句话：AI 负责把事情想清楚，人负责让事情发生。"
   },
   {
    "t": "section",
    "title": "设计方案",
    "en": "SOLUTION"
   },
   {
    "t": "sub",
    "num": "01",
    "title": "用户旅程",
    "en": "JOURNEY"
   },
   {
    "t": "steps",
    "items": [
     {
      "n": "01",
      "title": "描述",
      "text": "把制度用自己的话说出来，Agent 拆成规则清单"
     },
     {
      "n": "02",
      "title": "配置",
      "text": "逐节点核对执行者、条件与可逆等级"
     },
     {
      "n": "03",
      "title": "体检",
      "text": "未通过检查项不予发布"
     },
     {
      "n": "04",
      "title": "审阅",
      "text": "负责人看清差异与影响后再发布"
     },
     {
      "n": "05",
      "title": "运行",
      "text": "每一步做了什么、产出了什么都可核查"
     },
     {
      "n": "06",
      "title": "回退",
      "text": "异常转人工、出错可回退，原因转为新的检查项"
     }
    ]
   },
   {
    "t": "journey",
    "lead": "这条线看的是过程顺不顺；下面那张泳道表看的是谁在哪一步做什么。",
    "stages": [
     {
      "name": "描述",
      "v": 82,
      "note": "把话说完就得到草稿"
     },
     {
      "name": "配置",
      "v": 22,
      "note": "逐节点定执行者与可逆等级",
      "k": "pain"
     },
     {
      "name": "体检",
      "v": 42,
      "note": "阻断项未通过不予提交",
      "k": "gate"
     },
     {
      "name": "审阅",
      "v": 58,
      "note": "负责人看差异与影响"
     },
     {
      "name": "运行",
      "v": 34,
      "note": "不可逆动作停下等人确认",
      "k": "gate"
     },
     {
      "name": "回退",
      "v": 76,
      "note": "三步回退，原因转为检查项"
     }
    ]
   },
   {
    "t": "swim",
    "lead": "六个阶段、四条泳道。标「痛点」的是现在靠人记、靠人盯的地方；标 A / B / C 的是 Agent 介入的位置，颜色对应它在这一步能做到哪一档。",
    "stages": [
     "描述",
     "配置",
     "体检",
     "审阅",
     "运行",
     "回退"
    ],
    "lanes": [
     {
      "name": "流程管理员",
      "cells": [
       {
        "t": "用自己的话说清规则"
       },
       {
        "t": "逐节点定执行者与可逆等级",
        "k": "pain"
       },
       {
        "t": "改完阻断项才能继续"
       },
       {
        "t": "提交审阅"
       },
       {
        "t": "逐条盯住哪一步停下了",
        "k": "pain"
       },
       {
        "t": "发起回退并写清原因"
       }
      ]
     },
     {
      "name": "业务负责人",
      "cells": [
       {
        "t": ""
       },
       {
        "t": ""
       },
       {
        "t": ""
       },
       {
        "t": "看差异与影响，批准发布"
       },
       {
        "t": ""
       },
       {
        "t": "确认回退，批准新检查项"
       }
      ]
     },
     {
      "name": "处理人",
      "cells": [
       {
        "t": ""
       },
       {
        "t": ""
       },
       {
        "t": ""
       },
       {
        "t": ""
       },
       {
        "t": "审批、办理、不可逆前的人工确认"
       },
       {
        "t": ""
       }
      ]
     },
     {
      "name": "Agent",
      "ai": 1,
      "cells": [
       {
        "t": "拆成规则，缺的标「待确认」",
        "k": "a"
       },
       {
        "t": "建议节点与代理人，不改可逆等级",
        "k": "a"
       },
       {
        "t": "给结论与修改建议，不能放行",
        "k": "a"
       },
       {
        "t": "整理差异与来源，不替人批",
        "k": "a"
       },
       {
        "t": "只读自动、草稿可撤销；不可逆停下等人",
        "k": "b"
       },
       {
        "t": "起草复盘与新检查项，不自行回退",
        "k": "a"
       }
      ]
     }
    ]
   },
   {
    "t": "sub",
    "title": "前台 · 人怎么用",
    "en": "FRONT",
    "num": "02"
   },
   {
    "t": "lead",
    "text": "发起人和审批人只做两件事：把一张单填完，或者判断一张单能不能通过。流程怎么走、该谁审批，他们不需要关心。"
   },
   {
    "t": "page",
    "n": "1",
    "title": "发起申请",
    "sub": "整页选单：三大类在上，分组在下",
    "body": [
     "顶部分为审批与工单、工作流、智能洞察三类，下面按分组排列；平台推荐的模板置顶，「只看常用」同样保持分组。",
     "未发布的草稿不出现在这里，只在后台的流程管理中可见。"
    ],
    "live": [
     [
      "发起申请",
      "agent/apply.html"
     ]
    ],
    "grid": [
     "三大类切换",
     "搜索实时筛选",
     "分组可折叠",
     "点开即进表单"
    ]
   },
   {
    "t": "page",
    "n": "2",
    "title": "待我处理",
    "sub": "审批与办理分开，卡片露出的信息也不同",
    "body": [
     "审批只判断能否通过；办理需要补充 Agent 无法补齐的信息，因此按钮是「去填写表单」而不是「通过」。",
     "同一张单在五个列表中露出的信息各不相同：待办露 Agent 结论，已处理露审批人与理由，抄送露最新评论与修改。"
    ],
    "live": [
     [
      "待我处理",
      "agent/approvals.html"
     ]
    ],
    "grid": [
     "悬浮才出按钮",
     "锚点直达审批记录",
     "悬浮查看未定分支",
     "通过后进入下一张"
    ]
   },
   {
    "t": "sub",
    "title": "后台 · 规则怎么定",
    "en": "BACK",
    "num": "03"
   },
   {
    "t": "lead",
    "text": "流程管理员不写代码，用一句话描述即可搭出流程；但搭完不能自行发布。"
   },
   {
    "t": "page",
    "n": "3",
    "title": "工作台",
    "sub": "今天有多少在运行，哪几件需要处理",
    "body": [
     "不给完成百分比，给可核查的事实：运行次数、等待人工的条数、已经超时多久。",
     "需要处理的事项可直接进入处理页面，无需自行查找。"
    ],
    "live": [
     [
      "工作台",
      "agent/home.html"
     ]
    ]
   },
   {
    "t": "page",
    "n": "4",
    "title": "流程管理",
    "sub": "未发布即草稿，只在这一页可见",
    "body": [
     "顶部是「用一句话搭一条能发布的流程」；下方按分组排列，未发布置顶，前台发起申请时不会出现。",
     "分组只用于归置，不决定可见范围；可见范围在每条流程上单独设定。"
    ],
    "live": [
     [
      "流程管理",
      "agent/flows.html"
     ]
    ],
    "grid": [
     "添加推荐流程",
     "切换版本即回退",
     "停用或删除草稿",
     "拖动调整顺序"
    ]
   },
   {
    "t": "page",
    "n": "5",
    "title": "流程配置",
    "sub": "四步一条线：信息、表单、流程、设置",
    "body": [
     "基础信息 → 表单设计 → 流程配置 → 更多设置；第一步选定的类别，决定后面的分组与可选项。",
     "左右两侧都是可收起的悬浮面板，收起后画布自动补位。"
    ],
    "live": [
     [
      "流程配置",
      "agent/builder.html?step=2"
     ]
    ],
    "grid": [
     "四步均可点",
     "控件拖入表单",
     "连线悬浮出节点",
     "节点四组设置"
    ]
   },
   {
    "t": "sub",
    "title": "上线与回退",
    "en": "GOVERNANCE",
    "num": "04"
   },
   {
    "t": "lead",
    "text": "与同类产品的分界在这里：生成得对不对只是起点；上线前必须通过检查，出现问题要能退回，退回的原因要转成下一条检查项。"
   },
   {
    "t": "page",
    "n": "6",
    "title": "上线前体检",
    "sub": "未通过检查项不予提交审阅",
    "body": [
     "每条未通过项写清发现了什么、为何重要、如何修改，以及这条规则来自哪一次真实问题；阻断项不可豁免。",
     "最常拦下的一条是不可逆节点前没有人工确认。应用建议后，顶部提示与右侧流程缩略图同步变化，改到哪一步一目了然。"
    ],
    "live": [
     [
      "上线前体检",
      "agent/check.html"
     ]
    ]
   },
   {
    "t": "page",
    "n": "7",
    "title": "版本与回退",
    "sub": "回退要连原因一起留下",
    "body": [
     "回退分三步：先列出影响范围——进行中的运行如何处理、已经执行的不可逆动作无法撤回；再填写原因；最后由负责人确认。",
     "回退完成后自动生成复盘记录，结论可直接转为检查项库中的新规则，同类问题下次会被提前拦下。"
    ],
    "live": [
     [
      "版本与回退",
      "agent/versions.html"
     ]
    ],
    "grid": [
     "版本时间线可点",
     "三步回退确认",
     "复盘转为检查项"
    ]
   },
   {
    "t": "sub",
    "title": "在平台里的位置",
    "en": "IN CONTEXT",
    "num": "05"
   },
   {
    "t": "lead",
    "text": "这不是独立工具，而是协作平台里的审批一格：单据引用文档库的合同与验收单，节点向消息发提醒、向日程写截止日，跨组织审批走平台已有的企业关系。"
   },
   {
    "t": "rel",
    "center": [
     "审批",
     "AI Workflow Agent"
    ],
    "items": [
     [
      "文档库",
      "合同、验收单与发票直接引用文档库里的原件，不再重复上传。",
      "引用"
     ],
     [
      "消息",
      "超时、待处理与催办由消息推送给对应的人。",
      "推送"
     ],
     [
      "日程",
      "审批截止日写入日程；出差日期决定代理人何时生效。",
      "读写"
     ],
     [
      "组织与权限",
      "谁能发起、谁能审批由组织权限判定，跨组织审批走平台已有的企业关系。",
      "依赖"
     ]
    ]
   },
   {
    "t": "act",
    "text": "全站演示数据取自虚构企业「明远集团」。"
   }
  ]
 },
 "doc": {
  "kicker": "项目五 · CASE STUDY",
  "title": "文档库",
  "year": "2025",
  "status": "CSES · 改版设计",
  "blocks": [
   {
    "t": "section",
    "title": "项目介绍",
    "en": "OVERVIEW"
   },
   {
    "t": "intro",
    "lead": "文档库不是网盘，而是平台内的协同中枢：会议、任务、知识库的产出都沉淀在文档中，模块之间通过文档互相调用。权限清晰，是用户敢于使用的前提。",
    "rows": [
     [
      "我的角色",
      "全链路独立负责"
     ],
     [
      "目标用户",
      "平台内部成员"
     ],
     [
      "协同层次",
      "人与人的协同 · 业务之间的协同"
     ],
     [
      "设计原则",
      "空间继承权限 · 操作全程留痕"
     ],
     [
      "交付",
      "高保真设计稿"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "01",
    "title": "设计策略",
    "en": "STRATEGY"
   },
   {
    "t": "caps",
    "items": [
     [
      "01",
      "权限跟随空间继承",
      "文档放入哪个空间，查看与编辑权限随之确定，无需逐份设置。新建知识库须先选可见范围，删除知识库须二次确认，安全开关逐项说明。"
     ],
     [
      "02",
      "文档作为模块连接器",
      "在纪要中选中文字即可创建任务、发起会议；看板、甘特图、画板、思维导图可直接嵌入文档，各模块产出统一沉淀。"
     ],
     [
      "03",
      "找得到、讲得清、查得到",
      "按类型、归属人、时间检索，卡片视图直接展示正文；关系图谱呈现引用关系；文档可直接进入演示模式；导出、下载、删除全程留痕。"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "02",
    "title": "逐页讲解",
    "en": "PAGES"
   },
   {
    "t": "act",
    "text": "幕一 · 文档列表"
   },
   {
    "t": "page",
    "n": "1",
    "title": "我的文档 · 列表与卡片",
    "sub": "记得名称用列表，记得内容用卡片",
    "shots": [
     [
      "assets/shots/dl-n-list.webp",
      "我的文档 · 列表视图"
     ],
     [
      "assets/shots/dl-n-cards.webp",
      "我的文档 · 卡片视图"
     ]
    ]
   },
   {
    "t": "page",
    "n": "2",
    "title": "企业空间首页",
    "sub": "先看成员动态与最近使用，再找文件",
    "shots": [
     [
      "assets/shots/dl-s-home.webp",
      "企业空间首页 · 先看成员动态与最近使用，再找文件"
     ]
    ]
   },
   {
    "t": "page",
    "n": "3",
    "title": "空间设置 · 权限",
    "sub": "在空间层级设置一次，下级全部继承",
    "shots": [
     [
      "assets/shots/dl-s-perm.webp",
      "空间设置 · 权限 · 在空间层级设置一次，下级全部继承"
     ]
    ]
   },
   {
    "t": "page",
    "n": "4",
    "title": "任务 · 文档维度",
    "sub": "任务按所属文档归组",
    "shots": [
     [
      "assets/shots/dl-n-tasks.webp",
      "任务 · 文档维度"
     ],
     [
      "assets/shots/dl-n-tasks-2.webp",
      "任务 · 悬停查看详情"
     ]
    ]
   },
   {
    "t": "page",
    "n": "5",
    "title": "关系图谱",
    "sub": "文档之间的引用关系以图谱呈现",
    "shots": [
     [
      "assets/shots/dl-n-graph-2.webp",
      "关系图谱 · 全图"
     ],
     [
      "assets/shots/dl-n-graph.webp",
      "关系图谱 · 筛选与外观"
     ]
    ]
   },
   {
    "t": "act",
    "text": "幕二 · 文档编辑"
   },
   {
    "t": "page",
    "n": "6",
    "title": "编辑器 · 右侧操作列",
    "sub": "工具栏处理文字，右侧操作列处理块、样式与修订",
    "shots": [
     [
      "assets/shots/dl-i-rail-1.webp",
      "右侧操作列 · 插入"
     ],
     [
      "assets/shots/dl-i-rail-2.webp",
      "右侧操作列 · 格式"
     ],
     [
      "assets/shots/dl-i-rail-3.webp",
      "右侧操作列 · 样式"
     ],
     [
      "assets/shots/dl-i-rail-4.webp",
      "编辑器 · 修订模式"
     ]
    ]
   },
   {
    "t": "page",
    "n": "7",
    "title": "同步块",
    "sub": "同一段内容多处引用，修改一处全部同步",
    "shots": [
     [
      "assets/shots/dl-i-sync.webp",
      "同步块 · 多处同步"
     ]
    ]
   },
   {
    "t": "page",
    "n": "8",
    "title": "可嵌入的内容块",
    "sub": "任务、看板、甘特图、表格、代码、画册、画板、思维导图",
    "shots": [
     [
      "assets/shots/dl-i-task2.webp",
      "创建任务 · 两种样式"
     ],
     [
      "assets/shots/dl-i-kanban.webp",
      "任务看板"
     ],
     [
      "assets/shots/dl-i-gantt.webp",
      "甘特图"
     ],
     [
      "assets/shots/dl-i-table.webp",
      "表格"
     ],
     [
      "assets/shots/dl-i-code.webp",
      "代码块"
     ],
     [
      "assets/shots/dl-i-album.webp",
      "画册 · 嵌在文档里"
     ],
     [
      "assets/shots/dl-i-album-detail.webp",
      "画册 · 详情弹窗"
     ],
     [
      "assets/shots/dl-i-board-embed.webp",
      "协同画板 · 嵌在文档里"
     ],
     [
      "assets/shots/dl-i-board-editor.webp",
      "协同画板 · 打开编辑器"
     ],
     [
      "assets/shots/dl-i-board-cards.webp",
      "协同画板 · 文档卡片连线"
     ],
     [
      "assets/shots/dl-i-mind-embed.webp",
      "思维导图 · 嵌在文档里"
     ],
     [
      "assets/shots/dl-i-mind-open.webp",
      "思维导图 · 打开编辑器"
     ]
    ],
    "grid": [
     "",
     "",
     "",
     "",
     "",
     "",
     "",
     "",
     ""
    ]
   },
   {
    "t": "act",
    "text": "幕三 · 演示与知识库"
   },
   {
    "t": "page",
    "n": "9",
    "title": "演示 · 文档模式",
    "sub": "幻灯片、白板、评论展示三种模式切换",
    "shots": [
     [
      "assets/shots/dl-p07.webp",
      "演示 · 文档模式"
     ]
    ]
   },
   {
    "t": "page",
    "n": "10",
    "title": "知识库",
    "sub": "首页查看可见范围，库内按目录浏览",
    "shots": [
     [
      "assets/shots/dl-08.webp",
      "知识库首页 · 可见范围"
     ],
     [
      "assets/shots/dl-11.webp",
      "知识库 · 库内目录"
     ]
    ]
   },
   {
    "t": "page",
    "n": "11",
    "title": "安全设置",
    "sub": "分享、外发、新建、复制导出、评论、删除逐项配置",
    "shots": [
     [
      "assets/shots/dl-14.webp",
      "安全设置 · 开关逐项配置"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "03",
    "title": "剩余页面",
    "en": "MORE SCREENS"
   },
   {
    "t": "gallery",
    "shots": [
     [
      "assets/shots/dl-e-toc.webp",
      "编辑器 · 左侧目录"
     ],
     [
      "assets/shots/dl-01.webp",
      "旧版文件的主页 · 三维度筛选"
     ],
     [
      "assets/shots/dl-p13.webp",
      "演示 · 放映工具栏与语音条"
     ],
     [
      "assets/shots/dl-02.webp",
      "旧版文件的空间视角"
     ],
     [
      "assets/shots/dl-k-toc-collapsed.webp",
      "知识库 · 目录全部收起"
     ],
     [
      "assets/shots/dl-03.webp",
      "旧版文件 · 选中全是自己的"
     ],
     [
      "assets/shots/dl-n-tags.webp",
      "企业空间 · 标签视图"
     ],
     [
      "assets/shots/dl-3b.webp",
      "旧版文件 · 选中混着别人的"
     ],
     [
      "assets/shots/dl-09.webp",
      "新建知识库 · 建库先定可见范围"
     ],
     [
      "assets/shots/dl-04.webp",
      "旧版文件 · 删除先问范围"
     ],
     [
      "assets/shots/dl-e-slash.webp",
      "编辑器 · 输入「/」插入块"
     ],
     [
      "assets/shots/dl-w01.webp",
      "旧版文件 · 普通员工的个人空间"
     ],
     [
      "assets/shots/dl-n-doc-versions.webp",
      "文档内 · 目录、面包屑切换与版本列表"
     ],
     [
      "assets/shots/dl-w02.webp",
      "旧版文件 · 最近使用"
     ],
     [
      "assets/shots/dl-e-docset.webp",
      "编辑器 · 文档设置"
     ],
     [
      "assets/shots/dl-x-folder.webp",
      "旧版文件 · 文件夹内"
     ],
     [
      "assets/shots/dl-10.webp",
      "库内首页 · 一个库一块仪表盘"
     ],
     [
      "assets/shots/dl-x-folder-info.webp",
      "旧版文件 · 文件夹简介与人员"
     ],
     [
      "assets/shots/dl-n-list-search.webp",
      "我的文档 · 全部文件 · 带搜索"
     ],
     [
      "assets/shots/dl-x-space-grid.webp",
      "旧版文件 · 云空间网格"
     ],
     [
      "assets/shots/dl-e-cover.webp",
      "编辑器 · 添加封面"
     ],
     [
      "assets/shots/dl-x-space-list.webp",
      "旧版文件 · 云空间列表"
     ],
     [
      "assets/shots/dl-11b.webp",
      "知识库 · 目录收起后变悬浮菜单"
     ],
     [
      "assets/shots/dl-k-lib-home-3.webp",
      "库内首页 · 第三版"
     ],
     [
      "assets/shots/dl-w10.webp",
      "知识库 · 全部文档"
     ],
     [
      "assets/shots/dl-k-notice-edit-2.webp",
      "公告编辑 · 第二态"
     ],
     [
      "assets/shots/dl-e-mention.webp",
      "编辑器 · @人员 / 文档 / 会议"
     ],
     [
      "assets/shots/dl-k-toc-switch.webp",
      "知识库 · 目录切换"
     ],
     [
      "assets/shots/dl-12.webp",
      "知识库 · 打开文档 · 块手柄"
     ],
     [
      "assets/shots/dl-k-unpublished-2.webp",
      "发布到商学院 · 第二态"
     ],
     [
      "assets/shots/dl-w03.webp",
      "分享内容 · 浏览统计、热门文档、活跃用户"
     ],
     [
      "assets/shots/dl-k-unpublished-3.webp",
      "发布到商学院 · 第三态"
     ],
     [
      "assets/shots/dl-n-tags-2.webp",
      "企业空间 · 标签视图 · 第二态"
     ],
     [
      "assets/shots/dl-w08.webp",
      "知识库 · 公告收起"
     ],
     [
      "assets/shots/dl-13.webp",
      "成员权限 · 四档"
     ],
     [
      "assets/shots/dl-w09.webp",
      "库内首页 · 变体"
     ],
     [
      "assets/shots/dl-k-alldocs-switch.webp",
      "知识库 · 全部文档切换"
     ],
     [
      "assets/shots/dl-w13.webp",
      "添加协作者"
     ],
     [
      "assets/shots/dl-e-callout.webp",
      "编辑器 · 高亮块与表情"
     ],
     [
      "assets/shots/dl-w14.webp",
      "添加协作者 · 搜索"
     ],
     [
      "assets/shots/dl-15.webp",
      "删除知识库 · 输库名确认"
     ],
     [
      "assets/shots/dl-w17.webp",
      "知识库设置 · 成员设置"
     ],
     [
      "assets/shots/dl-w11.webp",
      "知识库 · 打开文档 · 封面与标题"
     ],
     [
      "assets/shots/dl-w18.webp",
      "删除知识库 · 确认后"
     ],
     [
      "assets/shots/dl-e-attach.webp",
      "编辑器 · 附件块 · PDF / 视频 / 音频"
     ],
     [
      "assets/shots/dl-w19.webp",
      "后台 · 自定义分组管理"
     ],
     [
      "assets/shots/dl-16.webp",
      "后台 · 权限管理"
     ],
     [
      "assets/shots/dl-p01.webp",
      "演示 · 文档模式 · 全屏"
     ],
     [
      "assets/shots/dl-n-search-result.webp",
      "我的文档 · 搜索结果高亮"
     ],
     [
      "assets/shots/dl-p09.webp",
      "演示 · 音量"
     ],
     [
      "assets/shots/dl-w12.webp",
      "知识库 · 发布到商学院"
     ],
     [
      "assets/shots/dl-p10.webp",
      "演示 · 幻灯片内容页"
     ],
     [
      "assets/shots/dl-17.webp",
      "后台 · 操作记录"
     ],
     [
      "assets/shots/dl-e-board-shapes.webp",
      "协同画板 · 形状库与设置"
     ],
     [
      "assets/shots/dl-w07.webp",
      "知识库 · 公告编辑"
     ],
     [
      "assets/shots/dl-n-sticky.webp",
      "快速便签"
     ],
     [
      "assets/shots/dl-e-blockset.webp",
      "编辑器 · 块设置"
     ],
     [
      "assets/shots/dl-i-album-detail2.webp",
      "画册 · 详情弹窗 · 空态"
     ],
     [
      "assets/shots/dl-w15.webp",
      "知识库 · 成员权限 · 长列表"
     ],
     [
      "assets/shots/dl-p06.webp",
      "演示 · 幻灯片封面"
     ],
     [
      "assets/shots/dl-w16.webp",
      "知识库设置 · 基础信息"
     ],
     [
      "assets/shots/dl-p03.webp",
      "演示 · 展示评论"
     ],
     [
      "assets/shots/dl-p08.webp",
      "演示 · 放映工具栏"
     ],
     [
      "assets/shots/dl-w20.webp",
      "后台 · 自定义分类"
     ],
     [
      "assets/shots/dl-p11.webp",
      "演示 · 文档模式 · 窗口"
     ],
     [
      "assets/shots/dl-w21.webp",
      "后台 · 操作记录 · 导出"
     ],
     [
      "assets/shots/dl-w22.webp",
      "后台 · 数据查看"
     ]
    ],
    "lead": "文档内的其他操作、知识库其余页面、管理后台的操作记录与数据查看，以及改版前的旧版列表页。"
   }
  ]
 },
 "cses": {
  "kicker": "项目六 · CASE STUDY",
  "title": "企业协作平台",
  "year": "2023 — 2025",
  "status": "CSES · 五个业务模块",
  "blocks": [
   {
    "t": "section",
    "title": "项目介绍",
    "en": "OVERVIEW"
   },
   {
    "t": "intro",
    "lead": "CSES 企业协作平台中的四个业务模块：组织权限后台、招聘、薪酬管理、考勤管理。它们共用同一套组织、岗位、角色与权限底座；平台端审核入驻企业，企业端管理自身组织。招聘、薪酬、考勤基于旧框架，组织权限后台基于新框架。平台里的审批已独立成 AI Workflow Agent，单列一个项目。",
    "rows": [
     [
      "我的角色",
      "全链路独立负责"
     ],
     [
      "目标用户",
      "企业管理员 · 各业务线使用者"
     ],
     [
      "底座",
      "组织 · 岗位 · 角色 · 权限"
     ],
     [
      "两端",
      "平台端审核入驻 · 企业端管理组织"
     ],
     [
      "交付",
      "四个模块高保真设计稿"
     ]
    ]
   },
   {
    "t": "section",
    "title": "模块总览",
    "en": "MODULES"
   },
   {
    "t": "modules",
    "items": [
     [
      "组织权限后台",
      "新框架",
      "组织、岗位、角色、权限与安全底座，平台端与企业端共用一套权限模型。"
     ],
     [
      "招聘",
      "旧框架",
      "覆盖职位、候选人、面试、Offer 与报表的完整链路；面试空间具备实时转写与 AI 标签。"
     ],
     [
      "薪酬管理",
      "旧框架",
      "薪酬看板、分步核算与工资条发送；计算不交给 AI，AI 只在发放前提示异常。"
     ],
     [
      "考勤管理",
      "旧框架",
      "考勤概览、排班、分步考勤确认、存证与假期额度。"
     ]
    ]
   },
   {
    "t": "section",
    "title": "组织权限后台",
    "en": "ORGANIZATION & PERMISSIONS"
   },
   {
    "t": "lead",
    "text": "企业级的组织、岗位、角色、权限与安全底座。平台方审核入驻企业，企业管理员管理自身组织，两端共用一套权限模型。页面中的人员信息均为模拟数据。"
   },
   {
    "t": "sub",
    "num": "01",
    "title": "岗位与角色双重绑定",
    "en": "MODEL"
   },
   {
    "t": "lead",
    "text": "权限有两个入口：岗位决定一个人在组织中的位置，角色决定他能做哪些事。两条线相互独立，又可叠加在同一个人身上，从而适配组织习惯不同的企业。"
   },
   {
    "t": "caps",
    "items": [
     [
      "两条线",
      "岗位定位置，角色定权限",
      "岗位跟随组织，角色跟随职责。一个人可以只有岗位，也可以叠加多个角色，最终权限是两者的并集。"
     ],
     [
      "同岗不同角",
      "叠加角色，区分权限大小",
      "同为「主管」，有的企业需要查看全部门，有的只看本组。岗位不变，挂载不同角色即可区分权限。"
     ],
     [
      "同角不同岗",
      "借助岗位，细分范围",
      "同为「审批人」，岗位不同，可审批的范围也不同。岗位在角色之上再做一层区分，无需为每种差异新建角色。"
     ],
     [
      "权限范围",
      "默认以所在部门为界",
      "可见范围默认以本部门为界；需要跨部门时，增加角色补充范围即可，无需调整组织树。"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "02",
    "title": "逐页讲解",
    "en": "PAGES"
   },
   {
    "t": "page",
    "n": "1",
    "title": "成员与部门",
    "sub": "组织树在左，成员表在右",
    "shots": [
     [
      "assets/shots/org-11.webp",
      "成员与部门 · 组织树在左，成员表在右"
     ]
    ]
   },
   {
    "t": "page",
    "n": "2",
    "title": "岗位管理",
    "sub": "左列为岗位，右表为人员",
    "shots": [
     [
      "assets/shots/org-08.webp",
      "岗位管理 · 左列为岗位，右表为人员"
     ]
    ]
   },
   {
    "t": "page",
    "n": "3",
    "title": "角色管理",
    "sub": "权限挂载在角色上",
    "shots": [
     [
      "assets/shots/org-27.webp",
      "角色管理 · 权限挂载在角色上"
     ]
    ]
   },
   {
    "t": "page",
    "n": "4",
    "title": "权限查询",
    "sub": "按人员、角色、业务系统查询",
    "shots": [
     [
      "assets/shots/org-17.webp",
      "权限查询 · 按人员、角色、业务系统查询"
     ]
    ]
   },
   {
    "t": "page",
    "n": "5",
    "title": "平台端 · 企业审核",
    "sub": "平台方审核入驻企业",
    "shots": [
     [
      "assets/shots/org-32.webp",
      "平台端 · 企业审核 · 平台方审核入驻企业"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "03",
    "title": "剩余页面",
    "en": "MORE SCREENS"
   },
   {
    "t": "gallery",
    "shots": [
     [
      "assets/shots/org-19.webp",
      "企业端 · 架构图览"
     ],
     [
      "assets/shots/org-04.webp",
      "企业端 · 企业概览"
     ],
     [
      "assets/shots/org-03.webp",
      "企业端 · 企业信息"
     ],
     [
      "assets/shots/org-12.webp",
      "企业端 · 成员权限"
     ],
     [
      "assets/shots/org-13.webp",
      "企业端 · 成员权限变更"
     ],
     [
      "assets/shots/org-02.webp",
      "企业端 · 人员异动处理"
     ],
     [
      "assets/shots/org-10.webp",
      "企业端 · 异动成员权限提醒"
     ],
     [
      "assets/shots/org-20.webp",
      "企业端 · 用户组管理"
     ],
     [
      "assets/shots/org-30.webp",
      "企业端 · 邀请人员"
     ],
     [
      "assets/shots/org-21.webp",
      "企业端 · 申请列表"
     ],
     [
      "assets/shots/org-00.webp",
      "企业端 · 上下级申请列表"
     ],
     [
      "assets/shots/org-31.webp",
      "企业端 · 集团上下级"
     ],
     [
      "assets/shots/org-06.webp",
      "企业端 · 关联组织"
     ],
     [
      "assets/shots/org-29.webp",
      "企业端 · 资源分配"
     ],
     [
      "assets/shots/org-25.webp",
      "企业端 · 菜单管理"
     ],
     [
      "assets/shots/org-26.webp",
      "企业端 · 菜单详情"
     ],
     [
      "assets/shots/org-24.webp",
      "企业端 · 菜单权限查询"
     ],
     [
      "assets/shots/org-16.webp",
      "企业端 · 权限审计"
     ],
     [
      "assets/shots/org-18.webp",
      "企业端 · 权限规则变更记录"
     ],
     [
      "assets/shots/org-15.webp",
      "企业端 · 日志审计"
     ],
     [
      "assets/shots/org-09.webp",
      "企业端 · 建立查询任务"
     ],
     [
      "assets/shots/org-14.webp",
      "企业端 · 数据保护"
     ],
     [
      "assets/shots/org-23.webp",
      "企业端 · 终端安全"
     ],
     [
      "assets/shots/org-28.webp",
      "企业端 · 账号安全"
     ],
     [
      "assets/shots/org-22.webp",
      "企业端 · 登录密码管理"
     ],
     [
      "assets/shots/org-01.webp",
      "企业端 · 两步验证"
     ],
     [
      "assets/shots/org-07.webp",
      "企业端 · 多端登录"
     ],
     [
      "assets/shots/org-05.webp",
      "企业端 · 全局设置"
     ],
     [
      "assets/shots/org-33.webp",
      "平台端 · 入驻企业列表"
     ],
     [
      "assets/shots/org-34.webp",
      "平台端 · 菜单分配"
     ],
     [
      "assets/shots/org-35.webp",
      "平台端 · 菜单管理"
     ],
     [
      "assets/shots/org-36.webp",
      "平台端 · 菜单详情"
     ]
    ],
    "lead": "企业端与平台端的其余页面：组织与成员、岗位与角色、权限查询与审计、安全与登录、菜单与资源分配、企业入驻。"
   },
   {
    "t": "section",
    "title": "招聘",
    "en": "RECRUITING"
   },
   {
    "t": "lead",
    "text": "招聘前台，基于旧框架，覆盖职位、候选人、面试管理、Offer、内推与统计报表。面试空间较早引入实时转写与 AI 标签，与后来会议产品的转写能力一脉相承。"
   },
   {
    "t": "sub",
    "num": "01",
    "title": "逐页讲解",
    "en": "PAGES"
   },
   {
    "t": "page",
    "n": "1",
    "title": "职位列表",
    "sub": "每个职位后附完整招聘漏斗",
    "shots": [
     [
      "assets/shots/cs-hire-jobs.webp",
      "职位列表 · 每个职位后附完整招聘漏斗"
     ]
    ]
   },
   {
    "t": "page",
    "n": "2",
    "title": "候选人 · 快速筛查",
    "sub": "逐个查看，连续处理",
    "shots": [
     [
      "assets/shots/cs-hire-screen.webp",
      "候选人 · 快速筛查 · 逐个查看，连续处理"
     ]
    ]
   },
   {
    "t": "page",
    "n": "3",
    "title": "面试空间 · 转写",
    "sub": "视频、实时转写与 AI 标签",
    "shots": [
     [
      "assets/shots/cs-hire-transcript.webp",
      "面试空间 · 转写 · 视频、实时转写与 AI 标签"
     ]
    ]
   },
   {
    "t": "page",
    "n": "4",
    "title": "候选人详情 · Offer",
    "sub": "流程操作固定在右侧",
    "shots": [
     [
      "assets/shots/cs-hire-offer.webp",
      "候选人详情 · Offer · 流程操作固定在右侧"
     ]
    ]
   },
   {
    "t": "page",
    "n": "5",
    "title": "报表中心",
    "sub": "按投递渠道与招聘阶段交叉统计",
    "shots": [
     [
      "assets/shots/cs-hire-report.webp",
      "报表中心 · 按投递渠道与招聘阶段交叉统计"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "02",
    "title": "剩余页面",
    "en": "MORE SCREENS"
   },
   {
    "t": "gallery",
    "shots": [
     [
      "assets/shots/cs-hire-resumes.webp",
      "简历库"
     ],
     [
      "assets/shots/cs-hire-list.webp",
      "面试管理 · 面试列表"
     ],
     [
      "assets/shots/cs-hire-detail.webp",
      "面试列表 · 详情简历"
     ],
     [
      "assets/shots/cs-hire-schedule.webp",
      "候选人 · 安排面试"
     ],
     [
      "assets/shots/cs-hire-today.webp",
      "面试待办 · 今日初筛"
     ],
     [
      "assets/shots/cs-hire-referral.webp",
      "内推"
     ],
     [
      "assets/shots/cs-hire-speaker.webp",
      "面试空间 · 发言人"
     ],
     [
      "assets/shots/cs-hire-questions.webp",
      "面试空间 · 面试题"
     ],
     [
      "assets/shots/cs-hire-manage.webp",
      "招聘管理"
     ],
     [
      "assets/shots/cs-hire-w-overview-empty.webp",
      "招聘概览 · 空态"
     ],
     [
      "assets/shots/cs-hire-w-jobs-filter.webp",
      "职位 · 筛选"
     ],
     [
      "assets/shots/cs-hire-w-screen-empty.webp",
      "初筛 · 未选择"
     ],
     [
      "assets/shots/cs-hire-w-rejected.webp",
      "候选人 · 已淘汰"
     ],
     [
      "assets/shots/cs-hire-w-sendoffer.webp",
      "候选人 · 发送 Offer"
     ],
     [
      "assets/shots/cs-hire-w-changejob.webp",
      "面试 · 换岗位"
     ],
     [
      "assets/shots/cs-hire-w-files.webp",
      "面试 · 相关文件"
     ],
     [
      "assets/shots/cs-hire-w-form.webp",
      "应聘登记表"
     ],
     [
      "assets/shots/cs-hire-w-onboarding.webp",
      "面试待办 · 待入职"
     ],
     [
      "assets/shots/cs-hire-w-questions-rec.webp",
      "面试题 · 录制面试"
     ],
     [
      "assets/shots/cs-hire-w-tags.webp",
      "人才标签"
     ]
    ]
   },
   {
    "t": "section",
    "title": "薪酬管理",
    "en": "PAYROLL"
   },
   {
    "t": "lead",
    "text": "薪资社保模块，基于旧框架，包含薪酬看板、分步核算、计薪规则与工资条发送。"
   },
   {
    "t": "sub",
    "num": "01",
    "title": "逐页讲解",
    "en": "PAGES"
   },
   {
    "t": "page",
    "n": "1",
    "title": "薪酬看板",
    "sub": "核心成本指标与构成分析",
    "shots": [
     [
      "assets/shots/cs-pay-board.webp",
      "薪酬看板 · 核心成本指标与构成分析"
     ]
    ]
   },
   {
    "t": "page",
    "n": "2",
    "title": "核算薪资",
    "sub": "核对人员、定薪调薪、核算、锁定，一条流程完成",
    "shots": [
     [
      "assets/shots/cs-pay-calc.webp",
      "① 核对算薪人员"
     ],
     [
      "assets/shots/cs-pay-step2.webp",
      "② 定薪调薪"
     ],
     [
      "assets/shots/cs-pay-problem.webp",
      "③ 核算薪资"
     ],
     [
      "assets/shots/cs-pay-locked.webp",
      "④ 算薪完成"
     ]
    ],
    "steps": [
     [
      "① 核对算薪人员",
      "确认本期参与算薪的人员及其基本信息"
     ],
     [
      "② 定薪调薪",
      "处理本期的定薪与调薪"
     ],
     [
      "③ 核算薪资",
      "系统先校验异常，再开始计算"
     ],
     [
      "④ 算薪完成",
      "锁定结果后方可发起审批与发放"
     ]
    ]
   },
   {
    "t": "page",
    "n": "3",
    "title": "计薪规则设置",
    "sub": "薪资项来源清晰，右侧实时试算",
    "shots": [
     [
      "assets/shots/cs-pay-rules.webp",
      "计薪规则设置 · 薪资项来源清晰，右侧实时试算"
     ]
    ]
   },
   {
    "t": "page",
    "n": "4",
    "title": "发送工资单",
    "sub": "按已发送、待查看、待确认跟踪",
    "shots": [
     [
      "assets/shots/cs-pay-send.webp",
      "发送工资单 · 按已发送、待查看、待确认跟踪"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "02",
    "title": "剩余页面",
    "en": "MORE SCREENS"
   },
   {
    "t": "gallery",
    "shots": [
     [
      "assets/shots/cs-pay-archive.webp",
      "薪酬档案"
     ],
     [
      "assets/shots/cs-pay-formula.webp",
      "查看更多公式场景"
     ],
     [
      "assets/shots/cs-pay-sign.webp",
      "设置工资条 · 员工签字"
     ],
     [
      "assets/shots/cs-pay-stuck.webp",
      "核算薪资 · 停留过久"
     ],
     [
      "assets/shots/cs-pay-detail.webp",
      "核算薪资 · 明细"
     ],
     [
      "assets/shots/cs-pay-batch.webp",
      "薪酬档案 · 批量调薪"
     ],
     [
      "assets/shots/cs-pay-slips.webp",
      "工资条管理"
     ],
     [
      "assets/shots/cs-pay-w-sync.webp",
      "薪资社保 · 同步"
     ],
     [
      "assets/shots/cs-pay-w-sync-done.webp",
      "同步完成"
     ],
     [
      "assets/shots/cs-pay-w-rule-people.webp",
      "规则设置 · 选择人员"
     ],
     [
      "assets/shots/cs-pay-w-rule-add.webp",
      "规则设置 · 添加薪资项"
     ],
     [
      "assets/shots/cs-pay-w-sickleave.webp",
      "病假扣除规则"
     ],
     [
      "assets/shots/cs-pay-w-adjust-hist.webp",
      "调薪历史"
     ],
     [
      "assets/shots/cs-pay-w-import.webp",
      "导入导出模板"
     ],
     [
      "assets/shots/cs-pay-w-float.webp",
      "确认浮动数据并修改"
     ],
     [
      "assets/shots/cs-pay-w-step4.webp",
      "核算第四步 · 完成"
     ],
     [
      "assets/shots/cs-pay-w-sent-all.webp",
      "发送成功 · 全部"
     ],
     [
      "assets/shots/cs-pay-w-schedule.webp",
      "工资条 · 定时发送"
     ]
    ]
   },
   {
    "t": "section",
    "title": "考勤管理",
    "en": "ATTENDANCE"
   },
   {
    "t": "lead",
    "text": "考勤模块，基于旧框架，包含考勤概览、排班管理、分步考勤确认、考勤存证与假期规则。"
   },
   {
    "t": "sub",
    "num": "01",
    "title": "逐页讲解",
    "en": "PAGES"
   },
   {
    "t": "page",
    "n": "1",
    "title": "考勤概览 · 月度汇总",
    "sub": "汇总指标与人员明细",
    "shots": [
     [
      "assets/shots/cs-att-monthly.webp",
      "考勤概览 · 月度汇总 · 汇总指标与人员明细"
     ]
    ]
   },
   {
    "t": "page",
    "n": "2",
    "title": "排班管理",
    "sub": "按周排班，人员与日期交叉编排",
    "shots": [
     [
      "assets/shots/cs-att-shift.webp",
      "排班管理 · 按周排班，人员与日期交叉编排"
     ]
    ]
   },
   {
    "t": "page",
    "n": "3",
    "title": "考勤确认",
    "sub": "设置范围、预览表格、确认发送",
    "shots": [
     [
      "assets/shots/cs-att-confirm1.webp",
      "① 设置考勤范围"
     ],
     [
      "assets/shots/cs-att-confirm2.webp",
      "② 预览表格"
     ],
     [
      "assets/shots/cs-att-confirm3.webp",
      "③ 设置考勤确认"
     ]
    ],
    "steps": [
     [
      "① 设置考勤范围",
      "选择确认项、考勤周期与人员范围"
     ],
     [
      "② 预览表格",
      "核对汇总结果"
     ],
     [
      "③ 设置考勤确认",
      "设置确认方式后发送给员工"
     ]
    ]
   },
   {
    "t": "page",
    "n": "4",
    "title": "考勤存证",
    "sub": "按人员查看存证记录",
    "shots": [
     [
      "assets/shots/cs-att-proof.webp",
      "考勤存证 · 按人员查看存证记录"
     ]
    ]
   },
   {
    "t": "page",
    "n": "5",
    "title": "假期剩余",
    "sub": "按人员查看各类假期剩余额度",
    "shots": [
     [
      "assets/shots/cs-att-leave-balance.webp",
      "假期剩余 · 按人员查看各类假期剩余额度"
     ]
    ]
   },
   {
    "t": "sub",
    "num": "02",
    "title": "剩余页面",
    "en": "MORE SCREENS"
   },
   {
    "t": "gallery",
    "shots": [
     [
      "assets/shots/cs-att-daily.webp",
      "考勤概览 · 每日汇总"
     ],
     [
      "assets/shots/cs-att-raw.webp",
      "考勤概览 · 原始记录"
     ],
     [
      "assets/shots/cs-att-punch.webp",
      "考勤概览 · 打卡时间"
     ],
     [
      "assets/shots/cs-att-group.webp",
      "考勤组"
     ],
     [
      "assets/shots/cs-att-shiftmgmt.webp",
      "班次管理"
     ],
     [
      "assets/shots/cs-att-overtime.webp",
      "加班规则"
     ],
     [
      "assets/shots/cs-att-analysis.webp",
      "假勤分析"
     ],
     [
      "assets/shots/cs-att-w-monthly-lead.webp",
      "月度汇总 · 考勤组组长"
     ],
     [
      "assets/shots/cs-att-w-fields.webp",
      "月度汇总 · 设置字段"
     ],
     [
      "assets/shots/cs-att-w-confirm-list.webp",
      "考勤确认 · 列表"
     ],
     [
      "assets/shots/cs-att-w-remind.webp",
      "考勤确认 · 提醒"
     ],
     [
      "assets/shots/cs-att-w-scope.webp",
      "确认范围 · 选择人员"
     ],
     [
      "assets/shots/cs-att-w-items.webp",
      "确认范围 · 选择考勤项"
     ],
     [
      "assets/shots/cs-att-w-groupsel.webp",
      "确认范围 · 考勤组选择"
     ],
     [
      "assets/shots/cs-att-w-send.webp",
      "考勤确认 · 发送界面"
     ],
     [
      "assets/shots/cs-att-w-leave-rec.webp",
      "假期管理 · 请假记录"
     ],
     [
      "assets/shots/cs-att-w-holiday.webp",
      "加班规则 · 法定节假日"
     ],
     [
      "assets/shots/cs-att-w-leave-rule.webp",
      "假期管理 · 假期规则"
     ]
    ]
   }
  ]
 },
 "zeekr": {
 "kicker": "其他项目 · CASE STUDY",
 "title": "极氪 001 HMI",
 "year": "2023",
 "status": "项目未上线",
 "blocks": [
  {
   "t": "section",
   "title": "项目介绍",
   "en": "OVERVIEW"
  },
  {
   "t": "intro",
   "lead": "车载中控以驾驶员的操作为主。行驶过程中需要方便主驾操作，界面保持干净，避免在短时间内找不到目标区域。本项目按可达范围重新梳理功能布局，按使用场景与优先级重新划定信息层级。",
   "rows": [
    [
     "我的角色",
     "界面设计 · 设计规范 · 还原度走查"
    ],
    [
     "所属公司",
     "北京艾阁广告有限公司"
    ],
    [
     "项目周期",
     "2023 年，九周"
    ],
    [
     "状态",
     "项目未上线"
    ]
   ]
  },
  {
   "t": "sub",
   "num": "01",
   "title": "项目背景",
   "en": "BACKGROUND"
  },
  {
   "t": "caps",
   "items": [
    [
     "01",
     "背景",
     "2023 年，新能源汽车领域蓬勃发展，国产新势力持续壮大，极氪 001 在当时尚未面世。中控屏是这类产品最直接的体验界面。"
    ],
    [
     "02",
     "挑战",
     "行驶过程中要方便主驾操作，界面需保持干净，避免在短时间内找不到目标区域。"
    ],
    [
     "03",
     "方案",
     "项目实施过程中输出调研报告、设计草图与模拟验证，确保主驾与副驾均能方便地操作车辆屏幕。"
    ]
   ]
  },
  {
   "t": "sub",
   "num": "02",
   "title": "设计策略",
   "en": "STRATEGY"
  },
  {
   "t": "caps",
   "items": [
    [
     "01",
     "以用户体验为中心",
     "将用户体验置于设计核心，了解目标用户的需求、习惯与预期，确保界面符合其直觉与操作习惯。"
    ],
    [
     "02",
     "简洁与直观",
     "采用简洁、直观的界面设计，减少复杂性与视觉干扰，使用户能够迅速理解并操作系统的各项功能。"
    ],
    [
     "03",
     "易于操作和控制",
     "设计易于操作和控制的界面元素，如大按钮、滑动条与拖动功能，便于用户在行驶过程中进行操作与调整。"
    ],
    [
     "04",
     "数据可视化",
     "通过图表、仪表盘与动画等方式，将车辆的能源使用情况、充电状态与行驶信息以清晰、直观的形式展示给用户。"
    ],
    [
     "05",
     "多模态交互",
     "结合触摸、语音与手势等多种交互方式，提供更灵活、便捷的操作方式，适应不同用户的偏好与需求。"
    ],
    [
     "06",
     "定制化与个性化",
     "提供界面的定制选项，允许用户根据个人喜好与习惯调整界面布局、配色与显示内容。"
    ]
   ]
  },
  {
   "t": "sub",
   "num": "03",
   "title": "排期与分工",
   "en": "SCHEDULE"
  },
  {
   "t": "timeline",
   "lead": "项目周期九周，分四个阶段推进。我自第一周进场，至最后的还原度走查结束。",
   "items": [
    [
     "问题发现",
     "第 1 — 2 周：产品问题分析、页面问题梳理",
     0
    ],
    [
     "方案设计",
     "第 3 — 5 周：界面方案设计，同步建立设计规范",
     0
    ],
    [
     "开发实现",
     "第 6 — 8 周：切图标注，配合开发实现功能",
     0
    ],
    [
     "测试验证",
     "第 9 周：功能测试与 UI 还原度走查",
     0
    ]
   ]
  },
  {
   "t": "table",
   "lead": "我在项目中承担的四部分工作。",
   "head": [
    "承担工作",
    "具体内容"
   ],
   "rows": [
    [
     "确立设计方案",
     "确定设计方向、字体、颜色与图标，形成可执行的视觉基调"
    ],
    [
     "设计规范建立",
     "组建设计组件库，完成切图标注，配合开发实现功能"
    ],
    [
     "运营设计发散",
     "组建系统图库，延展宣传海报"
    ],
    [
     "测试环节",
     "UI 还原度走查，确保上线结果与设计稿一致"
    ]
   ]
  },
  {
   "t": "section",
   "title": "界面原则",
   "en": "PRINCIPLES"
  },
  {
   "t": "sub",
   "num": "01",
   "title": "内容排版",
   "en": "LAYOUT"
  },
  {
   "t": "lead",
   "text": "车载以驾驶员的操作为主。功能布局尽量设计在离手最近的位置，缩短操作距离，并尽可能放大热区；展示类信息放在右侧。"
  },
  {
   "t": "fig",
   "src": "assets/hmi/hmi-zones.jpg",
   "cap": "可达范围 · 最佳交互区在左、可触控区域居中、最差交互区在最右"
  },
  {
   "t": "sub",
   "num": "02",
   "title": "层次和数量",
   "en": "HIERARCHY"
  },
  {
   "t": "lead",
   "text": "所有信息按使用场景与功能分组展示，确保按优先级交付。任何场景下都只展示尽可能少的信息，避免过多信息造成干扰，界面显示必须做到轻量化。"
  },
  {
   "t": "fig",
   "src": "assets/hmi/full/p14.jpg",
   "cap": "场景设置 · 按使用场景分组，一屏只给该场景要用的那几项"
  },
  {
   "t": "sub",
   "num": "03",
   "title": "字体",
   "en": "TYPE"
  },
  {
   "t": "lead",
   "text": "文字内容通过字号与字重区分主次关系，用户扫视时即可准确看到重点信息，应当遵循可读性与易读性。中控与驾驶员的距离处在 70 至 85 厘米之间，设计稿一定要在实车上感受，确认是否足够清晰、是否能快速识别。中控屏搭载的应用较多、显示文字相对更多，除保证文字落在可视区间内，信息层级也要排列清晰。"
  },
  {
   "t": "fig",
   "src": "assets/hmi/full/p04.jpg",
   "cap": "我的模式 · 字号字重分主次，主操作与说明一眼分得开"
  },
  {
   "t": "section",
   "title": "页面展示",
   "en": "SCREENS"
  },
  {
   "t": "page",
   "n": "1",
   "title": "首页",
   "sub": "左侧开关门，音乐常驻",
   "tags": [
    "HOME"
   ],
   "shots": [
    [
     "assets/hmi/full/p01.jpg",
     "中控首页 · 地图与音乐同屏"
    ]
   ]
  },
  {
   "t": "lead",
   "text": "左侧方便车主开关门；音乐放在首页，方便进行切换歌曲和暂停。"
  },
  {
   "t": "page",
   "n": "2",
   "title": "首页音乐展开",
   "sub": "歌单与推荐就地展开",
   "tags": [
    "MUSIC"
   ],
   "shots": [
    [
     "assets/hmi/full/p09.jpg",
     "音乐展开 · 个人歌单、每日推荐与收藏专辑"
    ]
   ]
  },
  {
   "t": "lead",
   "text": "音乐从首页就地展开，不跳转页面，避免驾驶过程中层级过深。"
  },
  {
   "t": "page",
   "n": "3",
   "title": "车辆 / 座椅",
   "sub": "大按钮降低误操作",
   "tags": [
    "SEAT"
   ],
   "shots": [
    [
     "assets/hmi/full/p12.jpg",
     "座椅 · 座椅记忆、通风加热与后排零重力"
    ]
   ]
  },
  {
   "t": "lead",
   "text": "大按钮设计，方便车主在行驶过程中不容易出错。"
  },
  {
   "t": "page",
   "n": "4",
   "title": "设置 / 声音",
   "sub": "重音位置用触摸滑块",
   "tags": [
    "SOUND"
   ],
   "shots": [
    [
     "assets/hmi/full/p18.jpg",
     "声音 · 音量、低速提示音与重音位置"
    ]
   ]
  },
  {
   "t": "lead",
   "text": "重音位置采用触摸滑块设计，方便车主对重音的位置进行准确的操作。"
  },
  {
   "t": "gallery",
   "lead": "其余页面。鼠标停在哪一列，那一列就停下来；点开看大图。",
   "shots": [
    [
     "assets/hmi/full/p02.jpg",
     "首页 · 车辆状态展开"
    ],
    [
     "assets/hmi/full/p06.jpg",
     "导航 · 路线与路况"
    ],
    [
     "assets/hmi/full/p07.jpg",
     "驾驶仪表 · 辅助驾驶状态"
    ],
    [
     "assets/hmi/full/p03.jpg",
     "来电 · 行驶中接听"
    ],
    [
     "assets/hmi/full/p05.jpg",
     "应用程序"
    ],
    [
     "assets/hmi/full/p08.jpg",
     "车辆 · 后视镜调节"
    ],
    [
     "assets/hmi/full/p10.jpg",
     "车门 / 车窗"
    ],
    [
     "assets/hmi/full/p11.jpg",
     "灯光 · 氛围灯与色温"
    ],
    [
     "assets/hmi/full/p13.jpg",
     "电池 · 续航与充电"
    ],
    [
     "assets/hmi/full/p15.jpg",
     "驾驶模式"
    ],
    [
     "assets/hmi/full/p16.jpg",
     "辅助驾驶 · 疲劳监测"
    ],
    [
     "assets/hmi/full/p17.jpg",
     "智能助理"
    ],
    [
     "assets/hmi/full/p19.jpg",
     "座椅 · 记忆与调节"
    ],
    [
     "assets/hmi/full/p20.jpg",
     "驾驶 · 能量回收与转向"
    ],
    [
     "assets/hmi/full/p21.jpg",
     "声音 · 均衡与重音"
    ],
    [
     "assets/hmi/full/p22.jpg",
     "音乐展开 · 夜间模式"
    ],
    [
     "assets/hmi/full/p23.jpg",
     "车门 / 车窗 · 夜间模式"
    ]
   ]
  }
 ]
}
};

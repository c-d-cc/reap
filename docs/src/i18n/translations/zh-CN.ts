import type { Translations } from "./en";

export const zhCN: Translations = {
  // Nav & Sidebar
  nav: {
    getStarted: "快速开始",
    groups: {
      gettingStarted: "入门",
      guide: "指南",
      collaboration: "协作",
      reference: "参考",
      other: "其他",
    },
    items: {
      introduction: "简介",
      quickStart: "快速开始",
      coreConcepts: "核心概念",
      genome: "Genome",
      environment: "Environment",
      lifecycle: "Life Cycle",
      lineage: "Lineage",
      backlog: "Backlog",
      hooks: "Hooks",
      advanced: "高级功能",
      collaborationOverview: "分布式工作流",
      mergeGeneration: "合并代",
      mergeCommands: "合并命令",
      cliReference: "CLI 参考",
      commandReference: "命令参考",
      hookReference: "Hook 参考",
      comparison: "对比",
      configuration: "配置",
      recoveryGeneration: "恢复代",
      releaseNotes: "发布说明",
    },
  },

  // Hero Page
  homeBanner: {
    text: "v0.16 即将引入重大变更",
    cta: "发布说明 →",
  },
  hero: {
    tagline: "递归进化自治流水线",
    title: "REAP",
    description: "一个 AI 与人类协作的开发流水线，通过连续的代（Generation）逐步进化应用程序。上下文在会话间持久化，开发遵循结构化的生命周期，设计文档随代码一同演进。",
    getStarted: "快速开始 →",
    whyReap: "为什么选择 REAP？",
    whyReapDesc: "AI 代理功能强大——但如果缺乏结构化管理，开发过程就会变得混乱。上下文每次会话都会重置，代码变更毫无目的地散落各处，设计文档与现实脱节，过去的经验教训也会消失殆尽。",
    problems: [
      { problem: "上下文丢失", solution: "CLAUDE.md + Memory 在每次会话中自动恢复完整的项目上下文" },
      { problem: "开发分散", solution: "每一代通过结构化的生命周期专注于一个目标" },
      { problem: "设计与代码脱节", solution: "实现过程中发现的 Genome 变更通过 backlog 反馈" },
      { problem: "经验教训遗忘", solution: "回顾总结积累在 Genome 中，Lineage 归档所有代" },
      { problem: "协作混乱", solution: "Genome 优先的合并工作流在代码冲突之前先解决设计冲突" },
    ],
    threeLayer: "四层架构",
    threeLayerDesc: "REAP 由四个相互关联的层组成：Knowledge 提供基础，Vision 驱动方向，Generation 执行工作，Civilization 是进化的成果。",
    layers: [
      { label: "Knowledge", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/", desc: "Genome（规范性——架构、约定、约束）和 Environment（描述性——技术栈、源码结构、领域）。每一代工作的基础。" },
      { label: "Vision", sub: "目标 + Memory", path: ".reap/vision/", desc: "长期目标和方向。Vision 驱动每一代——它决定下一步追求什么目标。Memory 在会话间持久化上下文。" },
      { label: "Generation", sub: "进化周期", path: ".reap/life/ → .reap/lineage/", desc: "每一代运行 Learning → Planning → Implementation → Validation → Completion。完成后归档到 lineage。" },
      { label: "Civilization", sub: "源代码", path: "your codebase/", desc: ".reap/ 之外的所有内容。代所进化的对象。经验教训反馈到 Knowledge。" },
    ],
    lifecycle: "代的生命周期",
    lifecycleDesc: "每一代经历五个阶段，从目标定义到回顾与归档。",
    stages: [
      ["Learning", "探索项目，构建上下文，审查 genome 和 environment", "01-learning.md"],
      ["Planning", "分解任务，选择方案，梳理依赖关系", "02-planning.md"],
      ["Implementation", "AI + 人类协作构建", "03-implementation.md"],
      ["Validation", "运行测试，验证完成标准", "04-validation.md"],
      ["Completion", "反思 + 适应度反馈 + 适应 genome + 归档（4 个阶段）", "05-completion.md"],
    ],
    stageHeaders: ["阶段", "执行内容", "产物"],
    installation: "安装",
    installStep1: "1. 全局安装",
    installStep2: "2. 打开 Claude Code，初始化并开始",
    installStep3: "",
    installNote: [
      { before: "", code: "/reap.evolve", after: " 运行完整的代生命周期——从 Learning 到 Completion——自主执行。你也可以使用" },
      { linkText: "阶段命令", after: "手动控制各阶段。" },
    ],
    keyConcepts: "核心概念",
    concepts: [
      { label: "Genome 不可变性", desc: "在正常代中 Genome 不会被修改。问题被记录为 genome-change backlog 项，在 Completion 的 adapt 阶段应用。（Embryo 代允许自由修改。）" },
      { label: "Backlog 与延迟", desc: ".reap/life/backlog/ 中的项目包含类型：genome-change | environment-change | task。部分完成是正常的——延迟的任务会延续到下一代。" },
      { label: "Vision 与 Memory", desc: "Vision（.reap/vision/）驱动每一代的目标。Memory 是一个三层自由格式记录系统（longterm/midterm/shortterm），供 AI 在会话间持久化上下文。" },
      { label: "Lineage", desc: "已完成的代归档在 .reap/lineage/ 中。回顾总结在此积累。随时间推移会被压缩（Level 1 → gen-XXX-{hash}.md，Level 2 → epoch.md）以保持可管理性。" },
      { label: "四层架构", desc: "Vision（目标 + memory）、Knowledge（genome + environment）、Generation（生命周期）、Civilization（源代码）。" },
      { label: "分布式工作流", desc: "多个开发者或代理在不同分支上并行工作。/reap.pull 拉取并运行 genome 优先的合并代。/reap.push 在推送前验证状态。无需服务器——Git 是传输层。" },
    ],
    documentation: "文档",
    docLinks: [
      { href: "/docs/introduction", title: "简介", desc: "什么是 REAP，为什么使用它，四层架构。" },
      { href: "/docs/quick-start", title: "快速开始", desc: "安装并一步步运行你的第一代。" },
      { href: "/docs/core-concepts", title: "核心概念", desc: "深入了解 Genome、生命周期、Backlog 与延迟。" },
      { href: "/docs/lifecycle", title: "Life Cycle", desc: "/reap.evolve、阶段命令、微循环、completion 阶段。" },
      { href: "/docs/self-evolving", title: "自进化", desc: "清晰度驱动的交互、巡航模式、memory、间隙驱动进化。" },
      { href: "/docs/command-reference", title: "命令参考", desc: "/reap.evolve、阶段命令、/reap.status——所有斜杠命令。" },
      { href: "/docs/hook-reference", title: "Hook 参考", desc: "生命周期钩子：基于文件的事件钩子、条件、排序。" },
      { href: "/docs/migration-guide", title: "迁移指南", desc: "从 v0.15 升级——支持恢复的分步迁移。" },
      { href: "/docs/comparison", title: "对比", desc: "REAP 与传统规格驱动开发工具的对比。" },
      { href: "/docs/advanced", title: "高级功能", desc: "基于签名的锁定、lineage 压缩、预设、入口模式。" },
    ],
  },

  // Introduction Page
  intro: {
    title: "简介",
    breadcrumb: "入门",
    description: "REAP（递归进化自治流水线）是一个 AI 与人类协作的开发流水线，通过连续的代逐步进化应用程序。REAP 不是将每次 AI 会话视为孤立任务，而是通过结构化的生命周期和名为 Genome 的活知识库来维持连续性。",
    threeLayer: "四层架构",
    layerItems: [
      { label: "Vision", sub: "目标 + Memory", path: ".reap/vision/" },
      { label: "Knowledge", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/" },
      { label: "Generation", sub: "进化周期", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "源代码", path: "your codebase/" },
    ],
    layerDescs: [
      "长期目标和方向。Vision 驱动每一代——它决定下一步追求什么目标。Memory 是一个三层自由格式记录系统，供 AI 在会话间持久化上下文。",
      "Genome（规范性——架构、约定、约束）和 Environment（描述性——技术栈、源码结构、领域）。每一代工作的基础。",
      "由 Vision 驱动、以 Knowledge 为基础的单个进化周期。遵循 Learning → Planning → Implementation → Validation → Completion。",
      "源代码和 .reap/ 之外的所有项目产物。代所进化的对象。经验教训反馈到 Knowledge。",
    ],
    whyReap: "为什么选择 REAP？",
    problemHeader: "问题",
    solutionHeader: "REAP 解决方案",
    problems: [
      ["上下文丢失——代理每次会话都会丢失项目上下文", "CLAUDE.md + Memory——每次会话加载 genome、environment 和 reap-guide。Memory 在会话间持久化上下文。"],
      ["开发分散——代码修改没有明确目标", "代模型——每一代通过结构化的生命周期专注于一个目标"],
      ["设计与代码脱节——文档与代码不一致", "通过 Backlog 的 Genome 变更——实现过程中记录设计缺陷，在 Completion adapt 阶段应用"],
      ["经验教训遗忘——过去工作的见解丢失", "Lineage 与 Memory——经验教训积累在 genome 和 memory 中，代被归档和压缩"],
      ["协作混乱——并行工作导致变更冲突", "分布式工作流——Genome 优先的合并在代码之前解决设计冲突，DAG lineage 追踪并行分支"],
    ],
    fourAxis: "四层架构",
    fourAxisDesc: "REAP 由四个相互关联的层组成：",
    axes: [
      { axis: "Vision", path: ".reap/vision/", desc: "长期目标和方向。目标 + memory 用于跨会话上下文。" },
      { axis: "Knowledge", path: ".reap/genome/ + .reap/environment/", desc: "Genome（规范性）+ Environment（描述性）。每一代的基础。" },
      { axis: "Generation", path: ".reap/life/", desc: "当前代的生命周期。进度状态和产物。" },
      { axis: "Civilization", path: "your codebase/ + .reap/lineage/", desc: "源代码 + 已完成代的归档。" },
    ],
    projectStructure: "项目结构",
  },

  // Quick Start Page
  quickstart: {
    title: "快速开始",
    breadcrumb: "入门",
    prerequisites: "前置条件",
    prerequisiteItems: [
      { name: "Node.js", desc: "v18 或更高版本", required: true },
      { name: "npm", desc: "随 Node.js 一起安装", required: true },
      { name: "Claude Code 或 OpenCode", desc: "AI 代理 CLI（至少需要一个）", required: true },
      { name: "Bun", desc: "替代包管理器", required: false },
    ],
    required: "必需",
    optional: "可选",
    install: "安装",
    initProject: "初始化项目",
    runFirst: "运行你的第一代",
    runFirstDesc: "在项目目录中打开 Claude Code：",
    evolveTitle: "/reap.evolve 是主要命令",
    evolveDesc: "它自主运行整个代的生命周期——Learning、Planning、Implementation、Validation 和 Completion。AI 代理驱动所有阶段，仅在真正遇到阻碍时才停下。这是日常开发中最常用的命令。",
    manualControl: "手动阶段控制",
    manualControlDesc: "你也可以单独控制每个阶段：",
    whatHappens: "一代中会发生什么",
    stageHeaders: ["阶段", "执行内容", "产物"],
    stages: [
      ["Learning", "探索项目，构建上下文，审查 genome 和 environment", "01-learning.md"],
      ["Planning", "分解任务，选择方案，梳理依赖关系", "02-planning.md"],
      ["Implementation", "AI + 人类协作构建", "03-implementation.md"],
      ["Validation", "运行测试，验证完成标准", "04-validation.md"],
      ["Completion", "反思、收集适应度反馈、适应 genome、归档", "05-completion.md"],
    ],
    commandLoading: "命令加载方式",
    commandLoadingDesc: "REAP 斜杠命令仅在 REAP 项目中加载——不会出现在非 REAP 项目中。",
    commandLoadingDetails: [
      { label: "来源", desc: "命令原文件存储在 ~/.reap/commands/（由 reap init 和 reap update 安装）" },
      { label: "加载", desc: "打开 REAP 项目时，会话钩子自动将命令符号链接到 .claude/commands/" },
      { label: "非 REAP 项目", desc: "不创建符号链接，因此 AI 代理的技能列表中不会出现 REAP 技能" },
      { label: "向后兼容", desc: "~/.claude/commands/ 中的重定向存根确保旧版设置在迁移期间继续工作" },
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "核心概念",
    breadcrumb: "指南",
    fourAxisTitle: "四层架构",
    fourAxisDesc: "REAP 由四个相互关联的层组成：",
    axes: [
      { axis: "Vision", path: ".reap/vision/", desc: "长期目标和方向。目标驱动每一代。Memory 在会话间持久化上下文。", href: "/docs/self-evolving" },
      { axis: "Knowledge", path: ".reap/genome/ + .reap/environment/", desc: "Genome（规范性——如何构建）+ Environment（描述性——现有内容）。每一代的基础。", href: "/docs/genome" },
      { axis: "Generation", path: ".reap/life/", desc: "由 Vision 驱动、以 Knowledge 为基础的单个进化周期。遵循 Learning → Planning → Implementation → Validation → Completion。", href: "/docs/lifecycle" },
      { axis: "Civilization", path: "your codebase/", desc: "源代码和 .reap/ 之外的所有项目产物。代所进化的对象。经验教训反馈到 Knowledge。", href: "/docs/lineage" },
    ],
    principlesTitle: "核心原则",
    principles: [
      { name: "Genome 不可变性", desc: "在正常代中不会被修改。变更通过 backlog → Completion adapt 阶段。（Embryo 代允许自由修改。）" },
      { name: "人类评判适应度", desc: "没有定量指标。人类的自然语言反馈是唯一的适应度信号。" },
      { name: "清晰度驱动的交互", desc: "AI 根据上下文的清晰程度调整沟通深度——从主动对话到自主执行。详见自进化功能。" },
    ],
    lifecycleTitle: "生命周期概览",
    lifecycleDesc: "每一代遵循五个阶段，每个阶段产生产物：",
    stageHeaders: ["阶段", "执行内容", "产物"],
    stages: [
      ["Learning", "探索项目，构建上下文，审查 genome 和 environment", "01-learning.md"],
      ["Planning", "任务分解 + 实现方案", "02-planning.md"],
      ["Implementation", "AI + 人类协作编码", "03-implementation.md"],
      ["Validation", "运行测试，验证完成标准", "04-validation.md"],
      ["Completion", "反思 + 适应度反馈 + 适应 genome + 归档（4 个阶段）", "05-completion.md"],
    ],
    sessionInitTitle: "会话上下文加载",
    sessionInitDesc: "打开 REAP 项目时，CLAUDE.md 会指示 AI 代理读取 genome、environment 和 REAP 指南。代理立即加载项目知识并了解当前状态。",
    sessionInitAlt: "REAP 会话上下文加载——通过 CLAUDE.md 加载 genome、environment 和指南",
    evolutionFlowTitle: "进化流程",
    evolutionFlowDesc: "知识在代与代之间积累。每一代进化 Genome，经验教训积累在 Lineage 中：",
  },

  // Workflow Page
  workflow: {
    title: "工作流",
    breadcrumb: "指南",
    intro: "代是 REAP 中的基本工作单元。每一代携带一个目标经历五个阶段，沿途产生产物。以下是每个阶段的内容及其关联方式。",
    evolveTitle: "/reap.evolve——主要的工作方式",
    evolveDesc: "大多数时候，你运行 /reap.evolve 让 AI 代理自主驱动所有阶段。它可以将整代委托给一个子代理，该子代理运行所有阶段，仅在真正遇到阻碍时才浮现（目标模糊、重大权衡、genome 冲突或意外错误）。子代理处理启动、执行每个阶段、推进和归档。",
    evolveNote: "如需精细控制，你可以运行单个阶段命令。详见命令参考。",
    stageWalkthrough: "逐阶段说明",
    stageDetails: [
      {
        title: "1. Learning",
        desc: "探索项目并构建上下文。AI 审查 genome、environment、lineage，并评估清晰度级别。在设定任何目标之前，先建立对当前状态的全面了解。",
        output: "01-learning.md——上下文探索、genome/environment 审查、清晰度评估。",
      },
      {
        title: "2. Planning",
        desc: "将目标分解为可执行的任务。AI 读取 learning 的上下文，参考 genome 约定和约束，提出包含架构决策的实现方案。",
        output: "02-planning.md——分阶段任务列表、依赖关系、可并行任务标记 [P]。",
      },
      {
        title: "3. Implementation",
        desc: "编写代码。任务按顺序执行，每项完成后立即记录。发现 genome 或 environment 缺陷时，记录到 backlog——从不直接应用。依赖待处理 genome 变更的任务标记为 [deferred]。",
        output: "03-implementation.md——已完成任务表、延迟任务、genome-change backlog 项。",
      },
      {
        title: "4. Validation",
        desc: "验证工作。运行测试、lint、构建和类型检查。检查完成标准并应用小修复（5 分钟以内，无设计变更）。判定为通过、部分通过（部分标准延迟）或失败。",
        output: "04-validation.md——包含实际命令输出的测试结果、标准检查表、判定结果。",
      },
      {
        title: "5. Completion（4 个阶段）",
        desc: "Reflect：撰写回顾总结 + 刷新 environment。Fitness：收集人类反馈（或巡航模式下的自我评估）。Adapt：审查 genome，应用 backlog 变更，提出下一代目标。Commit：归档到 lineage + git commit。",
        output: "05-completion.md——回顾总结、适应度反馈、genome 变更日志、下一代提示。",
      },
    ],
    microLoop: "微循环（回退）",
    microLoopDesc: "任何阶段都可以回退到前一个阶段。这很常见——验证失败回到实现，或实现中发现规划缺陷回到规划。回退原因记录在时间线和目标产物中。",
    artifactHandling: "回退时的产物处理：",
    artifactRules: [
      { label: "目标阶段之前：", desc: "保持不变" },
      { label: "目标阶段：", desc: "被覆盖（implementation 仅追加）" },
      { label: "目标阶段之后：", desc: "保留，重新进入时覆盖" },
    ],
    minorFix: "小修复",
    minorFixDesc: "微小问题（拼写错误、lint 错误等）可以在当前阶段直接修复而无需回退，前提是可在 5 分钟内解决且无需设计变更。修复记录在阶段产物中。",
    roleSeparation: "角色分离",
    roleHeaders: ["角色", "职责"],
    roles: [
      ["CLI (reap)", "项目设置和维护——init、status、run"],
      ["AI 代理", "工作流执行者——通过斜杠命令执行每个阶段的工作"],
      ["人类", "决策者——设定目标、审查代码、提供适应度反馈"],
    ],
  },

  // CLI Page
  cli: {
    title: "CLI 参考",
    breadcrumb: "参考",
    initTitle: "reap init",
    initDesc: "初始化新的 REAP 项目。自动检测 greenfield（空项目）或 adoption（现有代码库）。创建 .reap/ 结构并安装斜杠命令和钩子。",
    initHeaders: ["选项", "值", "描述"],
    initOptions: [
      ["--mode", "greenfield | adoption", "覆盖自动检测的项目入口模式"],
      ["--repair", "", "修复损坏的 .reap/ 结构而无需重新初始化"],
      ["--migrate", "", "从 v0.15 迁移到 v0.16 结构"],
    ],
    statusTitle: "reap status",
    statusDesc: "显示当前项目和代的状态。",
    statusNote: "显示项目名称、活跃代（id、目标、阶段）、已完成代总数和 REAP 版本。",
    runTitle: "reap run",
    runDesc: "直接执行生命周期命令。供斜杠命令内部使用以及精细的阶段控制。",
    runNote: "示例：reap run start --goal \"...\"、reap run learning、reap run completion --phase reflect。每个命令返回结构化的 JSON 指令给 AI 代理。",
    fixTitle: "reap fix",
    fixDesc: "诊断和修复 .reap/ 目录结构。使用 --check 进行只读模式（报告问题但不修复）。",
    fixNote: "检查缺失的目录、验证 config.yml 存在、验证 current.yml 阶段，并重建缺失的结构。使用 --check 时，执行结构完整性检查但不修改。",
    cleanTitle: "reap clean",
    cleanDesc: "以交互方式重置 REAP 项目。",
    cleanNote: "提供交互式提示，可选择性地重置 REAP 项目的部分内容（如 life、lineage、genome）。",
    destroyTitle: "reap destroy",
    destroyDesc: "从项目中移除所有 REAP 文件。",
    destroyNote: "完全移除 .reap/ 目录和项目中所有 REAP 相关文件。需要输入 \"yes destroy\" 确认。",
    makeBacklogTitle: "reap make backlog",
    makeBacklogDesc: "创建 backlog 项。这是创建 backlog 文件的唯一支持方式。",
    makeBacklogNote: "选项：--type <genome-change|environment-change|task> --title <title> [--body <body>] [--priority <priority>]。切勿直接创建 backlog 文件。",
    cruiseTitle: "reap cruise",
    cruiseDesc: "设置巡航模式——预批准 N 代用于自主执行。",
    cruiseNote: "用法：reap cruise <count>。每一代运行完整生命周期并自我评估。如检测到不确定性或风险，巡航会暂停并请求人类反馈。",
    helpTitle: "reap help",
    helpDesc: "打印 CLI 命令、斜杠命令和工作流摘要。",
    helpNote: "以配置的语言输出帮助文本（目前支持 en 和 ko）。如果找不到语言文件，回退到英文。",
  },

  // Command Reference Page
  commands: {
    title: "命令参考",
    breadcrumb: "参考",
    intro: "REAP 有两种类型的命令：CLI 命令和斜杠命令。",
    cliCommandsDesc: "CLI 命令（reap ...）在终端中运行。它们处理项目设置和维护——init、status、run、fix、clean、destroy、make backlog、cruise。它们不与 AI 代理交互。",
    slashCommandsDesc: "斜杠命令（/reap.*）在 AI 代理 CLI（Claude Code）中运行。它们驱动开发工作流——AI 代理读取提示并与你交互执行所述任务。",
    slashTitle: "斜杠命令",
    slashIntro: "所有 REAP 交互通过 /reap.* 斜杠命令进行。这是用户和 AI 代理的主要接口。",
    commandHeaders: ["命令", "描述"],
    normalTitle: "生命周期命令",
    normalCommands: [
      ["/reap.evolve", "运行整代生命周期（推荐）。日常开发的主要命令。循环遍历所有阶段——learning、planning、implementation、validation、completion。"],
      ["/reap.start", "开始新的一代。提示输入目标，创建 current.yml，并将阶段设置为 learning。"],
      ["/reap.next", "推进到下一个生命周期阶段。在推进前验证产物存在和 nonce 链。"],
      ["/reap.back", "返回前一个阶段（微循环）。用法：/reap.back [--reason \"<reason>\"]"],
      ["/reap.abort", "中止当前代。两阶段流程：确认（显示将发生什么）然后执行。选项：--phase execute、--reason、--source-action <rollback|stash|hold|none>、--save-backlog。"],
    ],
    mergeTitle: "协作命令",
    mergeCommands: [
      ["/reap.merge", "并行分支的合并生命周期。用法：/reap.merge [--type merge --parents \"<branchA>,<branchB>\"]"],
      ["/reap.pull", "拉取远程变更并检测合并机会。"],
      ["/reap.push", "验证 REAP 状态（如果代正在进行中则发出警告）并将当前分支推送到远程。"],
    ],
    generalTitle: "通用命令",
    generalCommands: [
      ["/reap.init", "在项目中初始化 REAP。自动检测 greenfield 或现有代码库。"],
      ["/reap.knowledge", "管理 genome、environment 和上下文知识。子命令：reload、genome、environment。"],
      ["/reap.config", "查看/编辑项目配置（.reap/config.yml）。"],
      ["/reap.status", "检查当前代状态、阶段进度和 backlog 摘要。"],
      ["/reap.help", "显示可用命令和主题。"],
      ["/reap.run", "直接执行生命周期命令。用于精细的阶段和 phase 控制。"],
      ["/reap.update", "运行从 v0.15 到 v0.16 的迁移。"],
    ],
    commandStructure: "脚本编排器架构",
    commandStructureDesc: "每个斜杠命令是一个调用 reap run <cmd> 的单行 .md 包装器。TypeScript 脚本处理所有确定性逻辑并返回结构化的 JSON 指令给 AI 代理。模式：Gate（前置条件检查）→ Steps（工作执行）→ Artifact（记录到 .reap/life/）。",
  },

  // Recovery Generation Page
  recovery: {
    title: "恢复代",
    breadcrumb: "其他",
    intro: "恢复代是一种特殊的代类型，当发现错误或不一致时，审查并纠正过去代的产物。它使用 type: recovery 并通过 recovers 字段引用目标代。",
    triggerTitle: "如何触发",
    triggerDesc: "使用 /reap.evolve.recovery 命令并指定目标代 ID。系统审查目标的产物，仅在需要纠正时创建恢复代。",
    criteriaTitle: "审查标准",
    criteriaHeaders: ["标准", "描述"],
    criteriaItems: [
      ["产物不一致", "同一代中产物之间的矛盾（例如，目标与实现设计不匹配）"],
      ["结构缺陷", "产物中缺失的部分、不完整的内容或格式错误"],
      ["人类指定的纠正", "用户明确要求的纠正"],
    ] as string[][],
    processTitle: "流程",
    processDesc: "恢复命令分两个阶段运行：审查（根据标准分析产物）和创建（如果发现问题则启动恢复代）。",
    processFlow: `/reap.evolve.recovery gen-XXX
  → 加载目标代的 lineage 产物
  → 根据 3 个标准审查
  → 发现问题 → 自动启动恢复代（type: recovery）
  → 无问题   → "无需恢复"（不创建代）`,
    stagesTitle: "阶段用途对比",
    stagesDesc: "恢复代遵循与正常代相同的 5 阶段生命周期，但每个阶段的用途不同。",
    stageHeaders: ["阶段", "正常代", "恢复代"],
    stageItems: [
      ["Learning", "探索项目，构建上下文", "审查目标代产物，识别需要纠正的内容"],
      ["Planning", "任务分解", "列出需要审查的文件/逻辑 + 验证标准"],
      ["Implementation", "编写代码", "审查并纠正现有代码"],
      ["Validation", "验证", "纠正后验证"],
      ["Completion", "回顾总结", "回顾总结 + 为原始代添加纠正记录"],
    ] as string[][],
    currentYmlTitle: "current.yml 扩展",
    currentYmlDesc: "恢复代在 current.yml 和 meta.yml 中添加 recovers 字段。parents 字段遵循正常的 DAG 规则，而 recovers 单独引用纠正目标。",
    notesTitle: "注意事项",
    notes: [
      "不影响现有的正常/合并代",
      "相同的 lineage 压缩规则适用于恢复代",
      "恢复代产生与正常代相同的 5 个产物",
      "目标自动引用目标代的原始目标 + completion",
    ],
  },

  // Configuration Page
  config: {
    title: "配置",
    breadcrumb: "参考",
    intro: "REAP 项目通过 .reap/config.yml 配置。此文件在 reap init 时创建，控制项目设置、严格模式和代理集成。",
    structure: "配置文件结构",
    fields: "字段",
    fieldHeaders: ["字段", "描述"],
    fieldItems: [
      ["project", "项目名称（初始化时设置）"],
      ["language", "产物和用户交互的语言（如 korean、english、japanese）。默认：english"],
      ["autoSubagent", "通过 Agent 工具自动将 /reap.evolve 委托给子代理（默认：true）"],
      ["strictEdit", "将代码变更限制在 REAP 生命周期内（默认：false）。见下方严格模式。"],
      ["strictMerge", "限制直接使用 git pull/push/merge——改用 REAP 命令（默认：false）。见下方严格模式。"],
      ["agentClient", "使用的 AI 代理客户端（默认：claude-code）。决定技能部署和会话钩子使用哪个适配器"],
      ["cruiseCount", "存在时启用巡航模式。格式：当前/总计（如 1/5）。巡航完成后自动移除"],
    ],
    strictMode: "严格模式",
    strictModeDesc: "严格模式控制 AI 代理被允许做什么。两个独立设置：",
    strictConfigExample: `strictEdit: true    # 将代码变更限制在 REAP 生命周期内
strictMerge: true   # 限制直接使用 git pull/push/merge`,
    strictEditTitle: "strictEdit——代码修改控制",
    strictEditDesc: "启用时，AI 代理无法在 REAP 工作流之外修改代码。",
    strictHeaders: ["场景", "行为"],
    strictRules: [
      ["无活跃代 / 非 implementation 阶段", "代码修改被完全阻止"],
      ["Implementation 阶段", "仅允许在 02-planning.md 范围内的修改"],
      ["紧急通道", "用户明确要求 \"override\" 或 \"bypass strict\"——绕过仅适用于该特定操作，随后严格模式重新生效"],
    ],
    strictMergeTitle: "strictMerge——Git 命令控制",
    strictMergeDesc: "启用时，直接使用 git pull、git push 和 git merge 命令受限。代理会引导用户改用 REAP 斜杠命令（/reap.pull、/reap.push、/reap.merge）。",
    strictNote: "两者默认都禁用。无论严格模式如何，读取文件、分析代码和回答问题始终被允许。",
    entryModes: "入口模式",
    entryModeHeaders: ["模式", "使用场景"],
    entryModeItems: [
      ["greenfield", "从零开始的新项目"],
      ["adoption", "将 REAP 应用到现有代码库"],
      ["migration", "从现有系统迁移到新架构"],
    ],
  },

  // Hook Reference Page
  hooks: {
    title: "Hooks",
    breadcrumb: "指南",
    intro: "REAP hooks 允许你在关键生命周期事件时运行自动化。Hooks 作为单独文件存储在 .reap/hooks/ 中，AI 代理在适当时刻执行它们。",
    hookTypes: "Hook 类型",
    hookTypesIntro: "每个 hook 文件根据扩展名支持两种类型之一：",
    commandType: "command (.sh)",
    commandTypeDesc: "Shell 脚本。由 AI 代理在项目根目录中执行。用于脚本、CLI 工具、构建命令。",
    promptType: "prompt (.md)",
    promptTypeDesc: "Markdown 格式的 AI 代理指令。代理读取提示并执行所述任务——代码分析、文件修改、文档更新等。用于需要判断力的任务。",
    hookTypeNote: "每个 hook 是一个单独的文件。同一事件的多个 hooks 按 frontmatter 中指定的顺序执行。",
    fileNaming: "文件命名",
    fileNamingDesc: "Hook 文件遵循模式：.reap/hooks/{event}.{name}.{md|sh}",
    fileNamingFrontmatter: "每个 hook 文件支持可选的 YAML frontmatter：",
    frontmatterHeaders: ["字段", "描述"],
    frontmatterItems: [
      ["condition", ".reap/hooks/conditions/ 中条件脚本的名称（如 always、has-code-changes、version-bumped）"],
      ["order", "同一事件有多个 hooks 时的数字执行顺序（默认：50，数字越小越先执行）"],
    ],
    events: "事件",
    normalEventsTitle: "正常生命周期事件",
    mergeEventsTitle: "合并生命周期事件",
    eventHeaders: ["事件", "触发时机"],
    eventItems: [
      ["onLifeStarted", "/reap.start 创建新代之后"],
      ["onLifeLearned", "learning 阶段完成后"],
      ["onLifePlanned", "planning 阶段完成后"],
      ["onLifeImplemented", "implementation 阶段完成后"],
      ["onLifeValidated", "validation 阶段完成后"],
      ["onLifeCompleted", "completion + 归档后（在 git commit 之后运行）"],
      ["onLifeTransited", "任何阶段转换后（通用）"],
      ["onMergeStarted", "合并代创建后"],
      ["onMergeDetected", "detect 阶段完成后"],
      ["onMergeMated", "mate 阶段完成后（genome 已解决）"],
      ["onMergeMerged", "merge 阶段完成后（源码已合并）"],
      ["onMergeReconciled", "reconcile 阶段完成后（genome-源码一致性已验证）"],
      ["onMergeValidated", "合并验证完成后"],
      ["onMergeCompleted", "合并 completion + 归档后"],
      ["onMergeTransited", "任何合并阶段转换后（通用）"],
    ],
    configuration: "基于文件的配置",
    configurationDesc: "Hooks 基于文件——存储在 .reap/hooks/ 中，而非 config.yml。每个 hook 是一个命名为 {event}.{name}.{md|sh} 的文件。",
    configExample: `.reap/hooks/
├── onLifeCompleted.reap-update.sh
├── onLifeCompleted.docs-update.md
├── onLifeImplemented.lint-check.sh
└── onMergeMated.notify.md

# 示例：.md hook（AI 提示）
# ---
# condition: has-code-changes
# order: 30
# ---
# 审查变更并在需要时更新文档。

# 示例：.sh hook（shell 脚本）
# #!/bin/bash
# # condition: always
# # order: 20
# reap update`,
    hookSuggestion: "自动 Hook 建议",
    hookSuggestionDesc: "在 Completion 阶段（Phase 5: Hook Suggestion），REAP 检测跨代的重复模式——如反复出现的手动步骤、重复的命令或一致的阶段后操作。当检测到模式时，REAP 建议创建 hook 来自动化它。Hook 创建始终需要用户确认后才能应用。",
    sessionStart: "会话上下文加载",
    sessionStartDesc1: "REAP 在 CLAUDE.md 中添加一个部分，指示 AI 代理在每次会话开始时读取 genome、environment 和 REAP 指南。这确保代理始终拥有完整的项目上下文。",
    sessionStartDesc2: "REAP 指南（~/.reap/reap-guide.md）全局安装，在包升级时自动更新。CLAUDE.md 在 'reap init' 时创建或更新。",
    sessionStartNote: "",
    executionNotes: "执行说明",
    executionItems: [
      "Hooks 由 AI 代理执行，而非 CLI。代理扫描 .reap/hooks/ 查找匹配的文件。",
      ".sh 文件作为 shell 脚本在项目根目录中运行。",
      ".md 文件作为 AI 提示被读取并由代理遵循执行。",
      "同一事件内的 hooks 按顺序运行（frontmatter 'order' 字段，数字越小越先执行）。",
      "条件通过 .reap/hooks/conditions/{name}.sh 评估（exit 0 = 运行，非零 = 跳过）。",
      "onLifeCompleted/onMergeCompleted hooks 在 git commit 之后运行——hooks 产生的文件变更将处于未提交状态。",
    ],
  },

  // Advanced Page
  advanced: {
    title: "高级功能",
    breadcrumb: "指南",
    signatureTitle: "基于签名的锁定",
    signatureDesc: "REAP 使用加密 nonce 链来强制阶段排序。没有有效的 nonce，AI 代理无法推进到下一阶段——即使它试图跳过。",
    signatureFlow: `Stage Command          current.yml              /reap.next
─────────────          ───────────              ──────────
generate nonce ──────→ store hash(nonce)
return nonce to AI                         ←── AI passes nonce
                                               verify hash(nonce)
                                               ✓ advance stage`,
    signatureHow: "工作原理",
    signatureHowItems: [
      "阶段命令（如 /reap.objective）生成一个随机 nonce",
      "nonce 的 SHA-256 哈希存储在 current.yml 中",
      "nonce 在 JSON 响应中返回给 AI 代理",
      "/reap.next 接收 nonce，计算哈希，并与 current.yml 对比",
      "匹配 → 阶段推进。不匹配 → 拒绝。",
    ],
    signatureComparisonTitle: "仅提示 vs 基于签名",
    signatureComparisonHeaders: ["威胁", "仅提示", "基于签名"],
    signatureComparisonItems: [
      ["跳过阶段", "依赖 AI 合规性", "被阻止——没有有效的 nonce"],
      ["伪造令牌", "不适用", "不可行——单向哈希"],
      ["重放旧 nonce", "不适用", "被阻止——一次性，绑定阶段"],
      ["提示注入", "有漏洞", "nonce 在提示上下文之外"],
    ],
    compressionTitle: "Lineage 压缩",
    compressionDesc: "随着代的积累，lineage 归档在 Completion 阶段自动压缩。",
    compressionHeaders: ["级别", "输入", "输出", "触发条件", "保护"],
    compressionItems: [
      ["Level 1", "代文件夹（5 个产物）", "gen-XXX-{hash}.md（40 行）", "lineage > 5,000 行 + 5 代以上", "最近 3 个 + DAG 叶节点"],
      ["Level 2", "100+ Level 1 文件", "单个 epoch.md", "Level 1 文件 > 100", "最近 9 个 + 分叉点"],
    ],
    compressionProtection: "DAG 保留：Level 1 文件在 frontmatter 中保留元数据。Level 2 epoch.md 存储代哈希链。分叉保护：在 Level 2 压缩前扫描所有本地/远程分支——分叉点受保护。经过 epoch 压缩的代不能用作合并基础。",
    presetsTitle: "预设",
    presetsDesc: "预设为常见技术栈提供预配置的 Genome 和项目脚手架。",
    presetsNote: "bun-hono-react 预设为 Bun + Hono + React 技术栈配置 Genome，包括适当的架构原则、约定和约束。",
    entryModes: "入口模式",
    entryModesDesc: "通过 reap init --mode 指定。控制 Genome 的初始结构方式。",
    entryModeHeaders: ["模式", "描述"],
    entryModeItems: [
      ["greenfield", "从零开始构建新项目。默认模式。Genome 从空开始逐步增长。"],
      ["migration", "参考现有系统重新构建。Genome 以现有系统分析为种子。"],
      ["adoption", "将 REAP 应用到现有代码库。Genome 从模板开始，在第一代的 Learning 阶段填充。"],
    ],
  },

  // Distributed Workflow - Overview
  collaboration: {
    title: "分布式工作流",
    breadcrumb: "协作",
    intro: "REAP 支持协作环境下的分布式工作流，多个开发者或 AI 代理在同一项目上并行工作——无需中央服务器。Git 是唯一的传输层。",
    caution: "分布式工作流目前处于早期阶段，需要进一步测试。在生产环境中请谨慎使用。我们正在积极收集用户反馈——请在以下地址报告问题或建议",
    cautionLink: "GitHub Issues",
    cautionUrl: "https://github.com/c-d-cc/reap/issues",
    howItWorks: "工作原理",
    howItWorksDesc: "每个开发者或代理在自己的分支和代上独立工作。需要合并时，REAP 以 genome 优先策略编排合并。",
    flowSteps: [
      "机器 A 在 branch-a 上完成 gen-046-a → /reap.push",
      "机器 B 在 branch-b 上完成 gen-046-b → /reap.push",
      "机器 A 运行 /reap.pull branch-b → 拉取 + 完整合并代生命周期",
    ],
    principles: "核心原则",
    principleItems: [
      { label: "可选加入", desc: "git pull/push 始终正常工作。REAP 命令是附加的——你选择何时使用分布式工作流。" },
      { label: "Genome 优先", desc: "在源码合并之前先解决 Genome 冲突。就像在更新法律之前先修改宪法。" },
      { label: "无需服务器", desc: "一切都在本地 + Git。没有外部服务，没有中央协调。" },
      { label: "DAG lineage", desc: "每一代通过基于哈希的 ID（gen-046-a3f8c2）引用其父代，形成一个天然支持并行工作的有向无环图。" },
    ],
    scenarios: "使用场景",
    scenarioItems: [
      { label: "远程分支（多机器）", desc: "不同的开发者或代理在不同机器上工作并推送到远程分支。使用 /reap.push 发布，/reap.pull <branch> 拉取并合并。", example: "/reap.push → /reap.pull branch-b" },
      { label: "本地 worktree（多代理）", desc: "多个 AI 代理使用 git worktree 在同一机器上并行工作。每个 worktree 有自己的分支和代。使用 /reap.merge.start 直接合并——无需拉取。", example: "/reap.merge.start worktree-branch" },
      { label: "混合", desc: "部分工作在本地（worktree），部分在远程（其他机器）。根据需要组合使用 /reap.pull（远程分支）和 /reap.merge.start（本地分支）。" },
    ],
    pullPush: "Pull 与 Push（远程）",
    pullDesc: "/reap.pull <branch> 是 /reap.evolve 的分布式等价物。它拉取远程，检测新代，并运行完整的合并代生命周期——从 Detect 到 Completion。",
    pushDesc: "/reap.push 验证当前 REAP 状态（如果代正在进行中则发出警告）并将当前分支推送到远程。",
    merge: "Merge（本地 / Worktree）",
    mergeDesc: "/reap.merge.start <branch> 直接从本地分支创建合并代——非常适合基于 worktree 的并行开发，无需拉取。使用 /reap.merge.evolve 运行完整的合并生命周期，或逐阶段手动执行。",
    gitRefReading: "基于 Git Ref 的读取",
    gitRefDesc: "合并前，目标分支的 genome 和 lineage 通过 git refs（git show、git ls-tree）读取——无需 checkout。这适用于远程和本地分支。",
  },

  // Distributed Workflow - Merge Lifecycle
  mergeGeneration: {
    title: "合并代",
    breadcrumb: "协作",
    intro: "当分叉的分支需要合并时，REAP 运行一个专门的 6 阶段生命周期，称为合并代——与正常代的生命周期分开。核心原则：先对齐 genome，再合并源代码。",
    whyLonger: "为什么合并代与普通 git merge 不同？",
    whyLongerDesc: "普通的 git merge 只解决源代码冲突。但当两个分支独立进化——各自有自己的代、genome 变更和设计决策——仅合并源代码是不够的。Genome（架构原则、约定、约束、业务规则）可能也已经分歧。合并代在源码合并前增加了三个关键步骤：检测 genome 分歧、配对（解决 genome 冲突）、以及合并后验证 genome-源码一致性。这确保合并后的代码库不仅能编译通过，而且设计上也是一致的。",
    whyGenomeFirst: "为什么 genome 对齐要先行",
    whyGenomeFirstDesc: "解决源代码冲突并不能保证不存在语义冲突。两段代码可以干净地合并——完全没有 git 冲突——但在意图、架构或业务逻辑上相互矛盾。只有基于 genome 的推理才能检测到这些隐形冲突：合并后的代码是否仍然遵循架构原则？约定是否一致？业务规则是否对齐？这就是为什么 REAP 在处理源代码之前先对齐 genome。一旦 genome 确定，它就成为解决源码冲突的权威指南——不仅在语法层面，更在语义层面。",
    whyLongerPoints: [
      { label: "普通 git merge", desc: "源码冲突 → 解决 → 提交。不检查设计一致性。语义冲突不会被发现。" },
      { label: "合并代", desc: "先对齐 Genome → genome 引导下的源码合并 → 验证 genome-源码一致性 → 验证 → 提交。捕获隐形语义冲突。" },
    ],
    stageOrder: "阶段顺序",
    stages: [
      { name: "Detect", desc: "通过 git refs 扫描目标分支。使用 DAG BFS 查找共同祖先。提取 genome 差异。将冲突分类为 WRITE-WRITE 或 CROSS-FILE。", artifact: "01-detect.md" },
      { name: "Mate", desc: "向人类展示所有 genome 冲突。对于 WRITE-WRITE：选择 A、B 或手动合并。对于 CROSS-FILE：检查逻辑兼容性。genome 必须在继续之前完全解决。", artifact: "02-mate.md" },
      { name: "Merge", desc: "使用 git merge --no-commit 与目标分支合并。在最终确定的 genome 指导下解决源码冲突。检查语义冲突——能编译但与 genome 矛盾的代码。", artifact: "03-merge.md" },
      { name: "Reconcile", desc: "合并后验证 genome-源码一致性。AI 对比 genome 和源代码。用户确认发现的任何不一致。如存在问题，回退到 Merge 或 Mate。", artifact: "04-reconcile.md" },
      { name: "Validation", desc: "运行所有自动化测试命令（test、lint、build、type check）。如有失败，回退到 Merge 或 Mate。", artifact: "05-validation.md" },
      { name: "Completion", desc: "提交合并结果。在 meta.yml 中记录合并，包含 type: merge 和双亲。归档到 lineage。", artifact: "06-completion.md" },
    ],
    stageHeaders: ["阶段", "执行内容", "产物"],
    conflictTypes: "冲突类型",
    conflictHeaders: ["类型", "描述", "解决方式"],
    conflicts: [
      ["WRITE-WRITE", "同一 genome 文件在两个分支上都被修改", "人类决定：保留 A、保留 B 或合并"],
      ["CROSS-FILE", "不同的 genome 文件被修改，但两个分支都更改了 genome", "人类审查逻辑兼容性"],
      ["源码冲突", "源代码中的 git merge 冲突", "在最终确定的 genome 指导下解决"],
      ["语义冲突", "代码合并干净但与 genome（架构、约定、业务规则）矛盾", "在 Reconcile 阶段检测——AI 对比 genome 和源码，用户确认解决方案"],
      ["无冲突", "无 genome 或源码冲突", "自动继续"],
    ],
    regression: "合并回退",
    regressionDesc: "Validation 或 Reconcile 失败可以回退到 Merge 或 Mate。Merge 可以在发现 genome 问题时回退到 Mate。回退规则遵循与正常代相同的模式——原因记录在时间线和产物中。",
    currentYml: "current.yml 结构（合并）",
  },

  // Distributed Workflow - Merge Commands
  mergeCommands: {
    title: "合并命令",
    breadcrumb: "协作",
    intro: "所有分布式工作流操作都是由 AI 代理执行的斜杠命令。没有用于合并的 CLI 命令——AI 代理对于 genome 冲突解决和源码合并指导是必不可少的。",
    primaryCommands: "主要命令",
    primaryItems: [
      { cmd: "/reap.pull <branch>", desc: "分布式合并的一站式命令。拉取远程，检测目标分支上的新代，创建合并代，并运行完整的合并生命周期。这是 /reap.evolve 的分布式等价物。" },
      { cmd: "/reap.merge <branch>", desc: "为本地分支运行完整的合并代。无需拉取——非常适合基于 worktree 的并行开发。/reap.pull 的本地等价物。" },
      { cmd: "/reap.push", desc: "验证 REAP 状态（如果代正在进行中则发出警告）并推送当前分支。在完成一代后使用。" },
    ],
    stageCommands: "阶段命令（精细控制）",
    stageItems: [
      { cmd: "/reap.merge.start", desc: "为目标分支创建合并代。运行 detect 并生成 01-detect.md。" },
      { cmd: "/reap.merge.detect", desc: "审查分歧报告。如需要可重新运行。" },
      { cmd: "/reap.merge.mate", desc: "与人类交互解决 genome 冲突。" },
      { cmd: "/reap.merge.merge", desc: "运行 git merge --no-commit 并解决源码冲突。" },
      { cmd: "/reap.merge.reconcile", desc: "验证 genome-源码一致性。AI 对比 genome 和源码，用户确认不一致。" },
      { cmd: "/reap.merge.validation", desc: "运行自动化测试（bun test、tsc、build）。失败时回退。" },
      { cmd: "/reap.merge.completion", desc: "提交并归档合并代。" },
      { cmd: "/reap.merge.evolve", desc: "从当前阶段运行合并生命周期到完成。" },
    ],
    mergeHooks: "合并 Hooks",
    mergeHookHeaders: ["事件", "触发时机"],
    mergeHookItems: [
      ["onMergeStarted", "/reap.merge.start 创建合并代后"],
      ["onMergeDetected", "detect 阶段完成后"],
      ["onMergeMated", "mate 阶段完成后（genome 已解决）"],
      ["onMergeMerged", "merge 阶段完成后（源码已合并）"],
      ["onMergeReconciled", "reconcile 阶段完成后（genome-源码一致性已验证）"],
      ["onMergeValidated", "合并验证完成后"],
      ["onMergeCompleted", "合并 completion + 归档后"],
      ["onMergeTransited", "任何合并阶段转换后（通用）"],
    ],
    mergeHookNote: "onMergeTransited 在每次合并阶段转换时触发，类似于正常生命周期的 onLifeTransited。",
  },

  // Comparison Page
  comparison: {
    title: "对比",
    breadcrumb: "入门",
    heading: "与 Spec Kit 的对比",
    desc: "Spec Kit 开创了规格驱动开发——在编码前编写规格说明。REAP 在此概念基础上构建并解决了关键局限性：",
    items: [
      { title: "静态规格 vs 活 Genome", desc: "传统工具将规格视为静态文档。REAP 的 Genome 是一个活系统——实现过程中发现的缺陷通过 backlog 反馈并在 Completion 时应用。设计随代码一同演进。" },
      { title: "无跨会话记忆", desc: "大多数 AI 开发工具在会话间丢失上下文。REAP 的 CLAUDE.md + 三层 Memory 系统在每次新会话中自动恢复完整的项目上下文（genome、environment、vision、memory）。" },
      { title: "线性工作流 vs 微循环", desc: "传统工具遵循线性流程（规格 → 计划 → 构建）。REAP 支持结构化回退——任何阶段都可以在保留产物的同时回退到前一阶段。" },
      { title: "孤立任务 vs 代际进化", desc: "传统工具中每个任务是独立的。在 REAP 中，代与代之间相互构建。知识通过 Lineage 归档和 Genome 进化持续积累。" },
      { title: "无生命周期钩子", desc: "REAP 提供 16 个阶段级钩子（从 onLifeStarted 到 onMergeCompleted），在每个生命周期节点实现自动化。" },
    ],
  },

  // Genome Page
  genomePage: {
    title: "Genome",
    breadcrumb: "指南",
    intro: "Genome 是 REAP 的权威知识源——架构原则、开发约定、技术约束和领域规则。它是你项目的 DNA。",
    structureTitle: "结构",
    structure: `.reap/genome/
├── application.md     # 项目身份、架构、约定
├── evolution.md       # AI 行为指南、进化方向
└── invariants.md      # 绝对约束（仅人类可编辑）`,
    principlesTitle: "三个文件",
    principles: [
      "application.md——项目身份、架构决策、开发约定和约束。",
      "evolution.md——AI 行为指南、交互原则、代码质量规则和软生命周期规则。",
      "invariants.md——绝对不可违反的约束。只有人类可以修改此文件。",
    ],
    immutabilityTitle: "Genome 不可变性",
    immutabilityDesc: "在正常代中 Genome 不会被修改。实现过程中发现的问题被记录为 genome-change backlog 项，仅在 Completion adapt 阶段应用。",
    immutabilityWhy: "例外：Embryo 代（项目早期阶段）允许在任何阶段自由修改 genome。一旦项目成熟，AI 会在 adapt 阶段提议从 embryo 过渡到 normal，由人类批准。",
    contextTitle: "始终加载",
    contextDesc: "所有三个 genome 文件在会话开始时通过 CLAUDE.md 完全加载到 AI 代理的上下文中。代理始终可以访问你项目的架构、约定和约束——无需手动说明。",
    evolutionTitle: "通过代进化",
    evolutionDesc: "在每一代结束时（Completion adapt 阶段），genome-change backlog 项被审查并应用到 Genome。这确保 Genome 有意识地进化，基于代中实际发生的事情。",
    syncTitle: "知识管理",
    syncDesc: "使用 /reap.knowledge 审查和管理 Genome 和 Environment。该命令提供重新加载上下文、检查 genome 文件和管理 environment 数据的选项。",
  },

  // Environment Page
  environmentPage: {
    title: "Environment",
    breadcrumb: "指南",
    intro: "Environment 是项目的描述性知识——当前存在的内容。它捕获技术栈、源码结构、构建配置、领域知识和代码依赖。与 Genome（规范性——如何构建）不同，Environment 描述的是当前状态。",
    structureTitle: "两层结构",
    structure: `.reap/environment/
├── summary.md      # 始终加载（约 100 行）——技术栈、源码结构、构建、测试
├── domain/         # 领域知识（按需）
├── resources/      # 外部参考文档——API 文档、SDK 规格（按需）
├── docs/           # 项目参考文档——设计文档、规格说明（按需）
└── source-map.md   # 代码结构 + 依赖（按需）`,
    layersTitle: "层级",
    layerHeaders: ["层级", "加载方式", "内容", "限制"],
    layerItems: [
      ["summary.md", "会话开始时始终加载", "技术栈、源码结构、构建配置、测试设置。AI 的基线理解。", "约 100 行"],
      ["domain/", "按需（需要时加载）", "领域知识——业务规则、API 规格、基础设施详情。", "无限制"],
      ["resources/", "按需（需要时加载）", "外部参考文档——API 文档、SDK 规格、第三方文档。", "无限制"],
      ["docs/", "按需（需要时加载）", "项目参考文档——设计文档、规格说明、架构决策。", "无限制"],
      ["source-map.md", "按需（需要时加载）", "当前代码结构和依赖映射。", "无限制"],
    ],
    immutabilityTitle: "Environment 不可变性",
    immutabilityDesc: "与 Genome 一样，Environment 在代中不会被直接修改。变更被记录为 environment-change backlog 项，在 Completion reflect 阶段应用。",
    immutabilityWhy: "通过在 backlog 中捕获变更而非在代中途重写 Environment，代在稳定的映射上完成。更新在 reflect 阶段一次性完成，此时已有构建内容的完整上下文。",
    flowTitle: "加载策略",
    flowDesc: "summary.md 在会话开始时始终加载。domain/ 和 source-map.md 在 AI 需要特定任务的更深层上下文时按需加载。",
    syncTitle: "知识管理",
    syncDesc: "使用 /reap.knowledge 审查和管理 Environment。在 Completion reflect 阶段，AI 自动刷新 environment 以反映代中所做的变更。",
    syncSources: [
      { label: "summary.md", role: "始终加载", desc: "项目技术状态的紧凑概览。在每次会话中加载，使 AI 拥有基线上下文。" },
      { label: "domain/ + resources/ + docs/ + source-map.md", role: "按需", desc: "当 AI 需要当前任务的特定领域、外部参考或结构上下文时加载的更深层知识。" },
    ],
    syncContrast: "两层策略平衡了上下文窗口效率（summary.md 很小）与深度（domain/ 和 source-map.md 在需要时可用）。",
  },

  // Lifecycle Page (renamed from Workflow)
  lifecyclePage: {
    title: "Life Cycle",
    breadcrumb: "指南",
    intro: "生命周期是 REAP 的心跳——每一代流经 5 个阶段（Learning → Planning → Implementation → Validation → Completion），在每一步产生产物。Completion 有 4 个 phase：reflect → fitness → adapt → commit。",
    structureTitle: "产物结构",
    structure: `.reap/life/
├── current.yml          # 当前代状态（id、目标、阶段、时间线）
├── 01-learning.md       # 上下文探索、genome/environment 审查
├── 02-planning.md       # 任务分解、依赖关系
├── 03-implementation.md # 实现日志、所做变更
├── 04-validation.md     # 测试结果、完成标准检查
├── 05-completion.md     # Reflect + fitness + adapt + commit
└── backlog/             # 下一代的项目
    ├── fix-auth-bug.md  #   type: task
    └── add-index.md     #   type: genome-change`,
    structureDesc: "每个阶段在 .reap/life/ 中产生其产物。代完成后，所有产物归档到 .reap/lineage/gen-XXX-hash-slug/，current.yml 被清除以准备下一代。",
  },

  // Lineage Page
  lineagePage: {
    title: "Lineage",
    breadcrumb: "指南",
    intro: "Lineage 是已完成代的归档。每个完成生命周期的代都会连同完整的产物和 DAG 元数据一起保存在这里。",
    structureTitle: "结构",
    structureDesc: "每个已完成的代创建一个包含产物和元数据的目录：",
    structure: `.reap/lineage/
├── gen-042-a3f8c2-fix-login-bug/   # 完整代（目录）
│   ├── meta.yml                      # DAG 元数据（id、parents、genomeHash）
│   ├── 01-learning.md
│   ├── 02-planning.md
│   ├── 03-implementation.md
│   ├── 04-validation.md
│   └── 05-completion.md
├── gen-030-b7e1f2.md                 # Level 1 压缩（单文件）
└── epoch.md                          # Level 2 压缩（哈希链）`,
    dagTitle: "DAG（有向无环图）",
    dagDesc: "每一代在 meta.yml 中记录其父代，形成 DAG。这使得分布式工作流成为可能，多台机器可以独立工作后再合并。",
    compressionTitle: "压缩",
    compressionDesc: "压缩在 Completion 阶段运行，用于管理 lineage 大小。",
    compressionHeaders: ["级别", "输入", "输出", "触发条件", "保护"],
    compressionItems: [
      ["Level 1", "代文件夹", "gen-XXX-{hash}.md（40 行）", "> 5,000 行 + 5 代以上", "最近 3 个 + DAG 叶节点"],
      ["Level 2", "100+ Level 1 文件", "单个 epoch.md", "Level 1 文件 > 100", "最近 9 个 + 分叉点"],
    ],
    compressionSafety: "DAG 保留：Level 1 在 frontmatter 中保留元数据。Level 2 epoch.md 存储代哈希链。分叉保护：在 Level 2 压缩前扫描所有本地/远程分支——分叉点受保护。经过 epoch 压缩的代不能用作合并基础。",
  },

  // Backlog Page
  backlogPage: {
    title: "Backlog",
    breadcrumb: "指南",
    intro: "Backlog 在代之间传递项目——延迟的任务、genome 变更和 environment 变更。它位于 .reap/life/backlog/。",
    typesTitle: "项目类型",
    typeHeaders: ["类型", "描述", "应用时机"],
    typeItems: [
      ["task", "延迟的工作、技术债务、功能想法", "作为下一代的目标候选引用"],
      ["genome-change", "代中途发现的 Genome 修改", "在 Completion adapt 阶段应用到 Genome"],
      ["environment-change", "代中途发现的外部环境变更", "在 Completion reflect 阶段应用到 Environment"],
    ],
    statusTitle: "状态",
    statusHeaders: ["状态", "含义"],
    statusItems: [
      ["pending", "尚未处理（默认）"],
      ["consumed", "已在某代中处理（需要 consumedBy: gen-XXX-{hash}）"],
    ],
    archivingTitle: "归档规则",
    archivingDesc: "归档时，已消费的项目移动到 lineage。待处理的项目延续到下一代的 backlog。",
    deferralTitle: "任务延迟",
    deferralDesc: "部分完成是正常的——依赖 Genome 变更的任务标记为 [deferred] 并交给下一代。",
    abortTitle: "中止 Backlog",
    abortDesc: "当通过 /reap.abort 中止一代时，目标和进度可以保存到 backlog，包含中止元数据（abortedFrom、abortReason、stage、sourceAction、changedFiles）。这为后续恢复保留了上下文。",
    formatTitle: "文件格式",
    format: `---
type: task
status: pending
priority: medium
---

# 任务标题

任务描述。`,
  },

  // Release Notes Page
  releaseNotes: {
    title: "发布说明",
    breadcrumb: "其他",
    breakingBannerTitle: "v0.16 中的重大变更",
    breakingBannerDesc: "从 v0.15.x 到 v0.16.x 的自动更新已被阻止。运行 /reap.update 手动升级。",
    breakingBannerItems: [
      "REAP 过渡为自进化流水线——AI 与人类协作，通过递归流水线自我进化软件。",
      "生命周期变更：learning → planning → implementation → validation → completion（新增 Learning 阶段，Objective 和 Planning 合并为 Planning）。",
      "斜杠命令重构以优化技能匹配：10 个自动匹配技能 + 6 个仅限直接调用的技能。",
      "CLI 命令从用户界面中移除。所有操作现在仅通过斜杠命令进行（CLI 命令保留供内部使用）。",
    ],
    versions: [
      {
        version: "0.16.0",
        notes: "完全重写为自进化流水线。新的 genome 结构（application.md、evolution.md、invariants.md）。Learning 阶段替代 Objective。清晰度驱动的交互。巡航模式用于自主多代执行。Vision 层包含三层 memory（longterm/midterm/shortterm）。合并生命周期新增 Reconcile 阶段用于 genome-源码一致性验证。/reap.knowledge 替代 /reap.sync。两阶段 /reap.abort。基于文件的 hooks，支持条件和排序。",
      },
      {
        version: "0.15.13",
        notes: "用内置 CLI 库替代 commander.js。运行时依赖：2 → 1。",
      },
      {
        version: "0.15.12",
        notes: "reap update 自动升级后发布通知现在正确显示。",
      },
      {
        version: "0.15.11",
        notes: "修复 reap pull 对仅领先分支错误建议合并的问题。现在使用 git rev-list 进行准确的领先/落后/分叉检测。",
      },
      {
        version: "0.15.10",
        notes: "修复发布通知语言匹配（例如 \"korean\" → \"ko\"）。",
      },
      {
        version: "0.15.9",
        notes: "修复 reap update 后发布通知不显示的问题。路径解析现在使用 require.resolve 而非 __dirname。",
      },
      {
        version: "0.15.8",
        notes: "从 config.yml 中移除 version 字段。reap update 后不再有未提交的变更。",
      },
      {
        version: "0.15.7",
        notes: "将 UPDATE_NOTICE.md 重命名为 RELEASE_NOTICE.md。通知内容现在内联（不再依赖 GitHub Discussions）。",
      },
      {
        version: "0.15.6",
        notes: "修复 UPDATE_NOTICE.md 在 npm 包中缺失的问题。",
      },
      {
        version: "0.15.5",
        notes: "完整性检查不再对 source-map.md 行数发出警告。",
      },
      {
        version: "0.15.4",
        notes: "Bug 修复和新增 reap make backlog 命令。修复 lineage 归档、reap back nonce 链，新增最近 20 代的压缩保护。",
      },
    ],
  },
};

import type { Translations } from "./en";

export const zhCN: Translations = {
  // Nav & Sidebar
  nav: {
    getStarted: "开始使用",
    groups: {
      gettingStarted: "入门",
      guide: "指南",
      reference: "参考",
      other: "其他",
    },
    items: {
      introduction: "介绍",
      quickStart: "快速开始",
      coreConcepts: "核心概念",
      workflow: "工作流",
      advanced: "进阶",
      cliReference: "CLI参考",
      commandReference: "命令参考",
      hookReference: "Hook参考",
      comparison: "对比",
      configuration: "配置",
    },
  },

  // Hero Page
  hero: {
    tagline: "Recursive Evolutionary Autonomous Pipeline",
    title: "REAP",
    description: "AI与人类协作，通过反复迭代Generation来进化应用程序的开发管线。跨会话保持上下文，以结构化的生命周期进行开发，设计文档随代码一起演进。",
    getStarted: "开始使用 →",
    whyReap: "为什么选择REAP？",
    whyReapDesc: "AI代理很强大，但缺乏结构的开发会变得混乱。每次会话上下文被重置，代码修改无目的地分散，设计文档与现实脱节，过去的经验教训消失。",
    problems: [
      { problem: "上下文丢失", solution: "SessionStart Hook在每次会话中自动注入完整的项目上下文" },
      { problem: "分散开发", solution: "每个Generation通过结构化的生命周期专注于一个目标" },
      { problem: "设计与代码脱节", solution: "实现中发现的Genome变异通过backlog反馈" },
      { problem: "遗忘的教训", solution: "回顾积累在Genome中。Lineage保存所有Generation" },
    ],
    threeLayer: "3-Layer模型",
    threeLayerDesc: "每个REAP项目由三个概念层组成。Genome定义要构建什么，Evolution过程进行构建，Civilization是成果。",
    layers: [
      { label: "Genome", sub: "设计与知识", path: ".reap/genome/", desc: "架构原则、业务规则、约定、技术约束。Generation进行中不修改。" },
      { label: "Evolution", sub: "代际过程", path: ".reap/life/ → .reap/lineage/", desc: "每个Generation执行Objective → Planning → Implementation → Validation → Completion。完成后归档到lineage。" },
      { label: "Civilization", sub: "源代码", path: "your codebase/", desc: ".reap/之外的所有内容。随着每个Generation的完成而成长和改进。" },
    ],
    lifecycle: "Generation生命周期",
    lifecycleDesc: "每个Generation经历从目标定义到回顾和归档的五个阶段。",
    stages: [
      ["Objective", "定义目标、需求和完成标准", "01-objective.md"],
      ["Planning", "任务分解、选择方案、依赖映射", "02-planning.md"],
      ["Implementation", "AI + 人类协作实现", "03-implementation.md"],
      ["Validation", "执行测试、验证完成标准", "04-validation.md"],
      ["Completion", "回顾 + 应用Genome变更 + 归档Generation", "05-completion.md"],
    ],
    stageHeaders: ["阶段", "内容", "产出物"],
    installation: "安装",
    installStep1: "1. 全局安装",
    installStep2: "2. 初始化项目",
    installStep3: "3. 运行第一个Generation（在Claude Code中）",
    installNote: [
      { before: "", code: "/reap.evolve", after: "会交互式地运行整个Generation生命周期（从Objective到Completion）。" },
      { linkText: "阶段命令", after: "也可以手动控制每个阶段。" },
    ],
    keyConcepts: "核心概念",
    concepts: [
      { label: "Genome Immutability", desc: "Generation进行中不修改Genome。Implementation中发现的设计问题记录在backlog中作为genome-change项目，仅在Completion时应用。" },
      { label: "Backlog & Deferral", desc: ".reap/life/backlog/中的项目具有type: genome-change | environment-change | task。部分完成是正常的，未完成的任务会传递到下一个Generation的Objective。" },
      { label: "SessionStart Hook", desc: "每个新的AI代理会话自动注入完整的Genome、当前Generation状态和工作流规则，消除会话间的上下文丢失。" },
      { label: "Lineage", desc: "已完成的Generation归档在.reap/lineage/中。回顾在那里积累。随时间推移会压缩（Level 1 → gen-XXX.md，Level 2 → epoch-XXX.md）。" },
      { label: "Four-Axis Structure", desc: ".reap/下的所有内容映射到四个轴：Genome（设计）、Environment（外部上下文）、Life（当前Generation）、Lineage（过去Generation的归档）。" },
    ],
    documentation: "文档",
    docLinks: [
      { href: "/docs/introduction", title: "介绍", desc: "什么是REAP，为什么使用它，3-Layer模型，Four-Axis结构。" },
      { href: "/docs/quick-start", title: "快速开始", desc: "安装并逐步运行第一个Generation。" },
      { href: "/docs/core-concepts", title: "核心概念", desc: "Genome、生命周期、Backlog & Deferral深入解析。" },
      { href: "/docs/workflow", title: "工作流", desc: "/reap.evolve、阶段命令、micro loop、hooks。" },
      { href: "/docs/cli", title: "CLI参考", desc: "reap init、status、update、fix的所有选项。" },
      { href: "/docs/commands", title: "命令参考", desc: "/reap.evolve、阶段命令、/reap.status — 所有斜杠命令。" },
      { href: "/docs/hooks", title: "Hook参考", desc: "生命周期hooks：command和prompt类型、events、SessionStart。" },
      { href: "/docs/comparison", title: "对比", desc: "REAP与现有规格驱动开发工具的对比。" },
      { href: "/docs/advanced", title: "进阶", desc: "Lineage压缩、预设、entry模式。" },
    ],
  },

  // Introduction Page
  intro: {
    title: "介绍",
    breadcrumb: "入门",
    description: "REAP（Recursive Evolutionary Autonomous Pipeline）是一个AI与人类协作、通过连续的Generation逐步进化应用程序的开发管线。不是将每个AI会话视为独立任务，而是通过结构化的生命周期和称为Genome的活知识库来维持连续性。",
    threeLayer: "3-Layer模型",
    layerItems: [
      { label: "Genome", sub: "设计与知识", path: ".reap/genome/" },
      { label: "Evolution", sub: "代际过程", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "源代码", path: "your codebase/" },
    ],
    layerDescs: [
      "构建应用程序的设计和知识。架构原则、业务规则、约定、技术约束。存储在.reap/genome/中。",
      "通过反复迭代Generation来进化Genome并成长Civilization的过程。",
      "源代码。.reap/之外的整个项目代码库。",
    ],
    whyReap: "为什么选择REAP？",
    problemHeader: "问题",
    solutionHeader: "REAP的解决方案",
    problems: [
      ["上下文丢失 — 代理每次会话都忘记项目上下文", "SessionStart Hook — 每次会话自动注入完整的Genome + Generation状态"],
      ["分散开发 — 没有明确目标地修改代码", "Generation模型 — 每个Generation通过结构化的生命周期专注于一个目标"],
      ["设计与代码脱节 — 文档与代码不一致", "通过Backlog的Genome变异 — 实现中发现的设计缺陷被记录并在Completion时应用"],
      ["遗忘的教训 — 过去工作的洞见消失", "Lineage与回顾 — 教训积累在Genome中，Generation被归档和压缩"],
    ],
    fourAxis: "Four-Axis结构",
    fourAxisDesc: "REAP将.reap/下的所有内容组织为四个轴：",
    axes: [
      { axis: "Genome", path: ".reap/genome/", desc: "遗传信息。原则、规则、架构决策。" },
      { axis: "Environment", path: ".reap/environment/", desc: "外部上下文。API文档、基础设施、业务约束。" },
      { axis: "Life", path: ".reap/life/", desc: "当前Generation的生命周期。进度状态和产出物。" },
      { axis: "Lineage", path: ".reap/lineage/", desc: "已完成Generation的归档。" },
    ],
    projectStructure: "项目结构",
  },

  // Quick Start Page
  quickstart: {
    title: "快速开始",
    breadcrumb: "入门",
    prerequisites: "前置要求",
    prerequisiteItems: [
      { name: "Node.js", desc: "v18或更高版本", required: true },
      { name: "npm", desc: "Node.js自带", required: true },
      { name: "Claude Code或OpenCode", desc: "AI代理CLI（至少需要一个）", required: true },
      { name: "Bun", desc: "可选的包管理器", required: false },
    ],
    required: "必需",
    optional: "可选",
    install: "安装",
    initProject: "初始化项目",
    runFirst: "运行第一个Generation",
    runFirstDesc: "在项目目录中启动Claude Code：",
    evolveTitle: "/reap.evolve是主要命令",
    evolveDesc: "交互式运行整个Generation生命周期（Objective、Planning、Implementation、Validation、Completion）。AI代理在每个阶段提问，用户批准后继续。这是日常开发中最常用的命令。",
    manualControl: "手动阶段控制",
    manualControlDesc: "也可以单独控制每个阶段：",
    whatHappens: "Generation中发生的事情",
    stageHeaders: ["阶段", "内容", "产出物"],
    stages: [
      ["Objective", "定义目标、需求和完成标准", "01-objective.md"],
      ["Planning", "任务分解、选择方案、依赖映射", "02-planning.md"],
      ["Implementation", "AI + 人类协作实现", "03-implementation.md"],
      ["Validation", "执行测试、验证完成标准", "04-validation.md"],
      ["Completion", "回顾 + 应用Genome变更 + 归档", "05-completion.md"],
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "核心概念",
    breadcrumb: "概念",
    genomeTitle: "Genome",
    genomeDesc: "Genome是应用程序的遗传信息 — 架构原则、业务规则、约定、技术约束。",
    principles: "原则",
    genomeImmutability: "Genome不变原则",
    genomeImmutabilityDesc: "当前Generation进行中不直接修改Genome。问题记录在backlog中，仅在Completion阶段应用。",
    envImmutability: "Environment不变原则",
    envImmutabilityDesc: "当前Generation进行中不直接修改Environment。外部变更记录在backlog中，在Completion阶段应用。",
    lifecycle: "生命周期",
    lifecycleDesc: "每个Generation遵循五个阶段：",
    stageHeaders: ["阶段", "内容", "产出物"],
    stages: [
      ["Objective", "定义目标、需求和完成标准", "01-objective.md"],
      ["Planning", "任务分解、选择方案、依赖映射", "02-planning.md"],
      ["Implementation", "AI + 人类协作实现", "03-implementation.md"],
      ["Validation", "执行测试、验证完成标准", "04-validation.md"],
      ["Completion", "回顾 + 应用Genome变更 + 归档", "05-completion.md"],
    ],
    backlog: "Backlog与Deferral",
    backlogDesc: "所有backlog项目以带frontmatter的markdown文件存储在.reap/life/backlog/中：",
    backlogHeaders: ["类型", "说明"],
    backlogTypes: [
      { type: "genome-change", desc: "在Completion阶段应用到Genome。" },
      { type: "environment-change", desc: "在Completion阶段应用到Environment。" },
      { type: "task", desc: "下一个Objective的目标候选。" },
    ],
    statusField: "每个项目还有一个status字段：",
    statusHeaders: ["状态", "说明"],
    statuses: [
      { type: "pending", desc: "未处理。默认值 — 字段缺失则视为pending。" },
      { type: "consumed", desc: "在当前Generation中已处理。需要consumedBy: gen-XXX。" },
    ],
    archivingNote: "归档时，consumed项目移至lineage。pending项目结转到下一个Generation的backlog。",
    deferralNote: "部分完成是正常的 — 依赖Genome变更的任务标记为[deferred]并传递到下一个Generation。",
    evolutionFlow: "Evolution流程示例",
  },

  // Workflow Page
  workflow: {
    title: "工作流",
    breadcrumb: "工作流",
    intro: "Generation是REAP的基本工作单元。每个Generation通过五个阶段执行一个目标，并在过程中生成产出物。了解每个阶段发生什么以及如何连接。",
    evolveTitle: "/reap.evolve — 主要工作方式",
    evolveDesc: "大多数情况下，运行/reap.evolve后AI代理会自主执行所有阶段。处理Generation启动、每个阶段的执行、阶段间的推进以及最终的归档。跳过日常的逐阶段确认，仅在代理真正受阻时（目标模糊、重要权衡决策、Genome冲突、意外错误）才停止。",
    evolveNote: "需要精细控制时，可以运行单独的阶段命令。详情请参阅命令参考。",
    stageWalkthrough: "阶段详解",
    stageDetails: [
      {
        title: "1. Objective",
        desc: "定义本Generation要达成的目标。AI代理扫描environment获取外部上下文，检查backlog中的待处理项目，检查Genome状态，然后一起细化目标。",
        output: "01-objective.md — 目标、完成标准（最多7个，可验证）、功能需求（最多10个）、范围、Genome差距分析。",
      },
      {
        title: "2. Planning",
        desc: "将目标分解为可执行的任务。AI读取需求，参考Genome约定和约束，提出包含架构决策的实施计划。",
        output: "02-planning.md — 分阶段任务列表（每阶段最多20个）、依赖关系、可并行任务标记为[P]。",
      },
      {
        title: "3. Implementation",
        desc: "编写代码。任务按顺序执行，每次完成立即记录。发现Genome或Environment缺陷时记录到backlog — 不直接应用。依赖待处理Genome变更的任务标记为[deferred]。",
        output: "03-implementation.md — 已完成任务表、未完成任务、genome-change backlog项目。",
      },
      {
        title: "4. Validation",
        desc: "验证工作。执行constraints.md中的验证命令（测试、lint、构建、类型检查），检查完成标准，应用小修复（5分钟内，无设计变更）。判定为pass、partial（部分标准未完成）或fail。",
        output: "04-validation.md — 包含实际命令输出的测试结果、标准检查表、判定。",
      },
      {
        title: "5. Completion",
        desc: "回顾并进化。提取经验教训（最多5条），将genome-change backlog项目应用到Genome文件，清理技术债务，将未完成任务交接到下一个Generation的backlog。独立运行时Genome变更需要人工确认；通过/reap.evolve调用时代理自主进行。",
        output: "05-completion.md — 摘要、回顾、Genome变更日志。之后/reap.next将所有内容归档到lineage。",
      },
    ],
    microLoop: "Micro Loop（回退）",
    microLoopDesc: "任何阶段都可以回到前一个阶段。这很常见 — Validation失败后回到Implementation，或者Implementation中发现Planning缺陷后回到Planning。回退原因记录在时间线和目标产出物中。",
    artifactHandling: "回退时的产出物处理：",
    artifactRules: [
      { label: "目标阶段之前：", desc: "原样保留" },
      { label: "目标阶段：", desc: "覆盖（Implementation仅追加）" },
      { label: "目标阶段之后：", desc: "保留，重新进入时覆盖" },
    ],
    minorFix: "Minor Fix",
    minorFixDesc: "小问题（拼写错误、lint错误等）如果5分钟内可解决且不需要设计变更，可以在当前阶段直接修复而无需回退。修复内容记录在阶段产出物中。",
    roleSeparation: "角色分工",
    roleHeaders: ["角色", "职责"],
    roles: [
      ["CLI (reap)", "项目设置和维护 — init、status、update、fix"],
      ["AI Agent", "工作流执行者 — 通过斜杠命令执行每个阶段的工作"],
      ["Human", "决策者 — 设定目标、审查产出物、批准阶段转换"],
    ],
  },

  // CLI Page
  cli: {
    title: "CLI参考",
    breadcrumb: "参考",
    initTitle: "reap init",
    initDesc: "初始化新的REAP项目。创建.reap/结构并将斜杠命令和hooks安装到检测到的代理（Claude Code、OpenCode）。",
    initHeaders: ["选项", "值", "说明"],
    initOptions: [
      ["--mode", "greenfield | migration | adoption", "项目entry模式"],
      ["--preset", "例如：bun-hono-react", "使用预配置的技术栈初始化Genome"],
    ],
    statusTitle: "reap status",
    statusDesc: "显示当前项目和Generation状态。",
    statusNote: "显示项目名称、entry模式、活跃Generation（id、目标、阶段）和已完成Generation总数。",
    updateTitle: "reap update",
    updateDesc: "将命令、模板、hooks同步到最新版本。",
    dryRunDesc: "显示将要更新的内容而不实际应用更改。",
    fixTitle: "reap fix",
    fixDesc: "诊断并修复.reap/目录结构。",
    fixNote: "检查缺失的目录，验证config.yml是否存在，验证current.yml阶段，并重建缺失的结构。",
    helpTitle: "reap help",
    helpDesc: "输出CLI命令、斜杠命令和工作流摘要。",
    helpNote: "从~/.claude/settings.json读取用户的语言设置，并以该语言输出帮助文本（目前支持en和ko）。如果找不到语言文件则回退到英文。",
  },

  // Command Reference Page
  commands: {
    title: "命令参考",
    breadcrumb: "参考",
    intro: "REAP有两种类型的命令：CLI命令和斜杠命令。",
    cliCommandsDesc: "CLI命令（reap ...）在终端中运行。负责项目设置和维护 — init、status、update、fix、help。不与AI代理交互。",
    slashCommandsDesc: "斜杠命令（/reap.*）在AI代理CLI（Claude Code、OpenCode）内运行。驱动开发工作流 — AI代理读取提示并与用户交互式地执行任务。",
    slashTitle: "斜杠命令",
    slashIntro: "通过reap init安装到检测到的各代理。在AI代理会话（Claude Code、OpenCode）中使用。",
    commandHeaders: ["命令", "说明"],
    commands: [
      ["/reap.evolve", "从头到尾运行整个Generation。日常开发的主要命令。自主循环所有阶段 — 跳过日常确认，仅在真正受阻时停止。"],
      ["/reap.start", "开始新的Generation。扫描backlog中的待处理项目，请求目标，创建current.yml，将阶段设为objective。"],
      ["/reap.objective", "定义Generation的目标、需求和完成标准。扫描Environment，检查backlog，检查Genome状态。"],
      ["/reap.planning", "将目标分解为有依赖关系的任务。创建实施计划。"],
      ["/reap.implementation", "执行计划中的任务。将已完成/未完成任务和Genome发现记录在产出物中。"],
      ["/reap.validation", "执行constraints.md中的验证命令。检查完成标准。判定：pass / partial / fail。"],
      ["/reap.completion", "回顾，应用backlog中的Genome变更，清理，最终化。"],
      ["/reap.next", "前进到下一个生命周期阶段。从模板创建下一个产出物。完成时归档。"],
      ["/reap.back", "回到前一个阶段（micro loop）。在时间线和产出物中记录回退原因。"],
      ["/reap.status", "显示当前Generation状态、阶段进度、backlog摘要、时间线、Genome状态。"],
      ["/reap.sync", "分析源代码并同步Genome。无活跃Generation时直接更新；有则记录到backlog。"],
      ["/reap.help", "提供24+主题的上下文帮助。包括REAP介绍、详细说明（workflow、genome、backlog、strict、agents、hooks、config、evolve、regression、minor-fix、compression、author及所有命令名）。"],
      ["/reap.update", "检查REAP更新并升级到最新版本。比较已安装版本与发布版本，更新npm包，并同步命令/模板/hooks。"],
    ],
    lifecycleFlow: "生命周期流程",
    lifecycleFlowDesc: "使用/reap.evolve时的典型流程：",
    commandStructure: "各命令结构",
    commandStructureDesc: "所有斜杠命令遵循相同模式：Gate（前置条件检查 — 阶段是否正确，前一个产出物是否存在）→ Steps（与人交互执行工作）→ Artifact（逐步记录到.reap/life/）。",
  },

  // Configuration Page
  config: {
    title: "配置",
    breadcrumb: "参考",
    intro: "REAP项目通过.reap/config.yml进行配置。此文件在reap init时创建，控制项目设置、strict模式和生命周期hooks。",
    structure: "配置文件结构",
    fields: "字段",
    fieldHeaders: ["字段", "说明"],
    fieldItems: [
      ["version", "配置模式版本"],
      ["project", "项目名称（init时设置）"],
      ["entryMode", "REAP的初始化方式：greenfield、migration或adoption"],
      ["strict", "启用Strict模式以限制代码变更（见下文）"],
      ["language", "产出物和用户交互的语言（例如：korean、english、japanese）"],
      ["autoUpdate", "会话开始时自动更新（默认：false）"],
      ["agents", "检测到的AI代理，由reap init/update管理（例如：claude-code、opencode）"],
      ["hooks", "生命周期hooks（参见Hook参考）"],
    ],
    strictMode: "Strict模式",
    strictModeDesc: "设置strict: true后，AI代理被限制在REAP工作流之外修改代码。这确保所有变更都经过结构化的生命周期。",
    strictHeaders: ["情境", "行为"],
    strictRules: [
      ["无活跃Generation / 非Implementation阶段", "代码修改完全阻止"],
      ["Implementation阶段", "仅允许02-planning.md范围内的修改"],
      ["逃生舱", '用户明确请求 "override" 或 "bypass strict" 时允许修改'],
    ],
    strictNote: "Strict模式默认禁用。读取文件、分析代码和回答问题无论strict模式如何都始终允许。",
    entryModes: "Entry模式",
    entryModeHeaders: ["模式", "用途"],
    entryModeItems: [
      ["greenfield", "从零开始新项目"],
      ["adoption", "将REAP应用到现有代码库"],
      ["migration", "从现有系统迁移到新架构"],
    ],
  },

  // Hook Reference Page
  hooks: {
    title: "Hook参考",
    breadcrumb: "参考",
    intro: "REAP hooks允许在关键的生命周期事件中运行自动化。在.reap/config.yml中定义，AI代理会在适当的时机执行。",
    hookTypes: "Hook类型",
    hookTypesIntro: "每个hook条目支持两种类型之一：",
    commandType: "command",
    commandTypeDesc: "Shell命令。由AI代理在项目根目录中执行。用于脚本、CLI工具、构建命令。",
    promptType: "prompt",
    promptTypeDesc: "AI代理指令。代理读取提示并执行代码分析、文件修改、文档更新等任务。用于需要判断的任务。",
    hookTypeNote: "每个条目只能使用command或prompt之一。同一事件内的多个条目按定义顺序执行。",
    events: "Events",
    eventHeaders: ["Event", "触发时机"],
    eventItems: [
      ["onGenerationStart", "/reap.start创建新Generation并写入current.yml之后"],
      ["onStageTransition", "/reap.next前进到下一阶段并创建新产出物之后"],
      ["onGenerationComplete", "/reap.next归档已完成的Generation之后。在git commit之后运行，因此hooks的变更处于uncommitted状态"],
      ["onRegression", "/reap.back回到前一阶段之后"],
    ],
    configuration: "配置",
    configExample: `# .reap/config.yml
hooks:
  onGenerationStart:
    - command: "echo 'Generation started'"
  onStageTransition:
    - command: "npm run lint"
  onGenerationComplete:
    - command: "reap update"
    - prompt: |
        检查本Generation中的变更内容。
        如果添加或修改了功能、CLI命令或斜杠命令，
        则更新README.md和docs。
        如果不需要文档更新则跳过。
  onRegression:
    - command: "echo 'Regressed to previous stage'"
    - prompt: "将回退原因记录到追踪文件中。"`,
    sessionStart: "SessionStart Hook",
    sessionStartDesc1: "与REAP项目hooks分开，SessionStart hook是每次AI会话开始时运行的代理机制。在reap init时为每个检测到的代理（Claude Code、OpenCode）注册。",
    sessionStartDesc2: "将完整的REAP工作流指南、当前Generation状态和生命周期规则注入AI代理 — 确保代理即使在全新会话中也能理解项目上下文。",
    sessionStartNote: "注册在代理的设置中（例如：Claude Code为~/.claude/settings.json，OpenCode为~/.config/opencode/）。hook脚本位于REAP包内，从项目的.reap/目录读取。",
    executionNotes: "执行注意事项",
    executionItems: [
      "Hooks由AI代理而非CLI执行。代理读取配置并运行每个hook。",
      "command hooks在项目根目录中运行。",
      "prompt hooks由AI代理在当前会话上下文中解释。",
      "同一事件内的hooks按定义顺序依次执行。",
      "onGenerationComplete hooks在git commit之后运行 — hooks的文件变更处于uncommitted状态。",
    ],
  },

  // Advanced Page
  advanced: {
    title: "进阶",
    breadcrumb: "指南",
    compressionTitle: "Lineage压缩",
    compressionDesc: "随着Generation的积累，lineage归档会自动压缩以管理大小。",
    compressionHeaders: ["级别", "输入", "输出", "最大行数", "触发条件"],
    compressionItems: [
      ["Level 1", "Generation文件夹（5个产出物）", "gen-XXX.md", "40", "lineage > 10,000行 + 5个以上Generation"],
      ["Level 2", "5个Level 1文件", "epoch-XXX.md", "60", "存在5个以上Level 1文件"],
    ],
    presetsTitle: "预设",
    presetsDesc: "预设为常见技术栈提供预配置的Genome和项目脚手架。",
    presetsNote: "bun-hono-react预设配置了Bun + Hono + React技术栈的架构原则、约定和约束的Genome。",
    entryModes: "Entry模式",
    entryModesDesc: "使用reap init --mode指定。控制Genome的初始结构。",
    entryModeHeaders: ["模式", "说明"],
    entryModeItems: [
      ["greenfield", "从零开始新项目。默认模式。Genome从空状态开始成长。"],
      ["migration", "参考现有系统进行新建。Genome通过现有系统分析来初始化。"],
      ["adoption", "将REAP应用到现有代码库。Genome从模板开始，在第一个Generation的Objective阶段填充。"],
    ],
  },

  // Comparison Page
  comparison: {
    title: "对比",
    breadcrumb: "参考",
    heading: "与Spec Kit的对比",
    desc: "Spec Kit开创了在编写代码前编写规格的规格驱动开发方式。REAP在此概念上发展并解决了主要局限性：",
    items: [
      { title: "静态规格 vs 活的Genome", desc: "现有工具将规格视为静态文档。REAP的Genome是一个活的系统 — 实现中发现的缺陷通过backlog反馈并在Completion时应用。设计随代码一起演进。" },
      { title: "跨会话无记忆", desc: "大多数AI开发工具在会话间丢失上下文。REAP的SessionStart Hook自动将完整的项目上下文（Genome、Generation状态、工作流规则）注入每个新会话。" },
      { title: "线性工作流 vs Micro loops", desc: "现有工具遵循线性流程（规格 → 计划 → 实现）。REAP支持结构化回退 — 在保留产出物的同时可以从任何阶段回到前一阶段。" },
      { title: "独立任务 vs 代际进化", desc: "现有工具中的每个任务是独立的。在REAP中，Generation相互建立。知识通过Lineage归档和Genome进化以复利方式积累。" },
      { title: "无生命周期hooks", desc: "REAP提供项目级hooks（onGenerationStart、onStageTransition、onGenerationComplete、onRegression）用于自动化。" },
    ],
  },
};

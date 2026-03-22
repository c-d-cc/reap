import type { Translations } from "./en";

export const zhCN: Translations = {
  // Nav & Sidebar
  nav: {
    getStarted: "开始使用",
    groups: {
      gettingStarted: "入门",
      guide: "指南",
      collaboration: "协作",
      reference: "参考",
      other: "其他",
    },
    items: {
      introduction: "介绍",
      quickStart: "快速开始",
      coreConcepts: "核心概念",
      genome: "Genome",
      environment: "Environment",
      lifecycle: "Lifecycle",
      lineage: "Lineage",
      backlog: "Backlog",
      hooks: "Hooks",
      advanced: "进阶",
      collaborationOverview: "分布式工作流",
      mergeGeneration: "合并世代",
      mergeCommands: "合并命令",
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
      { problem: "协作混乱", solution: "Genome优先的合并工作流协调并行分支 — 在代码冲突之前解决设计冲突" },
    ],
    threeLayer: "3-Layer模型",
    threeLayerDesc: "每个REAP项目由三个概念层组成。Knowledge Base记录要构建什么和外部环境，Evolution过程进行构建，Civilization是成果。",
    layers: [
      { label: "Knowledge Base", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/", desc: "Genome（架构、约定、约束、源码映射）和Environment（外部API、基础设施、业务约束）。通过每个世代的生命周期与代码库持续同步。" },
      { label: "Evolution", sub: "代际过程", path: ".reap/life/ → .reap/lineage/", desc: "每个Generation执行Objective → Planning → Implementation → Validation → Completion。完成后归档到lineage。" },
      { label: "Civilization", sub: "源代码", path: "your codebase/", desc: ".reap/之外的所有内容。随着每个Generation的完成而成长和改进。" },
    ],
    lifecycle: "Generation生命周期",
    lifecycleDesc: "每个Generation经历从目标定义到回顾和归档的五个阶段。",
    stages: [
      ["Objective", "通过结构化头脑风暴定义目标与设计", "01-objective.md"],
      ["Planning", "任务分解、选择方案、依赖映射", "02-planning.md"],
      ["Implementation", "AI + 人类协作实现", "03-implementation.md"],
      ["Validation", "执行测试、验证完成标准", "04-validation.md"],
      ["Completion", "回顾 + 应用Genome变更 + 自动归档（consume + archive + commit）", "05-completion.md"],
    ],
    stageHeaders: ["阶段", "内容", "产出物"],
    installation: "安装",
    installStep1: "1. 全局安装",
    installStep2: "2. 初始化项目",
    installStep3: "3. Genome同步并运行第一个Generation（在Claude Code中）",
    installNote: [
      { before: "", code: "/reap.evolve", after: "会交互式地运行整个Generation生命周期（从Objective到Completion）。" },
      { linkText: "阶段命令", after: "也可以手动控制每个阶段。" },
    ],
    keyConcepts: "核心概念",
    concepts: [
      { label: "Genome Immutability", desc: "Generation进行中不修改Genome。Implementation中发现的设计问题记录在backlog中作为genome-change项目，仅在Completion时应用。" },
      { label: "Backlog & Deferral", desc: ".reap/life/backlog/中的项目具有type: genome-change | environment-change | task。部分完成是正常的，未完成的任务会传递到下一个Generation的Objective。" },
      { label: "SessionStart Hook", desc: "每个新的AI代理会话自动注入完整的Genome、当前Generation状态和工作流规则，消除会话间的上下文丢失。" },
      { label: "Lineage", desc: "已完成的Generation归档在.reap/lineage/中。回顾在那里积累。随时间推移会压缩（Level 1 → gen-XXX-{hash}.md，Level 2 → epoch-XXX.md）。" },
      { label: "Four-Axis Structure", desc: ".reap/下的所有内容映射到四个轴：Genome（设计）、Environment（外部上下文）、Life（当前Generation）、Lineage（过去Generation的归档）。" },
      { label: "Distributed Workflow", desc: "多个开发者或代理在各自的分支上并行工作。/reap.pull拉取远程并运行Genome优先的合并Generation。/reap.push在推送前验证状态。无需服务器 — Git就是传输层。" },
    ],
    documentation: "文档",
    docLinks: [
      { href: "/docs/introduction", title: "介绍", desc: "什么是REAP，为什么使用它，3-Layer模型，Four-Axis结构。" },
      { href: "/docs/quick-start", title: "快速开始", desc: "安装并逐步运行第一个Generation。" },
      { href: "/docs/core-concepts", title: "核心概念", desc: "Genome、生命周期、Backlog & Deferral深入解析。" },
      { href: "/docs/workflow", title: "工作流", desc: "/reap.evolve、阶段命令、micro loop、hooks。" },
      { href: "/docs/cli-reference", title: "CLI参考", desc: "reap init、status、update、fix的所有选项。" },
      { href: "/docs/command-reference", title: "命令参考", desc: "/reap.evolve、阶段命令、/reap.status — 所有斜杠命令。" },
      { href: "/docs/hook-reference", title: "Hook参考", desc: "生命周期hooks：command和prompt类型、events、SessionStart。" },
      { href: "/docs/comparison", title: "对比", desc: "REAP与现有规格驱动开发工具的对比。" },
      { href: "/docs/advanced", title: "进阶", desc: "签名锁定、Lineage压缩、预设、entry模式。" },
    ],
  },

  // Introduction Page
  intro: {
    title: "介绍",
    breadcrumb: "入门",
    description: "REAP（Recursive Evolutionary Autonomous Pipeline）是一个AI与人类协作、通过连续的Generation逐步进化应用程序的开发管线。不是将每个AI会话视为独立任务，而是通过结构化的生命周期和称为Genome的活知识库来维持连续性。",
    threeLayer: "3-Layer模型",
    layerItems: [
      { label: "Knowledge Base", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/" },
      { label: "Evolution", sub: "代际过程", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "源代码", path: "your codebase/" },
    ],
    layerDescs: [
      "构建应用程序的设计知识和外部环境。Genome（架构、约定、约束、源码映射）存储在.reap/genome/中，Environment（外部API、基础设施、业务约束）存储在.reap/environment/中。通过每个世代的生命周期与代码库持续同步。",
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
      ["协作混乱 — 并行工作导致冲突的变更", "Distributed Workflow — Genome优先的合并在代码之前协调设计，DAG lineage追踪并行分支"],
    ],
    fourAxis: "Four-Axis结构",
    fourAxisDesc: "REAP将.reap/下的所有内容组织为四个轴：",
    axes: [
      { axis: "Genome", path: ".reap/genome/", desc: "遗传信息。原则、规则、架构决策、源码映射（C4 Container/Component Mermaid图表）。" },
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
      ["Objective", "通过结构化头脑风暴定义目标与设计", "01-objective.md"],
      ["Planning", "任务分解、选择方案、依赖映射", "02-planning.md"],
      ["Implementation", "AI + 人类协作实现", "03-implementation.md"],
      ["Validation", "执行测试、验证完成标准", "04-validation.md"],
      ["Completion", "回顾 + 应用Genome变更 + 自动归档（consume + archive + commit）", "05-completion.md"],
    ],
    commandLoading: "命令加载方式",
    commandLoadingDesc: "REAP斜杠命令仅在REAP项目中加载 — 不会出现在其他项目中。",
    commandLoadingDetails: [
      { label: "来源", desc: "命令原件存储在 ~/.reap/commands/（由 reap init 和 reap update 安装）" },
      { label: "加载", desc: "打开REAP项目时，会话钩子自动在 .claude/commands/ 中创建符号链接" },
      { label: "非REAP项目", desc: "不会创建符号链接，因此AI代理的技能列表中不会出现REAP" },
      { label: "向后兼容", desc: "~/.claude/commands/ 中的重定向存根确保旧版设置继续工作" },
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "核心概念",
    breadcrumb: "指南",
    fourAxisTitle: "四轴结构",
    fourAxisDesc: "REAP将.reap/下的所有内容组织为四个轴：",
    axes: [
      { axis: "Genome", path: ".reap/genome/", desc: "遗传信息 — 原则、规则、架构决策、源码映射。", href: "/docs/genome" },
      { axis: "Environment", path: ".reap/environment/", desc: "外部上下文 — API、基础设施、业务约束。3层：summary + docs + resources。", href: "/docs/environment" },
      { axis: "Lifecycle", path: ".reap/life/", desc: "当前Generation的生命周期 — 进度状态、制品、backlog。", href: "/docs/lifecycle" },
      { axis: "Lineage", path: ".reap/lineage/", desc: "已完成Generation的存档 — DAG元数据、压缩历史。", href: "/docs/lineage" },
    ],
    principlesTitle: "核心原则",
    principles: [
      { name: "Genome不变原则", desc: "Generation期间不直接修改。通过backlog → Completion进行变更。" },
      { name: "Environment不变原则", desc: "Generation期间不直接修改。外部变更记录为backlog项目。" },
      { name: "Stage纪律", desc: "所有Generation遵循5个阶段。不可跳过。仅通过/reap.next转换。" },
      { name: "Genome是事实源泉", desc: "架构决策记录在Genome中，而非代码注释或文档。" },
    ],
    lifecycleTitle: "生命周期概述",
    lifecycleDesc: "每个Generation遵循五个阶段，每步生成制品：",
    stageHeaders: ["阶段", "内容", "制品"],
    stages: [
      ["Objective", "通过结构化头脑风暴定义目标", "01-objective.md"],
      ["Planning", "任务分解 + 实施计划", "02-planning.md"],
      ["Implementation", "AI + 人类协作实现", "03-implementation.md"],
      ["Validation", "执行测试、验证完成标准", "04-validation.md"],
      ["Completion", "回顾 + Genome更新 + 自动归档（consume + archive + commit）", "05-completion.md"],
    ],
    sessionInitTitle: "会话初始化",
    sessionInitDesc: "打开REAP项目时，会话hook自动向AI代理注入上下文 — Genome、Environment摘要、Generation状态和工作流规则。代理立即理解您的项目。",
    sessionInitAlt: "显示Genome加载、Generation状态和活动目标的REAP会话初始化",
    evolutionFlowTitle: "进化流程",
    evolutionFlowDesc: "知识通过Generation复利积累。每个Generation进化Genome，教训在Lineage中积累：",
  },

  // Workflow Page
  workflow: {
    title: "工作流",
    breadcrumb: "指南",
    intro: "Generation是REAP的基本工作单元。每个Generation通过五个阶段执行一个目标，并在过程中生成产出物。了解每个阶段发生什么以及如何连接。",
    evolveTitle: "/reap.evolve — 主要工作方式",
    evolveDesc: "大多数情况下，运行/reap.evolve后AI代理会自主执行所有阶段。处理Generation启动、每个阶段的执行、阶段间的推进以及最终的归档。跳过日常的逐阶段确认，仅在代理真正受阻时（目标模糊、重要权衡决策、Genome冲突、意外错误）才停止。",
    evolveNote: "需要精细控制时，可以运行单独的阶段命令。详情请参阅命令参考。",
    stageWalkthrough: "阶段详解",
    stageDetails: [
      {
        title: "1. Objective",
        desc: "通过结构化头脑风暴定义本Generation的目标。AI代理扫描上下文后，引导逐一澄清问题，提出2-3个备选方案及权衡分析，进行分段设计审批，可选使用视觉伴侣展示原型和图表，并运行自动Spec审查。",
        output: "01-objective.md — 目标、完成标准（最多7个，可验证）、功能需求（最多10个）、设计（方案对比、选定设计）、范围、Genome差距分析。",
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
        desc: '回顾并进化。提取经验教训（最多5条），将genome-change backlog项目应用到Genome文件，清理技术债务，将未完成任务交接到下一个Generation的backlog。Hook Suggestion检测跨Generation的重复模式，并在用户确认后建议创建hook。Completion现已支持自动归档：consume + archive + commit在一个步骤中完成（4 phase简化为2 phase）。',
        output: "05-completion.md — 摘要、回顾、Genome变更日志。自动归档将所有内容移至lineage。",
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
    runTitle: "reap run <cmd>",
    runDesc: "直接执行斜杠命令的TypeScript脚本。每个斜杠命令的.md wrapper会在内部调用此命令。通常用户不需要直接运行。",
    runNote: "所有31个斜杠命令都使用此架构：.md文件是调用reap run <cmd>的1行wrapper，TS脚本向AI代理返回structured JSON指令。",
    statusTitle: "reap status",
    statusDesc: "显示当前项目和Generation状态。",
    statusNote: "显示项目名称、entry模式、活跃Generation（id、目标、阶段）、已完成Generation总数、REAP版本及最新状态。",
    updateTitle: "reap update",
    updateDesc: "将命令、模板、hooks同步到最新版本。自动清理~/.claude/commands/中的旧版文件。",
    dryRunDesc: "显示将要更新的内容而不实际应用更改。",
    fixTitle: "reap fix",
    fixDesc: "诊断并修复.reap/目录结构。使用--check进入只读模式。",
    fixNote: "检查缺失的目录，验证config.yml是否存在，验证current.yml阶段，并重建缺失的结构。使用--check时仅检查结构完整性，不进行修改。",
    cleanTitle: "reap clean",
    cleanDesc: "通过交互式选项重置REAP项目。",
    cleanNote: "提供交互式提示，可选择性地重置REAP项目的特定部分（例如：life、lineage、genome）。",
    destroyTitle: "reap destroy",
    destroyDesc: "从项目中删除所有REAP文件。",
    destroyNote: "从项目中完全删除.reap/目录和所有REAP相关文件。需输入\"yes destroy\"确认。",
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
    normalTitle: "Normal Generation",
    normalCommands: [
      ["/reap.evolve", "从头到尾运行整个Generation。日常开发的主要命令。自主循环所有阶段 — 跳过日常确认，仅在真正受阻时停止。"],
      ["/reap.evolve.recovery", "从失败或中断的Generation中恢复。创建一个从出错点继续的recovery Generation。"],
      ["/reap.start", "开始新的Generation。扫描backlog中的待处理项目，请求目标，创建current.yml，将阶段设为objective。"],
      ["/reap.objective", "通过结构化头脑风暴定义目标：澄清问题、方案替代、分段设计、视觉伴侣、Spec审查循环。"],
      ["/reap.planning", "将目标分解为有依赖关系的任务。创建实施计划。"],
      ["/reap.implementation", "执行计划中的任务。将已完成/未完成任务和Genome发现记录在产出物中。"],
      ["/reap.validation", "执行constraints.md中的验证命令。检查完成标准。判定：pass / partial / fail。"],
      ["/reap.completion", "回顾，应用backlog中的Genome变更，清理，最终化。"],
      ["/reap.next", "前进到下一个生命周期阶段。从模板创建下一个产出物。完成时归档。"],
      ["/reap.back", "回到前一个阶段（micro loop）。在时间线和产出物中记录回退原因。"],
    ],
    mergeTitle: "Merge Generation",
    mergeCommands: [
      ["/reap.pull <branch>", "拉取远程，检测新的Generation，并运行完整的合并Generation生命周期。/reap.evolve的分布式版本。"],
      ["/reap.merge <branch>", "为本地分支运行完整的merge generation。无需fetch — 非常适合基于worktree的并行开发。/reap.pull的本地版本。"],
      ["/reap.push", "验证REAP状态（如有进行中的Generation则警告）并将当前分支推送到远程。"],
      ["/reap.merge.start", "启动合并Generation以合并分歧的分支。创建合并Generation并运行detect。"],
      ["/reap.merge.detect", "通过git refs分析当前分支与目标分支之间的分歧。"],
      ["/reap.merge.mate", "在源码合并前解决Genome冲突（WRITE-WRITE、CROSS-FILE）。由人类决定。"],
      ["/reap.merge.merge", "运行git merge --no-commit，根据已确定的Genome解决源码冲突。"],
      ["/reap.merge.sync", "AI比较Genome和源代码的一致性。发现不一致时由用户确认。"],
      ["/reap.merge.validation", "运行机械化测试命令（bun test、tsc、build）— 与正常Generation相同。"],
      ["/reap.merge.evolve", "从当前阶段到完成运行合并生命周期。自主模式适用。"],
    ],
    generalTitle: "通用",
    generalCommands: [
      ["/reap.abort", "中止当前Generation。对代码变更选择rollback/stash/hold，可附加abort元数据保存到backlog。"],
      ["/reap.status", "显示当前Generation状态、阶段进度、backlog摘要、时间线、Genome状态。"],
      ["/reap.sync", "同时同步Genome和Environment。依次运行sync.genome + sync.environment。"],
      ["/reap.sync.genome", "分析源代码并同步Genome。无活跃Generation时直接更新；有则记录到backlog。"],
      ["/reap.sync.environment", "探索外部依赖（API、基础设施、服务）并文档化到3层环境结构（summary.md + docs/ + resources/）。"],
      ["/reap.config", "显示当前项目配置（.reap/config.yml）。"],
      ["/reap.report", "通过GitHub Issue向REAP项目报告bug/反馈。隐私双重检查（PRIVACY_GATE + 格式化后脱敏）。需用户确认。"],
      ["/reap.help", "提供24+主题的上下文帮助。"],
      ["/reap.update", "升级REAP包 + 将命令/模板/hook同步到所有检测到的代理。即时同步项目.claude/commands/。"],
      ["/reap.refreshKnowledge", "为子代理加载REAP上下文（Genome、Environment、状态）。编排代理用于引导子代理会话。"],
      ["/reap.update-genome", "无需Generation即可应用待处理的genome-change backlog。仅在没有active generation时可用。已应用项目标记为consumed，genomeVersion递增。"],
    ],
    commandStructure: "Script Orchestrator架构",
    commandStructureDesc: "从v0.11.0起，所有斜杠命令都是调用reap run <cmd>的1行.md wrapper。TypeScript脚本处理所有确定性逻辑，以structured JSON向AI发出指令。模式：Gate（前置条件检查）→ Steps（工作执行）→ Artifact（记录到.reap/life/）。Generation类型：normal、merge、recovery。",
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
      ["preset", "初始化时使用的预设（例如：bun-hono-react）。可选"],
      ["strict", "Strict模式：boolean（简写）或 { edit, merge } 进行细粒度控制（见下文）"],
      ["language", "产出物和用户交互的语言（例如：korean、english、japanese）"],
      ["autoUpdate", "会话开始时自动更新（默认：true）"],
      ["autoSubagent", "通过Agent tool自动将/reap.evolve委托给subagent（默认：true）"],
      ["autoIssueReport", "检测到故障时自动向GitHub报告。需要gh CLI（默认：检测到gh时为true）"],
      ["agents", "检测到的AI代理，由reap init/update管理（例如：claude-code、opencode）"],
    ],
    strictMode: "Strict模式",
    strictModeDesc: "Strict模式控制AI代理被允许执行的操作。它支持两种形式：",
    strictConfigExample: `# Shorthand — enables both edit and merge restrictions
strict: true

# Granular control
strict:
  edit: true    # Restrict code changes to REAP lifecycle
  merge: false  # Restrict raw git pull/push/merge`,
    strictEditTitle: "strict.edit — 代码修改控制",
    strictEditDesc: "启用后，AI代理无法在REAP工作流之外修改代码。",
    strictHeaders: ["情境", "行为"],
    strictRules: [
      ["无活跃Generation / 非Implementation阶段", "代码修改完全阻止"],
      ["Implementation阶段", "仅允许02-planning.md范围内的修改"],
      ["逃生舱", '用户明确请求 "override" 或 "bypass strict" 时允许修改'],
    ],
    strictMergeTitle: "strict.merge — Git命令控制",
    strictMergeDesc: "启用后，直接的git pull、git push和git merge命令将被限制。代理会引导用户使用REAP斜杠命令（/reap.pull、/reap.push、/reap.merge）。",
    strictNote: "两者默认都禁用。strict: true会同时启用两者。读取文件、分析代码和回答问题无论strict模式如何都始终允许。",
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
    title: "Hooks",
    breadcrumb: "指南",
    intro: "REAP hooks允许在关键的生命周期事件中运行自动化。Hook以独立文件存储在.reap/hooks/中，AI代理会在适当的时机执行。",
    hookTypes: "Hook类型",
    hookTypesIntro: "每个hook文件根据其扩展名支持两种类型之一：",
    commandType: "command (.sh)",
    commandTypeDesc: "Shell脚本。由AI代理在项目根目录中执行。用于脚本、CLI工具、构建命令。",
    promptType: "prompt (.md)",
    promptTypeDesc: "Markdown格式的AI代理指令。代理读取提示并执行代码分析、文件修改、文档更新等任务。用于需要判断的任务。",
    hookTypeNote: "每个hook是一个独立文件。同一事件的多个hook按frontmatter中指定的顺序执行。",
    fileNaming: "文件命名",
    fileNamingDesc: "Hook文件遵循以下模式: .reap/hooks/{event}.{name}.{md|sh}",
    fileNamingFrontmatter: "每个hook文件支持可选的YAML frontmatter：",
    frontmatterHeaders: ["字段", "说明"],
    frontmatterItems: [
      ["condition", ".reap/hooks/conditions/文件夹中的条件脚本名称（例如: always, has-code-changes, version-bumped）"],
      ["order", "同一事件有多个hook时的执行顺序（默认: 0）"],
    ],
    events: "Events",
    normalEventsTitle: "Normal Lifecycle Events",
    mergeEventsTitle: "Merge Lifecycle Events",
    eventHeaders: ["Event", "触发时机"],
    eventItems: [
      ["onLifeStarted", "/reap.start创建新Generation之后"],
      ["onLifeObjected", "objective阶段完成后"],
      ["onLifePlanned", "planning阶段完成后"],
      ["onLifeImplemented", "implementation阶段完成后"],
      ["onLifeValidated", "validation阶段完成后"],
      ["onLifeCompleted", "completion + 归档后（git commit之后运行）"],
      ["onLifeTransited", "所有stage转换时（通用）"],
      ["onLifeRegretted", "/reap.back regression时"],
      ["onMergeStarted", "/reap.merge.start创建合并Generation之后"],
      ["onMergeDetected", "detect阶段完成后"],
      ["onMergeMated", "mate阶段完成后（genome确定）"],
      ["onMergeMerged", "merge阶段完成后（源代码合并）"],
      ["onMergeSynced", "sync阶段完成后"],
      ["onMergeValidated", "merge validation完成后"],
      ["onMergeCompleted", "merge completion + 归档后"],
      ["onMergeTransited", "所有merge stage转换时（通用）"],
    ],
    configuration: "基于文件的配置",
    configurationDesc: "Hook是基于文件的 — 存储在.reap/hooks/中，不在config.yml中。每个hook的文件名格式为{event}.{name}.{md|sh}。",
    configExample: `# .reap/hooks/ 目录结构
#
# .reap/hooks/
# ├── onLifeStarted.notify.sh
# ├── onLifeTransited.lint.sh
# ├── onLifeCompleted.update.sh
# ├── onLifeCompleted.docs-review.md
# └── onLifeRegretted.log.md
#
# 示例: onLifeCompleted.docs-review.md
# ---
# condition: has-code-changes
# order: 10
# ---
# 检查本Generation中的变更内容。
# 如果添加或修改了功能、CLI命令或斜杠命令，
# 则更新README.md和docs。
# 如果不需要文档更新则跳过。
#
# 示例: onLifeTransited.lint.sh
# ---
# order: 0
# ---
# #!/bin/bash
# npm run lint`,
    hookSuggestion: "自动Hook建议",
    hookSuggestionDesc: "在Completion阶段（Phase 5: Hook Suggestion），REAP会检测跨Generation的重复模式（如反复的手动步骤、重复的命令、一致的阶段后操作等）。当检测到模式时，REAP会建议创建hook来自动化。Hook创建始终需要用户确认后才能应用。",
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
      "onLifeCompleted hooks在git commit之后运行 — hooks的文件变更处于uncommitted状态。",
    ],
  },

  // Advanced Page
  advanced: {
    title: "进阶",
    breadcrumb: "指南",
    signatureTitle: "签名锁定（Signature-Based Locking）",
    signatureDesc: "REAP使用加密nonce链来强制执行阶段顺序。没有有效的nonce，AI代理无法推进到下一阶段 — 即使尝试跳过也会被阻止。",
    signatureFlow: `Stage Command          current.yml              /reap.next
─────────────          ───────────              ──────────
生成nonce ────────────→ 存储hash(nonce)
将nonce返回给AI                            ←── AI传递nonce
                                               验证hash(nonce)
                                               ✓ 阶段推进`,
    signatureHow: "工作原理",
    signatureHowItems: [
      "阶段命令（如 /reap.objective）生成随机nonce",
      "Nonce的SHA-256哈希存储在current.yml中",
      "Nonce包含在JSON响应中返回给AI代理",
      "/reap.next接收nonce，进行哈希并与current.yml比较",
      "匹配 → 阶段推进。不匹配 → 拒绝。",
    ],
    signatureComparisonTitle: "仅提示词 vs 签名锁定",
    signatureComparisonHeaders: ["威胁", "仅提示词", "签名锁定"],
    signatureComparisonItems: [
      ["跳过阶段", "依赖AI遵守", "阻止 — 无有效nonce"],
      ["伪造令牌", "不适用", "不可行 — 单向哈希"],
      ["重放旧nonce", "不适用", "阻止 — 一次性，绑定到当前阶段"],
      ["提示词注入", "脆弱", "Nonce在提示词上下文之外"],
    ],
    compressionTitle: "Lineage压缩",
    compressionDesc: "随着Generation的积累，lineage归档会自动压缩以管理大小。",
    compressionHeaders: ["级别", "输入", "输出", "最大行数", "触发条件"],
    compressionItems: [
      ["Level 1", "Generation文件夹（5个产出物）", "gen-XXX-{hash}.md", "40", "lineage > 5,000行 + 5个以上Generation"],
      ["Level 2", "5个Level 1文件", "epoch-XXX.md", "60", "存在5个以上Level 1文件"],
    ],
    compressionProtection: "最近3个Generation始终受到压缩保护，保留最近上下文的完整细节。",
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

  // Distributed Workflow - Overview
  collaboration: {
    title: "分布式工作流",
    breadcrumb: "协作",
    intro: "REAP支持多个开发者或AI代理在同一项目上并行工作的分布式协作 — 无需中央服务器。Git是唯一的传输层。",
    caution: "分布式工作流目前处于早期阶段，需要进一步测试。请在生产环境中谨慎使用。我们正在积极收集用户反馈 — 请在以下地址提交问题或建议：",
    cautionLink: "GitHub Issues",
    cautionUrl: "https://github.com/c-d-cc/reap/issues",
    howItWorks: "工作原理",
    howItWorksDesc: "每个开发者或代理在自己的分支和Generation上独立工作。当需要合并时，REAP以Genome优先策略来协调合并。",
    flowSteps: [
      "Machine A在branch-a上完成gen-046-a → /reap.push",
      "Machine B在branch-b上完成gen-046-b → /reap.push",
      "Machine A运行/reap.pull branch-b → fetch + 完整的合并Generation生命周期",
    ],
    principles: "核心原则",
    principleItems: [
      { label: "Opt-in", desc: "git pull/push始终正常工作。REAP命令是附加的 — 您选择何时使用分布式工作流。" },
      { label: "Genome优先", desc: "在源码合并之前解决Genome冲突。就像在更新法律之前修改宪法。" },
      { label: "无服务器", desc: "一切都是本地 + Git。无外部服务，无中央协调。" },
      { label: "DAG lineage", desc: "每个Generation通过基于哈希的ID（gen-046-a3f8c2）引用其父代，形成自然支持并行工作的有向无环图。" },
    ],
    scenarios: "使用场景",
    scenarioItems: [
      { label: "远程分支（多机器）", desc: "不同的开发者或代理在各自的机器上工作并推送到远程分支。使用/reap.push发布，/reap.pull <branch>拉取并合并。", example: "/reap.push → /reap.pull branch-b" },
      { label: "本地worktree（多代理）", desc: "多个AI代理使用git worktree在同一台机器上并行工作。每个worktree有自己的分支和Generation。使用/reap.merge.start直接合并 — 无需fetch。", example: "/reap.merge.start worktree-branch" },
      { label: "混合", desc: "部分工作在本地（worktree），部分在远程（其他机器）。根据需要组合使用/reap.pull用于远程分支，/reap.merge.start用于本地分支。" },
    ],
    pullPush: "Pull & Push（远程）",
    pullDesc: "/reap.pull <branch>是/reap.evolve的分布式版本。它拉取远程，检测新的Generation，并运行从Detect到Completion的完整合并Generation生命周期。",
    pushDesc: "/reap.push验证当前REAP状态（如有进行中的Generation则警告）并将当前分支推送到远程。",
    merge: "Merge（本地 / Worktree）",
    mergeDesc: "/reap.merge.start <branch>直接从本地分支创建合并Generation — 非常适合无需fetch的基于worktree的并行开发。使用/reap.merge.evolve运行完整的合并生命周期，或手动逐步执行每个阶段。",
    gitRefReading: "基于Git Ref的读取",
    gitRefDesc: "合并前，通过git refs（git show、git ls-tree）读取目标分支的Genome和lineage — 无需checkout。这允许在不修改工作树的情况下比较Genome变更。",
  },

  // Distributed Workflow - Merge Lifecycle
  mergeGeneration: {
    title: "合并世代",
    breadcrumb: "协作",
    intro: "当分歧的分支需要合并时，REAP会运行一个称为Merge Generation的专门6阶段生命周期 — 与正常的Generation生命周期分开。核心原则：先对齐Genome，再合并源代码。",
    whyLonger: "Merge Generation与普通git merge有什么不同？",
    whyLongerDesc: "普通的git merge只解决源代码冲突。但当两个分支独立进化时 — 各自拥有自己的Generation、Genome变更和设计决策 — 仅合并源代码是不够的。Genome（架构原则、约定、约束、业务规则）也可能已经分歧。Merge Generation在源码合并之前增加了三个关键步骤：检测Genome分歧、Mating（解决Genome冲突）以及合并后验证Genome与源代码的一致性。这确保了合并后的代码库不仅能编译通过，而且在设计上也保持一致。",
    whyGenomeFirst: "为什么Genome对齐优先",
    whyGenomeFirstDesc: "解决源代码冲突并不能保证不存在语义冲突。两段代码可以完全没有git冲突地干净合并，但在意图、架构或业务逻辑上相互矛盾。只有基于Genome的推理才能检测到这些不可见的冲突：合并后的代码是否仍然遵循架构原则？约定是否一致？业务规则是否对齐？这就是REAP在触碰源代码之前先对齐Genome的原因。一旦Genome确定，它就成为解决源代码冲突的权威指南 — 不仅在语法上，还在语义上。",
    whyLongerPoints: [
      { label: "普通git merge", desc: "源码冲突 → 解决 → 提交。不检查设计一致性。语义冲突未被检测。" },
      { label: "Merge Generation", desc: "Genome对齐优先 → 基于Genome的源码合并 → 验证Genome-源码一致性 → 验证 → 提交。捕获不可见的语义冲突。" },
    ],
    stageOrder: "阶段顺序",
    stages: [
      { name: "Detect", desc: "通过git refs扫描目标分支。使用DAG BFS找到共同祖先。提取Genome差异。将冲突分类为WRITE-WRITE或CROSS-FILE。", artifact: "01-detect.md" },
      { name: "Mate", desc: "向人类展示所有Genome冲突。WRITE-WRITE：选A、选B或手动合并。CROSS-FILE：检查逻辑兼容性。继续之前Genome必须完全解决。", artifact: "02-mate.md" },
      { name: "Merge", desc: "对目标分支运行git merge --no-commit。根据已确定的Genome解决源码冲突。检查语义冲突 — 能编译但与Genome矛盾的代码。", artifact: "03-merge.md" },
      { name: "Sync", desc: "AI比较Genome和源代码的一致性。发现不一致时由用户确认。如有问题，回退到Merge或Mate。", artifact: "04-sync.md" },
      { name: "Validation", desc: "运行constraints.md中的所有机械化测试命令（bun test、tsc、build）。如有失败，回退到Merge或Mate。", artifact: "05-validation.md" },
      { name: "Completion", desc: "提交合并结果。在meta.yml中记录type: merge和双方父代。归档到lineage。", artifact: "06-completion.md" },
    ],
    stageHeaders: ["阶段", "内容", "产出物"],
    conflictTypes: "冲突类型",
    conflictHeaders: ["类型", "说明", "解决方式"],
    conflicts: [
      ["WRITE-WRITE", "两个分支修改了同一Genome文件", "人类决定：保留A、保留B或合并"],
      ["CROSS-FILE", "修改了不同的Genome文件，但两个分支都更改了Genome", "人类审查逻辑兼容性"],
      ["源码冲突", "Git合并冲突发生在源代码中", "根据已确定的Genome解决"],
      ["语义冲突", "代码干净合并但与Genome（架构、约定、业务规则）矛盾", "在Sync阶段检测 — AI比较Genome和源代码，用户确认解决方案"],
      ["无冲突", "无Genome或源码冲突", "自动进行"],
    ],
    regression: "合并回退",
    regressionDesc: "Validation或Sync失败可以回退到Merge或Mate。如果在Merge中发现Genome问题，可以回退到Mate。回退规则遵循与正常Generation相同的模式 — 原因记录在时间线和产出物中。",
    currentYml: "current.yml结构（合并）",
  },

  // Distributed Workflow - Merge Commands
  mergeCommands: {
    title: "合并命令",
    breadcrumb: "协作",
    intro: "所有分布式工作流操作都是由AI代理执行的斜杠命令。没有用于合并的CLI命令 — AI代理对于Genome冲突解决和源码合并指导至关重要。",
    primaryCommands: "主要命令",
    primaryItems: [
      { cmd: "/reap.pull <branch>", desc: "分布式合并的一站式命令。拉取远程，检测目标分支上的新Generation，创建合并Generation，并运行完整的合并生命周期。这是/reap.evolve的分布式版本。" },
      { cmd: "/reap.merge <branch>", desc: "为本地分支运行完整的merge generation。无需fetch — 非常适合基于worktree的并行开发。/reap.pull的本地版本。" },
      { cmd: "/reap.push", desc: "验证REAP状态（如有进行中的Generation则警告）并推送当前分支。在完成Generation后使用。" },
    ],
    stageCommands: "阶段命令（精细控制）",
    stageItems: [
      { cmd: "/reap.merge.start", desc: "为目标分支创建合并Generation。运行detect并生成01-detect.md。" },
      { cmd: "/reap.merge.detect", desc: "审查分歧报告。如需要可重新运行。" },
      { cmd: "/reap.merge.mate", desc: "与人类交互式解决Genome冲突。" },
      { cmd: "/reap.merge.merge", desc: "运行git merge --no-commit并解决源码冲突。" },
      { cmd: "/reap.merge.sync", desc: "AI比较Genome和源代码的一致性。发现不一致时由用户确认。" },
      { cmd: "/reap.merge.validation", desc: "运行机械化测试（bun test、tsc、build）。失败时回退。" },
      { cmd: "/reap.merge.completion", desc: "提交并归档合并Generation。" },
      { cmd: "/reap.merge.evolve", desc: "从当前阶段到完成运行合并生命周期。" },
    ],
    mergeHooks: "合并Hooks",
    mergeHookHeaders: ["Event", "触发时机"],
    mergeHookItems: [
      ["onMergeStarted", "/reap.merge.start创建合并Generation之后"],
      ["onMergeDetected", "detect阶段完成后"],
      ["onMergeMated", "mate阶段完成后（genome确定）"],
      ["onMergeMerged", "merge阶段完成后（源代码合并）"],
      ["onMergeSynced", "sync阶段完成后"],
      ["onMergeValidated", "merge validation完成后"],
      ["onMergeCompleted", "merge completion + 归档后"],
      ["onMergeTransited", "所有merge stage转换时（通用）"],
    ],
    mergeHookNote: "onMergeTransited在所有merge stage转换时触发。相当于onLifeTransited的merge版本。",
  },

  // Comparison Page
  comparison: {
    title: "对比",
    breadcrumb: "入门",
    heading: "与Spec Kit的对比",
    desc: "Spec Kit开创了在编写代码前编写规格的规格驱动开发方式。REAP在此概念上发展并解决了主要局限性：",
    items: [
      { title: "静态规格 vs 活的Genome", desc: "现有工具将规格视为静态文档。REAP的Genome是一个活的系统 — 实现中发现的缺陷通过backlog反馈并在Completion时应用。设计随代码一起演进。" },
      { title: "跨会话无记忆", desc: "大多数AI开发工具在会话间丢失上下文。REAP的SessionStart Hook自动将完整的项目上下文（Genome、Generation状态、工作流规则）注入每个新会话。" },
      { title: "线性工作流 vs Micro loops", desc: "现有工具遵循线性流程（规格 → 计划 → 实现）。REAP支持结构化回退 — 在保留产出物的同时可以从任何阶段回到前一阶段。" },
      { title: "独立任务 vs 代际进化", desc: "现有工具中的每个任务是独立的。在REAP中，Generation相互建立。知识通过Lineage归档和Genome进化以复利方式积累。" },
      { title: "无生命周期hooks", desc: "REAP提供项目级hooks（onLifeStarted、onLifeTransited、onLifeCompleted、onLifeRegretted）用于自动化。" },
    ],
  },
  genomePage: { title: "Genome", breadcrumb: "指南", intro: "Genome是REAP的权威知识源 — 架构原则、开发规范、技术约束和领域规则。它是项目的DNA。", structureTitle: "结构", structure: `.reap/genome/\n├── principles.md      # 架构原则/决策 (ADR风格)\n├── conventions.md     # 开发规则/规范\n├── constraints.md     # 技术约束/选择\n├── source-map.md      # C4 Container/Component图\n└── domain/            # 业务规则 (按模块)`, principlesTitle: "编写原则", principles: ["Map not Manual — 每文件~100行。详情移至domain/。", "可供Agent立即行动的水平。", "domain/专用于业务规则 — 不是代码结构，而是策略、阈值、状态转换。", "优先使用lint/test强制，而非文档规则。"], immutabilityTitle: "Genome不变原则", immutabilityDesc: "当前Generation不直接修改Genome。实现过程中发现的问题记录为genome-change backlog项目，仅在Completion阶段应用。",
    immutabilityWhy: "为什么？把Genome想象成宪法。如果在工作途中修改宪法，之前所有的决定都会失去依据。将变更推迟到Completion，世代在稳定的基准上完成 — 然后Genome基于实际经验而非假设，进行有意识的进化。", contextTitle: "会话上下文", contextDesc: "Genome在会话启动时自动加载到AI代理的上下文中。代理始终可以访问项目的原则、规范、约束和source map — 无需手动说明。", evolutionTitle: "世代进化", evolutionDesc: "每个世代结束时（Completion阶段），genome-change backlog项目被审核并应用到Genome。该世代的源代码变更同步反映到Genome中，确保Knowledge Base随着代码库的进化持续同步。", syncTitle: "手动同步", syncDesc: "使用/reap.sync.genome按需分析源代码并更新Genome。无活跃Generation时直接应用，有活跃Generation时差异记录到backlog，在下次Completion时反映。" },
  environmentPage: { title: "Environment", breadcrumb: "指南", intro: "Environment存储影响项目的外部上下文 — API、基础设施、组织规则和参考材料。", structureTitle: "3层结构", structure: `.reap/environment/\n├── summary.md      # 会话上下文 (~100行，自动加载)\n├── docs/           # 主要参考文档\n└── resources/      # 原始材料 (用户提供或AI收集)`, layersTitle: "层级", layerHeaders: ["层级", "维护主体", "内容", "限制"], layerItems: [["summary.md", "AI (自动生成)", "docs/全部概述。每次会话加载。", "~100行"], ["docs/", "AI + 用户", "按环境主题的文件。", "每文件~100行"], ["resources/", "用户", "原始文档、PDF、外部链接。", "无限制"]], immutabilityTitle: "Environment不变原则", immutabilityDesc: "与Genome一样，Environment也不在世代进行中直接修改。发现的外部环境变更记录为environment-change backlog项目，在Completion时应用。", immutabilityWhy: "外部环境的变化 — API弃用、基础设施迁移 — 可能使Planning阶段的假设失效。将变更记录到backlog而非即时重写Environment，世代在稳定的外部环境地图上完成。更新在拥有完整构建上下文的情况下，一次性有意识地进行。", flowTitle: "查找流程", flowDesc: "summary.md (始终加载) → docs/ (需要详情时) → resources/ (需要原始来源时)", syncTitle: "手动同步", syncDesc: "使用/reap.sync.environment发现外部依赖并文档化。扫描源代码寻找线索，然后向用户访谈连接的系统、基础设施和组织规则。", syncSources: [{ label: "人类输入", role: "主要来源", desc: "用户直接描述代码无法推断的API、基础设施、组织规则和业务约束。" }, { label: "源代码", role: "辅助来源", desc: "package.json、配置文件、API客户端 — 扫描以引导提问和检测依赖。" }], syncContrast: "与Genome sync相比，源代码是主要来源。而对于Environment，外部世界的信息存在于人的脑中 — 代码只能提供线索。" },
  lifecyclePage: { title: "Lifecycle", breadcrumb: "指南", intro: "生命周期是REAP的心脏 — 每个Generation经历5个阶段（Objective → Planning → Implementation → Validation → Completion），每步生成制品。AI代理引导您完成整个生命周期。", structureTitle: "制品结构", structure: `.reap/life/\n├── current.yml          # 当前世代状态 (id, goal, stage, timeline)\n├── 01-objective.md      # 目标、需求、设计决策\n├── 02-planning.md       # 任务分解、依赖关系\n├── 03-implementation.md # 实现日志、变更记录\n├── 04-validation.md     # 测试结果、完成标准检查\n├── 05-completion.md     # 回顾、genome变更历史\n└── backlog/             # 下一世代的项目\n    ├── fix-auth-bug.md  #   type: task\n    └── add-index.md     #   type: genome-change`, structureDesc: "每个阶段在.reap/life/中生成制品。世代完成后，所有制品归档到.reap/lineage/gen-XXX-hash-slug/，current.yml为下一世代清空。" },
  lineagePage: { title: "Lineage", breadcrumb: "指南", intro: "Lineage是已完成Generation的存档。", structureTitle: "结构", structureDesc: "每个完成的Generation创建包含制品和元数据的目录:", structure: `.reap/lineage/\n├── gen-042-a3f8c2-fix-login-bug/\n│   ├── meta.yml\n│   ├── 01-objective.md ~ 05-completion.md\n├── gen-030-b7e1f2.md     # Level 1压缩\n└── epoch.md              # Level 2压缩`, dagTitle: "DAG", dagDesc: "每个Generation在meta.yml中记录parents，形成DAG。", compressionTitle: "压缩", compressionDesc: "在Completion阶段自动压缩。", compressionHeaders: ["级别", "输入", "输出", "触发", "保护"], compressionItems: [["Level 1", "Generation文件夹", "gen-XXX-{hash}.md (40行)", "> 5,000行 + 5个以上", "最近3个 + DAG leaf"], ["Level 2", "Level 1超过100个", "单一epoch.md", "Level 1 > 100", "最近9个 + fork point"]], compressionSafety: "Level 1在frontmatter中保留元数据。Level 2 epoch.md存储generations hash chain。Fork guard: 扫描所有branch后保护fork point。" },
  backlogPage: { title: "Backlog", breadcrumb: "指南", intro: "Backlog管理在Generation间传递的项目。", typesTitle: "项目类型", typeHeaders: ["类型", "说明", "应用时机"], typeItems: [["task", "延迟的工作、技术债务、功能想法", "在下一个Objective中作为目标候选参考"], ["genome-change", "Generation期间发现的Genome修改", "在Completion中应用到Genome"], ["environment-change", "Generation期间发现的外部环境变更", "在Completion中应用到Environment"]], statusTitle: "状态", statusHeaders: ["状态", "含义"], statusItems: [["pending", "未处理 (默认)"], ["consumed", "在Generation中已处理 (需要consumedBy: gen-XXX-{hash})"]], archivingTitle: "归档规则", archivingDesc: "归档时consumed项目移至lineage。pending项目结转到下一个Generation的backlog。", deferralTitle: "任务延期", deferralDesc: "部分完成是正常的 — 依赖Genome变更的任务标记为[deferred]传递到下一个Generation。", abortTitle: "Abort Backlog", abortDesc: "通过/reap.abort中止Generation时，可以将目标和进度与abort元数据一起保存到backlog。", formatTitle: "文件格式", format: `---\ntype: task\nstatus: pending\npriority: medium\n---\n\n# 任务标题\n\n任务描述。` },
};

export interface Translations {
  nav: {
    getStarted: string;
    groups: {
      gettingStarted: string;
      coreConcepts: string;
      planAxis: string;
      execAxis: string;
      knowledge: string;
      collaboration: string;
      reference: string;
      other: string;
    };
    items: {
      introduction: string;
      quickStart: string;
      autonomousEvolution: string;
      v018change: string;
      twoAxes: string;
      storage: string;
      loop: string;
      planSource: string;
      idea: string;
      carveMilestone: string;
      generation: string;
      delegation: string;
      backlog: string;
      closingMilestone: string;
      genome: string;
      environment: string;
      visionMemory: string;
      codeIntelligence: string;
      orchestrate: string;
      claimBarrier: string;
      hooks: string;
      skillReference: string;
      cliReference: string;
      configuration: string;
      doctor: string;
      comparison: string;
      migration: string;
      releaseNotes: string;
    };
  };

  hero: {
    tagline: string;
    title: string;
    description: string;
    getStarted: string;
    breakingBand: {
      text: string;
      changeLinkText: string;
      migrationLinkText: string;
    };
    whyReap: string;
    whyReapDesc: string;
    problems: { problem: string; solution: string }[];
    structureTitle: string;
    structureDesc: string;
    structureItems: { label: string; sub: string; desc: string }[];
    axesTitle: string;
    axesDesc: string;
    axes: { label: string; sub: string; items: { unit: string; what: string; where: string }[] }[];
    axesJoin: string;
    installation: string;
    installStep1: string;
    installStep2: string;
    installNote: string;
    installLinkText: string;
    keyConcepts: string;
    concepts: { label: string; desc: string }[];
    documentation: string;
    docLinks: { href: string; title: string; desc: string }[];
  };

  intro: {
    title: string;
    breadcrumb: string;
    description: string;
    whatBuilds: string;
    whyReapTitle: string;
    problemHeader: string;
    solutionHeader: string;
    problems: [string, string][];
    structureTitle: string;
    structureDesc: string;
    structureItems: { label: string; sub: string; path: string; desc: string }[];
    projectStructureTitle: string;
    projectStructureTree: string;
    nextText: string;
    quickStartLinkText: string;
  };

  v018change: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    tableTitle: string;
    tableHeaders: string[];
    table: [string, string][];
    goneTitle: string;
    goneItems: [string, string][];
    sameTitle: string;
    sameDesc: string;
    migrateNote: string;
    migrateLinkText: string;
  };

  quickstart: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    prerequisitesTitle: string;
    prerequisiteHeaders: string[];
    prerequisites: { name: string; desc: string; required: boolean }[];
    requiredLabel: string;
    optionalLabel: string;
    installTitle: string;
    installStep1: string;
    installCliCode: string;
    installStep2: string;
    installPluginCode: string;
    installVerifyNote: string;
    steps: { title: string; command: string; desc: string }[];
    statusLineTitle: string;
    statusLineDesc1: string;
    statusLineDesc2: string;
    statusLineExample: string;
    statusLineNote: string;
    conceptsLinkText: string;
    statusLineNoteAfter: string;
    nextTitle: string;
    nextLinks: { href: string; title: string; desc: string }[];
  };

  autonomousEvolution: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    sessionStartTitle: string;
    sessionStartDesc: string;
    injectedItems: { label: string; desc: string }[];
    statusLineTitle: string;
    statusLineDesc: string;
    statusLineExample: string;
    judgmentsTitle: string;
    judgmentsDesc: string;
    judgments: { title: string; desc: string }[];
    autonomousTitle: string;
    autonomousDesc: string;
    commitRuleTitle: string;
    commitRuleDesc: string;
    commitRuleCode: string;
    fitnessTitle: string;
    fitnessDesc: string;
  };

  twoAxesPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    cycleTitle: string;
    cycleDesc: string;
    cycleHeaders: string[];
    cycleRows: [string, string, string][];
    meetTitle: string;
    meetDesc: string;
    meetDiagram: string;
    meetNote: string;
  };


  storagePage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    treeTitle: string;
    tree: string;
    treeDesc: string;
    tierTitle: string;
    tierDesc: string;
    tierHeaders: string[];
    tiers: [string, string][];
    outsideTitle: string;
    outsideDesc: string;
    mapTitle: string;
    mapDesc: string;
    sessionTitle: string;
    sessionDesc: string;
  };

  loopPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    typesTitle: string;
    typeHeaders: string[];
    types: [string, string][];
    openTitle: string;
    openCode: string;
    openDesc: string;
    continueTitle: string;
    continueDesc: string;
    vocabTitle: string;
    vocabDesc: string;
    vocabHeaders: string[];
    vocab: [string, string][];
    closeTitle: string;
    closeCode: string;
    closeDesc: string;
    stayOpenTitle: string;
    stayOpenDesc: string;
    exampleTitle: string;
    exampleDesc: string;
    exampleCode: string;
  };

  planPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    registerTitle: string;
    registerCode: string;
    registerDesc: string;
    registryTitle: string;
    registryDesc: string;
    registryCode: string;
    conventionTitle: string;
    conventionDesc: string;
    conventionRulesTitle: string;
    conventionRules: string[];
    citeTitle: string;
    citeDesc: string;
    citeCode: string;
    lifespanTitle: string;
    lifespanDesc: string;
    lifespanCode: string;
  };

  ideaPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    kindsTitle: string;
    kindHeaders: string[];
    kinds: [string, string][];
    makeTitle: string;
    makeCode: string;
    makeDesc: string;
    exampleTitle: string;
    exampleDesc: string;
    exampleCode: string;
    graduationTitle: string;
    graduationDesc: string;
    doctorTitle: string;
    doctorItems: string[];
    archiveTitle: string;
    archiveDesc: string;
    archiveCode: string;
  };

  carveMilestonePage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    checkTitle: string;
    checkDesc: string;
    sizeTitle: string;
    sizeDesc: string;
    sizeNote: string;
    vocabTitle: string;
    vocabDesc: string;
    vocabHeaders: string[];
    vocab: [string, string][];
    fitnessQuestionsTitle: string;
    fitnessQuestionsDesc: string;
    carveTitle: string;
    carveCode: string;
    carveDesc: string;
    focusTitle: string;
    focusDesc: string;
    retireTitle: string;
    retireDesc: string;
    closeTitle: string;
    closeDesc: string;
    closeSteps: { title: string; desc: string }[];
    exampleTitle: string;
    exampleDesc: string;
    exampleCode: string;
  };

  generationPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    groundsTitle: string;
    groundsHeaders: string[];
    grounds: [string, string][];
    worthTitle: string;
    worthDesc: string;
    worthSmallTitle: string;
    worthSmall: string[];
    openTitle: string;
    openCode: string;
    openDesc: string;
    bindingTitle: string;
    bindingDesc: string;
    bindCode: string;
    bindDesc: string;
    vocabTitle: string;
    vocabDesc: string;
    vocabHeaders: string[];
    vocab: [string, string][];
    commitTitle: string;
    commitItems: string[];
    commitDesc: string;
    closeTitle: string;
    closeCode: string;
    closeDesc: string;
    exampleTitle: string;
    exampleDesc: string;
    exampleCode: string;
  };

  delegationPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    defaultNote: string;
    signalsTitle: string;
    signals: string[];
    briefTitle: string;
    briefDesc: string;
    briefHeaders: string[];
    brief: [string, string][];
    disciplineTitle: string;
    disciplineDesc: string;
    disciplineItems: string[];
    reviewTitle: string;
    reviewDesc: string;
    reviewItems: string[];
    parallelTitle: string;
    parallelDesc: string;
  };

  backlogPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    makeTitle: string;
    makeCode: string;
    makeDesc: string;
    groundsTitle: string;
    groundsCode: string;
    groundsDesc: string;
    consumeTitle: string;
    consumeCode: string;
    consumeDesc: string;
    lifeTitle: string;
    lifeDesc: string;
    overlapTitle: string;
    overlapDesc: string;
    exampleTitle: string;
    exampleDesc: string;
    exampleCode: string;
  };

  closingMilestonePage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    judgeTitle: string;
    judgeDesc: string;
    fitnessTitle: string;
    fitnessDesc: string;
    orderTitle: string;
    orderDesc: string;
    orderSteps: { title: string; desc: string }[];
    cleanupTitle: string;
    cleanupDesc: string;
    cleanupTestNote: string;
    handoffTitle: string;
    handoffDesc: string;
    lessonsTitle: string;
    lessonsDesc: string;
    exampleTitle: string;
    exampleDesc: string;
    exampleCode: string;
  };

  genomePage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    filesTitle: string;
    filesHeaders: string[];
    files: [string, string][];
    injectionTitle: string;
    injectionDesc: string;
    seedTitle: string;
    seedDesc: string;
    seedCode: string;
    fillOrderTitle: string;
    fillOrderDesc: string;
    fillOrderSteps: { title: string; desc: string }[];
    sizeTitle: string;
    sizeDesc: string;
  };

  environmentPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    filesTitle: string;
    filesHeaders: string[];
    files: [string, string][];
    useTitle: string;
    useDesc: string;
    notUseNote: string;
  };

  visionMemoryPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    visionTitle: string;
    visionDesc: string;
    memoryTitle: string;
    memoryDesc: string;
    graduationTitle: string;
    graduationDesc: string;
    handoffVsLessonsTitle: string;
    handoffVsLessonsDesc: string;
    notInjectedNote: string;
  };

  configurationPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    yamlTitle: string;
    yamlCode: string;
    fieldsTitle: string;
    fieldHeaders: string[];
    fields: [string, string][];
    langTitle: string;
    langDesc: string;
    overrideTitle: string;
    overrideDesc: string;
    gitignoreTitle: string;
    gitignoreDesc: string;
  };

  doctorPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    splitTitle: string;
    splitDesc: string;
    noFixDesc: string;
    defectsTitle: string;
    defectHeaders: string[];
    defects: [string, string][];
    notesTitle: string;
    noteHeaders: string[];
    notes: [string, string][];
    guideTitle: string;
    guideDesc: string;
    guideHeaders: string[];
    guides: [string, string][];
    exampleTitle: string;
    exampleDesc: string;
    exampleCode: string;
  };

  comparisonPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    items: { title: string; desc: string }[];
  };

  skills: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    tableHeaders: string[];
    table: [string, string, string][];
    tableNote: string;
    whenLabel: string;
    whatLabel: string;
    notCalledLabel: string;
    skillList: { name: string; when: string; what: string; notCalled: string }[];
  };

  cli: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    usage: string;
    usageNote: string;
    commandHeaders: string[];
    commands: [string, string][];
    indexLinkText: string;
    orchLinkText: string;
  };

  hooks: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    eventsTitle: string;
    eventHeaders: string[];
    events: [string, string][];
    fireTiming: string;
    fileConventionTitle: string;
    fileConventionDesc: string;
    makeHookExample: string;
    typesTitle: string;
    shType: string;
    shTypeDesc: string;
    mdType: string;
    mdTypeDesc: string;
    conditionOrderTitle: string;
    conditionOrderDesc: string;
    failureTitle: string;
    failureDesc: string;
    conditionScriptTitle: string;
    conditionScriptDesc: string;
  };

  codeIndex: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    subcommandsTitle: string;
    subcommandsCode: string;
    commitNote: string;
    whenTitle: string;
    indexWhenTitle: string;
    indexWhenDesc: string;
    grepWhenTitle: string;
    grepWhenDesc: string;
    resolutionTitle: string;
    resolutionDesc: string;
    callResolutionNote: string;
    noInstallTitle: string;
    noInstallDesc: string;
  };

  orchestrate: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    aloneNote: string;
    worktreeTitle: string;
    worktreeCode: string;
    worktreeDesc: string;
    sameDirNote: string;
    submoduleNote: string;
    idTitle: string;
    idDesc: string;
    collabTitle: string;
    collabDesc: string;
    collabLinkText: string;
    kindTitle: string;
    kindHeaders: string[];
    kinds: [string, string][];
    coordinatorNote: string;
  };

  claimBarrierPage: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    sharedStateTitle: string;
    sharedStateDesc: string;
    claimTitle: string;
    claimCode: string;
    claimDesc: string;
    claimExampleTitle: string;
    claimExampleCode: string;
    barrierTitle: string;
    barrierCode: string;
    barrierDesc: string;
    barrierExampleTitle: string;
    barrierExampleCode: string;
    rosterStatusTitle: string;
    rosterStatusCode: string;
    rosterStatusDesc: string;
    backLinkText: string;
  };

  migration: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    updateCode: string;
    handoffDesc: string;
    stepsTitle: string;
    steps: { title: string; desc: string }[];
    preservedTitle: string;
    preservedDesc: string;
    rollbackCode: string;
    recordExampleTitle: string;
    recordExampleDesc: string;
    recordExampleCode: string;
    backlogJudgeTitle: string;
    backlogJudgeDesc: string;
    designLinksTitle: string;
    designLinksDesc: string;
    lostTitle: string;
    lostItems: [string, string][];
  };

  releaseNotes: {
    title: string;
    breadcrumb: string;
    description: string;
    sourceNote: string;
    version: string;
    summary: string;
    changedTitle: string;
    changed: string[];
    removedTitle: string;
    removed: string[];
    comingTitle: string;
    comingDesc: string;
    goodToKnowTitle: string;
    goodToKnow: string[];
  };
}

export const ko: Translations = {
  nav: {
    getStarted: "시작하기",
    groups: {
      gettingStarted: "시작하기",
      coreConcepts: "핵심 개념",
      planAxis: "Plan 축",
      execAxis: "Execution 축",
      knowledge: "지식",
      collaboration: "협업",
      reference: "레퍼런스",
      other: "기타",
    },
    items: {
      introduction: "소개",
      quickStart: "첫 사용",
      autonomousEvolution: "자율 진화 흐름",
      v018change: "v0.18에서 바뀐 것",
      twoAxes: "두 축",
      storage: "저장 구조",
      loop: "Loop",
      planSource: "Plan",
      idea: "Idea와 Research",
      carveMilestone: "Milestone 자르기",
      generation: "Generation",
      delegation: "위임 모드",
      backlog: "Backlog",
      closingMilestone: "Milestone 닫기와 Fitness",
      genome: "Genome",
      environment: "Environment",
      visionMemory: "Vision과 Memory",
      codeIntelligence: "Code Intelligence",
      orchestrate: "orchestrate",
      claimBarrier: "Claim과 Barrier",
      hooks: "hooks",
      skillReference: "skill 10종",
      cliReference: "CLI 레퍼런스",
      configuration: "설정",
      doctor: "Doctor",
      comparison: "비교",
      migration: "v0.17에서 이주",
      releaseNotes: "릴리스 노트",
    },
  },

  hero: {
    tagline: "Recursive Evolutionary Autonomous Pipeline",
    title: "REAP",
    description: "AI와 사람이 협업하여 재귀적인 작업 흐름을 통해 소프트웨어를 진화시키는 규약과 도구입니다. 세션 간 컨텍스트가 유지되고, 구조화된 generation을 통해 코드가 진화하며, loop를 거치며 설계와 기획이 함께 진화합니다.",
    getStarted: "시작하기 →",
    breakingBand: {
      text: "v0.18.0은 이전 버전과 호환되지 않습니다. 저장 구조, 명령, 플러그인이 모두 바뀌었습니다.",
      changeLinkText: "무엇이 바뀌었나 →",
      migrationLinkText: "v0.17에서 이주 →",
    },
    whyReap: "왜 REAP인가?",
    whyReapDesc: "AI 에이전트는 강력하지만, 구조 없이는 개발이 혼란스러워집니다. 매 세션마다 컨텍스트가 초기화됩니다. 기획은 한 번 쓰고 잊힙니다. 코드 변경이 목적 없이 흩어집니다. 설계 문서가 현실에서 벗어납니다. 과거 작업에서 얻은 교훈이 사라집니다.",
    problems: [
      { problem: "컨텍스트 손실", solution: "SessionStart 훅이 세션마다 genome, environment 요약, 상태 줄을 자동으로 주입합니다" },
      { problem: "한 번 쓰고 잊히는 기획", solution: "loop가 plan을 계속 다듬고, 그 계획을 milestone으로 잘라 실행과 이어 줍니다. 기획도 코드처럼 진화합니다" },
      { problem: "산발적 개발", solution: "milestone과 generation이 경계를 가진 작업 단위로 나뉘어 하나의 목표에 집중합니다" },
      { problem: "설계-코드 괴리", solution: "plan과 구현 사이의 간극은 backlog로 기록되고 다음 generation에서 반영됩니다" },
      { problem: "잊혀진 교훈", solution: "lessons.md에 교훈이 쌓이고, 참고 가치가 다한 세대는 archive에 보존됩니다" },
      { problem: "협업 혼란", solution: "orchestrate skill이 claim과 barrier로 여러 세션의 작업을 조율합니다" },
    ],
    structureTitle: "구조",
    structureDesc: "REAP가 하는 일은 .reap/ 아래 여섯 자리에 담깁니다.",
    structureItems: [
      { label: "Knowledge", sub: "genome + environment", desc: "genome은 규범(제품 정체성, AI 행동 규칙, 절대 제약), environment는 서술(기술 스택, 소스 구조)입니다. 모든 작업의 기반입니다." },
      { label: "Plan", sub: "plan + loop", desc: "제품을 만들기 위한 모든 생각입니다. plan 문서는 리포 밖에 있어도 되며, loop가 그것을 다듬습니다." },
      { label: "Vision", sub: "milestone + memory", desc: "하려는 것입니다. loop에서 잘라낸 milestone과 쌓인 교훈이 여기 있습니다." },
      { label: "Life", sub: "generation + backlog", desc: "지금 살아 있는 것입니다. 진행 중이거나 아직 참고할 값이 있는 세대와 이월 항목이 여기 있습니다." },
      { label: "Archive", sub: "닫힌 milestone, generation, loop", desc: "더는 참고하지 않는 것입니다. milestone이 닫힐 때 cleanup skill이 여기로 내립니다." },
      { label: "Civilization", sub: "소스 코드", desc: ".reap/ 밖의 모든 것입니다. generation이 진화시키는 대상입니다." },
    ],
    axesTitle: "두 개의 축",
    axesDesc: "REAP의 작업은 두 축 위에서 진행됩니다. Plan 축에서는 loop가 계획을 다듬고, Execution 축에서는 그 계획을 실행 가능한 단위인 milestone으로 나누어 generation으로 진행합니다. 두 축은 계획을 milestone으로 자르는 지점에서 만납니다.",
    axes: [
      {
        label: "Plan 축",
        sub: "계획을 만들고 개선합니다",
        items: [
          { unit: "loop", what: "새 의도를 만듭니다. 기획, 설계, 화면, 아직 자리가 없는 아이디어를 다루며 여러 세션에 걸쳐 열려 있을 수 있습니다.", where: "life/loops/" },
          { unit: "plan", what: "기획 문서입니다. 리포 안팎 어디에 있든 등록해 두면 loop가 규약에 따라 읽고 씁니다. loop의 산출물이 여기에 쌓입니다.", where: "plan/sources.yml" },
        ],
      },
      {
        label: "Execution 축",
        sub: "계획을 실행합니다",
        items: [
          { unit: "milestone", what: "계획을 실행 가능한 단위로 자릅니다. 경계와 종료 조건을 가지며, 끝날 때 사람의 fitness 평가를 받습니다.", where: "vision/milestones/" },
          { unit: "generation", what: "milestone을 실현하거나(exec) 이미 있는 의도로 되돌립니다(fix). 실제로 코드를 진화시키는 단위입니다.", where: "life/generations/" },
        ],
      },
    ],
    axesJoin: "두 축이 만나는 곳: 계획을 milestone으로 자르는 일 (/reap:carve-milestone)",
    installation: "설치",
    installStep1: "1. CLI를 전역 설치하고 플러그인을 넣습니다",
    installStep2: "2. Claude Code를 열어 초기화하고 첫 세대를 엽니다",
    installNote: "설치 상세는",
    installLinkText: "설치 가이드",
    keyConcepts: "핵심 개념",
    concepts: [
      { label: "Genome 불변성", desc: "genome은 generation 중에 수정되지 않습니다. 변경은 backlog를 거쳐 다음 generation에서 반영됩니다." },
      { label: "Backlog", desc: "지연되거나 발견된 이슈를 기록하는 자리입니다. 다음 generation이 이어받습니다." },
      { label: "Milestone과 fitness", desc: "milestone이 끝날 때 사람이 자연어로 fitness를 평가합니다. 정량 지표는 두지 않습니다." },
      { label: "Loop", desc: "새 의도를 만드는 작업입니다. 기획, 설계, 화면, 아직 자리 없는 아이디어를 다룹니다." },
      { label: "Archive", desc: "완료된 generation과 milestone이 쌓이는 곳입니다. 참고 가치가 다하면 여기로 내려갑니다." },
      { label: "Orchestrate", desc: "두 세션 이상이 동시에 작업할 때 claim과 barrier로 조율합니다." },
    ],
    documentation: "문서",
    docLinks: [
      { href: "/docs/introduction", title: "소개", desc: "REAP란 무엇인가, 왜 사용하는가, 여섯 자리 구조." },
      { href: "/docs/quick-start", title: "첫 사용", desc: "init, evolve, complete 세 skill로 시작합니다." },
      { href: "/docs/autonomous-evolution", title: "자율 진화 흐름", desc: "세션이 열리면 무슨 일이 일어나는가." },
      { href: "/docs/v018change", title: "v0.18에서 바뀐 것", desc: "v0.17 대응표, 사라진 것, 그대로인 것." },
      { href: "/docs/skill-reference", title: "skill 10종", desc: "agent가 REAP를 다루는 통로. 언제, 무엇을, 부르지 않는 경우를 정리합니다." },
      { href: "/docs/cli-reference", title: "CLI 레퍼런스", desc: "reap 명령 전체. make, mark, doctor, index, orch, ctx를 다룹니다." },
      { href: "/docs/hooks", title: "hooks", desc: "여섯 이벤트에 거는 .md, .sh 훅과 조건, 순서." },
      { href: "/docs/code-intelligence", title: "코드 인덱스", desc: "커밋 단위로 갱신되는 코드 인덱스. 15개 언어." },
      { href: "/docs/orchestrate", title: "orchestrate", desc: "두 세션 이상이 동시에 작업할 때 쓰는 claim과 barrier." },
      { href: "/docs/migration", title: "v0.17에서 이주", desc: "8단계로 이주합니다. 원본은 .reap-v0_17/에 그대로 보존됩니다." },
    ],
  },

  intro: {
    title: "소개",
    breadcrumb: "시작하기",
    description: "REAP(Recursive Evolutionary Autonomous Pipeline)는 AI와 사람이 협업하여 재귀적인 작업 흐름을 통해 소프트웨어를 진화시키는 규약과 도구입니다. 흐름을 스크립트가 강제하지 않고, agent가 skill을 읽어 그때그때 판단합니다.",
    whatBuilds: "REAP가 만드는 것은 둘입니다. TypeScript·Bun으로 만든 CLI 바이너리 reap와, skill과 SessionStart 훅을 담은 Claude Code 플러그인입니다. 설치 경로는 npm 하나이고, 플러그인은 reap setup이 대신 설치합니다 — 한쪽만 있는 상태는 세션이 알려 줍니다.",
    whyReapTitle: "왜 REAP인가?",
    problemHeader: "문제",
    solutionHeader: "REAP 솔루션",
    problems: [
      ["컨텍스트 손실 — agent가 매 세션마다 프로젝트 컨텍스트를 잊습니다", "SessionStart 훅이 genome, environment 요약, 상태 줄을 매 세션 자동으로 주입합니다"],
      ["한 번 쓰고 잊히는 기획 — 계획 문서가 코드와 따로 늙어 갑니다", "loop가 plan을 계속 다듬고, milestone으로 잘라 실행과 이어 줍니다. 기획도 코드처럼 진화합니다"],
      ["산발적 개발 — 목표 없이 코드 변경이 흩어집니다", "milestone이 경계와 종료 조건을 가진 실행 단위로 자르고, generation이 그 안에서 하나의 의도에 집중합니다"],
      ["설계-코드 괴리 — 문서가 코드에서 벗어납니다", "구현 중 발견된 간극은 backlog로 기록되고 다음 generation이 반영합니다"],
      ["잊혀진 교훈 — 과거 작업의 인사이트가 사라집니다", "vision/memory/lessons.md에 교훈이 쌓이고, 참고 가치가 다한 세대는 archive에 보존됩니다"],
      ["협업 혼란 — 병렬 작업이 충돌하는 변경으로 이어집니다", "orchestrate skill이 claim과 barrier로 여러 세션의 작업을 조율합니다"],
    ],
    structureTitle: "구조",
    structureDesc: "REAP는 여섯 개의 자리로 구성됩니다:",
    structureItems: [
      { label: "Knowledge", sub: "genome + environment", path: ".reap/genome/ + .reap/environment/", desc: "genome(규범 — 제품 정체성, AI 행동 규칙, 절대 제약)과 environment(서술 — 기술 스택, 소스 구조). 모든 작업의 기반입니다." },
      { label: "Plan", sub: "plan + loop", path: ".reap/plan/ + .reap/life/loops/", desc: "제품을 만들기 위한 모든 생각입니다. plan 문서는 리포 밖에 있어도 되며, loop가 그것을 다듬습니다." },
      { label: "Vision", sub: "milestone + memory", path: ".reap/vision/", desc: "하려는 것입니다. loop에서 잘라낸 milestone과 쌓인 교훈이 여기 있습니다." },
      { label: "Life", sub: "generation + backlog", path: ".reap/life/", desc: "지금 살아 있는 것입니다. 진행 중이거나 아직 참고할 값이 있는 세대와 이월 항목이 여기 있습니다." },
      { label: "Archive", sub: "닫힌 milestone, generation, loop", path: ".reap/archive/", desc: "더는 참고하지 않는 것입니다. milestone이 닫힐 때 cleanup skill이 여기로 내립니다." },
      { label: "Civilization", sub: "소스 코드", path: ".reap/ 밖", desc: "generation이 진화시키는 대상입니다. 교훈이 다시 Knowledge로 피드백됩니다." },
    ],
    projectStructureTitle: "프로젝트 구조",
    projectStructureTree: `my-project/
├── src/                          # Civilization — 당신의 코드
└── .reap/
    ├── config.yml                 # 언어, agentClient, workspace-id
    ├── map.md                     # 이 디렉토리가 무엇을 두는지 (씨앗)
    ├── plan/
    │   ├── sources.yml             # 등록된 plan 문서
    │   └── conventions/            # <ps-id>-<slug>.md — 읽고 쓰는 법
    ├── vision/                    # 하려는 것
    │   ├── memory/
    │   │   └── lessons.md          # 프로젝트 전역 교훈
    │   └── milestones/
    │       └── <ms-id>-<slug>/
    │           ├── milestone.md
    │           ├── handoff.md
    │           └── tasks/
    ├── life/                      # 지금 살아 있는 것
    │   ├── generations/
    │   ├── backlog/
    │   └── loops/
    ├── archive/                   # 더는 참고하지 않는 것
    │   ├── generations/ · milestones/ · backlog/ · loops/ · idea/
    ├── genome/
    │   ├── application.md          # 제품 정체성, 아키텍처
    │   ├── evolution.md            # AI 행동 규칙
    │   └── invariants.md           # 절대 제약 (사람만 수정)
    ├── environment/
    │   ├── summary.md               # 기술 스택, 소스 구조, 빌드, 테스트
    │   └── resources/
    ├── idea/
    │   ├── research/ · freememo/ · files/
    ├── sequence/                  # id 레지스트리
    └── hooks/                     # {event}.{name}.{md|sh}`,
    nextText: "시작하려면",
    quickStartLinkText: "첫 사용으로.",
  },

  v018change: {
    title: "v0.18에서 바뀐 것",
    breadcrumb: "시작하기",
    description: "v0.18에서 무엇이 바뀌었는지 — v0.17 대응표, 사라진 것, 그대로인 것.",
    intro: "REAP는 5단계 lifecycle을 강제하는 파이프라인 실행기에서, agent가 판단을 위해 부르는 규약과 도구의 집합으로 다시 만들어졌습니다. 흐름을 스크립트가 정하지 않고, skill이 상황을 읽어 판단합니다.",
    tableTitle: "v0.17 → v0.18 대응",
    tableHeaders: ["v0.17", "v0.18"],
    table: [
      ["5단계 lifecycle", "evolve·complete 판단"],
      ["/reap.* 19종", "/reap: skill 10종"],
      [".reap/ 단일 상태·lineage", "3단 저장소 vision·life·archive"],
      ["current.yml", "세션 바인딩"],
      ["memory 3단", "lessons·idea"],
      ["goals.md", "plan (등록된 기획 문서)"],
      ["hooks 14이벤트", "6이벤트"],
      ["슬래시 커맨드 설치", "플러그인"],
      ["세션 시작 시 자동 갱신", "없음 — 안내만"],
      ["언어 4종", "en 기본·ko 카탈로그"],
    ],
    goneTitle: "사라진 것",
    goneItems: [
      ["run start/next/back/abort/early-close, /reap.* 흐름 명령 7종", "evolve·complete skill의 판단"],
      ["cruise·cruiseCount", "없음"],
      ["merge/pull/push lifecycle과 /reap.merge 등 3종", "orchestrate skill + git 직접"],
      ["reap-evaluate evaluator agent", "orchestrate의 한 사용 사례"],
      ["status·config·check-version·uninstall", "ctx 상태 줄·doctor·config 직접 편집·플러그인 제거"],
      ["update·이주 안내 레이어·lastMigratedVersion", "migrate skill 1회 + 이후 doctor·init --check"],
      ["fix --check·clean·destroy", "doctor·cleanup skill·rm -rf .reap + 플러그인 제거"],
      ["install-skills·load-context·dump-state, opencode/codex adapter", "플러그인 설치·ctx --hook"],
      ["/reap.knowledge·/reap.sync·/reap.refreshKnowledge", "init skill + genome 직접 편집"],
      ["/reap.help 16주제·reap help 다국어", "README + skill 본문"],
      ["/reap.report·autoIssueReport", "report-issue skill"],
      ["autoSubagent·strictEdit·strictMerge·autoUpdate config", "없음 — 판단을 config로 빼지 않는다"],
      ["index search --kind", "index search <q> (kind 없음, 출력에 이미 있다)"],
    ],
    sameTitle: "그대로인 것",
    sameDesc: "genome 3종(application·evolution·invariants)·environment/·backlog·코드 인덱스·hooks 자리는 이번에도 그대로입니다.",
    migrateNote: "v0.17에서 실제로 옮기려면",
    migrateLinkText: "이주 가이드 →",
  },

  quickstart: {
    title: "첫 사용",
    breadcrumb: "시작하기",
    description: "REAP 설치부터 첫 loop·generation까지 — 사전 준비물, 두 단계 설치, 세 skill로 도는 첫 바퀴.",
    intro: "프로젝트에서 (신규 폴더든 기존 코드베이스든) 세 skill만 있으면 됩니다.",
    prerequisitesTitle: "사전 요구 사항",
    prerequisiteHeaders: ["항목", "설명"],
    prerequisites: [
      { name: "Node.js", desc: "v20 이상", required: true },
      { name: "Claude Code", desc: "AI 에이전트 CLI. skill과 SessionStart 훅을 이 위에서 씁니다", required: true },
      { name: "git", desc: "커밋 규칙과 workspace-id 계산에 씁니다", required: true },
    ],
    requiredLabel: "필수",
    optionalLabel: "선택",
    installTitle: "설치",
    installStep1: "1. CLI를 전역 설치합니다",
    installCliCode: "npm i -g @c-d-cc/reap",
    installStep2: "2. 플러그인을 설치합니다 — CLI가 마켓플레이스 등록과 설치를 대신합니다",
    installPluginCode: `reap setup`,
    installVerifyNote: "설치는 이것이 전부입니다. 새 Claude Code 세션을 열면 / 메뉴에 /reap: skill 7종이 보이고, 세션 시작 시 상태 줄이 뜹니다 — 둘 다 안 보이면 reap setup을 다시 실행하고 그 출력을 읽습니다.",
    steps: [
      {
        title: "처음 한 번",
        command: "/reap:init",
        desc: "정본 지식을 세웁니다 — plan 문서 등록, .reap/environment/summary.md, .reap/genome/. 프로젝트당 딱 한 번입니다. 이 skill만 상태 줄이 안내하지 못합니다 — .reap/가 없으면 SessionStart 훅이 침묵하므로 사람이 직접 불러야 합니다.",
      },
      {
        title: "세대를 엽니다",
        command: "/reap:evolve",
        desc: "새 의도를 만드는 일인지(loop), 만들어둔 의도를 실현하는 일인지(exec generation), 이미 있는 의도로 되돌리는 일인지(fix generation)를 판단하고 엽니다. 그다음은 자율 구간입니다 — 탐색하고 짜고 고칩니다. 순서도 횟수도 REAP가 정하지 않고, 일이 끝나면 agent가 세대를 닫습니다.",
      },
    ],
    statusLineTitle: "상태 줄이 지도입니다",
    statusLineDesc1: "세션이 열릴 때마다 SessionStart 훅이 reap ctx를 불러 맥락을 주입합니다. genome 본문과 environment 요약, 그리고 상태 줄 — 지금 무엇이 열려 있고 무엇을 더 읽어야 하는지 경로로 가리키는 한 뭉치입니다.",
    statusLineDesc2: "아래는 빈 프로젝트에서 reap init 뒤 reap make loop·reap make milestone --focus·reap make generation을 차례로 거친 뒤 실제로 찍은 reap ctx 출력입니다 (genome·environment 본문은 초기 씨앗 그대로입니다 — 채워 넣는 절차는 /reap:init이 합니다):",
    statusLineExample: `<!-- reap 상태 -->
응답 언어: ko
현재 milestone: ms-001 로그인 붙이기 (focus, open)
  .reap/vision/milestones/ms-001-login/
    milestone.md
열린 세대: gen-0001-exec 로그인 폼과 세션 발급 — .reap/life/generations/gen-0001-exec-login-form.md
  2026-09-04T00:09:22Z 시작, 시작 커밋 c5c3264
열린 loop: loop-0001-plan 인증 붙이기 — .reap/life/loops/loop-0001-plan-auth.md
기억: .reap/vision/memory/lessons.md
구조: .reap/map.md
작업을 시작하면 /reap:evolve, 마무리하면 /reap:complete`,
    statusLineNote: "milestone.md도 handoff.md도 본문이 이 안에 실려 있지 않습니다 — 상태 줄은 경로와 이름만 알리고, 그 경로를 열지 말지는 agent가 판단합니다. 세션이 열린 뒤 무슨 일이 일어나는지는",
    conceptsLinkText: "자율 진화 흐름",
    statusLineNoteAfter: "에서 자세히 다룹니다.",
    nextTitle: "다음 단계",
    nextLinks: [
      { href: "/docs/autonomous-evolution", title: "자율 진화 흐름", desc: "세션이 열리면 무슨 일이 일어나는가." },
      { href: "/docs/introduction", title: "소개", desc: "REAP란 무엇인가, 여섯 자리 구조." },
    ],
  },

  autonomousEvolution: {
    title: "자율 진화 흐름",
    breadcrumb: "시작하기",
    description: "세션이 열리면 무슨 일이 일어나는가 — SessionStart 훅의 주입, evolve의 세 판단, 자율 구간, complete의 커밋 규칙, milestone의 fitness.",
    intro: "REAP는 흐름을 제어하지 않습니다. 세션이 열릴 때 무엇이 자동으로 일어나고, 그다음부터 어디까지가 agent의 판단이고 어디부터가 사람의 몫인지를 순서대로 봅니다.",
    sessionStartTitle: "세션이 열릴 때",
    sessionStartDesc: "Claude Code에서 REAP 프로젝트를 열면 SessionStart 훅이 reap ctx를 불러 맥락을 주입합니다. 매 세션 실리는 것은 이 셋뿐입니다.",
    injectedItems: [
      { label: "genome/ 본문", desc: "application.md·evolution.md·invariants.md — 제품 정체성, AI 행동 규칙, 절대 제약." },
      { label: "environment/summary.md 본문", desc: "현재 기술 스택, 소스 구조, 빌드·테스트 방법." },
      { label: "상태 줄", desc: "열린 milestone·generation·loop의 경로와 이름. milestone.md도 handoff.md도 본문은 실리지 않습니다 — 그 경로를 열지 말지는 agent가 그때그때 판단합니다." },
    ],
    statusLineTitle: "실물 예시",
    statusLineDesc: "아래는 빈 프로젝트에서 reap init 뒤 reap make loop·reap make milestone --focus·reap make generation을 차례로 거친 뒤 실제로 찍은 reap ctx의 상태 줄입니다.",
    statusLineExample: `<!-- reap 상태 -->
응답 언어: ko
현재 milestone: ms-001 로그인 붙이기 (focus, open)
  .reap/vision/milestones/ms-001-login/
    milestone.md
열린 세대: gen-0001-exec 로그인 폼과 세션 발급 — .reap/life/generations/gen-0001-exec-login-form.md
  2026-09-04T14:28:50Z 시작, 시작 커밋 a40f09d
열린 loop: loop-0001-plan 인증 붙이기 — .reap/life/loops/loop-0001-plan-auth.md
기억: .reap/vision/memory/lessons.md
구조: .reap/map.md
작업을 시작하면 /reap:evolve, 마무리하면 /reap:complete`,
    judgmentsTitle: "evolve의 세 판단",
    judgmentsDesc: "사람이 무언가를 하자고 하면 /reap:evolve가 열립니다. 이 skill은 세 가지를 차례로 판단합니다.",
    judgments: [
      { title: "세대를 열 값이 있는가", desc: "한 번의 편집과 한 번의 커밋으로 끝나는 일에는 세대를 열지 않습니다. 세대 기록이 필요한 것은 작업이 진행 중인 동안 무엇을 하는 중이었는지를 붙잡아 둘 때뿐입니다." },
      { title: "loop인가, generation인가", desc: "새 의도를 만드는 일이면 loop입니다 — 기획, 설계, 화면, 아직 자리 없는 아이디어. 이미 정해진 의도를 실현하거나(exec) 되돌리는 일이면(fix) generation입니다." },
      { title: "직접 하는가, 위임하는가", desc: "기본은 같은 세션이 직접 합니다. 여러 파일과 긴 탐색으로 주 세션의 컨텍스트를 채울 것 같거나, 사람이 위임을 요청했거나, 병렬로 둘 이상을 굴릴 때는 subagent에게 brief를 주고 맡깁니다." },
    ],
    autonomousTitle: "자율 구간",
    autonomousDesc: "세대가 열리면 그다음은 REAP가 관여하지 않습니다. 탐색하고, 계획하고, 짜고, 고치고, 되돌립니다 — 순서도 횟수도 정해져 있지 않습니다. 지금 안 할 일은 reap make backlog로, 아직 단단하지 않은 것은 reap make idea로 적어 두고, 커밋은 원하는 만큼 나눠서 합니다.",
    commitRuleTitle: "complete의 커밋 규칙",
    commitRuleDesc: "일을 마치면 /reap:complete가 세대를 닫기 전에 커밋 규칙을 확인합니다. REAP의 유일한 규칙이고, 도구가 아니라 agent가 git에게 직접 물어 확인합니다.",
    commitRuleCode: `git status --porcelain        # 비어 있어야 한다
git log <startCommit>..HEAD   # 새 커밋이 하나 이상 있어야 한다`,
    fitnessTitle: "milestone이 끝나면 사람의 fitness",
    fitnessDesc: "generation마다가 아니라 milestone이 끝날 때 사람이 자연어로 fitness를 평가합니다. 정량 지표는 두지 않습니다 — 매 세대 사람이 막아서는 마찰이 자율성과 충돌하기 때문입니다. fitness가 확인되면 cleanup이 참고 가치가 다한 세대를 archive로 내리고, milestone 디렉토리가 닫힙니다.",
  },

  twoAxesPage: {
    title: "두 축",
    breadcrumb: "핵심 개념",
    description: "Plan 축과 Execution 축이 왜 대등하고, 어떻게 다른 리듬으로 돌다가 milestone에서 만나는가.",
    intro: "REAP의 작업은 하나의 파이프라인이 아니라 두 개의 축 위에서 진행됩니다. Plan 축에서는 loop가 계획을 다듬고, Execution 축에서는 milestone으로 잘린 계획을 generation이 실행합니다. 두 축은 대등하고, 서로 다른 리듬으로 돕니다.",
    cycleTitle: "두 축이 도는 방식",
    cycleDesc: "같은 '작업 사이클'이라는 말이 축마다 다른 것을 가리킵니다. loop와 generation을 나란히 놓으면 차이가 분명해집니다.",
    cycleHeaders: ["", "Plan 축 — loop", "Execution 축 — generation"],
    cycleRows: [
      ["세션 바인딩", "바인딩되지 않습니다. 세션이 바뀌어도 이어집니다", "세션에 바인딩됩니다 — reap make generation이 .session에 씁니다"],
      ["동시에 열리는 수", "여럿이 나란히 열릴 수 있습니다", "세션마다 하나입니다"],
      ["보통 걸리는 시간", "여러 세션에 걸치는 것이 정상입니다", "대개 한 세션 안에 닫힙니다"],
      ["닫히는 조건", "산출물이 자리를 찾으면 닫힙니다 — plan source에 쓰거나 milestone을 낳습니다", "커밋이 있고 완료로 판단되면 닫힙니다"],
      ["근거", "선택입니다 — 있으면 --from에 적습니다", "exec는 milestone 또는 backlog 항목이 필수입니다. fix는 근거가 없습니다"],
    ],
    meetTitle: "두 축이 만나는 곳",
    meetDesc: "loop가 plan source에 쓴 계획을 실행 가능한 단위로 자르는 일이 두 축의 접점입니다. 이 지점을 carve-milestone이 맡습니다.",
    meetDiagram: `plan source (등록된 곳, 리포 밖일 수 있다)
      |
      | loop가 쓴다
      v
   loop  ------ carve-milestone ------>  milestone
 (life/loops/)                          (vision/milestones/)
                                              |
                                    +---------+---------+
                                    |                   |
                               exec generation     exec generation
                                    |                   |
                                    +---------+---------+
                                              v
                                        civilization (소스 코드)

                               backlog 항목 -- exec generation --> civilization
                               fix generation (근거 없음) --------> civilization`,
    meetNote: "loop는 exec의 경계 안에 있지 않고, exec generation은 반드시 근거(milestone 또는 backlog 항목)를 갖습니다. fix generation만 예외입니다 — 새 의도를 만들지 않고 이미 있는 의도로 되돌리므로 근거를 요구하지 않습니다.",
  },

  storagePage: {
    title: "저장 구조",
    breadcrumb: "핵심 개념",
    description: "vision·life·archive 3단을 가르는 것은 시간이고, plan·genome·environment·idea는 그 밖에 있습니다.",
    intro: "저장 구조를 나누는 기준은 유형이 아니라 시간입니다. 무엇을 하려는지, 지금 무엇이 살아 있는지, 더는 참고하지 않는 것은 무엇인지 — 이 세 시점이 vision·life·archive를 가릅니다.",
    treeTitle: "구조",
    tree: `.reap/
  config.yml                 언어, agentClient
  map.md                     이 디렉토리를 설명하는 씨앗
  plan/                      plan source 등록부 (3단 밖)
    sources.yml
    conventions/
      ps-4f2a91-reap.md
  vision/                    하려는 것
    memory/
      lessons.md
    milestones/
      ms-022-v018-site/
        milestone.md
        handoff.md
        tasks/
          4-concepts-plan.md
  life/                      지금 살아 있는 것
    generations/
      gen-0097-exec-site-concepts-plan.md
    backlog/
      bk-a4d829-migrate-판정을-스크립트로…
    loops/
      loop-0004-plan-v018-release.md
  archive/                   더는 참고하지 않는 것
    generations/
      gen-0092-exec-final-recheck.md
    milestones/
      ms-021-v018-i18n/
    backlog/
      bk-c3321b-frontmatter-시간-형식.md
    loops/
  genome/
    application.md
    evolution.md
    invariants.md
  environment/
    summary.md
  idea/
    research/
      idea-c43368-loop-실사용-fitness.md
    files/
      idea-dc2e56-제품-기획-방법론.md
  sequence/
    generation.md
    loop.md
    milestone.md
    source.md
  .session                   현재 세션 바인딩 (gitignored)
  .index/                    코드 인덱스 (gitignored)`,
    treeDesc: "이 문서를 쓰고 있는 세대(gen-0097-exec-site-concepts-plan)가 열려 있는 시점에 이 리포의 .reap/를 그대로 옮긴 것입니다. milestone은 ms-022 하나가 진행 중이고, 지난 세대와 닫힌 milestone은 archive에 쌓여 있습니다.",
    tierTitle: "최상위를 가르는 것은 유형이 아니라 시간입니다",
    tierDesc: "세 단계입니다.",
    tierHeaders: ["단계", "뜻"],
    tiers: [
      ["vision/", "하려는 것 — 쌓인 교훈(memory/)과 잘라낸 실행 단위(milestones/)"],
      ["life/", "지금 살아 있는 것 — 아직 참고할 값이 있는 generation·backlog·loop. 닫힌 것도 참고 가치가 남아 있으면 여기 있습니다"],
      ["archive/", "더는 참고하지 않는 것 — milestone이 닫힐 때 cleanup이 골라 여기로 내립니다"],
    ],
    outsideTitle: "3단 밖에 있는 것들",
    outsideDesc: "plan/·genome/·environment/·idea/는 vision·life·archive 어디에도 속하지 않고 최상위에 나란히 섭니다. plan source는 리포 밖을 가리키는 등록부라 '하려는 것 / 사는 것 / 끝난 것'이라는 시간축에 얹히지 않습니다 — 등록된 소스는 그냥 거기 있습니다. genome은 규범, environment는 서술, idea는 아직 단단하지 않은 지식이라 같은 이유로 시간축 밖입니다. loop만은 예외로 life/loops/에 있습니다 — loop는 열리고 닫히고 archive로 가므로 시간축에 얹히기 때문입니다.",
    mapTitle: "map.md — 구조가 스스로를 설명합니다",
    mapDesc: "각 디렉토리가 무엇을 담는지 map.md가 안내합니다. init이 없을 때만 놓는 씨앗이라 프로젝트가 자기 사정을 덧붙일 수 있고, REAP가 레이아웃을 바꿔도 저절로 갱신되지 않습니다. 매 세션 주입되지 않습니다 — 상태 줄이 경로만 알리고, 필요한 agent가 엽니다.",
    sessionTitle: ".session과 .index — gitignore됩니다",
    sessionDesc: ".session은 현재 세션에 바인딩된 generation id와 milestone id를 담습니다. worktree마다 별개 사본이므로 커밋하면 세션마다 값이 어긋납니다. .index/는 코드 인덱스입니다 — 크기 때문이 아니라, 커밋하면 그 커밋 자체를 다시 인덱싱해야 해서 gitignore됩니다. 둘 다 지워도 안전하고, 다음 동작이 다시 만듭니다.",
  },

  loopPage: {
    title: "Loop",
    breadcrumb: "Plan 축",
    description: "새 의도를 만드는 plan 축의 사이클 — 유형 넷, 여는 법, 잇는 법, 닫는 법.",
    intro: "새 의도를 만드는 일은 generation이 아니라 loop입니다. 기획, 설계, 화면과 흐름, 아직 자리가 없는 아이디어 — 이 넷을 loop가 다루고, generation과는 다른 사이클로 돕니다.",
    typesTitle: "유형 넷",
    typeHeaders: ["유형", "산출물이 찾는 자리"],
    types: [
      ["plan", "plan source의 기획 문서, 그리고 거기서 잘린 milestone"],
      ["design", "plan source의 설계 문서, milestone"],
      ["uiux", "화면·흐름 문서, milestone"],
      ["idea", "idea/research/, 또는 다른 유형의 loop로 졸업"],
    ],
    openTitle: "엽니다",
    openCode: `reap make loop --type plan|design|uiux|idea --title "<제목>" [--from <id>] [--ref <ps-id>:<경로>]`,
    openDesc: "유형은 산출물이 어디로 갈지로 정합니다. --from은 출처(계획 부족으로 막힌 generation, 앞선 loop, plan source 문서)이고 있으면 적고 없어도 됩니다 — 근거가 아니라 출처라 CLI가 검사하지 않습니다. 본문은 비어서 시작하고, 가장 먼저 Question을 적습니다 — 이 loop가 무엇을 정하려는 것인지가, 여러 세션에 걸치는 동안 기록을 쓸모 있게 만드는 유일한 것입니다.",
    continueTitle: "먼저 열린 loop를 봅니다",
    continueDesc: "상태 줄이 열린 loop를 한 줄씩 나열합니다. 같은 물음을 다루는 loop가 이미 열려 있으면 새로 열지 않고 거기서 잇습니다 — 새로 열면 논의가 두 기록으로 갈라집니다. 닫힌 loop도 읽을 값이 있습니다 — 지금 물음을 앞선 loop가 이미 다뤘을 수 있고, Dead Ends가 그것을 말해줍니다.",
    vocabTitle: "기록에 적는 것",
    vocabDesc: "어휘이지 템플릿이 아닙니다. 쓸 것만 쓰고, 순서도 정해져 있지 않습니다.",
    vocabHeaders: ["항목", "무엇을 담나"],
    vocab: [
      ["Question", "무엇을 정하려는 것인가"],
      ["Dialogue", "사람과 갈린 지점 — 무엇이 갈렸고 선택지가 무엇이었고 사람이 무엇을 골랐는가. 전사가 아니라 갈린 지점입니다"],
      ["Explored", "무엇을 살펴봤는가, 전제를 실제 흔적에 대본 결과"],
      ["Dead Ends", "시도했다 접은 접근과 그 이유"],
      ["Outcome", "plan source에 쓴 것, 낳은 milestone, idea로 보낸 것"],
      ["Open Questions", "결론 없이 남긴 것과 그것이 어디로 갔는가"],
    ],
    closeTitle: "닫습니다 — 산출물이 자리를 찾으면",
    closeCode: `reap mark loop <loop-id> --closed [--milestone <ms-id>]...`,
    closeDesc: "plan·design·uiux는 plan source에 쓰고, 실행할 것이 있으면 milestone까지 잘라야 닫힙니다. idea는 idea/research/에 남기거나 다른 유형의 loop로 졸업하면 닫힙니다. 이 loop가 낳은 milestone의 id를 --milestone에 적습니다 — milestone 쪽 from도 이 loop를 가리켜야 하고, carve-milestone이 --from <loop-id>로 씁니다.",
    stayOpenTitle: "열린 채 두는 것이 정상입니다",
    stayOpenDesc: "아직 자리를 못 찾았으면 다음 세션이 Question과 Dialogue를 읽고 잇습니다. 방향 자체가 죽었을 때만 --aborted로 지우고, 접은 이유는 idea/research/로 보냅니다 — 지워진 기록은 아무도 못 읽습니다. loop는 세션에 바인딩되지 않고 여럿이 나란히 열립니다. 닫힌 loop는 life/loops/에 남고, 방금 닫힌 것이 가장 자주 읽힙니다 — 그 milestone을 실행하는 세대가 Dialogue와 Dead Ends를 봅니다. 닫힌 것이 10개를 넘으면 오래된 것부터 archive/loops/로 내려가고, 이것은 판단이 아니라 개수라 mark loop --closed가 닫는 김에 합니다.",
    exampleTitle: "실물",
    exampleDesc: "인증을 붙이자는 loop를 열고, 로그인 붙이기 milestone을 잘라 닫은 예입니다.",
    exampleCode: `$ reap make loop --type plan --title "인증 붙이기"
loop loop-0001-plan
  .reap/life/loops/loop-0001-plan-auth.md

(carve-milestone으로 ms-001을 자른 뒤)

$ reap mark loop loop-0001-plan --closed --milestone ms-001
닫았습니다: loop-0001-plan
  .reap/life/loops/loop-0001-plan-auth.md`,
  },

  planPage: {
    title: "Plan",
    breadcrumb: "Plan 축",
    description: "리포 밖일 수 있는 기획 문서를 등록하고, 규약으로 읽고 쓰는 법을 기억합니다.",
    intro: "제품을 만들기 위한 모든 생각 — 기획, 계획, 설계, 아이디어 — 을 REAP는 소스코드에 준하는 1급 artifact로 다룹니다. plan 문서를 .reap/ 안에 두라고 강제하지 않습니다. 리포 밖일 수도, 여러 곳일 수도 있습니다. 대신 각 plan을 어떻게 읽고 어떻게 쓰는지에 대한 규약을 기억합니다.",
    registerTitle: "등록합니다",
    registerCode: `reap make plan-source --root <path> --role "<역할>" [--slug <s>]`,
    registerDesc: "--root는 그 plan이 사는 디렉토리입니다. 리포 안이든 밖이든, git이든 아니든 상관없습니다. --slug를 주지 않으면 --root의 디렉토리 이름에서 만듭니다. 등록하면 id가 발급되고, sources.yml에 행이 붙고, 그 소스를 읽고 쓰는 법을 적을 빈 규약 파일이 놓입니다.",
    registryTitle: "등록부 — sources.yml",
    registryDesc: "이 리포 자신도 plan source 셋을 등록해 두고 있습니다. 제품이 무엇이어야 하는가를 적은 설계 문서 하나와, 시기별 작전 계획 둘입니다.",
    registryCode: `sources:
  - id: ps-4f2a91
    root: ./docs/superpowers/specs/reap
    role: 설계 — REAP가 무엇이고 무엇이 참이어야 하는가
    convention: conventions/ps-4f2a91-reap.md
  - id: ps-4b485d
    root: ./docs/reap-plan/reap_v_0_18_migration
    role: reap v0.18 귀환 작전 계획
    convention: conventions/ps-4b485d-reap-v018-migration.md
  - id: ps-5e948f
    root: ./docs/reap-plan/reap_v_0_18_release
    role: reap v0.18 완성·출시 계획
    convention: conventions/ps-5e948f-reap-v018-release.md`,
    conventionTitle: "규약 — 어떻게 읽고 쓰는가",
    conventionDesc: "conventions/<ps-id>-<slug>.md 한 파일에 그 소스를 읽는 법과 쓰는 법을 적습니다. loop가 이 소스에 쓸 때마다 먼저 규약을 읽고, 필요하면 규약 자체를 갱신합니다 — 다음 loop가 같은 판단을 다시 하지 않도록.",
    conventionRulesTitle: "loop가 쓸 때 내리는 판단",
    conventionRules: [
      "어느 소스에 쓸 것인가 — 여러 plan source가 등록돼 있으면 이 내용이 어디에 속하는지 먼저 정합니다",
      "쓰기 전에 규약(conventions/)을 먼저 읽습니다",
      "새 문서를 쓸지, 있는 문서를 고칠지 정합니다",
      "쓰고 나면 규약 자체를 갱신합니다 — 다음에 읽는 쪽이 최신 상태를 봅니다",
      "아직 정해지지 않은 것을 확정처럼 쓰지 않습니다",
      "그 소스가 git이면 커밋 규칙이 적용되고, 아니면 적용되지 않는다고 명시합니다",
    ],
    citeTitle: "인용합니다",
    citeDesc: "milestone과 loop의 --ref가 <ps-id>:<경로> 형식으로 plan source의 특정 문서를 가리킵니다. make가 그 경로가 root 안에 실재하는지 확인하고, doctor가 나중에 다시 확인합니다 — 시점이 다르므로 중복이 아닙니다. 이 milestone(ms-022) 자체가 실례입니다.",
    citeCode: `refs:
  - ps-5e948f:07-i18n-docs-delegate.md`,
    lifespanTitle: "소비 완료를 표시합니다",
    lifespanDesc: "작전 계획처럼 끝이 있는 plan source는 규약 파일의 수명(Lifespan) 절에 소비 완료를 적습니다. 다음 loop가 이 절을 읽고, 여기 더 쓸지 새 소스를 세울지 판단합니다.",
    lifespanCode: `## 수명

v0.18 브랜치가 서고 M1~M3가 끝나면 이 세트는 소비 완료다 — 살아남을 규범은
v0.18 브랜치의 spec·genome으로 옮기고, 여기는 기록으로 남는다.

소비 완료 (2026-08-31, ms-013~015 닫힘). 살아남은 규범은 v0.18 브랜치의
spec·genome·migrate skill로 옮겨졌다. 후속은 ps-5e948f가 잇는다.`,
  },

  ideaPage: {
    title: "Idea와 Research",
    breadcrumb: "Plan 축",
    description: "아직 단단하지 않은 지식을 두는 자리 — research·freememo·files.",
    intro: "결론이 안 난 조사, 형식 없는 메모, 나중에 참고할 외부 자료 — genome에 넣기엔 이르고 그렇다고 흘려보내기엔 아까운 것들이 idea/에 있습니다. 셋은 담는 것이 다릅니다.",
    kindsTitle: "셋",
    kindHeaders: ["종류", "담는 것"],
    kinds: [
      ["research", "조사 결과. 아직 결론이 나지 않은 것"],
      ["freememo", "형식 없는 자유 메모"],
      ["files", "외부 참고자료"],
    ],
    makeTitle: "만듭니다",
    makeCode: `reap make idea --kind research|freememo|file --title "<제목>" [--slug <s>]`,
    makeDesc: "research·files는 졸업 조건을 적는 문서로 시작합니다 — 무엇이 정해지면 이 idea가 결론을 얻는지, 무엇을 확인하면 신뢰할 수 있는지.",
    exampleTitle: "실물",
    exampleDesc: "세션 만료 정책을 조사만 해 두고 아직 결론을 내지 않은 예입니다.",
    exampleCode: `$ reap make idea --kind research --title "세션 만료 정책 조사"
idea idea-67a149
  .reap/idea/research/idea-67a149-세션-만료-정책-조사.md

---
id: idea-67a149
slug: 세션-만료-정책-조사
kind: research
title: 세션 만료 정책 조사
createdAt: 2026-09-04T15:18:55Z
status: open
---

## What's Undecided

## Graduation Criteria

## Sources

- (primary/secondary · date verified)`,
    graduationTitle: "졸업 조건",
    graduationDesc: "research와 files 문서는 언제 결론이 난 것으로 볼지를 미리 적습니다. 적어 두지 않으면 다음에 열어봐도 아직 결론이 안 났는지 판단할 수 없고, 그 문서는 계속 열린 채로 남습니다. 결론이 나면 loop의 Dialogue나 plan source, genome 등 그것이 실제로 규율할 자리로 옮기고 idea 문서는 역할을 마칩니다.",
    doctorTitle: "doctor가 idea에서 보는 것",
    doctorItems: [
      "졸업 조건이 비어 있는 research·files 문서",
      "출처나 확인 날짜가 없는 문서",
      "오래 방치된 항목 — 결론도 안 나고 손도 안 댄 것",
    ],
    archiveTitle: "정리합니다",
    archiveDesc: "결론이 나서 다른 자리로 옮겨졌거나 더는 참고할 값이 없으면 archive로 내립니다.",
    archiveCode: `reap mark idea <idea-id> --archived   # archive/idea/<kind>/로 이동`,
  },

  carveMilestonePage: {
    title: "Milestone 자르기",
    breadcrumb: "Plan 축",
    description: "plan을 실행 가능한 단위로 자르는 절차 — 크기, 어휘, focus, 닫는 순서.",
    intro: "loop 안에서, 이미 정해진 계획을 실행 가능한 단위로 자를 때 부릅니다. 무엇을 만들지 아직 정해지지 않았다면 자르는 게 아니라 정하는 것이고, 그건 loop와 interview의 몫입니다. backlog 항목 하나로 충분한 일이면 milestone을 만들지 않습니다 — 경계가 이미 항목에 있는데 milestone을 또 만들면 경계가 두 곳에 적히고, 두 곳에 있으면 어긋납니다.",
    checkTitle: "먼저 전제를 실제 흔적에 대봅니다",
    checkDesc: "plan에 적힌 것은 시도해 보기 전의 상상이고, 실제로 해 본 것이 그것을 이깁니다. 자르기 전에 plan이 전제한 것이 지금도 참인지 확인합니다 — 파일 크기를 재보거나, 얼마나 쓰이는지 세보거나, 관련 문서끼리 맞는지 grep 한 번이면 대개 충분합니다. 건너뛰면 아무도 안 쓰는 것을 위한 도구를 만들게 됩니다. 전제가 틀렸으면 자르기를 멈추고 그 칸을 다시 채웁니다.",
    sizeTitle: "크기 — task 넷 안팎, 세대 여섯에서 열",
    sizeDesc: "실측한 milestone 셋의 끝에 사람이 같은 답을 냈습니다 — 이 정도 크기를 유지하라고. 세대 수는 열·아홉·여섯이었고, task는 넷에서 다섯이었습니다. 숫자는 규칙이 아니라 기준선입니다 — 규칙 하나만 바꾼 milestone은 세대 셋으로 끝났고 그것도 맞았습니다. 그래도 크게 벗어나면 신호로 읽습니다 — task 여덟 개는 둘로 나뉠 수 있던 것이 하나로 묶였다는 뜻입니다.",
    sizeNote: "아래 경계는 규칙입니다. 한 세대로 끝나는 일은 milestone이 아닙니다 — backlog 항목 하나로 충분하고, 자르기 전에 '이게 세대 몇 개짜리인가'를 먼저 답합니다. 답이 하나면 reap make backlog로 항목을 만들고 --backlog 근거로 엽니다.",
    vocabTitle: "무엇을 씁니다",
    vocabDesc: "어휘이지 템플릿이 아닙니다. 실제로 값이 있었던 것들입니다.",
    vocabHeaders: ["항목", "무엇을 담나"],
    vocab: [
      ["Exit Criteria", "무엇이 되면 끝나는가. 사람이 판정할 수 있는 상태로 씁니다 — 정량 지표를 만들어내지 않습니다"],
      ["Out of Scope", "이번에 하지 않기로 한 것. 경계는 안쪽만으로 정의되지 않습니다 — 왜 인접한 것을 안 하는지를 특히 적습니다"],
      ["Background", "왜 지금 필요한가, plan의 어느 대목에서 나왔는가. 전제를 확인한 결과가 plan과 달랐다면 무엇이 바뀌었는지"],
      ["Plan Items", "한 줄씩. 상세는 tasks/로 보냅니다. 순서에 이유가 있으면 그 이유를 적습니다"],
      ["Constraints", "이 milestone에만 걸리는 제약. 프로젝트 전역 규칙은 genome/에 있고 옮겨 적지 않습니다"],
      ["Open Questions", "자르는 시점에 정하지 못한 것. 어느 task가 답할지도 적습니다"],
    ],
    fitnessQuestionsTitle: "닫힐 때 물을 것을 미리 씁니다",
    fitnessQuestionsDesc: "끝난 뒤에 쓰면 후회만 물어보게 됩니다. 자르는 시점에 'What to ask when this milestone closes' 절에 서너 개를 적어 두면 무엇을 검증할지 먼저 정해지고, milestone의 목적이 한 번 더 확인됩니다. '잘 됐나'가 아니라 '이번에 달라진 무엇이 실제로 나아졌는가'를 묻는 질문이어야 합니다.",
    carveTitle: "자릅니다",
    carveCode: `reap make milestone --title "<제목>" [--from <loop-id>] [--ref <ps-id>:<경로>] [--focus]`,
    carveDesc: "--from은 이 milestone을 낳은 loop, --ref는 근거가 된 plan 문서입니다. 둘 다 검사하지 않습니다 — 사람이 읽는 메모라 정확히 적는 것이 이쪽의 몫입니다. 자른 뒤 milestone.md 본문과 tasks/<n>-<slug>.md를 씁니다 — 인터페이스·함정·완료 판정을 미리 적어 두면 그 task를 실행하는 세대가 다시 탐색하지 않아도 됩니다.",
    focusTitle: "focus는 지금 시작할 것에만 줍니다",
    focusDesc: "--focus가 없으면 방금 자른 milestone이 상태 줄에 나타나지 않고, 다음 세션이 그것이 있는지도 모릅니다. 자동으로 붙이지 않는 이유는 여러 개를 한 번에 자르면 마지막 것이 focus를 가로채기 때문입니다 — 실제로 넷을 한 번에 자른 적이 있고, 그다음 필요했던 것은 첫 번째였습니다. 여럿을 잘랐다면 지금 시작할 것 하나에만 줍니다.",
    retireTitle: "plan에서 내립니다",
    retireDesc: "자른 내용을 로드맵에 그대로 남겨두면 같은 것이 두 곳에 있게 됩니다. 잘라낸 칸을 지우고, 내용이 plan과 달라졌다면 왜 달라졌는지를 plan의 서두에 남깁니다 — 다음에 그 plan을 읽는 사람이 필요로 하는 것입니다.",
    closeTitle: "닫습니다",
    closeDesc: "스스로 닫지 않습니다. 종료 조건이 충족된 것 같으면 사람에게 알리고, 자르는 시점에 적어 둔 질문으로 fitness를 묻습니다. 정량 지표가 없으므로 사람의 자연어 평가가 유일한 fitness 신호입니다. 순서가 고정돼 있습니다.",
    closeSteps: [
      { title: "1. fitness를 받아 milestone.md에 적습니다", desc: "답만이 아니라 어떻게 읽었는지도 적습니다 — 유보된 답('아직 모른다')은 idea/research/로 보내 다음 milestone이 다시 묻게 합니다" },
      { title: "2. cleanup을 부릅니다", desc: "mark milestone --closed는 milestone 디렉토리를 통째로 옮기므로, 순서가 바뀌면 cleanup이 남긴 기록을 다음 세션이 못 찾습니다" },
      { title: "3. reap mark milestone <ms-id> --closed", desc: "archive/milestones/로 옮겨지고 milestone.md·handoff.md·tasks/가 함께 보존됩니다. 세대는 따라가지 않습니다 — cleanup이 참고 가치를 보고 이미 따로 내린 뒤입니다" },
    ],
    exampleTitle: "실물",
    exampleDesc: "로그인 붙이기 milestone을 자르고, 한 세대로 실현한 뒤 닫은 예입니다.",
    exampleCode: `$ reap make milestone --title "로그인 붙이기" --from loop-0001-plan --focus
milestone ms-001
  .reap/vision/milestones/ms-001-login/milestone.md

(gen-0001-exec가 로그인 폼과 세션 발급을 마치고 커밋한 뒤)

$ reap mark generation gen-0001-exec --closed
닫았습니다: gen-0001-exec

$ reap mark loop loop-0001-plan --closed --milestone ms-001
닫았습니다: loop-0001-plan

$ reap mark milestone ms-001 --closed
닫고 옮겼습니다: ms-001
  .reap/archive/milestones/ms-001-login/milestone.md`,
  },

  generationPage: {
    title: "Generation",
    breadcrumb: "Execution 축",
    description: "exec와 fix 두 유형, 근거, 세션 바인딩, 커밋 규칙까지 세대 기록의 전부입니다.",
    intro: "milestone이나 backlog를 근거로 실제 코드를 진화시키는 단위가 generation입니다. evolve가 축을 정하고 나면 이 세대는 exec 아니면 fix입니다 — 새 의도를 만드는 일은 generation이 아니라 loop입니다.",
    groundsTitle: "두 유형과 근거",
    groundsHeaders: ["유형", "근거"],
    grounds: [
      ["exec", "milestone 또는 backlog 항목 중 최소 하나가 있어야 열립니다. 둘 다 줄 수도 있습니다 — milestone이 갈래를 주고 backlog 항목이 그 갈래 안의 구체적 일을 줍니다"],
      ["fix", "근거가 없습니다. 대신 되돌아갈 곳이 있어야 합니다 — 이미 있던 의도로 되돌리는 일이라 그 의도 자체가 경계입니다. 되돌릴 곳을 가리킬 수 없으면 그건 fix가 아니라 exec입니다"],
    ],
    worthTitle: "세대를 열 값이 있는가",
    worthDesc: "한 번의 편집과 한 번의 커밋으로 끝나는 일은 generation이 아닙니다. 기록이 하는 일은 도는 동안 '무엇을 하려던 중이었나'를 붙잡아 두는 것이고, 한 번에 끝나는 일에는 그 '도는 동안'이 없습니다. 값 없이 열면 기록 파일과 레지스트리 행, 닫는 커밋만 남습니다.",
    worthSmallTitle: "작아도 여는 셋",
    worthSmall: [
      "backlog 항목을 소비할 때 — consumedBy가 세대를 가리켜야 하므로 구조가 요구합니다",
      "접은 접근이 있을 때 — 커밋은 한 것만 담고 안 한 것은 안 담습니다. Dead Ends는 기록에만 남습니다",
      "다른 세션이 함께 돌 때 — 상태 줄의 열린 세대 표시가 진행 중임을 알리는 유일한 수단입니다",
    ],
    openTitle: "엽니다",
    openCode: `reap make generation --milestone <ms-id> --title "<제목>" [--slug <s>]
reap make generation --backlog <bk-id> --title "<제목>" [--slug <s>]   (--milestone과 겸용 가능)
reap make generation --fix  --title "<제목>" [--slug <s>]`,
    openDesc: "유형도 근거도 없으면 거부됩니다. --plan은 없습니다 — 새 의도는 make loop의 것입니다. 이미 consumed인 backlog 항목은 근거가 되지 못합니다.",
    bindingTitle: ".session — 하나뿐인 바인딩",
    bindingDesc: "make generation은 아이디 발급과 함께 .reap/.session에 이 세션을 묶습니다. 파일 하나라 세션 하나만 담기고, 나중 세션이 부르면 앞의 바인딩을 덮습니다 — 같은 디렉토리에서 세션 둘을 나란히 못 여는 이유입니다. abort 뒤나 다른 디렉토리에서 세션을 열었을 때처럼 바인딩을 잃으면 doctor가 '열린 채 바인딩 안 된 generation'으로 보고합니다.",
    bindCode: "reap bind <gen-id>",
    bindDesc: "내 세대인데 바인딩만 없어졌을 때 다시 묶습니다. 남의 것이거나 버려진 것이면 --aborted로 지웁니다.",
    vocabTitle: "기록 어휘",
    vocabDesc: "CLI는 본문에 아무것도 깔지 않습니다. 대신 REAP는 적을 만한 항목과 그 뜻을 어휘로 둡니다 — 쓸 것만 쓰고 순서도 자유입니다.",
    vocabHeaders: ["항목", "무엇을 담나"],
    vocab: [
      ["Intent", "왜 이 세대를 여는가, 무엇이 되면 끝인가"],
      ["Working Plan", "지금 시점의 접근. 바뀌면 덮어씁니다"],
      ["References", "근거로 삼은 것 — plan 인용, 코드 위치, 외부 문서"],
      ["Open Questions", "아직 정하지 못한 것, 사람에게 물어야 할 것"],
      ["Dead Ends", "시도했다 접은 접근과 그 이유. 다음 세션이 같은 길을 다시 걷지 않게 합니다"],
      ["Outcome", "무엇을 했고 무엇이 남았는가"],
    ],
    commitTitle: "커밋 규칙",
    commitItems: [
      "git status --porcelain이 비어 있어야 합니다",
      "startCommit 이후 새 커밋이 하나 이상 있어야 합니다",
    ],
    commitDesc: "게이트가 아닙니다 — mark는 검사하지 않고 complete skill이 확인합니다. 어긋난 기록은 doctor가 사후에 잡습니다.",
    closeTitle: "닫습니다",
    closeCode: "reap mark generation <gen-id> --closed | --aborted | --archived",
    closeDesc: "--closed는 closedAt과 현재 HEAD를 endCommit에 찍습니다. --aborted는 기록을 지웁니다. --archived는 archive/generations/로 옮길 뿐 status는 건드리지 않습니다 — 그 판단은 cleanup의 몫입니다.",
    exampleTitle: "실물",
    exampleDesc: "backlog 항목 하나를 근거로 세대를 열고 실현한 뒤 닫은 예입니다.",
    exampleCode: `$ reap make generation --backlog bk-1eb33a --title "로그인 폼 에러 메시지 다국어화"
generation gen-0003-exec
  .reap/life/generations/gen-0003-exec-로그인-폼-에러-메시지-다국어화.md

(에러 메시지를 한국어로 바꾸고 커밋한 뒤)

$ reap mark backlog bk-1eb33a --consumed --by gen-0003-exec
소비 표시했습니다: bk-1eb33a

$ reap mark generation gen-0003-exec --closed
닫았습니다: gen-0003-exec`,
  },

  delegationPage: {
    title: "위임 모드",
    breadcrumb: "Execution 축",
    description: "세대를 직접 할지 subagent에 맡길지 판단하는 절차와 brief 구성.",
    intro: "generation을 열기로 정한 뒤, 세대를 시작하기 전 마지막으로 정하는 것이 실행 형태입니다. 기본은 직접입니다 — 지금 세션이 그대로 일합니다.",
    defaultNote: "위임은 관여를 그만두는 것이 아니라 실행 형태를 고르는 것입니다. 무엇을 할지, 언제 끝인지를 정하는 판단은 evolve와 complete가 그대로 갖습니다.",
    signalsTitle: "위임으로 기우는 신호 셋",
    signals: [
      "이 세대가 여러 파일과 긴 탐색을 요구해 주 세션의 맥락을 채울 것 같을 때",
      "사람이 위임을 요청했을 때",
      "둘 이상을 병렬로 굴릴 때 — 이때는 orchestrate의 worktree 분리를 따르고, 아이디는 주 트리가 발급합니다",
    ],
    briefTitle: "brief — 다섯 줄짜리 절차",
    briefDesc: "위임하기로 정하면 세대 기록에 Intent를 먼저 적고, evolve가 갖는 brief 템플릿을 채워 subagent에게 건넵니다. 템플릿이 요구하는 항목은 이렇습니다.",
    briefHeaders: ["항목", "무엇을 담나"],
    brief: [
      ["Read", "읽을 파일을 순서대로 — genome, milestone.md, 이번 task, 이 세대의 Intent, 그 밖에 필요한 것"],
      ["Scope", "세대 기록에 적힌 Intent 그대로. subagent가 순서나 쪼갬은 자유롭게 바꿀 수 있습니다"],
      ["Working tree", "절대경로 하나. 그 밖은 손대지 않습니다"],
      ["Discipline", "아래 규율 목록 그대로"],
      ["When done", "기록에 Outcome을 남기고, 닫지 않고, git status --porcelain이 비어야 합니다"],
      ["Report", "커밋 해시 목록, 테스트 결과, Intent에서 남은 것"],
    ],
    disciplineTitle: "subagent가 지키는 것",
    disciplineDesc: "brief의 Discipline 절이 요구하는 것들입니다.",
    disciplineItems: [
      "절대경로만 씁니다. 작업 트리 밖은 손대지 않습니다",
      "make도 mark도 부르지 않습니다 — 아이디 발급과 세션 바인딩은 주 세션의 것입니다",
      ".reap/ 안에서는 이 세대의 기록 파일과 (milestone에 속하면) handoff.md만 건드립니다",
      "테스트를 먼저 씁니다 — 구현 전에 실패하는 테스트",
      "검증 명령을 파이프로 감싸지 않고 종료 코드를 그대로 봅니다",
      "소스를 바꾸면 다시 빌드합니다. 되돌렸을 때도 마찬가지입니다",
      "커밋을 의미 단위로 나누고 메시지는 한국어로 씁니다",
      "push·rebase·commit --amend는 하지 않습니다",
    ],
    reviewTitle: "주 세션의 검토",
    reviewDesc: "subagent가 끝내면 주 세션이 검토합니다. 위임이 관여를 그만두는 것이 아닌 이유가 이 절차에 있습니다.",
    reviewItems: [
      "git diff <startCommit>..HEAD --stat로 실제로 뭐가 바뀌었는지 직접 봅니다",
      "테스트를 주 세션이 직접 돌립니다 — subagent의 보고를 그대로 믿지 않습니다",
      "기록에 남긴 Outcome과 Dead Ends를 읽습니다",
      "규율이 깨진 흔적을 찾습니다 — subagent가 발급한 레지스트리 행, .session이 넘어간 흔적, 이미 closed로 닫힌 기록. 흔적이 있으면 subagent 탓이 아니라 brief의 구멍입니다",
    ],
    parallelTitle: "병렬이면",
    parallelDesc: "둘 이상을 동시에 굴릴 때는 이 판단만으로 끝나지 않습니다 — worktree를 가르고, 아이디를 누가 발급하는지, claim과 barrier를 어디 두는지가 필요합니다. orchestrate가 갖는 것들입니다.",
  },

  backlogPage: {
    title: "Backlog",
    breadcrumb: "Execution 축",
    description: "지금 하지 않기로 한 일을 적어 다음 generation의 근거로 쓰는 자리.",
    intro: "backlog 항목은 이월된 일입니다. milestone처럼 여러 갈래를 담지는 못하지만, 항목 하나가 하나의 경계를 줍니다 — 그래서 exec generation을 여는 근거가 됩니다.",
    makeTitle: "만듭니다",
    makeCode: `reap make backlog --type <t> --title "<제목>" [--slug <s>] [--from <id>]`,
    makeDesc: "type은 관례이고 CLI가 강제하지 않습니다. --from은 이 항목이 어디서 나왔는지(막힌 generation, 발견한 문제)를 적어두는 자리로, 있으면 적고 없어도 됩니다.",
    groundsTitle: "exec의 근거로 씁니다",
    groundsCode: `reap make generation --backlog <bk-id> --title "<제목>"`,
    groundsDesc: "backlog 항목 하나가 무엇을 할지 이미 다 적고 있으면, milestone을 새로 만들지 않고 이 항목만으로 세대를 엽니다. milestone을 또 만들면 경계가 두 곳에 적히고 두 곳은 어긋납니다. milestone의 한 갈래인데 그 갈래가 backlog 항목에 적혀 있다면 --milestone과 --backlog를 함께 줍니다.",
    consumeTitle: "소비합니다",
    consumeCode: `reap mark backlog <bk-id> --consumed [--by <gen-id>]`,
    consumeDesc: "소비 표시만 하고 위치는 그대로입니다 — 상태와 위치는 다른 질문입니다. 이미 consumed인 항목은 근거가 되지 못합니다. 소비가 불완전했다면 무엇이 남았는지 담은 새 항목을 만듭니다.",
    lifeTitle: "life에 남는 이유와 archive",
    lifeDesc: "life/backlog/는 열린 항목만 두는 자리가 아니라 지금 참고할 값이 있는 항목의 작업 세트입니다. consumed라도 무엇을 물었고 답이 어떻게 뒤집혔는지가 읽을 값을 가질 수 있어, archive로 내리는 것은 판단입니다. 그 판단은 milestone을 닫을 때 cleanup이 하고, reap mark backlog <bk-id> --archived는 옮기기만 합니다.",
    overlapTitle: "두 항목이 겹칠 때",
    overlapDesc: "원칙은 항목 하나에 경계 하나지만, 두 항목이 같은 명령이나 같은 파일을 다뤄야 한다면 나눠서 소비하는 순간 절반만 끝난 상태가 남습니다. 그럴 때는 하나에만 --backlog를 주고 나머지는 세대 기록의 Intent에 적습니다. 우연히 겹치는 무관한 항목을 편의로 묶는 것과는 다릅니다.",
    exampleTitle: "실물",
    exampleDesc: "발견한 문제를 항목으로 남기고, 그 항목을 근거로 세대를 연 예입니다.",
    exampleCode: `$ reap make backlog --type fix --title "로그인 폼 에러 메시지 다국어화"
backlog bk-1eb33a
  .reap/life/backlog/bk-1eb33a-로그인-폼-에러-메시지-다국어화.md

$ reap make generation --backlog bk-1eb33a --title "로그인 폼 에러 메시지 다국어화"
generation gen-0003-exec
  .reap/life/generations/gen-0003-exec-로그인-폼-에러-메시지-다국어화.md`,
  },

  closingMilestonePage: {
    title: "Milestone 닫기와 Fitness",
    breadcrumb: "Execution 축",
    description: "종료 조건을 사람이 판정하는 절차, fitness 질문, cleanup과 mark의 순서.",
    intro: "milestone을 자를 때 종료 조건을 적어 두더라도, 그것이 충족됐는지는 도구가 판정하지 않습니다. REAP는 milestone 본문에 고정 제목을 두지 않으므로 검사할 수단이 아예 없고, 그래서 판정은 사람의 몫입니다.",
    judgeTitle: "종료 조건 판정은 사람",
    judgeDesc: "정량 지표는 없습니다 — 만들어내는 순간 그 지표를 맞추는 일이 목적을 대신하게 됩니다. exit criteria가 사람이 판정할 수 있는 상태로 쓰여 있다면, 남는 일은 그 상태가 실제로 됐는지 사람에게 확인받는 것뿐입니다.",
    fitnessTitle: "자를 때 써둔 질문을 그대로 씁니다",
    fitnessDesc: "milestone을 자르는 시점에 이미 'What to ask when this milestone closes' 절에 서너 개의 질문을 적어 뒀습니다. 끝난 뒤에 즉석에서 물으면 후회만 묻게 되므로, 닫을 때는 그 질문을 그대로 사람에게 던집니다 — '잘 됐나'가 아니라 '이번에 달라진 무엇이 실제로 나아졌는가'를 묻는 질문입니다.",
    orderTitle: "순서",
    orderDesc: "고정돼 있고, 뒤바꾸면 다음 세션이 기록을 잃습니다.",
    orderSteps: [
      { title: "1. fitness를 받아 milestone.md에 적습니다", desc: "답만이 아니라 어떻게 읽었는지도 적습니다. 유보된 답은 idea/research/로 보내 다음 milestone이 다시 묻게 합니다" },
      { title: "2. cleanup을 부릅니다", desc: "life/generations/를 훑어 참고 가치가 다한 세대를 archive로 내리고, 옮긴 목록을 handoff.md에 남깁니다" },
      { title: "3. reap mark milestone <ms-id> --closed", desc: "milestone 디렉토리 전체를 archive/milestones/로 옮깁니다. handoff.md도 함께 옮겨지므로, cleanup이 먼저 돌아야 그 기록이 살아서 archive로 갑니다" },
    ],
    cleanupTitle: "cleanup의 기준 — 참고 가치",
    cleanupDesc: "life/generations/에 남길지 archive로 내릴지를 가르는 것은 milestone 소속이 아니라 '앞으로 이것을 볼 일이 있는가' 하나입니다. 열린 세대는 옮기지 않습니다 — 상태 줄에서 사라지면 세션이 죽은 것처럼 보여 evolve가 그 위에 새 세대를 엽니다.",
    cleanupTestNote: "애매하면 남깁니다. 다만 '남긴다'가 이유를 지어내도 된다는 뜻은 아닙니다 — 어느 세션이 무엇을 하려고 이 파일을 다시 열지를 한 문장으로 쓸 수 없다면, 그건 애매한 게 아니라 옮길 차례입니다.",
    handoffTitle: "handoff에 남길 것",
    handoffDesc: "cleanup이 옮긴 세대와 backlog 목록, 그리고 판단이 갈렸던 것 — 참고 가치가 있어 보였는데 남긴 이유. 이것들이 handoff.md에 쓰여야 milestone이 archive로 옮겨진 뒤에도 다음 세션이 무엇이 어디로 갔는지 압니다.",
    lessonsTitle: "lessons로 올릴 것",
    lessonsDesc: "milestone 하나를 넘어 프로젝트 전체가 반복해서 겪은 것이라면 vision/memory/lessons.md로 올립니다. 한 번 겪은 것은 관찰이고 여러 번 겪은 것은 규칙입니다 — 반복 확인된 교훈은 다시 genome/evolution.md의 규칙으로 졸업하고 lessons에서는 지웁니다.",
    exampleTitle: "실물",
    exampleDesc: "generation과 loop가 먼저 닫히고, milestone이 마지막으로 archive/milestones/로 옮겨진 예입니다.",
    exampleCode: `$ reap mark generation gen-0001-exec --closed
닫았습니다: gen-0001-exec

$ reap mark loop loop-0001-plan --closed --milestone ms-001
닫았습니다: loop-0001-plan

$ reap mark milestone ms-001 --closed
닫고 옮겼습니다: ms-001
  .reap/archive/milestones/ms-001-login/milestone.md`,
  },

  genomePage: {
    title: "Genome",
    breadcrumb: "지식",
    description: "제품 정체성, 행동 규칙, 절대 제약 — 매 세션 그대로 주입되는 규범 지식.",
    intro: "genome은 어떻게 만들어야 하는가를 담는 규범 지식입니다. environment가 지금 무엇이 있는지를 서술한다면, genome은 처방입니다 — 그리고 세 파일로 나뉩니다.",
    filesTitle: "세 파일",
    filesHeaders: ["파일", "담는 것"],
    files: [
      ["application.md", "제품 정체성과 아키텍처. plan source에 이미 있는 규범은 옮겨 적지 않습니다 — 두 곳에 있으면 어긋나고, 다음 세대가 어느 쪽을 읽을지 모릅니다"],
      ["evolution.md", "AI가 따르는 행동 규칙. 무엇을 사람에게 묻고 무엇을 스스로 정할지, 반복하면 안 되는 실수"],
      ["invariants.md", "절대 제약. 사람만 고칩니다"],
    ],
    injectionTitle: "매 세션 그대로 주입됩니다",
    injectionDesc: "SessionStart 훅이 reap ctx를 부르면 genome 전체와 environment/summary.md, 상태 줄이 실립니다. 다른 지식은 이름만 나고 필요할 때 열지만, genome은 세 파일 전부가 매번 그대로 들어갑니다 — 그래서 커지면 다른 지식의 자리를 밀어냅니다.",
    seedTitle: "씨앗과 init --check",
    seedDesc: "reap init이 놓는 것은 내용이 아니라 질문 문장입니다. 씨앗인 채로 남으면 모든 세션이 빈 프롬프트를 맥락으로 받습니다. 씨앗인지는 번들 템플릿과 내용이 같은지로 판정하고, --check는 보고만 합니다 — 쓰지 않습니다.",
    seedCode: `$ reap init --check
씨앗인 채 남은 파일:
  .reap/genome/application.md
  .reap/genome/evolution.md
  .reap/genome/invariants.md
  .reap/environment/summary.md
  .reap/vision/memory/lessons.md
  .reap/map.md`,
    fillOrderTitle: "init skill이 채우는 순서",
    fillOrderDesc: "reap init(CLI)은 자리를 만들 뿐이고, 채우는 순서는 init skill이 정합니다.",
    fillOrderSteps: [
      { title: "1. plan source 등록", desc: "기획 문서가 있으면 먼저 등록합니다. 이게 먼저인 이유는 application.md가 무엇을 옮겨 적지 않을지가 여기서 정해지기 때문입니다" },
      { title: "2. environment/summary.md", desc: "지금 무엇이 있는지 먼저 서술합니다" },
      { title: "3. genome/application.md", desc: "plan source와 겹치지 않는 만큼만 씁니다" },
      { title: "4. genome/evolution.md", desc: "앞의 셋을 채우며 이 프로젝트를 겪은 뒤에 쓰는 것이 낫기 때문에 마지막입니다" },
    ],
    sizeTitle: "크기 안내선",
    sizeDesc: "genome 파일 하나가 6.0KB, 주입 총량이 16.0KB를 넘으면 doctor가 참고로 보고합니다. 결함이 아니라 참고입니다 — 넘었다는 것은 커졌다는 뜻이지 틀렸다는 뜻이 아닙니다.",
  },

  environmentPage: {
    title: "Environment",
    breadcrumb: "지식",
    description: "현재 기술 스택과 소스 구조 — summary는 주입, 나머지는 필요할 때.",
    intro: "environment는 현상 지식입니다. genome이 어떻게 만들어야 하는가라면 environment는 지금 무엇이 있는가이고, 셋으로 나뉩니다.",
    filesTitle: "셋",
    filesHeaders: ["파일·디렉토리", "무엇을 담나"],
    files: [
      ["summary.md", "현재 기술 스택, 소스 구조, 빌드·테스트 방법. 매 세션 genome과 함께 그대로 주입됩니다"],
      ["source-map.md", "각 모듈이 무엇을 위한 것이고 왜 그렇게 생겼는지 — 코드 인덱스가 못 보는 의도. 선택이고 필요할 때 읽습니다"],
      ["resources/", "실제로 채택한 외부 스펙·API 문서. 필요할 때만 열립니다"],
    ],
    useTitle: "무엇을 쓰고 무엇을 안 쓰는가",
    useDesc: "summary.md가 담는 것은 다음 세션이 어디서부터 손대야 하는지이지 코드의 내용이 아닙니다. 코드를 실제로 읽어 아는 일은 코드 인덱스의 몫이고, environment는 그 결과를 옮겨 적지 않습니다. idea/files/에 있는 자료와의 경계도 채택 여부입니다 — 지금 쓰고 있는 스펙이면 resources/, 쓸지도 모르는 자료면 idea/files/이고 채택되는 순간 옮겨집니다.",
    notUseNote: "resources/는 목록을 따로 관리하지 않습니다. 무엇이 있는지는 디렉토리를 읽는 것이 곧 목록이라, 별도의 색인 파일을 두면 갱신을 잊는 순간 어긋납니다.",
  },

  visionMemoryPage: {
    title: "Vision과 Memory",
    breadcrumb: "지식",
    description: "milestone이 쌓이는 자리와 프로젝트 전역 교훈이 쌓이는 자리.",
    intro: "vision/은 하려는 것을 담습니다 — 잘라낸 실행 단위인 milestones/와, 프로젝트를 가로지르는 교훈인 memory/. life나 archive와 달리 vision은 시간이 아니라 무엇을 하려는가로 갈립니다.",
    visionTitle: "vision/milestones/",
    visionDesc: "열린 milestone과 아직 닫히지 않은 것들이 여기 삽니다. 닫히면 디렉토리 전체가 archive/milestones/로 옮겨지고, milestone.md·handoff.md·tasks/가 함께 보존됩니다.",
    memoryTitle: "memory/lessons.md",
    memoryDesc: "프로젝트가 사는 동안 계속 자라는 단 하나의 파일입니다. 결론 안 난 물음은 여기 두지 않습니다 — 그건 idea/research/의 자리입니다. 물음은 닫히는 것이고 교훈은 쌓이는 것이라, 한 파일에 섞으면 어느 쪽도 정리되지 않습니다.",
    graduationTitle: "나가는 문 — 졸업",
    graduationDesc: "자라기만 하는 문서는 언젠가 아무도 읽지 않습니다. 반복 확인된 교훈은 genome/evolution.md의 규칙으로 졸업하고 lessons에서 지웁니다. 더는 유효하지 않은 것도 지웁니다 — 기술 선택이 바뀌었거나 그 실수를 만들 수 있는 코드가 사라졌으면 그 교훈은 잡음입니다. 제목만 읽고도 무엇에 관한 교훈인지 알 수 있게 씁니다 — 열어봐야 아는 제목은 주입되지 않는 문서에서 안 읽힙니다.",
    handoffVsLessonsTitle: "handoff와 lessons의 구분",
    handoffVsLessonsDesc: "다음 세션에 필요한 것은 handoff.md, 프로젝트를 가로질러 반복 확인된 것은 lessons.md입니다. 이 구분이 무너지면 lessons가 handoff의 우회로가 되고, 그러면 아무도 안 읽는 파일이 됩니다.",
    notInjectedNote: "memory는 주입되지 않습니다. 상태 줄이 위치만 알리고, 필요한 agent가 직접 엽니다.",
  },

  configurationPage: {
    title: "설정",
    breadcrumb: "레퍼런스",
    description: ".reap/config.yml의 필드와 언어 해석 순서.",
    intro: "reap init이 .reap/config.yml을 놓는다. 프로젝트 설정은 이 파일 하나다.",
    yamlTitle: "config.yml",
    yamlCode: `language: en
agentClient: claude-code
workspaceId: ba44307f94a6`,
    fieldsTitle: "필드",
    fieldHeaders: ["필드", "설명"],
    fields: [
      ["language", "CLI 출력 언어. init이 en으로 채운다. 비어 있으면 아래 해석 순서를 따른다"],
      ["agentClient", "AI agent 클라이언트. 기본값 claude-code"],
      ["workspaceId", "worktree 간에 수렴하는 해시. init이 리포 경로에서 계산해 채우고, orch의 공유 상태 경로(~/.reap/orch/<workspaceId>/)에 쓰인다. 사람이 손으로 바꾸는 값이 아니다"],
    ],
    langTitle: "언어 해석 순서",
    langDesc: "config.language → REAP_LANG 환경변수 → en. .reap/가 없거나 config를 읽을 수 없으면(init 전, 프로젝트 밖) config 단계를 건너뛰고 REAP_LANG → en으로 간다. agent가 사용자에게 답하는 언어는 이와 별개다 — 상태 줄의 Response language 줄을 따른다.",
    overrideTitle: ".reap/templates/가 번들을 이긴다",
    overrideDesc: "make·init이 놓는 씨앗 파일은 번들 템플릿에서 온다. 같은 이름의 파일을 .reap/templates/ 아래 두면 번들보다 그 파일이 이긴다 — 프로젝트가 자기 기록 형식을 가지는 확장점이다.",
    gitignoreTitle: ".gitignore",
    gitignoreDesc: "init이 .reap/.session과 .reap/.index/를 .gitignore에 추가한다. .session은 worktree 로컬 상태라 커밋되면 다른 세션의 바인딩이 섞이고, .index/는 파생 데이터라 커밋하면 그 인덱스를 담은 커밋을 다시 인덱싱해야 해서 끝나지 않는다.",
  },

  doctorPage: {
    title: "Doctor",
    breadcrumb: "레퍼런스",
    description: "확정적으로 검사 가능한 것만 보고하는 점검 도구.",
    intro: "reap doctor는 .reap/의 상태를 확정적으로 검사 가능한 만큼만 검사해 보고한다. 파일을 쓰지 않고, 고치지도 않는다.",
    splitTitle: "결함과 참고를 가른다",
    splitDesc: "결함은 확정적으로 틀린 것이다 — 형식이 어긋났거나 참조가 끊겼거나 있어야 할 파일이 없다. 참고는 사람이 봐야 할 것이다 — 크기가 안내선을 넘었거나 바인딩을 잃은 generation이 있다. 결함이 하나라도 있으면 doctor는 실패로 끝난다. 참고만 있으면 성공으로 끝난다. 둘을 섞으면 참고가 결함을 묻는다.",
    noFixDesc: "doctor는 아무것도 고치지 않는다. 결함을 알려줄 뿐이고, 고치는 것은 agent나 사람의 다음 행동이다.",
    defectsTitle: "결함",
    defectHeaders: ["결함", "무엇을 보는가"],
    defects: [
      ["id 형식", "발급된 id가 형식에 맞는지"],
      ["id 중복", "같은 id가 두 곳 이상에 있는지"],
      ["레지스트리에 없는 id", "발급 대장(sequence/)에 없는 id가 파일로 존재하는지"],
      ["끊긴 참조", "milestone·generation·backlog·loop의 from·milestone·backlog·consumedBy·refs가 실재하는 항목을 가리키는지"],
      ["커밋 없이 닫힌 generation", "닫힌 세대의 startCommit과 endCommit이 같은지 — 코드 변경 없이 닫혔다는 뜻"],
      ["focus가 둘", "focus: true인 열린 milestone이 둘 이상인지"],
      ["깨진 상대 링크", ".reap/ 안 마크다운 문서의 상대 링크가 실재 파일을 가리키는지"],
      ["carrier", "reap:carrier-<hash6> 표식이 어긋나 있는지"],
      ["훅 조건 스크립트 없음", "훅이 가리키는 conditions/<c>.sh가 실재하는지"],
      ["모르는 훅 이벤트", "훅 파일명의 이벤트가 여섯 이벤트 안에 있는지"],
      ["훅 파일명 규약 밖", "hooks/ 아래 파일이 {event}.{name}.{md|sh} 형식인지"],
    ],
    notesTitle: "참고",
    noteHeaders: ["참고", "무엇을 보는가"],
    notes: [
      ["열린 채 바인딩 안 된 generation", "status: open인데 .session이 다른 id를 가리키거나 비어 있는지"],
      ["map.md가 씨앗과 다르다", "프로젝트가 지도를 덧붙였거나 REAP가 레이아웃을 바꿨는지"],
      ["크기 안내선", "genome 개별 파일·environment/summary.md·주입 합계·열린 milestone.md가 안내선을 넘는지"],
      ["누적 경고", "lessons.md의 크기나 항목 수가 안내선을 넘는지 — 졸업시킬 때라는 신호"],
      ["졸업 조건이 없는 idea", "research·file 유형 idea 문서에 졸업 조건 절이 있는지"],
      ["출처가 없는 research", "research 문서에 출처 절이 있는지"],
      ["carrier 고아", "표식이 한 파일에만 있어 짝이 없는지"],
    ],
    guideTitle: "크기 안내선의 출처",
    guideDesc: "숫자는 규범이 아니라 이 리포의 실측에서 나온 참고다(2026-08-31, 세대 57) — 가장 큰 실물의 두 배 안팎이다. 넘으면 커진 것이지 잘못된 것은 아니다.",
    guideHeaders: ["안내선", "값"],
    guides: [
      ["genome 파일 하나", "6.0KB"],
      ["environment/summary.md", "9.0KB"],
      ["주입 합계", "16.0KB"],
      ["lessons.md", "16.0KB 또는 항목 24개"],
      ["열린 milestone.md", "10.0KB"],
    ],
    exampleTitle: "실물 출력",
    exampleDesc: "훅 하나가 없는 조건 스크립트를 가리키게 두고 genome 파일 하나를 키운 상태에서:",
    exampleCode: `결함 1 · 참고 2

## 결함 — 확정적으로 틀린 것
- [훅 조건 스크립트 없음] hooks/gen.closed.notify.sh → conditions/ship-ready.sh

## 참고 — 사람이 볼 것
- [크기 안내선] .reap/genome/application.md 18.0KB > 6.0KB — 매 세션 주입된다
- [크기 안내선] 주입 합계 19.0KB > 16.0KB`,
  },

  comparisonPage: {
    title: "비교",
    breadcrumb: "기타",
    description: "REAP가 기존 스펙 기반 개발 도구·agent 워크플로·단순 CLAUDE.md와 어떻게 다른가.",
    intro: "REAP를 세 갈래와 견준다 — 스펙 기반 개발 도구, agent 자율 워크플로 도구, 단순 CLAUDE.md 한 장. 다르게 만드는 지점은 대체로 두 축과 fitness, 자율 evolve로 모인다.",
    items: [
      {
        title: "정적 스펙 vs 두 축의 순환",
        desc: "스펙 기반 도구는 코드 전에 명세를 한 번 쓰고 구현으로 넘어간다. REAP는 Plan 축(loop)과 Execution 축(milestone·generation)이 따로 돌고, 실행 중 발견한 것은 backlog로 되먹여져 다음 세대나 다음 loop에 반영된다. 계획도 코드처럼 다시 쓰인다.",
      },
      {
        title: "하드 게이트 vs 보고만 하는 doctor",
        desc: "많은 agent 워크플로 도구는 lint·test 통과를 다음 단계로 가는 조건으로 강제한다. REAP의 doctor는 결함과 참고를 나눠 보고할 뿐 세대를 막지 않는다 — 판단은 agent와 사람의 몫으로 남는다.",
      },
      {
        title: "정량 지표 vs 사람의 자연어 fitness",
        desc: "milestone이 닫힐 때 점수나 커버리지 같은 정량 지표를 내지 않는다. 사람이 자연어로 무엇이 잘됐고 무엇이 아쉬웠는지 적는다. 지표를 만들면 그 지표를 맞추는 작업이 되기 쉽다.",
      },
      {
        title: "CLAUDE.md 한 장 vs genome·environment 분리",
        desc: "지침 파일 하나에 규범과 서술을 모두 적는 방식은 시간이 지나며 섞여 자란다. REAP는 genome(규범, 세대 중 불변)과 environment(서술, 기술 스택·구조)를 나누고, doctor의 크기 안내선으로 섞여 커지는 것을 알아챈다.",
      },
      {
        title: "한 세션 전제 vs claim·barrier로 여러 세션",
        desc: "대부분의 agent 워크플로는 세션 하나를 전제한다. REAP는 orchestrate skill로 여러 세션이 자원을 claim하고 barrier에서 합류점을 만든다 — 메시지 전달은 클라이언트가 하고, REAP는 만남의 장소만 준다.",
      },
    ],
  },

  skills: {
    title: "skill 10종",
    breadcrumb: "레퍼런스",
    description: "agent가 REAP를 다루는 통로. 플러그인이 배포하는 skill 열 종.",
    intro: "agent가 REAP를 다루는 통로는 skill이다. 플러그인이 배포한다. 일곱은 사람이 / 메뉴에서 부를 수 있고, 셋(complete·carve-milestone·cleanup)은 작업 흐름 안에서 agent만 부른다 — 메뉴에는 나오지 않는다. 각 skill의 전문은 plugin/skills/<이름>/SKILL.md에 있다. 아래는 누가·언제·무엇을·부르지 않는 경우만 요약한다.",
    tableHeaders: ["skill", "누가", "언제"],
    table: [
      ["init", "사람", "프로젝트당 한 번, 맨 처음 — 정본 지식을 세운다"],
      ["evolve", "사람", "세대를 열 때 — loop·exec·fix 중 무엇인지 정한다"],
      ["complete", "agent", "세대를 닫을 때"],
      ["loop", "사람", "새 의도를 만들 때 — 기획·설계·화면·아직 자리 없는 것"],
      ["carve-milestone", "agent", "plan을 실행 가능한 milestone으로 자를 때, 그리고 milestone을 닫을 때"],
      ["interview", "사람", "의도가 모호해 사람이 결정해야 할 때"],
      ["orchestrate", "사람", "두 세션 이상이 같은 프로젝트에서 동시에 작업할 때"],
      ["cleanup", "agent", "사람이 fitness로 milestone을 닫기로 한 직후"],
      ["migrate", "사람", "v0.17 데이터를 v0.18 구조로 옮길 때"],
      ["report-issue", "사람", "REAP 자체의 결함이나 빠진 기능을 만났을 때"],
    ],
    tableNote: "",
    whenLabel: "언제 —",
    whatLabel: "무엇을 —",
    notCalledLabel: "부르지 않는 경우 —",
    skillList: [
      {
        name: "init",
        when: "프로젝트당 딱 한 번, 맨 처음. .reap/가 없거나 있어도 씨앗 그대로일 때. 상태 줄이 안내하지 못하는 유일한 skill이라 사람이 직접 부른다.",
        what: "reap init 뒤 plan 문서를 등록하고 environment/summary.md·genome/application.md·evolution.md를 채운 뒤 첫 milestone을 carve-milestone에 넘긴다.",
        notCalled: ".reap/가 있고 씨앗이 이미 채워져 있으면 이 skill의 일이 아니다.",
      },
      {
        name: "evolve",
        when: "세대를 열 때, 새 작업을 시작할 때.",
        what: "상태 줄과 handoff.md·milestone.md·task를 읽고 새 의도를 만드는 일(loop)인지 실현·되돌리는 일(generation)인지 정한 뒤 연다. 열고 나서는 직접 할지 subagent에 위임할지도 판단한다 — 여러 파일·긴 탐색이 예상되거나 병렬로 둘 이상 돌릴 때 위임한다.",
        notCalled: "이미 열린 세대가 있으면(내 것이면 이어가고 남의 것이면 새로 열지 않는다), 한 번의 편집·커밋으로 끝나는 일이면(세대를 열 값이 없다).",
      },
      {
        name: "complete",
        when: "세대를 닫을 때, 작업을 마무리할 때.",
        what: "위임된 세대면 Outcome·Dead Ends를 먼저 검토하고, 커밋 규칙(작업 트리가 비어 있고 새 커밋이 있는가)을 확인한 뒤 기록과 handoff.md를 정리해 닫는다.",
        notCalled: "커밋 규칙이 안 맞으면 여기서 멈춘다. 커밋 없이 닫지 않는다.",
      },
      {
        name: "loop",
        when: "새 의도를 만들 때 — 기획(plan)·설계(design)·화면·흐름(uiux)·아직 자리 없는 것(idea).",
        what: "loop를 열거나 이어 plan에 쓰고 Dialogue를 기록하며, 자를 것이 정해지면 carve-milestone으로 넘겨 milestone을 낳고 닫는다.",
        notCalled: "이미 실현할 의도가 서 있어 실행만 하면 될 때(그건 generation), 같은 물음을 다루는 loop가 이미 열려 있을 때(새로 열지 않고 잇는다).",
      },
      {
        name: "carve-milestone",
        when: "loop 안에서 plan을 실행 가능한 milestone으로 자를 때, 그리고 milestone을 닫을 때.",
        what: "자르려는 전제를 실제 흔적에 대조한 뒤 경계·종료 조건·범위 밖과 task를 적어 자르거나, fitness·cleanup·mark 순서로 닫는다.",
        notCalled: "backlog 항목 하나로 충분하면(경계가 두 곳에 적힌다), 무엇을 만들지 아직 안 섰으면(그건 interview·loop의 일), 한 세대로 끝날 일이면 backlog 항목으로 충분하다.",
      },
      {
        name: "interview",
        when: "의도가 모호해 사람이 결정해야 할 때. evolve·loop·carve-milestone·init이 가리킬 때.",
        what: "코드·spec·기존 대화로 답이 나오는 질문을 걸러낸 뒤, 한 번에 하나·선택지 2~4개+자유입력·대가·근거 있는 추천·끝이 보이는 형식으로 사람에게 묻는다.",
        notCalled: "명령 한 줄로 확정되는 사실, spec이나 handoff.md·Dialogue에 이미 답이 있는 것, 사람 몫이 아닌 판단에는 부르지 않는다.",
      },
      {
        name: "orchestrate",
        when: "두 세션 이상이 같은 프로젝트에서 동시에 작업할 때.",
        what: "worktree로 역할을 가르고, 손대기 전에 claim하고, 합류점에 barrier를 두고, SendMessage로 조율한다.",
        notCalled: "혼자 일할 때는 이 skill이 없는 것과 같다. 상태 줄에도 doctor에도 아무것도 안 나온다.",
      },
      {
        name: "cleanup",
        when: "사람이 fitness로 milestone을 닫기로 확인한 직후, mark milestone --closed를 부르기 전.",
        what: "life/generations/를 훑어 참고 가치가 다한 세대를 archive/generations/로 내린다.",
        notCalled: "열린 세대는 옮기지 않는다. 애매하면 남긴다 — 남길 이유를 억지로 만들지 않는다.",
      },
      {
        name: "migrate",
        when: "프로젝트가 v0.17 시대 REAP 데이터(구 5단계 파이프라인 레이아웃)를 갖고 있을 때, 또는 v0.17 위에 v0.18을 막 설치했을 때.",
        what: "판정 → 사전 차단 → 고지·동의 → 격리 → 새 구조 → 이주(subagent) → 검증 → 기록의 8단계로 옮긴다. 원본은 .reap-v0_17/에 그대로 보존한다.",
        notCalled: "uncommitted 변경이나 열린 generation이 있으면 정리한 뒤 부른다. 판정이 v018이면 이미 이주할 것이 없다.",
      },
      {
        name: "report-issue",
        when: "REAP 자체의 결함이나 빠진 기능을 만났을 때.",
        what: "누구의 문제인지 가르고, 재현 명령·기대·실제를 실어 이 프로젝트의 코드·경로를 뺀 issue를 써서 gh로 올린다.",
        notCalled: "이 프로젝트의 코드·genome·backlog 판단이면 issue가 아니다. 헷갈리면 이 프로젝트의 backlog에 먼저 적는다.",
      },
    ],
  },

  cli: {
    title: "CLI 레퍼런스",
    breadcrumb: "레퍼런스",
    description: "reap 명령 전체 — make·mark·doctor·index·orch·ctx.",
    intro: "reap을 인자 없이 치면 아래가 그대로 나온다.",
    usage: `사용법: reap <명령>

  --version
  init [--force] | init --check     (--check: 씨앗 그대로인 지식 파일을 보고만 한다)
  make loop       --type plan|design|uiux|idea --title "<제목>" [--slug <s>] [--from <id>] [--ref <ps-id>:<경로>]
  make milestone  --title "<제목>" [--slug <s>] [--from <loop-id>] [--ref <ps-id>:<경로>] [--focus]
  make generation --milestone <ms-id> --title "<제목>" [--slug <s>]
  make generation --backlog <bk-id> --title "<제목>" [--slug <s>]   (--milestone과 겸용 가능)
  make generation --fix  --title "<제목>" [--slug <s>]
  make backlog    --type <t> --title "<제목>" [--slug <s>] [--from <id>]
  make plan-source --root <path> --role "<역할>" [--slug <s>]
  make idea       --kind research|freememo|file --title "<제목>" [--slug <s>]
  make hook       --event <e> --name <n> [--type md|sh] [--condition <c>] [--order <n>]
  mark loop       <loop-id> --closed [--milestone <ms-id>]... | --aborted
  mark generation <gen-id> --closed | --aborted | --archived
  mark backlog    <bk-id> --consumed [--by <gen-id>] | --archived
  mark milestone <ms-id> --focus | --closed
  mark idea       <idea-id> --archived
  bind <gen-id>                   (열린 세대에 이 세션을 다시 묶는다)
  seq [generation|milestone|loop|source|<id>]
  carrier new <slug> | list [--orphans|--check]
  doctor                          (보고만 한다. 결함이 있으면 실패로 끝난다)
  index [update [--full] | status | impact <file>... | search <q> | callers <id> | callees <id>]
  orch claim <resource> [--ttl 30m] | release <resource> | barrier <name> --expect <N> --timeout <s> | roster | status   [--topic <t>]
  plan sources | convention <ps-id>
  ctx [--milestone <ms-id> | --hook]`,
    usageNote: "명령은 대부분 make(만든다)·mark(상태를 바꾼다) 짝이고, 나머지는 조회·조율용 단독 명령이다.",
    commandHeaders: ["명령", "설명"],
    commands: [
      ["init", "'.reap/'와 씨앗 파일을 놓는다. --check는 씨앗이 아직 채워지지 않은 파일만 보고한다. 프로젝트당 한 번, init skill이 이어서 채운다."],
      ["make", "loop·milestone·generation·backlog·plan-source·idea·hook 일곱 종류를 만들고 id·frontmatter를 스탬프한다. id 발급처럼 확률에 맡길 수 없는 사실을 여기서 못 박는다."],
      ["mark", "loop·generation·backlog·milestone·idea의 상태를 바꾼다. closed·aborted·archived·consumed·focus 등 종류마다 다른 상태 값을 받는다."],
      ["bind", "세션이 세대 바인딩을 잃었을 때(abort 뒤, 다른 디렉토리에서 열었을 때) '.reap/.session'을 그 세대에 다시 묶는다. doctor가 바인딩 안 된 열린 generation을 알려줄 때 쓴다."],
      ["seq", "다음에 발급될 id를 인자 없이 미리 보여준다. 대상(generation·milestone·loop·source)이나 특정 id를 넘기면 그 계열의 현재 번호를 낸다."],
      ["carrier", "한 사실을 여러 자리가 알 때 붙이는 reap:carrier-<hash6> 표식을 관리한다. new가 발급하고, list가 등록된 표식을 훑어 짝이 없는 것(--orphans)이나 문제를 검사(--check)한다."],
      ["doctor", "'.reap/'의 상태를 확정적으로 검사 가능한 만큼만 검사해 보고한다. 파일을 쓰지 않고, 고치지도 않는다."],
      ["index", "코드 인덱스를 질의한다. update(HEAD와 맞춘다)·status(해석률)·impact(파급 범위)·search(정의 찾기)·callers/callees(호출 관계)로 갈린다."],
      ["orch", "여러 세션이 자원을 선점(claim/release)하고 합류점에서 기다리며(barrier) 서로를 본다(roster/status)."],
      ["plan", "등록된 plan 문서 목록(sources)과 그 규약(convention <ps-id>)을 보여줍니다. plan 문서는 리포 안팎 어디든 있을 수 있고, 여기는 그 등록부입니다."],
      ["ctx", "세션이 열릴 때 SessionStart 훅이 부르는 것과 같은 명령이다. genome·environment 요약과 상태 줄을 낸다. --milestone으로 다른 milestone 기준으로, --hook으로 훅이 부르는 형식 그대로 낼 수 있다."],
    ],
    indexLinkText: "코드 인덱스",
    orchLinkText: "orchestrate",
  },

  hooks: {
    title: "hooks",
    breadcrumb: "협업",
    description: "여섯 이벤트에 거는 .md/.sh 훅과 조건·순서.",
    intro: "REAP가 직접 매개하는 지점(make·mark·orchestrate의 원자적 연산)에 이벤트 훅을 걸 수 있다. 메시지 송수신처럼 REAP가 관측할 수 없는 지점에는 훅이 없다.",
    eventsTitle: "여섯 이벤트",
    eventHeaders: ["이벤트", "언제"],
    events: [
      ["gen.made", "세대를 열었을 때"],
      ["gen.closed", "세대를 닫았을 때"],
      ["milestone.made", "milestone을 잘랐을 때"],
      ["milestone.closed", "milestone을 닫았을 때"],
      ["orch.claimed", "자원 선점이 성공했을 때"],
      ["orch.barrier.released", "barrier가 --expect를 채워 풀렸을 때"],
    ],
    fireTiming: "발화는 해당 명령이 파일 쓰기를 끝낸 뒤다. 이벤트를 여섯 밖으로 늘리려면 같은 동작이 세대마다 반복되고, REAP가 직접 매개하는 지점에 걸리고, 프로젝트마다 달라야 하는 셋을 모두 만족해야 한다.",
    fileConventionTitle: "파일 규약",
    fileConventionDesc: "'.reap/hooks/{event}.{name}.{md|sh}'. make hook이 이 이름으로 파일을 놓는다.",
    makeHookExample: "reap make hook --event gen.closed --name notify --type sh --condition always --order 50",
    typesTitle: ".md와 .sh의 차이",
    shType: ".sh",
    shTypeDesc: "프로젝트 루트에서 실행되고 stdout이 명령 출력 뒤에 붙는다.",
    mdType: ".md",
    mdTypeDesc: "실행하지 않는다 — 본문이 명령 출력 뒤에 그대로 붙고, agent가 그것을 읽고 따른다.",
    conditionOrderTitle: "condition과 order",
    conditionOrderDesc: "condition(기본 always)은 hooks/conditions/<c>.sh의 종료 코드가 0일 때만 훅을 돈다. 조건 스크립트가 없으면 doctor가 결함으로 낸다. order는 오름차순으로 실행 순서를 정하고(기본 50), 같으면 파일명 순이다.",
    failureTitle: "실패해도 명령은 성공한다",
    failureDesc: "훅의 종료 코드와 stderr는 보고되지만 make·mark가 이미 쓴 파일은 그대로 남는다. 훅이 세대를 못 열게 만들면 그것은 게이트이고, REAP는 게이트를 두지 않는다. .sh 훅에는 타임아웃이 있어 매달리는 훅이 명령을 영영 붙잡지 않는다.",
    conditionScriptTitle: "조건 스크립트",
    conditionScriptDesc: "hooks/conditions/에 두는 별도 스크립트다. init이 기본으로 always.sh(항상 0을 반환)를 씨앗으로 놓는다. 훅마다 다른 조건이 필요하면 hooks/conditions/에 새 스크립트를 추가하고 --condition으로 가리킨다. '.reap/.session'과 환경변수 REAP_HOOK_EVENT·REAP_HOOK_ID가 .sh 훅에 전달되어, 훅이 무엇 때문에 불렸는지 알 수 있다.",
  },

  codeIndex: {
    title: "Code Intelligence",
    breadcrumb: "지식",
    description: "커밋 단위로 갱신되는 코드 인덱스입니다. 15개 언어, 설치할 것은 없습니다.",
    intro: "reap index는 커밋 단위로 자동 갱신되는 코드 인덱스를 질의합니다. 상주 프로세스도 백그라운드 감시자도 없습니다 — 질의가 스스로 HEAD와 인덱스를 비교해 필요하면 먼저 올린 뒤 답합니다.",
    subcommandsTitle: "하위 명령",
    subcommandsCode: `reap index update [--full]    # 인덱스를 HEAD와 맞춥니다 (기본값, 인자 없이 index만 쳐도 이것)
reap index status             # 개수, import 해석률, 인덱싱된 커밋
reap index impact <file>...   # 이 파일을 바꾸면 어디까지 닿는가
reap index search <query>     # 정의를 찾습니다. file:line과 함께
reap index callers <symbolId> # 누가 이것을 부르는가
reap index callees <symbolId> # 이것이 무엇을 부르는가`,
    commitNote: "git diff 하나로 무엇을 다시 파싱할지 정해지므로, 커밋 안 된 작업은 인덱스에 없습니다. 방금 쓰고 커밋 안 한 심볼은 search가 못 찾고, 새 파일은 impact에 나오지 않습니다.",
    whenTitle: "언제 index고 언제 grep인가",
    indexWhenTitle: "index",
    indexWhenDesc: "정의가 어디 있는지(search), 이 파일을 바꾸면 무엇이 영향받는지(impact), 누가 무엇을 부르는지(callers/callees)를 물을 때 씁니다. 파서가 파싱한 심볼과 CALLS·IMPORTS 관계에서 답이 나옵니다.",
    grepWhenTitle: "grep",
    grepWhenDesc: "커밋 안 된 변경, 문자열 자체를 찾을 때(주석·문서·설정 파일), index가 커버하지 않는 언어의 세부(대부분 언어는 심볼·CALLS는 되지만 IMPORTS·impact는 JS/TS와 Python만 됩니다)에 씁니다.",
    resolutionTitle: "해석률이 낮으면 빈 결과는 \"모름\"입니다",
    resolutionDesc: "status가 내는 줄 중 가장 중요한 것은 import 해석률입니다. impact가 아는 것은 전부 해석된 import edge에서 오므로, 해석률이 낮으면 impact의 빈 결과는 \"영향 없음\"이 아니라 \"모름\"입니다. 인덱싱이 돌았는지가 아니라 무엇을 아는지를 status로 먼저 확인합니다.",
    callResolutionNote: "호출 해석은 이름 기반 휴리스틱입니다 — 타입 해석 없이 이름과 위치로 동명이인을 고르므로 오버로드와 동적 디스패치에서는 틀릴 수 있습니다.",
    noInstallTitle: "설치 없이 돕니다",
    noInstallDesc: "파서는 바이너리에 실려 있습니다. 15개 언어(TS·TSX·JS·Python·Go·Rust·Java·Kotlin·C#·C·C++·Ruby·PHP·Swift·Dart)를 지원하고, git 저장소가 아니면 인덱싱하지 않습니다 — 서술할 수 없는 것을 인덱싱하는 대신 그렇게 알립니다. 인덱스는 .reap/.index/에 살고 init이 gitignore에 넣습니다.",
  },

  orchestrate: {
    title: "orchestrate",
    breadcrumb: "협업",
    description: "두 세션 이상이 동시에 작업할 때 — claim과 barrier.",
    intro: "두 세션 이상이 같은 REAP 프로젝트에서 동시에 작업할 때 쓴다. REAP가 주는 것은 만남의 장소뿐이다 — 자원 선점(claim)과 종료 대기(barrier). 메시지 전달 자체는 Claude Code의 SendMessage/ListAgents가 하고 REAP는 그 위에 mailbox를 만들지 않는다.",
    aloneNote: "혼자 일할 때는 이 skill이 없는 것과 같다. 상태 줄에도 doctor에도 아무것도 안 나온다.",
    worktreeTitle: "worktree로 가른다",
    worktreeCode: "claude -n reap-<topic>-<role> -w <worktree>      # 예: reap-auth-writer, reap-auth-tester",
    worktreeDesc: "세션 이름이 곧 주소이고, <topic>이 공유 상태의 방(~/.reap/orch/<workspace-id>/<topic>/)을 정한다. workspace-id는 같은 리포의 worktree 간에 수렴한다.",
    sameDirNote: "같은 디렉토리에서 세션 둘은 안 된다. '.reap/.session'(세대 바인딩)이 파일 하나라 나중 세션이 앞의 바인딩을 덮는다. worktree마다 '.reap/'가 별개이므로 worktree로 가르면 이 문제가 사라진다.",
    submoduleNote: "리포에 submodule(tests/ 등)이 worktree에 체크아웃돼 있으면 git worktree remove가 \"working trees containing submodules cannot be moved or removed\"로 실패한다 — git worktree remove --force를 쓴다.",
    idTitle: "id는 조율자가 발급한다",
    idDesc: "worktree마다 '.reap/'가 사본이라, 두 worktree에서 각각 make generation을 부르면 같은 번호가 두 번 나올 수 있다. 그래서 id 발급은 주 트리의 조율자가 한다 — 조율자가 세대를 열어 커밋한 뒤 worktree를 만들고, worktree의 세션은 reap bind <gen-id>로 그 세대에 묶이기만 한다.",
    collabTitle: "claim과 barrier로 조율한다",
    collabDesc: "손대기 전에 자원을 잡고(claim), 합쳐야 하는 지점에서 서로를 기다린다(barrier). 자원은 자유 문자열이고 TTL이 지나면 다른 세션이 가져갈 수 있으며 그 탈취는 로그에 남는다. roster·status로 지금 누가 무엇을 잡고 있는지 본다. 명령과 실물 출력은 별도 문서에 있다.",
    collabLinkText: "Claim과 Barrier →",
    kindTitle: "메시지 kind 관례",
    kindHeaders: ["kind", "뜻"],
    kinds: [
      ["claim-request <resource>", "잡힌 것을 놓아달라"],
      ["done <what>", "내 몫이 끝났다"],
      ["blocked <why>", "막혔다. 조율자가 재배치한다"],
      ["ask <question>", "판단이 필요하다"],
    ],
    coordinatorNote: "세션이 셋 이상이면 하나가 조율자를 맡는다 — 갈래를 claim으로 못 박고, barrier 이름과 --expect를 정해 알리는 유일한 자리다. 끝나면 release하고 각자 complete로 세대를 닫는다.",
  },

  claimBarrierPage: {
    title: "Claim과 Barrier",
    breadcrumb: "협업",
    description: "두 세션 이상이 동시에 작업할 때의 자원 선점과 합류 지점.",
    intro: "orchestrate가 주는 만남의 장소 두 가지다 — 손대기 전에 잡는 claim, 합쳐야 하는 곳에 두는 barrier. 둘 다 파일 하나가 자물쇠다.",
    sharedStateTitle: "공유 상태는 리포 밖에 있다",
    sharedStateDesc: "claim과 barrier의 상태는 ~/.reap/orch/<workspace-id>/<topic>/에 산다. worktree마다 '.reap/'가 별개 사본이라 리포 안에 두면 공유되지 않는다. workspace-id는 같은 리포의 worktree 간에 같은 값으로 수렴한다.",
    claimTitle: "claim — O_EXCL로 잡는다",
    claimCode: `reap orch claim <resource> [--ttl 30m] [--topic <t>]
reap orch release <resource> [--topic <t>]`,
    claimDesc: "파일을 O_EXCL로 새로 열어 그 파일 자체가 자물쇠가 된다. resource는 자유 문자열이다 — milestone 갈래는 id(ms-004), 파일 영역은 경로 glob(src/auth/**)이 관례다. TTL이 지나면 다른 세션이 가져갈 수 있고, 그 탈취는 log.jsonl에 남는다. 이미 잡혀 있고 만료 전이면 거부된다 — holder에게 메시지로 묻거나 기다린다.",
    claimExampleTitle: "실물 출력",
    claimExampleCode: `$ reap orch claim "src/auth/**" --ttl 30m --topic demo
잡았습니다: src/auth/** — 3e61761e0243, 만료 2026-09-04T16:26:19Z

$ reap orch status --topic demo
topic demo · 나 3e61761e0243
claims:
  src/auth/**  3e61761e0243  만료 2026-09-04T16:26:19Z
barriers: 없음

$ reap orch claim "src/auth/**" --topic demo   # 다른 세션에서
이미 잡혀 있습니다: src/auth/** — holder 3e61761e0243, 만료 2026-09-04T16:26:19Z

$ reap orch release "src/auth/**" --topic demo
놓았습니다: src/auth/**`,
    barrierTitle: "barrier — --expect·--timeout 필수",
    barrierCode: "reap orch barrier <name> --expect <N> --timeout <초> [--topic <t>]",
    barrierDesc: "--timeout은 필수다 — 오지 않는 참가자를 무한정 기다리지 않는다. 도착이 먼저 기록되고 나머지가 기다린다. expect 인원이 다 도착하면 그 자리에서 통과하고, 시간이 다 되면 누가 오지 않았는지를 낸다 — roster를 알면 이름으로, 모르면 도착 인원 수로. 테스트 전, 통합 커밋 전, milestone 닫기 전처럼 뒤 작업이 앞 작업 전부를 전제하는 지점에 둔다. 자주 두면 병렬이 직렬이 된다.",
    barrierExampleTitle: "실물 출력",
    barrierExampleCode: `$ reap orch barrier ready --expect 2 --timeout 2 --topic demo3   # 하나만 도착
barrier ready 시간 초과 (2s). 도착 1/2 — roster를 알 수 없어 누구인지는 모른다

$ reap orch barrier ready --expect 2 --timeout 5 --topic demo4   # 둘 다 도착
barrier ready 통과 — reap-demo-writer, reap-demo-tester`,
    rosterStatusTitle: "roster·status로 본다",
    rosterStatusCode: `reap orch roster [--topic <t>]
reap orch status [--topic <t>]`,
    rosterStatusDesc: "roster는 claude agents --json에서 이름이 reap-<topic>-로 시작하는 세션만 추린다. 별도 참가 등록 절차는 없다 — 이름이 곧 참가이고, 세션이 죽으면 목록에서 저절로 사라진다. status는 지금 잡혀 있는 claim과 barrier를 함께 보여준다.",
    backLinkText: "orchestrate 개요로 →",
  },

  migration: {
    title: "v0.17에서 이주",
    breadcrumb: "기타",
    description: "8단계 이주. 원본은 .reap-v0_17/에 그대로 보존된다.",
    intro: "v0.17.7 이하에서는 세션 시작 시 버전 검사가 0.18을 보고 자동 갱신 대신 설치 명령을 안내한다. 거기서부터 사람이 손대는 지점은 셋이다.",
    updateCode: `npm i -g @c-d-cc/reap   # 안내받은 명령 — v0.18 CLI
reap setup              # 플러그인 마켓플레이스 등록과 설치
/reap:migrate           # 새 Claude Code 세션에서, 프로젝트마다`,
    handoffDesc: "옛 세션 훅은 이제 v0.18 CLI를 부르게 되는데, CLI가 같은 세 단계를 안내로 답한다. 그 뒤는 migrate skill이 여덟 단계로 진행한다 — 각 단계 시작마다 \"단계 N/8: <이름>\"이 사용자에게 보인다.",
    stepsTitle: "8단계",
    steps: [
      { title: "판정", desc: "스크립트가 v0.17/v0.18/none/mixed/unknown 중 무엇인지 표지 파일로 가른다. 아직 아무것도 옮기기 전이다" },
      { title: "사전 차단", desc: "uncommitted 변경이나 열린 generation이 있으면 여기서 멈춘다" },
      { title: "고지와 동의", desc: "단계별 분량 실측, 토큰 사용량이 클 수 있다는 고지, 비파괴 약속을 보여주고 명시적 동의를 받는다" },
      { title: "격리", desc: ".reap를 .reap-v0_17로 이름만 바꾼다" },
      { title: "새 구조", desc: "reap init으로 새 .reap/를 세우고, config.yml의 language·agentClient만 구 값을 이어받는다" },
      { title: "이주", desc: "subagent가 매핑 표(migration-map.md)를 따라 데이터를 옮긴다. 주 세션의 컨텍스트는 구 데이터로 채우지 않는다" },
      { title: "검증", desc: "reap doctor가 결함 0이어야 다음으로 간다. .reap-v0_17/이 무손상인지도 확인한다" },
      { title: "기록과 홈 정리 안내", desc: "archive/migration-v0_17.md에 기록을 남기고, 홈 디렉토리 정리 목록을 사람 동의 후에만 실행한다" },
    ],
    preservedTitle: "원본은 보존된다",
    preservedDesc: "원본 비파괴가 불변식이다. 어느 단계도 구 데이터를 수정하지 않는다 — .reap-v0_17/로 자리만 옮겨 통째로 남는다. 되돌리기는 한 줄이다.",
    rollbackCode: "rm -rf .reap && mv .reap-v0_17 .reap",
    recordExampleTitle: "기록 파일 실례",
    recordExampleDesc: "8/8이 남기는 archive/migration-v0_17.md는 옮긴 것·안 옮긴 것·필요한 갱신·검증(doctor 전문)을 담는다. selfview 실물 이주(2026-09-05)에서 나온 한 조각:",
    recordExampleCode: `## 옮기지 않은 것

**#3 backlog — 8건 전부 재발급하지 않음.** 재검토 결과 8건 모두 이미 해소된 상태였다:
- admin-article-generate-share-safety-gates — gen-037 완료(제목 정확히 일치, fitnessFeedback 확인).
  frontmatter는 status: pending으로 남아있었으나 갱신 안 된 흔적
- team-mode-p0c-account-auth — frontmatter status: consumed, consumedBy: gen-047-be537d

## 검증

결함 0 · 참고 3

## 참고 — 사람이 볼 것
- [크기 안내선] .reap/genome/evolution.md 8.1KB > 6.0KB — 매 세션 주입된다`,
    backlogJudgeTitle: "backlog는 frontmatter를 믿지 않는다",
    backlogJudgeDesc: "옛 backlog 항목의 status: pending을 그대로 믿고 재발급하면 이미 끝난 일이 다시 열린다. selfview 실물에서는 8건 전부가 실제로는 이미 소비돼 있었다 — lineage(옛 generation 기록)와 현재 코드를 대조해 이미 해소된 항목은 재발급하지 않는다. midterm.md 같은 옛 메모가 pending이라고 적어 놓았어도 그 메모 자체가 낡았을 수 있다.",
    designLinksTitle: "design 하위 문서군은 묶음을 남긴다",
    designLinksDesc: "vision/design/team-mode/처럼 문서 여러 개가 상대 링크로 서로를 참조하는 디렉토리는 문서 단위로 idea를 발급하면 그 링크가 깨진다. 발급한 뒤 상호 링크를 새 idea 파일명으로 고쳐 쓴다 — doctor의 깨진 상대 링크 검사가 손대지 않고 남은 것을 잡아낸다.",
    lostTitle: "무엇을 잃는가",
    lostItems: [
      ["5단계 lifecycle과 그 흐름 명령", "run start/next/back/abort/early-close, /reap.* 7종. 흐름은 이제 evolve·complete skill의 판단이다"],
      ["/reap.evolve의 자율 실행 subagent 위임", "v0.18의 evolve는 주 세션이 직접 세대를 연다"],
      ["merge/pull/push lifecycle", "orchestrate skill과 git 직접 사용으로 대체"],
      ["reap-evaluate evaluator agent", "orchestrate의 한 사용 사례로 흡수"],
      ["status·config·check-version·uninstall 명령", "ctx 상태 줄·doctor·config 직접 편집·플러그인 제거로 대체"],
      ["update·이주 안내 레이어", "migrate skill이 0.17→0.18 이주를 한 번만 처리하고, 그 뒤는 doctor·init --check가 맡는다"],
      ["fix --check·clean·destroy", "doctor·cleanup skill·rm -rf .reap + 플러그인 제거로 대체"],
      ["install-skills·load-context·dump-state, opencode/codex adapter", "플러그인 설치·ctx --hook으로 대체, 나머지는 없음"],
      ["/reap.help 16주제, 다국어 reap help", "README와 skill 본문으로 대체"],
      ["vision/goals.md·lineage/·3단 memory·current.yml", "plan 등록·lessons.md 선별·.session으로 대체. 승계되지 않는 것도 있다"],
    ],
  },

  releaseNotes: {
    title: "릴리스 노트",
    breadcrumb: "기타",
    description: "v0.18.0에서 무엇이 바뀌고 무엇이 사라졌는가.",
    sourceNote: "리포 루트의 RELEASE_NOTES.md를 옮긴다 — 원문은",
    version: "0.18.0",
    summary: "REAP는 파이프라인 실행기에서 규약과 도구 제공자로 다시 만들어졌다.",
    changedTitle: "변경",
    changed: [
      "두 산출물로 나뉜다 — npm CLI @c-d-cc/reap와 Claude Code 플러그인. 플러그인은 reap setup이 마켓플레이스를 통해 설치하고, 갱신은 마켓플레이스가 맡는다",
      "저장소가 3단이다 — vision/(하려는 것) · life/(지금 살아 있는 것) · archive/(더는 참고하지 않는 것)",
      "작업이 세 단위로 갈린다 — loop(새 의도를 만든다) · milestone(실행 가능한 단위로 자른 계획) · generation(exec/fix — 실제로 코드를 진화시킨다)",
      "reap doctor가 확정적으로 검사 가능한 것만 검사해 보고한다. 고치지 않는다",
      "코드 인덱스(reap index)는 계속된다 — 15개 언어, 설치할 것 없음, 백그라운드 프로세스 없음",
      "여섯 이벤트 훅(gen.made·gen.closed·milestone.made·milestone.closed·orch.claimed·orch.barrier.released)과 make hook",
    ],
    removedTitle: "제거",
    removed: [
      "5단계 lifecycle 강제와 그 흐름 명령(run start/next/back/abort/early-close, /reap.* 7종)",
      "/reap.evolve의 자율 subagent 위임 — v0.18의 evolve는 주 세션이 직접 일한다",
      "merge/pull/push lifecycle",
      "reap-evaluate evaluator agent",
      "status/config/check-version/uninstall 명령",
    ],
    comingTitle: "v0.17에서 왔다면",
    comingDesc: "v0.17.7 이하는 세션 시작 시 버전 검사가 자동 갱신 대신 npm i -g @c-d-cc/reap를 안내한다. 설치 뒤 reap setup으로 플러그인을 넣고 새 세션에서 /reap:migrate를 부른다. 원본 데이터는 .reap-v0_17/에 그대로 보존된다.",
    goodToKnowTitle: "알아둘 것",
    goodToKnow: [
      "설치는 npm i -g @c-d-cc/reap 하나다. 플러그인은 reap setup이 대신 설치한다. 0.17 이하는 자동으로 올라오지 않고 안내만 받는다",
      "기본은 en이다. .reap/config.yml에 config.language: ko를 두면 CLI 출력이 한국어가 된다",
    ],
  },
};

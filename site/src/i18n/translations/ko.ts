export interface Translations {
  nav: {
    getStarted: string;
    groups: {
      gettingStarted: string;
      reference: string;
      other: string;
    };
    items: {
      introduction: string;
      v018change: string;
      install: string;
      quickStart: string;
      concepts: string;
      skills: string;
      cli: string;
      hooks: string;
      codeIndex: string;
      orchestrate: string;
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
    flowTitle: string;
    flowDesc: string;
    flowSteps: string[];
    flowHeaders: string[];
    flowRows: [string, string, string][];
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
    changedTitle: string;
    changedIntro: string;
    changedItems: string[];
    conceptsLinkText: string;
    principlesTitle: string;
    principles: { title: string; desc: string }[];
    principlesNote: string;
    principlesLinkText: string;
    principlesLinkHref: string;
    principlesNoteAfter: string;
    nextText: string;
    installLinkText: string;
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

  install: {
    title: string;
    breadcrumb: string;
    description: string;
    cliTitle: string;
    cliCode: string;
    cliNote: string;
    pluginTitle: string;
    pluginCode: string;
    verifyTitle: string;
    verifyCode: string;
    verifyNote: string;
    uninstallTitle: string;
    uninstallCode: string;
    removeProjectNote: string;
    removeProjectCode: string;
    fromV017Title: string;
    fromV017Desc: string;
    migrationLinkText: string;
    nextText: string;
    quickStartLinkText: string;
  };

  quickstart: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    steps: { title: string; command: string; desc: string }[];
    statusLineTitle: string;
    statusLineDesc1: string;
    statusLineDesc2: string;
    statusLineExample: string;
    statusLineNote: string;
    conceptsLinkText: string;
    statusLineNoteAfter: string;
  };

  concepts: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    layersTitle: string;
    layersHeaders: string[];
    layers: [string, string, string][];
    layersNote: string;
    unitsTitle: string;
    units: { name: string; desc: string }[];
    splitHeaders: string[];
    splitRows: [string, string, string][];
    splitNote: string;
    storageTitle: string;
    storageTree: string;
    storageNote: string;
    topLevelItems: { name: string; desc: string }[];
    statusLineTitle: string;
    statusLineDesc1: string;
    statusLineDesc2: string;
    backLinkPrefix: string;
    backLinkText: string;
  };

  skills: {
    title: string;
    breadcrumb: string;
    description: string;
    intro: string;
    tableHeaders: string[];
    table: [string, string][];
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
    idTitle: string;
    idDesc: string;
    claimTitle: string;
    claimCode: string;
    claimDesc: string;
    barrierTitle: string;
    barrierCode: string;
    barrierDesc: string;
    rosterTitle: string;
    rosterCode: string;
    rosterDesc: string;
    kindTitle: string;
    kindHeaders: string[];
    kinds: [string, string][];
    coordinatorNote: string;
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
      reference: "레퍼런스",
      other: "기타",
    },
    items: {
      introduction: "소개",
      v018change: "v0.18에서 바뀐 것",
      install: "설치",
      quickStart: "첫 사용",
      concepts: "개념",
      skills: "skill 10종",
      cli: "CLI 레퍼런스",
      hooks: "hooks",
      codeIndex: "코드 인덱스",
      orchestrate: "orchestrate",
      migration: "v0.17에서 이주",
      releaseNotes: "릴리스 노트",
    },
  },

  hero: {
    tagline: "Recursive Evolutionary Autonomous Pipeline",
    title: "REAP",
    description: "AI와 사람이 협업하여 loop, milestone, generation으로 이어지는 작업 흐름을 통해 소프트웨어를 진화시키는 규약과 도구입니다. 세션 간 컨텍스트가 유지되고, 개발은 Claude Code plugin의 skill을 따르며, 설계 문서가 코드와 함께 진화합니다.",
    getStarted: "시작하기 →",
    breakingBand: {
      text: "v0.18.0은 이전 버전과 호환되지 않습니다. 저장 구조, 명령, 플러그인이 모두 바뀌었습니다.",
      changeLinkText: "무엇이 바뀌었나 →",
      migrationLinkText: "v0.17에서 이주 →",
    },
    whyReap: "왜 REAP인가?",
    whyReapDesc: "AI 에이전트는 강력하지만, 구조 없이는 개발이 혼란스러워집니다. 매 세션마다 컨텍스트가 초기화됩니다. 코드 변경이 목적 없이 흩어집니다. 설계 문서가 현실에서 벗어납니다. 과거 작업에서 얻은 교훈이 사라집니다.",
    problems: [
      { problem: "컨텍스트 손실", solution: "SessionStart 훅이 세션마다 genome, environment 요약, 상태 줄을 자동으로 주입합니다" },
      { problem: "산발적 개발", solution: "milestone과 generation이 경계를 가진 작업 단위로 나뉘어 하나의 목표에 집중합니다" },
      { problem: "설계-코드 괴리", solution: "plan source에 쓴 기획과 구현 사이의 간극은 backlog로 기록되고 다음 generation에서 반영됩니다" },
      { problem: "잊혀진 교훈", solution: "lessons.md에 교훈이 쌓이고, 참고 가치가 다한 세대는 archive에 보존됩니다" },
      { problem: "협업 혼란", solution: "orchestrate skill이 claim과 barrier로 여러 세션의 작업을 조율합니다" },
    ],
    structureTitle: "구조",
    structureDesc: "REAP가 하는 일은 .reap/ 아래 네 자리에 담깁니다.",
    structureItems: [
      { label: "genome, environment", sub: ".reap/genome/ + .reap/environment/", desc: "genome은 규범(제품 정체성, AI 행동 규칙, 절대 제약), environment는 서술(기술 스택, 소스 구조)입니다. 모든 작업의 기반입니다." },
      { label: "vision", sub: ".reap/vision/", desc: "하려는 것입니다. 기억(memory/)과 loop에서 잘라낸 실행 단위(milestones/)가 여기 쌓입니다." },
      { label: "life", sub: ".reap/life/", desc: "지금 살아 있는 것입니다. generations/, backlog/, loops/가 여기 있습니다." },
      { label: "archive", sub: ".reap/archive/", desc: "더는 참고하지 않는 것입니다. milestone이 닫힐 때 cleanup skill이 여기로 내립니다." },
    ],
    flowTitle: "작업 흐름",
    flowDesc: "새 의도를 만드는 일에서 세대를 닫는 일까지, 네 단위가 이어집니다.",
    flowSteps: ["loop", "→", "milestone", "→", "generation", "→", "complete"],
    flowHeaders: ["단위", "무엇을 하는가", "관련 skill"],
    flowRows: [
      ["loop", "새 의도를 만듭니다. 기획, 설계, 화면, 아직 자리 없는 아이디어를 다룹니다.", "loop"],
      ["milestone", "loop에서 실행 가능한 단위로 자릅니다. 경계와 종료 조건을 정합니다.", "carve-milestone"],
      ["generation", "milestone을 실현하거나(exec) 이미 있는 의도로 되돌립니다(fix). 실제로 코드를 진화시킵니다.", "evolve"],
      ["complete", "커밋 규칙을 확인하고 기록을 정리해 세대를 닫습니다.", "complete"],
    ],
    installation: "설치",
    installStep1: "1. CLI 전역 설치",
    installStep2: "2. Claude Code를 열어 초기화하고 첫 세대를 엽니다",
    installNote: "설치 상세와 Claude Code 플러그인은",
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
      { href: "/docs/introduction", title: "소개", desc: "REAP란 무엇인가, 무엇이 달라졌나, 일곱 원칙." },
      { href: "/docs/v018change", title: "v0.18에서 바뀐 것", desc: "v0.17 대응표, 사라진 것, 그대로인 것." },
      { href: "/docs/install", title: "설치", desc: "CLI와 Claude Code 플러그인을 따로 설치합니다." },
      { href: "/docs/quick-start", title: "첫 사용", desc: "init, evolve, complete 세 skill로 시작합니다." },
      { href: "/docs/concepts", title: "개념", desc: "세 개의 층, 작업 단위, 3단 저장소, 상태 줄." },
      { href: "/docs/skills", title: "skill 10종", desc: "agent가 REAP를 다루는 통로. 언제, 무엇을, 부르지 않는 경우를 정리합니다." },
      { href: "/docs/cli", title: "CLI 레퍼런스", desc: "reap 명령 전체. make, mark, doctor, index, orch, ctx를 다룹니다." },
      { href: "/docs/hooks", title: "hooks", desc: "여섯 이벤트에 거는 .md, .sh 훅과 조건, 순서." },
      { href: "/docs/code-index", title: "코드 인덱스", desc: "커밋 단위로 갱신되는 코드 인덱스. 15개 언어." },
      { href: "/docs/orchestrate", title: "orchestrate", desc: "두 세션 이상이 동시에 작업할 때 쓰는 claim과 barrier." },
      { href: "/docs/migration", title: "v0.17에서 이주", desc: "8단계로 이주합니다. 원본은 .reap-v0_17/에 그대로 보존됩니다." },
      { href: "/docs/release-notes", title: "릴리스 노트", desc: "v0.18.0에서 무엇이 바뀌고 무엇이 사라졌는가." },
    ],
  },

  intro: {
    title: "소개",
    breadcrumb: "시작하기",
    description: "REAP는 AI와 사람이 소프트웨어를 함께 진화시키기 위한 규약과 도구의 집합이다. 작업의 모양을 결정하지 않고, 작업이 쓸 수 있는 도구와 저장 규약을 제공한다.",
    whatBuilds: "만드는 것은 둘이다. TypeScript·Bun으로 만든 CLI 바이너리 reap와, skill과 SessionStart 훅을 담은 Claude Code 플러그인이다. 둘은 따로 설치되고 따로 갱신된다 — 한쪽만 있는 상태를 정상으로 전제한다.",
    changedTitle: "무엇이 달라졌나",
    changedIntro: "전작은 5단계 lifecycle을 강제하는 파이프라인 실행기였다. 그 경직성을 유지하려고 스크립트와 서명 잠금을 계속 늘려야 했다. REAP는 그 반대로 간다.",
    changedItems: [
      "흐름은 CLI가 아니라 skill이 판단한다. 통과·차단하는 게이트가 없다",
      "작업 단위가 하나(generation)에서 셋(loop·milestone·generation)으로 나뉜다 — 기획과 실행이 서로 다른 사이클로 돈다",
      "사람의 평가는 매 세대가 아니라 milestone이 끝날 때 받는다",
      "기획 산출물은 REAP 소유물이 아니라 리포 안팎 어디든 있을 수 있는 등록된 plan source다",
    ],
    conceptsLinkText: "무엇이 바뀌었는지 더 자세히는 개념에서 다룬다.",
    principlesTitle: "일곱 원칙",
    principles: [
      { title: "REAP는 흐름을 제어하지 않는다", desc: "세대 내부의 순서도, 언제 열고 닫을지도 skill이 기술하고 agent가 판단한다" },
      { title: "확률에 의존하면 안 되는 것만 스크립트가 소유한다", desc: "id 발급, frontmatter, 세션 바인딩, 원자적 선점. 나머지는 판단이다" },
      { title: "커밋 없이 generation을 닫지 않는다", desc: "게이트가 아니라 agent가 직접 확인하는 규칙이다" },
      { title: "공유 맥락은 milestone에 쌓인다", desc: "generation은 맥락을 소비하고 갱신하되 소유하지 않는다" },
      { title: "도구는 흐름을 막는 대신 사후에 검증한다", desc: "reap doctor가 확정적으로 검사 가능한 것을 보고만 한다" },
      { title: "검증할 수 없는 것을 검증한 척하지 않는다", desc: "못 하는 검사를 하는 척하는 것이 조용히 통과시키는 것보다 나쁘다" },
      { title: "사람이 적합도를 판정한다", desc: "정량 지표는 없다. milestone이 끝날 때 사람의 자연어 피드백이 유일한 신호다" },
    ],
    principlesNote: "원칙의 근거와 전작과의 대조표는 REAP의 plan source인",
    principlesLinkText: "01-concepts.md",
    principlesLinkHref: "https://github.com/c-d-cc/reap/blob/main/docs/superpowers/specs/reap/01-concepts.md",
    principlesNoteAfter: "에 있다.",
    nextText: "시작하려면",
    installLinkText: "설치로.",
  },

  v018change: {
    title: "v0.18에서 바뀐 것",
    breadcrumb: "시작하기",
    description: "v0.18에서 무엇이 바뀌었는지 — v0.17 대응표, 사라진 것, 그대로인 것.",
    intro: "REAP는 5단계 lifecycle을 강제하는 파이프라인 실행기에서, agent가 판단을 위해 부르는 규약과 도구의 집합으로 다시 만들어졌다. 흐름을 스크립트가 정하지 않고, skill이 상황을 읽어 판단한다.",
    tableTitle: "v0.17 → v0.18 대응",
    tableHeaders: ["v0.17", "v0.18"],
    table: [
      ["5단계 lifecycle", "evolve·complete 판단"],
      ["/reap.* 19종", "/reap: skill 10종"],
      [".reap/ 단일 상태·lineage", "3단 저장소 vision·life·archive"],
      ["current.yml", "세션 바인딩"],
      ["memory 3단", "lessons·idea"],
      ["goals.md", "plan source"],
      ["hooks 14이벤트", "6이벤트"],
      ["슬래시 커맨드 설치", "플러그인"],
      ["npm latest", "next 태그"],
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
    sameDesc: "genome 3종(application·evolution·invariants)·environment/·backlog·코드 인덱스·hooks 자리는 이번에도 그대로다.",
    migrateNote: "v0.17에서 실제로 옮기려면",
    migrateLinkText: "이주 가이드 →",
  },

  install: {
    title: "설치",
    breadcrumb: "시작하기",
    description: "REAP는 두 가지를 따로 설치한다 — CLI 바이너리와 Claude Code 플러그인. 둘 중 하나만 있어도 정상 상태다.",
    cliTitle: "CLI",
    cliCode: "npm i -g @c-d-cc/reap@next",
    cliNote: "npm next 태그로 나간다. latest가 아니므로 @next를 붙여야 한다.",
    pluginTitle: "Claude Code 플러그인",
    pluginCode: `claude plugin marketplace add c-d-cc/plugins
claude plugin install reap@ctod-plugins`,
    verifyTitle: "확인",
    verifyCode: "reap --version",
    verifyNote: "새 Claude Code 세션을 열면 /reap: skill 10종이 보이고, 세션 시작 시 상태 줄이 뜬다. 둘 다 안 보이면 플러그인 설치가 안 된 것이다.",
    uninstallTitle: "제거",
    uninstallCode: `claude plugin uninstall reap@ctod-plugins
npm rm -g @c-d-cc/reap`,
    removeProjectNote: "프로젝트에서 REAP를 걷어내려면:",
    removeProjectCode: "rm -rf .reap",
    fromV017Title: "v0.17에서 왔다면",
    fromV017Desc: "v0.17.7 이하는 세션 시작 시 자동 갱신으로 0.17.8이 된다. 0.17.8에서 reap update를 치면 upgrade agent가 설치되고, 그 agent가 v0.18 CLI와 플러그인을 설치한 뒤 /reap:migrate로 넘긴다. migrate skill이 데이터를 옮기고, 원본은 .reap-v0_17/에 그대로 보존한다 — 되돌릴 수 있다. 전체 단계는",
    migrationLinkText: "이주 가이드",
    nextText: "다음은",
    quickStartLinkText: "첫 사용으로.",
  },

  quickstart: {
    title: "첫 사용",
    breadcrumb: "시작하기",
    description: "프로젝트에서 세 skill만 있으면 REAP를 쓸 수 있다.",
    intro: "프로젝트에서 (신규 폴더든 기존 코드베이스든) 세 skill만 있으면 된다.",
    steps: [
      {
        title: "처음 한 번",
        command: "/reap:init",
        desc: "정본 지식을 세운다 — plan source 등록, .reap/environment/summary.md, .reap/genome/. 프로젝트당 딱 한 번이다. 이 skill만 상태 줄이 안내하지 못한다 — .reap/가 없으면 SessionStart 훅이 침묵하므로 사람이 직접 불러야 한다.",
      },
      {
        title: "세대를 연다",
        command: "/reap:evolve",
        desc: "새 의도를 만드는 일인지(loop), 만들어둔 의도를 실현하는 일인지(exec generation), 이미 있는 의도로 되돌리는 일인지(fix generation)를 판단하고 연다. 그다음은 자율 구간이다 — 탐색하고 짜고 고친다. 순서도 횟수도 REAP가 정하지 않는다.",
      },
      {
        title: "세대를 닫는다",
        command: "/reap:complete",
        desc: "커밋 규칙(git status --porcelain이 비어 있고, 시작 커밋 이후 새 커밋이 있는가)을 확인하고, 기록과 handoff.md를 정리한 뒤 세대를 닫는다.",
      },
    ],
    statusLineTitle: "상태 줄이 지도다",
    statusLineDesc1: "세션이 열릴 때마다 SessionStart 훅이 reap ctx를 불러 맥락을 주입한다. genome 본문과 environment 요약, 그리고 상태 줄 — 지금 무엇이 열려 있고 무엇을 더 읽어야 하는지 경로로 가리키는 한 뭉치다.",
    statusLineDesc2: "아래는 빈 프로젝트에서 reap init 뒤 reap make loop·reap make milestone --focus·reap make generation을 차례로 거친 뒤 실제로 찍은 reap ctx 출력이다 (genome·environment 본문은 초기 씨앗 그대로다 — 채워 넣는 절차는 /reap:init이 한다):",
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
    statusLineNote: "milestone.md도 handoff.md도 본문이 이 안에 실려 있지 않다 — 상태 줄은 경로와 이름만 알리고, 그 경로를 열지 말지는 agent가 판단한다. 이 판단 순서와 저장 구조 전체는",
    conceptsLinkText: "개념",
    statusLineNoteAfter: "에서 다룬다.",
  },

  concepts: {
    title: "개념",
    breadcrumb: "시작하기",
    description: "REAP가 하는 일 전부를 요약한다 — 세 개의 층, 작업 단위, 3단 저장소, 상태 줄.",
    intro: "REAP가 하는 일 전부는 이 문서 하나로 요약된다. 근거와 전문은 REAP의 plan source(docs/superpowers/specs/reap/)에 있다 — 여기는 그것을 옮겨 적지 않고, 실제로 REAP를 쓸 때 무엇을 어디서 찾는지만 정리한다.",
    layersTitle: "세 개의 층",
    layersHeaders: ["층", "누가", "무엇을"],
    layers: [
      ["판단", "skill을 읽는 agent", "무엇을 할지, 언제 할지, 됐는지"],
      ["확정", "reap CLI", "확률에 맡길 수 없는 사실을 못 박는다 — id 발급, frontmatter, 원자적 선점"],
      ["사실", "git, 파일시스템", "실제로 무슨 일이 있었는가 — 커밋 유무, 작업 트리 상태"],
    ],
    layersNote: "agent는 판단하고, CLI에게 확정을 요청하고, 사실은 git에게 직접 묻는다. CLI가 사실을 감싸지 않는 이유는 agent가 이미 git status를 쓸 수 있기 때문이다.",
    unitsTitle: "작업 단위 — loop·milestone·generation",
    units: [
      { name: "loop", desc: "새 의도를 만든다. 유형은 plan·design·uiux·idea 넷. 여러 세션에 걸치는 것이 정상이고, 여럿이 나란히 열릴 수 있다. 산출물이 자리를 찾으면(milestone을 낳거나, plan source에 쓰거나) 닫힌다" },
      { name: "milestone", desc: "loop에서 잘라낸 실행 가능한 단위. 경계와 종료 조건을 가지며, 공유 context가 쌓이는 자리이자 사람의 fitness 평가를 받는 단위다" },
      { name: "generation", desc: "소스코드를 진화시키는 작업 사이클. 세션에 바인딩되고 하나만 열린다" },
    ],
    splitHeaders: ["유형", "무엇을", "milestone 소속"],
    splitRows: [
      ["exec", "새 의도를 실현한다", "반드시 소속 — 근거는 milestone 또는 backlog 항목"],
      ["fix", "이미 있는 의도로 되돌린다 (버그, 깨진 빌드, 낡은 의존성)", "무소속"],
    ],
    splitNote: "fix가 milestone을 갖지 않는 이유는 작아서가 아니다. milestone은 새 의도에 경계를 주는 장치인데, 되돌리는 일은 새 의도를 만들지 않는다 — 되돌아갈 곳 자체가 이미 경계다. 크기는 축을 가르는 기준이 아니다: 작은 새 기능도 fix가 아니라 exec이다.",
    storageTitle: "3단 저장소",
    storageTree: `vision/    하려는 것 — 기억(memory/), 잘라낸 실행 단위(milestones/)
life/      지금 살아 있는 것 — generations/, backlog/, loops/
archive/   더는 참고하지 않는 것`,
    storageNote: "life/는 \"열려 있는 것\"이 아니라 \"아직 참고할 값이 있는 것\"이 쌓이는 곳이다. 닫힌 generation도 참고할 값이 남아 있으면 거기 있다 — 닫힘은 상태이고 archive는 위치이며, 둘은 다른 질문에 답한다. milestone이 닫힐 때 cleanup skill이 life/generations/를 훑어 참고 가치가 다한 것을 archive/로 내린다. 이 3단과 나란히, 시간축에 얹히지 않는 넷이 최상위에 선다.",
    topLevelItems: [
      { name: "plan/", desc: "리포 밖일 수 있는 plan source의 등록부(sources.yml)와 그것을 읽고 쓰는 법(conventions/)" },
      { name: "genome/", desc: "application.md(제품 정체성) · evolution.md(AI 행동 규칙) · invariants.md(절대 제약, 사람만 수정)" },
      { name: "environment/", desc: "현재 기술 스택, 소스 구조, 빌드·테스트 방법" },
      { name: "idea/", desc: "아직 단단하지 않은 지식 — research/(결론 없는 조사) · freememo/(자유 메모) · files/(외부 참고자료)" },
    ],
    statusLineTitle: "상태 줄이 지도다",
    statusLineDesc1: "세션이 열릴 때 매번 실리는 것은 genome/과 environment/summary.md의 본문, 그리고 상태 줄뿐이다. milestone.md도 handoff.md도 세대 기록 본문도 그 안에 실리지 않는다 — 상태 줄은 열린 milestone·generation·loop의 경로와 이름만 알리고, 그것을 열지 말지는 agent가 그때그때 판단한다.",
    statusLineDesc2: "전체 배치를 이름만으로는 읽을 수 없다. 그래서 각 프로젝트는 .reap/map.md를 갖는다 — 이 디렉토리가 무엇을 어디에 두는지 설명하는 지도다. init이 한 번 놓고, 매 세션 주입되지는 않는다. 상태 줄이 구조: .reap/map.md로 자리만 알리면, 필요한 agent가 그때 연다.",
    backLinkPrefix: "찍은 상태 줄 예시는",
    backLinkText: "첫 사용",
  },

  skills: {
    title: "skill 10종",
    breadcrumb: "레퍼런스",
    description: "agent가 REAP를 다루는 통로. 플러그인이 배포하는 skill 열 종.",
    intro: "agent가 REAP를 다루는 통로는 skill이다. 플러그인이 배포한다. 각 skill의 전문은 plugin/skills/<이름>/SKILL.md에 있다. 아래는 언제·무엇을·부르지 않는 경우만 요약한다.",
    tableHeaders: ["skill", "언제"],
    table: [
      ["init", "프로젝트당 한 번, 맨 처음 — 정본 지식을 세운다"],
      ["evolve", "세대를 열 때 — loop·exec·fix 중 무엇인지 정한다"],
      ["complete", "세대를 닫을 때"],
      ["loop", "새 의도를 만들 때 — 기획·설계·화면·아직 자리 없는 것"],
      ["carve-milestone", "plan을 실행 가능한 milestone으로 자를 때, 그리고 milestone을 닫을 때"],
      ["interview", "의도가 모호해 사람이 결정해야 할 때"],
      ["orchestrate", "두 세션 이상이 같은 프로젝트에서 동시에 작업할 때"],
      ["cleanup", "사람이 fitness로 milestone을 닫기로 한 직후"],
      ["migrate", "v0.17 데이터를 v0.18 구조로 옮길 때"],
      ["report-issue", "REAP 자체의 결함이나 빠진 기능을 만났을 때"],
    ],
    tableNote: "",
    whenLabel: "언제 —",
    whatLabel: "무엇을 —",
    notCalledLabel: "부르지 않는 경우 —",
    skillList: [
      {
        name: "init",
        when: "프로젝트당 딱 한 번, 맨 처음. .reap/가 없거나 있어도 씨앗 그대로일 때. 상태 줄이 안내하지 못하는 유일한 skill이라 사람이 직접 부른다.",
        what: "reap init 뒤 plan source를 등록하고 environment/summary.md·genome/application.md·evolution.md를 채운 뒤 첫 milestone을 carve-milestone에 넘긴다.",
        notCalled: ".reap/가 있고 씨앗이 이미 채워져 있으면 이 skill의 일이 아니다.",
      },
      {
        name: "evolve",
        when: "세대를 열 때, 새 작업을 시작할 때.",
        what: "상태 줄과 handoff.md·milestone.md·task를 읽고 새 의도를 만드는 일(loop)인지 실현·되돌리는 일(generation)인지 정한 뒤 연다.",
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
        what: "loop를 열거나 이어 plan source에 쓰고 Dialogue를 기록하며, 자를 것이 정해지면 carve-milestone으로 넘겨 milestone을 낳고 닫는다.",
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
        when: "프로젝트가 v0.17 시대 REAP 데이터(구 5단계 파이프라인 레이아웃)를 갖고 있을 때, 또는 upgrade agent가 설치 뒤 넘겨줄 때.",
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
  ctx [--milestone <ms-id>] [--hook]`,
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
      ["plan", "등록된 plan source 목록(sources)과 그 규약(convention <ps-id>)을 보여준다. plan source 자체는 리포 안팎 어디든 있을 수 있는 등록부다."],
      ["ctx", "세션이 열릴 때 SessionStart 훅이 부르는 것과 같은 명령이다. genome·environment 요약과 상태 줄을 낸다. --milestone으로 다른 milestone 기준으로, --hook으로 훅이 부르는 형식 그대로 낼 수 있다."],
    ],
    indexLinkText: "코드 인덱스",
    orchLinkText: "orchestrate",
  },

  hooks: {
    title: "hooks",
    breadcrumb: "레퍼런스",
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
    title: "코드 인덱스",
    breadcrumb: "레퍼런스",
    description: "커밋 단위로 갱신되는 코드 인덱스. 15개 언어, 설치할 것 없음.",
    intro: "reap index는 커밋 단위로 자동 갱신되는 코드 인덱스를 질의한다. 상주 프로세스도 백그라운드 감시자도 없다 — 질의가 스스로 HEAD와 인덱스를 비교해 필요하면 먼저 올린 뒤 답한다.",
    subcommandsTitle: "하위 명령",
    subcommandsCode: `reap index update [--full]    # 인덱스를 HEAD와 맞춘다 (기본, 인자 없이 index만 쳐도 이것)
reap index status             # 개수, import 해석률, 인덱싱된 커밋
reap index impact <file>...   # 이 파일을 바꾸면 어디까지 닿는가
reap index search <query>     # 정의를 찾는다. file:line과 함께
reap index callers <symbolId> # 누가 이것을 부르는가
reap index callees <symbolId> # 이것이 무엇을 부르는가`,
    commitNote: "git diff 하나로 무엇을 다시 파싱할지 정해지므로, 커밋 안 된 작업은 인덱스에 없다. 방금 쓰고 커밋 안 한 심볼은 search가 못 찾고 새 파일은 impact에 안 나온다.",
    whenTitle: "언제 index고 언제 grep인가",
    indexWhenTitle: "index",
    indexWhenDesc: "정의가 어디 있는지(search), 이 파일을 바꾸면 무엇이 영향받는지(impact), 누가 무엇을 부르는지(callers/callees)를 물을 때. 파서가 파싱한 심볼과 CALLS·IMPORTS 관계에서 답이 나온다.",
    grepWhenTitle: "grep",
    grepWhenDesc: "커밋 안 된 변경, 문자열 자체를 찾을 때(주석·문서·설정 파일), index가 커버하지 않는 언어의 세부(대부분 언어는 심볼·CALLS는 되지만 IMPORTS·impact는 JS/TS와 Python만 된다).",
    resolutionTitle: "해석률이 낮으면 빈 결과는 \"모름\"이다",
    resolutionDesc: "status가 내는 줄 중 가장 중요한 것은 import 해석률이다. impact가 아는 것은 전부 해석된 import edge에서 오므로, 해석률이 낮으면 impact의 빈 결과는 \"영향 없음\"이 아니라 \"모름\"이다. 인덱싱이 돌았는지가 아니라 무엇을 아는지를 status로 먼저 확인한다.",
    callResolutionNote: "호출 해석은 이름 기반 휴리스틱이다 — 타입 해석 없이 이름과 위치로 동명이인을 고르므로 오버로드와 동적 디스패치에서는 틀릴 수 있다.",
    noInstallTitle: "설치 없이 돈다",
    noInstallDesc: "파서는 바이너리에 실려 있다. 15개 언어(TS·TSX·JS·Python·Go·Rust·Java·Kotlin·C#·C·C++·Ruby·PHP·Swift·Dart)를 지원하고, git 저장소가 아니면 인덱싱하지 않는다 — 서술할 수 없는 것을 인덱싱하는 대신 그렇게 말한다. 인덱스는 '.reap/.index/'에 살고 init이 gitignore에 넣는다.",
  },

  orchestrate: {
    title: "orchestrate",
    breadcrumb: "레퍼런스",
    description: "두 세션 이상이 동시에 작업할 때 — claim과 barrier.",
    intro: "두 세션 이상이 같은 REAP 프로젝트에서 동시에 작업할 때 쓴다. REAP가 주는 것은 만남의 장소뿐이다 — 자원 선점(claim)과 종료 대기(barrier). 메시지 전달 자체는 Claude Code의 SendMessage/ListAgents가 하고 REAP는 그 위에 mailbox를 만들지 않는다.",
    aloneNote: "혼자 일할 때는 이 skill이 없는 것과 같다. 상태 줄에도 doctor에도 아무것도 안 나온다.",
    worktreeTitle: "worktree로 가른다",
    worktreeCode: "claude -n reap-<topic>-<role> -w <worktree>      # 예: reap-auth-writer, reap-auth-tester",
    worktreeDesc: "세션 이름이 곧 주소이고, <topic>이 공유 상태의 방(~/.reap/orch/<workspace-id>/<topic>/)을 정한다. workspace-id는 같은 리포의 worktree 간에 수렴한다.",
    sameDirNote: "같은 디렉토리에서 세션 둘은 안 된다. '.reap/.session'(세대 바인딩)이 파일 하나라 나중 세션이 앞의 바인딩을 덮는다. worktree마다 '.reap/'가 별개이므로 worktree로 가르면 이 문제가 사라진다.",
    idTitle: "id는 조율자가 발급한다",
    idDesc: "worktree마다 '.reap/'가 사본이라, 두 worktree에서 각각 make generation을 부르면 같은 번호가 두 번 나올 수 있다. 그래서 id 발급은 주 트리의 조율자가 한다 — 조율자가 세대를 열어 커밋한 뒤 worktree를 만들고, worktree의 세션은 reap bind <gen-id>로 그 세대에 묶이기만 한다.",
    claimTitle: "claim — 손대기 전에 잡는다",
    claimCode: `reap orch claim <resource> [--ttl 30m] [--topic <t>]
reap orch release <resource>`,
    claimDesc: "resource는 자유 문자열이다 — milestone 갈래는 id(ms-004), 파일 영역은 경로 glob(src/auth/**)이 기본 관례다. TTL은 세션이 죽었을 때를 위한 것으로, 만료되면 다른 세션이 가져갈 수 있고 탈취는 로그에 남는다. 거부당하면 holder에게 메시지로 묻거나 기다린다.",
    barrierTitle: "barrier — 합쳐야 하는 곳에 둔다",
    barrierCode: "reap orch barrier <name> --expect <N> --timeout <초>",
    barrierDesc: "--timeout은 필수다. 만료되면 누가 오지 않았는지를 낸다. 테스트 전, 통합 커밋 전, milestone 닫기 전처럼 뒤 작업이 앞 작업 전부를 전제하는 지점에 둔다. 자주 두면 병렬이 직렬이 된다.",
    rosterTitle: "roster·status로 본다",
    rosterCode: `reap orch roster [--topic <t>]     # claude agents --json 에서 reap-<topic>-* 만
reap orch status [--topic <t>]     # claims · barriers`,
    rosterDesc: "roster는 claude agents --json에서 이름이 reap-<topic>-로 시작하는 세션만 추린다. 별도 참가 등록 절차는 없다 — 이름이 곧 참가이고, 세션이 죽으면 목록에서 저절로 사라진다.",
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

  migration: {
    title: "v0.17에서 이주",
    breadcrumb: "기타",
    description: "8단계 이주. 원본은 .reap-v0_17/에 그대로 보존된다.",
    intro: "v0.17.7 이하는 세션 시작 시 자동 갱신으로 먼저 0.17.8이 되고, 거기서부터 사람이 손대는 지점은 하나뿐이다.",
    updateCode: `reap update          # 0.17.8에서 — upgrade agent를 설치한다
/reap:migrate         # 넘겨받은 agent가 부른다`,
    handoffDesc: "upgrade agent가 v0.18 CLI와 플러그인을 설치한 뒤 migrate skill로 넘긴다. 그 뒤는 migrate skill이 여덟 단계로 진행한다 — 각 단계 시작마다 \"단계 N/8: <이름>\"이 사용자에게 보인다.",
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
      ["vision/goals.md·lineage/·3단 memory·current.yml", "plan source·lessons.md 선별·.session으로 대체. 승계되지 않는 것도 있다"],
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
      "두 산출물로 나뉜다 — npm CLI @c-d-cc/reap와 Claude Code 플러그인. 플러그인은 마켓플레이스를 통해 따로 설치되고 갱신된다",
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
    comingDesc: "v0.17.7 이하는 세션 시작 시 자동 갱신으로 0.17.8이 된다. reap update가 설치하는 upgrade agent가 v0.18 CLI와 플러그인을 설치한 뒤 /reap:migrate로 넘긴다. 원본 데이터는 .reap-v0_17/에 그대로 보존된다.",
    goodToKnowTitle: "알아둘 것",
    goodToKnow: [
      "npm next 태그로 나간다 — latest가 아니라서 기존 사용자에게 자동으로 가지 않는다. 새로 설치하려면 npm i -g @c-d-cc/reap@next",
      "기본은 en이다. .reap/config.yml에 config.language: ko를 두면 CLI 출력이 한국어가 된다",
    ],
  },
};

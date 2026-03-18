import type { Translations } from "./en";

export const ko: Translations = {
  // Nav & Sidebar
  nav: {
    getStarted: "시작하기",
    groups: {
      gettingStarted: "시작하기",
      guide: "가이드",
      reference: "레퍼런스",
      other: "기타",
    },
    items: {
      introduction: "소개",
      quickStart: "빠른 시작",
      coreConcepts: "핵심 개념",
      workflow: "워크플로우",
      advanced: "고급",
      cliReference: "CLI 레퍼런스",
      commandReference: "커맨드 레퍼런스",
      hookReference: "Hook 레퍼런스",
      comparison: "비교",
      configuration: "설정",
    },
  },

  // Hero Page
  hero: {
    tagline: "Recursive Evolutionary Autonomous Pipeline",
    title: "REAP",
    description: "AI와 사람이 함께 Generation을 반복하며 애플리케이션을 진화시키는 개발 파이프라인. 세션 간 컨텍스트를 유지하고, 구조화된 라이프사이클로 개발하며, 설계 문서가 코드와 함께 진화합니다.",
    getStarted: "시작하기 →",
    whyReap: "왜 REAP인가?",
    whyReapDesc: "AI 에이전트는 강력하지만, 구조 없이는 개발이 혼란스러워집니다. 세션마다 컨텍스트가 초기화되고, 코드 변경이 목적 없이 흩어지며, 설계 문서는 현실과 괴리되고, 과거 작업의 교훈은 사라집니다.",
    problems: [
      { problem: "컨텍스트 손실", solution: "SessionStart Hook이 매 세션마다 전체 프로젝트 컨텍스트를 자동 주입" },
      { problem: "산발적 개발", solution: "각 Generation이 구조화된 라이프사이클을 통해 하나의 목표에 집중" },
      { problem: "설계-코드 괴리", solution: "구현 중 발견된 Genome 변이가 backlog를 통해 피드백" },
      { problem: "잊혀진 교훈", solution: "회고가 Genome에 축적. Lineage가 모든 Generation을 보관" },
    ],
    threeLayer: "3-Layer 모델",
    threeLayerDesc: "모든 REAP 프로젝트는 세 개의 개념적 레이어로 구성됩니다. Genome은 무엇을 만들지 정의하고, Evolution 프로세스가 이를 만들며, Civilization이 그 결과물입니다.",
    layers: [
      { label: "Genome", sub: "설계 & 지식", path: ".reap/genome/", desc: "아키텍처 원칙, 비즈니스 규칙, 컨벤션, 기술 제약. Generation 진행 중에는 수정하지 않음." },
      { label: "Evolution", sub: "세대별 프로세스", path: ".reap/life/ → .reap/lineage/", desc: "각 Generation은 Objective → Planning → Implementation → Validation → Completion을 수행. 완료 시 lineage로 보관." },
      { label: "Civilization", sub: "소스 코드", path: "your codebase/", desc: ".reap/ 외부의 모든 것. 각 Generation이 완료될 때마다 성장하고 개선됨." },
    ],
    lifecycle: "Generation 라이프사이클",
    lifecycleDesc: "각 Generation은 목표 정의부터 회고 및 보관까지 다섯 단계를 거칩니다.",
    stages: [
      ["Objective", "목표, 요구사항 및 완료 기준 정의", "01-objective.md"],
      ["Planning", "태스크 분해, 접근 방식 선택, 의존성 매핑", "02-planning.md"],
      ["Implementation", "AI + 사람 협업으로 구현", "03-implementation.md"],
      ["Validation", "테스트 실행, 완료 기준 검증", "04-validation.md"],
      ["Completion", "회고 + Genome 변경 적용 + Generation 보관", "05-completion.md"],
    ],
    stageHeaders: ["단계", "수행 내용", "산출물"],
    installation: "설치",
    installStep1: "1. 전역 설치",
    installStep2: "2. 프로젝트 초기화",
    installStep3: "3. 첫 번째 Generation 실행 (Claude Code에서)",
    installNote: [
      { before: "", code: "/reap.evolve", after: "은 전체 Generation 라이프사이클(Objective부터 Completion까지)을 대화형으로 실행합니다. " },
      { linkText: "단계별 커맨드", after: "로 각 단계를 수동 제어할 수도 있습니다." },
    ],
    keyConcepts: "핵심 개념",
    concepts: [
      { label: "Genome Immutability", desc: "Generation 진행 중에는 Genome을 수정하지 않습니다. Implementation 중 발견된 설계 이슈는 backlog에 genome-change 항목으로 기록되어 Completion에서만 적용됩니다." },
      { label: "Backlog & Deferral", desc: ".reap/life/backlog/의 항목은 type: genome-change | environment-change | task를 가집니다. 부분 완료는 정상적인 상황이며, 미완료 태스크는 다음 Generation의 Objective로 넘어갑니다." },
      { label: "SessionStart Hook", desc: "매 새 AI 에이전트 세션은 자동으로 전체 Genome, 현재 Generation 상태, 워크플로우 규칙을 주입하여 세션 간 컨텍스트 손실을 제거합니다." },
      { label: "Lineage", desc: "완료된 Generation은 .reap/lineage/에 보관됩니다. 회고가 그곳에 축적됩니다. 시간이 지나면 압축됩니다 (Level 1 → gen-XXX.md, Level 2 → epoch-XXX.md)." },
      { label: "Four-Axis Structure", desc: ".reap/ 하위의 모든 것은 네 개의 축으로 매핑됩니다: Genome (설계), Environment (외부 컨텍스트), Life (현재 Generation), Lineage (과거 Generation 보관)." },
    ],
    documentation: "문서",
    docLinks: [
      { href: "/docs/introduction", title: "소개", desc: "REAP이란, 왜 사용하는지, 3-Layer 모델, Four-Axis 구조." },
      { href: "/docs/quick-start", title: "빠른 시작", desc: "설치하고 첫 번째 Generation을 단계별로 실행하기." },
      { href: "/docs/core-concepts", title: "핵심 개념", desc: "Genome, 라이프 사이클, Backlog & Deferral 심화." },
      { href: "/docs/workflow", title: "워크플로우", desc: "/reap.evolve, 단계별 커맨드, micro loop, hooks." },
      { href: "/docs/cli", title: "CLI 레퍼런스", desc: "reap init, status, update, fix의 모든 옵션." },
      { href: "/docs/commands", title: "커맨드 레퍼런스", desc: "/reap.evolve, 단계별 커맨드, /reap.status — 모든 슬래시 커맨드." },
      { href: "/docs/hooks", title: "Hook 레퍼런스", desc: "라이프사이클 hooks: command와 prompt 타입, events, SessionStart." },
      { href: "/docs/comparison", title: "비교", desc: "REAP과 기존 스펙 기반 개발 도구와의 비교." },
      { href: "/docs/advanced", title: "고급", desc: "Lineage 압축, 프리셋, entry 모드." },
    ],
  },

  // Introduction Page
  intro: {
    title: "소개",
    breadcrumb: "시작하기",
    description: "REAP (Recursive Evolutionary Autonomous Pipeline)은 AI와 사람이 협업하여 연속된 Generation을 통해 애플리케이션을 점진적으로 발전시키는 개발 파이프라인입니다. 각 AI 세션을 독립된 작업으로 취급하는 대신, REAP은 구조화된 라이프사이클과 Genome이라 불리는 살아있는 지식 베이스를 통해 연속성을 유지합니다.",
    threeLayer: "3-Layer 모델",
    layerItems: [
      { label: "Genome", sub: "설계 & 지식", path: ".reap/genome/" },
      { label: "Evolution", sub: "세대별 프로세스", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "소스 코드", path: "your codebase/" },
    ],
    layerDescs: [
      "애플리케이션 구축을 위한 설계와 지식. 아키텍처 원칙, 비즈니스 규칙, 컨벤션, 기술 제약. .reap/genome/에 저장.",
      "Generation을 반복하며 Genome을 진화시키고 Civilization을 성장시키는 프로세스.",
      "소스 코드. .reap/ 외부의 전체 프로젝트 코드베이스.",
    ],
    whyReap: "왜 REAP인가?",
    problemHeader: "문제",
    solutionHeader: "REAP 해결책",
    problems: [
      ["컨텍스트 손실 — 에이전트가 매 세션 프로젝트 컨텍스트를 잊음", "SessionStart Hook — 매 세션 전체 Genome + Generation 상태를 자동 주입"],
      ["산발적 개발 — 명확한 목표 없이 코드 수정", "Generation 모델 — 각 Generation이 구조화된 라이프사이클을 통해 하나의 목표에 집중"],
      ["설계-코드 괴리 — 문서가 코드와 달라짐", "Backlog를 통한 Genome 변이 — 구현 중 발견된 설계 결함이 기록되어 Completion에서 적용"],
      ["잊혀진 교훈 — 과거 작업의 인사이트가 사라짐", "Lineage & 회고 — 교훈이 Genome에 축적, Generation이 보관 및 압축"],
    ],
    fourAxis: "Four-Axis 구조",
    fourAxisDesc: "REAP은 .reap/ 하위의 모든 것을 네 개의 축으로 구성합니다:",
    axes: [
      { axis: "Genome", path: ".reap/genome/", desc: "유전 정보. 원칙, 규칙, 아키텍처 결정." },
      { axis: "Environment", path: ".reap/environment/", desc: "외부 컨텍스트. API 문서, 인프라, 비즈니스 제약." },
      { axis: "Life", path: ".reap/life/", desc: "현재 Generation의 라이프사이클. 진행 상태와 산출물." },
      { axis: "Lineage", path: ".reap/lineage/", desc: "완료된 Generation의 보관소." },
    ],
    projectStructure: "프로젝트 구조",
  },

  // Quick Start Page
  quickstart: {
    title: "빠른 시작",
    breadcrumb: "시작하기",
    prerequisites: "요구사항",
    prerequisiteItems: [
      { name: "Node.js", desc: "v18 이상", required: true },
      { name: "npm", desc: "Node.js에 포함", required: true },
      { name: "Claude Code 또는 OpenCode", desc: "AI 에이전트 CLI (하나 이상 필요)", required: true },
      { name: "Bun", desc: "대안 패키지 매니저", required: false },
    ],
    required: "필수",
    optional: "선택",
    install: "설치",
    initProject: "프로젝트 초기화",
    runFirst: "첫 번째 Generation 실행",
    runFirstDesc: "프로젝트 디렉토리에서 Claude Code를 실행하세요:",
    evolveTitle: "/reap.evolve가 주요 커맨드입니다",
    evolveDesc: "전체 Generation 라이프사이클(Objective, Planning, Implementation, Validation, Completion)을 대화형으로 실행합니다. AI 에이전트가 각 단계에서 질문하고, 사용자가 승인한 후 다음으로 진행합니다. 일상적인 개발에서 가장 많이 사용할 커맨드입니다.",
    manualControl: "수동 단계 제어",
    manualControlDesc: "각 단계를 개별적으로 제어할 수도 있습니다:",
    whatHappens: "Generation 중에 일어나는 일",
    stageHeaders: ["단계", "수행 내용", "산출물"],
    stages: [
      ["Objective", "목표, 요구사항 및 완료 기준 정의", "01-objective.md"],
      ["Planning", "태스크 분해, 접근 방식 선택, 의존성 매핑", "02-planning.md"],
      ["Implementation", "AI + 사람 협업으로 구현", "03-implementation.md"],
      ["Validation", "테스트 실행, 완료 기준 검증", "04-validation.md"],
      ["Completion", "회고 + Genome 변경 적용 + 보관", "05-completion.md"],
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "핵심 개념",
    breadcrumb: "개념",
    genomeTitle: "Genome",
    genomeDesc: "Genome은 애플리케이션의 유전 정보입니다 — 아키텍처 원칙, 비즈니스 규칙, 컨벤션, 기술 제약.",
    principles: "원칙",
    genomeImmutability: "Genome 불변 원칙",
    genomeImmutabilityDesc: "현재 Generation 진행 중에는 Genome을 직접 수정하지 않습니다. 이슈는 backlog에 기록되어 Completion 단계에서만 적용됩니다.",
    envImmutability: "Environment 불변 원칙",
    envImmutabilityDesc: "현재 Generation 진행 중에는 Environment를 직접 수정하지 않습니다. 외부 변경사항은 backlog에 기록되어 Completion 단계에서 적용됩니다.",
    lifecycle: "라이프 사이클",
    lifecycleDesc: "각 Generation은 다섯 단계를 따릅니다:",
    stageHeaders: ["단계", "수행 내용", "산출물"],
    stages: [
      ["Objective", "목표, 요구사항 및 완료 기준 정의", "01-objective.md"],
      ["Planning", "태스크 분해, 접근 방식 선택, 의존성 매핑", "02-planning.md"],
      ["Implementation", "AI + 사람 협업으로 구현", "03-implementation.md"],
      ["Validation", "테스트 실행, 완료 기준 검증", "04-validation.md"],
      ["Completion", "회고 + Genome 변경 적용 + 보관", "05-completion.md"],
    ],
    backlog: "Backlog & Deferral",
    backlogDesc: "모든 backlog 항목은 .reap/life/backlog/에 frontmatter가 포함된 마크다운 파일로 저장됩니다:",
    backlogHeaders: ["타입", "설명"],
    backlogTypes: [
      { type: "genome-change", desc: "Completion 단계에서 Genome에 적용." },
      { type: "environment-change", desc: "Completion 단계에서 Environment에 적용." },
      { type: "task", desc: "다음 Objective의 목표 후보." },
    ],
    statusField: "각 항목은 status 필드도 가집니다:",
    statusHeaders: ["상태", "설명"],
    statuses: [
      { type: "pending", desc: "미처리. 기본값 — 필드가 없으면 pending으로 간주." },
      { type: "consumed", desc: "현재 Generation에서 처리 완료. consumedBy: gen-XXX 필수." },
    ],
    archivingNote: "보관 시, consumed 항목은 lineage로 이동합니다. pending 항목은 다음 Generation의 backlog로 이월됩니다.",
    deferralNote: "부분 완료는 정상입니다 — Genome 변경에 의존하는 태스크는 [deferred]로 표시되어 다음 Generation으로 넘어갑니다.",
    evolutionFlow: "Evolution 흐름 예시",
  },

  // Workflow Page
  workflow: {
    title: "워크플로우",
    breadcrumb: "워크플로우",
    intro: "Generation은 REAP의 기본 작업 단위입니다. 각 Generation은 하나의 목표를 다섯 단계를 통해 수행하며, 그 과정에서 산출물을 생성합니다. 각 단계에서 무슨 일이 일어나고 어떻게 연결되는지 알아봅니다.",
    evolveTitle: "/reap.evolve — 주요 작업 방식",
    evolveDesc: "대부분의 경우 /reap.evolve를 실행하면 AI 에이전트가 모든 단계를 자율적으로 수행합니다. Generation 시작, 각 단계 실행, 단계 간 전진, 마지막 보관까지 처리합니다. 일상적인 단계별 확인은 건너뛰며, 에이전트가 정말로 막힌 경우(모호한 목표, 중요한 트레이드오프 결정, Genome 충돌, 예상치 못한 오류)에만 멈춥니다.",
    evolveNote: "세밀한 제어가 필요하면 개별 단계 커맨드를 실행할 수 있습니다. 자세한 내용은 커맨드 레퍼런스를 참조하세요.",
    stageWalkthrough: "단계별 상세",
    stageDetails: [
      {
        title: "1. Objective",
        desc: "이번 Generation이 달성할 목표를 정의합니다. AI 에이전트가 외부 컨텍스트를 위해 environment를 스캔하고, backlog에서 대기 항목을 검토하고, Genome 상태를 확인한 후 목표를 함께 구체화합니다.",
        output: "01-objective.md — 목표, 완료 기준 (최대 7개, 검증 가능), 기능 요구사항 (최대 10개), 범위, Genome 갭 분석.",
      },
      {
        title: "2. Planning",
        desc: "목표를 실행 가능한 태스크로 분해합니다. AI가 요구사항을 읽고, Genome 컨벤션과 제약을 참조하여 아키텍처 결정이 포함된 구현 계획을 제안합니다.",
        output: "02-planning.md — 단계별 태스크 목록 (단계당 최대 20개), 의존성, 병렬 가능 태스크는 [P]로 표시.",
      },
      {
        title: "3. Implementation",
        desc: "코드를 작성합니다. 태스크는 순차적으로 실행되며, 각 완료는 즉시 기록됩니다. Genome이나 Environment 결함이 발견되면 backlog에 기록합니다 — 직접 적용하지 않습니다. 대기 중인 Genome 변경에 의존하는 태스크는 [deferred]로 표시됩니다.",
        output: "03-implementation.md — 완료된 태스크 테이블, 미완료 태스크, genome-change backlog 항목.",
      },
      {
        title: "4. Validation",
        desc: "작업을 검증합니다. constraints.md의 검증 커맨드(테스트, 린트, 빌드, 타입 체크)를 실행하고, 완료 기준을 확인하며, 사소한 수정(5분 이내, 설계 변경 없음)을 적용합니다. 판정은 pass, partial (일부 기준 미완), fail입니다.",
        output: "04-validation.md — 실제 커맨드 출력이 포함된 테스트 결과, 기준 확인 테이블, 판정.",
      },
      {
        title: "5. Completion",
        desc: "회고하고 진화합니다. 교훈 추출 (최대 5개), genome-change backlog 항목을 Genome 파일에 적용, 기술 부채 정리, 미완료 태스크를 다음 Generation의 backlog로 인계. 독립 실행 시 Genome 변경에 사람의 확인 필요; /reap.evolve 경유 시 에이전트가 자율적으로 진행.",
        output: "05-completion.md — 요약, 회고, Genome 변경 로그. 이후 /reap.next가 모든 것을 lineage로 보관.",
      },
    ],
    microLoop: "Micro Loop (회귀)",
    microLoopDesc: "어떤 단계에서든 이전 단계로 돌아갈 수 있습니다. 이것은 흔한 일입니다 — Validation이 실패하면 Implementation으로 돌아가거나, Implementation 중 Planning 결함이 발견되면 Planning으로 돌아갑니다. 회귀 사유는 타임라인과 대상 산출물에 기록됩니다.",
    artifactHandling: "회귀 시 산출물 처리:",
    artifactRules: [
      { label: "대상 단계 이전:", desc: "그대로 보존" },
      { label: "대상 단계:", desc: "덮어쓰기 (Implementation만 append)" },
      { label: "대상 단계 이후:", desc: "보존, 재진입 시 덮어쓰기" },
    ],
    minorFix: "Minor Fix",
    minorFixDesc: "사소한 이슈(오타, 린트 오류 등)는 5분 이내에 해결 가능하고 설계 변경이 필요 없다면, 회귀 없이 현재 단계에서 직접 수정할 수 있습니다. 수정 내용은 단계 산출물에 기록됩니다.",
    roleSeparation: "역할 분리",
    roleHeaders: ["누가", "역할"],
    roles: [
      ["CLI (reap)", "프로젝트 셋업 및 유지보수 — init, status, update, fix"],
      ["AI Agent", "워크플로우 실행자 — 슬래시 커맨드로 각 단계의 작업 수행"],
      ["Human", "의사결정자 — 목표 설정, 산출물 리뷰, 단계 전환 승인"],
    ],
  },

  // CLI Page
  cli: {
    title: "CLI 레퍼런스",
    breadcrumb: "레퍼런스",
    initTitle: "reap init",
    initDesc: "새 REAP 프로젝트를 초기화합니다. .reap/ 구조를 생성하고 감지된 에이전트(Claude Code, OpenCode)에 슬래시 커맨드와 hooks를 설치합니다.",
    initHeaders: ["옵션", "값", "설명"],
    initOptions: [
      ["--mode", "greenfield | migration | adoption", "프로젝트 entry 모드"],
      ["--preset", "예: bun-hono-react", "사전 구성된 스택으로 Genome 초기화"],
    ],
    statusTitle: "reap status",
    statusDesc: "현재 프로젝트 및 Generation 상태를 표시합니다.",
    statusNote: "프로젝트 이름, entry 모드, 활성 Generation (id, 목표, 단계), 전체 완료된 Generation 수를 표시합니다.",
    updateTitle: "reap update",
    updateDesc: "커맨드, 템플릿, hooks를 최신 버전으로 동기화합니다.",
    dryRunDesc: "변경 사항을 적용하지 않고 업데이트될 내용을 표시합니다.",
    fixTitle: "reap fix",
    fixDesc: ".reap/ 디렉토리 구조를 진단하고 복구합니다.",
    fixNote: "누락된 디렉토리를 확인하고, config.yml 존재를 검증하며, current.yml 단계를 검증하고, 누락된 구조를 재생성합니다.",
    helpTitle: "reap help",
    helpDesc: "CLI 커맨드, 슬래시 커맨드, 워크플로우 요약을 출력합니다.",
    helpNote: "~/.claude/settings.json에서 사용자의 언어 설정을 읽어 해당 언어로 도움말을 출력합니다 (현재 en과 ko 지원). 언어 파일이 없으면 영어로 대체합니다.",
  },

  // Command Reference Page
  commands: {
    title: "커맨드 레퍼런스",
    breadcrumb: "레퍼런스",
    intro: "REAP에는 두 가지 유형의 커맨드가 있습니다: CLI 커맨드와 슬래시 커맨드.",
    cliCommandsDesc: "CLI 커맨드 (reap ...)는 터미널에서 실행됩니다. 프로젝트 셋업과 유지보수를 담당합니다 — init, status, update, fix, help. AI 에이전트와 상호작용하지 않습니다.",
    slashCommandsDesc: "슬래시 커맨드 (/reap.*)는 AI 에이전트 CLI (Claude Code, OpenCode) 내에서 실행됩니다. 개발 워크플로우를 주도합니다 — AI 에이전트가 프롬프트를 읽고 사용자와 대화형으로 작업을 수행합니다.",
    slashTitle: "슬래시 커맨드",
    slashIntro: "reap init으로 감지된 각 에이전트에 설치됩니다. AI 에이전트 세션(Claude Code, OpenCode) 내에서 사용합니다.",
    commandHeaders: ["커맨드", "설명"],
    commands: [
      ["/reap.evolve", "전체 Generation을 처음부터 끝까지 실행. 일상 개발의 주요 커맨드. 모든 단계를 자율적으로 순환 — 일상적 확인은 건너뛰고 정말로 막혔을 때만 멈춤."],
      ["/reap.start", "새 Generation 시작. backlog에서 대기 항목 스캔, 목표 요청, current.yml 생성, 단계를 objective로 설정."],
      ["/reap.objective", "Generation의 목표, 요구사항, 완료 기준 정의. Environment 스캔, backlog 검토, Genome 상태 확인."],
      ["/reap.planning", "목표를 의존성이 있는 태스크로 분해. 구현 계획 생성."],
      ["/reap.implementation", "계획의 태스크 실행. 완료/미완료 태스크와 Genome 발견사항을 산출물에 기록."],
      ["/reap.validation", "constraints.md의 검증 커맨드 실행. 완료 기준 확인. 판정: pass / partial / fail."],
      ["/reap.completion", "회고, backlog의 Genome 변경 적용, 정리, 최종화."],
      ["/reap.next", "다음 라이프사이클 단계로 전진. 템플릿에서 다음 산출물 생성. 완료 시 보관."],
      ["/reap.back", "이전 단계로 복귀 (micro loop). 회귀 사유를 타임라인과 산출물에 기록."],
      ["/reap.status", "현재 Generation 상태, 단계 진행, backlog 요약, 타임라인, Genome 상태 표시."],
      ["/reap.sync", "소스 코드를 분석하고 Genome 동기화. 활성 Generation이 없으면 직접 업데이트; 있으면 backlog에 기록."],
      ["/reap.help", "24+ 주제의 상황별 도움말 제공. REAP 소개, anti-hallucination 토픽 가드, 상세 설명 (workflow, genome, backlog, strict, agents, hooks, config, evolve, regression, minor-fix, compression, author 및 모든 커맨드 이름)."],
      ["/reap.update", "REAP 업데이트를 확인하고 최신 버전으로 업그레이드. 설치된 버전과 게시된 버전을 비교하고, npm 패키지를 업데이트하고, 커맨드/템플릿/훅을 동기화."],
    ],
    lifecycleFlow: "라이프사이클 흐름",
    lifecycleFlowDesc: "/reap.evolve 사용 시 일반적인 흐름:",
    commandStructure: "각 커맨드 구조",
    commandStructureDesc: "모든 슬래시 커맨드는 같은 패턴을 따릅니다: Gate (사전 조건 확인 — 단계가 맞는지, 이전 산출물이 있는지) → Steps (사람과의 상호작용으로 작업 실행) → Artifact (.reap/life/에 점진적으로 기록).",
  },

  // Configuration Page
  config: {
    title: "설정",
    breadcrumb: "레퍼런스",
    intro: "REAP 프로젝트는 .reap/config.yml을 통해 설정합니다. 이 파일은 reap init 중에 생성되며 프로젝트 설정, strict 모드, 라이프사이클 hooks를 제어합니다.",
    structure: "설정 파일 구조",
    fields: "필드",
    fieldHeaders: ["필드", "설명"],
    fieldItems: [
      ["version", "설정 스키마 버전"],
      ["project", "프로젝트 이름 (init 시 설정)"],
      ["entryMode", "REAP 초기화 방식: greenfield, migration, 또는 adoption"],
      ["strict", "Strict 모드 활성화하여 코드 변경 제한 (아래 참조)"],
      ["language", "산출물 및 사용자 상호작용 언어 (예: korean, english, japanese)"],
      ["autoUpdate", "세션 시작 시 자동 업데이트 (기본값: false)"],
      ["agents", "감지된 AI 에이전트, reap init/update에서 관리 (예: claude-code, opencode)"],
      ["hooks", "라이프사이클 hooks (Hook 레퍼런스 참조)"],
    ],
    strictMode: "Strict 모드",
    strictModeDesc: "strict: true로 설정하면 AI 에이전트는 REAP 워크플로우 외부에서 코드를 수정할 수 없습니다. 이를 통해 모든 변경이 구조화된 라이프사이클을 거치도록 보장합니다.",
    strictHeaders: ["상황", "동작"],
    strictRules: [
      ["활성 Generation 없음 / Implementation 단계가 아닌 경우", "코드 수정 완전 차단"],
      ["Implementation 단계", "02-planning.md 범위 내의 수정만 허용"],
      ["탈출구", '사용자가 명시적으로 "override" 또는 "bypass strict"를 요청하면 수정 허용'],
    ],
    strictNote: "Strict 모드는 기본적으로 비활성화됩니다. 파일 읽기, 코드 분석, 질문 답변은 strict 모드와 관계없이 항상 허용됩니다.",
    entryModes: "Entry 모드",
    entryModeHeaders: ["모드", "용도"],
    entryModeItems: [
      ["greenfield", "처음부터 새 프로젝트 시작"],
      ["adoption", "기존 코드베이스에 REAP 적용"],
      ["migration", "기존 시스템에서 새 아키텍처로 마이그레이션"],
    ],
  },

  // Hook Reference Page
  hooks: {
    title: "Hook 레퍼런스",
    breadcrumb: "레퍼런스",
    intro: "REAP hooks는 주요 라이프사이클 이벤트에서 자동화를 실행할 수 있게 합니다. .reap/config.yml에 정의하면 AI 에이전트가 적절한 시점에 실행합니다.",
    hookTypes: "Hook 타입",
    hookTypesIntro: "각 hook 항목은 두 가지 타입 중 하나를 지원합니다:",
    commandType: "command",
    commandTypeDesc: "쉘 커맨드. AI 에이전트가 프로젝트 루트 디렉토리에서 실행합니다. 스크립트, CLI 도구, 빌드 커맨드에 사용.",
    promptType: "prompt",
    promptTypeDesc: "AI 에이전트 지시사항. 에이전트가 프롬프트를 읽고 코드 분석, 파일 수정, 문서 업데이트 등의 작업을 수행합니다. 판단이 필요한 작업에 사용.",
    hookTypeNote: "항목당 command 또는 prompt 중 하나만 사용. 같은 이벤트 내 여러 항목은 정의된 순서대로 실행됩니다.",
    events: "Events",
    eventHeaders: ["Event", "발생 시점"],
    eventItems: [
      ["onGenerationStart", "/reap.start가 새 Generation을 생성하고 current.yml을 작성한 후"],
      ["onStageTransition", "/reap.next가 다음 단계로 전진하고 새 산출물을 생성한 후"],
      ["onGenerationComplete", "/reap.next가 완료된 Generation을 보관한 후. git commit 이후에 실행되므로 hooks의 변경사항은 uncommitted"],
      ["onRegression", "/reap.back이 이전 단계로 복귀한 후"],
    ],
    configuration: "설정",
    configExample: `# .reap/config.yml
hooks:
  onGenerationStart:
    - command: "echo 'Generation started'"
  onStageTransition:
    - command: "npm run lint"
  onGenerationComplete:
    - command: "reap update"
    - prompt: |
        이번 Generation에서 변경된 내용을 검토하라.
        기능, CLI 커맨드, 슬래시 커맨드가 추가되거나
        수정되었다면 README.md와 docs를 업데이트하라.
        문서 업데이트가 필요 없으면 건너뛰어라.
  onRegression:
    - command: "echo 'Regressed to previous stage'"
    - prompt: "회귀 사유를 트래킹 파일에 기록하라."`,
    sessionStart: "SessionStart Hook",
    sessionStartDesc1: "REAP 프로젝트 hooks와 별개로, SessionStart hook은 매 AI 세션 시작 시 실행되는 에이전트 메커니즘입니다. reap init 중에 감지된 각 에이전트(Claude Code, OpenCode)에 등록됩니다.",
    sessionStartDesc2: "전체 REAP 워크플로우 가이드, 현재 Generation 상태, 라이프사이클 규칙을 AI 에이전트에 주입합니다 — 새 세션에서도 에이전트가 프로젝트 컨텍스트를 이해하도록 보장합니다.",
    sessionStartNote: "에이전트의 설정에 등록됩니다 (예: Claude Code는 ~/.claude/settings.json, OpenCode는 ~/.config/opencode/). hook 스크립트는 REAP 패키지 내에 있으며 프로젝트의 .reap/ 디렉토리에서 읽습니다.",
    executionNotes: "실행 참고사항",
    executionItems: [
      "Hooks는 CLI가 아닌 AI 에이전트가 실행합니다. 에이전트가 설정을 읽고 각 hook을 실행합니다.",
      "command hooks는 프로젝트 루트 디렉토리에서 실행됩니다.",
      "prompt hooks는 현재 세션 컨텍스트에서 AI 에이전트가 해석합니다.",
      "같은 이벤트 내 hooks는 정의된 순서대로 순차 실행됩니다.",
      "onGenerationComplete hooks는 git commit 이후에 실행됩니다 — hooks의 파일 변경사항은 uncommitted 상태입니다.",
    ],
  },

  // Advanced Page
  advanced: {
    title: "고급",
    breadcrumb: "가이드",
    compressionTitle: "Lineage 압축",
    compressionDesc: "Generation이 축적되면 lineage 보관소가 크기 관리를 위해 자동으로 압축됩니다.",
    compressionHeaders: ["레벨", "입력", "출력", "최대 줄 수", "트리거"],
    compressionItems: [
      ["Level 1", "Generation 폴더 (산출물 5개)", "gen-XXX.md", "40", "lineage > 10,000줄 + 5개 이상 Generation"],
      ["Level 2", "Level 1 파일 5개", "epoch-XXX.md", "60", "Level 1 파일 5개 이상 존재"],
    ],
    presetsTitle: "프리셋",
    presetsDesc: "프리셋은 일반적인 기술 스택에 대해 사전 구성된 Genome과 프로젝트 스캐폴딩을 제공합니다.",
    presetsNote: "bun-hono-react 프리셋은 Bun + Hono + React 스택에 맞는 아키텍처 원칙, 컨벤션, 제약을 포함하여 Genome을 구성합니다.",
    entryModes: "Entry 모드",
    entryModesDesc: "reap init --mode로 지정합니다. Genome이 초기에 어떻게 구성되는지 제어합니다.",
    entryModeHeaders: ["모드", "설명"],
    entryModeItems: [
      ["greenfield", "처음부터 새 프로젝트를 시작합니다. 기본 모드. Genome이 비어있는 상태에서 성장합니다."],
      ["migration", "기존 시스템을 참조하면서 새로 구축합니다. 기존 시스템 분석으로 Genome이 초기화됩니다."],
      ["adoption", "기존 코드베이스에 REAP을 적용합니다. Genome이 템플릿에서 시작하여 첫 Generation의 Objective 단계에서 채워집니다."],
    ],
  },

  // Comparison Page
  comparison: {
    title: "비교",
    breadcrumb: "레퍼런스",
    heading: "Spec Kit과의 비교",
    desc: "Spec Kit은 코드 작성 전에 명세를 작성하는 스펙 기반 개발 방식을 개척했습니다. REAP은 이 개념을 발전시키고 주요 한계를 해결합니다:",
    items: [
      { title: "정적 스펙 vs 살아있는 Genome", desc: "기존 도구는 스펙을 정적 문서로 취급합니다. REAP의 Genome은 살아있는 시스템입니다 — 구현 중 발견된 결함이 backlog를 통해 피드백되고 Completion에서 적용됩니다. 설계가 코드와 함께 진화합니다." },
      { title: "세션 간 메모리 없음", desc: "대부분의 AI 개발 도구는 세션 간 컨텍스트를 잃습니다. REAP의 SessionStart Hook은 전체 프로젝트 컨텍스트(Genome, Generation 상태, 워크플로우 규칙)를 매 새 세션에 자동으로 주입합니다." },
      { title: "선형 워크플로우 vs Micro loops", desc: "기존 도구는 선형 흐름(스펙 → 계획 → 구현)을 따릅니다. REAP은 구조화된 회귀를 지원합니다 — 산출물을 보존하면서 어떤 단계든 이전으로 돌아갈 수 있습니다." },
      { title: "독립 태스크 vs 세대별 진화", desc: "기존 도구의 각 태스크는 독립적입니다. REAP에서는 Generation이 서로를 기반으로 발전합니다. 지식이 Lineage 보관과 Genome 진화를 통해 복리로 축적됩니다." },
      { title: "라이프사이클 hooks 없음", desc: "REAP은 자동화를 위한 프로젝트 수준 hooks(onGenerationStart, onStageTransition, onGenerationComplete, onRegression)를 제공합니다." },
    ],
  },
};

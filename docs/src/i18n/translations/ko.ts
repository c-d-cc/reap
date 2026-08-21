import type { Translations } from "./en";

export const ko: Translations = {
  // Nav & Sidebar
  nav: {
    getStarted: "시작하기",
    groups: {
      gettingStarted: "시작하기",
      guide: "가이드",
      collaboration: "협업",
      reference: "레퍼런스",
      other: "기타",
    },
    items: {
      introduction: "소개",
      quickStart: "빠른 시작",
      coreConcepts: "핵심 개념",
      genome: "Genome",
      environment: "Environment",
      lifecycle: "Life Cycle",
      lineage: "Lineage",
      backlog: "Backlog",
      hooks: "Hooks",
      codeIntelligence: "Code Intelligence",
      advanced: "고급",
      collaborationOverview: "분산 워크플로우",
      mergeGeneration: "Merge Generation",
      mergeCommands: "Merge 명령어",
      cliReference: "CLI 레퍼런스",
      commandReference: "명령어 레퍼런스",
      hookReference: "Hook 레퍼런스",
      comparison: "비교",
      configuration: "설정",
      recoveryGeneration: "Recovery Generation",
      releaseNotes: "릴리즈 노트",
    },
  },

  // Hero Page
  hero: {
    tagline: "Recursive Evolutionary Autonomous Pipeline",
    title: "REAP",
    description: "AI와 인간이 협업하여 연속적인 Generation을 통해 애플리케이션을 진화시키는 개발 파이프라인입니다. 세션 간 컨텍스트가 유지되고, 개발은 구조화된 라이프사이클을 따르며, 설계 문서가 코드와 함께 진화합니다.",
    getStarted: "시작하기 →",
    whyReap: "왜 REAP인가?",
    whyReapDesc: "AI 에이전트는 강력하지만, 구조 없이는 개발이 혼란스러워집니다. 매 세션마다 컨텍스트가 초기화됩니다. 코드 변경이 목적 없이 흩어집니다. 설계 문서가 현실에서 벗어납니다. 과거 작업에서 얻은 교훈이 사라집니다.",
    problems: [
      { problem: "컨텍스트 손실", solution: "CLAUDE.md + Memory가 매 세션마다 전체 프로젝트 컨텍스트를 자동으로 복원합니다" },
      { problem: "산발적 개발", solution: "각 Generation이 구조화된 라이프사이클을 통해 하나의 목표에 집중합니다" },
      { problem: "설계-코드 괴리", solution: "구현 중 발견된 Genome 변이가 backlog를 통해 피드백됩니다" },
      { problem: "잊혀진 교훈", solution: "회고가 Genome에 축적됩니다. Lineage가 모든 Generation을 아카이브합니다" },
      { problem: "협업 혼란", solution: "Genome 우선 merge 워크플로우가 병렬 브랜치를 조율합니다 — 코드 충돌 전에 설계 충돌을 해결합니다" },
    ],
    threeLayer: "4계층 아키텍처",
    threeLayerDesc: "REAP는 네 개의 상호 연결된 계층으로 구성됩니다: Knowledge가 기반을 제공하고, Vision이 방향을 이끌며, Generation이 작업을 수행하고, Civilization이 진화하는 대상입니다.",
    layers: [
      { label: "Knowledge", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/", desc: "Genome(규범적 — 아키텍처, 컨벤션, 제약)과 Environment(서술적 — 기술 스택, 소스 구조, 도메인). 각 Generation 작업의 기반입니다." },
      { label: "Vision", sub: "Goals + Memory", path: ".reap/vision/", desc: "장기 목표와 방향. Vision이 각 Generation을 이끕니다 — 다음에 추구할 목표를 결정합니다. Memory는 세션 간 컨텍스트를 유지합니다." },
      { label: "Generation", sub: "Evolution Cycle", path: ".reap/life/ → .reap/lineage/", desc: "각 Generation은 Learning → Planning → Implementation → Validation → Completion을 거칩니다. 완료 시 lineage에 아카이브됩니다." },
      { label: "Civilization", sub: "Source Code", path: "your codebase/", desc: ".reap/ 외부의 모든 것. Generation이 진화시키는 대상입니다. 교훈이 Knowledge로 피드백됩니다." },
    ],
    lifecycle: "Generation 라이프사이클",
    lifecycleDesc: "각 Generation은 목표 정의에서 회고 및 아카이브까지 다섯 단계를 거칩니다.",
    stages: [
      ["Learning", "프로젝트 탐색, 컨텍스트 구축, genome과 environment 검토", "01-learning.md"],
      ["Planning", "작업 분해, 접근법 선택, 의존성 매핑", "02-planning.md"],
      ["Implementation", "AI + 인간 협업으로 구현", "03-implementation.md"],
      ["Validation", "테스트 실행, 완료 기준 검증", "04-validation.md"],
      ["Completion", "회고 + 적합도 피드백 + genome 적응 + 아카이브 (4단계)", "05-completion.md"],
    ],
    stageHeaders: ["단계", "수행 내용", "산출물"],
    installation: "설치",
    installStep1: "1. 전역 설치",
    installStep2: "2. AI 에이전트(Claude Code 또는 OpenCode)를 열고, 초기화 및 시작",
    installStep3: "",
    installNote: [
      { before: "", code: "/reap.evolve", after: "은 전체 Generation 라이프사이클 — Learning부터 Completion까지 — 을 자율적으로 수행합니다. " },
      { linkText: "단계별 명령어", after: "로 수동 제어도 가능합니다." },
    ],
    keyConcepts: "핵심 개념",
    concepts: [
      { label: "Genome 불변성", desc: "Genome은 일반 Generation 중에 수정되지 않습니다. 이슈는 genome-change backlog 항목으로 기록되고 Completion의 adapt 단계에서 적용됩니다. (Embryo Generation에서는 자유 수정이 가능합니다.)" },
      { label: "Backlog & 지연", desc: ".reap/life/backlog/ 항목은 type: genome-change | environment-change | task를 가집니다. 부분 완료는 정상입니다 — 지연된 작업은 다음 Generation으로 이월됩니다." },
      { label: "Vision & Memory", desc: "Vision(.reap/vision/)이 각 Generation의 목표를 이끕니다. Memory는 AI가 세션 간 컨텍스트를 유지하기 위한 3계층 자유 형식 기록 시스템(longterm/midterm/shortterm)입니다." },
      { label: "Lineage", desc: "완료된 Generation은 .reap/lineage/에 아카이브됩니다. 회고가 거기에 축적됩니다. 시간이 지나면 압축됩니다 (Level 1 → gen-XXX-{hash}.md, Level 2 → epoch.md)." },
      { label: "4계층 아키텍처", desc: "Vision(목표 + 메모리), Knowledge(genome + environment), Generation(라이프사이클), Civilization(소스 코드)." },
      { label: "분산 워크플로우", desc: "여러 개발자나 에이전트가 별도 브랜치에서 병렬로 작업합니다. /reap.pull이 genome 우선 merge generation을 가져와 실행합니다. /reap.push가 push 전 상태를 검증합니다. 서버 불필요 — Git이 전송 계층입니다." },
    ],
    documentation: "문서",
    docLinks: [
      { href: "/docs/introduction", title: "소개", desc: "REAP란 무엇인가, 왜 사용하는가, 4계층 아키텍처." },
      { href: "/docs/quick-start", title: "빠른 시작", desc: "설치하고 첫 번째 Generation을 단계별로 실행합니다." },
      { href: "/docs/core-concepts", title: "핵심 개념", desc: "Genome, 라이프사이클, Backlog & 지연을 심층적으로 다룹니다." },
      { href: "/docs/lifecycle", title: "Life Cycle", desc: "/reap.evolve, 단계별 명령어, 마이크로 루프, completion 단계." },
      { href: "/docs/self-evolving", title: "자기 진화", desc: "명확도 기반 인터랙션, 크루즈 모드, 메모리, 격차 기반 진화." },
      { href: "/docs/command-reference", title: "명령어 레퍼런스", desc: "/reap.evolve, 단계별 명령어, /reap.status — 모든 슬래시 명령어." },
      { href: "/docs/hook-reference", title: "Hook 레퍼런스", desc: "라이프사이클 hooks: 파일 기반 이벤트 hooks, 조건, 실행 순서." },
      { href: "/docs/migration-guide", title: "마이그레이션 가이드", desc: "v0.15에서 업그레이드 — 재개 지원이 포함된 단계별 마이그레이션." },
      { href: "/docs/comparison", title: "비교", desc: "REAP가 기존 스펙 기반 개발 도구와 어떻게 다른가." },
      { href: "/docs/advanced", title: "고급", desc: "서명 기반 잠금, lineage 압축, 진입 모드." },
    ],
  },

  // Introduction Page
  intro: {
    title: "소개",
    breadcrumb: "시작하기",
    description: "REAP(Recursive Evolutionary Autonomous Pipeline)는 AI와 인간이 협업하여 연속적인 Generation을 통해 애플리케이션을 점진적으로 진화시키는 개발 파이프라인입니다. 각 AI 세션을 독립된 작업으로 취급하는 대신, REAP는 구조화된 라이프사이클과 Genome이라는 살아있는 지식 기반을 통해 연속성을 유지합니다.",
    threeLayer: "4계층 아키텍처",
    layerItems: [
      { label: "Vision", sub: "Goals + Memory", path: ".reap/vision/" },
      { label: "Knowledge", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/" },
      { label: "Generation", sub: "Evolution Cycle", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "Source Code", path: "your codebase/" },
    ],
    layerDescs: [
      "장기 목표와 방향. Vision이 각 Generation을 이끕니다 — 다음에 추구할 목표를 결정합니다. Memory는 AI가 세션 간 컨텍스트를 유지하기 위한 3계층 자유 형식 기록 시스템입니다.",
      "Genome(규범적 — 아키텍처, 컨벤션, 제약)과 Environment(서술적 — 기술 스택, 소스 구조, 도메인). 각 Generation 작업의 기반입니다.",
      "Vision에 의해 주도되고 Knowledge에 기반한 단일 진화 사이클. Learning → Planning → Implementation → Validation → Completion을 따릅니다.",
      ".reap/ 외부의 소스 코드와 모든 프로젝트 산출물. Generation이 진화시키는 대상입니다. 교훈이 Knowledge로 피드백됩니다.",
    ],
    whyReap: "왜 REAP인가?",
    problemHeader: "문제",
    solutionHeader: "REAP 솔루션",
    problems: [
      ["컨텍스트 손실 — 에이전트가 매 세션마다 프로젝트 컨텍스트를 잊음", "CLAUDE.md + Memory — 매 세션마다 genome, environment, reap-guide를 로드합니다. Memory가 세션 간 컨텍스트를 유지합니다."],
      ["산발적 개발 — 명확한 목표 없이 코드가 수정됨", "Generation 모델 — 각 Generation이 구조화된 라이프사이클로 하나의 목표에 집중합니다"],
      ["설계-코드 괴리 — 문서가 코드에서 벗어남", "Backlog를 통한 Genome 변이 — 구현 중 발견된 설계 결함이 기록되고, Completion adapt 단계에서 적용됩니다"],
      ["잊혀진 교훈 — 과거 작업의 인사이트가 소실됨", "Lineage & Memory — 교훈이 genome과 memory에 축적되고, Generation이 아카이브되어 압축됩니다"],
      ["협업 혼란 — 병렬 작업이 충돌하는 변경으로 이어짐", "분산 워크플로우 — Genome 우선 merge가 코드 전에 설계를 조율하고, DAG lineage가 병렬 브랜치를 추적합니다"],
    ],
    fourAxis: "4계층 아키텍처",
    fourAxisDesc: "REAP는 네 개의 상호 연결된 계층으로 구성됩니다:",
    axes: [
      { axis: "Vision", path: ".reap/vision/", desc: "장기 목표와 방향. 목표 + 세션 간 컨텍스트를 위한 메모리." },
      { axis: "Knowledge", path: ".reap/genome/ + .reap/environment/", desc: "Genome(규범적) + Environment(서술적). 각 Generation의 기반." },
      { axis: "Generation", path: ".reap/life/", desc: "현재 Generation의 라이프사이클. 진행 상태와 산출물." },
      { axis: "Civilization", path: "your codebase/ + .reap/lineage/", desc: "소스 코드 + 완료된 Generation의 아카이브." },
    ],
    projectStructure: "프로젝트 구조",
  },

  // Quick Start Page
  quickstart: {
    title: "빠른 시작",
    description: "REAP 설치부터 첫 generation 실행까지 — 사전 준비물, /reap.evolve 명령, 그리고 라이프사이클 각 단계가 남기는 산출물.",
    breadcrumb: "시작하기",
    prerequisites: "사전 요구사항",
    prerequisiteItems: [
      { name: "Node.js", desc: "v18 이상", required: true },
      { name: "npm", desc: "Node.js에 포함됨", required: true },
      { name: "Claude Code 또는 OpenCode", desc: "AI 에이전트 CLI (최소 하나 필요)", required: true },
      { name: "Bun", desc: "대체 패키지 관리자", required: false },
    ],
    required: "필수",
    optional: "선택",
    install: "설치",
    initProject: "프로젝트 초기화",
    runFirst: "첫 번째 Generation 실행",
    runFirstDesc: "프로젝트 디렉토리에서 AI 에이전트(Claude Code 또는 OpenCode)를 엽니다:",
    evolveTitle: "/reap.evolve이 주요 명령어입니다",
    evolveDesc: "전체 Generation 라이프사이클 — Learning, Planning, Implementation, Validation, Completion — 을 자율적으로 수행합니다. AI 에이전트가 모든 단계를 진행하며, 진정으로 막혔을 때만 멈춥니다. 일상적인 개발에서 가장 많이 사용하게 될 명령어입니다.",
    manualControl: "수동 단계 제어",
    manualControlDesc: "각 단계를 개별적으로 제어할 수도 있습니다:",
    whatHappens: "Generation 중 일어나는 일",
    stageHeaders: ["단계", "수행 내용", "산출물"],
    stages: [
      ["Learning", "프로젝트 탐색, 컨텍스트 구축, genome과 environment 검토", "01-learning.md"],
      ["Planning", "작업 분해, 접근법 선택, 의존성 매핑", "02-planning.md"],
      ["Implementation", "AI + 인간 협업으로 구현", "03-implementation.md"],
      ["Validation", "테스트 실행, 완료 기준 검증", "04-validation.md"],
      ["Completion", "회고, 적합도 피드백 수집, genome 적응, 아카이브", "05-completion.md"],
    ],
    commandLoading: "명령어 로딩 방식",
    commandLoadingDesc: "REAP 슬래시 명령어는 REAP 프로젝트에서만 로딩됩니다 — REAP가 아닌 프로젝트에서는 나타나지 않습니다.",
    commandLoadingDetails: [
      { label: "소스", desc: "명령어 원본은 ~/.reap/commands/에 저장됩니다 (reap init과 reap update로 설치됨)" },
      // reap:carrier(claude-code-commands-path)
      { label: "로딩", desc: "REAP 프로젝트를 열면 세션 hook이 자동으로 .claude/commands/에 심볼릭 링크를 생성합니다" },
      { label: "비-REAP 프로젝트", desc: "심볼릭 링크가 생성되지 않으므로 AI 에이전트의 스킬 목록에 REAP 스킬이 나타나지 않습니다" },
      { label: "하위 호환성", desc: "~/.claude/commands/의 리다이렉트 스텁이 마이그레이션 중 이전 설정의 호환성을 유지합니다" },
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "핵심 개념",
    description: "REAP 프로젝트를 이루는 네 개의 층 — Vision, Knowledge, Generation, Civilization — 과 이들이 상호작용하는 원칙.",
    breadcrumb: "가이드",
    fourAxisTitle: "4계층 아키텍처",
    fourAxisDesc: "REAP는 네 개의 상호 연결된 계층으로 구성됩니다:",
    axes: [
      { axis: "Vision", path: ".reap/vision/", desc: "장기 목표와 방향. 목표가 각 Generation을 이끕니다. Memory가 세션 간 컨텍스트를 유지합니다.", href: "/docs/self-evolving" },
      { axis: "Knowledge", path: ".reap/genome/ + .reap/environment/", desc: "Genome(규범적 — 어떻게 만들 것인가) + Environment(서술적 — 무엇이 존재하는가). 각 Generation의 기반.", href: "/docs/genome" },
      { axis: "Generation", path: ".reap/life/", desc: "Vision에 의해 주도되고 Knowledge에 기반한 단일 진화 사이클. Learning → Planning → Implementation → Validation → Completion을 따릅니다.", href: "/docs/lifecycle" },
      { axis: "Civilization", path: "your codebase/", desc: ".reap/ 외부의 소스 코드와 모든 프로젝트 산출물. Generation이 진화시키는 대상입니다. 교훈이 Knowledge로 피드백됩니다.", href: "/docs/lineage" },
    ],
    principlesTitle: "핵심 원칙",
    principles: [
      { name: "Genome 불변성", desc: "일반 Generation 중에는 수정되지 않습니다. 변경은 backlog → Completion adapt 단계를 거칩니다. (Embryo Generation에서는 자유 수정이 가능합니다.)" },
      { name: "인간이 적합도를 판단", desc: "정량적 메트릭이 없습니다. 인간의 자연어 피드백이 유일한 적합도 신호입니다." },
      { name: "명확도 기반 인터랙션", desc: "AI가 컨텍스트의 명확도에 따라 소통 깊이를 조절합니다 — 적극적 대화에서 자율 실행까지. 자세한 내용은 자기 진화 기능을 참조하세요." },
    ],
    lifecycleTitle: "라이프사이클 개요",
    lifecycleDesc: "각 Generation은 다섯 단계를 따르며, 각 단계에서 산출물을 생성합니다:",
    stageHeaders: ["단계", "수행 내용", "산출물"],
    stages: [
      ["Learning", "프로젝트 탐색, 컨텍스트 구축, genome과 environment 검토", "01-learning.md"],
      ["Planning", "작업 분해 + 구현 계획", "02-planning.md"],
      ["Implementation", "AI + 인간 협업으로 코드 작성", "03-implementation.md"],
      ["Validation", "테스트 실행, 완료 기준 검증", "04-validation.md"],
      ["Completion", "회고 + 적합도 피드백 + genome 적응 + 아카이브 (4단계)", "05-completion.md"],
    ],
    sessionInitTitle: "세션 컨텍스트 로딩",
    sessionInitDesc: "REAP 프로젝트를 열면 CLAUDE.md가 AI 에이전트에게 genome, environment, REAP 가이드를 읽도록 지시합니다. 에이전트가 즉시 프로젝트의 지식을 로딩하고 현재 상태를 파악합니다.",
    sessionInitAlt: "REAP 세션 컨텍스트 로딩 — CLAUDE.md를 통해 genome, environment, 가이드가 로딩됨",
    evolutionFlowTitle: "진화 흐름",
    evolutionFlowDesc: "지식은 Generation을 거치며 축적됩니다. 각 Generation이 Genome을 진화시키고, 교훈이 Lineage에 축적됩니다:",
  },

  // Workflow Page
  workflow: {
    title: "워크플로우",
    breadcrumb: "가이드",
    intro: "Generation은 REAP의 기본 작업 단위입니다. 각 Generation은 하나의 목표를 다섯 단계를 통해 수행하며, 과정에서 산출물을 생성합니다. 각 단계에서 일어나는 일과 단계 간의 연결을 설명합니다.",
    evolveTitle: "/reap.evolve — 작업의 기본 방식",
    evolveDesc: "대부분의 경우 /reap.evolve를 실행하면 AI 에이전트가 모든 단계를 자율적으로 진행합니다. 전체 Generation을 서브에이전트에 위임할 수 있으며, 서브에이전트는 진정으로 막혔을 때(모호한 목표, 중요한 트레이드오프, genome 충돌, 예상치 못한 오류)만 사용자에게 알립니다. 서브에이전트가 시작, 각 단계 실행, 진행, 아카이브를 처리합니다.",
    evolveNote: "세밀한 제어가 필요하면 개별 단계 명령어를 실행할 수 있습니다. 자세한 내용은 명령어 레퍼런스를 참조하세요.",
    stageWalkthrough: "단계별 워크스루",
    stageDetails: [
      {
        title: "1. Learning",
        desc: "프로젝트를 탐색하고 컨텍스트를 구축합니다. AI가 genome, environment, lineage를 검토하고 명확도 수준을 평가합니다. 목표를 설정하기 전에 현재 상태를 충분히 이해합니다.",
        output: "01-learning.md — 컨텍스트 탐색, genome/environment 검토, 명확도 평가.",
      },
      {
        title: "2. Planning",
        desc: "목표를 실행 가능한 작업으로 분해합니다. AI가 learning의 컨텍스트를 읽고, genome 컨벤션과 제약을 참조하여 아키텍처 결정이 포함된 구현 계획을 제안합니다.",
        output: "02-planning.md — 단계별 작업 목록, 의존성, 병렬화 가능 작업에 [P] 표시.",
      },
      {
        title: "3. Implementation",
        desc: "코드를 작성합니다. 작업이 순차적으로 실행되며, 각 완료가 즉시 기록됩니다. Genome이나 environment 결함이 발견되면 backlog에 기록됩니다 — 직접 적용하지 않습니다. 보류 중인 genome 변경에 의존하는 작업은 [deferred]로 표시됩니다.",
        output: "03-implementation.md — 완료된 작업 테이블, 지연된 작업, genome-change backlog 항목.",
      },
      {
        title: "4. Validation",
        desc: "작업을 검증합니다. 테스트, 린트, 빌드, 타입 체크를 실행합니다. 완료 기준을 확인하고 사소한 수정(5분 이내, 설계 변경 없음)을 적용합니다. 판정은 pass, partial(일부 기준 지연), 또는 fail입니다.",
        output: "04-validation.md — 실제 명령어 출력이 포함된 테스트 결과, 기준 확인 테이블, 판정.",
      },
      {
        title: "5. Completion (4단계)",
        desc: "Reflect: 회고 작성 + environment 갱신. Fitness: 인간 피드백 수집 (또는 크루즈 모드에서 자체 평가). Adapt: genome 검토, backlog 변경 적용, 다음 Generation 목표 제안. Commit: lineage에 아카이브 + git commit. /reap.early-close(경량, 부분 가치 보존, 미완 task 자동 승계) 또는 /reap.abort(취소, lineage 미기록)로 generation을 조기 종료할 수도 있다.",
        output: "05-completion.md — 회고, 적합도 피드백, genome 변경 로그, 다음 Generation 힌트.",
      },
    ],
    microLoop: "마이크로 루프 (회귀)",
    microLoopDesc: "어떤 단계든 이전 단계로 돌아갈 수 있습니다. 이는 일반적입니다 — validation이 실패하여 implementation으로 돌아가거나, implementation 중 planning 결함이 발견되어 planning으로 돌아갑니다. 회귀 이유가 타임라인과 해당 산출물에 기록됩니다.",
    artifactHandling: "회귀 시 산출물 처리:",
    artifactRules: [
      { label: "대상 단계 이전:", desc: "그대로 유지" },
      { label: "대상 단계:", desc: "덮어쓰기 (implementation만 추가)" },
      { label: "대상 단계 이후:", desc: "유지됨, 재진입 시 덮어쓰기" },
    ],
    minorFix: "사소한 수정",
    minorFixDesc: "사소한 이슈(오타, 린트 오류 등)는 5분 이내에 해결 가능하고 설계 변경이 필요 없는 경우, 회귀 없이 현재 단계에서 직접 수정할 수 있습니다. 수정 내용은 해당 단계 산출물에 기록됩니다.",
    roleSeparation: "역할 분리",
    roleHeaders: ["누가", "역할"],
    roles: [
      ["CLI (reap)", "프로젝트 설정 및 유지보수 — init, status, run"],
      ["AI 에이전트", "워크플로우 실행자 — 슬래시 명령어를 통해 각 단계의 작업을 수행"],
      ["인간", "의사결정자 — 목표 설정, 코드 리뷰, 적합도 피드백 제공"],
    ],
  },

  // CLI Page
  cli: {
    title: "CLI 레퍼런스",
    breadcrumb: "레퍼런스",
    initTitle: "reap init",
    initDesc: "새 REAP 프로젝트를 초기화합니다. greenfield(빈 프로젝트)와 adoption(기존 코드베이스)을 자동 감지합니다. .reap/ 구조를 생성하고 슬래시 명령어와 hooks를 설치합니다.",
    initHeaders: ["옵션", "값", "설명"],
    initOptions: [
      ["--mode", "greenfield | adoption", "자동 감지된 프로젝트 진입 모드를 오버라이드"],
      ["--repair", "", "재초기화 없이 손상된 .reap/ 구조를 복구"],
      ["--migrate", "", "v0.15에서 v0.16 구조로 마이그레이션"],
    ],
    statusTitle: "reap status",
    statusDesc: "현재 프로젝트 및 Generation 상태를 표시합니다.",
    statusNote: "프로젝트 이름, 활성 Generation(id, 목표, 단계), 총 완료 Generation 수, REAP 버전을 표시합니다.",
    runTitle: "reap run",
    runDesc: "라이프사이클 명령어를 직접 실행합니다. 슬래시 명령어와 세밀한 단계 제어에 내부적으로 사용됩니다.",
    runNote: "예시: reap run start --goal \"...\", reap run learning, reap run completion --phase reflect. 각 명령어는 AI 에이전트를 위한 구조화된 JSON 지시를 반환합니다.",
    fixTitle: "reap fix",
    fixDesc: ".reap/ 디렉토리 구조를 진단하고 복구합니다. --check로 읽기 전용 모드를 사용합니다(수정 없이 이슈만 보고).",
    fixNote: "누락된 디렉토리를 확인하고, config.yml 존재를 검증하고, current.yml 단계를 검증하고, 누락된 구조를 재생성합니다. --check 사용 시 수정 없이 구조적 무결성을 검사합니다.",
    cleanTitle: "reap clean",
    cleanDesc: "인터랙티브 옵션으로 REAP 프로젝트를 초기화합니다.",
    cleanNote: "REAP 프로젝트의 특정 부분(예: life, lineage, genome)을 선택적으로 초기화하는 인터랙티브 프롬프트를 제공합니다.",
    destroyTitle: "reap destroy",
    destroyDesc: "프로젝트에서 모든 REAP 파일을 제거합니다.",
    destroyNote: "프로젝트에서 .reap/ 디렉토리와 모든 REAP 관련 파일을 완전히 제거합니다. 확인을 위해 \"yes destroy\"를 입력해야 합니다.",
    uninstallTitle: "reap uninstall",
    uninstallDesc: "이 머신에서 REAP를 제거합니다 — 사용자 레벨 파일과 npm 패키지.",
    uninstallNote: "npm은 패키지만 지웁니다. REAP의 슬래시 명령어, 에이전트 정의, SessionStart 훅, ~/.reap/ 는 REAP 자신의 코드가 쓴 것이고, npm은 제거 시점에 어떤 코드도 실행하지 않습니다. 이 명령이 올바른 순서로 처리합니다 — 두 클라이언트의 사용자 레벨 파일 제거, settings.json에서 REAP 항목만 제거, ~/.reap/ 안에서 REAP 이 넣은 것 제거, 그다음 REAP 의 npm 패키지를 npm에 넘깁니다. 사용자 파일은 남습니다 — reapdev.* 도, ~/.reap/ 안의 다른 것들도. 이미 패키지를 지웠다면 npx @c-d-cc/reap uninstall --confirm. 프로젝트 하나에서 REAP를 제거하는 reap destroy 와는 다릅니다.",
    makeBacklogTitle: "reap make backlog",
    makeBacklogDesc: "backlog 항목을 생성합니다. backlog 파일을 생성하는 유일한 지원 방법입니다.",
    makeBacklogNote: "옵션: --type <genome-change|environment-change|task> --title <title> [--body <body>] [--priority <priority>]. backlog 파일을 직접 생성하지 마세요.",
    cruiseTitle: "reap cruise",
    cruiseDesc: "크루즈 모드 설정 — N개의 Generation을 자율 실행으로 사전 승인합니다.",
    cruiseNote: "사용법: reap cruise <count>. 각 Generation이 자체 평가와 함께 전체 라이프사이클을 실행합니다. 불확실성이나 위험이 감지되면 크루즈가 일시 중지되고 인간 피드백을 요청합니다.",
    helpTitle: "reap help",
    helpDesc: "CLI 명령어, 슬래시 명령어, 워크플로우 요약을 출력합니다.",
    helpNote: "설정된 언어로 도움말 텍스트를 출력합니다(현재 en과 ko 지원). 언어 파일이 없으면 영어로 대체합니다.",
  },

  // Command Reference Page
  commands: {
    title: "명령어 레퍼런스",
    breadcrumb: "레퍼런스",
    intro: "REAP에는 두 가지 유형의 명령어가 있습니다: CLI 명령어와 슬래시 명령어.",
    cliCommandsDesc: "CLI 명령어(reap ...)는 터미널에서 실행됩니다. 프로젝트 설정과 유지보수를 담당합니다 — init, status, run, fix, clean, destroy, make backlog, cruise. AI 에이전트와 상호작용하지 않습니다.",
    slashCommandsDesc: "슬래시 명령어(/reap.*)는 AI 에이전트 CLI(Claude Code) 내에서 실행됩니다. 개발 워크플로우를 주도합니다 — AI 에이전트가 프롬프트를 읽고 사용자와 인터랙티브하게 설명된 작업을 수행합니다.",
    slashTitle: "슬래시 명령어",
    slashIntro: "모든 REAP 인터랙션은 /reap.* 슬래시 명령어를 통해 이루어집니다. 사용자와 AI 에이전트 모두의 주요 인터페이스입니다.",
    commandHeaders: ["명령어", "설명"],
    normalTitle: "라이프사이클 명령어",
    normalCommands: [
      ["/reap.evolve", "전체 Generation 라이프사이클을 실행합니다(권장). 일상 개발의 주요 명령어입니다. 모든 단계를 순환합니다 — learning, planning, implementation, validation, completion."],
      ["/reap.start", "새 Generation을 시작합니다. 목표를 입력받고, current.yml을 생성하고, 단계를 learning으로 설정합니다. 대기 중 backlog가 있는데 --backlog <filename>이 누락되면 선택 prompt를 표시하며, --no-backlog로 명시적으로 건너뛸 수 있습니다."],
      ["/reap.next", "다음 라이프사이클 단계로 진행합니다. 산출물 존재와 nonce 체인을 검증한 후 진행합니다."],
      ["/reap.back", "이전 단계로 돌아갑니다(마이크로 루프). 사용법: /reap.back [--reason \"<reason>\"]"],
      ["/reap.early-close", "implementation/validation에서 사용하는 경량 종료. 부분 가치를 보존하고, 간소화된 reflect만 수행하며(fitness/adapt 없음), 미완 task를 다음 generation용 backlog로 자동 승계합니다. 옵션: --reason, --source-action <hold|stash|none>(기본 hold), --defer-tasks <true|false>(기본 true)."],
      ["/reap.abort", "현재 Generation을 중단합니다. 2단계 프로세스: confirm(무엇이 일어나는지 표시) 후 execute. 옵션: --phase execute, --reason, --source-action <rollback|stash|hold|none>, --save-backlog."],
    ],
    mergeTitle: "협업 명령어",
    mergeCommands: [
      ["/reap.merge", "병렬 브랜치를 위한 merge 라이프사이클. 사용법: /reap.merge [--type merge --parents \"<branchA>,<branchB>\"]"],
      ["/reap.pull", "원격 변경 사항을 가져오고 merge 기회를 감지합니다."],
      ["/reap.push", "REAP 상태를 검증(진행 중인 Generation이 있으면 경고)하고 현재 브랜치를 원격에 push합니다."],
    ],
    generalTitle: "일반 명령어",
    generalCommands: [
      ["/reap.init", "프로젝트에 REAP를 초기화합니다. greenfield와 기존 코드베이스를 자동 감지합니다."],
      ["/reap.knowledge", "Genome, environment, 컨텍스트 지식을 관리합니다. 하위 명령어: reload, genome, environment."],
      ["/reap.config", "프로젝트 설정(.reap/config.yml)을 조회/편집합니다."],
      ["/reap.status", "현재 Generation 상태, 단계 진행, backlog 요약을 확인합니다."],
      ["/reap.help", "사용 가능한 명령어와 주제를 표시합니다."],
      ["/reap.run", "라이프사이클 명령어를 직접 실행합니다. 세밀한 단계 및 phase 제어를 위해 사용합니다."],
      ["/reap.update", "v0.15에서 v0.16으로 마이그레이션을 실행합니다."],
    ],
    commandStructure: "Script Orchestrator 아키텍처",
    commandStructureDesc: "모든 슬래시 명령어는 reap run <cmd>을 호출하는 1줄짜리 .md 래퍼입니다. TypeScript 스크립트가 모든 결정론적 로직을 처리하고 AI 에이전트를 위한 구조화된 JSON 지시를 반환합니다. 패턴: Gate(사전 조건 확인) → Steps(작업 실행) → Artifact(.reap/life/에 기록).",
  },

  // Recovery Generation Page
  recovery: {
    title: "Recovery Generation",
    breadcrumb: "기타",
    intro: "Recovery Generation은 과거 Generation의 산출물에서 오류나 불일치가 발견되었을 때 이를 검토하고 수정하는 특별한 Generation 유형입니다. type: recovery를 사용하며 recovers 필드를 통해 대상 Generation을 참조합니다.",
    triggerTitle: "트리거 방법",
    triggerDesc: "대상 Generation ID로 /reap.evolve.recovery 명령어를 사용합니다. 시스템이 대상의 산출물을 검토하고 수정이 필요한 경우에만 recovery generation을 생성합니다.",
    criteriaTitle: "검토 기준",
    criteriaHeaders: ["기준", "설명"],
    criteriaItems: [
      ["산출물 불일치", "동일 Generation 내 산출물 간의 모순 (예: 목표 vs 구현 설계 불일치)"],
      ["구조적 결함", "산출물의 누락된 섹션, 불완전한 내용, 또는 형식 오류"],
      ["인간 지정 수정", "사용자가 명시적으로 요청한 수정"],
    ] as string[][],
    processTitle: "프로세스 흐름",
    processDesc: "recovery 명령어는 두 단계로 실행됩니다: review(기준 대비 산출물 분석)와 create(이슈 발견 시 recovery generation 시작).",
    processFlow: `/reap.evolve.recovery gen-XXX
  → 대상 Generation의 lineage 산출물 로드
  → 3가지 기준으로 검토
  → 이슈 발견 → Recovery generation 자동 시작 (type: recovery)
  → 이슈 없음   → "recovery 불필요" (generation 미생성)`,
    stagesTitle: "단계별 목적 비교",
    stagesDesc: "Recovery generation은 일반 Generation과 동일한 5단계 라이프사이클을 따르지만, 각 단계의 목적이 다릅니다.",
    stageHeaders: ["단계", "일반", "Recovery"],
    stageItems: [
      ["Learning", "프로젝트 탐색, 컨텍스트 구축", "대상 Generation 산출물 검토, 필요한 수정 식별"],
      ["Planning", "작업 분해", "검토할 파일/로직 목록 + 검증 기준"],
      ["Implementation", "코드 작성", "기존 코드 검토 및 수정"],
      ["Validation", "검증", "수정 후 검증"],
      ["Completion", "회고", "회고 + 원본 Generation에 대한 수정 기록"],
    ] as string[][],
    currentYmlTitle: "current.yml 확장",
    currentYmlDesc: "Recovery generation은 current.yml과 meta.yml에 recovers 필드를 추가합니다. parents 필드는 일반 DAG 규칙을 따르고, recovers는 수정 대상을 별도로 참조합니다.",
    notesTitle: "참고 사항",
    notes: [
      "기존의 normal/merge generation에 영향을 주지 않습니다",
      "동일한 lineage 압축 규칙이 recovery generation에도 적용됩니다",
      "Recovery generation은 일반 Generation과 동일한 5개 산출물을 생성합니다",
      "목표가 자동으로 대상 Generation의 원래 목표 + completion을 인용합니다",
    ],
  },

  // Configuration Page
  config: {
    title: "설정",
    breadcrumb: "레퍼런스",
    intro: "REAP 프로젝트는 .reap/config.yml을 통해 설정됩니다. 이 파일은 reap init 중에 생성되며 프로젝트 설정, strict 모드, 에이전트 통합을 제어합니다.",
    structure: "설정 파일 구조",
    fields: "필드",
    fieldHeaders: ["필드", "설명"],
    fieldItems: [
      ["project", "프로젝트 이름 (init 중에 설정됨)"],
      ["language", "산출물 및 사용자 인터랙션 언어 (예: korean, english, japanese). 기본값: english"],
      ["autoSubagent", "Agent 도구를 통해 /reap.evolve를 서브에이전트에 자동 위임 (기본값: true)"],
      ["strictEdit", "코드 변경을 REAP 라이프사이클로 제한 (기본값: false). 아래 Strict 모드 참조."],
      ["strictMerge", "직접 git pull/push/merge 제한 — 대신 REAP 명령어 사용 (기본값: false). 아래 Strict 모드 참조."],
      ["agentClient", "AI 에이전트 클라이언트 (claude-code | opencode | codex). 어댑터 layer를 제어 — 슬래시 명령 위치, manifest 파일 (CLAUDE.md vs AGENTS.md), plugin/hook 전략. 기본값: claude-code. Codex는 현재 미지원."],
      ["cruiseCount", "존재 시 크루즈 모드 활성화. 형식: current/total (예: 1/5). 크루즈 완료 후 자동 제거"],
      ["evaluator", "opt-in 독립 검토자. true 설정 시 validation/fitness 단계에서 reap-evaluate를 advisor로 실행. high-severity concern은 cruise mode를 자동 중단. 기본값: false."],
    ],
    strictMode: "Strict 모드",
    strictModeDesc: "Strict 모드는 AI 에이전트가 할 수 있는 작업을 제어합니다. 두 개의 독립적인 설정:",
    strictConfigExample: `strictEdit: true    # 코드 변경을 REAP 라이프사이클로 제한
strictMerge: true   # 직접 git pull/push/merge 제한`,
    strictEditTitle: "strictEdit — 코드 수정 제어",
    strictEditDesc: "활성화 시 AI 에이전트가 REAP 워크플로우 외부에서 코드를 수정할 수 없습니다.",
    strictHeaders: ["상황", "동작"],
    strictRules: [
      ["활성 Generation 없음 / 비-implementation 단계", "코드 수정이 완전히 차단됩니다"],
      ["Implementation 단계", "02-planning.md 범위 내의 수정만 허용됩니다"],
      ["긴급 우회", '사용자가 명시적으로 "override" 또는 "bypass strict"를 요청 — 해당 특정 작업에만 우회가 적용되고, 이후 strict 모드가 재활성화됩니다'],
    ],
    strictMergeTitle: "strictMerge — Git 명령어 제어",
    strictMergeDesc: "활성화 시 직접 git pull, git push, git merge 명령어가 제한됩니다. 에이전트가 대신 REAP 슬래시 명령어(/reap.pull, /reap.push, /reap.merge)를 사용하도록 안내합니다.",
    strictNote: "둘 다 기본적으로 비활성화되어 있습니다. 파일 읽기, 코드 분석, 질문 답변은 strict 모드에 관계없이 항상 허용됩니다.",
    entryModes: "진입 모드",
    entryModeHeaders: ["모드", "사용 사례"],
    entryModeItems: [
      ["greenfield", "처음부터 시작하는 새 프로젝트"],
      ["adoption", "기존 코드베이스에 REAP 적용"],
      ["migration", "기존 시스템에서 새 아키텍처로 마이그레이션"],
    ],
  },

  // Hook Reference Page
  hooks: {
    title: "Hooks",
    breadcrumb: "가이드",
    intro: "REAP hooks는 주요 라이프사이클 이벤트에서 자동화를 실행할 수 있게 합니다. Hooks는 .reap/hooks/에 개별 파일로 저장되며 AI 에이전트가 적절한 시점에 실행합니다.",
    hookTypes: "Hook 유형",
    hookTypesIntro: "각 hook 파일은 확장자에 따라 두 가지 유형 중 하나를 지원합니다:",
    commandType: "command (.sh)",
    commandTypeDesc: "셸 스크립트입니다. AI 에이전트가 프로젝트 루트 디렉토리에서 실행합니다. 스크립트, CLI 도구, 빌드 명령어에 사용합니다.",
    promptType: "prompt (.md)",
    promptTypeDesc: "마크다운으로 된 AI 에이전트 지시입니다. 에이전트가 프롬프트를 읽고 설명된 작업을 수행합니다 — 코드 분석, 파일 수정, 문서 업데이트 등. 판단이 필요한 작업에 사용합니다.",
    hookTypeNote: "각 hook은 단일 파일입니다. 동일 이벤트의 여러 hook은 frontmatter에 지정된 순서로 실행됩니다.",
    fileNaming: "파일 명명",
    fileNamingDesc: "Hook 파일은 다음 패턴을 따릅니다: .reap/hooks/{event}.{name}.{md|sh}",
    fileNamingFrontmatter: "각 hook 파일은 선택적 YAML frontmatter를 지원합니다:",
    frontmatterHeaders: ["필드", "설명"],
    frontmatterItems: [
      ["condition", ".reap/hooks/conditions/의 조건 스크립트 이름 (예: always, has-code-changes, version-bumped)"],
      ["order", "동일 이벤트에 여러 hook이 있을 때의 숫자 실행 순서 (기본값: 50, 낮을수록 먼저 실행)"],
    ],
    events: "이벤트",
    normalEventsTitle: "일반 라이프사이클 이벤트",
    mergeEventsTitle: "Merge 라이프사이클 이벤트",
    eventHeaders: ["이벤트", "발생 시점"],
    eventItems: [
      ["onLifeStarted", "/reap.start가 새 Generation을 생성한 후"],
      ["onLifeLearned", "learning 단계 완료 후"],
      ["onLifePlanned", "planning 단계 완료 후"],
      ["onLifeImplemented", "implementation 단계 완료 후"],
      ["onLifeValidated", "validation 단계 완료 후"],
      ["onLifeCompleted", "completion + 아카이브 후 (git commit 후 실행)"],
      ["onLifeTransited", "모든 단계 전환 후 (범용)"],
      ["onMergeStarted", "merge generation 생성 후"],
      ["onMergeDetected", "detect 단계 완료 후"],
      ["onMergeMated", "mate 단계 완료 후 (genome 해결됨)"],
      ["onMergeMerged", "merge 단계 완료 후 (소스 병합됨)"],
      ["onMergeReconciled", "reconcile 단계 완료 후 (genome-소스 일관성 검증됨)"],
      ["onMergeValidated", "merge validation 완료 후"],
      ["onMergeCompleted", "merge completion + 아카이브 후"],
      ["onMergeTransited", "모든 merge 단계 전환 후 (범용)"],
    ],
    configuration: "파일 기반 설정",
    configurationDesc: "Hooks는 파일 기반입니다 — config.yml이 아닌 .reap/hooks/에 저장됩니다. 각 hook은 {event}.{name}.{md|sh}로 명명된 파일입니다.",
    configExample: `.reap/hooks/
├── onLifeCompleted.reap-update.sh
├── onLifeCompleted.docs-update.md
├── onLifeImplemented.lint-check.sh
└── onMergeMated.notify.md

# 예시: .md hook (AI 프롬프트)
# ---
# condition: has-code-changes
# order: 30
# ---
# 변경 사항을 검토하고 필요하면 문서를 업데이트합니다.

# 예시: .sh hook (셸 스크립트)
# #!/bin/bash
# # condition: always
# # order: 20
# reap update`,
    hookSuggestion: "자동 Hook 제안",
    hookSuggestionDesc: "Completion 단계(Phase 5: Hook Suggestion)에서 REAP가 Generation 간 반복되는 패턴을 감지합니다 — 반복되는 수동 단계, 반복되는 명령어, 일관된 단계 후 작업 등. 패턴이 감지되면 REAP가 자동화를 위한 hook 생성을 제안합니다. Hook 생성은 적용 전에 항상 사용자 확인이 필요합니다.",
    executionNotes: "실행 참고 사항",
    executionItems: [
      "Hooks는 CLI가 아닌 AI 에이전트가 실행합니다. 에이전트가 .reap/hooks/에서 일치하는 파일을 검색합니다.",
      ".sh 파일은 프로젝트 루트 디렉토리에서 셸 스크립트로 실행됩니다.",
      ".md 파일은 AI 프롬프트로 읽혀지며 에이전트가 따릅니다.",
      "동일 이벤트 내 hooks는 순서대로 실행됩니다 (frontmatter 'order' 필드, 낮을수록 먼저 실행).",
      "조건은 .reap/hooks/conditions/{name}.sh를 통해 평가됩니다 (exit 0 = 실행, non-zero = 건너뜀).",
      "onLifeCompleted/onMergeCompleted hooks는 git commit 후 실행됩니다 — hooks에서의 파일 변경은 커밋되지 않은 상태가 됩니다.",
    ],
  },

  // Advanced Page
  advanced: {
    title: "고급",
    description: "서명 기반 단계 잠금, lineage 압축, 진입 모드 — 오래 이어지는 REAP 프로젝트의 일관성을 지키는 장치들.",
    breadcrumb: "가이드",
    signatureTitle: "서명 기반 잠금",
    signatureDesc: "REAP는 암호학적 nonce 체인을 사용하여 단계 순서를 강제합니다. 유효한 nonce 없이는 AI 에이전트가 다음 단계로 진행할 수 없습니다 — 건너뛰려고 해도 불가능합니다.",
    signatureFlow: `Stage Command          current.yml              /reap.next
─────────────          ───────────              ──────────
generate nonce ──────→ store hash(nonce)
return nonce to AI                         ←── AI passes nonce
                                               verify hash(nonce)
                                               ✓ advance stage`,
    signatureHow: "작동 원리",
    signatureHowItems: [
      "단계 명령어(예: /reap.objective)가 랜덤 nonce를 생성합니다",
      "nonce의 SHA-256 해시가 current.yml에 저장됩니다",
      "nonce가 JSON 응답으로 AI 에이전트에 반환됩니다",
      "/reap.next가 nonce를 받아 해시하고 current.yml과 비교합니다",
      "일치 → 단계 진행. 불일치 → 거부.",
    ],
    signatureComparisonTitle: "프롬프트 전용 vs 서명 기반",
    signatureComparisonHeaders: ["위협", "프롬프트 전용", "서명 기반"],
    signatureComparisonItems: [
      ["단계 건너뛰기", "AI 준수에 의존", "차단됨 — 유효한 nonce 없음"],
      ["토큰 위조", "해당 없음", "불가능 — 단방향 해시"],
      ["이전 nonce 재사용", "해당 없음", "차단됨 — 일회용, 단계 종속"],
      ["프롬프트 인젝션", "취약", "nonce가 프롬프트 컨텍스트 외부에 존재"],
    ],
    compressionTitle: "Lineage 압축",
    compressionDesc: "Generation이 축적됨에 따라 lineage 아카이브가 Completion 단계에서 자동으로 압축됩니다.",
    compressionHeaders: ["레벨", "입력", "출력", "트리거", "보호"],
    compressionItems: [
      ["Level 1", "Generation 폴더 (5개 산출물)", "gen-XXX-{hash}.md (40줄)", "lineage > 5,000줄 + 5개 이상 Generation", "최근 3개 + DAG 리프 노드"],
      ["Level 2", "100+ Level 1 파일", "단일 epoch.md", "Level 1 파일 > 100", "최근 9개 + 포크 포인트"],
    ],
    compressionProtection: "DAG 보존: Level 1 파일은 frontmatter에 메타데이터를 유지합니다. Level 2 epoch.md는 generation 해시 체인을 저장합니다. 포크 가드: 모든 로컬/원격 브랜치가 Level 2 압축 전에 스캔됩니다 — 포크 포인트가 보호됩니다. Epoch 압축된 Generation은 merge base로 사용할 수 없습니다.",
    entryModes: "진입 모드",
    entryModesDesc: "reap init --mode로 지정합니다. Genome의 초기 구조를 제어합니다.",
    entryModeHeaders: ["모드", "설명"],
    entryModeItems: [
      ["greenfield", "처음부터 새 프로젝트를 만듭니다. 기본 모드입니다. Genome이 비어있는 상태에서 시작하여 성장합니다."],
      ["migration", "기존 시스템을 참조하면서 새로 만듭니다. Genome이 기존 시스템 분석으로 시드됩니다."],
      ["adoption", "기존 코드베이스에 REAP를 적용합니다. Genome이 템플릿에서 시작하여 첫 번째 Generation의 Learning 단계에서 채워집니다."],
    ],
  },

  // Distributed Workflow - Overview
  collaboration: {
    title: "분산 워크플로우",
    breadcrumb: "협업",
    intro: "REAP는 여러 개발자나 AI 에이전트가 동일한 프로젝트에서 병렬로 작업하는 협업 환경을 위한 분산 워크플로우를 지원합니다 — 중앙 서버 없이. Git이 유일한 전송 계층입니다.",
    caution: "분산 워크플로우는 현재 초기 단계이며 추가 테스트가 필요합니다. 프로덕션 환경에서는 주의하여 사용하세요. 사용자 피드백을 적극적으로 수집하고 있습니다 — 이슈나 제안은",
    cautionLink: "GitHub Issues",
    cautionUrl: "https://github.com/c-d-cc/reap/issues",
    howItWorks: "작동 방식",
    howItWorksDesc: "각 개발자나 에이전트가 자신의 브랜치와 Generation에서 독립적으로 작업합니다. 결합할 때 REAP가 genome 우선 전략으로 merge를 조율합니다.",
    flowSteps: [
      "Machine A가 branch-a에서 gen-046-a를 완료 → /reap.push",
      "Machine B가 branch-b에서 gen-046-b를 완료 → /reap.push",
      "Machine A가 /reap.pull branch-b 실행 → fetch + 전체 merge generation 라이프사이클",
    ],
    principles: "핵심 원칙",
    principleItems: [
      { label: "Opt-in", desc: "git pull/push는 항상 정상적으로 동작합니다. REAP 명령어는 추가적입니다 — 분산 워크플로우를 언제 사용할지 선택할 수 있습니다." },
      { label: "Genome 우선", desc: "소스 merge 전에 genome 충돌을 먼저 해결합니다. 법률을 업데이트하기 전에 헌법을 수정하는 것과 같습니다." },
      { label: "서버 불필요", desc: "모든 것이 로컬 + Git입니다. 외부 서비스도, 중앙 조율도 없습니다." },
      { label: "DAG lineage", desc: "각 Generation이 해시 기반 ID(gen-046-a3f8c2)로 부모를 참조하여 방향성 비순환 그래프를 형성합니다. 자연스럽게 병렬 작업을 지원합니다." },
    ],
    scenarios: "사용 시나리오",
    scenarioItems: [
      { label: "원격 브랜치 (멀티 머신)", desc: "서로 다른 개발자나 에이전트가 별도 머신에서 작업하고 원격 브랜치에 push합니다. /reap.push로 게시하고, /reap.pull <branch>로 fetch 및 merge합니다.", example: "/reap.push → /reap.pull branch-b" },
      { label: "로컬 worktree (멀티 에이전트)", desc: "여러 AI 에이전트가 git worktree를 사용하여 동일 머신에서 병렬로 작업합니다. 각 worktree에 자체 브랜치와 Generation이 있습니다. /reap.merge.start로 직접 결합합니다 — fetch 불필요.", example: "/reap.merge.start worktree-branch" },
      { label: "혼합", desc: "일부는 로컬(worktree), 일부는 원격(다른 머신). 원격 브랜치에는 /reap.pull, 로컬 브랜치에는 /reap.merge.start를 필요에 따라 결합합니다." },
    ],
    pullPush: "Pull & Push (원격)",
    pullDesc: "/reap.pull <branch>는 /reap.evolve의 분산 버전입니다. 원격을 fetch하고, 새 Generation을 감지하고, Detect부터 Completion까지 전체 merge generation 라이프사이클을 실행합니다.",
    pushDesc: "/reap.push는 현재 REAP 상태를 검증(진행 중인 Generation이 있으면 경고)하고 현재 브랜치를 원격에 push합니다.",
    merge: "Merge (로컬 / Worktree)",
    mergeDesc: "/reap.merge.start <branch>는 로컬 브랜치에서 직접 merge generation을 생성합니다 — fetch가 필요 없는 worktree 기반 병렬 개발에 이상적입니다. /reap.merge.evolve로 전체 merge 라이프사이클을 실행하거나, 각 단계를 수동으로 진행할 수 있습니다.",
    gitRefReading: "Git Ref 기반 읽기",
    gitRefDesc: "merge 전에 대상 브랜치의 genome과 lineage를 git ref(git show, git ls-tree)로 읽습니다 — checkout 불필요. 원격과 로컬 브랜치 모두에서 동작합니다.",
  },

  // Distributed Workflow - Merge Lifecycle
  mergeGeneration: {
    title: "Merge Generation",
    breadcrumb: "협업",
    intro: "분기된 브랜치를 병합해야 할 때, REAP는 일반 Generation 라이프사이클과 별도인 6단계 특수 라이프사이클인 Merge Generation을 실행합니다. 핵심 원칙: genome을 먼저 정렬한 후 소스 코드를 병합합니다.",
    whyLonger: "Merge Generation이 일반 git merge와 다른 이유는?",
    whyLongerDesc: "일반 git merge는 소스 코드 충돌만 해결합니다. 하지만 두 브랜치가 독립적으로 진화하면서 — 각자의 Generation, genome 변경, 설계 결정이 있다면 — 소스 코드만 병합하는 것으로는 충분하지 않습니다. genome(아키텍처 원칙, 컨벤션, 제약, 비즈니스 규칙)도 분기되었을 수 있습니다. Merge Generation은 소스 merge 전에 세 가지 중요한 단계를 추가합니다: genome 분기 감지, mating(genome 충돌 해결), merge 후 genome-소스 일관성 검증. 이를 통해 병합된 코드베이스가 단순히 컴파일만 되는 것이 아니라 설계적으로도 일관됨을 보장합니다.",
    whyGenomeFirst: "왜 genome 정렬이 먼저인가",
    whyGenomeFirstDesc: "소스 코드 충돌을 해결한다고 해서 의미적 충돌이 없다는 보장은 되지 않습니다. 두 코드가 깔끔하게 병합될 수 있습니다 — git 충돌이 전혀 없이 — 그러면서도 의도, 아키텍처, 비즈니스 로직에서 서로 모순될 수 있습니다. genome 기반 추론만이 이러한 보이지 않는 충돌을 감지할 수 있습니다: 병합된 코드가 아키텍처 원칙을 여전히 따르는가? 컨벤션이 일관적인가? 비즈니스 규칙이 정렬되는가? 이것이 REAP가 소스 코드에 손대기 전에 genome을 정렬하는 이유입니다. genome이 확정되면 소스 충돌을 해결하기 위한 권위 있는 가이드가 됩니다 — 구문적으로만이 아니라 의미적으로도.",
    whyLongerPoints: [
      { label: "일반 git merge", desc: "소스 충돌 → 해결 → 커밋. 설계 일관성을 확인하지 않습니다. 의미적 충돌이 감지되지 않습니다." },
      { label: "Merge Generation", desc: "먼저 genome 정렬 → genome에 기반한 소스 merge → genome-소스 일관성 검증 → validation → 커밋. 보이지 않는 의미적 충돌을 포착합니다." },
    ],
    stageOrder: "단계 순서",
    stages: [
      { name: "Detect", desc: "git ref를 통해 대상 브랜치를 스캔합니다. DAG BFS로 공통 조상을 찾습니다. genome diff를 추출합니다. 충돌을 WRITE-WRITE 또는 CROSS-FILE로 분류합니다.", artifact: "01-detect.md" },
      { name: "Mate", desc: "모든 genome 충돌을 인간에게 제시합니다. WRITE-WRITE: A, B 선택 또는 수동 병합. CROSS-FILE: 논리적 호환성 확인. 진행 전에 genome이 완전히 해결되어야 합니다.", artifact: "02-mate.md" },
      { name: "Merge", desc: "대상 브랜치와 git merge --no-commit을 실행합니다. 확정된 genome에 기반하여 소스 충돌을 해결합니다. 의미적 충돌을 확인합니다 — 컴파일은 되지만 genome에 모순되는 코드.", artifact: "03-merge.md" },
      { name: "Reconcile", desc: "merge 후 genome-소스 일관성을 검증합니다. AI가 genome과 소스 코드를 비교합니다. 사용자가 발견된 불일치를 확인합니다. 이슈가 있으면 Merge 또는 Mate로 회귀합니다.", artifact: "04-reconcile.md" },
      { name: "Validation", desc: "모든 기계적 테스트 명령어(test, lint, build, type check)를 실행합니다. 실패 시 Merge 또는 Mate로 회귀합니다.", artifact: "05-validation.md" },
      { name: "Completion", desc: "병합 결과를 커밋합니다. meta.yml에 type: merge와 양쪽 부모를 기록합니다. lineage에 아카이브합니다.", artifact: "06-completion.md" },
    ],
    stageHeaders: ["단계", "수행 내용", "산출물"],
    conflictTypes: "충돌 유형",
    conflictHeaders: ["유형", "설명", "해결 방법"],
    conflicts: [
      ["WRITE-WRITE", "양쪽 브랜치에서 동일한 genome 파일이 수정됨", "인간이 결정: A 유지, B 유지, 또는 병합"],
      ["CROSS-FILE", "다른 genome 파일이 수정되었지만 양쪽 브랜치 모두 genome을 변경", "인간이 논리적 호환성을 검토"],
      ["소스 충돌", "소스 코드의 git merge 충돌", "확정된 genome에 기반하여 해결"],
      ["의미적 충돌", "코드가 깔끔하게 병합되지만 genome(아키텍처, 컨벤션, 비즈니스 규칙)에 모순", "Reconcile 단계에서 감지 — AI가 genome과 소스를 비교하고, 사용자가 해결을 확인"],
      ["충돌 없음", "genome이나 소스 충돌 없음", "자동으로 진행"],
    ],
    regression: "Merge 회귀",
    regressionDesc: "Validation이나 Reconcile 실패 시 Merge 또는 Mate로 회귀할 수 있습니다. Merge는 genome 이슈가 발견되면 Mate로 회귀할 수 있습니다. 회귀 규칙은 일반 Generation과 동일한 패턴을 따릅니다 — 이유가 타임라인과 산출물에 기록됩니다.",
    currentYml: "current.yml 구조 (Merge)",
  },

  // Distributed Workflow - Merge Commands
  mergeCommands: {
    title: "Merge 명령어",
    breadcrumb: "협업",
    intro: "모든 분산 워크플로우 작업은 AI 에이전트가 실행하는 슬래시 명령어입니다. merge를 위한 CLI 명령어는 없습니다 — genome 충돌 해결과 소스 merge 가이드에 AI 에이전트가 필수적입니다.",
    primaryCommands: "주요 명령어",
    primaryItems: [
      { cmd: "/reap.pull <branch>", desc: "분산 merge를 위한 원스톱 명령어입니다. 원격을 fetch하고, 대상 브랜치의 새 Generation을 감지하고, merge generation을 생성하고, 전체 merge 라이프사이클을 실행합니다. /reap.evolve의 분산 버전입니다." },
      { cmd: "/reap.merge <branch>", desc: "로컬 브랜치를 위한 전체 merge generation을 실행합니다. fetch 없음 — worktree 기반 병렬 개발에 이상적입니다. /reap.pull의 로컬 버전입니다." },
      { cmd: "/reap.push", desc: "REAP 상태를 검증(진행 중인 Generation이 있으면 경고)하고 현재 브랜치를 push합니다. Generation 완료 후 사용합니다." },
    ],
    stageCommands: "단계 명령어 (세밀한 제어)",
    stageItems: [
      { cmd: "/reap.merge.start", desc: "대상 브랜치를 위한 merge generation을 생성합니다. detect를 실행하고 01-detect.md를 생성합니다." },
      { cmd: "/reap.merge.detect", desc: "분기 보고서를 검토합니다. 필요시 재실행합니다." },
      { cmd: "/reap.merge.mate", desc: "인간과 인터랙티브하게 genome 충돌을 해결합니다." },
      { cmd: "/reap.merge.merge", desc: "git merge --no-commit을 실행하고 소스 충돌을 해결합니다." },
      { cmd: "/reap.merge.reconcile", desc: "genome-소스 일관성을 검증합니다. AI가 genome과 소스를 비교하고, 사용자가 불일치를 확인합니다." },
      { cmd: "/reap.merge.validation", desc: "기계적 테스트(bun test, tsc, build)를 실행합니다. 실패 시 회귀합니다." },
      { cmd: "/reap.merge.completion", desc: "merge generation을 커밋하고 아카이브합니다." },
      { cmd: "/reap.merge.evolve", desc: "현재 단계부터 completion까지 merge 라이프사이클을 실행합니다." },
    ],
    mergeHooks: "Merge Hooks",
    mergeHookHeaders: ["이벤트", "발생 시점"],
    mergeHookItems: [
      ["onMergeStarted", "/reap.merge.start가 merge generation을 생성한 후"],
      ["onMergeDetected", "detect 단계 완료 후"],
      ["onMergeMated", "mate 단계 완료 후 (genome 해결됨)"],
      ["onMergeMerged", "merge 단계 완료 후 (소스 병합됨)"],
      ["onMergeReconciled", "reconcile 단계 완료 후 (genome-소스 일관성 검증됨)"],
      ["onMergeValidated", "merge validation 완료 후"],
      ["onMergeCompleted", "merge completion + 아카이브 후"],
      ["onMergeTransited", "모든 merge 단계 전환 후 (범용)"],
    ],
    mergeHookNote: "onMergeTransited는 일반 라이프사이클의 onLifeTransited와 유사하게, 모든 merge 단계 전환 시 발생합니다.",
  },

  // Comparison Page
  comparison: {
    title: "비교",
    breadcrumb: "시작하기",
    heading: "Spec Kit과의 비교",
    desc: "Spec Kit은 스펙 기반 개발을 개척했습니다 — 코드 전에 명세서를 작성하는 방식. REAP는 이 개념을 기반으로 주요 한계를 해결합니다:",
    items: [
      { title: "정적 스펙 vs 살아있는 Genome", desc: "기존 도구는 스펙을 정적 문서로 취급합니다. REAP의 Genome은 살아있는 시스템입니다 — 구현 중 발견된 결함이 backlog를 통해 피드백되고 Completion에서 적용됩니다. 설계가 코드와 함께 진화합니다." },
      { title: "세션 간 메모리 없음", desc: "대부분의 AI 개발 도구는 세션 간에 컨텍스트를 잃습니다. REAP의 CLAUDE.md + 3계층 Memory 시스템이 매 새 세션마다 전체 프로젝트 컨텍스트(genome, environment, vision, memory)를 자동으로 복원합니다." },
      { title: "선형 워크플로우 vs 마이크로 루프", desc: "기존 도구는 선형 흐름(스펙 → 계획 → 구현)을 따릅니다. REAP는 구조화된 회귀를 지원합니다 — 산출물을 보존하면서 어떤 단계든 이전 단계로 돌아갈 수 있습니다." },
      { title: "독립 작업 vs 세대 진화", desc: "기존 도구의 각 작업은 독립적입니다. REAP에서는 Generation이 서로를 기반으로 합니다. Lineage 아카이브와 Genome 진화를 통해 지식이 축적됩니다." },
      { title: "라이프사이클 hooks 없음", desc: "REAP는 모든 라이프사이클 지점에서 자동화를 위한 16개의 단계 수준 hooks(onLifeStarted부터 onMergeCompleted까지)를 제공합니다." },
    ],
  },

  // Genome Page
  genomePage: {
    title: "Genome",
    breadcrumb: "가이드",
    intro: "Genome은 REAP의 권위 있는 지식 소스입니다 — 아키텍처 원칙, 개발 컨벤션, 기술 제약, 도메인 규칙. 프로젝트의 DNA입니다.",
    structureTitle: "구조",
    structure: `.reap/genome/
├── application.md     # 프로젝트 정체성, 아키텍처, 컨벤션
├── evolution.md       # AI 행동 가이드, 진화 방향
└── invariants.md      # 절대 제약 (인간만 편집 가능)`,
    principlesTitle: "세 파일",
    principles: [
      "application.md — 프로젝트 정체성, 아키텍처 결정, 개발 컨벤션, 제약.",
      "evolution.md — AI 행동 가이드, 인터랙션 원칙, 코드 품질 규칙, 소프트 라이프사이클 규칙.",
      "invariants.md — 절대로 위반할 수 없는 제약. 인간만 이 파일을 수정할 수 있습니다.",
    ],
    immutabilityTitle: "Genome 불변성",
    immutabilityDesc: "Genome은 일반 Generation 중에 수정되지 않습니다. Implementation 중 발견된 이슈는 genome-change backlog 항목으로 기록되고 Completion adapt 단계에서만 적용됩니다.",
    immutabilityWhy: "예외: Embryo generation(초기 단계 프로젝트)에서는 어떤 단계에서든 자유로운 genome 수정이 가능합니다. 프로젝트가 성숙해지면 AI가 adapt 단계에서 embryo에서 normal로의 전환을 제안하고, 인간이 승인합니다.",
    contextTitle: "항상 로딩됨",
    contextDesc: "세 genome 파일 모두 CLAUDE.md를 통해 세션 시작 시 AI 에이전트의 컨텍스트에 완전히 로딩됩니다. 에이전트가 항상 프로젝트의 아키텍처, 컨벤션, 제약에 접근할 수 있습니다 — 수동 브리핑이 필요 없습니다.",
    evolutionTitle: "Generation을 통한 진화",
    evolutionDesc: "각 Generation의 끝(Completion adapt 단계)에서 genome-change backlog 항목이 검토되고 Genome에 적용됩니다. 이를 통해 Generation 중 실제로 일어난 일에 기반하여 Genome이 의도적으로 진화합니다.",
    syncTitle: "지식 관리",
    syncDesc: "/reap.knowledge를 사용하여 Genome과 Environment를 검토하고 관리합니다. 이 명령어는 컨텍스트를 다시 로딩하고, genome 파일을 검사하고, environment 데이터를 관리하는 옵션을 제공합니다.",
  },

  // Environment Page
  environmentPage: {
    title: "Environment",
    breadcrumb: "가이드",
    intro: "Environment는 프로젝트의 서술적 지식입니다 — 현재 무엇이 존재하는가. 기술 스택, 소스 구조, 빌드 설정, 도메인 지식, 코드 의존성을 캡처합니다. Genome(규범적 — 어떻게 만들 것인가)과 달리, Environment는 현재 상태를 서술합니다.",
    structureTitle: "2계층 구조",
    structure: `.reap/environment/
├── summary.md      # 항상 로딩 (~250줄) — 기술 스택, 소스 구조, 빌드, 테스트
├── domain/         # 도메인 지식 (온디맨드)
├── resources/      # 외부 참조 문서 — API 문서, SDK 스펙 (온디맨드)
├── docs/           # 프로젝트 참조 문서 — 설계 문서, 스펙 (온디맨드)
└── source-map.md   # 코드 구조 + 의존성 (온디맨드)`,
    layersTitle: "계층",
    layerHeaders: ["계층", "로딩", "내용", "제한"],
    layerItems: [
      ["summary.md", "세션 시작 시 항상 로딩", "기술 스택, 소스 구조, 빌드 설정, 테스트 설정. AI의 기본 이해.", "~250줄"],
      ["domain/", "온디맨드 (필요 시 로딩)", "도메인 지식 — 비즈니스 규칙, API 스펙, 인프라 세부사항.", "제한 없음"],
      ["resources/", "온디맨드 (필요 시 로딩)", "외부 참조 문서 — API 문서, SDK 스펙, 서드파티 문서.", "제한 없음"],
      ["docs/", "온디맨드 (필요 시 로딩)", "프로젝트 참조 문서 — 설계 문서, 스펙, 아키텍처 결정.", "제한 없음"],
      ["source-map.md", "온디맨드 (필요 시 로딩)", "현재 코드 구조와 의존성 맵.", "제한 없음"],
    ],
    immutabilityTitle: "Environment 불변성",
    immutabilityDesc: "Genome과 마찬가지로 Environment도 Generation 중에 직접 수정되지 않습니다. 변경은 environment-change backlog 항목으로 기록되고 Completion reflect 단계에서 적용됩니다.",
    immutabilityWhy: "변경을 mid-generation에 Environment를 다시 쓰는 대신 backlog에 캡처함으로써, Generation이 안정된 맵 위에서 완료됩니다. 업데이트는 무엇이 구축되었는지의 전체 컨텍스트와 함께 reflect 단계에서 한 번 의도적으로 일어납니다.",
    flowTitle: "로딩 전략",
    flowDesc: "summary.md는 세션 시작 시 항상 로딩됩니다. domain/과 source-map.md는 AI가 특정 작업을 위해 더 깊은 컨텍스트가 필요할 때 온디맨드로 로딩됩니다.",
    syncTitle: "지식 관리",
    syncDesc: "/reap.knowledge를 사용하여 Environment를 검토하고 관리합니다. Completion reflect 단계에서 AI가 자동으로 environment를 갱신하여 Generation 중 이루어진 변경을 반영합니다.",
    syncSources: [
      { label: "summary.md", role: "항상 로딩", desc: "프로젝트 기술 상태의 간결한 개요. 매 세션에 로딩되어 AI가 기본 컨텍스트를 가집니다." },
      { label: "domain/ + resources/ + docs/ + source-map.md", role: "온디맨드", desc: "AI가 현재 작업을 위해 특정 도메인, 외부 참조, 또는 구조적 컨텍스트가 필요할 때 로딩되는 심층 지식." },
    ],
    syncContrast: "2계층 전략은 컨텍스트 윈도우 효율성(summary.md가 작음)과 깊이(domain/과 source-map.md가 필요 시 사용 가능)를 균형 있게 조율합니다.",
  },

  // Lifecycle Page (renamed from Workflow)
  lifecyclePage: {
    title: "Life Cycle",
    breadcrumb: "가이드",
    intro: "라이프사이클은 REAP의 심장 박동입니다 — 각 Generation이 5단계(Learning → Planning → Implementation → Validation → Completion)를 거치며, 매 단계에서 산출물을 생성합니다. Completion은 4개의 phase로 구성됩니다: reflect → fitness → adapt → commit.",
    structureTitle: "산출물 구조",
    structure: `.reap/life/
├── current.yml          # 현재 Generation 상태 (id, 목표, 단계, 타임라인)
├── 01-learning.md       # 컨텍스트 탐색, genome/environment 검토
├── 02-planning.md       # 작업 분해, 의존성
├── 03-implementation.md # 구현 로그, 이루어진 변경
├── 04-validation.md     # 테스트 결과, 완료 기준 확인
├── 05-completion.md     # 회고 + 적합도 + 적응 + 커밋
└── backlog/             # 다음 Generation을 위한 항목
    ├── fix-auth-bug.md  #   type: task
    └── add-index.md     #   type: genome-change`,
    structureDesc: "각 단계가 .reap/life/에 산출물을 생성합니다. Generation이 완료되면 모든 산출물이 .reap/lineage/gen-XXX-hash-slug/에 아카이브되고 current.yml이 다음 Generation을 위해 초기화됩니다.",
  },

  // Lineage Page
  lineagePage: {
    title: "Lineage",
    breadcrumb: "가이드",
    intro: "Lineage는 완료된 Generation의 아카이브입니다. 라이프사이클을 완료한 모든 Generation이 전체 산출물과 DAG 메타데이터와 함께 보존됩니다.",
    structureTitle: "구조",
    structureDesc: "완료된 각 Generation은 산출물과 메타데이터가 포함된 디렉토리를 생성합니다:",
    structure: `.reap/lineage/
├── gen-042-a3f8c2-fix-login-bug/   # 전체 Generation (디렉토리)
│   ├── meta.yml                      # DAG 메타데이터 (id, parents, genomeHash)
│   ├── 01-learning.md
│   ├── 02-planning.md
│   ├── 03-implementation.md
│   ├── 04-validation.md
│   └── 05-completion.md
├── gen-030-b7e1f2.md                 # Level 1 압축 (단일 파일)
└── epoch.md                          # Level 2 압축 (해시 체인)`,
    dagTitle: "DAG (Directed Acyclic Graph)",
    dagDesc: "각 Generation이 meta.yml에 부모를 기록하여 DAG를 형성합니다. 이를 통해 여러 머신이 독립적으로 작업하고 나중에 merge하는 분산 워크플로우가 가능합니다.",
    compressionTitle: "압축",
    compressionDesc: "lineage 크기를 관리하기 위해 Completion 단계에서 압축이 실행됩니다.",
    compressionHeaders: ["레벨", "입력", "출력", "트리거", "보호"],
    compressionItems: [
      ["Level 1", "Generation 폴더", "gen-XXX-{hash}.md (40줄)", "> 5,000줄 + 5개 이상 Generation", "최근 3개 + DAG 리프 노드"],
      ["Level 2", "100+ Level 1 파일", "단일 epoch.md", "Level 1 파일 > 100", "최근 9개 + 포크 포인트"],
    ],
    compressionSafety: "DAG 보존: Level 1은 frontmatter에 메타데이터를 유지합니다. Level 2 epoch.md는 generation 해시 체인을 저장합니다. 포크 가드: 모든 로컬/원격 브랜치가 스캔됩니다 — 포크 포인트가 보호됩니다. Epoch 압축된 Generation은 merge base로 사용할 수 없습니다.",
  },

  // Backlog Page
  backlogPage: {
    title: "Backlog",
    breadcrumb: "가이드",
    intro: "Backlog은 Generation 간에 항목을 이월합니다 — 지연된 작업, genome 변경, environment 변경. .reap/life/backlog/에 위치합니다.",
    typesTitle: "항목 유형",
    typeHeaders: ["유형", "설명", "적용 시점"],
    typeItems: [
      ["task", "지연된 작업, 기술 부채, 기능 아이디어", "다음 Generation의 목표 후보로 참조"],
      ["genome-change", "Generation 중 발견된 Genome 수정 사항", "Completion adapt 단계에서 Genome에 적용"],
      ["environment-change", "Generation 중 발견된 외부 environment 변경", "Completion reflect 단계에서 Environment에 적용"],
    ],
    statusTitle: "상태",
    statusHeaders: ["상태", "의미"],
    statusItems: [
      ["pending", "아직 처리되지 않음 (기본값)"],
      ["consumed", "Generation에서 처리됨 (consumedBy: gen-XXX-{hash} 필요)"],
    ],
    archivingTitle: "아카이브 규칙",
    archivingDesc: "아카이브 시점에 consumed 항목은 lineage로 이동합니다. pending 항목은 다음 Generation의 backlog로 이월됩니다.",
    deferralTitle: "작업 지연",
    deferralDesc: "부분 완료는 정상입니다 — Genome 변경에 의존하는 작업은 [deferred]로 표시되고 다음 Generation에 넘겨집니다.",
    abortTitle: "Abort Backlog",
    abortDesc: "/reap.abort로 Generation이 중단되면, 목표와 진행 상황을 abort 메타데이터(abortedFrom, abortReason, stage, sourceAction, changedFiles)와 함께 backlog에 저장할 수 있습니다. 이를 통해 나중에 재개할 수 있는 컨텍스트가 보존됩니다.",
    formatTitle: "파일 형식",
    format: `---
type: task
status: pending
priority: medium
---

# 작업 제목

작업에 대한 설명.`,
  },

  // Code Intelligence Page
  codeIntelligencePage: {
    title: "Code Intelligence",
    breadcrumb: "가이드",
    intro: "REAP 는 코드 인덱스를 내장합니다. 설치할 것도, 띄울 것도, 백그라운드에서 도는 프로세스도 없습니다. Tree-sitter 파서가 추적 중인 모든 파일을 훑어 정의된 심볼과 그 사이의 호출·import 를 기록하고, 결과를 .reap/.index/ 에 gzip 된 JSON 으로 저장합니다. 15개 언어가 함께 배포되며 네이티브 빌드가 없습니다 — grammar 가 WebAssembly 입니다.",
    commandsTitle: "명령",
    commandsDesc: "모든 서브커맨드는 REAP 의 다른 명령과 마찬가지로 stdout 에 JSON 을 냅니다. 에이전트는 파싱하고, 사람은 message 필드를 읽으면 됩니다.",
    commandsCode: `reap index                     # update — 기본 동작
reap index update [--full]     # 인덱스를 HEAD 에 맞춤
reap index status              # 통계, import 해석률, 인덱싱된 커밋
reap index impact <file>...    # 이 파일을 바꾸면 무엇이 영향받는가
reap index search <query>      # 정의 찾기 (file:line 반환)
reap index callers <symbolId>  # 누가 이것을 부르는가
reap index callees <symbolId>  # 이것이 무엇을 부르는가`,
    commandsNote: "symbolId 는 <file>::<name> 형태입니다 — 예: src/core/lifecycle.ts::nextStage. reap index search 가 이 값을 출력합니다.",
    commitTitle: "변경의 단위는 커밋입니다",
    commitDesc: "인덱스는 자기가 서술하는 SHA 를 기록합니다. 무엇을 다시 읽을지는 git diff 한 번이고, 다시 읽을 필요가 있는지는 문자열 비교 한 번입니다. HEAD 가 움직이면 — 커밋·브랜치 전환·rebase·pull 후 — 질의가 스스로 인덱스를 갱신합니다. REAP 이 먼저 갱신하는 것은 자기가 방금 커밋한 자리뿐입니다 — completion 끝, 그리고 early-close.",
    commitCode: `reap index update    # Indexed 412 file(s) — full, 1530 symbols at 1a2b3c4 (612ms)
reap index update    # Index is current at 1a2b3c4 (1530 symbols, 3688 edges)`,
    commitNote: "대가는 이것입니다 — 커밋되지 않은 작업은 인덱스에 없습니다. 방금 쓰고 아직 커밋하지 않은 심볼은 search 로 찾을 수 없고, 새로 만든 파일은 impact 에 나타나지 않습니다. 그건 Grep 으로 찾으세요. 그리고 git 저장소가 필요합니다 — 없으면 인덱스를 키잉할 커밋 자체가 없습니다.",
    statusTitle: "impact 를 믿기 전에 status 를 보세요",
    statusDesc: "impact 가 아는 것은 전부 해석된 import edge 에서 나옵니다. imports 비율이 낮으면 그래프가 불완전하고, 그때 빈 blast radius 는 '없음'이 아니라 '모름'입니다. status 는 grammar 로드 실패도 경고합니다 — 어떤 언어가 조용히 인덱싱되지 않는 다른 한 경로입니다.",
    statusCode: `files:   412
symbols: 1530  (function 902, method 341, class 187, type 100)
edges:   3688  (CALLS 3145, IMPORTS 543)
imports: 543/543 resolved (100%)
commit:  1a2b3c4`,
    statusNote: "(예시 수치입니다.) 중요한 것은 imports 줄입니다. impact 가 아는 것은 전부 해석된 import edge 에서 나오므로, 해석률이 낮으면 그래프가 불완전하다는 뜻이고 그때 빈 blast radius 는 '없음'이 아니라 '알 수 없음'입니다. ./x.js specifier 를 그것을 만들어내는 x.ts 에 대응시키지 못하는 해석기는 여기서 0을 보고합니다 — 그래서 '인덱싱이 돌았는가'로 추론하지 않고 해석률을 화면에 띄웁니다.",
    locationTitle: "인덱스가 있는 곳",
    locationDesc: ".reap/.index/ 안에 manifest.json 과 gzip 된 그래프 하나로 있고, reap init 과 reap update 가 .gitignore 에 추가합니다. 프로젝트를 지우면 인덱스도 함께 사라지고 홈 디렉토리에는 아무것도 쌓이지 않습니다. gitignore 하는 이유는 크기가 아닙니다 — 인덱스를 커밋하면 그것을 담은 커밋을 다시 인덱싱해야 하고, 이 과정은 끝나지 않습니다. .reap/.index/ 는 언제 지워도 안전합니다. 다음 명령이 다시 만듭니다.",
    whenTitle: "언제 쓰는가",
    whenDesc: "둘은 상호보완적입니다 — 인덱스는 file:line 으로 답하고, 그것을 읽으면 됩니다.",
    whenHeaders: ["도구", "질문이 이럴 때"],
    whenItems: [
      ["reap index", "이건 어디에 정의됐나, 누가 부르나, 이 파일에 무엇이 의존하나, 이 변경의 blast radius 는 어디까지인가"],
      ["Grep / Glob", "리터럴 문자열, 주석, 설정 파일, grammar 가 없는 언어, 그리고 아직 커밋하지 않은 모든 것"],
    ],
  },

  // Self-Evolving Page
  selfEvolvingPage: {
    title: "자기 진화 기능",
    breadcrumb: "가이드",
    intro: "REAP은 정적인 프레임워크가 아닙니다. AI가 비전과 메모리에서 목표를 자동으로 선택하고, 인간이 자연어 피드백으로 적합성을 판단하며, 파이프라인이 맥락의 명확도에 따라 소통 스타일을 조정합니다. 이러한 기능들이 함께 작동하여 프로젝트와 함께 진정으로 진화하는 개발 파이프라인을 만듭니다.",
    gapDrivenTitle: "갭 기반 목표 선택",
    gapDrivenDesc: "각 Generation 끝(adapt 단계)에서 AI는 프로젝트의 비전과 현재 상태 사이의 갭을 분석하여 다음 목표를 제안합니다. 이것이 REAP을 자기 진화하게 만드는 핵심 메커니즘입니다.",
    gapDrivenSteps: [
      "vision/goals.md에서 미완료 목표 읽기",
      "우선순위 부스트를 위해 대기 중인 백로그 항목과 교차 참조",
      "영향도로 순위 지정 — 관련 백로그 작업이 있는 목표가 높은 점수",
      "인간의 승인을 위해 최고 후보를 제안",
    ],
    gapDrivenNote: "크루즈 모드에서는 인간의 개입 없이 Generation 간에 목표 선택이 자동으로 이루어집니다.",
    fitnessTitle: "인간이 적합성을 판단",
    fitnessDesc: "정량적 지표는 없습니다. 적합성 단계에서의 인간의 자연어 피드백이 유일한 적합성 신호입니다. AI는 자신의 성공을 점수화하는 것이 명시적으로 금지되어 있으며, 자기 평가(메타인지)만 허용됩니다.",
    fitnessNote: "이를 통해 프로젝트가 AI가 최적화할 수 있는 것이 아닌, 인간이 가치 있게 여기는 방향으로 진화합니다.",
    clarityTitle: "명확도 기반 상호작용",
    clarityDesc: "AI는 현재 맥락이 얼마나 잘 정의되어 있는지 동적으로 평가하고 그에 따라 소통의 깊이를 조정합니다. 명확도는 각 Generation 시작 시 학습 단계에서 평가됩니다.",
    clarityHeaders: ["명확도", "신호", "AI 행동"],
    clarityRows: [
      ["High", "명확한 목표, 정의된 작업, 확립된 패턴", "최소한의 질문으로 실행. 결과 보고."],
      ["Medium", "방향은 있으나 세부 사항 불명확", "트레이드오프가 있는 2-3개 옵션 제시. 인간이 선택."],
      ["Low", "모호한 목표, 상충하는 제약", "예시를 통한 적극적 대화로 공유된 이해 구축."],
    ],
    cruiseTitle: "크루즈 모드",
    cruiseDesc: "N개의 Generation을 자율 실행으로 사전 승인합니다. AI가 비전 갭과 백로그 작업에서 목표를 선택하고, 전체 라이프사이클을 실행하며, 각 Generation을 자기 평가(자기 점수화가 아닌)합니다.",
    cruiseActivation: "활성화:",
    cruiseActivationDesc: "config.yml에 cruiseCount: 1/5를 설정합니다. 카운터는 각 Generation 완료 후 증가합니다.",
    cruiseGoalSelection: "목표 선택:",
    cruiseGoalSelectionDesc: "adapt 중에 AI가 vision/goals.md와 현재 상태 간의 갭을 분석한 후 가장 가치 있는 다음 목표를 선택합니다.",
    cruiseFitness: "적합성:",
    cruiseFitnessDesc: "크루즈 모드에서 적합성 단계는 인간 피드백을 기다리는 대신 자기 평가(메타인지)를 사용합니다. AI는 자신의 성공을 점수화하는 것이 명시적으로 금지되어 있습니다.",
    cruisePause: "일시정지 조건:",
    cruisePauseDesc: "크루즈는 다음 경우에 자동으로 일시정지하고 인간의 입력을 요청합니다: (1) 불확실성이 AI의 신뢰 임계값을 초과할 때, (2) 인간의 판단이 필요한 결정일 때 (예: 호환성을 깨는 API 변경), (3) 백로그에 상충하는 우선순위가 있을 때. 모든 N개의 Generation이 완료된 후 인간이 일괄 검토합니다.",
    memoryTitle: "메모리 시스템",
    memoryDesc: "메모리는 AI가 세션과 Generation 간에 맥락을 유지하는 자유 형식 기록 시스템입니다. Genome(수정 제한)이나 Lineage(시간이 지나면 압축)와 달리 메모리는 항상 접근 가능하고 자유롭게 쓸 수 있습니다.",
    // reap:carrier(memory-tier-classification)
    memoryHeaders: ["계층", "역할", "판단 기준", "Pruning"],
    memoryRows: [
      ["shortterm", "세션 핸드오프", "\"지금 당장 필요한가?\"", "매 Generation 교체 — 누적하지 않음"],
      ["midterm", "진행 중인 트랙", "\"아직 완료되지 않은 큰 트랙인가?\"", "트랙 완료 시 교훈을 승격한 뒤 삭제"],
      ["longterm", "설계 교훈", "\"이 교훈이 다음 Generation의 같은 실수를 막는가?\"", "Genome에 이미 있는 항목은 제거"],
    ],
    memoryRulesTitle: "규칙:",
    memoryRules: [
      "언제든지 읽기와 쓰기 — 단계 제한 없음, 허가 불필요",
      "수명이 아니라 \"무엇을 위한 내용인가\"로 분류. 수명 판단은 미래를 예측해야 해서 오분류와 비대화를 낳았음",
      "완료됐고 남길 교훈도 없다면 기록하지 않음 — lineage와 git history가 이미 보존함",
      "Pruning은 reflect phase의 의무 — 선택적 정리가 아님",
      "비대화는 실패 신호: longterm 50줄, midterm 70줄을 넘으면 pruning 누락. 빈 파일은 유효한 상태",
    ],
    visionEvolutionTitle: "비전 & 갭 기반 진화",
    visionEvolutionDesc: "비전은 각 Generation의 주요 동력입니다. .reap/vision/goals.md 파일이 프로젝트의 북극성 목표를 정의합니다. adapt 단계에서 AI는 비전 목표와 코드베이스의 현재 상태를 비교하는 갭 분석을 수행합니다.",
    visionSteps: [
      { title: "1. 목표 정의", desc: "인간이 goals.md에 상위 수준 목표를 작성합니다. 각 목표는 마크다운 체크박스 항목입니다. 하위 목표를 위해 중첩할 수 있습니다." },
      { title: "2. 갭 분석 (adapt 단계)", desc: "AI가 미완료 목표를 현재 코드베이스, 환경, Generation 이력과 비교합니다. 가장 가치 있는 갭을 식별하고 다음 Generation의 목표로 제안합니다." },
      { title: "3. 자동 체크 표시", desc: "Generation이 비전 목표를 달성하면 AI가 adapt 단계에서 goals.md의 해당 체크박스를 표시합니다. 이를 통해 프로젝트 진행 상황을 지속적으로 볼 수 있습니다." },
      { title: "4. 지속적 순환", desc: "비전도 진화합니다. 인간이 프로젝트 방향이 바뀔 때 목표를 업데이트합니다. AI는 완료된 목표와 남은 목표를 모두 참조하여 궤적을 유지합니다." },
    ],
  },

  // Vision Page
  visionPage: {
    title: "비전",
    breadcrumb: "가이드",
    intro: "비전은 방향을 이끄는 레이어입니다. 인간이 프로젝트의 방향을 정의하고 — 목표, 마일스톤, 우선순위를 설정합니다. AI는 adapt 단계에서 비전을 참조하여 갭을 분석하고 다음 목표를 제안하지만, 비전은 인간이 소유합니다.",
    structureTitle: "구조",
    goalsTitle: "목표",
    goalsDesc: "goals.md는 프로젝트의 장기 목표를 체크리스트로 포함합니다. adapt 단계에서 AI가 비전과 현재 상태 간의 갭을 분석하여 다음 Generation의 목표를 제안합니다. 완료된 목표는 자동으로 체크됩니다.",
    memoryTitle: "메모리",
    memoryDesc: "메모리는 AI가 세션과 Generation 간에 맥락을 유지하는 자유 형식 기록 시스템입니다. genome(수정 제한이 있는)이나 lineage(압축되는)와 달리 메모리는 항상 접근 가능하고 자유롭게 쓸 수 있습니다.",
    memoryHeaders: ["계층", "역할", "판단 기준"],
    memoryRows: [
      ["Shortterm", "세션 핸드오프 — 다음 세션에 넘길 맥락", "\"지금 당장 필요한가?\""],
      ["Midterm", "진행 중인 트랙 — 여러 Generation에 걸친 작업", "\"아직 완료되지 않은 큰 트랙인가?\""],
      ["Longterm", "설계 교훈 — 반복 참조할 가치가 있는 것", "\"같은 실수를 막는가?\""],
    ],
    whenToUpdateTitle: "업데이트 시점",
    whenToUpdateItems: [
      { label: "Reflect 단계", desc: "메모리를 업데이트하기 자연스러운 시점 (shortterm은 매 Generation 필수)" },
      { label: "언제든지", desc: "유용한 맥락이 발생하면 어떤 단계에서든 메모리를 업데이트할 수 있음" },
      { label: "Shortterm 정리", desc: "처리된 항목 제거" },
    ],
    whatNotTitle: "메모리에 쓰지 말 것",
    whatNotItems: [
      "코드 변경 세부 사항 — environment에 속함",
      "테스트 수나 빌드 상태 — artifact에 속함",
      "이미 genome에 있는 원칙 — 중복 금지",
    ],
    gapDrivenTitle: "갭 기반 진화",
    gapDrivenDesc: "Completion의 adapt 단계에서 AI는:",
    gapDrivenSteps: [
      "goals.md를 읽고 백로그를 스캔",
      "미완료 목표와 대기 중인 작업을 식별",
      "현재 프로젝트 상태와 교차 참조",
      "가장 영향력 있는 갭에 기반하여 다음 Generation의 목표를 제안",
    ],
  },

  // Migration Guide Page
  migrationGuidePage: {
    title: "마이그레이션 가이드 (v0.15 → v0.16)",
    breadcrumb: "기타",
    intro: "REAP v0.16은 자기 진화 파이프라인 아키텍처를 기반으로 완전히 재작성되었습니다. 라이프사이클, genome 구조, 구성, 비전 시스템이 모두 재설계되었습니다. 가이드된 마이그레이션 도구가 자동으로 전환을 처리합니다.",
    whyMigrateTitle: "왜 마이그레이션하나요?",
    whyMigrateItems: [
      "라이프사이클 재설계: learning이 첫 번째 단계로 objective를 대체",
      "Genome이 3개의 집중 파일로 재구성 (application.md, evolution.md, invariants.md)",
      "세대 간 맥락 유지를 위한 3계층 메모리의 비전 레이어",
      "Genome 우선 조정이 있는 Merge 라이프사이클",
      "파일 기반 Hook이 인라인 Hook 구성을 대체",
    ],
    stepsTitle: "마이그레이션 단계",
    step1: "v0.16을 전역으로 설치합니다. v0.16 스킬이 자동 배포되고 레거시 v0.15 프로젝트 레벨 스킬이 제거됩니다.",
    step2: "프로젝트에서 Claude Code를 열고 마이그레이션 명령을 실행합니다.",
    step3: "5단계 가이드 마이그레이션을 따릅니다:",
    step3Headers: ["단계", "수행 내용", "역할"],
    step3Rows: [
      ["confirm", "변경 사항을 표시하고 .reap/v15/에 백업 생성", "검토 및 확인"],
      ["execute", "디렉토리 재구성, config/hooks/lineage/backlog 마이그레이션", "자동"],
      ["genome-convert", "AI가 v0.15 파일에서 새 3파일 구조로 genome 재구성", "AI 작업 검토"],
      ["vision", "vision/goals.md와 메모리 계층 파일 설정", "프로젝트 방향 제공"],
      ["complete", "마이그레이션 결과 요약", "확인"],
    ],
    step4: "마이그레이션 성공 여부를 확인합니다.",
    whatChangesTitle: "변경 사항",
    whatChangesHeaders: ["영역", "v0.15", "v0.16"],
    whatChangesRows: [
      ["Lifecycle", "objective → planning → impl → validation → completion (5단계)", "learning → planning → impl → validation → completion (4단계)"],
      ["Genome", "다수 파일, 평면 구조", "3개 파일: application.md + evolution.md + invariants.md"],
      ["Config", "JSON 기반 구성", "YAML 기반 config.yml (cruiseCount, strictEdit, strictMerge, autoSubagent)"],
      ["Vision", "비전 시스템 없음", "vision/goals.md + 3계층 메모리"],
      ["Hooks", "인라인 구성", "파일 기반: .reap/hooks/{event}.{name}.{md|sh}"],
      ["Environment", "단일 지식 파일", "2계층: summary.md (항상 로드) + domain/ (온디맨드)"],
    ],
    interruptedTitle: "중단된 마이그레이션",
    interruptedDesc: "마이그레이션이 중단되면 (API 오류, 세션 연결 끊김 등), 진행 상태가 .reap/migration-state.yml에 저장됩니다. 이 파일은 완료된 단계를 추적합니다.",
    interruptedResume: "재개하려면:",
    interruptedResumeDesc: "/reap.update를 다시 실행하세요. 완료된 단계를 건너뛰고 중단된 곳부터 계속합니다.",
    interruptedRestart: "처음부터 다시 하려면:",
    interruptedRestartDesc: ".reap/migration-state.yml을 삭제하고 /reap.update를 다시 실행하세요.",
    backupTitle: "백업",
    backupDesc: "모든 v0.15 파일은 confirm 단계에서 .reap/v15/에 보존됩니다. 이것은 마이그레이션 전 상태의 완전한 스냅샷입니다.",
    backupItems: [
      "백업은 파괴적인 변경이 발생하기 전에 생성됩니다",
      "마이그레이션이 작동하는지 확인한 후 (/reap.status, /reap.evolve) .reap/v15/를 안전하게 삭제할 수 있습니다",
      "모든 것이 작동하는지 확인하기 위해 최소 하나의 전체 Generation 동안 백업을 유지하세요",
    ],
    deprecatedTitle: "지원 중단 명령어",
    deprecatedDesc: "여러 v0.15 슬래시 명령어가 v0.16에서 이름이 변경되거나 통합되었습니다.",
    deprecatedHeaders: ["v0.15 명령어", "v0.16 대체", "비고"],
    deprecatedRows: [
      ["/reap.sync", "/reap.knowledge", "genome, environment, 맥락 지식 관리"],
      ["/reap.refreshKnowledge", "/reap.knowledge reload", "디스크에서 모든 지식 다시 로드"],
      ["/reap.objective", "/reap.run", "단계별 명령어가 reap run <stage>로 대체"],
      ["/reap.complete", "/reap.run", "단계별 명령어가 reap run <stage>로 대체"],
    ],
    deprecatedNote: "레거시 v0.15 프로젝트 레벨 스킬 파일은 npm install 시 자동으로 제거됩니다. .claude/commands/에 남아 있으면 안전하게 삭제할 수 있습니다.",
  },

  // Release Notes Page
  releaseNotes: {
    title: "릴리즈 노트",
    description: "REAP 릴리즈별 변경 사항 — 새 명령, 동작 변경, 그리고 기존 프로젝트에 필요한 마이그레이션 절차.",
    breadcrumb: "기타",
    versions: [
      {
        version: "0.17.6",
        notes: "**REAP 에 code index 가 내장됐습니다.** 설치할 것도 포트도 상주 프로세스도 없습니다 — `reap index status`, `reap index impact <file>`, `reap index search <query>`, `reap index callers/callees <symbolId>`. 15개 언어를 지원하며 네이티브 빌드가 없습니다. **blast radius 가 표준 TypeScript 프로젝트에서 항상 0을 반환하고 있었습니다** — 5개월간. resolver 가 `./x.js` specifier 를 그것을 만들어내는 `x.ts` 에 대응시키지 못했기 때문입니다. 테스트 130개가 통과했고 CI 도 내내 초록이었습니다. 모든 검사가 '인덱싱이 돌았는가'를 물었고 '결과가 말이 되는가'는 아무도 묻지 않았기 때문입니다. **그래서 이제 `reap index status` 가 import 해석률을 보고하고**, 릴리즈 게이트는 '심볼 수 > 0' 이 아니라 알려진 관계를 찾아내는지를 요구합니다. **인덱싱은 커밋 기준입니다** — REAP 전체 인덱싱이 약 0.3초이고, HEAD 가 움직이면 질의가 스스로 갱신하며, 커밋되지 않은 작업은 의도적으로 인덱싱하지 않습니다. 인덱스는 `.reap/.index/` 에 있고 gitignore 됩니다. **`reap uninstall`** 은 npm 이 지우지 못하는 것을 지웁니다 — slash command, agent 정의, `~/.reap/`, SessionStart hook 항목. npm 10 과 12 모두 uninstall hook 을 실행하지 않아 `npm uninstall -g` 는 이것들을 그대로 남깁니다. **배포되는 genome 이 이제 코드를 고치기 전에 `environment/source-map.md` 를 읽으라고 지시하고**, greenfield `reap init` 이 그 파일을 생성합니다 — 지금까지는 만들지 않았기 때문에 규칙만 옮겼다면 신규 프로젝트의 agent 가 매번 없는 파일을 찾게 됐을 것입니다. `summary.md` 는 매 세션 로드되지만 source-map 은 아니며, 그래서 구조 문서가 열리지 않은 채 그것이 서술하는 코드가 수정될 수 있었습니다. 기존 프로젝트는 자기 `genome/evolution.md` 를 소유하므로 v0.17.6 migration note 가 규칙을 전달하며, 파일 자체가 없을 때 무엇을 할지도 함께 안내합니다. 같은 note 가 그 파일의 나머지 절반도 함께 고칩니다 — reflect 가 구조 서술을 `summary.md` 에 유지하라고 말하고 있었고, 그대로 두면 새 규칙이 **아무도 쓰라고 하지 않는 파일**을 가리키게 됩니다. **프로젝트에 REAP 을 설치해도 전역 설치가 더 이상 바뀌지 않습니다.** auto-update 는 \"지금 설치된 버전\"을 `reap --version` 으로 물었습니다 — 그것은 **PATH 에서 먼저 잡히는 바이너리**이지 그 코드가 속한 패키지가 아닙니다 — 그리고 무조건 전역 설치를 업그레이드했습니다. 전역에 낡은 REAP 이 있는 상태에서 프로젝트에 설치하면 postinstall 이 **언급한 적도 없는 전역 설치**를 올렸습니다. 이제 REAP 은 자기 `package.json` 을 읽으며, 자기 자신을 올리는 것은 **전역 설치일 때뿐**입니다. 프로젝트 로컬 설치·`npx` 실행·소스 체크아웃은 그대로 둡니다. **그리고 `autoUpdate: false` 가 이제 실제로 자동 업데이트를 끕니다.** 이 스위치는 v0.16 부터 `.reap/config.yml` 에 있었습니다 — `reap init` 이 만들고, `reap update` 가 보존하고, `reap config` 가 보여주고, `/reap.config` skill 이 \"auto-update enabled\" 라고 문서화하고, `reap fix` 가 타입까지 검사하는데 — **아무도 읽지 않았습니다.** `false` 로 두면 `false` 라고 보여주면서 전역 설치를 갈아치웠습니다. 이제 끄면 **설치만** 멈춥니다. 하한 미달 경고 — 당신의 사본이 너무 낡아 REAP 이 자동으로 고칠 수 없다는 그 메시지 — 는 그대로 도달합니다. 자동 수정을 거절한 사람이야말로 그 사실을 들어야 하기 때문입니다. `reap update` 와 직접 치신 `npm install -g` 는 영향받지 않습니다 — 이 플래그가 끄는 것은 **REAP 이 스스로 하는 설치 하나**입니다. config 를 아예 읽을 수 없으면 자동 업데이트는 켜진 채로 둡니다. npm 은 postinstall 을 패키지 디렉토리에서 실행하고 거기엔 프로젝트 config 가 없으므로, \"읽을 수 없음\"을 \"꺼짐\"으로 읽으면 요청한 사람이 아니라 **모두에게** 꺼졌을 것입니다. 도달 범위를 분명히 적어 둡니다: 이 플래그가 다스리는 것은 **되풀이되는 경로 — 매 세션 시작**이며, 방금 직접 친 `npm install` 의 postinstall 은 아닙니다. 그것은 여러분의 프로젝트 config 가 없는 곳에서 돌기 때문입니다.",
      },
      {
        version: "0.17.5",
        notes: "**`reap run push` 가 git 의 실제 오류를 보고**하고, **`reap help` 에 `/reap.run` 과 `/reap.report`** 가 나옵니다. **REAP 이 첫 실행 때 자기 통합을 직접 설치합니다** — npm 12 가 전역 설치의 install script 를 차단해 slash command·agent 정의·session hook 이 놓이지 않았고 오류조차 나지 않았습니다.",
      },
      {
        version: "0.17.4",
        notes: "**REAP 이 OpenCode 가 실제로 읽는 위치에 설치합니다** — `~/.config` 는 기본값일 뿐이고 OpenCode 는 XDG base directory 규격을 따릅니다. `XDG_CONFIG_HOME` 을 설정한 사용자는 slash command 19개와 agent 정의 2개를 하나도 받지 못했고, 오류조차 나지 않았습니다. 업그레이드 후 `reap install-skills` 를 다시 실행하세요. **slash command 가 더 이상 agent 를 자처하지 않습니다** — 설치되던 `reap.*.md` 에 `mode: subagent` 가 붙어 있었고, 재설치하면 정리됩니다. **자기진단 게이트가 두 클라이언트를 봅니다** — 프로젝트를 `agentClient: opencode` 로 전환해 `opencode agent list` 가 REAP agent 둘을 로드하는지 요구하며, XDG 결함은 이 검사가 첫 CI 실행에서 찾았습니다. **테스트 스위트도 매 push 마다 다시 실행됩니다** (스위트를 보관한 private 저장소에서).",
      },
      {
        version: "0.17.3",
        notes: "**REAP 설치가 더 이상 OpenCode 를 깨뜨리지 않습니다** — agent 정의를 Claude Code 스키마 그대로 복사했고, OpenCode 가 읽지 못하는 파일 하나가 설정 전체를 무효화해 모든 `opencode` 명령이 실패했습니다. 이제 클라이언트별로 변환합니다. **`fix --check` 가 설치 위치를 더 이상 경고하지 않습니다** — installer 는 `~/.claude/commands/` 에 설치하는데 checker 가 v0.15 잔재로 표시해 해소 불가능한 경고가 발생했습니다(issue #22). 이제 경로는 단일 소유자를 가지며 주입으로 전달됩니다. **릴리즈 게이트 2종**: `check-self-diagnosis.sh` 는 실제 배포 tarball 을 격리 HOME 에 설치해 `fix --check` 가 깨끗한지 요구하고(CI + publish 전), `check-agent-integration.sh` 는 헤드리스 agent 로 slash command 가 실제 노출되는지 확인합니다(릴리즈 전). 그 외: 신규 init 이 자신의 `invariants.md` 를 placeholder 로 오판하던 문제, `init --repair` 가 갱신한 CLAUDE.md 를 '이미 있음'으로 보고하던 문제 수정.",
      },
      {
        version: "0.17.2",
        notes: "**Reflect phase pruning 정책** — reflect prompt가 이제 \"무엇을 쓸지\"뿐 아니라 **\"무엇을 지울지\"**를 지시합니다. Memory tier가 lifespan이 아닌 content-type(세션 핸드오프 / 진행 중 트랙 / 설계 교훈) 기준으로 분류되며, 4단계 decision tree와 tier별 pruning이 추가됐습니다 — shortterm은 매 generation 교체, 완료된 midterm 트랙은 교훈을 승격한 뒤 삭제, longterm은 genome과 중복되는 항목을 제거. `environment/summary.md`에도 대응하는 지시가 추가되어 per-generation changelog를 누적하는 대신 낡은 서술을 제거합니다. `reap init`이 동일 규칙을 `genome/evolution.md`에 반영하며, 기존 프로젝트에는 v0.17.2 migration note가 제공됩니다. `reap fix --check`는 memory tier나 `environment/summary.md`가 가이드라인 크기를 초과하면 경고합니다 — 경고만 하며 자동 삭제하지 않습니다. issue #21 해결. Genome 크기 경고가 근거를 명시한 파일별 값(`invariants` 50 / `application` 250 / `evolution` 300)으로 바뀌었습니다 — 기존의 공통 100줄 기준은 배포되는 `evolution.md` 자체가 만족할 수 없어 `reap init` 직후부터 경고가 떴습니다. 릴리즈 게이트(`scripts/check-docs-version.sh`)가 릴리즈 노트와 reap.cc 5개 로케일을 `package.json` 과 대조하며(로케일 간 일관성 포함), reap.cc 도 더 이상 폐기된 lifespan 기반 memory 모델을 가르치지 않습니다.",
      },
      {
        version: "0.17.1",
        notes: "**Migration instruction layer** — `reap update`가 프로젝트의 `lastMigratedVersion`과 설치된 REAP 버전의 gap을 감지해, 해당하는 버전별 migration 지시를 SessionStart context에 주입합니다. Agent는 업그레이드 후 기존 artifact를 재조직하는 구체적 지시를 받으며, 적용 완료 후 `reap update --mark-migrated`를 실행합니다. **Memory 구조 개선** — vision memory를 content-type 기반 계층으로 전환하고 reflect phase에 필수 pruning 정책을 추가.",
      },
      {
        version: "0.17.0",
        notes: "**Evaluator Agent** — fitness phase 통합 완료: fitness 단계에서 evaluator 실행, prior concerns 프롬프트 표시, high-severity concern 시 cruise mode 자동 중단.",
      },
      {
        version: "0.16.6",
        notes: "**Evaluator Agent** (opt-in) — `.reap/config.yml`에 `evaluator: true` 설정 시 validation/fitness 단계에서 `reap-evaluate` 서브에이전트가 독립 검토자로 실행됨 (advisor 모델, 필수 게이트 아님). high-severity concern 발생 시 cruise mode 자동 중단.",
      },
      {
        version: "0.16.5",
        notes: "**OpenCode 어댑터** — `agentClient: opencode` 설정으로 멀티 클라이언트 정식 지원. `opencode.json` instructions, `.opencode/plugins/reap-plugin.ts`, AGENTS.md, 그리고 `~/.config/opencode/commands/`의 슬래시 명령이 자동 관리됨. **Early-close 라이프사이클 path** — implementation/validation 단계에서 사용하는 경량 종료 (`reap run early-close`, `/reap.early-close`). 부분 가치를 보존하고 간소화된 reflect를 거쳐, 미완 task를 다음 generation용 backlog로 자동 승계. 사용자가 중단/스코프 축소 의도를 표명하면 agent가 abort/early-close/continue 세 선택지를 명시적으로 안내.",
      },
      {
        version: "0.16.4",
        notes: "누락된 npm 메타데이터 복원 (license, author, repository, homepage, keywords). GitHub Release에 release notes가 표시되지 않던 문제 수정.",
      },
      {
        version: "0.16.3",
        notes: "vision/docs를 vision/design으로 리네이밍하여 루트 docs/와의 혼동 방지. Vision에 Design 섹션 추가 (Memory와 구분되는 독립 설계 문서 공간). Evaluator Agent 설계 문서 추가. npm 호환을 위해 README 언어 링크 수정.",
      },
      {
        version: "0.16.2",
        notes: "'reap make hook' CLI 커맨드 추가 — 올바른 파일명 컨벤션과 frontmatter로 hook 파일 생성. 기본 hook conditions (always, has-code-changes, version-bumped) 및 예시 템플릿 복원. 'reap init' 시 자동 설치. 'reap make' 커맨드를 확장 가능한 디렉토리 구조로 리팩토링. docs에서 outdated된 Presets, Session Context Loading 섹션 제거.",
      },
      {
        version: "0.16.1",
        notes: "npm README 이미지 미표시 수정. docs 사이트 SPA 라우팅 복원 (404.html fallback). README 문서 링크 수정 (merge-lifecycle, agent-integration). 누락된 docs 링크 매핑 추가. README 및 workflow 변경에 대한 docs workflow 트리거 경로 추가.",
      },
      {
        version: "0.16.0",
        notes: "Self-Evolving Pipeline으로 완전 재작성. 새 genome 구조 (application.md, evolution.md, invariants.md). Learning 단계가 Objective를 대체. 명확도 기반 인터랙션. 자율 멀티 Generation 실행을 위한 크루즈 모드. 3계층 메모리(longterm/midterm/shortterm)가 포함된 Vision 레이어. Merge 라이프사이클에 genome-소스 일관성을 위한 Reconcile 단계 추가. /reap.knowledge가 /reap.sync를 대체. 2단계 /reap.abort. 조건과 순서가 있는 파일 기반 hooks.",
      },
      {
        version: "0.15.13",
        notes: "commander.js를 내장 CLI 라이브러리로 교체. 런타임 의존성: 2 -> 1.",
      },
      {
        version: "0.15.12",
        notes: "reap update 자동 업그레이드 후 릴리즈 알림이 올바르게 표시됨.",
      },
      {
        version: "0.15.11",
        notes: "reap pull이 ahead-only 브랜치에 대해 잘못 merge를 권장하던 문제 수정. 정확한 ahead/behind/diverged 감지를 위해 git rev-list 사용.",
      },
      {
        version: "0.15.10",
        notes: "릴리즈 알림 언어 매칭 수정 (예: \"korean\" -> \"ko\").",
      },
      {
        version: "0.15.9",
        notes: "reap update 후 릴리즈 알림이 표시되지 않던 문제 수정. 경로 해석이 __dirname 대신 require.resolve를 사용.",
      },
      {
        version: "0.15.8",
        notes: "config.yml에서 version 필드 제거. reap update 후 커밋되지 않은 변경 없음.",
      },
      {
        version: "0.15.7",
        notes: "UPDATE_NOTICE.md를 RELEASE_NOTICE.md로 이름 변경. 알림 내용이 인라인으로 변경 (GitHub Discussions 의존성 제거).",
      },
      {
        version: "0.15.6",
        notes: "npm 패키지에서 UPDATE_NOTICE.md 누락 수정.",
      },
      {
        version: "0.15.5",
        notes: "무결성 검사가 더 이상 source-map.md 줄 수에 대해 경고하지 않음.",
      },
      {
        version: "0.15.4",
        notes: "버그 수정 및 새 reap make backlog 명령어. lineage 아카이브, reap back nonce 체인 수정, 최근 20개 Generation에 대한 압축 보호 추가.",
      },
    ],
  },
};

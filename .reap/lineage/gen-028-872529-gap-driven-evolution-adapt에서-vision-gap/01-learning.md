# Learning — gen-028-872529

## Goal
Gap-driven Evolution — adapt에서 vision gap 기반 goal 자동 제안 + goals 자동 체크

## Source Backlog
`gap-driven-evolution-adapt에서-vision-gap-기반-goal-자동-제안-goals-자동-체크.md` (priority: high)

현재 adapt phase에서 AI가 vision/goals.md를 prompt로만 참조하며, 체계적 분석이 코드 수준에서 없음.
이번 세션에서 AI가 수동으로 수행한 과정(vision 읽기 -> gap 분석 -> backlog 우선순위 -> 다음 goal 제안)을 코드로 자동화하는 것이 목표.

## Project Overview
- REAP v0.16.0, TypeScript/Bun, 27 generations 완료
- embryo 타입, supervised mode
- completion.ts의 adapt phase가 이미 vision/goals.md를 로딩하여 prompt에 주입 중 (L169, L242-250)
- 하지만 **구조화된 파싱/분석은 없음** — 전체 텍스트를 슬라이스해서 넣을 뿐

## Key Findings

### 1. 현재 adapt phase 구조 (completion.ts)
- **L164-278**: adapt phase 전체 로직
- `paths.visionGoals`로 goals.md 원문 로딩 (L169)
- 원문의 첫 1000자를 prompt에 삽입 (L245)
- "Vision Auto-Update: Check off any goals completed" 텍스트 지시만 있음 (L248)
- Gap-driven Next Generation Selection 섹션에서 clarity 수준별 가이드 제공 (L219-234)
- **문제**: 파싱 없이 원문을 prompt에 넘기므로, AI가 매번 다시 파싱해야 함

### 2. goals.md 구조
- 섹션별 체크리스트: `### Core Stability`, `### Clarity-driven Interaction` 등
- 각 항목: `- [x] 완료 항목` 또는 `- [ ] 미완료 항목`
- 총 약 30개 항목, 7개 섹션
- 일부 항목에 `(gen-XXX)` 태그로 어느 generation에서 완료됐는지 기록

### 3. backlog.ts의 패턴 (참고용)
- `scanBacklog()`: 디렉토리 스캔 -> frontmatter 파싱 -> `BacklogItem[]` 반환
- `BacklogItem` 인터페이스: filename, path, type, status, priority, title 등
- 이 패턴을 vision.ts에도 적용 가능 (파싱 -> 구조화된 배열 반환)

### 4. prompt.ts의 vision 로딩
- `loadReapKnowledge()`에서 `paths.visionGoals` 로딩 (L42)
- `buildBasePrompt()`에서 "## Vision Goals" 섹션으로 주입 (L115-119)
- vision.ts의 분석 결과도 이 경로를 통해 주입 가능

### 5. paths.ts
- `visionGoals: join(vision, "goals.md")` — 이미 경로 정의됨
- 별도 경로 추가 불필요

## Previous Generation Reference
- gen-027: `reap fix` 명령 구현. 232 tests 전체 통과.
- 이번 goal과 직접 관련 없으나, 코드 패턴(core 모듈 추가 + CLI 통합 + 테스트)이 동일

## Backlog Review
- reap clean, reap destroy: 이번 goal과 무관, defer

## Technical Deep-Dive

### 구현 설계

**src/core/vision.ts** (신규 모듈):
```typescript
interface VisionGoal {
  title: string;
  checked: boolean;
  section: string;
  raw: string;
}

function parseGoals(content: string): VisionGoal[]
function findCompletedGoals(goals: VisionGoal[], genGoal: string, genResult?: string): VisionGoal[]
function suggestNextGoals(goals: VisionGoal[], pendingBacklog: BacklogItem[]): NextGoalCandidate[]
function buildVisionGapAnalysis(goals: VisionGoal[], pendingBacklog: BacklogItem[], genGoal: string): string
```

**completion.ts adapt phase 확장**:
- `parseGoals()` 호출하여 구조화된 goal 목록 생성
- `scanBacklog()` 호출하여 pending 항목 로딩
- `buildVisionGapAnalysis()` 결과를 prompt에 주입
- 기존의 단순 텍스트 삽입(L242-250)을 구조화된 분석으로 대체

### 테스트 계획
- **Unit tests**: vision.ts의 parseGoals, findCompletedGoals, suggestNextGoals, buildVisionGapAnalysis
- **통합 확인**: adapt phase prompt에 vision gap 분석 결과가 포함되는지

## Context for This Generation

### Clarity Level: **High**
- vision/goals.md에 구체적인 미완료 항목이 명시됨 (Gap-driven Evolution §3 아래 2개)
- backlog에 이 task가 명확하게 정의됨
- 구현 방향(vision.ts 신규 + completion.ts adapt 확장)이 구체적
- 27 generations의 lineage가 있어 코드 패턴이 안정적

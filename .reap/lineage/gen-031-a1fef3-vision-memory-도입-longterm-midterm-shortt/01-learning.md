# Learning — gen-031-a1fef3

## Goal

Vision Memory 도입 — longterm/midterm/shortterm 3-tier 자유 기록 시스템

## Source Backlog

`vision-memory-도입-longtermmidtermshortterm-3-tier-자유-기록-시스템.md` (task, high priority)

현재 REAP에서 AI의 경험적 판단, 유저와의 논의 맥락, 세션 간 핸드오프 정보가 저장될 구조화된 공간이 없음. Genome은 수정 제약이 많고, Lineage는 scan 부담 + 압축으로 소실, Goals는 목표만 다루며, `notes/next-session-prompt.md`는 임시방편.

해결: `.reap/vision/memory/` 에 3-tier Memory 시스템 도입.

## Key Findings

### 1. paths.ts 구조

`ReapPaths` 인터페이스에 경로 상수 정의. `vision`, `visionGoals`, `visionDocs` 패턴이 이미 존재. memory 경로를 동일 패턴으로 추가:
- `memory` (디렉토리): `join(vision, "memory")`
- `memoryLongterm`: `join(memory, "longterm.md")`
- `memoryMidterm`: `join(memory, "midterm.md")`
- `memoryShortterm`: `join(memory, "shortterm.md")`

### 2. prompt.ts 구조

- `ReapKnowledge` 인터페이스: guide, genome, environment, visionGoals 필드
- `loadReapKnowledge()`: `readTextFile`로 각 파일 로딩, `Promise.all` 사용
- `buildBasePrompt()`: lines 배열에 섹션별 push

Memory 추가 방식:
- `ReapKnowledge`에 `memoryShortterm`, `memoryMidterm` 필드 추가
- `loadReapKnowledge()`에서 shortterm + midterm 로딩 (항상, 작은 파일)
- `buildBasePrompt()`에서 Vision Goals 뒤에 Memory 섹션 추가

### 3. init common.ts 구조

`initCommon()`에서 `ensureDir()` + `writeTextFile()`로 디렉토리와 파일 생성. 패턴 그대로 따르면 됨:
- `ensureDir(paths.memory)` 추가
- 빈 파일 3개 생성 (초기 템플릿 헤더만)

### 4. completion.ts (reflect phase)

reflect phase prompt에서 retrospective + environment update 안내. Memory 갱신 기회도 여기에 추가:
- "3. Update memory (shortterm/midterm/longterm) if applicable" 한 줄 추가
- 강제가 아닌 AI 재량 — "if applicable"

### 5. reap-guide.md 구조

REAP Architecture, Principles, .reap/ Structure 등 섹션 구성. Memory를 다음에 추가:
- Architecture의 Vision 설명에 Memory 언급
- `.reap/ Structure`에 memory 디렉토리 추가
- Memory 전용 섹션 추가 (각 tier 역할, 규칙)

### 6. knowledge.ts

`reload`, `genome`, `environment` 서브커맨드 존재. `memory` 서브커맨드 추가 가능 — memory 파일 3개를 읽고 요약/수정 가이드 제시.

### 7. notes/next-session-prompt.md

현재 세션 핸드오프용 파일. shortterm memory가 이 역할을 대체. 파일 자체는 이번 generation에서 제거하지 않되, reap-guide.md에 "shortterm memory가 next-session-prompt를 대체함" 명시.

## Pending Backlog (이번 gen 무관)

- reap clean — 선택적 초기화 명령
- reap destroy — REAP 완전 제거 명령

## Context

- Embryo generation — genome 자유 수정 가능
- Clarity: **High** — goal이 구체적이고 구현 항목이 명확히 정의됨
- 이전 generation (gen-030): lineage 편향 분석 제거, 304 tests 통과

## Implementation Scope

7개 파일 수정/추가:
1. `src/core/paths.ts` — memory 경로 4개 추가
2. `src/core/prompt.ts` — ReapKnowledge에 memory 필드, 로딩, prompt 빌드
3. `src/cli/commands/init/common.ts` — init 시 memory 디렉토리 + 파일 생성
4. `src/cli/commands/run/completion.ts` — reflect prompt에 memory 갱신 안내
5. `src/templates/reap-guide.md` — Memory 섹션 추가
6. `src/cli/commands/run/knowledge.ts` — memory 서브커맨드 추가
7. tests — unit tests for paths, prompt (memory 로딩/빌드 검증)

# Learning — gen-003-851a08

## Goal
createBacklog 함수 복원 — v0.15 패턴 기반 표준 backlog 생성

## Key Findings

### v0.16 현재 상태
- `src/core/backlog.ts`: `scanBacklog()`, `consumeBacklog()` — 읽기/소비만 있음, 생성 함수 없음
- AI가 backlog를 직접 Write tool로 작성 → 형식 불일치 위험

### v0.15 참조 (`~/cdws/reap_v15/src/core/backlog.ts`)
- `createBacklog(backlogDir, { type, title, body?, priority? })` → filename 반환
- type 검증 (genome-change | environment-change | task)
- 표준 템플릿: frontmatter + # Title + ## Problem + ## Solution + ## Files to Change + ## Context
- `toKebabCase(title)` → filename 생성
- `revertBacklogConsumed(backlogDir, genId)` — abort 시 consumed 되돌리기

### v0.16에서 복원할 것
1. `createBacklog()` — 표준 형식으로 backlog 파일 생성
2. `toKebabCase()` — filename 생성 헬퍼
3. CLI command `reap backlog create --type --title --body --priority` — AI/사용자가 CLI로 생성 가능

### CLI command 추가 여부
v0.15에는 CLI command 없이 AI가 직접 createBacklog 함수를 호출하는 것이 아니라, AI가 파일을 직접 작성했음.
v0.16에서도 AI가 직접 파일을 작성하되, CLI command를 제공하면 형식 보장 가능.

## Clarity Level: High
- goal 명확, v0.15 코드 이미 분석 완료, 변경 대상 파일 특정됨

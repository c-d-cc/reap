# Learning — gen-017-b9f06b

## Goal
restart 명령어 제거, abort로 통합

## Source Backlog
`remove-restart-command.md` — restart와 abort가 기능적으로 겹침. 사용자 혼란 방지를 위해 abort만 유지.

## Key Findings

### 삭제 대상 파일 (2개)
1. `src/cli/commands/run/restart.ts` — restart 명령어 전체 구현
2. `src/adapters/claude-code/skills/reap.restart.md` — restart skill 파일

### 수정 대상 파일 (2개)
1. `src/cli/commands/run/index.ts` (line 14, 31) — restart import 및 handler 등록 제거
2. `src/core/maturity.ts` (line 135) — "Restart frequency" 문구 수정/제거

### 수정 불필요
- `src/cli/index.ts` — restart 관련 옵션 없음 (--goal은 run 공통 옵션)
- `src/cli/commands/run/evolve.ts` — restart 직접 언급 없음
- `src/cli/commands/run/abort.ts` — 이미 독립적으로 동작, 수정 불필요
- `tests/` — restart 참조 없음

### restart.ts 분석
- git diff 백업 → git reset --hard → life/ 정리 → 새 generation 생성
- abort와 거의 동일한 흐름이며, abort가 이미 이 기능을 대체

### maturity.ts 수정 내용
- line 135: "Restart frequency — are there fewer restarts in recent generations?" → abort 기반 문구로 변경

## Previous Generation Reference
gen-016: bash 테스트 11개를 TypeScript(bun:test)로 전환 완료. 159 tests PASS.

## Backlog Review
- claude-md-migration.md — 이번 세대와 무관
- npx-install-support.md — 이번 세대와 무관

## Context
- Clarity: **High** — 목표 명확, 변경 범위 한정적, 구체적 파일 목록 확보
- 테스트에 restart 참조 없으므로 테스트 수정 불필요

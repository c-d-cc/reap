# Implementation

## Changes
- 추가: `src/templates/commands/reap.abort.md` — abort 커맨드 템플릿
- 수정: `src/cli/commands/init.ts` — COMMAND_NAMES에 `reap.abort` 추가

## E2E Tests (16/16 pass)
- rollback: git checkout . 후 소스 원복 확인
- stash: git stash push 후 복구 확인
- hold: 소스 변경 유지 확인
- backlog: abort 메타(aborted, abortedFrom, abortReason, sourceAction, stashRef, changedFiles) 확인
- no generation: 에러 감지
- no lineage: abort 시 lineage 미기록 확인

# Planning — gen-017-b9f06b

## Goal
restart 명령어를 완전히 제거하고, abort가 유일한 중단 명령어가 되도록 한다.

## Completion Criteria
1. `src/cli/commands/run/restart.ts` 파일이 삭제됨
2. `src/adapters/claude-code/skills/reap.restart.md` 파일이 삭제됨
3. `src/cli/commands/run/index.ts`에서 restart import/handler가 제거됨
4. `src/core/maturity.ts`에서 restart 문구가 abort로 변경됨
5. TypeCheck 통과 (tsc --noEmit)
6. Build 통과 (bun build)
7. 전체 테스트 통과 (unit + e2e)
8. `reap run restart` 실행 시 "Unknown stage" 에러 출력

## Scope
변경: 4개 파일 (삭제 2 + 수정 2)
제외: abort.ts, evolve.ts, cli/index.ts, tests/

## Tasks
- [ ] T001 `src/cli/commands/run/restart.ts` — 파일 삭제
- [ ] T002 `src/adapters/claude-code/skills/reap.restart.md` — 파일 삭제
- [ ] T003 `src/cli/commands/run/index.ts` — restart import (line 14) 및 handler (line 31) 제거, 주석 수정 (line 55)
- [ ] T004 `src/core/maturity.ts` — "Restart frequency" 문구를 "Abort frequency"로 변경
- [ ] T005 검증 — typecheck, build, unit test, e2e test 실행

## Dependencies
T001~T004는 독립적, 병렬 가능. T005는 T001~T004 완료 후 실행.

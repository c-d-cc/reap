# Planning

## Summary
`src/cli/index.ts`에 Commander.js `make` 서브커맨드를 추가하고, `src/cli/commands/run/index.ts`의 COMMANDS에서 `make` 항목을 제거한다.

## Technical Context
- **Tech Stack**: TypeScript, Commander.js (CLI 프레임워크)
- **Constraints**: `run`은 lifecycle stage 전용. `make`는 lifecycle이 아니므로 최상위 커맨드여야 함.

## Tasks
- [x] T001 `src/cli/commands/run/index.ts` -- COMMANDS 맵에서 `make` 항목 제거
- [x] T002 `src/cli/index.ts` -- `make` Commander.js 서브커맨드 추가 (target + 나머지 인자를 execute에 전달)
- [x] T003 타입 체크 및 빌드 검증 (`bunx tsc --noEmit`)

## Dependencies
- T002는 T001과 독립적 (동시 수행 가능)
- T003은 T001, T002 완료 후

## Regression
이 generation은 gen-162-616395의 recovery. `make`가 `run` 하위에 잘못 등록된 것을 최상위로 이동하는 것이 핵심.

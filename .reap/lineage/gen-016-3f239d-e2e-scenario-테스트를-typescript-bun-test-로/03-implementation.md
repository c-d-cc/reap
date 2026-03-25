# Implementation Log — gen-016-3f239d

## Completed Tasks

| Task | Description | Files |
|------|-------------|-------|
| T001 | 공통 헬퍼 생성 (cli, setupProject, setupGitProject, writeArtifact, advanceStage, completeGeneration, cleanup, fileExists, dirExists, fileContains) | tests/helpers/setup.ts |
| T002 | test-init-basic.sh → init-basic.test.ts (9 tests) | tests/e2e/init-basic.test.ts |
| T003 | test-init-claude-md.sh → init-claude-md.test.ts (7 tests, 3 scenarios) | tests/e2e/init-claude-md.test.ts |
| T004 | test-make-backlog.sh → make-backlog.test.ts (11 tests) | tests/e2e/make-backlog.test.ts |
| T005 | test-backlog-consume.sh → backlog-consume.test.ts (7 tests) | tests/e2e/backlog-consume.test.ts |
| T006 | test-archive-backlog.sh → archive-backlog.test.ts (9 tests, full lifecycle) | tests/e2e/archive-backlog.test.ts |
| T007 | test-cli-commands.sh → cli-commands.test.ts (7 tests) | tests/e2e/cli-commands.test.ts |
| T008 | test-legacy-init.sh → legacy-init.test.ts (13 tests, greenfield/adoption/override/edge cases) | tests/e2e/legacy-init.test.ts |
| T009 | test-init-start-status.sh → init-start-status.test.ts (4 tests) | tests/scenario/init-start-status.test.ts |
| T010 | test-legacy-lifecycle.sh → lifecycle.test.ts (12 tests, full lifecycle) | tests/scenario/lifecycle.test.ts |
| T011 | test-legacy-merge.sh → merge.test.ts (12 tests, merge lifecycle + back regression) | tests/scenario/merge.test.ts |
| T012 | test-legacy-multi-generation.sh → multi-generation.test.ts (13 tests, 2 generations + backlog carry-over) | tests/scenario/multi-generation.test.ts |
| T013 | package.json scripts 변경 (bash → bun test) + .sh 파일 15개 삭제 | package.json |
| T014 | 전체 테스트 검증 — unit 55, e2e 63, scenario 41 = 159 tests, 324 assertions 전부 PASS | — |

## Architecture Decisions

- **CLI 실행**: `Bun.$` shell literal 사용. `$\`node ${CLI_PATH} ${args}\`.cwd(dir).quiet().text()` 패턴.
  - `quiet()` 사용으로 stderr 출력 억제
  - JSON 파싱 실패 시 `_raw` 필드로 원문 반환
- **cliExitCode()**: try/catch로 non-zero exit 처리 (Bun.$은 non-zero에서 throw)
- **advanceStage()**: work phase 진입 → artifact 작성 → complete 단계를 하나의 함수로 추상화
- **completeGeneration()**: completion의 reflect → fitness → adapt → commit 4단계를 하나로 추상화
- **init 출력 구조**: `mode`가 `context.mode`에 위치, `status`의 `stage`가 `context.generation.stage`에 위치 — bash 테스트에서는 grep으로 검사했으나 TypeScript에서는 정확한 JSON 경로 사용

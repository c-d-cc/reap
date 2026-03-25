# Planning — gen-016-3f239d

## Goal

e2e/scenario bash 테스트를 TypeScript(bun:test)로 전환하여 병렬 실행 가능하게 하고, 공통 setup helper를 제공하여 테스트 작성을 간소화한다.

## Completion Criteria

1. `tests/helpers/setup.ts` 존재하고 cli(), setupProject(), setupGitProject(), cleanup() 함수 export
2. tests/e2e/ 내 7개 bash 테스트가 .test.ts로 전환되어 `bun test tests/e2e/` 통과
3. tests/scenario/ 내 4개 bash 테스트가 .test.ts로 전환되어 `bun test tests/scenario/` 통과
4. package.json의 test:e2e, test:scenario scripts가 bun test 기반으로 변경
5. 기존 bash 파일(.sh) 삭제
6. `npm run test` 전체 통과 (unit + e2e + scenario)

## Approach

- **CLI 실행**: `Bun.$` shell literal로 `node dist/cli/index.js` 호출 → stdout text → JSON.parse
- **Temp dir**: `mkdtemp` + `afterAll(cleanup)` 패턴 (unit test와 동일)
- **Git 필요 테스트**: `setupGitProject()` helper가 git init + config 자동화
- **복잡한 시나리오 (merge, multi-gen)**: bash와 동일한 로직을 TypeScript로 직접 전환. stage 순회를 helper 함수로 추상화

## Scope

**변경 대상:**
- tests/helpers/setup.ts (신규)
- tests/e2e/*.test.ts (신규 7개)
- tests/scenario/*.test.ts (신규 4개)
- package.json scripts
- tests/e2e/*.sh, tests/scenario/*.sh (삭제)
- tests/e2e/run.sh, tests/scenario/run.sh (삭제)

**Out of scope:**
- tests/unit/ (이미 TypeScript)
- src/ 코드 변경 없음

## Tasks

- [ ] T001 `tests/helpers/setup.ts` — 공통 헬퍼 생성 (cli, setupProject, setupGitProject, writeArtifact, advanceStage, cleanup)
- [ ] T002 `tests/e2e/init-basic.test.ts` — test-init-basic.sh 전환
- [ ] T003 `tests/e2e/init-claude-md.test.ts` — test-init-claude-md.sh 전환
- [ ] T004 `tests/e2e/make-backlog.test.ts` — test-make-backlog.sh 전환
- [ ] T005 `tests/e2e/backlog-consume.test.ts` — test-backlog-consume.sh 전환
- [ ] T006 `tests/e2e/archive-backlog.test.ts` — test-archive-backlog.sh 전환
- [ ] T007 `tests/e2e/cli-commands.test.ts` — test-cli-commands.sh 전환
- [ ] T008 `tests/e2e/legacy-init.test.ts` — test-legacy-init.sh 전환
- [ ] T009 `tests/scenario/init-start-status.test.ts` — test-init-start-status.sh 전환
- [ ] T010 `tests/scenario/lifecycle.test.ts` — test-legacy-lifecycle.sh 전환
- [ ] T011 `tests/scenario/merge.test.ts` — test-legacy-merge.sh 전환
- [ ] T012 `tests/scenario/multi-generation.test.ts` — test-legacy-multi-generation.sh 전환
- [ ] T013 `package.json` scripts 업데이트 + 기존 .sh 파일 삭제
- [ ] T014 전체 테스트 실행 검증 (`npm run test`)

## Dependencies

- T001 → T002~T012 (모든 테스트가 helper 사용)
- T002~T012 → T013 (전환 완료 후 .sh 삭제)
- T013 → T014 (전체 검증)

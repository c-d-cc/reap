---
id: gen-016-3f239d
type: embryo
goal: "e2e/scenario 테스트를 TypeScript(bun:test)로 전환 — 병렬 실행 + setup helper"
parents: ["gen-015-a006e7"]
---
# gen-016-3f239d
e2e 7개, scenario 4개 bash 테스트를 TypeScript(bun:test)로 전환 완료. 공통 setup helper(`tests/helpers/setup.ts`)를 도입하여 테스트 작성 간소화. 기존 .sh 파일 15개 삭제, package.json scripts 업데이트.

### Changes
- tests/helpers/setup.ts: 공통 헬퍼 (cli, setupProject, setupGitProject, advanceStage, completeGeneration 등)
- tests/e2e/: 7개 .test.ts (63 tests, 119 assertions)
- tests/scenario/: 4개 .test.ts (41 tests, 68 assertions)
- package.json: test:e2e, test:scenario → bun test 기반
- 15개 .sh 파일 삭제 (7 e2e + run.sh, 4 scenario + run.sh)

### Validation: PASS (typecheck, build, unit 55/55, e2e 63/63, scenario 41/41 = 159 tests)
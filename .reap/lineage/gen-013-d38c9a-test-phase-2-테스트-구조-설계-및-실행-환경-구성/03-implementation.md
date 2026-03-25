# Implementation — gen-013-d38c9a

## Completed Tasks

### T001: v0.15 파일 정리
- tests/commands/, tests/core/, tests/integration/ 삭제
- tests/e2e/ 내부 v0.15 파일 전부 삭제 (scenarios/, *.test.ts, *.sh, *.mjs)
- 남은 구조: unit/, e2e/, scenario/, README.md

### T002: unit test 환경
- tests/unit/lifecycle.test.ts 생성 (bun:test, src/core/lifecycle.ts의 4개 함수 테스트)
- 12 tests 전부 PASS (`bun test tests/unit/`)
- relative import path (`../../src/core/lifecycle.ts`) 사용 — bun이 자체 TS 해석

### T003: e2e test 환경
- tests/e2e/run.sh: 빌드 후 test-*.sh 파일을 순차 실행하는 runner
- tests/e2e/test-init-basic.sh: greenfield init + re-init guard (9 checks)
- 패턴: 기존 scripts/e2e-*.sh와 동일 (mktemp, check/check_dir/check_file 함수)

### T004: scenario test 환경
- tests/scenario/run.sh: sandbox에서 init -> start -> status flow 검증 (6 checks)
- check_json 함수에 grep -qE 사용 (regex 패턴 매칭)

### T005: package.json scripts
- test:unit, test:e2e, test:scenario, test (전체) 추가

### T007: typecheck + build + 기존 e2e
- typecheck: PASS
- build: PASS (0.38MB)
- scripts/e2e-init.sh: 62/62 PASS
- scripts/e2e-lifecycle.sh: 16/16 PASS
- scripts/e2e-merge.sh: 25/25 PASS
- scripts/e2e-multi-generation.sh: 34/34 PASS

### T006: tests/ submodule commit
- 86 files changed, 251 insertions, 12685 deletions
- commit: `feat: v0.16 test structure — remove v0.15 files, add unit/e2e/scenario`
- push: 유저 확인 대기

## Architecture Decisions
- unit test import: `../../src/core/lifecycle.ts` relative path 사용. bun이 자체 TS 해석하므로 별도 tsconfig 불필요.
- e2e runner: tests/e2e/run.sh가 test-*.sh 패턴으로 파일 자동 탐색. 기존 scripts/e2e-*.sh와 동일한 check/check_dir/check_file 유틸 패턴.
- scenario: sandbox (mktemp) 패턴으로 격리 실행. trap으로 cleanup 보장.

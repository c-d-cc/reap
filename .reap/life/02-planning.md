# Planning — gen-013-d38c9a

## Goal
Test Phase 2: 테스트 구조 설계 및 실행 환경 구성

## Spec
tests/ submodule 내부를 v0.16 구조로 정리하고, unit/e2e/scenario 3단계 테스트 실행 환경을 구성한다.

## Requirements (FR)
1. v0.15 잔여 파일(commands/, core/, integration/) 삭제
2. tests/e2e/ 내부 v0.15 파일 정리, v0.16 구조로 재구성
3. tests/unit/ 에 bun:test 기반 예시 테스트 1개 (src/core 함수 import)
4. tests/e2e/ 에 shell 기반 실행 스크립트(run.sh) + 예시 e2e 1개
5. tests/scenario/ 에 sandbox 패턴 실행 스크립트(run.sh)
6. package.json에 test:unit, test:e2e, test:scenario, test scripts 추가
7. tests/ submodule 내부 commit + push (self-evolve branch)

## Completion Criteria
1. `bun test tests/unit/` 실행 시 1개 이상 테스트 PASS
2. `bash tests/e2e/run.sh` 실행 시 정상 완료
3. `bash tests/scenario/run.sh` 실행 시 정상 완료
4. `npm run test:unit`, `npm run test:e2e`, `npm run test:scenario` 동작
5. tests/ 에 v0.15 전용 파일 없음 (commands/, core/, integration/ 삭제됨)
6. typecheck + build 통과
7. 기존 scripts/e2e-*.sh 4개 모두 PASS

## Implementation Plan

- [ ] T001: v0.15 파일 정리 — tests/ 내 commands/, core/, integration/ 삭제, e2e/ 내부 v0.15 파일 삭제
  - 검증: `ls tests/` 로 unit/, e2e/, scenario/, README.md만 남았는지 확인
- [ ] T002: unit test 환경 — tests/unit/lifecycle.test.ts 생성 (bun:test, src/core/lifecycle.ts import)
  - 검증: `bun test tests/unit/`
- [ ] T003: e2e test 환경 — tests/e2e/run.sh 생성 + 간단한 e2e 예시 (init-basic.sh)
  - 검증: `bash tests/e2e/run.sh`
- [ ] T004: scenario test 환경 — tests/scenario/run.sh 생성 (mktemp -> init -> start -> status -> cleanup)
  - 검증: `bash tests/scenario/run.sh`
- [ ] T005: package.json scripts 추가 — test:unit, test:e2e, test:scenario, test
  - 검증: `npm run test:unit`
- [ ] T006: tests/ submodule commit + push (self-evolve branch)
  - 검증: git log 확인
- [ ] T007: typecheck + build + 기존 e2e 확인
  - 검증: `npx tsc --noEmit && npm run build && bash scripts/e2e-init.sh`

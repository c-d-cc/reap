---
id: gen-013-d38c9a
type: embryo
goal: "Test Phase 2: 테스트 구조 설계 및 실행 환경 구성"
parents: ["gen-012-856e91"]
---
# gen-013-d38c9a
tests/ submodule (self-evolve branch)을 v0.16 구조로 정리하고, 3단계 테스트 실행 환경을 구성했다.

### Changes
- v0.15 잔여 파일 삭제 (commands/, core/, integration/, e2e/ 내부 — 86파일, -12685 lines)
- tests/unit/lifecycle.test.ts: bun:test 기반 unit test (12 tests)
- tests/e2e/run.sh + test-init-basic.sh: shell 기반 e2e runner + 예시 테스트
- tests/scenario/run.sh: sandbox lifecycle 시뮬레이션
- package.json: test:unit, test:e2e, test:scenario, test scripts 추가

### Validation: PASS (typecheck, build, unit 12/12, e2e 9/9, scenario 6/6, 기존 e2e 137/137)
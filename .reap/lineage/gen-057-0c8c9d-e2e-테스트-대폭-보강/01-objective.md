# Objective

## Goal
E2E 테스트 대폭 보강 — 6개 시나리오 추가. JS setup + Claude Code 최소화.

## Completion Criteria
1. Fast-forward merge E2E
2. Genome WRITE-WRITE conflict E2E
3. Genome CROSS-FILE conflict E2E
4. Normal generation lifecycle E2E (/reap.evolve)
5. Strict mode enforcement E2E
6. Local worktree merge E2E (/reap.merge)
7. 기존 E2E (merge-e2e.sh) 유지
8. 모든 E2E 스크립트가 sandbox에서 실행 가능

## Scope
- tests/e2e/ (private submodule)
- 소스 개선 발견 시 src/ 수정 가능

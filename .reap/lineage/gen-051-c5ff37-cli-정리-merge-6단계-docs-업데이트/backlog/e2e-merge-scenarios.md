---
type: task
status: pending
priority: high
title: Merge E2E 테스트 — 실제 git repo에서 merge 시나리오 검증
---

# Merge E2E 테스트

## 범위
OpenShell sandbox에서 실제 git repo를 만들고 merge 시나리오를 E2E로 검증.

## 시나리오
1. **기본 merge**: branch-a, branch-b 각각 generation 진행 → a가 b를 merge → 6단계 lifecycle 통과
2. **Fast-forward**: a가 b를 merge 후 push → b가 pull → fast-forward 감지
3. **Genome conflict (WRITE-WRITE)**: 양쪽이 같은 genome 파일 수정 → mate 단계에서 conflict 감지
4. **Genome conflict (CROSS-FILE)**: 양쪽이 다른 genome 파일 수정 → mate 단계에서 CROSS-FILE 감지
5. **Source conflict**: genome은 깨끗하지만 같은 소스 파일 수정 → merge 단계에서 git conflict
6. **No conflict**: 양쪽이 완전히 다른 영역 작업 → 자동 통과
7. **Worktree 기반**: 같은 머신에서 worktree로 병렬 작업 → merge

## 구현 방향
- `tests/e2e/merge-e2e.sh` 스크립트
- OpenShell sandbox 필수 (`openshell` CLI)
- 각 시나리오별 temp git repo 생성 → reap init → generation → push → pull/merge → 검증
- private submodule (`c-d-cc/reap-test`)에 추가

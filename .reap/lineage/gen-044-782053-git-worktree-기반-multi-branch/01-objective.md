# Objective

## Goal

Git worktree 기반 multi-branch DAG 테스트 추가

## Completion Criteria

- [ ] Git worktree로 2개 브랜치를 동시에 만들어 각각 generation 생성/완료 테스트
- [ ] 양쪽에서 같은 seq가 생성되지만 다른 hash ID를 가지는지 확인
- [ ] 양쪽 브랜치 merge 후 lineage DAG 정합성 확인 (두 parent가 같은 조상 참조)
- [ ] meta.yml parent chain이 merge 후에도 유지되는지 확인
- [ ] 테스트 스크립트가 OpenShell sandbox에서 실행 가능
- [ ] 기존 테스트 통과

## Requirements

### Functional Requirements

- E2E 테스트 시나리오:
  1. 기본 프로젝트 init + gen-001 완료 (공통 조상)
  2. git worktree로 branch-a, branch-b 생성
  3. branch-a에서 gen-002 생성/완료 (goal A)
  4. branch-b에서 gen-002 생성/완료 (goal B) — 같은 seq, 다른 hash
  5. main에서 branch-a merge → branch-b merge
  6. 검증: lineage에 gen-002-{hashA}와 gen-002-{hashB} 공존, 둘 다 gen-001을 parent로 참조
- 테스트는 `tests/e2e/worktree-dag-e2e.sh`로 작성
- OpenShell sandbox에서 실행 (openshell 필수 검증 포함)

### Non-Functional Requirements

- 테스트 실행 시간 < 60초

## Scope
- **Related Genome Areas**: constraints.md (validation commands)
- **Expected Change Scope**: tests/e2e/worktree-dag-e2e.sh (신규), constraints.md
- **Exclusions**: 코드 변경 없음 (테스트만)

## Genome Reference

- constraints.md: Generation ID, Validation Commands
- conventions.md: Git Conventions

## Backlog (Genome Modifications Discovered)
None

## Background

v0.4.0에서 DAG lineage + hash ID를 도입했으나, 실제 multi-branch 환경에서의 동작을 검증하는 E2E 테스트가 없음. Git worktree를 활용하여 동일 repo에서 병렬 generation을 시뮬레이션하고, merge 후 DAG 정합성을 확인.

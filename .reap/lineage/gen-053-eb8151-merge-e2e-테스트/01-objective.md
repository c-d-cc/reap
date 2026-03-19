# Objective

## Goal

Merge E2E 테스트 스크립트 작성 — OpenShell sandbox에서 Claude Code가 전체 workflow를 자동 실행하여 merge 시나리오 검증

## Completion Criteria

1. `tests/e2e/merge-e2e.sh` 스크립트 작성
2. 스크립트가 sandbox에서 실행 가능 (upload + ssh 실행)
3. Claude Code `claude -p --dangerously-skip-permissions`로 각 단계 자동 실행
4. 시나리오: init → gen-001(main) → branch 분기 → gen-002-a(branch-a) → gen-002-b(branch-b) → merge
5. 결과 검증: lineage에 merge generation 존재, meta.yml type:merge, parents 2개
6. `bunx tsc --noEmit`, `bun test` 통과 (스크립트 자체는 bash이므로 기존 테스트 영향 없음)

## Requirements

### Functional Requirements

- **FR-001**: merge-e2e.sh — 전체 시나리오를 자동 실행하는 bash 스크립트
- **FR-002**: test project 생성 — `reap init` + 간단한 TypeScript 프로젝트
- **FR-003**: gen-001 — `claude -p "/reap.evolve 'Initial project setup'"` 으로 common ancestor
- **FR-004**: branch 분기 + worktree — branch-a, branch-b 각각 생성
- **FR-005**: gen-002-a, gen-002-b — 각 branch에서 `claude -p "/reap.evolve"` 로 generation 완료
- **FR-006**: merge — branch-a에서 `claude -p "/reap.pull branch-b"` 실행
- **FR-007**: 결과 검증 — lineage 구조, meta.yml, artifact 존재 확인
- **FR-008**: 실행 가이드 — sandbox upload + 실행 방법 스크립트 상단에 주석

### Non-Functional Requirements

- sandbox 환경: Node.js 18+, npm, Claude Code, reap v0.5.0
- 각 claude -p 호출의 timeout 설정 (generation당 최대 5분?)
- 실패 시 중간 상태 보존 (cleanup 선택적)

## Scope
- **Expected Change Scope**: tests/e2e/merge-e2e.sh (신규)
- **Exclusions**: 코어 로직 변경 없음, docs 없음

## Background

OpenShell sandbox `on-bluegill`에서 reap 0.5.0 + Claude Code 2.1.76 확인 완료.
`claude -p "prompt" --dangerously-skip-permissions`로 non-interactive 실행 가능.
기존 E2E 패턴(worktree-dag-e2e.sh) 참조.

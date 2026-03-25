---
type: task
status: consumed
consumedBy: gen-018-52c4cd
consumedAt: 2026-03-25T17:33:35.734Z
priority: high
createdAt: 2026-03-25T17:31:07.514Z
---

# abort 명령어 강화 — v0.15 패턴 복원

## Problem
v0.16 abort가 확인 없이 바로 삭제. v0.15에서 있던 핵심 기능 누락:
1. 사용자 확인 (confirm phase) 없음
2. abort reason 기록 없음
3. 소스 코드 처리 없음 (git diff 확인 → rollback/stash/hold)
4. 진행 상황 backlog 저장 없음
5. consumed backlog revert 없음 (revertBacklogConsumed)

## v0.15 Reference
abort.ts: 2-phase (confirm → execute)
- confirm: 사용자에게 generation 상태 보여주고 확인
- execute: --reason, --source-action (rollback|stash|hold|none), --save-backlog
- consumed backlog를 pending으로 revert
- 진행 상황을 aborted-{genId}.md로 backlog에 저장

## Solution
1. abort.ts를 2-phase로 변경 (confirm → execute)
2. confirm phase: 사용자에게 상태 + 소스 변경 확인
3. execute phase: reason, source-action, save-backlog 처리
4. revertBacklogConsumed 호출 (backlog.ts에 이미 없으면 추가)
5. 테스트 추가: abort 시나리오

## Files to Change
- src/cli/commands/run/abort.ts — 2-phase 구현
- src/core/backlog.ts — revertBacklogConsumed 추가 (없으면)
- tests/e2e/ 또는 tests/scenario/ — abort 테스트

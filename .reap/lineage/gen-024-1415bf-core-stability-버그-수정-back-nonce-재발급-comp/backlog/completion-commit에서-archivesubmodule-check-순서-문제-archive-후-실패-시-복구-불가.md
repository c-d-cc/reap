---
type: task
status: consumed
consumedBy: gen-024-1415bf
consumedAt: 2026-03-26T07:40:43.923Z
priority: high
createdAt: 2026-03-26T07:31:53.288Z
---

# completion commit에서 archive→submodule check 순서 문제 — archive 후 실패 시 복구 불가

## Problem

completion commit phase에서 실행 순서:
1. `archiveGeneration()` — life/ → lineage/로 이동, current.yml 삭제
2. `checkSubmoduleDirty()` — submodule 상태 확인
3. `gitCommitAll()` — git commit

2번에서 실패하면 current.yml이 이미 삭제된 상태라 generation을 복구할 수 없음.
gen-021, gen-022, gen-023에서 반복 발생. 매번 수동으로 `git add tests && git commit`으로 우회.

근본 원인: archive가 비가역적 작업인데 사전 검증 없이 먼저 실행됨.

## Solution

실행 순서 변경:
1. `checkSubmoduleDirty()` — **먼저** submodule 상태 확인, dirty면 에러 (archive 전이므로 안전하게 중단 가능)
2. `archiveGeneration()` — 검증 통과 후 archive
3. `gitCommitAll()` — git commit

또는: archive 전에 모든 pre-condition을 검증하는 gate 단계 추가.

## Files to Change

- `src/cli/commands/run/completion.ts` — commit phase 실행 순서 변경 (submodule check → archive → commit)

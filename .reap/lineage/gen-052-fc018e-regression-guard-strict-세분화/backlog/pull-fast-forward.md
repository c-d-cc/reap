---
type: task
status: pending
priority: high
title: reap.pull fast-forward 감지 — 이미 merged된 branch pull 시 full lifecycle 스킵
---

# reap.pull fast-forward 감지

## 시나리오
branch-a가 branch-b를 merge하고 push한 후, branch-b가 `/reap.pull branch-a`를 실행하는 경우.
branch-a의 merge generation이 이미 gen-046-b를 parent로 포함하고 있으므로, b의 작업은 이미 합쳐진 상태.

## 현재 문제
detect 단계에서 이 케이스를 감지하지 못하고, 불필요한 6단계 merge lifecycle을 시작할 수 있음.

## 구현 방향
1. `/reap.pull` detect 단계에서 "이미 merged" 판단:
   - 상대 branch의 lineage에서 로컬 최신 generation ID가 ancestor에 포함되는지 확인
   - DAG에서 로컬 HEAD가 상대 branch의 ancestor이면 fast-forward
2. Fast-forward 처리:
   - `git merge --ff {branch}` 실행
   - 상대 branch의 lineage를 로컬에 동기화 (meta.yml, compressed .md 등)
   - merge generation 생성 안 함
   - "Fast-forwarded to {branch}. No merge generation needed." 메시지
3. Edge case:
   - b가 merge 후 추가 generation을 진행한 경우 → fast-forward 아님, full merge 필요
   - 양쪽 다 추가 작업한 경우 → full merge

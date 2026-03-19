---
type: task
status: pending
priority: medium
title: reap pull / reap push CLI subcommand 구현
---

# reap pull / reap push CLI subcommand

## 범위
1. `reap pull` — git fetch + 원격 branch .reap/lineage/ 스캔 + 새 generation 감지/알림
2. `reap push` — active generation 상태 검증 + git push
3. Commander.js subcommand 등록

## 설계
- domain/collaboration.md의 reap pull/push 명세 참조
- reap pull은 git fetch 후 git ls-tree / git show로 원격 .reap/ 스캔
- reap push는 current.yml이 비어있거나 completion인지 확인 후 push

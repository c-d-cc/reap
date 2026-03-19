---
type: task
status: consumed
consumedBy: gen-018
priority: high
title: "lineage 아카이빙 시 backlog를 backlog/ 하위 폴더에 저장하도록 명시"
---

## 현재 문제
- `reap.next.md`의 아카이빙 규칙이 "move to lineage"로만 되어 있음
- backlog 파일이 lineage gen 폴더 루트에 artifact와 함께 섞여 저장됨
- gen-016, gen-017에서 실제 발생 (수동 수정함)

## 개선 방향
- `reap.next.md`의 backlog 처리 규칙에 명시적 경로 추가:
  - consumed → `.reap/lineage/[gen-id]-[goal-slug]/backlog/`
  - pending → `.reap/lineage/[gen-id]-[goal-slug]/backlog/` 에 복사 + 새 `.reap/life/backlog/`로 이월

## 변경 파일
- `src/templates/commands/reap.next.md` — backlog 아카이빙 경로 명시

---
id: gen-0108-exec
slug: milestone-sizing-guard
type: exec
backlog: bk-8adfd0
title: milestone 과잉 분할을 제품에서 막는다 — evolve·carve-milestone·loop 본문, doctor 참고
startedAt: 2026-09-05T02:29:33Z
startCommit: 2e2a9f6
status: open
---

## Intent

사람(2026-09-05): "lessons에만 담으면 이 리포에서만 쓰인다 — 제품 자체에 반영해야 한다." ms-025~027 과잉 분할의 원인("사람 검토가 필요한 방향 변경 → milestone")을 REAP를 쓰는 모든 프로젝트가 받는 자리에 막는다.

- evolve 근거 표: "아직 안 적혀 있다 → milestone" 행을 세대 수로 가르고, "안 적혀 있다"와 "사람 검토가 필요하다"가 milestone의 이유가 아님을 명시
- carve-milestone: When not to call·Size 절에 같은 규칙
- loop: 닫을 때 산출물이 세대 하나짜리면 backlog 항목(`--from <loop-id>`)으로, milestone 없이 닫는다
- doctor 참고 `milestone_single_generation`: 닫힌 milestone에 세대가 하나 이하면 사후 신호. 결정적이라 스크립트
- 사이트: carve 페이지 sizeNote 한 문장, doctor 페이지 참고 표 한 행

bk-8adfd0. 세대 하나.

## References

- lessons.md "사람 검토가 필요한 변경은 milestone의 이유가 아니다"(2e2a9f6) — 이 세대가 그것을 제품으로 옮긴다
- plugin/skills/carve-milestone/SKILL.md "Size" — 이미 있던 하한 규칙

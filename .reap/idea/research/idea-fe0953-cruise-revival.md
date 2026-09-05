---
id: idea-fe0953
slug: cruise-revival
kind: research
title: cruise(세대 여러 개 자율 연속 실행) 복원 여부 — 08-delivery 폐기 근거 재검토
createdAt: 2026-09-05T02:04:22Z
status: open
---

## What's Undecided

v0.17의 `cruise`(세대 N개를 자율로 연속 실행, `cruiseCount`)를 v0.18에 되살릴 것인가. 08-delivery가 폐기했고 01-gap이 유지했다. 사람(2026-09-05): "아직 고민을 해봐야 할 것 같다" — 문서 방향("agent의 자율적 evolve 장려")과 맞닿아 있어 폐기 근거를 다시 볼 여지가 있다.

## Graduation Criteria

사람이 셋 중 하나를 답한다 — (a) 복원: evolve 위임 모드 위에 "다음 세대로 계속" 규칙을 얹은 skill로, (b) 폐기 유지: 세대마다 사람의 개입 지점이 있어야 한다는 원칙을 evolve에 명문화, (c) 보류 연장. (a)면 milestone, (b)면 evolve 한 문단.

## Sources

- primary · 2026-09-05 — `docs/superpowers/specs/reap/08-delivery.md` 폐기 표, `docs/reap-plan/reap_v_0_18_release/01-gap.md` "만들지 않는다" 표
- primary · 2026-09-05 — 사람 대화(ms-027 Background)

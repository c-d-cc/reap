---
id: gen-0083-exec
slug: loop-source-lifetime
type: exec
backlog: bk-bb11a1
title: loop skill — plan source 소비 완료 판정과 확장/신설 질문
startedAt: 2026-09-03T15:58:13Z
startCommit: 66ed570
status: closed
closedAt: 2026-09-03T15:58:37Z
endCommit: 5dcdb2a
---
## Intent

bk-bb11a1 — loop skill의 "plan source에 쓴다" 앞에 소비 완료 판정 step을 두고, 06-agent의 판단 1에 같은 문장을, ps-4b485d 규약의 수명 절에 소비 완료 표지를 남긴다.

## Outcome

- `loop/SKILL.md`: 쓰기 전 "소스가 살아 있는가" 판정 — 규약 `수명` 절이 표지, 확장/신설 갈림은 애매하면 interview
- `06-agent.md` 판단 1 갱신, 마지막 milestone을 닫는 쪽이 `수명` 절을 갱신한다는 규칙
- `ps-4b485d` 규약에 소비 완료 표지(2026-08-31). ps-5e948f는 0.18.0 발행 뒤 같은 방식으로

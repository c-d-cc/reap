---
id: bk-b8e496
slug: report-issue-skill
type: skill
title: report-issue skill — REAP 프로젝트에 버그·기능 요청을 올린다
createdAt: 2026-08-30T16:45:44Z
status: consumed
consumedBy: gen-0054-exec
---
## 무엇

`report-issue` skill을 새로 만든다 — *Submit a bug report or feature request to the REAP project.* REAP를 쓰는 프로젝트에서 REAP 자체의 버그나 기능 요청을 발견했을 때, 그 자리에서 `c-d-cc/reap`의 GitHub issue로 올리는 통로다.

## 왜

지금은 REAP를 쓰다 마주친 결함이 그 프로젝트의 backlog에 남거나 그냥 잊힌다 — REAP 리포까지 오는 길이 없다. `gh issue create`를 감싸는 것이 아니라 **무엇을 issue로 올리고 무엇을 그 프로젝트의 backlog에 둘지 가르는 판단**과, REAP 리포가 읽을 수 있는 형식(재현·기대·실제·바이너리/플러그인 버전·`.reap/` 레이아웃)이 skill의 값이다.

## 정할 것

- `gh`가 없거나 인증이 안 됐을 때 — 실패를 감추지 않고 issue 본문을 그대로 내서 사람이 올리게 한다
- 이 skill이 spec의 skill 표(`06-agent.md`)에 들어가는가 — 9종이 된다. "언제 부르는가"가 하나 더 생기지만 트리거가 "REAP 자체의 결함을 만났을 때"라 다른 skill과 경합하지 않는다
- 사용자 프로젝트의 사정(코드·경로)을 issue에 실으면 안 된다 — 무엇을 빼는가

## 출처

사람, 2026-08-31. GitHub #1을 닫은 직후.

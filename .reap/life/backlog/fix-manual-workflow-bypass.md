---
type: task
status: pending
priority: high
title: current.yml 직접 수정 방지 — 자가 분석 + 가드 강화
---

# current.yml 직접 수정 방지

## 문제
gen-051에서 AI 에이전트가 `/reap.start`, `/reap.next` slash command를 거치지 않고 current.yml과 artifact를 직접 작성함. REAP guide에 "NEVER modify current.yml directly"가 명시되어 있음에도 불구하고 위반.

## 자가 분석 필요 사항
1. 왜 이런 일이 발생했는가? (속도 최적화 의도? slash command 실행 비용 회피?)
2. 어떤 조건에서 에이전트가 guide를 무시하게 되는가?
3. slash command template에 guard가 부족한가?
4. session-start hook의 HARD-GATE 메시지가 충분한가?

## 수정 방향
- slash command template에 더 강력한 guard 추가
- evolve command에서 stage 전환 시 반드시 /reap.next를 호출하도록 강제
- 또는 current.yml 수정을 감지하는 validation 추가

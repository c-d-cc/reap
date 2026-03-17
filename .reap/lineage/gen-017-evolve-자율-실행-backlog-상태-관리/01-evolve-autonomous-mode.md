---
type: task
status: consumed
consumedBy: gen-017
priority: high
title: "/reap.evolve 자율 실행 모드 — stage별 human confirmation skip"
---

## 현재 문제
- 각 stage 커맨드(objective, planning, implementation, validation, completion)에 human confirmation이 하드코딩
- evolve에서 호출해도 매 단계마다 사람 확인을 요구하여 자동 진행이 안 됨
- evolve의 의도(full lifecycle 자율 실행)와 stage 커맨드의 확인 게이트가 충돌

## 개선 방향
- evolve 스킬에 "각 stage의 routine human confirmation은 skip하고 자율 진행" override 지시 추가
- 진짜 판단이 필요한 경우에만 STOP (애매한 목표, 불확실한 기술 결정, 예상 외 상황)
- 각 stage 커맨드에 "evolve 컨텍스트에서 호출된 경우" 분기 추가 검토

## 변경 파일
- `src/templates/commands/reap.evolve.md` — 자율 실행 override 지시 추가
- `src/templates/commands/reap.objective.md` — evolve 시 confirmation skip 분기
- `src/templates/commands/reap.planning.md` — 동일
- `src/templates/commands/reap.completion.md` — 동일

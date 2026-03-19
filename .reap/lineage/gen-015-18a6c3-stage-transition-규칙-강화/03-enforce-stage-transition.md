---
type: task
priority: high
title: "stage 전환 시 current.yml 직접 수정 방지 — /reap.next 강제 사용"
---

## 발생한 문제
- gen-014에서 AI 에이전트가 current.yml을 직접 수정하여 objective → planning → implementation으로 점프
- /reap.next를 통하지 않아 planning artifact가 생성되지 않음
- /reap.planning 프롬프트 자체가 실행되지 않음

## 원인
- evolve 프롬프트가 "corresponding stage command 실행 → /reap.next로 advance"를 지시하지만, AI가 속도를 위해 current.yml을 직접 수정하는 shortcut을 취함
- current.yml은 어떤 프롬프트에서도 직접 수정을 금지하는 명시적 규칙이 없음

## 개선 방향
1. **reap-guide.md에 규칙 추가**: "current.yml의 stage는 /reap.next 또는 /reap.back을 통해서만 변경한다. 직접 수정 금지."
2. **reap.evolve.md에 경고 추가**: "절대로 current.yml을 직접 수정하여 stage를 변경하지 마라. 반드시 /reap.next를 사용하라."
3. **각 stage command의 Gate에서 이전 stage artifact 존재 확인 강화**: 예) /reap.implementation의 Gate에서 02-planning.md가 없으면 ERROR

## 변경 파일
- `src/templates/hooks/reap-guide.md` — Rules 섹션에 current.yml 직접 수정 금지 규칙
- `src/templates/commands/reap.evolve.md` — Lifecycle Loop에 경고 추가
- 각 stage command의 Gate 강화 검토

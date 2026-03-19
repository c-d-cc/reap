---
type: genome-change
status: pending
target: genome/domain/lifecycle-rules.md
---

# Regression 시 planning artifact 처리 규칙 명확화

## 문제
현재 lifecycle-rules.md의 regression artifact 처리 규칙:
- "target은 덮어쓰기 (implementation은 append)"
- planning으로 regression 시 기존 task를 보존하고 regression task를 추가해야 하는데, 이 규칙이 없음

## 변경 제안
Regression artifact 처리:
- target 이전: 보존
- target stage: 덮어쓰기 **(planning과 implementation은 append)**
- target 이후: 보존 → 재진입 시 덮어쓰기

planning도 implementation처럼 기존 내용에 추가하는 방식이어야 작업 이력이 유지됨.

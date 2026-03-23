---
type: task
priority: medium
status: pending
---

# Lineage 압축 보호 개수 확대

## 문제
`LEVEL1_PROTECTED_COUNT = 3`으로 최근 3세대만 원본 유지.
155+ 세대에서 원본 9개(~6%)만 남아있어 원본 참조가 어려움.

## 수정 방향
- `LEVEL1_PROTECTED_COUNT`를 20 정도로 확대 (고정값 또는 config 설정)
- `LINEAGE_MAX_LINES`도 함께 조정 필요
- 가급적 원본 generation을 20개 정도 유지하는 것이 목표

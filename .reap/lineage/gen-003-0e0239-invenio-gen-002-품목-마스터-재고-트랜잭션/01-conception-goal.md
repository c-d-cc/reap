# Generation Goal — Gen-003

## 목표
invenio Gen-002(품목 마스터 + 재고 트랜잭션)를 REAP 워크플로우로 개발하고,
추가 발견되는 reap-wf 개선점을 반영한다.

## 완료 조건
- [ ] invenio Gen-002가 전체 라이프사이클 완주
- [ ] 품목 마스터(Unit/Category) + 재고 트랜잭션 동작
- [ ] 발견된 reap-wf 개선점이 mutation으로 기록됨
- [ ] reap-wf 테스트 통과 유지

## 범위
- **관련 Genome 영역**: conventions.md, 슬래시 커맨드 템플릿
- **예상 변경 범위**: src/templates/, examples/invenio/
- **제외 사항**: reap-wf 대규모 아키텍처 변경

## 배경
- Gen-002에서 invenio Gen-001을 완주하며 4건 개선 완료
- 사용자 테스트에서 SKU/Unit 혼동, 재고 트랜잭션 부재 발견
- 이번 세대에서 도메인 모델 변경이 REAP 워크플로우에서 어떻게 다뤄지는지 검증

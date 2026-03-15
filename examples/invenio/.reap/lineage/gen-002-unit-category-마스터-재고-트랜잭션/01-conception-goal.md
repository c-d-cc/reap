# Generation Goal — Gen-002

## 목표
품목 마스터를 개선하고(Unit/Category 마스터 분리), 재고 트랜잭션 시스템을 도입한다.
마스터 데이터는 UI에서 select로 선택할 수 있게 한다.

## 완료 조건
- [ ] Unit 마스터 CRUD (EA, BOX, KG, L 등)
- [ ] Category 마스터 CRUD
- [ ] items 테이블에 unit 필드 추가, category는 마스터 FK로 변경
- [ ] 재고 트랜잭션 (입고/출고) API + UI
- [ ] 현재 재고 = 입고 합계 - 출고 합계로 계산
- [ ] 물품 등록/수정 시 Unit, Category를 select로 선택
- [ ] 대시보드에 최근 트랜잭션 표시
- [ ] `bun test` 통과
- [ ] `bunx tsc --noEmit` 통과

## 범위
- **관련 Genome 영역**: principles.md (도메인 모델 변경), constraints.md
- **예상 변경 범위**: server/db/schema.ts, server/routes/, client/pages/, client/components/
- **제외 사항**: 바코드, 리포트/내보내기, 다중 창고

## 배경
- Gen-001 실전 테스트에서 SKU와 Unit 혼동 발견
- 재고 수량이 items.quantity 직접 수정 → 이력 추적 불가
- 마스터 데이터(Unit, Category)를 별도 관리하여 입력 일관성 확보

# Birth Changelog — Gen-002

## 추가된 기능
- **Unit 마스터**: CRUD API + 관리 페이지, 기본 데이터(EA, BOX, KG, L, SET)
- **Category 마스터**: CRUD API + 관리 페이지
- **재고 트랜잭션**: 입고/출고 API + 모달 UI, 재고 부족 시 출고 거부
- **트랜잭션 기반 재고 계산**: items.quantity 제거 → 트랜잭션 합계로 계산
- **Dashboard 개선**: 최근 트랜잭션 목록 표시

## 변경된 기능
- Item 등록/수정: Unit/Category를 select 드롭다운으로 변경
- Dashboard: 트랜잭션 기반 재고 가치 계산

## DB 변경
- units, categories, transactions 테이블 추가
- items 테이블에 unit 컬럼 추가

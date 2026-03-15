# Formation Spec — Gen-002

## 요구사항

### 마스터 데이터
- **FR-001**: Unit 마스터 CRUD — GET/POST/PUT/DELETE `/api/units`
  - 기본 데이터: EA(개), BOX(박스), KG(킬로그램), L(리터), SET(세트)
- **FR-002**: Category 마스터 CRUD — GET/POST/PUT/DELETE `/api/categories`
  - 기본 데이터: 없음 (사용자가 생성)

### 품목 마스터 변경
- **FR-003**: items 테이블 변경
  - `unit` 컬럼 추가 (units 테이블 FK 아닌 text — 유연성)
  - `category` 컬럼을 categories 테이블 name 참조로 변경
  - `quantity` 컬럼 제거 → 트랜잭션으로 계산
- **FR-004**: 물품 등록/수정 시 Unit, Category를 select(dropdown)으로 선택

### 재고 트랜잭션
- **FR-005**: transactions 테이블 신규
  - item_id (FK), type (in/out), quantity, memo, created_by, created_at
- **FR-006**: 입고 API — POST `/api/items/:id/transactions` { type: "in", quantity, memo }
- **FR-007**: 출고 API — POST `/api/items/:id/transactions` { type: "out", quantity, memo }
- **FR-008**: 트랜잭션 목록 — GET `/api/items/:id/transactions`
- **FR-009**: 현재 재고 계산 — 입고 합계 - 출고 합계 (items 목록 API에 포함)

### 프론트엔드
- **FR-010**: Unit 관리 페이지 (마스터)
- **FR-011**: Category 관리 페이지 (마스터)
- **FR-012**: 물품 폼에 Unit/Category select 적용
- **FR-013**: 물품 상세에서 입고/출고 버튼 + 트랜잭션 이력 표시
- **FR-014**: 대시보드에 최근 트랜잭션 5건 표시

### 비기능 요구사항
- DB 마이그레이션: 기존 데이터 보존 (ALTER TABLE)
- Unit 삭제 시 해당 Unit을 사용하는 items가 있으면 거부

## Genome 참조
- conventions.md: snake_case DB, API 응답 형태, Testing Conventions
- constraints.md: bun:sqlite, Drizzle ORM, soft delete

## 수용 기준
- [ ] 마스터 CRUD 동작 (Unit, Category)
- [ ] 물품 폼에서 select로 마스터 선택
- [ ] 입고/출고 트랜잭션 기록 및 이력 조회
- [ ] 현재 재고가 트랜잭션 기반으로 정확히 계산됨
- [ ] `bun test` 통과, `bunx tsc --noEmit` 통과

## Mutations
없음

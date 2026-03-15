# Implementation Plan — Gen-002

## Summary
마스터 데이터(Unit, Category) 시스템 도입 + 재고 트랜잭션 분리.
기존 items.quantity 직접 수정 방식을 트랜잭션 기반으로 전환.

## Technical Context
- 기존 schema 변경 (items에 unit 추가, quantity 제거)
- 신규 테이블 2개 (units, categories, transactions)
- Drizzle ORM으로 스키마 정의, SQL 마이그레이션 수동 작성

## Tasks

### Phase 1: DB 스키마 + 마스터 API
- [ ] T001 units, categories 테이블 스키마 추가 + 마이그레이션
- [ ] T002 items 테이블 변경 (unit 컬럼 추가, quantity 제거) + transactions 테이블 추가
- [ ] T003 Unit CRUD API (GET/POST/PUT/DELETE /api/units)
- [ ] T004 Category CRUD API (GET/POST/PUT/DELETE /api/categories)

### Phase 2: 트랜잭션 API + items 수정
- [ ] T005 트랜잭션 API (POST /api/items/:id/transactions, GET /api/items/:id/transactions)
- [ ] T006 items 목록 API 수정 — 현재 재고를 트랜잭션 합계로 계산
- [ ] T007 대시보드 API 수정 — 트랜잭션 기반 재고 + 최근 트랜잭션 5건

### Phase 3: 프론트엔드
- [ ] T008 Unit/Category 관리 페이지
- [ ] T009 물품 폼 수정 — Unit/Category를 select로 변경
- [ ] T010 물품 상세 + 입고/출고 UI + 트랜잭션 이력
- [ ] T011 대시보드 수정 — 최근 트랜잭션 표시

### Phase 4: 테스트 + 검증
- [ ] T012 API 테스트 업데이트 (마스터 CRUD + 트랜잭션 + 재고 계산)
- [ ] T013 전체 검증 (bun test, tsc --noEmit)

## Dependencies
- T001 → T002 (순차)
- T002 → T003, T004 (병렬)
- T003, T004 → T005 → T006 → T007 (순차)
- T004 → T008, T009 (프론트 마스터)
- T005 → T010, T011 (프론트 트랜잭션)
- T007, T011 → T012 → T013

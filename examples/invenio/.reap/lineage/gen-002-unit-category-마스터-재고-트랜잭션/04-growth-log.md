# Growth Log — Gen-002

## T001 백엔드: Unit/Category 마스터 + 트랜잭션 API
- DB 스키마: units, categories, transactions 테이블 추가, items에 unit 컬럼 추가
- units CRUD API (GET/POST/PUT/DELETE, 삭제 시 사용 중 거부)
- categories CRUD API (동일 패턴)
- transactions API (POST /:id/transactions, GET /:id/transactions)
- items API 업데이트: currentStock을 트랜잭션 기반으로 계산
- dashboard API 업데이트: 트랜잭션 기반 재고, 최근 트랜잭션 포함
- 32 API 테스트 통과

## T002 프론트엔드: 마스터 관리 + 트랜잭션 UI
- UnitsPage, CategoriesPage 신규 생성 (마스터 CRUD)
- ItemForm: category/unit을 select 드롭다운으로 변경
- ItemsPage: Stock In/Out 버튼 + TransactionModal
- DashboardPage: 최근 트랜잭션 테이블 추가
- Layout: Units/Categories 네비게이션 링크 추가
- App.tsx: /units, /categories 라우트 추가
- useMasters(), useTransactions() 훅 추가
- tsc --noEmit 통과

## 브라우저 검증
- 품목 등록/수정 (Unit/Category select 정상)
- 단위/카테고리 마스터 추가/삭제 정상
- 재고 입출고 트랜잭션 정상

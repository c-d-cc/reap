# Formation Spec — Gen-001

## 요구사항

### 기능 요구사항

#### 인증
- **FR-001**: 회원가입 — POST `/api/auth/sign-up` (email, password, name)
- **FR-002**: 로그인 — POST `/api/auth/sign-in` → JWT 토큰 반환
- **FR-003**: 인증 미들웨어 — Authorization: Bearer 토큰 검증, 401 반환

#### 물품 CRUD
- **FR-004**: 물품 목록 — GET `/api/items` (페이지네이션: page, limit, 검색: q)
- **FR-005**: 물품 상세 — GET `/api/items/:id`
- **FR-006**: 물품 등록 — POST `/api/items` (name, sku, category, quantity, unitPrice)
- **FR-007**: 물품 수정 — PUT `/api/items/:id`
- **FR-008**: 물품 삭제 — DELETE `/api/items/:id` (soft delete)

#### 대시보드
- **FR-009**: 대시보드 API — GET `/api/dashboard` (totalItems, totalValue, lowStockItems)

#### 프론트엔드
- **FR-010**: 로그인/회원가입 페이지
- **FR-011**: 물품 목록 페이지 (테이블, 검색, 페이지네이션)
- **FR-012**: 물품 추가/편집 폼 (모달 또는 페이지)
- **FR-013**: 대시보드 페이지 (요약 카드 3개 + 저재고 목록)

### 비기능 요구사항
- 모든 API 응답: `{ data: T }` 또는 `{ error: string }`
- 비밀번호: bcrypt 해싱
- soft delete: `deleted_at` 컬럼, 목록 조회 시 자동 필터

## Genome 참조
- principles.md: API-first, 타입 안전, 입력 검증
- conventions.md: snake_case DB, kebab-case API, Enforced Rules
- constraints.md: Bun + Hono + Drizzle + SQLite + React + Vite + Tailwind

## 수용 기준
- [ ] 모든 API 엔드포인트가 명세대로 동작
- [ ] 프론트엔드에서 전체 시나리오 수행 가능
- [ ] `bun test` 통과
- [ ] `bunx tsc --noEmit` 통과

## Mutations
없음

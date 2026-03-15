# Implementation Plan — Gen-001

## Summary
Bun + Hono 백엔드와 React + Vite 프론트엔드로 인벤토리 관리 시스템을 구축한다.
모노리포 구조로 server/client/shared 3개 레이어, SQLite DB, JWT 인증.

## Technical Context
- **Tech Stack**: Bun, Hono, Drizzle ORM, SQLite, React, Vite, Tailwind CSS
- **Constraints**: bun:sqlite 사용, soft delete, API 응답 형태 통일 `{ data } | { error }`

## Tasks

### Phase 1: 프로젝트 구조 + DB
- [ ] T001 프로젝트 초기화 — package.json, tsconfig, Vite 설정, 디렉토리 구조 생성
- [ ] T002 DB 스키마 정의 — Drizzle로 users, items 테이블 정의 + 마이그레이션
- [ ] T003 DB 연결 모듈 — bun:sqlite + Drizzle 인스턴스 생성

### Phase 2: 인증 API
- [ ] T004 회원가입 API — POST /api/auth/sign-up (bcrypt 해싱, 중복 체크)
- [ ] T005 로그인 API — POST /api/auth/sign-in (JWT 발급)
- [ ] T006 인증 미들웨어 — Bearer 토큰 검증, context에 userId 주입

### Phase 3: 물품 CRUD API
- [ ] T007 물품 등록 — POST /api/items (입력 검증)
- [ ] T008 물품 목록 — GET /api/items (페이지네이션, 검색, soft delete 필터)
- [ ] T009 물품 상세/수정/삭제 — GET/PUT/DELETE /api/items/:id

### Phase 4: 대시보드 API
- [ ] T010 대시보드 API — GET /api/dashboard (집계 쿼리)

### Phase 5: 프론트엔드
- [ ] T011 프론트 초기 구조 — React Router, 레이아웃, API 클라이언트
- [ ] T012 로그인/회원가입 페이지
- [ ] T013 물품 목록 페이지 (테이블, 검색, 페이지네이션)
- [ ] T014 물품 추가/편집 폼
- [ ] T015 대시보드 페이지

### Phase 6: 통합 + 테스트
- [ ] T016 API 테스트 작성 (인증 + CRUD + 대시보드)
- [ ] T017 전체 검증 — bun test, tsc --noEmit, bun run build

## Dependencies
- T001 → T002 → T003 (순차)
- T003 → T004~T006 (순차)
- T006 → T007~T009 (T007/T008/T009는 병렬 가능)
- T009 → T010
- T006 → T011 → T012 → T013 → T014 → T015 (순차)
- T010, T015 → T016 → T017

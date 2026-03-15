# Growth Log — Gen-001

## 완료된 태스크
| Task | 설명 | 완료일 |
|------|------|--------|
| T001 | 프로젝트 초기화 (package.json, tsconfig, 디렉토리 구조) | 2026-03-16 |
| T002 | DB 스키마 정의 (Drizzle: users, items) | 2026-03-16 |
| T003 | DB 연결 모듈 (bun:sqlite + Drizzle) | 2026-03-16 |
| T004 | 회원가입 API (bcrypt, 중복 체크) | 2026-03-16 |
| T005 | 로그인 API (JWT 발급) | 2026-03-16 |
| T006 | 인증 미들웨어 (Bearer 토큰 검증) | 2026-03-16 |
| T007 | 물품 등록 API | 2026-03-16 |
| T008 | 물품 목록 API (페이지네이션, 검색, soft delete 필터) | 2026-03-16 |
| T009 | 물품 상세/수정/삭제 API | 2026-03-16 |
| T010 | 대시보드 API (집계) | 2026-03-16 |
| T011 | 프론트 초기 구조 (React Router, 레이아웃, API 클라이언트) | 2026-03-16 |
| T012 | 로그인/회원가입 페이지 | 2026-03-16 |
| T013 | 물품 목록 페이지 (테이블, 검색, 페이지네이션) | 2026-03-16 |
| T014 | 물품 추가/편집 폼 | 2026-03-16 |
| T015 | 대시보드 페이지 | 2026-03-16 |
| T016 | API 테스트 (15개 통과) | 2026-03-16 |
| T017 | 전체 검증 (bun test ✅, tsc --noEmit ✅) | 2026-03-16 |

## Deferred 태스크
없음

## 발생한 Mutations
없음 (invenio 자체에서는 명세 변경 없이 구현 완료)

## 구현 메모
- bun:sqlite 내장 SQLite 사용, 별도 DB 서버 불필요
- Drizzle ORM으로 타입 안전한 쿼리
- JWT는 jose 라이브러리 HS256, Bun.password로 bcrypt 해싱
- 프론트엔드: React 19 + Vite + Tailwind CSS
- Vite proxy로 /api → localhost:3000 연결
- @types/react, @types/react-dom 추가 필요했음 (초기 설정 누락)

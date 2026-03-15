# Technical Constraints

> **작성 원칙**: ~100줄 이내 맵. Birth에서만 수정.

## Tech Stack

- **Language**: TypeScript 5.x — 프론트-백엔드 타입 공유
- **Runtime**: Bun 1.x — 빠른 실행, SQLite 내장, 테스트 러너 내장
- **Backend**: Hono 4.x — 경량 웹 프레임워크, Bun 네이티브
- **Frontend**: React 19 + Vite — 빠른 HMR, 성숙한 생태계
- **Database**: SQLite (bun:sqlite) — 설치 불필요, 단일 파일 DB
- **ORM**: Drizzle ORM — 타입 안전, SQLite 친화
- **인증**: JWT (jose) + bcrypt — 세션리스, 토큰 기반
- **UI**: Tailwind CSS — 유틸리티 기반, 빠른 프로토타이핑

## Constraints

- Bun 내장 SQLite 사용 (better-sqlite3 대신 bun:sqlite)
- 프론트엔드 빌드 결과를 Hono에서 정적 서빙 (단일 서버)
- 개발 시 프론트 dev 서버(Vite)와 백엔드 서버 분리 실행
- soft delete 패턴 사용 (deleted_at 컬럼)

## Validation Commands

| 용도 | 명령어 | 설명 |
|------|--------|------|
| 테스트 | `bun test` | API + 단위 테스트 |
| 빌드 | `bun run build` | 프론트엔드 빌드 |
| 타입체크 | `bunx tsc --noEmit` | 전체 타입 검증 |

## External Dependencies

- 없음 (로컬 전용 앱)

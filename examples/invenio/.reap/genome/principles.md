# Architecture Principles

> **작성 원칙**: ~100줄 이내 맵. 상세는 `domain/`으로 분리. Birth에서만 수정.

## Core Beliefs

- **API-first**: 백엔드 API를 먼저 설계하고, 프론트엔드는 API를 소비
- **단순한 시작**: 최소 기능으로 시작하고, 세대 단위로 확장
- **타입 안전**: 프론트~백엔드 전 구간에서 TypeScript 타입 공유
- **모든 외부 입력은 API 경계에서 검증**: zod 등으로 request validation

## Architecture Decisions

| ID | 결정 | 사유 | 날짜 |
|----|------|------|------|
| ADR-001 | 모노리포 (프론트+백엔드 한 repo) | 소규모 프로젝트, 타입 공유 용이 | 2026-03 |
| ADR-002 | Hono 백엔드 | 경량, Bun 네이티브, Express 호환 API | 2026-03 |
| ADR-003 | Drizzle ORM + SQLite | 타입 안전 ORM, 서버리스 친화, 설치 불필요 | 2026-03 |
| ADR-004 | JWT 인증 | 세션 서버 불필요, 프론트에서 토큰 관리 | 2026-03 |
| ADR-005 | React + Vite | 빠른 HMR, 성숙한 생태계 | 2026-03 |

## Layer Map

```
server/           → Hono API 서버 (routes, middleware, db)
client/           → React SPA (pages, components, hooks)
shared/           → 프론트-백엔드 공유 타입
```

- `client/` → `shared/` ← `server/` (shared를 통한 타입 공유)
- `client/` → `server/` 직접 의존 금지 (API 호출만 허용)

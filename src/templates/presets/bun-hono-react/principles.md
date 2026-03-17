# Architecture Principles

> Birth 단계에서만 수정된다.

## Core Beliefs

- **API-First** — Hono로 REST/RPC API를 먼저 설계하고, React는 API를 소비하는 클라이언트
- **Type-Safe Full Stack** — 서버와 클라이언트가 동일한 TypeScript 타입을 공유
- **Edge-Ready** — Bun 런타임으로 빠른 시작, Hono의 Web Standard API로 이식성 확보
- **Colocation** — 관련 코드는 가까이 배치 (route + handler + schema)

## Architecture Decisions

| ID | 결정 | 사유 | 날짜 |
|----|------|------|------|
| ADR-001 | Bun + TypeScript | 빠른 실행, 내장 테스트, TS 네이티브 | - |
| ADR-002 | Hono (Web Framework) | 경량, Web Standard, middleware 체계 | - |
| ADR-003 | React (Frontend) | 생태계, 컴포넌트 모델 | - |

## Layer Map

```
src/
├── server/        → Hono API routes + middleware
├── client/        → React components + pages
├── shared/        → 서버/클라이언트 공유 타입, 유틸
└── db/            → 데이터 접근 계층
```

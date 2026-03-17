# Architecture Principles

> Modified only during the Birth stage.

## Core Beliefs

- **API-First** — Design REST/RPC APIs with Hono first; React is a client that consumes the APIs
- **Type-Safe Full Stack** — Server and client share the same TypeScript types
- **Edge-Ready** — Fast startup with Bun runtime, portability through Hono's Web Standard API
- **Colocation** — Keep related code close together (route + handler + schema)

## Architecture Decisions

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| ADR-001 | Bun + TypeScript | Fast execution, built-in testing, native TS support | - |
| ADR-002 | Hono (Web Framework) | Lightweight, Web Standard, middleware system | - |
| ADR-003 | React (Frontend) | Ecosystem, component model | - |

## Layer Map

```
src/
├── server/        → Hono API routes + middleware
├── client/        → React components + pages
├── shared/        → Shared types and utilities for server/client
└── db/            → Data access layer
```

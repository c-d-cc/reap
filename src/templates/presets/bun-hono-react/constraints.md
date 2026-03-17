# Technical Constraints

> Modified only during the Birth stage.

## Tech Stack

- **Language**: TypeScript 5.x
- **Runtime**: Bun 1.x
- **Backend**: Hono — Web Standard API, middleware
- **Frontend**: React 19 — Component UI
- **Package Manager**: bun

## Constraints

- Use `shared/` directory when sharing types between server and client
- API responses must always be JSON
- Environment variables are managed via `.env`; no hardcoding in source code

## Validation Commands

| Purpose | Command | Description |
|---------|---------|-------------|
| Test | `bun test` | Run all tests |
| Type check | `bunx tsc --noEmit` | TypeScript compilation verification |

## External Dependencies

- (Add as needed for the project)

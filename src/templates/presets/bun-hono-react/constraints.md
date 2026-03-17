# Technical Constraints

> Birth 단계에서만 수정된다.

## Tech Stack

- **Language**: TypeScript 5.x
- **Runtime**: Bun 1.x
- **Backend**: Hono — Web Standard API, middleware
- **Frontend**: React 19 — 컴포넌트 UI
- **Package Manager**: bun

## Constraints

- 서버/클라이언트 타입 공유 시 `shared/` 디렉토리 사용
- API 응답은 항상 JSON
- 환경 변수는 `.env`로 관리, 코드에 하드코딩 금지

## Validation Commands

| 용도 | 명령어 | 설명 |
|------|--------|------|
| 테스트 | `bun test` | 전체 테스트 |
| 타입체크 | `bunx tsc --noEmit` | TypeScript 컴파일 검증 |

## External Dependencies

- (프로젝트에 맞게 추가)

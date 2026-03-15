# Development Conventions

> **작성 원칙**: ~100줄 이내 맵. Birth에서만 수정.

## Code Style

- TypeScript strict mode
- `async/await` 사용 (콜백 금지)
- 컴포넌트는 함수형 (FC), hook으로 로직 분리
- API 응답은 항상 `{ data, error }` 형태

## Naming Conventions

- 파일명: `kebab-case.ts` (컴포넌트: `PascalCase.tsx`)
- DB 테이블/컬럼: `snake_case`
- API 경로: `kebab-case` (`/api/items`, `/api/auth/sign-up`)
- React 컴포넌트: `PascalCase`
- hook: `use` 접두사 (`useItems`, `useAuth`)

## Testing Conventions

- API 테스트는 in-memory SQLite로 격리 (`Database(":memory:")`)
- 테스트 간 DB 상태 공유 금지
- `createApp(db)` 패턴으로 테스트용 앱 인스턴스 생성

## Git Conventions

- 커밋: `type: description` (feat, fix, test, chore)
- 한 커밋 = 한 논리적 변경

## Enforced Rules

| 규칙 | 검증 도구 | 명령어 |
|------|-----------|--------|
| API 테스트 통과 | bun test | `bun test` |
| TypeScript 컴파일 | tsc | `bunx tsc --noEmit` |
| 빌드 성공 | vite | `bun run build` |

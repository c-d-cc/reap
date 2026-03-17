# Development Conventions

> Birth 단계에서만 수정된다.

## Code Style

- TypeScript strict mode
- 함수는 단일 책임, 50줄 이하 권장
- `async/await` 사용

## Naming Conventions

- 파일명: `kebab-case.ts` / `kebab-case.tsx`
- 컴포넌트: `PascalCase`
- 함수/변수: `camelCase`
- API routes: `/api/v1/resource-name`

## Git Conventions

- 커밋 메시지: `type: description` (feat, fix, test, chore, docs)
- 한 커밋 = 한 논리적 변경

## Enforced Rules

| 규칙 | 검증 도구 | 명령어 |
|------|-----------|--------|
| 전체 테스트 통과 | bun test | `bun test` |
| TypeScript 컴파일 | tsc | `bunx tsc --noEmit` |

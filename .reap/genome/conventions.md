# Development Conventions

> **작성 원칙**: 이 파일은 ~100줄 이내의 **맵(map)**이어야 한다.
> 규칙은 가능한 한 기계적으로 검증 가능하게 작성하라.
> Birth 단계에서만 수정된다.

## Code Style

- TypeScript strict mode 사용
- 함수는 단일 책임, 50줄 이하 권장
- `async/await` 사용 (콜백/then 체인 금지)
- 에러는 호출자에게 throw, CLI 최상위에서 catch

## Naming Conventions

- 파일명: `kebab-case.ts`
- 클래스/인터페이스: `PascalCase`
- 함수/변수: `camelCase`
- 상수: `UPPER_SNAKE_CASE`
- 테스트 파일: `tests/` 미러 구조, `*.test.ts`

## Git Conventions

- 커밋 메시지: `type: description` (feat, fix, test, chore, docs)
- 한 커밋 = 한 논리적 변경
- 테스트 포함 커밋 우선

## Template Conventions

- Genome 템플릿: `src/templates/genome/` — init 시 `.reap/genome/`으로 복사
- Genome domain 가이드: `src/templates/genome/domain/README.md` — init 시 `.reap/genome/domain/`으로 복사
- 슬래시 커맨드: `src/templates/commands/` — init 시 `.reap/commands/` + `.claude/commands/`로 복사
- 산출물 템플릿: `src/templates/artifacts/` — init 시 `.reap/templates/`로 복사
- **새 템플릿 추가 시 반드시 `init.ts`의 복사 로직도 동기화하라**

## Enforced Rules

| 규칙 | 검증 도구 | 명령어 |
|------|-----------|--------|
| 전체 테스트 통과 | bun test | `~/.bun/bin/bun test` |
| TypeScript 컴파일 | tsc | `~/.bun/bin/bunx tsc --noEmit` |

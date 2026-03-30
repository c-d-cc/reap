# Implementation — gen-056: reap update에 SessionStart hook 등록 로직 추가

## Completed Tasks

### T1: registerSessionHooks export 변경
- 파일: `src/adapters/claude-code/install.ts` L119
- `async function registerSessionHooks()` -> `export async function registerSessionHooks()`
- 기존 `installSkills()` 내부 호출에 영향 없음

### T2: update.ts에서 hook sync 호출
- 파일: `src/cli/commands/update.ts`
- L15: `registerSessionHooks` import 추가
- L195-196: CLAUDE.md repair 후 `await registerSessionHooks()` 호출 (silent, best-effort)

### T3: 빌드 및 검증
- `npm run build`: 성공
- `npm run typecheck`: 통과
- `bun test tests/e2e/update.test.ts`: 4 pass, 1 fail (pre-existing failure, backlog에 등록됨)

## Architecture Decisions

**`updated` 배열에 hook sync 결과를 넣지 않음**: `registerSessionHooks()`가 "변경 여부"를 반환하지 않으므로, 항상 메시지를 표시하면 기존 "Nothing to update" E2E 테스트가 깨짐. hook sync는 side effect로 silent 실행.

**outer try/catch 불필요**: `registerSessionHooks()` 내부에서 이미 전체를 try/catch로 감싸고 있으므로 중복 방지.

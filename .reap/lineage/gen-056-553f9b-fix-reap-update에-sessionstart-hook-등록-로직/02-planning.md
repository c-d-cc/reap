# Planning — gen-056: reap update에 SessionStart hook 등록 로직 추가

## 작업 분해

### Task 1: registerSessionHooks export 변경
- 파일: `src/adapters/claude-code/install.ts`
- `async function registerSessionHooks()` -> `export async function registerSessionHooks()`
- 기존 `installSkills()` 내부 호출에 영향 없음

### Task 2: update.ts에서 hook sync 호출
- 파일: `src/cli/commands/update.ts`
- `registerSessionHooks` import 추가
- v0.16 sync 단계 step 3 (CLAUDE.md repair) 후에 호출
- 결과를 `updated` 배열에 추가하여 output에 반영 (optional — silent로도 가능)
- `registerSessionHooks()`는 이미 best-effort(catch all) + idempotent이므로 별도 에러 처리 불필요

### Task 3: 빌드 및 테스트
- `npm run build`
- 기존 테스트 실행 (`bun test tests/e2e/update.test.ts`)
- 기존 테스트는 hook 등록을 검증하지 않으나, 기존 동작이 깨지지 않음을 확인

## 테스트 전략

Hook 등록은 `~/.claude/settings.json`에 직접 쓰기를 하므로 E2E 테스트에서 실제 유저 환경을 오염시킬 위험이 있음. 이번 generation에서는:
- 기존 E2E 테스트로 regression 없음 확인
- `registerSessionHooks`가 export되었는지 import test 수준 확인
- 실제 hook 등록 동작은 수동 검증 (reap update 실행 후 settings.json 확인)

## 의존성

Task 1 -> Task 2 -> Task 3 (순차)

## 리스크

- 없음. 단순 export + 함수 호출 추가. idempotent 함수이므로 side effect 최소.

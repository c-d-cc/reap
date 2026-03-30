# Learning — gen-056: reap update에 SessionStart hook 등록 로직 추가

## 목표

`reap update` 실행 시 SessionStart hook이 등록되지 않는 문제 수정.

## 문제 분석

Hook 등록 경로:
- `npm install -g` -> postinstall -> `installSkills()` -> `registerSessionHooks()` -> hook 등록됨
- `npm update -g` -> postinstall 재실행 -> hook 등록됨
- `reap update` -> hook 등록 로직 없음 (문제)

`registerSessionHooks()`는 `src/adapters/claude-code/install.ts`에 정의되어 있으며, 이미 idempotent하게 구현됨 (기존 hook이 있으면 skip). 현재 `async function`으로 private 선언.

## 수정 범위

1. **`src/adapters/claude-code/install.ts`** — `registerSessionHooks()`를 `export`로 변경
2. **`src/cli/commands/update.ts`** — `registerSessionHooks()` import 및 v0.16 sync 단계에서 호출 추가

## 코드 분석

### install.ts (L119-165)
- `registerSessionHooks()`: `~/.claude/settings.json`의 `hooks.SessionStart`에 두 hook을 등록
  - `reap check-version 2>/dev/null || true`
  - `reap load-context 2>/dev/null || true`
- 이미 존재하면 skip (idempotent)
- 에러 시 silent catch (best-effort)

### update.ts (L135-229)
- v0.16 sync 단계: config backfill -> directory creation -> CLAUDE.md repair -> release notice -> output
- Hook 등록을 추가할 위치: CLAUDE.md repair 후, release notice 전 (step 4)
- `updated` 배열에 hook sync 결과도 추가하면 output에 반영됨

### 테스트
- `tests/e2e/update.test.ts` 존재 (4 suite)
- Hook 등록 관련 테스트는 없음 — 새 테스트 추가 필요
- 단, hook 등록은 `~/.claude/settings.json`을 조작하므로 E2E에서 실제 유저 파일을 건드리는 위험이 있음
- Unit test로 `registerSessionHooks`의 export 확인 + update에서 호출되는지 검증하는 것이 적절

## Clarity

HIGH — 수정 대상, 방법, 범위 모두 명확. 자율 실행 가능.

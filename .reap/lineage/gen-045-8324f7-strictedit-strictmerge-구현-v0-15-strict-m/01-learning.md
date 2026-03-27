# Learning

> strictEdit/strictMerge 구현 — v0.15 strict mode 이식

## Project Overview

REAP v0.16에서 `config.yml`에 `strict: boolean` 필드가 존재하지만 실제 enforce 로직이 없다. v0.15에서는 `buildStrictSection()`이 evolve prompt에 HARD-GATE 섹션을 주입하여 strictEdit(implementation stage 외 코드 수정 차단)과 strictMerge(직접 git merge 차단)를 강제했다. 이번 generation에서 이 로직을 v0.16에 이식한다.

## Key Findings

### v0.15 구현 분석 (`genome-loader.cjs:220-238`)

- `buildStrictSection(strictEdit, strictMerge, genStage)` — 3가지 분기:
  1. `strictEdit + implementation stage` — 코드 수정 허용, planning artifact 범위 내에서만
  2. `strictEdit + no generation` — 코드 수정 완전 차단
  3. `strictEdit + other stage` — 코드 수정 차단, 읽기/분석/REAP artifact만 허용
  4. `strictMerge` — 직접 git pull/push/merge 차단, REAP 명령만 허용
- 유저 override: "bypass strict" 시 해당 action만 허용, 즉시 재적용
- `resolveStrict()` (`config.ts:76-87`): `boolean | { edit, merge }` → `{ edit: boolean, merge: boolean }`

### v0.16 현재 상태

- **타입** (`src/types/index.ts:63`): `strict: boolean` — 단일 boolean
- **prompt.ts**: `buildBasePrompt()`에 strict 관련 코드 없음
- **init/common.ts:68**: `strict: false` 기본값
- **update.ts:15**: `CONFIG_DEFAULTS`에 `strict: false`
- **migrate.ts:424**: v0.15 `strict` 값 그대로 복사 (`boolean`)
- **integrity.ts:176-180**: `strict`가 boolean 또는 object인지 검증
- **evolve.ts:73**: `buildBasePrompt()`에 config 전달하지 않음 (strict 정보 미전달)

### 변경 범위

1. `src/types/index.ts` — `strict: boolean` → `strictEdit: boolean`, `strictMerge: boolean`
2. `src/core/prompt.ts` — `buildBasePrompt()`에 strict HARD-GATE 섹션 추가 (config + stage 정보 필요)
3. `src/cli/commands/init/common.ts` — 기본값 변경
4. `src/cli/commands/update.ts` — config backfill에서 `strict` → `strictEdit`/`strictMerge` 변환
5. `src/cli/commands/migrate.ts` — v0.15 strict 변환
6. `src/core/integrity.ts` — 검증 로직 업데이트
7. `src/cli/commands/run/evolve.ts` — config를 buildBasePrompt에 전달

### 영향받는 테스트

- `tests/unit/integrity.test.ts` — strict 타입 검증 테스트
- `tests/e2e/migrate.test.ts` — config의 strict 필드
- `tests/e2e/init-repair.test.ts` — config strict 필드
- `tests/scenario/merge.test.ts` — config 문자열의 strict 필드

## Previous Generation Reference

gen-044: `reap help` 고도화. 435 tests pass. v0.15 코드 참조가 이식 속도를 높인다는 교훈.

## Backlog Review

- [task] strictEdit/strictMerge 구현 (현재 generation의 source backlog)

## Technical Deep-Dive

### config 호환성 전략

기존 `strict: boolean` → `strictEdit: boolean, strictMerge: boolean` 변환:
- `strict: true` → `strictEdit: true, strictMerge: true`
- `strict: false` → `strictEdit: false, strictMerge: false`
- `strict` 필드가 남아있는 경우 → update 명령이 자동 변환

integrity.ts는 이미 `typeof config.strict !== "object"`를 허용하고 있어 과도기에 하위 호환 가능.

### prompt 주입 방식

`buildBasePrompt()`에 config 정보(strictEdit, strictMerge)와 현재 stage 정보를 전달해야 한다. 현재 signature에 config 파라미터가 없으므로 추가 필요. v0.15의 HARD-GATE 텍스트를 거의 그대로 사용 가능.

## Context for This Generation

- Clarity: **HIGH** — backlog에 구체적 task, v0.15 reference 명확, 변경 범위 한정적
- Embryo generation — genome 수정 자유
- 현재 테스트: 435 pass
- docs/README 업데이트는 범위 밖

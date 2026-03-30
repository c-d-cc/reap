# Learning

## Project Overview

REAP v0.16 CLI 도구. strict merge mode가 merge generation의 merge stage에서도 git merge를 차단하는 버그 수정.

## Key Findings

### 문제 지점

`buildStrictSection(strictEdit, strictMerge, stage)` 함수 (src/core/prompt.ts:47-69)가 generation type을 전혀 고려하지 않음.
- `strictMerge === true`이면 무조건 HARD-GATE 출력
- merge generation의 merge stage에서도 `git merge` 차단 → 모순

### 영향 범위 (2곳)

1. **src/core/prompt.ts** — `buildStrictSection()` 정의 + `buildBasePrompt()`에서 호출 (line 202)
2. **src/cli/commands/load-context.ts** — SessionStart hook에서 직접 `buildStrictSection()` 호출 (line 127)

### 수정 방향

`buildStrictSection()`에 `generationType` 파라미터 추가.
- `generationType === "merge"`이면 strict merge HARD-GATE를 bypass하고, 대신 "merge generation이므로 git merge 허용" 안내 출력
- 양쪽 호출처 모두 state.type을 전달하도록 수정
- 기존 테스트 (tests/unit/prompt-strict.test.ts) 업데이트 + merge bypass 테스트 추가

### 기존 테스트

`tests/unit/prompt-strict.test.ts` — buildStrictSection 9개, buildBasePrompt strict integration 6개.
현재 모든 테스트가 `type: "normal"` 또는 type 없음. merge type 테스트 없음.

## Backlog Review

이 generation의 source backlog: `strict-merge-mode-bypass-for-merge-gen.md` (high priority).

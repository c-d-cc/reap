---
type: task
status: consumed
consumedBy: gen-045-8324f7
consumedAt: 2026-03-27T14:12:26.636Z
priority: high
createdAt: 2026-03-27T14:00:37.302Z
---

# strictEdit/strictMerge 구현 — v0.15 strict mode 이식

## Problem

v0.16에서 strict config 필드만 있고 실제 enforce 로직이 없다. v0.15에서는 strictEdit (implementation stage 외 코드 수정 차단)과 strictMerge (REAP merge 명령 외 직접 git merge 차단)가 있었다.

## Solution

config.yml의 `strict: boolean`을 `strictEdit: boolean`, `strictMerge: boolean`으로 분리하고, evolve prompt에 HARD-GATE로 주입:

### strictEdit
- **implementation stage**: 코드 수정 허용, 단 planning artifact의 task 범위 내에서만
- **다른 stage / generation 없음**: 코드 수정 차단. 읽기, 분석, REAP artifact 작성만 허용
- **유저 override**: "bypass strict" 등 명시적 요청 시 해당 action만 허용, 즉시 재적용
- v0.15 참조: `genome-loader.cjs:220-231` buildStrictSection()

### strictMerge
- 직접 git pull/push/merge 차단
- /reap.pull, /reap.push, /reap.merge만 허용
- 유저 override 동일 패턴
- v0.15 참조: `genome-loader.cjs:233-234`

### 구현 위치
- `buildBasePrompt()`에서 config의 strictEdit/strictMerge 읽어서 HARD-GATE 섹션 주입
- config backfill: 기존 `strict: true`는 `strictEdit: true, strictMerge: true`로 변환

## Files to Change

- `src/types/index.ts` — strict → strictEdit, strictMerge
- `src/core/prompt.ts` — buildBasePrompt()에 strict 섹션 추가
- `src/cli/commands/init/common.ts` — 기본값 변경
- `src/cli/commands/update.ts` — config backfill에 strict 변환 추가
- `src/cli/commands/migrate.ts` — v0.15 strict 변환
- `src/core/integrity.ts` — validation 업데이트
- docs, README config 예시 업데이트

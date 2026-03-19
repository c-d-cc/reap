# Objective

## Goal
reap.pull에서 fast-forward 감지 — 이미 merged된 branch pull 시 full merge lifecycle 스킵

## Completion Criteria
1. `src/core/merge-generation.ts`에 `canFastForward(targetBranch, cwd)` 함수 추가
2. `reap.pull.md` slash command에 fast-forward 감지 + 처리 로직 추가
3. `bunx tsc --noEmit`, `bun test`, `npm run build` 통과

## Scope
- **Expected Change Scope**: src/core/merge-generation.ts, src/templates/commands/reap.pull.md
- **Exclusions**: docs, E2E 테스트 추가 (별도)

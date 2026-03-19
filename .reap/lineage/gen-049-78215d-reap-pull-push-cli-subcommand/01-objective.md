# Objective

## Goal
reap pull / reap push CLI subcommand 구현

## Completion Criteria
1. `reap pull` — git fetch + 원격 branch .reap/lineage/ 스캔 + 새 generation 감지/알림
2. `reap push` — active generation 상태 검증 + git push
3. `bunx tsc --noEmit`, `bun test`, `npm run build` 통과

## Scope
- **Expected Change Scope**: src/cli/commands/pull.ts (신규), src/cli/commands/push.ts (신규), src/cli/index.ts
- **Exclusions**: slash commands, merge hooks, docs

# Objective
## Goal
merge hook event 등록 (onMergeStart, onGenomeResolved, onMergeComplete) + reap.merge.* slash command 템플릿 7종

## Completion Criteria
1. ReapHookEvent 타입에 merge hook events 3개 추가
2. reap.merge.* slash command 템플릿 7종 작성 (src/templates/commands/)
3. init.ts COMMAND_NAMES에 merge commands 추가
4. `bunx tsc --noEmit`, `bun test`, `npm run build` 통과

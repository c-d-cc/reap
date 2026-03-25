---
type: task
status: consumed
consumedBy: gen-005-944652
priority: high
---

# start에서 backlog consume 마킹 + learning artifact에 근거 참조

## Problem
1. `reap run start`에서 backlog를 scan하고 보여주지만, 선택한 backlog를 consumed로 마킹하지 않음
2. `--backlog <filename>` 파라미터가 없어서 어떤 backlog를 기반으로 generation이 시작됐는지 추적 불가
3. learning artifact에서 해당 generation의 근거가 되는 backlog를 명시적으로 참조하지 않음 — 나중에 artifact를 봤을 때 왜 이 generation이 발생했는지 알 수 없음

## v0.15 Reference
start.ts (line 84-87):
```typescript
// Mark backlog consumed (after ID generation)
if (backlogFile) {
  await markBacklogConsumed(paths.backlog, backlogFile, state.id);
}
```
- `--backlog <filename>` 파라미터로 소비할 backlog 지정
- generation 생성 후 `markBacklogConsumed(dir, filename, genId)` 호출
- frontmatter: `status: consumed`, `consumedBy: gen-xxx`

## Solution
1. start.ts에 `--backlog <filename>` 옵션 추가
2. generation 생성 후 `consumeBacklog(path, genId)` 호출
3. GenerationState에 `sourceBacklog` 필드 추가 (이미 타입에 존재할 수 있음)
4. learning stage prompt에서 sourceBacklog가 있으면 해당 backlog 파일을 읽고 01-learning.md에 근거로 명시하도록 안내

## Files to Change
- src/cli/commands/run/start.ts — --backlog 옵션, consumeBacklog 호출
- src/cli/commands/run/learning.ts — sourceBacklog 참조 안내
- src/core/backlog.ts — consumeBacklog가 이미 있으나 동작 확인 필요

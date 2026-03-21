---
description: "REAP Merge Evolve — Run the full merge lifecycle automatically"
---

# Merge Evolve

Run the entire merge lifecycle from the current stage to completion.

## Gate
- Verify current generation is type: merge

## Hook Auto-Execution
Each merge stage command automatically executes its own hook at completion:
- `/reap.merge.detect` → `onMergeDetected`
- `/reap.merge.mate` → `onMergeMated`
- `/reap.merge.merge` → `onMergeMerged`
- `/reap.merge.sync` → `onMergeSynced`
- `/reap.merge.validation` → `onMergeValidated`
- `/reap.merge.completion` → `onMergeCompleted` (before archiving and commit)

`/reap.next` only handles stage transitions — it does NOT execute hooks or archiving.
`/reap.merge.completion` handles archiving and the final commit.

## Steps

Execute the merge lifecycle loop:
1. Read `current.yml` to determine stage
2. Execute the corresponding merge stage command:
   - `detect` → `/reap.merge.detect`
   - `mate` → `/reap.merge.mate`
   - `merge` → `/reap.merge.merge`
   - `sync` → `/reap.merge.sync`
   - `validation` → `/reap.merge.validation`
   - `completion` → `/reap.merge.completion`
3. When a stage command completes (hooks already executed by the stage command):
   - If the current stage is `completion`: `/reap.merge.completion` handles archiving and commit internally. The loop ends.
   - Otherwise: run `/reap.next` to advance, then return to step 1.

## Autonomous Override
Same rules as `/reap.evolve` — skip routine confirmations, stop only when genuinely blocked.
**Exception**: `/reap.merge.sync` inconsistencies always require user confirmation even in autonomous mode.

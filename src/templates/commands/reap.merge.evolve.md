---
description: "REAP Merge Evolve — Run the full merge lifecycle automatically"
---

# Merge Evolve

Run the entire merge lifecycle from the current stage to completion.

## Gate
- Verify current generation is type: merge

## Steps

Execute the merge lifecycle loop:
1. Read `current.yml` to determine stage
2. Execute the corresponding merge stage command:
   - `detect` → `/reap.merge.detect`
   - `genome-resolve` → `/reap.merge.genome-resolve`
   - `source-resolve` → `/reap.merge.source-resolve`
   - `sync-test` → `/reap.merge.sync-test`
   - `completion` → `/reap.merge.completion`
3. After each stage, run `/reap.next`
4. If `/reap.next` archives the generation, the loop ends

## Autonomous Override
Same rules as `/reap.evolve` — skip routine confirmations, stop only when genuinely blocked.

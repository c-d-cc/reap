---
description: "REAP Merge Sync Test — Verify genome-source consistency"
---

# Merge Sync Test

Verify that the merged source code is consistent with the finalized genome.

## Gate
- Verify current generation is type: merge and stage: sync-test
- Verify `03-source-resolve.md` exists

## Steps

1. Run all validation commands from `.reap/genome/constraints.md`:
   - Tests, type check, build
2. Record results in `04-sync-test.md`
3. If all pass: proceed with `/reap.next`
4. If any fail:
   - Analyze the failure
   - `/reap.back source-resolve` to fix source issues
   - Or `/reap.back genome-resolve` if the genome needs adjustment

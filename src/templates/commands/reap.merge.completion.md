---
description: "REAP Merge Completion — Finalize the merge generation"
---

# Merge Completion

Finalize the merge generation after sync test passes.

## Gate
- Verify current generation is type: merge and stage: completion
- Verify `04-sync-test.md` exists

## Steps

1. Commit the merged source + genome changes
2. Write `05-completion.md` with:
   - Summary of what was merged
   - Genome changes applied
   - Lessons learned
3. Proceed with `/reap.next` to archive

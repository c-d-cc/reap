---
description: "REAP Merge Detect — Analyze divergence between branches"
---

# Merge Detect

Analyze the divergence between the current branch and the target branch.

## Gate
- Verify current generation is type: merge and stage: detect

## Steps

1. Read `01-detect.md` (created by `reap merge` CLI)
2. Review the divergence report with the human:
   - Common ancestor
   - Genome changes on each side
   - Conflicts (WRITE-WRITE, CROSS-FILE)
3. If the detect needs to be re-run, use `reap merge {branch}` again
4. When satisfied, proceed with `/reap.next`

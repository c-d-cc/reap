---
description: "REAP Merge Start — Start a merge generation to combine divergent branches"
---

# Merge Start

Start a merge generation by specifying a target branch to merge into the current branch.

## Steps

1. Verify no active generation exists
2. Ask the human for the target branch name
3. Run `reap merge {branch}` CLI command (this creates the merge generation and runs detect)
4. Review the generated `01-detect.md` artifact
5. If conflicts exist: proceed to `/reap.merge.genome-resolve`
6. If no conflicts: genome-resolve can be skipped, proceed to `/reap.merge.source-resolve`

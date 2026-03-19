---
description: "REAP Merge Start — Start a merge generation to combine divergent branches"
---

# Merge Start

Start a merge generation by specifying a target branch to merge into the current branch.

## Gate
- Verify no active generation exists
- Verify the target branch exists (`git rev-parse --verify {branch}`)

## Steps

1. Ask the human for the target branch name (if not provided)
2. Run detect: scan target branch genome/lineage via git refs, find common ancestor, extract diffs
3. Create merge generation in `current.yml` (type: merge, stage: detect)
4. Generate `01-detect.md` artifact with divergence report
5. Report: parents, common ancestor, conflict count
6. If genome conflicts exist: proceed to `/reap.merge.mate`
7. If no genome conflicts: mate can auto-pass, proceed to `/reap.merge.merge`

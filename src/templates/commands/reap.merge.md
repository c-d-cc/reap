---
description: "REAP Merge — Run a full merge generation for a local branch"
---

# Merge

Run a full merge generation lifecycle for a local branch. This is the local/worktree equivalent of `/reap.pull` — no fetch needed.

If the target branch already includes all local work (fast-forward), skip the merge lifecycle entirely.

## Gate (Preconditions)
- Verify no active generation exists (`.reap/life/current.yml` must be empty)
- If an active generation exists: ERROR — "Complete the current generation before merging."

## Arguments
- `{branch}` — Target local branch to merge (required)

## Steps

### Phase 1: Detect
1. Verify the target branch exists: `git rev-parse --verify {branch}`
   - If not found: ERROR — "Branch {branch} does not exist."
2. Scan the target branch's `.reap/lineage/` via git refs
3. Compare with local lineage to identify new generations
4. If no new generations: "Already up to date." → STOP

### Phase 2: Fast-Forward Check
5. Determine the local latest generation ID and the target branch's latest generation ID
6. Build a combined DAG from both lineage metadata
7. Check if the local latest generation is an ancestor of the target's latest generation:
   - **If yes (fast-forward possible)**:
     - Run `git merge --ff {branch}`
     - Report: "Fast-forwarded to {branch}. No merge generation needed."
     - **STOP**
   - **If same generation**: "Already up to date." → **STOP**
   - **If no (diverged)**: Continue to Phase 3

### Phase 3: Merge Generation
8. Execute `/reap.merge.start` with the target branch
   - This creates the merge generation and runs detect (01-detect.md)
9. Execute `/reap.merge.evolve` to run the full merge lifecycle:
   - Detect → Mate → Merge → Sync → Validation → Completion
10. The merge generation is archived upon completion

## Completion
- Fast-forward: "Fast-forwarded to {branch}. No merge generation needed."
- Full merge: "Merge complete. Merged {branch} into {current-branch}. Generation {id} archived."

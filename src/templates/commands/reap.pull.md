---
description: "REAP Pull — Fetch remote, detect divergence, and run a full merge generation"
---

# Pull

Fetch from the remote, detect new generations, and run a full merge generation lifecycle. This is the distributed equivalent of `/reap.evolve`.

## Gate (Preconditions)
- Verify no active generation exists (`.reap/life/current.yml` must be empty)
- If an active generation exists: ERROR — "Complete the current generation before pulling."

## Arguments
- `{branch}` — Target remote branch to pull from (required)

## Steps

### Phase 1: Fetch + Detect
1. Run `git fetch origin` (or the specified remote)
2. Verify the target branch exists: `git rev-parse --verify {branch}`
   - If not found: ERROR — "Branch {branch} does not exist. Run `git fetch` first."
3. Scan the target branch's `.reap/lineage/` via git refs:
   - `git ls-tree -r --name-only {branch} -- .reap/lineage/`
   - Read `meta.yml` files via `git show {branch}:.reap/lineage/{dir}/meta.yml`
4. Compare with local lineage to identify new generations
5. If no new generations: "Already up to date. No new generations on {branch}." → STOP
6. Report: list new generation IDs + goals found on the target branch

### Phase 2: Merge Generation
7. Execute `/reap.merge.start` with the target branch
   - This creates the merge generation and runs detect (01-detect.md)
8. Execute `/reap.merge.evolve` to run the full merge lifecycle:
   - Detect → Mate → Merge → Sync → Validation → Completion
9. The merge generation is archived upon completion

## Completion
- "Pull complete. Merged {branch} into {current-branch}. Generation {id} archived."

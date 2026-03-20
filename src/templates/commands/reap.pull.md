---
description: "REAP Pull — Fetch remote, detect divergence, and run a full merge generation"
---

# Pull

Fetch from the remote, detect new generations, and run a full merge generation lifecycle. This is the distributed equivalent of `/reap.evolve`.

If the target branch already includes all local work (fast-forward), skip the merge lifecycle entirely.

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

### Phase 1.5: Fast-Forward Check
7. Determine the local latest generation ID and the remote latest generation ID
8. Build a combined DAG from both local and remote lineage metadata
9. Check if the local latest generation is an ancestor of the remote latest generation:
   - **If yes (fast-forward possible)**:
     - Run `git merge --ff {branch}`
     - Run `git submodule update --init` to sync submodules
     - Report: "Fast-forwarded to {branch}. Local lineage now includes {remote-latest-id}. No merge generation needed."
     - **STOP** — no merge lifecycle needed
   - **If same generation**: "Already up to date." → **STOP**
   - **If no (diverged)**: Continue to Phase 2

### Phase 2: Merge Generation
10. Execute `/reap.merge.start` with the target branch
    - This creates the merge generation and runs detect (01-detect.md)
11. Execute `/reap.merge.evolve` to run the full merge lifecycle:
    - Detect → Mate → Merge → Sync → Validation → Completion
12. Run `git submodule update --init` to sync submodules after merge
13. The merge generation is archived upon completion

## Completion
- Fast-forward: "Fast-forwarded to {branch}. No merge generation needed."
- Full merge: "Pull complete. Merged {branch} into {current-branch}. Generation {id} archived."

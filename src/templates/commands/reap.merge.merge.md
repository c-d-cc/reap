---
description: "REAP Merge Merge — Merge source code with finalized genome as guide"
---

# Merge Merge (Source Merge)

Merge the source code from the target branch, using the finalized genome as the authoritative guide.

## Gate
- Verify current generation is type: merge and stage: merge
- Verify `02-mate.md` exists

## Steps

1. Run `git merge --no-commit {target-branch}` to start the source merge
2. If git merge conflicts exist:
   - Resolve each conflict guided by the finalized genome
   - Record resolutions in `03-merge.md`
3. If no git conflicts:
   - Check for semantic conflicts (code that compiles but contradicts the genome)
4. Do NOT commit yet — sync and validation must pass first
5. Execute hooks and proceed with `/reap.next`

### Hook Execution
Execute hooks for event `onMergeMerged` following the Hook System protocol:
- Scan `.reap/hooks/` for `onMergeMerged.*` files
- Sort by frontmatter `order`, then alphabetically
- Evaluate `condition`, execute `.md` (AI prompt) or `.sh` (shell script)
- All hooks run BEFORE any commit (hook outputs included in the same commit)

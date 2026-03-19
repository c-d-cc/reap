---
description: "REAP Merge Source Resolve — Merge source code with resolved genome as guide"
---

# Merge Source Resolve

Merge the source code from the target branch, using the finalized genome as the authoritative guide.

## Gate
- Verify current generation is type: merge and stage: source-resolve
- Verify `02-genome-resolve.md` exists

## Steps

1. Run `git merge --no-commit {target-branch}` to start the source merge
2. If git merge conflicts exist:
   - Resolve each conflict guided by the finalized genome
   - Record resolutions in `03-source-resolve.md`
3. If no git conflicts:
   - Check for semantic conflicts (code that compiles but contradicts the genome)
4. Do NOT commit yet — sync test must pass first
5. Proceed with `/reap.next`

---
description: "REAP Merge Completion — Finalize the merge generation with archiving"
---

# Merge Completion

Finalize the merge generation after validation passes.

## Gate
- Verify current generation is type: merge and stage: completion
- Verify `05-validation.md` exists

## Steps

1. Write `06-completion.md` with:
   - Summary of what was merged
   - Genome changes applied
   - Lessons learned

### Hook Execution + Archiving + Commit

**This phase handles hook execution, archiving, and commit (previously done by `reap.next`).**

2. **Hook Execution** (before archiving, before commit):
   Execute hooks for event `onMergeCompleted` following the Hook System protocol:
   - Scan `.reap/hooks/` for `onMergeCompleted.*` files
   - Sort by frontmatter `order`, then alphabetically
   - Evaluate `condition`, execute `.md` (AI prompt) or `.sh` (shell script)
   - All hook outputs are included in the same generation commit

3. **Archiving**:
   - Add the current timestamp to `completedAt` in `current.yml`
   - Create the lineage directory: `.reap/lineage/[gen-id]-[goal-slug]/`
     - Goal slug: lowercase, non-alphanumeric/hangul replaced with `-`, max 30 chars
   - **Write `meta.yml`** in the lineage directory with DAG metadata:
     ```yaml
     id: [gen-id]
     type: merge
     parents: [parent generation IDs from current.yml]
     goal: [goal from current.yml]
     genomeHash: [genomeHash from current.yml, or compute from .reap/genome/]
     startedAt: [startedAt from current.yml]
     completedAt: [current ISO 8601]
     ```
   - Move artifact files (`01-*.md` through `06-*.md`) from `.reap/life/` to the lineage directory
   - Process backlog files from `.reap/life/backlog/`:
     - Create `.reap/lineage/[gen-id]-[goal-slug]/backlog/` directory
     - Files with `status: consumed` → move to lineage backlog
     - Files with `status: pending` or no status field → copy to lineage backlog, carry over to `.reap/life/backlog/`
   - Clear `current.yml` (write empty content)
   - Recreate `.reap/life/backlog/` directory (with carried-over pending items)

4. **Commit** (source + archiving in a single commit):
   - **Submodule check**: If any git submodule has uncommitted changes, commit and push inside the submodule first, then stage the updated submodule pointer in the parent repo
   - Stage all changed files (merged source + genome changes + `.reap/` artifacts + hook outputs)
   - Commit message format: `merge(gen-NNN-hash): [generation goal summary]`

## Completion
- "Merge generation [id] complete and archived. Run `/reap.start` to begin a new generation."

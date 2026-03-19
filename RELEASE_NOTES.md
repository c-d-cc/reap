## What's New

### Distributed Workflow for Parallel Development

REAP now supports distributed collaboration where multiple developers or AI agents work on the same project in parallel — without a central server. Git is the only transport layer.

- **Merge Generation**: A specialized 6-stage lifecycle (Detect → Mate → Merge → Sync → Validation → Completion) that resolves genome conflicts before source code conflicts
- **`/reap.pull <branch>`**: Fetch + run a full merge generation — the distributed equivalent of `/reap.evolve`
- **`/reap.merge <branch>`**: Run a merge generation for a local branch (worktree-based parallel development)
- **`/reap.push`**: Validate REAP state and push the current branch
- **Fast-forward detection**: When the target branch already includes local work, skip the merge lifecycle entirely
- **Git ref-based reading**: Compare genome and lineage across branches via `git show` / `git ls-tree` — no checkout needed

### Strict Mode Granular Control

`strict` now supports granular `{ edit, merge }` configuration:

```yaml
strict: true              # shorthand: enables both
strict:
  edit: true              # restrict code changes to REAP lifecycle
  merge: false            # restrict raw git pull/push/merge
```

### Other Improvements

- **Merge artifact templates** (6 types): detect, mate, merge, sync, validation, completion
- **Merge hook events**: `onMergeStart`, `onGenomeResolved`, `onMergeComplete`
- **Lineage utilities**: Shared lineage query module (`lineage.ts`)
- **`/reap.next` meta.yml**: Archiving now correctly generates DAG metadata
- **`parseValidationCommands` bugfix**: Fixed premature table end detection
- **Test coverage**: 105 → 159 tests (+54), covering merge-lifecycle, merge-generation, merge, git, config modules
- **Documentation**: 3 new docs pages (Distributed Workflow, Merge Generation, Merge Commands), README updated in 4 languages

## Generations

- **gen-046**: Merge Generation lifecycle implementation
- **gen-047**: Genome knowledge systematization (collaboration.md, merge-lifecycle.md)
- **gen-048**: merge.ts git ref refactor + reap merge CLI
- **gen-049**: reap pull/push CLI (later moved to slash commands)
- **gen-050**: Merge hook events + reap.merge.* slash command templates
- **gen-051**: CLI cleanup + 6-stage transition + docs update
- **gen-052**: Regression planning append + workflow guard + strict granular
- **gen-053**: Merge E2E test (16/16 passed, 5m 15s)
- **gen-054**: reap.pull fast-forward detection
- **gen-055**: Docs improvements + /reap.merge command + strict docs
- **gen-056**: Test coverage reinforcement (105→159)

---
description: "REAP Abort — Abort the current Generation (2-phase: confirm → execute)"
---

## Usage

### Phase 1: Confirm (default)
Run `reap run abort` to get a confirm prompt with current generation info.

The prompt will show:
- Active generation ID, goal, and stage
- Instructions to ask the human for confirmation
- Instructions to check git diff for uncommitted changes

### Phase 2: Execute
After human confirms, run:
```
reap run abort --phase execute --reason '<reason>' --source-action <rollback|stash|hold|none> [--save-backlog]
```

**Options:**
- `--reason '<reason>'` — Why the generation is being aborted
- `--source-action <action>` — What to do with uncommitted source changes:
  - `rollback` — Suggest git checkout/reset
  - `stash` — Suggest git stash
  - `hold` — Keep changes as-is
  - `none` — No uncommitted changes
- `--save-backlog` — Save abort progress as a new backlog item (`aborted-{genId}.md`)

**What execute does:**
1. Optionally saves progress to backlog
2. Reverts consumed backlog items back to pending
3. Clears life/ directory (preserves backlog/)

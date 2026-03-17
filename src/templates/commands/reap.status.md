---
description: "REAP Status — Show current generation state and project health"
---

# Status

Display a comprehensive overview of the current REAP project state.

## Steps

### 1. Project Info
- Read `.reap/config.yml` for project name, entryMode, preset, hooks
- Count completed generations in `.reap/lineage/`

### 2. Current Generation
- Read `.reap/life/current.yml`
- If no active generation: report "No active Generation" and skip to Step 5
- Display: Generation ID, goal, current stage, genomeVersion, startedAt

### 3. Stage Progress
- Read the current stage's artifact file (`.reap/life/0X-*.md`)
- Summarize what has been done so far in this stage (completed tasks, decisions made, etc.)
- If the artifact doesn't exist yet, report "Stage not started"

### 4. Timeline & Notable Events
- Display the full timeline from `current.yml`:
  - Stage transitions with timestamps
  - Regressions (from, reason, refs)
- Flag notable events:
  - Any regressions in this generation
  - Deferred tasks (from `03-implementation.md` if exists)
  - Genome-change backlog items pending

### 5. Backlog Summary
- Read all files in `.reap/life/backlog/`
- Count by type: `genome-change`, `environment-change`, `task`
- List titles briefly

### 6. Genome Health
- Quick check of `.reap/genome/` files:
  - Any files that are still placeholder-only?
  - Any files exceeding 100 lines?
  - Is `domain/` empty (no rule files)?

## Output Format
Present as a structured summary the human can quickly scan:

```
📊 REAP Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project: [name] ([entryMode])
Genome Version: v[N]
Completed Generations: [count]

🔄 Active Generation: [id]
Goal: [goal]
Stage: [stage]
Started: [date]

📋 Stage Progress:
[summary of current artifact]

📅 Timeline:
[stage transitions]

📦 Backlog: [N] items
  genome-change: [n]  environment-change: [n]  task: [n]

🧬 Genome Health: [status]
```

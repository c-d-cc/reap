---
description: "REAP Status — Show current generation state and project health"
---

# Status

Display a comprehensive overview of the current REAP project state.

## IMPORTANT: File Access Rules
- ONLY read files explicitly listed in the steps below. Do NOT guess or infer file paths.
- If a file read fails or the file does not exist, skip it silently and continue.
- Do NOT attempt to read files like `reaprc.json`, `.reaprc`, or any file not specified in this command.
- The REAP project structure uses ONLY: `.reap/config.yml`, `.reap/life/current.yml`, `.reap/life/backlog/`, `.reap/life/0X-*.md`, `.reap/genome/`, `.reap/lineage/`

## Steps

### 1. Project Info (MUST execute all of these)
- Read `.reap/config.yml` for project name, entryMode, strict, autoUpdate, language
- Count completed generations in `.reap/lineage/`
- **REQUIRED**: Run the shell command `reap --version` to get the installed version. You MUST actually execute this command, do not skip it.
- Show "REAP: v{installed}" — do NOT run `npm view` here (slow network call). Users can run `/reap.update` to check for updates.

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
  - Any files exceeding their line limit? (default: ~100 lines. For source-map.md, read the file's own header to find its adaptive line limit.)
  - Is `domain/` empty (no rule files)?

## Output Format
Present as a structured summary the human can quickly scan:

```
📊 REAP Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REAP: v[installed] (run `/reap.update` to check for updates)
Project: [name] ([entryMode])
Strict: [on/off]  Auto-Update: [on/off]  Language: [lang]
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

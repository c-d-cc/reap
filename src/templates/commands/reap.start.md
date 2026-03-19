---
description: "REAP Start — Start a new Generation"
---

# Start a New Generation

## Gate (Preconditions)
- Read `.reap/life/current.yml`
- If an active Generation exists: ERROR — "Generation [id] is in progress (stage: [stage]). Complete it before starting a new generation." **STOP**

## Steps

### 0. Backlog Scan
- Read all files in `.reap/life/backlog/`
- If backlog items exist:
  - Present the list with title and priority for each item
  - Ask: "Would you like to select one of these, or enter a new goal?"
  - If the human selects a backlog item: use its title/content as the goal, then update the selected item's frontmatter to `status: consumed` and add `consumedBy: gen-XXX`
  - If the human wants a new goal: proceed to Step 1
- If no backlog items exist: proceed to Step 1

1. Ask the human for the goal of this generation
2. Count existing generations in `.reap/lineage/` to determine the genomeVersion
3. Generate the next generation ID (existing count + 1, in `gen-XXX` format)
4. Write the following to `current.yml`:
   ```yaml
   id: gen-XXX
   goal: [goal provided by the human]
   stage: objective
   genomeVersion: [generation count + 1]
   startedAt: [current ISO 8601 timestamp]
   timeline:
     - stage: objective
       at: [current ISO 8601 timestamp]
   ```
5. Immediately create `.reap/life/01-objective.md` from the artifact template with the Goal section filled in

### Hook Execution
6. Read `.reap/config.yml` — if `hooks.onGenerationStart` is defined, execute each hook in order:
   - First, evaluate the `condition` field (skip if condition is not met):
     - `always` or absent: always execute
     - `has-code-changes`: execute only if src/ files were changed in this generation (check `git diff` or implementation artifact)
     - `version-bumped`: execute only if `package.json` version ≠ `git describe --tags --abbrev=0`
   - Then execute:
     - If hook has `command`: run the shell command
     - If hook has `execute` (file path): read the file and follow its instructions (.md = AI prompt, .sh = shell script)
     - If hook has `prompt` (legacy): follow the prompt instructions directly

## Completion
- "Generation gen-XXX started. Proceed with `/reap.objective` to define the goal, or `/reap.evolve` to run the full lifecycle."

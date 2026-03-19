---
description: "REAP Next — Advance to the next lifecycle stage"
---

# Next Stage

## Gate (Preconditions)
- Read `.reap/life/current.yml`
- If no active Generation: ERROR — "No active Generation. Run `/reap.start` first." **STOP**

## Steps

### Stage Transition
- Stage order: objective → planning → implementation → validation → completion
- Update the `stage` in `current.yml` to the next stage
- Add an entry to `timeline`:
  ```yaml
  - stage: [next stage]
    at: [current ISO 8601]
  ```
- Immediately create the next stage's artifact file from template (empty, ready to fill)

### Hook Execution (Stage Transition)
- Read `.reap/config.yml` — if `hooks.onStageTransition` is defined, execute each hook in order:
  - First, evaluate the `condition` field (skip if condition is not met):
    - `always` or absent: always execute
    - `has-code-changes`: execute only if src/ files were changed in this generation (check `git diff` or implementation artifact)
    - `version-bumped`: execute only if `package.json` version ≠ `git describe --tags --abbrev=0`
  - Then execute:
    - If hook has `command`: run the shell command
    - If hook has `execute` (file path): read the file and follow its instructions (.md = AI prompt, .sh = shell script)
    - If hook has `prompt` (legacy): follow the prompt instructions directly

### When Advancing from Completion (Archiving)
- Add the current timestamp to `completedAt` in `current.yml`
- Move artifact files (`01-*.md` through `05-*.md`) from `.reap/life/` to `.reap/lineage/[gen-id]-[goal-slug]/`
  - Goal slug: lowercase, non-alphanumeric/hangul replaced with `-`, max 30 chars
- Process backlog files from `.reap/life/backlog/`:
  - Create `.reap/lineage/[gen-id]-[goal-slug]/backlog/` directory
  - Files with `status: consumed` → move to `.reap/lineage/[gen-id]-[goal-slug]/backlog/`
  - Files with `status: pending` or no status field → copy to `.reap/lineage/[gen-id]-[goal-slug]/backlog/` for record, then carry over to new `.reap/life/backlog/`
- Clear `current.yml` (write empty content)
- Recreate `.reap/life/backlog/` directory (with carried-over pending items already in place)
- **Commit all changes** (code + `.reap/` artifacts together):
  - Stage all changed files: code changes from this generation + `.reap/` directory
  - Commit message format: `feat(gen-NNN): [generation goal summary]`
  - Use `feat` for feature generations, `fix` for bugfix generations, `chore` for maintenance
  - Include both code and REAP artifacts in the same commit
  - If there are no code changes (REAP-only generation), use `chore(reap): [goal summary]`

### Hook Execution (Generation Complete)
- Read `.reap/config.yml` — if `hooks.onGenerationComplete` is defined, execute each hook in order:
  - First, evaluate the `condition` field (skip if condition is not met):
    - `always` or absent: always execute
    - `has-code-changes`: execute only if src/ files were changed in this generation (check `git diff` or implementation artifact)
    - `version-bumped`: execute only if `package.json` version ≠ `git describe --tags --abbrev=0`
  - Then execute:
    - If hook has `command`: run the shell command
    - If hook has `execute` (file path): read the file and follow its instructions (.md = AI prompt, .sh = shell script)
    - If hook has `prompt` (legacy): follow the prompt instructions directly
  - Note: hooks run AFTER the commit, so any changes from hooks will be uncommitted

## Completion
- If archived: "Generation [id] complete and archived. Run `/reap.start` to begin a new generation."
- Otherwise: "Advanced to [next stage]. Proceed with `/reap.[next stage]`."

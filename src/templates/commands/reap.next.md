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

### When Advancing from Completion (Archiving)
- Add the current timestamp to `completedAt` in `current.yml`
- Move artifact files (`01-*.md` through `05-*.md`) from `.reap/life/` to `.reap/lineage/[gen-id]-[goal-slug]/`
  - Goal slug: lowercase, non-alphanumeric/hangul replaced with `-`, max 30 chars
- Also move files from `.reap/life/backlog/` to lineage
- Clear `current.yml` (write empty content)
- Recreate `.reap/life/backlog/` directory
- **Commit all changes** (code + `.reap/` artifacts together):
  - Stage all changed files: code changes from this generation + `.reap/` directory
  - Commit message format: `feat(gen-NNN): [generation goal summary]`
  - Use `feat` for feature generations, `fix` for bugfix generations, `chore` for maintenance
  - Include both code and REAP artifacts in the same commit
  - If there are no code changes (REAP-only generation), use `chore(reap): [goal summary]`

## Completion
- If archived: "Generation [id] complete and archived. Run `/reap.start` to begin a new generation."
- Otherwise: "Advanced to [next stage]. Proceed with `/reap.[next stage]`."

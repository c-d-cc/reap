---
description: "REAP Next — Advance to the next lifecycle stage"
---

# Next Stage

This command is the **ONLY legitimate way** to advance the lifecycle stage. All stage transitions MUST go through this command. Direct modification of `current.yml` is strictly prohibited.

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
- Scan `.reap/hooks/` for files matching `onStageTransition.*`
- For each matched file (sorted by `order` from frontmatter, then alphabetically):
  1. Read the frontmatter (`condition`, `order`)
  2. Evaluate `condition` by running `.reap/hooks/conditions/{condition}.sh` (exit 0 = met, non-zero = skip):
     - If `condition` is absent: treat as `always`
     - If the condition script doesn't exist: warn and skip the hook
     - Default conditions: `always`, `has-code-changes`, `version-bumped`
     - Users can add custom conditions by placing scripts in `.reap/hooks/conditions/`
  3. Execute based on file extension:
     - `.md`: read the file content (after frontmatter) as AI prompt and follow the instructions
     - `.sh`: run as shell script in the project root directory

### When Advancing from Completion (Archiving)
- Add the current timestamp to `completedAt` in `current.yml`
- Create the lineage directory: `.reap/lineage/[gen-id]-[goal-slug]/`
  - Goal slug: lowercase, non-alphanumeric/hangul replaced with `-`, max 30 chars
- **Write `meta.yml`** in the lineage directory with DAG metadata:
  ```yaml
  id: [gen-id]
  type: [normal or merge]
  parents: [parent generation IDs from current.yml]
  goal: [goal from current.yml]
  genomeHash: [genomeHash from current.yml, or compute from .reap/genome/]
  startedAt: [startedAt from current.yml]
  completedAt: [current ISO 8601]
  ```
- Move artifact files (`01-*.md` through `05-*.md`) from `.reap/life/` to the lineage directory
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
- Scan `.reap/hooks/` for files matching `onGenerationComplete.*`
- For each matched file (sorted by `order` from frontmatter, then alphabetically):
  1. Read the frontmatter (`condition`, `order`)
  2. Evaluate `condition` by running `.reap/hooks/conditions/{condition}.sh` (exit 0 = met, non-zero = skip):
     - If `condition` is absent: treat as `always`
     - If the condition script doesn't exist: warn and skip the hook
     - Default conditions: `always`, `has-code-changes`, `version-bumped`
     - Users can add custom conditions by placing scripts in `.reap/hooks/conditions/`
  3. Execute based on file extension:
     - `.md`: read the file content (after frontmatter) as AI prompt and follow the instructions
     - `.sh`: run as shell script in the project root directory
- Note: hooks run AFTER the commit, so any changes from hooks will be uncommitted

## Completion
- If archived: "Generation [id] complete and archived. Run `/reap.start` to begin a new generation."
- Otherwise: "Advanced to [next stage]. Proceed with `/reap.[next stage]`."

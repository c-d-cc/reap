---
description: "REAP Evolve — Start a new Generation or transition between lifecycle stages"
---

# Evolve (Stage Transition)

## Context
- Read `.reap/life/current.yml`
- If the content is empty → no active Generation
- If the content exists → check the current generation info (id, goal, stage)

## Mode Determination
Perform one of the following 3 actions based on the human's request:

### 1. Start a New Generation (when current.yml is empty)
- Ask the human for the goal of this generation
- Count existing generations in `.reap/lineage/` to determine the genomeVersion
- Generate the next generation ID (existing count + 1, in `gen-XXX` format)
- Write the following to `current.yml`:
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
- "Generation gen-XXX started. Define the goal with `/reap.objective`."

### 2. Advance to the Next Stage (advance)
- Transition from the current stage to the next stage
- Stage order: objective → planning → implementation → validation → completion
- Update the `stage` in `current.yml` to the next stage
- Add an entry to `timeline`:
  ```yaml
  - stage: [next stage]
    at: [current ISO 8601]
  ```
- **When advancing from completion**:
  - Add the current timestamp to `completedAt`
  - Move artifact files (`01-*.md` through `05-*.md`) from `.reap/life/` to `.reap/lineage/[gen-id]-[goal-slug]/`
  - Also move files from `.reap/life/backlog/` to lineage
  - Generate `06-legacy.md`
  - Clear `current.yml`
  - **After archiving, commit all changes** (code + `.reap/` artifacts together):
    - Stage all changed files: code changes from this generation + `.reap/` directory
    - Commit message format: `feat(gen-NNN): [generation goal summary]`
    - Use `feat` for feature generations, `fix` for bugfix generations, `chore` for maintenance
    - Include both code and REAP artifacts in the same commit
    - If there are no code changes (REAP-only generation), use `chore(reap): [goal summary]`
  - "Generation complete. Run `/reap.evolve` again to start a new generation."
- Otherwise: "Stage transitioned to [next stage]. Proceed with `/reap.[next stage]`."

### 3. Regress to a Previous Stage (back)
- From any stage, you can return to a previous stage (micro loop)
- `--back` alone: regress to the immediately previous stage
- `--back [stage]`: regress directly to the specified stage
- Regression is not possible from the first stage (objective)

**Regression Protocol:**
1. Ask the human for the reason for regression
2. Collect the regression reason and reference info:
   - **reason**: why we are going back
   - **refs**: related files/locations (artifact sections, source code locations)
3. Modify `current.yml`:
   - Change `stage` to the target stage
   - Add a regression entry to `timeline`:
     ```yaml
     - stage: [target stage]
       at: [current ISO 8601]
       from: [original stage]
       reason: [regression reason]
       refs:
         - [ref 1]
         - [ref 2]
     ```
4. Artifact handling:
   - **Before the target stage**: preserve
   - **Target stage**: overwrite on re-entry (implementation only: append)
   - **After the target stage**: preserve, overwrite on re-entry
5. Record the regression reason at the top of the target stage artifact as a `## Regression` section:
   ```markdown
   ## Regression
   - **From**: [original stage]
   - **Reason**: [regression reason]
   - **Refs**: [reference list]
   - **Affected**: [affected subsequent artifacts]
   ```
6. "Returned to [stage] stage. Proceed with `/reap.[stage]`."

## Safety Guards
- If an active Generation exists in `current.yml` when attempting to start a new Generation: ERROR — "Generation [id] is in progress (stage: [stage]). Complete it before starting a new generation." **STOP**
- If the stage is unknown: ERROR — "Unknown stage." **STOP**

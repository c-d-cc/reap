---
description: "REAP Back — Return to a previous lifecycle stage"
---

# Return to Previous Stage

## Gate (Preconditions)
- Read `.reap/life/current.yml`
- If no active Generation: ERROR — "No active Generation." **STOP**
- If current stage is `objective` (first stage): ERROR — "Already at the first stage. Cannot go back." **STOP**

## Steps

1. Determine target stage:
   - `/reap.back` alone: go to the immediately previous stage
   - `/reap.back [stage]`: go directly to the specified stage
   - Stage order: objective → planning → implementation → validation → completion
   - Only backward transitions are allowed
2. Ask the human for the reason for regression
3. Collect regression reason and reference info:
   - **reason**: why we are going back
   - **refs**: related files/locations (artifact sections, source code locations)
4. Modify `current.yml`:
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
5. Artifact handling:
   - **Before the target stage**: preserve
   - **Target stage**: overwrite on re-entry (implementation only: append)
   - **After the target stage**: preserve, overwrite on re-entry
6. Record the regression reason at the top of the target stage artifact as a `## Regression` section:
   ```markdown
   ## Regression
   - **From**: [original stage]
   - **Reason**: [regression reason]
   - **Refs**: [reference list]
   - **Affected**: [affected subsequent artifacts]
   ```

### Hook Execution
7. Read `.reap/config.yml` — if `hooks.onRegression` is defined, execute each hook in order:
   - First, evaluate the `condition` field (skip if condition is not met):
     - `always` or absent: always execute
     - `has-code-changes`: execute only if src/ files were changed in this generation (check `git diff` or implementation artifact)
     - `version-bumped`: execute only if `package.json` version ≠ `git describe --tags --abbrev=0`
   - Then execute:
     - If hook has `command`: run the shell command
     - If hook has `execute` (file path): read the file and follow its instructions (.md = AI prompt, .sh = shell script)
     - If hook has `prompt` (legacy): follow the prompt instructions directly

## Completion
- "Returned to [stage] stage. Proceed with `/reap.[stage]`."

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

### Hook Execution (Regression)
7. Execute hooks for event `onLifeRegretted` following the Hook System protocol:
   - Scan `.reap/hooks/` for `onLifeRegretted.*` files
   - Sort by frontmatter `order`, then alphabetically
   - Evaluate `condition`, execute `.md` (AI prompt) or `.sh` (shell script)
   - All hooks run BEFORE any commit (hook outputs included in the same commit)

## Completion
- "Returned to [stage] stage. Proceed with `/reap.[stage]`."

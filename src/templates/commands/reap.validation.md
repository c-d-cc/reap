---
description: "REAP Validation — Verify goal achievement through testing and validation"
---

# Validation

<HARD-GATE>
Do NOT declare "pass" without running the validation commands.
Do NOT reuse results from a previous run — you MUST execute them fresh in this session.
"It will probably pass" or "It looks fine" is NOT validation.
Do NOT make claims without evidence. This is non-negotiable.
</HARD-GATE>

## Gate (Preconditions)
- Read `.reap/life/current.yml` and verify that stage is `validation`
- Verify that `.reap/life/03-implementation.md` exists
- If not met: ERROR — state the reason and **STOP**

## Context (Generation Info)
- Read `.reap/life/current.yml` for the current generation info (id, goal, genomeVersion)

## Re-entry Check
- If `.reap/life/04-validation.md` already exists, this is a **re-entry due to regression**
- Reference the previous validation report, but overwrite it with a fresh one

## Steps

### 1. Run Automated Validation
- Read the **Validation Commands** table from `.reap/genome/constraints.md`
- Execute **all** defined commands **in order**:
  - Test → Lint → Build → Type check
- Record the **actual output and exit code** of each command
- Skip items with no defined command, but record them as "undefined"

| Claim | Required Evidence | Insufficient Evidence |
|-------|------------------|-----------------------|
| "Tests pass" | Test command output: 0 failures | Previous run, "it should pass" |
| "Lint clean" | Lint output: 0 errors | Partial check, assumption |
| "Build succeeds" | Build command: exit 0 | "Lint passed so build should too" |

### 2. Convention Compliance Check
- Read the **Enforced Rules** table from `.reap/genome/conventions.md`
- Execute the verification command for each defined rule
- Record any violations

### 3. Completion Criteria Review
- Read the completion criteria from `.reap/life/01-objective.md`
- Check the deferred task list in `.reap/life/03-implementation.md`
- Review each completion criterion **one by one**, excluding deferred tasks from scope
- Determine pass/fail/deferred for each criterion

### 4. Minor Fix (Fix Trivial Issues Directly)
- Fix typos, lint errors, minor bugs, and other **issues that can be resolved without a stage transition** directly
- Record all fixes in the "Minor Fixes" section of the artifact
- Minor fix criteria: **issues resolvable within 5 minutes without design changes**
- After minor fixes, **re-run** the relevant validation commands

### 5. Verdict
- All automated validations pass + completion criteria met → **pass**
- Automated validations pass + some completion criteria deferred → **partial**
- Automated validation failure or completion criteria not met → **fail**
- If **fail**, provide regression guidance:
  - Code issue → `/reap.back` (implementation)
  - Plan issue → `/reap.back planning`
  - Goal issue → `/reap.back objective`

## Red Flags — STOP if you catch yourself thinking:
- "It will probably pass" → Run it.
- "It passed before" → Run it again.
- "It's trivial, it'll be fine" → Fix it as a minor fix and re-validate.
- "I haven't tried the build but lint passed" → Run the build too.

## Artifact Generation (Progressive Recording)
- **Language**: Write all artifact content in the user's configured language (see REAP Guide § Language).
- **Immediately upon entering this stage**: Read `~/.reap/templates/04-validation.md` and create `.reap/life/04-validation.md` with `result: pending`
- **Update incrementally during validation**:
  - After EACH validation command execution → immediately record the result in Test Results
  - After EACH completion criterion check → immediately record pass/fail/deferred in the Completion Criteria Check table
  - After EACH minor fix → immediately record it in the Minor Fixes table, then re-run and record
- After Step 5 (Verdict) → update the Result field to pass / partial / fail
- The artifact should reflect the current validation progress at all times

## Completion
- pass/partial: "Proceed to the Completion stage with `/reap.next`."
- fail: Provide regression guidance

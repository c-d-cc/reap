---
description: "REAP Planning — Develop the implementation plan and decompose tasks"
---

# Planning (Plan Development)

<HARD-GATE>
Do NOT create a plan without reading 01-objective.md.
Do NOT make technical decisions without reading the Genome (conventions.md, constraints.md).
</HARD-GATE>

## Gate (Preconditions)
- Read `.reap/life/current.yml` and verify that stage is `planning`
- Verify that `.reap/life/01-objective.md` exists
- If not met: ERROR — state the reason and **STOP**

## Context (Generation Info)
- Read `.reap/life/current.yml` for the current generation info (id, goal, genomeVersion)

## Re-entry Check
- If `.reap/life/02-planning.md` already exists, this is a **re-entry due to regression**
- Read the existing artifact; if a `## Regression` section exists, understand the regression reason
- Use the existing content as reference, but overwrite it with modifications that address the regression reason
- If `03-implementation.md` already exists, also reference implementation progress (decide whether to keep completed tasks)

## Steps

### 1. Read Objective
- Read requirements and acceptance criteria from `.reap/life/01-objective.md`
- Determine how to implement each FR

### 2. Genome Reference
- Check technical constraints and Validation Commands in `.reap/genome/constraints.md`
- Check development rules and Enforced Rules in `.reap/genome/conventions.md`
- Check Core Beliefs and Architecture Decisions in `.reap/genome/principles.md`

### 3. Develop Implementation Plan
- Decide on the architectural approach and technology choices
- Respect the Tech Stack in constraints.md
- **If there is an uncertain technical decision, STOP and ask the human**

### 4. Task Decomposition
- Write tasks as a checklist in the format `- [ ] T001 description`
- **Limit**: Maximum 20 tasks. If exceeding 20, split into Phases.
- Each task must be **one logical unit of change**
- Specify dependencies and parallelization potential between tasks

### 5. E2E Test Scenarios (lifecycle 변경 시 필수)
- If this generation modifies lifecycle logic (compression, generation, merge, abort, stage transitions, etc.):
  - Define specific E2E test scenarios with expected outcomes
  - Each scenario: setup → action → assertion
  - Example:
    ```
    ## E2E Test Scenarios
    1. Normal abort + rollback → source reverted, artifacts deleted, current.yml empty
    2. Abort + stash → stash created, recoverable
    3. No active generation → error message
    ```
- If not a lifecycle change: skip this step

### 6. Human Confirmation
- Finalize the plan with the human

## Task Format

```
### Phase 1: [Phase Name]
- [ ] T001 [Specific action] — [target file/module]
- [ ] T002 [P] [Specific action] — [target file/module]

### Phase 2: [Phase Name]
- [ ] T003 [Specific action] — [target file/module]
```

- `[P]`: Indicates parallelizable execution
- Specify the target file/module for each task

❌ Bad task: "- [ ] T001 Implement authentication"
✅ Good task: "- [ ] T001 `src/lib/auth.ts` — Configure NextAuth Google OAuth + define authOptions"

## Self-Verification
Before saving the artifact, verify:
- [ ] Does every FR have a corresponding task?
- [ ] Are dependencies between tasks specified?
- [ ] Is the target file/module specified for each task?
- [ ] Is the Phase classification logical?

## Artifact Generation (Progressive Recording)
- **Language**: Write all artifact content in the user's configured language (see REAP Guide § Language).
- **Immediately upon entering this stage**: Read `~/.reap/templates/02-planning.md` and create `.reap/life/02-planning.md` with the Summary section filled in
- **Update incrementally**: As each step progresses, update the artifact in place:
  - After Genome Reference → update Technical Context section
  - After Develop Implementation Plan → update Summary with architecture decisions
  - After Task Decomposition → add tasks to the Tasks section as they are decomposed
- The artifact is a **living document** during the stage — it should reflect the current state of work at all times
- Do NOT wait until the end to write the artifact

## Completion
- **If called from `/reap.evolve`** (Autonomous Override active): Save the artifact and proceed automatically. Do NOT pause for human confirmation.
- **If called standalone**: Show the artifact to the human and get confirmation.
- After confirmation or auto-proceed: "Proceed to the Implementation stage with `/reap.next`."

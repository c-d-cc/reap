---
description: "REAP Implementation — Implement code through AI+Human collaboration"
---

# Implementation

<HARD-GATE>
Do NOT write code without the task list from 02-planning.md.
Do NOT write code that violates the Genome (conventions.md, constraints.md).
Do NOT modify the Genome directly — if you discover an issue, record it in the backlog.
Do NOT modify the Environment directly — if you discover a change, record it in the backlog.
</HARD-GATE>

## Gate (Preconditions)
- Read `.reap/life/current.yml` and verify that stage is `implementation`
- Verify that `.reap/life/02-planning.md` exists
- Verify the git working tree is clean (`git status`)
  - If there are uncommitted changes: ERROR — "Commit your changes first." then **STOP**
- If not met: ERROR — state the reason and **STOP**

## Context (Generation Info)
- Read `.reap/life/current.yml` for the current generation info (id, goal, genomeVersion)
- Read `.reap/genome/conventions.md` — rules to reference continuously during implementation
- Read `.reap/genome/constraints.md` — technical constraints

## Re-entry Check
- If `.reap/life/03-implementation.md` already exists, this is a **re-entry due to regression**
- Read the existing log; if a `## Regression` section exists, understand the regression reason
- On regression re-entry, **append** to the existing log (preserve existing completion records)

## Steps

### 1. Load Task List
- Read the task list from `.reap/life/02-planning.md`
- If `03-implementation.md` already exists, read it (preserve existing records)
- Identify incomplete (`[ ]`) tasks

### 2. Sequential Implementation
- Implement starting from the first incomplete task, in order
- Update `03-implementation.md` per task or per Phase
- **Strictly** follow the rules in conventions.md
- **Strictly** follow the technical constraints in constraints.md

### 3. When Genome/Environment Changes Are Discovered
- If you discover something that must be implemented differently from the spec:
  a. Record it in `.reap/life/backlog/`:
     ```markdown
     ---
     type: genome-change
     target: genome/[relevant file]
     ---
     # [Title]
     [What is different and how it should be changed]
     ```
  b. Mark tasks that depend on this change as `[deferred]` in `02-planning.md`
  c. Record the reason for deferral
- **Do NOT modify Genome or Environment files directly. This is non-negotiable.**

### 4. Completion Marking
- Mark completed tasks as `[x]` in `02-planning.md`

## Escalation
In the following situations, **STOP and ask the human**:
- When task requirements are unclear
- When an architectural decision is needed but not covered in the plan
- When a conflict arises with existing code
- When the scope turns out to be significantly larger than expected

## Artifact Generation
- Read `.reap/templates/03-implementation.md` (or append to existing log if present)
- Record completed tasks, deferred tasks (with reasons), genome-change backlog items, and implementation notes
- Save to `.reap/life/03-implementation.md`

## Completion
- "Proceed to the Validation stage with `reap evolve --advance`."
- "If issues are found during Validation, you can return with `reap evolve --back`."

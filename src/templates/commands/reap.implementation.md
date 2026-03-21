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
- Check git working tree status (`git status`)
  - If there are uncommitted changes that overlap with files this generation will modify:
    - Ask the user: "There are uncommitted changes. Would you like to commit them before proceeding? (yes/no/show diff)"
    - If yes: help the user commit the changes, then proceed
    - If no: proceed with caution, noting the existing changes
    - If show diff: show the diff, then ask again
  - If there are uncommitted changes in unrelated files: proceed normally
  - If the working tree is clean: proceed normally
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
- **After EACH task completion**, immediately add it to the Completed Tasks table in `03-implementation.md`
- **After EACH deferred task decision**, immediately add it to the Deferred Tasks table
- **After EACH genome issue discovery**, immediately add it to the Genome-Change Backlog Items table
- Do NOT batch-write the log at the end. Update it as you go.
- **Strictly** follow the rules in conventions.md
- **Strictly** follow the technical constraints in constraints.md

### 3. When Genome/Environment Changes Are Discovered
- If you discover something that must be implemented differently from the spec:
  a. Record it in `.reap/life/backlog/`:
     ```markdown
     ---
     type: genome-change
     status: pending
     target: genome/[relevant file]
     ---
     # [Title]
     [What is different and how it should be changed]
     ```
  b. Mark tasks that depend on this change as `[deferred]` in `02-planning.md`
  c. Record the reason for deferral
- **Do NOT modify Genome or Environment files directly. This is non-negotiable.**

### 3b. When Out-of-Scope Issues Are Discovered
- If you discover issues outside the current generation's scope (outdated tests, tech debt, broken code unrelated to current tasks, etc.):
  a. Record it in `.reap/life/backlog/`:
     ```markdown
     ---
     type: task
     status: pending
     ---
     # [Title]
     [Description of the issue and what needs to be done]
     ```
  b. Do NOT fix it in the current generation unless the human explicitly approves
  c. Record it in `03-implementation.md` under "Genome-Change Backlog Items" or "Implementation Notes"

### 4. Completion Marking
- Mark completed tasks as `[x]` in `02-planning.md`

## Escalation
In the following situations, **STOP and ask the human**:
- When task requirements are unclear
- When an architectural decision is needed but not covered in the plan
- When a conflict arises with existing code
- When the scope turns out to be significantly larger than expected

## Artifact Generation (Progressive Recording)
- **Language**: Write all artifact content in the user's configured language (see REAP Guide § Language).
- **Immediately upon entering this stage**: Read `~/.reap/templates/03-implementation.md` and create `.reap/life/03-implementation.md` with empty tables ready to fill (or preserve existing content on re-entry)
- **Update continuously during Step 2**: After each task, deferral, or discovery, update the artifact immediately
- By the time all tasks are done, the artifact should already be complete — no separate "generation" step is needed
- Add Implementation Notes at the end summarizing notable decisions

## Hook Execution
Execute hooks for event `onLifeImplemented` following the Hook System protocol:
- Scan `.reap/hooks/` for `onLifeImplemented.*` files
- Sort by frontmatter `order`, then alphabetically
- Evaluate `condition`, execute `.md` (AI prompt) or `.sh` (shell script)
- All hooks run BEFORE any commit (hook outputs included in the same commit)

## Completion
- "Proceed to the Validation stage with `/reap.next`."
- "If issues are found during Validation, you can return with `/reap.back`."

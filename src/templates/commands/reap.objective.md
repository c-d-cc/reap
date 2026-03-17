---
description: "REAP Objective — Define the goal and specification for this Generation"
---

# Objective (Goal Definition)

<HARD-GATE>
Do NOT write any code until the artifact (01-objective.md) has been confirmed by the human.
If the goal is ambiguous, do NOT guess — STOP and ask the human. This is non-negotiable.
</HARD-GATE>

## Gate (Preconditions)
- Read `.reap/life/current.yml` and verify that stage is `objective`
- If not met: ERROR — "Current stage is not objective. Start a new Generation with `/reap.start` or check the current state with `reap status`." then **STOP**

## Context (Generation Info)
- Read `.reap/life/current.yml` for the current generation info (id, goal, genomeVersion)
- Reference this info in all subsequent artifacts and conversations

## Re-entry Check
- If `.reap/life/01-objective.md` already exists, this is a **re-entry due to regression**
- Read the existing artifact; if a `## Regression` section exists, understand the regression reason
- Use the existing content as reference, but overwrite it with modifications that address the regression reason

## Steps

### 1. Environment Scan
- Read all files in `.reap/environment/`
- This directory stores external context: external API docs, product requirements, team decision logs, reference materials, etc.
- If empty, inform the human: "No external context found in `.reap/environment/`. Adding product requirements, external API docs, or reference materials will help set a more accurate goal."

### 2. Previous Generation Reference
- If a `05-completion.md` exists for the most recent generation in `.reap/lineage/`, read it
- Reference lessons learned and next-generation suggestions from the previous generation

### 3. Backlog Review
- Read all files in `.reap/life/backlog/`
- Review deferred tasks and planned goals

### 4. Genome Health Check
- Read all files in `.reap/genome/` (principles.md, conventions.md, constraints.md, domain/)
- **If this is the first generation** (`.reap/lineage/` is empty):
  - It is normal for the genome to be all placeholders
  - Inform the human: "This is the first generation, so initial genome setup is needed"
  - Work with the human to fill in Tech Stack, Core Beliefs, Validation Commands, etc.
  - This is the sole exception to the Genome immutability principle: **direct genome authoring is permitted only during the first generation's Objective**
- **For subsequent generations**:
  - Evaluate the health of each file:
    - **Files with only placeholders** → flag as "genome needs enhancement"
    - **Files exceeding 100 lines** → flag as "needs extraction to domain/"
    - **domain/ has only README.md and no rule files** → flag as "domain rules undefined"
    - **constraints.md has empty Validation Commands** → flag as "test commands undefined"
- Report the genome health status to the human

### 5. Goal + Spec Definition
- Based on the above information, converse with the human to refine this generation's goal
- If genome enhancement is needed, discuss whether to include it in this generation's goal
- Criteria for a good goal:
  - Achievable within a single Generation
  - Verifiable completion criteria (no vague wording)
  - Relevant genome areas are clearly identified

### 6. Genome Gap Analysis
- Identify information required to achieve the goal that is missing from the genome
- For each missing item, record it in `.reap/life/backlog/`:
  ```markdown
  ---
  type: genome-change
  target: genome/domain/{topic}.md
  ---
  # [Title]
  [Specifically what is lacking and how it should be changed]
  ```

### 7. Requirements Finalization
- Organize functional requirements (FR) and non-functional requirements
- Define acceptance criteria
- **Limit**: Maximum 10 functional requirements. If exceeding 10, split into separate generations.
- **Limit**: Maximum 7 completion criteria. Each must be verifiable.
- Finalize with the human

## Escalation
In the following situations, do NOT guess — **STOP and ask the human**:
- When the scope of the goal is unclear
- When two or more reasonable interpretations are possible
- When contradictory information exists in the genome

## Self-Verification
Before saving the artifact, verify:
- [ ] Is the goal clearly stated in a single sentence?
- [ ] Are all completion criteria verifiable? (No vague wording like "improve" or "make better"?)
- [ ] Are exclusions explicitly stated in the scope?
- [ ] Do functional requirements have FR-XXX numbering?

❌ Bad completion criterion: "Stabilize the service"
✅ Good completion criterion: "`npm run lint` reports 0 errors, `npm run build` succeeds"

## Artifact Generation (Progressive Recording)
- **Immediately upon entering this stage**: Read `.reap/templates/01-objective.md` and create `.reap/life/01-objective.md` with the Goal section filled in (from `current.yml` goal)
- **Update incrementally**: As each step progresses, update the artifact in place:
  - After Environment Scan → update Background section
  - After Previous Generation Reference → update Background section
  - After Backlog Review → update Background section
  - After Genome Health Check → update Genome Reference section
  - After Goal + Spec Definition → update Goal, Scope sections
  - After Genome Gap Analysis → update Backlog section
  - After Requirements Finalization → update Requirements, Completion Criteria sections
- The artifact should reflect the **current state of work at all times**
- Do NOT wait until the end to write the artifact

## Completion
- Show the artifact to the human and get confirmation
- After confirmation: "Proceed to the Planning stage with `/reap.next`."

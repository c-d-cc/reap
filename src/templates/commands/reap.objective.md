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
- **If empty (first time setup)**, conduct an interactive Environment setup:
  1. **Brief the human on what Environment means**:
     > "Environment is where we record information **external to this project** — things that affect development but are outside the project's direct control.
     > Unlike the Genome (design and knowledge the team decides), Environment captures the **constraints and context from the outside world**:
     > connected systems, infrastructure, organizational rules, external API specs, etc."
  2. **Ask questions interactively** (one at a time, skip if not applicable):
     - "Are there any **connected systems**? (other services, external APIs, legacy systems, etc.)"
     - "What is the **infrastructure/deployment environment**? (cloud, on-premise, containers, etc.)"
     - "Are there **organizational rules or guidelines** to follow? (company standards, coding policies, security policies, regulatory compliance, etc.)"
     - "Are there **external reference documents** to incorporate? (API specs, system architecture diagrams, integration guides, etc.)"
  3. **Save collected information** to `.reap/environment/` as structured markdown files (e.g., `integrations.md`, `infrastructure.md`, `org-guidelines.md`)
  4. If the human has nothing to add, that's fine — Environment is optional
- If files already exist, review them and ask if any updates are needed

### 2. Previous Generation Reference
- If a `05-completion.md` exists for the most recent generation in `.reap/lineage/`, read it
- Reference lessons learned and next-generation suggestions from the previous generation

### 3. Backlog Review
- Read all files in `.reap/life/backlog/`
- Review deferred tasks and planned goals

### 4. Genome Health Check
- Read all files in `.reap/genome/` (principles.md, conventions.md, constraints.md, domain/)
- Read `.reap/config.yml` to determine the `entryMode` (greenfield, migration, adoption)

- **If this is the first generation** (`.reap/lineage/` is empty):
  - This is the sole exception to the Genome immutability principle: **direct genome authoring is permitted only during the first generation's Objective**
  - **Brief the human on what Genome means**:
    > "Genome is where we record this project's **design and knowledge** — things the team decides and controls internally.
    > Architecture principles, business rules, development conventions, and technical constraints.
    > It's the project's DNA that evolves across generations."

  - **If entryMode is `greenfield`** (new project):
    1. Ask about the application first:
       - "What application do you want to build? Give me a brief introduction."
       - "Who are the primary users? What problem does it solve?"
    2. Based on the app description, **recommend a tech stack**:
       - Propose 2-3 options with pros/cons based on the app type (web, API, CLI, mobile, etc.)
       - If the human already has a preferred stack, respect that
    3. After stack is decided, ask additional questions:
       - "Any architecture principles or design decisions already in mind?"
       - "Any development conventions? (coding style, branch strategy, test policy, etc.)"
       - "Any technical constraints? (performance requirements, compatibility, dependency restrictions, etc.)"
    4. Populate `principles.md`, `conventions.md`, `constraints.md` with collected information

  - **If entryMode is `adoption`** (existing codebase):
    1. **Validate REAP root**:
       - Check for project root signals (package.json, go.mod, .git, etc.)
       - If parent directory has root signals, warn: "This may be a subdirectory. Is [parent] the actual project root?"
       - If workspace config exists in parent (pnpm-workspace.yaml, lerna.json, etc.), ask: "Monorepo detected. Init for the whole repo or just this package?"
       - If sibling directories contain other sub-projects, suggest: "Other sub-projects found at the same level. Consider init from the parent directory."
       - Proceed after human confirmation (intentional subdirectory init is allowed)
    2. **Scan for existing documentation**:
       - Search for README.md, CONTRIBUTING.md, ARCHITECTURE.md, docs/, CLAUDE.md, AGENTS.md, ADR directories
       - Show discovered documents to the human and ask for each: "Is this still current?"
         - Current → use as genome source
         - Partially outdated → use as reference, prioritize code analysis
         - No longer valid → skip
    3. **Analyze existing source code**:
       - Infer tech stack from config files (package.json, tsconfig, Dockerfile, etc.)
       - Infer architecture patterns from directory structure
       - Extract conventions from linter/formatter configs
       - Identify test strategy from test configs
    4. **Present combined analysis** (verified docs + code analysis) as genome draft:
       - "Based on existing documents and source analysis, here's the proposed Genome. Please review."
       - Human confirms/modifies each section
    5. Ask about anything not derivable from code or docs (business context, team decisions, etc.)
    6. Populate genome files with confirmed information

  - **If entryMode is `migration`**: Follow the `adoption` flow for analysis of the existing system, but note that the new project may diverge in architecture

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
- **Immediately upon entering this stage**: Read `~/.reap/templates/01-objective.md` and create `.reap/life/01-objective.md` with the Goal section filled in (from `current.yml` goal)
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

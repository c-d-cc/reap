---
description: "REAP Objective — Define the goal and specification for this Generation"
---

# Objective (Goal Definition + Brainstorming Design)

<HARD-GATE>
Do NOT write any code until the artifact (01-objective.md) has been confirmed by the human.
If the goal is ambiguous, do NOT guess — STOP and ask the human. This is non-negotiable.
Brainstorming is triggered based on goal complexity — simple tasks skip it, complex tasks require it. The human can always override the AI's assessment.
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

### 5. Goal + Spec Definition (with optional Brainstorming)

Before entering brainstorming, evaluate whether the goal requires it.

#### Complexity Gate
Assess the goal's complexity based on these criteria:

**Skip brainstorming** (proceed directly to Step 6 with simple goal+spec definition):
- Simple bugfix with clear cause and fix
- Configuration change or settings adjustment
- Documentation-only changes
- Single-file refactoring with obvious approach
- Tasks where the "what" and "how" are both already clear

**Enter brainstorming** (follow sub-steps 5a–5e):
- New feature development spanning multiple components
- Architecture changes or new module design
- Tasks with multiple valid implementation approaches
- Requirements that need further exploration or clarification
- Integration with external systems or complex data flows

**Under Autonomous Override**: Assess automatically. If the goal from `current.yml` clearly fits "skip" criteria, skip brainstorming.
**Human override**: The human can always request brainstorming ("let's brainstorm this") or skip it ("just do it", "skip brainstorming") regardless of the AI's assessment.

When skipping brainstorming, converse with the human to refine the goal:
- Criteria for a good goal: achievable within a single Generation, verifiable completion criteria (no vague wording), relevant genome areas identified
- Then proceed directly to Step 6 (Genome Gap Analysis)

When entering brainstorming, follow the structured brainstorming process below to produce a well-designed objective. Follow the sub-steps in order.

#### 5a. Visual Companion Proposal
- Evaluate whether this generation's goal involves visual questions (UI design, architecture diagrams, layout comparisons, etc.)
- If visual questions are likely, propose the Visual Companion in a **standalone message** (do NOT combine with other questions):
  > "이번 설계에서 목업이나 다이어그램으로 보여드리면 이해하기 쉬운 부분이 있을 수 있습니다.
  > 브라우저에서 시각 자료를 보여드릴 수 있는 비주얼 컴패니언을 사용할까요?
  > (로컬 서버를 띄워 브라우저에서 확인하는 방식입니다)"
- If the human accepts: start the brainstorm server (`bash` the start script in `.reap/brainstorm/start-server.sh` or `node` the server directly). Read `src/templates/brainstorm/visual-companion-guide.md` for usage rules.
- If the human declines: proceed terminal-only. Do NOT offer again.
- **This step applies even under `/reap.evolve` Autonomous Override** — only skip if the human has explicitly declined.

#### 5b. Clarifying Questions (One at a Time)
- **CRITICAL**: Ask only ONE question per message. Never bundle multiple questions.
- Prefer **multiple choice** over open-ended questions when possible.
- Goal: understand purpose, constraints, success criteria, and scope.
- Continue asking until you have enough information to propose approaches.
- Good question flow:
  1. Purpose/motivation: "What problem does this solve?"
  2. Users/stakeholders: "Who benefits from this?"
  3. Constraints: "Are there any hard constraints?" (with examples as choices)
  4. Success criteria: "How will you know this is done?"
- Under Autonomous Override: Use existing context (genome, backlog, goal from `current.yml`) to answer these questions yourself. Only STOP and ask if genuinely ambiguous.

#### 5c. Approach Exploration (2-3 Alternatives)
- Propose **2-3 approaches** with clear trade-offs.
- Present as a comparison table:

  | Aspect | Approach A | Approach B | Approach C |
  |--------|-----------|-----------|-----------|
  | Summary | ... | ... | ... |
  | Pros | ... | ... | ... |
  | Cons | ... | ... | ... |
  | Complexity | ... | ... | ... |
  | Recommendation | ... | ... | ... |

- Include a clear recommendation with reasoning.
- If using Visual Companion: show approaches visually in the browser for comparison.
- If only one sensible approach exists, state why alternatives were considered but dismissed.
- Wait for the human to choose (or confirm the recommendation).
- Under Autonomous Override: choose the recommended approach and proceed.

#### 5d. Sectional Design Approval
- Present the design in sections, scaled to complexity:
  - **Simple** (few sentences per section): small feature, bug fix, config change
  - **Medium** (1-2 paragraphs per section): new module, refactoring, integration
  - **Detailed** (200-300 words per section): new system, major architecture change
- Sections to cover (skip if not applicable):
  1. **Architecture** — high-level structure, module relationships
  2. **Components** — key components and their responsibilities
  3. **Data Flow** — how data moves through the system
  4. **Error Handling** — failure modes and recovery strategies
  5. **Testing Strategy** — what and how to test
- **After each section**, ask: "Does this look right so far?" (or confirm under Autonomous Override)
- If using Visual Companion: show architecture/data flow diagrams in the browser.
- Iterate until the human approves each section.

#### 5e. Scope Decomposition Check
- **Check for multi-subsystem scope**: If the goal describes 2+ independent subsystems (e.g., "build chat + file storage + billing"):
  - Flag immediately: "This goal covers multiple independent subsystems. I recommend splitting into separate Generations."
  - Help decompose into sub-goals, each getting its own Generation.
- **Check FR count**: If functional requirements exceed 10, warn and suggest splitting.
- Under Autonomous Override: if scope is clearly single-subsystem, proceed without asking.

### 6. Genome Gap Analysis
- Identify information required to achieve the goal that is missing from the genome
- For each missing item, record it in `.reap/life/backlog/`:
  ```markdown
  ---
  type: genome-change
  status: pending
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

### 8. Spec Review Loop
- After the artifact is complete, dispatch a **spec-document-reviewer subagent** (using the Agent tool with the prompt from `src/templates/brainstorm/spec-reviewer-prompt.md`):
  - The subagent reads `.reap/life/01-objective.md` and reviews for completeness, consistency, clarity, scope, YAGNI, and verifiability.
  - If **Issues Found**: fix the issues in the artifact and re-dispatch the reviewer.
  - If **Approved**: proceed to human review.
  - **Maximum 3 iterations**. If issues persist after 3 rounds, present remaining issues to the human for decision.
- Under Autonomous Override: run the review loop automatically. Only escalate if the reviewer flags blocking issues after 3 rounds.

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
- [ ] Does the Design section include the chosen approach with rationale?
- [ ] Has the spec review loop completed (approved or human-overridden)?

❌ Bad completion criterion: "Stabilize the service"
✅ Good completion criterion: "`npm run lint` reports 0 errors, `npm run build` succeeds"

## Artifact Generation (Progressive Recording)
- **Language**: Write all artifact content in the user's configured language (see REAP Guide § Language).
- **Immediately upon entering this stage**: Read `~/.reap/templates/01-objective.md` and create `.reap/life/01-objective.md` with the Goal section filled in (from `current.yml` goal)
- **Update incrementally**: As each step progresses, update the artifact in place:
  - After Environment Scan → update Background section
  - After Previous Generation Reference → update Background section
  - After Backlog Review → update Background section
  - After Genome Health Check → update Genome Reference section
  - After Brainstorming Design (5a-5e) → update Goal, Scope, Design sections
  - After Genome Gap Analysis → update Backlog section
  - After Requirements Finalization → update Requirements, Completion Criteria sections
  - After Spec Review Loop → update with any review-driven changes
- The artifact should reflect the **current state of work at all times**
- Do NOT wait until the end to write the artifact

## Completion
- **If called from `/reap.evolve`** (Autonomous Override active): Save the artifact and proceed automatically. Do NOT pause for human confirmation.
- **If called standalone**: Show the artifact to the human and get confirmation.
- After confirmation or auto-proceed: "Proceed to the Planning stage with `/reap.next`."

# REAP Guide

## What is REAP

REAP (Recursive Evolutionary Autonomous Pipeline) is a development pipeline where AI and humans collaborate to incrementally evolve an Application across successive Generations.

## REAP Architecture

REAP consists of four interconnected layers:

- **Vision** — Long-term goals and direction stored in `.reap/vision/`. Vision is the primary driver of each Generation — it determines what goal to pursue next. During the adapt phase, the AI analyzes gaps between vision and current state to suggest the next generation's goal.
- **Knowledge** — The project's accumulated understanding, split into two layers. Genome (`.reap/genome/`) is prescriptive — architecture decisions, conventions, and constraints that define how the project should be built. Environment (`.reap/environment/`) is descriptive — current tech stack, source structure, build configuration, and test setup. Knowledge serves as the basis for each Generation's work.
- **Generation** — A single evolution cycle driven by Vision and grounded in Knowledge. Each Generation follows a structured lifecycle (Learning → Planning → Implementation → Validation → Completion), evolves Civilization, and feeds lessons back into Knowledge. Artifacts are archived in Lineage.
- **Civilization** — The source code and all project artifacts outside `.reap/`. This is what Generations evolve. After each Generation completes, lessons from the code feed back into Knowledge (environment updates, genome adaptations).

## Principles

- **Genome Immutability**: The genome is never modified during a normal generation. Issues are logged in the backlog and applied at completion's adapt phase. (Embryo generations allow free genome modification.)
- **Environment Immutability**: The environment is never modified directly during a generation. Changes are recorded in the backlog and applied at completion's reflect phase.
- **Human Judges Fitness**: No quantitative metrics. The human's natural language feedback is the only fitness signal.
- **Self-fitness Prohibited**: The AI never scores its own success. Only self-assessment (metacognition) is allowed.

## .reap/ Structure

```
.reap/
├── config.yml                 # Project configuration (language, agentClient, etc.)
├── genome/                    # Prescriptive knowledge (how to build)
│   ├── application.md         #   Project identity, architecture, conventions
│   ├── evolution.md           #   AI behavior guide, interaction principles, code quality rules
│   └── invariants.md          #   Absolute constraints (human-only modification)
├── environment/               # Descriptive knowledge (what exists now)
│   ├── summary.md             #   Always loaded — tech stack, source structure, build, tests
│   ├── domain/                #   Domain knowledge (on-demand)
│   └── source-map.md          #   Code structure + dependencies (on-demand)
├── vision/                    # Long-term goals and direction
│   ├── goals.md               #   North star objectives
│   └── docs/                  #   Planning documents
├── life/                      # Current generation's life cycle
│   ├── current.yml            #   Active generation state (REAP managed, never edit manually)
│   ├── 01-learning.md ~ 05-completion.md  # Stage artifacts
│   └── backlog/               #   Items to carry forward
├── lineage/                   # Archive of completed generations (2-level compression)
└── hooks/                     # Lifecycle event handlers (.md prompts, .sh scripts)
    └── conditions/            # Condition scripts for conditional hook execution
```

## Life Cycle (A Single Generation's Lifespan)

```
Learning → Planning → Implementation ⟷ Validation → Completion
                                                      ├─ reflect
                                                      ├─ fitness
                                                      ├─ adapt
                                                      └─ commit
```

| Stage              | Description                    | What it does                                                                                    | Artifact               |
| ------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------- |
| **Learning**       | Exploration + context building | Explore code, genome, environment, lineage. Assess clarity level. Build context for the goal    | `01-learning.md`       |
| **Planning**       | Plan formulation               | Task decomposition, dependencies, implementation approach, test strategy                        | `02-planning.md`       |
| **Implementation** | Code implementation            | AI+Human collaboration to write code. Record genome defects in backlog when found               | `03-implementation.md` |
| **Validation**     | Verification                   | Run tests, check completion criteria. Can regress to Implementation on failure                  | `04-validation.md`     |
| **Completion**     | Finalization                   | Retrospective (reflect) + human feedback (fitness) + genome review (adapt) + archiving (commit) | `05-completion.md`     |

## Key Concepts

### Generation

A single generation. Carries one goal through the Life Cycle. State is tracked in `life/current.yml`.

**Generation types**:

- `embryo` — Early-stage project. Genome modifications are freely allowed during any stage.
- `normal` — Stable project. Genome is immutable during the generation.
- `merge` — Distributed merge lifecycle (detect → mate → merge → reconcile → validation → completion).

**Generation ID format**: `gen-{NNN}-{hash}` (e.g. `gen-042-a3f8c2`)

### Backlog

Items to be carried forward are stored in `.reap/life/backlog/`. Each item uses markdown + frontmatter format:

- `type: genome-change` — Applied to genome during completion adapt phase
- `type: environment-change` — Applied to environment during completion reflect phase
- `type: task` — Referenced as goal candidates in the next generation

Each item carries a `status` field:

- `status: pending` — Not yet processed (default)
- `status: consumed` — Processed in the current generation (requires `consumedBy: gen-XXX-{hash}`)

**Create backlog items using CLI only**: `reap make backlog --type <type> --title <title> [--body <body>] [--priority <priority>]`. Never create backlog files directly.

### Task Deferral

Tasks that depend on genome changes cannot be completed in the current generation. Mark as `[deferred]` and add to backlog as `type: task`. Partial completion is normal.

### Stage Regression (Micro Loop)

Any stage can regress to a previous stage using `reap run back`. Artifact handling:

- **Before target stage**: Preserved
- **Target stage**: Overwritten (implementation only appends)
- **After target stage**: Preserved, overwritten upon re-entry

### Minor Fix

Trivial issues (typos, lint errors, etc.) are fixed directly in the current stage without a stage transition. Judgment criterion: resolvable within 5 minutes without design changes.

### Lineage Compression

As generations accumulate, lineage grows. Auto-compression triggers when thresholds are met:

- **Level 1**: Generation folder → single .md. Only goal + result + notable items preserved.
- **Level 2**: Multiple Level 1 entries → epoch .md. Only key flow preserved.

### Maturity System

Project maturity affects AI behavior:

| Level     | Type            | AI Tone                                     |
| --------- | --------------- | ------------------------------------------- |
| Bootstrap | embryo          | Collaborator — 60% questions, 40% proposals |
| Growth    | normal          | Driver — 30% questions, 70% proposals       |
| Cruise    | normal + cruise | Autonomous — 10% questions, 90% proposals   |

Embryo → Normal transition is proposed during adapt phase and requires human approval.

## REAP Hooks

Hooks are defined as individual files in `.reap/hooks/` with the naming convention `{event}.{name}.{md|sh}`:

```
.reap/hooks/
├── onLifeCompleted.reap-update.sh
├── onLifeCompleted.docs-update.md
├── onLifeImplemented.lint-check.sh
└── onMergeMated.notify.md
```

### File Types

- `.md` — AI prompt: read and follow the instructions
- `.sh` — Shell script: run in project root directory

### Metadata

- `condition` — Condition script name (default: `always`). Scripts live in `.reap/hooks/conditions/`
- `order` — Execution order (default: 50, lower runs first)

For `.md` files, metadata is in YAML frontmatter. For `.sh` files, in comment headers.

### Events

Normal: `onLifeStarted`, `onLifeLearned`, `onLifePlanned`, `onLifeImplemented`, `onLifeValidated`, `onLifeCompleted`, `onLifeTransited`
Merge: `onMergeStarted`, `onMergeDetected`, `onMergeMated`, `onMergeMerged`, `onMergeReconciled`, `onMergeValidated`, `onMergeCompleted`, `onMergeTransited`

### Conditions

Conditions are executable scripts in `.reap/hooks/conditions/`. Exit code 0 = condition met, non-zero = skip. If no condition is specified, the hook always runs (default: `always`).

## Slash Commands

All REAP interactions go through `/reap.*` slash commands. These are the primary interface for both users and AI agents.

### Lifecycle Commands
- `/reap.evolve` — Run an entire generation lifecycle (recommended for most work)
- `/reap.start` — Start a new generation
- `/reap.next` — Advance to the next stage
- `/reap.back [--reason "<reason>"]` — Return to a previous stage
- `/reap.abort [--phase execute] [--reason "<reason>"] [--source-action <rollback|stash|hold|none>] [--save-backlog]` — Abort current generation (2-phase: confirm → execute)

### Knowledge Commands
- `/reap.knowledge [reload|genome|environment]` — Manage genome, environment, and context knowledge. No argument shows options.
- `/reap.init [project-name] [--mode <greenfield|adoption>]` — Initialize REAP in a project (auto-detects greenfield vs existing codebase)
- `/reap.config` — View/edit project configuration

### Collaboration Commands
- `/reap.merge [--type merge --parents "<branchA>,<branchB>"]` — Merge lifecycle for parallel branches
- `/reap.pull` — Fetch remote changes and detect merge opportunities
- `/reap.push` — Validate state and push to remote

### Info Commands
- `/reap.status` — Check current generation state
- `/reap.help` — Show available commands and topics
- `/reap.run` — Execute a lifecycle command directly


## CLI Commands (no slash command equivalent)
- `reap make backlog --type <type> --title <title> [--body <body>] [--priority <priority>]` — Create backlog item (type: genome-change, environment-change, task)
- `reap cruise <count>` — Set cruise mode (pre-approve N generations for autonomous execution)

## Role Separation

| Component        | Role                                                                |
| ---------------- | ------------------------------------------------------------------- |
| **CLI (`reap`)** | Project setup and maintenance. Init, status, run                    |
| **AI Agent**     | Workflow executor. Performs each stage's work                       |
| **Human**        | Decision maker. Sets goals, reviews code, provides fitness feedback |

## Execution Flow

**Recommended**: `/reap.evolve` runs the entire generation lifecycle automatically, from start through completion. This is the default way to work with REAP.

**Manual control**: If you need to control individual stages:

- `/reap.start` — Create a new generation (prompts for goal)
- `/reap.next` — Complete current stage and advance to the next
- `/reap.back` — Regress to a previous stage

For fine-grained control, use `/reap.run` to execute specific stages and phases:

1. `/reap.run start --goal "<goal>"` — Create generation
2. `/reap.run <stage>` — Start a stage (learning, planning, implementation, validation)
3. `/reap.run <stage> --phase complete` — Complete current stage and auto-advance
4. `/reap.run completion --phase reflect` — Write retrospective + update environment
5. `/reap.run completion --phase fitness --feedback "<text>"` — Save human feedback
6. `/reap.run completion --phase adapt` — Review genome, propose next goals
7. `/reap.run completion --phase commit` — Archive to lineage

**Signature-based locking**: Each stage transition generates a cryptographic nonce token and verifies the artifact exists (>50 chars). Attempting to skip a stage or execute stages out of order will fail signature verification and produce an error. Slash commands MUST be executed in the order defined by the lifecycle.

## Language

All REAP artifacts and user interactions follow the user's configured language (from config.yml `language` field).

- **Artifacts** (01-learning.md through 05-completion.md): Write in the user's language
- **User interactions**: Communicate in the user's configured language
- **Backlog items**: Write in the user's language
- **Genome files**: Write in the user's configured language
- **If no language is configured**: Default to English

## Critical Rules

1. **NEVER modify `current.yml` directly.** Stage transitions MUST go through `reap run` commands. Direct modification bypasses nonce verification and breaks the lifecycle.
2. **NEVER skip a stage.** Each stage must be executed and its artifact must exist before advancing.
3. **ALL development work MUST follow the REAP lifecycle.** Do NOT bypass it unless the human explicitly asks.
4. **Genome is the authoritative source of truth.** When making decisions about architecture, conventions, or constraints, ALWAYS consult the Genome first.
5. **Keep Genome fresh.** If you notice the Genome is missing information or contains outdated information, inform the human.
6. **Do NOT create backlog items during the adapt phase.** Next generation candidates and suggestions must be written in the completion artifact text only (Next Generation Hints section). The human decides which suggestions become backlog items. Never run `reap make backlog` during adapt.

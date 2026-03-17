# REAP Guide

## What is REAP

REAP (Recursive Evolutionary Autonomous Pipeline) is a development pipeline where AI and humans collaborate to incrementally evolve an Application across successive Generations.

## 3-Layer Model

```
Genome (Genetic Information)  →  Evolution (Cross-generational Evolution)  →  Civilization (Source Code)
  Design and knowledge             Life cycle, mutation, adaptation              Accumulated artifacts
```

- **Genome** — Design and knowledge for building the Application. Stored in `.reap/genome/`.
- **Evolution** — The process by which Genome evolves and Civilization grows through repeated Generations.
- **Civilization** — Source Code. The entire project codebase outside `.reap/`.

## Genome Structure

```
.reap/genome/
├── principles.md      # Architecture principles/decisions (ADR style)
├── domain/            # Business rules (separated by module)
├── conventions.md     # Development rules/conventions + Enforced Rules
└── constraints.md     # Technical constraints/choices + Validation Commands
```

**Genome Immutability Principle**: The current generation does not modify Genome directly. Issues discovered during Implementation are recorded in the backlog as `type: genome-change` and applied to Genome only during the Completion stage.

**Environment Immutability Principle**: The current generation does not modify Environment directly. External environment changes discovered during a generation are recorded in the backlog as `type: environment-change` and applied during the Completion stage.

## .reap/ 4-Axis Structure

| Axis | Path | Role |
|------|------|------|
| **Genome** | `.reap/genome/` | Genetic information. Collection of principles, rules, and decisions |
| **Environment** | `.reap/environment/` | External environment. API docs, infrastructure info, business constraints |
| **Life** | `.reap/life/` | Current generation's life cycle. Progress state and artifacts |
| **Lineage** | `.reap/lineage/` | Genealogy. Archive of completed generations |

## Life Cycle (A Single Generation's Lifespan)

```
Objective → Planning → Implementation ⟷ Validation → Completion
```

| Stage | Description | What it does | Artifact |
|-------|-------------|--------------|----------|
| **Objective** | Goal definition | Define this generation's goal + requirements. Reference environment, backlog, genome | `01-objective.md` |
| **Planning** | Plan formulation | Task decomposition, dependencies, implementation approach | `02-planning.md` |
| **Implementation** | Implementation | AI+Human collaboration to write code. Record genome defects in backlog when found | `03-implementation.md` |
| **Validation** | Verification | Run tests, check completion criteria. Can regress to Implementation on failure | `04-validation.md` |
| **Completion** | Finalization | Retrospective + backlog review + apply genome changes + archiving | `05-completion.md` |

## Key Concepts

### Generation
A single generation. Carries one goal through the Life Cycle. State is tracked in `life/current.yml`.

### Backlog
All items to be carried forward to the next generation are stored in `.reap/life/backlog/`. Each item uses markdown + frontmatter format:
- `type: genome-change` — Applied to genome during Completion (genome defects discovered mid-generation)
- `type: environment-change` — Applied to environment during Completion (external environment changes discovered mid-generation)
- `type: task` — Referenced as goal candidates in the next Objective (deferred tasks, tech debt, etc.)

### Task Deferral
Tasks that depend on Genome changes cannot be completed in the current generation. Mark as `[deferred]` and add to backlog as `type: task`. Partial completion is normal.

### Micro Loop (Regression to a Previous Stage)
Any stage can regress to a previous stage. Use `/reap.back` to go back one stage, or `/reap.back [stage]` to regress to a specific stage.

Artifact handling rules:
- **Before target stage**: Preserved
- **Target stage**: Overwritten (implementation only appends)
- **After target stage**: Preserved, overwritten upon re-entry

Regression reason is recorded as a `## Regression` section in the target stage's artifact.

### Minor Fix
Trivial issues (typos, lint errors, etc.) are fixed directly in the current stage without a stage transition and recorded in the artifact. Judgment criterion: resolvable within 5 minutes without design changes.

### Lineage Compression
As generations accumulate, lineage grows. Auto-compression triggers when total exceeds 10,000 lines + 5 or more generations:
- **Level 1**: Generation folder → single .md (40 lines). Only goal + result + notable items preserved.
- **Level 2**: 5 Level 1 entries → epoch .md (60 lines). Only key flow preserved.

Compression runs automatically during `/reap.next` (archiving after completion).

## REAP Hooks

Projects can define hooks in `.reap/config.yml` to run commands or prompts at lifecycle events:

```yaml
hooks:
  onGenerationStart:
    - command: "echo 'Generation started'"
  onStageTransition:
    - command: "echo 'Stage changed'"
  onGenerationComplete:
    - command: "reap update"
    - prompt: "Check if README needs updating based on this generation's changes."
  onRegression:
    - command: "echo 'Regressed'"
```

Each hook entry supports two types:
- `command` — Run a shell command in the project root directory
- `prompt` — AI agent instruction. The agent reads and executes the described task.

Only one of `command` or `prompt` should be set per entry.

| Event | Trigger |
|-------|---------|
| `onGenerationStart` | After `/reap.start` creates a new generation |
| `onStageTransition` | After `/reap.next` advances to the next stage |
| `onGenerationComplete` | After `/reap.next` archives a completed generation (after commit) |
| `onRegression` | After `/reap.back` returns to a previous stage |

Hooks are executed by the AI agent.

## Role Separation

| Component | Role |
|-----------|------|
| **CLI (`reap`)** | Project setup and maintenance. Init, status, update, fix |
| **AI Agent** | Workflow executor. Performs each stage's work via slash commands |
| **Human** | Decision maker. Sets goals, finalizes specs, reviews code, approves stage transitions |

## Execution Flow

```
1. /reap.start → Start a new Generation
2. /reap.objective → Define goal + requirements
3. /reap.next
4. /reap.planning → Task decomposition + implementation plan
5. /reap.next
6. /reap.implementation → Code implementation
7. /reap.next
8. /reap.validation → Verification
9. /reap.next
10. /reap.completion → Retrospective + genome updates
11. /reap.next → Archiving, generation ends
```

Each slash command follows a 3-step structure: Gate (precondition check) → Steps (work execution) → Artifact generation.

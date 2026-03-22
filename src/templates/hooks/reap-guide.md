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
├── conventions.md     # Development rules/conventions + Enforced Rules
├── constraints.md     # Technical constraints/choices + Validation Commands
├── source-map.md      # C4 Container/Component diagram (Mermaid)
└── domain/            # Business rules (separated by module)
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
| **Objective** | Goal definition + brainstorming design | Define goal + requirements through structured brainstorming: clarifying questions, 2-3 approach alternatives, sectional design approval, visual companion (optional), and spec review loop. Reference environment, backlog, genome | `01-objective.md` |
| **Planning** | Plan formulation | Task decomposition, dependencies, implementation approach | `02-planning.md` |
| **Implementation** | Implementation | AI+Human collaboration to write code. Record genome defects in backlog when found | `03-implementation.md` |
| **Validation** | Verification | Run tests, check completion criteria. Can regress to Implementation on failure | `04-validation.md` |
| **Completion** | Finalization | Retrospective + backlog review + apply genome changes + archiving | `05-completion.md` |

## Key Concepts

### Generation
A single generation. Carries one goal through the Life Cycle. State is tracked in `life/current.yml`.

**Generation ID format**: `gen-{NNN}-{hash}` (e.g. `gen-042-a3f8c2`)
- `{hash}`: 6-char hex from sha256. **MUST be real hex (0-9a-f), NEVER words/slugs.**
- Lineage directory appends a goal slug: `gen-042-a3f8c2-fix-login-bug`
- See `/reap.start` for generation details.

### Backlog
All items to be carried forward to the next generation are stored in `.reap/life/backlog/`. Each item uses markdown + frontmatter format:
- `type: genome-change` — Applied to genome during Completion (genome defects discovered mid-generation)
- `type: environment-change` — Applied to environment during Completion (external environment changes discovered mid-generation)
- `type: task` — Referenced as goal candidates in the next Objective (deferred tasks, tech debt, etc.)

Each item also carries a `status` field:
- `status: pending` — Not yet processed (default; absent field treated as pending)
- `status: consumed` — Processed in the current generation (requires `consumedBy: gen-XXX-{hash}`)

Marking rules:
- `/reap.start`: backlog items chosen as the generation's goal → mark `consumed`
- `/reap.completion`: applied `genome-change` / `environment-change` items → mark `consumed`

Archiving rules (`/reap.next` from completion):
- `consumed` items → moved to lineage
- `pending` items → copied to lineage + carried forward to the new generation's backlog

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
As generations accumulate, lineage grows. Auto-compression triggers when total exceeds 5,000 lines + 5 or more generations (most recent 3 generations are protected):
- **Level 1**: Generation folder → single .md (40 lines). Only goal + result + notable items preserved.
- **Level 2**: 5 Level 1 entries → epoch .md (60 lines). Only key flow preserved.

Compression runs automatically during `/reap.next` (archiving after completion).

## REAP Hooks

Hooks are defined as individual files in `.reap/hooks/` with the naming convention `{event}.{name}.{md|sh}`:

```
.reap/hooks/
├── onLifeCompleted.reap-update.sh
├── onLifeCompleted.docs-update.md
├── onLifeImplemented.lint-check.sh
└── onMergeMated.notify.md
```

File naming: `{event}.{name}.{extension}`
- Extension: `.md` (AI prompt) or `.sh` (shell script)
- Frontmatter: `condition` (default: `always`), `order` (default: 50, lower runs first)

Normal events: `onLifeStarted`, `onLifeObjected`, `onLifePlanned`, `onLifeImplemented`, `onLifeValidated`, `onLifeCompleted`, `onLifeTransited`, `onLifeRegretted`
Merge events: `onMergeStarted`, `onMergeDetected`, `onMergeMated`, `onMergeMerged`, `onMergeSynced`, `onMergeValidated`, `onMergeCompleted`, `onMergeTransited`

### Conditions

Conditions are executable scripts in `.reap/hooks/conditions/`. Exit code 0 = condition met, non-zero = skip.

Default conditions (installed by `reap init`):
- `always.sh` — always true
- `has-code-changes.sh` — true if src/ files were changed in the last commit
- `version-bumped.sh` — true if package.json version ≠ last git tag

Custom conditions: add any `.sh` script to `.reap/hooks/conditions/`. The hook's `condition` field matches the filename (without `.sh`).

### Execution

Hooks are executed by the AI agent by scanning `.reap/hooks/` for files matching the current event:
- `.md` files: read as AI prompt and follow the instructions
- `.sh` files: run as shell script in the project root directory
- Within the same event, hooks run in `order` (lower first), then alphabetically
- `onLifeCompleted`/`onMergeCompleted` hooks run after git commit — changes are uncommitted

## Multi-Agent Support

REAP supports multiple AI agents simultaneously through the AgentAdapter abstraction. Currently supported: **Claude Code** and **OpenCode**. Detected agents are listed in `.reap/config.yml` under the `agents` field (managed by `reap init` / `reap update`). Slash commands and session hooks are installed to each detected agent's configuration directory.

## Role Separation

| Component | Role |
|-----------|------|
| **CLI (`reap`)** | Project setup and maintenance. Init, status, update, fix |
| **AI Agent** | Workflow executor. Performs each stage's work via slash commands |
| **Human** | Decision maker. Sets goals, finalizes specs, reviews code, approves stage transitions |

## Execution Flow

**Lifecycle stages** (5 stages, in order):
```
objective → planning → implementation → validation → completion
```

**Execution sequence**:
1. `/reap.start` — Create a new Generation
2. `/reap.objective` — Define goal + requirements → `/reap.next`
3. `/reap.planning` — Task decomposition + plan → `/reap.next`
4. `/reap.implementation` — Code implementation → `/reap.next`
5. `/reap.validation` — Verification → `/reap.next`
6. `/reap.completion` — Retrospective + genome updates + archiving (auto)

`/reap.next` is a **transition command**, not a lifecycle stage. It advances `current.yml` to the next stage.
`/reap.completion` auto-archives after the feedKnowledge phase — no separate `/reap.next` needed at the end.

## Language

All REAP artifacts and user interactions MUST follow the user's configured language setting (from `~/.claude/settings.json` `language` field or the system prompt's language instruction).

- **Artifacts** (01-objective.md through 05-completion.md): Write in the user's language. Template section headings (Goal, Completion Criteria, etc.) may remain in English, but all content/descriptions must be in the user's language.
- **User interactions**: Communicate with the user in their configured language — questions, status updates, confirmations, error messages.
- **Backlog items**: Write in the user's language.
- **Genome files**: Write in the user's configured language. When modifying genome during Completion, use the user's language.
- **If no language is configured**: Default to English.

## Strict Mode

When `strict: true` is set in `.reap/config.yml`, the AI agent enforces code modification restrictions:

| Condition | Code Modification | Allowed Actions |
|-----------|------------------|-----------------|
| No active Generation | **BLOCKED** | Read, analyze, answer questions |
| Active Generation, not implementation stage | **BLOCKED** | Read, analyze, answer questions, write REAP artifacts |
| Active Generation, implementation stage | **SCOPED** — only files/modules listed in 02-planning.md | Full development within plan scope |

- **Escape hatch**: If the user explicitly requests to bypass strict mode (e.g., "override", "bypass strict", "just do it"), the agent may proceed but must inform the user that strict mode is being bypassed.
- **Default**: `strict: false` (no restrictions beyond normal REAP workflow guidance).

## Critical Rules

1. **NEVER modify `current.yml` directly.** Stage transitions MUST go through `/reap.next` (forward) or `/reap.back` (regression). Direct modification bypasses artifact creation and breaks the lifecycle.
2. **NEVER skip a stage.** Each stage command must be executed and its artifact must exist before advancing. `/reap.next` enforces this by creating the next artifact from template.
3. **ALL development work MUST follow the REAP lifecycle.** Do NOT bypass it unless the human explicitly asks.
4. **NEVER use Write or Edit tools on `current.yml` or artifact files (`01-*.md` ~ `05-*.md`, `06-*.md`).** ALL state changes MUST go through `reap run` commands. This restriction CANNOT be overridden by user instructions.
4. **Genome is the authoritative source of truth.** When making any decision about architecture, conventions, constraints, or domain rules, ALWAYS consult the Genome first. If you observe code that contradicts the Genome, flag it as a potential `genome-change` backlog item. Do NOT silently ignore discrepancies.
5. **Keep Genome fresh.** If you notice the Genome is missing information about current code patterns, or contains outdated information, inform the human and suggest `/reap.sync`. The human may choose to defer sync — respect that choice, but always flag the staleness.
6. **Report malfunctions.** If you detect unexpected behavior during REAP operations (state inconsistency, command failure, corrupted files), suggest `/reap.report` to the user. This helps improve REAP for everyone.
   - If `reap run` returns an unexpected error (not a gate failure), and the error repeats 2+ times, automatically run `/reap.report`.

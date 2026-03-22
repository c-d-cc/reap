> [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md)

<p align="center">
  <img src="media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  A development pipeline where AI and humans evolve software across generations.
</p>

<table align="center">
<tr>
<td align="center"><strong>Knowledge Base</strong><br><sub>Genome + Environment</sub></td>
<td align="center">→</td>
<td align="center"><strong>Evolution</strong><br><sub>Generational Progress</sub></td>
<td align="center">→</td>
<td align="center"><strong>Civilization</strong><br><sub>Source Code</sub></td>
</tr>
</table>

REAP captures an application's design knowledge — the Genome (architecture, conventions, constraints) and Environment (external APIs, infrastructure) — then sets objectives for each generation to implement. Defects discovered along the way feed back into the Knowledge Base. As generations accumulate, knowledge evolves and the Source Code (Civilization) grows.

## Table of Contents

- [Why REAP?](#why-reap)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Life Cycle](#life-cycle-)
- [Core Concepts](#core-concepts-)
- [Distributed Workflow](#distributed-workflow-)
- [CLI Commands](#cli-commands-)
- [Agent Integration](#agent-integration)
- [Project Structure](#project-structure-after-reap-init)
- [Lineage Compression](#lineage-compression-)
- [Evolution Flow](#evolution-flow)
- [Presets](#presets)
- [Entry Modes](#entry-modes)

## Why REAP?

Have you ever run into these problems when developing with AI agents?

- **Context loss** — The agent forgets the project context every time you start a new session
- **Scattered development** — Code gets modified here and there with no clear goal
- **Design–code drift** — Documentation and code diverge over time
- **Forgotten lessons** — Hard-won insights from past struggles never carry forward
- **Collaboration chaos** — Multiple developers or agents working in parallel leads to conflicting changes and merge nightmares

REAP solves these with a **generation-based evolution model**:

- Each generation focuses on a single objective (Objective → Completion)
- The AI agent automatically picks up current context at every session start (SessionStart Hook)
- Design issues discovered during implementation are logged in the backlog and addressed at Completion
- Lessons drawn from retrospectives (Completion) accumulate in the Genome
- Repeated manual tasks are automatically detected across generations, with user-confirmed hook creation
- Parallel work across branches is reconciled through a genome-first merge workflow — design conflicts are resolved before code conflicts

## Installation

> **Global installation required.** REAP is a CLI tool and must be installed globally. Local project-level installation (`npm i @c-d-cc/reap`) is blocked.

```bash
# npm
npm install -g @c-d-cc/reap

# or Bun
bun install -g @c-d-cc/reap
```

> **Requirements**: [Node.js](https://nodejs.org) v18+, [Claude Code](https://claude.ai/claude-code) or [OpenCode](https://opencode.ai) CLI. [Bun](https://bun.sh) is optional.

## Quick Start

```bash
# 1. Initialize the project

# New project
reap init my-project

# Existing project
cd my-project
reap init

# 2. Open Claude Code and run a full generation
claude
> /reap.evolve "Implement user authentication"
```

`/reap.evolve` runs the entire generation lifecycle — from Objective through Completion — interactively with you. It automatically starts a generation, executes each stage in order, and advances between them. This is the primary command you'll use for day-to-day development.

You can also drive each stage manually if you need finer control:

```bash
> /reap.start            # Start a new generation
> /reap.objective        # Define objective + spec
> /reap.next             # Advance to the next stage
> /reap.planning         # Create implementation plan
> /reap.next
> /reap.implementation   # Build with AI + human collaboration
> ...
```

## Life Cycle [↗](https://reap.cc/docs/lifecycle)

Each generation goes through a five-stage life cycle:

```
Objective → Planning → Implementation ⟷ Validation → Completion
```

| Stage | What happens | Artifact |
|-------|-------------|----------|
| **Objective** | Define goal through structured brainstorming: clarifying questions, 2-3 approach alternatives, sectional design approval, optional visual companion, and spec review loop | `01-objective.md` |
| **Planning** | Break down tasks, choose approach, map dependencies | `02-planning.md` |
| **Implementation** | Build with AI + human collaboration | `03-implementation.md` |
| **Validation** | Run tests, verify completion criteria | `04-validation.md` |
| **Completion** | Retrospective + apply Genome changes + hook suggestion + auto-archive (consume + archive + commit) | `05-completion.md` |

## Core Concepts [↗](https://reap.cc/docs/core-concepts)

### Genome [↗](https://reap.cc/docs/genome)

The application's genetic information — a collection of architecture principles, business rules, development conventions, and technical constraints.

```
.reap/genome/
├── principles.md      # Architecture principles/decisions
├── domain/            # Business rules (per module)
├── conventions.md     # Development rules/conventions
├── constraints.md     # Technical constraints/choices
└── source-map.md      # C4 Container/Component diagram (Mermaid)
```

**Genome Immutability Principle**: The Genome is never modified directly during the current generation. When an issue is found, it is recorded in the backlog and only applied at the Completion stage.

**Environment Immutability Principle**: The Environment is never modified directly during the current generation. External changes are recorded in the backlog and applied at the Completion stage.

### Backlog [↗](https://reap.cc/docs/backlog)

All items to be addressed next are stored in `.reap/life/backlog/`. Each item uses markdown + frontmatter format:

- `type: genome-change` — Applied to the Genome at Completion
- `type: environment-change` — Applied to the Environment at Completion
- `type: task` — Candidate goals for the next Objective (deferred tasks, tech debt, etc.)

Each item also carries a `status` field:

- `status: pending` — Not yet processed (default)
- `status: consumed` — Processed in the current generation (requires `consumedBy: gen-XXX-{hash}`)

At archiving time (`/reap.next` from Completion), `consumed` items move to lineage while `pending` items are carried forward to the next generation's backlog.

**Partial completion is normal** — Tasks that depend on Genome changes are marked `[deferred]` and handed off to the next generation.

### Four-Axis Structure [↗](https://reap.cc/docs/core-concepts)

```
.reap/
├── genome/        # Genetic information (evolves across generations)
├── environment/   # External context (API docs, infra, business constraints)
├── life/          # Lifecycle — current generation's state and artifacts
└── lineage/       # Archive of completed generations
```

## Distributed Workflow [↗](https://reap.cc/docs/distributed-workflow)

> **⚠ Early Stage** — The distributed workflow requires further testing. Use with caution in production. We're collecting feedback — [open an issue](https://github.com/c-d-cc/reap/issues).

REAP supports a distributed workflow for collaboration environments where multiple developers or AI agents work on the same project in parallel — without a central server. Git is the only transport layer.

### How It Works

```
Machine A: branch-a — gen-046-a (authentication)    → /reap.push
Machine B: branch-b — gen-046-b (search)            → /reap.push

Machine A:
  /reap.pull branch-b   → Fetch + full merge generation lifecycle
```

Each machine works independently on its own branch and generation. When it's time to combine, REAP orchestrates the merge with a **genome-first** strategy ([learn more](https://reap.cc/docs/merge-generation)):

1. **Detect** — Identify divergence by scanning the remote branch's genome and lineage via git refs
2. **Mate** — Resolve genome conflicts first (human decides)
3. **Merge** — Merge source code guided by the finalized genome (`git merge --no-commit`)
4. **Sync** — AI compares genome and source for consistency; user confirms any inconsistencies
5. **Validation** — Run mechanical testing (bun test, tsc, build) — same as normal generation
6. **Completion** — Commit the merged result and archive

### Slash Commands for Distributed Workflow

All distributed operations run through your AI agent:

```bash
/reap.pull <branch>        # Fetch + run full merge generation (the distributed /reap.evolve)
/reap.merge <branch>       # Run full merge generation for a local branch (no fetch)
/reap.push                 # Validate REAP state + push current branch
/reap.merge.start          # Start a merge generation (for step-by-step control)
/reap.merge.detect         # Analyze divergence
/reap.merge.mate           # Resolve genome conflicts
/reap.merge.merge          # Merge source code
/reap.merge.sync           # Verify genome–source consistency
/reap.merge.validation     # Run mechanical testing (bun test, tsc, build)
/reap.merge.evolve         # Run merge lifecycle from current stage
```

### Key Principles

- **Opt-in** — `git pull`/`push` always work normally. REAP commands are additive.
- **Genome-first** — Genome conflicts are resolved before source merge. Like amending the constitution before updating the laws.
- **No server** — Everything is local + Git. No external services.
- **DAG lineage** — Each generation references its parents via a hash-based ID (`gen-046-a3f8c2`), forming a directed acyclic graph that naturally supports parallel work.

## CLI Commands [↗](https://reap.cc/docs/cli-reference)

| Command | Description |
|---------|-------------|
| `reap init <name>` | Initialize project. Creates the `.reap/` structure |
| `reap status` | Check the current generation's status |
| `reap update` | Sync commands/templates/hooks to the latest version |
| `reap fix` | Diagnose and repair the `.reap/` structure |
| `reap help` | Print CLI commands, slash commands, and workflow summary |
| `reap run <cmd>` | Execute a slash command's script directly (used internally by 1-line `.md` wrappers) |

### Options

```bash
reap init my-project --mode adoption    # Apply REAP to an existing project
reap init my-project --preset bun-hono-react  # Initialize Genome with a preset
reap update --dry-run                   # Preview changes before applying
```

## Agent Integration

REAP integrates with AI agents through slash commands and session hooks. Currently supported agents: **Claude Code** and **OpenCode**.

### Script Orchestrator Architecture

Since v0.11.0, all 28 slash commands follow a **1-line `.md` wrapper + TypeScript script** pattern. Each `.md` file simply calls `reap run <cmd>`, and the TS script (`src/cli/commands/run/`) handles all deterministic logic — returning structured JSON instructions for the AI agent. This ensures consistency and testability.

### Signature-Based Locking [↗](https://reap.cc/docs/advanced)

REAP uses a cryptographic nonce chain to enforce stage ordering. When a stage command runs, the script generates a one-time nonce, stores its hash in `current.yml`, and returns the nonce to the AI agent. `/reap.next` requires this nonce to advance — without it, progression is rejected.

```
Stage Command          current.yml              /reap.next
─────────────          ───────────              ──────────
generate nonce ──────→ store hash(nonce)
return nonce to AI                         ←── AI passes nonce
                                               verify hash(nonce)
                                               ✓ advance stage
```

This prevents:
- **Skipping stages** — no valid nonce exists for stages that were not executed
- **Forging tokens** — the hash is one-way; guessing the nonce from the hash is infeasible
- **Replaying old nonces** — each nonce is single-use and bound to the current stage

### autoSubagent Mode

When `/reap.evolve` is run, REAP can automatically delegate the entire generation lifecycle to a subagent. This is controlled by:

```yaml
# .reap/config.yml
autoSubagent: true    # default: true
```

The subagent receives the full context and runs autonomously through all stages, only surfacing when genuinely blocked.

### Auto Issue Report

When an unexpected error occurs during `reap run`, REAP can automatically create a GitHub Issue via `gh issue create`. This is controlled by:

```yaml
# .reap/config.yml
autoIssueReport: true    # default: true (when gh CLI is available)
```

### AI Migration Agent

When `reap update` detects structural gaps between your project and the latest REAP version (e.g., missing config fields, outdated templates), it offers an AI-assisted migration prompt. The agent analyzes the differences and applies changes interactively — no manual migration needed.

`reap init` also ensures all config fields are explicitly declared, and `reap update` backfills any missing fields automatically.

### CLAUDE.md Integration

During `reap init` and `reap update`, REAP adds a managed section to `.claude/CLAUDE.md` containing essential project context for Claude Code sessions.

### Slash Commands [↗](https://reap.cc/docs/command-reference)

Slash commands are installed in `.claude/commands/` and drive the entire workflow:

| Command | Description |
|---------|-------------|
| `/reap.start` | Start a new generation |
| `/reap.objective` | Define goal + requirements |
| `/reap.planning` | Task decomposition + implementation plan |
| `/reap.implementation` | Code implementation with AI + human |
| `/reap.validation` | Run tests, verify completion criteria |
| `/reap.completion` | Retrospective + apply Genome changes + lineage compression |
| `/reap.next` | Advance to the next life cycle stage |
| `/reap.back` | Return to a previous stage (micro loop) |
| `/reap.abort` | Abort current generation (rollback/stash/hold + backlog save) |
| `/reap.status` | Show current generation state and project health |
| `/reap.sync` | Synchronize both Genome and Environment |
| `/reap.sync.genome` | Synchronize Genome with current source code |
| `/reap.sync.environment` | Discover and document external environment dependencies |
| `/reap.config` | Display current project configuration |
| `/reap.report` | Report a bug or feedback to the REAP project (privacy-safe) |
| `/reap.help` | Contextual AI help with 24+ topics |
| `/reap.update` | Upgrade REAP package + sync commands/templates/hooks |
| **`/reap.evolve`** | **Run an entire generation from start to finish (recommended)** |
| **`/reap.pull <branch>`** | **Fetch + run full merge generation (distributed `/reap.evolve`)** |
| **`/reap.merge <branch>`** | **Run full merge generation for a local branch (no fetch)** |
| `/reap.push` | Validate REAP state and push current branch |
| `/reap.merge.start` | Start a merge generation to combine divergent branches |
| `/reap.merge.detect` | Analyze divergence between branches |
| `/reap.merge.mate` | Resolve genome conflicts before source merge |
| `/reap.merge.merge` | Merge source code with resolved genome as guide |
| `/reap.merge.sync` | Verify genome–source consistency (AI compares, user confirms) |
| `/reap.merge.validation` | Run mechanical testing (bun test, tsc, build) |
| **`/reap.merge.evolve`** | **Run the full merge lifecycle automatically** |
| `/reap.refreshKnowledge` | Load REAP context for subagents (Genome, Environment, state) |

### SessionStart Hook [↗](https://reap.cc/docs/hooks)

Runs automatically at the start of every session, injecting the following into the AI agent:

- The full REAP workflow guide (Genome, Life Cycle, Four-Axis Structure, etc.)
- Current generation state (which stage you're in, what to do next)
- Environment summary (`environment/summary.md`) — external system context
- Rules to follow the REAP lifecycle
- Genome staleness detection — checks if code-related commits have occurred since the last Genome update
- Source-map drift detection — compares documented components against actual files
- Slash command installation — copies commands from `~/.reap/commands/` to project `.claude/commands/`

This ensures the agent immediately understands the project context even in a brand-new session.

### Strict Mode [↗](https://reap.cc/docs/configuration)

Strict mode controls what the AI agent is allowed to do. It supports two granular options:

```yaml
# .reap/config.yml
strict: true              # shorthand: enables both edit and merge

# Or granular control:
strict:
  edit: true              # restrict code changes to REAP lifecycle
  merge: false            # restrict raw git pull/push/merge
```

**`strict.edit`** — Code modification control:

| Context | Behavior |
|---------|----------|
| No active generation / non-implementation stage | Code modifications are fully blocked |
| Implementation stage | Only modifications within the scope of `02-planning.md` are allowed |
| Escape hatch | User explicitly requests "override" or "bypass strict" to allow modifications |

**`strict.merge`** — Git command control: when enabled, direct `git pull`/`push`/`merge` are restricted. The agent guides users to use `/reap.pull`, `/reap.push`, `/reap.merge` instead.

Both are disabled by default. `strict: true` enables both.

Strict mode is disabled by default (`strict: false`).

### REAP Hooks [↗](https://reap.cc/docs/hooks)

Hooks are file-based and stored in `.reap/hooks/`. Each hook is a file named `{event}.{name}.{md|sh}`:

- `.md` files contain AI prompts (executed by the AI agent)
- `.sh` files contain shell scripts (executed directly)

```
.reap/hooks/
├── onLifeStarted.context-load.md
├── onLifeCompleted.reap-update.sh
├── onLifeCompleted.docs-update.md
├── onLifeTransited.notify.sh
└── onLifeRegretted.alert.sh
```

Each hook file supports frontmatter with the following fields:

```yaml
---
condition: has-code-changes   # script name in .reap/hooks/conditions/
order: 10                     # execution order (lower runs first)
---
```

**Normal Lifecycle Events:**

| Event | Trigger |
|-------|---------|
| `onLifeStarted` | After `/reap.start` creates a new generation |
| `onLifeObjected` | After objective stage completes |
| `onLifePlanned` | After planning stage completes |
| `onLifeImplemented` | After implementation stage completes |
| `onLifeValidated` | After validation stage completes |
| `onLifeCompleted` | After completion + archiving (runs after git commit) |
| `onLifeTransited` | After any stage transition (generic) |
| `onLifeRegretted` | After `/reap.back` regression |

**Merge Lifecycle Events:**

| Event | Trigger |
|-------|---------|
| `onMergeStarted` | After `/reap.merge.start` creates a merge generation |
| `onMergeDetected` | After detect stage completes |
| `onMergeMated` | After mate stage completes (genome resolved) |
| `onMergeMerged` | After merge stage completes (source merged) |
| `onMergeSynced` | After sync stage completes |
| `onMergeValidated` | After merge validation completes |
| `onMergeCompleted` | After merge completion + archiving |
| `onMergeTransited` | After any merge stage transition (generic) |

## Project Structure After `reap init`

```
my-project/
├── src/                          # Civilization (your code)
└── .reap/
    ├── config.yml                # Project configuration
    ├── genome/                   # Genetic information
    │   ├── principles.md
    │   ├── domain/
    │   ├── conventions.md
    │   ├── constraints.md
    │   └── source-map.md
    ├── hooks/                    # Lifecycle hooks (.md/.sh)
    ├── environment/              # External context (3-layer)
    │   ├── summary.md            # Session context (~100 lines, auto-loaded)
    │   ├── docs/                 # Main reference docs
    │   └── resources/            # Raw materials (user-managed)
    ├── life/                     # Current generation
    │   ├── current.yml
    │   └── backlog/
    └── lineage/                  # Completed generation archive

~/.reap/                            # User-level (installed by reap init)
├── commands/                       # Slash command originals (1-line .md wrappers)
└── templates/                      # Artifact templates

~/.claude/
└── settings.json                   # SessionStart hook registration

.claude/commands/                   # Project-level slash commands
└── reap.*.md                       # Active slash commands (each calls `reap run <cmd>`)
```

## Lineage Compression [↗](https://reap.cc/docs/lineage)

As generations accumulate, the lineage directory grows. REAP manages this with automatic two-level compression during the Completion stage:

| Level | Input | Output | Trigger | Protection |
|-------|-------|--------|---------|------------|
| **Level 1** | Generation folder (5 artifacts) | `gen-XXX-{hash}.md` (40 lines) | lineage > 5,000 lines + 5+ generations | Recent 3 generations + DAG leaf nodes |
| **Level 2** | 100+ Level 1 files | Single `epoch.md` | Level 1 files > 100 | Recent 9 Level 1 files + fork points |

**DAG preservation**: Level 1 files retain DAG metadata (id, parents, genomeHash) in frontmatter. Level 2 `epoch.md` stores a `generations` hash chain in frontmatter for DAG traversal.

**Fork guard**: Before Level 2 compression, all local and remote branches are scanned. Generations that serve as fork points for other branches are protected from epoch compression. Epoch-compressed generations cannot be used as merge bases.

## Evolution Flow

```
Generation #1 (Genome v1)
  → Objective: "Implement user authentication"
  → Planning → Implementation
  → OAuth2 need discovered during Implementation → genome-change logged in backlog
  → Validation (partial)
  → Completion → Retrospective + genome update → Genome v2 → Archive

Generation #2 (Genome v2)
  → Objective: "OAuth2 integration + permission management"
  → Deferred tasks from previous generation + new goals
  → ...
```

## Presets

Use `reap init --preset` to apply an initial Genome configuration tailored to your tech stack.

| Preset | Stack |
|--------|-------|
| `bun-hono-react` | Bun + Hono + React |

```bash
reap init my-project --preset bun-hono-react
```

## Entry Modes

| Mode | Description |
|------|-------------|
| `greenfield` | Build a new project from scratch (default) |
| `migration` | Build anew while referencing an existing system |
| `adoption` | Apply REAP to an existing codebase |

## Author

**HyeonIL Choi** — [hichoi@c-d.cc](mailto:hichoi@c-d.cc) | [c-d.cc](https://c-d.cc) | [LinkedIn](https://www.linkedin.com/in/hichoi-dev) | [GitHub](https://github.com/casamia918)

## License

MIT

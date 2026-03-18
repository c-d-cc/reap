<p align="center">
  <img src="media/logo.png" alt="REAP" width="80" height="80" />
</p>

<h1 align="center">REAP</h1>

<p align="center">
  <strong>Recursive Evolutionary Autonomous Pipeline</strong><br>
  A development pipeline where AI and humans evolve software across generations.
</p>

> [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md)

<table align="center">
<tr>
<td align="center"><strong>Genome</strong><br><sub>Design & Knowledge</sub></td>
<td align="center">→</td>
<td align="center"><strong>Evolution</strong><br><sub>Generational Progress</sub></td>
<td align="center">→</td>
<td align="center"><strong>Civilization</strong><br><sub>Source Code</sub></td>
</tr>
</table>

REAP defines an application's genetic information (Genome), sets objectives for each generation to implement, and feeds back any Genome defects discovered along the way into subsequent stages. As generations accumulate, the Genome evolves and the Source Code (Civilization) grows.

## Why REAP?

Have you ever run into these problems when developing with AI agents?

- **Context loss** — The agent forgets the project context every time you start a new session
- **Scattered development** — Code gets modified here and there with no clear goal
- **Design–code drift** — Documentation and code diverge over time
- **Forgotten lessons** — Hard-won insights from past struggles never carry forward

REAP solves these with a **generation-based evolution model**:

- Each generation focuses on a single objective (Objective → Completion)
- The AI agent automatically picks up current context at every session start (SessionStart Hook)
- Design issues discovered during implementation are logged in the backlog and addressed at Completion
- Lessons drawn from retrospectives (Completion) accumulate in the Genome

## Installation

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

## Life Cycle

Each generation goes through a five-stage life cycle:

```
Objective → Planning → Implementation ⟷ Validation → Completion
```

| Stage | What happens | Artifact |
|-------|-------------|----------|
| **Objective** | Define goal, requirements, and acceptance criteria | `01-objective.md` |
| **Planning** | Break down tasks, choose approach, map dependencies | `02-planning.md` |
| **Implementation** | Build with AI + human collaboration | `03-implementation.md` |
| **Validation** | Run tests, verify completion criteria | `04-validation.md` |
| **Completion** | Retrospective + apply Genome changes + archive | `05-completion.md` |

## Core Concepts

### Genome

The application's genetic information — a collection of architecture principles, business rules, development conventions, and technical constraints.

```
.reap/genome/
├── principles.md      # Architecture principles/decisions
├── domain/            # Business rules (per module)
├── conventions.md     # Development rules/conventions
└── constraints.md     # Technical constraints/choices
```

**Genome Immutability Principle**: The Genome is never modified directly during the current generation. When an issue is found, it is recorded in the backlog and only applied at the Completion stage.

**Environment Immutability Principle**: The Environment is never modified directly during the current generation. External changes are recorded in the backlog and applied at the Completion stage.

### Backlog

All items to be addressed next are stored in `.reap/life/backlog/`. Each item uses markdown + frontmatter format:

- `type: genome-change` — Applied to the Genome at Completion
- `type: environment-change` — Applied to the Environment at Completion
- `type: task` — Candidate goals for the next Objective (deferred tasks, tech debt, etc.)

Each item also carries a `status` field:

- `status: pending` — Not yet processed (default)
- `status: consumed` — Processed in the current generation (requires `consumedBy: gen-XXX`)

At archiving time (`/reap.next` from Completion), `consumed` items move to lineage while `pending` items are carried forward to the next generation's backlog.

**Partial completion is normal** — Tasks that depend on Genome changes are marked `[deferred]` and handed off to the next generation.

### Four-Axis Structure

```
.reap/
├── genome/        # Genetic information (evolves across generations)
├── environment/   # External context (API docs, infra, business constraints)
├── life/          # Current generation's state and artifacts
└── lineage/       # Archive of completed generations
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `reap init <name>` | Initialize project. Creates the `.reap/` structure |
| `reap status` | Check the current generation's status |
| `reap update` | Sync commands/templates/hooks to the latest version |
| `reap fix` | Diagnose and repair the `.reap/` structure |
| `reap help` | Print CLI commands, slash commands, and workflow summary |

### Options

```bash
reap init my-project --mode adoption    # Apply REAP to an existing project
reap init my-project --preset bun-hono-react  # Initialize Genome with a preset
reap update --dry-run                   # Preview changes before applying
```

## Agent Integration

REAP integrates with AI agents through slash commands and session hooks. Currently supported agents: **Claude Code** and **OpenCode**.

### Slash Commands

Slash commands are installed in `.claude/commands/` and drive the entire workflow:

| Command | Description |
|---------|-------------|
| `/reap.start` | Start a new generation |
| `/reap.objective` | Define goal + requirements |
| `/reap.planning` | Task decomposition + implementation plan |
| `/reap.implementation` | Code implementation with AI + human |
| `/reap.validation` | Run tests, verify completion criteria |
| `/reap.completion` | Retrospective + apply Genome changes |
| `/reap.next` | Advance to the next life cycle stage |
| `/reap.back` | Return to a previous stage (micro loop) |
| `/reap.status` | Show current generation state and project health |
| `/reap.sync` | Synchronize Genome with current source code |
| `/reap.help` | Contextual AI help based on current state (topic: workflow, commands, strict, genome, backlog) |
| `/reap.update` | Check for REAP updates and upgrade to the latest version |
| **`/reap.evolve`** | **Run an entire generation from start to finish (recommended)** |

### SessionStart Hook

Runs automatically at the start of every session, injecting the following into the AI agent:

- The full REAP workflow guide (Genome, Life Cycle, Four-Axis Structure, etc.)
- Current generation state (which stage you're in, what to do next)
- Rules to follow the REAP lifecycle

This ensures the agent immediately understands the project context even in a brand-new session.

### Strict Mode

When `strict: true` is set in `.reap/config.yml`, the AI agent is restricted from modifying code outside the REAP workflow:

```yaml
# .reap/config.yml
strict: true      # default: false
language: korean  # language for artifacts and interactions
autoUpdate: true  # auto-update REAP on session start
agents:           # detected agents (managed by reap init/update)
  - claude-code
  - opencode
```

| Context | Behavior |
|---------|----------|
| No active generation / non-implementation stage | Code modifications are fully blocked |
| Implementation stage | Only modifications within the scope of `02-planning.md` are allowed |
| Escape hatch | User explicitly requests "override" or "bypass strict" to allow modifications |

Strict mode is disabled by default (`strict: false`).

### REAP Hooks

Projects can define hooks in `.reap/config.yml` to run commands or AI prompts at lifecycle events:

```yaml
hooks:
  onGenerationStart:
    - command: "echo 'Generation started'"
  onStageTransition:
    - command: "echo 'Stage changed'"
  onGenerationComplete:
    - command: "reap update"
    - prompt: "Update README if this generation changed any features."
  onRegression:
    - command: "echo 'Regressed'"
```

Each hook supports `command` (shell) or `prompt` (AI agent instruction).

| Event | Trigger |
|-------|---------|
| `onGenerationStart` | After `/reap.start` creates a new generation |
| `onStageTransition` | After `/reap.next` advances to the next stage |
| `onGenerationComplete` | After `/reap.next` archives a completed generation |
| `onRegression` | After `/reap.back` returns to a previous stage |

Hooks are executed by the AI agent in the project root directory.

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
    │   └── constraints.md
    ├── environment/              # External context
    ├── life/                     # Current generation
    │   ├── current.yml
    │   └── backlog/
    └── lineage/                  # Completed generation archive

~/.claude/                        # User-level (installed by reap init)
├── commands/                     # Slash commands (/reap.*)
└── settings.json                 # SessionStart hook registration
```

## Lineage Compression

As generations accumulate, the lineage directory grows. REAP manages this with automatic two-level compression:

| Level | Input | Output | Max lines | Trigger |
|-------|-------|--------|-----------|---------|
| **Level 1** | Generation folder (5 artifacts) | `gen-XXX.md` | 40 lines | lineage > 10,000 lines + 5+ generations |
| **Level 2** | 5 Level 1 files | `epoch-XXX.md` | 60 lines | 5+ Level 1 files |

Compression runs automatically when a generation completes. Compressed files preserve objectives and completion results while retaining only notable findings from intermediate stages.

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

## License

MIT

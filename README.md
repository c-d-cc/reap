# REAP

> 한국어 버전은 [README.ko.md](README.ko.md)를 참조하세요.

**Recursive Evolutionary Autonomous Pipeline** — A development pipeline where AI and humans evolve software across generations.

```
Genome (Design & Knowledge)  →  Evolution (Generational Progress)  →  Civilization (Source Code)
```

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
# Bun (recommended)
bun install -g reap

# npm
npm install -g reap
```

> **Requirements**: [Bun](https://bun.sh) runtime, [Claude Code](https://claude.ai/claude-code) CLI

## Quick Start

```bash
# 1. Initialize the project
cd my-project
reap init my-project

# 2. Start the first generation
reap evolve "Implement user authentication"

# 3. Drive the workflow via slash commands in Claude Code
claude
> /reap.objective       # Define objective + spec
> reap evolve --advance
> /reap.planning        # Create implementation plan
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
| `reap evolve [goal]` | Start a new generation |
| `reap evolve --advance` | Advance to the next life cycle stage |
| `reap evolve --back` | Return to the previous stage (micro loop) |
| `reap evolve --back [stage]` | Return to a specific stage |
| `reap status` | Check the current generation's status |
| `reap update` | Sync commands/templates/hooks to the latest version |
| `reap fix` | Diagnose and repair the `.reap/` structure |

### Options

```bash
reap init my-project --mode adoption    # Apply REAP to an existing project
reap init my-project --preset bun-hono-react  # Initialize Genome with a preset
reap update --dry-run                   # Preview changes before applying
```

## Claude Code Integration

REAP integrates with the AI agent through two Claude Code mechanisms:

### Slash Commands

Slash commands corresponding to each life cycle stage are installed in `.claude/commands/`:

```
/reap.objective  /reap.planning  /reap.implementation
/reap.validation /reap.completion /reap.evolve
```

### SessionStart Hook

Runs automatically at the start of every session, injecting the following into the AI agent:

- The full REAP workflow guide (Genome, Life Cycle, Four-Axis Structure, etc.)
- Current generation state (which stage you're in, what to do next)
- Rules to follow the REAP lifecycle

This ensures the agent immediately understands the project context even in a brand-new session.

## Project Structure After `reap init`

```
my-project/
├── src/                          # Civilization (your code)
├── .reap/
│   ├── config.yml                # Project configuration
│   ├── genome/                   # Genetic information
│   │   ├── principles.md
│   │   ├── domain/
│   │   ├── conventions.md
│   │   └── constraints.md
│   ├── environment/              # External context
│   ├── life/                     # Current generation
│   │   ├── current.yml
│   │   └── backlog/
│   ├── lineage/                  # Completed generation archive
│   ├── commands/                 # Slash command sources
│   ├── templates/                # Artifact templates
│   └── hooks/                    # SessionStart hook
│       ├── session-start.sh
│       └── reap-guide.md
└── .claude/
    ├── commands/                 # Claude Code slash commands
    └── hooks.json                # SessionStart hook registration
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

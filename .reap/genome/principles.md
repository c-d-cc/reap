# Architecture Principles

> **Writing Principle**: This file should be a **map** within ~100 lines.
> Write at a level where agents can act immediately.
> Separate detailed content into `domain/` sub-files.
> Modified only during the Completion stage.

## Core Beliefs

- **Genome is a living record** — Not an empty template, but a map that agents can reference immediately
- **Map not Manual** — ~100-line short entry point, details separated into domain/
- **domain/ is the detail of business rules** — Separated by domain unit not code structure, records policies/numbers/state transitions that cannot be read from code
- **Mechanical enforcement first** — Prioritize rules enforceable by lint/test over document-based rules
- **Generation-based evolution** — All changes are tracked through the generation lifecycle
- **Dog-fooding** — REAP itself is managed by the REAP workflow

## Architecture Decisions

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| ADR-001 | TypeScript + Node.js compatible | Type safety, Bun for dev/test, deployment as Node.js bundle | 2026-03 |
| ADR-002 | Commander.js CLI | Mature CLI framework, subcommand support | 2026-03 |
| ADR-003 | YAML for config/state | Human-readable and easy for agents to parse | 2026-03 |
| ADR-004 | Slash commands = ~/.claude/commands/ installation | Claude Code native integration, user-level management | 2026-03 |
| ADR-005 | 4-axis structure (genome/environment/life/lineage) | Separation of concerns: principles/environment/execution/history | 2026-03 |
| ADR-006 | examples/ for real-world validation | Dog-fooding: validate user experience in the same repo | 2026-03 |
| ADR-007 | 5-stage lifecycle (objective~completion) | Simplified from 8 stages, keeping only core stages | 2026-03 |
| ADR-008 | User-level templates (~/.reap/templates/) | Remove package path dependency, AI agents reference a fixed path | 2026-03 |
| ADR-009 | Node.js compatible build | Bun API to fs/promises replacement, bundle for npm publish | 2026-03 |
| ADR-010 | npm scoped package (@c-d-cc/reap) | 'reap' name occupied, deploy as scoped | 2026-03 |

## Layer Map

```
src/
├── cli/commands/  → CLI entry points (init, status, update, fix)
├── core/          → Business logic (generation, lifecycle, compression, hooks, fs, paths, config)
├── templates/     → Source files copied/installed during init (genome, commands, artifacts, hooks, presets)
└── types/         → Shared type definitions
```

- `cli/` → `core/` → `types/` (unidirectional dependency)
- `templates/` is read-only at runtime (no code dependency)

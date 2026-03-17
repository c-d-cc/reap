# Technical Constraints

> **Writing Principle**: This file should be a **map** within ~100 lines.
> Always record not only the "what" but also the "why" of technical choices.
> Modified only during the Completion stage.

## Tech Stack

- **Language**: TypeScript 5.x — Type safety + agent-friendly code generation
- **Runtime**: Node.js compatible (Bun for dev/test) — Works on Node.js for npm publish
- **CLI Framework**: Commander.js — Mature ecosystem, subcommand chaining
- **Config Format**: YAML (yaml library) — Easy to read/write for both humans and agents
- **Package Manager**: npm (deployment), bun (development)
- **npm Package**: @c-d-cc/reap (scoped) — CLI command is `reap`

## Constraints

- File I/O uses Node.js fs/promises (direct Bun API usage prohibited) — via `src/core/fs.ts` utilities
- No external service dependencies — local filesystem only
- `.reap/` directory structure is guaranteed by init, no need for manual user creation
- Slash commands, hooks → `~/.claude/` (user-level)
- Artifact templates, domain guide → `~/.reap/templates/` (user-level)
- Genome files → `.reap/genome/` (project-owned)

## Slash Commands

11 commands: reap.objective, reap.planning, reap.implementation, reap.validation, reap.completion, reap.evolve, reap.start, reap.next, reap.back, reap.status, reap.sync

## Hooks

4 events: onGenerationStart, onStageTransition, onGenerationComplete, onRegression
2 types: command (shell), prompt (AI agent instruction)

## Validation Commands

| Purpose | Command | Description |
|---------|---------|-------------|
| Test | `bun test` | Full unit/integration tests |
| Type check | `bunx tsc --noEmit` | TypeScript compilation verification |
| Build | `npm run build` | Node.js compatible bundle + templates copy |

## External Dependencies

- None (pure local CLI tool)

# Development Conventions

> **Writing Principle**: This file should be a **map** within ~100 lines.
> Write rules to be mechanically verifiable wherever possible.
> Modified only during the Completion stage.

## Code Style

- Use TypeScript strict mode
- Functions should have single responsibility, recommended under 50 lines
- Use `async/await` (no callbacks/then chains)
- Errors are thrown to the caller, caught at the CLI top level
- File I/O uses `src/core/fs.ts` utilities (readTextFile, writeTextFile, fileExists)

## Naming Conventions

- File names: `kebab-case.ts`
- Classes/Interfaces: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Test files: `tests/` mirror structure, `*.test.ts`

## Git Conventions

- Commit messages: `type: description` (feat, fix, test, chore, docs)
- One commit = one logical change
- Prefer commits that include tests
- **Commit timing**: Commit code + artifact together upon Generation completion (1 generation = 1 commit). Commit message: `feat/fix/chore(gen-NNN): [goal]`

## Template Conventions

- Genome templates: `src/templates/genome/` — copied to `.reap/genome/` during init (project-owned)
- Slash commands: `src/templates/commands/` — installed to `~/.claude/commands/` during init/update (user-level)
- Artifact templates: `src/templates/artifacts/` — installed to `~/.reap/templates/` during init/update (user-level)
- Domain guide: `src/templates/genome/domain/README.md` — installed to `~/.reap/templates/domain-guide.md` during init/update
- Hook scripts: `src/templates/hooks/` — executed directly from within the package, registered in `~/.claude/settings.json`
- **When adding new templates, always sync COMMAND_NAMES and installation logic in `init.ts`**

## Enforced Rules

| Rule | Verification Tool | Command |
|------|-------------------|---------|
| All tests pass | bun test | `bun test` |
| TypeScript compilation | tsc | `bunx tsc --noEmit` |
| Node.js build | bun build | `bun build src/cli/index.ts --outfile dist/cli.js --target node` |

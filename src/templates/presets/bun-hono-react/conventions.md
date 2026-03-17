# Development Conventions

> Modified only during the Birth stage.

## Code Style

- TypeScript strict mode
- Functions should have a single responsibility, recommended 50 lines or fewer
- Use `async/await`

## Naming Conventions

- File names: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- API routes: `/api/v1/resource-name`

## Git Conventions

- Commit messages: `type: description` (feat, fix, test, chore, docs)
- One commit = one logical change

## Enforced Rules

| Rule | Validation Tool | Command |
|------|-----------------|---------|
| All tests pass | bun test | `bun test` |
| TypeScript compilation | tsc | `bunx tsc --noEmit` |

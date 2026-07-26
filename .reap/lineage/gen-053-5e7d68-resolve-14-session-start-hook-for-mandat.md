---
id: gen-053-5e7d68
type: embryo
goal: "resolve #14: Session-start hook for mandatory knowledge loading"
parents: ["gen-052-c7e752"]
---
# gen-053-5e7d68
Goal: resolve #14 — Session-start hook for mandatory knowledge loading.

Implemented `reap load-context` CLI command that outputs all mandatory REAP knowledge (reap-guide, genome 3, env/summary, vision/goals, memory 3, generation state, strict mode, language) as `hookSpecificOutput.additionalContext` JSON for Claude Code SessionStart hook injection. Non-REAP directories get silent exit (code 0, no output).

Key changes:
- New: `src/cli/commands/load-context.ts` (core logic + CLI entry point)
- Modified: `src/cli/index.ts` (command routing), `src/adapters/claude-code/install.ts` (hook registration)
- Updated: `CLAUDE.md`, `src/templates/claude-md-section.md` (auto-loading notice + fallback)
- New: `tests/unit/load-context.test.ts` (8 tests, all pass)

Result: v0.15 feature parity for SessionStart knowledge injection achieved.
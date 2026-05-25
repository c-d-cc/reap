# REAP Project

This project uses REAP (Recursive Evolutionary Autonomous Pipeline). All work must follow genome principles in `.reap/genome/` and respect `.reap/genome/invariants.md` as absolute constraints.

## Knowledge Loading

Static knowledge (genome, environment, vision, memory) is auto-loaded via `opencode.json`'s `instructions` field — no manual action required.

Dynamic state (current generation, stage, strict mode, language directive) is dumped to `.reap/.session-state.md` by the REAP OpenCode plugin (`.opencode/plugins/reap-plugin.ts`) on `session.created` and `tool.execute.before` hooks. That file is also listed in `instructions`, so it is auto-loaded into every session.

If state appears stale (e.g., after long inactivity or external state change), run:

- `reap status` — verify current state
- `reap dump-state` — manually refresh `.reap/.session-state.md`

## REAP Workflow Reference

For REAP CLI usage, lifecycle stages, memory model, and behavioral rules, see `~/.reap/reap-guide.md` (installed by `reap install-skills`).

When running REAP commands, follow the structured lifecycle (`reap run <stage>`). Do not edit `.reap/life/current.yml` directly — REAP uses signature-based locking and direct edits will produce errors.

## Plugin Compatibility

The bundled plugin (`.opencode/plugins/reap-plugin.ts`) targets the OpenCode plugin API as of 2026-05. Plugin signature: `async ({ $, directory }) => hooksObject`. If your OpenCode version changes the plugin API, rerun `reap install-skills` to refresh the plugin file.

For typed plugin development, optionally install `@opencode-ai/plugin` and import the `Plugin` type — the bundled plugin uses inline types to avoid forcing this dependency.

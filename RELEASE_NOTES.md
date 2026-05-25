## What's New

- **OpenCode adapter** — REAP now supports OpenCode as a first-class AI agent client. Set `agentClient: opencode` in `.reap/config.yml`, then `reap update` to install OpenCode-specific assets: `opencode.json` instructions, `.opencode/plugins/reap-plugin.ts`, `AGENTS.md`, and slash commands at `~/.config/opencode/commands/`.
- **Early-close lifecycle path** — new lightweight termination from implementation/validation (`reap run early-close`, `/reap.early-close`). Preserves partial value, runs streamlined reflect, and auto-defers incomplete tasks to a new backlog item for the next generation. When users express stop or scope-reduction intent, the AI agent now offers abort/early-close/continue as three explicit options.

## OpenCode Setup

```bash
npm install -g @c-d-cc/reap

# In your project:
reap init                                # initializes with default agentClient: claude-code
# Edit .reap/config.yml — set agentClient: opencode
reap update                              # regenerates OpenCode-specific assets
```

`/reap.start`, `/reap.evolve`, `/reap.early-close`, and other slash commands work in OpenCode just like Claude Code.

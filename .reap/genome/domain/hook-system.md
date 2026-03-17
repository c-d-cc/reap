# Hook System

> Hook rules that are automatically executed on REAP lifecycle events

## Events

| Event | Trigger | Timing |
|-------|---------|--------|
| onGenerationStart | After `/reap.start` | Immediately after generation creation |
| onStageTransition | After `/reap.next` | Immediately after stage forward |
| onGenerationComplete | After `/reap.next` (archiving) | After git commit, changes uncommitted |
| onRegression | After `/reap.back` | Immediately after stage regression |

## Hook Types

### command
- Executes shell commands
- Runs in the project root directory
- Example: `reap update`, `npm run lint`

### prompt
- Text that instructs the AI agent
- The agent reads and decides how to execute
- Suitable for tasks requiring judgment (document updates, code reviews, etc.)
- Example: "Reflect this Generation's changes in the README"

## Execution Rules

- Hooks within the same event are executed sequentially in definition order
- Only one of command or prompt can be used (per entry)
- onGenerationComplete hooks run after commit → a separate commit is needed if there are changes

## Config Format

```yaml
# .reap/config.yml
hooks:
  onGenerationComplete:
    - command: "reap update"
    - prompt: "Update the README."
```

## SessionStart Hook (Separate)

- Registered in Claude Code's `~/.claude/settings.json` under `hooks.SessionStart` (separate from REAP project hooks)
- Injects REAP guide + generation state at every session start
- Automatically managed by `reap init`/`reap update`
- Migration from hooks.json to settings.json: automatically performed when running `reap update`

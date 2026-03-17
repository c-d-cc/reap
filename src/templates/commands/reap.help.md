---
description: "REAP Help — Contextual help based on current state"
---

# Help

Provide contextual help to the user based on the current REAP state.

## Steps

### 1. Read Current State
- Read `.reap/life/current.yml`
- Read `.reap/config.yml` for strict mode status

### 2. Contextual Guidance

**If no active Generation:**
- "No active Generation. To get started:"
- "  `/reap.start` — Start a new Generation with a goal"
- "  `/reap.evolve` — Start and run the full lifecycle autonomously"
- If there are items in `.reap/life/backlog/`, mention them

**If active Generation exists:**
- Show current generation ID, goal, and stage
- Show the next action: "Current stage is [stage]. Run `/reap.[stage]` to proceed, or `/reap.next` to advance."
- If in implementation stage with strict mode, note the planning scope restriction

### 3. Command Reference

Show available slash commands with brief descriptions:

| Command | Description |
|---------|-------------|
| `/reap.start` | Start a new Generation |
| `/reap.evolve` | Run the full lifecycle autonomously |
| `/reap.objective` | Define goal + requirements |
| `/reap.planning` | Task decomposition + plan |
| `/reap.implementation` | Code implementation |
| `/reap.validation` | Run tests + verify |
| `/reap.completion` | Retrospective + genome updates |
| `/reap.next` | Advance to the next stage |
| `/reap.back` | Return to a previous stage |
| `/reap.status` | Show current state |
| `/reap.sync` | Synchronize Genome with source code |
| `/reap.help` | This help |

### 4. Topic Help (Optional)

If the user provides a topic (e.g., `/reap.help workflow`), provide deeper explanation:

- **workflow** — Explain the 5-stage lifecycle in detail
- **commands** — Explain each slash command with examples
- **strict** — Explain strict mode, how to enable/disable, and escape hatch
- **genome** — Explain genome structure, immutability principle, and how to modify
- **backlog** — Explain backlog types, status management, and archiving rules

### 5. Configuration Info

- Show strict mode status (enabled/disabled)
- Show project name and entry mode
- Show total completed generations

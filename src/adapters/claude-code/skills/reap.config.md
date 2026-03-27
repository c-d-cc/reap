---
description: "REAP Config — View current project configuration"
---

Run `reap config` and display the configuration to the user.

The output JSON contains a `context` object with all config fields:
- `project` — project name
- `language` — configured language
- `autoSubagent` — whether subagent is auto-invoked
- `strictEdit` / `strictMerge` — strict mode settings
- `agentClient` — current agent client (claude-code, opencode, codex)
- `autoUpdate` — auto-update enabled
- `cruiseCount` — cruise mode counter (null if not in cruise mode)

Present the configuration in a readable format. If the user wants to change settings, guide them to edit `.reap/config.yml` directly.

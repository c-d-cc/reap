---
description: "REAP Evolve — Run the full lifecycle for a Generation"
---

Run `reap run evolve` and follow the stdout instructions exactly.

IMPORTANT: The subagent is the sole lifecycle executor. If it returns before completion (e.g., needing user input), use SendMessage to resume the same subagent after collecting the user's response. Never execute lifecycle commands directly.

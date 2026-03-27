---
description: "REAP Run — Execute a lifecycle command directly"
---

This command runs a specific REAP lifecycle stage or phase. Usage:

```
reap run <stage> [--phase <phase>] [options]
```

Common examples:
- `reap run start --goal "goal text"` — Start a new generation
- `reap run learning` — Begin the learning stage
- `reap run learning --phase complete` — Complete the learning stage
- `reap run completion --phase reflect` — Run completion reflect phase
- `reap run completion --phase fitness --feedback "text"` — Submit fitness feedback
- `reap run completion --phase adapt` — Run adapt phase
- `reap run completion --phase commit` — Archive to lineage
- `reap run back --reason "reason"` — Regress to previous stage
- `reap run abort` — Abort current generation (2-phase: confirm then execute)

Run the command the user specifies and follow the stdout instructions exactly.

If the output contains a `prompt` field, follow the prompt instructions to perform the stage work.

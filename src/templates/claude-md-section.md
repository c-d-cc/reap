
## REAP

This project uses REAP (Recursive Evolutionary Autonomous Pipeline).
All work must follow genome principles.

### Knowledge Loading

Session-start hook automatically injects all REAP knowledge (genome, environment, vision, memory, guide) into the session context.

If context was compacted and REAP knowledge was lost, re-run the hook:
```
/reap.knowledge reload
```

### Manual Reference (fallback)

If the hook did not run, read these files manually:

- `~/.reap/reap-guide.md` — REAP tool usage, architecture, lifecycle, rules
- `.reap/genome/application.md` — Project architecture, conventions, tech stack
- `.reap/genome/evolution.md` — AI behavior guide, evolution principles
- `.reap/genome/invariants.md` — Absolute constraints (never violate)
- `.reap/environment/summary.md` — Source structure, build, tests, design decisions
- `.reap/vision/goals.md` — Project goals
- `.reap/vision/memory/longterm.md` — Project origin, key design lessons
- `.reap/vision/memory/midterm.md` — Ongoing large tasks and unresolved issues
- `.reap/vision/memory/shortterm.md` — Recent session summary and next session tasks

### Agent

When delegating a generation to a subagent, use `subagent_type: "reap-evolve"`. Dynamic context (generation state, vision, memory) is passed via prompt parameters.

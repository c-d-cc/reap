
## REAP

This project uses REAP (Recursive Evolutionary Autonomous Pipeline).
All work must follow the genome principles.

### REAP Guide (must read at session start)

- `~/.reap/reap-guide.md` — REAP tool usage, architecture, lifecycle, rules

### Genome (must read at session start)

- `.reap/genome/application.md` — Project architecture, conventions, tech stack
- `.reap/genome/evolution.md` — AI behavior guide, evolution principles
- `.reap/genome/invariants.md` — Absolute constraints (never violate)

### Environment (must read at session start)

- `.reap/environment/summary.md` — Source structure, build, tests, design decisions (always loaded)
- `.reap/environment/domain/` — Domain knowledge (load on demand)

### Vision (must read at session start)

Long-term direction, goals, design documents, and project memory that accumulates across generations:

- `.reap/vision/goals.md` — Project goals (self-hosting, distribution, evaluator agent, etc.)
- `.reap/vision/design/` — Design documents for future features (load on demand)
- `.reap/vision/memory/longterm.md` — Project origin, key design lessons, v0.15→v0.16 differences (always loaded)
- `.reap/vision/memory/midterm.md` — Ongoing large tasks and unresolved issues (always loaded)
- `.reap/vision/memory/shortterm.md` — Recent session summary and next session tasks (always loaded)

### Agent

When delegating a generation to a subagent, use `subagent_type: "reap-evolve"`. This agent has the role, mindset, and rules for executing a REAP generation. Pass dynamic context (generation state, vision, memory) via the prompt parameter.

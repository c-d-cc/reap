
## REAP

This project uses REAP (Recursive Evolutionary Autonomous Pipeline).
All work must follow the genome principles.

### Genome (must read at session start)

- `.reap/genome/application.md` — Project architecture, conventions, tech stack
- `.reap/genome/evolution.md` — AI behavior guide, evolution principles
- `.reap/genome/invariants.md` — Absolute constraints (never violate)

### Environment (must read at session start)

- `.reap/environment/summary.md` — Source structure, build, tests, design decisions (always loaded)
- `.reap/environment/domain/` — Domain knowledge (load on demand)

### Quick Start

1. `reap status` — Check current state
2. `/reap.start` — Start a new generation
3. `/reap.evolve` — Run full lifecycle
4. `/reap.help` — Show available commands

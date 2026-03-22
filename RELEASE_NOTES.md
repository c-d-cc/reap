## What's New

- **Stage auto-transition** — `--phase complete` now automatically advances to the next stage. No separate `/reap.next` call needed. `/reap.next` remains as a fallback for manual transitions.
- **Phase nonce verification** — Nonce verification now also applies to phase transitions within a stage (work → complete), preventing AI from skipping work phases.
- **Token unification** — Simplified from 4 fields (`expectedTokenHash`, `lastNonce`, `lastPhaseNonce`, `expectedPhaseTokenHash`) to 2 fields (`lastNonce`, `expectedHash`). New `phase` field in `current.yml` tracks the current phase.
- **`reap clean` / `reap destroy`** — New CLI commands for project reset and REAP removal. `clean` provides interactive options for lineage, hooks, genome, and backlog. `destroy` requires explicit confirmation by typing `destroy <project-name>`.
- **Submodule commit rules** — Evolve subagent prompt now includes explicit instructions for committing dirty git submodules before the parent repo.

## Generations

- **gen-126-8d3c61**: Add reap clean and reap destroy commands
- **gen-127-e73a96**: lastNonce auto-read in reap.next
- **gen-128-9001c1**: next outputs nextCommand for auto-chaining to next stage
- **gen-129-b3e864**: E2E tests for reap clean and reap destroy
- **gen-130-428ef4**: Stage auto-transition with nonce verification
- **gen-131-141810**: Phase nonce verification
- **gen-132-cadeb8**: Unify token fields + add phase tracking
- **gen-133-19090f**: Update stage-token E2E for auto-transition
- **gen-134-beaedb**: Update docs for clean/destroy and auto-transition
- **gen-135-7e8f8a**: Add submodule commit rules to evolve subagent prompt

## v0.18.0

REAP is remade from a pipeline runner into a protocol and tool provider.

**Changed**

- Splits into two artifacts — the npm CLI `@c-d-cc/reap` and a Claude Code plugin. `reap setup` installs the plugin through the marketplace, which keeps it updated from then on
- Storage is three-tiered — `vision/` (what you intend), `life/` (what's alive now), `archive/` (what's no longer referenced)
- Work splits into three units — `loop` (creates a new intent), `milestone` (a plan cut into an executable unit), `generation` (exec/fix — actually evolves the code)
- `reap doctor` checks and reports what it can determine deterministically. It doesn't fix anything
- The code index (`reap index`) continues — 15 languages, nothing to install, no background process
- Six event hooks (`gen.made`, `gen.closed`, `milestone.made`, `milestone.closed`, `orch.claimed`, `orch.barrier.released`) plus `make hook`

**Removed**

- The five-stage lifecycle enforcement and its flow commands (`run start/next/back/abort/early-close`, the seven `/reap.*` commands)
- `/reap.evolve`'s autonomous subagent delegation — v0.18's `evolve` works directly in the main session
- The `merge`/`pull`/`push` lifecycle
- The `reap-evaluate` evaluator agent — independent verification before a generation closes is now a step in the `complete` skill
- The `status`/`config`/`check-version`/`uninstall` commands

### Coming from v0.17

On v0.17.7 and below, the session-start version check prints `npm i -g @c-d-cc/reap` instead of upgrading by itself. Run it, then `reap setup`, open a new session, and call `/reap:migrate` in each project. Original data stays intact under `.reap-v0_17/`.

### Good to know

- One install path: `npm i -g @c-d-cc/reap`, then `reap setup` for the plugin. Users on 0.17 aren't upgraded automatically — the session-start check prints the command instead
- English by default; set `config.language: ko` in `.reap/config.yml` to switch CLI output to Korean

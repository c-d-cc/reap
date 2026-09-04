## v0.18.0

REAP is remade from a pipeline runner into a protocol and tool provider.

**Changed**

- Splits into two artifacts — the npm CLI `@c-d-cc/reap` and a Claude Code plugin. The plugin installs and updates separately, through the marketplace
- Storage is three-tiered — `vision/` (what you intend), `life/` (what's alive now), `archive/` (what's no longer referenced)
- Work splits into three units — `loop` (creates a new intent), `milestone` (a plan cut into an executable unit), `generation` (exec/fix — actually evolves the code)
- `reap doctor` checks and reports what it can determine deterministically. It doesn't fix anything
- The code index (`reap index`) continues — 15 languages, nothing to install, no background process
- Six event hooks (`gen.made`, `gen.closed`, `milestone.made`, `milestone.closed`, `orch.claimed`, `orch.barrier.released`) plus `make hook`

**Removed**

- The five-stage lifecycle enforcement and its flow commands (`run start/next/back/abort/early-close`, the seven `/reap.*` commands)
- `/reap.evolve`'s autonomous subagent delegation — v0.18's `evolve` works directly in the main session
- The `merge`/`pull`/`push` lifecycle
- The `reap-evaluate` evaluator agent
- The `status`/`config`/`check-version`/`uninstall` commands

### Coming from v0.17

v0.17.7 and below auto-upgrade to 0.17.8 at session start. The upgrade agent that `reap update` installs on 0.17.8 installs the v0.18 CLI and plugin, then hands off to `/reap:migrate`. Original data stays intact under `.reap-v0_17/`.

### Good to know

- Ships on the npm `next` tag — not `latest`, so it doesn't reach existing users automatically. For a fresh install: `npm i -g @c-d-cc/reap@next`
- English by default; set `config.language: ko` in `.reap/config.yml` to switch CLI output to Korean

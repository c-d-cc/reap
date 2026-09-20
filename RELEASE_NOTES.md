## v0.18.0

REAP is remade from a pipeline runner into a protocol and tool provider.

**Changed**

- Splits into two artifacts — the npm CLI `@c-d-cc/reap` and a Claude Code plugin. `reap setup` installs the plugin through the marketplace, which keeps it updated from then on
- Storage is three-tiered — `vision/` (what you intend), `life/` (what's alive now), `archive/` (what's no longer referenced)
- Work splits into three units — `flux` (creates a new intent), `milestone` (a plan cut into an executable unit), `generation` (exec/fix — actually evolves the code)
- That first unit is named `flux`, not `loop`. A loop means going round; what the unit does is grow a plan. The word `loop` is left free for a different concept. There is no compatibility shim — `make loop`, `life/loops/` and `loop-NNNN-<type>` ids are simply gone
- `reap doctor` checks and reports what it can determine deterministically. It doesn't fix anything
- The code index (`reap index`) continues — 15 languages, nothing to install, no background process
- Six event hooks (`gen.made`, `gen.closed`, `milestone.made`, `milestone.closed`, `orch.claimed`, `orch.barrier.released`) plus `make hook`
- Record file names stay within Linux NAME_MAX — slugs are capped at 80 UTF-8 bytes, a `--slug` over 180 bytes is refused, and `doctor` reports any name in `.reap/` over 200 bytes (#32)
- Closing a generation checks `genome/` for staleness the same way it checks `environment/summary.md`, and it is where `--type genome` backlog gets consumed. Closing a milestone sweeps the genome once more, against the milestone rather than any one generation (#33)
- The handoff moved out of the milestone. It is now one file, `.reap/life/handoff.md`, with a section per session, so a generation with no milestone can leave one and a milestone closing no longer takes it away. It is written when you hand back to a person and only if the next session would be stuck without it — not on every close. A section you pick up gets deleted; that is what consuming it means
- Closing a generation no longer assumes the next session picks up. While items remain, `complete` sends you straight on to `evolve` instead of ending the turn with a summary, and a project can write that obligation into a `gen.closed` hook — nothing new is stored (#34)

**Removed**

- The five-stage lifecycle enforcement and its flow commands (`run start/next/back/abort/early-close`, the seven `/reap.*` commands)
- `/reap.evolve`'s autonomous subagent delegation — v0.18's `evolve` works directly in the main session
- The `merge`/`pull`/`push` lifecycle
- The `reap-evaluate` evaluator agent — independent verification before a generation closes is now a step in the `complete` skill
- The `status`/`config`/`check-version`/`uninstall` commands

### Coming from v0.17

v0.17 doesn't upgrade itself, and it doesn't announce v0.18 inside a session. Start it yourself with `npm i -g @c-d-cc/reap`, then `reap setup`, open a new session, and call `/reap:migrate` in each project. Until you migrate, v0.18 recognizes the old `.reap/` and refuses to write into it. Original data stays intact under `.reap-v0_17/`.

### Good to know

- One install path: `npm i -g @c-d-cc/reap`, then `reap setup` for the plugin. Users on 0.17 aren't upgraded automatically and aren't notified — upgrading is something they start themselves
- English by default; set `config.language: ko` in `.reap/config.yml` to switch CLI output to Korean

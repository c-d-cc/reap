# REAP

*Also available in [한국어](README.ko.md).*

REAP is a **set of protocols and tools** for AI and people to evolve software together. It does not dictate the shape of the work — it provides the tools and storage protocol the work can draw on.

Two things get built: a TypeScript/Bun CLI binary, `reap`, and a Claude Code plugin, `plugin/`, carrying the skills and SessionStart hook. The two install and update separately.

## Install

```bash
npm i -g @c-d-cc/reap
reap setup
```

That's the whole install. `reap setup` registers the plugin marketplace and installs the Claude Code plugin through the `claude` CLI — run it again any time; it only does what's missing. Check:

```bash
reap --version
```

Open a new Claude Code session and seven `/reap:` skills show up in the `/` menu, along with a status line at session start. If neither appears, run `reap setup` again and read what it reports.

## First use

In a project — a fresh folder or an existing codebase:

```
/reap:init
```

This sets up canonical knowledge: registering the plan source, `environment/summary.md`, `genome/`. From there:

```
/reap:evolve
```

opens a generation. When the work is done, the agent closes it — you don't call anything. The status line injected at the start of every session shows the current milestone, the open generation, where memory and ideas live, and where things sit on the storage map (`.reap/map.md`) — the agent decides what else to read from that map.

## Coming from v0.17

On v0.17.7 and below, the session-start version check sees 0.18 and prints `Breaking change detected … Run: npm i -g @c-d-cc/reap` instead of upgrading by itself. Run that command, then `reap setup`, open a new Claude Code session, and call `/reap:migrate` in each project — the old session hooks now reach the v0.18 CLI, which answers them with those same three steps. The migrate skill moves your data over in eight steps and keeps the original intact under `.reap-v0_17/` — reversible at every point.

### Language

REAP speaks English by default. Set `config.language: ko` in `.reap/config.yml` (or `REAP_LANG=ko` outside a project) to switch CLI output to Korean. Agent replies are separate from this — the injected status line carries a `Response language` line telling the agent which language to answer in, regardless of the CLI's own language.

What v0.18 drops:

- The five-stage lifecycle enforcement and its flow commands (`run start/next/back/abort/early-close`, the seven `/reap.*` commands) — flow is now a judgment call the skill makes
- `/reap.evolve` delegating an entire generation to an autonomous subagent — v0.18's `evolve` works directly in the main session
- The `merge`/`pull`/`push` lifecycle and its three slash commands — replaced by the `orchestrate` skill and direct git use
- The `reap-evaluate` evaluator agent
- The `status`/`config`/`check-version`/`uninstall` commands — replaced by the `ctx` status line, `doctor`, editing config directly, and removing the plugin

Full comparison: [docs/reap-plan/reap_v_0_18_release/01-gap.md](docs/reap-plan/reap_v_0_18_release/01-gap.md).

## Command surface

Skills are how an agent works with REAP. The plugin ships 10 — seven you can call from the `/` menu, three only the agent calls (hidden from the menu with `user-invocable: false`):

| skill | who calls it | when |
|---|---|---|
| [`init`](plugin/skills/init/SKILL.md) | you | Once per project, at the very start — sets up canonical knowledge |
| [`evolve`](plugin/skills/evolve/SKILL.md) | you | To open a generation — decides loop, exec, or fix |
| [`complete`](plugin/skills/complete/SKILL.md) | agent | To close a generation |
| [`loop`](plugin/skills/loop/SKILL.md) | you | To create a new intent — planning, design, screens, anything without a place yet |
| [`carve-milestone`](plugin/skills/carve-milestone/SKILL.md) | agent | To cut a plan into an executable milestone, and to close one |
| [`interview`](plugin/skills/interview/SKILL.md) | you | When intent is ambiguous enough that a person has to decide |
| [`orchestrate`](plugin/skills/orchestrate/SKILL.md) | you | When two or more sessions work on the same project at once |
| [`cleanup`](plugin/skills/cleanup/SKILL.md) | agent | Right after a person decides to close a milestone on fitness |
| [`migrate`](plugin/skills/migrate/SKILL.md) | you | To move v0.17 data into the v0.18 structure |
| [`report-issue`](plugin/skills/report-issue/SKILL.md) | you | When you hit a defect or missing feature in REAP itself |

The CLI command surface isn't transcribed here — run `reap` with no arguments for usage.

## Uninstall

```bash
claude plugin uninstall reap@ctod-plugins
npm rm -g @c-d-cc/reap
```

To strip REAP out of a project:

```bash
rm -rf .reap
```

## Development

```bash
bun install
bun test
bun run build       # dist/reap — bun build --compile
bun run build:node  # node bundle for npm distribution
```

To run the plugin locally and test a skill:

```bash
claude --plugin-dir ./plugin
```

The spec lives outside this repo, at [docs/superpowers/specs/reap/](docs/superpowers/specs/reap/README.md) — not here.

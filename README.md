# REAP

*Also available in [한국어](README.ko.md).*

REAP is a **set of protocols and tools** for AI and people to evolve software together. It does not dictate the shape of the work — it provides the tools and storage protocol the work can draw on.

Two things get built: a TypeScript/Bun CLI binary, `reap`, and a plugin, `plugin/`, carrying the skills and SessionStart hook. The two install and update separately. The plugin runs on both Claude Code and Codex.

## Install

```bash
npm i -g @c-d-cc/reap
reap setup
```

That's the whole install. `reap setup` detects the hosts on your PATH, registers the marketplace and installs the plugin. If both Claude Code and Codex are there, it sets up both. Run it again any time; it only does what's missing, and `reap setup --remove` undoes exactly that. Check:

```bash
reap --version
```

Open a new session and the skills and the status line show up. If neither appears, run `reap setup` again and read what it reports.

- **Claude Code** — eight `/reap:` skills in the `/` menu, and a status line at session start.
- **Codex** — ten skills called by name (`reap:evolve`), listed for the agent to choose rather than shown in a `/` menu. Codex does not run plugin hooks, so `reap setup` puts the status line straight into `~/.codex/hooks.json`. **Quit and reopen the app if it was already running** — a running app keeps the hook list it started with.

For an unpublished development checkout, install the working tree into every available host:

```bash
./scripts/local-install.sh
```

This builds and links the CLI, refreshes `reap@reap-dev` in Claude Code and Codex, and registers the Codex SessionStart hook. Re-run it after pulling changes. `--no-plugin` builds only the CLI. It does not require the release marketplace once the development plugin is installed.

If Codex reports that the hook needs review, open `/hooks` in the Codex CLI and review/trust the `reap ctx --hook` entry. Hook registration and hook trust are separate. In a new Codex task, ask “Use reap:init to initialize this project” or “Use reap:evolve to start this work.”

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

v0.17 doesn't upgrade itself to v0.18, and it won't tell you inside a session that v0.18 exists. If you are on v0.17.7 or below, the move is yours to start:

```bash
npm i -g @c-d-cc/reap
reap setup
```

Then open a new session in your host and call `/reap:migrate` in each project. Until you migrate, v0.18 recognizes the old `.reap/` and says so rather than writing into it — `ctx` and `doctor` point you here, and `make`, `mark` and `init` stop. The migrate skill moves your data over in eight steps and keeps the original intact under `.reap-v0_17/` — reversible at every point.

Your v0.17 slash commands keep working until you remove them, and the old session hooks now reach the v0.18 CLI, which answers them with those same steps.

### Language

REAP speaks English by default. Set `config.language: ko` in `.reap/config.yml` (or `REAP_LANG=ko` outside a project) to switch CLI output to Korean. Agent replies are separate from this — the injected status line carries a `Response language` line telling the agent which language to answer in, regardless of the CLI's own language.

What v0.18 drops:

- The five-stage lifecycle enforcement and its flow commands (`run start/next/back/abort/early-close`, the seven `/reap.*` commands) — flow is now a judgment call the skill makes
- `/reap.evolve` delegating an entire generation to an autonomous subagent — v0.18's `evolve` works directly in the main session
- The `merge`/`pull`/`push` lifecycle and its three slash commands — replaced by the `orchestrate` skill and direct git use
- The `reap-evaluate` evaluator agent — its role, a second pair of eyes before a generation closes, is now a step inside the `complete` skill
- The `status`/`config`/`check-version`/`uninstall` commands — replaced by the `ctx` status line, `doctor`, editing config directly, and removing the plugin

Full comparison: [docs/reap-plan/reap_v_0_18_release/01-gap.md](docs/reap-plan/reap_v_0_18_release/01-gap.md).

## Command surface

Skills are how an agent works with REAP. The plugin ships 10 — eight you can call from the `/` menu, two only the agent calls (hidden from the menu with `user-invocable: false`). Codex has no such distinction, so all ten are visible to the agent there:

| skill | who calls it | when |
|---|---|---|
| [`init`](plugin/skills/init/SKILL.md) | you | Once per project, at the very start — sets up canonical knowledge |
| [`evolve`](plugin/skills/evolve/SKILL.md) | you | To open a generation — decides flux, exec, or fix |
| [`complete`](plugin/skills/complete/SKILL.md) | agent | To close a generation |
| [`flux`](plugin/skills/flux/SKILL.md) | you | To create a new intent — planning, design, screens, anything without a place yet |
| [`carve-milestone`](plugin/skills/carve-milestone/SKILL.md) | agent | To cut a plan into an executable milestone, and to close one |
| [`interview`](plugin/skills/interview/SKILL.md) | you | When intent is ambiguous enough that a person has to decide |
| [`orchestrate` (Claude Code only)](plugin/skills/orchestrate/SKILL.md) | you | When two or more sessions work on the same project at once |
| [`migrate`](plugin/skills/migrate/SKILL.md) | you | To move v0.17 data into the v0.18 structure |
| [`report-issue`](plugin/skills/report-issue/SKILL.md) | you | When you hit a defect or missing feature in REAP itself |
| [`help`](plugin/skills/help/SKILL.md) | you | Where are we, what can I call, what next — re-shows the status line and suggests one action |

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

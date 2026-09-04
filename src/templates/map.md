# Map — the `.reap/` layout

For anyone, human or agent, seeing REAP for the first time. This is where you learn what each directory holds. The norm itself is owned by REAP's plan source (wherever `plan/conventions/` points) — this file doesn't copy it, and says only as much as opening this project's `.reap/` requires.

## What splits the top level is time, not type

```
vision/    what we intend — what we know (memory), the units we've carved (milestones)
life/      what's alive right now — generations, backlog, loops
archive/   what's no longer referenced — generations, milestones, backlog, loops, idea
```

**`plan/` stands at the top level outside this three-tier split** — a plan source is a registry pointing outside the repo, so it doesn't sit on the "intend / live / done" time axis. It sits alongside `genome/`, `environment/`, `idea/`. **`loop` is not here — it's `life/loops/`** — a loop opens, closes, and moves to archive, so it does sit on the time axis. It isn't a registry.

`vision/` stays referenced indefinitely unless it changes. `life/` isn't "what's open" — it's where **"what still has reference value"** accumulates: a closed generation stays there as long as it's still worth referencing. Closed is a *status*, archive is a *location*, and the two answer different questions. When a milestone closes, its whole directory moves to `archive/milestones/`, and that's when the `cleanup` skill sweeps `life/generations/` and sends the generations that have lost reference value down to `archive/generations/` separately — **the two archive directories don't contain each other.**

## Generations pile up in one place regardless of type

Just `life/generations/` (and `archive/generations/` once done). Not split into per-type folders — that would grow the top level every time a type is added. Instead:

- **Type lives inside the id** — `gen-<sequence>-<exec|fix>`. The sequence is one series regardless of type, so sorting by name is sorting by time. `gen-NNNN-plan` is history from before `loop-0001` — no more are issued
- **Milestone membership is the `milestone` field in frontmatter.** Only exec has this field. fix belongs to none

| Unit | What it does | Grounds |
|---|---|---|
| loop (`life/loops/`) | makes new intent — type `plan\|design\|uiux\|idea` | optional |
| exec generation | realizes an intent | milestone or backlog required |
| fix generation | restores an existing intent | none |

## What lives in each directory

- `vision/memory/` — just `lessons.md` (project-wide lessons). **A question closes, a lesson accumulates** — mixing them in one file keeps neither clean. Unresolved questions belong to `idea/research/`
- `plan/` — `sources.yml` (registered plan sources), `conventions/<ps-id>-<slug>.md` (how to read and write to that source)
- `life/loops/` — open loops and the 10 most recently closed ones (`Question`·`Dialogue`·`Dead Ends`·`Outcome`). Once it overflows, `mark loop --closed` sends the oldest to `archive/loops/`
- `vision/milestones/<ms-id>-<slug>/` — `milestone.md` (boundary and exit criteria), `handoff.md` (handoff to the next session), `tasks/<n>-<slug>.md` (task detail)
- `life/generations/` — generation records that still have reference value (open ones, and closed ones still worth reading). `cleanup` filters these when a milestone closes
- `life/backlog/` — items that still have reference value (undone ones, and consumed ones still worth reading). `cleanup` filters these down to `archive/backlog/`
- `genome/` — `application.md` (product identity and architecture), `evolution.md` (AI behavior rules), `invariants.md` (absolute constraints, human-edited only)
- `environment/` — `summary.md` (current tech stack, build, test), `source-map.md` (optional, code structure), `resources/` (adopted external specs)
- `idea/` — knowledge that isn't solid yet. `research/` (investigation, no conclusion) · `freememo/` (free notes) · `files/` (external reference material)
- `sequence/` — the id registry. One `<type>.md` per type, append-only
- `hooks/` — `{event}.{name}.{md|sh}`. There are only six events: `gen.made`·`gen.closed`·`milestone.made`·`milestone.closed`·`orch.claimed`·`orch.barrier.released`. `conditions/<c>.sh` holds condition scripts — `init` places `always.sh` (not part of the seed list)
- `templates/` — where this project overrides a bundled template (if present, it wins over the seed)

## id format

Everything with an id is `<id>-<slug>` (no exceptions). The id itself:

| Kind | Format | Example |
|---|---|---|
| milestone | `ms-<sequence>` | `ms-004-auth-session/` |
| loop | `loop-<sequence>-<plan\|design\|uiux\|idea>` | `loop-0001-plan-plan-loop.md` |
| generation | `gen-<sequence>-<exec\|fix>` | `gen-0002-exec-token-rotation.md` |
| backlog | `bk-<hash>` | `bk-a3f8c2-token-rotation-retry.md` |
| idea | `idea-<hash>` | `idea-a3f8c2-oauth-device-flow.md` |
| plan source | `ps-<hash>` | convention file `ps-4f2a91-reap.md` |

`sequence/<type>.md`, `hooks/{event}.{name}.{ext}`, and `tasks/<n>-<slug>.md` inside a milestone have no id, so they fall outside this rule.

A reference always carries an id — a slug changes when the title changes, so it never goes into a stored reference.

## This file itself

**It's a seed.** `init` places it only when absent, and leaves it alone once present — a project needs to be able to add its own particulars to this map. So this file doesn't change on its own when REAP changes the layout. When `doctor` flags a divergence from the bundled template, a human fixes it then.

**It isn't injected every session.** The status line only reports that it exists as `Structure: .reap/map.md`, and an agent that needs it opens it.

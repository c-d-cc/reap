---
name: help
description: Use when a person asks what REAP is doing right now, what they can call, or what to do next - re-shows the status line, lists the skills a person calls and the ones the agent calls on its own, and proposes the next action from the current state. Trigger on "help", "도움말", "지금 뭐 해야 하지", "reap 뭐 있어", "상태 보여줘", or /reap:help.
---

# help — orientation, on demand

This skill changes nothing. It answers three questions a person asks mid-session: **where are we, what can I call, what next.** Answer all three in one screen, in the person's language (the status line's `Response language` line).

## 1. Where are we — re-show the state

If the status line isn't in the session (compaction, a session that started before `.reap/` existed), get it now:

```bash
reap ctx
```

Show the block from `<!-- reap status -->` (or `<!-- reap 상태 -->`) to the end, verbatim. Don't summarize it — the paths in it are what the person navigates by. If there's no `.reap/`, say so; the only thing to call is `init`.

## 2. What can I call — the skill map

| A person calls | For |
|---|---|
| `init` | once per project — sets up the canonical knowledge |
| `evolve` | to start work — opens a loop, an exec generation, or a fix |
| `loop` | to make new intent — planning, design, screens, anything with no home yet |
| `interview` | when something is ambiguous and a person has to decide |
| `orchestrate` | two or more sessions on the same project |
| `migrate` | a v0.17 `.reap/` that must move to v0.18 |
| `report-issue` | a defect or missing feature in REAP itself |
| `help` | this |

| The agent calls on its own | When |
|---|---|
| `complete` | when the work is done — checks the commit rule, writes the outcome, closes the generation |
| `carve-milestone` | cutting a plan into a milestone, and closing one after the person's fitness answer |
| `cleanup` | right after fitness, before the milestone closes |

Those three don't appear in the `/` menu. A person triggers them by saying so — "close this generation", "let's close this milestone".

## 3. What next — read it off the state

| State | Suggest |
|---|---|
| No `.reap/`, or `init --check` still reports seeds | `init` |
| An open generation bound to this session | Continue it. When done, say so — the agent closes it |
| An open generation that isn't this session's | Don't touch it. If this is a second session, `orchestrate` |
| A focus milestone with tasks left | `evolve` — it reads `handoff.md` and picks the next task |
| An open loop and no startable milestone | `loop` — carry the intent forward, then carve |
| Nothing open | `loop` for new intent, or `evolve` to consume a backlog item |
| `doctor` reports defects | Fix those first — a defect is something deterministically wrong |

Give **one** suggestion, with the reason in a sentence. If two fit, say which you'd pick and why.

## What this skill doesn't do

- It doesn't open or close anything — that's `evolve` and `complete`
- It doesn't transcribe the docs. For concepts and reference, point to reap.cc; for CLI usage, `reap` with no arguments

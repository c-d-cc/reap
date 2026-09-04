---
name: orchestrate
description: Use when two or more Claude Code sessions work on the same REAP project at once - naming roles, splitting by worktree, claiming resources before touching them, placing barriers where work must sync, and coordinating via SendMessage. Trigger on "병렬", "세션 둘", "orchestrate", "동시에 작업", "역할 나눠", or when another session shows up in the roster or a claim conflict appears, in a repo containing .reap/.
---

# orchestrate — several sessions on one project

What REAP provides is only a **meeting place** — claiming resources (`claim`) and waiting for completion (`barrier`). Messaging belongs to the client (`SendMessage`·`ListAgents`), and REAP can't wake a session. The norm is owned by `07-orchestrate.md`.

## Alone, this skill doesn't exist

Without calling `orch`, nothing shows up on the status line or in `doctor`. This is only relevant when there's a signal that another session is working on the same repo (`reap-*` shows up in `claude agents`, a `claim` gets rejected, the status line's "open generation" isn't mine).

## 1. A role is an address — split by worktree

```bash
claude -n reap-<topic>-<role> -w <worktree>      # e.g. reap-auth-writer, reap-auth-tester
```

- `<topic>` decides the shared-state room (`~/.reap/orch/<workspace-id>/<topic>/`). workspace-id **converges across worktrees** (confirm with probe) — the room doesn't split
- **Two sessions in the same directory don't work.** `.reap/.session` (generation binding) is one file, so the later session overwrites the earlier one. Each worktree has its own `.reap/`, so splitting by worktree avoids the problem. This was the only parallel problem actually hit
- **The coordinator issues ids from the main tree.** Each worktree's `.reap/` is a copy, so calling `make generation` from two places issues the same number twice (it actually collided — see `lessons.md`). The coordinator opens the generation, commits, then creates the worktree, and the worktree's session only does `reap bind <gen-id>`. Confirm tool behavior in a throwaway repo — calling `make` from a worktree leaves a registry row
- If the repo has a submodule (e.g. `tests/`) checked out in the worktree, plain `git worktree remove` fails with "working trees containing submodules cannot be moved or removed" — use `git worktree remove --force`
- To announce a session's name to `orch`, set `REAP_AGENT=reap-<topic>-<role>` in the environment. Without it, the session id is the address — `roster` can't find it by name

## 2. Claim before touching

```bash
reap orch claim <resource> [--ttl 30m] [--topic <t>]
reap orch release <resource>
```

`resource` is a free-form string — **without a shared convention, two sessions claim the same thing under different names.** Write this project's convention in `handoff.md` or the first message. Two defaults: a milestone branch by id (`ms-004`), a file area by path glob (`src/auth/**`).

**TTL exists for when a session dies.** Once it expires, someone else can take it, and a takeover shows up in `log.jsonl`. The longer it's held, the longer a dead session blocks it — one generation's length (30m-2h) is enough. Renewing is just re-`claim`ing the same resource.

**If rejected, wait or say something.** Ask the holder with `SendMessage`. Waiting out the expiry to take it over is only for when the other side is judged dead.

## 3. Put a barrier where things must merge

```bash
reap orch barrier <name> --expect <N> --timeout <seconds>
```

**`--timeout` is required.** Once it expires, it reports who didn't show up (a name if roster knows it, a count if not) — waiting forever for a participant who never arrives is the worst way parallel work fails.

Barriers go **where later work presupposes all the earlier work is done** — before testing, before an integration commit, before closing a milestone. Overused, parallel work turns serial.

## 4. Message convention

Write the kind on the first line of a `SendMessage` body. The tool doesn't check it — it just needs to let the reader classify it by that first line.

| kind | Meaning |
|---|---|
| `claim-request <resource>` | asking to release what's held |
| `done <what>` | my share is finished — also means arrival at a barrier |
| `blocked <why>` | stuck. the coordinator reassigns |
| `ask <question>` | judgment is needed |

If you need to know when the other side finishes, use `SendMessage(notify_when_idle: true)`. Subscribing without a message costs the other side nothing.

## 5. Coordinator pattern

With three or more sessions, one is the coordinator — splitting the branches (pinning them down with `claim`), deciding and announcing barrier names and `--expect`, watching things with `orch status`/`roster`. The coordinator can carry its own share of code too, but it has to be **the one place that knows the barrier's `--expect`.** If two use different Ns, one waits forever.

## Checking status

```bash
reap orch roster [--topic <t>]     # just reap-<topic>-* from claude agents --json
reap orch status [--topic <t>]     # claims · barriers
```

If `roster` comes back empty, either there's no session or `claude agents` couldn't be read — the tool can't tell the two apart and says so.

## When done

`release`, then close the generation with `complete`. A leftover claim disappears once its TTL passes — but leaving without releasing blocks others for that whole time.

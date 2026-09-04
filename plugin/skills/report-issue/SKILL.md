---
name: report-issue
description: Submit a bug report or feature request to the REAP project (c-d-cc/reap) from any project that uses REAP. Decides whether the problem is REAP's or this project's, writes an issue the REAP repo can act on (repro, expected, actual, versions, layout facts) without leaking this project's code or paths, and files it with gh - or hands the body to the human when gh is unavailable. Trigger on "REAP 버그", "reap 이슈 올려", "report-issue", "REAP에 기능 요청", or when a REAP tool or skill behaves against its spec.
---

# report-issue — files a bug or feature request to REAP

This is the channel that stops a defect hit while using REAP from either sitting in this project's backlog or getting forgotten — the path all the way to the REAP repo (`c-d-cc/reap`).

## First: whose problem is it

**REAP's** — the `reap` binary behaves differently from its spec, a plugin skill contradicts another or points at something that doesn't exist, `ctx` loads the wrong thing or drops something, a hook blocks session start (violating `invariants.md`), a storage convention doesn't hold in this project, a command/skill/convention that would be nice to have.

**This project's — not an issue.** What to write in genome, a milestone, or backlog is a judgment call, this project's code being broken, the content of a plan source. That's `make backlog` or a loop.

**When unsure, write it to this project's backlog first, and file it once it's certain to be REAP's.** A misfiled issue gets closed by the REAP side as "can't reproduce," and that round trip is the most expensive kind.

## Confirm reproduction first

Before writing the issue, check whether it **reproduces with one command.** If it does, that command and its output are the issue body. If it doesn't reproduce, write only what was seen and **don't hide the "doesn't reproduce"** — don't pretend to have verified something that can't be verified.

For a feature request, the body is **what was missing and what couldn't be done because of it.** Write the blocked point, not the desired solution.

## What goes in, what doesn't

**Goes in** — all facts REAP itself owns.

```bash
reap --version                                  # the binary
grep version "$(ls -d ~/.claude/plugins/cache/*/reap/*/ 2>/dev/null | tail -1).claude-plugin/plugin.json"   # plugin (if none, "no plugin")
ls .reap                                        # layout (file names only)
```

Add to that the repro command, expected vs. actual, related spec document names (like `04-commands.md`), and which skill this happened inside.

**Doesn't go in** — this project's source code, absolute paths outside the repo, the **body** of genome/milestone/backlog/loop, plan source content, a person's name or email. A file *name* is fine, its *content* isn't. REAP issues live in a public repo.

## File it

```bash
gh issue create --repo c-d-cc/reap --title "<one line>" --body-file <temp file> [--label bug|enhancement]
```

The title is **the symptom** — "`mark loop --closed` overwrites milestones," not "loop bug." Body format:

```
## What (expected / actual)
## Repro
## Environment — reap <version> · plugin <version> · layout
## Where — which skill/command, related spec
```

**If `gh` is missing or unauthenticated, give the body to the human as is** — show the title and body on screen and say where to file it (`https://github.com/c-d-cc/reap/issues/new`). Don't fail silently or invent another way.

## Leave a record

Leave the filed issue's URL as **this project's backlog item** — `make backlog --type reap-issue --title "<title> (#<number>)"`. Two reasons: once REAP fixes it, this project needs to catch what it has to redo, and if a temporary workaround exists, there needs to be a place to revert it. If a workaround was made, note it in that item.

**Whether REAP closed it isn't tracked.** Check next time this item comes up, after a `localUpdate` or a plugin update.

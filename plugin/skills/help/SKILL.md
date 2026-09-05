---
name: help
description: Use when a person asks what REAP is doing right now, which skills they can call, or what to do next - reads the status line, shows the current state in a tidy form, lists the skills a person can call, and proposes the next action. Trigger on "help", "도움말", "지금 뭐 해야 하지", "reap 뭐 있어", "상태 보여줘", or /reap:help.
---

# help — orientation, on demand

This skill changes nothing. It answers three questions in one screen, in the person's language (the status line's `Response language` line). Use exactly three headings — **current state · skill list · next** (현재 상태 · skill 목록 · 다음) — nothing else.

## 1. Current state — read the status line, show it tidied

Get the state with `reap ctx` if the status line isn't in the session (compaction, a session that opened before `.reap/` existed). Then **don't paste the block** — it carries an HTML comment marker and paths meant for the agent. Render it as a short list, one line per item, only the items that exist:

```
현재 상태
- milestone: ms-027 v0.17에서 빠진 셋 복원 (focus, open) — tasks 3
- 열린 세대: 없음
- 열린 loop: loop-0004-plan v0.18 완성과 출시
- 작업 트리: 깨끗함 · doctor: 결함 0
```

Rules for the list:
- `milestone`, `열린 세대`, `열린 loop` come from the status line. Omit a line whose item doesn't exist, except `열린 세대`, which reads "없음" — that absence is the most useful fact
- `작업 트리` is `git status --porcelain` (깨끗함 / N개 변경), `doctor` is the `결함 N` line from `reap doctor`. Both are one command each; run them
- No paths, no markers, no `응답 언어` line. If the person needs a path, they'll ask
- If there's no `.reap/`, the whole section is one line: "REAP 프로젝트가 아닙니다 — `init`부터"

## 2. Skill list — only what a person can call

| skill | for |
|---|---|
| `init` | once per project — sets up the canonical knowledge |
| `evolve` | to start work — opens a loop, an exec generation, or a fix |
| `loop` | to make new intent — planning, design, screens, anything with no home yet |
| `interview` | when something is ambiguous and a person has to decide |
| `orchestrate` | two or more sessions on the same project |
| `migrate` | a v0.17 `.reap/` that must move to v0.18 |
| `report-issue` | a defect or missing feature in REAP itself |
| `help` | this |

Render it as this table, translated. **Don't list `complete`, `carve-milestone`, or `cleanup`** — they're the agent's and don't appear in the `/` menu. One sentence under the table is enough: closing a generation or a milestone is something the agent does when the person says the work is done.

## 3. Next — one suggestion, read off the state

| State | Suggest |
|---|---|
| No `.reap/`, or `init --check` still reports seeds | `init` |
| An open generation bound to this session | Continue it. When done, say so — the agent closes it |
| An open generation that isn't this session's | Don't touch it. If this is a second session, `orchestrate` |
| A focus milestone with tasks left | `evolve` — it reads `handoff.md` and picks the next task |
| Every open milestone is waiting on the person (fitness, review) | Say which, and what one check would settle them |
| An open loop and no startable milestone | `loop` — carry the intent forward, then carve |
| Nothing open | `loop` for new intent, or `evolve` to consume a backlog item |
| `doctor` reports defects | Fix those first — a defect is something deterministically wrong |

Give **one** suggestion with the reason in a sentence. If two fit, say which you'd pick and why.

## What this skill doesn't do

- It doesn't open or close anything — that's `evolve` and `complete`
- It doesn't transcribe the docs. For concepts and reference, point to reap.cc; for CLI usage, `reap` with no arguments

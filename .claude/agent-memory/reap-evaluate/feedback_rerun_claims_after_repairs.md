---
name: rerun-claims-after-repairs
description: In multi-round reviews, re-run the reproduction commands recorded in earlier artifact sections — a later round's repair can falsify an earlier round's verified claim in the same file
metadata:
  type: feedback
---

When reviewing a generation that has already had one or more evaluator rounds, do not
trust any `[실행]` claim written *before* the latest repairs. Re-run the exact command
the artifact prints.

**Why:** in gen-095 the round-0 validation section proved "every `src/` change is a
comment" with a printed pipeline that returned 0 lines. A round-1 repair then edited
`src/templates/reap-guide.md` — markdown under `src/` — and the same command returns 2
lines. The same section also said "the only `src/` file this generation touched is
`src/indexer/index.ts`", while the round-1 log five sections below listed five more.
Nobody re-ran it, because the repair and the claim were in the same document and the
builder's own self-audit only re-counted the *new* section.

**How to apply:** for every artifact section that quotes a command and a result, run the
command yourself and diff the result. Prioritise sections written before the newest
repair log. The same applies to committed prose that a repair *disowned* elsewhere:
grep for the discredited argument across the tree — the copy in a test-file header
outlives the copy in the learning artifact.

Related: [[inherited-worktree-review]], [[negative-test-discrimination]]

**Extension — recompute NUMBERS in prose, not only commands.** A magnitude quoted
as justification ("the shortest page is 1,645 characters, so this is not a close
call"; "against the live site — 14 failures") is a measurement, and a later repair
in the same round can falsify it while every test stays green. In gen-096 round 3
both of those were stale: 1,645 was the `#root` figure from the *defeated* first
version of the check and the `<main>` version measures 1,207; the live-site count
had moved 14 → 18 in a paragraph that itself explained why such a number goes
stale. Recompute every figure a comment offers as evidence — it costs one command
and it is where this repository's recurring stale-prose defect actually lands.

**And for UX/redirect behaviour, drive a real browser.** Headless Chrome plus
node's built-in `WebSocket` over CDP needs zero dependencies:
`--headless=new --remote-debugging-port=N`, then `Emulation.setUserAgentOverride
{acceptLanguage}` to set `navigator.language`. That is how the gen-096 redirect
defect was found — the builder's own browser table tested only the sequence that
began at `/`, so the flag was always already set. Vary the ENTRY point, not just
the actions.

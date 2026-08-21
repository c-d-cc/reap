---
name: inherited-worktree-review
description: When a generation inherits an aborted worktree, review staged deletions (git diff --cached) separately — builders read `git diff` and miss them
metadata:
  type: feedback
---

When a REAP generation inherits a working tree from an aborted attempt, always
run `git diff --cached --stat` and `git status --short` yourself before trusting
the builder's "I read the whole inherited diff" claim.

**Why:** gen-095 inherited an aborted worktree and wrote in `01-learning.md`
that it had read the inheritance in full — via `git diff -- src/ .github/
package.json`. That command cannot show staged deletions. 5,364 lines of
deleted design documents were staged (`D` in the index) and appear in no
artifact: no judgment row, no task, no validation item. The learning-phase
residue grep also could not see them, because deleted files produce no grep
hits — so the omission was self-concealing.

**How to apply:** two checks, both cheap.
1. `git diff --cached --stat` — anything large here that the artifacts never
   name is unreviewed by definition.
2. For each deleted path, `grep -rn "<path>" .reap/life/backlog .reap/vision`
   — live pending backlog items and design docs cite each other by path, and a
   deletion leaves the pointer dangling with nothing to make it red.

Related: [[negative-test-discrimination]].

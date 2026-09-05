# verify brief — {{gen-id}}

You are verifying a generation someone else did. **You don't edit anything** — you read, run, and report.

## Read (in this order)

1. `.reap/life/generations/{{gen-id}}-*.md` — the Intent (what "done" was supposed to mean) and the Outcome (what the author says was done)
2. `git diff {{startCommit}}..HEAD --stat`, then the diff itself for the files that matter
3. {{tests or checks to run — commands, as written}}

## Working tree

`{{repo path}}` (absolute). Read-only. Don't create files, don't commit, don't call `reap`.

## Answer these, each in a line or two

1. **Intent met?** Which items of the Intent are done, which aren't, which were done differently than stated
2. **Tests** — what you ran, pass/fail counts, and what the tests *don't* cover among the changed paths
3. **Regressions** — anything the diff touches that the Intent didn't mention, and whether it still behaves as before
4. **Loose ends** — stale comments, dead code, a doc or message the change made wrong
5. **Verdict** — close as is / close with these backlog items / don't close yet, because …

Be specific: file and line, command and output. "Looks fine" isn't a finding.

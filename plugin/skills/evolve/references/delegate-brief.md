# delegate brief — {{gen-id}}

## Read (in this order)

1. `.reap/genome/*.md`
2. `{{path to milestone.md}}`
3. `{{path to task}}`
4. `.reap/life/generations/{{gen-id}}-*.md` — this generation's Intent
5. {{anything else this work needs — as paths only}}

## Scope

{{this generation's Intent, as written. reorder or split it freely}}

## Working tree

`{{worktree or repo path}}` (absolute path). **Don't touch anything outside it.**

## Discipline

- Use absolute paths. Directories outside this tree are off-limits
- Don't call `reap make`/`reap mark` — issuing ids and session binding belong to the main session
- Inside `.reap/`, touch only this generation's record file and (if it belongs to a milestone) `handoff.md`. Everything else is off-limits
- Write tests first — a failing test before the implementation
- Don't pipe verification commands. Take the exit code directly
- If you changed source, rebuild. Same after reverting
- Don't write "why it looks this way" in comments
- Split commits by meaning. Messages in Korean, saying what changed and why
- Don't `git push`, `git rebase`, or `git commit --amend`

## When done

- Write `## Outcome` in the generation record (what was done and what's left). Add `## Dead Ends` too if any approach was folded
- **Don't close the generation** — don't call `mark generation --closed`. Review and closing are the main session's job
- End with `git status --porcelain` empty

## Report

- List of commit hashes made
- Tests: how many passed, how many failed
- What's left — what wasn't done from the Intent, what the next session should see

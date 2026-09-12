---
name: reap-upgrade
description: Guided upgrade from REAP v0.17 to v0.18. Installed into ~/.claude/agents/ by `reap update` when v0.18 is available on the npm `next` tag. Verifies preconditions, installs v0.18, then hands the project migration to the v0.18 plugin's migrate skill.
---

<!-- RETIRED — do not follow these steps.

     This file was fetched by 0.17.8's `reap update` from main. 0.17.8 was
     retired by human decision on 2026-09-05 and never published, so nothing
     fetches this and it was never placed on main (the URL 404s).

     Four things below are wrong for v0.18 as it actually ships:
       1. The frontmatter premise — v0.18 is on `latest`, not the `next` tag
       2. Step 2 installs `@c-d-cc/reap@next` — that tag does not exist
       3. Step 3 has the user type the marketplace and plugin commands by hand —
          v0.18's single install path is `reap setup`, which does both
       4. Step 3 expects 10 `/reap:*` skills — eight are user-invocable; two
          (`complete`, `carve-milestone`) are hidden

     The real v0.17 to v0.18 path is: `npm i -g @c-d-cc/reap`, then `reap setup`,
     then `/reap:migrate` in each project. v0.18 owns it. -->

# REAP v0.17 → v0.18 upgrade agent

You perform a guided, **all-or-nothing** upgrade. At every step: if the step
fails, STOP, print the manual command for that step, and change nothing
further. Never continue in a half-upgraded state.

The project's data is not touched until step 4 — and step 4 (the migrate
skill) isolates the original as `.reap-v0_17/` before writing anything, so the
upgrade is reversible at every point.

## 1. Preconditions — verify, don't assume

- The project has a v0.17-era `.reap/` (old layout: `memory/` tiers,
  `lineage/`, `life/current.yml`). If it is already the v0.18 layout
  (`map.md`, `vision/`·`life/`·`archive/`), say so and stop — nothing to do.
- `git status --porcelain` is empty. Otherwise ask the user to commit or
  stash first, and stop.
- `node` and `npm` respond. Otherwise print what is missing and stop.

## 2. Install v0.18

```bash
npm install -g @c-d-cc/reap@next
reap --version   # must report 0.18.0 or above
```

On any failure (network, permissions, version still 0.17.x): STOP and print
the manual path — `npm install -g @c-d-cc/reap@next` — with the error you saw.
Note for the user: the old v0.17 slash commands remain installed until the
migration's cleanup step offers to remove them; duplicates in the meantime are
harmless.

## 3. Install the v0.18 plugin

v0.18 ships its skills as a Claude Code plugin (the CLI alone has no skills).

```bash
claude plugin marketplace add c-d-cc/plugins
claude plugin install reap@ctod-plugins
```

Both commands require the user's interactive approval, which you cannot give
for them — ask the user to run or approve them. On any failure, STOP and
print the two commands above as the manual path.

Verify: a **new** Claude Code session must show 10 `/reap:*` skills and a
SessionStart status line. If neither appears, the plugin install did not
take — ask the user to check `claude plugin marketplace add c-d-cc/plugins`
and `claude plugin install reap@ctod-plugins` ran without error before
continuing.

## 4. Migrate the project

In the project, invoke the v0.18 plugin's **migrate skill** (`/reap:migrate`)
and follow it exactly. It owns detection, the uncommitted/open-generation
blocks, the token-cost notice, the `.reap-v0_17/` isolation, the subagent-run
data migration, `reap doctor` verification, and the written record at
`.reap/archive/migration-v0_17.md`.

## 5. Finish

- Confirm with the user that `reap doctor` reported zero defects and the
  record file exists.
- Home-asset cleanup (old slash commands, old agents, settings entries — and
  this agent file itself) is offered by the migrate skill's final step; it is
  the user's choice.

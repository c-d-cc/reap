---
name: migrate
description: Use when a project carries v0.17-era REAP data - a .reap/ with the old 5-stage pipeline layout (memory tiers, lineage/, current.yml) - and it must move to the v0.18 layout. Detects the old structure, blocks on uncommitted changes or an open generation, isolates the original as .reap-v0_17/, migrates data via a subagent, verifies with doctor, and leaves a written record. Trigger on "migration", "v0.17에서 왔다", "구 reap 프로젝트", "이주", or when the reap-upgrade agent hands over after installing v0.18, in a repo whose .reap/ shows the old structure.
---

# migrate — moves v0.17 to v0.18

**Non-destruction of the original is invariant.** No step in this skill modifies the old data — the old data only relocates, whole, to `.reap-v0_17/`, and it can be reverted any time that directory exists.

## The procedure is eight steps — show "Step N/8: <name>" to the user at the start of each

1. verdict · 2. pre-block · 3. notice and consent · 4. isolation · 5. new structure · 6. migration (subagent) · 7. verification · 8. record and home cleanup guidance

## 1/8 — Verdict: a script does it, before any file moves

**By human directive (2026-09-01), the verdict is owned by a script** — anything that must not depend on probability belongs to a script.

```bash
bash <this skill's directory>/scripts/detect-version.sh <project root>
```

The first line is the verdict, the next lines are the grounds (the list of marker files hit). **Show the grounds line to the user verbatim.**

| Verdict | Meaning | Next |
|---|---|---|
| `v017` | Hits files only present in 0.17 (`lineage/`, `shortterm.md`, `current.yml`, v0.17-convention (onXxx) hook files inside `hooks/`, `sequence/goal.md`) | proceed to 2/8 |
| `v018` | Hits files new to 0.18 (`map.md`, `sequence/generation.md`) | **nothing to migrate** — stop |
| `none` | No `.reap/` | not this skill's job — `init` |
| `mixed` | Both sides' markers hit together — half-migrated or contaminated | **stop and go to a human**, with the grounds line for what was hit |
| `unknown` | `.reap/` exists but neither side's markers are present — v0.15/0.16, or corrupted | **stop and go to a human** |

**Sharing a name doesn't make it a marker** — `sequence/` and `vision/milestones/` exist on both sides (v0.17 has `sequence/goal.md`·`milestone.md`, v0.18 has `sequence/generation.md`). `config.yml`'s `agentClient`·`language` also exist on both. `hooks/` exists on both too — v0.18's `init` also places `hooks/conditions/always.sh`. The script owns that distinction so the skill and agent don't re-judge it by eye.

## 2/8 — Pre-block: don't proceed if either one hits

- **Block if there's an uncommitted change.** `git status --porcelain` has to be empty. Don't do an irreversible move on a dirty tree — tell them to commit or stash and call again, then stop. If it's not a git repo, say so, and proceed **only with the human's explicit approval** (there's no safety net besides reverting the isolation)
- **Block if there's an open generation.** If `life/current.yml` exists and its stage is in progress, either close it with the old reap (`reap run abort` or completion), or if that's not possible, proceed only after getting the human's confirmation that they're aware. Don't swap out the store on top of a half-run generation — same principle as uncommitted state

## 3/8 — Notice and consent: say everything before starting

Three things to show before getting consent:

- **The list of steps** (the eight above) and how much each will handle in this project (memory file sizes, lineage count, backlog count, environment file count, **design document count** — `find vision/design -type f | wc -l`, files not directories — **the last lineage generation's id**, and **whether `CLAUDE.md` has a `## REAP` section** — measured at the level of `ls | wc -l`)
- **Token notice**: migration reads and sorts through all of memory and the records, so **token usage can be very large**
- **The non-destruction promise**: the original stays entirely, just renamed to `.reap-v0_17/`, and reverting is one `mv`

Don't move to step 4 without explicit consent.

## 4/8 — Isolation: rename to cut off conflicts at the source

```bash
git mv .reap .reap-v0_17    # if git-tracked. otherwise: mv .reap .reap-v0_17
```

- **Don't put a dot in the name** (`.reap-v0.17` is forbidden) — tools and globs misread it as an extension
- gitignored outputs like `.reap/.index/`·`.session-state.md` follow the directory too — don't write to either the fingerprint or the migration, leave them as is
- **Reverting**: delete the new `.reap/` and `mv .reap-v0_17 .reap`. As long as this one line holds, a failure is still reversible — show this sentence to the user too

## 5/8 — New structure

Set up a new `.reap/` with `reap init`. Carry `config.yml`'s `language`·`agentClient` over from the old config's values — those two are the only user settings present on both sides.

**`language`'s format differs** — v0.17 uses a word (`korean`), v0.18 uses an ISO code. Convert: korean→ko · english→en · japanese→ja · chinese→zh-cn · spanish→es · french→fr · german→de · portuguese→pt. If it's not in the table, leave it as is and note it in the record file. (Friction caught by real-world verification gen-0073)

## 6/8 — A subagent does the migration

Don't fill the main session's context with old data — **the mapping table and instructions are in [migration-map.md](references/migration-map.md), and that whole document is handed to a subagent to carry out.** For mappings 1-9, the confirmed grounds are ps-4b485d's 04-migration-skill.md; for environment (10), it's 04-migrate-docs.md; for the working-state mappings 1·2·3·5·6·11·12, it's ms-024's `tasks/1-skill-revision.md` and selfview's real first-pass trace. Twelve mappings total.

## 7/8 — Verification (working-state check)

`reap doctor` has to come back at **zero defects.** If defects show up, fix them and run again — don't move to step 8 until it passes. Also check that `.reap-v0_17/` is untouched (`git status` should show no changes inside it).

Structure alone isn't enough — run the working-state check too, the automatable half of "would the next session know how to continue if the original were deleted":

```bash
bash <this skill's directory>/scripts/verify-migration.sh <project root>
```

Every line has to read `ok:` — a single `FAIL:` line means mapping #1, #2/#11, or #12 was skipped or done wrong; go back and fix it, then run again. Don't move to step 8 until this script also exits 0. Put its full output in the record file's `## 검증`, right after the doctor output.

## 8/8 — Record and home cleanup guidance

The format for the record file (`archive/migration-v0_17.md`) and the allowlist for home asset cleanup are in the back half of [migration-map.md](references/migration-map.md) — the `doctor` and `verify-migration.sh` outputs both have to be in the record for this to be complete, and home cleanup happens only after the list is approved.

**Add a `## 다음 세션이 볼 것` section** — the full text of `reap ctx`'s status line block (everything from `<!-- reap 상태 -->` to the end of its output), pasted verbatim. This is the literal answer to "does the next session know how to continue if `.reap-v0_17/` is deleted" — show it to the human alongside the record file.

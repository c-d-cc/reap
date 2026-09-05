---
name: migrate
description: Use when a project carries v0.17-era REAP data - a .reap/ with the old 5-stage pipeline layout (memory tiers, lineage/, current.yml) - and it must move to the v0.18 layout. Detects the old structure, blocks on uncommitted changes or an open generation, isolates the original as .reap-v0_17/, migrates data via a subagent, verifies with doctor, and leaves a written record. Trigger on "migration", "v0.17에서 왔다", "구 reap 프로젝트", "이주", or right after v0.18 was installed over a v0.17 setup (the CLI's own hint after `reap setup` points here), in a repo whose .reap/ shows the old structure.
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
- **Block if `reap` isn't on PATH.** `command -v reap` has to succeed and `reap --version` has to be 0.18 or later — 5/8 (`init`) and 6/8 (`make`) both call it, and finding that out after 4/8 has already moved the store is the worst place (real trace: selfview 2026-09-05, stopped at 5/8 after `git mv`). If it's missing, print the install line and stop:

  ```
  npm i -g @c-d-cc/reap && reap setup
  ```

  A binary that isn't on PATH but exists at a known path (a dev build) is fine — export `REAP_BIN=<path>` and use it for every `reap` call below, including inside the scripts
- **Block if there's an open generation.** If `life/current.yml` exists and its stage is in progress, either close it with the old reap (`reap run abort` or completion), or if that's not possible, proceed only after getting the human's confirmation that they're aware. Don't swap out the store on top of a half-run generation — same principle as uncommitted state

## 3/8 — Notice and consent: say everything before starting

Three things to show before getting consent:

- **The list of steps** (the eight above) and how much each will handle in this project. **A script measures it** — don't count by eye (real trace: the agent counted `vision/backlog` and told the human "0 items" when `life/backlog/` held 8):

  ```bash
  bash <this skill's directory>/scripts/measure.sh <project root>
  ```

  Show its output verbatim — memory sizes, live goals lines, lineage count and last id, `life/backlog/` count, open milestones, design files, environment files, hook files, config language·agentClient, whether `life/current.yml` exists, and whether `CLAUDE.md` has a `## REAP` section. Each line maps to a step or a mapping number, so the human sees what each step will touch
- **Token notice**: migration reads and sorts through all of memory and the records, so **token usage can be very large**
- **The non-destruction promise**: the original stays entirely, just renamed to `.reap-v0_17/`, and reverting is one `mv`

Don't move to step 4 without explicit consent.

## 4/8 — Isolation: rename to cut off conflicts at the source
**Before moving, `.reap-v0_17/` must not exist.** A leftover from an earlier attempt (ignored files such as `.index/` survive `git checkout`) makes `git mv` nest the store as `.reap-v0_17/.reap/`. If it exists, stop and tell the user: remove it (`rm -rf .reap-v0_17`) only if it is a leftover, never if it holds the real original.


```bash
git mv .reap .reap-v0_17    # if git-tracked. otherwise: mv .reap .reap-v0_17
```

- **Don't put a dot in the name** (`.reap-v0.17` is forbidden) — tools and globs misread it as an extension
- gitignored outputs like `.reap/.index/`·`.session-state.md` follow the directory too — don't write to either the fingerprint or the migration, leave them as is
- **Reverting**: delete the new `.reap/` and `mv .reap-v0_17 .reap`. As long as this one line holds, a failure is still reversible — show this sentence to the user too

## 5/8 — New structure

Set up a new `.reap/` with `reap init`. Carry `config.yml`'s `language`·`agentClient` over from the old config's values — those two are the only user settings present on both sides.

**`language`'s format differs** — v0.17 uses a word (`korean`), v0.18 uses an ISO code. Convert: korean→ko · english→en · japanese→ja · chinese→zh-cn · spanish→es · french→fr · german→de · portuguese→pt. If it's not in the table, leave it as is and note it in the record file. (Friction caught by real-world verification gen-0073)

**`init` also appends two lines to the project's `.gitignore`** — `.reap/.session` and `.reap/.index/` (it prints that it did). This is normal and belongs in the migration commit; don't treat it as an unexplained change in 6/8's review, and don't revert it.

## 6/8 — A subagent does the migration

Don't fill the main session's context with old data — **the mapping table and instructions are in [migration-map.md](references/migration-map.md), and that whole document is handed to a subagent to carry out.** For mappings 1-9, the confirmed grounds are ps-4b485d's 04-migration-skill.md; for environment (10), it's 04-migrate-docs.md; for the working-state mappings 1·2·3·5·6·11·12, it's ms-024's `tasks/1-skill-revision.md` and selfview's real first-pass trace. Thirteen mappings total (#13 rewrites references to moved documents).

**#8은 스크립트가 한다** — `node <this skill's directory>/scripts/migrate-lineage.mjs <project-root>`. subagent가 손으로 lineage를 옮기지 않는다, 변환이 결정적이라서다.

## 7/8 — Verification (working-state check)

`reap doctor` has to come back at **zero defects.** If defects show up, fix them and run again — don't move to step 8 until it passes. Also check that `.reap-v0_17/` is untouched (`git status` should show no changes inside it).

Structure alone isn't enough — run the working-state check too, the automatable half of "would the next session know how to continue if the original were deleted":

```bash
REAP_BIN=<path to the reap binary> bash <this skill's directory>/scripts/verify-migration.sh <project root>
```

`REAP_BIN` is the binary the script calls for `plan sources`·`ctx`·`doctor`; it defaults to `reap` on PATH, so pass it only when 2/8 set it (a dev build). Every line has to read `ok:` — a single `FAIL:` line means mapping #1, #2/#11, #12, or #13 was skipped or done wrong; go back and fix it, then run again. Don't move to step 8 until this script also exits 0. Put its full output in the record file's `## 검증`, right after the doctor output.

## 8/8 — Record and home cleanup guidance

The format for the record file (`archive/migration-v0_17.md`) and the home-asset allowlist are in the back half of [migration-map.md](references/migration-map.md) — the `doctor` and `verify-migration.sh` outputs both have to be in the record for this to be complete.

**Home cleanup is a script, in two calls.** The old v0.17 assets (19 slash commands, 2 agents plus `reap-upgrade.md`, two SessionStart entries, four files under `~/.reap/`) are not removed by installing v0.18 — nothing else ever removes them, and until this runs every session shows the old `/reap.*` commands next to the new `/reap:*` skills.

```bash
node <this skill's directory>/scripts/cleanup-home.mjs            # 1) list — changes nothing. Show it verbatim, ask
node <this skill's directory>/scripts/cleanup-home.mjs --apply    # 2) only after the human approved that exact list
```

Don't delete by hand and don't edit `settings.json` by hand — the script removes only the allowlist and leaves the v0.18 plugin's registration keys alone. If the human declines, skip step 2 and say so in the record.

**Leave the `.reap-v0_17/` decision where the next session will see it.** Deleting the original is the human's call and it usually isn't made on migration day — so don't ask once and lose it. Do both:

```bash
reap make backlog --type migrate --title "\`.reap-v0_17/\` 삭제 판단 — 이주 검증 뒤 원본을 지울지 사람이 정한다" --slug delete-v017-original
```

and, if mapping #11 created a focus milestone, add to its `handoff.md` a `## 미결` line: "`.reap-v0_17/` 삭제 여부 — 사람 판단 대기 (bk-xxxxxx). 되돌리기: `rm -rf .reap && mv .reap-v0_17 .reap`". The backlog item is consumed by whichever generation carries out the decision (delete, or keep and say so); the handoff line is what the next session actually reads.

**Add a `## 다음 세션이 볼 것` section** — the full text of `reap ctx`'s status line block (everything from `<!-- reap 상태 -->` to the end of its output), pasted verbatim. This is the literal answer to "does the next session know how to continue if `.reap-v0_17/` is deleted" — show it to the human alongside the record file.

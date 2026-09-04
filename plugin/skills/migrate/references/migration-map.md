# Migration instructions — 6/8 subagent · 8/8 record and home cleanup

[SKILL.md](../SKILL.md)'s 6/8 and 8/8 point here. **Hand this whole document to the subagent as its instructions.**

## To the subagent (6/8)

The main session doesn't read the migration data — carrying out the below is Task's (subagent's) job. At the start of each mapping, the subagent prints "migration N/12: <target>", and returns a draft record file at the end.

**Shared rules**
- **Run every `reap` command at the target project's root.** reap searches upward through parent directories for `.reap/`, so running it inside another repo **writes into that other store.** Right after the first `make`, check that the output file's path is under the target project, and if not, stop immediately
- **Only read `.reap-v0_17/`.** No writing, editing, or deleting — non-destruction of the original is invariant
- New items' ids must always be issued through `reap make ...` — never stamp an id by hand
- For anything decided not to move, leave "what, and why" in the record file — don't quietly drop it

## Finalized mapping (ps-4b485d's 04-migration-skill.md, confirmed by gen-0066 · gen-0070)

Mappings #1·#2·#3·#5·#6 redefined and #11·#12 added by gen-0100-exec (ms-024 tasks/1), grounded in selfview's real first-pass migration (2026-09-05) and gen-046's `05-completion.md` — that first pass moved structure correctly but left no working state behind: no milestone/backlog for the in-progress track, goals never registered, referenced designs demoted to idea, genome still in v0.17 vocabulary, `CLAUDE.md` still pointing at deleted v0.17 files.

| # | Original (`.reap-v0_17/`) | Where, and how |
|---|---|---|
| 1 | the 3 `genome/` files | **Copy as is, then rewrite in place** — mechanical term replacement only, everything else untouched. Detail below the table |
| 2 | `vision/memory/` longterm·midterm·shortterm | **Curate** into `vision/memory/lessons.md` only. Passing bar unchanged: a lesson that reads as a conclusion from its title alone, passing "would the next session repeat the same mistake without this." **shortterm's in-progress-work/다음 세대 후보 section and midterm's living (non-완료) track sections are not lessons material** — don't curate them here and don't drop them either. They are the sole input to mapping #11, nowhere else. Everything else (midterm's finished tracks, shortterm's session logistics) is dropped as before |
| 3 | `life/backlog/` | **Check against real traces before reissuing anything.** For each item, grep its title/keyword across every `.reap-v0_17/lineage/*/05-completion.md` (`Summary` and `## Lessons Learned` sections) and against the code it describes. **Trust neither the item's own frontmatter `status` nor a memory file's claim about it — both go stale** (real trace: `shortterm.md` called 7 items "still pending" that lineage showed resolved months earlier because a stale `status: pending` was copied forward). If resolved, **don't reissue as a live backlog item — archive it instead**, `## Not moved`에 `<old id> — resolved by <gen-id or code location found>`를 적고 Detail below the table의 절차로 `archive/backlog/`에 consumed 상태로 옮긴다. Before reissuing, also check the item isn't **superseded**: read the plan documents the live track points at (roadmap, latest authoritative design) — if a later document replaced the design the item assumes (real trace: `team-mode-p0c-account-auth` assumed separate accounts after `account-model.md` had pivoted to unified identity), reissue with a warning at the top of the body naming the superseding document, or don't reissue and record why. Only reissue what's still open (as a live backlog item, in `life/backlog/`): `reap make backlog --type <old type convention> --title <title>`, body carried over, `original: <old filename>` appended |
| 4 | **open** `vision/milestones/` | Recreate with `reap make milestone --title ...`, porting the body (Exit Criteria/Out of Scope equivalents) into v0.18 vocabulary. Don't move closed ones (the original is history) |
| 5 | `vision/goals.md` | **Register now — don't defer to the human.** Deleting is cheaper than a half-registered plan source nobody points at, so this mapping decides, it doesn't ask. Steps: (1) copy the still-live (non-`[x]`) goal lines into `docs/plan/goals.md` — check first whether the project already has a planning directory (`docs/plan/`, `docs/design/`, etc.) and use that instead of creating a new one; (2) `reap make plan-source --root docs/plan --role "<one-line role>"`; (3) write `plan/conventions/<ps-id>-<slug>.md` stating "goals.md는 목표 목록, 트랙별 설계는 하위 디렉토리로 온다"; (4) record the registered id in the record file |
| 6 | `vision/design/` | **Decide 채택·실행 중 by reference, not by guess.** Referenced whole directories move to `docs/plan/`, unreferenced documents become idea files. Detail below the table |
| 7 | `config.yml` | The new config was already set up in 5/8 (language·agentClient carried over). Leave the **list of dropped fields** (autoSubagent, autoUpdate, strictEdit, strictMerge, evaluator, cruiseCount, autoIssueReport, lastMigratedVersion, etc.) in the record file — a setting shouldn't quietly vanish |
| 8 | `lineage/` · `sequence/` · `reap-guide.md` | **`lineage/`는 승계한다 — 번호를 이어간다(사람 지적, gen-0101, ms-024 이전엔 매핑 #8이 "승계 안 함"이었으나 뒤집혔다: `.reap-v0_17/`을 지우면 세대들의 회고·결정·힌트가 작업 트리에서 사라진다).** `scripts/migrate-lineage.mjs <project-root>`가 `lineage/`의 각 항목(단일 파일·디렉토리 두 형식 모두, `pre-reap-history.md` 포함)을 `archive/generations/gen-0NNN-exec-<slug>.md`로 옮기고 `sequence/generation.md`에 행을 붙인다. 이후 `make generation`이 발급하는 다음 세대 번호는 스크립트가 등록한 마지막 번호 다음부터다 — v0.18 세대가 1부터 다시 시작하지 않는다. **`sequence/`(원본 레지스트리 자체)·`reap-guide.md`는 승계하지 않는다** — `reap-guide.md`는 v0.17이 번들한 안내문(5단계 생애주기 전체를 설명)이고 v0.18 자신의 안내로 대체된다. Detail below the table |
| 9 | `hooks/` · `migration-state.yml` · `.session-state.md` · `.index/` | **Only move hooks that have a matching event** — `onLifeStarted.<name>.{sh,md}`→`.reap/hooks/gen.made.<name>.{sh,md}`, `onLifeCompleted.<name>.*`→`gen.closed.<name>.*` (rename only, keep body and metadata as is; `.sh` keeps its execute bit). The remaining 12 events (`onLifeLearned`·`onLifePlanned`·`onLifeImplemented`·`onLifeValidated`·`onLifeTransited`·8 kinds of `onMerge*`) and `*.example` files aren't moved — note each as "no matching event" in the record file. Copy `conditions/` whole (v0.18 `init`'s placed `always.sh` can be overwritten by the original — same behavior. The original may have one extra comment line, which is harmless). `migration-state.yml`·`.session-state.md`·`.index/` are **dropped** — the mechanism they served is gone. One line each in the record file |
| 10 | `environment/summary.md`·`source-map.md`·`resources/`·`domain/`·`docs/` | `summary.md`→`.reap/environment/summary.md` **as is** — overwriting the seed `init` placed (a seed isn't user knowledge). `source-map.md`→as is (if present). `resources/`→as is. `domain/`·`docs/` have no place in v0.18 — move them to `.reap/environment/resources/domain/`·`resources/docs/` and note it in the record file (don't edit the content). Phrasing assuming v0.17's structure (5-stage lifecycle, etc.) is "needs updating," same as genome |
| 11 | the last lineage generation's `05-completion.md` (`## Next Generation Hints`) + shortterm's "다음 세대 후보" section + midterm's living (non-완료) track sections | **Build one focus milestone for the highest-priority track, backlog for the rest.** Detail below the table |
| 12 | `CLAUDE.md`'s `## REAP` section | Replace the section's body verbatim with the v0.18 text; if the heading doesn't exist, do nothing. Detail below the table |

## Detail — mapping #1 (genome rewrite)

First run `grep -niE 'embryo|normal genome|adapt phase|reflect phase|completion artifact|autoSubagent|cruise|lifecycle stage|lineage' .reap-v0_17/genome/*.md` to find every hit before touching anything — don't rely on skimming. Then replace only these terms, sentence by sentence, leaving everything else (coding conventions, test policy, product identity, project-specific invariants) untouched:

| v0.17 term | replace with |
|---|---|
| `embryo`/`normal` genome state | delete the state concept; a mid-generation genome finding goes to `make backlog --type genome` — say so in the sentence's place |
| `adapt phase` / `reflect phase` | the `complete` skill |
| `completion artifact` | the generation record's `Outcome` |
| genome-change backlog (any v0.17 phrasing for it) | `make backlog --type genome` |
| "environment refreshed at completion" | "`complete` updates `environment/summary.md`" |
| `autoSubagent` · `cruise` · `evaluator` | delete the sentence containing it |
| `lineage` | `archive/` and `vision/memory/lessons.md` |

Record every changed sentence as before→after under the record file's `## Needs updating` — that's the diff a human reviews.

## Detail — mapping #3 (resolved backlog → `archive/backlog/`)

For every item mapping #3 judges **resolved** (found already done by a real trace — a lineage generation's completion, or code): don't just note it under `## Not moved` and drop it. Carry it into `archive/backlog/` as a consumed record, so the "누가 언제 무엇을 해소했나" survives the original's deletion:

```bash
reap make backlog --type <old type convention> --title "<title>"   # id 발급
# 본문을 원본 그대로 채운다(요약하지 않는다) + 맨 끝에 `original: <old filename>`
reap mark backlog <bk-id> --consumed --by <해소한 gen-0NNN-exec>
reap mark backlog <bk-id> --archived
```

`--by`는 그 항목을 실제로 해소한 세대의 v0.18 archive id다(매핑 #8로 lineage를 승계했다면 `gen-0NNN-exec` 꼴). 세 명령 순서를 지킨다 — `--consumed`가 먼저라야 `consumedBy`가 archive로 옮겨지기 전에 찍힌다. 결과는 `archive/backlog/`에 `status: consumed`로 남고 `## Not moved`의 한 줄과 이 항목이 서로를 가리킨다.

## Detail — mapping #6 (design directory vs. idea files)

A document counts as referenced if a **live** goals.md line names its path, or a **living** midterm track (per mapping #2's definition — not marked 완료) or shortterm's in-progress-work section names it. Record the grounds either way — the exact referencing line, or "no reference found."

- **Referenced** → move the whole containing directory as-is into `docs/plan/<track-slug>/` (a lone file with no sibling directory just moves itself). A whole-directory move keeps every relative link between its documents intact — don't edit them.
- **Not referenced** → `reap make idea --kind file --title <title>` **per document**, not per directory (`idea/files/` has no subdirectory concept). If several unreferenced documents came from one source subdirectory and cross-link each other (bk-d0eef8's case — 10 team-mode docs, 18 links), still issue them **per document**, but: (a) put `원본 묶음: <원본 디렉토리 상대경로>` as the first line under each one's frontmatter; (b) before finishing, build a table of `원본 파일명 → 새 idea 파일명`, and mechanically rewrite every markdown link between them (`[text](other.md)` → `[text](<new-idea-filename>.md)`) using that table — a plain-prose mention of a filename ("`org-infra.md`의 계정 서술") is not a link, leave it alone. `reap doctor` surfaces any link you missed as a defect — run it before calling this mapping done.

## Mapping #13 — rewrite references to moved documents

After #5·#6·#10 have moved files, copied documents still point at the old places. Run, from the project root:

```bash
grep -rnE '\.reap/vision/(design|goals\.md)|vision/memory/(longterm|midterm|shortterm)|\.reap/lineage/' .reap CLAUDE.md --include='*.md' --include='CLAUDE.md'
```

Every hit is a link that will break the moment `.reap-v0_17/` is deleted. Rewrite each to the new location (`docs/plan/<track>/...`, `docs/plan/goals.md`, `.reap/vision/memory/lessons.md`, or "see `.reap-v0_17/lineage/` — history") — in `environment/summary.md`, `genome/*.md`, `lessons.md`, idea files and `CLAUDE.md` alike. The verify script checks this; list every rewrite in the record under `## Needs updating`.

## Detail — mapping #8 (lineage → `archive/generations/`)

`scripts/migrate-lineage.mjs`가 전부 한다 — 6/8에서 이렇게 부른다:

```bash
node <this skill's directory>/scripts/migrate-lineage.mjs <project-root>
```

의존 없는 node 스크립트다. `.reap-v0_17/lineage/`의 두 형식(초기 압축 단일 파일 `gen-NNN-<hash>-<slug>.md`, 후기 디렉토리 `meta.yml`+`01-learning.md`…`05-completion.md`[+`backlog/`])을 모두 읽어 `.reap/archive/generations/gen-0NNN-exec-<slug>.md`를 쓰고(v0.17의 세 자리 번호를 네 자리로만 바꾼다 — 재발급하지 않는다), `pre-reap-history.md`는 `gen-0000-exec-pre-reap-history.md`로, `sequence/generation.md`에 행을 append한다. **`startCommit`·`endCommit`은 쓰지 않는다** — v0.17이 커밋 해시를 남기지 않았으므로 지어내지 않는다(doctor는 이 필드가 없는 닫힌 세대를 결함으로 보지 않는다 — "커밋 없이 닫힌 것" 검사는 `startCommit`과 `endCommit`이 **둘 다 있고 같을 때만** 걸린다). **재실행 안전** — 레지스트리에 이미 있는 id는 건너뛴다. 표준 출력에 옮긴 개수·건너뛴 개수·다음 세대 번호·경고(제목이나 날짜를 못 찾은 항목)를 낸다. 스크립트가 못 옮긴 것은 없다고 보고하지 말고 경고를 그대로 기록 파일에 옮긴다.

## Detail — mapping #11 (working-state candidates → milestone + backlog)

Build one candidate list from the three sources (last lineage's Next Generation Hints, shortterm's 다음 세대 후보, midterm's living tracks). Each candidate names a track — the goals.md Milestones line it serves. If the list names more than one track, keep **only the highest-priority track** for a milestone (the one goals.md marks 최우선/현재, or absent that marker, the one with the most recent generation); every candidate belonging to another track goes straight to backlog.

For the kept track: `reap make milestone --title "<트랙 이름>" --focus --ref <ps-id>:<roadmap 문서 경로>`. The `--ref` path is **relative to the plan source's root** (the `root:` in `sources.yml`), not to the repo — `ps-64b338:team-mode/implement/roadmap.md`, never `docs/plan/team-mode/...`; `make` rejects a path that doesn't exist under that root. Write `milestone.md`:
- **Background** = one paragraph, the track's progress so far (which phases are done, pulled from midterm)
- **Exit Criteria** = the roadmap document's own stated completion condition for its *current* phase, quoted — don't invent one
- **Plan Items** = one line per candidate the source itself calls "다음"/"next" (not a sub-item the source itself deferred or itself already called "backlog")

Write one `tasks/<n>-<slug>.md` per Plan Item.

Everything else — candidates belonging to another track, and sub-items the source itself deferred or itself labeled backlog within the kept track (e.g. an explicit "X backlog" line inside the hints) — `reap make backlog --type <slug drawn from its content>` each, body = the source's own text plus `original: <source file>#<section>`.

Anything phrased as an open question needing human judgment, not a yes/no work item (e.g. "should function X be promoted to shared package") → `reap make idea --kind research --title <question>`, never milestone or backlog.

## Detail — mapping #12 (CLAUDE.md REAP section)

Find the heading `## REAP` (exact, top-level) in the project's `CLAUDE.md`, through to the next `## ` heading or end of file. **If the heading doesn't exist, do nothing — don't create one.** If it exists, replace that whole span, heading included, verbatim with:

```markdown
## REAP

이 프로젝트는 REAP(Recursive Evolutionary Autonomous Pipeline) plugin으로 진화한다. 별도의 `@` import는 없다 — 세션이 열릴 때 SessionStart 훅이 `genome/`·`environment/summary.md`·상태 줄을 자동 주입한다.

REAP를 다루는 통로는 CLI가 아니라 `/reap:<name>` 형태의 plugin skill이다. 작업은 `/reap:evolve`로 열고 `/reap:complete`로 닫는다. 구조는 `.reap/map.md`가 안내한다.

상태 줄이 안 보이면(컨텍스트 압축 등) `reap ctx`를 직접 부른다.
```

Report the before/after span in the record file.

## Record file (8/8) — `.reap/archive/migration-v0_17.md`

```markdown
---
migratedAt: <ISO, second precision>
from: v0.17 (.reap-v0_17/)
---
## Moved            # by mapping #, original→destination and count — including the environment section (summary, resources, domain/docs move), the milestone/backlog from #11, and the CLAUDE.md span from #12
## Not moved      # what, and why — including the list of dropped config fields and #3's resolved-not-reissued backlog items with their grounds
## Needs updating      # #1's genome before→after term replacements, and #10's list of v0.17-assuming phrasing in environment
## 검증               # full doctor output, then the full output of the skill's scripts/verify-migration.sh
## Home cleanup            # if done, list of what was removed; if not, "not done"
## 다음 세션이 볼 것    # reap ctx's full status line block (from <!-- reap 상태 --> to the end), verbatim
```

**This isn't complete until 7/8's zero-defect doctor run and a passing `verify-migration.sh` are both in this file.** Put the one-line revert command (`rm -rf .reap && mv .reap-v0_17 .reap`) at the top of the file too.

## Home asset cleanup (8/8) — only after showing the list and getting consent

This carries forward the principle from gen-088's `reap uninstall`: **delete only what's on the allowlist. Never touch anything the user owns under `~/.reap/`** (a private key has actually been found there before).

| Asset | What |
|---|---|
| `~/.claude/commands/reap.*.md` | the 19 old slash commands |
| `~/.claude/agents/reap-*.md` | the 2 old agents, plus `reap-upgrade.md` itself once migration is done |
| `~/.claude/settings.json` | only the reap entries in SessionStart (check-version, load-context) and in the marketplace/plugin keys. **Validate-then-write** — if a single value is wrong the client ignores the whole file, so check the edited version by parsing it as JSON and swap it in atomically through a temp file |
| `~/.reap/` | only what reap wrote: `reap-guide.md` · `version-check.json` · `daemon/`. Leave the rest |

Migration is complete even if cleanup is skipped — just note in the record that the user accepts the old slash commands showing up duplicated alongside the new plugin.

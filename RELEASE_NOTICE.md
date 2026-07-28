# Release Notices

## v0.17.3
### en
If you use OpenCode, upgrade: REAP was writing agent definitions in Claude Code's frontmatter schema into `~/.config/opencode/agent/`, and one unreadable file invalidates the whole OpenCode configuration — every `opencode` command failed until the file was removed. The definitions are now converted per client. Separately, `reap fix --check` no longer reports the location `reap install-skills` writes to; the installer targeted `~/.claude/commands/` while the checker called the same path a v0.15 leftover, producing 19 warnings no supported command could clear (issue #22). The path now has a single owner and reaches the checker by injection. Two release gates were added so neither kind of defect ships again: `check-self-diagnosis.sh` installs the actual publish tarball into a throwaway HOME and requires a clean `fix --check` (CI and pre-publish), and `check-agent-integration.sh` drives a headless agent to confirm slash commands are really reachable. Also fixed: a fresh init reported its own shipped invariants.md as a placeholder, and `init --repair` reported an updated CLAUDE.md as 'already present'.
### ko
OpenCode 를 쓰신다면 업그레이드하세요. REAP 이 Claude Code 스키마의 agent 정의를 그대로 `~/.config/opencode/agent/` 에 설치했고, 읽을 수 없는 파일 하나가 OpenCode 설정 전체를 무효화해 그 파일을 지우기 전까지 모든 `opencode` 명령이 실패했습니다. 이제 클라이언트별로 변환해 설치합니다. 별건으로, `reap fix --check` 가 `reap install-skills` 의 설치 위치를 더 이상 경고하지 않습니다 — installer 는 `~/.claude/commands/` 에 설치하는데 checker 가 같은 경로를 v0.15 잔재로 표시해, 어떤 지원 명령으로도 해소할 수 없는 경고 19건이 발생했습니다(issue #22). 이제 경로는 단일 소유자를 가지며 주입으로 checker 에 전달됩니다. 두 종류의 결함이 다시 배포되지 않도록 릴리즈 게이트 2종을 추가했습니다: `check-self-diagnosis.sh` 는 실제 배포 tarball 을 격리 HOME 에 설치해 `fix --check` 가 깨끗한지 요구하고(CI + publish 전), `check-agent-integration.sh` 는 헤드리스 agent 를 띄워 slash command 가 실제로 노출되는지 확인합니다. 그 외: 신규 init 이 자신이 배포한 invariants.md 를 placeholder 로 오판하던 문제, `init --repair` 가 갱신한 CLAUDE.md 를 '이미 있음'으로 보고하던 문제 수정.

## v0.17.2
### en
Behavior change: the reflect-phase prompt now carries the content-type memory classification and the mandatory pruning policy (replace shortterm / delete completed midterm tracks / dedup longterm), plus an instruction to remove superseded content from environment/summary.md. `reap init` seeds the same rules into genome/evolution.md, and existing projects get a v0.17.2 migration note to update theirs. `reap fix --check` warns when a genome file, memory tier, or environment/summary.md exceeds its guideline size — the genome thresholds are now per-file with recorded rationale, replacing a shared 100-line limit that the shipped evolution.md itself could not meet. All size checks are warnings only, never auto-deleted. Release plumbing: `scripts/check-docs-version.sh` gates `npm publish` on the release notes and all five reap.cc locales matching package.json, including locale parity; reap.cc no longer teaches the retired lifespan-based memory model. Fixes issue #21.
### ko
행동 변경: reflect phase prompt 에 content-type memory 분류와 의무 pruning 정책(shortterm 교체 / 완료된 midterm 트랙 삭제 / longterm 중복 제거)이 추가되고, environment/summary.md 의 낡은 서술 제거 지시가 포함됩니다. `reap init` 이 동일 규칙을 genome/evolution.md 에 쓰며, 기존 프로젝트에는 genome 갱신용 v0.17.2 migration note 가 제공됩니다. `reap fix --check` 가 genome 파일 / memory tier / environment/summary.md 의 크기 초과를 경고합니다 — genome 임계는 근거를 명시한 파일별 값으로 바뀌었고, 기존의 공통 100줄 기준은 배포되는 evolution.md 자체가 만족할 수 없는 값이었습니다. 모든 크기 검사는 경고만 하며 자동 삭제하지 않습니다. 릴리즈 정비: `scripts/check-docs-version.sh` 가 릴리즈 노트와 reap.cc 5개 로케일이 package.json 과 일치하는지(로케일 간 일관성 포함) 검사해 `npm publish` 를 게이트하며, reap.cc 가 더 이상 폐기된 lifespan 기반 memory 모델을 가르치지 않습니다. issue #21 해결.

## v0.17.1
### en
Migration instruction layer: `reap update` now detects version gaps and injects per-version migration notes into SessionStart context. Run `reap update --mark-migrated` after applying. Vision memory reclassified to content-type-based tiers with mandatory pruning policy in reflect phase.
### ko
Migration instruction layer 추가: `reap update` 가 버전 gap 감지 후 migration 지시를 SessionStart context에 주입. 적용 완료 후 `reap update --mark-migrated` 실행. Vision memory를 content-type 기반 계층으로 재분류 + reflect phase 필수 pruning 정책 추가.

## v0.17.0
### en
Code Intelligence Daemon (opt-in `daemon: true`): local Tree-sitter symbol graph at localhost:17224. Auto-indexes at generation start, implementation complete, and completion commit. Agents receive symbol search / caller-callee / blast-radius guidance in prompts. `lastIndexedCommit` exposed for staleness checks. Evaluator Agent fitness-phase integration complete: high-severity concerns now auto-abort cruise mode.
### ko
코드 인텔리전스 데몬 (opt-in `daemon: true`): localhost:17224 로컬 Tree-sitter 심볼 그래프. generation 시작, implementation 완료, completion commit 시 자동 인덱싱. agent 프롬프트에 심볼 검색/caller-callee/blast-radius 안내 포함. staleness 확인을 위한 `lastIndexedCommit` 노출. Evaluator Agent fitness phase 통합 완료: high-severity concern 발생 시 cruise mode 자동 중단.

## v0.16.6
### en
Evaluator Agent integration (opt-in `evaluator: true`): independent `reap-evaluate` subagent runs during validation and fitness phases as an advisor. High-severity concerns automatically abort cruise mode for human review.
### ko
Evaluator Agent 통합 (opt-in `evaluator: true`): `reap-evaluate` 서브에이전트가 validation/fitness 단계에서 독립 검토자로 실행됨 (advisor 모델). high-severity concern 발생 시 cruise mode 자동 중단.

## v0.16.4
### en
Restore missing npm metadata (license, author, repository, homepage, keywords). Fix GitHub Releases showing empty release notes.
### ko
누락된 npm 메타데이터 복원 (license, author, repository, homepage, keywords). GitHub Release에 release notes가 표시되지 않던 문제 수정.

## v0.16.3
### en
Rename vision/docs to vision/design to avoid confusion with root docs/. Add Design section to Vision (separate from Memory for independent design documents). Add Evaluator Agent design doc. Fix README language links for npm compatibility.
### ko
vision/docs를 vision/design으로 리네이밍하여 루트 docs/와의 혼동 방지. Vision에 Design 섹션 추가 (Memory와 구분되는 독립 설계 문서 공간). Evaluator Agent 설계 문서 추가. npm 호환을 위해 README 언어 링크 수정.

## v0.16.2
### en
Add `reap make hook` CLI command for creating hooks with correct format. Restore default hook conditions (always, has-code-changes, version-bumped). Remove outdated Presets and Session Context Loading from docs.
### ko
`reap make hook` CLI 커맨드 추가 — 올바른 형식의 hook 파일 생성. 기본 hook conditions 복원 (always, has-code-changes, version-bumped). docs에서 outdated된 Presets, Session Context Loading 섹션 제거.

## v0.16.1
### en
Fix npm README images not displaying. Restore SPA routing for docs site (404.html fallback). Fix broken docs links in README. Add docs workflow trigger paths.
### ko
npm README 이미지 미표시 수정. docs 사이트 SPA 라우팅 복원 (404.html fallback). README 문서 링크 수정. docs workflow 트리거 경로 추가.

## v0.16.0
### en
First v0.16.0 release. Major rewrite from v0.15 — new lifecycle engine, nonce-based stage verification, 2-level lineage compression, merge lifecycle, and adapter-based agent client support.
### ko
v0.16.0 최초 릴리즈. v0.15에서 전면 재작성 — 새 lifecycle 엔진, nonce 기반 stage 검증, 2단계 lineage 압축, merge lifecycle, 어댑터 기반 agent client 지원.

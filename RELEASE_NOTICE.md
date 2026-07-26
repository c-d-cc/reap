# Release Notices

## v0.17.2
### en
Behavior change: the reflect-phase prompt now carries the content-type memory classification and the mandatory pruning policy (replace shortterm / delete completed midterm tracks / dedup longterm), plus an instruction to remove superseded content from environment/summary.md. `reap init` now seeds the same rules into genome/evolution.md. Existing projects get a v0.17.2 migration note to update their genome. `reap fix --check` warns when memory tiers or environment/summary.md exceed their guideline size — warnings only, never auto-deleted. Fixes issue #21.
### ko
행동 변경: reflect phase prompt 에 content-type memory 분류와 의무 pruning 정책(shortterm 교체 / 완료된 midterm 트랙 삭제 / longterm 중복 제거)이 추가되고, environment/summary.md 의 낡은 서술 제거 지시가 포함됩니다. `reap init` 이 동일 규칙을 genome/evolution.md 에 씁니다. 기존 프로젝트에는 genome 갱신용 v0.17.2 migration note 가 제공됩니다. `reap fix --check` 가 memory tier 와 environment/summary.md 의 크기 초과를 경고합니다 — 경고만 하며 자동 삭제하지 않습니다. issue #21 해결.

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

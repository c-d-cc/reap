# Release Notices

## v0.17.7
### en
Nothing about the CLI changed. Two rules were added to the `genome/evolution.md` REAP ships; existing projects get them through a migration note that `reap update` surfaces, and your own genome is never overwritten.
### ko
CLI 는 달라진 것이 없습니다. 배포되는 `genome/evolution.md` 에 검사 작성 규칙 두 가지가 추가됐고, 기존 프로젝트에는 `reap update` 가 migration note 로 안내합니다. 사용자의 genome 을 덮어쓰지는 않습니다.

## v0.17.6
### en
A code index is built in — nothing to install, no port, no background process: `reap index status | search | impact | callers | callees`. Fifteen languages, no native build; the index is keyed by commit, lives in `.reap/.index/` and is gitignored. `reap uninstall` removes what npm cannot — slash commands, agent definitions, `~/.reap/` and the SessionStart hook entries, which `npm uninstall -g` leaves behind. Installing REAP into a project no longer changes your global install, and `autoUpdate: false` now actually turns auto-update off. The daemon is retired: `reap update` clears `daemon` / `daemonBin` and deletes `~/.reap/daemon/`; remove the global package with `npm uninstall -g @c-d-cc/reap-daemon`.
### ko
코드 인덱스가 내장됐습니다 — 설치할 것도 포트도 상주 프로세스도 없습니다: `reap index status | search | impact | callers | callees`. 15개 언어를 지원하고 네이티브 빌드가 없으며, 인덱스는 커밋 기준이고 `.reap/.index/` 에 있으며 gitignore 됩니다. `reap uninstall` 이 npm 이 지우지 못하는 것을 지웁니다 — slash command·agent 정의·`~/.reap/`·SessionStart hook 항목은 `npm uninstall -g` 로 사라지지 않습니다. 프로젝트에 REAP 을 설치해도 전역 설치가 더 이상 바뀌지 않고, `autoUpdate: false` 가 실제로 자동 업데이트를 끕니다. daemon 은 폐기됐습니다 — `reap update` 가 `daemon` / `daemonBin` 을 지우고 `~/.reap/daemon/` 도 삭제합니다. 전역 패키지는 `npm uninstall -g @c-d-cc/reap-daemon` 으로 제거하세요.

## v0.17.5
### en
REAP installs its own integration on first run — npm 12 blocks install scripts for global installs, which left slash commands, agent definitions and the session hook unplaced with no error. `reap run push` reports git's actual error, and `reap help` lists `/reap.run` and `/reap.report`.
### ko
REAP 이 첫 실행 때 자기 통합을 직접 설치합니다 — npm 12 가 전역 설치의 install script 를 차단해 slash command·agent 정의·session hook 이 놓이지 않았고 오류조차 나지 않았습니다. `reap run push` 가 git 의 실제 오류를 보고하고, `reap help` 에 `/reap.run` 과 `/reap.report` 가 나옵니다.

## v0.17.4
### en
If you use OpenCode, upgrade and re-run `reap install-skills`. `~/.config` is only the default: OpenCode follows the XDG base directory spec, so anyone with `XDG_CONFIG_HOME` set was getting none of REAP's 19 slash commands and neither agent definition — the files went to `$HOME/.config/opencode/`, the client read somewhere else, and nothing reported a problem. Installed slash commands also carried `mode: subagent`, a field describing something a command is not; reinstalling clears it. The self-diagnosis gate now switches a project to `agentClient: opencode` and requires `opencode agent list` to load both REAP agents, which is how the XDG defect was found. The test suite also runs on every push again, in the private repository that holds it.
### ko
OpenCode 를 쓰신다면 업그레이드 후 `reap install-skills` 를 다시 실행하세요. `~/.config` 는 기본값일 뿐입니다 — OpenCode 는 XDG base directory 규격을 따르므로 `XDG_CONFIG_HOME` 을 설정한 사용자는 REAP 의 slash command 19개와 agent 정의 2개를 하나도 받지 못했습니다. 파일은 `$HOME/.config/opencode/` 에 쓰였고 클라이언트는 다른 곳을 읽었으며, 아무 오류도 나지 않았습니다. 설치되는 slash command 에 `mode: subagent` 가 붙던 문제도 함께 수정했습니다(command 는 agent 가 아닙니다) — 재설치하면 정리됩니다. 자기진단 게이트가 이제 프로젝트를 `agentClient: opencode` 로 전환해 `opencode agent list` 가 REAP agent 둘을 로드하는지 요구하며, XDG 결함은 이 검사가 찾았습니다. 테스트 스위트도 매 push 마다 다시 실행됩니다(스위트를 보관한 private 저장소에서).

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
Evaluator Agent fitness-phase integration complete: the evaluator now runs during fitness as well as validation, and high-severity concerns auto-abort cruise mode.
### ko
Evaluator Agent fitness phase 통합 완료: validation 뿐 아니라 fitness 에서도 evaluator 가 동작하며, high-severity concern 발생 시 cruise mode 가 자동 중단됩니다.

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

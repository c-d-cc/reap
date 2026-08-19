# Environment

## Project

- Source: `~/cdws/reap/` (branch: main)
- Package: `@c-d-cc/reap` v0.17.5 (+ `@c-d-cc/reap-daemon` v0.2.0 — 같은 저장소, 별도 발행)
- Config language: korean

## Tech Stack

- Runtime: Bun (build), Node.js (execution)
- Build: `bun build` → single bundle (`dist/cli/index.js`, ~770KB)
- Dependencies: `yaml` v2 — **유일한 production dependency**. daemon 은 의존이 아니다 (아래 Workspaces)
- Workspaces: `daemon` — 런타임 의존이 **아니다**. `npm ci` 한 번으로 daemon 의 의존까지 설치되게 하는 것이 목적이며, 소비자의 npm 은 의존 패키지의 `workspaces` 필드를 처리하지 않는다
- CLI Framework: 자체 구현 (`src/libs/cli.ts`) — commander/yargs 대신
- Crypto: Node.js native `crypto` (nonce, hash)
- VCS: Git (child_process 직접 호출)
- Type System: TypeScript 5.7, strict mode, ESM

## Source Structure

```
src/
├── types/index.ts              — 타입 정의 (GenerationState, ReapConfig, ReapOutput 등)
├── core/                       — 핵심 로직 (29 modules)
│   ├── lifecycle.ts            — stage 순서 정의 (next/prev) + transition graph (NORMAL_TRANSITIONS, MERGE_TRANSITIONS, getTransitions). **stage:phase 가 자기 목록에 들어 있으면 self-loop = 그 phase 재진입 허용** — nonce 는 매번 재발급·검증·소비되므로 무결성은 유지된다. 현재 `completion:fitness` 와 `validation:entry` 둘
│   ├── generation.ts           — generation CRUD, ID 생성
│   ├── paths.ts                — .reap/ 경로 상수 (ReapPaths 인터페이스, memory/resources/docs 경로 포함)
│   ├── nonce.ts                — 암호학적 token (SHA256) — 순수 함수, generateToken/verifyToken
│   ├── artifact-check.ts        — artifact 미작성 감지 (core placeholder 기반)
│   ├── semver.ts               — **버전 비교의 단일 소유자.** SemVer 2.0.0 §9~11 (prerelease 순서, build metadata 무시). `semverCompare`/`semverGt`/`semverGte`/`semverCore`. 소비자 넷: autoUpdate floor 2, `MIN_DAEMON_VERSION` 판정, migration 의 release-line 비교
│   ├── stage-transition.ts     — transition graph 기반 nonce 검증 (verifyTransition, setTransitionNonces, prepareStageEntry), artifact 검증, stage 전환
│   ├── maturity.ts             — bootstrap/growth/cruise 감지, 완성 기준 16항목
│   ├── lineage.ts              — 아카이브 DAG, genome diff (3-way), lineage 읽기, getLastLineageEntry (early-close hint 노출용)
│   ├── compression.ts          — 2-level lineage 압축 (L1: 5gen, L2: 100files)
│   ├── genome-suggest.ts       — init 시 genome 초안 생성
│   ├── backlog.ts              — backlog scan/consume/revert/create + createDeferredBacklog/extractUncheckedTasks/countCheckedTasks (early-close 승계). `consumeBacklog` 는 `Promise<ConsumeBacklogResult>`("ok"/"already"/"warning") — idempotency 는 YAML.parse 로 판단하되 쓰기는 라인 단위여서 사용자 frontmatter 형식이 보존된다. silent fail 0
│   ├── archive.ts              — generation 아카이빙 (life → lineage). archiveGeneration (status: completed) + archiveEarlyClose (status: partial + closeMeta)
│   ├── cruise.ts               — cruise mode 관리 ("N/M" 포맷, parse/advance/clear/set)
│   ├── git.ts                  — git 연동 (commit, diff, push, pull, fetch, branch analysis). `gitPush` 는 `GitPushResult { success, error }` 를 돌려준다 — `boolean` 은 실패 이유를 버렸고 `push.ts` 가 그 자리를 추측으로 메웠다. `describeExecError` 가 stderr → stdout → `err.message` 순으로 건진다. 나머지 래퍼(`gitFetchAll`/`gitPullFfOnly`/…)는 여전히 `catch { return false }` 다
│   ├── hooks.ts                — lifecycle hook engine (조건부 실행, 순서 제어, 상세 결과)
│   ├── clarity.ts              — clarity level 자동 판단 (규칙 기반, high/medium/low + signals)
│   ├── prompt.ts               — subagent prompt 공통 모듈 (loadReapKnowledge, buildBasePrompt, buildStrictSection, memory 로딩, cruise 지시, clarity 주입, strict HARD-GATE). `buildEvaluatorPrompt(knowledge, paths, state, { stage })` 는 reap-evaluate 용 dynamic context. `buildBasePrompt` 는 `config?.daemon === true` 시 Code Intelligence 절을 붙이되, **주입된 `DaemonAvailability` 가 미설치/구버전이면 질의 프로토콜 대신 설치 안내로 교체**한다 — 미주입(undefined)은 "모름"이며 기존 동작을 유지
│   ├── scanner.ts              — 프로젝트 스캔 (init용)
│   ├── fs.ts                   — 파일 유틸리티
│   ├── output.ts               — JSON 출력 (emitOutput, emitError). lifecycle 명령(DUMP_COMMANDS 화이트리스트) 종료 시 sync dump를 자동 트리거
│   ├── migration.ts            — Migration instruction layer. `detectPendingMigrations(config, pkgVersion, templatesDir?)` — `lastMigratedVersion < v <= pkgVersion` 범위의 `src/templates/migration/vX.Y.Z.md` 파일 로드, semver 정렬. `buildPendingMigrationsSection` — pending 있을 때만 markdown 절 반환. `migrationTemplatesDir()` — dist/dev 분기 (패턴). 비교는 `core/semver.ts` 가 소유한다(자체 구현을 갖고 있었고 `check-version.ts` 의 사본과 답이 달랐다). note 선택만 `releaseLineGt` 로 **코어만 비교** — `X.Y.Z-alpha.N` 을 돌리는 사람은 X.Y.Z 코드를 돌리므로 그 note 를 받아야 하고, 정순서를 쓰면 prerelease 테스터에게만 숨는다. 3 caller (update.ts / load-context.ts / dump-state-sync.ts) 공유.
│   ├── dump-state-sync.ts      — `buildKnowledgeContextSync` + `dumpStateSync`. emitOutput 용 sync 버전이며 async `load-context` 와 **byte-identical** (unit 으로 고정). `buildDaemonStaticSection()` 을 async builder 와 공유하고, readiness probe 는 sync 제약상 의도적으로 제외. pending migrations 절 포함
│   ├── dump-state-helper.ts    — `dumpStateBestEffort` (async, silent on error). 향후 async caller용
│   ├── integrity.ts            — .reap/ 구조 진단 (checkIntegrity, detectV15, cleanupLegacyProjectSkills). **`checkUserLevelArtifacts(projectRoot, canonicalDirs = [], home = homedir())` — gen-076: adapter 의 정식 설치 위치를 주입받아 검사 대상에서 제외. `core` 는 adapters 를 import 하지 않으며 호출부(`fix.ts`)가 `getAdapter().userLevelDirs()` 를 넘긴다. 미주입 시 해당 검사 skip (오탐보다 안전).**  크기 warning: genome 파일별(application 250 / evolution 300 / invariants 50), memory tier 50/70/60, environment summary 250줄 — 수치 근거는 코드 주석 + `reap-guide.md` § File Size Guidelines. **warnings only**, `fixProject` 에 대응 코드 없음이 auto-delete 방지 장치
│   ├── notice.ts               — release notice (fetchReleaseNotice: RELEASE_NOTICE.md에서 버전+언어별 노트 추출)
│   ├── report.ts               — auto issue report (autoReport: gh issue create wrapper, best-effort)
│   ├── template.ts             — artifact 템플릿 복사
│   └── vision.ts               — vision goals 파싱, gap 분석, 다음 goal 제안, 프로젝트 진단, vision 발전 제안 (adapt phase 지원). lineage 편향 분석 제거됨
├── cli/
│   ├── index.ts                — CLI 진입점, 커맨드 라우팅 (init, status, config, run, make, cruise, install-skills, fix, destroy, clean, check-version, update, load-context, dump-state, daemon).
│   │                             **`program.parse()` 앞에서 `ensureUserLevelAssets` 를 await** — 명령을 가리지 않는다.
│   │                             `postinstall` 이 안 돈 사용자가 가진 것은 바이너리 하나이므로 그것을 부르는 것 자체가 조건이다
│   └── commands/
│       ├── init/               — 프로젝트 초기화 (greenfield/adoption 자동 감지, --repair, --migrate 지원)
│       ├── migrate.ts          — v0.15→v0.16 마이그레이션 (multi-phase: confirm→execute→vision→complete)
│       ├── check-version.ts    — postinstall/SessionStart용: v0.15 legacy cleanup + autoUpdate 자동 업데이트 + autoUpdateMinVersion guard + release notice 표시 (semverGte, queryAutoUpdateMinVersion, queryLatestVersion, performAutoUpdate, handOffToNewBinary, checkAutoUpdateGuard)
│       ├── load-context.ts     — SessionStart hook용: dynamic context 주입 (buildKnowledgeContext, hookSpecificOutput JSON 출력). Current State/Strict/Language 3개 dynamic 섹션만 출력한다 (~1KB) — static knowledge(genome/env/vision/memory/reap-guide)는 CLAUDE.md 의 `@` import refs 로 Claude Code 가 직접 로드하므로 여기서 다루지 않는다. 비-REAP 디렉토리에서는 silent exit
│       ├── dump-state.ts       — `.reap/.session-state.md`에 동일 dynamic context 기록 (--stdout/--silent 지원). OpenCode plugin과 외부 도구용. emitOutput이 lifecycle 명령 종료 시 sync 버전(dump-state-sync.ts)으로 자동 dump
│       ├── run/                — stage 실행 (21 handlers)
│       │   ├── start.ts        — generation 생성 (scan → create). create phase 에 **backlog gate**: `--backlog`/`--no-backlog` 없이 pending > 0 이면 `status: prompt`/`phase: select-backlog` 로 멈춘다 (idempotent). `consumeBacklog` warning 은 `context.backlogWarning` 으로 surface. create 직후 `config?.daemon === true` 시 `ensureRegistered` + `triggerIndexing`
│       │   ├── learning.ts     — 탐구 (work → complete). work phase 는 `config?.daemon === true` 시 `ensureRegistered` + `triggerIndexing` (silent on failure) 후 `daemonEnabled` / `daemonReady` / `daemonInstalled` 를 emit
│       │   ├── planning.ts     — 계획 (work → complete)
│       │   ├── implementation.ts — 구현 (work → complete). complete phase 는 `config?.daemon === true` 시 `triggerIndexing`
│       │   ├── validation.ts   — 검증 (work → complete). `config.evaluator === true` 시 work prompt 에 "Evaluator Subagent Invocation" 절 + `context.evaluator.{enabled, prompt}`; `false` 면 byte-identical. advisor 모델 — builder 가 verdict 를 갖고 evaluator concern 을 surface 한다. `--phase report-evaluator --severity <high|low|none> --summary "..."` 는 transition graph **밖**에서 `state.evaluatorConcerns` 에 append (nonce 없음), severity=none 은 no-op
│       │   ├── completion.ts   — 완료 (reflect → fitness → adapt → commit). fitness work 는 `evaluator: true` 시 `buildEvaluatorPrompt({ stage: "fitness" })` 를 emit 하고, `state.evaluatorConcerns` 가 비어있지 않으면 "Prior Evaluator Concerns" 절을 붙인다. **cruise + high-severity → `clearCruise()` + supervised fallback prompt + 즉시 return** (self-loop nonce 는 보존). commit phase 의 `triggerIndexing` 은 `config?.daemon === true` 게이트
│       │   ├── evolve.ts       — 전체 lifecycle 자동 실행
│       │   ├── detect.ts       — merge: 분기점 감지
│       │   ├── mate.ts         — merge: genome 교차
│       │   ├── merge.ts        — merge: 소스 병합
│       │   ├── reconcile.ts    — merge: 정합성 검증
│       │   ├── next.ts         — 다음 stage 자동 진행
│       │   ├── back.ts         — 이전 stage 회귀
│       │   ├── abort.ts        — generation 중단 (2-phase: confirm → execute)
│       │   ├── push.ts         — git push (상태 검증 포함)
│       │   ├── pull.ts         — git fetch + branch 분석 + prompt 반환
│       │   ├── knowledge.ts    — genome/environment/vision/memory 관리 (reload/genome/environment/memory)
│       │   ├── report.ts       — 수동 issue report (AI prompt 기반, privacy gate 포함)
│       │   └── early-close.ts  — early-close lifecycle path (lightweight 종료, impl/validation only). 2-phase confirm→execute. status: partial archive + deferred backlog 자동 승계.
│       ├── config.ts            — 프로젝트 설정 조회 (config.yml → JSON 출력)
│       ├── status.ts           — 현재 상태 조회
│       ├── fix.ts              — .reap/ 구조 진단 및 복구 (--check 옵션)
│       ├── destroy.ts          — REAP 완전 제거 (--confirm 필수, .reap/ + CLAUDE.md + .gitignore)
│       ├── clean.ts            — 선택적 상태 초기화 (--lineage, --life, --backlog, --hooks)
│       ├── update.ts           — 프로젝트 업데이트 (v0.15→migrate 위임, v0.16→config backfill/디렉토리 보충/CLAUDE.md 보수, --post-upgrade 지원)
│       └── daemon/             — daemon 서브커맨드
│           ├── index.ts        — daemon 커맨드 라우팅 (start, stop, status, query)
│           ├── client.ts       — daemon HTTP 클라이언트 (auto-spawn) + **위치 결정의 단일 소유자**: `locateDaemon` 이 env > config > package > checkout 순으로 찾고 `resolveDaemonBin` 은 `.bin` 만 돌려주는 래퍼(프로덕션 소비자는 없다 — `ensureDaemon` 이 `explicitMiss` 를 잃지 않으려고 `locateDaemon` 을 직접 쓴다). **안내 문구 소유자 2개**: `staleDaemonRemedy`(낡음) / `missingDaemonRemedy`(미설치). 후자는 `DaemonNotInstalledError` 와 `daemon status/index/query` 가 공유한다
│           └── lifecycle.ts    — generation 시작/완료 시 자동 인덱싱 훅
├── libs/cli.ts                 — 자체 CLI 프레임워크 (~858 lines)
├── adapters/                   — AI client 어댑터 (dispatcher + module 패턴)
│   ├── index.ts                — `getAdapter(agentClient)` → AdapterModule (codex 는 helpful Error, unknown 은 claude-code fallback).
│   │                             `resolveAgentClient(cwd)` — config.yml 에서 client 판정 (install-skills 와 공유).
│   │                             **`ensureUserLevelAssets({cwd, version, home?})`** — `~/.reap/.install-stamp` 의 client 별 버전과
│   │                             비교해 필요할 때만 설치. `"synced"|"partial"|"current"|"failed"`, silent · never throws.
│   │                             **`complete` 일 때만 stamp** — 부분 설치를 성공으로 굳히면 그 자체가 무증상 실패가 된다
│   ├── types.ts                — AdapterModule (installSkills / ensureProjectIntegration / registerSessionIntegration /
│   │                             **syncUserLevelAssets(home?) → UserLevelSyncResult{complete, missing}** / **userLevelDirs(home?)** —
│   │                             후자는 정식 설치 위치의 단일 소유자이며 integrity checker 가 주입받는다 (issue #22))
│   ├── claude-code/
│   │   ├── index.ts            — wrapper. installSkills·registerSessionIntegration·syncUserLevelAssets 셋 다 install.ts 의
│   │   │                         `syncUserLevelAssets` 를 경유한다 (목록을 아는 곳은 하나)
│   │   ├── install.ts          — **`syncUserLevelAssets(home)` = 사용자 레벨 자산 일습의 단일 소유자**: slash commands
│   │   │                         (`~/.claude/commands/reap.*.md`) + agents (`~/.claude/agents/reap-*.md`, prefix-anchored)
│   │   │                         + `~/.reap/reap-guide.md` + SessionStart hook (settings.json). `home` 전 계층 주입.
│   │   │                         guide·hook installer 가 성공 여부를 반환하고 `missing` 이 모은다
│   │   └── skills/             — 19 slash command files (.md). OpenCode adapter 도 본 디렉토리를 source 로 재사용 (single source)
│   └── opencode/               — OpenCode 어댑터
│       ├── index.ts            — wrapper
│       ├── install.ts          — project-level: opencode.json instructions/plugin sync (REAP_INSTRUCTIONS 9 + REAP_PLUGIN_ENTRY),
│       │                         AGENTS.md marker-hash sync, `.opencode/plugins/reap-plugin.ts` 배치.
│       │                         user-level: **`syncUserLevelAssets(home)`** = guide + `installSlashCommands` + `installAgents`.
│       │                         경로 helper `opencodeConfigDir`/`opencodeCommandsDir`/`opencodeAgentsDir` (agent 는 singular).
│       │                         **`toOpenCodeAgent(source)`** 가 frontmatter 를 OpenCode 스키마로 변환한 뒤 write —
│       │                         claude-code 스키마를 그대로 `cp` 하면 (`tools` 문자열 vs record) **OpenCode 전체가 멈춘다**
│       ├── plugin/
│       │   └── reap-plugin.ts  — OpenCode plugin source (session.created + tool.execute.before, inline 타입)
│       └── templates/
│           └── agents.md       — AGENTS.md template (client-agnostic, reap-guide reference, slash commands 안내 절 포함)
└── templates/                  — 템플릿 파일
    ├── reap-guide.md           — REAP 도구 가이드 (subagent prompt에 주입)
    ├── agents/                 — agent 정의 템플릿
    │   ├── reap-evolve.md      — evolve agent (generation lifecycle executor)
    │   └── reap-evaluate.md    — evaluator agent (독립 검증, fitness 평가, vision 관리)
    └── artifacts/              — stage별 artifact 템플릿
        ├── normal/             — 01~05 (learning~completion)
        └── merge/              — 01~06 (detect~completion)

daemon/                            — 별도 npm 패키지 (@c-d-cc/reap-daemon). 상세는 daemon/ 자체 참조
├── src/                           — 진입점 + HTTP(server/router) + registry/process/paths/types + api/
│   ├── package-assets.ts          — packageRoot/queriesDir/packageVersion. **src/ 바로 아래**라 소스와 번들의
│   │                                상대 깊이가 일치해 dist/dev 분기가 필요 없다
│   └── indexer/                   — parser(Tree-sitter WASM 15개 언어) · scanner(git) · graph · storage(SQLite)
│                                    · pipeline · import/call-resolver · impact · community · process-tracer
├── queries/                       — Tree-sitter SCM 쿼리 (15개 언어)
└── tests/                         — daemon 테스트 (25 파일, 130 tests)

**배포**: reap 의 dependency 가 아니다. 사용자가 `npm i -g @c-d-cc/reap-daemon` 으로 직접 설치하고, 발행은 `daemon-v*` 태그가 트리거한다. `files` 는 `dist/` + `queries/` 만 (14.2KB / 17파일). 빌드는 **`daemon/scripts/build.sh` 하나가 소유**하며 `package.json` 의 `"build"` 가 그것을 호출한다 — 두 곳이 알면 어긋난다.

**`better-sqlite3` · `web-tree-sitter` · `tree-sitter-wasms` 는 external.** 번들이 네이티브 모듈을 인라인하면 `bindings` 가 번들 위치 기준으로 `.node` 를 찾아 **node 에서 전부 실패**한다 (bun 만 우연히 동작했다). `queries/` 는 런타임 자산이며 빠지면 daemon 이 뜨고 health 에도 답하면서 **심볼을 0개 추출**한다.
```

## docs/ — reap.cc 문서 사이트

별도 repo 가 아니라 **본 repo 안의 Vite + React 앱**이다 (`docs/`, 자체 `package.json`). `.github/workflows/docs.yml` 이 `docs/**`, `media/**`, `README*.md` 변경을 main push 시 GitHub Pages 로 배포하고(`docs/public/CNAME` = `reap.cc`), `index.html` 을 `404.html` 로 복사해 SPA fallback 을 만든다. 빌드는 `cd docs && npx vite build` → `docs/dist/public/`.

콘텐츠는 마크다운이 아니라 **`docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts`** — 5개 로케일 각각이 전체 문서 텍스트를 담은 TS 객체다. changelog 는 각 로케일의 `releaseNotes.versions[]` 배열(최신이 첫 원소).

**주의**: TS 객체이므로 구문 오류 시 빌드가 깨진다 — 수정 후 반드시 `npx vite build` 확인. 그리고 5개 로케일을 **모두** 갱신해야 한다. 일부만 고치면 로케일 drift 가 생기며 `scripts/check-docs-version.sh` 가 이를 검사한다.

## Tests

### tests/ submodule (reap-test repo, main branch)

현재 baseline — **unit 568 / e2e 292 / scenario 44, 세 스위트 모두 0 fail.** daemon 자체 스위트는 별도로 `cd daemon && bun test tests/` → **130 pass**. 이 수치와 다르면 회귀를 의심할 것 (다음 세대가 판단하는 기준이므로 변경 시 갱신).

`tests/scenario/multi-generation.test.ts` 는 gen-065 backlog gate 를 시나리오로 커버한다 — pending 이 있으면 `run start` 가 `status: "prompt"` 로 막히고, `--backlog`(소비) 또는 `--no-backlog`(유지) 로 재호출해야 진행된다. 새 scenario 가 backlog 파일을 만든다면 같은 gate 를 거치므로 이 패턴을 참고할 것.

지원 자산:
- `tests/helpers/setup.ts` — `cli` / `cliRaw` / `setupProject` / `setupGitProject` / `advanceStage` / `cleanup`. 대부분의 e2e·scenario 가 여기만 import 한다. **`cli()` 는 HOME 을 격리하지 않는다** — CLI 진입점이 사용자 레벨 자산을 동기화하므로 스위트 실행이 개발자의 실제 `~/.claude/`·`~/.reap/` 에 버전당 1회 쓴다. 사용자 레벨을 다루는 테스트는 `cliWithHome`(각 파일 로컬, `XDG_CONFIG_HOME` 도 함께 제거) 을 쓴다
- `tests/helpers/daemon.ts` — daemon 격리 helper. `spawnTestDaemon(port, fakeHome)` 가 `bun src/index.ts` 를 spawn. `TEST_DAEMON_PORT=17225` + HOME override 로 사용자 daemon(17224) 영향 0. **소스만 보므로 배포 산출물 결함은 못 본다** — 그쪽은 자기진단 게이트 § 5 가 담당한다
- `tests/fixtures/daemon-sample/` — daemon e2e 용 소형 TypeScript 프로젝트(5 파일). 심볼 관계 `main → validateId + formatUser`. helper 가 매번 tmpdir 복사 + git init

버전 의존 assertion 주의: `tests/e2e/update-migration.test.ts` 는 패키지 버전을 `package.json` 에서 읽는다(`PKG_VERSION`). 릴리즈 버전을 하드코딩하면 bump 마다 깨진다 — 단, "특정 버전의 migration note"를 검증하는 케이스는 하드코딩이 맞다.

**테스트는 머신 상태를 읽지 않는다 (gen-081).** CI 를 붙이면서 세 곳이 개발자 머신에 의존하고 있었음이 드러났다. 새 테스트를 쓸 때 같은 함정을 피할 것:

- **git identity 는 저장소마다 설정한다.** 러너에는 global config 가 없어 `git commit` 이 거부된다. `git clone` 과 `submodule add` 로 생긴 저장소는 상속받지 못하므로 각각 필요하다
- **`git init` 은 항상 `-b main` 으로 브랜치를 명시한다.** 미명시 시 머신의 `init.defaultBranch` 를 따르고, 미설정이면 `master` 다. 직후 `checkout -b` 로 갈아타 무해한 곳까지 전부 명시해 두었다 — 무해 여부를 매번 판단하게 두면 다시 걸린다
- **`mock.module` 은 프로세스 전역이며 되돌릴 수 없다.** `afterAll` 로 복구해도 소용없다 (bun 은 모든 파일을 로드한 뒤 실행). 그래서 `test:unit` 이 `--isolate` 를 쓴다. `pull.test.ts` 상단 주석에 근거가 있다. **bun 을 직접 호출해 unit 을 돌리면 이 보호가 없다**

리눅스 러너 조건은 `oven/bun:<ver>-debian` + `apt-get install git` + `-e GIT_CONFIG_GLOBAL=/dev/null` 로 만든다 (기본 `oven/bun` 에는 git 이 없다).

### scripts/ (프로젝트 루트)
- `scripts/build.sh` — bun build + 정적 자산 복사 (claude-code skills, opencode plugin/templates)
- `scripts/alpha-publish.sh` — alpha 배포 헬퍼
- `scripts/postinstall.sh` — npm postinstall hook
- `scripts/check-self-diagnosis.sh` — **자기진단 게이트**. `npm pack` → 격리 HOME/prefix 에 설치 → `reap init` → `fix --check` 가 **경고·에러 0** 을 요구. 7개 절: 빌드·설치·init·진단 / daemon / **install script 차단** / OpenCode. release publish 앞 + CI 매 push 양쪽에서 실행. 대화로 채워지는 genome/goals 는 스크립트가 채운 뒤 진단 — 그것까지 요구하면 REAP 정상 동작에 fail 한다. daemon 절은 항상 실행된다 — 끄는 스위치는 두지 않고, 비용이 문제가 되면 release 전용으로 옮긴다
- `scripts/list-carriers.sh` — **carrier 표식 조회 (gen-078)**. `reap:carrier(<id>)` 마커를 grep 해 ID 별 파일 목록 출력. `--orphans` 는 1개 파일에만 있는 ID 탐지 — 표식 불필요이거나 **다른 carrier 를 빠뜨린 것**(#21/#22 의 상태)
- `scripts/check-agent-integration.sh` — **agent 통합 검증 / 층2 (gen-079)**. 헤드리스 `claude -p` 로 `/reap.start` 를 시키고 **`current.yml` 생성 여부**로 판정 — agent 응답(자연어)은 파싱하지 않는다. slash command 인식 / `@` import 로드 / SessionStart hook 발화 / CLI 동작을 한 번에 검증. **격리하지 않는다** — Claude Code 는 로그인을 slash command 와 같은 `~/.claude/` 에 두므로 HOME 격리 시 인증을 잃는다. 현재 설치를 읽기만 하고 임시 프로젝트에만 쓴다. **~$0.25/회** 라 CI 아닌 릴리즈 전 (`reapdev.versionBump` Step 5-2)
- `scripts/check-version-floors.sh` — **버전 하한 게이트**. reap 이 사용자에게 "이 버전으로 올려라"라고 말하는 두 숫자(`MIN_DAEMON_VERSION`, `package.json` 의 `reap.autoUpdateMinVersion`)가 npm 에 **실제로 발행돼 있는지** 검사한다. 값은 소스에서 읽는다(carrier 표식). 네트워크 실패·비-JSON 은 amber SKIP, **패키지 자체가 없으면(`E404`) FAIL** — 그 둘을 구분하지 않으면 이름 오타가 조용히 통과한다. `release.yml` 의 `npm publish` 앞. **CI 에는 없다** — 매 push 마다 네트워크가 필요하고, 코드와 무관한 이유로 주기적으로 SKIP 을 내는 검사는 사람이 스크롤로 넘긴다
- `scripts/check-docs-version.sh` — 릴리즈 문서 정합성 게이트. `RELEASE_NOTICE.md` / `RELEASE_NOTES.md` / 5개 로케일 changelog 가 `package.json` 과 일치하는지 + **로케일 간 항목 집합 동일성** + migration note 가 패키지 버전을 넘지 않는지 검사. `release.yml` 의 `npm publish` 앞과 `reapdev.versionBump` Step 5-1 에서 실행

### npm scripts
- `npm run build` — bun build → 단일 번들 + 정적 자산 복사 / `npm run dev` — bun 직접 실행(빌드 불필요) / `npm run typecheck` — tsc --noEmit
- `npm run test:unit` — bun test **--isolate** tests/unit/ (격리 이유는 위 Tests 절)
- `npm run test:e2e` / `npm run test:scenario` / `npm run test` (전체)
- `postinstall` — skill 자동 설치 + v0.15 감지 안내

## Types (주요 타입)
- `HookResult` — hook 실행 결과 (name, event, type, status, exitCode, stdout, stderr, content, skipReason)
- `ReapHookEvent` — 라이프사이클 hook 이벤트 union type (14개 이벤트)
- `ReapOutput.status` — `"ok" | "prompt" | "error" | "artifact-incomplete"`
- `EvaluatorConcern` — `{ stage: "validation" | "fitness", severity: "low" | "high", summary: string, recordedAt: string }`. Validation→fitness signalling channel. severity는 binary (Goodhart 회피). high = cruise auto-abort 트리거. `GenerationState.evaluatorConcerns?: EvaluatorConcern[]` 로 노출.
- `ReapConfig.daemon?: boolean` — opt-in flag. 미설정/false 시 4 lifecycle 진입점 (start/learning/implementation/completion) 의 daemon trigger 게이트 비활성. true 시 dynamic import 후 `ensureRegistered` + `triggerIndexing` 호출. 기존 사용자 회귀 0 보장.
- daemon 연동 타입/신호 — `ProjectEntry.lastIndexedCommit?: string \| null` (마지막 인덱스의 git HEAD; agent 가 현재 HEAD 와 비교해 staleness 판단). `ensureRegistered`/`triggerIndexing` 은 `Promise<boolean>` 을 반환하되 실패는 silent — caller 가 시그널만 활용한다. learning emit 이 `daemonEnabled` (항상) + `daemonReady` (daemon=true 시에만) 를 노출해 test/agent 가 config 분기를 검증한다.
- `DaemonAvailability` — `{ installed, bin, version, required, outdated, packageName, installCommand, source, explicitLabel, staleRemedy, explicitMiss, locateHint }`. `resolveDaemonAvailability()`(`daemon/client.ts`)가 소유하고 `core`(integrity)·`cli`(daemon/fix)·prompt 가 **주입받는다** — `core` 는 `cli` 를 import 하지 않는다. **미설치와 버전 미달은 별개 상태**이며 메시지도 다르다. 버전을 읽을 수 없는 경우는 `outdated` 로 치지 않는다. `locateHint` / `explicitLabel` / `staleRemedy` 도 값에 실려 이동한다 — 그래야 `core` 가 환경변수명·config 키를 철자하지 않는다. **낡은 daemon 을 어떻게 고치는가는 어디서 찾았는가에 달렸다** (`staleDaemonRemedy`): `env`/`config` 는 사용자가 지목한 경로라, `checkout` 은 npm 설치가 아니라 전역 설치로 대체되지 않는다 — `npm i -g` 는 `package` 하나에만 옳고 넷 모두에 주어지고 있었다. 경로는 네 경우 모두 말한다(프로젝트 로컬 daemon 이 전역보다 우선하므로 `package` 에서도 전역 명령이 항상 옳지는 않다)
- `MIN_DAEMON_VERSION` (`daemon/client.ts`) — reap 이 요구하는 daemon 최소 버전. **단일 소유자**이며 문서에는 숫자를 적지 않는다 (reap 이 메시지로 알려준다). 판정 근거는 **설치된 패키지의 버전**이다 — `fix --check` 가 프로세스를 띄우면 안 되고, 너무 낡은 daemon 은 `/health` 조차 제대로 답하지 못할 수 있다. `/health` 의 `version` 은 **실행 중인 것**을 알려주는 별개 신호로 `daemon status` 가 나란히 표시한다
- `ReapConfig.daemonBin?: string` + `REAP_DAEMON_BIN` (gen-084) — daemon 위치 명시 지정. `readExplicitDaemonBins(env, cwd)` 가 둘을 읽고(env 우선), `~` 전개 + 프로젝트 루트 기준 상대경로 해석, 공백은 미설정 취급. **명시 경로에만 `isFile` 을 건다** — 디렉토리를 받아들이면 `installed: true` 가 되고 모든 진단이 조용해진다(가장 흔한 오타가 `/dist/index.js` 누락이다). 신원 검사는 하지 않는다 — 사람이 지목한 경로에 "우연히 남의 패키지"는 없고, 소스 체크아웃 지목을 막게 된다. **빗나가도 탐색을 멈추지 않고 `explicitMiss` 로 보고**한다: `config.yml` 은 커밋되므로 한 머신에서 맞는 경로가 다른 머신에는 없을 수 있다. `daemon status` 가 `bin`/`binSource` 를 보고해 설정 반영 여부를 확인할 수 있다(단 **띄울 대상**이지 실행 중인 것이 아니다 — 이미 떠 있으면 재사용된다). `VALID_CONFIG_FIELDS`(`update.ts`)에 반드시 있어야 한다 — 없으면 `reap update` 가 조용히 지운다
- `REAP_DAEMON_PORT` env var — daemon binary(`daemon/src/index.ts:resolvePort()`) 와 CLI client(`daemon/client.ts:resolvePort()` + call-time `getBaseUrl()`) 양쪽이 인식. 미설정 시 17224. e2e 는 17225 로 격리한다.
- `ReapConfig.lastMigratedVersion?: string` — 이 프로젝트가 어디까지 migration 됐는지 추적. 미설정 시 "0.0.0" fallback. `reap update --mark-migrated` 가 현재 패키지 버전으로 갱신. **CONFIG_DEFAULTS에 포함 금지** — optional tracking 필드이며 spurious config diff 유발.
- `PendingMigration` — `{ version: string, instructions: string }`. `detectPendingMigrations` 반환 타입. `reap update` context + load-context SessionStart + dump-state.md sync 3곳에서 동일 데이터 emit.

## Carrier Markers (gen-078)

여러 곳이 아는 사실에는 그 사실을 아는 파일마다 `reap:carrier(<id>)` 주석을 심는다. 값을 바꾸기 전에 `grep -rn "reap:carrier(<id>)" .` 또는 `bash scripts/list-carriers.sh` 로 전부 찾는다.

등록된 ID 와 파일 목록은 **`bash scripts/list-carriers.sh` 가 출력한다** — 여기에 옮겨 적으면 그것이 곧 어긋날 목록이 된다(이 원칙이 생긴 이유 그대로). 그래서 적지 않는다.

**공유 가능하면 표식보다 공유가 낫다** — 같은 값을 두 코드가 알면 DI·import 로 하나로 만들어 carrier 수를 줄인다. 표식은 공유가 불가능한 경우(문서, 다국어, prompt 문자열, 반환값 union)를 위한 것이다.

<!-- reap:carrier(self-diagnosis-covered-incidents) -->
## CI / Release 게이트 (gen-073, gen-078, gen-079, gen-081, gen-083)

| 시점 | 검사 | 어디서 | 비용 |
|---|---|---|---|
| `ci.yml` (매 push) | build + **자기진단**(층1, claude-code + **OpenCode**) | reap | 무료 |
| main push | **테스트 전체** (unit/e2e/scenario) | **reap-test** | 무료 |
| `release.yml` (`v*` 태그) | 문서 정합성 + **버전 하한** + 자기진단 + build + publish | reap | 무료 |
| `release.yml` (`daemon-v*` 태그) | 태그↔버전 일치 + build + daemon test + tarball 자산 → **daemon publish** | reap | 무료 |
| 릴리즈 전 수동 (`reapdev.versionBump` 5-2) | **agent 통합**(층2) | 로컬 | ~$0.25 |

**층1 vs 층2**: 층1 은 "파일이 올바른 위치에 올바른 내용으로 놓였는가", 층2 는 "클라이언트가 그것을 실제로 읽는가". 후자는 전자로부터 추론할 수 없다 — gen-063 은 파일 검증을 전부 통과하고도 slash command 가 노출되지 않았다.

**게이트가 잡는다고 적힌 사례는 실제로 재현해 확인한 것만 적는다.** gen-078 이 세 사례를 적었는데 그중 daemon 항목이 **거짓이었고 다섯 세대를 살아남았다** — CI 는 내내 초록이었다. 재현할 때는 관련 코드를 아무렇게나 망가뜨리는 것으로 충분하지 않다: 재현 실패는 "주장이 거짓"이 아니라 **"내 변형이 그 결함이 아니다"** 일 수 있다.

### 자기진단은 배포 산출물에서 daemon 을 실행한다

daemon 절(§ 5)은 **소스 트리를 보지 않는다** — 거기서는 의존이 해석되므로 결함이 존재할 수 없다. tarball → 격리 설치 → **node 로 실행** → 실제 소스 인덱싱 → **심볼 수**. 각 § 가 왜 그 자리에 그 형태로 있는지는 스크립트 자신의 주석이 소유한다. 스크립트를 열지 않고 알아야 할 것만 여기 적는다:

- **bun 이 아니라 node 로 판정하고, 판정 근거는 startup 이 아니라 심볼 수다.** 뜨고 health 에 답하고 인덱싱 성공을 보고하면서 심볼이 0개인 것이 네이티브 바인딩 결함의 모습이었다
- **절의 순서가 의미를 갖는다.** § 5d-bis(명시 경로가 구제하는가)는 5d 와 5e **사이**에서만 물을 수 있다 — 그 지점에서만 daemon 이 디스크에 있고, 동작하며, reap 이 못 본다. 새 시나리오를 끼울 때 이 성질을 먼저 확인할 것
- **부재를 주장하는 assertion 은 스스로 먼저 증명한다.** 크래시·비정상 출력·필드명 변경도 "부재"로 읽히므로 `status: "ok"` 와 숫자 `warningCount` 를 요구한 뒤에야 내용을 본다. `grep -q` 로 없음을 확인하는 자리는 전부 같은 취약성을 갖는다
- **비용은 미측정이고 끄는 스위치는 두지 않는다.** `better-sqlite3` 가 두 번 설치되므로 리눅스에서 prebuilt 를 못 받으면 소스 컴파일이 두 번이다. 후퇴가 필요하면 release 전용으로 옮기는 것이 호출 한 줄 — 꺼진 채로 통과를 보고하는 환경변수보다 낫다
- 게이트는 `daemon/dist` 를 지우고 재빌드한다 — **로컬 실행이 작업 트리를 건드리는 유일한 지점**(gitignore 대상이라 무해)

### 자기진단은 install script 가 차단된 설치도 본다

§ 6 은 같은 tarball 을 `--ignore-scripts` 로 한 번 더 설치한다. npm 12 부터 전역 설치의 lifecycle script 는 기본 차단이고, REAP 의 사용자 레벨 자산은 그때까지 `postinstall` 하나에만 걸려 있었다 — 바이너리는 돌고 통합은 없고 오류도 없었다.

- **npm 버전으로 조건을 추론하지 않고 `--ignore-scripts` 로 강제한다.** `release.yml` 이 게이트를 node 번들 npm 에 고정하므로, 버전 판정은 그 고정이 바뀌는 날 **아무것도 재현하지 않으면서 pass 를 보고**하게 된다. 부재 선단언(위 daemon 절의 같은 규칙)이 그 퇴화를 막는다. 기대 개수는 설치된 패키지에서 센다
- **잡지 못하는 것**: claude-code 만 본다. "차단 + OpenCode" 는 fake-home unit/e2e 로만 덮인다. 그리고 `reap init` 하나로 판정하므로 "어떤 명령이든 복구한다"는 e2e 쪽이 증명한다

### 자기진단은 두 클라이언트를 본다 (gen-082)

`check-self-diagnosis.sh` 는 tarball 설치 후 (1) claude-code 프로젝트로 `fix --check` 가 아무것도 보고하지 않을 것, (2) **`agentClient: opencode` 로 바꿔 `install-skills` 한 뒤 `opencode agent list` 가 exit 0 이고 `reap-evolve`/`reap-evaluate` 를 나열할 것** 을 요구한다.

(2)가 필요한 이유는 실패 양상이 클라이언트마다 다르기 때문이다 — **OpenCode 는 설정 검증이 all-or-nothing 이라 REAP 이 쓴 파일 하나가 `opencode` 명령 전체를 죽인다** (gen-080). Claude Code 에는 이 양상이 없다. 그리고 `reap init` 은 claude-code 만 만들므로 opencode 경로는 그 전까지 어느 게이트도 지나지 않았다.

- **exit 0 만 보면 안 된다** — `agent list` 는 agent 가 하나도 없어도 exit 0 이다. 목록 확인이 함께 있어야 "아무것도 설치하지 않음"이 통과하지 않는다
- **격리는 `HOME` + `XDG_CONFIG_HOME` 두 축** — 하나만으로는 새어나간다. 아래 XDG 절 참조
- **모델 호출 없음** — 설정 파싱뿐이라 무료. 그래서 층2(유료)와 달리 CI 에 있다
- CI/release 워크플로가 `npm i -g opencode-ai` 로 클라이언트를 설치한다. **버전 미고정** — 묻는 것이 "현재의 OpenCode 가 받아들이는가"이므로 upstream 스키마 변경으로 red 가 되는 것이 의도된 신호다
- `opencode` 부재 시 **amber SKIP 을 출력**하고 통과한다. 조용한 exit 0 은 "검사했고 깨끗하다"로 읽힌다
- **잡지 못하는 것**: slash command 는 `opencode command list` 같은 CLI 표면이 없어 검증할 수 없다. 검사한 opencode 버전은 스크립트가 출력하므로 로컬/CI 판정이 갈리면 근거가 남는다

### OpenCode 경로는 `XDG_CONFIG_HOME` 을 따른다 (gen-082)

`~/.config/opencode/` 는 **기본값일 뿐**이다. OpenCode 는 XDG base directory 규격을 따르므로 `XDG_CONFIG_HOME` 이 설정되면 `$XDG_CONFIG_HOME/opencode/` 를 읽는다.

`opencodeConfigDir(home, xdgConfigHome)` 이 이 판정을 소유하고 `opencodeCommandsDir` / `opencodeAgentsDir` 가 경유한다. **`process.env` 를 직접 읽지 않고 매개변수로 받는다** — 테스트가 fake home 을 쓰면서 실제 값이 새어들면 임시 디렉토리 밖에 쓰게 된다. 빈 문자열/공백은 미설정으로 취급(XDG 규격).

**테스트에서 `HOME` 을 가짜로 줄 때는 `XDG_CONFIG_HOME` 도 함께 처리해야 한다** — 하나만 바꾸면 격리가 성립하지 않는다:
- unit: `beforeAll` 에서 삭제 + `afterAll` 복원
- e2e: 자식 프로세스 env 에서 제거 (`cliWithHome` 헬퍼 2곳)

이 결함은 **개발자 로컬에서 재현되지 않는다** (변수가 없으므로). CI 조건은 `XDG_CONFIG_HOME=/tmp/probe npm run test:...` 로 만들 수 있다. GitHub 러너는 `XDG_CONFIG_HOME=/home/runner/.config` 를 설정한다.

claude-code adapter 는 `~/.claude/` 를 쓰며 XDG 와 무관하다.

### 테스트는 reap-test 에서 돈다 (gen-081)

`tests/` 는 private submodule(`c-d-cc/reap-test`)이고 기본 `GITHUB_TOKEN` 으로 가져올 수 없다. PAT 으로 가져오는 것은 가능하나 **reap 이 public 이라 워크플로 로그가 공개**된다 — `bun test` 는 테스트 이름을 전부 출력하므로 private 으로 지킨 것이 로그로 새고, **한 번 나간 로그는 되돌릴 수 없다.**

그래서 실행 주체를 뒤집었다. reap 의 main push 가 `dispatch-tests` job 으로 `repository_dispatch` 를 보내고, `reap-test/.github/workflows/test.yml` 이 reap 을 `./reap` 로, 자기 자신을 `./reap/tests` 로 checkout 해 배치를 재현한 뒤 build + 세 스위트를 돌린다. 테스트가 `<reap>/tests/` 위치를 하드코딩하므로 checkout 두 번이면 테스트 코드 수정이 필요 없다.

- **tests SHA 는 그 커밋의 submodule pointer** — main HEAD 가 아니다. 개발자가 실제로 검증한 조합을 재현하므로 red 의 원인이 코드인지 테스트인지 분리된다. pointer 를 갱신하지 않으면 낡은 조합이 테스트되어 실패한다 (설계된 동작)
- **PR 에서는 dispatch 하지 않는다** — fork 는 secret 을 받지 못하므로 돌리면 모든 외부 PR 이 red 가 된다. fork PR 은 build + 자기진단만 받고 둘 다 secret 불필요
- secret `TEST_DISPATCH_TOKEN` — `c-d-cc/reap-test` Contents:RW fine-grained PAT. **부재/만료 시 job 이 red** (`curl -f` + 명시적 exit 1). 조용히 건너뛰지 않는다
- 결과 알림은 GitHub 기본 알림. reap 의 커밋 화면에는 표시되지 않는다

현재 baseline 은 리눅스 러너에서 그대로 재현된다 (daemon e2e 포함, 제외 없음).

문서 게이트는 CI 에 없다 — 개발 중 `package.json` 이 문서보다 앞서는 것이 정상이라 상시 red 가 된다(gen-073 판단). 자기진단은 그런 성질이 없어 양쪽에 있다.

## Key Design Decisions

설계 원칙(파일 기반 상태 / JSON stdout / transition graph + nonce / 2-level compression / adapter pattern)은 **처방적이므로 `genome/application.md` 가 소유한다.** 여기에는 현재 상태로만 확인되는 두 가지만 남긴다.

- **Zero-dependency**: production dependency 는 `yaml` 하나. CLI 프레임워크도 자체 구현(`src/libs/cli.ts`). daemon 이 네이티브 의존을 지고 있어 **별도 패키지로 분리된 이유**가 이것이다
- **`reap make` pattern**: template 기반 resource 생성 (현재 `backlog`, `hook`)

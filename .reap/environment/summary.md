# Environment

## Project

- Source: `~/cdws/reap/` (branch: main)
- Package: `@c-d-cc/reap` v0.17.3
- Config language: korean

## Tech Stack

- Runtime: Bun (build), Node.js (execution)
- Build: `bun build` → single bundle (`dist/cli/index.js`, ~770KB)
- Dependencies: `yaml` v2 (유일한 production dependency)
- CLI Framework: 자체 구현 (`src/libs/cli.ts`) — commander/yargs 대신
- Crypto: Node.js native `crypto` (nonce, hash)
- VCS: Git (child_process 직접 호출)
- Type System: TypeScript 5.7, strict mode, ESM

## Source Structure

```
src/
├── types/index.ts              — 타입 정의 (GenerationState, ReapConfig, ReapOutput 등)
├── core/                       — 핵심 로직 (25 modules)
│   ├── lifecycle.ts            — stage 순서 정의 (next/prev) + transition graph (NORMAL_TRANSITIONS, MERGE_TRANSITIONS, getTransitions)
│   ├── generation.ts           — generation CRUD, ID 생성
│   ├── paths.ts                — .reap/ 경로 상수 (ReapPaths 인터페이스, memory/resources/docs 경로 포함)
│   ├── nonce.ts                — 암호학적 token (SHA256) — 순수 함수, generateToken/verifyToken
│   ├── artifact-check.ts        — artifact 미작성 감지 (core placeholder 기반)
│   ├── stage-transition.ts     — transition graph 기반 nonce 검증 (verifyTransition, setTransitionNonces, prepareStageEntry), artifact 검증, stage 전환
│   ├── maturity.ts             — bootstrap/growth/cruise 감지, 완성 기준 16항목
│   ├── lineage.ts              — 아카이브 DAG, genome diff (3-way), lineage 읽기, getLastLineageEntry (early-close hint 노출용)
│   ├── compression.ts          — 2-level lineage 압축 (L1: 5gen, L2: 100files)
│   ├── genome-suggest.ts       — init 시 genome 초안 생성
│   ├── backlog.ts              — backlog scan, consume, revert, create + createDeferredBacklog/extractUncheckedTasks/countCheckedTasks (early-close 승계용). **gen-065부터 `consumeBacklog`는 `Promise<ConsumeBacklogResult>` ("ok"/"already"/"warning") 반환 — YAML.parse로 idempotency 판단 + 라인 단위 manipulation으로 사용자 frontmatter 형식 보존. 4 케이스 graceful (status:pending 있음/없음/이미 consumed/frontmatter 없음). silent fail 0.**
│   ├── archive.ts              — generation 아카이빙 (life → lineage). archiveGeneration (status: completed) + archiveEarlyClose (status: partial + closeMeta)
│   ├── cruise.ts               — cruise mode 관리 ("N/M" 포맷, parse/advance/clear/set)
│   ├── git.ts                  — git 연동 (commit, diff, push, pull, fetch, branch analysis)
│   ├── hooks.ts                — lifecycle hook engine (조건부 실행, 순서 제어, 상세 결과)
│   ├── clarity.ts              — clarity level 자동 판단 (규칙 기반, high/medium/low + signals)
│   ├── prompt.ts               — subagent prompt 공통 모듈 (loadReapKnowledge, buildBasePrompt, buildStrictSection, memory 로딩, cruise loop 지시, clarity 주입, strict mode HARD-GATE) + **gen-066: `buildEvaluatorPrompt(knowledge, paths, state, { stage: "validation" | "fitness" })` — reap-evaluate subagent 용 dynamic context, advisor 모델 HARD-GATE 포함, fitness 통합용 stage 분기 미리 준비**. **gen-068: `buildBasePrompt` 가 `config?.daemon === true` 시 "Code Intelligence (Daemon)" 절 추가 — 단계별 활용 + 정체성 검사 protocol + fallback (daemon down / opt-out 시 silent skip).**
│   ├── scanner.ts              — 프로젝트 스캔 (init용)
│   ├── fs.ts                   — 파일 유틸리티
│   ├── output.ts               — JSON 출력 (emitOutput, emitError). lifecycle 명령(DUMP_COMMANDS 화이트리스트) 종료 시 sync dump를 자동 트리거 (gen-063)
│   ├── migration.ts            — Migration instruction layer (gen-071). `detectPendingMigrations(config, pkgVersion, templatesDir?)` — `lastMigratedVersion < v <= pkgVersion` 범위의 `src/templates/migration/vX.Y.Z.md` 파일 로드, semver 정렬. `buildPendingMigrationsSection` — pending 있을 때만 markdown 절 반환. `migrationTemplatesDir()` — dist/dev 분기 (gen-064 패턴). 3 caller (update.ts / load-context.ts / dump-state-sync.ts) 공유.
│   ├── dump-state-sync.ts      — `buildKnowledgeContextSync` + `dumpStateSync` (gen-063). emitOutput용 sync 버전. async load-context와 byte-identical 출력 (unit test로 검증). **gen-068: `buildDaemonStaticSection()` export — async builder(`load-context.ts`)와 같은 helper 공유. `config?.daemon === true` 시 daemon static knowledge 절 emit. readiness probe는 의도적으로 제외 (sync 환경 제약 + caller 위임).** **gen-071: pending migrations 절 추가 (migration.ts 공유).**
│   ├── dump-state-helper.ts    — `dumpStateBestEffort` (async, silent on error). 향후 async caller용 (gen-063)
│   ├── integrity.ts            — .reap/ 구조 진단 (checkIntegrity, detectV15, cleanupLegacyProjectSkills). **`checkUserLevelArtifacts(projectRoot, canonicalDirs = [], home = homedir())` — gen-076: adapter 의 정식 설치 위치를 주입받아 검사 대상에서 제외. `core` 는 adapters 를 import 하지 않으며 호출부(`fix.ts`)가 `getAdapter().userLevelDirs()` 를 넘긴다. 미주입 시 해당 검사 skip (오탐보다 안전).**  크기 warning: genome 파일별(application 250 / evolution 300 / invariants 50), memory tier 50/70/60, environment summary 250줄 — 수치 근거는 코드 주석 + `reap-guide.md` § File Size Guidelines. **warnings only**, `fixProject` 에 대응 코드 없음이 auto-delete 방지 장치
│   ├── notice.ts               — release notice (fetchReleaseNotice: RELEASE_NOTICE.md에서 버전+언어별 노트 추출)
│   ├── report.ts               — auto issue report (autoReport: gh issue create wrapper, best-effort)
│   ├── template.ts             — artifact 템플릿 복사
│   └── vision.ts               — vision goals 파싱, gap 분석, 다음 goal 제안, 프로젝트 진단, vision 발전 제안 (adapt phase 지원). lineage 편향 분석 제거됨 (gen-030)
├── cli/
│   ├── index.ts                — CLI 진입점, 커맨드 라우팅 (init, status, config, run, make, cruise, install-skills, fix, destroy, clean, check-version, update, load-context, dump-state, daemon)
│   └── commands/
│       ├── init/               — 프로젝트 초기화 (greenfield/adoption 자동 감지, --repair, --migrate 지원)
│       ├── migrate.ts          — v0.15→v0.16 마이그레이션 (multi-phase: confirm→execute→vision→complete)
│       ├── check-version.ts    — postinstall/SessionStart용: v0.15 legacy cleanup + autoUpdate 자동 업데이트 + autoUpdateMinVersion guard + release notice 표시 (semverGte, queryAutoUpdateMinVersion, queryLatestVersion, performAutoUpdate, handOffToNewBinary, checkAutoUpdateGuard)
│       ├── load-context.ts     — SessionStart hook용: dynamic context 주입 (buildKnowledgeContext, hookSpecificOutput JSON 출력). gen-062에서 정/동 분리 — Current State/Strict/Language 3개 dynamic 섹션만 출력 (~1KB). static knowledge(genome/env/vision/memory/reap-guide)는 CLAUDE.md의 `@` import refs로 Claude Code가 직접 로드. 비-REAP 디렉토리에서는 silent exit
│       ├── dump-state.ts       — `.reap/.session-state.md`에 동일 dynamic context 기록 (--stdout/--silent 지원). OpenCode plugin과 외부 도구용. emitOutput이 lifecycle 명령 종료 시 sync 버전(dump-state-sync.ts)으로 자동 dump
│       ├── run/                — stage 실행 (21 handlers)
│       │   ├── start.ts        — generation 생성 (scan → create). **gen-065부터 create phase에 backlog gate: `--backlog`/`--no-backlog` 모두 없고 pending > 0 시 `status: prompt`/`phase: select-backlog` emit + return. idempotent. `consumeBacklog` warning을 emitOutput `context.backlogWarning` 으로 surface (silent fail 방지).** **gen-068부터 create 직후 (state 저장 완료 시점) `config?.daemon === true` 시 `ensureRegistered` + `triggerIndexing` (dynamic import).**
│       │   ├── learning.ts     — 탐구 (work → complete). **gen-068부터 work phase 가 `config?.daemon === true` 시 `ensureRegistered` + `triggerIndexing` (dynamic import, silent on failure).**
│       │   ├── planning.ts     — 계획 (work → complete)
│       │   ├── implementation.ts — 구현 (work → complete). **gen-068부터 complete phase (auto-transition 직후) 에 `config?.daemon === true` 시 `triggerIndexing` 추가.**
│       │   ├── validation.ts   — 검증 (work → complete). **gen-066부터 `config.evaluator === true` 시 work prompt 에 "Evaluator Subagent Invocation" 절 + `context.evaluator.{enabled, prompt}` append. `evaluator: false` 시 prompt byte-identical (회귀 보장). advisor 모델 — builder 가 verdict 결정, evaluator concern surface, 호출 실패 시 통상 진행. gen-067부터 새 `report-evaluator` sub-phase 신설 — `reap run validation --phase report-evaluator --severity <high|low|none> --summary "..."` 가 transition graph 외부에서 `state.evaluatorConcerns` 배열에 append (nonce 검증/발급 없음). severity=none 은 no-op + ok. work prompt 에 builder 가 evaluator 응답 후 본 CLI 를 호출하라는 지시 (3 사용법) 자동 포함.**
│       │   ├── completion.ts   — 완료 (reflect → fitness → adapt → commit). **gen-067부터 fitness work 분기: (1) `evaluator: true` 시 `buildEvaluatorPrompt({ stage: "fitness" })` 호출 + `context.evaluator.{enabled, prompt}` emit (양 cruise/supervised 분기 공통), (2) `state.evaluatorConcerns` 비어있지 않으면 prompt 에 "Prior Evaluator Concerns" 절 추가 + `context.evaluatorConcerns` emit, (3) cruise + high-severity concern 시 `clearCruise()` 호출 + 별도 fallback prompt (`completed: [..., "cruise-aborted"]`, `context.cruiseAborted: true`, `previousCruiseCount`) emit + 즉시 return. self-loop nonce 보존 (builder 가 supervised feedback 재호출 가능).** **gen-068부터 commit phase 의 `triggerIndexing` 호출에 `config?.daemon === true` 게이트.**
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
│           ├── client.ts       — daemon HTTP 클라이언트 (auto-spawn)
│           └── lifecycle.ts    — generation 시작/완료 시 자동 인덱싱 훅
├── libs/cli.ts                 — 자체 CLI 프레임워크 (~858 lines)
├── adapters/                   — AI client 어댑터 (dispatcher + module 패턴)
│   ├── index.ts                — dispatcher: `getAdapter(agentClient)` → AdapterModule. codex는 helpful Error throw, unknown은 claude-code fallback
│   ├── types.ts                — AdapterModule interface (installSkills / ensureProjectIntegration / registerSessionIntegration / **userLevelDirs(home?) — gen-076: adapter 가 정식 설치 위치의 단일 소유자. integrity checker 가 이것을 주입받아 자기 설치 위치를 legacy 로 오탐하지 않는다 (issue #22)**)
│   ├── claude-code/
│   │   ├── index.ts            — AdapterModule wrapper. **registerSessionIntegration 이 installSlashCommandsOnly + registerSessionHooks 양쪽 호출 — `reap update` 흐름에서 ~/.claude/commands/ user-level sync 보장 (gen-064 T012)**
│   │   ├── install.ts          — skill 파일 설치 (~/.claude/commands/) + SessionStart hook 등록 (check-version + load-context). **installSlashCommandsOnly() export — installSkills 내부와 adapter registerSessionIntegration 양쪽이 silent 재사용 (gen-064 T011)**. **gen-066: installAgents(home?) prefix-anchored (`^reap-.+\.md$`) silent helper export — Claude Code agent definitions (`~/.claude/agents/reap-*.md`) sync 도 installSkills + registerSessionIntegration 양 caller (gen-064 패턴 적용).**
│   │   └── skills/             — 19 slash command files (.md). OpenCode adapter 도 본 디렉토리를 source 로 재사용 (single source, gen-064)
│   └── opencode/               — OpenCode 어댑터 (gen-063, gen-064 slash commands)
│       ├── index.ts            — AdapterModule wrapper
│       ├── install.ts          — opencode.json instructions/plugin sync (REAP_INSTRUCTIONS 9 + REAP_PLUGIN_ENTRY), AGENTS.md marker-hash sync, .opencode/plugins/reap-plugin.ts 배치, **installSlashCommands(home?) ~/.config/opencode/commands/reap.*.md cleanup-then-copy (gen-064)**, opencodeCommandsDir/claudeCodeSkillsDir helpers. **registerSessionIntegration 도 installSlashCommands 호출 — `reap update` 흐름에서 user-level sync 보장 (gen-064 T013)**. **gen-066: installAgents(home?) + opencodeAgentsDir(home?) 신설 — target `~/.config/opencode/agent/` (singular, OpenCode TUI tip 공식), AGENT_PATTERN `^reap-.+\.md$` (slash-command 의 dot 와 비대칭, frontmatter name 필드 따름). installSkills emitOutput + registerSessionIntegration 양 caller.**
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

daemon/                            — 별도 앱 (@c-d-cc/reap-daemon)
├── src/                           — daemon 소스 (9 모듈 + api/ + indexer/)
│   ├── index.ts                   — daemon 진입점
│   ├── server.ts                  — HTTP 서버 (localhost:17224)
│   ├── router.ts                  — HTTP 라우터
│   ├── registry.ts                — 프로젝트 레지스트리 (CRUD)
│   ├── process.ts                 — PID 파일, idle timer
│   ├── paths.ts                   — daemon 경로 상수
│   ├── types.ts                   — daemon 타입
│   ├── api/                       — API 핸들러 (health, projects, query)
│   └── indexer/                   — 인덱싱 파이프라인
│       ├── parser.ts              — Tree-sitter WASM 파서 (15개 언어)
│       ├── scanner.ts             — Git 기반 파일 스캔
│       ├── graph.ts               — 코드 그래프 (인메모리)
│       ├── storage.ts             — SQLite 영속화
│       ├── pipeline.ts            — 인덱싱 파이프라인 오케스트레이터
│       ├── import-resolver.ts     — import 해석
│       ├── call-resolver.ts       — call 해석
│       ├── impact.ts              — blast radius 분석
│       ├── community.ts           — 커뮤니티 탐지
│       └── process-tracer.ts      — 실행 플로우 추적
├── queries/                       — Tree-sitter SCM 쿼리 (15개 언어)
└── tests/                         — daemon 테스트 (25 파일, 130 tests)
```

## docs/ — reap.cc 문서 사이트

별도 repo 가 아니라 **본 repo 안의 Vite + React 앱**이다 (`docs/`, 자체 `package.json`).

- 배포: `.github/workflows/docs.yml` — `docs/**`, `media/**`, `README*.md` 변경이 main 에 push 되면 GitHub Pages 로 자동 배포. `docs/public/CNAME` = `reap.cc`
- 빌드: `cd docs && npx vite build` → `docs/dist/public/`. workflow 가 `index.html` 을 `404.html` 로 복사(SPA fallback)
- 콘텐츠: **`docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts`** — 5개 로케일 각각이 전체 문서 텍스트를 담은 TS 객체. 마크다운 파일이 아니다
- changelog: 각 로케일의 `releaseNotes.versions[]` 배열, 최신이 첫 원소

**주의**: 문서 텍스트가 TS 객체 배열이므로 구문 오류 시 빌드가 깨진다. 수정 후 반드시 `npx vite build` 확인. 그리고 5개 로케일을 **모두** 갱신해야 한다 — 일부만 고치면 로케일 drift 가 생기며, `scripts/check-docs-version.sh` 가 이를 검사한다.

## Build & Scripts

- `npm run build` — bun build → `dist/cli/index.js` (~400KB single bundle) + skill 복사
- `npm run dev` — bun으로 직접 실행 (빌드 불필요)
- `npm run typecheck` — tsc --noEmit
- `postinstall` — skill 자동 설치 + v0.15 감지 안내

## Tests

### tests/ submodule (reap-test repo, main branch)

현재 baseline (다음 세대가 회귀 여부를 판단하는 기준):

| 스위트 | 명령 | 결과 |
|---|---|---|
| unit | `bun test tests/unit/` | 470 pass / 0 fail |
| e2e | `bun test tests/e2e/` | 268 pass / **1 fail** — `init-repair` "skips when REAP section already present". **backlog `e2e-init-repair-1건-실패-...` 로 등록됨 (gen-076)** — 더 이상 "그냥 pre-existing" 이 아니라 처리 대기 항목이다 |
| scenario | `bun test tests/scenario/` | 44 pass / 0 fail |

**e2e 의 1 fail 은 알려진 pre-existing 이다.** 이 수치와 다르면 회귀를 의심할 것.

`tests/scenario/multi-generation.test.ts` 는 gen-065 backlog gate 를 시나리오로 커버한다 — pending 이 있으면 `run start` 가 `status: "prompt"` 로 막히고, `--backlog`(소비) 또는 `--no-backlog`(유지) 로 재호출해야 진행된다. 새 scenario 가 backlog 파일을 만든다면 같은 gate 를 거치므로 이 패턴을 참고할 것.

지원 자산:
- `tests/helpers/setup.ts` — `cli` / `cliRaw` / `setupProject` / `setupGitProject` / `advanceStage` / `cleanup`. 대부분의 e2e·scenario 가 여기만 import 한다
- `tests/helpers/daemon.ts` — daemon 격리 helper. `spawnTestDaemon(port, fakeHome)` 가 `bun src/index.ts` 를 spawn (daemon dist 의 queries path 문제 회피). `TEST_DAEMON_PORT=17225` + HOME override 로 사용자 daemon(17224) 영향 0
- `tests/fixtures/daemon-sample/` — daemon e2e 용 소형 TypeScript 프로젝트(5 파일). 심볼 관계 `main → validateId + formatUser`. helper 가 매번 tmpdir 복사 + git init

버전 의존 assertion 주의: `tests/e2e/update-migration.test.ts` 는 패키지 버전을 `package.json` 에서 읽는다(`PKG_VERSION`). 릴리즈 버전을 하드코딩하면 bump 마다 깨진다 — 단, "특정 버전의 migration note"를 검증하는 케이스는 하드코딩이 맞다.

### scripts/ (프로젝트 루트)
- `scripts/build.sh` — bun build + 정적 자산 복사 (claude-code skills, opencode plugin/templates)
- `scripts/alpha-publish.sh` — alpha 배포 헬퍼
- `scripts/postinstall.sh` — npm postinstall hook
- `scripts/check-docs-version.sh` — 릴리즈 문서 정합성 게이트. `RELEASE_NOTICE.md` / `RELEASE_NOTES.md` / 5개 로케일 changelog 가 `package.json` 과 일치하는지 + **로케일 간 항목 집합 동일성** + migration note 가 패키지 버전을 넘지 않는지 검사. `release.yml` 의 `npm publish` 앞과 `reapdev.versionBump` Step 5-1 에서 실행

### npm scripts
- `npm run test:unit` — bun test tests/unit/
- `npm run test:e2e` — bash tests/e2e/run.sh
- `npm run test:scenario` — bash tests/scenario/run.sh
- `npm run test` — 전체 (unit + e2e + scenario)

## Types (주요 타입)
- `HookResult` — hook 실행 결과 (name, event, type, status, exitCode, stdout, stderr, content, skipReason)
- `ReapHookEvent` — 라이프사이클 hook 이벤트 union type (14개 이벤트)
- `ReapOutput.status` — `"ok" | "prompt" | "error" | "artifact-incomplete"`
- `EvaluatorConcern` (gen-067) — `{ stage: "validation" | "fitness", severity: "low" | "high", summary: string, recordedAt: string }`. Validation→fitness signalling channel. severity는 binary (Goodhart 회피). high = cruise auto-abort 트리거. `GenerationState.evaluatorConcerns?: EvaluatorConcern[]` 로 노출.
- `ReapConfig.daemon?: boolean` (gen-068) — opt-in flag. 미설정/false 시 4 lifecycle 진입점 (start/learning/implementation/completion) 의 daemon trigger 게이트 비활성. true 시 dynamic import 후 `ensureRegistered` + `triggerIndexing` 호출. 기존 사용자 회귀 0 보장.
- `ProjectEntry.lastIndexedCommit?: string \| null` (daemon, gen-068) — registry entry 의 마지막 인덱스 git HEAD commit. `register` 시 null 초기화. `PipelineResult.lastCommit?` 4 path (full/incremental/no-change/concurrent-guard) 모두 반환 → index handler 가 registry 에 전달. agent prompt 가 git HEAD 와 비교하여 staleness 판단.
- `REAP_DAEMON_PORT` env var (gen-069) — daemon binary + REAP CLI client 양방향 인식. 미설정 시 17224 fallback (회귀 0). 테스트 격리 (e2e 가 17225 사용) + 다중 daemon 인스턴스 가능. daemon `daemon/src/index.ts:resolvePort()` + client `src/cli/commands/daemon/client.ts:resolvePort()` + `getBaseUrl()` (module-load 시 아닌 call-time resolve).
- `ensureRegistered`, `triggerIndexing` (gen-069) — return type `Promise<boolean>`. 성공/실패 시그널을 caller 가 활용. silent fail 정책 유지. learning emit 의 `daemonReady = ensureOK && triggerOK` 패턴.
- learning emit context `daemonEnabled` (boolean, 항상) + `daemonReady` (boolean, daemon=true 시에만 spread) — gen-069. agent / test 가 config 분기 검증.
- `ReapConfig.lastMigratedVersion?: string` (gen-071) — 이 프로젝트가 어디까지 migration 됐는지 추적. 미설정 시 "0.0.0" fallback. `reap update --mark-migrated` 가 현재 패키지 버전으로 갱신. **CONFIG_DEFAULTS에 포함 금지** — optional tracking 필드이며 spurious config diff 유발.
- `PendingMigration` (gen-071) — `{ version: string, instructions: string }`. `detectPendingMigrations` 반환 타입. `reap update` context + load-context SessionStart + dump-state.md sync 3곳에서 동일 데이터 emit.

## Key Design Decisions

- **Zero-dependency CLI**: 외부 CLI 라이브러리 없음 → supply chain 최소화
- **File-based state**: DB 없음, 모든 상태는 `.reap/` 내 YAML/Markdown
- **JSON stdout**: 모든 CLI 출력은 `ReapOutput` JSON → AI agent 파싱 용이
- **Transition graph + nonce**: 선언적 transition graph로 허용 전이 정의, pendingTransitions map으로 다중 nonce 동시 발행, stage 무결성 암호학적 보장
- **2-level compression**: lineage 무한 성장 방지 (L1: folder→md, L2: md→epoch)
- **Adapter pattern**: agent client 교체 가능 (현재 claude-code, 향후 opencode/codex)
- **`reap make` pattern**: template 기반 resource 생성 (`reap make backlog`). 향후 확장 가능

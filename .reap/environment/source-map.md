# Source Map

> 코드 구조와 모듈별 역할·소유권. **on-demand** — `environment/summary.md` 와 달리 자동 로드되지 않으므로,
> 코드를 만지기 전에 이 파일을 연다.
>
> 여기에 있는 것은 **인덱스가 만들 수 없는 것**이다. `reap index` 는 무엇이 존재하고 무엇이 무엇을 부르는지
> 답한다(기계 추출, 항상 최신). 이 문서는 **각 모듈이 무엇을 위한 것이고 왜 그렇게 생겼는지** 답한다.
> 둘은 대체 관계가 아니다.
>
> ```bash
> reap index status                 # 심볼·edge·import 해석률
> reap index impact <file>          # 이 파일을 바꾸면 어디까지 닿는가
> reap index callers|callees <sym>  # 호출 관계
> ```

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
│   ├── semver.ts               — **버전 비교의 단일 소유자.** SemVer 2.0.0 §9~11 (prerelease 순서, build metadata 무시). `semverCompare`/`semverGt`/`semverGte`/`semverCore`. 소비자 셋: autoUpdate floor 2, migration 의 release-line 비교
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
│   ├── prompt.ts               — subagent prompt 공통 모듈 (loadReapKnowledge, buildBasePrompt, buildStrictSection, memory 로딩, cruise 지시, clarity 주입, strict HARD-GATE). `buildEvaluatorPrompt(knowledge, paths, state, { stage })` 는 reap-evaluate 용 dynamic context. Code Intelligence 절은 **무조건** 붙는다 (인덱서가 함께 배포되므로 부재할 수 없다) — 절에 적힌 명령은 `tests/e2e/index-command.test.ts` 가 그대로 실행한다
│   ├── scanner.ts              — 프로젝트 스캔 (init용)
│   ├── fs.ts                   — 파일 유틸리티
│   ├── output.ts               — JSON 출력 (emitOutput, emitError). lifecycle 명령(DUMP_COMMANDS 화이트리스트) 종료 시 sync dump를 자동 트리거
│   ├── migration.ts            — Migration instruction layer. `detectPendingMigrations(config, pkgVersion, templatesDir?)` — `lastMigratedVersion < v <= pkgVersion` 범위의 `src/templates/migration/vX.Y.Z.md` 파일 로드, semver 정렬. `buildPendingMigrationsSection` — pending 있을 때만 markdown 절 반환. `migrationTemplatesDir()` — dist/dev 분기 (패턴). 비교는 `core/semver.ts` 가 소유한다(자체 구현을 갖고 있었고 `check-version.ts` 의 사본과 답이 달랐다). note 선택만 `releaseLineGt` 로 **코어만 비교** — `X.Y.Z-alpha.N` 을 돌리는 사람은 X.Y.Z 코드를 돌리므로 그 note 를 받아야 하고, 정순서를 쓰면 prerelease 테스터에게만 숨는다. 3 caller (update.ts / load-context.ts / dump-state-sync.ts) 공유.
│   ├── dump-state-sync.ts      — `buildKnowledgeContextSync` + `dumpStateSync`. emitOutput 용 sync 버전이며 async `load-context` 와 **byte-identical** (unit 으로 고정). Code Intelligence 절은 **양쪽 모두 없다** — 항상 참인 사실은 dynamic 이 아니라 static(guide + stage prompt)이 옮긴다. pending migrations 절 포함
│   ├── dump-state-helper.ts    — `dumpStateBestEffort` (async, silent on error). 향후 async caller용
│   ├── integrity.ts            — .reap/ 구조 진단 (checkIntegrity, detectV15, cleanupLegacyProjectSkills). **`checkUserLevelArtifacts(projectRoot, canonicalDirs = [], home = homedir())` — gen-076: adapter 의 정식 설치 위치를 주입받아 검사 대상에서 제외. `core` 는 adapters 를 import 하지 않으며 호출부(`fix.ts`)가 `getAdapter().userLevelDirs()` 를 넘긴다. 미주입 시 해당 검사 skip (오탐보다 안전).**  크기 warning: genome 파일별(application 250 / evolution 300 / invariants 50), memory tier 50/70/60, environment summary 250줄 — 수치 근거는 코드 주석 + `reap-guide.md` § File Size Guidelines. **warnings only**, `fixProject` 에 대응 코드 없음이 auto-delete 방지 장치
│   ├── notice.ts               — release notice (fetchReleaseNotice: RELEASE_NOTICE.md에서 버전+언어별 노트 추출)
│   ├── report.ts               — auto issue report (autoReport: gh issue create wrapper, best-effort)
│   ├── template.ts             — artifact 템플릿 복사
│   └── vision.ts               — vision goals 파싱, gap 분석, 다음 goal 제안, 프로젝트 진단, vision 발전 제안 (adapt phase 지원). lineage 편향 분석 제거됨
├── cli/
│   ├── index.ts                — CLI 진입점, 커맨드 라우팅 (init, status, config, run, make, cruise, install-skills, fix, destroy, **uninstall**, clean, check-version, update, load-context, dump-state, **index**).
│   │                             **`program.parse()` 앞에서 `ensureUserLevelAssets` 를 await** — 명령을 가리지 않는다.
│   │                             `postinstall` 이 안 돈 사용자가 가진 것은 바이너리 하나이므로 그것을 부르는 것 자체가 조건이다
│   └── commands/
│       ├── init/               — 프로젝트 초기화 (greenfield/adoption 자동 감지, --repair, --migrate 지원).
│       │                          **양쪽 모두 `environment/source-map.md` 를 만든다**: adoption 은
│       │                          `generateSourceMap(scan)`, greenfield 는 `buildSourceMapStub()`.
│       │                          후자는 트리에 대해 아무것도 주장하지 않는다 — `--mode greenfield` 는
│       │                          코드가 있는 디렉토리에 강제될 수 있다. `--repair` 는 CLAUDE.md 만 본다
│       ├── migrate.ts          — v0.15→v0.16 마이그레이션 (multi-phase: confirm→execute→vision→complete)
│       ├── check-version.ts    — postinstall/SessionStart용: v0.15 legacy cleanup + autoUpdate 자동 업데이트 + autoUpdateMinVersion guard + release notice 표시 (semverGte, queryAutoUpdateMinVersion, queryLatestVersion, performAutoUpdate, handOffToNewBinary, checkAutoUpdateGuard). **`hasNewerRelease(installed, latest)` = `semverGt(latest, installed)` 가 업데이트 여부를 결정한다** — `!==` 였고, 그것은 *뒤로 가는 것도* 업데이트로 쳤다. 릴리즈 빌드는 발행 전에 이미 올라간 버전을 달고 있으므로 자기진단 게이트가 방금 pack 한 산출물을 배포본으로 바꿔치기당했다. `getInstalledVersion()` 은 여전히 `execSync("reap --version")` 으로 **PATH 위의 reap** 을 읽는다 — 전역 설치에서는 그것이 곧 자기 자신이지만 로컬 설치에서는 아니다 (backlog pending)
│       ├── load-context.ts     — SessionStart hook용: dynamic context 주입 (buildKnowledgeContext, hookSpecificOutput JSON 출력). Current State/Strict/Language 3개 dynamic 섹션만 출력한다 (~1KB) — static knowledge(genome/env/vision/memory/reap-guide)는 CLAUDE.md 의 `@` import refs 로 Claude Code 가 직접 로드하므로 여기서 다루지 않는다. 비-REAP 디렉토리에서는 silent exit
│       ├── dump-state.ts       — `.reap/.session-state.md`에 동일 dynamic context 기록 (--stdout/--silent 지원). OpenCode plugin과 외부 도구용. emitOutput이 lifecycle 명령 종료 시 sync 버전(dump-state-sync.ts)으로 자동 dump
│       ├── run/                — stage 실행 (21 handlers)
│       │   ├── start.ts        — generation 생성 (scan → create). create phase 에 **backlog gate**: `--backlog`/`--no-backlog` 없이 pending > 0 이면 `status: prompt`/`phase: select-backlog` 로 멈춘다 (idempotent). `consumeBacklog` warning 은 `context.backlogWarning` 으로 surface. **인덱싱 트리거 없음** — 커밋이 없는 시점이다
│       │   ├── learning.ts     — 탐구 (work → complete). **인덱싱 트리거 없음** — 질의가 스스로 갱신한다
│       │   ├── planning.ts     — 계획 (work → complete)
│       │   ├── implementation.ts — 구현 (work → complete). **인덱싱 트리거 없음** — 코드는 썼지만 커밋은 없다
│       │   ├── validation.ts   — 검증 (work → complete). `config.evaluator === true` 시 work prompt 에 "Evaluator Subagent Invocation" 절 + `context.evaluator.{enabled, prompt}`; `false` 면 byte-identical. advisor 모델 — builder 가 verdict 를 갖고 evaluator concern 을 surface 한다. `--phase report-evaluator --severity <high|low|none> --summary "..."` 는 transition graph **밖**에서 `state.evaluatorConcerns` 에 append (nonce 없음), severity=none 은 no-op
│       │   ├── completion.ts   — 완료 (reflect → fitness → adapt → commit). fitness work 는 `evaluator: true` 시 `buildEvaluatorPrompt({ stage: "fitness" })` 를 emit 하고, `state.evaluatorConcerns` 가 비어있지 않으면 "Prior Evaluator Concerns" 절을 붙인다. **cruise + high-severity → `clearCruise()` + supervised fallback prompt + 즉시 return** (self-loop nonce 는 보존). commit phase 는 `refreshIndexAfterCommit` 을 부른다 (`early-close` 와 함께 **유이한 eager 트리거**)
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
│       ├── destroy.ts          — **프로젝트에서** REAP 제거 (--confirm 필수, .reap/ + CLAUDE.md + .gitignore). 출력이 `context.nextStep: "reap uninstall"` 과 안내 문구로 머신 레벨 제거를 가리킨다 — 제거 있을 때와 no-op 일 때 **양쪽** 다
│       ├── uninstall.ts        — **머신에서** REAP 제거 (2-phase, `--confirm`). 순서: 진입 훅 우회 → 양 adapter 홈 자산 → `~/.reap/` allowlist(폐기된 daemon 이 남긴 `daemon/` 포함) → npm. 전역 제거 목록에는 `@c-d-cc/reap-daemon` 이 **무조건** 들어간다 — 미설치면 no-op 이고, 넣지 않으면 deprecated 전역 패키지가 영구히 남는다. `detectInstallKind` 이 global/npx/local/checkout/unknown 을 가르고 **global 일 때만 npm 을 부른다** — `npm root -g` 와 패키지 루트의 `node_modules` 를 **realpath 정규화 후** 비교(안 하면 symlink 를 거치는 모든 전역 설치가 'global 아님'으로 오판된다). `UninstallDeps` 가 npm 호출·경로 판정을 주입 가능하게 한다. npm 실패는 전체 실패가 아니다
│       ├── clean.ts            — 선택적 상태 초기화 (--lineage, --life, --backlog, --hooks)
│       ├── update.ts           — 프로젝트 업데이트 (v0.15→migrate 위임, v0.16→config backfill/디렉토리 보충/CLAUDE.md 보수, --post-upgrade 지원)
├── libs/cli.ts                 — 자체 CLI 프레임워크 (~858 lines)
├── adapters/                   — AI client 어댑터 (dispatcher + module 패턴)
│   ├── index.ts                — `getAdapter(agentClient)` → AdapterModule (codex 는 helpful Error, unknown 은 claude-code fallback).
│   │                             `resolveAgentClient(cwd)` — config.yml 에서 client 판정 (install-skills 와 공유).
│   │                             **`ensureUserLevelAssets({cwd, version, home?})`** — `~/.reap/.install-stamp` 의 client 별 버전과
│   │                             비교해 필요할 때만 설치. `"synced"|"partial"|"current"|"failed"`, silent · never throws.
│   │                             **`complete` 일 때만 stamp** — 부분 설치를 성공으로 굳히면 그 자체가 무증상 실패가 된다
│   ├── types.ts                — AdapterModule (installSkills / ensureProjectIntegration / registerSessionIntegration /
│   │                             **removeUserLevelAssets(home?) → UserLevelRemovalResult{removed, kept}** — `syncUserLevelAssets` 의 역연산이며 **바로 옆에 선언**한다. 목록은 값으로 공유할 수 없어(디렉토리 복사 / JSON 편집 / 단일 파일) 인접성이 유일한 동기화 수단이다. 양쪽에 `reap:carrier(user-level-asset-set)` /
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

```

## src/indexer/ — 내장 코드 인덱서 (gen-089)

폐기한 `@c-d-cc/reap-daemon` 에서 이식했다. **상주 프로세스·포트·registry·SQLite 는 전부 사라졌다.**

| 파일 | 역할 |
|---|---|
| `assets.ts` | `queriesDir()`/`grammarsDir()`. **한 칸 위** 규칙(dev `src/indexer` → `src/`, bundle `dist/cli` → `dist/`)이라 번들·소스 깊이가 일치한다. grammar 는 `dist/grammars/`, 없으면 devDependency 로 폴백 |
| `languages.ts` | 15개 언어의 확장자. 언어 *집합*은 `.scm` 파일들이 소유하고 `tests/unit/indexer-assets.test.ts` 가 셋의 일치를 강제한다 |
| `parser.ts` | web-tree-sitter. grammar 로드 실패를 **기록**한다(stdout 이 JSON 이라 출력하지 않는다) — `status` 가 경고로 노출 |
| `scanner.ts` | `git ls-files` / `git diff --no-renames --name-only <since>..HEAD`. **커밋만 본다** — 작업 트리·staged 를 섞으면 인덱스의 신원이 커밋이 아니게 된다. `--no-renames` 는 필수: rename 감지가 켜지면 구 경로가 diff 에 안 나와 심볼이 영구 잔존한다 |
| `graph.ts` | `CodeGraph`. **`edgeKey()` 가 edge 식별의 단일 소유자** — 네 곳이 조립하며 둘이 구분자를 달리 써 call 그래프가 통째로 사라진 적이 있다. `removeEdgesOfKind` / `removeByFile` / `removeFileEdges` / `edgeCounts` |
| `import-resolver.ts` | **추출**(한 파일)과 **해석**(전체 파일 목록)을 분리. `.js`→`.ts` 매핑이 P2 의 근본 수정. `isCodeSpecifier` 가 `.css` 같은 비-코드를 해석률 분모에서 제외 |
| `call-resolver.ts` | 이름 매칭. `pickBestTarget` 은 **결정적·import-aware**: ① 참조 파일이 import 하는 파일 ② 자기 파일 ③ 그 외, 각 tier 안에서 경로 정렬 |
| `impact.ts` | blast radius. 파일↔파일 IMPORTS 만 걷는다 |
| `store.ts` | `manifest.json`(비압축) + `graph.json.gz`. **manifest 가 `format`·`shards`·통계·`lastIndexedCommit` 의 단일 소유자** — 코드는 shard 파일명을 하드코딩하지 않는다. 모르는 format 은 **버리고 full 재구축** |
| `pipeline.ts` | full / incremental. **두 edge 종류 모두 전체 그래프 재해석 전에 전량 삭제한다** (`removeEdgesOfKind`) — 전체 그래프 pass 의 결과는 더하는 것이 아니라 교체하는 것이다 |
| `index.ts` | `Indexer` — `update`/`ready`(lazy)/`search`/`callers`/`callees`/`impact`. `refreshIndexAfterCommit` 이 커밋 지점 두 곳의 단일 소유자 |

**스냅샷은 `nodes`·`edges`·`files`·`refs`·`specifiers` 를 담는다.** 뒤의 둘이 핵심이다 —
call·import 해석은 **전체 그래프 의존**이라(현재 심볼 집합 / 현재 파일 목록에 맞춰본다)
incremental 이 재파싱하지 않은 파일까지 재해석해야 한다. 없으면 낡은 edge 가 살아남고
`status` 는 100% 를 보고한다. `INDEX_FORMAT` 3.

**인덱스 = `.reap/.index/`, gitignore.** `reap init` 과 `reap update` 가 항목을 쓰며
(`ensureIndexIgnored`, 디렉토리 **일치** 판정 — prefix 로 하면 하위 파일 규칙을 오인해 fail-open),
쓰기 실패는 예외가 아니라 **보고**된다. gitignore 하는 이유는 크기가 아니라 자기참조다:
`completion --phase commit` 이 `git add -A` 를 돌린다.

**성능**: 이 저장소 full 인덱싱 **약 0.35초** (daemon 6.7초). 차이의 대부분은 파일별 `git log -1`
233회 제거. 스냅샷 로드는 gunzip+parse **약 2.4ms**.

## docs/ — reap.cc 문서 사이트

별도 repo 가 아니라 **본 repo 안의 Vite + React 앱**이다 (`docs/`, 자체 `package.json`). `.github/workflows/docs.yml` 이 `docs/**`, `media/**`, `README*.md` 변경을 main push 시 GitHub Pages 로 배포하고(`docs/public/CNAME` = `reap.cc`), `index.html` 을 `404.html` 로 복사해 SPA fallback 을 만든다. 빌드는 `cd docs && npx vite build` → `docs/dist/public/`.

콘텐츠는 마크다운이 아니라 **`docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts`** — 5개 로케일 각각이 전체 문서 텍스트를 담은 TS 객체다. changelog 는 각 로케일의 `releaseNotes.versions[]` 배열(최신이 첫 원소).

**주의**: TS 객체이므로 구문 오류 시 빌드가 깨진다 — 수정 후 반드시 `npx vite build` 확인. 그리고 5개 로케일을 **모두** 갱신해야 한다. 일부만 고치면 로케일 drift 가 생기며 `scripts/check-docs-version.sh` 가 이를 검사한다.

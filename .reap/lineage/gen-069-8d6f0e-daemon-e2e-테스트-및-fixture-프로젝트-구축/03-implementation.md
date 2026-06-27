# Implementation Log

## Goal Recap

daemon e2e 검증 인프라: fixture + helper + 21 cases + 격리 (port/HOME) + daemon context surface.

## Completed Tasks

| # | Task | Notes |
|---|------|-------|
| T001 | `daemon/src/index.ts` — REAP_DAEMON_PORT env var | `resolvePort()` 헬퍼 추가. NaN/0/negative 방어. 미설정 시 17224 fallback (회귀 0). |
| T002 | `src/cli/commands/daemon/client.ts` — `getBaseUrl()` 함수화 | module-top `BASE_URL` const 제거. 3 곳 fetch 사용 모두 교체. |
| T003 | `src/cli/commands/daemon/lifecycle.ts` — return Promise<boolean> | `ensureRegistered`, `triggerIndexing` 둘 다 boolean. silent fail 시 false. 기존 caller (start/learning/impl/completion) 는 await 무시 — 회귀 0. |
| T004 | `src/cli/commands/run/learning.ts` — emit context daemonEnabled / daemonReady | daemonEnabled 항상 emit, daemonReady 는 enabled=true 시에만 (spread 패턴, undefined 회피). |
| T005 | `tests/fixtures/daemon-sample/package.json` | name: "daemon-sample", type: "module", private. |
| T006 | `tests/fixtures/daemon-sample/.gitignore` | node_modules, dist. |
| T007 | `tests/fixtures/daemon-sample/src/types.ts` | `interface User { id, name }`. |
| T008 | `tests/fixtures/daemon-sample/src/utils.ts` | formatUser + validateId. import specifier `./types` (no `.js` ext — discovery 사항). |
| T009 | `tests/fixtures/daemon-sample/src/index.ts` | main → validateId + formatUser. import `./utils`. |
| T010 | `tests/helpers/daemon.ts` | spawnTestDaemon/stopTestDaemon/waitForDaemon/registerFixture/copyFixture + triggerIndex/getProjectStatus 추가 helper. `bun src/index.ts` 로 daemon 기동 (dist 의 queries path bug 회피 — discovery 사항). |
| T011 | `tests/e2e/daemon-config.test.ts` (5 cases) | All pass. dump-state stdout 으로 daemon 절 존재/부재 검증. |
| T012 | `tests/e2e/daemon-lifecycle.test.ts` (4 cases) | All pass. spawn / stop / stale PID / silent fail. case 4 timeout 30s (3s ensureDaemon 허용). |
| T013 | `tests/e2e/daemon-indexing.test.ts` (6 cases) | All pass. `realpath()` 로 macOS /var → /private/var 매칭. |
| T014 | `tests/e2e/daemon-query.test.ts` (6 cases) | All pass. |
| **Discovered: typescript-tags.scm** | call_expression 캡처 추가 | discovery 사항 — daemon 의 TS call references 미감지 버그. fix 가 1-line scm 추가로 단순. fixture 가 의도한 callee/caller graph 를 검증 가능하게 함. tsx-tags.scm 도 동일 처리. |
| T015 | npm run build (메인) + bun run build (daemon) | 0.76 MB / 182 KB. typecheck pass (메인). daemon pre-existing bun:sqlite typecheck error 무관. |
| T016 | bun test tests/e2e/daemon-*.test.ts | **21/21 pass**. 전체 e2e 회귀 검증: 239 pass / 1 fail (pre-existing init-repair). Unit 427/0. |

## Discovered Issues

### Tree-sitter import resolver 의 `.js` extension 미처리

`daemon/src/indexer/import-resolver.ts:resolveJsPath` 가 specifier 의 확장자를 strip 하지 않는다. 따라서:

- `import { x } from "./utils.js"` → specifier `./utils.js` → candidates: `./utils.js`, `./utils.js.ts`, ... → 실제 `./utils.ts` 와 매치 실패.
- `import { x } from "./utils"` → candidates 에 `./utils.ts` 포함 → 매치 성공.

**영향**: backlog 명세 의 fixture 코드 (`import { formatUser } from "./utils.js"`) 가 IMPORTS edge 를 생성하지 못해 impact 분석 의 directFiles 비어있을 수 있음.

**대응**: fixture 의 import specifier 에서 `.js` 확장자 제거. backlog 의 명세 코드를 minor 조정. 명세 본질 (callee/caller 관계) 은 그대로.

**대안 (deferred)**: import-resolver 가 `.js` 확장자 strip 후 `.ts` candidate 시도 — daemon 자체 개선이지만 본 generation 범위 외. 별도 backlog 후보.

### `import type { ... }` regex 미매치 — 영향 없음

`(?:import|export)\s+(?:\{...\}|(\w+))\s+from` regex 가 `type` 키워드를 `\w+` 로 잡으면서 `from` 위치가 어긋나 매치 실패. type-only import 는 어차피 runtime import 가 아니므로 IMPORTS edge 누락이 의미상 정확. impact 분석에 영향 없음.

### daemon 의 typescript-tags.scm 에 call_expression 캡처 없음

`daemon/queries/typescript-tags.scm` 가 `name.reference.call` 캡처를 정의하지 않아 TS 파일의 함수 호출이 call resolver 에 잡히지 않음. 결과: 모든 .ts 파일의 callers/callees 가 empty. `javascript-tags.scm` 은 이미 캡처가 있어서 .js 는 정상 작동.

**대응**: typescript-tags.scm + tsx-tags.scm 양쪽에 `(call_expression function: (identifier) @name.reference.call)` + member 패턴 추가. 1-line scm 변경. fixture 의 main → formatUser/validateId 호출이 잡힘.

**범위 판단**: 본 generation 의 backlog 가 검증 인프라 구축이지만, 검증 대상이 작동하지 않는 상태 (call references 미감지) 였음. backlog 의 case 2/3 (callers/callees) 가 정의하는 동작이 daemon 의 기존 동작이 아니라 **본래 기대 동작**. fix 가 1-line 이라 본 generation 에서 처리 — daemon 자체 결함 수정은 일반적으로 별도 generation 이지만, 본 fix 없이는 검증 인프라 가 의미 없음. evolution.md "Workaround 금지 — 근본 원인 추적" 원칙 적용.

### daemon dist 의 queries path resolution bug — 회피

`daemon/src/indexer/languages.ts` 의 `QUERIES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "queries")` 가 dev 모드 (`src/indexer/languages.ts`) 에서는 `daemon/queries` 로 정확히 풀리지만, bundle (`daemon/dist/index.js`) 에서는 `<root>/queries` 로 잘못 풀려 query 파일 로드 실패 → 모든 심볼 추출이 silent fail (nodesCreated 0).

**대응**: 본 generation 의 helper 가 `bun src/index.ts` 로 daemon 기동 (dist 안 씀). 회피 가능. fix 자체는 `__dirname.includes("dist")` 분기 (gen-064 패턴) 또는 build 시 queries 복사 — 별도 generation 으로 deferred.

### macOS /var → /private/var symlink resolution

`mkdtemp(tmpdir())` 가 반환하는 `/var/folders/...` path 가 CLI 자식 프로세스 의 `process.cwd()` 에서 `/private/var/folders/...` 로 resolve 됨. daemon 의 registry 는 후자를 저장하므로, 테스트의 `fixtureDir` 와 매치 실패. 

**대응**: `daemon-indexing.test.ts` 의 lifecycle describe 에서 `realpath(await copyFixture(...))` 로 normalize. macOS 외 OS 에서는 no-op.

## Architecture Decisions

### `daemonReady` 의미: registered AND indexed

옵션 c1 채택 (planning Q2). `ensureRegistered` + `triggerIndexing` 둘 다 성공해야 true. 단순 `isDaemonRunning()` (옵션 c2) 보다 의미가 강함 — 실제로 daemon 이 indexing 까지 했는지 보장.

### emit context 의 `daemonReady` 부재 패턴

`daemonEnabled === false` 시 `daemonReady` 키 자체 부재 (spread 패턴 `...(daemonEnabled ? { daemonReady } : {})`). 이는:
- byte-identical 회귀 보장 (key 자체 absent → JSON 출력에 nothing)
- backlog 의 case 1 ("`daemon: false` → learning work prompt 에 daemon 절 없음") + case 2 ("`context.daemonEnabled === false`") 동시 만족
- case 4 ("`context.daemonReady` 존재") 는 enabled=true 케이스에서만 검증 — `daemonReady !== undefined` 로 assertion

### Fixture 의 import specifier: `.js` 확장자 제거

`import { formatUser } from "./utils"` 형태 사용. 이유: tree-sitter import resolver 의 현 동작 (확장자 strip 안 함). 의미 보존 (ESM 모듈 graph 변경 없음). production code 가 `.js` 확장자 사용 (ESM convention) 하더라도 fixture 는 검증 목적이므로 resolver 동작에 맞춤.

## Deferred Items

- **Import resolver `.js` extension 자동 strip** — daemon 자체 개선. fixture 가 `.js` 확장자 써도 IMPORTS edge 생성하도록. 별도 generation 의 backlog 후보. 본 generation 은 fixture 의 import 형식으로 회피.
- **daemon dist 의 queries path resolution fix** — `daemon/src/indexer/languages.ts` 의 `QUERIES_DIR` 가 bundle 환경에서 잘못된 경로 (`<root>/queries`) 로 풀림. 본 generation 은 `bun src/index.ts` 로 회피. dist 사용자 (`reap install-skills` 가 postinstall 로 spawn 하는 경로) 가 영향 받을 수 있으므로 별도 generation 에서 fix 권장.

## Tasks Status

### A. 격리 인프라
- [x] T001 `daemon/src/index.ts` — REAP_DAEMON_PORT env (resolvePort + NaN 방어)
- [x] T002 `src/cli/commands/daemon/client.ts` — getBaseUrl() 함수화

### B. daemonEnabled / daemonReady
- [x] T003 `src/cli/commands/daemon/lifecycle.ts` — return Promise<boolean>
- [x] T004 `src/cli/commands/run/learning.ts` — emit context 확장

### C. fixture (submodule 내부)
- [x] T005 `tests/fixtures/daemon-sample/package.json`
- [x] T006 `tests/fixtures/daemon-sample/.gitignore`
- [x] T007 `tests/fixtures/daemon-sample/src/types.ts`
- [x] T008 `tests/fixtures/daemon-sample/src/utils.ts`
- [x] T009 `tests/fixtures/daemon-sample/src/index.ts`

### D. helper (submodule 내부)
- [x] T010 `tests/helpers/daemon.ts`

### E. 테스트 파일 (submodule 내부)
- [x] T011 `tests/e2e/daemon-config.test.ts` (5/5)
- [x] T012 `tests/e2e/daemon-lifecycle.test.ts` (4/4)
- [x] T013 `tests/e2e/daemon-indexing.test.ts` (6/6)
- [x] T014 `tests/e2e/daemon-query.test.ts` (6/6)

### F. 빌드 + verify
- [x] T015 `npm run build` (메인) + `bun run build` (daemon)
- [x] T016 `bun test tests/e2e/daemon-*.test.ts` — **21/21 pass**. 전체 e2e 회귀 검증: 239 pass / 1 fail (pre-existing). Unit 427/0.

### Discovered (planning에 없던 task)
- [x] D1 `daemon/queries/typescript-tags.scm` + `tsx-tags.scm` — call_expression 캡처 추가 (TS call references 미감지 fix)

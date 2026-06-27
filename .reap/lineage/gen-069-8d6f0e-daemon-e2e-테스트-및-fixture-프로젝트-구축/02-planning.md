# Planning

## Goal

daemon e2e 검증 인프라 구축. 신규 4 테스트 파일 21 cases + fixture 프로젝트 + helper 모듈 + 격리(port/HOME) 메커니즘. gen-068 의 daemon 통합 강화가 미래에도 회귀 없이 유지되도록 자동화된 안전망 제공.

## Completion Criteria

1. `bun test tests/e2e/daemon-*.test.ts` — 21 cases all pass (4 파일 = 5 + 4 + 6 + 6).
2. `tests/fixtures/daemon-sample/` 가 submodule 안에 commit (git history 1개 commit + .gitignore 포함).
3. `tests/helpers/daemon.ts` 신설 + 5 export (`spawnTestDaemon`, `stopTestDaemon`, `waitForDaemon`, `registerFixture`, `copyFixture`).
4. 테스트가 사용자 daemon(port 17224) / `~/.reap/daemon/` 에 부작용 없음 (HOME override + REAP_DAEMON_PORT=17225 격리).
5. `REAP_DAEMON_PORT` env var 가 daemon binary + REAP CLI client 양쪽에서 인식 (미설정 시 17224 fallback — 기존 사용자 회귀 0).
6. learning work emit context 에 `daemonEnabled` (boolean) + `daemonReady` (boolean, daemon=true 시에만) 추가. daemon=false 또는 미설정 시 byte-identical 회귀 (`daemonReady` undefined).
7. 기존 e2e 전체 회귀 0 (gen-068 시점 218 pass / 1 pre-existing fail 유지).

## Background

gen-068 이 daemon 통합 강화 (config opt-in, agent prompt 절, 4 lifecycle 진입점 자동 indexing, lastIndexedCommit 노출, dump-state daemon 절) 를 구현했으나 **자동화된 검증 부재**. backlog 의 표현: "검증 수단이 없다 ... 기존 e2e 패턴은 daemon 에 직접 적용이 안 된다". 본 generation 은 그 갭을 메운다.

핵심 어려움 2가지:
- 격리: daemon 은 별도 프로세스 + 포트 + `~/.reap/daemon/` 파일 시스템 — 사용자 환경 오염 위험.
- 실제성: tree-sitter 가 파싱할 실제 코드 + git history 필요 — 빈 tmpdir 로는 부족.

## Brainstorming

### Q1. 격리 전략: 어떻게 사용자 daemon 과 충돌 안 시키나?

**Option A** — `REAP_DAEMON_PORT` env + HOME override 양방향.
- daemon 은 env 보고 listen, REAP CLI client 는 env 보고 fetch.
- daemon paths.ts 가 `homedir()` 만 의존하므로 HOME 만 바꾸면 `<fakeHome>/.reap/daemon/` 사용.
- 장점: 사용자 daemon (port 17224, 진짜 ~/) 전혀 안 건드림. 동시 실행 가능.
- 단점: client.ts module top-level `const BASE_URL = ...` 를 함수로 바꿔야 함 (runtime resolve). 2 파일 변경.

**Option B** — daemon binary 미사용, in-process server (`createDaemonServer({ port: 0 })`).
- daemon binary 검증 자체가 불가 (lifecycle 의 case 1, 2, 3 = 기동/종료/stale PID 는 subprocess 필요).
- → 채택 불가.

**Option C** — `~/.reap/daemon/` 만 격리 (HOME override), port 는 17224 그대로.
- 사용자가 동시에 daemon 실행 중이면 port 충돌.
- backlog 가 명시: "포트 17225 사용".
- → 부적합.

**선택: A**. 가장 확실. backlog 와 일치.

### Q2. `daemonReady` 정의

**c1** — `ensureRegistered + triggerIndexing` 호출이 성공했는가? boolean return 추가.
- 의미가 강함 (실제 daemon 동작 확인).
- silent fail 정책 유지 (return false 만).

**c2** — `isDaemonRunning()` (HTTP /health 응답 OK).
- 가장 단순.
- "registered" / "indexed" 보장 없음.

**판단**: c1 가 의미상 정확. lifecycle.ts 의 두 함수에 return type 추가 (현재 `Promise<void>`).

Backlog 의 case 4 검증: "`context.daemonReady` 존재" — 어느 정의든 충족하나, c1 이 daemon 통합의 전체 stack 을 한 번에 검증.

**선택: c1**. lifecycle.ts 두 함수 return Promise<boolean>. `daemonReady = ready1 && ready2`.

### Q3. daemon 미기동 시 client `ensureDaemon()` auto-spawn 우회

`client.ts:ensureDaemon()` 은 daemon 이 없으면 spawn 시도 + 3s timeout. test case `daemon-lifecycle.test.ts` #4 (daemon 미기동 silent fail) 가 영향받음.

**Option a** — 그냥 3s timeout 받아들임. 1 case 만 해당.
**Option b** — `REAP_DAEMON_NOSPAWN=1` env 추가, ensureDaemon 이 false return.

**판단**: a 채택. 단순. 3s 는 e2e 1 case 의 latency 로 허용 가능. b 는 production 동작 변경 위험.

### Q4. fixture 생성 시점: build 시 1회 vs test runtime 매번?

**Option α** — fixture 디렉토리를 submodule 에 commit (코드 + .git). 테스트가 매번 tmpdir 복사.
- 장점: 재현성 100%. CI/local 동일.
- 단점: `.git/` 디렉토리를 submodule 안에 nested git 으로 둠 — 가능하나 git 가 nested 처리 주의 필요.

**Option β** — fixture 코드만 commit, `.git/` 은 테스트 helper 가 매번 init.
- 장점: nested git 회피.
- 단점: helper 가 매번 git init + commit (latency 약간 + 코드 추가).

**판단**: β. nested git 문제 회피. helper 가 `copyFixture()` 안에서 `git init + add + commit` 수행. fixture 자체에는 `.gitignore` 만 포함.

### Q5. fixture sample 의 ts 코드: backlog 의 코드 그대로 vs 보강?

backlog 의 코드:
```ts
// types.ts: User interface
// utils.ts: formatUser, validateId
// index.ts: main → formatUser + validateId
```

callee/caller 관계가 명확하나 tree-sitter import resolver 가 `.js` extension 을 어떻게 처리하는지 확인 필요. → daemon 의 import-resolver.ts 확인:

<implementation 단계에서 import-resolver 동작 확인>

**선택**: backlog 코드 그대로. tree-sitter 가 못 잡으면 implementation 에서 살짝 조정.

## Approach

### A. 격리 인프라 (T001-T005)

- daemon binary: `process.env.REAP_DAEMON_PORT` 우선 (없으면 17224 default).
- REAP CLI client: `client.ts` 의 module-top `BASE_URL` 상수 제거, `getBaseUrl()` 함수화. `process.env.REAP_DAEMON_PORT` 우선.
- 테스트 helper: child env + parent env 모두에 port 주입 (CLI 도 같은 env 로 호출되어야 함).
- HOME override: `tests/helpers/setup.ts` 의 `cliWithHome` 패턴 답습.

### B. `daemonEnabled` / `daemonReady` context (T006-T007)

- `lifecycle.ts`: `ensureRegistered` + `triggerIndexing` return type 을 `Promise<boolean>` 으로.
- `learning.ts`: 기존 dynamic import 블록을 `if (config?.daemon === true) { ... daemonReady = ... }` 로 감싸 ready boolean 추출. emit context 에 `daemonEnabled` (항상) + `daemonReady` (daemon=true 시) 추가.

회귀 안전: `daemonEnabled === false` 시 `daemonReady: undefined` → context 키 자체 부재. byte-identical 회귀 보장 (테스트로 검증).

### C. fixture (T008-T009)

- `tests/fixtures/daemon-sample/{package.json, .gitignore, src/{index.ts, utils.ts, types.ts}}` 신설.
- `.git/` 은 submodule 에 commit 하지 않음. helper 가 매번 init.

### D. helper (T010)

- `tests/helpers/daemon.ts` — 5 export. 시그니처:

```ts
spawnTestDaemon(port?: number, fakeHome?: string): Promise<ChildProcess>
stopTestDaemon(proc: ChildProcess): Promise<void>
waitForDaemon(port: number, timeoutMs?: number): Promise<void>
registerFixture(port: number, fixturePath: string, name?: string): Promise<string>
copyFixture(fixtureName: string): Promise<string>
```

내부 동작:
- `spawnTestDaemon`: `node daemon/dist/index.js` spawn, env={ REAP_DAEMON_PORT, HOME }.
- `waitForDaemon`: `/health` polling.
- `copyFixture`: `tests/fixtures/<fixtureName>/` → tmpdir 복사 + `git init + add + commit`.

### E. 4 테스트 파일 (T011-T014)

각 파일별 cases 는 backlog 명세 그대로. 패턴:

- **daemon-config.test.ts** (5): `setupProject` + config 직접 edit + `node CLI run learning` JSON parse. 실제 daemon 불필요.
  - case 4 (`daemonReady` 존재) 는 `config.daemon=true` 라서 daemon 호출 발생 — 그러나 daemon 이 없으면 `daemonReady=false`. 그래도 "존재" 만족. (실제 daemon spawn 회피 위해 `REAP_DAEMON_NOSPAWN`? — Q3 에서 a 선택, 3s timeout 허용. 단 spawn 이 dist 가 없을 때 throw, 그 throw 가 lifecycle.ts 의 catch 에 잡혀 false return → ready=false → 키 존재 OK).
  - case 4 가 lifecycle.ts 의 spawn 을 trigger 하려고 시도 → 3s wait. 허용. **또는** test 에서 `REAP_DAEMON_PORT` 를 가짜 port (e.g. 65535) 로 set + isDaemonRunning fast fail → spawn 시도 → daemon binary 없는 path → 즉시 throw + catch → false return. 즉, **port 만 격리하면 spawn 의 child process 시작이 실패해도 timeout 3s 안에 끝남**.
  - **간단한 회피**: case 4 에서 spawn 자체를 막기 어렵다면 timeout 허용 (test 1 개 latency 3s).

- **daemon-lifecycle.test.ts** (4): 실제 daemon spawn.
  - case 1 (기동/health): `spawnTestDaemon` + fetch `/health`.
  - case 2 (`reap daemon stop`): spawn + `cliWithHome(... "daemon", "stop")` + 재 fetch /health → fail.
  - case 3 (stale PID): pid 파일 직접 write (가짜 pid e.g. 999999) + spawn → 정상 응답.
  - case 4 (silent fail): daemon 미기동 + CLI 의 lifecycle path 호출 (e.g. `reap run learning` with config.daemon=true) → exit code 0.

- **daemon-indexing.test.ts** (6): fixture + spawn + register + index.
  - case 1: register + index → status.lastIndexedCommit == fixture HEAD.
  - case 2: fixture 에 새 파일 commit + 재 index → lastIndexedCommit 갱신.
  - case 3: 같은 HEAD 로 재 index → incremental path (changedFiles 0).
  - case 4: HEAD != lastIndexedCommit → 재 index 가 자동 호출되어 갱신 — *backlog 는 "implementation phase complete 가 triggerIndexing 자동 호출"* 로 case 4 를 명세. 즉 backlog 의 case 4 = "reap run implementation --phase complete 시 자동 호출" 검증.
  - case 5: `reap run implementation --phase complete` → triggerIndexing 자동 호출 (lastIndexedCommit 갱신).
  - case 6: `reap run completion --phase commit` 후 triggerIndexing 자동 호출. — 단 commit 흐름이 복잡. 대안: 미등록 project ID → status error 로 case 6 재배치. (backlog 명세 케이스 6 은 commit. backlog 의 `daemon-query.test.ts` case 6 이 미등록 ID error. 양쪽 다 확인.)

  → backlog 명세 따라: indexing 6 = (1: full / 2: HEAD 갱신 / 3: same HEAD incremental / 4: impl complete auto-trigger / 5: completion commit auto-trigger / 6: 미등록 ID error). 정정.

  실제 backlog 명세 재확인:
  - 1: fixture full index → lastIndexedCommit == HEAD
  - 2: file 수정 + git commit + 재 index → lastIndexedCommit 새 HEAD
  - 3: HEAD == lastIndexedCommit → incremental path (changed 0)
  - 4: `reap run implementation --phase complete` → triggerIndexing 자동
  - 5: `reap run completion --phase commit` → triggerIndexing 자동
  - 6: 미등록 project ID → status: error

- **daemon-query.test.ts** (6): fixture + spawn + register + index + query.
  - case 1: GET `/projects/:id/symbols?q=main` → main 심볼 반환.
  - case 2: GET `/projects/:id/symbols/:formatUserId/callers` → main caller 포함.
  - case 3: GET `/projects/:id/symbols/:mainId/callees` → formatUser, validateId 포함.
  - case 4: GET `/projects/:id/impact?file=src/utils.ts` → src/index.ts 포함.
  - case 5: GET `/projects/:id/status` → lastIndexedCommit string.
  - case 6: GET `/projects/:nonexistent/status` → status: error.

### F. 빌드 + verify (T015-T016)

- `daemon/dist/index.js` build (env var 인식 포함).
- `dist/cli/index.js` build (client.ts env var 인식 포함).
- 전체 test run.

## Risk Assessment

### R1. client.ts `BASE_URL` 함수화로 인한 회귀

`BASE_URL` 은 4 곳에서 참조 (`ensureDaemon` 의 fetch, `daemonRequest` 의 fetch, `isDaemonRunning` 의 fetch). 모두 같은 BASE_URL 사용 — getBaseUrl() 로 일괄 교체. 회귀 위험 매우 낮음.

### R2. lifecycle.ts return type 변경의 caller 영향

`ensureRegistered`, `triggerIndexing` 의 caller: `start.ts`, `learning.ts`, `implementation.ts`, `completion.ts`. 모두 `await ensureRegistered(...)` 형태로 호출, return value 무시. boolean 추가해도 무시되므로 회귀 0. 단 type system 이 await 결과 type 을 추론하므로 TS 가 받아들임. learning.ts 만 새 return value 활용.

### R3. tree-sitter import resolver 가 `.js` extension 처리

backlog fixture 의 `import { formatUser } from "./utils.js"` 가 tree-sitter import resolver 에 의해 잡힐지 확인 필요. import-resolver.ts 가 .ts/.tsx 도 처리하는지. → implementation 초반에 검증.

### R4. fixture 의 `.git/` nested issue

Q4 에서 β 선택 (helper 가 매번 init). 회피.

### R5. test latency

daemon spawn (1-2s) + index (수 ms) × 케이스 수 = 합 ~30s 예상. test timeout 기본 5s 일 수 있어 individual case 가 spawn 포함 시 timeout 위험. 각 describe 의 `beforeAll` 에서 한 번 spawn + 공유 — daemon 은 동일 HOME 안에서 같은 인스턴스. 단, 테스트 간 격리는 register/unregister 로.

### R6. dist/ 빌드 누락 시 e2e silent fail

setup.ts 가 `dist/cli/index.js` 의존. daemon 도 `daemon/dist/index.js` 필요. **T015** 에서 양쪽 빌드.

## Scope

### In-scope (변경 파일)

**메인 repo**:
- `daemon/src/index.ts` — env var port 인식
- `daemon/src/types.ts` (or `daemon/src/index.ts`) — port 결정 로직
- `src/cli/commands/daemon/client.ts` — `getBaseUrl()` + env var
- `src/cli/commands/daemon/lifecycle.ts` — return type Promise<boolean>
- `src/cli/commands/run/learning.ts` — emit context 에 `daemonEnabled` / `daemonReady`

**tests submodule**:
- `tests/fixtures/daemon-sample/package.json` (신설)
- `tests/fixtures/daemon-sample/.gitignore` (신설)
- `tests/fixtures/daemon-sample/src/index.ts` (신설)
- `tests/fixtures/daemon-sample/src/utils.ts` (신설)
- `tests/fixtures/daemon-sample/src/types.ts` (신설)
- `tests/helpers/daemon.ts` (신설)
- `tests/e2e/daemon-config.test.ts` (신설)
- `tests/e2e/daemon-lifecycle.test.ts` (신설)
- `tests/e2e/daemon-indexing.test.ts` (신설)
- `tests/e2e/daemon-query.test.ts` (신설)

### Out-of-scope

- MCP server interface (backlog `daemon-mcp-server-interface-...md` 의 dependsOn target — 별도 generation).
- daemon binary 의 staleness check 자동 trigger (gen-068 에서 이미 lastIndexedCommit 노출 까지 완료, 본 generation 은 검증만).
- 새 daemon API endpoint 추가.
- unit test (본 generation 은 e2e 만).

## Tasks

### A. 격리 인프라

- [ ] T001 `daemon/src/index.ts` — `const port = process.env.REAP_DAEMON_PORT ? Number(process.env.REAP_DAEMON_PORT) : DEFAULT_CONFIG.port;` 추가. NaN 방어. 테스트: unit 없음 (e2e 가 cover) + daemon 직접 spawn 으로 확인.
- [ ] T002 `src/cli/commands/daemon/client.ts` — `getBaseUrl()` 함수화 (`process.env.REAP_DAEMON_PORT` 우선, 기본 17224). 4 곳 BASE_URL 참조 일괄 교체. 테스트: e2e (daemon-lifecycle.test.ts) 가 cover.

### B. `daemonEnabled` / `daemonReady`

- [ ] T003 `src/cli/commands/daemon/lifecycle.ts` — `ensureRegistered` + `triggerIndexing` return type `Promise<boolean>` 으로 변경. 성공 → true, catch / no data → false. 테스트: e2e 가 cover.
- [ ] T004 `src/cli/commands/run/learning.ts` — emit context 에 `daemonEnabled: config?.daemon === true` (항상). `config.daemon === true` 인 경우만 `daemonReady = <ensureRegistered + triggerIndexing 결과>` 추가. 테스트: daemon-config.test.ts 5 cases.

### C. fixture

- [ ] T005 `tests/fixtures/daemon-sample/package.json` 신설 (`name: "daemon-sample"`, `type: "module"`).
- [ ] T006 `tests/fixtures/daemon-sample/.gitignore` 신설 (`node_modules/`, `dist/`).
- [ ] T007 `tests/fixtures/daemon-sample/src/types.ts` — `export interface User { id: string; name: string; }`.
- [ ] T008 `tests/fixtures/daemon-sample/src/utils.ts` — `formatUser`, `validateId` export.
- [ ] T009 `tests/fixtures/daemon-sample/src/index.ts` — `main(id, name)` → validateId + formatUser 호출.

### D. helper

- [ ] T010 `tests/helpers/daemon.ts` — 5 export 구현 (spawnTestDaemon / stopTestDaemon / waitForDaemon / registerFixture / copyFixture). daemon binary path 결정, HOME + REAP_DAEMON_PORT env 주입, /health polling, fixture 복사 + git init. 테스트: 4 e2e 파일이 import 해서 사용.

### E. 테스트 파일

- [ ] T011 `tests/e2e/daemon-config.test.ts` 신설 — 5 cases. config opt-in 분기.
- [ ] T012 `tests/e2e/daemon-lifecycle.test.ts` 신설 — 4 cases. daemon spawn/stop/stale/silent fail.
- [ ] T013 `tests/e2e/daemon-indexing.test.ts` 신설 — 6 cases. full/incremental/auto-trigger.
- [ ] T014 `tests/e2e/daemon-query.test.ts` 신설 — 6 cases. symbols/callers/callees/impact/status/error.

### F. 빌드 + verify

- [ ] T015 `npm run build` (메인) + `bun run build` (daemon). dist/ 갱신.
- [ ] T016 `bun test tests/e2e/daemon-*.test.ts` — 21/21 pass 확인. 회귀 검증: `bun test tests/e2e/` 전체 218 pre-existing 1 fail 유지.

## Dependencies

- T001 → T010 (helper 가 spawn 시 REAP_DAEMON_PORT 사용)
- T002 → T010 (helper 가 CLI 호출 시 같은 env)
- T003 → T004 (return value 활용)
- T005~T009 → T010 (helper 가 fixture 복사)
- T010 → T011~T014 (모든 e2e 가 helper import)
- T001~T014 → T015 (build)
- T015 → T016 (verify)

테스트 순서 (T011~T014 사이 의존): 없음 (각 파일 독립).

## 검증 체크리스트 (4-항목 = gen-063 교훈)

본 generation 은 새 client adapter / 외부 도구 / 사용자 진입점 추가가 아니라 **검증 인프라 구축**. 4-항목 checklist 의 직접 적용 대상 아님. 그러나 응용 가능한 self-audit:

1. ✅ 검증 인프라는 자기 동작 검증 가능한가 → T016 의 21 pass 가 본 generation 의 dog-fooding.
2. ✅ 사용자 daemon 영향 없음 검증 → 격리 메커니즘 (HOME + PORT) 자체가 검증 대상 (T012 case 1 의 fakeHome 으로 port 17225 listen 확인).
3. ✅ 기존 e2e 회귀 0 → T016 의 전체 run.
4. ✅ 새 env var (REAP_DAEMON_PORT) 가 사용자 환경에서 정상 fallback 검증 → 미설정 시 17224 fallback 은 T015 빌드 후 manual 1 회 확인 (T016 에서 cli 가 호출되는 모든 e2e 가 env var 없이 동작 → fallback 검증).

## Echo Chamber 방지

본 plan 의 범위 내 작업만. 추가 발견 시:
- daemon binary 동작 자체의 버그 → 새 backlog (autonomous 금지).
- import-resolver / tree-sitter 의 fixture 코드 비호환 → 본 generation 의 fixture 코드 미세 조정 (직접 인과 — OK).
- 기타 "있으면 좋겠다" → completion artifact 의 Next Generation Hints 로만 기록.

## 사용자 확인 요청

다음 결정 사항을 사용자에게 컨펌 요청 후 implementation 진행:

1. **격리: A 채택** (REAP_DAEMON_PORT 양방향 env). OK?
2. **`daemonReady` = c1** (lifecycle.ts return 변경). OK?
3. **case 4 (silent fail) 의 3s timeout 허용** (별도 NOSPAWN env 추가 안 함). OK?
4. **fixture: helper 가 매번 git init** (`.git/` submodule 에 안 둠). OK?
5. **fixture ts code: backlog 그대로**. tree-sitter 호환 문제 시 implementation 에서 미세 조정. OK?

# Validation Report

## Result

**pass**

## Checks

### 1. TypeCheck (메인 repo)

`npm run typecheck` → pass. 0 errors.

(daemon 의 typecheck 은 pre-existing `bun:sqlite` import 와 `globalThis.Bun` 동적 분기 때문에 2 errors — 본 generation 변경과 무관. 본 generation 의 `resolvePort()` 추가는 typecheck 통과.)

### 2. Build

- `npm run build` (메인) → pass. 0.76 MB / 151 modules.
- `bun run build` (daemon) → pass. 182.15 KB / 39 modules.

### 3. Tests

| Suite | Result |
|-------|--------|
| unit (`tests/unit/`) | **427 pass / 0 fail** (gen-067 시점과 동일 — 회귀 0) |
| 신규 daemon e2e (4 files) | **21 pass / 0 fail** |
| 전체 e2e (`tests/e2e/`) | **239 pass / 1 fail** (pre-existing `init-repair.test.ts`, gen-067/068 부터 알려진 fail) |

Fresh run, no cache. 회귀 검증 OK — 새 21 cases 추가로 218 → 239. pre-existing 1 fail 그대로 유지.

### 4. Completion Criteria 검증

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `bun test tests/e2e/daemon-*.test.ts` — 21 cases all pass | ✅ | `21 pass / 0 fail / 63 expect() calls` |
| 2 | `tests/fixtures/daemon-sample/` 가 submodule 안에 commit | ⏳ commit 은 commit phase 에서 | 파일 생성 완료 (5 파일: package.json, .gitignore, src/{index,utils,types}.ts) |
| 3 | `tests/helpers/daemon.ts` 신설 + 5 export | ✅ | `spawnTestDaemon`, `stopTestDaemon`, `waitForDaemon`, `registerFixture`, `copyFixture` (+ 보너스: `triggerIndex`, `getProjectStatus`, `cleanupFixture`) |
| 4 | 테스트가 사용자 daemon(port 17224) / `~/.reap/daemon/` 에 부작용 없음 | ✅ | 모든 spawn 이 `REAP_DAEMON_PORT=17225` + 별도 fakeHome 사용. user 영역 미접근. |
| 5 | `REAP_DAEMON_PORT` env var 가 daemon binary + REAP CLI client 양쪽에서 인식 (미설정 시 17224 fallback) | ✅ | daemon `resolvePort()` + client `resolvePort()` + `getBaseUrl()`. unit 테스트가 env 없는 케이스 cover (cli 호출 모두 17224 default 로 동작). |
| 6 | learning work emit context 에 `daemonEnabled` (boolean) + `daemonReady` (boolean, daemon=true 시에만) 추가. daemon=false / 미설정 시 byte-identical 회귀 | ✅ | `daemon-config.test.ts` case 1, 2, 5 검증 (false / undefined). case 4 검증 (true 시 daemonReady 존재). |
| 7 | 기존 e2e 전체 회귀 0 (gen-068 시점 218 pass / 1 pre-existing fail 유지) | ✅ | 239 pass / 1 fail = 218 + 21 신규. 1 fail 은 pre-existing init-repair (gen-067 shortterm 에 기록됨). |

## Edge Cases

### macOS /var → /private/var symlink

`mkdtemp(tmpdir())` 가 `/var/folders/...` 반환 → CLI 자식 프로세스의 `process.cwd()` 가 `/private/var/folders/...` resolve → daemon registry path mismatch. `realpath()` 로 fixtureDir normalize. macOS 외 OS 영향 없음.

### `bun:sqlite` vs `better-sqlite3` 의 dual-adapter

`daemon/src/indexer/storage.ts` 가 `globalThis.Bun` 으로 분기. `node` 로 daemon 기동 시 better-sqlite3 native binding 필요 (없음 → indexing fail). helper 가 `bun src/index.ts` 로 spawn 하여 `bun:sqlite` path 채택.

### daemon dist 의 queries path resolution

bundle `__dirname` 기반 `QUERIES_DIR` 가 `<reap_root>/queries` 로 resolve (잘못된 경로). helper 가 dev 모드 (`src/index.ts`) 로 회피. dist 사용자 (npm postinstall 의 auto-spawn) 의 영향은 별도 generation 에서 fix.

### 3s ensureDaemon timeout (`daemon-lifecycle.test.ts` case 4)

daemon 미기동 환경에서 CLI client 가 ensureDaemon 의 spawn-and-poll loop 까지 진입 (3s 대기). planning Q3 에서 a 옵션 (timeout 허용) 선택. 1 case 의 latency. test timeout 30s 로 보호.

## Issues

### Issue 1: typescript-tags.scm 가 call_expression 캡처 미정의

- **Severity**: High (daemon 의 핵심 기능 — callers/callees endpoint — 가 모든 .ts 파일에서 empty 반환).
- **Discovery**: 본 generation 의 `daemon-query.test.ts` case 2 (formatUser 의 callers 에 main 포함) + case 3 (main 의 callees 에 formatUser, validateId 포함) 가 fail 하면서 발견.
- **Root cause**: javascript-tags.scm 은 `(call_expression function: (identifier) @name.reference.call)` 캡처가 있으나 typescript-tags.scm + tsx-tags.scm 은 없음.
- **Fix**: 양 query 파일에 동일 캡처 추가 (1-line 변경). 본 generation 에서 처리 (planning 의 backlog 검증 case 가 정의하는 동작이 daemon 의 기존 동작이 아니라 본래 기대 동작이라 판단).
- **Verification**: 21 e2e cases 모두 pass.

### Issue 2: daemon dist 의 queries path resolution bug — deferred

- **Severity**: Medium (npm postinstall 의 auto-spawn 사용자가 영향. 단 production 사용은 현재 `bun src/index.ts` 가 일반적).
- **Root cause**: `daemon/src/indexer/languages.ts` 의 `QUERIES_DIR` 가 `import.meta.url` 기반 — bundle 시 잘못 풀림.
- **Fix 방향**: gen-064 패턴 (`__dirname.includes("dist")` 분기) 또는 build 시 queries 디렉토리를 dist/ 옆에 복사. 본 generation 범위 외.
- **현재 회피**: helper 가 `bun src/index.ts` 로 daemon 기동.

### Issue 3: import-resolver `.js` extension 미strip — deferred

- **Severity**: Low (TypeScript ESM `.js` extension import 가 daemon impact 분석에 잡히지 않음).
- **Workaround**: 본 generation fixture 가 `.js` 확장자 사용 안 함.
- **Fix 방향**: `resolveJsPath` 에 `.js` extension strip 후 `.ts` candidate 시도. 별도 generation.

## Self-audit (gen-064 교훈 적용)

backlog verification 의 각 시나리오가 e2e 1:1 mirror 인가?

| Backlog 명세 | e2e 매핑 | OK? |
|--------------|----------|-----|
| daemon-config 5 cases | `daemon-config.test.ts` 5 cases | ✅ |
| daemon-lifecycle 4 cases | `daemon-lifecycle.test.ts` 4 cases | ✅ |
| daemon-indexing 6 cases | `daemon-indexing.test.ts` 6 cases. 단 backlog 표의 case 4 = HEAD mismatch 시 자동 trigger 였으나 본 e2e 의 case 4 = `reap run implementation --phase complete` 자동 trigger (backlog 본문 표가 정의한 명세). 모순 없음 — backlog 본문 5번 항목 = "`reap run implementation --phase complete` → `triggerIndexing` 자동 호출" 이 본 e2e case 4 에 매핑. | ✅ |
| daemon-query 6 cases | `daemon-query.test.ts` 6 cases | ✅ |
| `REAP_DAEMON_PORT` 양방향 | T001 (daemon) + T002 (client) + 모든 e2e 가 격리 검증 | ✅ |
| 사용자 daemon 무영향 | `HOME=fakeHome` + `REAP_DAEMON_PORT=17225` 격리. user `~/.reap/daemon/` 미접근. | ✅ |

변경된 함수의 caller 모두 검증되었는가?

| 변경 | Caller | 검증 |
|------|--------|------|
| `client.ts:getBaseUrl()` | `daemonRequest`, `isDaemonRunning`, `ensureDaemon` | 21 e2e 가 모두 client 경유 |
| `lifecycle.ts:ensureRegistered/triggerIndexing` Promise<boolean> | `start.ts`, `learning.ts`, `implementation.ts`, `completion.ts` | learning.ts 가 새 return 활용 (daemon-config). 나머지는 await 무시 (회귀 0). daemon-indexing case 4/5 가 implementation/completion 의 auto-trigger 검증. |
| `learning.ts` context daemonEnabled/daemonReady | learning emit 사용자 (agent / test) | daemon-config 5 cases 모두 검증 |
| `daemon/src/index.ts:resolvePort()` | (env 진입점) | daemon-lifecycle case 1 (spawn 후 /health) 가 17225 listen 확인 |
| `typescript-tags.scm` call_expression | parser.ts 의 query.captures | daemon-query case 2/3 (callers/callees) |

자기-검증 결과: 5/5 pass.

## 결론

전 항목 pass. Completion criterion 2 (submodule commit) 는 다음 phase (commit) 에서 자연스럽게 처리. fail 없음.

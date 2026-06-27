# Learning

## Project Overview

REAP v0.16.5 — gen-068 에서 daemon 통합 강화(config opt-in, agent 지시문, 인덱스 갱신 시점, 생명주기 관리, commit hash staleness)가 완료되었으나 검증 수단(자동화된 e2e 테스트)이 부재한 상태. 본 generation 은 그 검증 인프라(fixture + helper + 21 cases)를 구축하고 통과시킨다.

현재 상태:
- gen-069-8d6f0e, type: embryo, parent: gen-068-6f92cd
- backlog `daemon-e2e-테스트-계획-및-fixture-프로젝트-구축.md` consumed (이 generation 의 출발점)
- e2e 218 pass / 1 fail (pre-existing init-repair). 본 generation 은 +21 cases 목표.

## Source Backlog

`daemon-e2e-테스트-계획-및-fixture-프로젝트-구축.md` 의 핵심:

### Fixture (`tests/fixtures/daemon-sample/`)

- 소형 TypeScript 프로젝트, 심볼 관계가 명확 (callee/caller 추적 가능)
- 3 파일: `types.ts` (User), `utils.ts` (formatUser/validateId), `index.ts` (main → utils 호출)
- git init + 1 commit 으로 고정 (재현성)
- 테스트는 tmpdir 에 복사 후 사용 (원본 오염 방지)

### 격리 전략

- 테스트 전용 daemon port 17225 (사용자 17224 와 충돌 방지)
- `tests/helpers/daemon.ts` 신설: spawn / stop / wait / registerFixture / copyFixture

### 4 테스트 파일, 총 21 cases

1. `daemon-config.test.ts` (5) — config opt-in 분기 (CLI JSON output 검사, daemon 프로세스 불필요)
2. `daemon-lifecycle.test.ts` (4) — 기동/종료/stale PID/silent fail
3. `daemon-indexing.test.ts` (6) — fixture 등록 + full/incremental + lifecycle 자동 호출
4. `daemon-query.test.ts` (6) — symbols/callers/callees/impact/status/error

### 완료 기준

- 21 cases all pass
- fixture 가 submodule 에 commit
- 사용자 daemon(17224) 무영향
- 기존 e2e 회귀 0

## Key Findings

### 1. daemon binary + client 모두 port 17224 / `~/.reap/daemon` hardcoded

- `daemon/src/index.ts` — `DEFAULT_CONFIG.port = 17224`
- `daemon/src/paths.ts` — `DAEMON_ROOT = ${homedir()}/.reap/daemon` (homedir 만 의존)
- `src/cli/commands/daemon/client.ts` — `DEFAULT_PORT = 17224`, `BASE_URL = http://127.0.0.1:17224`

**결론**: `HOME` env override 만으로는 격리 불가. **port 도 env 로 override 가능해야 함**. `REAP_DAEMON_PORT` env var 를 daemon binary + client 양쪽에서 인식하도록 추가 필요.

### 2. daemon 의 `lastIndexedCommit` 노출 — gen-068 추가

- `ProjectEntry.lastIndexedCommit?: string | null`
- `/projects/:id/status` 응답에 포함 (gen-068 의 commit hash staleness 검증)
- index pipeline 의 `result.lastCommit` 을 registry.updateLastIndexed 가 받아 저장

### 3. lifecycle 자동 indexing — config.daemon === true 시점에만 발동

- `start.ts:194` — start 시 register + index
- `learning.ts:68` — learning work entry 시 register + index
- `implementation.ts:96` — implementation complete 시 triggerIndexing
- `completion.ts:470` — completion commit 후 triggerIndexing

모두 dynamic import + try/catch 로 silent fail.

### 4. agent prompt 의 daemon 절 — `buildBasePrompt`

- `src/core/prompt.ts:220-238` — `config?.daemon === true` 시 "Code Intelligence (Daemon)" 절 prompt 에 포함
- false / 미지정 시 절 absent → byte-identical 회귀 safety

### 5. learning work emit 의 context 에 `daemonEnabled` / `daemonReady` 없음

`grep "daemonEnabled\|daemonReady" src/` → 0 hits. 본 backlog 의 case 2/4 요구사항 (`context.daemonEnabled === true/false`, `context.daemonReady` 존재) 를 만족하려면 **learning.ts 의 emitOutput context 에 그 두 필드 추가** 가 필요.

- `daemonEnabled`: `config?.daemon === true` 단순 boolean
- `daemonReady`: 등록/index 시도 성공 여부 (true/false). `ensureRegistered` + `triggerIndexing` 호출 결과를 어떤 형태로든 surface

### 6. tests/ 가 git submodule

- repo: https://github.com/c-d-cc/reap-test (branch: self-evolve, 본 generation 은 main 사용 가능성 — 확인 필요)
- fixture + 테스트 파일은 submodule 내부에 commit → 메인 repo 에서 submodule pointer commit

### 7. 기존 test helper 패턴

- `tests/helpers/setup.ts` — cli/cliRaw/cliExitCode + setupProject/setupGitProject + advanceStage + cleanup
- `tests/e2e/install-agents.test.ts` — `cliWithHome(cwd, fakeHome, ...args)` 패턴 (HOME override)
- daemon helper 는 신설 필요 (subprocess spawn, port 격리, fixture 복사)

### 8. daemon 의 in-process integration test 패턴 (reference)

- `daemon/tests/integration.test.ts` — `createDaemonServer({ port: 0, daemonRoot: TEST_DIR })` + `server.listen(0)` 으로 random port
- REAP e2e 는 subprocess 모델 — 다른 패턴 (binary spawn + port env var)

## Previous Generation Reference

gen-068 fitness: "OK — daemon 통합 강화 완료 승인. ... self-dogfooding (config.yml daemon: true) 활성화로 본 generation 이 자기 검증. 회귀 0."

**교훈 흐름**: gen-068 은 self-dogfooding 으로 "자기 자신이 첫 사용자" 가 되어 회귀 0 보장. gen-069 는 같은 패턴을 **자동화** — fixture + helper + 21 cases 가 모든 미래 generation 의 첫 사용자가 된다. 즉, gen-068 의 manual self-test 가 gen-069 의 automated regression suite 로 승격.

## Backlog Review

본 backlog 1건만 consumed. pending: 0 (`reap run start` 시점 1건이었고 그게 source). pending backlog 없으므로 추가 처리 없음.

`dependsOn: daemon-mcp-server-interface-추가-ai-agent가-코드-지식-직접-쿼리-가능.md` — 본 backlog 의 dependsOn 이 MCP server 항목이지만, MCP 는 *향후 generation* 의 작업이고 본 generation 은 그 전 단계(자동 검증 인프라). dependsOn 은 "이게 있어야 MCP 진행 가능" 의 역방향이 아닌 forward dependency 일 수 있으나, MCP backlog 가 없어 보이고 본 backlog 만으로 self-contained 함.

## Technical Deep-Dive — 격리 구현 plan 후보

### Option A: env var `REAP_DAEMON_PORT` 양방향 지원
- daemon `index.ts` 에서 `process.env.REAP_DAEMON_PORT` 우선
- client `client.ts` 에서 `BASE_URL` 을 함수로 변경, env 우선
- helper `spawnTestDaemon(port)` 가 child env 로 inject + parent env 로도 set (CLI 호출용)
- 장점: 최소 변경, 기존 사용자 회귀 0 (env 없으면 17224)
- 단점: client.ts 의 `DEFAULT_PORT` 상수 + `BASE_URL` const 가 module load 시 resolve 되어, 같은 process 안에서 env 바꿔도 안 잡힘. 함수화 필요.

### Option B: 테스트가 in-process daemon (createDaemonServer 직접)
- e2e 가 아닌 unit / integration 으로 분류됨
- backlog 가 명시: `daemon-lifecycle.test.ts` 에 `reap daemon stop` 검증 — 이는 subprocess 가 아니면 검증 불가
- → A 필수

**선택**: Option A. client.ts 와 daemon index.ts 양쪽에 env 지원 추가.

### Option C: `daemonEnabled` / `daemonReady` 노출

backlog case 2/4 가 명시. 가장 간단:
- `daemonEnabled = config?.daemon === true` — 무조건 emit
- `daemonReady` — `config.daemon === true` 일 때만 출현. `ensureRegistered` + `triggerIndexing` 호출이 throw 없이 끝났는가 boolean. 단, 현재 둘 다 `try {} catch {}` 로 silent fail 이라 호출 결과를 알기 어려움 — 추가 신호가 필요. 옵션:
  - (c1) `lifecycle.ts` 함수에서 boolean 반환 (silent fail 시 false)
  - (c2) `daemonReady` = isDaemonRunning() 결과 (가장 직접적)

**선택**: c1. `ensureRegistered` 와 `triggerIndexing` 에 boolean return + learning.ts 에서 `daemonReady = await ensureRegistered(...) && await triggerIndexing(...)`. silent fail 정책 유지하면서 status 만 noise 없이 surface.

대안 (간단): `daemonReady = await isDaemonRunning()` — client.ts 의 private 함수를 export. 단순하지만 "registered + indexed" 보장 안 됨.

→ c1 선택 (의미 보존). 단, backlog 는 "context.daemonReady 존재" 만 요구하므로 c2 도 satisfy 가능. **planning 에서 확정**.

### Option D: 테스트가 `dist/` 빌드 의존

- helper 가 `node dist/cli/index.js` 호출 (기존 setup.ts 패턴 동일)
- daemon binary 도 `daemon/dist/index.js` spawn
- → 본 generation 의 implementation 직후 build 필수

### Edge case: daemon 미기동 시 client 의 `ensureDaemon()` auto-spawn

`client.ts:26` 의 `ensureDaemon()` 은 daemon 이 없으면 **spawn** 한다. 테스트가 daemon 미기동 상태를 검증하려면 (case 4 of lifecycle: silent fail), 이 auto-spawn 을 어떻게 우회할지가 핵심.

- daemon binary 가 없는 환경에서 silent fail 검증 → 가능 (spawn 실패 → throw → caller catch)
- `triggerIndexing` 은 자기 catch 안에서 처리하므로 외부에는 silent
- 단, `ensureDaemon` 의 `setTimeout 3_000ms` 가 들어가서 테스트 latency 증가. **case 4 는 client 가 daemon 을 spawn 하려 하므로 timeout 만큼 지연**. 우회 방법:
  - 옵션: `REAP_DAEMON_PORT=0` 같은 sentinel 로 spawn skip
  - 옵션: 환경변수로 `REAP_DAEMON_NOSPAWN=1` 추가하여 ensureDaemon 의 spawn 부분 skip
  - 옵션: 그냥 3s timeout 받아들임 (테스트 1개만 해당)

**판단**: 3s timeout 은 허용 가능. case 4 는 한 번만 발생. 단, 안정성 위해 `REAP_DAEMON_NOSPAWN=1` 도 추가 검토 — planning 에서 결정.

## Context for This Generation

### Clarity Level: **HIGH**

판단 근거:
- backlog 가 매우 구체적 (fixture 코드까지 명시, 21 cases 표 형태, files-to-change 리스트)
- 격리 전략 명시 (port 17225, HOME override 묵시)
- 기존 helper / e2e 패턴 잘 정리됨 (setup.ts, install-agents.test.ts)
- 완료 기준 명확

### 가정 / 결정 candidate

1. **`REAP_DAEMON_PORT` 양방향 지원** — daemon binary + CLI client 모두. fallback 17224.
2. **`daemonEnabled` / `daemonReady` 추가** — learning.ts emit context 에. 구체 정의는 planning 에서.
3. **fixture: 본 backlog 의 ts 코드 그대로 사용** — User / formatUser / validateId / main. 단순 + 추적 가능.
4. **submodule 확인 필요** — 현재 branch / pending changes / 본 generation 의 commit 흐름 (submodule 안에서 add+commit → main repo 에서 submodule pointer commit).
5. **daemon 미기동 시 lifecycle 의 ensureDaemon 자동 spawn 우회**: planning 에서 결정 (`REAP_DAEMON_NOSPAWN` 추가 vs 3s timeout 허용).

### 주의 사항

- 코드 변경은 (a) daemon 환경변수 지원 (b) client 환경변수 지원 (c) learning.ts context 확장 — 모두 회귀 위험 low.
- 본 generation 의 self-dogfooding 검증: 새 e2e 가 pass 하면 즉 self-test.
- fitness 는 사용자가 직접 제공 (자동 판단 금지).

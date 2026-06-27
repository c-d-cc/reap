# Learning

## Project Overview

REAP v0.16.x — self-evolving CLI에 daemon indexer가 이미 구축되어 있다(`daemon/` 별도 패키지, localhost:17224 HTTP API, tree-sitter WASM, SQLite). gen-060까지 인프라는 완성되었으나, 다음 네 가지가 빠져 있어 실제 agent 워크플로우에서 활용되지 않는다:

1. agent에게 daemon 활용법을 알려주는 지시문이 없다 (reap-evolve / reap-evaluate / reap-guide)
2. 인덱스 갱신 시점이 불완전 — start.ts와 completion commit phase에만 일부 트리거 존재. learning/implementation 시점은 미통합.
3. config opt-in이 없다 — ReapConfig에 `daemon` 필드 부재. daemon 호출이 항상 시도되어 (silent fail이지만) network 시도 자체가 매번 발생.
4. commit hash staleness check가 없다 — daemon 인덱스가 어느 commit 기준인지 추적 불가. 따라서 갱신 필요 여부 판단 불가.

## Source Backlog

이번 generation은 `daemon-mcp-server-interface-추가-ai-agent가-코드-지식-직접-쿼리-가능.md` 백로그를 source로 사용. 백로그 핵심 5항목:

- 항목 1: Agent 지시문 추가 (reap-guide.md + reap-evolve.md + reap-evaluate.md). dog-fooding 동기화 (`src/templates/` ↔ `~/.reap/reap-guide.md` 등) 필수.
- 항목 2: 인덱스 갱신 — learning work / implementation complete / completion commit 세 지점에 `ensureRegistered + triggerIndexing` 통합 + commit hash staleness check.
- 항목 3: 생명주기 관리 — start.ts에서 `daemon: true`인 경우만 ensureRegistered 호출. stale daemon 재기동 검증.
- 항목 4: Config opt-in — `ReapConfig.daemon?: boolean` 추가. `config.daemon !== true`이면 모든 daemon 동작 no-op.
- 항목 5: MCP server interface — **이번 generation 범위 제외**. daemon/ 패키지 변경 크고 별도 검증 필요. adapt phase에 새 backlog로 남길 예정 (echo chamber 방지: 본 generation은 인과 범위 내만 처리).

## Key Findings — 현재 코드 상태

### `src/types/index.ts` (104 lines)
- `ReapConfig` interface에 `daemon` 필드 없음. 추가 필요: `daemon?: boolean`.
- `EvaluatorConcern`, `GenerationState` 등 기존 타입은 영향 없음.

### `src/cli/commands/daemon/lifecycle.ts` (33 lines)
- `triggerIndexing(projectRoot)`: 이미 `daemonRequest`를 시도하고 silent fail. **config 체크 부재** — daemon=false여도 매번 시도.
- `ensureRegistered(projectRoot, name)`: 동일 — config 체크 없음.
- 두 함수에 `(projectRoot, config?)` 시그니처를 추가하거나, 호출 측에서 미리 체크하는 두 가지 옵션. **단순화 위해 호출 측 게이트 패턴 권장** (현재 함수는 두 caller에서만 사용).

### `src/cli/commands/daemon/client.ts` (94 lines)
- `daemonRequest` → 항상 `ensureDaemon`을 호출. 매 호출마다 daemon 자동 spawn 시도.
- `isDaemonRunning()` (private)는 `/health` GET 으로 검증. **재기동 로직은 이미 있음** — `ensureDaemon`이 3초 timeout으로 spawn 후 health polling.
- 단, `isDaemonRunning`이 private. start.ts에서 daemon 활성 여부를 미리 체크하려면 export 가 필요.

### `src/cli/commands/run/start.ts` (217 lines)
- L187-189: `triggerIndexing(paths.root)` 무조건 호출. config 게이트 누락. 백로그 항목 4 위반.
- `--no-backlog` / `--backlog` 분기 + Issue #18 prompt 모두 정상 작동 중.
- 본 generation 변경 위치: L187-189를 config 게이트 + ensureRegistered 우선 호출로 교체.

### `src/cli/commands/run/learning.ts` (132 lines)
- work phase에 daemon 호출 없음. 추가 필요 — learning 진입 시 ensureRegistered + staleness check.
- silent fail은 기존 lifecycle.ts 함수 자체가 처리하므로 단순 await.

### `src/cli/commands/run/implementation.ts` (99 lines)
- complete phase (L79-97)에 daemon 호출 없음. 추가 필요 — implementation complete 시 triggerIndexing.

### `src/cli/commands/run/completion.ts` (492 lines)
- L466-467: `triggerIndexing(paths.root)` commit phase 끝에 무조건 호출. start.ts와 동일한 config 게이트 누락.

### `src/core/prompt.ts` (413 lines)
- `buildBasePrompt`에 daemon 관련 절 없음. config.daemon=true일 때 daemon 사용법을 prompt에 inject할 필요.
- gen-066/067의 evaluator 절 패턴과 동일하게 `if (config?.daemon === true) lines.push(...)` 추가 가능.

### `src/cli/commands/load-context.ts` (126 lines)
- dynamic context에 daemonEnabled / daemonReady 없음. 추가 필요 — SessionStart hook에서 daemon 상태 노출.

### `src/templates/reap-guide.md` (374 lines)
- "Code Intelligence (Daemon)" 섹션 없음. 추가 필요.
- **dog-fooding 동기화**: 변경 시 `~/.reap/reap-guide.md` 동기화 필요. `reap install-skills` / `reap update`가 처리. 본 generation은 source만 수정하고 install 흐름이 작동함을 신뢰.

### `src/templates/agents/reap-evolve.md` (76 lines)
- lifecycle 단계별 daemon 활용 지침 없음. 추가 필요.

### `src/templates/agents/reap-evaluate.md` (199 lines)
- impact 분석 활용 절 없음. validation 단계 verification에 daemon impact 검색 포함 필요.

### `daemon/src/types.ts` (84 lines)
- `ProjectEntry.lastIndexedAt: string | null` 존재. `lastIndexedCommit?: string` 추가 필요.

### `daemon/src/registry.ts` (76 lines)
- `updateLastIndexed(id)`만 존재. `updateLastIndexed(id, commit?)` 시그니처로 확장 필요.

### `daemon/src/indexer/pipeline.ts` (160 lines)
- `runFullPipeline` / `runIncrementalPipeline` 둘 다 commit hash를 `storage.saveMeta("lastCommit", head)` 로 SQLite에만 저장. registry까지 전파 안 됨.
- registry 갱신은 `daemon/src/api/projects.ts` index handler가 하지만, commit hash를 받지 못해 못 함.
- pipeline의 PipelineResult 에 `lastCommit?: string`을 추가하고, api/projects.ts가 result에서 읽어 `registry.updateLastIndexed(id, result.lastCommit)` 호출하도록 변경.

### `daemon/src/api/projects.ts` (68 lines)
- `status` handler에서 `entry.lastIndexedCommit` 자연 노출됨 (이미 entry 전체 spread).
- `index` handler에서 pipeline result의 commit hash를 받아 `registry.updateLastIndexed` 인자로 전달.

## Previous Generation Reference

gen-067: cruise mode + evaluator escalation 통합. validation→fitness 신호 채널, cruise auto-abort. 본 generation과의 연관성:

- evaluator 트랙은 gen-067에서 fitness/cruise 단까지 완성됐고, 본 generation은 **다른 트랙(daemon)**을 다룬다. 두 트랙은 독립.
- gen-067의 fitness phase가 self-dogfooding으로 작동했듯, 본 generation도 `.reap/config.yml`에 `daemon: true`를 추가하여 validation 단계의 daemon 호출이 실제로 작동하는지 확인할 수 있다.

## Backlog Review

현재 pending backlog 1개 (consumed 제외):
- `daemon-e2e-테스트-계획-및-fixture-프로젝트-구축.md` — daemon e2e 테스트. **이번 generation 범위 외** (gen-069에서 담당 예정, shortterm memory에 명시).

## Clarity Assessment

**High clarity**.

근거:
- Source backlog가 5개 항목으로 매우 구체적. 각 항목당 변경 파일/함수가 명시되어 있음.
- 백로그가 "이번 generation 범위 제외" (MCP server)까지 명시.
- vision/goals.md에 "daemon 통합 강화" 항목이 명시됨.
- gen-060까지의 daemon infra가 안정적으로 완성된 상태 — 본 generation은 그 인프라를 lifecycle에 wiring하는 단계.
- 변경 위치(파일 + 함수)가 사전에 알려져 있어 task decomposition이 직선적.

따라서 planning 단계에서는 task list와 verification 기준을 명확히 작성하고, implementation은 backlog 항목 순서대로 진행한다. 질문 비율 ~10%, 제안 ~90%.

## Technical Deep-Dive — 설계 결정 사항

### 결정 1: `config.daemon` 게이트는 호출 측에서 한다
- 대안 A: `triggerIndexing` / `ensureRegistered` 함수 시그니처에 config 추가하여 함수 내부 게이트.
- 대안 B: 각 호출 측(start.ts, learning.ts, implementation.ts, completion.ts)이 config를 읽어 false면 함수 자체를 호출하지 않음.
- **선택 B**. 이유: (1) 함수가 caller 2곳 이하라 변경 비용 적음, (2) silent fail이 이미 lifecycle.ts에 있으므로 함수 내 추가 게이트는 중복, (3) caller가 config를 이미 다른 용도로 읽고 있는 경우 그 결과 재사용.

### 결정 2: `isDaemonRunning` 사용 여부
- start.ts에서 daemon=true일 때 ensureRegistered만 호출하면 되고, ensureRegistered가 내부적으로 ensureDaemon 호출. **isDaemonRunning을 별도 export할 필요 없음**.
- 단, "stale daemon 처리"는 ensureDaemon이 이미 처리 (PID 검사 후 spawn). 추가 작업 불요.

### 결정 3: load-context의 daemonReady 체크는 health endpoint 직접 호출
- daemon이 active이고 spawn 후 응답하지 않으면 hook이 멈출 위험. **timeout 500ms로 가벼운 fetch만**. 실패 시 `daemonReady: false`로 fallback. 비-blocking.
- daemon 비활성 (`config.daemon !== true`)이면 daemonEnabled/daemonReady 양쪽 모두 표시 안 함 (current 동작 byte-identical).

### 결정 4: Commit hash 비교는 일단 daemon 응답에 위임
- agent가 staleness를 자가 판단할 수 있도록 `/projects/:id/status`가 `lastIndexedCommit` 노출 후, agent (또는 향후 buildBasePrompt 프롬프트)가 `git rev-parse HEAD`와 비교.
- CLI에서 자동 staleness 판단해 자동 reindex 하는 것은 본 generation 범위 외 (백로그 항목 2 본문 "필요 시 triggerIndexing" 권유만). 이번엔 hash 노출까지만.
- 단, learning work / implementation complete / completion commit 시점은 자동 triggerIndexing — 갱신 시점이 명확한 3 lifecycle moments.

### 결정 5: Backward compatibility
- `config.daemon` 부재 또는 false 시 모든 daemon 동작은 no-op이어야 한다.
- `daemon: true` 사용자만 새 동작 활성화.
- 기존 사용자 (config.daemon 없음) 영향 zero — 이게 완료 기준의 핵심.

### 결정 6: dog-fooding (이번 generation 자체 검증)
- `.reap/config.yml`에 `daemon: true`를 implementation 마지막에 추가하여, validation 단계가 새 동작의 첫 사용자가 되도록 함 (gen-066 패턴).
- daemon 빌드 상태가 dist 디렉토리에 없으므로, 실제 daemon spawn이 가능한지는 별도 확인. 만약 빌드 안 되어 있으면 silent fail 경로가 작동하므로 validation 자체는 차단되지 않음.

## Context for This Generation

- **Type**: embryo. Genome 자유 수정 가능하지만, 이번 generation에서 evolution.md / application.md에 daemon 통합 패턴을 명문화하는 것이 자연스럽다 (특히 "config.daemon opt-in 패턴", "lifecycle-stage 단위 indexing").
- **Goals.md에 [x] 마킹 후보**: "daemon 통합 강화 — config opt-in, agent 지시문, 인덱스 갱신, 생명주기" 항목은 본 generation 완료로 충족.
- **Test 정책**: backlog 본문에서 이미 명시 — "이번 generation에는 e2e 테스트 추가 없음 (gen-069에서 담당)". 따라서 typecheck + build + 기존 unit/e2e 회귀 없음만 검증.
- **dog-fooding 안전망**: daemon 미빌드 상태에서 silent fail이 항상 작동하므로 validation 차단 위험 없음.

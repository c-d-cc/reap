# Planning

## Goal

REAP daemon(localhost:17224 코드 지식 엔진)을 `config.daemon: true` 한 줄로 사용자가 opt-in하면, agent가 lifecycle 전반에서 daemon을 자연스럽게 활용하는 통합 경험을 만든다. 동시에 commit hash staleness check 인프라를 daemon 측에 추가하여 향후 자동 staleness 판단의 기반을 마련한다.

## Background

source backlog (`daemon-mcp-server-interface-추가-ai-agent가-코드-지식-직접-쿼리-가능.md`) 본문에 5항목 요청. 본 generation은 **항목 1~4를 처리**하고, **항목 5 (MCP server interface)는 별도 backlog로 분리**한다 (echo chamber 방지 — daemon/ package 변경 크고 별도 검증 필요. adapt phase에서 인간 검토 후 backlog 화).

학습 단계에서 확인된 현재 상태:
- daemon CLI 호출이 무조건 발생 (start.ts, completion.ts) → config 게이트 누락
- learning/implementation 시점은 daemon trigger 없음
- agent 가이드 파일들에 daemon 활용법 없음
- daemon 측 lastIndexedCommit 추적 없음
- ReapConfig에 `daemon` 필드 없음

## Approach

### 게이트 패턴 — 호출 측에서 config 체크

- `triggerIndexing` / `ensureRegistered` 함수 시그니처는 그대로 유지 (silent fail이 이미 내장).
- 호출 측(start.ts, learning.ts, implementation.ts, completion.ts)이 `config.daemon === true`일 때만 함수 호출.
- 이유: caller가 이미 config를 다른 용도로 읽고 있어 추가 비용 없음. 함수 내부 게이트는 silent fail과 중복.

### Dog-fooding 검증 전략 — gen-066 패턴 재사용

- implementation 마지막에 `.reap/config.yml`에 `daemon: true` 추가.
- 그 결과 본 generation의 validation 단계 (`npx reap run validation`)가 daemon 호출 흐름의 첫 사용자가 됨.
- daemon이 빌드되지 않은 상태여도 silent fail이 작동하므로 validation 차단 위험 없음.

### Genome 동기화 (embryo)

embryo generation이므로 evolution.md에 본 generation에서 발견한 패턴 ("config opt-in 게이트는 호출 측에서", "lifecycle 단위 daemon trigger 시점") 명문화 가능. **단, adapt phase에서 처리** — implementation/validation 단계에서 genome 수정 회피.

### 테스트 정책 — 본 generation 범위

backlog 본문 명시: "이번 generation에는 e2e 테스트 추가 없음 (gen-069에서 담당)". 따라서:
- typecheck pass
- build pass
- 기존 unit/e2e 회귀 없음 (`config.daemon` 기본값 false → byte-identical 동작 보장)

추가 unit/e2e는 작성하지 않음.

## Completion Criteria

1. `npm run typecheck` pass (회귀 없음)
2. `npm run build` pass (회귀 없음)
3. `bun test tests/unit/` 회귀 없음 (gen-067 기준 427/0, +0)
4. `bun test tests/e2e/` 회귀 없음 (gen-067 기준 218/1, +0 — pre-existing init-repair fail 무관)
5. `config.daemon` 부재/false 시 daemon 관련 모든 CLI 동작 byte-identical (회귀 안전 핵심)
6. `src/templates/reap-guide.md` 의 "Code Intelligence (Daemon)" 섹션이 추가되고, `reap install-skills` 또는 `reap update` 흐름이 `~/.reap/reap-guide.md`에 자동 반영 가능 (sync 메커니즘 신뢰)
7. `.reap/config.yml`에 `daemon: true` 활성 상태에서 본 generation validation이 정상 완료 (self-dogfooding)

## Scope

### In Scope (수정 파일)

- `src/types/index.ts` — `ReapConfig.daemon?: boolean` 추가
- `src/cli/commands/run/start.ts` — daemon 호출에 config 게이트 + ensureRegistered 우선
- `src/cli/commands/run/learning.ts` — work phase에 `ensureRegistered + triggerIndexing` 추가
- `src/cli/commands/run/implementation.ts` — complete phase에 triggerIndexing 추가
- `src/cli/commands/run/completion.ts` — commit phase의 triggerIndexing에 config 게이트
- `src/cli/commands/load-context.ts` — dynamic context에 `daemonEnabled` / `daemonReady` 추가
- `src/core/prompt.ts` — `buildBasePrompt`에 `daemon: true` 시 daemon 사용법 절 추가
- `src/templates/reap-guide.md` — "Code Intelligence (Daemon)" 섹션 신설
- `src/templates/agents/reap-evolve.md` — lifecycle 단계별 daemon 활용 지침 추가
- `src/templates/agents/reap-evaluate.md` — impact 분석 활용 절 추가
- `daemon/src/types.ts` — `ProjectEntry.lastIndexedCommit?: string` 추가
- `daemon/src/registry.ts` — `updateLastIndexed(id, commit?)` 시그니처 확장
- `daemon/src/indexer/pipeline.ts` — `PipelineResult.lastCommit?: string` 추가
- `daemon/src/api/projects.ts` — index handler에서 commit hash registry 전파
- `.reap/config.yml` — `daemon: true` 추가 (dog-fooding)

### Out of Scope (분리)

- **MCP server interface** (백로그 항목 5) — daemon/ 패키지 변경 크고 검증 필요. adapt phase에서 새 backlog로 인간 검토.
- **자동 staleness 판단으로 자동 reindex 트리거** — 본 generation은 staleness check 인프라 (lastIndexedCommit 노출)까지만. agent가 직접 비교하는 흐름. CLI 자동 판단은 향후.
- **daemon e2e 테스트 + fixture 프로젝트** — gen-069 담당 (이미 별도 backlog `daemon-e2e-테스트-계획-및-fixture-프로젝트-구축.md` 존재).
- **OpenCode adapter 대응 변경** — daemon 통합이 client-agnostic이라 어댑터별 추가 작업 없음. 단, install-skills 흐름에서 user-level sync는 기존 메커니즘이 처리.

## Tasks

- [ ] T001 `src/types/index.ts` — `ReapConfig` interface에 `daemon?: boolean` 필드 + JSDoc 추가
- [ ] T002 `src/cli/commands/run/start.ts` — L187-189 daemon 호출을 config.daemon 게이트로 감싸고 `ensureRegistered` 먼저 호출
- [ ] T003 `src/cli/commands/run/learning.ts` — work phase 진입 직후 (setTransitionNonces 직전 또는 직후) config 로드 + `ensureRegistered` + `triggerIndexing` (config.daemon === true 일 때만)
- [ ] T004 `src/cli/commands/run/implementation.ts` — complete phase에 config 로드 + `triggerIndexing` (config.daemon === true 일 때만, archive 직후)
- [ ] T005 `src/cli/commands/run/completion.ts` — L466-467 commit phase의 triggerIndexing에 config.daemon 게이트
- [ ] T006 `src/cli/commands/load-context.ts` — `buildKnowledgeContext`에 `# Daemon` 섹션 추가 (daemonEnabled + daemonReady, daemon=true일 때만)
- [ ] T007 `src/core/prompt.ts` — `buildBasePrompt`에 `daemon: true`일 때 "Code Intelligence" 절 추가
- [ ] T008 `src/templates/reap-guide.md` — "Code Intelligence (Daemon)" 섹션 추가 (Slash Commands 절 뒤)
- [ ] T009 `src/templates/agents/reap-evolve.md` — "Code Intelligence" 절 추가 (Behavior Rules 뒤)
- [ ] T010 `src/templates/agents/reap-evaluate.md` — "Impact Analysis (Daemon)" 절 추가 (Evaluation Workflow Phase 2 내)
- [ ] T011 `daemon/src/types.ts` — `ProjectEntry.lastIndexedCommit?: string` 추가
- [ ] T012 `daemon/src/registry.ts` — `updateLastIndexed(id: string, commit?: string)` 시그니처 확장 (commit이 주어지면 entry에 set)
- [ ] T013 `daemon/src/indexer/pipeline.ts` — `PipelineResult`에 `lastCommit?: string` 추가, 두 pipeline 함수가 HEAD를 result에 포함
- [ ] T014 `daemon/src/api/projects.ts` — index handler에서 `result.lastCommit`을 `registry.updateLastIndexed(params.id, result.lastCommit)`에 전달
- [ ] T015 `.reap/reap-guide.md` 수동 sync — `src/templates/reap-guide.md`와 동일한지 확인 (변경분 반영)
- [ ] T016 `.reap/config.yml` — `daemon: true` 추가 (dog-fooding 활성화). implementation 마지막에 추가.
- [ ] T017 build + dist (`npm run build`) — daemon CLI도 변경됐으므로 `daemon/` 별도 build 시도 (있으면)

## Dependencies

- T001 (types) → T002, T003, T004, T005, T006, T007 (config 필드 사용)
- T011 (daemon types) → T012 (registry), T013 (pipeline), T014 (api)
- T013 (pipeline result) → T014 (api consumes)
- T008 (reap-guide.md) → T015 (sync)
- T002~T010 (모든 코드/template) → T016 (config 활성화, dog-fooding) → validation

순서: T001 → T011~T014 (daemon side) → T002~T007 (CLI gates) → T008~T010 (templates) → T015 → T016 → T017 → validation.

## Risk Assessment

### 위험 1: daemon 미빌드 상태에서 dog-fooding 실패
- 현황: `daemon/dist/`이 비어있음. `ensureDaemon`이 `require.resolve("@c-d-cc/reap-daemon/dist/index.js")` 또는 `daemon/dist/index.js` 시도. 실패 시 3s timeout 후 error throw.
- 완화: `triggerIndexing` / `ensureRegistered`가 `try/catch`로 silent fail. 따라서 CLI 동작 자체는 차단되지 않음. validation 시 daemon 응답은 없지만 lifecycle 흐름은 OK.
- 결론: 위험 없음. 단, `daemon: true` 활성화가 어떤 부수효과를 일으키는지 (예: load-context의 daemonReady false 표시) 확인 필요.

### 위험 2: `daemonRequest`가 매번 ensureDaemon 호출 → daemon=true일 때 매 lifecycle 호출마다 spawn 시도
- 영향: daemon이 dist에 없으면 매번 require.resolve 실패 후 catch. 3s timeout이 실제로 발생할 수 있음 — UX 저해.
- 완화: 호출 측이 daemon 호출 시 await 대기. `triggerIndexing`은 fire-and-forget 패턴이 더 자연스러움. 단, 본 generation 범위에서 그 refactor는 별도 작업. 일단 silent fail에 의존하고, 3s timeout이 명백히 문제되면 별도 backlog.
- 추가 완화: `triggerIndexing`을 사용하는 모든 caller에서 `await`를 유지하되, 실제 3초 대기가 부담스러우면 `.catch(() => {})` 패턴으로 fire-and-forget 가능. 단, fire-and-forget은 process 종료 시 promise 미완료 위험.
- 결론: 본 generation은 silent fail 신뢰 + 사용자 환경에서 실제 영향 관찰. validation 단계에서 응답 시간 체감 시 backlog 화.

### 위험 3: load-context의 daemonReady fetch가 SessionStart hook을 느리게 함
- 영향: SessionStart hook이 fetch 1회 추가 → daemon 없으면 timeout 500ms.
- 완화: `daemon !== true`이면 fetch 안 함. config.daemon 비활성 사용자 100% 영향 없음. 활성 사용자는 500ms 한 번 — 수용 가능.

### 위험 4: 기존 daemon CLI 동작 변경 (`reap daemon status`, `reap daemon index`)
- 범위 외. 본 generation은 daemon CLI subcommand는 건드리지 않음. 단, types.ts의 `ProjectEntry` 변경이 호환성 깨지지 않아야 함 — optional 필드만 추가하므로 OK.

### 위험 5: dog-fooding 활성 직후 self-build 흐름 회귀
- 시나리오: `.reap/config.yml: daemon: true` 추가 후 `npm run build` 실패하면, validation 단계가 차단됨.
- 완화: build는 본 generation 영향 없음 (CLI 코드만 변경). 단, daemon import / runtime 호출이 있는 위치에서 typecheck 잠재 오류 가능. T017이 catch.

## Test Strategy

### 테스트 정책

backlog 본문 명시 — "이번 generation에는 e2e 테스트 추가 없음 (gen-069에서 담당)". 따라서 본 generation의 검증은:

| 검증 항목 | 방법 |
|---|---|
| typecheck | `npm run typecheck` |
| build | `npm run build` |
| 기존 unit 회귀 | `bun test tests/unit/` |
| 기존 e2e 회귀 | `bun test tests/e2e/` |
| `daemon: false` byte-identical | unit/e2e 회귀가 통과하면 자연 충족 (기존 테스트 모두 daemon: false 기준) |
| dog-fooding | `.reap/config.yml: daemon: true` 활성 후 `npx reap run validation` 호출 흐름이 정상 — 본 generation의 validation 자체가 첫 사용자 |

### Validation 단계에서 실행할 명령

1. `npm run typecheck`
2. `npm run build`
3. `bun test tests/unit/`
4. `bun test tests/e2e/`
5. (선택) `daemon/` package typecheck — daemon types/registry/pipeline/api 변경분 검증. daemon에 build 스크립트가 있다면 `cd daemon && npm run build`.

## Echo Chamber Prevention 점검

- 본 generation의 인과 범위: daemon 통합 강화 — config opt-in, agent 지시문, 인덱스 갱신 시점, 생명주기, commit hash staleness.
- backlog 본문이 명시한 항목 1~4는 모두 인과 범위 내.
- 항목 5 (MCP server) 는 인과 범위 외 — adapt phase에 새 backlog로 분리.
- "있으면 좋겠다" 자율 추가는 없음. 모든 task가 backlog 본문에 1대1 대응.
- `[autonomous]` 태그 필요 task 없음.

## Verification Checklist — 사용자 진입점 4-항목 (gen-063 교훈)

본 generation은 새 client adapter / 외부 도구 통합 / 사용자 진입점 추가는 아니지만, daemon 활성화 후 사용자가 평소처럼 REAP를 호출했을 때 daemon이 보이게 하는 흐름이 새로 생긴다. 4-항목 적용:

1. **Static knowledge 자동 로드 메커니즘**: reap-guide.md / reap-evolve.md / reap-evaluate.md에 daemon 절. Claude Code는 `@` import로 자동, OpenCode는 `instructions`로 자동. T008/T009/T010 충족.
2. **Dynamic state refresh trigger**: SessionStart hook (load-context)에 daemonEnabled / daemonReady 추가. OpenCode 측은 dump-state-sync 같은 sync builder 호출 — `buildKnowledgeContextSync`도 검토 필요 (T006 sub-task).
3. **Entry-point 파일**: CLAUDE.md / AGENTS.md는 reap-guide reference만 있으면 됨. 본 generation에서 entry-point 자체는 변경 안 함.
4. **Trigger 등록**: daemon은 자동 trigger 방식 (lifecycle 시점). 별도 slash command 필요 없음. 기존 `reap daemon status/index/query` CLI는 이미 존재.

추가 점검: `src/core/dump-state-sync.ts` (있다면) 도 load-context.ts와 byte-identical 출력해야 하므로, T006 작업 시 sync 버전도 함께 갱신.

## 의도된 Genome 변경 (adapt phase 예정)

embryo이므로 implementation 중에도 변경 가능하지만, **adapt phase에서 처리하는 것이 안전** (gen-066 패턴). adapt phase에 명문화할 내용 후보:

- application.md "Source Structure" → `src/cli/commands/daemon/lifecycle.ts`에 config 게이트 패턴 명시
- evolution.md → "Config opt-in 게이트는 호출 측에서" 원칙 추가
- environment/summary.md → `ReapConfig.daemon` 필드, lifecycle 단위 daemon trigger 시점 명시

implementation 단계는 코드 변경만 수행.

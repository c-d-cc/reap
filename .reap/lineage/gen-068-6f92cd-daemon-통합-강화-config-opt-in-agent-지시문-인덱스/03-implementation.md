# Implementation Log

## Completed Tasks

| Task | Files | Notes |
|---|---|---|
| T001 | `src/types/index.ts` | `ReapConfig.daemon?: boolean` 추가 + JSDoc (회귀 안전 명시) |
| T011 | `daemon/src/types.ts` | `ProjectEntry.lastIndexedCommit?: string \| null` 추가 |
| T012 | `daemon/src/registry.ts` | `register`가 `lastIndexedCommit: null` 으로 초기화. `updateLastIndexed(id, commit?)` 시그니처 확장 |
| T013 | `daemon/src/indexer/pipeline.ts`, `daemon/src/indexer/index.ts` | `PipelineResult.lastCommit?: string \| null` 추가. full/incremental/no-change/concurrent guard 4 경로 모두 lastCommit 반환 |
| T014 | `daemon/src/api/projects.ts` | index handler가 result.lastCommit을 `registry.updateLastIndexed(id, commit)` 에 전달 |
| T002 | `src/cli/commands/run/start.ts` | `config.daemon === true` 게이트 + `ensureRegistered` 우선 호출 + `triggerIndexing` |
| T003 | `src/cli/commands/run/learning.ts` | work phase에 config gate + ensureRegistered + triggerIndexing 추가 |
| T004 | `src/cli/commands/run/implementation.ts` | complete phase에 config gate + triggerIndexing 추가 (auto-transition 직후) |
| T005 | `src/cli/commands/run/completion.ts` | commit phase의 triggerIndexing 호출에 config.daemon 게이트 |
| T006 | `src/cli/commands/load-context.ts`, `src/core/dump-state-sync.ts` | `buildDaemonStaticSection()` export 신설, 양 빌더가 같은 helper 호출 (byte-identical 보장). Readiness probe는 의도적으로 제외 — SessionStart hook이 fast/dep-free 유지 |
| T007 | `src/core/prompt.ts` | `buildBasePrompt`에 `config?.daemon === true` 일 때 "Code Intelligence (Daemon)" 절 추가 |
| T008 | `src/templates/reap-guide.md` | "Code Intelligence (Daemon)" 섹션 신설 (CLI Commands 절 뒤). Opt-in, 자동 trigger 지점, query 예시, 정체성 검사 프로토콜, 사용 가이드 포함 |
| T009 | `src/templates/agents/reap-evolve.md` | "Code Intelligence (Daemon)" 섹션 추가 (Critical Don'ts 뒤). lifecycle 단계별 활용 + 프로토콜 + fallback |
| T010 | `src/templates/agents/reap-evaluate.md` | Phase 2 Verification 5번 항목으로 impact 분석 절 추가 (daemon down/opt-out 시 silent skip) |
| T015 | `.reap/reap-guide.md`, `~/.reap/reap-guide.md` | template과 동일하게 sync (cp) |
| T016 | `.reap/config.yml` | `daemon: true` 추가 — dog-fooding. 본 generation 의 validation/completion 호출이 daemon 게이트를 자기 자신에게서 검증 |
| T017 | `daemon/src/indexer/pipeline.ts`, `daemon/src/api/projects.ts`, `src/cli/commands/run/start.ts`, `src/cli/commands/run/completion.ts` | unused imports 정리 (ExtractResult/GraphEdge/ProjectEntry) + `emitOutput` (never 리턴) 뒤 unreachable `return;` 제거. `npm run typecheck` pass, `npm run build` pass (0.57MB, 150 modules), unit 427/0, e2e 218/1 (pre-existing init-repair fail, 회귀 0) |

## Discovered Issues

- `daemon/src/indexer/storage.ts` 의 2개 TS 에러 (`bun:sqlite` 모듈 / globalThis index)는 본 generation 변경 외부 (gen-052 commit 부터 존재). 본 generation 범위 밖. 향후 backlog 후보.

## Deferred Items

- 자동 staleness 판단으로 자동 reindex — 현재 generation에서는 daemon 측 `lastIndexedCommit` 노출까지만. CLI가 자동으로 git HEAD와 비교해 reindex 트리거하는 흐름은 향후. reason: 단순 노출만으로 agent prompt에서 staleness 판단 가능하므로 충분.
- MCP server interface (백로그 항목 5) — adapt phase에서 새 backlog로 인간 검토 예정.

## Architecture Decisions

### config 게이트 호출 측 패턴 (학습/계획 단계 결정의 확정)

- `triggerIndexing` / `ensureRegistered` 함수 시그니처는 그대로. 호출 측 4곳 (start.ts, learning.ts, implementation.ts, completion.ts)에서 각각 `config?.daemon === true` 체크 후 dynamic import + 호출.
- 함수 내부 silent fail은 기존대로 존속 — 게이트가 추가 안전망.
- 함수 자체에 config를 inject하지 않는 이유: 호출 측이 이미 config를 다른 용도로 읽고 있어 자연 흐름. import도 dynamic이라 daemon 미사용 사용자는 모듈 로드도 안 함.

### 양 builder (load-context vs dump-state-sync) byte-identical 보장 — `buildDaemonStaticSection` export

- 처음에는 async 빌더에 daemon readiness probe (`/health` fetch)를 추가하려 했으나, sync 빌더가 같은 동작 불가 (sync fetch 부재).
- 결정: 양 빌더가 동일한 static 절만 emit. Readiness 판단은 caller (subagent 또는 agent prompt) 가 직접 `/health` 호출.
- 이점: byte-identity 유지, SessionStart hook이 빠르고 dependency-free, 기존 test (dump-state.test.ts) 회귀 0.
- 비용: agent가 readiness 확인 한 단계 추가 — 단, 본 generation 의 prompt에 "Health: curl 명령" 예시 명시되어 있어 자연스러움.

### Daemon types optional 필드 backward compat

- `lastIndexedCommit?: string | null` 로 추가 — optional + nullable. 기존 registry.json 파일 (필드 없음) 도 그대로 load 가능. `register`에서 신규 entry에 명시적 `null` 초기화 — type narrowness 일관성.
- pipeline result `lastCommit?: string | null` — git 비활성 환경에서도 catch 후 null 가능.

### `import basename` 도입

- start.ts와 learning.ts에서 `ensureRegistered(root, name)` 호출 시 name 인자 필요. `basename(paths.root)` 로 디렉토리 이름 추출. 기존 import 경로 유지 + `basename` 추가.

### Echo chamber 검증 — 인과 범위 점검

- 본 generation은 backlog 항목 1~4만 처리. 항목 5 (MCP server)는 명시적으로 제외 — adapt phase에서 별도 backlog로 인간 검토.
- 자율 추가 없음. 모든 task가 backlog 본문에 1:1 대응.
- `[autonomous]` 태그 필요 task 없음.

## 잔여 — implementation 마지막 단계

(없음 — T001~T017 모두 완료. validation 진입 준비됨.)

## Test Results

- typecheck (main): pass
- build (main): pass — `dist/cli/index.js` 0.57MB / 150 modules / 29ms
- unit: 427 pass / 0 fail / 1167 expect
- e2e: 218 pass / 1 fail (`init-repair > skips when REAP section already present` — pre-existing, 본 generation 회귀 0)
- daemon typecheck: storage.ts 2개 pre-existing 에러 (gen-052 이후 존재, 본 generation 범위 밖)

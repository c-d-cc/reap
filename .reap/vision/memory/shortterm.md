# Shortterm Memory

## 세션 요약 (2026-06-27)

### gen-069: daemon e2e 검증 인프라 구축 — fixture + helper + 21 cases + 격리 + 발견된 TS call references bug fix

gen-068 의 daemon 통합 강화 (config opt-in, agent prompt 절, 4 lifecycle 진입점 auto-trigger, lastIndexedCommit 노출) 가 자동화된 검증 없이 진행됨. 본 generation 은 그 갭을 메움.

**핵심 변경**:

- **Part 1 (격리 인프라)**: `REAP_DAEMON_PORT` env var 양방향 (daemon binary `resolvePort()` + REAP CLI client `getBaseUrl()` 함수화). 미설정 시 17224 fallback. 사용자 daemon 무영향 보장.
- **Part 2 (`daemonReady` 노출)**: `lifecycle.ts` 의 `ensureRegistered` + `triggerIndexing` return type `Promise<void>` → `Promise<boolean>` 변경. `learning.ts` emit context 에 `daemonEnabled` (항상) + `daemonReady` (daemon=true 시에만, spread 패턴 으로 회귀 0).
- **Part 3 (fixture)**: `tests/fixtures/daemon-sample/` — TS 3 파일 (User / formatUser+validateId / main). `.git` 은 submodule 미커밋, helper 가 매번 git init.
- **Part 4 (helper)**: `tests/helpers/daemon.ts` — 8 export (`spawnTestDaemon`, `stopTestDaemon`, `waitForDaemon`, `registerFixture`, `copyFixture` + bonus `triggerIndex`, `getProjectStatus`, `cleanupFixture`). `bun src/index.ts` 로 daemon spawn (dist queries path bug 회피).
- **Part 5 (21 e2e cases)**: 4 파일 (`daemon-config` 5 + `daemon-lifecycle` 4 + `daemon-indexing` 6 + `daemon-query` 6). 모두 pass.
- **Discovered fix (Part 6)**: `daemon/queries/typescript-tags.scm` + `tsx-tags.scm` 에 `(call_expression function: (identifier) @name.reference.call)` + member call 캡처 추가 — 본 generation 의 case 2/3 (callers/callees) fail 디버그 중 발견. daemon 의 TS call references 미감지 버그. 1-line fix, 검증 인프라 의 검증 대상이 정상 작동하려면 필수. workaround 금지 + 인과 묶음 원칙 (gen-065) 적용.

**결과**: typecheck pass / build pass / unit 427/0 / e2e 239 pass 1 fail (pre-existing init-repair). 21/21 신규 pass. 회귀 0.

### 다음 세션 / 다음 generation

**1. Release v0.16.6** — gen-068 + gen-069 묶음 권장. 핵심 주제:
- gen-068: daemon 통합 강화 (config opt-in / 4 lifecycle 진입점 / lastIndexedCommit 노출)
- gen-069: daemon e2e 검증 인프라 + typescript-tags.scm fix (TS callers/callees 본래 동작)

**2. daemon dist 의 queries path resolution fix** — gen-064 패턴 (`__dirname.includes("dist")` 분기) 적용 권장. 본 generation 의 helper 는 `bun src/index.ts` 로 회피했으나 dist 사용자 (npm postinstall auto-spawn) 영향 잔존.

**3. import-resolver `.js` extension 자동 strip** — TypeScript ESM 규약 (`import { x } from "./foo.js"`) 이 daemon impact 분석 에 잡히도록. fix 후 fixture import specifier 를 production-realistic 형태로 복원 가능.

**4. Vision/Goal management 위임 (evaluator 트랙 마지막 큰 항목)** — `vision/design/evaluator-agent.md` 의 잔여 항목. validation + fitness wiring 이 gen-066~067 으로 완료, daemon 인프라 가 gen-068~069 로 완료. 다음 큰 트랙.

### deferred 후보 (사용자 판단 후 backlog 화)

**신규 (gen-069)**:
1. **daemon dist queries path fix** — 위 2번. `__dirname.includes("dist")` 분기.
2. **import-resolver `.js` extension strip** — 위 3번. `resolveJsPath` 의 candidates 에 `.js` strip 버전 추가.
3. **`copyFixture()` 가 realpath() 자동 적용** — 본 generation 의 daemon-indexing.test.ts 가 lifecycle describe 에서 명시적으로 `realpath()` 호출. helper 가 자동 normalize 하면 모든 호출 site 가 동일 처리.
4. **typescript-tags.scm 의 추가 캡처 검토** — 본 generation 은 plain function call 만 추가. member call 추가 했으나 `new_expression` 의 인자, decorator 등은 미커버. 사용 사례 보이면 확장.

**기존 (gen-066~067 shortterm 누적, 사용자 판단 후 backlog 화)**:
- `opencode-init-agent-flag`, `unify-sync-async-knowledge-builder`, `init-repair-skipped-message-fix` (pre-existing e2e fail), `fileExists 디렉토리 버그`, `disable-model-invocation` 분리, prefix marker cleanup 강화, OpenCode plugin `tool.execute.after` dump, Codex adapter (큰 트랙), evaluator vision/goal 위임 (위 4번과 중복 — 단일화), `reap consume backlog` helper, `reap make backlog` 외 경로로 만든 backlog warn, TS `noUnusedLocals`/`noUnusedParameters` 활성화 검토, validation prompt fallback "Agent tool 부재" 강화, evaluatorConcerns 중복 detection 경고, `report-evaluator` resolve/dismiss CLI (현재 append-only), 테스트 레벨 선택 휴리스틱 명문화.

### 본 generation 의 self-evolving 작동 사례

- **gen-068 의 self-dogfooding → gen-069 의 자동화 승격**: gen-068 의 `config.daemon: true` 가 자기 자신을 첫 사용자 (manual self-test). gen-069 가 그 검증을 21 e2e 로 자동화 → 미래 모든 generation 의 안전망. **patterns 가 generation 을 거치며 자동화 layer 를 누적**.
- **discovery 기반 fix 의 적절한 범위 판단 (workaround 금지 + 인과 묶음)**: typescript-tags.scm 의 call references 미정의는 검증 인프라 의 범위 외였으나, 검증 자체가 그 동작에 의존 → 본 generation 에서 fix. 분리 시 검증이 의미 없음. gen-065 의 "인과로 묶인 fix" 원칙의 testing infrastructure context 적용.

### 코드 변경 위치 (다음 세션 참조용)

**메인 repo**:
- `daemon/src/index.ts` — `resolvePort()` 헬퍼 + env var 반영
- `src/cli/commands/daemon/client.ts` — `getBaseUrl()` 함수화 + 3 곳 fetch 교체
- `src/cli/commands/daemon/lifecycle.ts` — return Promise<boolean>
- `src/cli/commands/run/learning.ts` — emit context daemonEnabled / daemonReady
- `daemon/queries/typescript-tags.scm` + `tsx-tags.scm` — call_expression 캡처 추가

**tests submodule**:
- `tests/fixtures/daemon-sample/{package.json, .gitignore, src/{types,utils,index}.ts}`
- `tests/helpers/daemon.ts`
- `tests/e2e/daemon-{config,lifecycle,indexing,query}.test.ts`

**메타**:
- `.reap/environment/summary.md` — Tests 절 + Types 절 갱신

### Backlog 상태 (gen-069 commit 직후 예상)

- `daemon-e2e-테스트-계획-및-fixture-프로젝트-구축.md` (consumedBy: gen-069-8d6f0e) — gen-069 archive → `lineage/gen-069-*/backlog/` 로 이동.
- `.reap/life/backlog/` 의 pending 항목: 0 예상.

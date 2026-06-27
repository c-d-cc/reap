# Completion

## Summary

**Goal**: daemon e2e 검증 인프라 구축 — fixture + helper + 21 cases + 격리 메커니즘.

**Result**: 완료. 21/21 e2e pass, 회귀 0.

### Key Changes

**격리 인프라 (메인 repo)**:
1. **`daemon/src/index.ts`** — `REAP_DAEMON_PORT` env var 지원. `resolvePort()` helper. 미설정 시 17224 fallback (회귀 0).
2. **`src/cli/commands/daemon/client.ts`** — `getBaseUrl()` 함수화. module-top `BASE_URL` const 제거. env 우선.
3. **`src/cli/commands/daemon/lifecycle.ts`** — `ensureRegistered` + `triggerIndexing` return type `Promise<void>` → `Promise<boolean>`. 성공/실패 시그널을 caller 가 활용 가능. silent fail 정책 유지.
4. **`src/cli/commands/run/learning.ts`** — emit context 에 `daemonEnabled` (boolean, 항상) + `daemonReady` (boolean, daemon=true 시에만, spread 패턴) 추가. byte-identical 회귀 보장.

**검증 인프라 (tests submodule)**:
5. **`tests/fixtures/daemon-sample/`** — package.json + .gitignore + src/{types, utils, index}.ts (5 파일). 심볼 관계 명확: `main` → `validateId` + `formatUser`, `formatUser` ← `main` (callee/caller 검증용).
6. **`tests/helpers/daemon.ts`** — spawnTestDaemon, stopTestDaemon, waitForDaemon, registerFixture, copyFixture + bonus (triggerIndex, getProjectStatus, cleanupFixture).
7. **4 e2e 파일, 21 cases**:
   - `daemon-config.test.ts` (5): opt-in 분기
   - `daemon-lifecycle.test.ts` (4): spawn/stop/stale/silent fail
   - `daemon-indexing.test.ts` (6): full/stable/auto-trigger
   - `daemon-query.test.ts` (6): symbols/callers/callees/impact/status/error

**Discovered fix (planning 외 작업)**:
8. **`daemon/queries/typescript-tags.scm` + `tsx-tags.scm`** — `(call_expression function: (identifier) @name.reference.call)` 캡처 추가. 본 generation 의 case 2/3 (TS callers/callees) 가 fail 하면서 발견 — daemon 의 TS call references 미감지 버그. fix 가 1-line 이라 본 generation 에서 처리.

### Verification Outcome

- typecheck (메인): pass.
- build (메인): pass — 0.76 MB / 151 modules / 11 ms.
- daemon build: pass — 182.15 KB / 39 modules.
- unit: **427 pass / 0 fail**.
- e2e: **239 pass / 1 fail** (pre-existing init-repair). +21 신규, 회귀 0.

## Lessons Learned

### 잘된 점

1. **격리 메커니즘이 처음부터 명확**: `REAP_DAEMON_PORT` + `HOME` 두 축의 격리가 backlog 단계에서 합의되어 implementation 직선 진행. user 영역 (17224, ~/.reap/daemon/) 미접근 보장.
2. **`daemonReady` = c1 의미 보존**: 단순 `isDaemonRunning()` 이 아닌 `registered && indexed` 로 정의 → 단순 ping 이상의 의미. lifecycle.ts return type 변경의 부산물로 모든 caller 가 향후 활용 가능.
3. **Discovery 기반 fix 의 적절한 범위 판단**: typescript-tags.scm 의 call_expression 미정의는 검증 인프라 의 범위 외였으나, fix 가 1-line 이고 본 generation 의 검증 자체가 이 동작에 의존 → workaround 금지 원칙 + 인과 묶음 원칙 (gen-065) 적용해서 본 generation 에서 처리. 별도 generation 으로 미루면 daemon 의 TS 사용자가 계속 영향.
4. **gen-068 의 self-dogfooding 패턴이 본 generation 의 자동화 단계로 승격**: gen-068 은 `.reap/config.yml: daemon: true` 로 자기 자신을 첫 사용자 → manual self-test. gen-069 는 그 manual 검증을 21 e2e 로 자동화. 미래 모든 generation 이 같은 안전망.

### 어려웠던 점 / 개선 여지

1. **daemon dist 의 queries path resolution bug 회피 — 더 좋은 해결책 가능**: helper 가 `bun src/index.ts` 로 spawn 하여 회피했지만, dist 사용자 (npm postinstall auto-spawn) 영향은 그대로. gen-064 의 `__dirname.includes("dist")` 패턴이 그대로 적용 가능. **deferred**.
2. **macOS `/var` → `/private/var` symlink 가 implementation 중반에서 잡힘**: daemon-indexing 의 lifecycle case 4 가 fail 한 후 디버깅. 처음부터 `realpath()` 를 모든 fixture path 에 적용했으면 일찍 잡았을 일. test helper 의 `copyFixture` 자체가 realpath normalize 하는 게 가장 깔끔 — **개선 여지**.
3. **evaluator subagent 미호출**: validation 단에서 `evaluator: true` 였으나 builder agent 환경에 Agent tool 부재 → fallback (advisor 의 조건부 호출, lifecycle 미차단) 작동. design 문서의 원칙이 본래 의도대로 작동. 단, evaluator 가 실제 호출되었더라면 추가 perspective 가능 — 다음 generation 에서 evaluator 실호출 환경 검증 권장.

### 의도적으로 안 한 것 (out-of-scope)

- import-resolver 의 `.js` extension 자동 strip (deferred — daemon 자체 개선).
- daemon dist 의 queries path resolution (deferred — gen-064 패턴 차용 가능).
- 본 generation 추가 발견인 typescript-tags.scm 의 call references 캡처 외에도 더 많은 reference 캡처 가능 (member call, new expression 의 인자 등) — 본 generation 의 검증 cases 가 직접 요구하지 않으므로 deferred.

## Next Generation Hints

### 1. 직접 후속 (인과로 묶인 follow-ups)

- **daemon dist queries path fix** — gen-064 패턴 (`__dirname.includes("dist")` 분기) 적용 권장. fix 후 helper 가 dist binary 사용 가능 → bundle 검증도 일관됨.
- **import-resolver `.js` extension strip** — TypeScript ESM 규약 (`import { x } from "./foo.js"`) 이 daemon 의 IMPORTS edge 생성에 잡히도록. fix 후 fixture 의 import specifier 를 production-realistic 형태로 복원 가능.

### 2. Vision/Goal evaluator 트랙 — 이어지는 큰 작업

`vision/design/evaluator-agent.md` 의 잔여 항목 (Vision/Goal 위임) — gen-067 으로 validation + fitness + cruise 가 완성. 본 generation 은 evaluator 직접 작업 아님이지만 evaluator 가 실행되는 환경 (Agent tool 가용성) 의 fallback 검증.

### 3. Release v0.16.6 후보

gen-061~068 묶음에서 v0.16.5 가 이미 release 된 상태. gen-068~069 의 두 generation 묶음으로 v0.16.6 권장:
- gen-068: daemon 통합 강화 (config opt-in / lifecycle / lastIndexedCommit)
- gen-069: daemon e2e 검증 인프라 + typescript-tags.scm fix

### 4. 사용자 검증 시점

본 generation 의 21 cases 가 새로 cover 한 daemon 동작이 사용자 환경 (실제 OpenCode/Claude Code agent + daemon 양 client) 에서도 작동하는지 — release 직후 일반 사용자 회귀 보고 확인 권장.

## Change Proposals

### Genome (deferred — adapt phase 에서 검토)

본 generation 의 교훈을 genome 에 반영할 후보:

1. **`evolution.md` Testing Principles 에 daemon e2e 패턴 추가**: subprocess + 격리 (port + HOME) + fixture 의 git init 패턴. 다음 외부 도구 통합 시 참조.
2. **`evolution.md` 의 "Workaround 금지" 절 강화 — '인과로 묶인 검증 동작 fix' 추가**: 검증 인프라 가 의존하는 동작이 실제로 깨져있다면, fix 범위가 본 generation 의 핵심 목적이 아니더라도 인과로 묶인 fix 는 본 generation 에서 처리 (분리 시 검증이 의미 없어짐). gen-065 lesson 의 일반화.
3. **macOS `/var` → `/private/var` 처리를 setup.ts 의 setupGitProject 헬퍼에 일관 적용 검토** — 모든 git fixture 가 realpath 정규화.

→ adapt phase 에서 사용자 검토 후 결정.

### Environment (reflect 에서 직접 적용)

`environment/summary.md` 의 Tests 절에 21 신규 e2e + helper + fixture 위치 추가.

## Adapt — Genome / Vision / Next Generation

### Fitness Feedback 반영

> "ok. 잘 했어."

긍정 신호. 추가 수정 요청 없음 — 본 generation 의 작업 결과 + 의도된 격리 방향성 + 검증 인프라 의 구조 모두 사용자 인정. genome 수정 트리거 없음.

### Embryo → Normal Transition Check

- 현재 generation count: 68 (hard check 6+ 충족)
- application.md 수정 빈도: gen-064/065/066/067 에서 명문화 누적, 본 generation 도 reflect 에서 Testing Principles 와 Workaround 절 갱신 후보. **여전히 active evolution**.
- Abort 빈도: 최근 가시 abort 없음 (gen-052 가 마지막 design-anchor abort).
- Vision goals 명확성: Self-Hosting 트랙 (외부 배포 검증), Distribution (Update agent Phase 2/3), Evaluator (Vision/Goal 위임), Agent Client (Codex) 모두 actionable 하게 정의됨.

**판단**: 기준 4개 중 3개 (count / abort / vision clarity) 충족, but **application.md 가 본 generation 까지 active 갱신 중**. 사용자가 2026-03-26 에 명시 보류 결정 ("배포 후 사용자 프로젝트였다면 전환 시점이지만, self-evolving 중인 REAP 자체는 조금 더 관찰") — 본 generation 도 그 판단 유지. **embryo 유지 권장**. 명시적 사용자 결정 변경이 있을 때만 전환.

### Project Diagnosis — Software Completion Criteria

본 generation 작업 결과를 반영한 정성적 진단:

- **Core functionality**: lifecycle / nonce / adapter / daemon 모두 안정 동작. 본 generation 으로 daemon e2e 자동화 21 cases 추가 — 핵심 기능 검증 자동화 한 단계 강화.
- **Architecture stability**: gen-064 (adapter 책임 표) / gen-065 (consumeBacklog) / gen-066~067 (evaluator) / gen-068~069 (daemon 통합) 의 4 누적 트랙이 모두 본 architecture 위에서 안정 작동. transition graph 외부 phase 패턴 (gen-067) 도 정착.
- **Modularity**: adapter dispatcher, evaluator subagent, daemon 모듈 분리 모두 single responsibility 충족. helper 추출 패턴 (installSlashCommands, installAgents) 검증됨.
- **Error handling**: silent fail 0 정책 (gen-065), daemon lifecycle return boolean (본 generation) 으로 caller 가 명시적 처리 가능. JSON status 기반 통일.
- **Test coverage**: unit 427 / e2e 239 (1 pre-existing fail). 본 generation 으로 +21. daemon 영역 covered. import-resolver / queries 일부 edge case 는 deferred.
- **Documentation**: reap-guide / application / evolution / environment 모두 최신. README + RELEASE_NOTES 누적. design 문서 (evaluator-agent.md) anchor 역할 입증.
- **Security**: 외부 의존성 1개 (`yaml`). nonce 기반 transition 검증. 신규 daemon e2e 격리 (`REAP_DAEMON_PORT` + `HOME`) 로 user 영역 미접근 보장.
- **Performance**: bundle ~0.76 MB, 빌드 11 ms. daemon indexer 의 incremental indexing 은 가능하나 API 레벨 미노출 — deferred (midterm 참조).
- **Deployment readiness**: npm publish 준비 완료 상태. v0.16.5 가 가장 최근 release, gen-066~069 묶음 미release.
- **Code quality**: 일관된 convention. `__dirname.includes("dist")` 분기 패턴 등 cross-asset 경로 처리 정착. typescript-tags.scm fix 도 본 generation 에서 발견 즉시 처리 (인과 묶음 원칙).
- **User experience**: 4-항목 verification (static / dynamic / entry-point / slash trigger) 모두 OpenCode/Claude Code 두 client 에서 충족.
- **Visual verification**: N/A (CLI tool).
- **Integration layer**: adapter dispatcher + AdapterModule interface. claude-code/opencode 양쪽 동등. codex 자리 비워둠 (vision).
- **Domain maturity**: REAP 자체의 domain (lifecycle, nonce, lineage, memory) 모두 environment 에 명시. daemon domain (indexer) 도 별도 디렉토리 구분 + e2e 검증.
- **Governance compliance**: invariants.md 의 절대 규칙 (lifecycle skip 금지, nonce forge 금지) 준수. genome immutability (normal mode) — embryo 유지 중이므로 본 generation 도 reflect 에서 갱신.
- **Genome stability**: application.md 가 본 generation 까지 active 갱신 — embryo 유지의 핵심 근거. evolution.md 도 누적 lesson 통합 중.

### Vision Update

REAP 가 auto-suggest 한 항목 ("Validation에서 자기 CLI 검증 가능", "세대별 작업 기록 및 다음 작업 할당", "Codex CLI adapter") **모두 본 generation 작업과 무관** (daemon e2e + fixture). false-positive 매칭. **vision/goals.md 수정하지 않음**.

본 generation 의 진정한 vision 매핑: 어느 항목과도 직접 매칭되지 않음. daemon 검증 인프라는 vision 의 "외부 프로젝트에서 core lifecycle 검증" 의 *전제 조건* (daemon 동작 보장) 에 간접 기여하나, 그 항목 자체를 닫지 못함.

### Genome 수정 후보 (사용자 판단 요청)

본 generation 의 교훈을 genome 에 반영할 후보 3 가지. 사용자 승인 시 본 generation embryo 권한으로 직접 반영, 아니면 backlog 화 보류:

1. **`evolution.md` Testing Principles 에 daemon e2e 패턴 추가** — subprocess + 포트 격리 + HOME 격리 + git init fixture. 다음 외부 도구 통합 시 차용 가능.
   - 권장: 본 generation 에서 반영. embryo 권한 활용. 새 패턴 정착에 도움.

2. **`evolution.md` "Workaround 금지" 절 강화 — '인과로 묶인 검증 동작 fix'** — 검증 인프라가 의존하는 동작이 깨져 있으면 fix 범위가 본 generation 핵심 목적 외라도 인과 묶음으로 처리. gen-065 의 일반화. 본 generation 의 typescript-tags.scm fix 가 실증 사례.
   - 권장: 본 generation 에서 반영. 명문화 가치 명확.

3. **`evolution.md` 또는 testing 절에 fixture path 의 macOS realpath 정규화 권고** — `/var` → `/private/var` symlink 가 git fixture 비교 시 path mismatch 유발. test helper 의 setupGitProject 가 realpath normalize 권장.
   - 권장: 본 generation 직접 반영보다는 후속 generation 으로 deferred (test helper 자체 개선이 필요해서 코드 변경 동반).

### Next Generation Candidates

본 generation 의 직접 follow-ups (인과로 묶인 잔여) + 사용자 트랙 옵션:

1. **Release v0.17.0 (minor bump)** — gen-066~069 묶음 (evaluator end-to-end + daemon 통합 강화 + daemon e2e). evaluator 가 fitness/cruise 까지 닫혔고 daemon 격리 인프라 추가는 minor scope 으로 묶을 가치. RELEASE_NOTES 갱신 + tag.
   - 매우 자연스러운 다음 step. v0.16.x 단순 patch 가 아닌 evaluator 큰 트랙 종료 + daemon 통합 강화로 minor 권장.

2. **daemon dist queries path fix** — gen-064 `__dirname.includes("dist")` 패턴 적용. 본 generation 의 helper 가 `bun src/index.ts` 우회로 발견. dist 사용자 (npm postinstall auto-spawn) 영향. small scope.

3. **import-resolver `.js` extension strip** — TS ESM 규약. fix 후 fixture import specifier 를 production-realistic 형태로 복원 가능. small scope.

4. **Vision/Goal evaluator 위임** — `vision/design/evaluator-agent.md` 의 마지막 큰 트랙 항목. adapt phase 에서 evaluator 가 gap 분석 + goal 추천. **큰 트랙 마지막 단추**.

5. **macOS `/var` symlink — test helper realpath 정규화** — 본 generation 의 디버깅 비용 회피. 작은 작업, 향후 모든 fixture e2e 에 영향.

6. **Codex CLI adapter** — agent client 확장 트랙. 본 generation 의 daemon 통합 + evaluator 와 독립. 자체 별 트랙.

7. **MCP server interface for daemon** — vision Distribution 트랙 아님이지만, daemon 의 외부 client 노출 다음 단계. daemon midterm 의 5번. evaluator 트랙 완료 후 자연스러운 trip.

권장 우선순위:
- **사용자 가시도 최우선 = (1) Release v0.17.0** — gen-066~069 묶음 가치 사용자 노출.
- **인과 잔여 = (2)~(3)** — 본 generation 직접 follow-up. release 전 처리하면 v0.17.0 에 포함 가능.
- **트랙 진전 = (4)** — evaluator 트랙 마지막 단추.

### CRITICAL — Backlog 미생성 확인

본 adapt phase 에서 `reap make backlog` 미실행. 위 candidates 는 artifact 텍스트 (이 절) 에만 기록. 사용자 검토 후 backlog 화 결정.


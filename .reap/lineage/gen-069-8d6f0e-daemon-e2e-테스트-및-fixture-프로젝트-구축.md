---
id: gen-069-8d6f0e
type: embryo
goal: "daemon e2e 테스트 및 fixture 프로젝트 구축"
parents: ["gen-068-6f92cd"]
---
# gen-069-8d6f0e
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
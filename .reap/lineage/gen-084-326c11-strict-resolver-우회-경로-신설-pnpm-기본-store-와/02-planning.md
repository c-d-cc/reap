# Planning

> gen-084 — daemon 위치 명시 지정 경로. Clarity **HIGH** — backlog 이 파일 목록까지 지목했으므로 탐색 대신 결정에 집중한다.

## Goal

**reap 과 daemon 이 서로 다른 resolution root 에 설치되어 자동 조회가 실패하는 환경**에서, 사용자가 daemon 위치를 직접 알려주면 REAP 이 그것을 쓰게 한다. 그리고 그 경로가 **실제로 동작함을 게이트가 검증**하게 한다.

> **generation goal 문장은 "pnpm 기본 store 와 Yarn PnP" 를 지목하고 있으나 그 지목은 실측과 어긋난다.** 아래 § Additional Findings ★ 참조 — 두 매니저는 정상 동작한다. 고쳐야 할 코드는 동일하고 문서 문구만 달라진다. 정정은 완료 artifact 에도 남긴다.

## Spec — 확정한 설계 결정 4건

backlog 이 답하지 않았거나 부정확했던 지점만 적는다. 나머지는 backlog 그대로.

### D1. 명시 경로는 인자로 흘리지 않고 `resolveDaemonBin` 이 스스로 읽는다

**이유**: `ensureDaemon()` → `daemonRequest` → `lifecycle.ts` → `run/*.ts` 로 이어지는 spawn 사슬에 config 를 흘리려면 시그니처 5단을 바꿔야 하고, **한 경로만 놓치면 "찾기는 하는데 띄우지는 못한다"는 반쪽 결함**이 생긴다. 조회 지점이 하나이므로 그 하나가 읽는 것이 맞다.

- env: `process.env.REAP_DAEMON_BIN` — call-time 조회. `resolvePort()` 의 `REAP_DAEMON_PORT` 선례를 그대로 따른다
- config: `process.cwd()/.reap/config.yml` 의 `daemonBin` — 동기 읽기. REAP 전 명령이 `createPaths(process.cwd())` 를 쓰고 상위 탐색을 하지 않으므로 새 가정이 아니다
- **둘 다 `DaemonResolveDeps` seam 으로 주입 가능**. 테스트가 실제 env/cwd 를 읽으면 gen-082 가 겪은 "격리가 성립하지 않는 축"이 하나 더 생긴다

우선순위: **env > config > 패키지 조회 > 체크아웃 > null**. env 가 위인 이유는 임시·CI 용도이기 때문.

### D2. 명시 경로가 빗나가면 — fall-through 하되 **항상 보고**한다

| 안 | 문제 |
|---|---|
| 빗나가면 즉시 null | `config.yml` 은 git 에 커밋된다. 머신 A 의 경로가 머신 B 에 없으면 B 는 정상 설치돼 있어도 죽는다 |
| 조용히 fall-through | 명시 지시가 무시됨 — 지금 고치는 결함과 같은 부류 |
| **채택: fall-through + 무조건 보고** | 머신 B 는 살고, 머신 A 의 오타는 정확히 지적된다 |

빗나감 보고는 **최종 판정과 무관하다**. 자동 탐색으로 daemon 을 찾아 `installed: true` 가 되어도 경고는 나온다.

### D3. 명시 경로에 신원 검사(package name)를 하지 않는다

체크아웃 후보의 신원 검사는 **`daemon` 이 실제 npm 이름이라 우연히 남의 것을 띄울 수 있어서** 존재한다. 사용자가 파일을 직접 지목하면 그 우연은 성립하지 않고, 반대로 소스 체크아웃(`daemon/src/index.ts`) 지목 같은 정당한 사용을 막는다. **존재 여부만** 본다.

편의 처리 2가지: 앞머리 `~/` 를 홈으로 전개, 상대 경로는 프로젝트 루트 기준으로 해석. 둘 다 사용자가 yaml 에 실제로 쓰는 형태다.

### D4. 게이트에 pnpm 을 넣지 않는다 — 진짜 실패 모드가 이미 게이트 안에 있다

`check-self-diagnosis.sh` 의 **5d 와 5e 사이**가 정확히 목표 상태다: daemon 이 디스크에 있고(`$DM_INSTALL/...`) 정상 동작하지만(5d 가 증명) reap 의 조회 경로에는 없다(5b 가 증명).

실측(§ Additional Findings ★) 이후 이 판단은 **더 강해졌다**. 그 상태는 pnpm 의 *대역*이 아니라 **실제로 깨지는 유일한 부류 — 분리 설치 — 그 자체**다. pnpm 을 게이트에 넣었다면 **깨지지 않는 것을 검사**하게 됐을 것이다.

pnpm/PnP 는 **로컬에서 1회 실측**해 "깨지지 않는다"는 사실을 근거로 남겼다(이미 수행). CI 에는 넣지 않는다.

## 자료 구조

```ts
// types/index.ts
export type DaemonBinSource = "env" | "config" | "package" | "checkout";
export interface ExplicitDaemonBin { source: "env" | "config"; path: string; }

interface DaemonAvailability {
  ...기존...
  /** bin 을 어디서 얻었는가. null = 아무것도 찾지 못함 */
  source: DaemonBinSource | null;
  /** 명시 지정됐으나 그 자리에 아무것도 없다. 최종 판정과 무관하게 채워진다 */
  explicitMiss: ExplicitDaemonBin | null;
  /** 설치했는데도 못 찾을 때 할 말. installCommand 와 같은 이유로 값에 실린다 */
  locateHint: string;
}

interface ReapConfig { ...; daemonBin?: string; }
```

`resolveDaemonBin(deps): string | null` **시그니처는 유지**한다 (`ensureDaemon` + 기존 unit 이 쓴다). 내부적으로 새 `locateDaemon(deps): DaemonLocation` 이 풍부한 결과를 만들고 `resolveDaemonBin` 은 `.bin` 만 돌려주는 얇은 래퍼가 된다. `resolveDaemonAvailability` 는 `locateDaemon` 을 쓴다.

## Requirements (FR)

- **FR1** `REAP_DAEMON_BIN` 이 가리키는 파일이 존재하면 REAP 은 그것을 daemon 으로 쓴다 (조회·기동 양쪽).
- **FR2** `.reap/config.yml` 의 `daemonBin` 이 가리키는 파일이 존재하면 같다. env 가 있으면 env 가 이긴다.
- **FR3** 명시 경로가 없거나 빗나가면 기존 자동 탐색(패키지 → 체크아웃)이 그대로 동작한다 — 기존 사용자 회귀 0.
- **FR4** 명시 경로가 빗나가면 최종 판정과 무관하게 그 사실이 보고된다 (`fix --check`, `daemon status`).
- **FR5** "설치되지 않음" 안내 세 곳(`fix --check` / `daemon status` / agent prompt)이 **위치를 알려주는 방법**을 함께 말한다.
- **FR6** 안내 문구는 한 곳이 소유하고 `DaemonAvailability` 에 실려 전달된다 (`core` 가 `cli` 를 import 하지 않는다).
- **FR7** `daemonBin` 미설정 시 동작은 gen-083 과 동일하다 (문구에 추가되는 안내 문장 제외).
- **FR8** 문서 7종(reap-guide 템플릿+사본, README 2, 로케일 5)이 이 경로를 설명한다.

## Completion Criteria

1. `resolveDaemonBin` 우선순위 5단계가 unit 으로 검증된다 (env>config>package>checkout>null, 빗나감 fall-through 포함).
2. 게이트 § 5d-bis 가 **daemon 이 reap 에서 조회 불가능한 실제 상태**에서 `daemonBin` / `REAP_DAEMON_BIN` 양쪽으로 daemon 이 **기동됨**을 확인한다. **bun / bun 은닉 두 조합 모두.**
3. § 5d-bis 의 각 assertion 이 **먼저 실패하는 것을 확인**했다 (negative test).
4. **실제로 깨지는 레이아웃**(reap 과 daemon 이 서로 다른 prefix / 전역 reap + 로컬 daemon)에서 (a) 우회 없이 미설치 판정, (b) `daemonBin` 지정 시 동작을 실증했다. pnpm·PnP 가 깨지지 **않는다**는 실측도 함께 기록한다.
5. unit / e2e / scenario / daemon 네 스위트가 baseline 이상으로 0 fail (**unit 493+** / e2e 278 / scenario 44 / daemon 130).
6. `check-docs-version.sh` 통과 + 로케일 5종에 항목이 모두 있다.
7. `npm run typecheck` 통과.

## Implementation Plan

### Phase A — 코어

- [ ] **T001** `src/types/index.ts` — `DaemonBinSource`, `ExplicitDaemonBin`, `DaemonAvailability` 3필드 추가, `ReapConfig.daemonBin?`. **`CONFIG_DEFAULTS` 에는 넣지 않는다** (optional 필드 → spurious config diff, `lastMigratedVersion` 선례).
  - 검증: `npm run typecheck` 가 기존 fixture 3곳의 누락을 잡는다 (필수 필드로 두는 이유).
- [ ] **T002** `src/cli/commands/daemon/client.ts` — `DAEMON_BIN_ENV`, `DAEMON_LOCATE_HINT`, `readExplicitDaemonBins(env, cwd)`, `locateDaemon(deps)`, `resolveDaemonBin` 래퍼화, `resolveDaemonAvailability` 신규 필드 채움. `DaemonResolveDeps.explicit?` seam 추가.
  - 검증: unit (T006).

### Phase B — 안내 문구 3소비처

- [ ] **T003** `src/core/integrity.ts` `checkDaemonAvailability` — (a) `explicitMiss` 경고를 **판정과 독립적으로** 추가, (b) 미설치 문구에 `locateHint` 추가.
  - 검증: unit `integrity-daemon.test.ts` 확장.
- [ ] **T004** `src/core/prompt.ts` — 미설치 절에 `locateHint` 한 줄.
  - 검증: unit `prompt-daemon.test.ts` 확장 (opt-out 시 byte-identical 회귀 케이스는 기존 것 유지).
- [ ] **T005** `src/cli/commands/daemon/index.ts` — `requireUsableDaemon` 미설치 문구 + `explicitMiss` 알림, `statusCmd` context 에 `bin`/`source` 노출 `[autonomous]`.
  - 근거: "내가 지정한 그 daemon 을 쓰고 있는가"는 본 goal 의 직접 인과 범위. 사용자가 우회를 설정한 뒤 확인할 수단이 없으면 우회 자체가 반쪽이다.
  - 검증: 게이트 § 5d-bis 가 실제 출력으로 확인.

### Phase C — 테스트

- [ ] **T006** `tests/unit/daemon-availability.test.ts` 확장 + `integrity-daemon.test.ts` / `prompt-daemon.test.ts` fixture 보강.
  - 신규 케이스: env 우선 / config 사용 / env 빗나가면 config / 둘 다 빗나가면 패키지 / 전부 빗나가면 null+miss / `~` 전개 / 상대 경로 / 공백만 있는 값 무시 / `explicitMiss` 가 `installed: true` 와 공존.
  - **기존 `resolveDaemonBin` 테스트 5건에 `explicit: []` 를 명시**한다 — 지금은 실제 env/cwd 를 읽게 되어 개발자 환경이 결과를 바꿀 수 있다(gen-082 의 XDG 사례와 같은 축).
  - `readExplicitDaemonBins` 는 tmpdir 에 진짜 `config.yml` 을 써서 검증한다 (YAML mock 보다 정직하고 싸다).
- [ ] **T007** `npm run typecheck` + 네 스위트 전체 실행. baseline 대비 증감 기록.

### Phase D — 게이트 (검사를 먼저 실패시킨다)

- [ ] **T008** `scripts/check-self-diagnosis.sh` § **5d-bis** 신설 (5d 와 5e 사이). 5a-bis 명명 관례를 따르고 기존 절 번호는 건드리지 않는다.
  - a. `daemonBin` 을 5c 설치본으로 지정 → `fix --check` 가 **파싱 가능한 성공**을 내고 daemon 경고가 없을 것 (gen-083 의 "부재 주장은 먼저 실행을 증명" 규칙 준수 — `status` + 숫자 `warningCount` 요구)
  - b. `daemon status` 가 실제로 **기동**할 것 (bun)
  - c. 같은 것을 **bun 은닉(node)** 으로 한 번 더
  - d. `REAP_DAEMON_BIN` 으로도 동작할 것 (config 없이)
  - e. `daemonBin` 이 존재하지 않는 경로일 때 **그 경로를 지목하는 경고**가 나올 것 (빗나감 보고)
- [ ] **T009** **negative test** — T008 의 a~e 각각에 대해 정상값을 깨뜨려 FAIL 을 확인하고 복원한다. 그리고 **구현 전 dist 로 게이트를 먼저 돌려** 5d-bis 가 FAIL 하는 것을 확인한다 (`npm pack` 은 `prepack` 이 없어 현재 `dist/` 를 그대로 싼다 — 빌드를 미루면 구현 전 상태를 그대로 검사할 수 있다).
- [ ] **T010** 실패 레이아웃 실증 `[실행]` — planning 에서 이미 5개 레이아웃을 측정했다(§ Additional Findings ★). 남은 것은 **깨지는 두 레이아웃에서 `daemonBin` / `REAP_DAEMON_BIN` 이 실제로 구제하는지**를 구현 후 같은 fixture 로 재측정하는 것. tarball 과 설치본은 scratchpad 에 그대로 있다.

### Phase E — 문서

- [ ] **T011** `src/templates/reap-guide.md` + `.reap/reap-guide.md` — § Code Intelligence 에 "설치했는데도 REAP 이 못 찾을 때" 절 신설. **문구는 매니저 이름이 아니라 조건으로 쓴다** — "reap 과 daemon 이 서로 다른 곳에 설치되면". pnpm/PnP 를 파손 사례로 지목하지 않는다(거짓이다).
- [ ] **T012** `README.md`, `README.ko.md`.
- [ ] **T013** `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` **5개 전부** + 필요 시 컴포넌트 렌더링.
- [ ] **T014** `bash scripts/check-docs-version.sh` + `cd docs && npx vite build` + 게이트 전체 1회 정주행.

### 의존 순서

```
T001 → T002 → {T003,T004,T005} → T006 → T007
                                          ↓
                              T008 → T009 → T010
                                          ↓
                      {T011,T012,T013} → T014
```

T009 의 "구현 전 FAIL 확인"만 예외적으로 **T007 직후·`npm run build` 직전**에 끼워 넣는다.

## 영향받는 기존 테스트

| 테스트 | 왜 | 처리 |
|---|---|---|
| `tests/unit/daemon-availability.test.ts` | seam 확장 + 환경 누수 | `explicit: []` 명시 + 신규 케이스 |
| `tests/unit/integrity-daemon.test.ts` | `DaemonAvailability` 필수 필드 증가 | fixture 보강 + 빗나감 케이스 |
| `tests/unit/prompt-daemon.test.ts` | 동일 + 미설치 문구 변경 | fixture 보강. `daemon` 미설정 시 byte-identical 회귀 케이스는 유지 |
| e2e / scenario | 영향 없음 (동작 기본값 불변) | 회귀 확인만 |
| daemon 스위트 | daemon 소스 무변경 | 회귀 확인만 |

## Additional Findings

### ★ backlog 의 핵심 전제가 실측과 어긋난다 (planning 중 발견)

longterm 교훈("backlog 의 주장을 검증하라")에 따라 **실제로 설치해서 측정**했다. `npm pack` 으로 만든 reap 0.17.4 / daemon 0.2.0 tarball 을 각 레이아웃에 설치하고, reap 번들이 실제로 하는 것과 동일하게 **번들의 realpath 를 issuer 로 삼아** `require.resolve("@c-d-cc/reap-daemon/dist/index.js")` 를 호출했다. (번들이 ESM 이지만 bun 이 `createRequire(import.meta.url)` 를 주입하므로 이 재현은 정확하다 — `dist/cli/index.js:48` 확인.)

| 레이아웃 | backlog 주장 | **실측** |
|---|---|---|
| pnpm 기본 store, 프로젝트 로컬 (`pnpm add` 둘 다) | 원리적 실패 | **RESOLVED** `[실행]` |
| pnpm 전역 (`pnpm add -g` 둘 다) — 실제 CLI 로 `fix --check` | (같은 부류) | **RESOLVED, 경고 없음** `[실행]` |
| Yarn PnP (`nodeLinker: pnp`, yarn 4.5.0) — 실제 CLI 로 `fix --check` | 원리적 실패 | **RESOLVED, 경고 없음** `[실행]` |
| reap=prefixA / daemon=prefixB (npm 전역 2개) | 미설치 판정 | **미설치 판정** `[실행]` |
| reap 전역 + daemon 을 프로젝트 로컬 의존으로 | 미설치 판정 | **미설치 판정** `[실행]` |

**왜 앞의 세 줄이 통과하는가**:
- pnpm 의 격리는 **resolver 를 바꾸는 것이 아니라 심링크 배치**로 구현된다. reap 의 realpath 는 `<root>/node_modules/.pnpm/@c-d-cc+reap@…/node_modules/@c-d-cc/reap/…` 이고, node 의 상향 탐색이 `<root>/node_modules/` 에 도달한다. 거기에 daemon 이 최상위 의존으로 링크돼 있으면 **찾힌다**
- Yarn PnP 는 resolver 를 실제로 대체하지만 기본 `pnpFallbackMode: dependencies-only` 가 **최상위 프로젝트의 의존을 fallback pool 로 허용**한다. daemon 이 그 pool 에 있으므로 통과한다

### 그래서 결함은 무엇인가 — 이름이 틀렸을 뿐 실체는 있다

깨지는 조건은 "엄격한 resolver" 가 아니라 **reap 과 daemon 이 서로 다른 resolution root 에 설치되는 것**이다. 뒤 두 줄이 그것이고, 실측으로 재현된다.

그리고 이 재규정은 문제를 **축소하지 않고 확대한다**:

- 문서는 둘 다 `npm i -g` 를 안내한다. 그것이 동작하는 이유는 **우연히 같은 prefix 에 떨어지기 때문**이다
- 전역 reap + 로컬 daemon, 매니저 혼용, prefix 변경, nvm 전환 — 전부 **평범한 상황**이고 전부 깨진다. pnpm/PnP 사용자만의 이야기가 아니다
- 반대로 pnpm/PnP 사용자에게 "당신 환경은 깨졌다"고 **문서에 적으면 그것은 거짓**이 된다

### 계획에 미치는 영향

| 항목 | 변경 |
|---|---|
| 고칠 코드 (T001~T005) | **변경 없음.** 우회 경로는 어느 framing 에서든 정확히 같은 것을 요구한다 |
| D4 (게이트) | **더 강해진다.** 5d↔5e 사이 상태는 pnpm 의 *대역*이 아니라 **진짜 실패 모드 그 자체**다 |
| T010 (pnpm 실증) | 성격이 바뀐다 — "pnpm 에서 동작함을 확인" 이 아니라 **"pnpm/PnP 는 멀쩡하고, 깨지는 것은 분리 설치다"를 기록**하는 근거로 남긴다. 위 표가 그것이며 이미 수행됐다 |
| 문서 (T011~T013) | **문구가 바뀐다.** "pnpm/Yarn PnP 에서는 못 찾는다" 가 아니라 **"reap 과 daemon 이 서로 다른 곳에 설치되면 못 찾는다 — 그때 위치를 알려주면 된다"** |
| goal 문장 | pnpm/PnP 를 명시하고 있어 실측과 어긋난다. 완료 artifact 에 정정을 남긴다 |

### 그 밖에

- **`npm pack` 에 `prepack` 훅이 없다** — 게이트는 현재 `dist/` 를 그대로 싼다. 이 성질이 T009 의 "구현 전 FAIL 확인"을 가능하게 한다. 동시에 이것이 이 저장소의 상습 함정("소스 고치고 build 안 함")의 원인이기도 하다.
- **`DaemonAvailability` 생성자는 `resolveDaemonAvailability` 하나뿐**이다 — 필드를 필수로 두어도 파급은 테스트 fixture 2곳에 그친다. 필수로 두면 다음 사람이 새 소비처를 만들 때 그 필드를 의식하게 된다.
- 측정 부산물: yarn berry 가 `~/.yarn/berry/cache` 에 항목을 추가했다. **그 캐시는 사전 존재 자산이다** (`~/.yarn` 2023-09, `berry/` 2024-12-21 생성, 430MB) — 측정이 만든 것이 아니므로 **손대지 않는다**. 그 외 모든 산출물은 scratchpad 안에 있다.
- **인간 승인 (planning HARD-GATE 충족)**: D1~D4 전부 승인. 문서를 조건 기반 문구로 쓰는 것 승인. 0.17.5 하드 선행조건 유지. Yarn PnP 실증 요구는 위 측정으로 이미 충족 — 추가 실증 불필요하되 **측정 절차를 재현 가능한 형태로 완료 artifact 에 남길 것**.
- **거짓 주장은 아직 배포물에 없다**: README 2종 / 로케일 5 / reap-guide / src 전체에 pnpm·PnP 언급 0건. gen-083 은 그 주장을 완료 artifact 와 backlog 에만 적었다. 지금 조건 기반으로 쓰면 **거짓이 사용자에게 도달한 적이 한 번도 없게 된다**.

## Echo Chamber 점검

자율 추가는 **T005 의 `daemon status` context 노출 1건** 뿐이며 `[autonomous]` 로 표기했다. 근거는 T005 항목에 적었다. 그 외 "있으면 좋겠다"(예: `daemonBin` 자동 탐색 확장, Windows 경로 처리, pnpm 게이트 상시화)는 **본 세대에서 하지 않는다** — 필요하면 완료 artifact 의 Next Generation Hints 에만 적는다.

## 미해결 — 인간 확인 필요

없음. D1~D4 는 모두 기존 코드 구조와 gen-083 교훈에서 결론이 하나로 좁혀지는 판단이라 선택지를 제시하는 대신 근거와 함께 확정했다. **다만 계획 전체에 대한 확인은 받는다** (planning HARD-GATE).

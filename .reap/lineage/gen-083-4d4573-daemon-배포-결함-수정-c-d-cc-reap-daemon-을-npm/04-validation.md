# Validation

> **3회차.** 1회차에서 evaluator 가 blocking 2건, 2회차에서 evaluator 가 게이트 assertion 의 구멍 2건을 찾아 각각 implementation 으로 회귀했다 (03-implementation.md § Validation 회귀 / § Validation 2차 회귀). 아래는 마지막 회귀 후 **전부 다시 실행한** 결과다.

### 근거의 종류를 구분한다

1회차의 결정적 실패는 **미검증을 "충족"으로 기록**한 것이었다 (HIGH-2). 그래서 아래 각 항목에 근거를 명시한다:

- **[실행]** — 명령을 돌려 출력을 확인함
- **[negative]** — 정상 값을 깨뜨려 검사가 실제로 fail 하는 것까지 확인함
- **[독해]** — 코드를 읽고 판단함. 실행으로 확인하지 **않음**

## Verdict: **pass**

모든 검증을 이 단계에서 fresh 로 실행했다. 이전 실행 결과를 재사용하지 않았다.

## 명령 실행 결과

| 명령 | 결과 |
|---|---|
| `npm run typecheck` (reap) | **통과** — 0 error |
| `npm run build` (reap) | **통과** — `dist/cli/index.js` 0.59MB |
| `npm run test:unit` | **493 pass / 0 fail** (baseline 473 → +20) |
| `npm run test:e2e` | **278 pass / 0 fail** (baseline 278) |
| `npm run test:scenario` | **44 pass / 0 fail** (baseline 44) |
| `cd daemon && bun test tests/` | **130 pass / 0 fail** |
| `bash scripts/check-self-diagnosis.sh` | **통과** — daemon 절 **6/6** 포함. `rm -rf daemon/dist` 후 실행해 게이트가 스스로 빌드함을 확인 |
| `bash scripts/check-docs-version.sh` | **통과** — 5개 로케일 22항목 동일 |
| `cd docs && npx vite build` | **통과** — 1.84s |
| `cd daemon && npx tsc --noEmit` | **error 2건 — 본 세대 이전부터 존재** (아래 § 알려진 사전 결함) |

## 완료 기준 검증

02-planning.md § 완료 기준 7항목을 하나씩 확인했다.

### 1. reap tarball 에 daemon 항목 0개 **이고** dependencies 에 daemon 없음 — **충족 [실행][negative]**

```
$ tar -tzf c-d-cc-reap-0.17.4.tgz | grep -c 'package/daemon/'
0
$ tar -xzOf ... package/package.json | (dependencies)
{"yaml":"^2.0.0"}
```

environment/summary.md 의 *"yaml v2 — 유일한 production dependency"* 서술이 이제 사실이다.

### 2. daemon tarball 을 설치해 **node** 로 띄우면 `nodesCreated > 0` — **충족 [실행][negative]**

자기진단 게이트 § 5c/5d 가 매 실행마다 확인한다:

```
  ok    daemon installs standalone
  ok    installed daemon indexes and answers under node (3 symbols)
```

심볼 수만이 아니라 **알려진 심볼 이름을 질의해 반환되는지**까지 확인한다. 인덱싱 성공 응답만 보면 `nodesCreated: 0` 상태를 통과시킨다.

**§ 5c 는 pack 전에 daemon 을 직접 빌드한다.** `daemon/dist` 는 gitignore 되어 있고 어떤 워크플로도 만들지 않으므로, 빌드를 전제하면 검사 자신이 "개발자 트리에서만 동작"하는 상태가 된다 (1회차의 HIGH-1). `rm -rf daemon/dist` 후 게이트를 돌려 확인했다.

### 2-b. 설치된 reap 이 설치된 daemon 을 실제로 찾는가 (backlog Verification #2 의 본문) — **충족 [실행][negative]**

1회차에서는 이 항목을 § 5c/5d 로 대응시켰으나 **그 절들은 reap 을 한 번도 호출하지 않는다.** 패키지를 쪼갠 것이 만든 이음매가 미검증인 채로 "충족"이라 적혀 있었다.

**§ 5e 신설.** 같은 `$PREFIX` 에 daemon 을 설치하고 두 가지를 확인한다:

```
  ok    an installed reap finds and starts an installed daemon
```

- (a) § 5b 의 경고가 **사라지는가** — 같은 프로젝트, 같은 명령, 반대 답. reap 이 불평할 수 있다는 것만으로는 부족하고, 문제가 해결되면 **불평을 멈춘다**는 것까지 확인해야 한다
- (b) `reap daemon status` 가 daemon 을 **실제로 띄우는가** — 경로를 해석하는 것과 spawn 하는 것은 다른 문제다. 격리 포트(17294) + 격리 HOME 이라 개발자 daemon 을 건드리지 않는다

**runtime 양쪽 모두 확인한다.** `detectRuntime()` 이 bun 을 선호하므로 첫 호출만으로는 **bun 없는 사용자의 조합이 통째로 미검증**이었다. `PATH` 앞에 실패하는 `bun` 스텁을 두고 한 번 더 호출해 node 폴백까지 확인한다.

negative test 2종:
- 설치 단계를 건너뜀 → `reap still reports the daemon as missing after installing it`
- 폴백 반환값을 `"definitely-not-node"` 로 바꿈 → `Error: spawn definitely-not-node ENOENT`

**부재를 주장하는 assertion 은 스스로를 먼저 증명한다.** (a) 의 경고 소멸 확인은 `fix --check` 가 `status: "ok"` 와 **숫자 `warningCount`** 를 냈다는 것을 먼저 요구한다 — 그러지 않으면 크래시·비정상 출력이 "경고 없음"으로 읽힌다. negative: `fix --check` 를 없는 서브커맨드로 치환 → `BAD_JSON` 으로 FAIL (수정 전이면 green 이었다).

### 2-c. 발행 번들에 빌드 머신 경로가 없는가 — **충족 [실행][negative]**

D-1 을 기계 독립적으로 잡는 assertion (§ 5a-bis). 팀 리드 지시로 **D-1 수정을 되돌려** 확인한 결과, 되돌림은 § 5b 에서 걸렸으나 **그것은 이 머신에서만 그렇다** — 박힌 리터럴이 여기 실존하기 때문이다. 다른 머신이면 5b 도 5e 도 통과한다. 즉 **게이트가 D-1 을 잡는 것은 우연이었다.**

원인을 직접 보는 assertion 을 넣었다: 발행 tarball 의 번들에 `$ROOT` 가 문자열로 없을 것.

negative test 가 **assertion 자신의 결함을 잡았다** — 첫 구현 `tar ... | grep -qF` 는 `pipefail` + `grep -q` 조기 종료로 tar 가 SIGPIPE 를 받아 **매치하면서도 통과**했다. 변수로 받아 grep 하도록 고친 뒤 `FAIL the reap bundle contains the path it was built from` 확인.

### 3. `daemon: true` + 미설치 → warning 1건 / 미설정 → 0건, 버전 미달은 다른 메시지 — **충족**

- 미설치 1건 — **[실행][negative]** 게이트 § 5b (격리 전역 설치본). `checkDaemonAvailability(false)` 로 우회시켜 FAIL 확인
- 미설정 0건 — **[실행]** 새 프로젝트에서 `fix --check` 의 daemon 언급 **0**
- 버전 미달이 다른 메시지 — **[실행]** unit 이 두 문자열의 **비동일성**을 직접 assert. 다만 **버전 미달 상태를 실제 설치로 재현한 것은 아니다** — 주입한 verdict 로 확인했다 ([독해] 성분)

### 4. 새 assertion 이 수정 전 코드에서 fail 하는 것을 기록 — **충족 [negative]**

03-implementation.md § 검사 유효성 근거에 **세 번의 실패 출력을 전문으로** 남겼다. 세 실패가 서로 다른 원인(dependency / native bindings / queries 경로)이었다는 점이 핵심이다.

### 5. 허위 주장 3곳 정정 + carrier 로 묶임 — **충족 [실행]**

- `scripts/check-self-diagnosis.sh` 헤더 — 정정 + 표식
- `.github/workflows/release.yml` 주석 — 정정 + 표식
- `.reap/environment/summary.md` — reflect 에서 처리 (genome § Environment Immutability). **완료** — `list-carriers.sh` 가 3개 파일을 보고한다

세 주장이 실제로 참인지도 각각 결함을 재현해 확인했다 (**[negative]**, 03-implementation.md § 헤더의 세 주장).

### 6. 전체 스위트 baseline 이상, 0 fail — **충족 [실행]**

unit 493(+20) / e2e 278 / scenario 44 / daemon 130. 전부 0 fail.

### 7. 소스 트리 dog-fooding 유지 — **충족 [실행]**

`npm ci` 로 `node_modules/@c-d-cc/reap-daemon` 이 없는 상태를 만든 뒤 확인했고, 이후 workspaces 도입으로 링크가 다시 생겼다. **양쪽 상태 모두에서 동작**한다.

cold spawn 도 확인 — 실행 중이던 daemon 을 `daemon stop` 으로 내리고 다시 `daemon status` 를 호출하니 새 프로세스(pid 9594)가 떴다. 폴백 경로가 실제로 spawn 까지 도달한다는 뜻이다.

```
Daemon stopped (pid: 90711)
Daemon running (pid: 9594, ..., running 0.2.0 / installed 0.2.0)
```

## backlog Verification 항목 대조

backlog 의 Verification 9항목 중 코드 검증 대상:

| # | 항목 | 결과 |
|---|---|---|
| 1 | 수정 전 재현 | 01-learning.md § Key Findings 에 실측 기록 |
| 2 | pack → 설치 → **`reap daemon status` 정상 응답** | 게이트 § 5c/5d **+ 5e**. 1회차에는 5e 가 없어 이 항목이 실제로는 미검증이었다 |
| 3 | 미설치 시 명확한 안내, lifecycle 미차단 | 게이트 § 5b + unit(prompt/integrity). lifecycle 은 `triggerIndexing` 이 여전히 silent `false` |
| 4 | `daemon: false` 시 출력 byte-identical | `tests/unit/prompt-daemon.test.ts` 가 문자열 동일성을 직접 assert (3 케이스) |
| 5 | zero-dependency 유지 | 위 완료기준 1 |
| 6 | 기존 daemon e2e 21개 회귀 없음 | e2e 278 pass |
| 7 | environment 서술이 실제와 일치 | reflect 에서 갱신 |
| 8 | 정정 전에 실패를 먼저 본다 | 위 완료기준 4 |
| 9 | 헤더의 **세 주장 모두** 참인가 | **세 결함을 각각 재현해 게이트 fail 확인** (03-implementation.md) |

## 알려진 사전 결함 — 손대지 않음

`daemon/src/indexer/storage.ts` 의 typecheck 에러 2건:

```
src/indexer/storage.ts(4,33): TS7017 — typeof globalThis has no index signature
src/indexer/storage.ts(21,39): TS2307 — Cannot find module 'bun:sqlite'
```

**본 세대 변경 이전부터 존재한다** — `git stash` 후 재실행해 확인했다. 런타임에는 영향이 없고(bun/node 분기 코드), 본 세대의 인과 범위 밖이라 건드리지 않았다. `daemon` 의 `npm run typecheck` 가 이 때문에 상시 red 이므로, 발행 워크플로에는 typecheck 대신 build + test 를 넣었다.

## 알려진 파손 — 미검증이 아니라 깨져 있다

**strict resolver(pnpm 기본 store, Yarn PnP)에서 daemon 은 원리적으로 찾아지지 않는다.** daemon 이 **의도적으로** dependency 가 아니므로 — 그것이 이번 수정의 요점이므로 — 선언되지 않은 패키지 접근을 차단하는 해석기와 정면으로 충돌한다.

**원래보다 엄밀히 더 나쁘다.** 그 사용자는 daemon 을 정상 설치하고도 **영구히 "설치하라"는 안내**를 받는다 — 이미 가진 것을 설치하라는 안내다. 그리고 § 5e 는 `npm i -g --prefix` 레이아웃만 보므로 **seam 이 건강하다고 보고한다.** 이전 결함(끊긴 심링크)은 최소한 조용했다.

같은 계열의 다른 조합과 각각 무엇이 깨지는지:

| 조합 | 무엇이 깨지는가 |
|---|---|
| pnpm 기본 store / Yarn PnP | resolve 원리적 실패 → 이미 설치한 것을 설치하라는 영구 안내 |
| reap 전역 + daemon 을 프로젝트 로컬 의존으로 설치 | 전역 번들의 조회 경로에 프로젝트 `node_modules` 가 없어 미설치 판정 |
| reap 과 daemon 을 서로 다른 매니저·prefix 로 설치 | 조회 경로가 갈려 미설치 판정 |
| nvm 등으로 node 버전 전환 후 prefix 변경 | daemon 만 사라지거나 그 반대. 판정은 정확하지만 사용자에게는 갑작스럽다 |
| Windows | 전 경로 미검증. 경로 구분자와 전역 prefix 구조가 다르다 |

우회(`REAP_DAEMON_BIN` / `config.daemonBin`)는 범위 확장이라 backlog 로 넘겼다.

## 검사가 잡지 못하는 것

통과는 "검사 범위 안에서 문제없음"일 뿐이다. 다음은 이번 검증이 **답하지 못한** 질문이다.

- **러너에서의 게이트 소요 시간**. D4 유저 결정에 따라 측정하지 않았다. 로컬(macOS, warm cache) 설치 ~2초만이 실측이다. **그리고 `better-sqlite3` 가 두 번 설치된다** — § 5c 의 `DM_INSTALL` 과 § 5e 의 `PREFIX`. 리눅스 러너가 prebuilt 를 받지 못하면 소스 컴파일이 **두 번** 일어난다. 후퇴 판단이 필요해질 때의 근거로 적어둔다. **끄는 환경변수는 두지 않는다** (유저 결정) — 절이 독립적이므로 필요해지면 release 워크플로로 옮기면 되고, 그 전까지 게이트는 항상 돈다
- **버전 미달 상태를 실제 설치로 재현하지 않았다**. unit 이 주입한 verdict 로 4분기를 덮지만, 낡은 daemon 을 실제로 설치해 `daemon status` / `fix --check` 가 무엇을 말하는지는 확인하지 않았다
- **실제 npm 발행본**. `@c-d-cc/reap-daemon` 은 아직 발행되지 않았다. 검증은 전부 `npm pack` 산출물 기준이다. 발행 시 registry 가 다르게 동작할 여지(예: `files` 해석)는 남아 있으나, tarball 이 곧 발행물이므로 차이는 크지 않다
- **npm-global 이외의 설치 레이아웃**. 위 § 알려진 파손 참조 — 이쪽은 "모른다"가 아니라 "깨진다"이므로 따로 적었다
- **`daemon-v*` 워크플로의 실제 실행**. YAML 구조와 트리거 조건(`startsWith`)은 파싱해 확인했지만, job 이 실제로 도는 것은 유저가 태그를 밀어야 알 수 있다
- **버전 하한이 실제로 작동하는 날**. `MIN_DAEMON_VERSION = "0.2.0"` 이고 첫 발행본이 0.2.0 이므로, 현실에서 이 게이트가 걸리는 경우는 아직 없다. unit 이 낮은 버전을 주입해 동작을 확인했을 뿐이다
- **다른 OS/런타임 조합**. macOS + node 22 / bun 1.3.10 에서만 검증했다. 리눅스는 CI 가, 윈도우는 아무도 검증하지 않는다

## Evaluator

`.reap/config.yml:9` 이 `evaluator: true` 이므로 `reap-evaluate` 를 advisor 로 호출했다. **두 라운드를 돌렸다.**

**1회차 판정: partial.** HIGH 2건 + MEDIUM 2건 + LOW 다수. 근거가 타당해 `reap run back` 으로 implementation 회귀, `report-evaluator --severity high` 로 concern 기록. 상세는 03-implementation.md § Validation 회귀.

- HIGH-1 (게이트가 빌드되지 않는 `daemon/dist` 를 pack) → 수정
- HIGH-2 (Verification #2 를 충족으로 오기재) → § 5e 신설로 실제 충족
- MEDIUM-3 (build 명령 두 번째 소유자) → `"build": "bash scripts/build.sh"` 로 공유
- MEDIUM-4 (README 2종의 허위 주장) → 정정
- MEDIUM-5 (약한 e2e assertion) → `=== true` 로 고정
- LOW 2건 수정 (패키지 이름 운반 / 형제 패키지 오인 방지), 3건 backlog

**2회차 판정: pass, conditional.** 이번엔 **게이트 assertion 자신의 구멍** 2건:

- **§ 5e 의 parse 실패가 조용히 green** — `catch {}` → `ctx={}` → `warnings=[]` → grep 실패 → 통과. **이 세대가 고치는 결함과 정확히 같은 형태**(아무 일도 없음이 성공과 구별되지 않음)라 우선 처리했다
- **bun/node 비대칭** — `detectRuntime()` 이 bun 을 선호해 bun 없는 사용자의 조합이 미검증. `bindings` 결함을 세 세대 숨긴 그 비대칭이 한 층 위로 옮겨간 것

둘 다 수정하고 각각 negative test 했다. pnpm/PnP 는 backlog + "알려진 파손"으로 기록.

**주목할 점: 네 건 모두 내가 돌린 모든 검증을 통과한 상태였다.** 테스트도 게이트도 문서 게이트도 전부 초록이었다. evaluator 가 잡은 이유는 무언가를 더 실행해서가 아니라 *"이 검사가 통과한다는 것이 무엇을 증명하는가"* 를 물었기 때문이다.

**그리고 그 물음이 세 번째 결함을 낳았다** — 2회차 지시를 이행하다 § 5a-bis 의 첫 구현이 `pipefail` 때문에 무력하다는 것을 negative test 가 잡았다. 검사를 고치는 일에도 검사가 필요하다.

**fitness 에서 해소된 항목**: `REAP_SKIP_DAEMON_CHECK` 를 **제거했다** (유저 결정). 새 게이트와 함께 들어온 우회 수단이었고 longterm § *"a gate you add must not come with something that blunts it"* 과 정면으로 충돌했다. 제거 후 게이트를 재실행해 통과를 확인했다 — 그 분기가 사라지고 daemon 절이 무조건 도는 것은 이번이 처음이었으므로 실행 확인이 필요했다.

# Validation

> gen-084 — daemon 위치 명시 지정 경로. 모든 명령을 fresh 로 재실행했다.
>
> 근거 종류 표기: `[실행]` 이 세대에서 직접 돌린 것 / `[negative]` 일부러 깨뜨려 실패를 확인한 것 / `[독해]` 코드를 읽어 판단한 것.

## Commands

| 명령 | 결과 | 비고 |
|---|---|---|
| `npm run typecheck` | **pass** `[실행]` | 오류 0 |
| `npm run build` | **pass** `[실행]` | `index.js` 0.59 MB |
| `npm run test:unit` | **523 pass / 0 fail** `[실행]` | baseline 493 → +30 |
| `npm run test:e2e` | **279 pass / 0 fail** `[실행]` | baseline 278 → +1 |
| `npm run test:scenario` | **44 pass / 0 fail** `[실행]` | baseline 유지 |
| `daemon: npm test` | **130 pass / 0 fail** `[실행]` | baseline 유지 |
| `scripts/check-self-diagnosis.sh` | **pass** `[실행]` | daemon 절 **10 assertion** (5b 확장 2 + 5d-bis 6 포함) + OpenCode 절 |
| `scripts/check-docs-version.sh` | **pass** `[실행]` | 로케일 5종 22항목 동일 |
| `docs: npx vite build` | **pass** `[실행]` | 로케일 TS 구문 오류 없음 |
| `scripts/list-carriers.sh --orphans` | **고아 0** `[실행]` | 새 carrier 를 만들지 않았고 기존 것을 깨지도 않았다 |

baseline 은 착수 전 실측(unit 493)을 기준으로 한다. 인수인계 메모의 492 는 1건 어긋나 있었다.

## Completion Criteria — 하나씩

### 1. `resolveDaemonBin` 우선순위 5단계가 unit 으로 검증된다 — **충족** `[실행]`

`tests/unit/daemon-availability.test.ts` 의 `explicit daemon locations` 11건 + `readExplicitDaemonBins` 9건. env 우선 / config 사용 / env 우선 확인 / env 빗나가면 config / 빗나감 후 package fall-through / 빗나감 후 checkout fall-through / 전부 없음 + miss / 신원검사 생략 / availability 필드 전달 / 성공 판정과 miss 공존 / 힌트가 조건 기반.

`readExplicitDaemonBins` 는 tmpdir 에 실제 `config.yml` 을 써서 검증한다 — 미설정 / config / env 우선 / 공백 무시 / `~` 전개 / 상대경로 / 파싱 실패 / 프로젝트 없음 / 비문자열.

**기존 5건에 `explicit: []` 를 명시**해 실제 env·cwd 를 읽지 않게 했다. 그 전에는 개발자가 `REAP_DAEMON_BIN` 을 설정해 두면 결과가 달라졌을 것이다 (gen-082 의 XDG 와 같은 축).

### 2. 게이트 § 5d-bis 가 실제 상태에서 기동을 확인한다, bun / bun 은닉 둘 다 — **충족** `[실행]`

5d 와 5e **사이**에서 실행된다. 그 지점의 환경이 목표 상태 그 자체다 — daemon 이 디스크에 있고(5c 설치) 동작하며(5d 증명) reap 은 그것을 못 본다(5b 증명). sub-check 5개:

| | 내용 | 근거 |
|---|---|---|
| (a) | `daemonBin` 지정 시 daemon 경고가 사라진다 (파싱 가능한 성공 선증명 후) | `[실행]` `[negative]` N1, N6 |
| (b) | `daemon status` 가 **기동**하고 `binSource: config` 를 보고 | `[실행]` `[negative]` N2 |
| (c) | 같은 것을 **bun 은닉(node)** 으로 | `[실행]` `[negative]` N5 |
| (d) | `REAP_DAEMON_BIN` 단독으로 기동 + `binSource: env` | `[실행]` `[negative]` N3 |
| (e) | 존재하지 않는 `daemonBin` 이 **그 경로를 지목해** 보고 | `[실행]` `[negative]` N4 |

나갈 때 `config.yml` 을 원복하므로 5e 는 이전과 동일한 상태에서 시작한다 — 그렇게 하지 않으면 남은 `daemonBin` 때문에 **5e 의 assertion 이 엉뚱한 이유로 통과**한다.

### 3. 각 assertion 이 먼저 실패하는 것을 확인했다 — **충족** `[negative]`

여섯 건 모두 **소스나 스크립트를 실제로 깨뜨려** FAIL 을 확인하고 복원했다. 복원은 diff 로 대조했고 `NEGATIVE TEST` 잔재 grep 결과 0.

| # | 깨뜨린 것 | 관측된 FAIL |
|---|---|---|
| N1 | `locateDaemon` 이 `explicit` 무시 = 기능 제거 | (a) "reap still reports the daemon as missing after being told where it is" |
| N2 | `daemon status` 의 `binSource` 제거 | (b) "does not report using the named location" |
| N3 | env 채널만 무력화 | (d) "REAP_DAEMON_BIN did not get the daemon started" — a/b/c 는 통과 |
| N4 | integrity 의 `explicitMiss` 억제 | (e) "a daemonBin pointing at nothing is not reported" |
| N5 | `detectRuntime` bun 고정 (node 폴백 제거) | (c) "works with bun but not without it" — b 는 통과 |
| N6 | (a) 의 입력을 비 JSON 으로 | "fix --check gave no usable answer (BAD_JSON)" |

**N3 과 N5 가 sub-check 상호 독립성을 보인다** — 하나가 다른 것을 가려주고 있었다면 이 둘은 전부 통과했을 것이다. **N6 은 gen-083 의 결정적 결함(부재 주장이 조용히 green)이 재발하지 않음**을 보인다.

추가로 **D1 은 stale dist 에서 e2e 가 FAIL 하는 것을 먼저 관측**했다 `[negative]`.

**계획의 절차 하나는 실행 불가였다**: "구현 전 dist 로 게이트를 먼저 돌린다"고 적었으나 게이트는 스스로 `npm run build` 를 한다(`check-self-diagnosis.sh:82`). 위 6건이 그 자리를 대신하며, 소스를 실제로 깨뜨리므로 더 강한 근거다.

### 4. 실제로 깨지는 레이아웃에서 우회가 구제한다 — **충족** `[실행]`

구현 후 재측정:

| 레이아웃 | 우회 없음 | `daemonBin` 지정 후 |
|---|---|---|
| reap=prefixA / daemon=prefixB | 미설치 경고 + 위치 지정 안내 | 경고 **0**, `status: ok`, `binSource: config`, 0.2.0/0.2.0 |
| reap 전역 + daemon 프로젝트 로컬 | 미설치 경고 | `status: ok`, `binSource: config`. **상대 경로**(`./node_modules/...`)로 적었고 절대 경로로 해석 |

**무회귀** `[실행]`: pnpm 전역에 둘 다 설치 + 우회 미설정 → 경고 0, `status: ok`, `binSource: package`.

pnpm·PnP 가 깨지지 **않는다**는 planning 실측도 근거로 남겼다 (아래 § 측정 절차).

### 5. 네 스위트가 baseline 이상으로 0 fail — **충족** `[실행]`

unit 523(+30) / e2e 279(+1) / scenario 44 / daemon 130. 감소 없음.

### 6. `check-docs-version.sh` 통과 + 로케일 5종 — **충족** `[실행]`

5개 로케일 전부에 `locateTitle`/`locateDesc`/`locateConfig`/`locateNote` 추가, `DaemonPage.tsx` 가 렌더링. `vite build` 성공(로케일 TS 구문 오류 없음), 로케일 간 changelog 항목 집합 동일 유지.

### 7. `npm run typecheck` 통과 — **충족** `[실행]`

## FR 대조

| FR | 판정 | 근거 |
|---|---|---|
| FR1 env 로 지정한 daemon 사용 (조회·기동) | 충족 | unit + 게이트 (d) `[실행]` |
| FR2 config 로 지정, env 가 우선 | 충족 | unit `the environment variable outranks config` + 게이트 (a)(b) `[실행]` |
| FR3 미지정·빗나감 시 자동 탐색 유지 | 충족 | unit fall-through 2건 + pnpm 전역 무회귀 실측 `[실행]` |
| FR4 빗나감이 판정과 무관하게 보고 | 충족 | unit `a miss travels alongside a successful verdict` + 게이트 (e) `[실행]` |
| FR5 안내 3곳이 위치 지정 방법을 말함 | 충족 | integrity/prompt unit `[실행]` + `daemon status` 는 **evaluator 지적 후 게이트 5b 에 신설** `[실행]` `[negative]` N8. 최초 제출 시 이 칸은 `[실행]` 으로 적혀 있었으나 **아무도 실행하지 않고 있었다** — § Evaluator 참조 |
| FR6 문구를 한 곳이 소유 | 충족 | `DAEMON_LOCATE_HINT` + `ExplicitDaemonBin.label` `[독해]`. `core` 는 `cli` 를 import 하지 않는다 |
| FR7 미설정 시 gen-083 과 동일 동작 | **부분** | 아래 § 남은 위험 R1 |
| FR8 문서 7종 | 충족 | reap-guide 2 + README 2 + 로케일 5 `[실행]` |

## 계획에 없던 발견 2건

### D1 — `reap update` 가 `daemonBin` 을 지웠을 것이다 (수정함)

`backfillConfig` 는 `VALID_CONFIG_FIELDS` 에 없는 키를 삭제한다. 새 필드를 그 집합에 넣지 않았다면 **사용자가 우회를 설정한 뒤 `reap update` 를 한 번 돌리는 것만으로 그 설정이 사라지고**, 출력은 "deprecated 필드 제거"라고만 말했을 것이다. 인과로 묶여 있어(그것 없이는 본 세대 산출물이 무효화된다) 본 세대에서 고쳤다. e2e 1건 추가.

### D2 — 테스트가 실제 버그를 잡았다 (수정함)

`locateDaemon` 이 **상위 우선순위가 빗나가고 하위가 적중하면 빗나감 보고를 버렸다**. 주석은 "첫 빗나감을 보관한다"고 했는데 코드가 그렇게 하지 않았다. 증상: `REAP_DAEMON_BIN` 이 낡았는데 config 가 맞으면 **env 설정이 썩는 것을 아무도 말해주지 않는다**. 테스트가 아니라 코드를 고쳤다.

## 측정 절차 — 재현 가능하게

planning 에서 backlog 의 핵심 전제("pnpm 기본 store 와 Yarn PnP 에서 원리적으로 resolve 실패")를 뒤집었다. 다음 사람이 같은 주장을 만나면 이렇게 다시 잴 수 있다:

1. `npm pack` 으로 reap / daemon tarball 생성 (daemon 은 `cd daemon && npm run build` 선행 — `dist/` 는 gitignore).
2. 각 레이아웃에 설치. `--ignore-scripts` 필수 — reap 의 postinstall 이 사용자 HOME 에 skill 을 설치한다.
3. **reap 번들이 실제로 하는 것과 동일하게** 조회한다:
   ```js
   const rp = realpathSync("<install>/node_modules/@c-d-cc/reap/dist/cli/index.js");
   createRequire(rp).resolve("@c-d-cc/reap-daemon/dist/index.js");
   ```
   번들은 ESM 이지만 bun 이 `createRequire(import.meta.url)` 를 주입하므로(`dist/cli/index.js:48` 의 `var __require = createRequire(import.meta.url)`) 이 재현은 정확하다. 이것을 확인하지 않으면 "ESM 에는 `require` 가 없으니 항상 실패한다"는 잘못된 결론에 이른다.
4. 그리고 **진짜 CLI 로도** 확인한다 — `HOME=<격리> reap fix --check` 의 daemon 경고 유무.

측정 결과: pnpm 프로젝트 로컬 / pnpm 전역 / Yarn PnP(`nodeLinker: pnp`, yarn 4.5.0) **세 개 모두 정상 조회**. 깨지는 것은 prefix 분리와 전역+로컬 조합. 이유는 pnpm 이 resolver 가 아니라 심링크 배치로 격리하고(상향 탐색이 root `node_modules` 에 닿는다), PnP 의 기본 `pnpFallbackMode: dependencies-only` 가 최상위 의존을 허용하기 때문.

**첫 시도는 틀린 probe 였다** — 최상위 선언 의존끼리 조회해 놓고 "격리를 뚫었다"고 읽을 뻔했다. 실제 두 패키지를 설치해 재고 나서야 성립했다.

## 남은 위험

### R1 — 미설정 사용자에게 **prompt·경고 문구가 달라진다** (의도된 변경, FR7 의 예외)

`daemonBin` 을 쓰지 않는 사용자도 daemon 이 미설치일 때 **더 긴 안내**를 받는다(위치 지정 방법이 붙는다). 동작은 동일하고 문구만 다르다. `daemon` 미설정 프로젝트는 **완전히 byte-identical** 이며 `prompt-daemon.test.ts` 의 기존 회귀 케이스가 그것을 지킨다 `[실행]`.

의도한 것이다 — 그 문장이 없으면 본 세대가 구제하려는 사용자가 여전히 막다른 길에 있다.

### R2 — Windows 미검증 `[독해]`

`~` 전개와 `isAbsolute`/`resolve` 로 플랫폼 중립적으로 처리했으나 **Windows 에서 실행하지 않았다**. 개발·CI 모두 non-Windows 라 확인할 수단이 없다. backlog 표가 원래 "전 경로 미검증"으로 적은 항목이며 본 세대가 좁히지 못했다.

### R3 — 게이트가 잡지 못하는 것

- **pnpm·PnP 레이아웃은 게이트에 없다.** 로컬 1회 실측으로 대체했다. 근거: 게이트의 5d↔5e 상태가 *진짜 실패 모드 자체*이므로 pnpm 을 넣으면 **깨지지 않는 것**을 검사하게 된다.
- **`daemon status` 의 `bin` 값 자체**는 게이트가 `binSource` 만 본다. `bin` 오염은 (b)/(d) 의 기동 성공이 간접적으로만 배제한다.
- **`reap update` 의 `daemonBin` 보존**은 e2e 가 지키고 게이트에는 없다.


## Evaluator (advisor) — `reap-evaluate`, 1 라운드

**판정: partial.** high 2건 + low 5건. 모든 수치를 스스로 재실행해 일치 확인했고, DI 이탈(설계 결정 D1)은 문제없다고 판단했다 — 프로덕션 호출부 5곳이 전부 인자 없는 형태라 조회 경로와 기동 경로가 같은 `process.env` + `process.cwd()` 를 읽고, 그 사이에 cwd 를 바꾸는 코드가 없다는 근거였다.

**두 high 는 모두 "전부 초록인 상태"에서 나왔다.** gen-083 과 같다.

### H1 [high] — 명시 경로가 "존재하지만 daemon 이 아닐 때" REAP 이 다시 침묵한다 → **수정함**

명시 경로에 `existsSync` 만 걸었으므로 `daemonBin` 이 **디렉토리**면 `installed: true` 가 되고, `fix --check` 는 침묵하며, `prompt.ts` 는 `installed` 만 보므로 **에이전트에게 daemon 질의 프로토콜 전문을 그대로 건넨다** — gen-083 이 만든 "미설치면 프로토콜을 빼라" 분기가 무력화된다.

**가장 자연스러운 오타가 정확히 그것이다**: `daemonBin: .../reap-daemon` (뒤의 `/dist/index.js` 누락). 그리고 이 설정을 건드리는 사람은 **정의상 daemon 위치를 이미 헷갈리고 있는 사람**이다.

내가 재현했다 `[실행]`: 패키지 디렉토리를 지정 → `fix --check` daemon 경고 **0건**.

수정 2단:
- **명시 경로에 한해** `statSync().isFile()` 로 좁혔다(`isFile`). 체크아웃 후보는 기존 규칙 유지 — 그쪽은 사람이 지목한 것이 아니고 이미 신원 검사가 있다. implementation 이 이미 "파일만 지원한다"고 선언했으므로 **선언과 코드를 일치**시킨 것이기도 하다.
- `daemon status` 의 **실패 경로**가 `bin` 과 `source` 를 말하게 했다(`notRunningMessage`). "존재하는 엉뚱한 파일"은 원리적으로 판별할 수 없지만(D3 에 따라 신원 검사를 하지 않는다), 최소한 **무엇을 띄우려 했는지**는 말한다.

검증 `[실행]`:
- (A) 디렉토리 → `` `daemonBin` points at <경로>, but there is no file there. `` 경고 발생
- (B) 존재하는 무관한 파일 → `Daemon is not running. REAP would start <경로> (from config).`
- 게이트 § 5d-bis **(f)** 신설, `[negative]` **N7**(파일 검사 되돌리기) 로 FAIL 확인

문구도 정정했다 — 디렉토리는 "아무것도 없는" 것이 아니므로 "there is no file there" 로. 3소비처 + 문서 7종 전부.

### H2 [high] — FR5 의 `[실행]` 표기가 실제와 달랐다 → **표기 정정 + 커버리지 신설**

`requireUsableDaemon` 의 미설치 분기(신규 문구 + `explicitMiss` 분기)는 **게이트·unit·e2e 어디에서도 실행되지 않았다** (`grep -rn "requireUsableDaemon" tests/` = 0). 게이트의 `daemon status` 호출 5개는 전부 daemon 이 resolve 되는 상태다. 그런데 FR 표는 그 칸을 `[실행]` 으로 적었다 — **gen-083 의 결정적 실패와 같은 형태**다.

기능 자체는 정상이었다(evaluator 가 격리 환경에서 두 분기를 직접 실행해 확인). 그러나 "정상이었다"는 이 문제의 답이 아니다. **근거 종류를 구분해 적으라는 규칙이 gen-083 fitness 에서 나왔는데 그 규칙이 이 표에서 한 칸 어긋났다.**

수정: 게이트 **5b 를 확장**해 `reap daemon status` 도 미설치 상태에서 실행하고, (1) "not installed" 를 말하는지 (2) **설치했는데도 못 찾을 때의 안내**를 함께 말하는지 검사한다. `[negative]` **N8**(안내 제거) 로 FAIL 확인. 이제 FR5 는 진짜로 `[실행]` 이다.

### L1 — 완료 기준 2의 "두 조합 모두"가 문자 그대로는 미충족이었다 → **수정함**

5d-bis 는 config×bun / config×node / env×bun 세 칸만 있었다. **env×node 가 없었다.** 두 채널은 문자열 출처만 다르고 spawn 코드가 동일하므로 실질 위험은 낮지만, 기준이 "두 채널 두 런타임"이라면 3/4 는 그것이 아니다. 네 번째 칸을 추가했다(추가 spawn 1회).

### L2 — `outdated` 안내가 `source` 를 무시한다 → **backlog**

daemon 이 명시 경로에서 왔는데 낡았으면 `Upgrade with: npm i -g ...` 는 **아무 효과가 없다**. 지금은 `MIN_DAEMON_VERSION = 0.2.0` 이고 0.2.0 이 최초 발행본이라 **도달 불가**다.

**의도적으로 고치지 않았다** — 도달 불가능한 분기라 어떤 테스트도 실행할 수 없고, 검증되지 않은 코드를 배포하게 된다. floor 를 올리는 세대가 함께 처리하는 것이 맞다. backlog `낡은-daemon-안내가-명시-경로를-무시한다-...` 로 등록했고, 인접 2건(`semverGte` prerelease / `MIN_DAEMON_VERSION` 발행 검사)과 묶어 판단하라고 적었다 — 셋 다 "floor 를 올릴 때" 발동한다.

### L3 — `explicitMiss` 가 두 경로에서 조용히 버려진다 → **범위를 명시**

- `prompt.ts` 는 `!installed` 일 때만 miss 를 말한다. **installed + miss**(낡은 env 설정이 썩는데 자동 탐색이 구해준 상태)에서 에이전트는 침묵한다.
- `daemon/index.ts` 는 기동 **성공** 분기에만 실었다 → H1 수정으로 실패 경로에도 실린다.

D2 는 "빗나감 보고는 최종 판정과 무관"이라고 **무조건으로** 썼는데 FR4 는 `fix --check` / `daemon status` 두 곳만 지목한다. 즉 결함이 아니라 **spec 문장과 구현 범위의 불일치**다. `integrity.ts` 는 원칙대로 판정 독립이고 unit 이 지킨다. → **prompt 채널은 미설치 상태에서만 보고한다**를 여기 명시한다. 다음 사람이 버그로 오인하지 않도록.

관련해 문서의 "`binSource` 로 설정이 적용됐는지 확인할 수 있다"가 과했다 — `binSource` 는 **REAP 이 무엇을 띄울 것인가**이지 **지금 돌고 있는 프로세스가 무엇인가**가 아니다(`ensureDaemon` 은 이미 떠 있으면 short-circuit). **문서 7종 전부 정정**했다.

### L4 — 반증된 전제가 저장소에 두 곳 남아 있다 → **1건 처리, 1건 reflect**

- **소비된 backlog 본문** — lineage 에 그대로 아카이브된다. 머리에 `[gen-084 정정]` 블록을 달아 실측 결과와 실제 조건을 적었다. lineage 만 읽는 사람이 artifact 를 찾아가지 않아도 된다 `[실행]`
- `.reap/vision/memory/shortterm.md` — reflect 에서 **교체**가 의무이므로 자연 해소. 놓치지 않는다

### L5 — `tests/` submodule 미커밋 → **commit phase 에서 처리**

`git status` 가 `m tests`(내용 변경)이지 `M tests`(포인터 변경)가 아니다. reap-test CI 는 **reap 커밋의 submodule 포인터**로 checkout 하므로, 이대로 커밋하면 gen-083 시점 테스트가 gen-084 코드에 대해 돌아간다. 구 fixture 는 `toContain` 기반이라 **그래도 통과한다** — red 가 아니라 **신규 32건이 조용히 안 돌아가는 green** 이 된다. submodule 커밋 + `git add tests` 필수.

## Evaluator 대응 후 재검증 (전부 fresh)

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | pass `[실행]` |
| `npm run build` | pass `[실행]` |
| unit | **523 / 0 fail** `[실행]` (H1 대응으로 +2) |
| e2e | 279 / 0 fail `[실행]` |
| scenario | 44 / 0 fail `[실행]` |
| daemon | 130 / 0 fail `[실행]` |
| `check-self-diagnosis.sh` | pass `[실행]` — daemon 절 **10 assertion** |
| `check-docs-version.sh` | pass `[실행]` |
| `docs: vite build` | pass `[실행]` |
| `list-carriers.sh --orphans` | 고아 0 `[실행]` |

negative test 총 **8건** (N1~N8), 전부 FAIL 확인 후 복원. 잔재 grep 0.

## Verdict

**pass** — evaluator 의 high 2건을 **회피 없이 전부 수용해 수정**했고, low 5건 중 3건을 수정, 1건을 backlog 화, 1건을 범위 명시로 닫았다. 완료 기준 7개 전부 충족(기준 2는 evaluator 지적 후 네 번째 조합을 추가해 **문자 그대로** 충족). FR 8개 중 7개 충족 + FR7 이 의도된 문구 변경.

**남은 위험 3건**(§ R1~R3)과 L2/L3 의 범위 한계는 위에 명시했다. 어느 것도 산출물의 정확성을 위협하지 않으며, L2 는 현재 도달 불가능하다.

**judgment note**: evaluator 는 partial 을 냈고 나는 pass 로 판정한다. 근거는 "지적이 틀렸다"가 아니라 **"지적된 두 건을 이 세대에서 실제로 고쳤고, 각각 negative test 로 검사의 유효성까지 확인했다"** 이다. partial 을 낸 시점의 상태는 partial 이 맞았다.

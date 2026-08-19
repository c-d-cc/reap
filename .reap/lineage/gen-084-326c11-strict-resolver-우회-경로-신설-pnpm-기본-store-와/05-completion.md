# Completion

## Summary

**Goal**: daemon 위치를 명시 지정하는 경로(`REAP_DAEMON_BIN` / `config.daemonBin`)를 신설하고, 게이트가 그 경로를 실제로 검증하게 한다. **0.17.5 릴리즈의 하드 선행조건**(유저 결정).

**결과**: 완료. 구현·검증·문서 전부. 다만 **이 세대의 전제 자체가 틀렸음을 먼저 발견했고, 그것이 가장 중요한 산출물이다.**

### backlog 의 핵심 주장이 실측으로 반증됐다

goal 문장과 backlog 제목이 지목한 것은 "pnpm 기본 store 와 Yarn PnP 에서 **원리적으로** resolve 되지 않는다" 였다. 실제로 설치해 재보니:

| 레이아웃 | backlog | 실측 |
|---|---|---|
| pnpm 프로젝트 로컬 | 원리적 실패 | **찾음** |
| pnpm 전역 (진짜 CLI 로 `fix --check`) | 실패 | **찾음, 경고 0** |
| Yarn PnP (`nodeLinker: pnp`, yarn 4.5.0, 진짜 CLI) | 원리적 실패 | **찾음, 경고 0** |
| reap=prefixA / daemon=prefixB | 미설치 판정 | **미설치 판정** |
| reap 전역 + daemon 프로젝트 로컬 | 미설치 판정 | **미설치 판정** |

pnpm 의 격리는 **resolver 교체가 아니라 심링크 배치**다 — node 의 상향 탐색이 root `node_modules` 에 닿으면 찾힌다. Yarn PnP 는 resolver 를 실제로 대체하지만 기본 `pnpFallbackMode: dependencies-only` 가 **최상위 프로젝트의 의존을 fallback pool 로 허용**한다.

**깨지는 조건은 "reap 과 daemon 이 서로 다른 resolution root 에 설치되는 것"** 이다. 그리고 이 재규정은 문제를 **축소하지 않고 확대한다** — 문서는 둘 다 `npm i -g` 를 안내하는데, 그게 동작하는 이유는 **우연히 같은 prefix 에 떨어지기 때문**이다. 전역 reap + 로컬 daemon, 매니저 혼용, prefix 변경, nvm 전환이 전부 평범하고 전부 깨진다.

**거짓 서술이 사용자에게 도달한 적은 한 번도 없다.** gen-083 은 그 주장을 완료 artifact 와 backlog 에만 적었다. 배포물(README 2, 로케일 5, reap-guide, `src/`)에 pnpm·PnP 언급은 0건이었고, 지금 문서는 매니저 이름이 아니라 **조건**으로 쓰여 있다. `the hint names a condition, not a package manager` unit 테스트가 되돌림을 **강제**한다.

### 변경

- **명시 경로 신설** — `locateDaemon` 이 env > config > package > checkout 순으로 찾고, `resolveDaemonBin` 은 `.bin` 만 돌려주는 래퍼가 됐다. **모든 기존 호출부 무변경** — 이것이 요점이다. 기동 사슬(`ensureDaemon` → `daemonRequest` → `lifecycle.ts` → `run/*.ts`)에 config 를 흘렸다면 시그니처 5단을 고쳐야 했고, 한 곳만 놓치면 "찾기는 하는데 띄우지는 못한다"가 됐다
- **빗나감은 fall-through 하되 항상 보고** — `config.yml` 은 커밋되므로 머신 A 의 경로가 B 에 없어도 B 는 살아야 하고, 동시에 명시 지시가 조용히 무시돼서도 안 된다
- **안내 문구 3소비처** — 빗나감이 있으면 그 경로를 지목, 없을 때만 위치 지정 방법을 안내. 명령어는 항상 문장 끝
- **`daemon status` 가 `bin`/`binSource` 를 보고** — 우회를 설정한 사람이 확인할 수단
- **`reap update` 가 `daemonBin` 을 지우지 않게** (발견 D1)
- **게이트 § 5d-bis 신설 + 5b 확장** — daemon 절 assertion 6 → **10**
- **문서 7종** — reap-guide 2, README 2, 로케일 5 + `DaemonPage.tsx`

**검증**: unit **523**(+30) / e2e **279**(+1) / scenario 44 / daemon 130, 전부 0 fail. negative test **8건** 전부 FAIL 확인 후 복원.

### evaluator — partial 을 냈고, 지적 2건을 회피 없이 고쳤다

| # | 지적 | 처리 |
|---|---|---|
| H1 | 명시 경로가 **존재하지만 daemon 이 아닐 때** REAP 이 다시 침묵 | **수정** — 명시 경로에 한해 `isFile`, 실패 경로가 `bin`/`source` 를 말함, 게이트 (f) + N7 |
| H2 | FR5 의 `[실행]` 표기가 **아무도 실행하지 않은 것**에 붙어 있음 | **수정** — 게이트 5b 확장 + N8. 이제 진짜 `[실행]` |
| L1 | "두 채널 두 런타임" 이 3/4 였음 | **수정** — env×node 추가 |
| L2 | `outdated` 안내가 `source` 무시 | **backlog** — 현재 도달 불가, floor 인상 세대에서 |
| L3 | `explicitMiss` 가 prompt 채널에서 조건부 | **범위 명시** + 문서 과장 표현 7종 정정 |
| L4 | 반증된 전제가 저장소에 잔존 | backlog 원문에 정정 블록, shortterm 은 교체 |
| L5 | `tests/` submodule 미커밋 | commit phase 에서 처리 |

**H1 이 이 세대의 성격을 요약한다** — 우리가 없애려던 침묵을 한 층 위에서 새로 만들고 있었다.

## Lessons Learned

### 1. 도구 이름으로 명명된 실패 모드는 가설이다

gen-083 은 이 항목을 *"알려진 파손 — 미검증이 아니다"* 라는 제목 아래 적었다. **"무엇이 깨지는가를 명시하라"는 규율을 지키면서, 정작 그 항목 자체는 재보지 않았다.** 형식을 갖춘 확신이 측정을 대체했다.

그리고 **첫 측정도 틀렸다** — 최상위 선언 의존끼리 조회해 놓고 "격리를 뚫었다"고 읽을 뻔했다. 실제 두 패키지를 설치하고, reap 번들이 하는 것과 동일하게 **번들 realpath 를 issuer 로 삼아** 조회하고 나서야 성립했다. 그 재현이 정확한 이유(`dist/cli/index.js:48` 에 bun 이 `createRequire(import.meta.url)` 를 주입)까지 확인해야 했다 — 확인하지 않았다면 "ESM 에는 `require` 가 없으니 항상 실패한다"는 정반대의 오답에 도달했을 것이다.

### 2. 계획이 적어둔 검증 방법도 검증 대상이다

두 개가 틀렸다.

- "`npm run typecheck` 가 fixture 누락을 잡는다" — `tsconfig` 의 `include` 는 `src/**` 뿐이고 bun 은 런타임에 타입을 벗긴다. **아무것도 안 잡는다.**
- "구현 전 dist 로 게이트를 먼저 돌린다" — 게이트는 **스스로 `npm run build` 를 한다**(`check-self-diagnosis.sh:82`). `npm pack` 에 `prepack` 이 없다는 관찰은 맞았지만 무관했다.

둘 다 **그럴듯해서 확인하지 않았다.** 계획서의 "이렇게 검증한다"는 문장은 주장이지 사실이 아니다.

### 3. 명시 지정을 신뢰하기로 했으면, 그 신뢰가 깨질 때 무엇이 조용해지는지 함께 적어라

명시 경로에 신원 검사를 하지 않기로 한 것(D3)은 옳았다 — 사람이 적은 경로에 우연은 없고, 소스 체크아웃 지목이라는 정당한 사용을 막게 된다. **그러나 그 대가로 `installed: true` 가 보증하던 것이 약해졌다는 사실을 어디에도 적지 않았다.** evaluator 의 H1 이 정확히 그 결과다.

`installed` 는 세 소비처가 전부 신뢰하는 값이다. 그것의 의미를 바꾸면 세 곳의 의미가 함께 바뀐다.

### 4. `[실행]` 은 근거의 종류이지 확신의 정도가 아니다

FR 표의 FR5 칸이 `[실행]` 이었는데 그것을 실행하는 것은 게이트에도 테스트에도 없었다. 기능은 정상이었다 — **그러나 "정상이었다"는 이 문제의 답이 아니다.** gen-083 이 정확히 이것 때문에 evaluator 에게 잡혔고, 그 교훈으로 만든 표기법이 다음 세대에서 한 칸 어긋났다.

표기를 붙일 때는 **그 칸을 실행하는 명령을 지목할 수 있어야 한다.** 지목할 수 없으면 `[독해]` 다.

### 5. 되돌림을 막는 것은 문서가 아니라 검사다

문서를 조건 기반으로 고치는 것만으로는 다음 사람이 "pnpm 에서 안 된다"를 다시 써넣는 것을 막지 못한다. `DAEMON_LOCATE_HINT` 에 "pnpm"/"PnP" 가 들어가면 red 가 되는 unit 테스트를 붙였다. gen-073 의 "반복 누락은 지시가 아니라 검사로 막는다"를 **거짓 서술**에도 적용한 것이다.

## Adapt — genome 변경 1건

### 적용: 검증 근거 표기 규칙을 evolution.md 에 명문화

**`.reap/genome/evolution.md` + `src/templates/evolution.md`(영문판) 양쪽에 § "검증 근거는 종류를 구분해 적는다" 신설.** `[실행]` / `[negative]` / `[독해]` 세 표기와, **`[실행]` 을 붙이려면 그 항목을 실행하는 명령을 지목할 수 있어야 한다**는 규칙.

**왜 지금 genome 인가**: 이 표기법은 gen-083 fitness 에서 나온 교훈인데 **artifact 관행으로만 존재했고 어디에도 규칙으로 적혀 있지 않았다.** 그 결과 gen-084 에서 **한 칸 옆에서 똑같이 어긋났다**(FR5). 두 세대 연속 실패한 것은 관행이 아니라 규칙이어야 한다는 신호다. genome § "아키텍처 변경 시 genome 동기화" 의 판단 기준("다음 세션의 새 agent 가 이 변경을 몰라도 올바르게 동작할 수 있는가" → No)에 해당한다.

evolution.md 275 → **290줄** (가이드라인 300 이내). 템플릿은 194 → 209줄.

**주의 — 기존 프로젝트에는 아직 도달하지 않는다.** genome 은 user-owned 라 `reap update` / `--repair` 가 덮어쓰지 않는다(올바른 설계). 템플릿 수정은 **신규 `reap init` 에만** 반영된다. 따라서 **0.17.5 버전 bump 시 `src/templates/migration/v0.17.5.md` 에 이 규칙 추가를 지시**해야 한다 (gen-072 교훈).

지금 그 note 를 만들지 않은 이유: `scripts/check-docs-version.sh` 가 **migration note 버전이 `package.json` 을 넘지 않을 것**을 검사한다. 현재 0.17.4 이므로 `v0.17.5.md` 를 지금 만들면 게이트가 red 가 된다. **버전 bump 와 같은 커밋에서** 만들어야 한다.

### 적용하지 않음: environment → genome 이관 (다음 세대 후보)

gen-083 reflect 가 지목한 문제가 **여전히 유효하고, 본 세대가 그것을 늘렸다.** `environment/summary.md` 에 처방적 서술이 섞여 있다:

| 위치 | 문장 | 성격 |
|---|---|---|
| 136행 | "5개 로케일을 **모두** 갱신해야 한다" | 규칙 |
| 185행 | "`VALID_CONFIG_FIELDS` 에 **반드시 있어야 한다**" | 규칙 (**본 세대가 추가**) |
| 187행 | "`CONFIG_DEFAULTS` 에 **포함 금지**" | 규칙 |
| 247행 | "`XDG_CONFIG_HOME` 도 **함께 처리해야 한다**" | 규칙 |

genome § "genome vs environment 경계" 의 기준으로는 전부 genome 쪽이다. environment 275줄(가이드라인 250)의 상당 부분이 이것이다.

**본 세대에서 하지 않은 이유**: 각 문장이 어느 genome 파일의 어느 절로 가야 하는지는 개별 판단이고, 옮기면서 environment 쪽에 **서술형 잔여**를 남겨야 한다(사실은 여전히 사실이므로). adapt phase 의 곁다리로 할 크기가 아니다. 아래 hints 에 후보로 남긴다.

## Next Generation Hints

> adapt phase 가 아니므로 backlog 를 만들지 않는다. 아래는 인간이 판단할 후보다.

### 0.17.5 릴리즈 — 선행조건은 전부 끝났다. 남은 것은 발행 하나

본 세대가 **마지막 선행조건**이었다. 순서: gen-083(완료) → **본 세대(완료)** → `daemon-v0.2.0` 발행(유저가 태그 push) → 0.17.5.

`@c-d-cc/reap-daemon` 은 여전히 **404** 이고, reap-guide · docs 5로케일 · README 2종이 전부 `npm i -g @c-d-cc/reap-daemon` 을 안내한다. **발행 없이 0.17.5 를 내면 결함을 다른 결함으로 바꾸는 것**이다.

버전 bump 시 함께 해야 할 것:
- `src/templates/migration/v0.17.5.md` — 위 § Adapt 의 genome 규칙 추가를 기존 프로젝트에 지시. **지금은 만들 수 없다**(문서 게이트가 note 버전 > package 버전을 거부한다)
- 로케일 5종 changelog + `RELEASE_NOTICE.md` + `RELEASE_NOTES.md` — `check-docs-version.sh` 가 검사한다
- 릴리즈 전 `scripts/check-agent-integration.sh` (층2, ~$0.25)

### 수용된 한계 2건 (유저 결정 2026-08-19)

둘 다 **고치지 않기로 결정한 것**이며, 무엇이 일어나는지를 함께 적는다. "미검증"이라고만 적는 형식은 gen-083 이 썼고 이번에 그 항목이 거짓으로 드러났다.

#### (1) `daemonBin` 이 "존재하는 무관한 파일"이면 REAP 은 그것을 daemon 으로 취급한다 — **수용**

명시 경로에는 존재(파일) 검사만 하고 신원 검사를 하지 않는다(D3). 그 판단은 유효하다 — 사람이 직접 지목한 경로에 "우연히 남의 패키지"는 없고, 신원 검사를 넣으면 **소스 체크아웃 지목이나 래퍼 스크립트 지목 같은 정당한 사용을 막는다**.

**그래서 무슨 일이 일어나는가** (실측 `[실행]`):
- `resolveDaemonAvailability` 는 `installed: true` 를 낸다. `fix --check` 는 **아무 말도 하지 않는다**
- agent prompt 는 daemon 질의 프로토콜을 그대로 준다 — 에이전트가 죽은 포트에 요청을 보낸다
- 실제 사용 시점에 spawn 이 실패하고, `daemon status` 가 `Daemon is not running. REAP would start <경로> (from config).` 를 낸다 — **무엇을 띄우려 했는지는 말한다**

즉 **조용한 실패가 아니라 늦은 실패**다. 진단은 `fix --check` 가 아니라 `daemon status` 에서 나온다.

가장 흔한 실수인 **디렉토리 오타**(`.../reap-daemon` — `/dist/index.js` 누락)는 `isFile` 로 이미 닫혔고 그 경로를 지목해 보고한다. 남은 것은 "존재하는 다른 파일"뿐이며, 그것을 판별하려면 실행해 보는 수밖에 없다.

#### (2) Windows 전 경로 미검증 — **기록만**

`~` 전개와 `isAbsolute`/`resolve` 로 플랫폼 중립 API 만 썼으나 **Windows 에서 실행해 보지 못했다.** 개발·CI 모두 non-Windows 라 확인할 수단이 없다.

**구체적으로 무엇이 깨질 수 있는가**:
- **경로 구분자** — `readExplicitDaemonBins` 가 돌려주는 경로는 `resolve()` 산출이라 `\` 가 된다. 게이트와 실측은 전부 POSIX 경로였으므로 `C:\...` 형태가 `isAbsolute`/`existsSync` 를 통과하는지 확인되지 않았다
- **`~` 전개** — Windows 셸은 `~` 를 홈으로 해석하지 않는다. `homedir()` 로 직접 전개하므로 동작할 것으로 보이지만, 사용자가 `~` 를 쓸 이유가 없어 **실제로 쓰이는 형태가 다를 수 있다**
- **전역 prefix 구조** — daemon 이 `%APPDATA%\npm\node_modules\...` 에 놓이므로 `daemonBin` 에 적을 경로의 모양이 문서 예시와 다르다. 문서는 POSIX 예시만 싣고 있다
- **`detectRuntime()` 의 `bun --version`** — `execSync` 가 Windows 에서 어떻게 실패하는지 확인되지 않았다. 실패해도 node 로 폴백하므로 치명적이지 않을 것으로 보인다

이 목록은 **가설이지 측정이 아니다.** Windows 사용자 보고가 들어오면 그때가 첫 측정이다.

### 묶어서 처리할 만한 세 건

`낡은-daemon-안내가-명시-경로를-무시한다` / `semverGte 가 prerelease 를 구분하지 못한다` / `MIN_DAEMON_VERSION 발행 검사 게이트` — **셋 다 "floor 를 올릴 때" 발동**한다. 한 세대에서 함께 닫는 것이 자연스럽고, 그때 비로소 "설치됨 + 낡음" 이 도달 가능해져 게이트에 넣을 수 있다.

### 세대 중 전달받은 발견 — `PID_PATH` 죽은 코드 (코드는 건드리지 않았다)

completion 진행 중 team-lead 가 IDE 진단 결과를 전달했다: `src/cli/commands/daemon/client.ts:71` 의 `PID_PATH` 가 선언만 되고 읽히지 않는다.

확인한 것 `[실행]`:
- `git show HEAD:...` — **gen-083 커밋 시점에 이미 죽어 있었다.** 본 세대는 위치만 35 → 71 로 밀었다
- `DAEMON_ROOT`(같은 파일 15행)의 **유일한 소비처가 `PID_PATH`** 다 → 두 줄이 함께 죽는다. 한 줄 삭제가 아니다
- **pidfile 자체는 실재한다** — daemon 이 `daemon/src/index.ts:29/34` 에서 `writePid`/`removePid` 로 관리한다. reap 쪽이 읽지 않을 뿐이며, `daemon stop` 은 `/health` 로 pid 를 받아 `process.kill` 한다. 즉 "쓸모없는 파일"이 아니라 "reap 이 안 쓰는 경로 상수"다

**코드를 수정하지 않았다.** 근거 두 가지:
1. `strictEdit: true` 이고 발견 시점 stage 가 `completion` 이다 — HARD-GATE 가 implementation 외 코드 수정을 막는다
2. 본 세대 goal(daemon **위치 지정**)과 **인과로 묶여 있지 않다.** genome § Echo Chamber 방지의 "직접 인과 범위" 밖이다. 같은 파일을 크게 고쳤다는 것은 인접성이지 인과가 아니다

**더 중요한 것은 인스턴스가 아니라 게이트다.** `tsconfig.json` 에 `noUnusedLocals` 가 없어 이 부류가 `npm run typecheck` 를 통과한다 — 그래서 최소 한 세대를 살아남았다. 측정했다 `[실행]`: `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` → `src/` 전체 **8건**, 그리고 **균질하지 않다**(순수 죽은 코드 / 미사용 매개변수 / 이미 `_` prefix 를 달았는데도 잡히는 placeholder — `_` 면제는 매개변수에만 적용된다). 일괄 삭제 후 플래그를 켜는 처방은 틀렸다.

backlog `죽은-코드가-typecheck-를-통과한다-nounusedlocals-도입-검토-현-위반-8건` 에 8건 목록·분류·절차를 적었다. **`PID_PATH` 하나를 지우는 것으로 이 문제가 해결되지 않는다** — 그것은 인스턴스 제거일 뿐 게이트는 여전히 같은 것을 놓친다.

### 신설 backlog

- `죽은 코드가 typecheck 를 통과한다 — noUnusedLocals 도입 검토 (현 위반 8건)` — 위 참조
- `validation work phase 를 재실행할 수 없다` — 본 세대에서 실제로 겪었다. `reap run validation` 두 번째 호출이 막히고, **evaluator prompt 를 다시 얻을 방법이 없다**. `genome/evolution.md` 의 중단 복구 절차("중단된 시점의 phase 부터 다시 실행")와 정면으로 어긋난다. learning/planning 은 self-loop 이 있는데 validation 만 없다.

### 다음 세대 후보 — environment → genome 이관

위 § Adapt 참조. **한 세대 분량의 작업**으로 보인다:
1. `environment/summary.md` 의 처방적 문장을 전수 조사한다 (`grep -n "반드시\|해야 한다\|금지\|필수"` 가 출발점이지 전부는 아니다 — 명령형이 아닌 규칙도 있다)
2. 각각을 `application.md`(설계 결정·컨벤션) / `evolution.md`(AI 행동 규칙) 중 어디로 보낼지 판단한다
3. environment 에는 **서술형 잔여**를 남긴다 — 사실은 여전히 사실이다. 예: "`VALID_CONFIG_FIELDS` 에 반드시 있어야 한다" → genome 으로, environment 에는 "`backfillConfig` 는 그 집합에 없는 키를 삭제한다" 만 남긴다
4. 기존 프로젝트에 도달시키려면 **migration note 가 필요하다** (genome 은 user-owned)

동시에 `longterm.md` 52줄도 같은 원인이다 — genome 에 이미 있는 것이 중복으로 남아 있는지 함께 본다. 본 세대 reflect 에서 2건(adapter dispatcher / marker-hash sync)을 삭제했다.

### 그 밖에

- **크기 경고 2건이 남았다** — environment 276줄(≤250), longterm 52줄(≤50). reflect 에서 longterm 의 **genome 중복 2건**(adapter dispatcher / marker-hash sync — 둘 다 `application.md` 에 더 자세히 있다)을 삭제했으나 그 이상은 실제 내용이라 숫자를 맞추려고 지우지 않았다. 근본 해결은 **처방적 서술을 environment 에서 genome 으로 옮기는 것**이며 genome 변경이므로 adapt/backlog 사안이다.
- 측정이 사용자 yarn 캐시(`~/.yarn/berry/cache`)에 항목을 추가했다. **캐시 자체는 사전 존재(2024-12 생성, 430MB)이므로 손대지 않았다.**

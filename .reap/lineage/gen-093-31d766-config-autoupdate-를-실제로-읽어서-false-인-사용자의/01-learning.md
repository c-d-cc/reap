# Learning

> gen-093 — `config.autoUpdate` 를 실제로 읽어서 false 인 사용자의 설치가 바뀌지 않게 하고,
> 그 값이 어디서 읽히는지 검사로 고정한다.

## Project Overview

REAP 0.17.6 은 **미발행 상태**이고 이 세대가 그 마지막 조각이다. 0.17.6 의 주제는 gen-092 가
정한 대로 **"당신이 말하지 않은 설치가 바뀐다"** 이다 — auto-update 가 PATH 의 `reap --version`
을 읽고 무조건 전역 설치를 갈아치우던 것을 gen-092 가 "자기 패키지의 버전을 읽고, 전역 설치일
때만" 으로 좁혔다.

그런데 **그것을 끄는 스위치가 거짓**이다. 이 세대가 그 절반을 채운다.

## Source Backlog

`configautoupdate-를-읽는-코드가-없다-false-로-둔-사용자도-자동-업데이트된다.md`
(type: task / priority: high / gen-092 evaluator 발견, 이 세대가 직접 재확인)

### 요지

`.reap/config.yml` 의 `autoUpdate` 는 **어디에서도 값이 읽히지 않는다.** 표시되고, 보존되고,
새 프로젝트에 심어지고, 문서화까지 돼 있는데 **아무것도 바꾸지 않는다.**

| 위치 | 하는 일 | 이 세대에서 직접 확인 |
|---|---|---|
| `src/types/index.ts:95` | 타입 선언 | ✅ `autoUpdate: boolean` |
| `src/cli/commands/init/common.ts` | `true` 로 생성 | ✅ |
| `src/cli/commands/update.ts` | `VALID_CONFIG_FIELDS` + 기본값 backfill | ✅ |
| `src/cli/commands/config.ts:36` | `reap config` 출력에 표시 | ✅ |
| `src/core/integrity.ts:269` | boolean 인지 타입 검사만 | ✅ |
| `src/adapters/claude-code/skills/reap.config.md:13` | *"auto-update enabled"* 라고 문서화 | ✅ |
| `src/cli/commands/check-version.ts:365-368` | **읽지 않는다** — 주석이 그렇게 적혀 있다 | ✅ |

backlog 의 권고는 **1번(배선한다)** 이며, 근거는 *"설정이 존재하는데 값이 무시되는 것은 사용자가
확인할 방법이 없는 종류의 거짓"* — `reap config` 는 `false` 라고 보여주고 REAP 은 업데이트한다.

**backlog 의 주장을 그대로 받지 않고 재확인했다** (genome: "backlog 의 claim 을 검증하라").
`grep -rn "autoUpdate" src` 결과 위 표와 일치하며, `performAutoUpdate` 를 부르는 곳은
`check-version.ts:368` **한 곳뿐**이다. backlog 는 정확하다.

## Key Findings

### F1. `performAutoUpdate` 의 호출자는 하나뿐이고, 그 하나는 hook 경로다

```
$ grep -rn "performAutoUpdate" src
src/cli/commands/check-version.ts:200  (정의)
src/cli/commands/check-version.ts:368  (execute() 안, 유일한 호출)
```

그리고 `execute()` 는 `reap check-version` 이며, 두 경로에서 발화한다:
- `scripts/postinstall.sh` — npm install 직후
- SessionStart hook (`~/.claude/settings.json`, `install.ts:248`)

**둘 다 사용자가 보지 않는 경로**다. 여기서 잘못 판단하면 사용자의 머신에 설치되는 것이
바뀌거나 매 세션 거짓 경고가 뜬다. gen-092 의 1라운드 blocker 가 정확히 후자였다.

### F2. `reap update` 는 auto-update 를 부르지 않는다

`update.ts` 에는 `performAutoUpdate` 호출이 없다. `reap update` 는 **프로젝트 구조 동기화**이지
설치를 바꾸지 않는다 (`--post-upgrade` 는 새 바이너리가 자기 코드로 프로젝트를 sync 하는
경로다). 따라서 **"사용자가 명시적으로 요청하는 `reap update`" 는 이 플래그와 무관**하다 —
코드 변경이 필요 없고, 그 사실을 planning 에 적는다. 마찬가지로 사용자가 직접 치는
`npm install -g @c-d-cc/reap@latest` 도 영향받지 않는다. 플래그가 끄는 것은 **REAP 이 스스로
하는 설치 하나뿐**이다.

### F3. `performAutoUpdate` 는 이미 세 번 거절한다 — 순서에 이유가 적혀 있다

1. 버전 불명 → `version-unknown`
2. dev/alpha 빌드 → `dev-build`
3. 네트워크 실패 → `network-error`
4. 더 새 것이 없음 → `up-to-date`
5. **floor 미달 → `blocked` + 경고 출력** ← 설치가 아니라 **메시지**다
6. 전역 설치가 아님 → `not-global: <kind>` (조용함)
7. 설치 수행

6번이 5번 **뒤에** 놓인 이유가 주석에 명시돼 있다: 비용(`npm root -g` 는 프로세스 spawn)과
**어떤 메시지를 받는가**. 비전역 설치가 여기서 듣는 유일한 말이 5번의 경고이므로 순서를
뒤집으면 "자동으로 고쳐질 수 없는 사람들"에게서 그 경고를 빼앗는다.

**이 구조가 이번 세대의 배치 판단을 그대로 결정한다** (아래 C1).

### F4. `AutoUpdateDeps` seam 이 이미 있다

gen-092 가 `installedVersion / latestVersion / minVersion / installKind /
installLatestGlobally / handOff / syncWithCurrentBinary / log` 8개 seam 을 넣었고 각각
실물을 default 로 가진다. 새 seam 하나를 같은 패턴으로 붙이면 되고, `npm install -g` 없이
결정을 검증할 수 있다.

### F5. 동기 config 읽기 패턴이 이미 있다

`performAutoUpdate` 는 동기 함수다. `core/dump-state-sync.ts:44-58` 이 동기 config 읽기의
기존 패턴을 갖고 있다 — `existsSync` → `readFileSync` → `YAML.parse`, 각 단계 try/catch,
실패는 조용히 넘김. 같은 형태를 따른다 (genome: Pattern-first).

`check-version.ts` 자신도 `execute()` 하단에서 이미 `config.yml` 을 읽는다(`language`) —
`try` 안이고 실패가 non-fatal 이다. 즉 **읽기 자체는 새 작업이 아니다.**

### F6. gen-092 가 남긴 "먼저 볼 자리" — 설치된 사본의 버전을 읽는 상시 검사

`05-completion.md` adapt 절과 fitness 피드백이 함께 지목한다:

> 이번 세대가 고친 바로 그 값에 회귀 검사가 없다. 측정은 두 번 했지만
> (`03` 의 V8b, evaluator 의 install-layout probe) **둘 다 1회성이고 자산으로 남지 않았다.**

기존 테스트를 실제로 읽어 **무엇이 덮이고 무엇이 안 덮이는지** 갈랐다:

- `tests/unit/check-version.test.ts:157` *"reads its own version, not PATH's"* — PATH 에 가짜
  `reap` shim 을 놓고 **소스 트리의 모듈**을 자식에서 실행한다. **PATH 회귀는 이미 덮인다.**
- 덮이지 **않는** 것: V8b 가 잰 것 — **재배치된 산출물**. 저장소 안에서 재면 "런타임에 자기
  package.json 을 읽는다"와 "빌드 시점에 경로가 박혔다"가 **구분되지 않는다**(버전이 같으므로).
  longterm 의 안티패턴 *"번들링은 모듈의 깊이를 바꾸고 `__dirname` 은 빌드 시점 문자열이 된다"*
  가 겨냥하는 바로 그 함정이고, **발행본이 빌드 머신의 절대 경로를 3세대 동안 실어 날랐던**
  전례가 있다.

→ 따라서 필요한 상시 검사는 **빌드 산출물을 다른 버전의 package.json 과 함께 임시 디렉토리로
옮겨 실행하고, 그 버전이 나오는지** 보는 것이다. e2e 가 이미 `dist/cli/index.js` 를 node 로
실행하므로 자리가 맞다.

### F7. 이 값을 바깥으로 내보내는 CLI 표면이 있다

`src/cli/index.ts:29` — `program.version(runningVersion())`. `getInstalledVersion` 과 **같은
소유자**(`core/package-info.ts`)에서 나온다. 즉 `reap --version` 을 재배치된 사본에서 재면
auto-update 가 읽는 그 값을 재는 것이다. 네트워크도 npm 설치도 필요 없다.

주의: `dist/.dev-build` 가 있으면 `+dev.<hash>` 가 붙는다. 로컬 빌드에는 있고 발행본에는 없다
(`scripts/build.sh` 의 `CI` 가드). 단언은 이 접미사를 허용해야 한다.

주의 2: `cli/index.ts:224` 의 `ensureUserLevelAssets` 가 `program.parse()` **앞에서** 돌므로
`--version` 조차 사용자 레벨 자산을 건드린다. 검사는 `HOME` + `XDG_CONFIG_HOME` 을 함께
격리해야 한다 (shortterm 이 경고한 그대로 — 현재 스위트가 개발자 실제 HOME 에 쓴다).

### F8. 인접 backlog 는 흡수하지 않는다

`checkautoupdateguard-는-호출되는-곳이-없다-…md` 는 같은 파일의 죽은 코드에 관한 **별건**이다.
team lead 의 지시대로 남긴다. 다만 이 세대의 작업이 그 답을 자명하게 만든다면 artifact 에
적는다 (판단은 `03`/`05` 에서).

## Technical Deep-Dive — 판단해야 할 것 세 가지

### C1. 플래그를 **어디서** 읽는가

두 후보:

| | 호출부 게이트 (`execute()`) | `performAutoUpdate` 내부 4번째 거절 |
|---|---|---|
| 코드량 | 더 적음 | 비슷 |
| floor 경고(5번) | **함께 사라진다** | 살아남게 배치 가능 |
| 결정의 소재지 | "올릴 것인가"가 두 파일로 쪼개짐 | 이미 3개 거절이 사는 곳에 4번째 |
| 네트워크 비용 | 끈 사용자는 `npm view` 를 안 함 | 끈 사용자도 `npm view` 를 함 |

team lead 가 명시적으로 경고한 지점이 첫 행이다 — *"사용자에게 필요한 경고를 침묵시키는
플래그는 한 칸 옆의 다른 결함이다."*

`autoUpdate: false` 의 의미를 **"내 설치를 바꾸지 마라"** 로 읽으면 5번 경고는 살아야 한다
(그것은 메시지이지 설치가 아니다). **"나에게 아무것도 하지 마라"** 로 읽으면 호출부 게이트가
맞고 네트워크도 아낀다.

→ planning 에서 하나를 고르고 근거를 적는다. 현재 기울기: **내부 배치 + 5번 뒤**.

### C2. config 를 읽을 수 없을 때 — fail open / fail closed

**이것이 조용한 회귀를 만들 수 있는 자리다.** `execute()` 의 root 는 `process.cwd()` 이고:

- SessionStart hook → cwd = 프로젝트 루트 → config 있음
- **npm postinstall → cwd = 패키지 디렉토리 → `.reap/config.yml` 이 없다**

fail closed 를 고르면 **postinstall 경로의 auto-update 가 전부 죽는다.** 보수적으로 보이는
선택이 실제로는 가장 큰 동작 변경이다. 기본값이 `true` 이므로 "설정 없음 = 기본값 = 켜짐" 이
일관되기도 하다.

→ 기울기: **fail open.** 명시적인 boolean `false` 만 끈다. 파일 없음 / YAML 깨짐 / 필드 없음 /
boolean 아님 → 켜짐. (boolean 이 아닌 값은 `integrity.ts:269` 가 이미 경고로 잡는다.)

### C3. 무엇으로 고정하는가

- 끈 사용자에게 설치가 안 일어남 (unit, seam 주입)
- **끈 사용자도 floor 경고는 받음** (unit) ← C1 판단의 살아있는 근거
- seam 미주입 시 실제 config 를 읽음 (unit, 임시 디렉토리 3종: false / true / 없음)
- **재배치된 산출물이 자기 버전을 보고함** (e2e) ← F6, gen-092 가 남긴 숙제

각 검사는 **먼저 실패시키고 그 자리를 기록한다** (genome).

## Backlog Review

pending 15건. 이 세대와 관계있는 것:

- `checkautoupdateguard-…` — **같은 파일, 별건. 흡수 금지** (team lead 명시). F8 참조.
- 나머지 14건 — 0.18 트랙(plugin 전환 / idea / plan / milestone / interview / `/reap.plan`),
  index 재설계 2건, 그 밖의 독립 결함. 이 세대와 무관.

## Context for This Generation

### Clarity: **High**

goal 이 명확하고, source backlog 가 해법 3안과 권고까지 담고 있으며, 파일과 함수가 지목돼
있다. 남은 판단(C1/C2)은 team lead 가 *"물려받지 말고 직접 하라"* 고 명시한 것이므로
**모호함이 아니라 위임된 결정**이다.

### 이 세대를 구속하는 것

- `package.json` **0.17.6 유지 — bump 금지.** 기존 0.17.6 항목을 **보강**한다
  (`RELEASE_NOTES.md` / `RELEASE_NOTICE.md` / 5 로케일). 0.17.5 이하는 건드리지 않는다.
- **strictEdit** — `02-planning.md` 의 파일 목록 안에서만 편집. 범위 밖 발견은 `reap make backlog`.
- **strictMerge** — `git pull/push/merge` 금지. 완료 후 push·tag 하지 않는다.
- **evaluator: true** — validation 에서 독립 검토.
- 기준선: **unit 620 / e2e 329 / scenario 44**, 전부 0 fail. `fix --check` 0 error / 2 warning.
- Verification 항목에 `[실행]`/`[negative]`/`[독해]` 를 붙인다. `[실행]` 은 **명령을 지목할 수
  있을 때만**.

### 가정

1. `reap check-version` 의 두 발화 경로(postinstall / SessionStart) 외에 `performAutoUpdate`
   를 부르는 곳은 없다 — grep 으로 확인함(F1).
2. `reap update` 는 설치를 바꾸지 않는다 — grep 으로 확인함(F2).
3. 실제 `npm install -g` 실행, 실제 `npm view` 응답, 실제 postinstall 환경의 `npm root -g`
   응답은 **이 세대의 검사가 닿지 않는다.** gen-092 가 같은 한계를 기록했고 이 세대도 그대로
   물려받는다 — validation 에 명시한다.

### 직전 세대 피드백에서 가져오는 것

> 1라운드 blocker 둘이 전부 자기 수정이 만든 것이었다. (…) 두 세대 연속이며, longterm 의
> "각 수정의 이웃이 다음 결함이 사는 곳"이 두 번 연속 확인된 셈이다.

→ **세 세대 연속이 되지 않게 한다.** 자기 수정 직후, 바꾼 것의 **옆**을 먼저 본다.
이번 세대에서 그 "옆"은 구체적으로: 새 거절이 들어간 뒤 **5번 경고 경로**, seam default 가
바뀐 뒤 **미주입 호출자**, 그리고 e2e 가 격리한다고 주장하는 **HOME/XDG 두 축**이다.

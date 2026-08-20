# Implementation

> gen-092 — auto-update 가 어느 버전을 읽고 어디에 설치하는가

## Summary

결함 둘을 각각 **red 를 먼저 확인한 뒤** 고쳤고, 그 과정에서 셋째(내 수정이 만들어내는 문구
불일치)와 넷째(호출되지 않는 함수)를 발견해 전자는 고치고 후자는 backlog 로 넘겼다.

소스 7파일(1 신규) / 테스트 3파일(1 신규) / 문서 7파일. 버전 **0.17.6 유지**.

## Tasks

- [x] T001 red-first 테스트 — PATH 에 가짜 `reap` 를 놓고 `getInstalledVersion()` 관측
- [x] T002 `src/core/package-info.ts` 신설 (단일 소유자)
- [x] T003 `tests/unit/package-info.test.ts` 신설
- [x] T004 `getInstalledVersion()` → `runningVersion()` 위임 → T001 green
- [x] T005 `src/cli/index.ts` `readVersion()` 삭제 → import
- [x] T006 `update.ts` / `load-context.ts` / `dump-state-sync.ts` 의 사본 3개 삭제 → import
- [x] T007 `detectInstallKind` 일습을 `uninstall.ts` → `core/package-info.ts` 이동
- [x] T008 `tests/unit/uninstall.test.ts` import 경로만 갱신 (본문 무변경)
- [x] T009 `AutoUpdateDeps` seam 추가 (guard 없음)
- [x] T010 kind 별 테스트 추가 → **4건 red 확인**
- [x] T011 install-kind guard 추가 → green
- [x] T012 `upgradeCommandFor(kind)` + 경고 2곳 적용 + `GuardDeps` seam
- [x] T013 문구 테스트 + **negative 주입으로 2건 red 확인 후 복원**
- [x] T014 typecheck / build / 세 스위트
- [x] T015 자기진단 게이트 전 절
- [x] T016 릴리즈 문서 7파일 보강 + 문서 게이트
- [x] T017 carrier 고아 확인
- [x] [autonomous] `npm root -g` 에 timeout 추가 — 아래 A3
- [x] [autonomous] `checkAutoUpdateGuard` 미호출 발견 → backlog + `execute()` 주석 정정 — 아래 A4

## 결함 1 — 어느 버전을 읽는가

### red 를 먼저 만들었다, 그리고 그 red 가 두 번 필요했다

첫 시도는 테스트 프로세스 안에서 `process.env.PATH` 를 바꾸고 `getInstalledVersion()` 을
직접 불렀다. 그리고 **자기 통제 단언에서 실패했다**:

```
expect(execSync("reap --version").trim()).toBe("9.9.9")
Expected: "9.9.9"   Received: "0.17.5"
```

**bun 은 in-process `process.env.PATH` 변경을 `child_process.execSync` 자식에게 넘기지 않는다.**
`os.homedir()` 가 `$HOME` 을 무시하는 것과 같은 모양이며 longterm 에 이미 적혀 있는 성질이다.
그 통제 단언이 없었다면 shim 이 PATH 앞에 서지도 못한 채 "PATH 를 바꿔도 값이 안 변한다"가
**green** 으로 나왔을 것이다 — 아무것도 측정하지 않은 green.

그래서 자식 프로세스에 env 를 **넘겨서** 실행하도록 바꿨고, 그 상태에서 본 단언이 red 가 됐다:

```
(fail) reads its own version, not PATH's > a different `reap` on PATH does not change the answer
```

수정 후 green. 통제 단언(`shim 이 정말 앞에 있는가`)은 **테스트에 남겼다**.

### 판정을 무엇으로 하는가

`startsWith(declared)` 다. `not.toBe("9.9.9")` 는 null·크래시·빈 문자열도 통과시키므로 두 상태를
분리하지 못한다. 가짜 값 `9.9.9` 는 `0.17.6` 으로 시작할 수 없다.

### 통합 — 사본 다섯을 하나로

`src/core/package-info.ts` 가 "이 코드가 속한 패키지에 관한 사실"의 단일 소유자다.

| 사라진 것 | 남은 것 |
|---|---|
| `cli/index.ts: readVersion()` | `runningVersion()` |
| `update.ts: getPackageVersion()` | `packageVersion()` |
| `load-context.ts: getPackageVersion()` | `packageVersion()` |
| `dump-state-sync.ts: getPackageVersion()` | `packageVersion()` |
| `check-version.ts: execSync("reap --version")` | `runningVersion()` |

`packageVersion()` 과 `runningVersion()` 을 **나눈 이유**는 하나다 — 앞의 것은 사용자
`config.yml` 의 `lastMigratedVersion` 으로 **기록**되고 semver 로 비교된다. `+dev` 접미사가
거기 새어들면 사용자 파일 오염이다. 뒤의 것은 `performAutoUpdate` 가 로컬 빌드를 건너뛰는
근거이므로 접미사가 **있어야** 한다.

`findPackageRoot` 로 이름을 찾아 올라가므로 **호출자의 깊이에 의존하지 않는다.** 사라진 사본
넷이 각자 다른 깊이 목록(2단계 / 3단계 / …)을 갖고 있던 이유가 바로 그 의존이었다.
이름으로 못 찾으면 **기존 고정 깊이 목록으로 폴백**하므로 최악의 경우도 현행과 동일하다.

## 결함 2 — 어디에 설치하는가

**근거는 결함 1 과 독립이다.** `npm install -g` 는 디렉토리가 아니라 **머신에** 작용하고,
그것이 자기 자신에 대한 작용이 되는 유일한 경우가 전역 설치다.

### seam → red → guard

T009 에서 `AutoUpdateDeps` 만 넣고(동작 무변경) T010 을 돌려 **정확히 4건**이 red 임을 확인했다:

```
(fail) a local install runs no npm install
(fail) a npx install runs no npm install
(fail) a checkout install runs no npm install
(fail) a unknown install runs no npm install
 14 pass  4 fail
```

`global` 케이스는 그 시점에도 pass 였다 — **red 가 난 것은 정확히 바뀌어야 하는 것들뿐이다.**
T011 로 guard 를 넣어 18 pass 0 fail.

### guard 를 어디에 두었나 — 그리고 왜 거기인가

`hasNewerRelease` 통과 **이후**다. `detectInstallKind()` 는 `npm root -g` 프로세스를 띄우고,
`check-version` 은 **매 SessionStart 에 돈다**. 앞에 두면 업그레이드가 없는 대다수 세션마다
spawn 이 하나 늘어난다. 이것을 테스트로 고정했다 — 최신 상태에서 `installKind` seam 이
**한 번도 호출되지 않는 것**을 단언한다.

### `unknown` 은 거절한다 — 그리고 그 거절은 공짜다

`npm root -g` 를 물을 수 없는 환경은 `npm install -g` 가 성공할 환경도 아니다. 따라서
fail-closed 로 잃는 것이 없다. (반대 방향은 잃는 것이 있다 — 무엇인지 모르는 채 머신을 바꾼다.)

### 8단계의 PATH 사용은 그대로 두었다

`handOffToNewBinary()` 와 fallback 의 `reap update` 는 여전히 PATH 를 쓴다. **거기서는 그것이
옳다** — 방금 전역 설치를 교체했으므로 PATH 의 `reap` 이 곧 새 바이너리다. 그리고 이제
6단계 guard 덕분에 **그 지점에 도달하는 것 자체가 "우리가 전역이다"를 의미한다.** 주석으로
못박았다.

## 부수적으로 처리한 것

### A3 — `npm root -g` 에 timeout (10s)

`detectInstallKind` 는 gen-090 이 **대화형 명령**(`reap uninstall`)을 위해 쓴 것이라 timeout 이
없었다. 내가 그것을 **SessionStart hook 경로**로 끌어왔으므로 성질이 달라진다 — 여기서 npm 이
멈추면 사용자의 세션 시작이 멈춘다. `check-version.ts` 의 다른 모든 spawn 은 이미 timeout 을
갖고 있다. timeout → throw → `unknown` → 거절, 즉 fail-closed 와 자연히 맞물린다.

### A4 — `checkAutoUpdateGuard` 는 호출되는 곳이 없다

`grep -rn "checkAutoUpdateGuard" src` → **정의부 1건뿐.** 그런데 `execute()` 의 doc comment 는
*"Check autoUpdateMinVersion guard (fallback for non-autoUpdate projects)"* 라고 적어 **실행되는
것처럼** 서술하고 있었다.

이것이 내 artifact 의 정직성에 직접 영향을 준다: 나는 경고 문구를 **두 곳**에서 고쳤지만
**그중 하나는 프로덕션에서 도달하지 않는다.** gen-085 가 정확히 이 모양으로 틀렸다(교훈이
longterm 에 있다 — *"메커니즘은 맞았고 그 도달 범위는 지어낸 것이었다"*). 그래서:

- 사용자가 실제로 보는 문구 변경은 **`performAutoUpdate` 의 blocked 분기 하나**다.
- `checkAutoUpdateGuard` 쪽 수정은 **일관성을 위한 것이며 지금은 아무도 보지 못한다.**
- 배선할지 지울지는 별개 판단이라 **backlog** 로 넘겼다
  (`checkautoupdateguard-는-호출되는-곳이-없다-배선할-것인가-지울-것인가.md`).
- `execute()` 의 거짓 주석은 **고쳤다** — 내 변경 바로 옆에서 동작을 잘못 서술하는 문장을
  그대로 두는 것이 더 나쁘다.

## Verification

각 항목의 근거 종류를 표기한다.

| # | 항목 | 근거 |
|---|---|---|
| V1 | PATH 의 다른 `reap` 이 값을 바꾸지 못한다 | **[negative]** 수정 전 red 확인 → 수정 후 green. `bun test --isolate tests/unit/check-version.test.ts` |
| V2 | shim 이 정말 PATH 앞에 있었다 | **[실행]** 같은 파일의 통제 테스트. 첫 시도에서 이 단언이 red 를 냈고 그것이 접근법을 바꾸게 했다 |
| V3 | `local`/`npx`/`checkout`/`unknown` 은 `npm install -g` 를 부르지 않는다 | **[negative]** seam-only 상태에서 4건 red 확인 → guard 후 green |
| V4 | `global` 은 기존대로 업그레이드한다 | **[실행]** 같은 테이블 테스트. seam-only 상태에서도 pass — 변한 것은 나머지 넷뿐 |
| V5 | kind 조회가 최신 상태에서는 일어나지 않는다 | **[실행]** `installKind` 호출 횟수 0 단언 |
| V6 | 처방 문구가 두 상태를 분리한다 | **[negative]** `local` 을 전역 명령으로 되돌려 2건 red 확인 후 복원 |
| V7 | `packageVersion()` 에 `+dev` 가 새지 않는다 | **[실행]** unit 단언 + 임시 프로젝트에서 `reap update` 직접 실행 → `packageVersion: 0.17.6`, `lastMigratedVersion: 0.0.0` |
| V8 | 번들의 `--version` 이 그대로다 | **[실행]** `node dist/cli/index.js --version` → `0.17.6+dev.9807d29` |
| V8b | 버전 해석이 **런타임**이지 빌드 시점에 박힌 경로가 아니다 | **[실행]** 번들을 임시 디렉토리로 옮기고 `package.json` 을 `3.2.1` 로 바꿔 실행 → `3.2.1`, 마커를 심으면 `3.2.1+dev.deadbee`. 저장소 안에서만 재면 두 상태가 **구분되지 않는다**(버전이 같으므로) — longterm 이 경고한 `__dirname` 함정을 겨냥한 측정이다 |
| V9 | `detectInstallKind` 이동이 동작을 바꾸지 않았다 | **[실행]** `tests/unit/uninstall.test.ts` **본문 무변경**으로 26 pass |
| V10 | 세 스위트 | **[실행]** unit 611 (585+26) / e2e 329 / scenario 44, 0 fail |
| V11 | 배포 산출물 | **[실행]** `bash scripts/check-self-diagnosis.sh` 전 절 통과 (번들 sha 단언 포함) |
| V12 | 릴리즈 문서 정합 | **[실행]** `bash scripts/check-docs-version.sh` 전 항목 + `cd docs && npx vite build` |
| V13 | 새 고아 표식 없음 | **[실행]** `bash scripts/list-carriers.sh --orphans` → 기존 1건(`RELEASE_NOTES.md` 산문, 별도 backlog 있음)만 |
| V14 | `checkAutoUpdateGuard` 무호출 | **[실행]** `grep -rn "checkAutoUpdateGuard" src` → 정의부뿐 |

### 테스트가 닿지 않는 경로 (게이트 포함해서도)

- **실제 `npm install -g` 의 실행과 결과.** guard 가 그것을 부르는지/안 부르는지만 검증했다.
- **실제 `npm view` 네트워크 응답.**
- **실제 npm postinstall 환경에서의 `npm root -g` 응답.** 자기진단 게이트는 실제 tarball 을
  격리 prefix 에 `npm i -g` 하므로 postinstall 이 진짜로 돌지만, **로컬 pack 된 tarball 은
  `dist/.dev-build` 를 갖고 있어** `performAutoUpdate` 가 2단계에서 반환한다 —
  **게이트는 6단계 guard 를 한 번도 실행하지 않는다.**
- **SessionStart hook 의 실제 발화.**
- **Windows / 심볼릭 링크 실환경.** `sameDirectory` 의 realpath 처리는 gen-090 의 unit 이
  가짜 realpath 로만 덮는다.

## Notes

- **`npm pack` 은 `dist/.dev-build` 를 포함한다** — `npm pack --dry-run --json` 이 내놓는 파일
  목록 86개 중 1개다. [실행]
  따라서 로컬에서 만든 tarball 을 설치하면 자동 업데이트가 dev-build 로 걸러진다. 발행본은
  `scripts/build.sh` 의 `CI` 가드로 마커가 없다.
- **`bun src/cli/index.ts` 실행 시 `+dev` 가 붙게 된다** (마커를 `<packageRoot>/dist/.dev-build`
  에서 찾으므로). 이전에는 `src/.dev-build` 를 봐서 붙지 않았다. **번들 경로는 완전히 동일**하고
  테스트·게이트·CI 는 전부 번들을 돌린다.
- `src/core/notice.ts` 의 `require.resolve` 기반 패키지 루트 탐색은 **통합하지 않았다** — 대상이
  버전이 아니라 `RELEASE_NOTICE.md` 경로이고, 같은 사실이 아니다.
- 새 carrier 표식을 심지 않았다. genome 이 **공유 가능하면 표식보다 공유**를 처방하며 이번 것은
  전부 공유 가능한 값이었다.

---

# Round 2 — evaluator high 대응

`evaluator: true` 로 독립 검토를 돌렸고 **high** 가 나왔다. 두 blocker 모두 실재했고,
**둘 다 이번 세대의 수정 자체가 만들어낸 것**이다 — gen-091 의 교훈("각 수정의 이웃이 다음
결함이 사는 곳") 그대로.

`reap run back` 으로 implementation 으로 정식 회귀했다.

## F1 (blocking) — `getInstalledVersion()` 이 더 이상 null 을 못 돌려준다

`runningVersion()` 은 찾지 못하면 **`"0.0.0"` 을 돌려주고 그것은 truthy** 다. 따라서
`runningVersion() || null` 은 **절대 null 이 되지 않고**, `performAutoUpdate` 1단계의
`version-unknown` 분기가 죽었다. evaluator 가 실제 값으로 측정한 결과:

```
result:  {"action":"blocked","from":"0.0.0","to":"0.17.5",
          "reason":"breaking-change: v0.0.0 < minVersion v0.16.0"}
printed: ["[REAP] Breaking change detected: v0.0.0 → v0.17.5. Run: npm install -g ..."]
```

**옛 코드는 같은 상황에서 조용했다** — `execSync` 가 throw 하고 caller 가 null 을 봤다.
즉 내 수정이 **무증상 상태를 매 postinstall·매 세션 시작마다 나오는 거짓 경고로 바꿨다.**
`getInstalledVersion` 의 doc comment 는 그 사이에도 *"Returns null …"* 이라고 적고 있었다 —
**주석이 코드보다 옳았던 것이 아니라, 내가 코드를 바꾸고 주석을 안 고쳤다.**

수정:

- `core/package-info.ts` 에 **`UNKNOWN_VERSION` 상수**와 **`runningVersionOrNull()`** 추가.
  `packageVersion()`/`runningVersion()` 은 문자열이 필요한 소비자를 위해 placeholder 를 유지하고
  (`lastMigratedVersion` 이 그것을 요구한다), **행동을 결정하는 소비자만** null 형을 쓴다.
- `getInstalledVersion(deps)` 가 `runningVersionOrNull(deps)` 를 돌려준다.

**`deps` 를 받게 한 이유는 검증 때문이다.** 그것이 없으면 누군가 `runningVersionOrNull` 을
`runningVersion` 으로 되돌려도 **스위트가 전부 green 이다** — 다른 모든 테스트는 버전을 주입하거나
패키지를 찾을 수 있는 곳에서 돌기 때문이다. 실제로 그 되돌림을 주입해 **red 1건**을 확인했다:

```
(fail) getInstalledVersion reports 'cannot tell' as null > an unresolvable package root gives null
```

## F2 (blocking) — 릴리즈 문서가 하지 않는 안내를 약속했다

7파일에 *"…are told the command that fits where they actually live"* (ko: "…맞는 명령을
안내받습니다", ja/de/zh 동일 취지)라고 적었다. **거짓이다.** evaluator 측정:

```
local / npx / checkout  →  printed: []      (완전 무음)
global                  →  printed: ["[REAP] Auto-updated: ..."]
```

`upgradeCommandFor` 의 호출부는 둘뿐이고 하나는 **호출자가 없는 함수**(A4) 안에 있다. 따라서
그 문구가 사용자에게 도달하는 경로는 `performAutoUpdate` 의 **blocked 분기 하나**뿐이다 —
**내 03 artifact 는 그것을 정확히 적어두고 문서에는 반대로 썼다.** 문서가 artifact 와 모순됐다.

수정: 다섯 로케일 + `RELEASE_NOTES.md` 의 해당 절을 **"조용히 건너뛴다"** 로 바꿨다.
`RELEASE_NOTICE.md` 는 원래 그 약속을 하지 않았으므로 손대지 않았다.

## F3 (low) — 파일 상단 주석의 도달 주장

`check-version.ts:9` 가 gen-085 이래 *"두 guard 중 checkAutoUpdateGuard 만 그런 빌드가 도달한다"*
라고 적고 있었다. 나는 같은 파일 아래쪽에서 **그 함수에 호출자가 없음**을 증명해놓고 이 문장은
그대로 뒀다. 정정했다.

## F4 (low) — 주입 seam 의 **기본값**이 고정돼 있지 않았다

모든 kind 테스트가 `installKind` 를 주입하므로 **잘못된 `??` 기본값이 영원히 green** 으로 남는다.
테스트 3종 추가:

- `installKind` 미주입 → 실제 `detectInstallKind` → 체크아웃에서 `"not-global: checkout install"`.
  (체크아웃은 npm 을 띄우기 **전에** 판정되므로 네트워크 없이 결정적이다)
- `installedVersion` 미주입 → `dist/.dev-build` 존재 여부를 **테스트가 읽고** 그에 맞는 결과를
  단언. 두 분기 모두 옛 상태와 구분된다 (`+dev` 접미사는 `runningVersion` 만 만들 수 있고,
  PATH 의 `reap` 은 다른 번호다).
- `installedVersion: () => null` → `version-unknown`, **아무것도 질의·설치·출력하지 않음**.

## F5 (low) — guard 위치의 근거가 절반만 적혀 있었다

나는 비용만 적었다. evaluator 지적대로 **어느 메시지가 사용자에게 가는가**도 그 순서가 정하는
것이다: 5단계(하한 경고)가 먼저이므로, **비-global 설치가 이 코드에서 듣는 유일한 말**이 그
경고다(6단계 거절은 무음). 순서를 뒤집으면 자동 수정이 불가능한 낡은 사본을 쓰는 사람에게서
그 한 마디마저 사라진다. 코드 주석에 이 절반을 추가했다.

## evaluator 가 깨뜨리지 못한 것 (그리고 내가 못 쟀던 것을 재줬다)

- **실제 npm 환경.** 로컬 설치 postinstall 에서 `npm root -g` → 진짜 전역 루트, 98ms,
  `local` 판정. `--prefix` 전역 설치 postinstall 에서 `/var/…` vs `/private/var/…` 가 갈리고
  **`sameDirectory` 의 realpath 가 그것을 붙인다** → `global`. 중첩 npm 은 hang 하지 않았다.
  나는 이것을 "닿지 않는 경로"로 적었는데 **evaluator 가 실제로 쟀다.**
- **dev-entry 마커 의미 변화.** 테스트·스크립트·워크플로 어디에서도 `bun src/cli/index.ts` 를
  돌리지 않음을 확인. 부수 효과 하나를 **내가 주장하지 않았는데 evaluator 가 짚었다** —
  이제 dev 진입점과 번들이 `ensureUserLevelAssets` 에 **같은 버전**을 찍는다. 이전에는 dev 가
  발행본과 같은 `0.17.6` 을 찍어 **나중의 진짜 동기화를 억제**할 수 있었다. shortterm 의
  "작업 트리 agent 정의가 살아있는 클라이언트로 들어간다" 항목이 **부분적으로 닫혔다.**
- **`ownPackageRoot` 폴백.** 남의 버전을 읽는 현실적 배치를 만들 수 없었다 — 첫 폴백 후보가
  방금 이름 조회에 실패한 그 루트이기 때문. 그리고 `detectInstallKind` 는 **폴백을 쓰지 않는다**
  — 파괴적 결정 쪽이 그 구석에서 `unknown` 으로 fail-closed 한다. 의도한 비대칭인데
  **어디에도 적혀 있지 않았다** → 이 문단이 그 기록이다.

## Round 2 이후 재검증

`04-validation.md` 의 표를 참조. 세 스위트·두 게이트·docs 빌드를 **전부 다시** 돌렸다.

## Round 2 자체 점검 — 내가 F2 를 반대 방향으로 반복할 뻔했다

F2 를 고치며 처음 쓴 문구는 *"are left alone, **silently**"* (ko "조용히 건너뜁니다") 였다.
**그것도 거짓이다.** 비-global 설치라도 하한 미달이면 5단계 경고가 먼저 나간다 — 무음이 아니다.
"안내를 받는다"를 "아무 말도 없다"로 바꾸며 **같은 종류의 과장을 반대편에서** 만들 뻔했다.

최종 문구는 `are left alone` / `그대로 둡니다` — **모든 분기에서 참인 것**(설치가 바뀌지 않는다)만
말한다. 6파일 재수정 후 문서 게이트·docs 빌드 재실행.

---

# Round 3 — evaluator round 2 (low) 대응

2차 검토는 **low** 였고 blocker 는 없었다. 여섯 항목 전부 처리했다 — low 라고 넘기지 않은
이유는 그중 둘이 **"주장과 측정의 불일치"** 이고 이번 세대의 주제가 정확히 그것이기 때문이다.

## L1 — `04-validation.md` 이 round-1 수치를 담고 있었다

`03-implementation.md` 는 *"전부 다시 돌렸다, 04 의 표를 참조"* 라고 가리키는데 그 표는
**unit 611** (round 1) 이었다. 실제는 **619**. **lineage 에 남는 것이 04 다.** 다시 썼다.

## L2 — `UNKNOWN_VERSION` 주석이 무해하지 않은 소비자를 무해하다고 적었다

내가 쓴 문장은 *"문자열이 필요한 소비자에게는 괜찮은 기본값 (context dump, **config 필드**)"*
이었다. **config 필드에서는 괜찮지 않다** — `reap update --mark-migrated` 가
`packageVersion()` 을 `lastMigratedVersion` 에 **무조건 기록**하므로, 버전을 못 읽으면
프로젝트 기록이 `0.0.0` 으로 **낮아지고** 이후 모든 migration note 가 다시 뜬다.

**회귀는 아니다** — 내가 지운 사본도 똑같이 폴백했고 `version` 필드가 없으면 `undefined` 를
돌려줘 더 나빴다. 새로운 것은 결함이 아니라 **내가 F1 을 고치며 이 모양에 이름을 붙인 순간
같은 모양이 한 칸 옆에 남아 있음이 보이게 된 것**이다.

처리: 주석을 **정확하게** 고쳤다(두 중간 소비자를 이름으로 지목하고, 하나는 옳고 하나는
guard 가 없다고 적었다). 동작 수정은 **backlog** — 기존 결함이고 내 goal 의 인과 범위 밖이다.

## L3 — `"0.0.0"` 이 모듈을 건너 리터럴로 남아 있다, 그리고 그것은 **두 사실의 철자**다

evaluator 는 리터럴 4곳을 지적하며 상수 공유를 권했다. 확인해보니 **그 넷이 같은 사실이 아니다**:

| 의미 | 위치 |
|---|---|
| 버전을 알 수 없다 | `UNKNOWN_VERSION`, `update.ts:318`, `migration.ts:111` |
| 한 번도 migration 되지 않았다 | `migration.ts:113`, `update.ts:156`, `update.ts:359`, `types:123` |

**둘을 통합하는 것은 틀렸다** — 하나를 바꿔야 할 날 다른 하나가 따라가면 안 된다. longterm 의
*"직전 세대의 처방을 닮은꼴에 재사용하지 마라"* 가 그대로 적용된다.

처리: 첫 번째 의미이면서 **내 이동이 만들어낸** 중복 하나(`update.ts:318` — 이전에는 같은 파일
안의 폴백과 짝이었다)만 상수로 바꿨다. `migration.ts:111` 은 strictEdit 범위 밖이라
backlog 에 넣었고, **두 철자를 구분하라는 경고를 `UNKNOWN_VERSION` 주석과 backlog 양쪽에** 적었다.

## L4 — `reap uninstall` 이 조용히 timeout 을 얻었다, 그리고 **제안된 테스트가 red 를 냈다**

evaluator 는 *"`npmGlobalRoot: () => { throw }` 케이스로 수동 안내 경로를 단언하라"* 고 제안했다.
그 테스트를 그대로 쓰자 **fail** 했다 — `detectInstallKind` 는 provider 의 예외를 **그대로
전파**한다. 기본 provider 는 자기 안에서 `catch` 하므로 **실제 timeout 은 `unknown` 으로 간다**
(evaluator 의 서술은 그 점에서 옳았다). 틀린 것은 **어느 층이 잡는가**였다.

전파가 남으면: `reap uninstall` 은 죽고, `performAutoUpdate` 는 바깥 catch 에서 `"error"` 로
읽는다 — 실제 원인과 다른 이름이다. **hook 경로에 있는 함수로서 옳지 않다.**
호출 지점을 `try/catch` 로 감싸 둘 다 같은 보수적 답(`unknown`)으로 보냈다. 그 red 가
이 수정의 근거다.

A3 의 timeout 설명에 **두 번째 호출자(`reap uninstall`)와 거기서의 결과**를 명시했다.

## L5 — marker 분기의 단언이 약하다

`installedVersion` 기본값 테스트는 `dist/.dev-build` 유무로 갈리는데, marker 가 있는 쪽은
`reason === "dev-build"` 만 본다. 즉 **빌드를 한 개발자 머신에서는 약한 쪽이 돈다.**

처리: 두 분기가 **각각 무엇을 분리하는지** 주석에 정확히 적고(강한 쪽은 marker 가 없는 곳,
즉 CI 에서만 돈다), marker 분기에 `runningVersion()` 이 실제로 `+dev.` 를 만들어냈는지
coherence 단언을 추가했다. *"둘 다 같은 강도로 분리한다"* 는 원래 주석은 **거짓이었다.**

## L6 — 이동 중 근거 주석이 소실됐다

`REAP_PACKAGE` 가 왜 리터럴이어야 하는지, 왜 carrier 표식 대신 unit test 로 고정하는지를
설명하던 주석(gen-073)이 이동하면서 사라지고 한 줄로 줄어 있었다. 검사는 따라왔는데 **이유가
따라오지 않았다.** 복원했다.

## Round 3 재검증

`04-validation.md` 참조 — 이 라운드 기준으로 다시 측정해 다시 썼다.

---

# Round 4 — evaluator round 3 (low) 대응

3차도 **low**, blocker 0. 그런데 세 지적이 전부 **round 3 이 새로 쓴 문장이 틀렸다**는 것이었다 —
이번 세대의 주제가 "주장과 측정의 불일치"인데 그것을 고치는 라운드가 같은 종류를 새로 만들었다.
**코드 동작은 하나도 바꾸지 않았다. 문장만 고쳤다.**

## L1 — 헤더가 이동을 "unchanged" 라고 적었다

`package-info.ts` 헤더: *"…arrive here from `uninstall.ts` (gen-090), **unchanged**."*
`git diff` 로는 셋이 추가됐다 — `npm root -g` 의 timeout, provider catch, `findPackageRoot` 의
깊이 독립성 문단. **파일 자신의 아래쪽 주석이 그 셋을 설명하고 있는데 헤더만 아니라고 했다.**

이것이 **F3 과 같은 모양이고, F3 을 고친 다음 라운드에 같은 파일에서 재발했다.**
"결정 로직은 그대로이고 hook 경로라서 셋이 추가됐다"로 고쳤다.

## L2 — 새 테스트의 docblock 이 덮지 않는 경로를 덮는다고 적었다

*"A timeout surfaces as a throw, so this pins where a throw lands"* — **실제 timeout 은 그 코드에
도달하지 않는다.** 기본 provider 가 자기 안에서 잡아 null 로 만들고, 그 경로는 **이미 있던**
"npm 을 물을 수 없을 때" 테스트가 덮는다. 새 테스트가 덮는 것은 **주입 provider** 경로다.

`03` Round 3 의 L4 절은 이것을 **정확히** 적었는데 **테스트 주석은 그것이 진단한 오해를 그대로
재생산**하고 있었다. artifact 와 테스트가 같은 테스트에 대해 다른 말을 하고 있었던 것이다.
docblock 을 다시 썼다 — 무엇을 덮고 무엇을 안 덮는지, 그리고 catch 를 지우면 이것만 red 가 되고
실제 timeout 은 그대로라는 것까지.

## L3 — 04 의 "게이트가 guard 를 안 탄다" 근거가 로컬 전용이었다

나는 *"tarball 이 `dist/.dev-build` 를 갖고 있어 2단계에서 반환"* 이라고 적었다. **CI 에서는
틀리다** — `scripts/build.sh:60-64` 가 `CI` 설정 시 마커를 안 찍으므로 2단계를 통과하고,
네트워크 질의 후 **4단계(up-to-date)** 에서 반환한다. 결론(guard 미도달)은 양쪽 다 참이지만
**근거가 다르고, publish 를 막는 것은 CI 쪽 실행이다.** 04 에 두 환경을 나눠 적었다.

## L4 — catch 의 근거가 wrap 보다 넓었다

*"주입된 provider 는 삼키지 않을 수 있다"* 는 `readPackageName` 에도 **그대로 적용되는데**
그쪽은 감싸지 않았다. wrap 을 넓히는 대신 **문구를 좁혔다** — 감싼 것은 **shell 을 띄우는
seam 하나**이고, `readPackageName` 은 파일을 읽으며 자기 실패를 잡고, 프로덕션에서는 **어느
쪽도 주입되지 않는다**는 사실을 함께 적었다. 프로덕션 효과가 0 인 변경으로 범위를 넓히는 것보다
말을 정확히 하는 쪽이 맞다.

## L5 — `reap uninstall` 의 `unknown` 문구 (기존 결함)

`"this copy of REAP is a unknown install"` — **미상을 판정으로 말한다.** gen-090 문구이고
`git diff` 로 이번 세대가 건드리지 않았음을 확인했다. strictEdit 범위 밖 → backlog.

## Round 4 이후

코드 동작 변경 없음. typecheck / 전체 스위트 / 두 게이트 재실행 결과는 `04-validation.md`.

## Round 4 — 스스로 하나 더 잡았다

`performAutoUpdate` 의 doc comment 가 **조건 3개**를 나열하고 있었다. 이제 4개다 —
install-kind guard 를 추가하면서 **본문만 고치고 그 위의 목록을 안 고쳤다.** L1/L2 와 같은 종류이며
evaluator 를 기다리는 동안 자기 점검으로 잡았다. 목록을 4개로 고치고, 아래 번호 주석과 같은
순서라는 것을 명시했다.

**이번 세대에서 "코드를 고치고 그것을 서술한 문장을 안 고쳤다" 가 네 번 나왔다** —
F3(파일 헤더), L1(모듈 헤더), L2(테스트 docblock), 그리고 이것(함수 doc). 전부 같은 실패다.

두 개를 더 잡았다 (같은 라운드, 자기 점검):

- `checkAutoUpdateGuard` 의 doc 이 *"this runs on every session"* 이라고 적고 있었다.
  **그 함수는 아예 실행되지 않는다** — 내가 A4 에서 증명한 사실이다. 지금 모양이 "배선된 경우"를
  가정하고 쓰였다는 것까지 함께 적었다.
- `execute()` 안의 *"Auto-update: always attempt"* 주석. `always` 는 참인데 **왜** 그런지가
  빠져 있었다 — `config.autoUpdate` 가 읽히지 않기 때문이다(gen-043). backlog 를 지목해 적었다.

**합계 여섯 번이다** — F3 / L1 / L2 / `performAutoUpdate` doc / `checkAutoUpdateGuard` doc /
`execute` 주석. 코드를 고치면서 그 코드를 서술한 문장을 안 고치는 것이 이 세대의 지배적 실패였고,
**그중 셋은 evaluator 가, 셋은 내가** 잡았다.

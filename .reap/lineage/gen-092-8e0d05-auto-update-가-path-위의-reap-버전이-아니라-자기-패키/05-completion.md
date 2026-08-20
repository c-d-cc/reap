# Completion

> gen-092 — auto-update 가 어느 버전을 읽고 어디에 설치하는가

## Summary

**Goal**: auto-update 가 PATH 위의 reap 이 아니라 **자기 패키지**의 버전을 읽게 하고,
로컬 설치의 postinstall 이 **전역 설치를 바꾸는** 동작을 함께 판단한다.

**결과**: 달성. 소스 7파일(1 신규) / 테스트 3파일(1 신규) / 문서 7파일. **버전 0.17.6 유지**,
push·tag 없음.

### 결함 1 — 어느 버전을 읽는가

`getInstalledVersion()` 이 `execSync("reap --version")` 이었다. **PATH 의 바이너리이지 그 코드가
속한 패키지가 아니다.** 가정이 아니라 이 저장소에서 관측되던 상태였다 — PATH `0.17.5`,
`package.json` `0.17.6`.

`src/core/package-info.ts` 를 **"이 코드가 속한 패키지에 관한 사실"의 단일 소유자**로 신설했다.
버전을 아는 곳이 다섯이었고(넷은 서로의 사본이라고 **주석에 스스로 적어두고** 있었다) 그중
하나는 아예 다른 질문에 답하고 있었다. 다섯이 하나를 import 한다.

넷이 각자 다른 **고정 깊이 목록**을 갖고 있던 이유는 번들이 모든 모듈을 한 파일로 접기 때문이다.
`findPackageRoot` 는 이름으로 올라가므로 **깊이에 의존하지 않는다** — longterm 이 경고한
함정을 구조적으로 회피한다. 번들을 임시 위치로 옮기고 `package.json` 을 `3.2.1` 로 바꿔
**실측**했다(저장소 안에서만 재면 두 상태가 구분되지 않는다).

### 결함 2 — 어디에 설치하는가 (근거는 결함 1 과 독립이다)

7단계가 무조건 `npm install -g` 였다. `npm install -g` 는 **디렉토리가 아니라 머신에** 작용하고,
그것이 자기 자신에 대한 작용이 되는 유일한 경우가 전역 설치다. gen-090 이 `reap uninstall` 을
위해 만든 `detectInstallKind` 를 core 로 옮겨 **`global` 일 때만** 업그레이드한다.
`local`/`npx`/`checkout`/`unknown` 은 건너뛴다.

`unknown` 을 거절하는 것은 **공짜다** — `npm root -g` 를 물을 수 없는 환경은 `npm install -g` 가
성공할 환경도 아니다.

### 결함 3 — 내 수정이 만들어낸 것

버전 판독을 고치자 하한 경고의 처방이 어긋났다(로컬 버전을 재고 전역 명령을 권한다).
`upgradeCommandFor(kind)` 로 분리했다. 다만 **그 문구가 실제로 도달하는 경로는
`performAutoUpdate` 의 blocked 분기 하나**다 — 다른 호출부는 아무도 부르지 않는 함수 안에 있다.

### 두 결함 모두 red 를 먼저 만들었다

- 결함 1: 가짜 `reap` 를 PATH 앞에 놓고 실행 → 수정 전 red.
- 결함 2: seam 만 넣은 상태에서 kind 테스트 → **정확히 4건** red, `global` 은 그대로 pass.
- 문구·F1 수정: 되돌림을 주입해 각각 red 확인 후 복원.

### Evaluator round 4 — `severity: none` (04 가 미해결로 남긴 것의 결말)

`04-validation.md` 는 *"round 4 수정분에 대한 확인 요청을 보냈으나 이 stage 를 닫는 시점까지
응답이 오지 않았다"* 로 닫았고, **응답이 오면 completion 에 반영한다**고 적었다. 왔다.
판정은 **none — 다섯 항목 중 거짓으로 남은 것이 없다.**

무엇을 확인했는지가 중요하다. **L1 은 눈으로가 아니라 기계적으로 검증됐다** —
`git show HEAD:src/cli/commands/uninstall.ts` 와 `src/core/package-info.ts` 를 주석 제거 후
비교해 이동 델타를 전부 열거했다:

| 델타 | 내 헤더 목록에 있었나 |
|---|---|
| `npm root -g` timeout | ✅ |
| provider catch | ✅ |
| `findPackageRoot` 깊이 문단 | ✅ |
| `UninstallDeps` → `InstallKindDeps` (필드 4개 동일, 전자가 후자를 extends) | 타입명 변경 |
| `dirname(fileURLToPath(...))` → `moduleDir()` helper | **동일 표현** |
| `readPackageName` 이 `export` 획득 | 가시성 |

`findPackageRoot` / `sameDirectory` / `readPackageName` **본문은 바이트 동일**. 뒤 셋은
가시성·타입명·추출이라 어떤 결정도 바꾸지 않는다 → **"판정 로직은 바이트 그대로"라는 내 문장이
가정이 아니라 확인된 사실로 기록됐다.**

`sameDirectory` doc 에서 수사적 꼬리절 하나가 이동 중 빠진 것은 **옳은 삭제**로 판정됐다 —
그 문장이 가리키던 명령("this whole command")이 더는 그 파일이 아니기 때문이다.

L2·L3·L4·L5 도 각각 확인됐다. L3 은 **"publish 를 막는 쪽이 CI 실행"이라는 방점이 옳다**는
판정이 함께 왔다.

그리고 한 가지를 evaluator 가 인정했다 — **V8b(번들을 옮기고 `package.json` 을 `3.2.1` 로 바꿔
잰 것)가 자기 측정보다 낫다**: 자기 것은 *"올바른 package.json 을 읽었다"* 와
*"어떤 package.json 을 읽었다"* 를 구분하지 못하는데 V8b 는 구분한다.

**라운드 5는 열지 않았다** — 남은 concern 이 없고 evaluator 스스로 완료 가능이라고 했다.
`state.evaluatorConcerns` 의 high 1건은 **고친 뒤에도 낮추지 않는다**(gen-091 방식):
그것이 이 세대에 실제로 존재했던 결함이고, 라운드별 판정과 근거는 `04` 와 이 절이 갖는다.

## Lessons Learned

### L1. 이 세대의 지배적 실패는 코드가 아니라 **문장**이었다

**코드를 고치고 그 코드를 서술한 바로 옆 문장을 안 고친 것이 여섯 번**이다:
파일 헤더 2(`check-version.ts` 상단, `package-info.ts` 헤더), 함수 doc 2(`performAutoUpdate` 의
조건 목록이 3개인데 본문은 4개를 검사, `checkAutoUpdateGuard` 가 "매 세션 실행"이라 주장하는데
아무도 부르지 않음), 테스트 docblock 1, 인라인 주석 1. **셋은 evaluator 가, 셋은 내가** 잡았다.

**carrier 표식 문제가 아니다** — grep 할 대상도 없고 다른 파일도 아니다. 텍스트가 **바로 거기
있는데** 그래서 넘어간다. 시선은 diff 로 가고 diff 는 바뀐 줄을 보여주지 그 위 문단을 보여주지
않는다. longterm 에 기록했다.

바깥을 향한 같은 규율이 릴리즈 문서였다 — **하지 않는 안내를 약속했고**(evaluator F2),
고치면서 **반대 방향으로 한 번 더** 할 뻔했다("silently" — 하한 미달이면 말을 한다).

### L2. blocker 둘은 **내 수정이 만든 것**이었고, 그중 하나는 침묵을 소음으로 바꿨다

`runningVersion()` 이 못 찾으면 `"0.0.0"` 을 돌려주는데 그것은 **truthy** 다. `|| null` 이 절대
null 이 되지 않았고 `version-unknown` 분기가 죽었다. 결과는 **매 postinstall·매 세션마다
`Breaking change detected: v0.0.0 → v0.17.5`** — 옛 코드는 그 자리에서 조용했다(`execSync` 가
throw → null).

**placeholder 를 도입할 때는 "행동을 결정하는 소비자"를 따로 세어야 한다.** 문자열이 필요한
소비자에게 편한 기본값이 결정하는 소비자에게는 거짓 사실이 된다. `runningVersionOrNull` 이
그 분리다.

### L3. evaluator 가 제안한 테스트가 **red 를 내며 진짜 결함을 찾았다**

*"throwing `npmGlobalRoot` 로 수동 안내 경로를 단언하라"* 를 그대로 쓰자 fail 했다 —
`detectInstallKind` 는 provider 예외를 **전파**한다(기본 provider 는 자기 안에서 잡으므로 실제
timeout 은 `unknown` 으로 간다). **틀린 것은 "어느 층이 잡는가"였고**, 그 red 가 호출부를
감싸는 근거가 됐다. 제안을 그대로 실행한 것이 제안을 검토한 것보다 나은 검증이었다.

### L4. evaluator 의 처방을 그대로 받지 않은 것이 옳았던 자리

`"0.0.0"` 리터럴 4곳을 상수로 통합하라는 제안을 확인해보니 **그 넷이 같은 사실이 아니었다** —
"버전을 모른다" 셋과 "한 번도 migration 되지 않았다" 넷이 **철자를 공유할 뿐**이다. 통합했으면
하나를 바꿔야 할 날 다른 하나가 따라갔을 것이다. 내 이동이 만든 중복 1건만 상수화하고
나머지는 근거와 함께 backlog 로 넘겼다. evaluator 도 재확인 후 이 판단에 동의했다.

### L5. 잘 된 것 — 게이트가 정직해서 이 세대가 존재했다

gen-088 이 게이트 쪽에 남긴 **번들 sha 단언**은 원인이 아니라 **성질**을 검사하므로 이번 수정
이후에도 그대로 회귀 검사로 남는다. "원인을 고치되 성질 검사는 건드리지 않는다"가 맞았다.

## Next Generation Hints

**backlog 를 만들지 않는다 — 아래는 인간이 판단할 후보다.** (이번 세대가 implementation 중에
만든 backlog 5건은 별개이며 이미 파일로 있다.)

1. **`config.autoUpdate` 를 읽는 코드가 없다** (backlog 있음, priority high).
   이번 릴리즈의 주제가 *"당신이 언급한 적 없는 설치를 바꾸지 않는다"* 인데 **끄는 스위치가
   동작하지 않는 절반**이 남아 있다. `reap config` 는 `false` 라고 보여주고 REAP 은 업데이트한다.
   **0.17.6 에 함께 넣을지가 릴리즈 직전 판단**이다.
2. **`--mark-migrated` 가 버전을 못 읽으면 기록을 `0.0.0` 으로 낮춘다** (backlog 있음).
   L2 와 같은 모양이 한 칸 옆에 남아 있는 것이며, 회귀는 아니다.
3. **`checkAutoUpdateGuard` 배선 또는 삭제** (backlog 있음). 지금은 정의만 있고 호출이 없다.
4. **자기진단 게이트의 PATH 줄** (backlog 있음). 그 줄을 빼면 § 2 가 결함 1 의 **살아있는 회귀
   검사**가 되지만, 재현 조건이 "작업 버전 == npm latest && PATH 의 reap != latest" 라
   **0.17.6 발행 후에만 입증 가능**하다.
5. **`reap uninstall` 의 `unknown` 문구** (backlog 있음, low). 미상을 판정으로 말한다.

**릴리즈 절차 관련**: `scripts/check-agent-integration.sh`(층2)는 gen-091 에서 통과했으나
**그 뒤 이 세대가 소스를 바꿨다.** team lead 가 재실행하기로 돼 있다.

## Adapt

### Genome — 변경하지 않았다, 그리고 한 가지는 인간에게 묻는다

embryo 라 자유 수정이 가능하지만 이번 세대의 교훈은 **설계 원칙이 아니라 작업 습관**이다.

다만 경계선상의 판단이 하나 있어 적어둔다. `application.md` 는 이미
*"값을 바꾼 직후 자기 표식을 다시 grep 하라"* (gen-091)를 갖고 있고, L1 은 그 옆에 놓을 수 있는
모양이다 — **표식이 없는 산문도 낡는다**. 그런데 그 절의 주제는 *"여러 곳이 아는 사실"* 이고
L1 은 **한 곳이 아는 사실 + 그것의 서술**이라 주제가 다르다. 그리고 genome 과 longterm 에
같은 교훈을 두는 것은 금지돼 있다.

→ **longterm 에 두었다.** genome 으로 승격할 가치가 있다고 판단되면 인간이 지시할 자리다.
(fitness 피드백이 *"표식으로 못 잡는 종류를 이름 붙인 것이 이 세대의 남는 몫"* 이라고 평가했고,
그 이름은 지금 longterm 에 있다.)

**embryo → normal 전환**: 이번에도 제안하지 않는다. 판단 근거는 midterm 에 있는 그대로 —
REAP 자신이 self-evolving 중이고 예기치 못한 genome 변경 여지가 남아 있다. 다만 **이번 세대는
genome 을 한 줄도 건드리지 않았고 그 전 세대도 그랬다** — 안정 신호가 쌓이고 있다는 것은
기록해 둔다.

### 다음 세대 — gen-093 이 정해져 있다

사용자 결정(2026-08-20): **`config.autoUpdate` 를 읽는 코드가 없는 건을 0.17.6 에 넣되,
이 세대를 다시 열지 않고 gen-093 으로 처리한다.** 확인된 상태:

```
reap config            →  autoUpdate: True         (보여준다)
update.ts:48           →  VALID_CONFIG_FIELDS      (보존한다)
update.ts:66           →  CONFIG_DEFAULTS: true    (심어준다)
check-version.ts:364   →  "config.autoUpdate is never read"  (읽지 않는다)
```

**보여주고 · 보존하고 · 심어주면서 · 읽지 않는다.** 이 릴리즈의 주제가 *"당신이 말하지 않은
설치가 바뀐다"* 인데 그것을 끄는 스위치가 거짓이므로 같이 나가야 한다는 판단이다.
backlog `configautoupdate-를-읽는-코드가-없다-…md` 가 소스다.

**gen-093 이 먼저 볼 자리** (fitness 피드백이 지목했다): **설치된 사본에서 버전을 읽는 상시
검사가 없다.** 이번 세대가 고친 바로 그 값에 회귀 검사가 없다는 뜻이다. 측정은 두 번 했지만
(`03` 의 V8b, evaluator 의 install-layout probe) **둘 다 1회성이고 자산으로 남지 않았다.**
`AutoUpdateDeps` seam 이 이미 있으므로 `autoUpdate` 게이트를 붙일 때 함께 넣기 좋다.

### 릴리즈 순서 (사용자 확정)

gen-092 종료 → **gen-093**(`autoUpdate`) → `scripts/check-agent-integration.sh` 재실행(층2) →
**0.17.6 태그·발행**. 그 뒤 **plugin 배포 전환 리서치** — 사용자 레벨 자산 관리에 6세대가 들었고
plugin 으로 가면 그 코드가 사라지는지가 미확인이라, **manifest 를 먼저 만들지 plugin 을 먼저
할지**를 그 리서치가 정한다. **orchestrating agent 가 수행하며 이 세대의 일이 아니다.**

## Change Proposals

**genome 변경 제안 없음.** 이번 세대의 교훈(L1)은 설계 원칙이 아니라 **작업 습관**이고,
`longterm.md` 가 그것의 집이다. evolution.md 는 이미 "검증 근거의 종류를 구분해 적어라"를
갖고 있으며, L1 은 그것의 문서판이 아니라 **다른 축**이다 — 검증이 아니라 서술의 문제다.

**environment 갱신 (reflect 에서 수행)**:
- `summary.md` — 테스트 baseline `unit 585 → 620`. gen-089 의 세대별 changelog 문단을
  현재형 서술 하나로 접었다.
- `source-map.md` — core `29 → 30 modules`, `package-info.ts` 항목 신설,
  `check-version.ts` / `uninstall.ts` / `semver.ts` 항목 갱신.
  **`check-version.ts` 항목에 있던 *"`getInstalledVersion()` 은 여전히 PATH 를 읽는다
  (backlog pending)"* 서술이 이제 사실이 아니므로 교체했다** — 낡은 서술 제거는 append 가 아니다.

**memory**:
- `shortterm.md` — 전면 교체(이전 gen-087 핸드오프는 모두 처리됨).
- `midterm.md` — 릴리즈 트랙을 0.17.6 기준으로 갱신, 릴리즈 직전 판단 1건 명시.
- `longterm.md` — L1 을 새 항목으로 추가하고, 중복되던 두 항목
  ("결함을 고치는 세대가 그것을 반복한다" / "각 수정의 이웃")을 **하나로 합쳤다**
  (후자가 스스로 전자의 sharper form 이라고 적고 있었다).
  **adapt 에서** 합쳐진 그 항목에 *"두 세대 연속 확인"* 을 한 줄 보강했다 — gen-091 에 이어
  gen-092 도 1라운드 blocker 둘이 자기 수정에서 나왔다. **새 항목을 만들지 않았고 49줄을 유지**한다.

- **adapt 추가분** — `summary.md` 의 Source Structure 절에 한 줄:
  **"우리 버전·패키지 루트·설치 종류를 아는 곳은 `src/core/package-info.ts` 하나다."**
  그 절은 구조 서술을 source-map 에 위임하므로 모듈 목록을 담지 않는다 — 이것은 목록이 아니라
  **새 사본을 만드는 것을 막는 규칙**이라 자동 로드되는 쪽에 있어야 한다. 211줄(한도 250).

**backlog (implementation 중 생성, 5건)**:
`config.autoUpdate` 미사용 / `--mark-migrated` 기록 하향 / `checkAutoUpdateGuard` 무호출 /
자기진단 게이트 PATH 주석 / `reap uninstall` 의 `unknown` 문구.

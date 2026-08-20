# Validation

> gen-093 — `config.autoUpdate` 를 실제로 읽어서 false 인 사용자의 설치가 바뀌지 않게 하고,
> 그 값이 어디서 읽히는지 검사로 고정한다.
>
> 이 stage 에서 **전부 새로 실행**했다. implementation 의 결과를 재사용하지 않았다.

## 실행한 명령과 결과

| # | 명령 | 결과 |
|---|---|---|
| 1 | `npm run typecheck` | ✅ exit 0, 출력 없음 |
| 2 | `npm run build` | ✅ 163 modules, `index.js` 0.63 MB, grammars 15 |
| 3 | `npm run test:unit` | ✅ **627 pass / 0 fail** (49 files, 1609 expect) |
| 4 | `npm run test:e2e` | ✅ **331 pass / 0 fail** (35 files, 1105 expect) |
| 5 | `npm run test:scenario` | ✅ **44 pass / 0 fail** (4 files, 82 expect) |
| 6 | `bash scripts/check-self-diagnosis.sh` | ✅ **전 절 통과** (opencode 1.3.16) |
| 7 | `bash scripts/check-docs-version.sh` | ✅ 전 항목 통과 (로케일 parity 24 entries × 4) |
| 8 | `cd docs && npx vite build` | ✅ built in 2.00s |
| 9 | `bash scripts/list-carriers.sh --orphans` | ✅ 기존 1건만 (`RELEASE_NOTES.md` 산문) |
| 10 | `reap fix --check` | ✅ **0 error / 2 warning** — 기준선의 gen-052 parent 쌍 그대로 |

### 기준선 대비

| | 기준선 | 지금 | 차 |
|---|---|---|---|
| unit | 620 | **627** | +7 (이 세대 신규) |
| e2e | 329 | **331** | +2 (이 세대 신규) |
| scenario | 44 | 44 | 0 |
| `fix --check` | 0 error / 2 warning | 0 error / 2 warning | 0 |

**신규 9개가 전부 이 세대 것이고 기존 테스트는 본문 한 줄도 고치지 않았다** —
`git diff tests/unit/check-version.test.ts` 가 append 블록 + import 2건(`mkdirSync`,
`readAutoUpdateSetting`)만 보여준다.

## 완료 기준 (02-planning.md) — 하나씩

| AC | 내용 | 판정 | 근거 |
|---|---|---|---|
| **AC1** | `autoUpdate: false` + 업그레이드 가능 → `installLatestGlobally` 미호출, `{action:"skipped", reason:"auto-update-disabled"}` | ✅ | **[실행]** unit `check-version — autoUpdate: false stops the install > nothing is installed, and the decision says why`. `installLatestGlobally` 가 throw 하도록 주입돼 있으므로 호출됐다면 red |
| **AC2** | `autoUpdate: false` + floor 미달 → 경고 1줄 + `{action:"blocked"}` | ✅ | **[실행]** 같은 describe 의 `but the hard-floor warning still reaches them`. `autoUpdateEnabled` 가 throw 하도록 주입 — **5단계보다 먼저 물으면 red** |
| **AC3** | seam 미주입 시 임시 디렉토리 3종(false/true/없음)에서 false/true/true | ✅ | **[실행]** unit `the flag is read from the project's config` 3케이스 + 읽기 실패 4종 케이스 |
| **AC4** | 산출물을 `version: "3.2.1"` 인 임시 패키지 루트로 옮겨 실행 → `3.2.1` | ✅ | **[실행]** e2e `the version comes out of the copy that is running` 2케이스 |
| **AC5** | 세 스위트 0 fail, 기준선 이상 | ✅ | **[실행]** 위 표 3~5 |
| **AC6** | `check-docs-version.sh` + `vite build` | ✅ | **[실행]** 위 표 7~8 |
| **AC7** | 네 검사를 **먼저 실패시키고** 어디를 깨뜨렸는지 기록 | ✅ | **[negative]** `03-implementation.md` § Negative 의 N1~N4 |

## FR 대조

| FR | 판정 | 근거 |
|---|---|---|
| FR1 `autoUpdate: false` → `npm install -g` 미실행 | ✅ | AC1 |
| FR2 끄더라도 floor 경고는 출력 | ✅ | AC2 + negative N2 |
| FR3 읽기 실패 4종 모두 켜짐 | ✅ | AC3 |
| FR4 seam 주입 가능 / 미주입 시 실제 config | ✅ | AC3 + negative N3 |
| FR5 `check-version.ts` 의 *"never read"* 주석 재작성 | ✅ | **[실행]** `grep -n "never read" src/cli/commands/check-version.ts` → 0건. 새 문장이 그 자리에 있다 |
| FR6 재배치된 산출물의 버전 상시 검사 | ✅ | AC4 + negative N4 |
| FR7 0.17.6 문서 보강, bump 없음, 0.17.5 이하 무변경 | ✅ | **[실행]** `git diff RELEASE_NOTES.md RELEASE_NOTICE.md docs/` — 추가만, `package.json` 무변경 |

## Negative — 검사가 무력하지 않다는 근거

`03-implementation.md` 에 상세가 있고 여기 요약한다. **전부 이 세대에서 직접 깨뜨려 red 를 봤다.**

| # | 깨뜨린 곳 | red |
|---|---|---|
| N1 | 새 거절 블록 삭제 | unit 2 fail |
| N2 | 거절을 floor(5단계) **앞으로 이동** | unit **1 fail — 그 검사 하나만** |
| N3 | seam default 를 `() => true` 로 | unit 1 fail |
| N4 | `ownPackageRoot` 이 빌드 시점 절대경로 반환 (재빌드) | e2e 2 fail, 기존 1케이스는 초록 |

**N2 가 이 세대에서 가장 값이 나갔다.** 다른 모든 케이스가 초록인 채로 그 하나만 red 가 됐다 —
즉 *"floor 경고가 살아남는다"* 라는 설계 결정을 지키는 검사가 정확히 하나이고 그것이
동작한다는 뜻이다. 그 결정이 없었다면(호출부 게이트를 골랐다면) N1·N3 만 있었을 것이고,
경고를 잃은 것을 아무도 몰랐을 것이다.

각 negative 뒤 원본 복원 → `git diff --stat src/` 가 `check-version.ts` **1파일**만 보고한다. [실행]

## 이 검증이 닿지 않는 것

**"통과"는 검사 범위 안에서만 통과다.** gen-092 가 기록한 한계를 그대로 물려받으며, 이 세대가
줄인 것도 늘린 것도 없다:

1. **실제 `npm install -g` 의 실행과 결과.** seam 이 호출 여부만 기록한다.
2. **실제 `npm view` 네트워크 응답.**
3. **실제 npm postinstall 환경에서의 auto-update.** 자기진단 게이트가 진짜 tarball 을 격리
   prefix 에 `npm i -g` 하므로 postinstall 이 실제로 돌지만, **로컬 pack 된 tarball 은
   `dist/.dev-build` 를 갖고 있어 `performAutoUpdate` 가 2단계에서 반환한다.**
   **게이트는 6단계(이 세대가 추가한 것)를 한 번도 실행하지 않는다** — 즉 § 6 이 통과했다는
   사실은 이 세대의 변경에 대해 아무것도 말하지 않는다. `autoUpdate` 판정은 **unit 으로만**
   덮인다.
4. **SessionStart hook 의 실제 발화.**
5. **`autoUpdate: false` 인 실제 사용자의 실제 세션.**
6. **Windows.**
7. e2e(AC4)가 증명하는 것은 *산출물이 자기 위치에서 런타임에 읽는다* 이지 *`npm i -g` 로 설치된
   레이아웃에서 그렇다* 가 아니다.
8. **기존 unit 케이스들이 `/tmp` 에 REAP 프로젝트가 없다는 것에 새로 의존하게 됐다.**
   병적인 조건이라 손대지 않았으나 검사되지 않는 가정이다.
9. **`autoUpdate: false` 는 cwd 가 정확히 프로젝트 루트일 때만 존중된다.** `execute()` 가
   `process.cwd()` 를 그대로 넘기고 `readAutoUpdateSetting` 은 **상위로 올라가며 프로젝트
   루트를 찾지 않는다.** 하위 디렉토리에서 세션을 시작하면 config 를 못 찾고 fail open 된다.
   `src/` 전체에 `findProjectRoot` 류 헬퍼가 없어 파일의 기존 관례와 일치하며 이 세대가
   만든 것이 아니지만, **검사되지 않는 조건이므로 여기 적는다.** (evaluator Concern 3)
10. **`autoUpdate: false` 는 npm postinstall 경로에는 원리상 도달하지 않는다.** postinstall 의
    cwd 는 패키지 디렉토리이고 거기엔 프로젝트 config 가 없다 — 그것이 fail open 을 고른
    *근거*인데, 그 근거를 뒤집으면 **`npm i -g @c-d-cc/reap@0.17.0` 으로 일부러 낮은 버전을
    고정한 사용자는 `autoUpdate: false` 를 둬도 그 설치의 postinstall 이 최신으로
    갈아치운다**는 문장이 된다. 이 세대가 만든 회귀는 아니고(gen-043 부터의 동작), 프로젝트
    설정으로는 닿을 수 없는 자리이며(사용자 레벨 설정이나 env 가 있어야 한다), **되풀이되는
    SessionStart 경로는 닫혔다.** 그래도 릴리즈 문구가 *"이제 실제로 끕니다"* 라고 말하므로
    적어둔다. (evaluator fitness 관찰 C — 그가 실제로 성립함을 확인했다)

## 작업 트리에 있던 제 것이 아닌 변경 — 해소됨

`.reap/vision/design/plugin-distribution.md` 가 implementation 종료 시점에 **+151 / -194** 로
수정돼 있었다. 이 세대가 건드리지 않았고 strictEdit 목록에도 없어 team lead 에게 보고했다
(`completion --phase commit` 이 `gitCommitAll` → **`git add -A`** 이므로 이 세대 커밋에 함께
실릴 상황이었다).

**validation 중에 해소됐다** — `git status --short` 에 더 이상 나타나지 않는다. 다른 agent 가
커밋했거나 되돌렸다. 이 세대는 그 파일에 손대지 않았다. [실행] `git diff --stat
.reap/vision/design/plugin-distribution.md` → 빈 출력. (evaluator Concern 2 가 같은 것을
독립적으로 관측했다.)

## Evaluator

`evaluator: true`. `reap-evaluate` 를 독립 검토자로 실행했다 (1라운드). **권고:
escalate with judgment** — 구현·검사는 통과 권고, 다만 주석 한 문장을 커밋 전 정정할 것.

### evaluator 가 독립적으로 재현한 것

typecheck / build / 세 스위트를 **직접 다시 돌려** unit 627 / e2e 331 / scenario 44, 0 fail 을
재현했고, 문서 게이트·vite build·carrier orphan 도 동일 결과를 얻었다.

그리고 **N1·N2·N3 를 직접 깨뜨려 red 를 재도출**했다 — 내 기록과 fail 개수·fail 한 테스트
이름까지 일치. N4 는 재빌드 비용 때문에 재도출하지 않고 기록의 정합성만 확인했다.
복원은 md5 일치 + `git diff --stat` 으로 확인했다고 보고했다.

지목했던 세 확인 요청에 대한 답:
1. **자기진단 게이트 § 6 이 새 단계를 건드리지 않는다** — 맞다. `npm pack --dry-run` 이
   `dist/.dev-build`(8B)를 tarball 목록에 포함하므로 step 2 에서 반환한다.
2. **다른 테스트·스크립트의 숨은 의존** — 없다. `/tmp` 를 root 로 넘기는 것은
   `tests/unit/check-version.test.ts` 8곳뿐이고, e2e 의 `cliExitCode("/tmp", "check-version")`
   은 exit 0 만 단언하므로 판정과 무관하다.
3. **`execute()` doc 의 새 문장** — **거짓.** 아래.

### Concern 1 (중간 impact) — 받아들이고 고쳤다

내가 `execute()` doc comment 에 쓴 문장:

> Who still never hears it is whoever step 4 returns for — an installation that is already current.

**두 방향으로 틀렸다. 직접 확인했다:**

- `performAutoUpdate` step 2 는 `installed.includes("+dev") || installed.includes("-alpha")`
  (`check-version.ts:253`), `checkAutoUpdateGuard` 는 `!installed || installed.includes("+dev")`
  (`:392`) — **`-alpha` 를 거르지 않는다.** 즉 하한 미달 alpha 빌드가 standalone guard 가
  **유일하게 봉사할 수 있는** 인구인데 내 문장이 정확히 그것을 제외했다. [실행]
  `grep -n 'includes("+dev")\|includes("-alpha")' src/cli/commands/check-version.ts`
- step 4 의 인구는 후보가 아니다. `scripts/check-version-floors.sh` 가 floor 가 **발행된
  버전을 지목하는지** 게이트하므로(`E404` → FAIL) floor ≤ latest 이고, step 4 는
  `installed >= latest` 일 때 반환하므로 `installed >= floor` — step 5 는 애초에 발화하지
  않는다. **못 듣는 인구가 아니라 들을 것이 없는 인구다.** [실행]
  `grep -n "E404" scripts/check-version-floors.sh`

**왜 blocking 인가**: 이 문장은 `checkautoupdateguard-…` backlog 를 소비할 세대가 **재사용하라고
쓴 근거**다. 그대로 두면 "미수신 인구는 아무것도 필요 없는 사람뿐 → 지우면 된다"로 이어지는데
증거는 정반대를 가리킨다. longterm 의 *"근거는 재사용되기 때문에, 검토되지 않은 근거에 기댄
결론이 위험한 종류다"* 와 *"자기 수정의 옆이 다음 결함이 사는 곳"* 이 정확히 이 자리이고,
**세 세대 연속으로 그 모양이 나왔다.**

**조치**: 문장을 사실에 맞게 재작성. `-alpha` 가 유일하게 의미 있는 후보이고 step 4 는
후보가 아니라는 근거를 함께 적었다. `npm run typecheck` + `npm run build` +
`npx bun test --isolate tests/unit/check-version.test.ts` (37 pass / 0 fail) 재실행. [실행]
코드·테스트·문서 변경 없음 — 주석만.

### Concern 2 (낮음) — 받아들였다

`plugin-distribution.md` 는 이제 clean 하다. 위 § 로 갱신했다.

### Concern 3 (낮음) — 받아들였다

`readAutoUpdateSetting` 이 cwd 에서 위로 올라가지 않는다 → `autoUpdate: false` 는 cwd 가
프로젝트 루트일 때만 존중된다. 이 세대가 만든 것은 아니고(`src/` 에 `findProjectRoot` 류가
없다) 코드 변경은 scope 밖이지만, **검사되지 않는 조건**이므로 § "닿지 않는 것" 9번으로
추가했다.

### 사소한 지적 (조치 안 함)

`performAutoUpdate` doc 은 조건을 5개로 나열하고 인라인 주석은 1~9 로 번호를 매긴다.
**변경 전에도 4 vs 8 이었으므로 이 세대가 만든 어긋남이 아니다** — doc 은 "업그레이드의
조건"을, 인라인은 "실행 순서의 단계"를 세며 후자에는 조건이 아닌 단계(설치·hand-off)가
포함된다. 그대로 둔다.

### Sycophancy 점검

evaluator 가 `04-validation.md` 에 red flag 없음으로 보고했다. *"N2 가 가장 값이 나갔다"* 는
자평이 유일한 후보였고 evaluator 가 **독립 재현으로 사실 확인**했다.

## Verdict

### **pass**

근거:

- AC1~AC7, FR1~FR7 **전부 충족**, 각 항목에 `[실행]`/`[negative]` 근거가 붙어 있고 명령을
  지목할 수 있다.
- 세 스위트 0 fail, 기준선 대비 +9 (전부 이 세대 신규), 기존 테스트 본문 무변경.
- 자기진단 게이트·문서 게이트·carrier orphan·`fix --check` 전부 기준선 유지.
- negative 4종 전부 먼저 red 를 봤고, 그중 3종을 **evaluator 가 독립 재현**했다.
- evaluator 의 유일한 중간-impact concern 은 **주석 한 문장**이었고 이 stage 안에서
  정정했다 (minor fix — 5분 내, 설계 변경 없음). 런타임 동작에 영향 없음.

**partial 로 내리지 않은 이유**: Concern 1 은 코드가 아니라 서술이었고, 여기서 고쳤으며,
고친 뒤 typecheck·build·해당 unit 파일을 다시 돌렸다. 남은 concern 2건은 낮은 등급이고 둘 다
artifact 갱신으로 닫혔다 — 미완 작업이 없다.

**하지만 "통과"는 § "이 검증이 닿지 않는 것" 9항목 밖으로 나가지 않는다.** 특히 이 세대가
추가한 6단계는 **unit 으로만 덮이며 자기진단 게이트가 한 번도 실행하지 않는다.**

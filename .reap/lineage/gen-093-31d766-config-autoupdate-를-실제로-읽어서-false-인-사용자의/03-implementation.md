# Implementation

> gen-093 — `config.autoUpdate` 를 실제로 읽어서 false 인 사용자의 설치가 바뀌지 않게 하고,
> 그 값이 어디서 읽히는지 검사로 고정한다.

## Completed Tasks

| Task | 내용 | 파일 | 상태 |
|---|---|---|---|
| T001 | `AutoUpdateDeps` 에 `autoUpdateEnabled?: (root: string) => boolean` seam 추가 | `src/cli/commands/check-version.ts` | ✅ |
| T002 | `readAutoUpdateSetting(root): boolean` — 동기, fail open | 〃 | ✅ |
| T003 | `performAutoUpdate` 6단계 신설 (floor 경고 뒤 / 전역 설치 검사 앞), 이후 단계 번호 갱신 | 〃 | ✅ |
| T004 | `performAutoUpdate` doc comment 조건 목록 4개 → 5개 | 〃 | ✅ |
| T005 | `execute()` 의 *"never read"* 주석 재작성 + doc comment 갱신 | 〃 | ✅ |
| T006 | unit — 거절 / **경고 생존** / 켠 프로젝트 무영향 (3케이스) | `tests/unit/check-version.test.ts` | ✅ |
| T007 | unit — seam default 가 실제 config 를 읽는다 (4케이스) | 〃 | ✅ |
| T008 | e2e — 재배치된 산출물이 자기 `package.json` 버전을 보고 (2케이스) | `tests/e2e/check-version.test.ts` | ✅ |
| T009 | `npm run build` + `npm run typecheck` | — | ✅ |
| T010 | negative — 검사 4종을 먼저 실패시킴 | — | ✅ (아래 표) |
| T011 | 세 스위트 | — | ✅ unit 627 / e2e 331 / scenario 44, 0 fail |
| T012 | 릴리즈 문서 0.17.6 **기존 항목 보강** (NOTES / NOTICE en·ko / 5 로케일) | 7개 파일 | ✅ |
| T013 | `check-docs-version.sh` + `vite build` | — | ✅ 전 항목 통과 |
| T014 | 새 고아 표식 없음 | — | ✅ 기존 1건만 |

## 무엇을 바꿨는가

### 1. `readAutoUpdateSetting(root)` — 판정의 소유자

```ts
export function readAutoUpdateSetting(root: string): boolean {
  try {
    const configPath = join(root, ".reap", "config.yml");
    const config = YAML.parse(readFileSync(configPath, "utf-8")) as { autoUpdate?: unknown };
    return config?.autoUpdate === false ? false : true;
  } catch {
    return true;
  }
}
```

**`=== false` 하나가 fail-open 전체를 표현한다.** 파일 없음·YAML 깨짐은 throw → catch → `true`,
필드 없음·비-boolean 은 `=== false` 불일치 → `true`. 별도 분기가 없다는 것이 이 함수의 요점이다.

`existsSync` 를 쓰지 않았다 — `readFileSync` 가 이미 던지고, 확인 후 읽기는 같은 결과를 두 번의
syscall 로 얻는다 (`core/dump-state-sync.ts` 는 "REAP 프로젝트인가"를 **먼저 판정**해야 해서
`existsSync` 가 필요하지만, 여기는 그 판정 자체가 결과에 흡수된다).

### 2. `performAutoUpdate` 의 새 6단계

```
1 버전 불명   2 dev/alpha   3 네트워크   4 최신
5 floor 미달 → blocked + 경고          ← 메시지. 살아남는다
6 autoUpdate: false → skipped (조용)   ← 신설
7 전역 설치 아님 → skipped (조용)
8 설치   9 hand-off
```

**5와 6의 순서가 이 세대의 실질적 설계 결정 전부**이고, 그것이 test 하나로 고정돼 있다
(아래 negative N2). 주석에 이유를 적었다 — 호출부 게이트를 고르면 5단계에 도달하지 못하고,
경고만 살리려면 floor 판정이 두 곳에 생기며, **그 모양의 함수가 이미 같은 파일에 죽은 채로
있다** (`checkAutoUpdateGuard`).

### 3. 주석 — 여섯 문장을 뒤에 남기지 않는다 (gen-092 의 진단)

바꾼 동작마다 그것을 서술하는 문장을 같은 편집에서 고쳤다:

| 위치 | 이전 | 이후 |
|---|---|---|
| `performAutoUpdate` doc | 조건 4개, *"(4) arrived in gen-092"* | 조건 5개, *"(5) gen-092, (4) gen-093"* |
| step 7 주석 | *"Step 6 is what makes that true"* (hand-off) | *"Step 7 …"* — 번호 이동 반영 |
| `execute()` doc | *"skips dev builds, non-global installs, and network failures"* | + *"and projects that set `autoUpdate: false`"* |
| `execute()` 호출부 | ***"Attempted unconditionally — `config.autoUpdate` is never read"*** | 왜 판정이 함수 안에 있는지 + gen-043→gen-093 경위 |
| `execute()` doc 의 `checkAutoUpdateGuard` 절 | *"nobody sees the standalone warning"* | + 이 세대가 바꾼 입력 하나 (아래) |

## Discovered Tasks

없음. 계획대로 진행됐다.

다만 **인접 backlog 에 재료 하나를 더했고 그것을 코드 주석에 남겼다** (backlog 자체는 건드리지
않았다 — team lead 지시):

`checkautoupdateguard-…` backlog 의 판단 기준은 *"auto-update 가 일어나지 않는 사용자에게 하한
경고를 보여줄 필요가 있는가"* 다. 이 세대가 **"auto-update 를 끈 사용자"** 라는 새 사례를
만들었고, 6단계를 5단계 뒤에 둠으로써 **그 사람들은 경고를 계속 받는다.** 따라서 그 backlog 가
겨냥하는 미수신 인구는 이제 **4단계가 반환하는 사람 — 이미 최신인 설치 — 하나로 좁혀졌다.**
`execute()` doc comment 에 그 문장을 적었다. 판단은 그 backlog 를 소비하는 세대의 몫이다.

**정정 (validation, evaluator Concern 1)**: 처음 적은 문장은 미수신 인구를 *"step 4 가
반환하는 사람 — 이미 최신인 설치"* 로 지목했는데 **틀렸다.** (a) step 4 의 인구는 floor 위에
있으므로 들을 것이 없고(floor 는 발행된 버전을 지목하도록 `check-version-floors.sh` 가
게이트한다), (b) standalone guard 가 유일하게 봉사할 수 있는 인구는 **step 2 의 `-alpha`
빌드**다 — `performAutoUpdate` 는 `+dev`·`-alpha` 를 둘 다 거르지만 `checkAutoUpdateGuard` 는
`+dev` 만 거른다. validation 에서 사실에 맞게 재작성했다. 상세는 `04-validation.md`.

## Verification

근거 종류 표기: `[실행]` = 이 세대에서 그 명령을 직접 돌렸다(명령을 지목할 수 있다) /
`[negative]` = 일부러 깨뜨려 red 를 확인했다 / `[독해]` = 코드를 읽고 판단했다.

| # | 항목 | 근거 |
|---|---|---|
| V1 | `autoUpdate: false` → 설치 미실행, `reason: "auto-update-disabled"`, 출력 없음 | **[실행]** `npx bun test --isolate tests/unit/check-version.test.ts` |
| V2 | **`autoUpdate: false` 여도 floor 경고는 출력된다** | **[실행]** 동일 명령. 그리고 **[negative]** N2 |
| V3 | 켠 프로젝트는 무영향 (`upgraded` + npm 1회 호출) | **[실행]** 동일 명령 |
| V4 | seam 미주입 시 실제 `config.yml` 을 읽는다 (false / true / 파일없음) | **[실행]** 동일 명령 |
| V5 | 읽기 실패 4종(필드없음·YAML깨짐·비boolean·경로없음)이 모두 `true`, 그리고 `false` 하나는 `false` | **[실행]** 동일 명령 — 마지막 단언이 "reader 가 항상 true 를 반환해서 초록"인 경우를 배제한다 |
| V6 | 재배치된 빌드 산출물이 자기 `package.json` 버전을 보고 (`3.2.1`) | **[실행]** `npx bun test tests/e2e/check-version.test.ts` |
| V7 | 그 버전이 **우리가 쓴 파일에서** 왔다 (`4.0.0` → `5.6.7` 로 바꾸면 답도 바뀐다) | **[실행]** 동일 명령 |
| V8 | 기존 테스트 **본문 무변경**으로 통과 (import 2줄만 추가) | **[실행]** `git diff tests/unit/check-version.test.ts` → 추가 블록 + import 2건뿐 |
| V9 | 타입 | **[실행]** `npm run typecheck` |
| V10 | 세 스위트 | **[실행]** `npm run test:unit` 627 / `test:e2e` 331 / `test:scenario` 44, 전부 0 fail |
| V11 | 릴리즈 문서 정합 + 로케일 parity | **[실행]** `bash scripts/check-docs-version.sh` 전 항목 + `cd docs && npx vite build` |
| V12 | 새 고아 표식 없음 | **[실행]** `bash scripts/list-carriers.sh --orphans` → 기존 1건(`RELEASE_NOTES.md` 산문, 별도 backlog)만 |
| V13 | `reap update` / 사용자 직접 `npm i -g` 는 이 플래그와 무관 | **[실행]** `grep -rn "performAutoUpdate" src` → 정의 1 + 호출 1, 둘 다 `check-version.ts` |
| V14 | negative 편집이 전부 복원됐다 | **[실행]** `git diff --stat src/` → `check-version.ts` 1파일만 |

### Negative — 각 검사를 먼저 실패시킨 자리

| # | 어디를 깨뜨렸나 | 결과 |
|---|---|---|
| **N1** | `performAutoUpdate` 에서 `if (!isEnabled(root))` 블록 **삭제** | unit **2 fail** — `auto-update-disabled` 를 기대한 두 케이스가 `not-global: unknown install` 을 받음 |
| **N2** | 같은 블록을 **5단계(floor) 앞으로 이동** | unit **1 fail** — *"but the hard-floor warning still reaches them"* 만 red (`blocked` 기대 → `skipped`). **다른 케이스는 전부 초록** — 즉 이 red 하나가 "5·6 순서"라는 결정 전체를 지키는 유일한 검사다 |
| **N3** | `deps.autoUpdateEnabled ?? readAutoUpdateSetting` → `?? (() => true)` | unit **1 fail** — seam default 케이스만 red. 주입하는 케이스들은 초록이므로 default 를 실제로 재고 있다 |
| **N4** | `ownPackageRoot` 이 `deps.moduleDir` 없을 때 저장소 절대경로를 **반환**하도록(빌드 시점에 박힌 경로 재현), 재빌드 | e2e **2 fail** — 새 두 케이스가 red, 기존 `check-version exits 0` 은 초록. 저장소 안에서만 재면 잡히지 않는 결함임을 그대로 보여준다 |

각 negative 뒤 원본 복원 → V14 로 확인.

### 검사가 잡지 못하는 것

gen-092 가 기록한 한계를 그대로 물려받는다. 이 세대가 줄인 것도 늘린 것도 없다:

- **실제 `npm install -g` 의 실행과 결과.** seam 이 호출 여부만 기록한다.
- **실제 `npm view` 네트워크 응답.**
- **실제 npm postinstall 환경.** 자기진단 게이트가 진짜 tarball 을 격리 prefix 에 설치해
  postinstall 을 돌리지만, 로컬 pack 된 tarball 은 `dist/.dev-build` 를 갖고 있어
  `performAutoUpdate` 가 **2단계에서 반환한다** — 게이트는 6단계를 한 번도 실행하지 않는다.
  **따라서 `autoUpdate` 판정은 unit 으로만 덮인다.**
- **SessionStart hook 의 실제 발화.**
- **`autoUpdate: false` 인 실제 사용자의 실제 세션.** unit 이 결정을 고정할 뿐이다.
- **Windows.**
- **`autoUpdate: false` 는 cwd 가 프로젝트 루트일 때만 존중된다** — `readAutoUpdateSetting` 이
  위로 올라가며 루트를 찾지 않는다. `src/` 에 `findProjectRoot` 류 헬퍼가 없어 파일의 기존
  관례와 일치하지만 검사되지 않는 조건이다 (validation 의 evaluator Concern 3).
- **npm postinstall 경로에는 이 플래그가 원리상 도달하지 않는다** — cwd 가 패키지
  디렉토리라 프로젝트 config 가 없다. fail open 의 근거이자 그 대가다. 상세는 `04` 의 10번.
- e2e(V6/V7)가 증명하는 것은 *산출물이 자기 위치에서 런타임에 읽는다* 이지 *`npm i -g` 로
  설치된 레이아웃에서 그렇다* 가 아니다. 후자는 자기진단 게이트가 간접적으로만 건드린다.

## Notes

- **기존 unit 케이스들이 `root: "/tmp"` 로 `performAutoUpdate` 를 부른다.** 새 6단계가
  `/tmp/.reap/config.yml` 을 찾고 없으므로 fail open → 통과한다. 계획에서 예측했고 실측으로
  확인했다(본문 무변경 통과, V8). **부작용**: 그 케이스들은 이제 `/tmp` 에 REAP 프로젝트가
  없다는 것에 의존한다. 병적인 조건이라 손대지 않았지만 적어둔다.
- 새 unit describe 는 자기 임시 디렉토리(`mkdtemp`)를 쓰고 `afterAll` 로 지운다 — `/tmp` 를
  직접 오염시키지 않는다.
- e2e 두 케이스는 **HOME + XDG_CONFIG_HOME 두 축**을 모두 격리한다. CLI 가 `program.parse()`
  **앞에서** 사용자 레벨 자산을 동기화하므로 `--version` 조차 쓰기를 한다 (shortterm 이 경고한
  그대로). 하나만 격리하면 개발자의 실제 `~/.config/opencode/` 로 샌다.
- e2e 추가분은 353ms — `dist/` 복사 2회 + node 기동 3회. 스위트 전체 70s 대비 무시할 수준.
- `readAutoUpdateSetting` 을 `core` 로 올리지 않았다. 근거는 `02-planning.md` 의 Additional
  Findings — `dump-state-sync` 는 config 전체를 **표시용**으로 읽고 부분 실패를 허용하지만
  여기는 boolean 하나를 **머신을 바꿀지 말지의 결정**으로 쓴다. 닮은꼴이지 같은 것이 아니다.
- carrier 표식을 달지 않았다. 공유되는 것은 값이 아니라 판정이고, 키 이름(`autoUpdate`)은
  `types/index.ts` 가 타입으로 이미 소유한다.

# 03 Implementation — gen-094-61a545

**Goal**: daemon 서술을 사용자 대면 문서에서 전부 제거한다 — 폐기된 기능의 설치 안내와 회고가 남아 있다

## 완료 Task

- [x] **T001** `tests/unit/shipped-docs-no-daemon.test.ts` 정책 강화 — guide 에 daemon blanket ban
- [x] **T002** 두 `reap-guide.md` 사본 byte-identity 검사 신설
- [x] **T003** `src/templates/reap-guide.md` — daemon 5건 제거
- [x] **T004** `.reap/reap-guide.md` 동기화
- [x] **T005** `RELEASE_NOTES.md` — `## Daemon Setup` 절 삭제 + 3개 절 재작성
- [x] **T006** `RELEASE_NOTICE.md` — v0.17.6·v0.17.5·v0.17.0 en/ko 6개 본문
- [x] **T007** README 5개
- [x] **T008** 로케일 5개 — `retired*` 20키 삭제 + `uninstallNote` + changelog 3항목
- [x] **T009** `DaemonPage.tsx` — 회고 절 제거, 라우트 유지
- [x] **T010** `uninstall.ts` / `update.ts` 사용자 출력 문자열
- [x] **T011** `tests/e2e/update.test.ts` — 공허해질 assertion 수정
- [x] **T012** 전수 확인
- [x] **T013** 세 스위트 + 게이트 전체
- [x] **T014** backlog 2건

## 검사를 먼저 만들고, 먼저 실패시켰다

genome: *"검사를 만들 때 — 먼저 실패시켜라"*. T001·T002 를 T003 앞에 둔 이유다.

**T001 negative** [negative] — 수정 전 상태에서:

```
$ bun test --isolate tests/unit/shipped-docs-no-daemon.test.ts
(fail) the guide does not mention the daemon at all
  + [ "392: - `reap uninstall [--confirm]` — ...",
  +   "470: `impact` walks file-to-file imports. Two analyses the retired daemon also carried...",
  +   "472: ### There used to be a daemon",
  +   "474: Through v0.17.5 this was a separate package, `@c-d-cc/reap-daemon`...",
  +   "479: npm uninstall -g @c-d-cc/reap-daemon" ]
 5 pass / 1 fail
```

**T002 negative** [negative] — T003 직후, T004 이전(두 사본이 의도적으로 어긋난 순간):

```
(fail) the project's own copy of the guide matches the shipped one
 5 pass / 1 fail
```

이 한 순간이 자연스러운 negative 창이었다. T004(`cp`) 후 6 pass / 0 fail.

### 기존 검사의 정책이 사용자 지시와 충돌해 있었다

`shipped-docs-no-daemon.test.ts` 는 guide 의 daemon **회고를 명시적으로 허용**하고 그 완화를 주석으로 길게 정당화하고 있었다 — "The guide may — and should — say the daemon existed... a blanket ban on `17224` would go red on correct text". 사용자가 그 전제를 무른 이상 완화의 근거가 사라졌다. 주석도 함께 바꿨다 — 남겨두면 다음 사람이 "회고는 허용"으로 읽는다.

**완화가 구멍까지 낳고 있었다**: 금지 패턴이 `npm (i|install) -g @c-d-cc/reap-daemon` 이라 guide 가 실제로 갖고 있던 `npm **uninstall** -g @c-d-cc/reap-daemon` (`:479`) 을 **잡지 못했다.** 실행 가능한 명령인데 통과하고 있었다.

### grep 한 축으로는 완결성을 판정할 수 없다

`ja.ts` 의 `retiredTitle` 은 `かつてはデーモンがありました` — 가타카나라 `grep -i daemon` 에 잡히지 않는다. 검사와 최종 확인 모두 4개 철자를 본다:

```ts
const DAEMON_SPELLINGS = [/daemon/i, /デーモン/, /데몬/, /17224/];
```

포트 번호가 들어간 이유: 이름을 대지 않고도 그것을 서술할 수 있다.

## 변경 상세

### reap-guide ×2 (T003·T004)

- `:392` `reap uninstall` 설명 — `(allowlisted, including what the retired daemon left)` → `(allowlisted)`
- `:470` `Two analyses the retired daemon also carried` → `Two further analyses are deliberately absent`
- `:472~482` `### There used to be a daemon` 절 **전체 삭제** (11줄)
- `.reap/reap-guide.md` 는 `cp` 로 동기화

**가장 시급했던 이유**: `~/.reap/` 에 설치되고 `CLAUDE.md` 가 `@` import 하므로 매 세션 컨텍스트에 들어간다. 폐기된 기능의 회고 5건이 매 세션 토큰을 쓰고 있었다.

### RELEASE_NOTES.md (T005)

- **`## Daemon Setup` 절 통째 삭제** — 결함이었다. `daemon: true` 설정과 `reap daemon start` / `reap daemon status` 를 지시하는데 **그 명령은 존재하지 않는다**
- What's New: 도입문 재작성, `reap index replaces the daemon` → `reap index`, `~0.3s against the daemon's 6.7s` → `~0.3s`, `If you used the daemon` 항목 삭제, 마무리 문단 재작성
- `## v0.17.5`: 도입문 + daemon 3항목 삭제. **항목이 비지 않는다** — `reap run push` · `reap help` · npm 12 대응이 남는다. (삭제 과정에서 중복이 생겨 하나를 제거)
- `## v0.17.0`: daemon 항목 삭제, evaluator 항목 유지

### RELEASE_NOTICE.md (T006)

v0.17.6 en/ko 는 daemon 문장만 교체. v0.17.5·v0.17.0 en/ko 4개는 daemon 부분을 잘라내고 나머지를 유지.

### README ×5 (T007)

한 묶음으로 처리했다. 각 파일이 정확히 2곳:
- `Replacing the daemon (removed in v0.17.6)` 문단 **삭제**
- uninstall 설명에서 `~/.reap/daemon/ (폐기된 daemon 이 남긴 것)` 과 `@c-d-cc/reap-daemon` 열거 제거

`git diff --stat` 이 5개 파일 모두 `4 +---` 로 **동일** — 대칭 확인 [실행].

**패키지 열거를 뺀 판단**: 코드(`npmRemovalTargets()`)는 여전히 두 패키지를 무조건 npm 에 넘긴다(그 사용자를 남겨두지 않기 위해서다 — 기능이므로 건드리지 않았다). README 가 `@c-d-cc/reap-daemon` 을 이름으로 열거하지 않고 "REAP 의 npm 패키지"라고 쓰면, **문서가 틀리지 않으면서 daemon 을 지목하지 않는다.**

### 로케일 ×5 (T008)

`retired*` 4키 × 5 로케일 = **20키 삭제**. 스크립트가 파일당 정확히 4개를 지웠는지 `assert` 로 검증했다 — 세지 않고 지우면 ja 처럼 값이 번역된 곳을 놓친다.

`uninstallNote` 5개 + changelog 3항목(v0.17.6/v0.17.5/v0.17.0) × 5 = 15개 재작성.

**유지한 것**: `nav.items.daemon` 키(라벨은 `"Code Intelligence"`), `daemonPage` 키, `// route stays /docs/daemon` 주석. 전부 식별자·경로이며 렌더링되지 않는다. gen-090 이 `/docs/daemon` 라우트를 의도적으로 살려 기존 링크가 404 나지 않게 했고, 그 결정을 유지한다.

### DaemonPage.tsx (T009)

`retired*` 렌더링 4줄 삭제 + 파일 상단 주석 재작성. `CodeBlock` import 는 다른 3곳이 여전히 쓴다 — 확인함. 라우트·페이지 유지.

### CLI 출력 (T010)

- `uninstall.ts:100` — `"~/.reap/reap-guide.md, ~/.reap/.install-stamp, ~/.reap/daemon/ (data the retired daemon left)"` → `"~/.reap/: reap-guide.md, .install-stamp, daemon/ — an allowlist, not the whole directory"`
- `update.ts:289` — `removed retired daemon data:` → `removed leftover index data:`

경로 `~/.reap/daemon/` 은 유지했다 — 실제 삭제 대상이라 이름을 바꿀 수 없다. 제거한 것은 옆의 회고 문구다.

### 공허해질 뻔한 assertion (T011)

`tests/e2e/update.test.ts` 의 "no leftovers reports no removal" 이 `not.toContain("retired daemon")` 이었다. T010 이 그 문구를 코드에서 없앴으므로 **무엇을 해도 통과하는 검사**가 된다.

두 test 를 같은 문구의 거울로 만들었다:
- 디렉토리를 심은 경우 → `toContain("removed leftover index data")`
- 심지 않은 경우 → `not.toContain("removed leftover index data")`

둘 다 green 이라는 것이 그 문구가 조건에 따라 나오고 안 나옴을 증명한다 — 부재 assertion 이 스스로를 증명하는 형태다. 주석에 왜 문구를 바꿔야 했는지 남겼다.

## 검증

| 항목 | 근거 | 결과 |
|---|---|---|
| 새 검사가 수정 전 fail | `bun test --isolate tests/unit/shipped-docs-no-daemon.test.ts` | [negative] 1 fail, offender 5줄 출력 |
| guide 동기화 검사가 어긋남을 잡음 | 같은 명령, T003↔T004 사이 | [negative] 1 fail |
| unit | `npm run test:unit` | **629 pass / 0 fail** (627 → +2) |
| e2e | `npm run test:e2e` | **331 pass / 0 fail** (변동 없음) |
| scenario | `npm run test:scenario` | **44 pass / 0 fail** (변동 없음) |
| 문서 정합성 | `bash scripts/check-docs-version.sh` | [실행] 전 항목 ok, 로케일 parity 24 entries ×5 |
| docs 빌드 | `cd docs && npx vite build` | [실행] ✓ built in 2.02s |
| 라우트 유지 | `grep -n '/docs/daemon' docs/src/App.tsx docs/src/components/AppSidebar.tsx` | [실행] 2건 존재 |
| build / typecheck | `npm run build`, `npm run typecheck` | [실행] 통과 |
| 자기진단 게이트 | `bash scripts/check-self-diagnosis.sh` | [실행] **전 절 통과** (opencode 1.3.16) |
| 구조 진단 | `reap fix --check` | [실행] 0 error / 2 warning (gen-052 상속분, 불변) |

### 완결성 — 근거는 명령이지 독해가 아니다

> **이 절의 측정은 유효하지만 충분하지 않았다.** 아래 § validation 회귀 후 추가 구현 참조 — `grep` 은 *제외 집합이 옳다는 전제 위에서만* 완결성을 말한다. 최종 수치는 04-validation.md 에 있다.

**대상 집합이 비지 않았음을 먼저 보였다** (부재 assertion 은 스스로를 증명해야 한다):

```
files: 17  missing: 0  total bytes: 766949
markdown: 11 files, 3931 lines
locale string literals scanned: 5853
```

그 위에서:

```
$ grep -n -iE 'daemon|デーモン|데몬|守护进程|17224' <markdown 11개>
hits: 1        # grep exit 1 = 일치 없음

$ python3 <로케일 5개의 렌더링되는 문자열 리터럴 전수 스캔>
scanned 5 files, 5853 rendered string literals
offenders: 0
```

로케일은 grep 이 아니라 **문자열 리터럴 파싱**으로 확인했다 — `daemon: "Code Intelligence"` 는 키가 daemon 이고 값은 아니므로, 줄 단위 grep 으로는 "남은 18건"이 식별자인지 산문인지 구분되지 않는다. 값만 보면 0 이다.

### 명시적으로 제외한 경로와 근거

| 제외 | 근거 |
|---|---|
| `.reap/lineage/**` (39 파일) | 역사 기록. 고치면 기록이 아니게 된다 |
| ~~`src/templates/migration/v0.17.{5,6}.md`~~ | **이 행이 틀렸다 — validation 회귀에서 정정. 아래 § validation 회귀 후 추가 구현 참조.** 근거는 `v0.17.6.md` 에만 참이었고 `v0.17.5.md` 는 정반대(설치 지시)를 담고 있었다. 현재: `v0.17.6.md` 만 제외, `v0.17.5.md` 는 해당 절 삭제 |
| `src/**/*.ts` 주석·식별자 (9 파일) | `DAEMON_PACKAGE`·`REAP_HOME_ENTRIES` 는 동작하는 코드고, 주석은 *왜 코드가 폐기된 패키지 이름을 아는가*를 설명한다 |
| `scripts/*.sh`, `.github/workflows/*.yml` | 개발자 대면. 게이트의 존재 근거 |
| `.claude/commands/reapdev.*.md` | 개발자 전용. `daemon-v*` 태그 경고는 **지금도 유효**하다 (그 태그가 저장소에 남아 있다) |
| `.reap/vision/design/daemon/**` | 설계 문서 아카이브 |
| `tests/**` 주석 | src 주석과 같은 범주 |
| `package-lock.json` | 산문 아님 → backlog |

`.reap/environment/**` 와 `genome/evolution.md` 는 **제외가 아니라 연기**다 — 각각 reflect·adapt phase 소관.

## 범위 밖 발견 → backlog 2건

- `package-lockjson-이-아직-daemon-workspace-를-선언한다-버전도-0175-에-멈춰-있다.md` (medium) — lock 이 `workspaces: ["daemon"]` 과 `@c-d-cc/reap-daemon` 을 아직 선언하고 버전이 0.17.5 에 멈춰 있다. `npm ci --dry-run --ignore-scripts` 는 npm 10.9.4 에서 **실패하지 않고** 40 패키지 제거를 보고한다 [실행] — 그래서 5세대를 살아남았다. 완료 판정을 "remove 0건"으로 적어 두었다
- `visiondesignreap-treemd-가-daemon-을-현존-컴포넌트로-서술한다.md` (low) — 회고가 아니라 **틀린 현재 서술** 4건. `:253` 은 tree 설계의 미결 결정 5번이라 문구 교체가 아니라 재작성이 필요하다

## 판단 기록

### 과거 changelog — 항목은 남기고 daemon 서술만 지웠다

두 논거가 실제로 충돌하지 않는다. "역사 기록"이 요구하는 것은 *버전 항목의 존재*, 사용자 지시가 요구하는 것은 *daemon 서술의 부재*다. 항목을 남기고 내용에서 빼면 둘 다 만족한다. v0.17.5 는 daemon 외 3건, v0.17.0 은 evaluator 를 담고 있어 **비지 않는다.**

결정적 근거는 **실행 가능성**이다. 회고는 읽히고 끝나지만 `npm i -g @c-d-cc/reap-daemon` 과 `reap daemon start` 는 따라 할 수 있고 실패한다. `## Daemon Setup` 만 통째로 지운 것도 같은 이유 — 그것은 버전 기록이 아니라 살아있는 설치 안내였다.

### 이번 세대가 자기가 없애려던 형태를 재생산할 뻔한 곳

longterm: *"The generation that corrects a defect is the likeliest to repeat it"*. 이 세대가 지운 것 중 하나가 **guide 의 회고 완화를 정당화하는 주석**이었고, 그 완화가 실행 가능한 명령 하나를 통과시키고 있었다. 같은 형태를 T011 에서 다시 만들 뻔했다 — 문구를 지우면서 그것의 부재를 검사하는 assertion 을 그대로 두면, **"검사가 있다"와 "검사가 무력하다"가 구분되지 않는 상태**를 새로 만드는 것이다. 방금 없앤 것과 같은 형태다.

---

# validation 회귀 후 추가 구현 (T015~T018)

validation 에서 evaluator 가 blocker 1건 + minor 3건을 냈고, **넷 다 직접 재현해 확인한 뒤** planning 까지 회귀해 whitelist 를 고치고 구현했다.

## 무엇이 틀렸는가 — 두 파일을 한 줄로 묶어 하나만 검증했다

제외 표에 이렇게 적었다:

| 제외 | 근거 |
|---|---|
| `src/templates/migration/v0.17.{5,6}.md` | 산문이 아니라 실행 지시. 지우면 `daemon: true` 를 가진 프로젝트가 설정과 `~/.reap/daemon/` 을 안고 남는다 |

**그 근거는 v0.17.6 에만 참이었다.** v0.17.5 의 `## Also in v0.17.5 — action only if you use the daemon` 절은 정반대를 지시한다:

```
:72  **If and only if your project sets `daemon: true`**, install it once:
:75  npm i -g @c-d-cc/reap-daemon
:78  ... `reap daemon status` reports where it resolved from.
```

**두 파일을 하나로 검증했고, 검증한 쪽이 무고한 쪽이었다.**

이것은 `RELEASE_NOTES.md` 의 `## Daemon Setup` 과 **같은 결함 종류**다 — 존재하지 않는 명령에 대한 살아있는 설치 안내. 그것은 이 세대가 결함이라고 판정해 삭제했으면서, 같은 것을 whitelist 밖에 두었다. 그리고 **도달 범위는 이쪽이 더 넓다.**

## 직접 재현한 것 [실행]

- `reap daemon status` → **출력 없음, exit 0.** note 가 가리키는 명령은 존재하지 않고, 조용하다
- `src/core/migration.ts:113` — `config?.lastMigratedVersion ?? "0.0.0"`. `reap init` 은 그 필드를 쓰지 않는다 → **신규 프로젝트에도 4개 note 전부가 surface 한다.** 업그레이드 사용자만의 문제가 아니었다
- 격리된 신규 프로젝트(`git init -b main` + `reap init`, 가짜 HOME): `reap update` → `pendingMigrations: ['0.17.1','0.17.2','0.17.5','0.17.6']`, `reap load-context` → **daemon 19줄**, 첫 6줄이 설치 지시

## T015 — 절 삭제와, 그 효과의 측정

`src/templates/migration/v0.17.5.md` 의 마지막 절(`:68`~EOF, 13줄) 삭제. 파일과 나머지 3개 절은 유지 — `check-docs-version.sh` § 5 는 파일명만 본다.

**첫 측정이 틀렸다 — 잡아낸 것을 기록한다.** 수정 후 probe 를 다시 돌렸더니 여전히 19줄이었다. 원인은 코드가 아니라 **probe 가 잘못된 바이너리를 재고 있었다**: `reap` 은 PATH 의 전역 설치(npm 의 0.17.6)이고 내 수정은 저장소 `dist/` 에 있었다. 저장소 빌드로 다시 쟀다:

```
$ node "$PWD/dist/cli/index.js" load-context   # 같은 격리 프로젝트
AFTER  (절 제거):  context 26613 bytes | daemon 13줄
BEFORE (절 복원):  context 27474 bytes | daemon 19줄
```

**19 → 13, 사라진 6줄이 정확히 설치 지시 절이다.** 남은 13줄은 전부 `v0.17.6.md` — `daemon: true` 를 가진 프로젝트에 도달해야 하는 *제거* 지시이며 의도된 예외다.

`git stash` 로 절을 되살려 같은 바이너리에서 19를 재현했다 — **probe 가 두 상태를 구분한다는 증거**다. 한쪽만 재면 "13이 낮다"는 것만 알 뿐 무엇 때문인지 모른다.

이것이 애초에 완결성 주장이 서 있었어야 할 자리다. `grep` 은 *어떤 파일이 무엇을 담는가*를 답하고, 이 측정은 *사용자에게 무엇이 도달하는가*를 답한다. **제외 집합이 틀리면 grep 은 조용히 통과한다** — 실제로 그랬다.

## T016 — README 가 코드와 어긋났다

`REAP_HOME_ENTRIES` 는 `["reap-guide.md", ".install-stamp", "daemon"]` **3개**다 (`src/adapters/index.ts:174`, `reap:carrier(reap-home-asset-set)`). 내가 daemon 을 빼면서 README 는 2개만 열거하게 됐고, 바로 다음 문장이 "나머지는 그대로 둔다"고 말한다 — **daemon 을 한 번이라도 켰던 사람에게 그 약속은 거짓**이다.

고친 방향은 "세 번째를 다시 적기"가 아니라 **열거를 없애기**다. genome 의 *"표식보다 공유가 낫다"* 를 산문에 적용하면, 산문은 값을 공유할 수 없으므로 **애초에 값을 갖지 않는 것**이 답이다. `~/.reap/` 안에서 "REAP 이 직접 쓴 것만, allowlist 이며 디렉토리 전체가 아니다" — 집합이 바뀌어도 참이다.

`uninstall.ts:100` 의 화면 목록은 **유지**했다. 그것은 지금 지워질 실제 경로를 사용자에게 보여주는 자리이고, 회고 문구는 이미 뺐다. 두 자리가 다른 처리를 받는 것은 역할이 다르기 때문이다 — 하나는 항상 참이어야 하는 서술, 하나는 이번 실행에서 지워질 목록.

## T017 — 내가 새로 쓴 주석이 과장이었다

`shipped-docs-no-daemon.test.ts` 의 동기화 검사 주석에 "`.reap/reap-guide.md` 가 낡으면 agent 가 읽는 두 번째 답이 된다"고 썼는데 **거짓이다.** `claude-md-section.md:21` 은 `@~/.reap/reap-guide.md` 이고 fallback 이 없다. `integrity.ts:170` 의 `guideLocal` 은 **에러를 낼지 말지 판정할 때만** 쓰인다 — 있으면 "install-skills 를 돌려라"를 억제할 뿐, 읽히지 않는다.

진짜 근거는 dog-fooding 이며 `genome/application.md` 가 이미 소유한다. 그것으로 바꿔 적었다. 검사 자체는 유효하고 (negative 로 확인됨) 근거만 틀렸다.

## T018 — `vite build` 는 타입 검사를 하지 않는다

04-validation.md 의 C3 에 "`retired*` 를 지웠으므로 참조가 남아 있으면 TS 빌드가 깨진다. 통과가 곧 dangling reference 부재의 근거다"라고 썼다. **`docs/package.json` 의 `build` 는 `vite build` 단독**이고 esbuild 는 transpile 만 한다. 사실(참조 없음)은 맞지만 **근거가 거짓**이었다 — 다음 세대가 재사용할 문장이므로 고쳐야 한다.

## 이번 라운드의 형태

longterm: *"The generation that corrects a defect is the likeliest to repeat it."*

이 세대는 **"검사가 있으나 무력한 상태"** 를 없애러 왔다 (guide 의 회고 완화가 실행 가능한 명령 하나를 통과시키고 있었다). 그런데 스스로 세 번 같은 형태를 만들었다:

1. `not.toContain("retired daemon")` — 코드에서 그 문구를 없애면서 assertion 을 그대로 뒀다 (implementation 중 스스로 발견해 수정)
2. `vite build` 통과를 dangling reference 부재의 근거로 삼았다 — 그 빌드는 타입을 보지 않는다
3. **`grep` 0건을 완결성의 근거로 삼았다** — grep 은 제외 집합이 틀리면 조용히 통과한다. 그리고 실제로 틀렸다

셋 다 같은 구조다: **통과가 무엇을 관측했는지 묻지 않았다.** 3번은 evaluator 가 잡았다.

---

# 3라운드 — 새 backlog 2건을 이번 세대에서 소비 (T019~T020)

사용자 지시(2026-08-21): *"이번 세대가 새로 만든 backlog 2건을 별도로 남기지 말고 지금 소비하라."*
`completion:entry` → validation → implementation 으로 두 번 회귀해 처리했다.

## backlog 소비 처리 — CLI 경로가 없어 REAP 자신의 함수를 썼다

`reap run start --backlog` 이외에 backlog 를 consumed 로 마킹하는 CLI 표면이 **없다**
(`reap make` 은 생성 전용, `reap --help` 에 다른 경로 없음). frontmatter 를 손으로 쓰는 것은
genome 이 금지한다 — gen-065 가 그 변형들을 다루려고 `consumeBacklog()` 를 만들었다.

그래서 **그 함수를 직접 호출**했다:

```
$ bun -e 'import { consumeBacklog } from "./src/core/backlog.ts"; ...'
ok ← package-lockjson-이-아직-daemon-workspace-를-선언한다-...md
ok ← visiondesignreap-treemd-가-daemon-을-현존-컴포넌트로-서술한다.md
```

결과 frontmatter: `status: consumed` + `consumedBy: gen-094-61a545` + `consumedAt`.
pending 은 17 → **15** 로 돌아왔다 (이 세대 시작 시점과 같다).

## T019 — `package-lock.json` 재생성

**backlog 가 적어둔 판정 기준을 먼저 실패시켰다** [negative]:

```
$ npm ci --dry-run --ignore-scripts | grep -c '^remove '
40                                      ← 수정 전
```

`npm install` 한 번으로는 부족했다 — npm 이 `"daemon"` 항목을 `"extraneous": true` 로 **남겼다.**
lock 을 지우고 재생성해야 사라진다. `daemon/` 디렉토리는 존재하지 않으므로 npm 이 옛 lock 에서
항목을 이월한 것이다. 이것을 한 번에 통과했다고 보고했다면 3번 기준이 거짓인 채 넘어갔을 것이다.

5개 기준 전부 [실행]:

| # | 기준 | 결과 |
|---|---|---|
| 1 | `version` == package.json | `lock=0.17.6 pkg=0.17.6` |
| 2 | `workspaces` 소멸 | `grep -c '"workspaces"'` → 0 |
| 3 | daemon 계열 + 네이티브 빌드 전이 의존 소멸 | `grep -iE 'daemon\|better-sqlite3\|bindings\|prebuild\|node-gyp'` → exit 1 |
| 4 | root `dependencies` 직접 | `{"web-tree-sitter":"0.22.6","yaml":"^2.0.0"}` |
| 5 | `npm ci` remove 0건 | 40 → **0** |

**전이 의존이 움직였는가** — 프로그램으로 diff 했다:

```
before node_modules entries: 48  →  after: 8
REMOVED 40 (@c-d-cc/reap-daemon, better-sqlite3, prebuild-install, node-abi,
            bindings, detect-libc, tar-fs, rc, semver, ... 네이티브 빌드 트리 전부)
ADDED   0
VERSION CHANGED  none
```

**순수 감산이다.** 그래서 baseline 이 움직이지 않을 것으로 예상했고, 실제로 움직이지 않았다 —
하지만 예상이 검증을 대신하지 않으므로 세 스위트와 자기진단 게이트를 전부 새로 돌렸다.

## T020 — `reap-tree.md` 4건

`:17` `:185` `:274` 는 문구 교체. `daemon/` 은 더 이상 별도 앱이 아니고, opt-in 패턴의 예시는
`evaluator` 하나로 충분하다.

**`:253` 은 team lead 판단을 따랐다** — 미결 결정 5번의 **전제만** `reap index` 기준으로 다시 쓰고
**결정 자체는 미결로 남긴다.** 사용자 지시는 "별도 backlog 없이 소비"이지 "설계 결정을 지금
내려라"가 아니고, `.reap/.index/` 가 프로젝트별이라는 것은 **확정된 사실**이라 전제 교체에 새
판단이 필요 없다.

다시 쓴 항목은 전제를 바꾸면서 **새로 생긴 질문**을 명시한다 — parent 가 각 child 의 스냅샷을
읽는 형태는 § 원칙 2("parent 는 child 의 `.reap/` 을 읽되 쓰지 않는다")와는 맞지만,
**child 의 커밋이 움직일 때 parent 인덱스가 언제 낡는가**를 새로 만든다. 인덱스가 커밋 기준이
됐기 때문에 생기는 질문이며 daemon 시절에는 없던 것이다.

## 3라운드 재검증 (전부 fresh)

| 항목 | 결과 |
|---|---|
| `npm run typecheck` | 통과 |
| `npm run build` | 통과 |
| `npm run test:unit` | **629 / 0 fail** |
| `npm run test:e2e` | **331 / 0 fail** |
| `npm run test:scenario` | **44 / 0 fail** |
| `bash scripts/check-self-diagnosis.sh` | **전 절 통과** — `npm pack` 경로라 lock 변경에 가장 노출된 게이트 |
| `bash scripts/check-docs-version.sh` | 전 항목 ok |
| `cd docs && npx vite build` | ✓ 1.88s |
| `diff .reap/reap-guide.md src/templates/reap-guide.md` | IDENTICAL |
| `reap fix --check` | 0 error / 2 warning |
| C1 완결성 (18파일 4,522줄, 8철자) | **0건** |
| 새로 범위에 든 내부 파일 (`summary.md`·`source-map.md`·`reap-tree.md`·`package-lock.json`) | **0건** |

---

# 4라운드 — ja / de / zh-CN 산문을 실제로 읽었다 (T021)

사용자 지시(2026-08-21): 미검증 축을 이번 세대에서 닫는다.

**근거 표기는 `[독해]` 다.** 사람이 읽은 것이지 명령이 판정한 것이 아니다. 구조 대조와
exact-match assert 는 3라운드까지 이미 했고 여기서 반복하지 않는다 — 실제 위험은 그것들이
못 보는 곳이다.

## 항목별 결과

### (a) 잘린 절을 가리키던 앞뒤 연결어 — **해당 없음** [독해]

절단면 4곳을 세 로케일에서 각각 읽었다.

| 절단면 | ja | de | zh-CN |
|---|---|---|---|
| changelog v0.17.5 (문단 중간 절단) | `**`reap run push` が git の実際のエラーを報告**し、…` | `**`reap run push` meldet den echten git-Fehler**, und…` | `**`reap run push` 会报告 git 的真实错误**，…` |
| changelog v0.17.0 (앞부분 절단) | `**Evaluator Agent** — fitnessフェーズ統合完了:` | `**Evaluator Agent** — Fitness-Phase-Integration…` | `**Evaluator Agent** — fitness 阶段集成完成：` |
| changelog v0.17.6 (문장 3개 제거) | `…gitignore されます。**`reap uninstall`** は…` | `…ist gitignored. **`reap uninstall`** entfernt…` | `…并被 gitignore。**`reap uninstall`** 会清除…` |
| README 문단 삭제 | `…次のコマンドが作り直します。` → `## プロジェクト構造` | `…baut ihn neu.` → `## Projektstruktur` | `…下一条命令会重建。` → `## 项目结构` |

세 로케일 모두 잘린 쪽을 가리키는 연결어가 없다. 절단 지점이 **문장 경계 + 굵은 소제목 시작**
이라 앞 문장이 자연히 닫히고 다음이 새로 시작한다. README 절단면은 다섯 로케일 전부 동일하게
"인덱스는 `.reap/.index/` 에 있고 지워도 안전하다"로 절이 끝난 뒤 다음 `##` 로 넘어간다 —
문단이 하나 사라진 흔적이 남지 않는다.

기계적으로도 한 번 훑었다: 절단 지점 주변의 이중 공백 / 고아 문장부호 / 마침표 앞 공백 /
중복 대시 — **0건**. (zh-CN 의 `——` 는 중국어 정식 파선이며 원래부터 있었다.)

### (b) 열거 개수 — **해당 없음** [독해]

세 로케일에서 개수를 말하는 표현을 전부 뽑아 대조했다:

- `세 개의 파일` / `3つのファイル` / `三个文件` (README:124) — genome 의 3개 파일. 이번 변경과 무관, 여전히 3개
- `2〜3つの選択肢` (README.ja:221) — clarity 응답 옵션. 무관
- `five months` / `5 か月` / `fünf Monate` / `五个月` — resolver 결함 지속 기간. 무관
- `Two further analyses are deliberately absent — community detection and process tracing` — **내가 다시 쓴 문장**. 둘이라 말하고 둘을 이름으로 댄 뒤 `The first…the second…` 로 받는다. 일치

daemon 항목이 빠지면서 개수가 어긋난 열거는 **없다.** 애초에 daemon 은 열거의 원소가 아니라
독립 문단·독립 항목이었다.

### (c) 목차·링크가 사라진 절을 가리키는가 — **해당 없음** [독해]

- README 에서 지운 것은 `**Replacing the daemon…**` 으로 시작하는 **인라인 굵은 문단**이지
  `#` 헤딩이 아니다 → 앵커가 생기지 않으므로 가리킬 목차 항목도 없다
- docs 사이트의 `retired*` 절은 `<h2>` 였지만 그 페이지에 목차 컴포넌트가 없다
  (`DaemonPage.tsx` 는 `DocPage` 안에 섹션을 나열할 뿐이다)
- `daemonPage` 키 목록을 다섯 로케일에서 뽑아 대조 — **전부 21키로 동일**하고 `retired*` 잔재 없음
- 라우트 `/docs/daemon` 과 사이드바 항목은 유지 (gen-090 결정)

### (d) ko/en 에서 고친 연결을 세 로케일이 같은 자리에 갖고 있는가 — **결함 1건 발견, 수정** [독해]

*같은 자리*는 맞았다. v0.17.5·v0.17.0·`uninstallNote`·README 절단면 모두 다섯 로케일이 같은
지점에서 같은 방식으로 잘렸다.

**그러나 내가 새로 넣은 삽입구가 네 언어에 영어 문장부호를 들여왔다.** README uninstall 문장에
`— allowlist 이며 디렉토리 전체가 아닙니다 —` 형태로 em-dash 삽입구를 썼는데, **원문은 네 언어
모두 괄호를 쓰고 있었다**(`（廃止されたデーモンが残したもの）` / `(was der stillgelegte Daemon
hinterlassen hat)` / `（已停用的 daemon 留下的数据）`). 대체하면서 그 관례를 버렸다.

ja 는 특히 나빴다 — `…だけを削除し — … — その後 …実行します` 로 **연용형 뒤에 대시 삽입구가
끼어 문장이 한 번 멈춘다.**

각 언어의 관례로 되돌렸다:

| | 수정 후 |
|---|---|
| ko | `…REAP 이 직접 쓴 것(allowlist 이며 디렉토리 전체가 아닙니다)만 지운 뒤…` |
| ja | `…REAP 自身が書いたものだけ（allowlist であり、ディレクトリ全体ではありません）を削除してから、…` |
| de | `…geschrieben hat (eine Allowlist, nicht das ganze Verzeichnis), und führt…` |
| zh-CN | `…写入 `~/.reap/` 的内容（一份 allowlist，而非整个目录），然后…` |

**en 만 em-dash 를 유지한다** — 영어에서는 그것이 관례이고 원문도 그랬다.

이것이 (d) 항목이 잡아낸 것이다. 구조 대조는 "같은 자리에 같은 길이의 문장이 있다"까지만
보고, **그 문장이 그 언어로 읽히는지**는 보지 못한다.

## 4라운드 재검증 (전부 fresh)

| 항목 | 결과 |
|---|---|
| `npm run typecheck` | 통과 |
| `npm run build` | 통과 |
| `npm run test:unit` | **629 / 0 fail** |
| `npm run test:e2e` | **331 / 0 fail** |
| `npm run test:scenario` | **44 / 0 fail** |
| `bash scripts/check-docs-version.sh` | 전 항목 ok |
| `cd docs && npx vite build` | ✓ 2.77s |
| guide 두 사본 | IDENTICAL |
| `reap fix --check` | 0 error / 2 warning |
| C1 완결성 (18파일, 8철자) | exit 1 (0건) |

## 이 라운드가 확인해 준 것

`[실행]` 과 `[독해]` 의 구분이 실제로 무언가를 가른다. 3라운드까지의 `[실행]` 근거 — grep 0건,
문자열 리터럴 5,853개, 배포 번들 13건, exact-match assert, `git diff --stat` 대칭 — 이
**전부 초록인 상태에서** 네 언어의 문장부호 오류가 남아 있었다. 기계는 문자열이 거기 있는지를
보고, 그것이 그 언어로 읽히는지는 보지 못한다.

그래서 이 항목은 앞으로도 `[독해]` 다. 자동화할 수 있는 것처럼 적으면 다음 세대가 게이트
초록을 보고 넘어간다.

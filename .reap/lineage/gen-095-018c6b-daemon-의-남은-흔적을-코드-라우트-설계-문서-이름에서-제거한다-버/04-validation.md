# 04 Validation — gen-095-018c6b

**Goal**: daemon 의 남은 흔적을 코드·라우트·설계 문서·이름에서 제거한다 — 버전업 경로의 청소 코드는 남긴다

`git log --oneline -1` = `e593eda` (이 세대의 변경은 아직 미커밋). 검증 시각 2026-08-21T23:58Z.
플랫폼 **macOS 로컬 단독**. 리눅스에서 돌지 않았다.

## 근거 표기 규약

- `[실행]` — 이 세대에서 그 명령을 직접 돌렸고, **그 명령이 그 항목을 실제로 판정한다**
- `[negative]` — 일부러 깨뜨려 검사가 fail 하는 것을 확인했다
- `[독해]` — 코드·설정을 읽고 판단했다. 돌려보지 않았다

## 1. 완료 기준 대조 (02-planning.md § 완료 기준)

### 기준 1 — `shipped-docs-no-daemon.test.ts` 전 test green

`[실행]` `bun test tests/unit/shipped-docs-no-daemon.test.ts tests/unit/docs-wiring.test.ts`
→ **18 pass / 0 fail**.

`[negative]` **착수 시점에 3 fail 이었다.** 그것이 이 검사의 유효성 근거다 —
`scripts/build.sh:14` · `scripts/check-version-floors.sh:10` · `.github/workflows/release.yml:69` ·
`.reap/genome/evolution.md:140` 을 정확히 지목했다.

`[negative]` 신규 `tests/` sweep 을 2회 깨뜨려 red 를 확인했다:
1. 비-제외 파일(`tests/unit/semver.test.ts`)에 `// daemon-sample` 한 줄 추가
   → `+ "tests/unit/semver.test.ts: 121: // daemon-sample"` 로 red. 복원
2. 삭제한 fixture 를 **디스크와 인덱스 양쪽에** 되살림
   → `+ "tests/fixtures/indexer-sample/package.json: 2: \"name\": \"daemon-sample\","` 로 red. 복원

### 기준 2 — A(보존 대상) 무손상

`[실행]` 4건 모두 grep 으로 재확인 (착수 시 + 종료 시):

| 보존 대상 | 확인 |
|---|---|
| `src/cli/commands/uninstall.ts` `DAEMON_PACKAGE` + `npmRemovalTargets()` | 존재 |
| `src/cli/commands/update.ts` `removeRetiredDaemonData()` + 호출부 | 존재 |
| `src/adapters/index.ts` `REAP_HOME_ENTRIES` 의 `"daemon"` | 존재 |
| `src/templates/migration/v0.17.6.md` | `git status` 무변경 |

`[실행]` 동작으로도 확인 — `bash scripts/check-self-diagnosis.sh` § 8 이
`$UN_HOME/.reap/daemon/{indexes,registry.json}` 를 심고 `reap uninstall --confirm` 이 지운 것을 단언한다.
**26 removals** 보고, `every REAP surface is gone, including the package` pass.
이것이 A 를 **실제로 실행하는** 유일한 자리다 (unit 은 인자만, e2e 는 소스 체크아웃에서 돈다).

`[실행]` `tests/unit/shipped-source-map-rule.test.ts` 는 `src/templates/migration/v0.17.6.md` 를 직접
읽는다 — unit 스위트 640 pass 에 포함되며 그 파일이 그대로임을 확인한다.

### 기준 3 — 게이트 전종 통과

| 게이트 | 근거 | 결과 |
|---|---|---|
| `npm run typecheck` | `[실행]` | 통과 (출력 없음) |
| `npm run typecheck:docs` | `[실행]` | 통과 |
| `npm run build` | `[실행]` | `Bundled 163 modules`, `index.js 0.63 MB`, `grammars bundled: 15` |
| `cd docs && npx vite build` | `[실행]` | `✓ built in 2.04s` |
| `bash -n` × 3 수정 스크립트 | `[실행]` | 구문 오류 없음 |
| `bash scripts/check-self-diagnosis.sh` | `[실행]` | **8개 절 전부 pass** (opencode 1.3.16) |
| `bash scripts/check-docs-version.sh` | `[실행]` | `All document checks passed for v0.17.6` |
| `bash scripts/list-carriers.sh --orphans` | `[실행]` | 1건 (`id` in `RELEASE_NOTES.md`) — **기존 그대로** |
| `reap fix --check` | `[실행]` | **0 error / 2 warning** (gen-052 lineage parent 상속분 2건) |

세 스위트 `[실행]`: **unit 640 / e2e 329 / scenario 44, 0 fail.**

### 기준 4 — backlog 1건 생성

`[실행]` `reap make backlog --type task --priority high`
→ `.reap/life/backlog/reapccdocs-가-전부-http-404-를-반환한다-문서-사이트가-검색에서-부재하다.md`

### 기준 5 — `[실행]` 표기의 자격

이 문서의 모든 `[실행]` 항목은 위 표에 판정 명령이 함께 적혀 있다. 지목할 수 없는 것은 `[독해]` 로 내렸다
(V6 — CI 워크플로 배선).

## 2. 테스트 수 증감 — 회귀가 아니다

baseline **629 / 331 / 44** → **640 / 329 / 44**.

| 증감 | 내역 |
|---|---|
| unit **+11** | 승계된 `shipped-docs-no-daemon.test.ts` 확장 **+8** · 승계된 `docs-wiring.test.ts` 신설 **+3** · 이 세대의 `"no test file names it"` **+1** · 삭제한 prompt daemon test **−1** |
| e2e **−2** | `describe("e2e: reap index — no resident process")` 2 test 삭제 |
| scenario **0** | 변경 없음 |

증감이 전부 의도된 추가·삭제로 설명되고, 잔차가 0이다.

## 3. `reap index impact` — 변경 파일의 blast radius

`[실행]` `reap index status` (commit `e593eda`):

```
files:   197
symbols: 711  (function 474, method 113, class 83, type 41)
edges:   1584  (CALLS 1273, IMPORTS 311)
imports: 313/313 resolved (100%)
```

**해석률이 100% 이므로 빈 blast radius 를 "없음"으로 읽어도 된다.**

*(처음 이 절에 `543/543` 이라고 적었다. 그것은 `reap-guide.md` 의 **예시 수치**이지 이 저장소의
측정치가 아니다 — 재지 않고 옮겨 적었고, 실제로 돌려서 정정했다. 게이트 수치를 인용할 때
반복되는 종류의 오류라 남겨 둔다.)*

`[실행]` **`src/` 의 변경은 전부 주석이다.** 판정 명령:

```bash
git diff -- src/ | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' \
  | grep -vE '^[+-][[:space:]]*(\*|//|/\*)' | grep -vE '^[+-][[:space:]]*$'
```

→ **출력 2줄** (라운드 2 재실행 기준, 아래 정정 참조):

```
-This is not hypothetical caution. The predecessor to this indexer resolved **zero** imports …
+Concretely: an indexer that never maps a `./x.js` specifier to the `x.ts` file producing it …
```

> **그리고 이 인용을 한 번 더 고쳤다.** 라운드 2 의 A4 수정이 같은 문단을
> (*"This is not hypothetical caution."* → *"Concretely:"*) 또 바꿔서, 방금 정정한 이 블록이
> **곧바로 낡았다.** 줄 수는 2로 같아 수치만 보면 통과했을 것이다. **B1 의 함정이 B1 을 고치는
> 동작 안에서 한 번 더 발생했고**, 이번에는 명령을 다시 돌려서 잡았다.

**두 줄 모두 `src/templates/reap-guide.md` 의 산문이다** — 배포되는 마크다운 문서이지 실행 코드가
아니다. 나머지 `src/` 변경은 전부 주석이며, `.ts` 파일에서 나온 비-주석 라인은 **0줄**이다.

> **정정 (라운드 2 B1).** 이 절을 처음 썼을 때는 실제로 **0줄**이었고 그렇게 적었다. 그 뒤
> **라운드 1 의 A4 수정이 `src/templates/reap-guide.md` 를 고쳤고**, `src/` 아래의 마크다운이므로
> 이 명령에 걸린다. **나는 § 6 을 append 하면서 § 3 을 다시 돌리지 않았다.**
> 자기점검에서 A4 의 *수*는 다시 셌으면서 A4 가 무효화한 *이 절*은 읽지 않았다 —
> "내가 방금 바꾼 것의 옆" 이 아니라 **"내가 방금 바꾼 것이 참조되는 앞쪽"** 을 놓친 형태다.

**이 세대가 손댄 `src/` 파일은 15개다** (`[실행]` `git diff --name-only -- src/`).
처음 이 절에 *"`src/indexer/index.ts` 하나"* 라고 적었는데, 그것은 **T0 에서 내가 추가로 편집한
파일**을 말한 것이고 라운드 1 이 다섯 개를 더 편집했다. § 6 A4 목록이 정확한 쪽이다.

따라서 blast radius 는 **코드 의미상 비어 있다**. 그럼에도 `[실행]` 세 스위트 전체(1013 test)를
돌려 확인했다 — 주석·산문 변경이 동작을 바꾸지 않는다는 것을 독해가 아니라 실행으로 뒷받침한다.

**이 명령의 한계 둘**: (1) 블록 주석 본문 중 `*` 로 시작하지 않는 줄은 비-주석으로 잡힌다
(**fail-closed** — 과잉 검출 방향). (2) **`src/` 아래의 마크다운을 코드와 구분하지 못한다** —
지금 잡힌 2줄이 그 경우다. 확장자로 거르지 않은 것은 의도가 아니라 이 세대의 누락이다.

## 4. 이 검증이 **못 하는 것** — 통과는 검사 범위 안에서만 유효하다

1. **배포된 사이트에 HTTP 요청을 보내는 게이트가 없다.** `/docs/*` 가 전부 404 라는 사실
   (이 세대가 `curl` 로 직접 측정)은 어떤 검사도 잡지 못한다. → T9 backlog.
2. **`.github/workflows/docs.yml` 의 신규 `Typecheck docs` step 은 실행되지 않았다.**
   push 하지 않으므로 `[독해]` 다. 같은 명령을 로컬에서 도는 것은 **같은 실행이 아니다** —
   워크플로 YAML 의 오타·잘못된 `working-directory` 는 이 세대가 잡지 못한다.
3. **`.claude/commands/` 축에는 검사가 없다.** reapdev skill 2건은 배포되지 않는 개발 skill 이라
   sweep 밖에 두었다.
   *(정정 — 라운드 2 A3: 처음 이 자리에 "`daemon-v0.2.0` 태그를 **정당하게 지목**하므로 제외했다"
   라고 적었는데, **같은 세대가 그 이름을 지웠다.** 두 파일은 이제 `v*` 가 아닌 태그가 실재한다고만
   말하고 `grep -ci daemon` 은 둘 다 0이다. 제외 근거로 남는 것은 "배포되지 않는다" 하나뿐이다.)*
4. **제3자 링크는 측정하지 못했다.** 저장소 안 `/docs/daemon` 참조는 `[실행]` 0건이지만,
   블로그·SNS·사설 북마크는 관측 수단이 없다.
5. **`trackedInTests()` 의 cwd 오류를 negative 로 확인하지 않았다.** 실측 92 vs 바닥 40 이라는
   간격으로만 방어된다. `[독해]`
6. **`tests/` sweep 은 tracked 파일만 본다.** 커밋되지 않은 새 파일은 안 보인다.
7. **macOS 단독.** 리눅스 러너에서 돌지 않았다. gen-081 의 교훈대로 "한 머신에서 초록"은 표본 1이다.
   다만 이 세대의 변경은 주석·테스트·게이트 산문이라 플랫폼 의존 축이 새로 생기지 않았다.
8. **층2(`check-agent-integration.sh`) 는 돌리지 않았다.** 릴리즈 전 team lead 가 수행한다.

## 5. 판정

**완료 기준 5개 모두 충족.** 게이트 전종 통과, 회귀 없음, 보존 대상 무손상.

evaluator 를 호출해 독립 검토를 받는다 — genome § 독립 검토는 한 번으로 수렴하지 않는다 에 따라
**2라운드 이상을 예산에 넣는다**. 지적은 **먼저 재현하고** 고친다.

## 6. Evaluator 검토

(아래에 라운드별로 append)
### 라운드 1 — blocker 3 / advisory 11

evaluator 가 세 스위트·게이트·타입체크·인덱스 수치를 **독립적으로 재현**했고 전부 일치했다.
아래는 지적과 처리다. **모든 지적을 먼저 내가 재현한 뒤 고쳤다.**

#### B1 — 게이트 단언 하나가 발화할 수 없었다 (내가 만든 결함)

`check-self-diagnosis.sh` 의 home-directory 단언이 `$FAKE_HOME/.reap/index` 를 봤는데
실제 경로는 `.reap/.index` (점)다. 철자 오류는 기존 것이지만 **내가 disjunct 하나를 지우면서
블록 전체가 무력해졌다** — FAIL 문구는 그대로 커버리지를 주장한 채로.

`[negative]` 재현:
```bash
mkdir -p /tmp/b1/.reap/.index
[ -e /tmp/b1/.reap/index ] && echo CAUGHT || echo MISSED   # → MISSED
```

**고친 방식이 중요하다.** 철자를 고치는 것만으로는 `.index` 가 언젠가 이름을 바꾸면 다시 무력해진다.
`reap index status` 가 **방금 보고한 경로**에서 이름을 파생하게 했다:

```bash
IX_DIRNAME=$(basename "$IX_PATH")
if [ -z "$IX_DIRNAME" ] || [ -e "$FAKE_HOME/.reap/$IX_DIRNAME" ]; then
```

빈 문자열 검사가 함께 있는 이유 — `basename` 이 빈 값을 내면 `[ -e "$FAKE_HOME/.reap/" ]` 가
**항상 참**이 되어 fail-open 이 아니라 fail-closed 로 무너진다. 그쪽이 안전한 방향이다.

`[negative]` **고친 뒤 게이트 안에서 직접 심어 red 를 확인했다** —
`mkdir -p "$FAKE_HOME/.reap/.index"` 를 단언 앞에 임시 삽입 →
`FAIL indexing wrote into the home directory (…)` 출력 확인 → 프로브 제거.
이제 이 단언은 살아 있다.

#### B2 — staged 삭제 5,364줄이 검토 없이 들어왔다 (관측 수단의 구멍)

`.reap/vision/design/daemon/` 7파일 삭제가 승계분에 **staged 로** 들어 있었고 내 판정표에 없었다.
원인이 기계적이고 **자기은폐적**이다:

- 승계 통독 명령이 `git diff -- …` 였다 → **staged 변경을 볼 수 없다**
- 잔여물 grep → **삭제된 파일은 hit 을 내지 않는다**

두 관측 수단이 같은 방향으로 눈이 멀었다. 유일하게 이 삭제를 언급하는 것은
`expect(existsSync(design/daemon)).toBe(false)` 인데, 그것은 **삭제가 스스로를 단언하는 것**이다.

7건 중 6건은 daemon phase plan 으로 삭제가 goal 에 부합한다.
**`scip-and-scale.md` 는 다르다** — 이틀 전(`c7a2db1`, 2026-08-19)에 backlog 를 **대체하려고**
만든 조사 종결 기록이고, 지목하는 4가지 한계 중 **#1·#4 는 지금 배포되는
`src/indexer/call-resolver.ts`·`scanner.ts` 를 그대로 서술한다.** 그리고 **pending backlog** 가
그 경로를 가리키고 있었다.

처리: 브리핑의 명시 지시(7파일 삭제)를 따르되, **죽은 포인터를 없앴다** —
`process-tracing-재설계-…md` 의 참조를 `git show c7a2db1:…` 복원 명령 + 왜 아직 유효한지의
설명으로 교체. 판정 자체는 `01-learning.md § 0.1` 에 기록했다.
**되살리는 편이 낫다면 `.reap/vision/design/code-index-scip.md` 로 이름을 바꿔야 한다** —
원래 경로에 되돌리면 이 세대의 sweep 이 red 가 된다. team lead 에 보고했다.

#### B3 — 개명 근거가 틀렸다. artifact 가 자기모순이었다

`[실행]` `curl -s -o /tmp/d.html -w 'status=%{http_code} size=%{size_download}' -L https://reap.cc/docs/daemon`
→ `status=404 size=939`, 본문에 `<script`·`id="root"` **3건**. **404 본문이 SPA 셸이다.**

즉 `/docs/daemon` 은 **오늘 Code Intelligence 페이지를 정상 렌더하고**, 개명 후에는 NotFound 를
렌더한다. *"링크가 깨진다"* 는 주장은 **실질적으로 옳았고** 틀린 것은 근거로 든 단어(status)뿐이다.
**status 로는 이 질문을 판정할 수 없다** — 존재하는 라우트와 존재하지 않는 라우트가 같은 404 를 낸다.

내 backlog 본문이 두 절 위에서 *"브라우저에서는 SPA 가 부팅해 화면이 정상적으로 뜬다"* 라고
적어놓고 `## 부수 사실` 에서 반대로 말했다. **artifact 가 스스로와 모순됐고, 거짓인 쪽이
lineage 로 가는 학습 문서와 pending backlog 양쪽에 적혀 있었다.**

정정: `01-learning.md § 5.1` 신설 + backlog `## 부수 사실` 재작성.
**개명을 유지하는 실제 근거는 저장소 내 인바운드 참조 0건뿐이고, 제3자 링크는 측정 수단이 없다** —
그들에게는 오늘 뜨던 페이지가 NotFound 가 된다. 그것이 이 개명의 실제 비용이며 그대로 적었다.
복구 수단(한 줄 Redirect)과, **이 세대의 가드가 그 한 줄을 금지한다는 사실**도 함께 적었다.

#### A1·A2·A10 — 새 sweep 의 fail-open 3건. 전부 negative 로 확인

| 지적 | 재현 | 처리 |
|---|---|---|
| genome 검사가 `evolution.md` **하나만** 본다 | `[negative]` `application.md` 에 `<!-- probe: daemon -->` 추가 → **15 pass 0 fail** (통과해버림) | 3파일 전부 순회. 고친 뒤 `application.md`·`invariants.md` 각각에 프로브 → **red 확인 후 복원** |
| `DAEMON_SPELLINGS` 에 `守护进程` 없음 | `[실행]` `git show e593eda~1:docs/src/i18n/translations/zh-CN.ts \| grep -c 守护进程` → **6**. `[negative]` `App.tsx` 에 프로브 → 통과해버림 | 목록에 추가. `[negative]` 재프로브 → **red 확인 후 복원** |
| `tests/unit/uninstall.test.ts` 제외 근거가 절반만 읽었다 | `[실행]` 그 파일이 `:230/:235` 단언 **외에** `:421~424` 에서 `~/.reap/daemon/` 를 심는다 | 근거를 두 절반 모두로 재작성 |

**로케일 스펠링 목록의 근거를 전부 실측으로 다시 깔았다**:
ja `デーモン` 8줄 · ko `데몬` 3줄 · zh-CN `守护进程` 6줄 (모두 `e593eda~1` 기준) ·
de 는 라틴 `Daemon` 이라 `/daemon/i` 가 이미 잡는다(그래서 독일어 항목 없음).
`Dämon` 은 **한 번도 나타난 적이 없어 넣지 않았다** — 이 목록은 "쓰였던 것"이지 "쓰일 수 있는 것"이 아니다.

#### A4 — "승계분 과잉 잔존 1곳" 이 **거짓이었다**

내 T0 는 *승계된 diff 안에서* 재판정했고, **내가 편집한 파일들에 원래 있던** 회고 주석은
보지 않았다. evaluator 가 4곳 + shipped guide 1곳을 찾았다. 전부 고쳤다:

이 목록은 `git diff` 로 hunk 를 세어 다시 확인했다 (아래 § 자기점검 참조):

- `src/cli/commands/update.ts` **2곳** — `removeRetiredDaemonData` 의 doc 한 줄 + 호출부 `// 5.` 블록
- `src/cli/commands/uninstall.ts` **4곳** — `DAEMON_PACKAGE` doc · `npmRemovalTargets` doc ·
  `// 2. The client-agnostic half` 주석 · 마지막 안내문의 *"left the daemon behind"*
  (→ `left @c-d-cc/reap-daemon behind`)
- `src/cli/commands/index-cmd.ts` **1곳** — `Distinct vs total` 인라인 주석
  (같은 파일의 다른 2 hunk 는 승계분이다)
- `scripts/check-self-diagnosis.sh` **1곳** — `:264` NodeNext fixture 주석
- `.github/workflows/release.yml` **2곳** — self-diagnosis carrier 블록 + GitHub Release 추출 주석
- **`src/templates/reap-guide.md` + `.reap/reap-guide.md` 각 1곳** — *"The predecessor to this indexer
  resolved zero imports…"*. **배포되고 `@` import 되는 문서**라 매 세션 컨텍스트를 먹는다.
  두 사본을 함께 고쳤고 `cmp -s` 로 byte-identity 를 확인했다

**T0 판정을 정정해 `03-implementation.md` 에 남겼다** — 원래 문장을 지우지 않고 왜 틀렸는지 함께 적었다.

#### A5 — 내 교체문 하나가 반론을 다시 들여왔다

`src/cli/commands/check-version.ts` 의 *"— a single "npm install -g" would send the user of a
project's local install to a different one entirely"*. **T0 에서 `src/indexer/index.ts` 로부터
지운 것과 정확히 같은 모양**(사라진 대안에 대한 반론)이다. 삭제했다.

#### A6 — 내가 새로 쓴 전칭 주장. 사후 검증됨

`check-self-diagnosis.sh:19` 의 *"Every entry above was reproduced against the broken state before
being listed."* — **재지 않고 썼다.** HEAD 의 원문은 그 반대를 고백하고 있었다.
evaluator 가 네 항목 전부를 확인했고 **참이다**: #22 = gen-078 `04-validation.md:50` ·
gen-080 = gen-082 `04-validation.md:26` · npm 12 = gen-087 · index = gen-089 `04-validation.md` § 4.
문장은 유지하되 **근거가 여기 있다는 사실을 이 artifact 가 갖는다.**

#### A7·A8·A11 — 세지 않은 수 · 과장된 대체 주장 · 두 컴파일러

- `.github/workflows/docs.yml` 의 *"That went unchecked through three renames."*
  `[실행]` `git log -S` → **1건**. 근거 없는 수라 문장을 교체했다
- T7 표의 `prompt-code-intelligence` 대체 판정 **"예" → "부분만"**. `curl` 과 `/projects/` 는
  daemon 스펠링이 아니므로 sweep 이 덮지 않고, **지금 어디서도 단언되지 않는다**
- `typecheck:docs` 를 `cd docs && npx tsc …` 로 바꿔 CI 호출과 **바이트 동일**하게 만들었다.
  다만 evaluator 의 전제(root 5.7 vs docs 5.9)는 **실측하면 틀렸다** — `[실행]` 양쪽 모두
  **5.9.3** 이다. 그래도 "한 명령의 두 철자"는 실재하므로 정렬 자체는 유지한다.
  `[negative]` 바꾼 스크립트로 로케일 하나(`zh-CN.ts`)를 되돌려 **여전히 red 임을 확인**했다

#### A3·A9 — 범위 밖 / reflect 로 이월

- **A3**: `README*.md` · `RELEASE_NOTICE.md` · `RELEASE_NOTES.md` · `CLAUDE.md` · `AGENTS.md` ·
  `.reap/environment/*` · `docs/index.html` · `docs/public/` 는 sweep 밖이다. **현재 전부 clean**
  (gen-094 가 처리). 즉 **지금 옳고, 검사는 없다** — 그 사실을 여기 적어 둔다
- **A9**: `environment/summary.md` 의 세 문장이 이 세대로 낡았다 —
  `:44` baseline(629/331 → 640/329) · `:52` 삭제된 fixture · `:145~146` *"`lsof` 단언이 fail-open"*
  (그 단언을 지웠다). `source-map.md:178` 의 *"상주 프로세스도 포트도 registry 도 SQLite 도 없다"*
  는 D 기준 대조 서술이다. **environment 는 reflect 가 소유하므로 거기서 고친다.**

#### 라운드 1 이후 전 게이트 재실행

`[실행]` typecheck · typecheck:docs · build(0.63MB, grammars 15) · `bash -n` ×3 ·
`vite build` · **자기진단 8절 전부 pass** · check-docs-version · carrier orphan **1건 유지** ·
`reap fix --check` **0 error / 2 warning**.
`[실행]` 세 스위트 **unit 640 / e2e 329 / scenario 44, 0 fail** — 수치 불변.

### 자기점검 — 라운드 1 기록의 수를 직접 세었다

evaluator 의 2라운드를 기다리는 동안 § 라운드 1 의 **수를 주장하는 문장을 전부 `git diff` 로 대조**했다.
**두 건이 틀렸다** — 둘 다 같은 모양이다: 문장은 N 이라 쓰고 바로 아래 나열은 N+1 이거나, 나열이
빠져 있었다.

| 주장 | 실측 | 처리 |
|---|---|---|
| `03-implementation.md` § T4 *"회고 산문 **7곳**"* | 바로 아래 나열이 **8개** | 8 로 정정, 슬립을 함께 기록 |
| § 라운드 1 A4 *"`uninstall.ts` **3곳**"* | `git diff` hunk 3개가 **논리적 편집 4개**를 담는다 | 4 로 정정 + 네 항목 전부 나열 |
| § 라운드 1 A4 *"`update.ts:282` 1곳"* | **2곳** (doc 한 줄 + `// 5.` 블록) | A4 목록 전체를 diff 에서 다시 세어 재작성 |

대조가 통과한 것: `release.yml` 2 hunk · `index-cmd.ts` 내 이 세대 편집 1곳(나머지 2 hunk 는 승계분) ·
`check-self-diagnosis.sh` 8개 절 · e2e 삭제 테스트 2개 · unit 삭제 테스트 1개 · guide 두 사본 byte-identical.

**교훈은 수 자체가 아니다.** 세 건 모두 *"나는 방금 무엇을 했는가"* 를 diff 가 아니라 기억으로 적은
결과다. 게이트도 테스트도 artifact 의 산술을 검사하지 않으므로, **자기 기록의 수는 손으로 세는 수밖에 없다.**

### 라운드 1 이후 내가 독립 확인한 것 (evaluator 2라운드와 별개)

| 확인 대상 | 근거 | 결과 |
|---|---|---|
| B1 프로브가 제거됐는가 | `[실행]` `grep -n "NEGATIVE PROBE" scripts/check-self-diagnosis.sh` | 0건 |
| `-z "$IX_DIRNAME"` 분기가 정말 fail-closed 인가 | `[실행]` `D=""; [ -z "$D" ] \|\| [ -e "$F/.reap/$D" ]` | **TRIGGERS** — 주장대로 fail-closed |
| B2 의 복원 명령이 실제로 파일을 내는가 | `[실행]` `git show c7a2db1:.reap/vision/design/daemon/scip-and-scale.md` | 본문 출력됨 |
| A7 의 *"이전에는 아무것도 docs 를 typecheck 하지 않았다"* | `[실행]` root `tsconfig.json` `include: ["src/**/*.ts"]` · `e593eda:package.json` 의 tsc 스크립트는 `typecheck` 뿐 · `e593eda:.github/workflows/docs.yml` 에 tsc step 0건 | **참** |
| A5 삭제한 절에 의존하는 테스트가 있는가 | `[실행]` `grep -rn "upgradeCommandFor" src/ tests/` | 동작 단언(`local` 은 `-g` 를 받지 않는다)은 그대로. 산문만 지웠다 |
| *"호환 리다이렉트를 이 세대의 가드가 금지한다"* | `[negative]` `App.tsx` 에 `<Route path="/docs/daemon">…` 실제 추가 | `no docs source file names it` **red**. 주장 성립 → 복원 |
| `Dämon`·`守护程序` 를 스펠링 목록에 넣지 않은 근거 | `[실행]` `git log --all -S` 각각 | **둘 다 0건** — 나타난 적이 없다 |
| shipped guide 편집 후 문단이 여전히 rate 의 의미를 가르치는가 | `[독해]` `src/templates/reap-guide.md:447~449` 통독 | 해석률이 왜 중요한지(`.js`→`.ts` 미매핑 시 0, 초록 검사가 그것을 가린다)를 그대로 유지 |
| A11 의 evaluator 전제(root 5.7 vs docs 5.9) | `[실행]` `npx tsc --version` 양쪽 | **둘 다 5.9.3 — 전제가 틀렸다.** 정렬은 다른 이유(한 명령의 두 철자)로 유지 |

### 라운드 2 — blocker 2 / advisory 9 (새 evaluator, 라운드 1 앵커링 없음)

라운드 1 evaluator 가 응답하지 않아 **새 evaluator 를 띄웠다.** 결과적으로 그편이 나았다 —
라운드 1 의 결론에 매이지 않은 눈이 필요했고, **두 blocker 모두 라운드 1 의 수정 안이나 옆에 있었다.**
genome 이 예고한 그대로다.

#### B1 — 내가 § 3 을 무효화해 놓고 다시 돌리지 않았다

§ 3 의 판정 명령이 *"출력 0줄"* 이라고 적혀 있는데 **지금 2줄을 낸다.** 원인은 라운드 1 의 A4 수정이
`src/templates/reap-guide.md` 를 고쳤고 그것이 `src/` 아래 마크다운이기 때문이다.

`[실행]` 재현 → 2줄, 둘 다 guide 산문. `.ts` 의 비-주석 라인은 여전히 0.

**결론(blast radius 는 비어 있다)은 살아남지만 근거 문장이 거짓이 됐다.** § 3 이 존재하는 이유가
"재현 가능하게 하는 것"이므로 재현되지 않는 § 3 은 그 목적을 잃는다.

같은 절의 *"이 세대가 직접 손댄 `src/` 파일은 하나"* 도 거짓이다 — **15개**다
(`[실행]` `git diff --name-only -- src/`). 원래 의도는 "T0 에서 내가 추가 편집한 것"이었지만
라운드 1 이 다섯 개를 더 건드렸다.

**형태가 자기점검이 놓친 것과 정확히 반대다.** 자기점검은 *"내가 방금 바꾼 것의 수"* 를 다시 셌고,
이것은 *"내가 방금 바꾼 것이 무효화한 앞쪽 문장"* 이다. 값을 바꾼 뒤 carrier 를 re-grep 하라는
genome 규칙의 artifact 판(版)이며, **artifact 에는 grep 할 표식이 없다.**

정정: § 3 을 실제 출력으로 다시 쓰고, 왜 2줄인지와 **이 명령이 `src/` 아래 마크다운을 코드와
구분하지 못한다는 한계**를 함께 적었다.

#### B2 — sweep 테스트 헤더가 라운드 1 이 물린 404 논증을 아직 지고 있었다

`tests/unit/shipped-docs-no-daemon.test.ts:80~84` 가 여전히 *"there were none, and every `/docs/` URL
already answers 404"* 를 **개명이 안전하다는 근거로** 제시하고 있었다. 라운드 1 B3 이 그 논증을
물렸고 `01-learning.md`·backlog 는 고쳤는데 **이 파일은 승계된(staged) 부분이라 라운드 1 의
unstaged diff 가 닿지 않았다.**

**남는 사본이 중요하다** — `01-learning.md` 는 lineage 로 가고 backlog 는 소비되어 사라지지만,
이것은 **커밋되는 테스트 파일 헤더**이고 다음 세대가 "살아있는 docs 라우트를 개명해도 되는가"를
판단할 때 읽는 자리다.

정정: 측정된 것(저장소 내 링크 0건)과 측정되지 않은 것(제3자 링크는 **실제로 깨진다**)을 분리해
다시 썼다.

#### A1 — 파생이라고 적었지만 실은 파생이 아니다

`IX_DIRNAME=$(basename "$IX_PATH")` 바로 여덟 줄 위에서 `[ "$IX_PATH" != "$IX_REAL/.reap/.index" ]`
가 이미 exit 한다. 따라서 `basename` 은 **`.index` 밖에 낼 수 없고**, 내 주석의
*"not spelled here"* 는 거짓이며 `-z` 분기는 **도달 불가**다.

수정 자체는 유효하다 — 단언은 이제 발화하고(프로브로 확인), `.index` 가 이름을 바꾸면 위쪽 비교에서
먼저 red 가 된다. **거짓이었던 것은 근거뿐**이라 주석을 사실대로 고쳤다(도달 불가라는 것과,
`-z` 를 남긴 이유가 빈 값이 `-e "$FAKE_HOME/.reap/"` = 항상 참으로 무너지는 것을 막기 위함이라는 것).

#### A2 — 잠복 결함: `git ls-files` 는 비-ASCII 경로를 C-quote 한다. 고쳤다

```
$ git ls-files .reap/life/backlog | head -1
".reap/life/backlog/checkautoupdateguard-\353\212\224-…"
```

인용된 문자열은 경로가 아니므로 `existsSync` 가 false 를 내고, 내가 라운드 1 에 넣은 throw 가
**"인덱스에 있는데 디스크에 없다 — 삭제를 스테이지하라"** 라는 **틀린 원인**을 대며 터진다.
지금 sweep 대상 5개 디렉토리에 비-ASCII 경로가 없어 잠복이지만, **이 저장소는 한글 파일명을
일상적으로 만든다**(backlog 전부가 그렇다).

fail-closed 라 구멍은 아니지만 genome 의 *"부재에 원인을 하나 지목하는 것"* 바로 그 형태다.
`git ls-files -z` + NUL 분해로 고쳤다 — 인용 자체가 발생하지 않는다.

`[negative]` 2단 확인: `scripts/한글-프로브.sh` 를 tracked 로 만들고
① 무해한 내용 → **throw 없이 15 pass** ② `daemon` 포함 → **한글 경로가 그대로 찍히며 red**.
프로브 제거 후 green 복귀.

#### A3·A5·A9 — 내 문장의 거짓 셋

- **A3**: *"reapdev skill 은 `daemon-v0.2.0` 을 **정당하게 지목**하므로 제외"* — **같은 세대가 그
  이름을 지웠다.** 두 파일의 `grep -ci daemon` 은 이제 0이다. 제외 근거로 남는 것은
  "배포되지 않는 개발 skill" 하나뿐이며 그렇게 고쳤다
- **A5**: reflect 목록의 baseline 줄 번호 `:50` → **`:44`** (`[실행]` 확인)
- **A9**: **신설 backlog 에 템플릿 placeholder 3개(`## Problem` / `## Solution` / `## Files to Change`)
  가 채워지지 않은 채 남아 있었다.** REAP 규칙 위반이다. 전부 채웠다 —
  Solution 에 라우트 목록의 단일 소유자를 `App.tsx` 로 못 박고, `docs-wiring.test.ts` 의
  `declaredRoutes()` 를 재사용하라는 지시와, **배포 후 status 확인 단계를 함께 넣으라는 요구**를 적었다.
  `[실행]` `grep -c "<!--"` → **0**

#### A4 — 근거를 지워놓고 그 근거를 부르는 문장을 남겼다

guide 문단이 *"This is not hypothetical caution."* 로 시작한 뒤 **가설적 인덱서를 서술한다** —
비-가설로 만들어 주던 사실이 라운드 1 에서 삭제됐기 때문이다. 두 사본 모두
*"Concretely:"* 로 고쳤다. `[실행]` `cmp -s` → identical.

#### A6·A7 — 수용하되 고치지 않는다

- **A6**: *"이 세대 vs 승계분"* 구분은 **어떤 것으로도 재현되지 않는다.** 직전 시도가 커밋 없이
  abort 됐으므로 둘을 가르는 경계가 git 에 없다. 이 artifact 의 그 구분은 **전부 기억이며
  측정이 아니다.** 다음 세대는 그렇게 읽어야 한다 — 그래서 여기 적는다
- **A7**: environment 변경을 `environment-change` backlog 로 올리지 않았다. 규칙상 그것이 정석이나,
  **reflect 가 같은 세대 안에서 바로 처리하므로** artifact 목록으로 갈음한다. 형식상의 이탈로 기록한다

#### A8 — 스펠링 목록이 못 잡는 것 (구멍이 아니라 정책)

evaluator 가 `守護プロセス`·`守护程序`·`常駐プロセス`·`Dämon`·`17288` 및 의역
(*"the retired resident process"*, *"SQLite-backed server"*)을 직접 프로브해 **전부 통과**함을 확인했다.
전부 이 파일이 선언한 정책(*"쓰였던 것이지 쓰일 수 있는 것이 아니다"*)과 일치한다.
**남는 사각은 의역이며, 어떤 스펠링 목록도 그것에 닿지 못한다.**

#### 라운드 2 이후 재실행

`[실행]` typecheck · typecheck:docs · build · `bash -n` · sweep·wiring 테스트 green ·
`cmp -s` guide 사본 동일 · backlog placeholder 0.
전체 게이트는 § 최종 재실행에 적는다.

## 7. 최종 재실행 — 라운드 2 수정 이후

| 게이트 | 결과 |
|---|---|
| `npm run typecheck` | 통과 |
| `npm run typecheck:docs` | 통과 |
| `npm run build` | `index.js 0.63 MB`, `grammars bundled: 15` |
| `cd docs && npx vite build` | `✓ built in 2.06s` |
| `bash -n` × 3 | 구문 오류 없음 |
| `npm run test:unit` | **640 pass / 0 fail** |
| `npm run test:e2e` | **329 pass / 0 fail** |
| `npm run test:scenario` | **44 pass / 0 fail** |
| `bash scripts/check-self-diagnosis.sh` | **8개 절 전부 pass** — § 8 이 `~/.reap/daemon` 심기·제거 실행, 26 removals |
| `bash scripts/check-docs-version.sh` | `All document checks passed for v0.17.6` |
| `bash scripts/list-carriers.sh --orphans` | 1건 (`id` in `RELEASE_NOTES.md`) — 기존 그대로 |
| `reap fix --check` | **0 error / 2 warning** (gen-052 상속분) |
| backlog placeholder | `grep -c "<!--"` → **0** |
| guide 두 사본 | `cmp -s` → identical |

### 최종 sweep — 남은 것이 정확히 승인된 집합이다

`[실행]` `grep -rniE 'daemon|デーモン|데몬|守护进程|17224' .` (`.git`·`node_modules`·`dist`·`.index`·
`lineage`·`life`·`agent-memory` 제외) → **13 파일**, 전부 의도된 것:

| 파일 | 왜 남았나 |
|---|---|
| `src/cli/commands/uninstall.ts` · `update.ts` · `src/adapters/index.ts` · `src/templates/migration/v0.17.6.md` | **사용자가 유지를 명시한 청소 코드 4건** |
| `scripts/check-self-diagnosis.sh` | 위 4건의 유일한 negative test (§ 8) |
| `tests/{unit,e2e}/uninstall.test.ts` · `tests/e2e/update.test.ts` | 같은 코드의 단위·e2e 테스트 |
| `tests/unit/shipped-docs-no-daemon.test.ts` | 검사 자신 — 금지 대상을 적어야 한다 |
| `.reap/vision/design/plugin-distribution.md` · `memory/longterm.md` | 사용자가 유지를 명시 |
| `.reap/vision/memory/{mid,short}term.md` | reflect 가 갱신한다 |

**`.claude/commands/reapdev.*.md` 는 이 목록에서 사라졌다** — 라운드 1 에서 daemon 이름을 실재
태그 기반 서술로 바꿨기 때문이다. `README*.md` · `RELEASE_NOTICE.md` · `RELEASE_NOTES.md` ·
`CLAUDE.md` · `AGENTS.md` · `.reap/environment/*` 도 0건이다 (gen-094 가 처리).

## 8. 최종 판정

**완료 기준 5개 모두 충족.** 게이트 전종 통과, 회귀 없음, 보존 대상 4건 무손상이며 그중 하나는
게이트가 **실제로 실행**한다.

독립 검토 **2라운드** — blocker 5, advisory 20. 라운드 1 의 3 blocker 중 1건은 내가 만든 것이고,
라운드 2 의 2 blocker는 **둘 다 라운드 1 의 수정이 만들었거나 라운드 1 이 닿지 못한 곳**이었다.
여기에 내 자기점검이 찾은 off-by-one 3건과, **B1 을 고치는 도중 B1 이 재발한 1건**이 더 있다.
genome 의 *"라운드 N+1 의 결함은 라운드 N 의 수정 안에 있다"* 가 이 세대에서 **네 번 성립했다**.

**남은 미검증은 § 4 에 그대로 있다** — 특히 배포된 사이트를 보는 게이트의 부재(→ backlog),
`docs.yml` 신규 step 의 미실행(`[독해]`), `.claude/commands/` 축의 무검사,
제3자 링크 미측정, macOS 단독 실행, 층2 미실행.

### 라운드 3 — team lead 지시분. **명사가 아니라 사건으로 검색하니 사본이 더 나왔다**

team lead 가 R2-B1 을 독립 확인하며 **5개 로케일의 `codeIntelligencePage.statusNote`** 를 지목했다 —
**내가 개명해 살린 그 페이지의 본문이고 공개 사이트에 나간다.** 내 sweep 이 못 잡은 이유가 구조적이다:
**guard 는 명사(`daemon`)를 키로 삼는데 D 기준은 형태에 관한 것**이라, 그것을 이름 부르지 않고
서술하는 문장은 전부 통과한다.

그래서 **사건을 키로** 다시 훑었다 —
`predecessor|전신|前身|Vorgänger|five months|5개월|5 か月|fünf Monate|五个月`.

`[실행]` 그 결과 **명사 검색이 놓친 사본이 더 나왔다**:

| 위치 | 처리 |
|---|---|
| `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` `statusNote` | **수정** — 공개 사이트 본문 |
| `README.md` · `README.{ko,ja,de,zh-CN}.md` | **수정** — 같은 문단의 거울이고 **npm tarball 에 실린다** |
| `src/indexer/types.ts` `ImportStats` doc | **수정** |
| `tests/unit/indexer-import-resolver.test.ts` docblock | **수정** (해석기 결함의 *메커니즘* 서술은 살아있는 제약이라 유지) |
| `RELEASE_NOTES.md` · `RELEASE_NOTICE.md` · 로케일 `releaseNotes.versions[]` | **유지** — changelog 는 "무엇이 바뀌었나"가 본문이며, 사용자 승인 규칙의 예외 기준은 *역사성*이 아니라 **실행 가능성**이다. 따라 하면 실패하는 지시가 없다 |
| `.reap/genome/{application,evolution}.md` | **유지** — 살아있는 처방 규칙의 근거이며 daemon 은 소재다 |

남긴 것과 지운 것의 경계는 team lead 가 정한 그대로다:
*"해석률이 낮으면 그래프가 불완전하므로 빈 blast radius 는 '없음'이 아니라 '알 수 없음'"* 은
**지금 참인 사실이라 남기고**, 그 앞의 5개월·전신·CI 초록 서사를 지웠다.

#### B2 — 결정 변경: **옮겨 살렸다**

`.reap/vision/design/daemon/scip-and-scale.md` → **`.reap/vision/design/code-index-scip.md`**.
나머지 6파일은 삭제 확정. sweep 은 `existsSync(design/daemon) === false` 만 보므로 green 그대로다.

옮기면서 D 기준으로 정리했고, **그 과정에서 인계받은 주장 하나가 틀렸음을 실측했다.**

**한계 4 는 살아있지 않다 — gen-089 가 해소했다.** evaluator 와 team lead 브리핑 양쪽이
*"#1·#4 가 지금 배포되는 코드를 그대로 서술한다"* 라고 했으나, `[실행]` `src/indexer/pipeline.ts` 는
incremental 경로에서 **두 edge 종류를 전량 삭제한 뒤 전체 그래프에 대해 재해석한다**
(`removeEdgesOfKind("IMPORTS")` `:88`, `removeEdgesOfKind("CALLS")` `:195`). 스냅샷이 `refs`·`specifiers`
를 저장하므로 재파싱하지 않은 파일까지 재해석 대상이다. `tests/e2e/index-incremental.test.ts` 의
판정 기준이 **"incremental 결과 == full rebuild 결과"** 이며 edge 집합 자체를 비교한다.

**살아있는 것은 1·2·3 이다** (`[실행]` 확인): `call-resolver.ts:14~21` 의 `nameIndex` 기반 매칭 /
`graph.ts:22~26` 의 인메모리 Map / `scanner.ts:15` 의 `maxBuffer: 50MB` 와 단일 git repo 가정.

문서에 **한계 4 를 지우지 않고 취소선 + 근거**로 남겼다 — "4개 한계"라는 표현을 다른 곳에서 보고
찾아오는 사람이 어디로 갔는지 알아야 하고, **해소됐다는 사실 자체가 SCIP 의 이득을 줄이기 때문**이다.

그 밖에 고친 현재형 오서술: *"daemon 은 opt-in 이며"*(지금은 무조건 배포 — 오히려 규모 압력이 빨리
온다) · *"`daemon/src/` 1,538 lines … SQLite"*(→ `src/indexer/` 약 1,600, gzip JSON) ·
*"4개 lifecycle 진입점에서 자동 인덱싱"*(→ eager 트리거 1개) · **"MCP 는 필요 없다, HTTP API 가 이미
있으므로"**(그 API 는 없다 — 결정은 유지하되 근거가 바뀌었음을 명시).

backlog 포인터를 `git show` 복원 명령에서 **새 경로**로 바꿨다.

#### R2-A1 — 단위가 명령과 어긋났다

docblock 이 `grep -c`(**줄 수**)를 지목하면서 `grep -o | wc -l`(**출현 수**)의 숫자를 적고 "lines"
라고 불렀다. `[실행]` 실측: 줄 수 ja **5** / ko **2** / zh-CN **3**, 출현 수 8 / 3 / 6.

**단위가 load-bearing 이다** — 그 docblock 이 `daemonLines()` 바로 위에 있고 그 함수가 내는 것이
줄이며, 숫자가 존재하는 이유가 줄 기반 sweep 의 정당화다. **줄 수로 고치고, 그 숫자를 내는 명령을
함께 적고, 왜 출현 수가 아닌지도 적었다.**

#### R2-A2 — 도달 불가 가지를 지웠다

`:401` 이 `$IX_PATH != "$IX_REAL/.reap/.index"` 에서 직선으로 exit 하므로 `:409` 에서 `basename` 은
`.index` 밖에 낼 수 없다. **`-z` 가지는 도달 불가**였고, 주석의 *"여기서 철자하지 않는다"* 도
거짓이었다(`:401~402` 가 문자 그대로 두 번 철자한다). 죽은 가지를 지우고 주석을 사실에 맞췄다 —
미래 보호는 `:401` 이 이미 제공한다.

#### R2-A4 — `TypeScript 5.7` 은 틀렸다

`[실행]` `npx tsc --version` → **5.9.3**. `package.json` 이 `^5.7.0` 이라 caret 범위가 갈린 것이다.
`environment/summary.md` 를 **선언과 실제를 둘 다 적고 확인 명령을 붙이는** 형태로 고쳤다.

#### 라운드 3 이후 전 게이트 재실행

`[실행]` typecheck · typecheck:docs · build(grammars 15) · `vite build` · `bash -n` ·
**unit 640 / e2e 329 / scenario 44, 0 fail** · **자기진단 8절 전부 pass** ·
`check-docs-version` 통과 · carrier orphan **1건 유지** · `reap fix --check` **0 error / 2 warning**.

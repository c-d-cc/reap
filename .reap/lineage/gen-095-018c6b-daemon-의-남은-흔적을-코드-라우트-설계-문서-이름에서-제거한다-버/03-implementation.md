# 03 Implementation — gen-095-018c6b

**Goal**: daemon 의 남은 흔적을 코드·라우트·설계 문서·이름에서 제거한다 — 버전업 경로의 청소 코드는 남긴다

> 이 파일은 작업 진행에 따라 **append** 된다. 각 task 는 무엇을 바꿨고 무엇으로 확인했는지 기록한다.

## 승계 상태 (작업 시작 시점)

HEAD `e593eda`. 직전 abort 된 시도의 워킹트리를 승계했다 — 30 경로. 승계 검증은 `01-learning.md` § 0.

승계된 검사 `tests/unit/shipped-docs-no-daemon.test.ts` 가 **11 pass / 3 fail** 로 시작한다.
그 3 fail 이 T1~T5 의 대상이다.

---

## 작업 기록

## T0 — 승계분 D-기준 재판정

승계된 12곳의 주석 교체를 D 기준으로 다시 읽었다. `src/indexer/graph.ts` (8줄 회고 → 지금 참인 3줄)
을 기준형으로 삼았다. 이 시점에 **1곳만 과잉 잔존**이라고 판정했고, **그 판정이 틀렸다** —
§ 라운드 1 참조. 여기 적힌 것은 승계분 안에서의 재판정이고, 승계분 **밖**의(=이 세대가 편집한
파일들 안에 원래 있던) 회고 주석은 이 pass 가 보지 않았다.

- `src/indexer/index.ts` — *"…so there is nothing a warm cache would buy."* 삭제.
  사라진 대안(상주 프로세스)에 대한 **반론**이다. 앞의 측정치(단일 자릿수 ms vs CLI 시작 40-70ms)는
  지금 코드의 성질이므로 남겼다.

나머지 10곳은 유지 판정. 판단 근거를 하나씩:

| 파일 | 남은 문장의 성격 | 판정 |
|---|---|---|
| `graph.ts` / `store.ts` | 중복 edge 를 구조적으로 불가능하게 하는 **불변식** | 유지 |
| `pipeline.ts` | "파일별 `git log` 를 하지 않는다" — 되돌리지 말라는 **제약** | 유지 |
| `assets.ts` | 번들·소스 깊이를 같게 유지해야 하는 **제약** | 유지 |
| `check-version.ts` | 지금 동작(자기 버전 보고)과 처방 문구의 **짝** | 유지 |
| `index-cmd.ts` · `load-context.ts` · `prompt.ts` · `adapters/index.ts` · `claude-code/install.ts` | 지금 참인 사실 서술 | 유지 |

## T1 — `scripts/build.sh`

better-sqlite3 회고 문단 삭제. "web-tree-sitter is not that" 의 지시 대상이 사라지므로 남는 절을
자립 문장으로 재작성했다.

**제약 확인**: `environment/summary.md:13` 이 이 주석을 지목하며 *"인라인하면 깨진다는 것은 입증되지
않았다 — gen-089 가 시험했고 통과했다"* 라고 적는다. 재작성문에 *"Inlining it was tried (gen-089) and
the self-diagnosis gate still passed under node, so there is NO demonstrated breakage to point at."*
가 남아 그 문장이 여전히 참이다.

`[실행]` `grep -rn "reap:carrier(zero-native-dependency)" .` → 4곳(summary.md ×2, application.md,
build.sh). summary.md·application.md 는 daemon 을 언급하지 않는다(측정: 0건).

## T2 — `scripts/check-version-floors.sh`

`MIN_DAEMON_VERSION` 회고 문장 삭제. 남긴 것: *"One floor is worth a gate on its own: the failure mode
does not depend on how many there are, and the next floor added inherits the check."* — floor 가 하나뿐인
지금도 게이트가 있는 이유이므로 지금 참인 설계 사실이다.

## T3 — `.github/workflows/release.yml`

*"— the daemon entry that used to sit in this list was not, and stayed false for five generations."* 삭제.
남긴 것: *"Both were reproduced against the broken state before being claimed here."*

`[실행]` carrier `self-diagnosis-covered-incidents` 재-grep → 3곳
(`environment/summary.md:119`, `release.yml:62`, `check-self-diagnosis.sh:10`).
셋 다 daemon 항목을 주장하지 않는다.

## T4 — `scripts/check-self-diagnosis.sh`

**(나) 회고 산문 8곳 삭제·재작성**: 헤더의 daemon 항목 문단 / § 5 packaging 문단 / § 5 blast radius
문단 / NodeNext `dim` / duplicate-edge `dim` / 인덱스 위치 주석 / blast radius `dim` / incremental 주석.
*(처음 "7곳"이라 적었다 — 바로 아래 나열이 8개다. 자기 문장의 수를 세지 않았다.)*
각각 회고를 빼고 **지금 참인 실패 양상**만 남겼다 (예: *"A store that appends without a key multiplies
the edge count on every re-index"*).

**(가) 기능 유지** — A 코드의 유일한 negative test 다:
- `:730~735` `$UN_HOME/.reap/daemon/{indexes,registry.json}` 심기 — 주석을
  *"stale data … one of the entries `REAP_HOME_ENTRIES` allowlists for removal"* 로 고쳐 회고 없이
  **왜 심어야 하는지**(부재 단언이 스스로 실패할 수 있으려면 존재해야 한다)만 남겼다
- `:763` 사전조건 · `:810` 제거 단언 — 그대로

**(다) 죽은 코드 2건 삭제**:
- `lsof -iTCP:17224` 블록 전체. REAP 이 고를 수 없는 포트라 판별력이 0이고, 다른 프로세스가 그 포트를
  쓰면 오탐만 낸다. **성공 문구에서 `no process` 도 함께 뺐다** — 게이트가 검사하지 않는 것을 성공
  문구가 주장하면 그것이 곧 과약속이다
- `REAP_DAEMON_PORT=17288` env 지정. `[실행]` `grep -rn "REAP_DAEMON_PORT" src/ tests/ scripts/` →
  **읽는 코드 0건**
- `[ -e "$FAKE_HOME/.reap/daemon" ]` disjunct — 그 경로를 만드는 코드가 없다. `.reap/index` 쪽만 남겼다.
  **이것이 blocker 를 만들었다** — 남은 쪽의 철자가 실제 경로(`.index`)와 달라 단언이 무력해졌다.
  § 라운드 1 B1 에서 이름을 `basename "$IX_PATH"` 로 **파생**하게 고쳤다

## T5 — `.reap/genome/evolution.md`

```
- | 외부 도구 / subprocess / daemon 통합 | e2e (subprocess + 포트/HOME 격리 + git init fixture) |
+ | 외부 도구 / subprocess 통합 | e2e (subprocess + 읽는 축 전부 격리 + git init fixture) |
```

"포트/HOME" 도 함께 바꿨다 — 포트는 daemon 시절의 축이고, 바로 아래 절이 이미 *"프로세스가 읽는 축을
전부 격리한다"* 로 일반화돼 있어 표가 그것과 어긋나 있었다.

**줄 수 299 유지** (`[실행]` `wc -l` 전후 동일). 가이드라인 ~300 을 넘기지 않았다.

**`src/templates/evolution.md` 은 변경 없음** — `[실행]` `grep -n "외부 도구\|subprocess"` → 0건.
배포 템플릿(212줄)에는 테스트 레벨 표가 없다. 브리핑은 2파일로 지목했으나 측정 결과 **E 는 1파일**이다.

## T6 — 죽은 이름 (F). 개명이 아니라 **삭제**였다

**`tests/fixtures/indexer-sample/` 를 통째로 삭제했다.** 브리핑은 `package.json` 의 `daemon-sample`
이름만 지목했으나, 재확인 결과 **디렉토리 전체를 읽는 코드가 0건**이다:

- `[실행]` `grep -rn "indexer-sample" .` → `environment/summary.md:52` 한 줄뿐 (서술)
- `[실행]` `grep -rn "fixtures" tests/` → 이 fixture 를 여는 코드 없음
- `[실행]` `tests/e2e/index-command.test.ts` 통독 — **자체 fixture 를 인라인 생성**한다 (leaf/middle/top)
- `[실행]` `git log --oneline -3 -- fixtures/indexer-sample` → 마지막 커밋이 gen-089 의
  *"daemon 스위트 제거"*. 그 스위트가 유일한 소비자였고 함께 지워지지 않았다

이름만 바꾸면 고아가 그대로 남는다. **`environment/summary.md:52` 의 서술이 낡게 되므로 reflect 에서 갱신한다.**

`tests/unit/semver.test.ts:45` — `MIN_DAEMON_VERSION` 은 `src/` 에 없는 심볼이다. 주석을
*"the helper it replaced read a prerelease as satisfying its own release, in every consumer that had one"*
로 교체.

## T7 — 테스트 3개 삭제. 무엇이 검증되지 않게 되는가

| 삭제 | 대체되는가 |
|---|---|
| `e2e/index-command.test.ts` › `"the port the daemon used is not listening…"` | **아니오.** 다만 REAP 이 리스너를 여는 코드 자체가 없고, 이 검사는 **한 포트 번호**만 봐서 임의의 상주 프로세스를 잡지 못한다 — 판별력이 애초에 그 번호에 한정돼 있었다 |
| `e2e/index-command.test.ts` › `"reap daemon is no longer a command"` | **검증된 적이 없다.** `cli(dir, "daemon", "status")` 는 아무 미지의 단어로도 같은 답을 낸다. daemon 고유의 판별력이 0이다 |
| `unit/prompt-code-intelligence.test.ts` › `"nothing about a daemon, a port, or curl survives"` | **부분만.** 세 단언 중 `not.toContain("127.0.0.1:17224")` 는 sweep 이 덮는다(`17224` 가 스펠링 목록에 있다). **`not.toContain("curl")` 과 `not.toContain("/projects/")` 는 어디서도 단언되지 않는다** — 그 둘은 daemon 스펠링이 아니다. 처음 이 칸에 "예"라고 적었고 evaluator 가 과장으로 잡았다 |

같은 파일들의 회고 주석(헤더 3곳 포함)도 D 기준으로 재작성했다.

## T8 — sweep 을 `tests/` 로 확장

`tests/` 는 submodule 이라 REPO 루트의 `git ls-files tests` 가 **gitlink 한 줄만** 낸다 —
아무것도 훑지 않으면서 통과한다. `trackedInTests()` 는 listing 을 **submodule 안에서** 뜨고
경로에 `tests/` 를 붙여 되돌려, **제외 목록 하나가 양쪽을 덮는다**.

신규 제외 3건, **경로 하나에 근거 하나**:
- `tests/unit/uninstall.test.ts` — `npmRemovalTargets()` 가 `@c-d-cc/reap-daemon` 을 낸다는 단언.
  단언의 값이 그 문자열 자체다
- `tests/e2e/uninstall.test.ts` — 가짜 home 에 `~/.reap/daemon/` 를 심고 제거를 단언. 심지 않으면
  부재 단언이 실패할 수 없다
- `tests/e2e/update.test.ts` — `daemon`/`daemonBin` config 키 정리 + `~/.reap/daemon/` 삭제.
  제거를 확인하려면 먼저 그 키 이름을 써넣어야 한다

**self-proving 바닥**: `trackedInTests().length > 40` (실측 **92**). cwd 를 틀리면 1 또는 0 이 나오므로
그 상태로는 통과하지 못한다.

**부수 발견 — 인덱스와 디스크가 어긋날 때 fail-open 이 될 뻔했다.** `git ls-files` 는 **인덱스**를
보고하므로 스테이지 안 된 삭제가 있으면 디스크에 없는 파일을 낸다. 그대로 두면 `readFileSync` 가
ENOENT 스택을 던지고, 존재 여부로 건너뛰면 **fail-open** 이다. 셋째 길을 택했다 —
*"is in the git index but not on disk — stage the deletion before running this"* 로 **명시적으로 throw**.
이 상황은 negative 2 를 준비하다 실제로 만났다.

## T9 — backlog 1건 신설

`reap make backlog --type task --priority high`
→ `reapccdocs-가-전부-http-404-를-반환한다-문서-사이트가-검색에서-부재하다.md`

재현 명령·결과 / 원인(`docs.yml` 의 `cp index.html 404.html` + GitHub Pages 가 fallback 을 404 status
로 준다) / 영향(README 5개 링크 10+ · npm 페이지 · 검색 색인 부재) / 해법 후보 3종(권고: 라우트별
프리렌더) / **어떤 게이트도 배포된 사이트에 HTTP 요청을 보내지 않는다**는 축의 부재.

## 범위 밖 판정 1건 — `.claude/commands/reapdev.*.md`

두 skill 이 `git describe --match 'v*'` 를 지시하며 근거로 `daemon-v*` 태그를 든다.
`[실행]` `git tag --list | grep -v '^v'` → **`daemon-v0.2.0` 이 실재한다.** 제약은 지금도 참이므로
지시는 유지했다. 다만 근거 문장이 **현재형으로 거짓**이었다(*"daemon 은 … 발행되므로"* — 지금 그런
태그를 발행하는 것은 없다). 태그의 실재를 근거로 바꿔 쓰고 확인 명령을 함께 실었다.

이 두 파일은 **sweep 범위에 넣지 않았다** — 배포되지 않는 개발 skill 이고, `daemon-v*` 라는 실재
태그를 지목할 정당한 이유가 있어 제외 2건을 늘리는 것보다 범위 밖으로 두는 편이 정직하다.
**즉 이 축은 검사가 없다.**

---

## 검증 실행 결과

| # | 항목 | 근거 | 결과 |
|---|---|---|---|
| V1 | 트리에 daemon 흔적 0 | `[negative]` → `[실행]` | 착수 시 **3 fail**, 종료 시 green |
| V2 | `tests/` sweep | `[negative]` ×2 → `[실행]` | ① 비-제외 파일에 `daemon-sample` 심기 → red 확인 후 복원 ② fixture 를 인덱스+디스크에 복구 → red 확인 후 복원 |
| V3 | 제외 경로가 전부 실재 | `[실행]` | `existsSync` 단언 green (제외 7건) |
| V4 | 로케일 개명 누락 감지 | `[negative]` | `de.ts` 만 `daemonPage` 로 되돌림 → `TS2353` red 확인 후 복원 |
| V5 | docs 라우트 정합 | `[negative]` ×2 | ① `App.tsx` path 한 글자 삭제 → red ② `ja.ts` 키만 개명 → red. 둘 다 복원 |
| V6 | docs typecheck 가 CI 에서 도는가 | `[독해]` | `.github/workflows/docs.yml` 배선 확인. **이 세대는 워크플로를 돌리지 않았다** |
| V7 | A 보존 무손상 | `[실행]` | `uninstall`/`update` 스위트 전부 green (전체 스위트에 포함) |
| V8 | 자기진단 게이트 | `[실행]` | **8개 절 전부 pass**. § 8 이 `~/.reap/daemon` 심기·제거를 실제로 돈다 |
| V9 | 타입·빌드 | `[실행]` | `typecheck` · `typecheck:docs` · `build`(0.63MB, grammars 15) · `vite build` 전부 통과. `bash -n` 3개 스크립트 통과 |
| V10 | 세 스위트 | `[실행]` | **unit 640 / e2e 329 / scenario 44, 0 fail** |
| V11 | 문서 정합성 | `[실행]` | `check-docs-version.sh` — `All document checks passed for v0.17.6` |
| V12 | carrier orphan | `[실행]` | 1건(`id` in `RELEASE_NOTES.md`) — **기존 그대로, 증가 없음** |
| V13 | `.reap/` 구조 | `[실행]` | `reap fix --check` → **0 error / 2 warning** (gen-052 상속분 2건 그대로) |
| V14 | 값 변경 후 carrier 재-grep | `[실행]` | `zero-native-dependency` 4곳 · `self-diagnosis-covered-incidents` 3곳 — 어긋남 없음 |

### 테스트 수 증감 — 근거

baseline **unit 629 / e2e 331 / scenario 44** → **640 / 329 / 44**.

**unit +11**: 승계된 `shipped-docs-no-daemon.test.ts` 확장 **+8** / 승계된 `docs-wiring.test.ts`
신설 **+3** / 이 세대의 `"no test file names it"` **+1** / 삭제한 prompt daemon test **−1**.

**e2e −2**: `describe("e2e: reap index — no resident process")` 의 2 test 삭제 (T7).

**회귀 아님** — 증감이 전부 의도된 추가·삭제로 설명된다.

### 이 검증이 **못 하는 것**

- **배포된 사이트에 HTTP 요청을 보내는 게이트가 없다.** V4·V5 는 소스 정합성만 본다.
  `/docs/*` 가 404 라는 사실은 어떤 검사도 잡지 못하며 그것이 T9 backlog 다
- **`.github/workflows/docs.yml` 의 신규 typecheck step 은 이 세대에서 실행되지 않았다.**
  push 하지 않으므로 V6 는 `[독해]` 다. 같은 명령을 로컬에서 도는 것은 **같은 실행이 아니다**
- **`.claude/commands/` 축에는 검사가 없다** — 위 § 범위 밖 판정 참조
- **제3자 링크는 측정하지 못했다.** 저장소 안 `/docs/daemon` 참조는 0건이지만 블로그·SNS·사설
  북마크는 모른다. 복구 수단은 completion artifact 에 적는다
- **`tests/` sweep 은 tracked 파일만 본다.** 커밋되지 않은 파일은 안 보인다
- **`trackedInTests()` 의 cwd 오류는 negative 로 확인하지 않았다** — 92 vs 바닥 40 이라는 실측
  간격으로만 방어된다. `[독해]`

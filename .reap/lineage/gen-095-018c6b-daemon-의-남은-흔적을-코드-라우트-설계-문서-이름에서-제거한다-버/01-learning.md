# 01 Learning — gen-095-018c6b

**Goal**: daemon 의 남은 흔적을 코드·라우트·설계 문서·이름에서 제거한다 — 버전업 경로의 청소 코드는 남긴다

**Clarity**: **High** — goal 이 명시적이고, 유지/삭제 경계가 사용자 지시로 확정돼 있으며,
승계된 워킹트리가 작업의 절반을 이미 담고 있다. 질문은 최소화하고 실행한다.

## 0. 승계 — 무엇을 물려받았고 무엇을 직접 검증했나

직전 시도 `gen-095-6be9b6` 이 abort(`--source-action hold`) 되어 소스 작업이 워킹트리에 남아 있다.
HEAD `e593eda`, 커밋 없는 변경 30 경로.

**승계는 정당하나 검증 없는 승계는 아니다.** team lead 가 표본 확인했다고 알려온 4건을 그대로 받지 않고
직접 재현했다:

| 보존 대상 | 근거 | 결과 |
|---|---|---|
| `src/cli/commands/uninstall.ts` `DAEMON_PACKAGE` | `[실행]` `grep -n "DAEMON_PACKAGE\|daemon" src/cli/commands/uninstall.ts` | `:51` 선언 · `:64` `npmRemovalTargets()` 반환에 존재 |
| `src/cli/commands/update.ts` `removeRetiredDaemonData` | `[실행]` 같은 grep | `:31` 정의 · `:287` 호출부 존재 |
| `src/adapters/index.ts` `REAP_HOME_ENTRIES` 의 `"daemon"` | `[실행]` 같은 grep | `:172` 값 존재 |
| `src/templates/migration/v0.17.6.md` 무변경 | `[실행]` `git status --short src/templates/` | 출력 없음 = 무변경 |

승계된 diff 를 `git diff -- src/ .github/ package.json` 으로 전량 통독했다. 성격은 셋이다:
(a) 회고 주석 삭제·축약 12곳, (b) docs 페이지·라우트·5 로케일 키 개명, (c) **docs typecheck 배선 신설**
(`package.json` `typecheck:docs` + `.github/workflows/docs.yml` 의 `Typecheck docs` step).

### 0.1 그 명령이 보지 못한 것 — staged 삭제 5,364줄 (evaluator 1라운드 지적)

**`git diff` 는 staged 변경을 보지 않는다.** 승계분에는 `git rm` 으로 **staged 된 삭제 7파일**이
들어 있었고 (`.reap/vision/design/daemon/`, **5,364줄**), 위 통독은 그것을 한 줄도 보지 못했다.
잔여물 grep 도 마찬가지다 — **삭제된 파일은 grep hit 을 내지 않는다.** 두 관측 수단이 같은 방향으로
눈이 멀어 있었고, 그래서 아래 § 3 판정표에 이 7건이 없었다.

**승계된 워킹트리는 `git diff` 와 `git diff --cached` 를 따로 읽어야 한다.**

7건의 판정:

| 파일 | 성격 | 판정 |
|---|---|---|
| `indexer.md` · `open-questions.md` · `phase1~4-plan.md` (6) | 2026-05-24 의 daemon 구현 계획. 폐기된 기능의 설계서 | **삭제** — goal 에 정확히 부합 |
| `scip-and-scale.md` | **다르다** — 2026-08-19(`c7a2db1`) 에 backlog 를 **대체하려고** 만든 조사 종결 기록 | **삭제(지시) + 포인터 정정** |

`scip-and-scale.md` 는 자기 헤더가 *"조사 자체는 유효하므로 남긴다"* 라고 적고, 지목하는 4가지 한계 중
**#1(이름 기반 call resolution)과 #4(변경 파일을 참조하던 파일의 edge 미갱신)는 지금 배포되는
`src/indexer/call-resolver.ts`·`scanner.ts` 를 그대로 서술한다.** 그리고 **pending backlog** 가
그 경로를 가리키고 있었다 (`process-tracing-재설계-…md:38`).

**최종 결정 (team lead, 2026-08-22): 옮겨 살린다.**
`scip-and-scale.md` → **`.reap/vision/design/code-index-scip.md`**, 나머지 6파일은 삭제 확정.

근거는 *"daemon 흔적이 아니라 위치만 `daemon/` 밑인 SCIP·인덱서 규모 조사"* 이며,
`daemonPage` 를 지우지 않고 **개명**한 것과 같은 판단이다. 이틀 전에 backlog 를 대체하려고 만든
문서를 이틀 뒤에 지우면 **그 backlog 를 닫은 행위 자체가 무의미해진다.**

sweep 은 `existsSync(design/daemon) === false` 만 보므로 새 경로는 green 이다 (`[실행]` 확인).
backlog 포인터는 복원 명령이 아니라 **살아 있는 경로**로 교체했다.

`tests/` submodule 에는 `unit/shipped-docs-no-daemon.test.ts` 수정(+155줄)과 `unit/docs-wiring.test.ts`
신설이 있다.

## 1. 승계된 검사는 **지금 red 다** — 그것이 잔여 작업 목록이다

`[negative]` `bun test tests/unit/shipped-docs-no-daemon.test.ts` → **11 pass / 3 fail.**
검사를 만든 뒤 곧바로 통과를 보면 그 검사가 결함을 잡는지 알 수 없다. 이 검사는 스스로 먼저 실패한다:

```
(fail) no script names it
  + "scripts/build.sh: 14: # The daemon inlined a *native* module (better-sqlite3); …"
  + "scripts/check-version-floors.sh: 10: # gen-089 removed the second one (MIN_DAEMON_VERSION) …"
(fail) no workflow names it
  + ".github/workflows/release.yml: 69: # claimed here — the daemon entry that used to sit in this list was not,"
(fail) the project genome does not name it
  + "140: | 외부 도구 / subprocess / daemon 통합 | e2e (subprocess + 포트/HOME 격리 + git init fixture) |"
```

**`no source file names it` 과 `no docs source file names it` 은 이미 green 이다** — 승계된 작업이
`src/` 와 `docs/src/` 를 이미 닫았다는 뜻이고, 위 세 fail 이 정확히 남은 일이다.

## 2. 사각지대 — 검사가 보지 않는 곳

`trackedUnder()` 는 `git ls-files <dir>` 를 REPO cwd 에서 돌린다. 따라서 다음은 **검사 범위 밖**이다:

- **`tests/` 전체.** submodule 이라 REPO 의 `git ls-files tests` 는 gitlink 한 줄만 낸다.
  team lead 가 지목한 F 2건이 전부 여기 있고, 검사가 없으면 다음에 또 생긴다.
- `.reap/` 중 `genome/` 3파일을 뺀 전부 — 의도된 제외 (lineage 는 아카이브,
  memory 는 daemon 을 *소재*로 쓴 교훈 2건, `plugin-distribution.md` 는 살아있는 근거 문서).
  *(착수 시점의 검사는 `evolution.md` **하나만** 봤다. evaluator 1라운드가 그것을 fail-open 으로
  잡았고, 이 세대가 `application.md`·`invariants.md` 를 포함시켰다.)*
- `.claude/commands/` — 프로젝트 로컬 개발 skill. 아래 §4 에서 별도 판정.

## 3. 잔여 daemon 언급 전수 — 판정표

검색어: `daemon|デーモン|데몬|Dämon|守护进程|守護|17224` + 식별자형 `@c-d-cc/reap-daemon` ·
`daemon-sample` · `MIN_DAEMON_VERSION` · `REAP_DAEMON_PORT`.
제외: `.git` · `node_modules` · `dist` · `.reap/lineage/` · `.reap/life/`.

**제외 근거 (경로마다 하나씩)**:
- `.reap/lineage/` — 완료된 세대의 **아카이브**다. 과거 세대가 daemon 을 다뤘다는 사실 자체가
  기록의 내용이며, 고치면 그 세대가 실제로 한 일과 어긋난다.
- `.reap/life/` — 이 세대의 artifact 다. 이 문서가 그 안에 있고 daemon 을 다루므로 자기참조다.

| 경로 | 언급 | 판정 |
|---|---|---|
| `src/cli/commands/uninstall.ts` | `DAEMON_PACKAGE` ×8 | **유지** (A, 사용자 지시) |
| `src/cli/commands/update.ts` | `removeRetiredDaemonData` ×6 | **유지** (A) |
| `src/adapters/index.ts` | `REAP_HOME_ENTRIES` 의 값 + 주석 | **유지** (A) |
| `src/templates/migration/v0.17.6.md` | 통째 | **유지** (A). `tests/unit/shipped-source-map-rule.test.ts:37` 이 직접 읽는다 |
| `.reap/vision/design/plugin-distribution.md` | 살아있는 근거 문서 | **유지** (지시) |
| `.reap/vision/memory/longterm.md` | 2건, daemon 은 소재 | **유지** (지시) |
| `.reap/vision/memory/{mid,short}term.md` | 릴리즈 트랙 서술 | reflect 에서 갱신 (memory 의 정상 수명) |
| `.claude/agent-memory/reap-evaluate/*` | agent 개인 메모리 | 범위 밖 — 프로젝트 산출물 아님 |
| **`scripts/build.sh:14`** | better-sqlite3 회고 | **삭제** (D) — §4.1 |
| **`scripts/check-version-floors.sh:10`** | `MIN_DAEMON_VERSION` 회고 | **삭제** (D) |
| **`.github/workflows/release.yml:69`** | "the daemon entry that used to sit" | **삭제** (D) |
| **`.reap/genome/evolution.md:140`** | 테스트 레벨 표 | **교체** (E) |
| **`scripts/check-self-diagnosis.sh`** | 14곳 | **분리** — §4.2 |
| **`tests/e2e/index-command.test.ts:241~262`** | 포트 17224 + `reap daemon` | **삭제 권고** — §4.3 |
| **`tests/unit/prompt-code-intelligence.test.ts:61~69`** | `not.toContain("127.0.0.1:17224")` | **삭제 권고** — §4.3 |
| **`tests/fixtures/indexer-sample/`** | `daemon-sample` + description | **삭제** (F) — 재확인 결과 디렉토리 전체가 고아였다. `03-implementation.md` § T6 |
| **`tests/unit/semver.test.ts:45`** | `MIN_DAEMON_VERSION` 주석 | **삭제** (F) |
| `tests/e2e/uninstall.test.ts` · `tests/unit/uninstall.test.ts` · `tests/e2e/update.test.ts` | A 코드의 테스트 | **유지** — A 를 지우지 않는다면 그 테스트도 남아야 한다 |
| `tests/unit/shipped-docs-no-daemon.test.ts` | 검사 자신 | **유지** — 검사는 금지 대상을 적어야 한다 |

### `src/templates/evolution.md` 에는 해당 줄이 없다

team lead 의 브리핑은 E 를 두 파일로 지목했으나 `[실행]`
`grep -n "외부 도구\|subprocess" src/templates/evolution.md` 는 **0건**이다. 배포되는 템플릿(212줄)에는
테스트 레벨 표 자체가 없고, 그 표는 이 프로젝트가 자기 genome 에 덧붙인 것이다. **E 는 1파일이다.**
`.reap/genome/evolution.md` 는 **299줄**이고 가이드라인이 ~300 이므로 줄을 늘리지 않고 교체한다.

## 4. 판단이 필요한 세 덩어리

### 4.1 `scripts/build.sh` — 회고를 지우면 남는 문장이 매달린다

현재 주석은 "daemon 이 better-sqlite3 를 인라인했다가 깨졌다 → **web-tree-sitter 는 그것이 아니다** →
인라인을 시험했고 통과했다 → 그래도 external 을 유지하는 이유는 …" 구조다. 첫 문단을 지우면
"is not that" 의 지시 대상이 사라진다. **재작성**해야 한다.

제약: `environment/summary.md` 가 *"그 근거는 `scripts/build.sh` 주석이 소유한다 (인라인하면 깨진다는 것은
**입증되지 않았다** — gen-089 가 시험했고 통과했다)"* 라고 이 주석을 지목한다. 재작성 후 그 문장이
여전히 참이어야 한다 — 즉 **"입증되지 않았다"가 주석에 남아야 한다.**

### 4.2 `scripts/check-self-diagnosis.sh` — 기능과 산문이 섞여 있다

14곳을 셋으로 가른다.

**(가) 기능 — 유지.** A 코드의 negative test 다. 지우면 보존하기로 한 코드가 검증되지 않는다.
`:762~763` 이 `$UN_HOME/.reap/daemon/` 를 심고 `:791` 이 사전 조건을, `:841` 이 제거를 단언한다.
단 주석의 회고 부분은 D 대상이다.

**(나) 산문 — 삭제.** `:19~23` (표에서 빠진 daemon 항목 회고) · `:253~258` (packaging 회고) ·
`:259~268` (blast radius 회고) · `:401~402` `dim` (retired storage) · `:407~410` (`~/.reap/daemon/` 를
왜 썼는가) · `:448` `dim` (retired daemon 이 준 답) · `:453~455` (retired pipeline 회고).

**(다) 죽은 코드 — 삭제 권고.**
- `:474~483` `lsof -iTCP:17224` 블록. **REAP 이 고를 수 없는 포트 번호**이므로 판별력이 0이고,
  개발자가 그 포트에 다른 것을 띄우면 오탐만 낸다. FAIL 문구가 *"the daemon port"* 라고 자칭한다.
- `:797~801` `REAP_DAEMON_PORT=17288`. `[실행]` `grep -rn "REAP_DAEMON_PORT" src/ tests/ scripts/` →
  **읽는 코드 0건.** 죽은 env var 다.

### 4.3 `tests/` 의 포트·명령 단언 2건 — 삭제 권고 (team lead 판단 요청)

- `tests/e2e/index-command.test.ts` 의 `describe("e2e: reap index — no resident process")` 2 test.
  하나는 `fetch("http://127.0.0.1:17224/health")` 로 부재를 단언하고, 다른 하나는
  `reap daemon status` 가 ok 가 아님을 단언한다. 후자는 **아무 미지의 단어**로도 통과하므로
  daemon 고유의 판별력이 없다.
- `tests/unit/prompt-code-intelligence.test.ts` 의 `"nothing about a daemon, a port, or curl survives"`.
  문자열 negative guard 이며, `shipped-docs-no-daemon.test.ts` 가 `src/` 전체를 쓸게 된 지금
  `src/core/prompt.ts` 는 이미 그쪽이 덮는다.

**이것은 테스트 3개를 지우는 기능적 변경이므로 planning 보고에서 명시하고 진행한다.**
baseline 이 unit 629 / e2e 331 에서 내려갈 수 있으며, 그 증감을 근거와 함께 보고한다.

## 5. 이미 측정된 것 — 재현

**`https://reap.cc/docs/*` 는 전부 HTTP 404 다.** `[실행]` `curl -s -o /dev/null -w '%{http_code}' -L`:

```
404  https://reap.cc/docs/daemon
404  https://reap.cc/docs/code-intelligence   ← 개명 후 라우트도 같다
404  https://reap.cc/docs/introduction
200  https://reap.cc/
```

**개명은 status 를 바꾸지 않는다.** 그러나 **status 는 이 질문을 판정하지 못한다** —
아래 § 5.1 참조.

`[실행]` `curl -s "https://api.npmjs.org/downloads/point/last-month/@c-d-cc/reap-daemon"` →
`{"downloads":151,"start":"2026-07-21","end":"2026-08-19"}`. **이 수치가 결정하는 것은 없다** —
A 를 전부 유지하기로 확정됐으므로.

`[실행]` `grep -rn "docs/daemon" .` (lineage/life 제외) → **0건.** 저장소 안에 죽은 링크는 없다.

### 5.1 정정 — status 로는 판정할 수 없다 (evaluator 1라운드 지적, 재현함)

처음 이 절에 *"`DaemonPage.tsx` 의 문장은 세지 않았을 뿐 아니라 방향이 반대였다"* 라고 썼다.
**그 결론이 틀렸다.**

`[실행]` `curl -s -o /tmp/d.html -w 'status=%{http_code} size=%{size_download}' -L https://reap.cc/docs/daemon`
→ `status=404 size=939`, 그리고 그 본문이 `<script`·`id="root"` 를 담은 **SPA 셸이다**.
즉 GitHub Pages 가 404 status 와 함께 **작동하는 앱을 내려준다** — wouter 가 부팅해
`/docs/daemon` 이 **지금은 Code Intelligence 페이지를 정상 렌더한다.**

**개명 후 같은 URL 은 NotFound 를 렌더한다.** 따라서 *"링크가 깨진다"* 는 주장은 **실질적으로
옳았고**, 틀린 것은 그 주장이 든 근거(status)뿐이다. 모든 `/docs/*` 가 404 이면서 정상 내용을 내므로
**status 는 이 질문을 판정하는 수단이 아니다** — 존재하는 라우트와 존재하지 않는 라우트가
같은 답을 낸다.

**개명을 유지하는 실제 근거는 이것이다** (측정된 것만):
- `[실행]` 저장소 안 `/docs/daemon` 참조 **0건**. README·docs·workflow 어디도 그 URL 을 걸지 않는다
- **제3자 링크는 측정 수단이 없다** — 블로그·SNS·사설 북마크가 그 URL 을 가리킬 수 있고, 그들에게는
  **오늘 뜨던 페이지가 개명 후 NotFound 가 된다.** 이것이 이 개명의 실제 비용이다
- 이름의 정본은 `~/.reap/reap-guide.md` 의 `## Code Intelligence` 이며 가이드가 그것을 소유한다

**복구 수단**: `App.tsx` 에 `<Route path="/docs/daemon">{() => <Redirect to="/docs/code-intelligence" />}</Route>`
한 줄. 단 **이 세대가 만든 가드가 그것을 금지한다** — `offendersUnder("docs/src")` 가 `App.tsx` 에서
`daemon` 을 보고 red 가 된다. 되살리려면 그 경로를 EXCLUDED 에 근거와 함께 넣어야 한다.

## 6. 범위 밖이지만 반드시 올릴 것

**`https://reap.cc/docs/*` 전부가 404 라는 사실 자체가 결함이다.** README 5개가 거는 링크만 10개 넘고
npm 패키지 페이지도 영문 README 를 싣는다. 검색엔진은 404 를 색인하지 않으므로 문서 사이트가 검색에서
사실상 부재하다. **어떤 게이트도 배포된 사이트에 HTTP 요청을 보내지 않아 5개월 이상 안 걸렸다.**

implementation 단계에서 `reap make backlog --type task` 로 올린다 (adapt 아님 — adapt 에서는 backlog 를
만들지 않는다).

## 7. 관련 코드·문서 지도

`environment/source-map.md` 를 먼저 읽었다. 이 세대가 만지는 것과 그 소유 관계:

- `scripts/check-self-diagnosis.sh` — 자기진단 게이트, 8개 절. carrier `self-diagnosis-covered-incidents`
  를 `.github/workflows/release.yml` 과 **공유**한다. 한쪽만 고치면 어긋난다.
- `scripts/build.sh` — carrier `zero-native-dependency` 를 `environment/summary.md` 와 공유.
- `docs/` — 본 repo 안의 Vite+React 앱. 콘텐츠는 5 로케일 TS 객체이며 `Translations = typeof en` 이라
  **하나만 개명하면 `tsc -p docs` 가 red** 다. 그 게이트가 이 세대 이전에는 없었다.

## 8. 다음 단계

planning 에서 task 로 분해하고, 검증 항목마다 `[실행]`/`[negative]`/`[독해]` 근거 종류를 미리 못 박는다.

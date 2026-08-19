# Implementation

## Completed Tasks

| # | Task | 결과 |
|---|---|---|
| T001 | 자기진단 게이트에 daemon 절 추가 (**먼저 실패시킴**) | 완료 — 아래 § 검사 유효성 근거 |
| T002 | daemon 빌드에서 네이티브/WASM 의존을 external 로 | 완료 — 번들 182KB → 45KB |
| T003 | `QUERIES_DIR` 위치 해석 | 완료 — 분기 대신 helper 위치로 해소 |
| T004 | `daemon/package.json` 발행 준비 | 완료 — 73KB/전체 → 14.2KB/17파일 |
| T005 | `/health` 에 `version` | 완료 |
| T006 | daemon 자체 테스트 | 130 pass / 0 fail |
| T007 | reap `dependencies` 에서 daemon 제거 | 완료 — `yaml` 만 남음 |
| T008 | `resolveDaemonBin` 3단계 + 폴백 경로 수정 | 완료 — 아래 § 발견 |
| T009 | `MIN_DAEMON_VERSION` + `resolveDaemonAvailability` | 완료 |
| T010 | `ensureDaemon` 미설치 분기 | 완료 (`DaemonNotInstalledError`) |
| T011 | `daemon status/index/query` 상태 구분 | 완료 |
| T012 | `lifecycle.ts` silent-fail 유지 | 완료 (문서화만 — 기존 catch 가 이미 흡수) |
| T013 | learning emit `daemonInstalled` | 완료 |
| T014 | prompt 미설치 시 설치 안내로 대체 | 완료 |
| T015 | `fix --check` daemon 진단 | 완료 |
| T016 | `release.yml` `daemon-v*` publish job | 완료 — publish 실행 안 함 |
| T017 | S5 정정 + carrier 표식 + 세 주장 검증 | 완료 (환경 1곳은 reflect 에서) |
| T018 | reap-guide 설치 요구사항 (템플릿 + 프로젝트 사본) | 완료 — 두 파일 동일 |
| T019 | docs 5개 로케일 + DaemonPage 렌더링 | 완료 — 빌드 + 문서 게이트 통과 |
| T020 | 신규/수정 테스트 | 완료 — unit +19, e2e 기존 파일 보강 |
| T021 | 전체 스위트 회귀 | **unit 492 / e2e 278 / scenario 44, 0 fail** |
| T022 | assertion 별 negative test | 완료 — 4/4 |
| D-2 | (발견) daemon 런타임 의존이 사라짐 → npm workspaces | 완료 |
| T023 | (evaluator HIGH-1) 게이트가 daemon 을 직접 빌드 | 완료 |
| T024 | (evaluator HIGH-2) 설치된 reap ↔ 설치된 daemon 연결 assertion | 완료 (§ 5e) |
| T025 | (evaluator MEDIUM-3) daemon build 명령 단일 소유자화 | 완료 |
| T026 | (evaluator MEDIUM-4) README 2종의 허위 주장 정정 | 완료 |
| T027 | (evaluator MEDIUM-5 / LOW) e2e assertion 강화 + 2건 수정 | 완료 |
| T028 | (evaluator 2회차) 5e 의 parse 실패 구멍 차단 | 완료 |
| T029 | (evaluator 2회차) bun/node 런타임 비대칭 해소 | 완료 |
| T030 | (신규) 번들에 빌드 머신 경로가 없는지 — 기계 독립 assertion | 완료 |
| T031 | strict resolver 파손을 backlog + "알려진 파손"으로 기록 | 완료 |

## 검사 유효성 근거 — 고치기 전에 세 번 실패시켰다

genome § *"검사를 만들 때 먼저 실패시켜라"* 에 따라, 각 결함이 **개별로** 검사에 걸리는 것을 확인했다. 세 번의 실패가 서로 다른 원인이었다는 점이 중요하다 — 하나의 assertion 이 세 결함을 뭉뚱그려 잡은 것이 아니다.

### 실패 1 — reap 이 여전히 daemon 을 dependency 로 들고 있다

```
Checking the daemon...
  FAIL  the reap tarball still depends on @c-d-cc/reap-daemon
        dependencies: @c-d-cc/reap-daemon yaml
```

### 실패 2 — 설치는 되는데 node 가 네이티브 바인딩을 못 찾는다

dependency 제거 후:

```
  ok    reap ships without the daemon (yaml)
  ok    daemon installs standalone
  FAIL  the installed daemon extracted no symbols

        index response: {"status":"error","error":"Indexing failed: Error: Could not
        locate the bindings file. Tried:
         → …/node_modules/@c-d-cc/reap-daemon/build/better_sqlite3.node
         → … (13개 경로 모두 패키지 루트 기준)"}
```

`node_modules/better-sqlite3/build/Release/` 에 정상 설치된 바이너리를 **보지 못한다**. 번들이 `bindings` 를 인라인해 탐색 기준점이 번들 위치로 바뀌었기 때문.

### 실패 3 — 이제 뜨긴 하는데 심볼이 0개

external 적용 후:

```
  ok    daemon installs standalone
  FAIL  the installed daemon extracted no symbols

        index response: {"status":"ok","data":{"filesProcessed":1,"nodesCreated":0,
                         "edgesCreated":0,"duration":567,...}}
```

**`status: "ok"` 이고 `filesProcessed: 1` 인데 `nodesCreated: 0`.** 검사가 "인덱싱이 성공했는가"를 물었다면 통과했을 상태다. 심볼 수를 묻기로 한 판단이 여기서 값을 했다.

### 통과

세 결함을 모두 고친 뒤:

```
  ok    reap ships without the daemon (yaml)
  ok    daemon installs standalone
  ok    installed daemon indexes and answers under node (3 symbols)

Self-diagnosis passed for v0.17.4.
```

## 구현 노트

### T001 — 검사는 소스 트리를 아예 보지 않는다

`check-self-diagnosis.sh` § 5 신설 (OpenCode 절은 § 6 으로 이동). 설계 원칙 넷:

- **tarball 에서만 판단한다.** 소스 트리에서는 `file:./daemon` 심링크가 해석되므로 결함이 보이지 않는다. 이것이 결함이 세 세대를 살아남은 이유다
- **bun 이 아니라 node 로 실행한다.** `detectRuntime()` 은 bun 을 선호하되 node 로 폴백한다. bun 만 로드할 수 있는 번들은 bun 없는 사용자에게 깨진 것이다
- **판정은 startup 이 아니라 심볼 수.** 뜨고, health 에 답하고, 인덱싱 성공을 보고하면서 심볼이 0개인 상태가 정확히 이 결함이 남긴 모습이다
- **완전히 독립적이다.** 자기 HOME / 자기 포트(17296) / 자기 설치 디렉토리. 앞 절들과 상태를 공유하지 않는다 — D4 후퇴(release 전용으로 이동)가 호출 한 줄이어야 하기 때문. **끄는 환경변수는 두지 않는다** (fitness 에서 유저 결정, 아래 § 마무리 참조)

### T002 — external 로 두는 것이 published package 의 정상 형태

`--external better-sqlite3 --external web-tree-sitter --external tree-sitter-wasms`. 번들이 네이티브 모듈을 인라인하면 `bindings` 의 탐색 기준점이 번들 위치가 되어 npm 이 설치한 실물을 못 본다. external 로 두면 node 의 통상 해석이 적용된다 — 배포 패키지가 원래 그래야 하는 방식.

### T003 — 디렉토리 이름을 정확히 본다

`basename(here) === "dist"` 로 판정한다. 기존 reap 쪽 helper 들은 `here.includes("dist")` 를 쓰지만, daemon 번들은 `dist/` 바로 아래 놓이므로 정확 일치가 가능하고 **경로에 우연히 "dist" 가 들어간 곳에 설치된 패키지를 번들로 오인하지 않는다**.

## Discovered Tasks

### D-1. `__dirname` 은 번들에 **빌드 시점 문자열로 박힌다** — 배포본이 개발 머신 경로를 들고 나갔다

계획에 없던 발견이며, 폴백 경로가 왜 한 번도 맞은 적이 없었는지에 대한 **진짜 답**이다.

게이트에 `fix --check` assertion(5b)을 넣자 격리 설치 환경에서 경고가 뜨지 않았다. 번들에 디버그 출력을 넣어 확인:

```
DBG __dirname= /Users/hichoi/cdws/reap/src/cli/commands/daemon
DBG resolve threw MODULE_NOT_FOUND
```

**격리된 전역 설치본이 개발자 머신의 소스 경로를 들고 있었다.** `bun build --target node` 는 전역 `__dirname` 을 런타임 값으로 남기지 않고 **빌드 시점 원본 모듈 경로 리터럴로 치환**한다.

결과적으로:
- 배포된 v0.17.4 번들에는 `/Users/hichoi/cdws/reap/src/cli/commands/daemon` 이 **문자열로 들어 있었다**
- 기존 폴백 `join(__dirname,"..","..","..","daemon","dist","index.js")` 는 모든 사용자 디스크에서 **빌드한 사람의 체크아웃**을 가리켰다
- 내 격리 테스트가 "설치됨"으로 판정된 것도 이 때문 — 그 경로가 **이 머신에는 실제로 존재**했다

01-learning.md 은 폴백이 "dev 에서도 안 맞는다"까지 짚었지만, 원인을 상대경로 계산 착오로 봤다. 실제 원인은 그보다 아래층이었다.

**수정**: `dirname(fileURLToPath(import.meta.url))`. 이 저장소의 **다른 모든 경로 helper 가 이미 그렇게 한다** (`template.ts`, `migrate.ts`, `init/common.ts`, 양쪽 adapter). daemon client 만 전역 `__dirname` 을 썼다 — genome § *Pattern-first / Consistency over preference* 를 어긴 자리가 정확히 결함이 난 자리다.

**확인**: `grep -c '/Users/hichoi/cdws/reap/src' dist/cli/index.js` → 수정 전 1, 수정 후 **0**.

이 결함은 **게이트를 추가하지 않았다면 발견되지 않았다.** 소스 트리에서는 그 리터럴 경로가 맞으므로 모든 로컬 검증을 통과한다.

## 헤더의 세 주장을 전부 검증했다 — 그리고 두 번째는 재현 방법이 달랐다

backlog Verification 9번(*"하나가 거짓이었으므로 나머지도 확인 대상이다"*)에 따라, 헤더가 "이 게이트에 걸린다"고 주장하는 세 사례를 **각각 결함을 재현해** 게이트가 실제로 실패하는지 확인했다.

| 사례 | 재현 방법 | 결과 |
|---|---|---|
| gen-074 daemon | 원래 코드 그대로 | **FAIL** — 세 단계로 (위 § 검사 유효성 근거) |
| #22 | gen-076 **이전 구조** 일시 복원 (`~/.claude/commands/` 무가드 스캔) | **FAIL** — `19 finding(s)` |
| gen-080 | `toOpenCodeAgent` 를 우회해 원본 frontmatter 그대로 write | **FAIL** — `Invalid input: expected record, received string tools` |

**#22 는 첫 시도로 재현되지 않았다.** `userLevelDirs()` 를 `[]` 로, 그다음 엉뚱한 경로로 바꿔봤지만 둘 다 통과했다. 이유는 gen-076 이 `~/.claude/commands/` 스캔 자체를 **제거**했기 때문이다 — checker 가 그 위치를 아예 보지 않으므로 "checker 가 다른 곳을 안다"고 만들어도 아무 일도 일어나지 않는다. #22 의 형태는 *checker 가 installer 의 위치를 보면서 legacy 라고 부르는 것*이고, 그건 그 시절 코드를 되살려야 재현된다.

**교훈**: "결함을 재현한다"는 것은 **그 결함의 형태를 되살리는 것**이지, 관련 코드를 아무렇게나 망가뜨리는 것이 아니다. 첫 두 시도는 게이트가 통과하는 것을 보고 "#22 주장도 거짓"이라고 결론지을 뻔했다. 실제로는 내 변형이 #22 가 아니었다.

### D-2. dependency 를 떼자 daemon 의 **런타임 의존**이 통째로 사라졌다

e2e 회귀에서 daemon 관련 6건이 실패했다:

```
Indexing failed: ResolveMessage: Cannot find package 'web-tree-sitter'
  from '/Users/hichoi/cdws/reap/daemon/src/indexer/parser.ts'
```

`daemon/node_modules` 에는 `@types` 만 남아 있었다. **`file:./daemon` 이 있는 동안 npm 이 daemon 의 런타임 의존을 루트로 hoist 해 왔고**, 그 선언을 제거하자 루트가 더 이상 설치하지 않게 된 것이다. daemon 을 소스에서 띄우는 모든 경로(e2e helper 21개 포함)가 그 hoist 에 의존하고 있었다.

**수정: npm workspaces (`"workspaces": ["daemon"]`).**

- `npm ci` 한 번으로 daemon 의존까지 설치된다 — **CI 워크플로 변경이 필요 없다**. 테스트는 별도 저장소(`reap-test`)의 워크플로가 `npm ci` 만 실행하므로, 이쪽에서 해결되지 않으면 그쪽을 고쳐야 했다
- workspace 는 **런타임 의존이 아니다.** 발행본의 `dependencies` 는 `yaml` 하나 그대로이고, 소비자의 npm 은 의존 패키지의 `workspaces` 필드를 처리하지 않는다. 게이트의 5a assertion 이 이것을 계속 검사한다
- D5(monorepo 유지 + 발행만 분리)와 정확히 맞는 형태다

**이 실패는 테스트를 돌렸기 때문에 잡혔다.** 게이트(tarball 경로)는 이 결함을 보지 못한다 — 소스 트리에서 daemon 을 띄우는 것은 게이트의 관심사가 아니기 때문이다. 두 검증이 서로 다른 것을 보고 있다는 점이 여기서 드러났다.

## Validation 회귀 — evaluator 가 blocking 결함 2건을 찾았다

`config.evaluator: true` 이므로 validation 에서 `reap-evaluate` 를 advisor 로 호출했다. 판정은 **partial** 이었고, 근거가 타당해 **implementation 으로 회귀**했다 (`reap run back`). concern 은 `report-evaluator --severity high` 로 state 에 기록했다.

### HIGH-1 — 새 게이트가 "내 트리에서만 동작" 상태였다

게이트 § 5c 가 `cd daemon && npm pack` 하는데, **`daemon/dist` 는 gitignore 되어 있고 아무 워크플로도 빌드하지 않는다.**

```
$ git ls-files daemon/dist | wc -l
0
$ grep -n dist .gitignore
2:dist/
3:daemon/dist/
```

CI 는 `npm ci` → `npm run build`(루트 번들만) → 게이트 순이다. 내 로컬에서 통과한 이유는 **내가 손으로 `bash daemon/scripts/build.sh` 를 돌려둔 dist 가 남아 있었기 때문**이다. 다음 push 에서 red 가 됐을 것이다.

이 결함이 아프게 정확한 이유: **본 세대가 없애려던 실패 양상을, 그것을 없애려고 만든 검사 자신이 갖고 있었다.** 게이트 헤더는 "소스 트리를 아예 보지 않는다"고 적어놨는데, **빌드 입력에 대해서는 정확히 소스 트리를 보고 있었다.**

수정: 게이트가 pack 전에 `npm run build` 를 직접 실행한다. `daemon/dist` 를 지우고 돌려 통과하는 것으로 확인했다.

### HIGH-2 — Verification #2 를 충족으로 적었는데 실제로 검증되지 않았다

backlog Verification #2 는 *"설치 → `daemon: true` 프로젝트에서 `reap daemon status` 가 정상 응답"* 이다. 04-validation.md 은 이를 "게이트 § 5c/5d" 로 대응시켰는데, **5c/5d 는 `$REAP_BIN` 을 한 번도 호출하지 않는다.** daemon 을 별도 디렉토리에 설치해 `node` 와 `curl` 로 직접 돌릴 뿐이다.

즉 게이트는 (a) reap 이 daemon 을 안 싣는다 (b) 없으면 알려준다 (c) daemon 이 단독으로 동작한다 — 셋을 증명하지만, **셋을 잇는 고리는 증명하지 않는다.** 사용자가 둘 다 설치하고도 아무것도 못 얻는 세계에서 전부 초록이다. **패키지를 쪼갠 것이 만든 바로 그 이음매**라 검토에 맡길 수 없다.

수정: § 5e 신설. 같은 `$PREFIX` 에 daemon 을 설치하고 (1) 5b 의 경고가 **사라지는지**, (2) `reap daemon status` 가 실제로 daemon 을 **띄우는지** 확인한다. 경로를 해석하는 것과 spawn 하는 것은 다른 문제다.

negative test: daemon 설치 단계를 건너뛰자 `reap still reports the daemon as missing after installing it` 로 FAIL.

### MEDIUM 2건 — 둘 다 본 세대가 없애려던 결함의 형태였다

- **build 명령의 두 번째 소유자**: `daemon/scripts/build.sh` 에 `--external` 을 넣었지만 `daemon/package.json` 의 `"build"` 는 **옛 명령 그대로**였다. `npm run build -w daemon` 이 부르는 것은 후자이고, 그것은 이번에 진단하느라 실패 한 사이클을 쓴 바로 그 번들을 다시 만든다. 공유 가능한 형태(`"build": "bash scripts/build.sh"`)가 있었으므로 표식이 아니라 공유로 해소했다
- **README 2종이 여전히 "REAP ships a local code-intelligence daemon"** 이라고 말하고 있었다. S5 는 허위 주장을 없애는 항목이고, README 는 **npm 패키지 페이지에 그대로 뜨는 가장 많이 읽히는 문서**다. backlog 의 Files to Change 에 없었지만 목표에는 명백히 포함된다

### LOW 2건 수정 / 3건 backlog

수정: `installCommand.split(" ").pop()` 로 패키지 이름을 되뽑던 것 → `DaemonAvailability.packageName` 으로 운반. 폴백 후보가 `daemon/dist/index.js` 로 끝나 **`daemon` 이라는 실재하는 npm 패키지를 우리 것으로 오인**할 수 있던 것 → 옆 `package.json` 의 `name` 확인.

backlog 등록: daemon typecheck 상시 red / `semverGte` prerelease 미구분 / `MIN_DAEMON_VERSION` 을 올릴 때 그 버전이 실제 발행됐는지 검사.

### 이 회귀에서 배운 것

evaluator 가 잡은 두 HIGH 는 **내가 돌린 모든 검증을 통과한 상태**였다. 테스트도, 게이트도, 문서 게이트도 전부 초록이었다. 잡힌 이유는 evaluator 가 *"이 검사가 통과한다는 것이 무엇을 증명하는가"* 를 물었기 때문이지, 무언가를 더 실행했기 때문이 아니다.

gen-064 의 *"사용자 직접 테스트가 e2e 가 못 잡는 갭을 잡는다"* 와 같은 구조이되, 이번에는 **독립 검토자가 그 역할을 했다.**

## Validation 2차 회귀 — evaluator 2회차 (판정 pass, conditional)

### T028 — 부재를 주장하는 assertion 은 스스로를 먼저 증명해야 한다

§ 5e 의 경고 소멸 확인이 이렇게 되어 있었다:

```js
let ctx={}; try { ctx=(JSON.parse(raw).context)||{}; } catch {}
console.log((ctx.warnings||[]).join("\n"));
```

`fix --check` 가 크래시하거나 JSON 이 아닌 것을 뱉으면 `ctx={}` → `warnings=[]` → grep 실패 → **green**.

**이 세대가 고치는 결함이 정확히 이 형태다** — 아무 일도 일어나지 않은 것이 성공과 구별되지 않는 것. 그 결함을 고치는 세대의 핵심 assertion 이 같은 병을 갖고 있으면 게이트는 자기가 막으려는 것을 통과시킨다.

**5b 와 5e 의 비대칭**이 원인이다. 5b 는 경고의 **존재**를 주장하므로 자기증명적이다 — 나오지 않은 출력에서 무언가를 찾을 수는 없다. 5e 는 **부재**를 주장하고, 부재는 크래시·비정상 출력·필드명 변경과 구별되지 않는다.

수정: `status === "ok"` 이고 `warningCount` 가 **숫자**임을 먼저 요구한다. 두 조건 중 하나라도 어긋나면 `BAD_JSON` / `BAD_SHAPE` 로 FAIL. 이 비대칭의 이유를 코멘트에 남겨 다음 사람이 같은 자리에 같은 구멍을 다시 내지 않게 했다.

**negative test**: `fix --check` 를 없는 서브커맨드로 치환 →

```
  FAIL  fix --check did not produce a usable answer (BAD_JSON)
        (no output)
```

수정 전이라면 이것이 **green** 이었다.

### T029 — bun 을 선호한다는 사실이 node 조합을 통째로 가렸다

`detectRuntime()` 은 bun 을 선호하므로 § 5e 의 첫 호출은 **bun 으로만** 연결을 증명했다. § 5d 는 node 로 돌리되 **reap 을 거치지 않는다**. 즉 **bun 없는 사용자가 실제로 겪는 조합(reap 이 node 를 spawn)은 아무것도 검증되지 않았다.**

이것은 `bindings` 결함을 세 세대 동안 숨긴 바로 그 비대칭이 **한 층 위로 옮겨간 것**이다. 방금 그 병을 진단해 놓고 residual 로 적어두는 것은 발견을 낭비하는 것이다.

수정: `PATH` 앞에 `exit 127` 하는 `bun` 스텁을 두고 `daemon status` 를 한 번 더 호출한다. `detectRuntime` 은 `bun --version` 이 throw 하면 node 로 폴백하므로 이것으로 충분하다. **추가 설치가 없어 러너 비용은 spawn 한 번뿐이다.**

**negative test**: 폴백 반환값을 `"definitely-not-node"` 로 바꿈 → `Error: spawn definitely-not-node ENOENT` 로 FAIL.

### T030 — D-1 을 기계 독립적으로 잡는 assertion (신규 발견)

팀 리드 지시대로 **D-1 수정을 되돌려** § 5e 가 fail 하는지 확인했다. fail 했지만 **5b 에서** 걸렸고, 확인해보니 **이 머신에서만 그렇다**:

- 박힌 리터럴이 이 머신에는 실존 → 격리 설치본이 개발자 daemon 을 찾음 → "미설치 경고 없음" → 5b FAIL
- **다른 머신이라면** 그 경로가 없어 5b 는 통과하고, 5e 는 daemon 을 정식 설치하므로 `require.resolve` 가 성공해 **역시 통과한다**

즉 **게이트가 D-1 을 잡는 것은 우연이었다.** 팀 리드가 요구한 "assertion 이 무력하지 않다는 근거"를 만들려면 기계 독립적인 것이 필요했다.

**§ 5a-bis 신설**: 발행 tarball 의 번들에 **빌드된 디렉토리 경로(`$ROOT`)가 문자열로 들어있지 않을 것**. 원인을 직접 본다.

**negative test 가 assertion 자신의 결함을 잡았다.** 첫 구현은 이랬다:

```bash
if tar -xzOf ... | grep -qF "$ROOT"; then
```

D-1 을 되돌리고 돌리자 경로를 **출력하면서도 통과**했다. `set -o pipefail` 이 걸려 있고 `grep -q` 가 첫 매치에서 종료해 tar 가 SIGPIPE 를 받는다 → 파이프라인이 tar 의 실패를 보고 → `if` 가 false → **매치가 통과가 된다.**

변수로 받아 grep 하도록 고친 뒤:

```
  FAIL  the reap bundle contains the path it was built from
        /Users/hichoi/cdws/reap
```

**negative test 를 돌리지 않았다면 무력한 검사를 초록으로 확인하고 넘어갔을 것이다.**

### T031 — pnpm / Yarn PnP 는 "미검증"이 아니라 "알려진 파손"

daemon 이 **의도적으로** dependency 가 아니므로, 선언되지 않은 패키지 접근을 차단하는 strict resolver 에서는 `require.resolve` 가 **원리적으로** 실패한다. 그리고 원래보다 엄밀히 더 나쁘다 — 그 사용자는 daemon 을 정상 설치하고도 **영구히 "설치하라"는 안내**를 받고, § 5e 는 seam 이 건강하다고 보고한다. 이전 결함은 최소한 조용했다.

우회(`REAP_DAEMON_BIN` / `daemonBin:`) 구현은 범위 확장이라 backlog 로 넘겼다. 완료 artifact 에는 조합별로 **무엇이 깨지는지** 한 줄씩 적었다 — 일반적 caveat 나열은 읽히지 않는다.

### 나머지 non-blocking

- **비정수 처리**: `[ "$DM_NODES" -le 0 ] 2>/dev/null` → `case` 로 비정수를 0 으로 정규화한 뒤 비교. 뒤의 심볼 이름 grep 이 backstop 이지만 고치는 비용이 작았다
- **개발자 작업 트리 영향 명시**: 게이트가 `daemon/dist` 를 지우고 재빌드한다. gitignore 대상이라 무해하지만 헤더가 "로컬에서 안전"이라고 광고하므로 예외로 한 줄 적었다
- **이중 설치 비용**: `better-sqlite3` 가 5c(`DM_INSTALL`)와 5e(`PREFIX`) 두 번 설치된다. D4 가 측정하지 않기로 한 그 비용이므로 완료 artifact 의 미측정 리스크 절에 명시했다

## 구현 노트 — Phase 2/3

### T004 — tarball 이 73KB/전체에서 14.2KB/17파일로

`files: ["dist/","queries/"]`. `queries/` 는 런타임 자산이므로 필수이고, 게이트가 그 존재를 직접 assert 한다. 발행 메타(`license`, `repository.directory`, `homepage`, `bugs`, `engines`, `publishConfig.access`)도 함께 채웠다.

**버전은 0.1.0 → 0.2.0.** 근거는 02-planning.md § D1. `MIN_DAEMON_VERSION` 이 `"0.1.0"` 이면 어떤 발행본도 통과해 검사가 공허해진다. 이 bump 는 **reap 패키지 버전과 무관**하며 되돌리기는 한 줄이다.

### T005 — `/health` 의 `version` 은 판정이 아니라 표시

판정 근거는 **설치된 패키지의 버전**이다 (02-planning § D1). `/health` 의 값은 `reap daemon status` 가 "실행 중인 것"과 "설치된 것"을 나란히 보여주기 위한 것이다 — daemon 은 idle 30분까지 살아 있으므로 업그레이드해도 낡은 프로세스가 계속 응답할 수 있고, 그건 "설치가 낡았다"와 다른 상태다.

`package-assets.ts` 를 신설해 `packageRoot()` / `queriesDir()` / `packageVersion()` 을 한 곳이 소유하게 했다. **`src/` 바로 아래에 두면 소스와 번들의 상대 깊이가 일치**하므로 dist/dev 분기가 아예 필요 없다 — queries 결함이 났던 이유가 `src/indexer/`(깊이 2)에 있었기 때문이므로, 깊이를 고정하는 편이 분기를 정확히 쓰는 것보다 낫다.

### T009~T011 — 세 상태를 뭉개지 않는다

`not installed` / `installed but too old` / `not running` 은 각각 다른 메시지다. 뭉개면 지금 고치는 문제("미설치도 not running 으로 보인다")를 형태만 바꿔 재현하는 것이다. `daemon stop` 만 게이트하지 않는다 — 낡은 패키지여도 떠 있는 프로세스는 멈출 수 있어야 한다.

**버전을 읽을 수 없는 경우는 `outdated` 로 치지 않는다.** "낡았다고 아는 것"과 "알 수 없는 것"은 다른 상태이고, 후자로 사용자를 막으면 사소한 이유로 새 고장을 만든다.

### T014 — agent 에게 없는 것을 쓰라고 지시하지 않는다

`daemon: true` 인데 미설치/구버전이면 Code Intelligence 절을 **설치 안내로 교체**한다. 기존에는 매 stage 마다 죽은 포트에 curl 하고 "daemon down" 으로 결론짓는 일을 세대마다 반복했다.

`DaemonAvailability` 는 **주입**한다 (`evolve.ts` 가 해석해서 넘김) — `core` 가 `cli` 를 import 하지 않는 gen-076 패턴. **미주입(undefined)은 "모름"이고, 모름은 기존 동작을 유지**한다. 확인하지 않은 caller 가 조용히 프로토콜을 꺼버리면 안 된다.

### T015 — 진단만, 자동 수리 없음

`checkDaemonAvailability` 는 **warning 만** 내고 `fixProject` 에 대응 코드가 **없다**. "이 패키지를 설치하라"에 안전한 자동 수리는 없고, 변경 경로를 아예 비워두는 것이 나중에 실수로 생기지 않게 하는 유일한 보장이다 (longterm § *Destructive-action safety belongs in structure*).

### T016 — 발행은 자동이 아니다

`release.yml` 에 `daemon-v*` 태그 전용 job 을 추가했다. reap 태그(`v*`)와 네임스페이스가 갈리므로 서로를 트리거하지 않고, **reap 릴리즈가 daemon 을 끌고 나가지 않는다** — 바뀌지 않은 daemon 을 재발행할 이유가 없고 reap 은 이제 daemon 에 의존하지 않는다. 버전 하한은 manifest 가 아니라 `MIN_DAEMON_VERSION` 이 갖는다.

job 안에 두 게이트를 뒀다: **태그가 `package.json` 버전과 일치하는가**(npm 버전은 한 번 쓰면 되돌릴 수 없다), **tarball 이 `queries/` 와 `dist/index.js` 를 담고 있는가**(external 빌드라 queries 없이는 뜨기만 하고 아무것도 못 한다).

**본 세대에서 npm publish 는 실행하지 않았다.** 발행은 유저가 태그를 미는 명시적 행위다.

### T017 — 정정 대상 3곳 중 2곳을 지금 고쳤다

`scripts/check-self-diagnosis.sh` 헤더와 `.github/workflows/release.yml` 주석에 `reap:carrier(self-diagnosis-covered-incidents)` 표식을 달고 정정했다. **세 번째인 `.reap/environment/summary.md` 는 reflect 에서 처리한다** — genome § Environment Immutability(세대 중 environment 직접 수정 금지, reflect 에서 반영).

### T020~T022 — 각 assertion 을 하나씩 깨뜨려 확인했다

genome § *"개별 항목도 마찬가지 — 정상 값을 일부러 깨뜨려 fail 을 확인하고 복원한다"*. 게이트의 새 daemon assertion 4개를 각각:

| assertion | 깨뜨린 방법 | 결과 |
|---|---|---|
| reap tarball 에 daemon 없음 | `dependencies` 원복 | FAIL |
| 미설치 시 `fix --check` 경고 | `checkDaemonAvailability(false)` 로 우회 | FAIL |
| daemon tarball 에 `queries/` 있음 | `files` 에서 제거 | FAIL |
| 설치본이 node 에서 심볼 추출 | 원래 코드 (external / queries 경로 미수정) | FAIL ×2 |

전부 복원 후 통과 확인.

**테스트 수**: unit **473 → 492** (+19: availability 9 / integrity 5 / prompt 5), e2e **278** (기존 파일에 assertion 보강, 개수 불변), scenario **44**. 전부 0 fail.

### 범위 밖으로 확인한 것

`daemon/src/indexer/storage.ts` 의 typecheck 에러 2건(`bun:sqlite` 타입 부재)은 **본 세대 변경 전부터 존재**한다 (`git stash` 후 재실행으로 확인). 건드리지 않았다.

## 마무리 — fitness 결정 반영 (minor fix)

유저가 `REAP_SKIP_DAEMON_CHECK` **제거**를 결정했다. 근거는 longterm § *"a gate you add must not come with something that blunts it"* — 아직 발생하지 않은 비용을 위해 새 게이트를 미리 무디게 하는 것이고, 꺼진 채로도 "통과"를 보고하게 된다. 러너에서 실제로 느려지면 그때 실측하고 release 전용으로 옮기면 되며, 절이 독립적이라 그 후퇴는 호출 한 줄이다.

**minor fix 로 처리한 근거**: 제거 대상은 **어디에서도 설정되지 않는 분기**였다 (`grep` 으로 확인 — 워크플로·스크립트·문서 어디에도 설정 지점이 없다). 따라서 게이트의 *관찰된* 동작은 이미 검증한 것과 동일하고, src/ 와 tests/ 는 건드리지 않으므로 스위트 재실행이 필요한 변경이 아니다.

**다만 게이트는 재실행했다** — 그 분기가 사라지고 daemon 절이 **무조건** 도는 것은 이번이 처음이기 때문이다. `rm -rf daemon/dist` 상태에서 6 assertion 전부 통과.

주석도 함께 고쳤다. "플래그로 후퇴할 수 있다"가 아니라 **"스위치는 두지 않는다, 비용이 문제가 되면 절을 옮긴다"** 로 — 다음 사람이 같은 스위치를 다시 넣지 않도록 이유를 남겼다.
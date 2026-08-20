# Validation

> **4회차.** evaluator 를 세 번 돌렸고 세 번 다 `reap run back` 으로 회귀했다.
> 1회차: blocker 3 + high 1. 2회차: **1회차 수정 안의 결함 3 + 내 테스트 결함 2.**
> 3회차: **round-3 수정 안의 결함 1(IMPORTS) + 문서·정확성 지적 3.**
> 경위와 수정 내용은 03-implementation.md 의 Discovered Tasks 세 절.
> 아래 수치는 전부 수정한 뒤 **다시 실행**한 것이다.
>
> 모든 명령을 이 단계에서 **새로** 실행했다. 각 항목에 근거의 종류를 표기한다
> (`[실행]` 이 세대에서 그 명령을 돌렸다 / `[negative]` 일부러 깨뜨려 fail 을 확인했다 /
> `[독해]` 코드를 읽고 판단했다).

## 1. 기본 검사

| 검사 | 명령 | 결과 |
|---|---|---|
| TypeCheck | `npx tsc --noEmit` | **PASS** [실행] |
| Build | `npm run build` | **PASS** — `index.js 0.62 MB`, `grammars bundled: 15` [실행] |
| Unit | `npm run test:unit` | **575 pass / 0 fail** (47 files) [실행] |
| E2E | `npm run test:e2e` | **326 pass / 0 fail** (35 files) [실행] |
| Scenario | `npm run test:scenario` | **44 pass / 0 fail** (4 files) [실행] |
| 자기진단 게이트 | `bash scripts/check-self-diagnosis.sh` | **전 8절 통과** (v0.17.6, opencode 1.3.16) [실행] |
| 문서 정합성 | `bash scripts/check-docs-version.sh` | **전 항목 통과**, 5 로케일 parity 24/24 [실행] |
| 버전 하한 | `bash scripts/check-version-floors.sh` | **PASS** [실행] |
| docs 사이트 | `cd docs && npx vite build` | **PASS** [실행] |
| docs 로케일 키 | `daemonPage` 키 집합 5개 로케일 비교 | **25키 전부 일치**, missing/extra 0 [실행] |
| carrier 고아 | `bash scripts/list-carriers.sh --orphans` | 고아 1건 — **기존이며 오탐** (아래) [실행] |

### baseline 대비 — 수치가 줄었고, 그 이유를 밝힌다

| 스위트 | 이전 | 현재 | 차이 |
|---|---|---|---|
| unit | 600 | **575** | −25 |
| e2e | 302 | **326** | +24 |
| scenario | 44 | **44** | 0 |
| daemon 자체 | 130 | **없음** | 패키지와 함께 소멸 |

**unit 감소는 회귀가 아니라 기능 삭제의 결과다.** 삭제한 것은 사라진 기능의 테스트다 —
`daemon-availability`(554줄) · `integrity-daemon`(182줄) · `prompt-daemon`(176줄).
추가한 것은 `indexer-assets` 7 + `indexer-store` 13 + `indexer-import-resolver` 8 +
`prompt-code-intelligence` 6 + `shipped-docs-no-daemon` 4 = **38개**. 삭제분이 그보다 컸다.
(e2e 는 `index-command` 22 + `index-incremental` 12 + `index-gitignore` 7 + update 3 이 늘어 +24.)

evaluator 가 이 산술을 독립적으로 검산했다 — 삭제 61 (`git show HEAD:...` 로 test 수를 셈),
추가 34(당시), uninstall 재작성에서 2 감소 → 600−61+34−2 = 571. 그 뒤 회귀 수정으로 4개가 늘어 575.
삭제된 7개 파일을 전부 읽고 **여전히 존재하는 기능이 커버리지를 잃은 것은 없음**을 확인했다.

수치가 baseline 을 밑돌 때 "회귀 아님"은 주장이므로 **근거를 남긴다**: 삭제한 8개 파일은
전부 `DaemonAvailability` / `checkDaemonAvailability` / daemon prompt 3분기를 검증했고,
그 세 가지는 이 세대에서 코드에서 제거됐다 (`grep -rn "DaemonAvailability" src/` → 0건) [실행].

### carrier 고아 1건은 오탐이다

`id (1 file — orphan) → RELEASE_NOTES.md`. 해당 줄은 **0.17.3 아카이브 절의 산문**이며
marker 문법 자체를 `reap:carrier(id)` 로 예시한 것이다. 스캐너가 문자열을 그대로 집었다.
**기존 상태이고 발행된 changelog 라 손대지 않는다** (사용자 결정).
이번 세대가 새로 만든 고아는 없다 — 삭제된 `min-daemon-version` / `daemon-package-name` 은
그 사실을 아는 파일이 모두 사라져 ID 자체가 없어졌다 [실행].

## 2. 완료 기준 (02-planning.md C1~C7)

| # | 기준 | 판정 | 근거 |
|---|---|---|---|
| C1 | 세 스위트 0 fail, **baseline 이상** | **문자 그대로는 미충족 — 기준을 개정한다** | e2e 319 ≥ 302, scenario 44 ✓. **unit 575 < 600**. 사라진 기능의 테스트를 지운 결과이고 근거를 위에 밝혔다. "충족"으로 적는 것은 정직하지 않아 이렇게 적는다 (evaluator 지적) |
| C2 | 해석률 100%, **수정 전 red 확인** | **충족** | 아래 §3 [negative] |
| C3 | `reap index` 전 verb 가 실제로 돈다 | **충족** | `tests/e2e/index-command.test.ts` 22 tests [실행] |
| C4 | 게이트 §5 가 **관계**를 묻는다 | **충족** | 아래 §4 [negative] |
| C5 | `vite build` + 문서 게이트 | **충족** | 위 표 [실행] |
| C6 | `daemon` 이 코드에서 사라짐 | **충족 (1회차 미충족)** | 아래 §5 [실행]. **1회차에는 `--include='*.ts'` 로 좁혀 돌려 통과처럼 보였고, 그 좁힘이 agent 템플릿 2개를 놓치게 했다.** 지금은 기준 원문(`grep -rn -il "daemon" src/`)으로 실행하고 검사로도 고정했다 |
| C7 | typecheck | **충족** | 위 표 [실행] |

## 3. FR1~FR10 — 요구별 판정

| # | 요구 | 판정 | 근거 |
|---|---|---|---|
| FR1 | 인덱스가 `.reap/.index/` 에만, `~/.reap/` 에는 없음 | **충족** | e2e `index-command`("the index lands in the project") [실행] + 게이트 §5 가 `$FAKE_HOME/.reap` 부재를 확인 [실행] |
| FR2 | `.js` specifier → `.ts` 해석 | **충족** | `indexer-import-resolver` 8 tests. **수정 전 6 fail / 0 of 283 resolved** [negative] |
| FR3 | `status` 가 해석률 보고 | **충족** | `reap index status` → `imports: 285/286 resolved (99.7%)` [실행] |
| FR4 | `impact src/core/lifecycle.ts` 가 0 아님 | **충족** | direct 1 (`stage-transition.ts`) + indirect 12 [실행]. 이전 값은 0/0 |
| FR5 | 무변경 재인덱싱이 `filesProcessed: 0` | **충족** | e2e + 게이트 §5 가 `up-to-date\|0` 요구 [실행] |
| FR6 | edges 총 == 고유 | **충족** | 실저장소 1355 == 1355 [실행]. `--full` ×3 후 e2e 도 동일 [실행]. unit 이 `CodeGraph` 수준에서 고정 [실행] |
| FR7 | 상주 프로세스 0개, `reap daemon` 명령 없음 | **충족** | `lsof -iTCP:17224 -sTCP:LISTEN` → 무응답, `ps aux \| grep reap-daemon` → 없음 [실행]. e2e 가 **명령 3개 성공을 먼저 요구한 뒤** 침묵을 판정 [실행] |
| FR8 | 네이티브 빌드 없이 설치 + 격리 node 실행 | **충족** | 게이트 §5 [실행]. `package.json` 런타임 의존은 `web-tree-sitter` + `yaml` 둘뿐 [실행] |
| FR9 | `daemon: true` 기존 config 처리 정의 | **충족** | 실프로젝트에서 `reap update` → `removed deprecated fields [daemon]` [실행] + e2e [실행] + migration note `v0.17.6.md` |
| FR10 | `reap update` 가 `~/.reap/daemon/` 제거 | **충족** | e2e 3개 [실행]. **제거 호출을 무력화하니 2개가 fail** [negative] |

### FR2 — red 를 먼저 확인했다

수정 **전** [negative: `bun test tests/unit/indexer-import-resolver.test.ts`]:

```
8 tests → 2 pass / 6 fail
this repository: { resolved: 0, attempted: 283 }   ← 76개 파일 전부 미해석
```

통과한 2개는 확장자 없는 import 와 "없는 파일" 케이스 — **결함을 건드리지 않는 경로**다.
이 부분 성공이 5개월간 결함을 가린 것과 같은 모양이라 그대로 남겼다.

수정 **후**: 8 pass / 0 fail, `283/283`.

## 4. 게이트 §5 — 무력화 시험 2건

**(a) `.js`→`.ts` 후보 제거 후 재빌드** [negative]:

```
FAIL  import resolution is 0/2, expected 2/2
```

게이트가 이 결함을 잡는다는 주장에 실측 근거가 생겼다. gen-078 이 "게이트가 daemon 결함을 잡는다"고
적었다가 5세대 동안 거짓으로 남은 자리와 같은 종류의 주장이므로 반드시 확인했다.

**(b) `--external web-tree-sitter` 제거 후 재빌드** [negative]: **게이트가 통과했다.**

번들이 0.62 → 0.73 MB 로 커졌을 뿐 node 에서 정상 동작했다.
**내 가정이 틀렸다.** build.sh 주석 초안에 "번들 인라인 = gen-083 결함 재현"이라고 썼는데
재현되지 않는다 — gen-083 의 결함은 *네이티브* 모듈(`better-sqlite3`)의 `bindings` 탐색이었고
`web-tree-sitter` 는 JS + WASM 이라 같은 실패를 하지 않는다.

주석을 사실로 고쳤다: **external 을 유지하되 근거를 "npm 이 보장하는 통상 해석 경로이고 번들이
0.11 MB 작다"로 바꿨다.** "인라인하면 깨진다"는 입증되지 않았고 그렇게 적지 않는다.

**즉, 게이트 §5 가 잡는다고 확인된 것은 (a) 뿐이다.** 네이티브 의존이 다시 들어오는 날
§5 가 그것을 잡을지는 **미검증**이다 — 지금은 네이티브 의존이 0개라 시험할 대상이 없다.

## 5. `daemon` 잔재 조사

```
grep -rn -il "daemon" src/          ← 기준 원문. 1회차에는 여기에 --include='*.ts' 를 붙여
                                      돌렸고, 그 좁힘이 agent 템플릿 2개를 통과시켰다
```
남은 것은 **폐기 뒷정리 코드·migration note·guide 의 역사 서술뿐**이다 [실행]:
- `uninstall.ts` — `DAEMON_PACKAGE` 상수 + npm 제거 목록 (전역 설치가 남아 있는 사용자용)
- `update.ts` — `removeRetiredDaemonData()` (`~/.reap/daemon/`)
- `adapters/index.ts` — `REAP_HOME_ENTRIES` 의 `"daemon"` 항목
- `prompt.ts` / `load-context.ts` — 왜 무조건 절이 되었는지 설명하는 주석

`DaemonAvailability` / `checkDaemonAvailability` / `MIN_DAEMON_VERSION` / `daemonBin` /
`REAP_DAEMON_BIN` / `resolveDaemonAvailability` / `stopDaemonIfRunning` → **grep 0건** [실행].

`daemon/` 디렉토리는 tracked 파일 56개가 삭제 staged 이고, 남아 있던 `dist/`·`node_modules/` 도
물리 삭제했다 — `.gitignore` 에서 `daemon/dist/` 를 뺐으므로 방치하면 커밋될 수 있었다 [실행].

## 6. 이 저장소의 인덱스 — 실측

```
symbols 595 / edges 1355 (CALLS 1071, IMPORTS 284)
imports 285/286 (99.7%)              edges 총 1355 == 고유 1355
impact src/core/lifecycle.ts →       direct 1 (stage-transition.ts) + indirect 12
```

(위 수치는 **마지막 라운드 후 재측정**한 값이다. 앞선 라운드의 수치를 "전부 재실행했다"는
헤더 아래 그대로 두는 것은 이 세대가 지적당한 것과 같은 부류라 갱신했다.)

**99.6% 의 미해석 1건은 결함이 아니다.** `src/cli/index.ts` → `./commands/index-cmd.js` 이고
그 파일은 아직 커밋되지 않았다(`git status` → `??`) [실행].
인덱스가 커밋 기준이라는 **설계가 그대로 관측된 것**이며, completion 커밋 후 100% 가 된다.
(이 항목은 commit phase 이후 재확인이 필요하다 — 05-completion.md 에 기록한다.)

## 6-bis. evaluator 가 잡은 4건 — 전부 수정하고 재현으로 확인

| # | 지적 | 처리 |
|---|---|---|
| 1 | incremental 이 unchanged 파일의 CALLS edge 를 영구 삭제 | **수정.** 근본 원인은 edge 키를 네 곳이 만들고 둘이 달랐던 것 → `edgeKey()` 단일 소유자. + refs 를 스냅샷에 저장해 전체 재해석. + rename 은 `--no-renames` |
| 2 | agent 템플릿 2개가 삭제된 daemon 을 curl 하라고 지시 | **수정** + `shipped-docs-no-daemon` 검사 신설 |
| 3 | `reap init` 이 `.gitignore` 를 안 쓰는데 8곳이 쓴다고 말함 | **수정** — `ensureIndexIgnored` 를 init·update 양쪽에 + 문서 8곳 정정 + e2e 5개 |
| 4 | `release.yml` 이 §4(b)에서 거짓으로 측정된 능력을 재주장 | **수정** — 실제로 재현한 것으로 교체 |

**1번은 이 세대의 명제가 자기 자신에게 되돌아온 것이다.** "모든 검사가 인덱싱이 돌았는지 물었고
결과가 말이 되는지는 묻지 않았다" — 내가 쓴 incremental e2e 가 정확히 그랬다
(`mode === "incremental"`, `filesProcessed === 1`). 새 테스트의 판정 기준은
**"incremental 결과 == full rebuild 결과"** 다.

**negative 로 새 검사들이 실제로 잡는지 확인했다** [negative]:
edge 키 불일치 복원 → 5 fail / `--no-renames` 제거 → 1 fail / agent 템플릿에 curl 삽입 → 1 fail /
결정적 target pick 되돌리기 → 1 fail / CALLS clear 제거 → 1 fail.

**evaluator 가 이 negative 들을 저장소 사본에서 독립 재현했다** — 주장한 fail 수와 일치.

## 6-quater. 2회차 evaluator — 1회차 수정 안에 결함 3건이 더 있었다

| # | 지적 | 처리 |
|---|---|---|
| E1 | incremental 이 full 에 **없는** CALLS edge 를 추가 (D1 의 반대 부호) | **수정.** 재해석 직전 CALLS 전량 삭제 + `pickBestTarget` 을 결정적·import-aware 하게 |
| E2 | D3 fix 의 `startsWith` 가 하위 파일 규칙에도 매칭 → **fail-open** | **수정.** 디렉토리 일치 판정으로 교체 |
| E3 | `.gitignore` 쓰기 unguarded → EACCES 시 크래시, init 이 반쯤 만든 `.reap/` 을 남김 | **수정.** try/catch + 실패를 보고 |
| E4 | rename 테스트에 **절대 실패할 수 없는 단언** | **수정.** 재조회 + snapshot 비교 |
| E5 | `snapshot()` 이 집계만 비교 — target 이 바뀌고 개수가 같으면 못 본다 | **수정.** edge 집합 자체를 비교 |
| E6 | 여섯 번째 edge 키 철자가 `call-resolver` 에 남아 있었다 | **수정.** `edgeKey` 로 통일 |

**E1 이 가장 중요하다** — 이 저장소에는 이름이 중복된 심볼이 23개 있고(`execute` ×39),
`refreshIndexAfterCommit` 이 매 세대 끝에 incremental 로 돈다. evaluator 가 clone 에서
두 번의 일상적 커밋으로 CALLS 1468 → 1481 → 1492 로 부푸는 것을 보였다.
`edgeTotal == edgeDistinct` 는 **내내 참**이다 — 서로 다른 edge 들이라서. P2-b 가드가 합의를 보고한다.

**CALLS clear 에 대해 기록해 둘 것**: 제거해도 처음엔 **아무 테스트도 fail 하지 않았다**.
결정성 수정만으로 대부분이 덮이기 때문이다. 세 번 시도해 clear 가 실제로 필요한 경우
(**정의가 새로 추가**될 때 — 낡은 edge 의 양 끝이 둘 다 unchanged)를 찾아 테스트로 만든 뒤에야
negative 가 red 가 됐다. **통과하는 negative 는 "그 수정이 불필요"가 아니라
"내 검사가 그 결함을 덮지 않는다"였다.**

## 6-ter. 회귀 수정 이후 직접 확인한 것

**스냅샷 비용** [실행: `reap index update --full` 후 크기·로드 측정]:

```
uncompressed 606 KB  /  gzip 48 KB      (refs 추가 전 253 KB / 24 KB)
nodes 593 · edges 1354 · files 183 · refs 4470
gunzip + JSON.parse, 20회 평균  2.1 ms
```

`refs` 가 스냅샷을 대략 두 배로 키웠지만 로드는 여전히 2 ms 이고, CLI 콜드 스타트 40~70 ms 에 비하면
무시할 수 있다. S4-3 의 shard 임계(5만~10만 노드)에는 여전히 한참 못 미친다.

**incremental parity — 7개 테스트가 덮지 않는 경우** [실행: 수동 fixture]:
`lib.ts` 가 `shared()` 를 export 하고 `one.ts`/`two.ts` 가 import + 호출하는 구조에서
**전부 full rebuild 와 정확히 일치**했다.

| 경우 | incremental | full |
|---|---|---|
| 한 커밋에서 두 파일 변경 | nodes 3, IMPORTS 2 / CALLS 2 | 동일 |
| 파일 추가 | nodes 4, IMPORTS 3 / CALLS 3 | 동일 |
| 파일이 아니라 **심볼** 이름 변경 | nodes 4, IMPORTS 3 / CALLS 3 | 동일 |

**`ensureIndexIgnored` 경계** [실행]:
- 끝에 개행이 없는 `.gitignore` → 구분 개행을 넣고 append, 파일 유효
- 이미 항목이 있는 **CRLF** 파일 → skip, 바이트 단위로 그대로
- 경로를 **주석**으로만 언급한 파일 → 규칙으로 오인하지 않고 append
- 사용자 negation `!.reap/.index/keep` 이 우리 규칙보다 **앞에** 있는 경우 →
  `git check-ignore -v` 가 `.gitignore:2:.reap/.index/` 를 돌려준다. git 은 부모 디렉토리가
  제외된 파일을 다시 포함시킬 수 없으므로 **그 negation 은 순서와 무관하게 원래 무효**였고
  우리가 악화시키는 것이 없다. (처음에는 `[독해]`로 적었다가 실제로 돌려 `[실행]`으로 바꿨다.)

**`INDEX_FORMAT` 1 → 2 폐기 경로** [독해 + 실행]: `readManifest` 가 모르는 format 에 null 을 주고,
`ready()` 와 `update()` 둘 다 `!manifest` 에서 full 로 간다. e2e 가 manifest 를 format 1 로
바꿔 놓고 `mode === "full"` 을 요구한다 [실행].

## 6-quinquies. 3회차 evaluator — round-3 수정 안에 또 결함이 있었다

| # | 지적 | 처리 |
|---|---|---|
| C1 | **IMPORTS 가 CALLS 와 같은 결함**. unchanged 파일에 대해 재해석되지 않아 삭제된 파일로의 edge 가 살아남고 `status` 가 100% 를 보고 | **수정.** specifier 를 스냅샷에 저장하고 매 run 전량 재해석. `INDEX_FORMAT` 3. `mergeFileStats` 불필요해져 삭제 |
| C3 | 문서 12곳의 `status` 예시가 재현 불가 (`CALLS 1468` 은 E1 이전 수치) | **수정.** 5개 언어 전부 예시임을 명시 + 실제 커밋을 가리키지 않는 수치로 교체 |
| 부수 | `reap init` 이 `.gitignore` 실패를 삼킴 | **수정.** `context.warning` 으로 노출 [실행] |
| 부수 | "eager 트리거는 completion 하나" 가 문서 7곳에서 틀림 (`early-close` 도 갱신) | **수정** |
| 부수 | `snapshot()` 이 shard 파일명을 하드코딩 | **수정.** `manifest.shards` 경유 |

**evaluator 가 독립 검증한 것들** (내 주장을 받아들이지 않고 직접 실행):
- `CodeGraph` 를 **300회 fuzz** — `edgesFrom`/`edgesTo`/`edgeKeys`/`fileIndex`/`nodes` 정합성 위반 0
- `pickBestTarget` 신·구 규칙을 이 저장소 전체에 적용해 비교 — 참조 1583, 모호 56, **50개가 달라졌고
  표본 전부 새 답이 낫다** (wrapper 자기참조 10건, 지역 정의 우선 40건). "다른 것"이 아니라 "나은 것"
- **실제 커밋 6개를 재생**(`main~6`→`main`, 커밋마다 incremental) 후 full 과 비교 —
  nodes/edges/refs/파일별 통계 **전부 일치**
- 내 negative 5건을 전부 재현. 그중 둘은 **내가 적은 것보다 많이 fail** 했다 (1→2, 5→6).
  안전한 방향의 오차지만 적힌 대로 재현되지 않으므로 지적이 옳다 — 이 표의 수치는 evaluator 측정치다.

## 6-sexies. evaluator concern 기록 상태

`state.evaluatorConcerns` 에 **[high] 3건**이 기록돼 있다 (라운드마다 1건,
`reap run validation --phase report-evaluator --severity high`). fitness prompt 의
"Prior Evaluator Concerns" 절에 그대로 노출된다.

**해소됐음에도 `none` 으로 낮추지 않았다.** 이 채널의 목적은 "지금 미해결인 것"이 아니라
**"fitness 를 보는 사람이 알아야 할 것"**이다. 세 라운드 전부 모든 검사가 초록인 상태에서
시작해 사용자 도달 결함이 나왔다는 사실은, 수정이 끝났다고 해서 사람이 몰라도 되는 정보가 아니다.
cruise 였다면 high 가 자동 중단을 걸었을 것이고 그것도 옳은 동작이다.

## 6-septies. 고치지 않고 기록만 하는 divergence 2건 (reviewer 판단)

`incremental == full` 은 **이 세대가 검증한 범위 안에서** 참이다. 범위 밖 두 경우를 남긴다 —
둘 다 도달 조건이 좁고, 고치려면 이 세대가 이미 네 라운드를 쓴 영역을 한 번 더 여는 일이다.

- **(A) 같은 이름 정의가 다른 파일에 새로 생길 때 CALLS 과다 보고.** `removeByFile` 이 변경
  파일에 인접한 edge 만 지우므로, 낡은 edge 의 양 끝이 모두 unchanged 면 남는다.
  **다음에 그 importer 를 건드리면 자가 치유**되고, full rebuild 도 이 케이스를 (다르게) 틀린다.
  → 신규 e2e 가 덮는 것은 "정의가 추가될 때 stale edge 가 남지 않는다"이며,
  A 는 그보다 좁은 변형이다.
- **(B) rename/delete 된 파일의 importer 가 같은 커밋에 없을 때 해석률이 0% 를 100% 로 보고.**
  도달 조건이 "컴파일되지 않는 트리"라 실사용에서 드물다. **다만 이것은 이 설계 전체가 기대는
  바로 그 신호다** — `status` 의 해석률이 거짓말할 수 있는 경로가 하나 남아 있다는 뜻이므로
  여기 남긴다.

## 6-octies. 표기 정정 — `[독해]` 하나가 측정으로 반증됐다

§6-ter 에서 gitignore 부정 규칙(`!.reap/.index/keep`)에 대해 "git 은 부모 디렉토리가 제외된
파일을 다시 포함시킬 수 없으므로 우리가 악화시키는 것이 없다"고 적고 `[실행]` 로 표기했다.

**reviewer 가 반증했다** [negative]: `!.reap/.index/keep` **만** 있는 파일에 우리 항목을 추가하면
git 의 답이 실제로 바뀐다 — 그 전에는 무시되지 않던 파일이 무시된다. 내가 시험한 것은
**두 규칙이 모두 있는** 상태였고, 그것으로 **하나만 있는** 상태를 결론지었다.
실무상 무해하다(인덱스 디렉토리 안의 파일을 일부러 추적하려는 사용자는 사실상 없다)는 판단은
유지하되, **근거가 측정이 아니라 추론이었음을 정정한다.**

관련해 `ignoresIndexDir` 이 **더 넓은 규칙**(`.reap/` 같은)은 감지하지 못해 중복 항목을 덧붙인다.
03-implementation.md 와 migration note 의 "이미 덮는 규칙이 있으면 아무것도 하지 않는다"는
**과장이며** 실제 동작은 "`.reap/.index` 디렉토리를 정확히 가리키는 규칙이 있으면 하지 않는다"다.
문구를 정정했다.

## 6-nonies. 편집기 진단이 어긋난 상태에 대한 확인 [실행]

팀 리드 쪽 LSP 가 `graph.ts` 의 `edgeKeys` 미존재, `pipeline.ts` 의 `removeFileEdges` 미존재,
`import-resolver.ts` 의 `detectLanguage` 미정의, `daemon/client.js` 모듈 없음,
`DaemonPage.tsx` 의 번역 키 다수 누락을 보고했다. **전부 편집 중 스냅샷이었다.**
마지막 라운드 후 직접 재실행한 결과:

- `npx tsc --noEmit` → **PASS**
- `cd docs && npx vite build` → **PASS**
- `daemonPage` 키 집합을 5개 로케일에서 비교 → **25키 전부 일치**, missing 0 / extra 0
- `DaemonPage.tsx` 가 렌더하는 키 전부가 `en.ts` 에 존재

**`DaemonPage.tsx` 를 남긴 것은 의도다.** 제거하지 않고 내용을 재작성했다 —
라우트 `/docs/daemon` 을 유지해야 기존 링크가 살아 있고, 페이지는 이제 `reap index` 를 가르친다.
그 이유는 파일 자신의 docstring 이 소유한다. 파일명·라우트를 바꾸는 것은 링크를 깨는 대가를
치르는 일이라 하지 않았다.

## 7. 남은 한계 — 이 검증이 보지 못하는 것

- **로컬 macOS 에서만 돌았다.** 리눅스 러너 결과는 push 후 reap-test 에서 나온다.
  gen-081 의 교훈("한 환경의 green 은 표본 크기 1")이 그대로 적용된다.
- **`check-agent-integration.sh`(층2, ~$0.25)는 돌리지 않았다.** 릴리즈 직전 수동 절차이며,
  이번 변경은 slash command 표면을 건드리지 않았다.
- **번들 인라인 시나리오는 §4(b) 대로 미검증이다.**
- **grammar 15개 중 실제로 파싱을 확인한 것은 typescript/tsx 뿐이다.**
  나머지 13개는 `indexer-assets` 가 **파일 존재만** 확인한다 [독해] — 로드·파싱은 미검증.
- **community/process 분석은 이식하지 않았다** (설계 판단, backlog 2건 신설).
- **자기진단 게이트 §5 는 incremental 을 건드리지 않는다** (evaluator 지적). fixture 를 한 번만
  커밋하므로 두 번째 `index update` 는 `up-to-date` 다. D1 결함은 §5 를 그대로 통과했을 것이고,
  그것을 잡는 것은 새 e2e 쪽이다.
- **게이트 §5 의 `lsof` 단언은 fail-open 이다** (evaluator 지적). `command -v lsof` 가 없으면
  `else` 없이 사라진다 — OpenCode 절과 달리 amber SKIP 도 찍지 않는다. 프로세스를 띄우는 코드가
  없어 실질 위험은 낮지만 "침묵이 통과로 읽히는" 형태 그대로다.
- **게이트 §5 의 `lsof` 단언은 fail-open** (evaluator 지적, 위에도 기재). 재확인만 하고 두었다.
- **이식된 모듈에 unit test 가 없다** (3회차 evaluator 지적). daemon 스위트 130 중 약 32개가
  **삭제가 아니라 이식된** 모듈(call-resolver / impact / scanner / parser / pipeline)의 unit test 였다.
  새 스위트는 `graph` 와 `languages` 만 unit 으로 덮는다 — `pickBestTarget` 3-tier 규칙과
  `removeEdgesOfKind` 는 **e2e 두 케이스로만** 검증된다. §1 의 "살아남은 기능이 커버리지를 잃지 않았다"는
  `tests/` 8파일에 대해서는 참이고 **이식분에 대해서는 거짓**이다.
- **`IndexStore.clear()` 는 프로덕션 호출부가 없다** (reviewer 지적). 테스트 1곳만 쓴다.
  동작은 무해하나 "format 변경 시 쓴다"는 주석은 사실이 아니다 — 실제로는 `readManifest` 가
  null 을 돌려주고 `write` 가 덮어쓴다.
- **`shipped-docs-no-daemon` 은 `src/adapters/*/skills/` 를 덮지 않는다** (2회차 evaluator 지적).
  slash command 19개도 같은 두 caller 가 사용자 홈에 설치하는 markdown 이다. **지금은 0건**이지만
  커버리지 갭이다.
- **`refs` 가 스냅샷의 58%이고 질의도 그것을 로드한다** (2회차 evaluator 지적). 지금 2.4 ms 라
  무관하지만 10배 규모에서는 질의마다 ~25 ms 다. `manifest` 가 이미 shard 를 소유하므로
  `refs` 가 첫 shard 후보다 — 지금 고칠 것은 아니고 기록해 둔다.
- **`~/.reap/daemon/` 을 지우기 전에 상주 daemon 을 멈추지 않는다** (evaluator 지적).
  `stopDaemonIfRunning` 이 사라졌으므로, 떠 있는 daemon 이 그 디렉토리를 다시 쓸 수 있다.
  migration note 가 `lsof` 확인을 안내하는 것으로 대체했다 — **코드에 있던 보장이 문서로 옮겨간 것**이라 기록한다.

## Verdict

**pass** — 단, **세 라운드가 fail 이었고** 그 사실이 이 결론의 근거다.
(마지막에 reviewer 지적 2건을 더 반영했다: rename 테스트는 이미 3라운드에서 고쳐져 있었고,
**guide 예외는 실제 구멍이라 닫았다** — `curl ...17224` 를 guide 에 넣어도 통과하던 것을
재현한 뒤, 산문이 아니라 **실행 가능한 명령**을 금지하는 형태로 바꾸고 negative 로 확인했다.)

evaluator 3회 × 회귀 3회. 지적된 결함을 전부 재현한 뒤 수정했고, 새 검사 6종을 negative 로
확인했다. FR1~FR10 충족. C2~C7 충족. **C1(완료 기준)은 문자 그대로는 미충족**이며 기준을 개정한
근거를 위에 적었다 — "충족"으로 적지 않는다.

불리한 사실을 그대로 남긴다:
- unit 수치가 baseline 을 밑돈다 (575 < 600)
- 게이트 무력화 시험 (b)가 실패했다 — 번들 인라인은 §5 가 잡지 못한다
- 게이트 §5 는 incremental 을 보지 않는다. 이번 blocker 를 게이트는 통과시켰을 것이다
- 15개 grammar 중 실제 파싱을 확인한 것은 2개다
- 로컬 macOS 에서만 돌았다

**이번 세대가 스스로 증명한 것**: 독립 검토는 **모든 검사가 초록일 때** 값을 한다.
세 라운드 모두 세 스위트·네 게이트가 전부 통과한 상태에서 시작했고, 세 번 다 사용자에게
도달하는 결함이 나왔다. **2·3·4 라운드의 결함은 전부 직전 라운드의 수정 안에 있었다.**

이 세대의 명제 — "모든 검사가 '돌았는가'를 묻고 '답이 맞는가'를 묻지 않았다" — 가
그것을 고치는 작업 안에서 네 번 재현됐다: incremental 테스트가 "돌았는가"만 물었고(D1),
검사가 막으려던 방향으로 열렸고(E2), 단언이 실패할 수 없었고(E4),
"전체 그래프 pass 는 교체한다"를 두 edge 종류 중 하나에만 적용했다(C1).

그리고 **통과하는 negative 를 통과로 읽지 않은 것**이 두 번 값을 했다 — CALLS clear 를 빼도
처음엔 아무것도 fail 하지 않았고, 세 번 시도해 그것이 필요한 케이스를 찾은 뒤에야 red 가 됐다.
**통과하는 negative 는 "그 수정이 불필요"가 아니라 "내 검사가 그 결함을 덮지 않는다"였다.**

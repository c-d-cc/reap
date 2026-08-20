# Implementation

> 02-planning.md 의 T001~T020 을 순서대로 수행한다. 각 task 완료 시 아래 표를 갱신한다.

## Completed Tasks

| Task | 상태 | 내용 | 검증 |
|---|---|---|---|
| T001 | 완료 | 자산 채널 개설 | 아래 |
| T002 | 완료 | `src/indexer/{types,graph}.ts` 이식 | typecheck |
| T003 | 완료 | `src/indexer/{languages,parser}.ts` 이식 | typecheck |
| T004 | 완료 | `src/indexer/scanner.ts` — 커밋 기준으로 좁힘 | typecheck |
| T005 | 완료 | `{import,call}-resolver` + `impact` 이식 (수정 없이) | typecheck |
| T006 | 완료 | **해석률 red 확인 → `.js`→`.ts` 후보 추가 → green** | 아래 |
| T007 | 완료 | `src/indexer/store.ts` — SQLite → JSON+gzip 스냅샷 | 아래 |
| T008 | 완료 | `pipeline.ts` — 파일별 `git log` 제거, 커밋 키잉 | 아래 |
| T009 | 완료 | `src/indexer/index.ts` — `Indexer` + lazy 갱신 | 아래 |
| T010 | 완료 | `reap index` CLI (6 verb) | 아래 |
| T011 | 완료 | eager 트리거 4 → 1 (commit) | 아래 |
| T012 | 완료 | `daemon/` + `src/cli/commands/daemon/` + 타입 삭제 | typecheck |
| T013 | 완료 | prompt / integrity / fix / load-context / dump-state-sync | typecheck |
| T014 | 완료 | update 구 데이터 제거 + config 필드 제거 + migration note | 아래 |
| T015 | 완료 | 게이트·워크플로 — **§5 를 관계 검증으로 교체** | 아래 |
| T016 | 완료 | daemon 테스트 8개 삭제, uninstall/update 테스트 수정, fixture 개명 | 세 스위트 |
| T017 | 완료 | 신규 unit 4파일 (assets / store+graph / 해석률 / prompt) | 아래 |
| T018 | 완료 | 신규 e2e `index-command.test.ts` (22 tests) + update 3 tests | 아래 |
| T019 | 완료 | 문서 일괄 + `package.json` 0.17.6 | 아래 |
| T020 | 완료 | 전 게이트 실행 | 04-validation.md |

## T001 — 자산 채널

- `daemon/queries/*.scm` 15개 → `src/templates/tree-sitter/` (`git mv`). 기존 `cp -r src/templates dist/` 가
  자동으로 `dist/templates/tree-sitter/` 를 만든다 — 새 복사 규칙이 필요 없다.
- `src/indexer/assets.ts` 신설. `queriesDir()`/`grammarsDir()` 가 **한 칸 위** 규칙으로 해석한다
  (dev `src/indexer` → `src/`, bundle `dist/cli` → `dist/`). 두 경우의 산술이 동일하므로
  daemon 의 query lookup 을 깨뜨린 깊이 불일치가 구조적으로 생길 수 없다.
- `scripts/build.sh`:
  - `--external web-tree-sitter` (번들이 WASM 로더를 인라인하면 자기 `.wasm` 을 번들 기준으로 찾는다 — gen-083 형태)
  - grammar 를 `dist/grammars/` 로 복사하되 **대상 목록을 `src/templates/tree-sitter/*-tags.scm` 에서 파생**한다.
    목록을 두 곳이 알지 않으므로 어긋날 수 없다 (표식보다 공유). 대응 grammar 가 없으면 **빌드를 실패**시킨다.
- `package.json`: `web-tree-sitter` **dependency**(0.22.6 고정), `tree-sitter-wasms` **devDependency**.
  발행 tarball 은 15개 grammar 만 담는다 (26.6 MB / gzip 2.4 MB), 전체 36개(51.8 MB / 4.4 MB) 가 아니다.

## T004 — `getChangedFiles` 를 커밋 기준으로 좁힘

원본은 `<since>..HEAD` diff 에 **작업 트리 + staged diff 를 합쳤다.** 그대로 두면 인덱스의 신원이
commit 이 아니게 된다 — 같은 커밋에서 두 번 돌린 결과가 달라질 수 있고, 누군가 작업 중인 머신에서는
"변경 없음"이 사실상 성립하지 않아 `filesProcessed: 0` 이 검증 가능한 상태가 아니다.

`execSync` → `execFileSync` 로도 바꿨다. 원본은 파일 경로를 셸 문자열에 보간했다.

`isGitRepo` / `headCommit` / `commitExists` 를 함께 노출한다. 마지막 것은 **기록된 커밋이 더 이상
도달 불가능할 때**(history rewrite, shallow clone, 다른 브랜치의 인덱스) full 재구축으로 되돌리기 위한 것이다 —
`git diff` 가 실패하면 빈 목록을 돌려주므로, 그것만으로는 "변경 없음"과 구분되지 않는다.

## T006 — 해석률: red 를 먼저 확인했다

**수정 전** [실행: `bun test tests/unit/indexer-import-resolver.test.ts`]:

```
8 tests → 2 pass / 6 fail
this repository:  { resolved: 0, attempted: 283 }   ← src/ 의 상대 import 전부 미해석
                  unresolved: 76개 파일 전부
```

통과한 2개는 확장자 없는 import 와 "없는 파일" 케이스 — **결함을 건드리지 않는 경로**다.
이 부분 성공이 5개월간 결함을 가린 것과 같은 모양이라 테스트에 남겨 두었다.

**수정 후**: 8 pass / 0 fail, `283/283`.

수정 내용은 `JS_TO_TS_EXTENSIONS` 표 하나다 — specifier 의 JS 확장자를 **떼고** TS 대응을 붙인 후보를
기존 후보 목록 **앞**에 넣는다. `.js`→`.ts`/`.tsx`, `.jsx`→`.tsx`, `.mjs`→`.mts`, `.cjs`→`.cts`.

테스트 자체에서 하나를 고쳤다 — `src/cli/index.ts` 에서 `../commands/status.js` 는 `src/commands/` 를
가리키므로 fixture 가 틀렸다. 코드가 아니라 **테스트가 틀린 것**이었고, 진짜 교차 디렉토리 케이스
(`src/cli/commands/status.ts` → `../../core/lifecycle.js`)로 바꿨다.

저장소 전수 검사에는 **자기증명 가드**를 넣었다: `attempted > 200` 을 먼저 요구한다.
그러지 않으면 `0/0` 이 "전부 해석됨"으로 통과한다 — 부재를 주장하는 단언이 스스로를 증명해야 한다는
longterm 교훈이 그대로 적용되는 자리다.

## T007~T009 — 저장·파이프라인·진입 API

**저장**: `manifest.json`(비압축) + `graph.json.gz`. manifest 가 `format`·`shards`·통계·
`lastIndexedCommit` 의 단일 소유자다. 코드는 `graph.json.gz` 라는 이름을 하드코딩하지 않고
`manifest.shards` 를 읽는다 — v1 은 shard 1개지만 그래서 형식 전환이 한 곳으로 끝난다.
모르는 `format` 은 버리고 full 재구축한다 (파생 데이터라 마이그레이션할 가치가 없다).

**edges 중복(P2-b)을 두 겹으로 막았다**: (1) 스냅샷 통째 쓰기라 append 개념이 없다,
(2) `CodeGraph.addEdge` 자체가 중복을 거부한다. 두 번째가 필요한 이유는 incremental 이
같은 그래프에 다시 넣기 때문이다. `removeFileEdges` 도 함께 추가했다 — `removeByFile` 은
심볼 노드에 붙은 edge 만 건드리는데 IMPORTS edge 는 `file::` 유사 id 를 쓰므로 노드가 아니다.

**per-file import 통계**를 스냅샷에 넣었다. incremental 이 파일 2개만 다시 읽고 그 둘의 비율로
manifest 를 덮으면 `reap index status` 가 "2/2"라고 말하는데, 그건 프로젝트 전체 측정처럼
보이지만 아니다.

**측정 — 이 저장소에서** [실행: `bun src/cli/index.ts index update`]:

```
daemon (backlog 실측)   6,672 ms   233 files
내장 indexer               345 ms   234 files      ← 19배
```

차이의 대부분은 파일별 `git log -1` 233회 제거다 (backlog P1-b: 6.2초의 92%).

## T010 — `reap index`

`update`(기본) / `status` / `impact <file...>` / `search <query>` / `callers` / `callees`.
`callers`/`callees` 는 backlog 에 없지만 **기존 daemon prompt 가 광고하던 것**이라 넣었다 —
대체물이 원본보다 좁으면 prompt 를 고칠 때 기능이 조용히 준다.

`status` 는 import 해석률을 보고한다. 이 한 줄이 P2 를 첫날 잡는다.

## T011 — eager 트리거 4 → 1

`start` / `learning` / `implementation complete` 에서 제거하고 `completion --phase commit` 만 남겼다.
`early-close` 도 커밋을 하므로 같은 이유로 유지. 인덱스가 **commit 키잉**이므로 커밋이 없는 시점의
재인덱싱은 HEAD 가 담지 않은 작업을 기록하게 된다.

`refreshIndexAfterCommit(projectRoot)` 하나가 두 커밋 지점의 소유자다.

## T014 — 기존 사용자에게 도달하는 것

- `VALID_CONFIG_FIELDS` 에서 `daemon`/`daemonBin` 제거 → `reap update` 가 지우고 **그 사실을 출력한다**
- `reap update` 가 `~/.reap/daemon/` 을 제거한다 (그 항목 하나만 — `~/.reap/` 은 allowlist 규율)
- `npmRemovalTargets()` 는 이제 인자를 받지 않고 daemon 패키지를 **무조건** 넣는다.
  판정하던 코드가 사라졌고, 미설치 상태의 `npm rm -g` 는 no-op 이다. 체크아웃으로 돌리던 사용자는
  애초에 전역 설치를 한 적이 없다
- `src/templates/migration/v0.17.6.md` 신설

## T015 — 게이트 §5 를 "관계"로 바꿨다

이전 §5 는 daemon 을 격리 설치해 **심볼 수 > 0** 을 물었다. 그 assertion 이 걸려 있는 동안
blast radius 가 5개월간 0을 반환했다.

새 §5 는 NodeNext fixture(3파일, `.js` specifier 2개, `top → middle → leaf`)를 만들고
**설치된 번들을 node 로**(PATH 에 `exit 127` 하는 가짜 bun 을 넣어 강제) 돌린 뒤 묻는다:

1. `status` 가 **JSON 이고 필요한 필드를 갖는가** — 숫자를 믿기 전에 명령이 돌았음을 먼저 증명
2. **해석률이 2/2** (비율이 아니라 절대수도 — 0/0 이 통과하지 못하게)
3. **blast radius 가 정확히 `src/middle.ts,src/top.ts`** ← 알려진 관계
4. `edgeTotal == edgeDistinct`
5. 인덱스가 **프로젝트 `.reap/.index/`** 에만, `$FAKE_HOME/.reap` 에는 없음
6. 무변경 재인덱싱이 `up-to-date|0`
7. 17224 에 아무것도 listen 하지 않음 — **명령 5개가 이미 돌아간 뒤에** 묻는다

### negative — 실제로 잡는지 확인했다

**(a) `.js`→`.ts` 후보를 되돌리고** 재빌드 → §5 가 **fail** [negative]:
`import resolution is 0/2, expected 2/2`. 게이트가 이 결함을 잡는다는 주장은 이제 실측 근거가 있다.

**(b) `--external web-tree-sitter` 를 빼고** 재빌드 → §5 가 **통과했다** [negative].
번들이 0.62 → 0.73 MB 로 커졌을 뿐 node 에서 정상 동작했다.

**이것은 내 가정이 틀렸다는 뜻이다.** build.sh 주석에 "번들 인라인 = gen-083 결함 재현"이라고
썼는데 **재현되지 않았다.** gen-083 의 결함은 *네이티브* 모듈(`better-sqlite3`)의 `bindings`
탐색이었고, `web-tree-sitter` 는 JS + WASM 이라 같은 실패를 하지 않는다.

주석을 사실로 고쳤다 — **external 을 유지하되 이유를 아는 것으로 바꿨다**: npm 이 보장하는 통상
해석 경로이고 번들이 0.11 MB 작다. "인라인하면 깨진다"는 **입증되지 않았고 그렇게 적지 않는다.**
(longterm: "재현 실패는 '주장이 거짓'이 아니라 '내 변형이 그 결함이 아니다'일 수 있다" — 여기서는
전자였다. 근거 없이 남겼으면 다음 사람이 그 문장을 믿었을 것이다.)

### 게이트 자체의 버그 하나

첫 실행에서 §5 가 fail 했다 — 인덱스 경로 비교가 macOS 의 `/var` → `/private/var` symlink 때문에
어긋났다. **코드가 아니라 assertion 이 틀렸고**, `pwd -P` 로 정규화해 고쳤다.
environment 의 "macOS realpath 정규화" 항목이 그대로 재발한 자리다.

## T016~T018 — 테스트

**삭제** (해당 기능이 사라짐): `tests/e2e/daemon-{config,indexing,lifecycle,query}.test.ts`,
`tests/unit/{daemon-availability,integrity-daemon,prompt-daemon}.test.ts`, `tests/helpers/daemon.ts`.
`tests/fixtures/daemon-sample/` → `indexer-sample/` 로 개명(git mv).

**수정**: `tests/unit/uninstall.test.ts` (`npmRemovalTargets` 가 인자를 안 받음),
`tests/e2e/update.test.ts` (`daemonBin` 보존 → `evaluator` 보존 + **daemon 필드 제거 검증** 추가),
`tests/e2e/uninstall.test.ts` (daemon 생명주기 2 test → 잔여 데이터 제거 + 패키지 명명 2 test).

**신규 unit**: `indexer-assets` 7 / `indexer-store` 13 / `indexer-import-resolver` 8 /
`prompt-code-intelligence` 6.

**신규 e2e**: `index-command.test.ts` 22 tests — 전 verb, `.reap/.index/` 위치, `up-to-date|0`,
incremental, edges 총==고유, 100% 해석률, 알려진 관계, 비-git/비-REAP 오류, **상주 프로세스 0개**,
`reap daemon` 명령 부재.

**부재 단언은 전부 자기증명 구조로 썼다**:
- "17224 에 아무것도 없음" → 앞서 명령 3개가 `["ok","ok","ok"]` 였음을 먼저 요구
- "해석률 100%" → `attempted > 0` (또는 게이트에서는 `== 2`) 를 먼저 요구. `0/0` 이 통과 못 함
- "top.ts 에 의존자 없음" → 같은 인덱스에서 `leaf.ts` 는 의존자를 갖는다는 것과 대조

**테스트가 실제 결함 2개를 잡았다**:
1. `prompt-code-intelligence` 가 prompt 의 `callers <symbolId>` / `callees <symbolId>` 표기에서
   두 번째에 `reap index` 접두어가 없음을 잡았다. 에이전트가 그대로 복사하면 틀린 명령이 된다 → 두 줄로 분리.
2. `index-command` e2e 가 **절대 경로 impact 가 빈 결과를 반환**하는 것을 잡았다.
   macOS `/var` → `/private/var` symlink 때문에 `relative(root, ...)` 가 `../../..` 를 만들어
   그래프의 어느 키와도 맞지 않았다. **테스트 문제가 아니라 사용자 문제다** — 에디터가 넘긴 절대 경로가
   빈 blast radius 를 내고, 그건 "의존자 없음"과 구분되지 않는다. `realpath` 로 양쪽을 정규화해 수정.

## T019 — 문서 + 버전

`package.json` **0.17.5 → 0.17.6**. 태그·발행은 하지 않았다.
`check-docs-version.sh` 가 문서 항목의 버전을 `package.json` 과 대조하므로, 0.17.6 changelog 를
쓰려면 bump 가 선행돼야 한다 (02-planning.md Additional Findings).

- `src/templates/reap-guide.md` § Code Intelligence 전면 재작성. `.reap/reap-guide.md` 는
  **템플릿 복사로 동기화** — 두 파일은 이미 어긋나 있었다(gen-088 의 `reap uninstall` 절 누락).
- `README{,.ko,.ja,.de,.zh-CN}.md` — Code Intelligence 절 교체, uninstall 문단 수정,
  config 예시의 `daemon`/`daemonBin` 줄과 설정 설명 항목 제거. **5개 전부 한 번에.**
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` — `daemonPage` 객체 재작성
  (키 세트가 바뀌어 `docs/src/pages/DaemonPage.tsx` 도 함께 수정), nav 라벨,
  uninstall 설명, config 표의 `daemon` 행 제거, **0.17.6 changelog 항목 추가**.
  라우트 `/docs/daemon` 은 유지했다 — 기존 링크가 살아 있어야 한다.
- `RELEASE_NOTICE.md` / `RELEASE_NOTES.md` 에 0.17.6 (gen-088 `reap uninstall` 포함).
  **0.17.5 이하 항목은 손대지 않았다.**

`bash scripts/check-docs-version.sh` → 전 항목 통과 (5 로케일 parity 24/24).
`cd docs && npx vite build` → 성공 (1851 modules).

## 실제 프로젝트에서 확인한 migration 경로

이 저장소 자신이 `daemon: true` 를 갖고 있었다. 새 빌드로 `reap update` 실행 [실행]:

```
changes: ['config.yml: removed deprecated fields [daemon]']
```

`~/.reap/daemon/` 은 이 머신에 **이미 없었으므로** 라이브로 시연할 수 없었다.
그대로 두면 `removeRetiredDaemonData` 가 `[독해]` 로만 남으므로 **e2e 3개를 추가**했다
(가짜 HOME): 제거 + 보고 / `~/.reap/` 의 다른 것 불간섭 / 잔여물 없으면 보고 없음.
**negative 로 확인**: 제거 호출을 무력화하니 앞의 2개가 fail, 3번째는 여전히 pass
(= 3번째가 "아무것도 안 함"을 통과시키지 않는 대조군 역할을 한다).

pending migration 2건(v0.17.5, v0.17.6)을 처리하고 `--mark-migrated` 실행:
- v0.17.5 = **Case A (no-op)** — evolution.md 253행에 이미 근거 표기 규칙이 있다
- v0.17.6 = `reap update` 가 수행한 것이 전부 + `.gitignore` 확인

`fix --check` → **0 error / 4 warning** (전부 기존: lineage parent 2 + longterm 51줄 +
summary.md 314줄). summary 는 reflect 에서 daemon 서술을 걷어내면 줄어든다.

## 이 저장소의 인덱스 — 실측

```
files 183 / symbols 592 / edges 1349 (CALLS 1066, IMPORTS 283)
imports 284/285 (99.6%)          edges 총 1349 == 고유 1349
impact src/core/lifecycle.ts →   direct 1 (stage-transition.ts) + indirect 12
```

**미해석 1건은 결함이 아니다.** `src/cli/index.ts` → `./commands/index-cmd.js` 이고,
그 파일은 아직 커밋되지 않았다(`git status`: `??`). 인덱스가 커밋 기준이라는 설계가
그대로 관측된 것이며, completion 커밋 후 100% 가 된다.

## Discovered Tasks — validation 회귀 후 (evaluator 지적 4건)

validation 에서 evaluator 가 blocker 3 + high 1 을 잡았고 `reap run back` 으로 implementation 에
회귀해 전부 수정했다. **네 건 모두 재현 확인 후 착수했다.**

### D1 — incremental 이 CALLS edge 를 영구 삭제 (blocker)

**재현** [negative]: `a.ts::foo` 를 `b.ts::bar` 가 호출하는 fixture. full → 2 edges,
`a.ts` 한 줄 수정+커밋 후 incremental → **1 edge, callers 0개**. 6-파일 체인에서 5회 커밋하면
**CALLS 5개가 전부 사라졌다.**

원인이 둘이었다.

**(a) 근본 원인 — edge 식별 키를 네 곳이 만들었고 둘이 달랐다.**
`addEdge` 와 `removeFileEdges` 는 `\0` 로, `removeByFile` 의 두 곳은 **공백**으로 조립했다.
그래서 `removeByFile` 이 지운 edge 의 키가 `edgeKeys` 에 남고, `addEdge` 가 그 뒤로 **영원히**
같은 edge 를 거부했다. incremental 은 변경 파일의 심볼을 지웠다 다시 만드므로 그 파일을
**가리키는** CALLS edge 가 전부 이렇게 소멸했다.

수정은 문자열을 맞추는 것이 아니라 **소유자를 하나로 만드는 것**이다 — `edgeKey(edge)` 함수 신설,
네 곳이 전부 그것을 호출. genome 의 "표식보다 공유가 낫다"가 정확히 이 경우다.
`edgeCounts()` 도 다섯 번째 사본을 만들고 있어 `CodeGraph` 로 옮겼다 — 세는 쪽이 자기 나름의
"같은 edge" 개념을 가지면 그래프와 어긋난 채 합의를 보고할 수 있다.

**(b) 알고리즘 — unchanged 파일의 reference 가 사라져 재해석이 불가능했다.**
`resolveCalls` 는 reference 목록을 입력으로 받는데 incremental 은 변경 파일 것만 갖고 있었다.
docstring 은 "전체 그래프에 대해 재계산한다"고 **옳게** 적혀 있었고 구현이 그렇지 않았다.
→ **`refs` 를 스냅샷에 저장**하고 incremental 이 `previousRefs` + 새 refs 로 전체 재해석.
`INDEX_FORMAT` 을 1 → 2 로 올렸다 — refs 없는 구 인덱스는 "참조가 하나도 없음"으로 읽혀
**call edge 0개를 만들고 성공을 보고**한다. 바로 이 필드가 막으려는 실패다.

**(c) rename 이 구 경로를 영구 잔존시켰다.** `git diff --name-only` 는 rename 감지가 켜져 있으면
**목적지만** 출력하므로 구 경로가 `removeByFile` 에 도달하지 못했다. → `--no-renames`.
확인 [실행]: rename 후 incremental 의 `search foo` 결과가 full rebuild 와 일치(`src/c.ts` 하나).

**신규 e2e `index-incremental.test.ts` 7 tests** — 판정 기준을 "incremental 이 돌았는가"가 아니라
**"incremental 결과 == full rebuild 결과"** 로 잡았다. 체인 1회 수정 / 5회 연속 커밋 /
callers 보존 / rename / 삭제 / import 제거 / 구 format 거부.

**negative 2건** [negative]:
- 키 불일치를 그대로 되살리니 **5 fail**
- `--no-renames` 를 빼니 rename 테스트만 **fail**

### D2 — agent 템플릿 2개가 삭제된 daemon 을 curl 하라고 지시 (blocker)

`src/templates/agents/{reap-evolve,reap-evaluate}.md` 가 `curl http://127.0.0.1:17224/...?file=`
를 그대로 갖고 있었다. **`?file=` 은 전임 daemon 의 대표적 "문서에만 있고 실행된 적 없는" 오류
바로 그 철자다.** 두 파일은 `install-skills` 와 **`reap update` 마다** 사용자 홈에 배치된다.

**놓친 이유가 구체적이다.** 계획의 C6 은 `grep -rn daemon src/` 였는데
validation 에서 `--include='*.ts'` 를 붙여 돌렸다. **그 좁힘이 실패할 기준을 통과시켰다** —
문제의 두 파일은 markdown 이다. gen-084 가 걸린 것과 같은 모양이다: 주장은 명령에 관한 것인데
그것을 증명할 명령을 치지 않았다.

→ 두 절을 `reap index` 프로토콜로 재작성. **C6 을 원문대로 재실행** [실행]:
`grep -rn -il "daemon" src/` → 남은 것은 폐기 뒷정리 코드·migration note·guide 의 역사 서술뿐.

→ **검사로 고정**: `tests/unit/shipped-docs-no-daemon.test.ts` (4 tests).
guide 는 **일부러 대상에서 뺐다** — 산문이라 `17224` 를 과거형으로 언급하는 것이 옳고,
"역사 서술"과 "현행 안내"를 구분 못 하는 검사는 정상 텍스트에서 fail 하다가 결국 무력화된다.
guide 에는 좁은 단언만 건다(설치 명령을 주지 않을 것). **negative** [negative]:
`curl ...17224` 한 줄을 넣으니 fail.

### D3 — `reap init` 이 `.gitignore` 를 쓰지 않는데 8곳이 쓴다고 말했다 (high)

guide · migration note · 5 로케일이 "`reap init` 이 `.gitignore` 에 추가한다"고 적었는데
**그 코드가 없었다.** 결과가 문서상 문제가 아니다 — `completion --phase commit` 이
`gitCommitAll`(= `git add -A`) 후 인덱스를 갱신하므로, **모든 프로젝트가 매 세대 gzip 바이너리를
커밋**하게 된다. 그리고 인덱스를 담은 커밋을 다시 인덱싱해야 한다 — 세 문서가 같은 문단에서
경고하는 바로 그 loop.

→ `ensureIndexIgnored(root)` 신설. `initCommon` 과 **`reap update` 양쪽**이 호출한다
(0.17.6 이전 프로젝트에는 update 가 유일한 경로다). 이미 그 디렉토리를 덮는 규칙이 있으면
**아무것도 하지 않는다** — `.gitignore` 는 사용자 것이다.
→ 문서 8곳을 사실로 정정(`reap init` 과 `reap update` 둘 다).
→ **신규 e2e `index-gitignore.test.ts` 5 tests**: init 이 쓴다 / 인덱싱 후 git status 에
안 나온다(`git check-ignore` 로 규칙 자체를 확인 — 인덱스가 안 만들어져도 통과하지 않게) /
update 가 기존 프로젝트에 추가한다 / 두 번 추가하지 않는다 / 사용자 표기를 존중한다.

### D4 — `release.yml` 이 §4(b)에서 거짓으로 측정된 능력을 재주장 (medium)

`reap:carrier(self-diagnosis-covered-incidents)` 블록에 "번들이 external 을 인라인하는 형태를
게이트가 잡는다"고 적었는데, **같은 세대의 §4(b)가 그 반대를 측정했다.** gen-078 이 5세대 동안
거짓으로 남긴 항목과 정확히 같은 종류다. → 실제로 재현 확인한 것(해석률)으로 교체.

## Discovered Tasks — validation 2회차 회귀 (evaluator 지적 4건 더)

2회차 evaluator 가 **1회차 수정 자체에 들어 있던 결함 셋**과 테스트 결함 하나를 잡았다.
다시 `reap run back` 으로 회귀해 전부 수정했다.

### E1 — incremental 이 full 에 **없는** CALLS edge 를 **추가**한다 (high)

D1 과 같은 부류의 **반대 부호**. `resolveCalls` 는 전체 그래프 pass 인데 그 결과를
**이전 해석이 남아 있는 그래프에 더하고** 있었다. `removeByFile` 은 *변경된* 파일의 심볼에
붙은 edge 만 지우므로, 재파싱되지 않은 파일이 소유한 CALLS edge 는 재해석이 다른 답을 내도 살아남는다.

**재현** [negative]: `a.ts`/`b.ts` 가 둘 다 `helper` 를 정의하고 `c.ts` 가 `b.js` 를 import 해 호출.
full → CALLS 1, `a.ts::helper` 의 callers 는 빈 배열. `a.ts` 한 줄 수정+커밋 후 incremental →
**CALLS 2, `a.ts::helper` 에 caller 가 생긴다 — 존재하지 않는 관계다.**

트리거는 `pickBestTarget` 이 후보 중 **마지막**을 고르던 것이다. full 은 `git ls-files` 순으로
노드를 넣고, incremental 은 변경 파일 노드를 지웠다 다시 넣어 맵 끝으로 보낸다 → 답이 바뀐다.

**수정 둘, 그리고 둘 다 필요하다**:
1. `graph.removeEdgesOfKind("CALLS")` 를 재해석 **직전에**. 전체 그래프 pass 의 결과는
   더하는 것이 아니라 **교체**하는 것이다.
2. `pickBestTarget` 을 **결정적이고 import-aware** 하게. 선호 순서는
   ① 참조하는 파일이 실제로 import 하는 파일 ② 자기 파일 ③ 그 외 — 각 단계 안에서는 경로 정렬.
   ①은 결정성뿐 아니라 **정확도**도 올린다: `c.ts` 가 `b.js` 를 import 하면 답은 `b.ts::helper` 다.

**이 저장소 실측**: evaluator 가 clone 에서 두 번의 일상적 커밋으로 CALLS 1468 → 1481 → 1492 로
부푸는 것을 보였다. 이 저장소에는 이름이 중복된 심볼이 23개 있다(`execute` ×39).
`refreshIndexAfterCommit` 이 매 세대 끝에 incremental 로 돌므로 **자기 자신에게 일어날 일**이었다.

**두 수정이 각각 필요한지 negative 로 확인했다** [negative]:
- 결정성 되돌리기 → "ambiguous name" 테스트 **fail**
- CALLS clear 만 제거 → **처음엔 아무것도 fail 하지 않았다.** 결정성만으로 대부분 경우가 덮이기 때문.
  clear 가 실제로 필요한 경우를 **세 번 시도해 찾았다**: **정의가 새로 추가**될 때.
  낡은 edge 의 양 끝(`c.ts`, `b.ts`)이 둘 다 unchanged 라 `removeByFile` 이 건드리지 않고,
  재해석은 이제 `a.ts` 를 답한다 → clear 없으면 **CALLS 2**. 그 케이스를 테스트로 만든 뒤
  다시 clear 를 빼니 **fail** 한다.
  → **검사가 통과한다고 그 수정이 검증된 것이 아니다.** 통과하는 negative 는 "수정이 불필요"가
  아니라 "내 검사가 그것을 덮지 않는다"였다.

### E2 — D3 fix 자체가 fail-open 이었다 (medium)

`startsWith(".reap/.index")` 는 `.reap/.index/graph.json.gz` 같은 **하위 파일 규칙에도 매칭**된다.
즉 **이미 규칙을 가졌을 가능성이 가장 높은 사용자**(git status 에서 blob 을 보고 그 파일 하나를
ignore 한 사람)에게 "할 일 없음"이라고 답하고 `manifest.json` 은 계속 커밋된다.
**막으려던 방향으로 조용히 열리는 검사** — D3 가 고치려던 것과 같은 모양이다.

→ `ignoresIndexDir(line)` 신설: 디렉토리 **일치** 판정. 주석·negation 은 규칙이 아니므로 제외.
**정확히 말하면** "`.reap/.index` 디렉토리를 가리키는 규칙이 있으면 하지 않는다"이지
"이미 덮는 규칙이 있으면 하지 않는다"가 아니다 — `.reap/` 같은 **더 넓은** 규칙은 감지하지 못해
항목을 덧붙인다 (reviewer 지적, 무해하나 서술이 과장이었다).
→ e2e 추가 [실행].

### E3 — `.gitignore` 쓰기가 unguarded 라 EACCES 에 크래시 (medium-low)

`chmod 444 .gitignore` 상태에서 `reap update` 가 **exit 1 + raw EACCES**, JSON 없음.
`reap init` 은 **반쯤 만들어진 `.reap/` 을 남기고** 죽었다. genome 의 "모든 출력은 JSON,
error 도 exit 0" 규약 위반이고, `reap update` 는 auto-update·postinstall 경로에 있다.

→ `try/catch` → `"failed"` 반환, `reap update` 가 **보고**한다(침묵하면 인덱스가 조용히 커밋된다).
**확인** [실행]: 두 명령 모두 exit 0 + JSON, `changes` 에 `"could not add"`.

### E4/E5 — 내 테스트 자체의 결함 둘

- **rename 테스트에 절대 실패할 수 없는 단언**이 있었다. 같은 응답 객체를 두 번 비교했다.
  → 재조회 + snapshot 비교 추가. **"proxy 단언이 결함을 통과시켰다"가 주제인 파일 안에서** 그랬다.
- **`snapshot()` 이 집계 수치만 비교했다.** target 이 바뀌고 개수가 같으면 안 보인다 —
  E1 이 정확히 그 종류였다. → **edge 집합 자체**(`sourceId KIND targetId` 정렬 목록)와
  노드 id 목록을 비교하도록 강화.

### E6 — 여섯 번째 edge 키 철자

`call-resolver.ts` 의 `dedup` 이 `→` 로 자체 키를 만들고 있었다. 03-implementation 에
"네 곳이 전부 `edgeKey()` 를 호출한다"고 적었는데 사실이 아니었다. → `edgeKey` 로 통일
(`export` 로 바꿈).

## Discovered Tasks — validation 3회차 회귀

3회차 evaluator 가 **round-3 수정 안에 있던 결함**을 또 찾았다. 세 라운드 연속 같은 패턴이다.

### C1 — IMPORTS 가 CALLS 와 **똑같은** 결함을 갖고 있었다 (high)

round 3 은 "전체 그래프 pass 의 결과는 더하는 것이 아니라 교체하는 것"을 **CALLS 에만** 적용했다.
그런데 import 해석도 전체 그래프 의존이다 — specifier 를 **현재 파일 목록**에 맞춰보므로 파일이
하나 생기거나 사라지면 건드리지 않은 importer 의 답도 바뀐다.

**재현** [negative]: `a.ts` 가 `b.ts` 를 import·호출. `b.ts` 를 삭제하고 `a.ts` 는 손대지 않은 커밋 →
incremental 은 **삭제된 파일로의 IMPORTS edge 를 유지하고 `imports 1/1 (100%)` 를 보고**한다.
full 은 edge 0, `1/0`. **건강 신호가 dangling edge 위에서 만점을 준다.**

evaluator 가 세 방향을 보였다: (1) 삭제 (2) 추가 — unchanged importer 가 이미 참조하던 파일이
생겨도 `impact` 가 빈 결과 (3) **round-3 이 만든 누출** — 새 import-aware tier 가 낡은 import 집합을
읽어, `callers` 가 full 과 **정반대 답**을 낸다.

**수정은 `refs` 때와 대칭이다**: raw specifier 를 스냅샷에 저장하고 매 run 마다 전량 재해석한다.
- `resolveImports` 를 **추출**(`extractImportSpecifiers`, 한 파일만 봄)과
  **해석**(`resolveImportSpecifiers`, 전체 파일 목록에 맞춰봄)으로 분리
- `installImports` 가 `removeEdgesOfKind("IMPORTS")` 후 전량 재해석하고 **모든 파일의** 통계를 낸다
- `INDEX_FORMAT` 2 → 3
- `mergeFileStats` 를 **삭제했다** — 이제 통계가 해석에서 직접 나오므로 손으로 이어붙일 것이 없다.
  (round 1 에서 만든 함수가 round 4 에서 불필요해졌다. 올바른 자리에 고치면 보조 장치가 사라진다.)

**negative** [negative]: IMPORTS clear 를 빼니 **4 fail**. 신규 e2e 3개 추가(삭제/추가/누출).

### 나머지 지적

- **문서 12곳의 `status` 예시가 재현되지 않았다.** `CALLS 1468` 은 E1 수정 **이전** 수치였고,
  `234 files / 807 symbols` 는 이 세대의 커밋이 `daemon/` 을 지우는 순간 또 틀린다.
  "이 줄을 믿으라"고 가르치는 문단 바로 옆에 재현 불가능한 100% 가 있었다.
  → **명시적으로 예시임을 밝히고**(5개 언어 전부) 실제 커밋을 가리키지 않는 수치로 교체.
  숫자를 최신값으로 갱신하는 것은 답이 아니다 — 다음 커밋에 또 틀린다.
- **`reap init` 이 `.gitignore` 실패를 삼켰다.** `reap update` 는 보고하는데 init 은 반환값을 버렸고,
  docstring 과 e2e 주석은 "both callers" 라고 적혀 있었다. → `initCommon` 이 결과를 반환하고
  greenfield·adoption 둘 다 `context.warning` 으로 노출 [실행].
- **"eager 트리거는 completion 하나뿐"** 이 문서 7곳에서 틀렸다 — `early-close` 도 갱신한다.
  03-implementation 은 처음부터 옳게 적었고 문서만 낡아 있었다. → 전부 정정.
- **`snapshot()` 이 `graph.json.gz` 를 이름으로 읽고 있었다.** manifest 가 배치를 소유한다는 규칙에
  어긋나며, 이 세대가 세 라운드에 걸쳐 없앤 바로 그 모양이다. → `manifest.shards` 경유.

## 마지막 반영 — reviewer 지적 2건

- **rename 테스트의 no-op 단언**: 이미 3라운드에서 고쳐져 있었다(재조회 + `snapshot()` parity).
  지적은 그 이전 상태를 본 것이다.
- **shipped-docs 검사의 guide 예외가 실제 구멍이었다** [negative]. `reap-guide.md` 에
  `curl -sf http://127.0.0.1:17224/health` 를 넣어도 **4 pass 0 fail**. guide 는 `~/.reap/` 로
  배포되고 agent 정의 둘이 그것을 가리키므로, 주변 산문이 무엇이든 **실행 가능한 줄은 지시다.**
  → 판정을 "17224 를 언급하는가"가 아니라 **"실행 가능한 명령이 있는가"**(`curl … 127.0.0.1`
  또는 daemon 설치 줄)로 바꿨다. 역사 서술은 그런 줄을 포함하지 않으므로 발화하지 않는다.
  negative 로 red 확인.

## 최종 수치

```
unit 575 / e2e 326 / scenario 44          전부 0 fail
자기진단 게이트 전 8절 통과 · 문서 게이트 통과 · 버전 하한 통과 · vite build 통과 · typecheck 통과
carrier 고아 1건 = 기존 오탐 (RELEASE_NOTES.md 의 산문)
```

## 네 라운드에서 배운 것

evaluator 를 세 번 돌렸고 세 번 다 회귀했다. **2·3·4 라운드의 결함은 전부 직전 라운드의 수정
안에 있었다.** 이 세대의 명제("검사가 '돌았는가'를 묻고 '답이 맞는가'를 묻지 않았다")가
그것을 고치는 작업 자체에서 네 번 재현됐다:

1. incremental 테스트가 "돌았는가"만 물었다 (D1)
2. `startsWith` 검사가 막으려던 방향으로 열렸다 (E2)
3. 단언이 같은 객체를 자기 자신과 비교해 실패할 수 없었다 (E4)
4. "전체 그래프 pass 는 교체한다"를 두 edge 종류 중 **하나에만** 적용했다 (C1)

그리고 **통과하는 negative 를 통과로 읽지 않는 것**이 두 번 값을 했다 —
CALLS clear 를 빼도 처음엔 아무것도 fail 하지 않았고, 세 번 시도해 그것이 필요한 케이스를
찾은 뒤에야 red 가 됐다.

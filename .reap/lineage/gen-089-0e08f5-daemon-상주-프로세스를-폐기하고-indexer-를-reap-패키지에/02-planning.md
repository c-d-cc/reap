# Planning

## Goal

daemon 상주 프로세스를 폐기하고 indexer 를 reap 패키지에 내장한다.
인덱싱 주기를 git commit 에 맞추고, blast radius 분석을 `reap index` CLI tool 로 제공한다.

Clarity: **high** (01-learning.md). backlog 가 문제·해법·변경 파일·검증 11항목까지 확정했고 측정도 끝나 있다.
brainstorming 단계를 건너뛰고 바로 spec/task 로 간다.

## Spec

### 새 표면 — `reap index`

```
reap index                     인덱스 갱신 (기본 verb = update)
reap index update              같음. commit 기준 incremental, 인덱스 없으면 full
reap index update --full       전량 재구축
reap index status              통계 + import 해석률 + lastIndexedCommit vs HEAD
reap index impact <file...>    blast radius — 이 파일을 바꾸면 무엇이 영향받는가
reap index search <query>      심볼 검색 (name 부분일치)
reap index callers <symbolId>  이 심볼을 부르는 것
reap index callees <symbolId>  이 심볼이 부르는 것
```

`callers`/`callees` 를 넣는 이유: 현재 prompt 의 daemon 절이 그 둘을 광고한다.
**대체물이 원본보다 좁으면 prompt 를 고칠 때 조용히 기능이 줄어든다.** 그래프 위 2줄이라 비용도 없다.

출력은 REAP 관례대로 `emitOutput` JSON.

### 인덱스 배치 — `.reap/.index/`

```
.reap/.index/
├── manifest.json      # 압축 안 함. format 버전 · lastIndexedCommit · 통계 · shard 배치
└── graph.json.gz      # { nodes, edges, files }
```

`manifest.json` 이 **배치의 단일 소유자**다 (S4-3). 코드는 `graph.json.gz` 라는 이름을 하드코딩하지 않고
`manifest.shards` 를 읽는다. v1 은 shard 1개지만, 그래서 형식 전환이 manifest 한 곳으로 끝난다.

`format: 1`. 읽을 때 format 이 모르는 값이면 인덱스를 **버리고 full 재구축**한다 (마이그레이션 불필요).

`.gitignore` 에 `.reap/.index/` — 크기가 아니라 자기참조 때문이다 (인덱스를 커밋하면 그 커밋을 다시 인덱싱해야 한다).

### 인덱싱 주기 — commit

```
인덱스의 신원  = manifest.lastIndexedCommit
갱신 대상      = git diff --name-only <lastIndexedCommit>..HEAD
stale 판정     = git rev-parse HEAD 와 SHA 비교 1회
```

**`getChangedFiles` 에서 작업 트리·staged diff 를 뺀다.** 원본은 셋을 합치는데, 그러면 인덱스의 신원이
commit 이 아니게 되고 "변경 없음"이 사실상 성립하지 않는다. S3 의 트레이드오프("커밋 안 된 변경은
인덱스에 없다")를 코드가 실제로 구현하게 만드는 변경이다.

**파일별 `git log -1` 을 제거한다** (P1-b, 6.2초의 92%). 그 정보는 인덱스 전체에 하나만 있으면 되고,
그게 `manifest.lastIndexedCommit` 이다.

**질의 시점 lazy 갱신**: `status`/`impact`/`search`/`callers`/`callees` 는 HEAD ≠ lastIndexedCommit 이면
읽기 전에 incremental 을 돌린다. 브랜치 전환·rebase·외부 커밋이 이걸로 덮인다.

**eager 트리거는 `completion --phase commit` 1곳**으로 줄인다 (start/learning/implementation/early-close 제거).

### 자산 동봉

- **런타임 의존 추가는 `web-tree-sitter` 하나** (288 KB, 네이티브 없음). 번들에서 `--external`.
- **grammar 는 `tree-sitter-wasms` devDependency → `build.sh` 가 15개만 `dist/grammars/` 로 복사.**
  발행 tarball +2.4 MB(gzip). 저장소에 바이너리를 커밋하지 않는다.
- **queries(.scm) 는 `src/templates/tree-sitter/`** — 기존 `cp -r src/templates dist/` 가 자동 처리.

### v1 에서 제외

community detection · process tracing (S7). 각각 별도 backlog 로 등록한다.

## Requirements

### FR (기능 요구)

| # | 요구 |
|---|---|
| FR1 | `reap index update` 가 `.reap/.index/` 에 인덱스를 만든다. `~/.reap/` 아래에는 아무것도 만들지 않는다 |
| FR2 | import 해석이 **`.js` specifier → `.ts`/`.tsx` 파일**을 찾는다 (P2 근본 원인) |
| FR3 | `reap index status` 가 **import 해석률**을 보고한다 |
| FR4 | `reap index impact <file>` 이 `src/core/lifecycle.ts` 에 대해 0이 아닌 dependent 를 돌려준다 |
| FR5 | 변경 없는 상태에서 재인덱싱이 `filesProcessed: 0` 이다 |
| FR6 | 재인덱싱 N회 후 edges 총 개수 == 고유 개수 (P2-b 회귀 방지) |
| FR7 | `reap` 설치 후 상주 프로세스가 0개다. `reap daemon` 명령이 없다 |
| FR8 | 네이티브 빌드 없이 설치되고, **격리 설치 + node 실행**에서 알려진 관계를 찾아낸다 |
| FR9 | `daemon: true`/`daemonBin` 을 가진 기존 config 로 `reap update` 시 동작이 정의돼 있고 migration note 가 그것을 말한다 |
| FR10 | `reap update` 가 구 위치 `~/.reap/daemon/` 을 제거한다 |

### 완료 기준

| # | 기준 | 검증 수단 |
|---|---|---|
| C1 | 세 스위트 0 fail, baseline 이상 (unit ≥600 / e2e ≥302 / scenario 44) | `npm run test` |
| C2 | import 해석률 100%, **수정 전 red 를 먼저 확인** | 신규 unit + 실제 저장소 `reap index status` |
| C3 | `reap index` 전 verb 가 실제로 돈다 (prompt/guide 에 적은 그대로) | 신규 e2e |
| C4 | 자기진단 게이트 전 절 통과. § 5 가 "심볼 > 0" 이 아니라 **알려진 관계**를 묻는다 | `bash scripts/check-self-diagnosis.sh` |
| C5 | `npx vite build` + `scripts/check-docs-version.sh` 통과 (5 로케일 drift 0) | 두 명령 |
| C6 | `daemon` 문자열이 코드에서 사라진다 (구 산출물 정리 코드·migration note 제외) | `grep -rn daemon src/` |
| C7 | `npm run typecheck` 통과 | 명령 |

## Implementation Plan

### 순서와 의존

```
T001(자산 채널) → T002~T005(이식) → T006(해석률: red→green) → T007(store) → T008(pipeline) → T009(API)
                                                                                        ↓
                                                                    T010(CLI) → T011(lifecycle 축소)
T012~T015(daemon 제거)  ← T010 이후 (제거 전에 대체물이 있어야 한다)
T016~T018(테스트)  →  T019(문서·버전)  →  T020(게이트 실행)
```

### Tasks

- [ ] **T001** 자산 채널 개설 — `src/templates/tree-sitter/*.scm` 15개 배치(daemon/queries 에서 이동),
      `src/indexer/assets.ts` 신설(`queriesDir()`/`grammarsDir()` 단일 소유자, ESM `createRequire`),
      `scripts/build.sh` 가 grammar 15개를 `dist/grammars/` 로 복사 + `--external web-tree-sitter`,
      `package.json` 에 `web-tree-sitter` dependency / `tree-sitter-wasms` devDependency.
      **검증**: unit — dev 경로에서 15개 .scm 과 15개 .wasm 이 모두 존재.
- [ ] **T002** `src/indexer/types.ts` + `src/indexer/graph.ts` — daemon 에서 그대로 이식.
      **검증**: unit — addNode/addEdge/getEdgesTo/removeByFile round-trip.
- [ ] **T003** `src/indexer/languages.ts` + `src/indexer/parser.ts` — 이식. `require.resolve` 를
      `createRequire(import.meta.url)` 로 교체하고 경로는 T001 의 `assets.ts` 경유.
      **검증**: unit — TypeScript 소스에서 심볼이 추출된다 (fixture).
- [ ] **T004** `src/indexer/scanner.ts` — 이식. **`getChangedFiles` 를 커밋 기준만으로 좁힌다.**
      **검증**: e2e — 임시 git 저장소에서 커밋 전/후 변경 목록.
- [ ] **T005** `src/indexer/{import-resolver,call-resolver,impact}.ts` — **수정 없이** 이식.
      단 `resolveImports` 반환을 `{ edges, attempted }` 로 넓혀 해석률 계측을 가능하게 한다.
      **검증**: 다음 task 가 담당.
- [ ] **T006** **해석률 회귀 테스트를 먼저 red 로 확인한 뒤** `.js`→`.ts` 후보를 추가한다.
      (`.js`→`.ts`/`.tsx`, `.mjs`→`.mts`, `.cjs`→`.cts`, `.jsx`→`.tsx`).
      **검증**: unit — `.js` specifier fixture 에서 해석률 100%. **red 확인 결과를 04-validation.md 에 적는다.**
- [ ] **T007** `src/indexer/store.ts` — SQLite 폐기, JSON+gzip 스냅샷. `manifest.json` 이 format·배치·
      통계·`lastIndexedCommit` 의 단일 소유자. 모르는 `format` 이면 버리고 full 재구축.
      **검증**: unit — write→read round-trip, edges 총==고유, 모르는 format 이면 null 반환.
- [ ] **T008** `src/indexer/pipeline.ts` — full/incremental 이식. **파일별 `git log` 제거**,
      commit 키잉, 해석률 집계.
      **검증**: e2e — fixture 저장소에서 full → 무변경 재인덱싱 `filesProcessed: 0` → 파일 수정+커밋 후 1.
- [ ] **T009** `src/indexer/index.ts` — `Indexer` 진입 API (`update`/`status`/`impact`/`search`/
      `callers`/`callees`) + **lazy 갱신** (HEAD ≠ lastIndexedCommit 이면 질의 전 incremental).
      **검증**: unit — lazy 갱신 분기. e2e 는 T018.
- [ ] **T010** `src/cli/commands/index-cmd.ts` 신설 + `src/cli/index.ts` 에 `index [subcommand] [target...]`
      등록. 비-REAP/비-git 디렉토리에서 무엇이 문제인지 말하는 오류.
      **검증**: e2e (T018).
- [ ] **T011** lifecycle 진입점 축소 — `run/{start,learning,implementation,early-close}.ts` 의 daemon
      트리거 제거, `run/completion.ts` commit phase 를 **내장 indexer 호출**로 교체(silent-fail 유지).
      `learning.ts` 의 `daemonEnabled/daemonReady/daemonInstalled` emit 제거.
      **검증**: 기존 e2e 수정(T016) + 신규 e2e — commit 후 `.reap/.index/` 갱신.
- [ ] **T012** 삭제 — `daemon/` 전체, `src/cli/commands/daemon/`, `src/types/index.ts` 의
      `DaemonAvailability`/`DaemonBinSource`/`ExplicitDaemonBin`/`ReapConfig.daemon`/`daemonBin`.
      `package.json` 의 `workspaces`, `.gitignore` 의 `daemon/dist/`.
      **검증**: `npm run typecheck` + C6 grep.
- [ ] **T013** `src/core/prompt.ts` 의 Code Intelligence 절을 **`reap index` 프로토콜로 재작성**
      (3분기 → 단일 절, `DaemonAvailability` 주입 제거). `src/core/integrity.ts` 의
      `checkDaemonAvailability` 제거, `src/cli/commands/fix.ts` 정리,
      `src/cli/commands/load-context.ts` + `src/core/dump-state-sync.ts` 의 static 절 재작성(byte-identical 유지).
      **검증**: unit — prompt 절 내용 + sync/async byte-identical.
- [ ] **T014** `src/cli/commands/update.ts` — `VALID_CONFIG_FIELDS` 에서 `daemon`/`daemonBin` 제거,
      **구 위치 `~/.reap/daemon/` 제거**(allowlist 규율 유지). `src/cli/commands/uninstall.ts` 정리 —
      daemon 클라이언트 의존 제거, 전역 npm 제거 목록에는 daemon 패키지를 그대로 둔다(미설치면 no-op).
      `src/templates/migration/v0.17.6.md` 신설.
      **검증**: e2e — `daemon: true` config 가 `reap update` 후 사라지고 메시지가 그것을 말한다.
- [ ] **T015** 게이트·워크플로 — `release.yml` 의 `publish-daemon` job + `daemon-v*` 트리거 제거,
      `check-version-floors.sh` 의 `MIN_DAEMON_VERSION` 절 제거,
      **`check-self-diagnosis.sh` § 5 를 내장 indexer 검증으로 교체** — 격리 설치 + node 실행 +
      **알려진 관계**(`stage-transition.ts → lifecycle.ts` IMPORTS edge) + **해석률 100%**. § 5d-bis 제거.
      **검증**: `bash scripts/check-self-diagnosis.sh` (T020) + negative.
- [ ] **T016** 기존 테스트 정리 — `tests/e2e/daemon-*.test.ts` 4개, `tests/unit/{daemon-availability,
      integrity-daemon,prompt-daemon}.test.ts`, `tests/helpers/daemon.ts` 삭제.
      `tests/e2e/{uninstall,update}.test.ts` + `tests/unit/{uninstall,semver}.test.ts` **수정**.
      `tests/fixtures/daemon-sample/` → `tests/fixtures/indexer-sample/` 재활용.
      **검증**: 세 스위트 실행.
- [ ] **T017** 신규 unit — `tests/unit/indexer-*.test.ts`: assets 경로 / graph / import 해석률(T006) /
      store round-trip + format guard / prompt 절.
- [ ] **T018** 신규 e2e — `tests/e2e/index-command.test.ts`: 전 verb 실행, `.reap/.index/` 에만 생성,
      `filesProcessed: 0`, edges 총==고유, HEAD 변경 시 lazy 갱신, 비-git 디렉토리 오류.
      **prompt/guide 에 적은 명령 문자열을 그대로 실행한다** (`?file=` 사고 방지).
- [ ] **T019** 문서 + 버전 — `package.json` **0.17.6**, `RELEASE_NOTICE.md`/`RELEASE_NOTES.md` 에
      0.17.6 항목(**gen-088 `reap uninstall` 포함**, 0.17.5 항목 불변), `docs/src/i18n/translations/*.ts`
      **5개 전부**, `README*.md` 5개, `src/templates/reap-guide.md` + `.reap/reap-guide.md` § Code Intelligence 재작성.
      **검증**: `npx vite build` + `bash scripts/check-docs-version.sh`.
- [ ] **T020** 게이트 실행 — `npm run build` → `npm run typecheck` → 세 스위트 → 자기진단 게이트 →
      `check-docs-version.sh`. 결과를 04-validation.md 에 `[실행]`/`[negative]`/`[독해]` 표기와 함께 기록.

### 새로 만들 backlog (S7 명시, 범위 밖)

- community detection 재설계 (연결 컴포넌트 → Louvain 검토)
- process tracing 재설계 (진입점 휴리스틱이 call resolution 품질에 종속)

## Test Strategy

| 변경 유형 | 테스트 레벨 |
|---|---|
| `src/indexer/` 순수 로직 (graph, import/call resolver, store, assets) | unit |
| `reap index` CLI 표면 | e2e |
| commit 주기 incremental, lazy 갱신 | e2e (임시 git 저장소 fixture) |
| lifecycle 진입점 축소 | 기존 e2e 수정 + 신규 e2e |
| 배포 산출물 (번들 external, grammar 동봉, node 실행) | **자기진단 게이트** — unit/e2e 는 소스만 본다 |
| 문서 | `check-docs-version.sh` + `npx vite build` |

**먼저 실패시킬 것 (evolution.md)**:
- T006 해석률 테스트 — `.js`→`.ts` 후보 추가 **전**에 red 확인
- T015 게이트 § 5 — 알려진 관계 assertion 을 일부러 깨뜨려 fail 확인
- **부재를 주장하는 assertion 은 스스로 먼저 증명한다** — "상주 프로세스 0개", "daemon 명령 없음"은
  명령이 실제로 돌았다는 증거(`status: "ok"`, 숫자)를 먼저 요구한 뒤 판단한다

**영향받는 기존 테스트**: `tests/e2e/{uninstall,update}.test.ts`, `tests/unit/{uninstall,semver}.test.ts`,
그리고 `learning` emit 을 검증하는 e2e(있다면 T016 에서 확인).

## Additional Findings

- **`check-docs-version.sh` 가 `package.json` 버전 bump 를 강제한다.** 0.17.6 changelog 항목을 쓰려면
  `package.json` 도 0.17.6 이어야 게이트가 통과한다 (`migration note ≤ 패키지 버전` 검사도 동일).
  gen-088 은 버전을 올리지 않았으므로 **0.17.6 bump 는 이번 세대가 소유**하고, 0.17.6 노트는
  gen-088 의 `reap uninstall` 과 이번 세대를 **함께** 기술한다. 태그·발행은 하지 않는다.
- 현재 문서 게이트는 v0.17.5 기준 **전부 green** [실행: `bash scripts/check-docs-version.sh`].
- `daemon/src/indexer/index.ts` 의 `IndexManager` 는 `finally` 블록에서 community/process 를 항상
  계산한다. v1 제외 대상이므로 진입 API 를 새로 쓴다 (부분 삭제보다 안전).
- `npmRemovalTargets(daemonSource, daemonInstalled)` 는 `resolveDaemonAvailability` 에 의존한다.
  그 함수가 사라지므로 **daemon 패키지를 무조건 제거 목록에 넣는다** — 미설치 상태의 `npm rm -g` 는 no-op 이고,
  소스 체크아웃으로 daemon 을 돌리던 사용자는 애초에 전역 설치를 한 적이 없다.
- `tree-sitter-wasms` 전체는 36 grammar / 51.8 MB / gzip 4.4 MB. **15개만 복사하면 26.6 MB / 2.4 MB** —
  backlog S2 가 승인한 수치가 후자다. devDependency + build 복사가 그 차이를 만든다.

## Risks

| 위험 | 대응 |
|---|---|
| 번들이 `web-tree-sitter` 를 인라인해 node 에서 조용히 0심볼 (gen-083 재현) | `--external` + 자기진단 게이트가 **격리 설치 + node** 로 판정 |
| 검사가 "돌았는가"만 묻는 것 (P2 를 만든 형태) | 게이트가 **알려진 관계 + 해석률**을 묻는다 |
| 대체물이 원본보다 좁아 prompt 수정 시 기능이 조용히 준다 | `callers`/`callees` 를 CLI 에 포함해 표면 parity 유지 |
| grammar 26.6 MB 가 설치 크기를 32배로 키운다 | backlog S2 에서 측정·승인됨. 네이티브 빌드 제거가 대가 |
| 커밋 안 된 변경이 인덱스에 없다 | S3 이 명시한 트레이드오프. `status` 가 HEAD 대비 stale 여부를 항상 보고 |
| 5 로케일 drift | 문서를 **한 번에** 고치고 `check-docs-version.sh` 로 검사 |

## Human Confirmation

Clarity high, backlog 가 사용자 결정을 그대로 담고 있어 재확인 없이 진행한다.
다만 **다음 셋은 backlog 에 명시되지 않아 이 계획이 정한 것**이므로 적어 둔다 —
이견이 있으면 implementation 중 어느 시점에도 되돌릴 수 있다:

1. `package.json` 을 **0.17.6 으로 올린다** (문서 게이트 요건). 태그·발행은 하지 않는다.
2. grammar 는 **devDependency + build 복사**로 15개만 동봉한다 (의존 추가는 `web-tree-sitter` 하나).
3. `reap index` 에 `callers`/`callees` 를 포함한다 (prompt 표면 parity).

---
type: task
status: consumed
priority: high
createdAt: 2026-08-19T22:59:20.529Z
consumedBy: gen-089-0e08f5
consumedAt: 2026-08-19T23:35:32.651Z
---

# daemon 폐기 및 indexer 내장 — 인덱싱을 git commit 주기에 맞추고 분석을 CLI tool 로 제공

> 사용자 결정 (2026-08-20):
> - **상주 프로세스(daemon)를 폐기**한다. indexer 는 reap 패키지에 **내장**한다
> - **인덱싱 계산 주기를 git commit 에 맞춘다**
> - blast radius / community detection / process tracing 은 **내장 도구로 갖추고 agent 가 필요할 때 tool 로 호출**하게 한다
> - **0.17.6 으로 바로 진행**한다
> - **이미 발행된 릴리즈 문서(0.17.5)는 손대지 않는다** — changelog 는 역사 기록이다
> - `@c-d-cc/reap-daemon` 은 npm 에서 **deprecated 처리 완료** (2026-08-20)
>
> 출발점: GitHub Discussion #10 에서 aresstokrat 이 제기한 *"code-intelligence 를 embedded 기본으로, daemon 은 선택적 배포 모드로"* 제안. 그 제안을 본 저장소에서 실측으로 검증한 결과가 아래다.

## Problem

### P1. 상주 프로세스가 지금 아무것도 벌지 못한다 (실측)

본 저장소를 daemon 에 등록해 실제로 돌린 수치다. **재측정 불필요.**

```
233 files → 796 nodes / 1,468 edges
full index:  6,672 ms
2회차:       6,182 ms   filesProcessed: 233
3회차:       6,357 ms   filesProcessed: 233   ← 변경 0인데 매번 전량 재처리
RSS: 27MB(idle) → 39MB(indexed)
```

**(a) incremental 경로가 HTTP 로 도달 불가능하다.**

`runIncrementalPipeline` 은 "변경 없으면 즉시 반환" 분기까지 갖추고 구현돼 있는데, 유일한 호출부가 인자를 넘기지 않는다:

```ts
// daemon/src/api/projects.ts:60
const result = await mgr.indexProject(entry.path);   // incremental 인자 없음
// → daemon/src/indexer/index.ts:46  return await runFullPipeline(...)
```

REAP 의 lifecycle 4개 진입점이 전부 full reindex 를 돌린다. **상주 프로세스의 유일한 존재 이유(warm index)가 작동한 적이 없다.**

**(b) 그 6.2초의 92%는 tree-sitter 가 아니라 git 서브프로세스다.**

```ts
// daemon/src/indexer/pipeline.ts:63 — 파일마다 1회
execSync(`git log -1 --format=%H -- "${file.relativePath}"`, ...)
```

실측 24.5ms × 233 = **약 5.7초**. 파싱·그래프·SQLite 전부 합쳐 0.5초 남짓이다.

**(c) 상주가 준다는 이점 넷이 현재 규모에서 전부 0에 수렴한다.**

| 이점 | 실측 | 판정 |
|---|---|---|
| warm 그래프 | 796 nodes. 영속화 읽기는 `SELECT *` 두 개가 전부 | 무시 가능 |
| 비차단 인덱싱 | 6.2초라서 필요했음. 원인이 (b) | 고치면 차단해도 무방 |
| 다중 프로젝트 공유 | 인덱스는 이미 프로젝트별 분리 저장 | 절약분 미미 |
| agent 용 HTTP | curl ~5ms vs `reap` CLI 콜드 스타트 **실측 40~70ms** | 차이 없음 |

**(d) 실제로는 비용을 발생시켰다.** 조사 시점에 이 머신에 고아 daemon 프로세스가 떠 있었다 — PPID 1, 27MB, 임의 포트(59999), `daemon.pid` 미기재, `reap daemon status`/`stop` 이 인지하지 못함. `daemon/src/index.ts` 의 `server.listen()` 에 `error` 핸들러가 없어 포트 충돌이 uncaught 로 간다.

### P2. 대표 기능이 5개월간 0을 반환하고 있었고 아무도 몰랐다

**blast radius 는 표준 TypeScript ESM 프로젝트 전체에서 항상 0을 반환한다.**

```
src/core/lifecycle.ts  → direct=0  indirect=0
src/core/nonce.ts      → direct=0  indirect=0
src/cli/index.ts       → direct=0  indirect=0

인덱스 실측:  CALLS 5,816  |  IMPORTS 56   (56개 전부 docs/src, src/ 는 0개)
             file:: 노드 수 0
grep 실측:    src/ 의 상대 import 341개
```

원인은 `daemon/src/indexer/import-resolver.ts` 의 후보 목록 한 줄이다:

```ts
const candidates = [ base, `${base}.ts`, `${base}.tsx`, `${base}.js`, ... ];
```

REAP 은 ESM/NodeNext 규약대로 `from "./lifecycle.js"` 라고 쓴다. `base = src/core/lifecycle.js` 가 되고 후보는 `lifecycle.js` / `lifecycle.js.ts` / … — **실제 파일 `lifecycle.ts` 와 어느 것도 맞지 않는다.** `.js` specifier → `.ts` 파일 변환이 빠져 있다. docs/src 는 확장자 없는 React import 라 그 56개만 살아남았다.

**게다가 문서화된 호출법이 네 곳 전부 틀렸다.**

```
문서:  GET /impact?file=<path>
실제:  GET /impact?files=<path>    아니면 "Missing query param: files"
```

`src/core/prompt.ts:282` (daemon: true 시 **모든 agent prompt 에 주입되는 절**), `src/templates/reap-guide.md:486`, `~/.reap/reap-guide.md:486`, `.reap/reap-guide.md:479`.

**이것이 이 backlog 의 가장 중요한 교훈이다.** E2E 130개 통과, 자기진단 게이트 § 5 의 "심볼 수 > 0" 통과, CI 내내 초록. **모든 검사가 "인덱싱이 돌았는가"를 물었고 "결과가 말이 되는가"는 아무도 묻지 않았다.**

### P2-b. edges 가 재인덱싱마다 쌓인다 — 같은 부류가 하나 더

인덱싱을 5회 돌린 뒤 저장소를 직접 열어 확인했다:

```
edges 총 7,354 / 고유 1,482  →  중복 5,872 (정확히 5배 = 실행 횟수)
nodes 총 807  / 고유 807     →  중복 0
```

`nodes` 는 `id` PRIMARY KEY + `INSERT OR REPLACE` 라 dedup 되는데, **`edges` 테이블에는 PRIMARY KEY 도 UNIQUE 도 없고 `saveEdges` 가 평범한 `INSERT`** 다 (`daemon/src/indexer/storage.ts:87-91, 124`).

살아 있는 daemon 은 인메모리 그래프를 매번 새로 만들어서 질의가 멀쩡하지만, **재시작하면 SQLite 에서 N배로 부푼 그래프를 로드한다.** 메모리도 N배가 되고 개수 기반 분석(cohesion, process 크기, `affectedSymbols`)이 전부 어긋난다. 저장 용량도 5배였다 (253 KB → 817 KB).

**이번 변경으로 원천적으로 사라진다** — 그래프 전체를 스냅샷으로 직렬화하면 append 의미 자체가 없다. 다만 Verification 에 `총 == 고유` 를 넣어 회귀를 막는다.

### P3. 나머지 두 분석도 현재 형태로는 정보를 주지 않는다

**community detection** — 이름과 달리 Louvain 이 아니라 **연결 컴포넌트(BFS)** 다. 실행 결과:

```
총 105개 →  573 nodes (전체 796의 72%) 한 덩어리 + 싱글톤 97개
cohesion 전부 1.00   ← 연결 컴포넌트는 정의상 internal/total = 1. 상수를 계산하고 있다
라벨 "src/core"      ← 그 안에서 가장 흔한 디렉토리일 뿐. `ls src/` 보다 정보가 적다
```

그래프를 고쳐도 안 바뀐다. **알고리즘의 성질이다.**

**process tracing** — 진입점 = "아무도 호출하지 않는 함수"인데, call resolution 이 이름 기반이라 **해석 실패한 함수도 전부 진입점**이 된다. 실행 시 `MAX_PROCESSES=75` 상한에 도달했다. 라벨 `gitCommit → gitInit → IndexManager` 는 실행 흐름이 아니라 **DFS 방문 순서 앞 3개 이름**이라 흐름처럼 오독된다.

### P4. 유지 비용이 크고 core 까지 침투해 있다

```
daemon/src                    1,786 lines
reap 쪽 전용 코드                845 lines  (client 586 / index 208 / lifecycle 51)
reap src 내 daemon 언급          385 lines,  26개 파일
reap 쪽 daemon 테스트           2,725 lines, 12개 파일
문서 (README×5/RELEASE×2/guide/docs 5로케일)  216 lines, 13개 파일
                              ─────────────
                              약 5,900 lines
```

opt-in 주변부가 아니다. `core/prompt.ts` · `core/integrity.ts` · `core/semver.ts` · `core/migration.ts` · `core/dump-state-sync.ts` · `adapters/` · run 명령 6개 · `fix`/`update`/`destroy`/`uninstall`/`load-context` 에 들어가 있다.

코드 밖 비용: 별도 npm 패키지 + `daemon-v*` 릴리즈 파이프라인, `check-version-floors.sh` 의 `MIN_DAEMON_VERSION` 검사, 자기진단 게이트 § 5 · § 5d-bis(스크립트에서 가장 복잡한 절), migration note `v0.17.5`, `DaemonAvailability` 11필드 주입 규약, `locateDaemon` 4분기와 분기별 안내 문구. gen-083~086 네 세대가 거의 전부 이 이음매에 쓰였다.

### P5. 사용자가 없다 (측정)

```
@c-d-cc/reap-daemon   지난 30일 다운로드  0회    (발행 2026-08-19, npm deprecated 처리 완료)
@c-d-cc/reap          지난 30일 다운로드  1,546회
```

**인과의 원천은 P4 가 아니라 이것이다** — 소비자가 없으니 결과를 검증할 사람도 없었고, 그래서 0을 반환해도 5개월간 아무도 몰랐다.

## Solution

### S1. 상주 프로세스·별도 패키지를 폐기한다

`daemon/` 패키지를 제거하고, 살릴 부분(tree-sitter 심볼 추출 · CodeGraph · 분석 알고리즘)만 reap 본체로 이식한다.

**버리는 것**: HTTP 서버 · router · registry · PID 파일 · 포트 · idle timer · 별도 npm 패키지 · `daemon-v*` 릴리즈 · `MIN_DAEMON_VERSION` · `locateDaemon` 4분기 · `daemonBin` · `REAP_DAEMON_BIN` · `DaemonAvailability` · `explicitMiss`/`staleRemedy`/`missingDaemonRemedy` · `reap daemon` 서브커맨드 · 자기진단 § 5 · § 5d-bis · `check-version-floors.sh` 의 daemon 절.

**남기는 것**: parser(web-tree-sitter + grammar) · scanner · CodeGraph · import/call resolver · impact(수정 후) · storage(형식 교체).

### S2. 동봉 비용 — 측정 완료

| | 다운로드(gzip) | 디스크 | 네이티브 빌드 |
|---|---|---|---|
| 현재 `@c-d-cc/reap` | 227 kB | 869 kB | 없음 |
| `web-tree-sitter` | ~90 kB | 288 kB | **없음** |
| grammar 15개 (REAP 지원 언어 전부) | **+2.4 MB** | +26.6 MB | **없음** |
| grammar 7개 (ts/tsx/js/py/go/rust/java) | +0.8 MB | ~9 MB | 없음 |
| ~~`better-sqlite3`~~ | — | 12 MB | **있음 → 제거** |

WASM 은 11배로 압축된다. **다운로드 227 kB → 약 2.7 MB.**

핵심은 크기가 아니라 **네이티브 빌드가 사라진다는 것**이다. gen-083 에서 번들이 네이티브 모듈을 인라인해 node 에서 심볼 0개를 뽑던 결함, node-gyp/prebuild 의존이 그 하나뿐이었다.

→ genome 의 **"zero dependency" 를 "zero *native* dependency"** 로 고쳐 쓴다. `application.md`/`environment/summary.md` 가 함께 아는 사실이므로 **carrier 표식 대상**이다.

### S3. 인덱싱 주기를 git commit 에 맞춘다

인덱스의 **변경 단위를 파일 mtime 이 아니라 commit** 으로 삼는다.

```
인덱스의 신원  = lastIndexedCommit (SHA)
갱신 대상      = git diff --name-only <lastIndexedCommit>..HEAD
stale 판정     = SHA 비교 1회
```

**`runIncrementalPipeline` 이 이미 이 모델로 짜여 있다** — `loadMeta("lastCommit")` → `getChangedFiles(root, lastCommit)` → 변경 없으면 즉시 반환. 도달만 못 했다. 이식하면서 호출부를 바로잡는 것이 곧 이 설계의 구현이다.

파생 효과:

- **파일별 `git log` 233회가 필요 없어진다.** 그 정보는 인덱스 전체에 하나만 있으면 된다 → P1(b)의 5.7초가 사라진다
- **eager 트리거가 1곳으로 준다.** 현재 4개 진입점 중 실제로 git commit 이 일어나는 것은 `completion --phase commit` 뿐이다
- 거기에 **질의 시점 lazy 갱신**(HEAD ≠ lastIndexedCommit 이면 diff 만큼)을 더하면 브랜치 전환·rebase·외부 커밋까지 자연히 덮인다

**트레이드오프**: 커밋 안 된 작업 트리 변경은 인덱스에 없다. 다만 blast radius 가 묻는 "X 를 바꾸면 *무엇이* 영향받나"의 답은 기존 커밋 코드라 대부분 여전히 맞다. 새로 추가한 파일의 심볼이 안 잡히는 것만 실제 gap 이다.

### S4. 인덱스는 프로젝트 레벨 `.reap/.index/` 에 두고 gitignore 한다

**위치가 사용자 레벨에서 프로젝트 레벨로 바뀐다.** 현재는 `~/.reap/daemon/indexes/<projectId>/{main,wt-<branch>}/index.db` 다 (`daemon/src/paths.ts`, `reap:carrier(reap-home-asset-set)`).

HOME 이었던 것은 위치 판단의 결과가 아니라 **아키텍처의 귀결**이다 — daemon 이 전역 단일 프로세스로 여러 프로젝트를 섬기니 `registry.json` 과 전역 저장소가 필요했다. 내장하면 CLI 가 프로젝트 안에서 돌므로 `cwd` 가 곧 프로젝트다.

| | `.reap/.index/` | `~/.reap/index/<hash>/` |
|---|---|---|
| registry | **불필요** (project = cwd) | 경로↔ID 매핑이 되살아남 |
| 프로젝트 삭제 시 | **같이 사라짐** | **고아로 남음** |
| worktree | **키잉 불필요** — worktree 마다 자기 `.reap/` | `wt-<branch>` 키잉 유지 필요 |
| 컨테이너/devcontainer | 프로젝트는 대개 마운트 → 유지 | HOME 은 대개 미마운트 → 매번 재빌드 |
| `.reap/` 원칙 | 일치 | 예외로 남음 |

**두 번째 줄이 결정적이다.** 파생 데이터를 HOME 에 두는 것은 gen-088 이 지금 고치는 문제 유형("사용자 레벨에 흩뿌리고 제거 경로가 없다")을 하나 더 만드는 일이다. `.reap/.session-state.md` 가 점 접두 + gitignore 라는 같은 성격의 선례다.

**gitignore 는 크기가 아니라 자기참조 때문에 필수다** — 인덱스를 커밋에 넣으면 그 인덱스를 담은 커밋을 다시 인덱싱해야 한다.

**구 위치 정리**: `~/.reap/daemon/` 을 `reap uninstall` 뿐 아니라 **`reap update` 경로에서도 제거**한다. 폐기 후에는 아무도 쓰지 않는 디렉토리다. migration note `v0.17.6.md` 항목.

### S4-2. 형식은 JSON — YAML 은 측정으로 탈락

본 저장소 데이터(807 nodes / 1,482 edges, 중복 제거)로 실측:

| 형식 | 원본 | gzip | 쓰기 | 읽기 |
|---|---|---|---|---|
| **JSON** | 253 KB | **24 KB** | 0.7 ms | **0.5 ms** |
| JSONL | 253 KB | 24 KB | 0.0 ms | 0.9 ms |
| YAML (`yaml` v2, 기존 의존) | 274 KB | 24 KB | 49.6 ms | **61.0 ms** |

**YAML 은 읽기가 122배, 쓰기가 71배 느리고 원본도 8% 크다.** gzip 후 크기는 같다. 사람이 읽을 일이 없는 파생·gitignore 자산이므로 YAML 의 유일한 장점(가독성)이 값을 하지 않는다. **JSON + `node:zlib` gzip** (내장, 의존 0).

전체 로드 왕복(gunzip + `JSON.parse` + Map 2개 구축) **실측 5~8 ms**. CLI 콜드 스타트 40~70 ms 와 합쳐 **질의 1회 50~80 ms** — 상주 프로세스가 필요 없다는 근거가 여기서 닫힌다.

### S4-3. 규모가 커지면 tree 로 쪼갠다 (한 파일에 몰지 않는다)

본 저장소 데이터를 배수로 늘려 `JSON.parse` 를 실측했다:

| 배수 | nodes | edges | JSON | gzip | parse | gunzip+parse |
|---|---|---|---|---|---|---|
| 1x | 807 | 1,482 | 253 KB | 24 KB | 1 ms | 1 ms |
| 10x | 8,070 | 14,820 | 2.6 MB | 237 KB | 7 ms | 10 ms |
| 50x | 40,350 | 74,100 | 13.2 MB | 1.2 MB | 54 ms | 47 ms |
| 200x | 161,400 | 296,400 | 53.3 MB | 4.6 MB | 135 ms | **371 ms** |
| 1000x | 807,000 | 1,482,000 | 268.7 MB | 23.2 MB | 889 ms | **2,912 ms** |

읽을 것 둘:

- **임계는 5만~10만 노드(대략 소스 1만~2만 파일) 근방**이다. 그 아래는 단일 파일로 충분하고, 그 위에서 로드가 CLI 시작 비용을 넘어선다
- **큰 규모에서는 gzip 이 오히려 손해다** (200x 에서 135 ms → 371 ms). 압축 해제 비용이 I/O 절약을 넘는다. → **shard 를 개별 압축**해서 "필요한 것만 푸는" 구조가 답이다

**shard 키는 소스 디렉토리다.**

```
.reap/.index/
├── manifest.json           # lastIndexedCommit · shard 목록 · 통계 · import 해석률 · format 버전
├── files.json.gz           # 파일 노드 + IMPORTS edge   ← blast radius 는 이것만 읽는다
├── names.json.gz           # name → node id 역색인      ← 심볼 검색 진입점
└── symbols/
    ├── src__core.json.gz
    ├── src__cli__commands.json.gz
    └── docs__src.json.gz
```

설계 근거:

- **blast radius 는 심볼 데이터를 전혀 필요로 하지 않는다.** 파일↔파일 IMPORTS 만 걷는다. 본 저장소 기준 234 files / 341 edges → **수 KB.** 가장 많이 쓰는 질의가 가장 적게 읽는다
- **디렉토리 키가 git diff 와 1:1로 맞는다.** 커밋 주기 인덱싱(S3)에서 `git diff --name-only` 가 준 변경 파일 → 그것을 담은 shard 만 다시 쓴다. 단일 파일이면 한 줄 고쳐도 전체를 다시 쓴다
- **지역성이 있다.** 모듈 내부 호출이 같은 shard 에 떨어져 `callers`/`callees` 가 대개 shard 1개로 끝난다. 해시 버킷은 분포는 고르지만 지역성이 0이라 매번 전부 읽어야 한다
- 파일 단위 shard 는 수천 개의 작은 파일을 만들어 전체 로드가 오히려 느려진다

**shard 를 넘는 edge 는 양쪽에 기록한다** — source shard 와 target shard 두 곳. shard 내부 edge 는 1회. 이렇게 하면 `callers`(역방향)와 `callees`(정방향) 둘 다 **항상 shard 1개 로드**로 끝난다. 비용은 cross-shard edge 에 한해 2배이며, 전 shard 스캔을 없애는 대가로 싸다.

**단, v1 은 단일 파일로 시작한다.** 지금 규모(253 KB / 1 ms)에서 shard 는 순수한 복잡도다. 대신 두 가지를 **처음부터** 넣는다:

1. `manifest.json` 에 **`format` 버전 필드** — 나중에 무중단 전환하기 위한 자리
2. **shard 배치를 아는 곳은 `manifest.json` 하나** — 코드가 경로 규칙(`symbols/src__core.json.gz`)을 하드코딩하면 형식 전환 시 두 곳이 같은 사실을 알게 된다. carrier 문제를 미리 만들지 않는다

전환 임계는 위 표의 실측치를 근거로 `manifest` 통계(노드 수)로 판정한다. **숫자를 문서에 적어두지 않으면 다음 사람이 또 추측으로 판단한다.**

### S5. 분석은 `reap index <verb>` CLI tool 로 노출한다

MCP 는 프로세스를 다시 들이는 것이라 배제한다(2026-06-28 결정과 일치). CLI 서브커맨드면 agent 가 Bash 로 부르고 모든 client 에서 동작하며 새 인프라가 0이다. 0.18 plugin 전환 후 plugin 이 제공하는 tool 표면을 다시 검토할 수 있다.

**prompt 주입 절은 유지하되, 예시가 실제로 도는지 테스트가 검증해야 한다** — `?file=` 이 네 곳 다 틀렸던 이유가 그것이다.

### S6. 결과를 검증하는 지표를 만든다 ← 이번에 반드시 다르게 할 것

`reap index status` 가 다음을 보고한다:

```
nodes: 796  (function 493 / method 166 / class 90 / type 47)
edges: 5,816 CALLS / 341 IMPORTS
import 해석률: 341/341 (100%)        ← 이 한 줄이 P2 를 첫날 잡는다
lastIndexedCommit: c65284d  (HEAD 일치)
```

**import 해석률 하나면 됐다.** 현재 값은 0/341 이고, 화면에 있었으면 아무도 못 지나쳤다.

자기진단 게이트도 "심볼 > 0" 이 아니라 **"이 저장소에서 알려진 관계가 잡히는가"** 를 묻게 바꾼다 (예: `stage-transition.ts → lifecycle.ts` import edge 존재). longterm 의 *"부재를 주장하는 assertion 은 스스로 먼저 증명한다"* 가 그대로 적용되는 자리다.

### S7. 세 알고리즘은 처리가 각각 다르다

| | 상태 | 처리 |
|---|---|---|
| **blast radius** | import resolver 한 줄(`.js` → `.ts`)만 고치면 동작 | **이식 + 수정.** v1 포함 |
| **community detection** | 연결 컴포넌트라 원리적으로 덩어리 1개. cohesion 은 상수 | **v1 제외** → 별도 backlog (Louvain 교체 검토) |
| **process tracing** | 진입점 휴리스틱이 call resolution 품질에 종속. 라벨이 흐름을 오도 | **v1 제외** → 별도 backlog (재설계) |

**셋을 한꺼번에 옮기면 "이식은 됐는데 여전히 아무도 결과를 안 본다"가 반복된다.** blast radius 하나가 제대로 도는 것이 셋이 어중간한 것보다 낫다.

### S8. 기존 사용자에게 도달하는 것 (gen-072 교훈)

1. **`config.yml` 에 `daemon: true` / `daemonBin` 을 가진 프로젝트** — `VALID_CONFIG_FIELDS`(`update.ts`)에서 빼면 `reap update` 가 **조용히 지운다**. 원하는 결과일 수 있으나 **migration note `v0.17.6.md` 에 명시**한다
2. **`npm i -g @c-d-cc/reap-daemon` 을 한 사용자** — 전역 패키지가 고아로 남고 프로세스가 떠 있을 수 있다. **gen-088 의 `reap uninstall` 이 daemon 정리를 포함하는지 확인하고, 없으면 이 세대에서 보완**한다. npm 은 이미 deprecated 처리됨
3. **이미 발행된 0.17.5 문서는 손대지 않는다** (사용자 결정). changelog 는 역사 기록이다. **현재 안내**(reap-guide / README×5 / docs 5로케일 / prompt)만 이 세대에서 216줄을 **한 번에** 정리한다 — 두 번 건드리면 로케일 drift 가 난다

## Files to Change

**제거**
- `daemon/` 전체 (1,786 lines) — 살릴 부분은 아래로 이식
- `src/cli/commands/daemon/{client,index,lifecycle}.ts` (845 lines)
- `.github/workflows/release.yml` — `daemon-v*` 태그 트리거 job
- `scripts/check-version-floors.sh` — `MIN_DAEMON_VERSION` 절
- `scripts/check-self-diagnosis.sh` — § 5, § 5d-bis
- `package.json` — `workspaces` 의 `daemon`

**이식 (→ `src/indexer/` 신설 제안 — `src/core/index/` 는 배럴 파일 `index.ts` 와 혼동되므로 피한다)**
- `daemon/src/indexer/{parser,scanner,graph,pipeline,import-resolver,call-resolver,impact}.ts`
- `daemon/src/indexer/storage.ts` → **JSON + gzip 스냅샷으로 교체** (S4-2). `manifest.json` 이 배치·통계·`format` 버전의 단일 소유자 (S4-3)
- `daemon/src/package-assets.ts` → grammar/queries 경로 해석 (bundle/dev 분기 주의 — longterm 의 `import.meta.url` 교훈)
- `daemon/queries/*.scm` 15개 → `src/templates/` 또는 전용 자산 디렉토리
- **`import-resolver.ts` 의 `.js` → `.ts` 후보 추가** (P2 의 근본 원인)

**수정**
- `src/cli/index.ts` — `daemon` 명령 제거, `index` 명령 신설
- `src/core/prompt.ts` — Code Intelligence 절 재작성 (`?file=` → 새 CLI, `DaemonAvailability` 주입 제거)
- `src/core/integrity.ts` — daemon 관련 진단 제거
- `src/core/{semver,migration,dump-state-sync}.ts` — daemon 분기 제거
- `src/cli/commands/run/{start,learning,implementation,completion,early-close,evolve}.ts` — 4개 트리거를 commit 1곳 + lazy 로 축소
- `src/cli/commands/{fix,update,destroy,uninstall,load-context}.ts`
- `src/types/index.ts` — `ReapConfig.daemon`/`daemonBin`, `DaemonAvailability` 제거
- `src/adapters/` — daemon 언급 제거
- `package.json` — `web-tree-sitter` + grammar 자산 추가, `better-sqlite3` 미도입
- `.gitignore` — `.reap/.index/`
- `src/templates/migration/v0.17.6.md` — **신규**

**문서 (현재 안내만, 216줄)**
- `src/templates/reap-guide.md` § Code Intelligence (24줄) + `.reap/reap-guide.md` 동기화
- `README{,.ko,.ja,.de,.zh-CN}.md` (55줄)
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` (122줄) — **5개 전부**, `npx vite build` 확인 필수
- `RELEASE_NOTES.md` / `RELEASE_NOTICE.md` — **0.17.5 항목은 손대지 않고 0.17.6 항목만 추가**

**genome / environment**
- `.reap/genome/application.md` — "zero dependency" → "zero native dependency", carrier 표식
- `.reap/environment/summary.md` — daemon 절 전체, Tests baseline, CI/Release 게이트 표

**테스트**
- 제거: `tests/e2e/daemon-{config,indexing,lifecycle,query}.test.ts`, `tests/unit/{daemon-availability,integrity-daemon,prompt-daemon}.test.ts`, `tests/helpers/daemon.ts`
- 유지/이전: `tests/fixtures/daemon-sample/` → indexer 단위 테스트 fixture 로 재활용
- 신규: import 해석률 회귀 테스트(**0/341 상태에서 먼저 fail 시킬 것** — evolution.md 의 "검사를 만들 때 먼저 실패시켜라"), commit 주기 incremental 테스트, `reap index` e2e

## 이 backlog 가 다루지 않는 것

- **community detection 재설계** (Louvain 등) → 별도 backlog
- **process tracing 재설계** → 별도 backlog
- **SCIP 채택** → `vision/design/daemon/scip-and-scale.md` 의 보류 결정 유지
- **대규모 프로젝트용 daemon 모드 재도입** → S4 의 규모 상한에 실제로 부딪힐 때

## Verification

- [ ] `reap index status` 의 **import 해석률이 341/341** (현재 0/341)
- [ ] blast radius 가 `src/core/lifecycle.ts` 에 대해 **0이 아닌 dependent** 를 반환 (grep 결과와 대조)
- [ ] 변경 없는 상태에서 재인덱싱이 **`filesProcessed: 0`** (현재 233)
- [ ] 재인덱싱 N회 후 **edges 총 개수 == 고유 개수** (현재 5회에 5배로 누적)
- [ ] 인덱스가 **`.reap/.index/` 에만** 생성되고 `~/.reap/` 아래에는 아무것도 안 생긴다
- [ ] `reap update` 후 구 위치 `~/.reap/daemon/` 이 제거된다
- [ ] `reap` 설치 후 **상주 프로세스가 0개** (`lsof -iTCP -sTCP:LISTEN` 로 확인)
- [ ] 네이티브 빌드 없이 설치 성공 (자기진단 게이트의 격리 설치 경로)
- [ ] `daemon: true` 를 가진 기존 config 로 `reap update` 시 동작 정의대로 (migration note 대조)
- [ ] `npx vite build` 통과 + `scripts/check-docs-version.sh` 통과 (5 로케일 drift 0)
- [ ] 세 스위트 baseline 갱신 후 0 fail

**각 항목에 `[실행]` / `[negative]` / `[독해]` 표기를 붙일 것** (evolution.md).

---
type: task
status: pending
priority: medium
createdAt: 2026-07-26T02:09:58.712Z
---

# reap daemon 개선 검토 — SCIP 등 code indexing 도구 조사 + enterprise 규모 대응력 평가

> **성격: 조사/설계 세대.** 산출물은 코드가 아니라 **설계 문서**다. 구현은 승인 후 별도 세대로 분리한다.
>
> **착수 시점: 0.17.2 릴리즈 이후.** 유저 결정(2026-07-26) — 0.17.2 는 issue #21 범위로 마감.
>
> **선행 조건**: `daemon-배포-결함-수정-...md` 를 먼저 처리한다. 현재 npm 배포판에서 daemon 이 아예 동작하지 않으므로(끊긴 심링크), 분리된 배포 구조가 확정된 뒤에 그 위에서 SCIP 설계를 해야 한다.
>
> **재검증 2026-08-19: 미착수 확인.** 인용한 코드 근거 4건이 라인 번호까지 현재와 일치한다 — `call-resolver.ts:11-33` (이름 기반 nameIndex), `graph.ts:3-8` (인메모리 Map 4개), `scanner.ts:14` (`maxBuffer: 50MB`), `pipeline.ts:44` (`file::name` 노드 ID) + `:117` (순차 루프). 산출물 `vision/design/daemon-scip-integration.md` 도 없다. 선행 조건(배포 결함)도 그대로이며, 그쪽에서 **자기진단 게이트의 허위 커버리지 주장**이 추가로 발견됐다.
>
> **방향 확정 (유저 결정 2026-07-26): SCIP 채택.** 따라서 본 세대는 "어느 도구를 쓸지 고르는" 조사가 아니라 **SCIP 을 REAP 에 어떻게 얹을지 설계하는** 작업이다. 아래 S1/S3 을 그에 맞게 개정했다.

## Problem

### 현재 daemon 의 실제 구조 (코드 확인 결과)

`daemon/src/` 전체 1,538 lines. Tree-sitter WASM 15개 언어(`daemon/queries/*.scm`) + SQLite 영속화. gen-060/068/069 에서 incremental / opt-in / e2e 격리까지 갖췄다. **소규모~중규모 단일 repo 에서는 잘 동작한다** — 본 repo 가 dog-fooding 중이며 문제 없다.

문제는 그 범위를 벗어날 때다. 코드를 읽고 확인한 **구조적 한계 4가지**:

**1. Call resolution 이 이름 기반 휴리스틱 (`daemon/src/indexer/call-resolver.ts:11-33`)**

```ts
const nameIndex = new Map<string, string[]>();
for (const node of graph.allNodes()) { nameIndex.get(node.name).push(node.id); }
// ...
const targetIds = nameIndex.get(ref.name);
const targetId = pickBestTarget(targetIds, ref.file, sourceId, graph);
```

타입 해석이 없다. **동명이인을 이름과 위치 휴리스틱으로 고른다.** 결과:
- 오버로드, 서로 다른 클래스의 동일 메서드명, 인터페이스 구현체 다수 → **오답 edge**
- 동적 디스패치 / 고차 함수 → 미탐
- 코드베이스가 커질수록 동명이인이 급증하므로 **정확도가 규모에 반비례**한다

이것이 SCIP 같은 컴파일러 기반 인덱서와의 본질적 차이다. Tree-sitter 는 구문(syntax)만 보고 SCIP 은 의미(semantics)를 본다.

**2. 그래프 전체가 인메모리 (`daemon/src/indexer/graph.ts:3-8`)**

```ts
private nodes = new Map<string, SymbolNode>();
private edgesFrom = new Map<string, GraphEdge[]>();
private edgesTo = new Map<string, GraphEdge[]>();
private fileIndex = new Map<string, Set<string>>();
```

SQLite 는 write-through 영속화용이고 **쿼리는 인메모리 그래프에서 처리**한다. 즉 메모리 사용량이 코드베이스 크기에 선형 비례하며 상한이 없다. 수백만 LOC 급에서 이것이 첫 번째 벽이다.

**3. 단일 git repo 가정 + 스캔 상한 (`daemon/src/indexer/scanner.ts:14`)**

```ts
execSync("git ls-files -z", { cwd: projectRoot, maxBuffer: 50 * 1024 * 1024 });
```

- **multi-repo 모델이 없다.** registry 는 project 단위이고 project 는 곧 git repo 하나. repo 경계를 넘는 심볼 참조를 표현할 방법이 없다
- `maxBuffer: 50MB` 는 하드 상한이다. 초대형 monorepo 에서 초과 시 예외
- 전체 스캔이 **순차 루프** (`pipeline.ts:117` `for (const filePath of changedFiles)`) — 병렬화 없음

**4. Incremental 이 git diff 의존 (`scanner.ts:31-49`)**

`git diff --name-only <lastCommit>..HEAD` + working tree diff. 합리적이지만:
- 브랜치 전환 / rebase / force-push 시 diff 범위가 폭발하거나 무의미해짐
- **변경 파일만 재파싱해도 그 파일을 참조하던 다른 파일의 edge 는 갱신되지 않는다** (이름 기반 해석이라 전역 nameIndex 가 바뀜) — 부분 갱신의 정합성 검증 필요

### 왜 지금 검토하는가

REAP 이 외부 프로젝트로 확산되면(vision § Self-Hosting) 사용자의 코드베이스는 본 repo 보다 크다. 위 4가지는 **규모가 커진 뒤에 발견하면 재설계 비용이 훨씬 큰** 구조적 결정이다. 또한 daemon 은 opt-in 이라 지금은 실사용 피드백이 적어 — 결함이 조용히 누적된다.

## Solution

### S0. 현재 인덱싱 방식의 실제 동작 (배경 — 설계 전 공유 필요)

Tree-sitter 는 **파일 단위 파서**다. repo 단위 그래프는 Tree-sitter 가 아니라 그 위 계층이 조립한다 (`pipeline.ts:25-89`):

```
scanner   git ls-files                → 파일 목록
 ↓ (파일마다)
parser    tree-sitter parse           → 그 파일의 AST
          *-tags.scm query            → 캡처 추출
          tree.delete()               ← AST 폐기 (parser.ts:76)
 ↓
          definitions[] / references[]  (name, kind, line, file 만 남음)
 ↓ (전체 파일 처리 후 1회)
graph     addNode × N
          resolveImports  → 경로 매칭으로 IMPORTS edge
          resolveCalls    → 이름 매칭으로 CALLS edge
 ↓
storage   SQLite
```

**핵심: repo 전체 AST 는 존재하지 않는다.** 파일별 AST 는 캡처를 뽑고 즉시 버려지고, 살아남는 건 `.scm` 이 뽑은 납작한 레코드뿐이다. 타입도 스코프도 없다.

노드 ID 는 `` `${file.relativePath}::${def.name}` `` (`pipeline.ts:44`) — 전역 고유 심볼 ID 가 아니라 **파일+이름 조합**이라 같은 파일 내 동명 오버로드는 ID 가 충돌한다.

**이것이 한계 1의 실체다.** 설계가 미흡해서가 아니라, AST 를 버리고 이름만 남기는 구조에서는 원리적으로 그 이상이 불가능하다. 반대로 이 구조 덕에 메모리에 남는 것이 노드+엣지뿐이라 AST 를 보관하는 것보다는 가볍다. **SCIP 설계 시 이 대비를 정확히 인지하고 시작할 것.**

### S1. SCIP 채택 설계 — 무엇이 해결되고 무엇이 남는가

**SCIP** (https://scip-code.org/) — Sourcegraph 가 LSIF 후속으로 만든 code intelligence 프로토콜.

확인된 사실:
- protobuf 기반 **언어 중립 인덱스 포맷**(`scip.proto`). LSIF 의 moniker/resultSet 개념을 사람이 읽을 수 있는 문자열 심볼 ID 로 대체
- 언어별 인덱서 10+ (Go, Rust, Python, TS/JS, Java/Scala/Kotlin, C#, C/C++, Ruby, PHP, Dart)
- 소비 도구: Sourcegraph, Mozilla Searchfox, rust-analyzer, Glean
- **인덱싱 단계와 프론트엔드를 분리**하는 것이 핵심 설계 — 대규모 코드베이스에서 sub-second 심볼 조회를 노림

**해결되는 것**: 연결이 문자열 매칭이 아니라 **전역 고유 심볼 ID 매칭**이다. 컴파일러/타입체커가 이미 해석한 결과를 받으므로 동명이인 문제가 원리적으로 사라진다 → **한계 1 해소**.

**해결되지 않는 것 — 사용자 환경 요구사항**. 확인된 사실:

| 인덱서 | 요구사항 |
|---|---|
| scip-typescript | `tsconfig.json` + **`npm install`/`yarn install` 이 끝난 상태**, Node 18/20 |
| scip-java | **gradle / maven / sbt / bazel 중 하나로 빌드 가능한 상태**. "빌드 시스템 지원 없이는 거의 무용" |
| scip-python | 동작하는 python 환경 |

이건 **사용자의 저장소에서 일어나는 일**이다. daemon 을 어디에 두든, HTTP 로 부르든 MCP 로 부르든 `gradle build` 가 필요 없어지지 않는다. **패키징으로 없앨 수 있는 비용이 아니다.**

추가 제약:
- 인덱서들이 **언어마다 다른 런타임**으로 작성돼 있다 (scip-java 는 JVM, scip-go 는 Go). 15개 언어분 번들은 비현실적 → "사용자 환경에 있으면 쓴다" 모델이 될 수밖에 없다
- 인덱싱 비용이 빌드에 준한다. 현재 daemon 은 **4개 lifecycle 진입점에서 자동 인덱싱**하는데 이 트리거 모델이 그대로는 성립하지 않는다

### S2. 채택 형태 — Tree-sitter baseline + SCIP 승격 (하이브리드)

**SCIP 으로 Tree-sitter 를 대체하지 않는다.** 대체하면 "설치 즉시 동작"이라는 REAP 의 성질을 잃는다.

- **Tree-sitter** — 항상 동작. 설치·빌드 요구 없음. 현재의 즉시 동작 보장을 그대로 유지
- **SCIP** — 사용자 환경에 인덱서/툴체인이 있을 때만 활성화. 활성화되면 call resolution 이 이름 휴리스틱 → 의미 기반으로 **승격**
- 없으면 **조용히 Tree-sitter 폴백** — daemon 이 이미 확립한 silent-fail 패턴 그대로

설계해야 할 것:
- **감지** — 어떤 언어에 SCIP 인덱서가 사용 가능한지 판정하는 방법. 프로젝트별/언어별로 다를 수 있다
- **혼합 그래프** — 한 프로젝트에서 일부 언어만 SCIP 인 경우. 두 출처의 노드/엣지를 어떻게 합칠 것인가. 노드 ID 체계가 다르다 (`file::name` vs SCIP symbol ID) → **ID 통합 설계가 핵심 난제**
- **트리거 모델** — SCIP 인덱싱을 언제 돌릴 것인가. 4개 자동 지점은 과하다. 수동 트리거 / 커밋 시 1회 / 백그라운드 등
- **폴백 경계** — SCIP 인덱스가 오래됐을 때 Tree-sitter 결과와 섞을 것인가, SCIP 을 신뢰할 것인가

**MCP 는 추가하지 않는다.** HTTP API 가 이미 있고, MCP wrapper 는 2026-06-28 에 "가이드 문서 강화로 충분, 별도 프로세스 복잡도 불필요"로 유저가 이미 보류 결정했다 (midterm 기록). 본 건은 MCP 가 있어야 풀리는 문제가 아니다.

### S3. 규모 대응 — 코드 기반 분석 (실측 아님)

**대형 코드베이스를 구해 실측하는 것은 비현실적이라 하지 않는다** (유저 판단 2026-07-26). 대신 한계 2~4 는 **이미 코드 독해로 도출된 것**이므로 그 근거를 명시하고 설계에 반영한다.

- 한계 2 (인메모리 그래프) — 쿼리를 SQLite 로 내릴 것인가. 스키마(`storage.ts`)가 caller/callee/impact 쿼리를 감당하는지 검토
- 한계 3 (`maxBuffer: 50MB`, 순차 루프) — 스트리밍 스캔 + 병렬 파싱. **SCIP 도입과 무관하게 유효한 개선**이므로 우선순위 별도 판단
- 한계 4 (incremental 정합성) — 변경 파일만 재파싱해도 전역 nameIndex 가 바뀌어 기존 edge 가 낡는 문제. **SCIP 으로 가면 성격이 달라지므로** SCIP 설계와 함께 판단

**문서에 명시할 것**: 이 한계들은 측정이 아니라 **소스 독해에서 도출**했다. 실제 임계치(몇 LOC 에서 깨지는가)는 미상이며, 필요해지면 그때 측정한다.

Multi-repo 는 측정이 아니라 설계 질문이다:
- REAP 의 project = git repo 가정을 유지할 것인가
- 유지한다면 repo 간 참조는 포기하는가, 별도 계층을 두는가
- monorepo(단일 repo·다수 서비스)와 multi-repo(다수 repo)는 다른 문제 — 어느 쪽을 먼저 지원할지 결정. **둘 다 하면 설계가 발산한다**

### S3-1. 참고할 선행 사례 (설계 참고용, 채택 대상 아님)

- **stack-graphs** (GitHub) — Tree-sitter 기반 이름 해석 정밀화. SCIP 을 못 쓰는 언어의 baseline 을 올리는 용도로 검토 가치
- **LSP 하이브리드** — 타입 해석이 필요한 질의만 LSP 위임
- **Glean** (Meta) — 대규모 코드 지식 저장소. 규모 설계 참고
- codebase-memory-mcp / claude-context / CodeGraph — 같은 문제를 푸는 선행 사례

**주의**: 위 이름들은 웹 검색에서 얻은 2차 정보다. 참고 시 **1차 소스로 재확인**하고, 벤더 비교 글의 성능 수치는 인용하지 말 것 (예: "31개 repo 에서 토큰 10배 감소" 류는 출처가 벤더 측이다).

### S4. 산출물

- `.reap/vision/design/daemon-scip-integration.md` — SCIP 통합 설계. **design 문서로 남기는 이유**: 구체적 scope 를 가진 독립 주제이며(genome § Design vs Memory), 후속 세대의 판단 근거가 된다. longterm 의 "Design docs survive abort and anchor future generations" 교훈 적용
- 구현은 **별도 backlog 로 분리**. 본 세대에서 코드를 바꾸지 않는다

## Files to Change

**본 세대(설계)에서 변경**
- `.reap/vision/design/daemon-scip-integration.md` (신규)
- `.reap/vision/memory/midterm.md` — "Daemon Indexer 트랙" 절에 본 설계 결과 반영 (기존 남은 작업 4항목과의 관계 정리)

**조사 대상 (읽기 전용 — 본 세대에서 수정하지 않음)**
- `daemon/src/indexer/call-resolver.ts` — 한계 1
- `daemon/src/indexer/graph.ts` — 한계 2
- `daemon/src/indexer/scanner.ts` — 한계 3
- `daemon/src/indexer/pipeline.ts` — 한계 4 + 순차 처리
- `daemon/src/indexer/storage.ts` — SQLite 스키마가 쿼리 전환을 감당하는지
- `daemon/src/registry.ts` — multi-repo 모델 부재
- `daemon/queries/*.scm` — 15개 언어 쿼리의 커버리지 (gen-069 의 typescript call_expression 누락 전례 — 다른 언어에도 유사 누락 가능성)

**구현 시 (별도 세대)**
- 위 파일들 + `src/cli/commands/daemon/`

## Verification

설계 세대이므로 검증은 "코드가 동작하는가"가 아니라 **"설계가 근거를 갖는가"**다.

1. SCIP 및 인덱서 요구사항을 **1차 소스로 확인**했는가 (공식 문서/저장소 링크 + 확인 날짜). 본 backlog 의 표는 2차 정보 기반이므로 재확인 대상
2. **ID 통합 설계**(Tree-sitter `file::name` vs SCIP symbol ID)에 구체적 답이 있는가 — 이것이 하이브리드의 핵심 난제이며, 여기가 비면 설계가 미완이다
3. 트리거 모델이 명시됐는가 — 현재 4개 자동 지점을 어떻게 바꿀 것인지
4. **폴백 경로가 모든 분기에서 정의**됐는가 (인덱서 없음 / 인덱스 낡음 / 일부 언어만 SCIP / 인덱싱 실패)
5. `daemon: false` 사용자에게 **회귀 0** 임이 설계 수준에서 보장되는가
6. 한계 2~4 각각에 대해 "SCIP 도입과 함께 처리 / 무관하게 선행 / 보류" 중 하나로 분류됐는가
7. 규모 관련 서술이 **측정이 아니라 소스 독해 기반임을 명시**했는가 (근거 과장 방지)

## Open Decisions

- [ ] monorepo 와 multi-repo 중 어느 쪽을 우선 지원 대상으로 볼 것인가 (둘 다 하면 설계가 발산)
- [ ] SCIP 인덱스를 **daemon 이 직접 생성**할 것인가, 사용자/CI 가 생성한 것을 **읽기만** 할 것인가 — 후자가 훨씬 가볍고 REAP 원칙에 맞을 수 있다. 설계 초반에 확정 필요
- [ ] SCIP 활성 언어와 Tree-sitter 언어가 섞인 프로젝트에서 쿼리 결과를 어떻게 표시할 것인가 (출처 표기 여부 — agent 가 신뢰도를 구분할 필요가 있는가)
- [ ] midterm 의 기존 daemon 남은 작업 4항목(가이드 문서 / dist queries path / `.js` strip / 자동 staleness)을 본 설계에 흡수할지, 독립 유지할지. **dist queries path 는 배포 결함 backlog 와 같은 계열**이므로 그쪽으로 옮기는 것이 자연스러울 수 있다

## Related

- `daemon-배포-결함-수정-npm-설치-환경에서-daemon-동작-불가-reap-daemon-독립-발행.md` — **선행 필수**. 현재 npm 배포판에서 daemon 이 동작하지 않으므로 분리된 배포 구조 확정이 먼저다

## References

- SCIP: https://scip-code.org/ (2026-07-26 확인)
- SCIP 발표 글: https://sourcegraph.com/blog/announcing-scip
- scip-typescript (요구사항 근거): https://github.com/sourcegraph/scip-typescript
- Sourcegraph Indexers 문서 (scip-java 빌드 시스템 요구): https://sourcegraph.com/docs/code-navigation/writing-an-indexer
- 2차 비교 자료 (수치는 미신뢰, 설계 참고용):
  - https://rywalker.com/research/code-intelligence-tools
  - https://zylos.ai/research/2026-04-19-codebase-intelligence-repository-understanding-ai-agents
  - https://anthonywest.co.uk/research/code-intelligence-indexing-2026-openai

# REAP Daemon Indexer 설계

> 2026-03-29 | Status: Draft

## 개요

REAP 프로젝트의 소스 코드를 Tree-sitter 기반으로 인덱싱하는 글로벌 daemon.
IDE의 코드 인텔리전스처럼 심볼, 의존성, 호출 관계, 기능 클러스터, 실행 플로우를 그래프로 구축하여
AI agent가 프로젝트를 더 빠르고 정확하게 이해할 수 있도록 한다.

## 동기

현재 REAP는 프로젝트 지식을 `.reap/environment/summary.md` 등 수동 작성 문서에 의존한다.
소스 코드 자체에 대한 구조적 이해 — 어떤 함수가 어디서 호출되는지, 파일 간 의존성이 어떤지,
변경의 영향 범위가 어디까지인지 — 는 AI agent가 매번 직접 탐색해야 한다.
daemon이 이를 사전 인덱싱하면 탐색 시간과 토큰 소비를 크게 줄일 수 있다.

## 아키텍처

```
┌─────────────────────────────────────────────────┐
│                  reap daemon                     │
│                                                  │
│  ┌───────────┐  ┌──────────────┐                │
│  │ HTTP API  │  │ Project      │                │
│  │ :17224    │  │ Registry     │                │
│  └─────┬─────┘  └──────┬───────┘                │
│        │                │                        │
│  ┌─────▼────────────────▼─────┐                 │
│  │       Query Engine          │                 │
│  │    (in-memory graph)        │                 │
│  └─────────────▲───────────────┘                 │
│                │ write-through                    │
│  ┌─────────────▼───────────────┐                 │
│  │       Index Manager          │                │
│  │  (Tree-sitter + SQLite)      │                │
│  └──────────────────────────────┘                │
└──────────────────────────────────────────────────┘

호출 경로:
  reap CLI ──HTTP──▶ daemon
  Claude Code (skill) ──reap CLI──HTTP──▶ daemon
  reap lifecycle hook ──HTTP──▶ daemon (인덱스 갱신 트리거)
```

### 컴포넌트

- **HTTP API**: localhost:17224에서 REST 엔드포인트 제공. CLI와 외부 도구의 진입점.
- **Project Registry**: `~/.reap/daemon/registry.json`에 등록된 프로젝트 목록 관리.
- **Index Manager**: Tree-sitter 파싱, 심볼 추출, 그래프 구축, SQLite 영속화 담당.
- **Query Engine**: 인메모리 그래프에서 심볼 검색, 의존성 추적, 커뮤니티 탐지, blast radius 계산.

### 데이터 흐름

- **쓰기**: Index Manager가 Tree-sitter로 파싱 → SQLite에 저장 → 인메모리 그래프에 반영 (write-through)
- **읽기**: 항상 인메모리 그래프에서 응답 (단일 프로세스이므로 동기화 이슈 없음)
- **시작**: daemon 기동 시 SQLite에서 인메모리 그래프로 로드

## 프로세스 관리

### 자동 spawn

1. `reap` CLI가 daemon 필요한 명령 실행
2. `~/.reap/daemon/daemon.pid` 확인
3. PID 파일 없거나 프로세스 죽어있으면 → `spawn('node', ['daemon.js'], { detached: true, stdio: 'ignore' })`
4. `/health` 폴링 (최대 3초) → 응답 오면 원래 명령 실행

Bun이 설치되어 있으면 Bun으로 실행 (성능 이점). 기본 런타임은 Node.

### 자동 종료

- 마지막 API 호출로부터 30분 idle → 자동 exit
- 매 요청마다 idle 타이머 리셋

## 인덱싱 파이프라인

### 갱신 타이밍

- **generation 완료 시**: 항상 인덱스 갱신
- **generation 시작 시**: `git diff --name-only {last-indexed-commit}..HEAD` + uncommitted changes 확인. 변경이 있으면 갱신.

### 파싱 대상

**노드 타입**:

| 타입 | 예시 |
|------|------|
| Function | `function foo()`, `def bar()`, `func baz()` |
| Class | `class MyService` |
| Method | `MyService.handle()` |
| Interface/Trait | `interface Repo`, `trait Display` |
| Type/Enum | `type Config = ...`, `enum Status` |
| Module/File | 파일 자체가 하나의 노드 |

**엣지 타입**:

| 타입 | 의미 |
|------|------|
| CONTAINS | File → Function, Class → Method |
| CALLS | Function → Function |
| IMPORTS | File → File |
| EXTENDS | Class → Class |
| IMPLEMENTS | Class → Interface |

### 파이프라인 순서

1. **파일 탐색** — `git ls-files` 기반 (`.gitignore` 자동 반영, 바이너리 제외)
2. **Tree-sitter 파싱** — 언어별 `.scm` 쿼리로 심볼 def/ref 추출 (Aider 패턴 차용)
3. **Import 해석** — 언어별 resolver로 크로스파일 IMPORTS 엣지 구축
4. **Call 해석** — ref 심볼과 def 심볼 매칭 → CALLS 엣지
5. **커뮤니티 탐지** — Leiden 알고리즘으로 기능 클러스터 분류
6. **프로세스 추적** — 엔트리포인트에서 BFS로 실행 플로우 추출
7. **SQLite 저장 + 인메모리 로드**

### 증분 갱신

- `git diff --name-only {last-indexed-commit}..HEAD` + uncommitted changes로 변경 파일 목록 확보
- 변경 파일만 재파싱 (1~2단계)
- 해당 파일의 기존 노드/엣지 삭제 후 새로 삽입
- 영향받는 CALLS/IMPORTS 엣지 재계산 (3~4단계)
- 커뮤니티/프로세스: 변경 규모가 전체 파일의 10% 이상이면 전체 재계산, 아니면 스킵

### 지원 언어

Tree-sitter WASM 파서가 있는 14+ 언어: TypeScript/JavaScript, Python, Go, Rust, Java, Kotlin, C#, C/C++, Swift, Ruby, PHP, Dart 등.
Tree-sitter `.scm` 쿼리 파일은 Aider의 `tree-sitter-language-pack` 패턴을 참고하여 자체 번들.

## 저장소 구조

```
~/.reap/
  daemon/
    daemon.pid              ← daemon 프로세스 ID
    registry.json           ← 등록된 프로젝트 목록
    indexes/
      {project-id}/
        main/
          index.db          ← SQLite
          meta.json         ← last indexed commit, timestamp, stats
        wt-{branch-name}/
          index.db
          meta.json
```

### project-id

프로젝트 경로의 해시. 동일 경로면 동일 ID.

### registry.json

```json
{
  "projects": {
    "proj-a1b2c3": {
      "path": "/Users/hichoi/cdws/reap",
      "name": "reap",
      "registeredAt": "2026-03-29T...",
      "lastIndexedAt": "2026-03-29T..."
    }
  }
}
```

### SQLite 스키마

```sql
nodes       (id, type, name, file, line, metadata)
edges       (source_id, target_id, type, metadata)
communities (id, label, cohesion, node_ids)
processes   (id, label, entry_point, node_ids)
files       (path, mtime, last_commit, language)
```

### Worktree 관리

1. **감지**: `reap` CLI가 `git rev-parse --git-common-dir`로 worktree 여부 판별
2. **Fork**: 해당 worktree에 대한 인덱스가 없으면 main의 `index.db`를 복사
3. **갱신**: 이후 해당 worktree에서의 변경은 fork된 인덱스에 증분 반영
4. **정리**: worktree 삭제 시 (또는 daemon이 존재하지 않는 worktree 경로를 감지하면) 해당 인덱스 삭제

## HTTP API

Base: `http://localhost:17224`

### 관리 API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | daemon 상태, uptime, idle 시간 |
| GET | `/projects` | 등록된 프로젝트 목록 |
| POST | `/projects/register` | 프로젝트 등록 (`reap init` 시 호출) |
| DELETE | `/projects/:id` | 프로젝트 등록 해제 + 인덱스 삭제 |
| POST | `/projects/:id/index` | 인덱싱 트리거 (full 또는 incremental) |
| GET | `/projects/:id/status` | 인덱스 상태 |

### 조회 API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/projects/:id/symbols?q=&type=` | 심볼 검색 |
| GET | `/projects/:id/symbols/:symbolId` | 심볼 상세 |
| GET | `/projects/:id/symbols/:symbolId/callers` | caller 목록 |
| GET | `/projects/:id/symbols/:symbolId/callees` | callee 목록 |
| GET | `/projects/:id/files/:path/symbols` | 파일의 심볼 목록 |
| GET | `/projects/:id/files/:path/dependencies` | 파일 의존성 |
| GET | `/projects/:id/impact?files=a,b,c` | 변경 영향 범위 (blast radius) |
| GET | `/projects/:id/communities` | 커뮤니티 목록 |
| GET | `/projects/:id/communities/:id` | 커뮤니티 상세 |
| GET | `/projects/:id/processes` | 실행 플로우 목록 |
| GET | `/projects/:id/processes/:id` | 실행 플로우 상세 |

### Worktree 쿼리

모든 조회 API에 `?worktree={branch-name}` 쿼리 파라미터 지원. 생략 시 main 인덱스 사용.

### 공통 사항

- 요청/응답 JSON
- daemon이 꺼져있을 때 CLI가 호출하면 자동 spawn 후 재시도
- 인덱싱 중 조회 요청은 기존 인메모리 그래프에서 응답 (stale but available)

## CLI 통합

### 새로운 명령

```
reap daemon status     ← daemon 상태 확인
reap daemon stop       ← daemon 수동 종료
reap daemon index      ← 현재 프로젝트 즉시 인덱싱 트리거
reap daemon query <q>  ← 심볼 조회 (디버깅/확인용)
```

### Lifecycle 연동

- `reap init` → `POST /projects/register` + 최초 인덱싱 트리거
- `reap destroy` → `DELETE /projects/:id`
- generation 완료 (completion stage) → `POST /projects/:id/index`
- generation 시작 (learning stage) → 변경 감지 후 필요 시 `POST /projects/:id/index`

## 프로젝트 구조

```
/                            ← REAP 루트
├── src/                     ← 기존 REAP CLI
│   └── cli/commands/
│       └── daemon/          ← daemon HTTP 클라이언트 (spawn + API 호출)
├── daemon/                  ← 별도 앱 (@c-d-cc/reap-daemon)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts         ← 엔트리포인트 (HTTP 서버 시작)
│       ├── indexer/         ← Tree-sitter 파싱, 그래프 구축
│       ├── graph/           ← 인메모리 그래프, 쿼리 엔진
│       ├── storage/         ← SQLite 영속화
│       └── api/             ← HTTP 라우트 핸들러
├── docs/                    ← 문서 앱 (기존)
```

## 의존성

### daemon (`@c-d-cc/reap-daemon`)

| 패키지 | 용도 |
|--------|------|
| `web-tree-sitter` | AST 파싱 (WASM, 네이티브 빌드 불필요) |
| `tree-sitter-{lang}.wasm` | 언어별 파서 바이너리 |
| `better-sqlite3` | SQLite 영속화 (네이티브 모듈) |

### REAP core (`@c-d-cc/reap`)

기존 `yaml` + 신규 `@c-d-cc/reap-daemon` (dependencies)

## 향후 확장

- **MCP Server**: HTTP API 위에 thin MCP wrapper 추가 → Claude Code/Cursor 등에서 직접 질의
- **시맨틱 검색**: 임베딩 기반 벡터 검색 추가 (QMD 방식)
- **Web UI**: daemon HTTP API를 활용한 코드 그래프 시각화

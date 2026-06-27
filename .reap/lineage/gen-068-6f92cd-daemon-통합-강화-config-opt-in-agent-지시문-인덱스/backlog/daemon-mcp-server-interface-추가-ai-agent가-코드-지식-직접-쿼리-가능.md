---
type: task
status: consumed
priority: medium
createdAt: 2026-06-27T02:02:35.557Z
consumedBy: gen-068-6f92cd
consumedAt: 2026-06-27T02:26:12.100Z
---

# daemon 통합 강화 — agent 지시문 + 인덱스 갱신 + 생명주기 + config opt-in + MCP interface

## 배경

REAP daemon(localhost:17224)은 tree-sitter 파싱 + 심볼 그래프 + SQLite + blast radius 분석을 갖춘 로컬 코드 지식 엔진이다. 인프라는 완성됐지만 다음 네 가지가 빠져 있어 실제 agent 워크플로우에서 활용되지 못한다:

1. **agent 지시문 부재** — reap-evolve / reap-evaluate / reap-guide 어디에도 daemon 활용법이 없다. daemon이 떠 있어도 agent가 존재를 모른다.
2. **인덱스 갱신 시점 불명확** — 언제 갱신할지 정책이 없어 stale index로 잘못된 분석을 할 수 있다.
3. **생명주기 관리 부재** — 언제 daemon을 시작/종료할지, 오래된 daemon이 남아있으면 어떻게 처리할지 정책이 없다.
4. **사용자 opt-in 없음** — daemon은 항상 켜져있거나 없거나 둘 중 하나. 사용자가 config로 제어할 수 없다.
5. (추가) **MCP delivery layer 없음** — HTTP API는 agent가 자동 발견할 수 없다.

## 목표

사용자가 `daemon: true` 한 줄로 daemon을 활성화하면, agent가 lifecycle 전반에서 코드 지식 쿼리를 자연스럽게 활용하는 통합 경험을 만든다.

---

## 항목 1 — Agent 지시문 및 가이드 추가

### 추가 위치

- `src/templates/reap-guide.md` + `.reap/reap-guide.md` (dog-fooding 동기화)
- `src/templates/agents/reap-evolve.md`
- `src/templates/agents/reap-evaluate.md`

### reap-guide.md에 추가할 내용

"Code Intelligence (Daemon)" 섹션 신설:

- daemon이 무엇인지 (로컬 코드 지식 엔진, localhost:17224)
- `config.yml: daemon: true` 시 활성화됨을 명시
- 프로젝트 ID 확인 방법: `curl -s localhost:17224/projects | jq '.data[] | select(.path=="<cwd>")'`
- 주요 쿼리 예시 (project_id 변수 사용):
  ```
  # 심볼 검색
  GET /projects/{id}/symbols?q=functionName

  # caller 목록
  GET /projects/{id}/symbols/{symbolId}/callers

  # 파일 변경 영향 범위
  GET /projects/{id}/impact?file=src/core/lifecycle.ts
  ```

### reap-evolve.md에 추가할 내용

lifecycle 단계별 활용 지침:
- **Learning 단계**: 심볼 검색으로 기존 구현 위치 빠르게 파악 (`/symbols?q=`)
- **Implementation 단계**: callers/callees로 변경 영향 범위 사전 파악 (`/symbols/{id}/callers`)
- **Validation 단계**: impact 분석으로 변경된 파일의 blast radius 확인 (`/impact?file=`)

활성화 여부 확인 방법: `curl -sf localhost:17224/health` → 실패하면 daemon 비활성 상태, 조용히 skip.

### reap-evaluate.md에 추가할 내용

독립 검증 시 impact 분석 활용:
- 구현된 변경 파일 목록에 대해 `/impact` 쿼리 → 예상치 못한 blast radius 경고
- community 분석으로 변경이 특정 클러스터에만 집중됐는지 확인

---

## 항목 2 — 인덱스 갱신 시점 정책

### 원칙

daemon 인덱싱 갱신은 REAP의 내장 기능이므로 **CLI 코드 안에 직접** 포함되어야 한다. hook은 사용자 확장 포인트이며 REAP 자신의 핵심 동작을 hook으로 구현하면 사용자가 hook을 삭제/수정할 때 기능이 깨진다.

### 현재 상태

`lifecycle.ts`의 `triggerIndexing()`이 존재하지만 언제 호출하는지 명시적 정책이 없다.

### 제안 정책

| 시점 | 갱신 여부 | 이유 |
|------|----------|------|
| generation 시작 (learning work phase 진입) | **갱신** | 최신 코드 기반으로 탐구 시작 |
| implementation complete phase | **갱신** | 코드 변경 후 index를 최신화 |
| validation 진입 전 | 갱신 필요 없음 | implementation 완료 시 이미 갱신됨 |
| completion commit phase 완료 후 | **갱신** | git commit 후 최종 sync |
| 그 외 중간 단계 | skip | 불필요한 I/O 최소화 |

### 인덱스 최신성 확인 (staleness check)

**현재 갭**: daemon SQLite `meta` 테이블에는 파일 단위 `lastCommit`이 있고 incremental indexing에 사용되지만, `/projects/:id/status` API가 인덱싱된 commit hash를 외부에 노출하지 않는다. agent가 "지금 인덱스가 현재 HEAD 기준인가?"를 확인할 방법이 없다.

**추가 사항**:
- `daemon/src/types.ts` `ProjectEntry` — `lastIndexedCommit?: string` 필드 추가
- `daemon/src/registry.ts` `updateLastIndexed()` — commit hash도 함께 저장
- `daemon/src/indexer/pipeline.ts` — full/incremental 완료 시 `registry.updateLastIndexed(id, headCommit)` 호출
- `/projects/:id/status` 응답에 `lastIndexedCommit` 포함

**agent staleness check 흐름**:
```
HEAD=$(git rev-parse HEAD)
STATUS=$(curl -s localhost:17224/projects/{id}/status)
if [ "$(echo $STATUS | jq -r .data.lastIndexedCommit)" != "$HEAD" ]; then
  # index stale — 갱신 요청 또는 결과 신뢰도 낮음으로 표기
fi
```

이 check를 `triggerIndexing()` 내부에 built-in하여, 이미 최신인 경우 불필요한 재인덱싱을 skip할 수도 있다 (idempotent indexing).

### 구현 위치 (CLI 코드 직접)

- `src/cli/commands/run/learning.ts` — work phase 진입 시 `ensureRegistered()` + staleness check + 필요 시 `triggerIndexing()` 호출
- `src/cli/commands/run/implementation.ts` — complete phase에서 stage 전환 직전 `triggerIndexing()` 호출
- `src/cli/commands/run/completion.ts` — commit phase 마지막 git commit 완료 후 `triggerIndexing()` 호출
- 모든 호출부: `config.daemon !== true`이면 즉시 return (no-op), 실패는 silent fail (lifecycle 차단 금지)

---

## 항목 3 — Daemon 생명주기 관리

### 현재 상태

- `daemonRequest()` 호출 시 auto-spawn (3초 대기)
- idle timer 존재 (`daemon/src/process.ts`) — 일정 시간 요청 없으면 자동 종료
- 명시적 종료 명령 없음 (`reap daemon stop`만 있음)

### 추가 필요 사항

**시작**:
- `reap run start` 시 `daemon: true`면 daemon 상태 확인 + 필요 시 자동 기동
- 기동 실패는 silent fail (lifecycle 차단 금지)
- 기동 성공 시 load-context output에 `daemonReady: true` 포함

**종료**:
- `reap run completion --phase commit` 후 daemon을 종료하지 않음 (다른 generation/세션에서 재사용)
- idle timeout (현재 구현) 활용 — 설정 가능한 값 (default: 30분)
- `reap daemon stop` 명시적 종료는 유지

**stale daemon 처리**:
- version mismatch (daemon binary vs REAP CLI 버전 다름) 감지 시 자동 재기동
- PID 파일은 있지만 프로세스가 없으면 PID 파일 정리 후 재기동 (현재 `isDaemonRunning()`에 구현 확인 필요)

---

## 항목 4 — Config opt-in

### config.yml 필드 추가

```yaml
# .reap/config.yml
daemon: true          # daemon 활성화 (default: false)
# daemon: false       # 비활성화 — agent가 daemon 쿼리 시도 안 함
```

### 동작 정책

| `daemon` 값 | 동작 |
|-------------|------|
| `true` | daemon 자동 기동 시도, agent 지시문에 daemon 절 포함, 갱신 hook 활성 |
| `false` 또는 미설정 | daemon 관련 동작 전부 skip, agent 지시문에 daemon 절 없음 |

### 구현 위치

- `src/types/index.ts` — `ReapConfig.daemon?: boolean` 추가
- `src/core/prompt.ts` — `buildBasePrompt()` 에서 `config.daemon === true`면 daemon 활용 절 append
- `src/cli/commands/run/start.ts` — learning work phase 진입 시 daemon check
- `src/cli/commands/load-context.ts` — dynamic context에 `daemonEnabled` / `daemonReady` 노출
- hook conditions — `daemon: true` 체크하는 새 condition script (`daemon-enabled`)

---

## 항목 5 — MCP Server Interface (원래 항목)

기존 HTTP API를 유지하면서 MCP server를 병렬 transport로 추가.

### 노출할 MCP Tools

1. **reap_symbol_search** — 심볼명/패턴으로 정의 위치 검색
2. **reap_callers** — caller 목록
3. **reap_callees** — callee 목록
4. **reap_blast_radius** — 변경 영향 범위 분석
5. **reap_community** — 코드 커뮤니티 탐지
6. **reap_process_trace** — 실행 플로우 추적

### 구현 방향

- `daemon/src/mcp/` 디렉토리 신설
- MCP SDK: `@modelcontextprotocol/sdk` (stdio transport 또는 HTTP/SSE transport)
- 기존 `daemon/src/api/` 핸들러 재사용
- `reap install-skills` / `reap update` 시 Claude Code `.claude/settings.json` mcpServers 자동 등록
- OpenCode `opencode.json` mcp 배열 자동 등록
- `daemon: true`인 경우에만 MCP server 기동

---

## 구현 순서 제안

1. **config opt-in** (`daemon?: boolean`) — 모든 하위 항목의 전제
2. **agent 지시문** (reap-guide + evolve + evaluate 템플릿) — 즉각 agent 행동 변화
3. **인덱스 갱신 hook** (onLifeImplemented + onLifeCompleted)
4. **생명주기 개선** (load-context에 daemonReady, stale 처리)
5. **MCP server** (가장 큰 작업, 독립 sub-generation 가능)

항목 1~4는 한 generation에 묶을 수 있음. 항목 5(MCP)는 daemon package 변경이 크므로 별도 generation 권장.

---

## 참조 파일

- `src/types/index.ts` — ReapConfig 타입
- `src/core/prompt.ts` — buildBasePrompt, buildEvaluatorPrompt
- `src/cli/commands/run/start.ts` — generation 시작 시 daemon check 위치
- `src/cli/commands/daemon/lifecycle.ts` — triggerIndexing, ensureRegistered
- `src/cli/commands/daemon/client.ts` — daemonRequest, ensureDaemon (auto-spawn)
- `src/cli/commands/load-context.ts` — dynamic context 출력
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` — agent 가이드 (동기화 필수)
- `src/templates/agents/reap-evolve.md` — evolve agent 템플릿
- `src/templates/agents/reap-evaluate.md` — evaluate agent 템플릿
- `daemon/src/server.ts` — daemon HTTP server
- `daemon/src/api/` — 기존 HTTP 핸들러
- `daemon/src/process.ts` — PID, idle timer
- `daemon/src/types.ts` — ProjectEntry (lastIndexedCommit 추가 위치)
- `daemon/src/registry.ts` — updateLastIndexed (commit hash 저장 위치)
- `daemon/src/indexer/pipeline.ts` — full/incremental 완료 시 registry 갱신 위치
- `daemon/src/api/projects.ts` — status handler (lastIndexedCommit 노출 위치)

## 완료 기준

- `config.yml: daemon: true` 설정 후 `reap run start` 시 daemon 자동 기동
- reap-evolve agent가 learning 단계에서 daemon 쿼리를 시도하고 결과를 활용
- implementation 완료 시 index 자동 갱신 (hook으로 검증)
- `daemon: false` 시 daemon 관련 동작 전부 skip, 회귀 없음
- (MCP 포함 시) Claude Code MCP tool 목록에 reap_* 표시

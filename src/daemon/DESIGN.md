# Daemon 기반 Lifecycle Orchestration — 설계 문서

> Generation: gen-105-7c34e7
> 날짜: 2026-03-21

## 1. 현재 오케스트레이션 패턴 분석

### 1.1 현재 아키텍처

REAP의 lifecycle 오케스트레이션은 두 가지 모드로 동작한다:

#### Manual Mode
```
AI 에이전트 (Claude Code / OpenCode)
  ↓ /reap.start
  → reap run start (프로세스 시작 → JSON 출력 → 종료)
  ↓ /reap.objective
  → reap run objective (프로세스 시작 → JSON 출력 → 종료)
  ↓ /reap.next
  → reap run next (프로세스 시작 → stage 전환 → 종료)
  ↓ /reap.planning
  → reap run planning (프로세스 시작 → JSON 출력 → 종료)
  ↓ ... (반복)
  ↓ /reap.completion
  → reap run completion (아카이브 → 종료)
```

각 `reap run <cmd>`는 **독립적인 프로세스**로 실행되며, 상태는 `current.yml`에 직렬화된다.
AI가 올바른 순서로 커맨드를 호출하는 것에 전적으로 의존한다.

#### AutoSubagent Mode (evolve)
```
Parent Agent
  ↓ reap run evolve
  → subagentPrompt 생성 → JSON 출력
  ↓ Agent tool로 subagent 위임
  → Subagent가 Manual Mode와 동일한 loop 실행
```

### 1.2 Failure Modes

| 실패 유형 | 원인 | 빈도 | 영향 |
|-----------|------|------|------|
| Stage 건너뛰기 | AI가 `/reap.next`를 빠뜨림 | 중간 | artifact 누락, lifecycle 불일치 |
| 순서 위반 | planning 전에 implementation 진입 | 낮음 | gate에서 잡히지만 시간 낭비 |
| Loop 이탈 | AI가 completion 전에 멈춤 | 높음 | 미완성 generation 잔류 |
| Hook 누락 | stage command 없이 next만 호출 | 중간 | hook 미실행, 품질 저하 |

### 1.3 Phase 기반 재진입 패턴이 생긴 이유

Node.js CLI 프로세스는 **실행 → 출력 → 종료**의 단방향 패턴이다.
- AI 에이전트에게 질문하고 응답을 받는 **양방향 통신이 불가**
- 따라서 각 커맨드가 JSON으로 "다음에 뭘 해야 하는지"를 출력하고 종료
- AI가 출력을 파싱하여 다음 커맨드를 호출하는 **재진입(re-entry)** 패턴으로 우회

이 패턴은 동작하지만, **오케스트레이션 제어권이 AI에게 있다**는 근본적 문제를 가진다.

## 2. 통신 방식 비교 분석

### 2.1 Subprocess stdin/stdout Pipe

```
Daemon (parent process)
  ├── spawn("claude", ["--print", prompt])
  │     ↓ stdout pipe
  │     AI 응답 수신
  └── stage 전환
```

**장점:**
- 가장 자연스러운 parent-child 관계
- 추가 인프라 불필요

**단점:**
- Claude Code `--print` 모드는 non-interactive (stdin 입력 불가)
- OpenCode의 subprocess 지원도 유사한 제약
- AI 에이전트가 **daemon의 자식 프로세스**가 되어야 함 — 현재 반대 구조
- 에이전트 세션 내에서 reap이 호출되는 구조에서는 비현실적

**결론:** 현재 구조에서는 **부적합**. 에이전트가 reap을 호출하는 관계를 역전시켜야 하므로.

### 2.2 Unix Domain Socket (UDS)

```
Daemon (UDS Server)
  ├── listen("/tmp/reap-gen-105.sock")
  │     ↑↓ bidirectional
  ├── Client 1 (AI Agent) ←→ prompt/response
  ├── Client 2 (다른 subagent) ←→ prompt/response
  └── stage 전환은 daemon이 제어
```

**장점:**
- 진정한 양방향 통신
- Multi-client 자연스럽게 지원 (multi-subagent)
- 프로세스 독립성 — daemon과 client가 별도 프로세스
- Node.js `net.Server` / `net.Socket`으로 구현 간단

**단점:**
- Windows 지원 시 Named Pipe로 대체 필요 (Node.js가 투명하게 처리)
- 소켓 파일 정리 필요 (daemon 비정상 종료 시)

**결론:** **1차 후보**. 요구사항에 가장 잘 부합.

### 2.3 Named Pipe (FIFO)

```
Daemon
  ├── read from /tmp/reap-gen-105-in.fifo
  ├── write to /tmp/reap-gen-105-out.fifo
  └── 단방향 × 2 = 양방향
```

**장점:**
- OS 레벨 지원, 별도 라이브러리 불필요
- 파일 시스템에서 직접 디버깅 가능

**단점:**
- 진정한 양방향이 아님 (2개 FIFO 필요)
- multi-client 불가 (1:1 통신)
- macOS/Linux만 지원

**결론:** UDS보다 제약이 많아 **비추천**.

### 2.4 Temp File Polling

```
Daemon
  ├── write prompt → /tmp/reap-gen-105/prompt.json
  ├── poll /tmp/reap-gen-105/response.json (100ms 간격)
  ├── response 수신 → stage 전환
  └── 반복
```

**장점:**
- 가장 단순한 구현
- 디버깅 매우 용이 (파일 직접 확인)
- 플랫폼 제약 없음
- AI 에이전트 측 구현도 단순 (파일 읽기/쓰기)

**단점:**
- 폴링 오버헤드 (CPU, I/O)
- 지연 (폴링 간격만큼)
- 파일 정리 필요
- 경합 조건 (동시 읽기/쓰기)

**결론:** **폴백 옵션**. UDS가 안 되는 환경에서 사용.

### 2.5 최종 결정

| 기준 | stdin pipe | UDS | Named Pipe | File Polling |
|------|-----------|-----|-----------|-------------|
| 양방향 통신 | X | O | △ | △ |
| Multi-client | X | O | X | △ |
| 구현 복잡도 | 낮음 | 중간 | 중간 | 낮음 |
| 플랫폼 호환성 | O | O (Node.js 처리) | X (POSIX only) | O |
| 디버깅 용이성 | △ | △ | O | O |
| 현재 구조 호환 | X | O | △ | O |

**선택: Unix Domain Socket (UDS)** — 양방향 + multi-client + 프로세스 독립성

## 3. Daemon 아키텍처 설계

### 3.1 전체 구조

```
┌─────────────────────────────────────┐
│           Daemon Process            │
│                                     │
│  ┌──────────┐  ┌─────────────────┐  │
│  │ UDS      │  │ Lifecycle       │  │
│  │ Server   │←→│ Controller      │  │
│  └────┬─────┘  └──────┬──────────┘  │
│       │               │             │
│       │        ┌──────┴──────────┐  │
│       │        │ GenerationMgr   │  │
│       │        │ (current.yml)   │  │
│       │        └─────────────────┘  │
└───────┼─────────────────────────────┘
        │ UDS
   ┌────┴─────┐
   │ Client   │  (AI Agent: slash command가 client로 동작)
   │ /reap.*  │
   └──────────┘
```

### 3.2 Daemon 생명주기

```
reap run start
  → GenerationManager.create()
  → daemon spawn (detached, stdio: ignore)
  → PID 파일 기록: .reap/life/daemon.pid
  → 소켓 파일 생성: .reap/life/daemon.sock

daemon loop:
  1. current.yml에서 현재 stage 확인
  2. stage에 해당하는 prompt 구성
  3. 클라이언트 연결 대기 (UDS accept)
  4. 클라이언트에게 prompt 전송
  5. 클라이언트 응답 수신 (artifact 작성 완료 등)
  6. hook 실행
  7. stage 전환 (GenerationManager.advance())
  8. completion이면 → archive → daemon exit
  9. 아니면 → 2로 복귀

daemon 비정상 종료:
  → current.yml은 마지막 stage를 기록하고 있음
  → `reap daemon resume` 또는 자동 재시작으로 해당 stage에서 재개
```

### 3.3 통신 프로토콜

JSON-line 기반 프로토콜 (각 메시지는 `\n`으로 구분):

```typescript
// Daemon → Client 메시지
interface DaemonMessage {
  type: "stage-prompt" | "hook-result" | "stage-advanced" | "completed" | "error";
  stage?: LifeCycleStage;
  prompt?: string;
  context?: Record<string, unknown>;
}

// Client → Daemon 메시지
interface ClientMessage {
  type: "stage-done" | "artifact-written" | "request-back" | "heartbeat";
  stage?: LifeCycleStage;
  data?: Record<string, unknown>;
}
```

### 3.4 Multi-Subagent 모델

```
Daemon (UDS Server, 1 per generation)
  ├── Client A (Main Agent) — objective, planning, completion
  ├── Client B (Coding Agent) — implementation
  └── Client C (Review Agent) — validation

각 클라이언트는:
1. 소켓 연결
2. daemon에게 자신의 역할/capability 등록
3. daemon이 현재 stage에 맞는 클라이언트에게 prompt 배분
4. 클라이언트가 작업 완료 보고
5. daemon이 stage 전환 결정
```

### 3.5 장애 복구

| 시나리오 | 복구 방법 |
|---------|----------|
| Daemon 크래시 | PID 파일의 프로세스 존재 확인, 없으면 resume |
| Client 연결 끊김 | Daemon이 재연결 대기 (timeout 후 stage 유지) |
| 소켓 파일 잔류 | 시작 시 stale 소켓 정리 (connect 시도 → 실패 → unlink) |
| current.yml 손상 | 복구 불가 — 수동 개입 필요 (기존과 동일) |

### 3.6 기존 패턴과의 호환성

**점진적 마이그레이션 전략:**
1. Phase 1 (현재): daemon 없이 기존 phase 기반 패턴 유지
2. Phase 2: daemon 모드를 `reap.config.yml`의 `orchestration: daemon` 옵션으로 활성화
3. Phase 3: daemon 모드가 기본값, phase 기반은 fallback

기존 `reap run <cmd>` 커맨드는 그대로 유지.
daemon 모드에서는 slash command가 daemon client로 동작하는 래퍼 역할.

## 4. PoC 범위

이번 generation에서 구현하는 PoC:
- `src/daemon/protocol.ts` — 메시지 타입 정의
- `src/daemon/server.ts` — UDS 서버 (daemon core)
- `src/daemon/client.ts` — UDS 클라이언트
- `src/daemon/pid.ts` — PID 파일 관리

PoC에서 **하지 않는 것:**
- 기존 evolve/slash command와의 통합
- Multi-subagent 역할 분배
- 프로덕션 레벨 에러 핸들링
- Windows 지원

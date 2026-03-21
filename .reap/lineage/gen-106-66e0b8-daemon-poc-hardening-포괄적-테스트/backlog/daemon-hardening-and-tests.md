---
type: task
status: consumed
consumedBy: gen-106-66e0b8
---

# Daemon PoC Hardening + 포괄적 테스트

## 현상
- gen-105에서 daemon PoC 구현 완료 (protocol, pid, server, client)
- 테스트 0개. 검증 없이 코드만 존재
- orphan daemon 문제 — generation 종료/abort/비정상 종료 시 daemon이 살아남음

## 1. Daemon 코드 수정 (테스트 전 선행)

### 1-1. Graceful Shutdown
- `onCompleted`에서 `this.stop()` 자동 호출
- `SIGTERM`/`SIGINT` 핸들러 등록 → graceful shutdown
- `stop()` 시 소켓/PID 파일 확실히 정리

### 1-2. Orphan 방지 — Parent PID 모니터링 (LSP 패턴)
- **핵심**: daemon 시작 시 부모 프로세스(CLI/AI agent) PID를 기록
- `setInterval`로 부모 PID 생존을 주기적 확인 (5초 간격, `process.kill(parentPid, 0)`)
- 부모가 죽으면 grace period 후 자체 종료 (`stop()`)
- 이것만으로 Ctrl+C, crash, 세션 종료, abort 등 대부분의 orphan 시나리오 커버
- 참고: VS Code LSP의 `InitializeParams.processId` 패턴
- 보조: `reap run start` 시 stale daemon 감지 (UDS connect probe) → 정리 후 재시작

### 1-3. 타임아웃/방어
- 클라이언트 heartbeat 타임아웃 — 일정 시간 응답 없으면 연결 해제
- 서버 idle 타임아웃 — 클라이언트 0개 상태 지속 시 자동 종료 (configurable)

### 1-4. Liveness 확인 개선
- `isDaemonRunning()`을 PID 체크 → UDS connect probe로 변경
- 소켓 연결 가능 = alive, ECONNREFUSED/ENOENT = dead
- PID file은 보조 수단으로 유지 (flock은 향후 고려)

## 2. Unit Tests

### protocol.test.ts
- `encodeMessage`: 각 메시지 타입별 JSON-line 직렬화
- `MessageParser.feed`: 단일 메시지, 다중 메시지, 분할된 청크(partial JSON), 빈 입력, 잘못된 JSON, 연속 개행

### pid.test.ts
- PID 파일 생성/읽기/삭제
- stale PID 감지 (존재하지 않는 프로세스 ID)
- stale 소켓 파일 정리
- `isDaemonRunning`: 실행 중 / 미실행 / stale 각 상태
- race condition — 동시 PID 파일 쓰기

## 3. Integration Tests (Server ↔ Client)

### server-client.test.ts
- 서버 시작 → 소켓/PID 파일 생성 확인
- 클라이언트 연결 → stage-prompt 수신
- stage-done 전송 → stage 전환 확인 (objective → planning → ... → completion)
- 다중 클라이언트 동시 연결 → broadcast 수신 확인
- request-back → 회귀 확인
- heartbeat 응답 확인
- 미지원 메시지 → error 응답
- 서버 stop → 클라이언트 disconnect 확인
- 이미 실행 중인 daemon에 start 시도 → 에러

### shutdown.test.ts
- completion 시 자동 stop → 소켓/PID 정리
- SIGTERM → graceful shutdown
- 클라이언트 연결 중 서버 stop → 클라이언트 disconnect 이벤트
- idle 타임아웃 → 자동 종료
- **parent PID 사망 → daemon 자체 종료** (mock으로 kill(pid,0) 실패 시뮬레이션)

## 4. E2E Tests

### daemon-lifecycle-e2e.test.ts
- sandbox에서 .reap 프로젝트 셋업
- DaemonServer 시작 → DaemonClient 연결
- 전체 stage 순회 (objective → completion) → daemon 자동 종료
- daemon 강제 kill → 재시작 → current.yml에서 resume
- stale daemon 감지 → 정리 → 새 daemon 시작
- multi-client: 2개 클라이언트 연결 → 한쪽에서 stage-done → 양쪽 모두 stage-advanced 수신

## 관련 코드
- `src/daemon/protocol.ts`
- `src/daemon/pid.ts`
- `src/daemon/server.ts`
- `src/daemon/client.ts`
- `src/daemon/index.ts`

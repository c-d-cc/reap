# Planning

## Summary
Daemon PoC 코드를 경화하고 포괄적인 테스트 스위트를 작성한다.
Part 1에서 서버 코드를 수정하고, Part 2에서 테스트를 작성/확장한다.

## Technical Context
- **Tech Stack**: TypeScript, Node.js net module (UDS), Bun test runner
- **Constraints**: 기존 API 호환 유지, 테스트 격리 (temp dir + unique socket)

## Tasks

### Part 1: 코드 경화

#### Task 1-1: DaemonServer graceful shutdown
- `onCompleted` 콜백 실행 후 자동 `this.stop()` 호출
- `start()` 시 SIGTERM/SIGINT 핸들러 등록 → `stop()` 호출
- `stop()` 시 signal 핸들러 해제
- 파일: `src/daemon/server.ts`

#### Task 1-2: Parent PID 모니터링
- `DaemonServerOptions`에 `parentPid?: number` 필드 추가
- `start()`에서 parentPid가 설정된 경우 5초 간격 `setInterval` 등록
- `process.kill(parentPid, 0)` 실패 시 `stop()` 호출
- `stop()`에서 interval 해제
- 파일: `src/daemon/server.ts`

#### Task 1-3: Idle timeout
- `DaemonServerOptions`에 `idleTimeoutMs?: number` 필드 추가
- 클라이언트 수가 0이 된 시점에 타이머 시작
- 새 클라이언트 연결 시 타이머 취소
- 타이머 만료 시 `stop()` 호출
- 파일: `src/daemon/server.ts`

#### Task 1-4: isDaemonRunning UDS connect probe
- `isDaemonRunning()`을 소켓 connect 시도 방식으로 변경
- 소켓 연결 성공 = alive (즉시 disconnect), ECONNREFUSED/ENOENT = dead
- PID 파일은 보조 수단으로 유지
- 파일: `src/daemon/pid.ts`

### Part 2: 테스트

#### Task 2-1: protocol.test.ts 확장
- 기존 테스트 확인 및 누락 케이스 추가
- 파일: `tests/daemon/protocol.test.ts`

#### Task 2-2: pid.test.ts 확장
- UDS connect probe 기반 isDaemonRunning 테스트 추가
- 파일: `tests/daemon/pid.test.ts`

#### Task 2-3: server-client.test.ts 확장
- 기존 server.test.ts → server-client.test.ts 리네임 (integration 성격)
- graceful shutdown, parent PID, idle timeout 관련 테스트 추가
- 파일: `tests/daemon/server-client.test.ts`

#### Task 2-4: shutdown.test.ts 신규 작성
- completion 시 자동 stop
- SIGTERM graceful shutdown
- idle timeout 자동 종료
- parent PID 사망 시 daemon 자동 종료 (mock)
- 파일: `tests/daemon/shutdown.test.ts`

#### Task 2-5: daemon-lifecycle-e2e.test.ts 신규 작성
- 전체 stage 순회 (objective → completion) → daemon 자동 종료
- stale daemon 감지/정리
- multi-client broadcast 확인
- 파일: `tests/daemon/daemon-lifecycle-e2e.test.ts`

## Dependencies
- Task 1-1 ~ 1-4는 서로 독립적 (병렬 가능)
- Task 2-1, 2-2는 독립적
- Task 2-3, 2-4, 2-5는 Part 1 완료 후 진행

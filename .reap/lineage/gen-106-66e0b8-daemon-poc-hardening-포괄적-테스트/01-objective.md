# Objective

## Goal
Daemon PoC 코드를 프로덕션 수준으로 경화(hardening)하고 포괄적인 테스트 스위트를 작성한다.

## Completion Criteria
1. Graceful shutdown: onCompleted 시 auto stop, SIGTERM/SIGINT 핸들러
2. Parent PID 모니터링: 부모 프로세스 사망 시 daemon 자동 종료
3. Idle timeout: 클라이언트 0개 상태 지속 시 자동 종료
4. Liveness 개선: isDaemonRunning()을 UDS connect probe로 변경
5. Unit tests: protocol.test.ts, pid.test.ts (기존 확장)
6. Integration tests: server-client.test.ts (기존 확장), shutdown.test.ts (신규)
7. E2E tests: daemon-lifecycle-e2e.test.ts (신규)
8. 모든 테스트 pass, TypeScript 컴파일 에러 없음

## Requirements

### Functional Requirements
- onCompleted 콜백에서 this.stop() 자동 호출
- SIGTERM/SIGINT 시그널 수신 시 graceful shutdown 수행
- daemon 시작 시 부모 PID 기록, 5초 간격으로 부모 생존 확인
- 부모 PID 사망 시 자체 종료
- idle timeout 설정 가능 (기본값 configurable)
- isDaemonRunning()을 소켓 connect probe 방식으로 변경
- 기존 PID 기반 확인은 보조 수단으로 유지

### Non-Functional Requirements
- 기존 테스트와의 호환성 유지
- 테스트 간 격리 (temp directory, unique socket paths)
- afterEach/afterAll에서 리소스 확실히 정리
- 비동기 테스트 적절한 timeout 설정

## Design

### Approaches Considered

| Aspect | Approach A: 서버 내부 통합 | Approach B: 별도 모니터 프로세스 |
|--------|-----------|-----------|
| Summary | DaemonServer 클래스 내부에 shutdown/monitoring 로직 추가 | 별도 watchdog 프로세스가 daemon을 감시 |
| Pros | 단순, 추가 프로세스 불필요, 테스트 용이 | 관심사 분리, daemon 코드 변경 최소 |
| Cons | 서버 클래스 비대화 | 복잡성 증가, 추가 IPC 필요 |
| Recommendation | 선택 | - |

### Selected Design
DaemonServer 클래스 내부에 graceful shutdown, parent PID 모니터링, idle timeout 로직을 통합한다.
- `DaemonServerOptions`에 `parentPid`, `idleTimeoutMs` 필드 추가
- `start()`에서 SIGTERM/SIGINT 핸들러 및 parent PID 모니터 setInterval 등록
- `onCompleted` 콜백 실행 후 자동 stop()
- `isDaemonRunning()`을 UDS connect probe로 변경 (pid.ts)

### Design Approval History
- 2026-03-21: 설계 확정 — Approach A (서버 내부 통합) 선택

## Scope
- **Related Genome Areas**: daemon 모듈 (src/daemon/*)
- **Expected Change Scope**: server.ts, pid.ts 수정 + tests/daemon/ 테스트 추가/확장
- **Exclusions**: 기존 CLI 커맨드 통합, Windows 지원, multi-subagent 역할 분배

## Genome Reference
gen-105에서 구현된 daemon PoC (protocol.ts, pid.ts, server.ts, client.ts)

## Backlog (Genome Modifications Discovered)
None

## Background
gen-105에서 daemon PoC를 구현했으나 테스트가 없고, orphan daemon 문제가 있다.
LSP의 processId 패턴을 참고하여 parent PID 모니터링으로 orphan 방지.

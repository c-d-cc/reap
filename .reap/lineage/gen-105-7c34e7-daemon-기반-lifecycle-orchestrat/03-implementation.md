# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T1 | 현재 오케스트레이션 패턴 분석 문서 (`src/daemon/DESIGN.md`) | O |
| T2 | 통신 방식 비교 분석 (stdin, UDS, Named Pipe, File Polling) | O |
| T3 | Daemon 아키텍처 설계 (생명주기, 프로토콜, multi-subagent, 장애복구) | O |
| T4 | PoC 구현 — `src/daemon/protocol.ts` (메시지 직렬화/역직렬화) | O |
| T4 | PoC 구현 — `src/daemon/pid.ts` (PID 파일 관리) | O |
| T4 | PoC 구현 — `src/daemon/server.ts` (UDS 서버) | O |
| T4 | PoC 구현 — `src/daemon/client.ts` (UDS 클라이언트) | O |
| T4 | PoC 구현 — `src/daemon/index.ts` (모듈 export) | O |
| T5 | 타입 체크 (`bunx tsc --noEmit`) 통과 | O |
| T5 | 빌드 검증 (`bun run build`) 성공 | O |
| T5 | 기존 테스트 통과 (569 pass) | O |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| - | 기존 evolve/slash command와의 통합 | 다음 generation에서 구현 | - |
| - | Multi-subagent 역할 분배 구현 | 설계만 완료, 구현은 다음 generation | - |
| - | 프로덕션 레벨 에러 핸들링 | PoC 범위 초과 | - |
| - | Windows Named Pipe 지원 | PoC는 macOS/Linux만 대상 | - |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| - | - | 이번 generation은 설계+PoC이므로 genome 변경 없음 |

## Implementation Notes

### 설계 문서 주요 결정
1. **통신 방식**: Unix Domain Socket (UDS) 선택 — 양방향, multi-client, 프로세스 독립성
2. **아키텍처**: daemon per generation, 소켓 파일 `.reap/life/daemon.sock`
3. **프로토콜**: JSON-line 기반 (`DaemonMessage` / `ClientMessage`)
4. **장애 복구**: PID 파일 + current.yml 체크포인트 기반 idempotent resume
5. **호환성**: 기존 phase 기반 패턴은 유지, daemon 모드는 config 옵션으로 활성화

### PoC 구현 파일
- `src/daemon/protocol.ts` — 메시지 타입, 인코딩/디코딩, MessageParser
- `src/daemon/pid.ts` — PID 파일 CRUD, stale 정리, daemon 상태 확인
- `src/daemon/server.ts` — DaemonServer 클래스 (UDS 서버, lifecycle 제어)
- `src/daemon/client.ts` — DaemonClient 클래스 (UDS 클라이언트), sendOneShot 편의 함수
- `src/daemon/index.ts` — 공개 API export

### stdin pipe 분석 결과
Claude Code의 `--print` 모드와 OpenCode의 subprocess는 모두 non-interactive.
AI 에이전트가 daemon의 자식 프로세스가 되어야 하는데, 현재 구조는 반대 (에이전트가 reap을 호출).
따라서 stdin pipe 방식은 **부적합**으로 판단.

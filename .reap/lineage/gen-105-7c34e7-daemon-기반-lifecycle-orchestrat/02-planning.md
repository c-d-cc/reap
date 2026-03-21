# Planning

## Summary
Daemon 기반 Lifecycle Orchestration의 설계 및 PoC 구현 계획.
현재 AI 의존적 stage 전환 구조를 분석하고, daemon 프로세스가 lifecycle을 deterministic하게 제어하는 아키텍처를 설계한다.
최소 PoC로 Unix Domain Socket 기반 daemon-client 통신을 검증한다.

## Technical Context
- **Tech Stack**: TypeScript, Node.js >=18, Bun (dev), esbuild 번들
- **Constraints**:
  - Node.js fs/promises만 사용 (Bun API 직접 사용 금지)
  - 외부 서비스 의존 없음 (로컬 파일시스템)
  - Claude Code, OpenCode 등 다양한 에이전트 지원 필요
  - 기존 phase 기반 재진입 패턴과 호환성 유지

## Tasks

### Task 1: 현재 오케스트레이션 패턴 분석 문서 작성
- **산출물**: `src/daemon/DESIGN.md` (설계 문서)
- **내용**:
  - 현재 evolve 패턴의 흐름도 (autoSubagent / manual)
  - AI 의존적 전환의 failure mode 분류
  - phase 기반 재진입 패턴이 생긴 이유 (프로세스 간 양방향 통신 불가)

### Task 2: 통신 방식 비교 분석
- **산출물**: 설계 문서 내 통신 방식 섹션
- **비교 대상**:
  1. **subprocess stdin/stdout pipe**: Claude Code의 `--print` 모드, OpenCode의 subprocess 지원
  2. **Unix Domain Socket (UDS)**: daemon이 소켓 서버로 동작, 클라이언트가 접속
  3. **Named Pipe (FIFO)**: 단방향 or 양방향, OS 레벨 지원
  4. **Temp File Polling**: 파일 기반 메시지 교환, 가장 단순
- **평가 기준**: 양방향성, multi-client, 복잡도, 플랫폼 호환성, 디버깅 용이성

### Task 3: Daemon 아키텍처 설계
- **산출물**: 설계 문서 내 아키텍처 섹션
- **내용**:
  - Daemon 생명주기: start -> lifecycle loop -> exit
  - Stage 전환 제어 흐름
  - AI 에이전트와의 통신 프로토콜
  - Multi-subagent daemon-client 모델
  - 장애 복구: current.yml 기반 idempotent resume
  - PID 파일 관리, 중복 daemon 방지

### Task 4: PoC 구현 — Unix Domain Socket 기반 Daemon
- **산출물**: `src/daemon/` 모듈
- **구현 범위**:
  - `src/daemon/server.ts` — UDS 서버 (daemon)
  - `src/daemon/client.ts` — UDS 클라이언트
  - `src/daemon/protocol.ts` — 메시지 프로토콜 정의
  - `src/daemon/pid.ts` — PID 파일 관리
- **PoC 시나리오**:
  1. daemon 시작 -> UDS 서버 리스닝
  2. 클라이언트 접속 -> stage prompt 전송
  3. 클라이언트 응답 -> daemon이 stage 전환 (next)
  4. completion까지 반복 후 daemon 종료

### Task 5: 검증
- **단위 테스트**: daemon server/client 통신 기본 검증
- **타입 체크**: `bunx tsc --noEmit` 통과
- **빌드 검증**: `bun run build` 성공

## Dependencies
- Task 1 -> Task 3 (분석 결과가 설계에 반영)
- Task 2 -> Task 3 (통신 방식 결정이 아키텍처에 영향)
- Task 3 -> Task 4 (설계가 PoC 구현의 기반)
- Task 4 -> Task 5 (구현 후 검증)

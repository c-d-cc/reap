# Objective

## Goal
Daemon 기반 Lifecycle Orchestration — 현재 AI 의존적인 stage 간 전환을 daemon 프로세스가 제어하는 구조로 전환하기 위한 설계 및 PoC 구현.

## Completion Criteria
1. 현재 오케스트레이션 패턴의 한계 분석 문서 작성
2. Daemon 아키텍처 설계 문서 (통신 프로토콜, lifecycle 제어 흐름, 장애 복구)
3. 통신 방식 비교 분석 (stdin, WebSocket, named pipe, temp file polling)
4. 최소 PoC: daemon 프로세스가 stage 전환을 자동 제어하는 동작 검증
5. Multi-subagent 환경에서의 daemon-client 통신 프로토콜 설계

## Requirements

### Functional Requirements
- daemon은 `reap run start` 시점에 자동 시작
- daemon이 전체 lifecycle stage 전환을 제어 (objective -> planning -> ... -> completion)
- AI 에이전트에게 creative 작업 위임 후 응답 수신하는 양방향 통신
- daemon 죽어도 current.yml 기반 idempotent 재개 가능
- generation당 daemon 1개 — multi-subagent는 클라이언트로 접속

### Non-Functional Requirements
- 기존 phase 기반 재진입 패턴과의 호환성 유지 (점진적 마이그레이션)
- Node.js/Bun 런타임에서 동작
- Claude Code, OpenCode 등 다양한 AI 에이전트 지원

## Design

### Approaches Considered

| Aspect | A: stdin pipe | B: Unix Domain Socket | C: Temp File Polling |
|--------|--------------|----------------------|---------------------|
| Summary | subprocess로 AI 호출, stdin/stdout 파이프 | UDS 서버로 daemon 운영, 클라이언트 접속 | 파일 시스템 기반 메시지 교환 |
| Pros | 단순, 추가 의존성 없음 | 양방향, multi-client 지원 | 가장 단순, 디버깅 용이 |
| Cons | subprocess stdin 지원 불확실 (Claude Code) | 플랫폼 제약 (Windows), 복잡 | 폴링 오버헤드, 지연 |
| Recommendation | 조사 필요 | 1차 후보 | 폴백 옵션 |

### Selected Design
탐색적 generation — 통신 방식 비교 분석 후 Unix Domain Socket 기반 설계를 1차 후보로 검증. PoC 레벨에서 검증 후 최종 결정.

### Design Approval History
- 2026-03-21: 초기 설계 방향 수립 — daemon per generation, UDS 1차 후보

## Scope
- **Related Genome Areas**: orchestration, lifecycle, evolve 패턴
- **Expected Change Scope**: src/core/ 및 src/cli/commands/run/ 하위 — 새로운 daemon 모듈 추가, 기존 evolve 패턴 리팩터링 설계
- **Exclusions**: 프로덕션 레벨 구현 (이번 generation은 설계 + PoC 범위)

## Genome Reference
- `.reap/genome/` — 현재 genome 구조
- `src/cli/commands/run/evolve.ts` — 현재 autoSubagent/manual evolve 패턴
- `src/core/lifecycle.ts` — stage 전환 로직
- `src/core/generation.ts` — GenerationManager

## Backlog (Genome Modifications Discovered)
None

## Background
현재 REAP의 lifecycle 오케스트레이션은 두 가지 모드로 동작:
1. **Manual mode**: AI가 `/reap.next`, `/reap.back` 슬래시 커맨드로 직접 stage 전환
2. **AutoSubagent mode**: evolve 커맨드가 subagent에게 전체 lifecycle을 위임

두 모드 모두 **AI가 올바른 순서로 명령을 호출하는 것에 의존**하는 구조적 한계가 있음.
- AI가 `/reap.next`를 빠뜨리거나 순서를 틀리면 lifecycle이 깨짐
- phase 기반 재진입 패턴은 프로세스 간 양방향 통신이 불가하기 때문에 생긴 우회 구조
- daemon이 lifecycle을 deterministic하게 제어하면 이 문제를 근본적으로 해결 가능

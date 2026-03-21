---
type: task
status: consumed
consumedBy: gen-105-7c34e7
---

# Daemon 기반 Lifecycle Orchestration

## 현상
- 현재 개별 step은 deterministic이지만, step 간 오케스트레이션은 AI에 의존
- AI가 reap run next를 안 부르거나 순서를 틀리면 깨짐
- phase 기반 재진입 패턴은 프로세스 간 양방향 통신 불가 때문

## 기대 동작
- generation 시작 시 daemon이 자동으로 뜸 (evolve 전용이 아님)
- daemon이 전체 lifecycle stage 전환을 제어
- stage command 실행 → AI에게 creative 작업 위임 (stdin/socket) → AI 응답 수신 → next stage 자동 전환
- daemon이 죽어도 current.yml이 checkpoint 역할 → idempotent 재개

## 구조
```
reap run start → daemon 자동 시작
  → current.yml 읽기 → stage: objective
  → objective prompt 출력 → AI 응답 대기
  → AI 응답 수신 → artifact 작성 확인 → hooks → next
  → planning prompt → AI 응답 대기
  → ...
  → completion → auto-archive → daemon exit

  (daemon 죽으면)
  reap run start (또는 resume) → current.yml에서 재개
```

## 설계 결정
- **daemon은 generation당 1개** — multi-subagent는 daemon의 클라이언트로 접속하는 구조
- **nested generation 불가** — genome/environment 불변 원칙, current.yml 단일 상태. 대안: minor fix, backlog, abort 후 별도 generation
- evolve 뿐 아니라 `/reap.start` 시점에서 daemon이 시작되어야 함

## 검토 필요
- Claude Code / OpenCode의 subprocess stdin 지원 여부
- 대안: WebSocket, named pipe, temp file polling
- multi-subagent 환경에서 daemon-client 통신 프로토콜
- 큰 아키텍처 변경이므로 별도 generation에서 깊이 검토

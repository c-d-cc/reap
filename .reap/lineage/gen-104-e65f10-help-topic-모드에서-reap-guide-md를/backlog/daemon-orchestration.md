---
type: task
status: pending
---

# Daemon 기반 Lifecycle Orchestration

## 현상
- 현재 개별 step은 deterministic이지만, step 간 오케스트레이션은 AI에 의존
- AI가 reap run next를 안 부르거나 순서를 틀리면 깨짐
- phase 기반 재진입 패턴은 프로세스 간 양방향 통신 불가 때문

## 기대 동작
- evolve daemon이 전체 lifecycle을 제어
- stage command 실행 → AI에게 creative 작업 위임 (stdin/socket) → AI 응답 수신 → next stage 자동 전환
- daemon이 죽어도 current.yml이 checkpoint 역할 → idempotent 재개

## 구조
```
reap run evolve (daemon mode)
  → current.yml 읽기 → stage: objective
  → objective prompt 출력 → AI 응답 대기
  → AI 응답 수신 → artifact 작성 확인 → hooks → next
  → planning prompt → AI 응답 대기
  → ...
  → completion → auto-archive → exit

  (daemon 죽으면)
  reap run evolve → current.yml에서 재개
```

## 검토 필요
- Claude Code / OpenCode의 subprocess stdin 지원 여부
- 대안: WebSocket, named pipe, temp file polling
- 큰 아키텍처 변경이므로 별도 generation에서 깊이 검토

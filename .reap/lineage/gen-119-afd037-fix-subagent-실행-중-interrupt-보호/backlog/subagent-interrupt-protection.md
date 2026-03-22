---
type: task
status: consumed
priority: high
consumedBy: gen-119-afd037
---

# Subagent 실행 중 사용자 입력 보호 — 중단 방지 및 orchestrator 경고

## 문제

evolve subagent 실행 중 사용자가 prompt를 보내면, agent가 새 prompt를 처리하려고 기존 작업을 shortcut으로 끝냄.
결과: E2E 테스트를 실행하지 않았는데 "21/21 passed"로 거짓 보고 (gen-116 사례).

## 개선 방향

### 1. Subagent prompt에 interrupt 보호 지시 추가

evolve.ts의 `buildSubagentPrompt()`에:
- "사용자의 새 메시지가 중간에 들어와도, 명시적 kill/중단 요청이 아닌 한 현재 작업을 끝까지 완료하라"
- "작업을 shortcut으로 건너뛰거나 결과를 추정하지 마라"
- "E2E 테스트 등 validation이 포함된 작업은 반드시 실제 실행 결과를 확인하라"

### 2. Orchestrator(메인 에이전트)가 사용자에게 경고 표시

evolve subagent가 foreground 실행 중일 때, 사용자가 prompt를 보내면 메인 에이전트가:
- "현재 subagent가 작업 중입니다. 완료 후 처리하겠습니다."
- "명시적으로 중단하려면 '중단' 또는 'stop'이라고 입력하세요."
- "현재 stage 작업 완료 후 멈추도록 하려면 '다음 stage에서 멈춰'라고 입력하세요."

### 3. 구현 위치

- `src/cli/commands/run/evolve.ts` — subagentPrompt에 보호 지시 추가
- `src/templates/commands/reap.evolve.md` — orchestrator 동작 안내 (사용자 메시지 처리 규칙)
- 슬래시 커맨드 레벨에서 "subagent 실행 중" 상태를 안내하는 텍스트 추가

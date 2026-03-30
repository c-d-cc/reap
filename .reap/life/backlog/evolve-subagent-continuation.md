---
type: task
status: pending
priority: high
createdAt: 2026-03-30T05:27:35.010Z
---

# evolve-subagent-continuation

evolve에서 subagent가 유저 확인을 위해 반환된 후, main agent가 직접 작업을 이어가는 대신 SendMessage로 기존 subagent를 재개해야 한다. 현재는 subagent 반환 후 main agent가 lifecycle을 직접 실행하는 동작 오류가 있음.

## Problem

`reap run evolve`가 autoSubagent mode로 `reap-evolve` subagent를 실행하면, subagent가 유저 확인이 필요한 시점(예: planning 완료 후)에 반환될 수 있다. 이때 main agent가 유저 확인 후 나머지 lifecycle을 직접 실행하는 동작 오류 발생.

- subagent가 learning+planning까지 진행 후 반환
- main agent가 유저 "ok" 확인 후 `reap run implementation`을 직접 실행
- 결과: lifecycle 실행 주체가 subagent → main agent로 전환되어 일관성 깨짐
- main agent의 context에는 reap-evolve agent의 role/mindset/behavior rules가 없음

## Solution

evolve skill 또는 main agent의 동작을 수정하여, subagent 반환 후에는 반드시 SendMessage로 기존 subagent를 재개하도록 해야 한다.

선택지:
1. **evolve skill prompt에 명시**: "subagent 반환 후 유저 확인이 끝나면 SendMessage로 기존 agent를 재개하라"
2. **reap-evolve agent 정의에 명시**: agent가 유저 확인 필요 시 반환하는 대신, 유저에게 직접 질문하도록 (AskUserQuestion 사용)
3. **evolve.ts에서 continuation 지시**: evolve output에 subagent ID를 포함하고, 이어서 실행할 때 SendMessage 사용 안내

## Files to Change

- `src/adapters/claude-code/skills/reap.evolve.md` — subagent 반환 후 재개 방법 명시
- `src/cli/commands/run/evolve.ts` — evolve output에 continuation 안내 추가 검토
- `src/templates/agents/reap-evolve.md` — agent 동작 규칙에 유저 interaction 패턴 명시 검토

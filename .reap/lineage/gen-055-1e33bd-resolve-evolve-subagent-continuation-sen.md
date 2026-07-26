---
id: gen-055-1e33bd
type: embryo
goal: "resolve: evolve subagent continuation — SendMessage로 기존 subagent 재개"
parents: ["gen-054-f931e1"]
---
# gen-055-1e33bd
Goal: evolve subagent continuation -- subagent 반환 후 main agent가 lifecycle을 직접 실행하는 동작 오류 수정.

변경 사항:
- `src/cli/commands/run/evolve.ts`: autoSubagent prompt에 "Subagent Continuation Protocol" 추가. main agent가 lifecycle 명령을 직접 실행하지 않고, subagent 반환 시 SendMessage로 재개하도록 명시.
- `src/templates/agents/reap-evolve.md`: "User Interaction Pattern" 섹션 추가. subagent가 유저 확인 필요 시 반환하지 않고 agent 내에서 직접 처리하도록 지침.
- `src/adapters/claude-code/skills/reap.evolve.md`: subagent continuation 안내 추가.

결과: 모든 completion criteria 충족. 332 pass / 4 fail (pre-existing).
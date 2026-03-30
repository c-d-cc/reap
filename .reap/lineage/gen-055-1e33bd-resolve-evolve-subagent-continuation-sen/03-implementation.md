# Implementation Log

## Completed Tasks

### T001: evolve.ts prompt 수정
- `src/cli/commands/run/evolve.ts`: autoSubagent mode의 prompt 문자열을 "Subagent Continuation Protocol" 섹션으로 교체
- 기존 "After the subagent completes, report the result." 한 줄을 상세한 프로토콜로 확장
- 핵심 지시: main agent는 절대 lifecycle 명령을 직접 실행하지 말 것, subagent가 반환되면 SendMessage로 재개

### T002: reap-evolve.md agent template 수정
- `src/templates/agents/reap-evolve.md`: Behavior Rules에 "User Interaction Pattern" 섹션 추가
- 핵심: subagent는 lifecycle의 유일한 실행자, 유저 확인이 필요하면 agent 내에서 직접 처리, 반환 최소화
- Critical Don'ts에 "Do NOT return to the parent agent before generation completion" 추가

### T003: reap.evolve.md skill 수정
- `src/adapters/claude-code/skills/reap.evolve.md`: subagent continuation 안내 추가
- SendMessage로 재개하라는 지시 명시

### T004: 테스트 실행
- Unit tests: 332 pass / 4 fail (pre-existing cleanupLegacyProjectSkills 실패 -- 이번 변경과 무관)
- 빌드 성공 확인

## Architecture Decisions

**2-layer 방어 전략 채택**:
- Layer 1 (예방): reap-evolve agent가 반환하지 않고 유저와 직접 상호작용하도록 지침 추가
- Layer 2 (대응): 그래도 반환되는 경우, evolve.ts prompt와 skill에 SendMessage 재개 절차 명시
- 코드 로직 변경 없이 prompt/지시문 수정만으로 해결. subagent의 행동은 결국 prompt 품질에 의존하므로, 명확하고 중복적인 지시가 최선.

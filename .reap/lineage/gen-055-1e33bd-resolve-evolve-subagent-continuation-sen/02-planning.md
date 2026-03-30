# Planning

## Goal

evolve subagent가 반환된 후 main agent가 lifecycle을 직접 실행하는 동작 오류를 수정. subagent 반환 시 SendMessage로 기존 subagent를 재개하도록 prompt를 명확히 하고, subagent 자체도 가능한 한 반환 없이 유저와 직접 상호작용하도록 안내.

## Completion Criteria

1. evolve.ts의 autoSubagent prompt에 subagent 반환 후 SendMessage 재개 절차가 명시되어 있다
2. reap-evolve.md agent template에 유저 확인이 필요할 때의 행동 지침이 있다 (반환 최소화, 필요 시 반환하더라도 재개 가능하도록)
3. reap.evolve.md skill 파일에 subagent continuation 처리 방법이 안내되어 있다
4. 기존 테스트가 깨지지 않는다

## Approach

**2-layer 방어**:

1. **예방 (reap-evolve agent)**: subagent가 유저 확인이 필요할 때 가능한 반환하지 않고 agent 내에서 처리하도록 지침 추가. 유저에게 직접 질문 허용.

2. **대응 (evolve.ts prompt + skill)**: 그래도 subagent가 반환되는 경우를 대비하여, main agent가 SendMessage로 subagent를 재개하도록 명확한 절차 제공.

변경 범위: prompt/지시문 수정만. 코드 로직 변경 없음 (evolve.ts의 prompt 문자열만 변경). 테스트 영향 최소.

## Tasks

- [ ] T001 `src/cli/commands/run/evolve.ts` -- autoSubagent prompt 문자열에 subagent continuation 절차 추가. "After the subagent completes, report the result." 부분을 subagent 반환 시 SendMessage 재개 지시로 교체.
- [ ] T002 `src/templates/agents/reap-evolve.md` -- Behavior Rules에 유저 interaction 패턴 섹션 추가. 반환 최소화, 유저 확인이 필요하면 agent 내에서 처리.
- [ ] T003 `src/adapters/claude-code/skills/reap.evolve.md` -- skill 파일에 subagent continuation 처리 안내 추가.
- [ ] T004 테스트 실행 -- 기존 테스트가 깨지지 않는지 확인 (prompt 변경이므로 기능 테스트 영향은 없어야 하나 확인 필요).

## Dependencies

T001, T002, T003은 독립적으로 수행 가능. T004는 T001~T003 완료 후 실행.

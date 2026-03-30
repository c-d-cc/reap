# Learning

## Goal

resolve: evolve subagent continuation -- SendMessage로 기존 subagent 재개

## Source Backlog

`evolve-subagent-continuation.md` (priority: high)

### 문제

`reap run evolve`가 autoSubagent mode로 reap-evolve subagent를 실행하면, subagent가 유저 확인 필요 시(예: planning 완료 후) 반환될 수 있다. 이때 main agent가 나머지 lifecycle을 직접 실행하여 일관성이 깨짐:
- subagent가 learning+planning까지 진행 후 반환
- main agent가 유저 "ok" 확인 후 `reap run implementation`을 직접 실행
- main agent에는 reap-evolve agent의 role/mindset/behavior rules가 없음

### Backlog 제안 해결책 (3가지)

1. **evolve skill prompt에 명시**: subagent 반환 후 SendMessage로 재개 지시
2. **reap-evolve agent에 명시**: 반환 대신 AskUserQuestion 사용
3. **evolve.ts에서 continuation 지시**: output에 subagent ID 포함 + SendMessage 안내

## Key Findings

### 현재 구조 분석

1. **reap.evolve.md (skill)**: 매우 간단 -- "Run `reap run evolve` and follow the stdout instructions exactly." 한 줄뿐.

2. **evolve.ts**: `autoSubagent: true`일 때 `status: "prompt"` JSON 출력. prompt에 "Launch a subagent using the Agent tool" 지시 포함. subagent 반환 후 처리 방법은 "After the subagent completes, report the result."만 언급.

3. **reap-evolve.md (agent template)**: role/mindset/behavior rules 정의. 유저 interaction 패턴에 대한 명시 없음.

4. **prompt.ts (buildBasePrompt)**: vision, memory, state, clarity, cruise, strict mode 등 동적 context만 빌드. subagent continuation 관련 정보 없음.

### 문제의 핵심

evolve.ts의 prompt에 "After the subagent completes, report the result." 만 있으므로:
- subagent가 중간에 반환해도 main agent는 "완료"로 해석
- 또는 main agent가 알아서 나머지를 직접 수행
- SendMessage로 subagent를 재개해야 한다는 지시가 어디에도 없음

### 해결 방향 평가

| 방식 | 장점 | 단점 |
|------|------|------|
| 1. evolve skill에 SendMessage 지시 | main agent가 올바르게 위임 | skill 파일이 복잡해짐 |
| 2. reap-evolve agent가 AskUserQuestion 사용 | 가장 깔끔. 주체 전환 없음 | Claude Code의 Agent tool이 AskUserQuestion을 subagent에게 지원하는지 미확인 |
| 3. evolve.ts output에 continuation 안내 | 구조적으로 명확 | evolve.ts가 subagent ID를 미리 알 수 없음 (ID는 Agent tool이 생성) |

**판단**: 방식 1+3 조합이 가장 현실적.
- evolve skill prompt (또는 evolve.ts prompt 문자열)에: subagent가 반환되면 SendMessage로 재개하라는 명시적 지시
- reap-evolve agent template에: 유저 확인이 필요할 때의 행동 패턴 명시 (가능하면 반환보다 agent 내에서 유저 질문 처리)

## Previous Generation Reference

gen-054: CLAUDE.md 마커 기반 동기화 구현. 이번 gen과 직접 연관 없음.

## Backlog Review

- `daemon-e2e-tests.md` (task, medium) -- 이번 gen과 무관
- `fix-migrate-update-tests.md` (task, medium) -- 이번 gen과 무관
- `strict-merge-mode-bypass-for-merge-gen.md` (task, medium) -- 이번 gen과 무관

## Context for This Generation

- Generation type: embryo (genome 자유 수정 가능)
- 변경 대상: prompt 파일들 (.md) + evolve.ts
- 테스트: prompt 변경은 기능적 영향 없으면 skip 가능 (evolution.md 기준). evolve.ts 변경 시 e2e 검토 필요.
- Clarity: **HIGH** -- backlog에 문제와 해결 방향이 구체적으로 정의됨. 변경 대상 파일도 명확.

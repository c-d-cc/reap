# Learning

> Evaluator agent 템플릿 정의 -- role, tools, behavior rules, cross-generation orchestration 기반 설계

## Project Overview

REAP v0.16.4, gen-051. 이전 세대(gen-050)에서 nonce 시스템을 transition graph 기반 multi-nonce 발행으로 완전 리팩토링 완료. 이제 evaluator agent 도입을 위한 기반이 마련됨.

### 현재 Agent 구조
- `src/templates/agents/reap-evolve.md` -- 정적 agent 템플릿 (role, mindset, behavior rules)
- `src/core/prompt.ts` -- `buildBasePrompt()`로 동적 context 생성 (state, vision, memory, clarity, cruise)
- `src/cli/commands/run/evolve.ts` -- evolve 명령이 subagent prompt를 조립하여 `emitOutput`으로 전달
- Agent tool의 `subagent_type: "reap-evolve"`로 호출

### 현재 Lifecycle에서 Evaluator가 개입할 지점
1. **fitness phase** -- 현재: 인간이 직접 피드백 or cruise mode에서 self-assessment. 목표: evaluator가 1차 평가하여 인간 부담 경감
2. **adapt phase** -- 현재: evolve agent가 vision gap 분석 + next goal 제안. 목표: evaluator가 cross-generation 맥락으로 더 정확한 제안
3. **validation stage** -- 현재: evolve agent가 자기 코드를 자기가 검증 (self-review bias). 목표: evaluator가 독립 검증

## Key Findings

### 1. Evaluator Agent = reap-evolve와 다른 유형의 agent
- **reap-evolve**: 1 generation = 1 agent instance. 단일 goal을 lifecycle에 따라 실행.
- **reap-evaluate**: long-running. 여러 generation에 걸쳐 맥락 유지. Cross-generation orchestration.

### 2. 템플릿 구조는 기존 패턴 따름
기존 `src/templates/agents/reap-evolve.md` 구조:
- YAML frontmatter (name, description, tools, model, memory)
- 정적 rules (mindset, behavior, constraints)
- 동적 context는 buildBasePrompt()가 별도 주입

evaluator도 같은 패턴: `src/templates/agents/reap-evaluate.md` 생성 예정.

### 3. Transition Graph에서 evaluator 관련 전이 경로
설계 문서에서 언급된 `completion:fitness -> validation:entry` 경로는 이미 NORMAL_TRANSITIONS에 존재.
현재 graph만으로 evaluator의 기본 동작은 가능. 추가 전이 필요 여부는 구현 단계에서 판단.

### 4. 핵심 설계 원칙 (기존 합의)
- **정량적 메트릭 금지**: evaluator도 정성적 판단만 (Goodhart's Law, longterm memory에 기록)
- **인간 override 보장**: evaluator 판단은 제안이지 최종 결정이 아님
- **self-fitness 금지**: evaluator가 evolve agent와 독립적이므로 self-review bias 해결
- **생물학적 메타포 유지**: fitness evaluation은 환경(외부)이 수행

### 5. Scope 확인 -- 이번 generation은 "템플릿 정의"
코드 구현(prompt.ts 수정, completion.ts 수정 등)은 후속 generation.
이번 generation에서 만들 것:
- `src/templates/agents/reap-evaluate.md` -- evaluator agent 템플릿 파일
- `vision/design/evaluator-agent.md` 갱신 -- 구체적 템플릿 구조 반영

## Previous Generation Reference

gen-050 (Nonce 시스템 transition graph 리팩토링):
- 선언적 transition graph + pendingTransitions map 도입
- Fitness feedback: "Graph 기반 multi-nonce 리팩토링 완료. Evaluator agent 기반 마련됨."
- 교훈: 데이터 플로우를 먼저 다이어그램으로 그렸으면 시행착오 줄일 수 있었을 것

## Backlog Review

### Pending
- `fix-migrate-update-tests` (task) -- integrity, migrate, update 관련 8개 pre-existing test failure. 이번 generation scope 밖.

## Context for This Generation

### Clarity Level: MEDIUM
- Vision goals에 "Evaluator agent 템플릿 정의"가 명시적으로 있음 (방향 명확)
- 설계 문서(evaluator-agent.md)가 이미 존재하여 큰 방향은 합의됨
- 그러나 evaluator의 구체적 behavior rules, tool 접근 범위, 인간 에스컬레이션 기준 등 세부 사항은 미정

### 접근 방식
설계 문서 + reap-evolve 템플릿을 기반으로 reap-evaluate 템플릿 초안을 작성하되, 세부 결정이 필요한 부분은 옵션과 트레이드오프를 제시하여 인간 판단을 구한다.

### 주요 결정 필요 사항
1. Evaluator의 tool 접근 범위 -- Read만? Bash도 필요? (테스트 실행 가능해야 하나?)
2. 인간 에스컬레이션의 구체적 기준
3. Evaluator가 fitness phase에서 생성하는 output 형태
4. Cross-generation 맥락 유지 방식 -- memory 활용? 별도 state?

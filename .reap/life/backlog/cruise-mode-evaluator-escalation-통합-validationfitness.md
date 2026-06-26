---
type: task
status: pending
priority: medium
createdAt: 2026-06-26T19:46:28.637Z
---

# Cruise mode + evaluator escalation 통합 (validation/fitness)

본 issue: gen-066에서 validation phase에 reap-evaluate 호출을 통합했으나, cruise mode와의 상호작용은 미포함. 본 backlog는 그 통합을 후속 generation으로 분리.

## 배경

evaluator-agent.md design (gen-051) 결정:
> Cruise mode: evaluator 사용. High confidence + Low impact → 자동 진행, 에스컬레이션 → cruise 중단

gen-066은 issue #20의 직접 인과 범위(validation 단독 호출)만 다루기로 결정. cruise 자동 중단 메커니즘은 별도 generation으로 분리.

## 처리해야 할 사항

1. **Validation 단계의 evaluator concern → cruise 자동 중단 연결**
   - validation 의 evaluator 호출 결과 중 'high-impact escalation' 발생 시 state 에 기록
   - cruise self-assessment phase (completion fitness) 가 그 기록을 보고 자동으로 'uncertain' 판단 → cruise 중단
   - 또는 validation 단계에서 즉시 cruise 중단 (fitness 도달 전)

2. **Fitness 단계 evaluator 통합** (vision goal 'Fitness 위임'의 첫 단계)
   - design 문서 (vision/design/evaluator-agent.md) 의 fitness 통합 plan 실행
   - completion.ts fitness phase 변경
   - cruise self-assessment 와 evaluator 평가의 관계 정리

3. **State 전달 메커니즘**
   - validation 의 evaluator 결과를 GenerationState 에 어떻게 저장할지 (인 메모리? life/ 의 메타 파일?)
   - fitness 가 그 결과를 참조하는 방식

## 의존성

- gen-066 (validation evaluator 통합) 완료 후 진행 가능
- vision goal 'Fitness 위임: evaluator 1차 평가 → 인간 에스컬레이션' 과 자연스럽게 묶임

## 참고

- gen-066 implementation artifact (validation evaluator wiring 패턴)
- vision/design/evaluator-agent.md (fitness 통합 plan 라인 116-162)
- issue #20 (validation 통합의 동기)

## Problem

gen-066은 validation 단계에 reap-evaluate 호출만 추가했다. design 문서가 명시한 "cruise mode escalation → cruise 중단" 메커니즘과 fitness 단계 evaluator 통합은 미처리 상태. cruise 중에 evaluator 가 high-impact concern 을 escalation 해도 cruise loop 가 자동으로 중단되지 않으면 evaluator 의 가치(외부 평가)가 cruise 시나리오에서 발휘되지 못함. 또한 evaluator-agent.md design 의 primary 통합 지점(fitness phase)이 아직 비어있어 self-fitness 위험이 그대로 남아있다.

## Solution

1. **State 채널 설계** — validation 의 evaluator 호출 결과(특히 high-impact escalation 발생 여부)를 후속 phase 가 참조 가능한 형태로 보존. 후보: `GenerationState` 의 새 optional 필드(`evaluatorConcerns?: { stage, severity, summary }[]`) 또는 life/ 의 메타 markdown(`.reap/life/evaluator-log.md`).
2. **Fitness 단계 evaluator 통합** — `vision/design/evaluator-agent.md` 의 fitness 통합 plan(line 116-162) 을 실행. `completion.ts` fitness phase 에서 `config.evaluator === true` 일 때 evaluator subagent 호출 지시 추가. evaluator 결과는 builder 가 user 에게 surface, 최종 fitness feedback 은 builder + user 결정.
3. **Cruise self-assessment 변경** — `completion.ts` fitness phase 의 cruise 분기에 "이전 단계(validation) 에서 unresolved evaluator concern 있는가" 자문 절 추가. 있다면 self-assessment 가 자동으로 "uncertain" 으로 판단 → cruise 중단.
4. **테스트** — fitness evaluator 호출 prompt 단위 테스트, cruise + evaluator escalation e2e 시나리오, validation→fitness 간 state 채널 동작 검증.
5. **문서** — README/docs 에 cruise + evaluator 동작 관계 명시. `vision/design/evaluator-agent.md` 의 fitness/cruise 절을 "구현 완료" 로 갱신.

## Files to Change

- `src/types/index.ts` — `GenerationState.evaluatorConcerns?` 필드 추가 (또는 life/ 메타 파일 위치 정의)
- `src/core/prompt.ts` — `buildEvaluatorPrompt()` 를 fitness 단계에서도 재사용 가능하게 일반화 (gen-066 에서 만든 함수의 stage 파라미터 활용)
- `src/cli/commands/run/validation.ts` — evaluator 결과를 state 채널에 기록 (high-impact escalation 검출 시)
- `src/cli/commands/run/completion.ts` — fitness phase 에 evaluator 호출 지시 추가 + cruise self-assessment 분기에 evaluator concern 자문 절 추가
- `tests/unit/prompt.test.ts` — fitness evaluator prompt 단위 테스트 추가
- `tests/e2e/` — cruise + evaluator escalation 시나리오 e2e
- `.reap/vision/design/evaluator-agent.md` — fitness/cruise 통합 완료 표기
- `README.md` 와 (있다면) docs/ — cruise + evaluator 관계 명시

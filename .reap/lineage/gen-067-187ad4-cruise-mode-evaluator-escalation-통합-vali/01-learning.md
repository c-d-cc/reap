# Learning

> Explore the project and build context before starting this generation's work.

## Project Overview

REAP v0.16.x — Recursive Evolutionary Autonomous Pipeline. CLI 도구로 AI/인간 협업 generation lifecycle을 관리. 본 generation의 직전 세대(gen-066)는 Issue #20을 해결해 **validation 단계**에서 reap-evaluate 독립 검증을 opt-in으로 호출하도록 통합했다. 본 generation(gen-067)은 그 자리에서 한 단계 더 나아가, **fitness 단계**까지 evaluator 호출을 확장하고 **cruise mode와의 escalation 연결**을 마무리한다.

이번 작업으로 evaluator는 두 stage에서 호출되며, validation의 escalation 결과가 fitness 단계의 cruise self-assessment에 영향을 미치는 **state 채널**이 신설된다. 이로써 design 문서(evaluator-agent.md)의 "Cruise mode → escalation → cruise 중단" 메커니즘이 처음으로 작동 가능해진다.

## Key Findings

### 1. 기존 코드 구조 (gen-066에서 안정화됨)

- **`src/core/prompt.ts:264-412`** — `buildEvaluatorPrompt(knowledge, paths, state, { stage })`. `stage: "validation" | "fitness"` 이미 분기 존재. fitness 분기는 메시지/verification tasks만 다르고, knowledge/state/artifacts/HARD-GATE는 stage-agnostic하게 동일. **그대로 재사용 가능 — 새 builder 함수 불필요**.
- **`src/cli/commands/run/validation.ts:99-142`** — 검증된 opt-in 패턴: config 읽기 → `evaluatorEnabled` 분기 → prompt section append + `context.evaluator.{enabled, prompt?}` emit. **fitness phase에 같은 패턴 적용 가능**.
- **`src/cli/commands/run/completion.ts:104-182`** — `phase === "fitness"` 분기. feedback 미제공 시 cruise/supervised 분기로 prompt 만 emit. cruise 분기(line 135-157)에서 "self-assessment" prompt가 출력되며 builder가 결과를 보고 OK/uncertain 판단. **이 자리가 evaluator 호출 + concern 자문이 들어갈 위치**.
- **`src/core/cruise.ts`** — `parseCruiseCount`/`advanceCruise`/`clearCruise`/`setCruise`. config.yml의 `cruiseCount: "N/M"`만 다룬다. **cruise 자동 중단 = `clearCruise(paths.config)` 호출 + cruiseActive false emit**.

### 2. State 채널 — 결정 사항

backlog가 두 후보를 제시했다:
- **(A) `GenerationState.evaluatorConcerns?: { stage, severity, summary }[]`** — current.yml에 yaml 필드 추가.
- **(B) `.reap/life/evaluator-log.md`** 메타 마크다운.

판단: **(A) 선택**. 이유:
- 기존 `fitnessFeedback?: string` 패턴과 동형 — `GenerationState`는 이미 stage 간 데이터 운반에 사용되는 채널.
- yaml 직렬화/검증이 한 곳(generation.ts save/parse)에서 처리되어 일관성 보장.
- evaluator concern은 인메모리 데이터지 사용자가 읽는 문서가 아님 — 마크다운으로 갈 이유가 약함.
- 단순성: `state.evaluatorConcerns?` 필드 1개. archive 시 자연 보존(archive.ts가 current.yml을 그대로 lineage로 옮김).

`severity: "low" | "high"` 두 단계로 충분 (escalation matrix가 본질적으로 high/low 이분법). builder는 evaluator 결과 요약을 `state.evaluatorConcerns`에 추가하고, fitness phase가 그것을 읽어 cruise 분기에 반영.

### 3. State 기록 trigger — 결정 사항

backlog 의 두 후보:
- **(C) validation의 evaluator 결과를 state에 기록** — builder 가 reap-evaluate subagent의 응답을 받고 → 명시적 CLI 호출로 state 저장.
- **(D) validation 단계에서 즉시 cruise 중단** — fitness 도달 전에 cruise 차단.

판단: **(C) 선택, 단 추가 CLI 신설**. 이유:
- (D)는 validation에서 cruise를 끊으면 fitness phase의 자기-assessment 자체가 생략됨. 사용자가 "cruise는 끊었지만 fitness는 거치고 싶다" 같은 분기를 잃음. 또한 evolutionary 메타포에서 "fitness는 환경의 판단"이므로 그 자리에서 결정해야 자연스러움.
- (C)는 명시적 CLI 호출이 필요하지만, 그것이 lifecycle nonce 시스템과 자연스럽게 어울림. 새 CLI `reap run validation --phase report-evaluator --severity <high|low> --summary "..."` 추가하면 됨.
- 단, builder agent가 명시적 CLI를 호출하도록 prompt에 지시해야 함. 이는 cruise mode일 때만 의무화 — supervised mode에서는 builder가 자기 prompt에 surface하기만 해도 충분.

### 4. Fitness phase evaluator 통합 — 결정 사항

backlog: "design 문서 fitness 통합 plan(라인 116-162) 실행. completion.ts fitness phase 변경."

design 문서를 다시 읽어보면: evaluator는 "validation의 독립 검증" + "fitness의 6 차원 평가" 두 역할. 이미 gen-066에서 validation은 완료. fitness는 6 차원 평가가 빠져있음.

판단:
- fitness phase work 분기(feedback 미제공 시)에서 **양 분기(cruise + supervised) 모두 evaluator 호출 옵트인 추가**.
- evaluator prompt는 `buildEvaluatorPrompt(..., { stage: "fitness" })` 그대로 사용 — 이미 fitness 분기가 builder에 준비됨.
- supervised 모드: builder가 evaluator 응답을 받고 → 사용자에게 surface → 사용자가 fitness feedback 결정.
- cruise 모드: builder가 evaluator 응답을 받고 → state.evaluatorConcerns 와 결합 → 자동 OK / cruise 중단 결정.

### 5. Cruise 자동 중단 — 결정 사항

cruise self-assessment 분기(현재 line 135-157) 에 다음 절차 추가:
1. `state.evaluatorConcerns` 에 `severity: "high"` 가 하나라도 있는가? → cruise 즉시 중단 (`clearCruise(paths.config)` + cruiseActive=false emit), supervised fitness 분기로 fallback.
2. evaluator 가 본 fitness 호출에서 high-impact 우려를 새로 escalation 했는가? → 마찬가지.
3. 그 외 → 기존 self-assessment prompt 출력 + builder의 자기-판단.

**중단 = config의 `cruiseCount` 제거 (clearCruise)**. 다음 generation이 자동 시작되지 않게 함. completion commit phase의 `advanceCruise()` 호출 결과가 자연스럽게 false가 되어 `cruiseActive: false` emit.

### 6. 양 adapter 영향

이번 generation의 모든 변경은 **CLI/core 레벨**이며 user-level agent 정의(`reap-evaluate.md`)는 변경 불필요 — agent 정의는 이미 fitness 단계 평가까지 포함하고 있음. 따라서 adapter 변경 0.

### 7. 테스트 영향 매트릭스

| 변경 | 필요 테스트 |
|------|-----------|
| `GenerationState.evaluatorConcerns?` 신설 | type 자체는 컴파일 검증, archive round-trip e2e |
| `validation.ts` report-evaluator phase 신설 | unit (prompt 형식) + e2e (CLI 호출 → state 변경) |
| `completion.ts` fitness phase evaluator 호출 절 | unit (prompt 내용 분기) |
| `completion.ts` cruise 분기 evaluatorConcerns 반영 | unit + e2e (cruise + high-severity concern → clearCruise) |

## Previous Generation Reference

gen-066 완료. 4-항목 verification(static load / dynamic refresh / entry-point / slash trigger) 패턴이 evaluator 통합에도 적용됨 — 본 generation은 그 위에서 fitness 통합 + cruise 연결만 추가. fitness feedback: "ok 잘했어". gen-066이 의도적으로 cruise 통합을 분리한 결정(Q5)이 본 generation의 입력.

## Backlog Review

본 generation의 source backlog 외에 pending 없음. 본 backlog는 generation 시작 시 consumed 처리됨.

### Source Backlog

```
cruise-mode-evaluator-escalation-통합-validationfitness.md
```

핵심 요구:
1. State 채널 설계 — `GenerationState.evaluatorConcerns?`
2. Fitness 단계 evaluator 통합 — `buildEvaluatorPrompt({ stage: "fitness" })` 활용
3. Cruise self-assessment 변경 — concern 있으면 자동 중단
4. 테스트 + 문서

## Technical Deep-Dive

### State 운반 시점 시퀀스

```
validation work phase
  ├─ builder가 reap-evaluate subagent 호출 (evaluator: true 시)
  ├─ subagent 응답 수신 (concern list + severity)
  └─ builder가 새 CLI 호출:
       reap run validation --phase report-evaluator
         --severity <high|low|none>
         --summary "<one-line summary>"
       ↓
       state.evaluatorConcerns 에 entry 추가
       state.save()

validation complete → ... → completion fitness phase
  ├─ builder가 reap-evaluate subagent 호출 (fitness stage)
  ├─ evaluator 응답 수신
  └─ cruise/supervised 분기:
       if cruise:
         if state.evaluatorConcerns 에 high 있음 OR 이번 fitness evaluator high concern:
           clearCruise(config) → cruise 중단
           supervised fitness prompt 로 fallback
         else:
           기존 self-assessment prompt
       else (supervised):
         evaluator 결과 + 기존 prompt surface
```

### State 채널 alternative — life/ 메타 파일

논의를 위해 (B) `evaluator-log.md` 의 단점 정리:
- 별도 파일 = 별도 시점에 race condition 가능 (state.yml과 동기화 안 됨).
- archive 시 별도 cp 코드 필요 — archive.ts 수정 영역 확장.
- builder가 마크다운 형식을 모르면 채울 수 없음 — 구조화된 데이터엔 yaml이 적합.

→ (A) `state.evaluatorConcerns?` 채택 확정.

### Severity 단순화

`"low" | "high"` 만 사용. 이유:
- escalation matrix가 본질적으로 high/low 이분법 (low는 직접 판단, high는 escalation).
- 더 많은 단계는 정량적 메트릭으로 변질될 위험 (Goodhart).
- builder가 evaluator 응답에서 "Escalate" 라벨을 본 경우 → high. 그 외 → low (또는 entry 자체 생략).

`"none"` severity는 CLI에서 entry를 추가하지 않는 시그널로 사용 (builder가 "evaluator OK" 보고용).

## Context for This Generation

- **Embryo, gen-067, source backlog 명확** → clarity **high**. 추상적 질문 없이 plan으로 직진.
- **사용자 자율 모드**: 사용자가 자러 갔으므로 모든 결정을 self 수행. fitness feedback도 self-assessment.
- **Self-fitness 금지 원칙**: self-assessment는 metacognition으로 한정 (REAP genome). 본 generation의 결과를 builder가 자기 평가하지 않고 객관적 사실(테스트 결과, 변경 모듈 list)만 보고.
- **인과 묶음(gen-065 longterm 교훈)**: fitness 통합 + cruise 자동 중단 + state 채널 세 가지는 같은 인과 chain 안에 있음(중단 결정이 state를 읽고 fitness 분기에서 발생). 분리 시 어느 하나가 빈 상태로 lineage 안에 남게 됨. **반드시 한 generation에서 처리** — 이는 backlog가 묶어 분리한 이유와 일치.

### Clarity Assessment

**High**: vision/goals.md 의 "Fitness 위임: evaluator 1차 평가 → 인간 에스컬레이션" 항목이 본 작업과 1:1 매칭. backlog가 task 단위로 분해되어 있고, gen-066이 이미 buildEvaluatorPrompt fitness 분기를 마련해두어 implementation 부담이 낮음. 모호함 없음 → planning에서 task 분해 즉시 가능.

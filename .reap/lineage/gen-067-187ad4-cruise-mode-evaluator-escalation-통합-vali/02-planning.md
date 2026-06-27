# Planning

## Goal

Fitness phase에서도 reap-evaluate를 opt-in 호출하고, validation→fitness 간 evaluator concern을 운반하는 state 채널을 신설하며, cruise mode일 때 evaluator escalation을 만나면 자동 중단되도록 한다. 사용자에게 design 문서(evaluator-agent.md)의 "Cruise mode → escalation → cruise 중단" 메커니즘이 처음으로 실제 동작한다.

## Completion Criteria

1. `GenerationState.evaluatorConcerns?: EvaluatorConcern[]` 타입 추가, current.yml round-trip 안전.
2. `reap run validation --phase report-evaluator --severity <high|low|none> --summary "..."` CLI가 state에 concern을 append (none은 no-op). 같은 phase 재호출도 안전 (idempotent하지 않아도 되지만 nonce 꼬임은 없어야 함).
3. `reap run completion --phase fitness` 가 `config.evaluator === true` 일 때 prompt에 fitness-stage evaluator 호출 절을 append + `context.evaluator.{enabled, prompt}` emit. `evaluator: false` 시 prompt는 pre-gen-067와 동일.
4. cruise 모드에서 `state.evaluatorConcerns`에 `severity: "high"` 가 하나라도 있으면 fitness work 분기가 `clearCruise()` 호출 + supervised-fallback prompt 출력. `context.cruiseAborted: true` emit. config의 cruiseCount가 제거됨.
5. unit test: fitness stage prompt 구조 검증 (evaluator 절 분기 + concern 반영).
6. e2e test: cruise + high-severity concern 시나리오 → cruiseCount 제거 + fallback prompt 확인.
7. 문서: design 문서의 "구현 상태" 절 갱신 ("Fitness 통합 완료", "Cruise escalation 완료"). README의 "Evaluator Agent" 절에 cruise + escalation 관계 1단락 추가.

## Background

design 문서(`vision/design/evaluator-agent.md`)와 backlog가 이미 해결책을 충분히 구체화. gen-066이 validation 단계만 처리한 의도적 분리(Q5)의 후속 작업.

## Brainstorming

설계 결정은 `01-learning.md`에서 모두 종결. 추가 brainstorm 불필요.

### State 채널 위치 — 재확인

| 옵션 | 장점 | 단점 | 결정 |
|------|------|------|------|
| (A) `GenerationState.evaluatorConcerns?` | 단일 진실원 (current.yml), archive 자연 보존, fitnessFeedback와 동형 | yaml field 추가 | **채택** |
| (B) `.reap/life/evaluator-log.md` | builder가 자유 형식 | 동기화 race, archive 별도 cp | reject |

### State 기록 CLI — `report-evaluator` phase 신설

`reap run validation --phase report-evaluator --severity X --summary Y` 형태. validation에 새 phase 추가.

trade-off: 새 phase = 새 nonce ticket이 필요. 단순화를 위해 **report-evaluator phase는 stage transition을 일으키지 않음**. nonce 발급/검증 없이 state.evaluatorConcerns만 append + save. 검증은 "stage가 validation인가" 만.

근거: 본 phase는 _부속 정보 기록_ 이지 lifecycle gate가 아니다. nonce는 lifecycle 무결성 보호용이므로 사이드 채널 메모는 필요 없음. validation의 work/complete 흐름은 그대로 유지.

### Fitness evaluator 호출 위치

`completion.ts:phase === "fitness"` 블록의 **양 분기**(cruise + supervised)에 같은 evaluator 절을 append. evaluator prompt는 단일하게 한 번만 생성(중복 제거).

### Cruise 중단 메커니즘

```
const highConcern = (state.evaluatorConcerns ?? []).some(c => c.severity === "high");
if (cruise && highConcern) {
  await clearCruise(paths.config);
  emit prompt {
    status: "prompt",
    phase: "fitness",
    context: { ..., cruiseAborted: true, evaluatorConcerns: state.evaluatorConcerns },
    prompt: ["## Cruise Aborted by Evaluator Concern", ...],
  };
  return;
}
```

`cruiseAborted: true` 필드는 e2e/agent 가 인지할 신호. cruiseCount는 제거되어 다음 generation 자동 시작 차단.

## Approach

새 phase는 핵심 데이터(state.evaluatorConcerns)만 받아 append. report-evaluator phase는 다음 흐름:

1. CLI 옵션 추가: `--severity`, `--summary`.
2. `validation.ts`에 `if (phase === "report-evaluator")` 분기 추가.
3. 입력 정규화 후 state.evaluatorConcerns에 append (severity가 "none"이면 no-op + emit ok).
4. emit `status: ok, command: validation, phase: report-evaluator`.

이 흐름은 nonce 시스템과 직교 (사용자가 transition 시도하지 않음). 단순 데이터 보고.

### CLI options 추가

`src/cli/index.ts`에 옵션 정의 + `src/cli/commands/run/index.ts`에 옵션 forward.

```
options.severity?: string
options.summary?: string
```

`validation.execute` 시그니처에 추가 (마지막 인수 또는 옵션 객체). 기존 호출자에 영향 없도록 optional.

### Type 신설

```ts
export interface EvaluatorConcern {
  stage: "validation" | "fitness";
  severity: "low" | "high";
  summary: string;
  recordedAt: string; // ISO timestamp
}
```

GenerationState에 `evaluatorConcerns?: EvaluatorConcern[]`.

## Risk Assessment

| 위험 | 영향 | 완화 |
|------|------|------|
| 기존 validation work flow가 새 phase로 영향 받음 | 회귀 가능 | `work`/`complete` 외 모든 phase는 분리된 if 블록. 기존 분기 unchanged. e2e regression test로 byte-identical 확인 |
| current.yml 새 field가 archive 시 깨짐 | medium | archive.ts는 current.yml을 그대로 lineage로 옮김. yaml round-trip 안전. unit test로 round-trip 검증 |
| cruise + concern 시 fitness phase가 영구 stuck | high | cruiseAborted 분기에서 `setTransitionNonces(s, "completion:fitness")` self-loop 보존 → builder가 supervised fitness로 자연 fallback 가능 |
| evaluator prompt가 너무 길어짐 | low | evaluator prompt 는 이미 안정. fitness 분기 메시지 차이만 발생 |
| 새 CLI option이 다른 phase에서도 의미를 가지는 듯 보임 | low | --severity/--summary는 report-evaluator phase에서만 사용됨을 옵션 description에 명시 |

## Scope

### 변경 파일

- `src/types/index.ts` — `EvaluatorConcern` 인터페이스 + `GenerationState.evaluatorConcerns?` 추가
- `src/cli/index.ts` — `--severity`, `--summary` 옵션 등록
- `src/cli/commands/run/index.ts` — 새 옵션 forward
- `src/cli/commands/run/validation.ts` — `report-evaluator` phase 추가
- `src/cli/commands/run/completion.ts` — fitness phase evaluator 호출 + cruise concern 분기
- `.reap/vision/design/evaluator-agent.md` — "구현 상태" 갱신
- `README.md` — Evaluator Agent 절에 cruise 관계 1단락

### 신규 테스트

- `tests/unit/completion-fitness-evaluator.test.ts` — fitness phase prompt 분기 검증 (mock state, evaluator on/off, cruise + concern)
- `tests/unit/evaluator-concerns-state.test.ts` — `EvaluatorConcern` 타입 검증 (yaml round-trip via GenerationState save/load)
- `tests/e2e/validation-report-evaluator.test.ts` — CLI 호출 시 current.yml 변경 확인
- `tests/e2e/completion-cruise-abort.test.ts` — cruise + high concern → cruiseCount 제거 + prompt cruiseAborted

### Out of scope

- "Vision/Goal 관리 위임" (별도 backlog로 분리, design 문서가 명시)
- 사용자 정의 severity 단계 — high/low 로 잠금
- evaluator agent 정의 자체 수정 (이미 fitness 평가 포함)
- adapter 변경 (없음)

## Tasks

- [ ] T001 `src/types/index.ts` — `EvaluatorConcern` interface + `GenerationState.evaluatorConcerns?: EvaluatorConcern[]`
- [ ] T002 `src/cli/index.ts` — `--severity` / `--summary` option 등록 (run 명령)
- [ ] T003 `src/cli/commands/run/index.ts` — 새 옵션을 validation handler로 forward (JSON serialize 패턴 활용)
- [ ] T004 `src/cli/commands/run/validation.ts` — `phase === "report-evaluator"` 분기 신설; severity none = no-op + ok; severity high/low → state.evaluatorConcerns append + save + emit
- [ ] T005 `src/cli/commands/run/validation.ts` — work phase prompt에 evaluator 절 추가 시 builder에게 report-evaluator CLI를 호출하라는 지시 추가 (cruise mode 시 의무 명시)
- [ ] T006 `src/cli/commands/run/completion.ts` — fitness phase work 분기 양쪽(cruise/supervised)에 evaluator 호출 절 + `context.evaluator.{enabled, prompt}` emit
- [ ] T007 `src/cli/commands/run/completion.ts` — cruise 분기에서 `state.evaluatorConcerns` high 존재 시 `clearCruise()` + cruiseAborted prompt 분기 추가
- [ ] T008 `tests/unit/evaluator-concerns-state.test.ts` — type 신설 검증 (단순 컴파일/구조)
- [ ] T009 `tests/unit/completion-fitness-evaluator.test.ts` — fitness phase prompt 분기 (mock context로 cruise + concern 조합 확인 — 가능한 부분만 unit 수준에서)
- [ ] T010 `tests/e2e/validation-report-evaluator.test.ts` — `reap run validation --phase report-evaluator --severity high --summary "x"` → current.yml 변경 확인
- [ ] T011 `tests/e2e/completion-cruise-abort.test.ts` — cruise + high-severity concern → fitness work 분기가 `cruiseAborted: true` 반환 + cruiseCount 제거
- [ ] T012 `.reap/vision/design/evaluator-agent.md` — "구현 상태" 갱신 (fitness 통합 완료, cruise escalation 완료)
- [ ] T013 `README.md` — Evaluator Agent 절에 cruise + escalation 1단락 + 새 report-evaluator phase 안내
- [ ] T014 `npm run build && npm run typecheck` + 전체 unit/e2e 실행 — 회귀 없음 확인

## Dependencies

- T001 → T002,T003,T004,T006,T007 (type 신설 선행)
- T002 → T003 → T004 (option chain)
- T004 → T005,T010 (CLI phase 신설 선행)
- T006 → T007 (fitness 절 신설 후 cruise 분기)
- T006,T007 → T009,T011 (테스트는 구현 후)
- T012,T013은 T001~T011 이후

## Test Strategy 요약

- **Unit**: state type round-trip, prompt 구조 분기 (fitness/cruise/concern 조합).
- **E2E**: 새 CLI phase 호출 → current.yml 검증, cruise + concern → cruiseCount 제거 + prompt 형태.
- **수동**: dog-fooding (이 generation의 fitness phase 자체가 evaluator: true 환경 — self-referential).

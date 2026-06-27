# Implementation Log

## Completed Tasks

### T001 — `src/types/index.ts`: `EvaluatorConcern` + `GenerationState.evaluatorConcerns?`

새 `EvaluatorConcern` interface 추가 — `stage: "validation" | "fitness"`, `severity: "low" | "high"`, `summary: string`, `recordedAt: string` (ISO timestamp). `GenerationState`에 optional `evaluatorConcerns?: EvaluatorConcern[]` field 추가.

설계 결정:
- severity는 binary (high/low). matrix에서 high = "Escalate" verdict (high impact OR low confidence), low = informational. 의도적으로 정량화 회피 (Goodhart's Law, longterm memory).
- field optional + absent = "no concerns raised" — pre-gen-067와 byte-identical 동작 보장.
- JSDoc에 cross-stage signalling 의도 명시 (validation → fitness cruise abort 흐름의 single source of truth).

### T002 — `src/cli/index.ts`: `--severity`, `--summary` 옵션 등록

`run` command에 두 옵션 추가. description에 `validation --phase report-evaluator` 한정 사용임을 명시 (Risk Assessment의 "다른 phase에서도 의미를 가지는 듯 보임" 완화).

### T003 — `src/cli/commands/run/index.ts`: 옵션 forward

`execute` signature에 `severity?: string; summary?: string` 추가. `stage === "validation" && phase === "report-evaluator"`일 때만 `extra = JSON.stringify({ severity, summary })`로 직렬화. abort/early-close 의 기존 JSON.stringify 패턴 차용.

### T004 — `src/cli/commands/run/validation.ts`: `report-evaluator` phase 신설

`phase === "report-evaluator"` 분기를 work/complete보다 먼저 처리. 핵심 동작:

1. `extra` JSON 파싱 → `{ severity, summary }` 추출
2. severity validation: missing → error, "none" → no-op + emit ok, "high"/"low" 외 → error
3. summary validation (none 제외): missing/empty → error
4. concern 객체 생성 (stage: "validation", severity, summary, recordedAt: now)
5. `state.evaluatorConcerns` 배열에 push + `gm.save(s)`
6. emit ok with `total` count

설계 결정 (planning Q와 일치):
- transition graph 외부 — nonce 검증/발급 없음. side-channel write only.
- validation stage 검증 (`if (state.stage !== "validation")` 분기는 기존 stage guard 가 처리)
- idempotent하지 않아도 OK — 같은 phase 재호출은 단순 append (의도적). 사용자가 evaluator를 여러 번 호출할 수 있음.

### T005 — work phase prompt에 builder 지시 추가

evaluator section 끝에 `report-evaluator` CLI 사용법 3가지(high/low/none) + "advance the lifecycle하지 않음" 명시. cruise mode 의무 강조는 별도 추가 없음 — fitness phase에서 자동 abort 가 강제 (의지보다 시스템 보장 우선).

### T006 — `src/cli/commands/run/completion.ts`: fitness phase evaluator 호출

fitness work 분기에서:
- `config.evaluator === true` 시 `loadReapKnowledge` + `buildEvaluatorPrompt(stage: "fitness")` 로 prompt 생성
- `evaluatorSection` 절을 supervised/cruise 양쪽 prompt에 append (조건부)
- `context.evaluator.{enabled, prompt}` emit
- evaluator off 시: `context.evaluator.enabled: false`, prompt undefined, evaluatorSection 비어있음 → pre-gen-067와 byte-identical

priorConcernsSection도 같은 패턴 — `state.evaluatorConcerns` 비어있지 않으면 양쪽 prompt에 append + context 노출.

### T007 — cruise + high concern → 자동 중단

fitness work 분기 진입 직후:
- `highConcerns = (s.evaluatorConcerns ?? []).filter(c => c.severity === "high")`
- `if (cruise && highConcerns.length > 0)` → `clearCruise(paths.config)` + 별도 fallback prompt emit (`completed: ["gate", "reflect", "cruise-aborted"]`, `cruiseAborted: true`, `previousCruiseCount` 포함)
- fallback prompt 본문: cruise disengaged 사실, high concerns 목록, 수동 fitness 흐름 안내, `reap cruise <N>` 재개 방법
- evaluatorSection은 fallback prompt에도 append (off 시에는 빈 배열)

설계 결정:
- supervisedPrompt 와 cruisePrompt 양쪽 분기보다 먼저 처리 — 한번 cruise aborted 되면 다른 분기 진입 못함
- nonce는 `setTransitionNonces(s, "completion:fitness")` self-loop으로 유지 — 사용자가 supervised feedback 으로 재호출 가능

### Backlog consumed 마킹

`.reap/life/backlog/cruise-mode-evaluator-escalation-통합-validationfitness.md` 의 frontmatter를 `status: consumed` + `consumedBy: gen-067-187ad4` 로 update. dog-fooding gen-065의 backlog 처리 패턴 따름.

### Tests 신설 (T008~T011) — 이 commit 에서 함께 처리

unit 2개, e2e 2개 추가:
- `tests/unit/evaluator-concerns-state.test.ts` — `EvaluatorConcern` 타입 구조 검증 + `GenerationState.evaluatorConcerns` YAML round-trip
- `tests/unit/completion-fitness-evaluator.test.ts` — 직접 unit 호출이 어려우므로 e2e로 이전 (이름 유지)
- `tests/e2e/validation-report-evaluator.test.ts` — CLI 호출 → current.yml 의 evaluatorConcerns 변경 확인 (high/low/none/missing/invalid 5 case)
- `tests/e2e/completion-cruise-abort.test.ts` — cruise + high concern → cruiseCount 제거 + `cruiseAborted: true` + 정상 cruise + no concern → 변화 없음

### 빌드/타입 검증

`npm run typecheck` pass, `npm run build` pass (0.57 MB single bundle).

## Discovered Issues

없음. 신규 phase는 transition graph 외부에서 동작하므로 nonce 무결성 영향 0. fitness phase의 양 분기에 evaluator/concern section 추가 시 기존 cruise/supervised flow 의 emit 구조 유지.

## Deferred Items

T012 (design 문서 `구현 상태` 갱신), T013 (README.md `Evaluator Agent` 절 cruise + escalation 1단락) 는 adapt phase 직전 reflect 단계에서 처리 — environment 갱신 흐름과 합쳐서 단일 트랜잭션으로 자연스러움. (시간 효율: 환경 점검 시 함께 보는 게 흐름 우선)

## Architecture Decisions

### State 채널 위치는 GenerationState (Q에서 결정한 (A))

evaluator concern은 lifecycle artifact가 아닌 "stage-cross-cutting fact"다. current.yml 의 다른 metadata (sourceBacklog, fitnessFeedback) 와 동형. archive 시 lineage 에 자연 보존되어 사후 추적 가능. yaml round-trip 안전 (단순 array of objects).

### report-evaluator는 transition graph 외부

nonce 발급/검증 없이 side-channel write로 처리. 근거: lifecycle gate 가 아닌 _부속 정보 기록_ 이기 때문. lifecycle 무결성은 work/complete 전이가 보장하고, evaluator concern은 그 사이의 informational annotation. 이 결정으로 e2e 시나리오 단순화 (`reap run validation --phase report-evaluator` 를 work 호출 후 언제든 호출 가능 — work/complete 사이 흐름이 끊기지 않음).

### Cruise abort 시 nonce 보존

`setTransitionNonces(s, "completion:fitness")` self-loop은 cruise abort 직전 이미 실행됨. abort emit 후 즉시 return — builder가 동일 phase 로 `--feedback "..."` 재호출할 수 있는 self-loop 보존. 만약 nonce를 invalidate하면 builder가 dead-end에 갇힘.

### Evaluator section은 양 분기 공통 코드

cruisePrompt + supervisedPrompt 양쪽에 같은 evaluatorSection / priorConcernsSection을 array 단위로 append. 코드 중복 0 (배열 변수에 push 후 양쪽에서 `.push(...evaluatorSection)`). gen-066 validation work phase의 동일 패턴 차용.

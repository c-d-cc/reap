# 03 Implementation — gen-100-497d4d

**Goal**: evaluator 무응답의 근본 원인을 찾고 침묵을 관측 가능하게 만든다

## 무엇을 고쳤는가

learning 이 실측으로 확정한 것 — **evaluator 는 정상적으로 돌고 있었고 회신만 유실됐다** —
위에서, REAP 이 할 수 있는 둘을 했다. 회신 전송 계층은 클라이언트의 것이고 손대지 않았다.

### 1. 회신 경로에 매달리지 않는 보고 경로 (근본 대응)

`reap-evaluate` 는 `Bash` 를 갖고 있다. 그러므로 **자기 판정을 직접 CLI 로 쓸 수 있다.**
지금까지의 설계는 evaluator → (회신) → builder → (요약) → CLI 로 **끊어진 링크 아래에
전부 매달려 있었다.**

- `src/core/prompt.ts` `buildEvaluatorPrompt()` — `## Record Your Verdict Yourself — Before
  You Reply` 절 신설. stage 에 따라 `validation` / `completion` 명령을 각각 낸다.
- `src/templates/agents/reap-evaluate.md` — `### Phase 6` 로 같은 절 (dog-fooding).

**여기서 blocking 모순을 하나 발견했다.** evaluator 의 HARD-GATE 가
`"You MUST NOT run \`reap run\` commands"` 라고 **금지하고 있었다.** 즉 유일하게 회신에
의존하지 않는 채널을 evaluator 자신의 규칙이 막고 있었다. 예외를 명시적으로 뚫었다 —
prompt.ts 와 agent 템플릿 둘 다:

> **One exception**: `--phase report-evaluator`. It advances nothing — no stage, no nonce,
> no transition. It is the one `reap run` that is not lifecycle.

예외를 뚫지 않고 지시만 추가했다면 evaluator 는 상반된 두 지시를 받았을 것이고,
**금지 쪽이 이겼을 것이다** (HARD-GATE 라는 이름이 붙어 있다).

### 2. 아무 보고도 없었다는 사실을 REAP 자신이 기록

REAP 은 "agent 를 띄웠는가"는 알 수 없다 — 그 호출은 REAP 프로세스가 종료된 뒤 agent 안에서
일어난다. 하지만 **"판정이 한 번이라도 도착했는가"는 안다.** 그리고 관측 가능해야 하는 사실이
정확히 그것이다.

- `src/types/index.ts` — `EvaluatorRun { stage, outcome, detail?, recordedAt }`.
  outcome 은 **넷**: `clean` / `concern` / `unreachable` / `not-reported`.
  `GenerationState.evaluatorRuns?`.
- `src/core/evaluator-run.ts` (신규) — `recordEvaluatorRun` /`hasEvaluatorRun` /
  `recordEvaluatorSilenceIfUnreported` / `formatEvaluatorRun` / `hasUnreviewedStage`.
  **표식이 아니라 공유** — validation 과 completion 두 소비자가 같은 *값*을 알아야 하므로
  하나가 소유하고 나머지가 import 한다 (genome application.md).
- `validation.ts --phase complete` — evaluator 활성 + validation run 부재 시
  `not-reported` 를 append 하고 message 에 명시. **전이는 그대로 진행된다.**
- `completion.ts --phase adapt` — fitness 쪽 같은 처리.

### 3. 침묵을 지시하던 문장을 지웠다

`validation.ts:230` 이 이렇게 적혀 있었다:

```
"- Skip the `report-evaluator` CLI call (no concern was generated)."
```

**실패 시 흔적을 남기지 말라는 명시적 지시였다.** gen-099 가 흔적을 남긴 것은 이 지시를
어겼기 때문이고, 지시를 따르는 세대는 아무것도 남기지 않는다. 삭제하고 `--severity
unreachable` 로 **기록하라**로 바꿨다.

실패 열거도 고쳤다. 기존 셋(`tool unavailable, model error, malformed reply`) 중
**실제로 일어난 것이 하나도 없다.** 열린 표현 + 실제로 관측된 경우를 명시:

> if no verdict reaches you, for any reason (the Agent tool is absent, the subagent errors,
> the reply is malformed, **or it simply never answers**)

### 4. `--severity none` 이 state 를 쓴다

`none` 은 `"Explicit no-op ... State is untouched"` 였다. 그래서 **"검토받고 clean"과
"아무도 검토 안 함"이 `current.yml` 에서 바이트 단위로 같았다.** 이제 run `clean` 을 남긴다.
**concern 은 여전히 만들지 않는다** — gen-067 의 계약(빈 concern 오염 금지)은 그대로다.

### 5. fitness 쪽 채널 신설 — gen-090 L7 해소

`EvaluatorConcern.stage` 는 gen-067 부터 `"validation" | "fitness"` union 이었는데
**두 번째를 만들 수 있는 것이 코드에 없었다.** `report-evaluator` 가 validation stage 로
게이트돼 있었기 때문이다. gen-090 이 L7 로 기록하고 hints 5번으로 넘긴 항목이다.

`src/cli/commands/run/report-evaluator.ts` (신규) 로 핸들러를 **하나의 소유자**로 뽑고
`validation.ts` 와 `completion.ts` 가 위임한다. `run/index.ts` 의 JSON 인코딩 분기도
`completion` 을 포함하도록 넓혔다 — **이것을 빠뜨리면 `--severity` 가 조용히 아무것도
싣지 않는다.**

### 6. fitness 를 주는 사람이 그 사실을 본다

세 fitness prompt 경로 **전부**(supervised / cruise / cruise-aborted)에
`### Independent Review — what actually happened` 절이 붙는다. `unreachable`/`not-reported`
가 하나라도 있으면 *"이 세대는 독립 검토 없이 진행됐다"* 를 명시한다. context 에도
`evaluatorRuns` 를 싣는다 (3곳). adapt prompt 도 같은 절 + artifact 에 적으라는 지시.

gen-099 에서는 builder 가 **손으로** 적어서만 전달됐고, 그것을 잊는 세대는 아무 흔적도
남기지 않았다.

## 게이트가 아님을 어떻게 보장했는가

- `not-reported` 는 **concern 을 만들지 않는다.** concern 이 되면 cruise auto-abort
  (`completion.ts:176` 의 `severity === "high"` 필터)를 건드릴 수 있고, 그 순간 게이트가 된다.
- `validation --phase complete` 은 기록만 하고 `performTransition` 을 그대로 부른다.
  e2e C1/C5 가 `nextStage === "completion"` 을 같은 실행에서 단언한다.
- `evaluator: false` 면 **아무것도 쓰지 않는다** — 빈 배열도 아니고 필드 자체가 없다 (C4).

## T017 — 반환값 union 확장 전수 확인 (인간 주문 4)

`--severity` 에 `unreachable` 이 추가되어 union 이 넓어졌다. gen-077 재발을 막기 위해
`grep -rn "severity" src/` 로 읽는 곳을 **전부** 확인했다:

| 위치 | 형태 | 판정 |
|---|---|---|
| `cli/index.ts:66` 옵션 help | 문자열 `high\|low\|none` | **고쳤다** — 새 값이 도움말에 없으면 존재하지 않는 것과 같다 |
| `report-evaluator.ts` 분기 | `none\|unreachable` → `high\|low` → error | 신규. 부정형 종결(`sev !== "high" && sev !== "low"` → error) |
| `completion.ts:176` cruise abort | `filter(c => c.severity === "high")` | **긍정형** — `unreachable` 이 concern 이 아니므로 도달 불가. 안전 |
| `completion.ts:210,229` 렌더 | `[${c.severity}]` — concern 만 | 안전 |
| `types/index.ts:41` 주석 | `--severity <high\|low>` | **고쳤다** |
| `EvaluatorConcern.severity` 타입 | `"low" \| "high"` | **넓히지 않았다** — 의도. `unreachable` 은 concern 이 아니다 |

핵심 판정: **`EvaluatorConcern.severity` union 은 확장하지 않았다.** 확장했다면 cruise abort
필터부터 렌더까지 전부가 새 값을 다뤄야 했다. `unreachable` 을 **다른 축**(`EvaluatorRun.outcome`)
에 둔 것이 그 전파를 애초에 없앤다 — gen-077 의 교훈은 "union 을 넓히면 소비자를 전수 확인하라"
지만, **넓히지 않는 것이 더 낫다.**

## 변경 파일

**신규**: `src/core/evaluator-run.ts` · `src/cli/commands/run/report-evaluator.ts` ·
`tests/unit/evaluator-run.test.ts` (19) · `tests/unit/evaluator-self-report-shipped.test.ts` (8) ·
`tests/e2e/evaluator-silence.test.ts` (12)
**수정**: `src/types/index.ts` · `src/core/prompt.ts` · `src/cli/index.ts` ·
`src/cli/commands/run/{index,validation,completion}.ts` ·
`src/templates/agents/reap-evaluate.md` · `README.md` ·
`tests/e2e/validation-report-evaluator.test.ts`

**독립 검토 2라운드가 이 목록을 늘렸다** — 뒤의 5개(`evaluator-self-report-shipped.test.ts`,
`README.md`, `validation-report-evaluator.test.ts`, 그리고 `prompt.ts`·agent 템플릿의 carrier)
는 evaluator 지적에 대한 대응이다. 상세는 04-validation § 7.

## Task 진행

- [x] T001 `EvaluatorRun` 타입
- [x] T002 `src/core/evaluator-run.ts` 공유 헬퍼
- [x] T003 `report-evaluator` — none→clean, unreachable 신설, concern 도 run 남김
- [x] T004 `validation --phase complete` 자동 `not-reported`
- [x] T005 completion 단계 채널 + adapt 자동 기록 (gen-090 L7)
- [x] T006 prompt 문구 교정 — `"Skip the report-evaluator CLI call"` 삭제
- [x] T007 `buildEvaluatorPrompt()` 자기보고 절 + HARD-GATE 예외
- [x] T008 `src/templates/agents/reap-evaluate.md` Phase 6
- [x] T009 fitness/adapt prompt 에 run 이력 (3 경로 전부)
- [x] T010 unit **27 케이스** (19 + 8, 라운드1 E1 대응으로 파일 하나 추가)
- [x] T011 e2e 12 케이스
- [ ] T012 genome/environment — **adapt/reflect 에서** (embryo 이나 순서를 지킨다)
- [x] T013 전체 검증 — 04-validation § 1
- [x] T014 **실제로 evaluator 재시도 — 2라운드, 지적 6건 전부 처리** — 04-validation § 7
- [x] T015 (주문 1) 원인 불명을 결함 없음으로 적지 않는다 — 04-validation § 4-a·§ 6
- [x] T016 (주문 3) negative — **총 16회, 전부 red 확인** (1차 10 + 검토 대응 6)
- [x] T017 (주문 4) union 전수 확인 — 위 표

## Negative 결과 (T016) `[negative]`

수정을 되돌려 검사가 실제로 red 를 내는지 확인했다. **10회 전부 red.**

| # | 되돌린 것 | red 가 된 테스트 |
|---|---|---|
| N1 | `hasEvaluatorRun` 이 stage 를 무시 | stage 분리 2건 |
| N2 | `enabled` 가드 제거 | opt-out 회귀검사 |
| N3 | `not-reported` 를 미검토로 안 셈 | 인간 고지 2건 |
| N4 | `clean` 이 "보고됨"에서 빠짐 | no-op 회귀 |
| E-N1 | 자동 `not-reported` 제거 (gen-099 상태) | C1/C5 + C6 |
| E-N2 | `--severity none` 을 no-op 으로 되돌림 | C2 + C6 negative |
| E-N3 | 미검토 경고를 무조건 출력 | C6 negative |
| E-N4 | complete 에서 opt-out 무시 | C4 |
| E-N5 | `"Skip the report-evaluator CLI call"` 복원 | prompt 텍스트 |
| E-N6 | fitness 채널 제거 | gen-090 L7 |

E-N1 이 가장 중요하다 — **gen-099 가 실제로 있던 상태**로 되돌린 것이고, 그때 red 가 되는 것이
"세 상태가 이제 구분된다"의 관측적 증거다.

**부재 단언을 스스로 증명한 것** (주문 3 후반):
- C1 은 `not-reported` 를 읽기 **전에** `stage === "validation"` 과 `evaluatorRuns` 길이 0 을
  먼저 단언한다 — 빈 필드가 크래시가 아님을 그 자리에서 보인다
- prompt 텍스트 테스트는 `"Skip the ..."` 부재를 읽기 **전에** `prompt.length > 500` 과
  `"Evaluator Subagent Invocation"` 존재를 단언한다 — prompt 가 통째로 비어도 통과하는 일이 없다
- C4 는 `evaluatorRuns` 가 **`undefined`** 임을 요구한다 (빈 배열 아님)

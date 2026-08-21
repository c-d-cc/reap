# 02 Planning — gen-100-497d4d

**Goal**: evaluator 무응답의 근본 원인을 찾고 침묵을 관측 가능하게 만든다

## Spec

learning 이 원인을 실측으로 확정했다 (01-learning F7): **evaluator 는 정상적으로 돌고 있었고,
회신만 호출자에게 도달하지 않는다.** agent 정의도 spawn 도 메시지 수신도 실행도 전부 정상이다.

회신 전송 계층은 클라이언트의 것이라 REAP 이 고칠 수 없다. 이 세대가 고치는 것은 둘이다:

1. **끊어진 링크에 매달리지 않는 보고 경로** — evaluator 는 `Bash` 를 갖고 있으므로
   **스스로** `report-evaluator` 를 칠 수 있다. 그러면 회신이 유실돼도 판정이 state 에 남는다.
2. **아무 보고도 없었다는 사실을 REAP 자신이 기록** — REAP 은 "agent 를 띄웠는가"는 모르지만
   "이 세대에 `report-evaluator` 가 한 번이라도 불렸는가"는 안다.

**게이트로 만들지 않는다.** 어떤 전이도 막지 않는다. 바뀌는 것은 *"안 돌았다는 사실이
보이는가"* 뿐이다 (longterm `Subagent calls as lifecycle gates` 준수).

## 왜 지금 설계가 침묵할 수밖에 없는가 — 세 상태가 둘로 접힌다

| 실제로 일어난 일 | 지금 `current.yml` | 고친 뒤 |
|---|---|---|
| 검토받고 concern 있음 | `evaluatorConcerns` 항목 | 동일 + run `concern` |
| 검토받고 clean | **아무것도 없음** | run `clean` |
| 회신이 안 왔음 | **아무것도 없음** | run `unreachable` |
| 아무도 아무 말도 안 함 | **아무것도 없음** | run `not-reported` (REAP 이 씀) |

아래 셋이 지금 바이트 단위로 같다. longterm 이 규정한
*"An assertion of absence has to prove itself first"* 의 정확한 사례다.

## Requirements (FR)

- **FR1** `GenerationState` 에 `evaluatorRuns?: EvaluatorRun[]` 을 추가한다.
  `outcome: "clean" | "concern" | "unreachable" | "not-reported"`.
- **FR2** `report-evaluator --severity none` 이 **state 를 쓴다** (run `clean`).
  지금은 no-op 이라 "검토받고 깨끗했다"가 "검토를 못 받았다"와 구분되지 않는다.
- **FR3** `report-evaluator --severity unreachable --summary "<무슨 일이 있었는지>"` 를 신설한다.
  concern 은 만들지 않는다 (코드에 대한 발견이 아니다). run `unreachable` 만 남긴다.
- **FR4** `validation --phase complete` 은 `evaluator: true` 인데 validation 단계의 run 이
  하나도 없으면 `not-reported` 를 **스스로 append 하고 message 에 그 사실을 적는다.**
  **전이는 막지 않는다.**
- **FR5** `report-evaluator` 를 `completion` 단계에서도 부를 수 있게 한다 (stage 는 `fitness`
  로 기록). 지금 fitness 쪽에는 기록 채널이 아예 없다 (01-learning F5).
  `completion --phase adapt` 이 fitness run 부재 시 `not-reported` 를 append 한다.
- **FR6** validation·completion 의 evaluator prompt 를 고친다:
  - fallback 이 `"Skip the report-evaluator CLI call"` 이라고 지시하는 줄을 **삭제**하고
    `--severity unreachable` 로 **기록하라**로 바꾼다. 이 한 줄이 침묵의 직접 지시였다.
  - 실패 열거에 **"띄웠으나 회신이 오지 않았다"** 를 넣고 열린 표현으로 바꾼다
    (지금 셋 — tool unavailable / model error / malformed reply — 중 어디에도 실제로
    일어난 것이 없다).
  - **evaluator 에게 자기 판정을 직접 CLI 로 쓰라고 지시**한다 (FR7 과 짝).
- **FR7** `buildEvaluatorPrompt()` 가 evaluator 자신에게 "너의 판정을 `report-evaluator` 로
  직접 기록하라"는 절을 싣는다. 회신 유실에 대한 근본 대응.
  `src/templates/agents/reap-evaluate.md` 에도 같은 절을 넣는다 (dogfooding).
- **FR8** fitness prompt 가 evaluator run 이력을 **눈에 띄게** 싣는다.
  `unreachable`/`not-reported` 가 있으면 *"이 세대는 독립 검토를 받지 못했다"* 를 명시한다 —
  fitness 를 주는 사람이 알아야 하는 사실이고, gen-099 에서는 builder 가 손으로 적어서만 전달됐다.

## Completion Criteria

- **C1** `evaluator: true` 인 generation 에서 아무도 `report-evaluator` 를 부르지 않으면
  `current.yml` 에 `not-reported` 가 남는다. **[e2e 로 검증]**
- **C2** `--severity none` 호출이 state 를 바꾼다 (`clean`). **[unit + e2e]**
- **C3** `--severity unreachable` 이 run 을 남기고 **concern 은 만들지 않는다**. **[unit]**
- **C4** `evaluator: false` 인 generation 에서는 run 이 하나도 생기지 않는다 —
  **회귀 검사** (opt-out 사용자에게 새 잡음이 가면 안 된다). **[e2e]**
- **C5** 어떤 전이도 막히지 않는다 — `not-reported` 인 채로 validation→completion 이 통과한다.
  **[e2e, C1 과 같은 실행에서]**
- **C6** fitness prompt 가 `unreachable`/`not-reported` 를 실을 때 그 문구가 실제로 나온다. **[e2e]**
- **C7** 3 스위트 baseline 유지 (unit 791+ / e2e 379+ / scenario 62), typecheck·build·자기진단 통과.

## Tasks

- [ ] **T001** `src/types/index.ts` — `EvaluatorRun` 타입 + `GenerationState.evaluatorRuns?`.
      `CONFIG_DEFAULTS` 성격의 필드가 아니므로 optional. *(검증: typecheck)*
- [ ] **T002** `src/core/evaluator-run.ts` (신규) — run 을 append 하는 순수 헬퍼 하나.
      validation.ts 와 completion.ts 두 곳이 같은 로직을 쓰므로 **공유**한다
      (genome: 표식보다 공유가 낫다 / No duplication). *(검증: unit)*
- [ ] **T003** `validation.ts` `report-evaluator` — `none` 이 run `clean` 을 쓰도록,
      `unreachable` 신설, `high|low` 가 run `concern` 도 남기도록. *(검증: unit + e2e)*
- [ ] **T004** `validation.ts` `--phase complete` — evaluator 활성 + validation run 부재 시
      `not-reported` append + message 에 명시. **전이는 그대로.** *(검증: e2e C1/C5)*
- [ ] **T005** `report-evaluator` 를 completion 단계에서도 허용 (stage `fitness` 로 기록).
      `completion --phase adapt` 이 fitness run 부재 시 `not-reported`. *(검증: e2e)*
- [ ] **T006** validation.ts / completion.ts 의 evaluator prompt 문구 교정 (FR6).
      **`"Skip the report-evaluator CLI call"` 줄 삭제가 핵심.** *(검증: e2e 문자열)*
- [ ] **T007** `src/core/prompt.ts` `buildEvaluatorPrompt()` — evaluator 자기보고 절 추가 (FR7).
      *(검증: unit)*
- [ ] **T008** `src/templates/agents/reap-evaluate.md` — 자기보고 절 (dogfooding).
      `~/.claude/agents/` 는 `reap install-skills` 가 동기화하므로 손으로 복사하지 않는다.
      *(검증: 설치 후 diff)*
- [ ] **T009** fitness prompt 에 run 이력 섹션 (FR8). *(검증: e2e C6)*
- [ ] **T010** unit test — `tests/unit/evaluator-run.test.ts`. 4 outcome + `not-reported`
      중복 방지 + `evaluator: false` 무영향. *(negative 포함)*
- [ ] **T011** e2e test — `tests/e2e/evaluator-silence.test.ts`. C1·C2·C4·C5·C6.
- [ ] **T012** genome/environment 반영 — `types` 절, evaluator 서술.
      **genome 은 embryo 라 직접 수정 가능하나 adapt 에서 한다** (evolution.md 297/300 여유 3줄).
- [ ] **T013** 검증 — 3 스위트 + typecheck + build + `check-self-diagnosis.sh` +
      `list-carriers.sh --check`.
- [ ] **T014** **실제로 evaluator 를 다시 태운다.** 회신이 오면 그것이 결과이고,
      안 오면 **`unreachable` 이 자동으로/수동으로 남는지**가 판정 기준이다.

## 영향받는 기존 테스트

`grep -rn "report-evaluator\|evaluatorConcerns" tests/` 로 확인한다 (implementation 첫 단계).
`--severity none` 이 state 를 쓰게 되므로 **"state 불변" 을 단언하는 기존 테스트가 있으면
그 단언이 뒤집힌다** — 찾아서 새 계약으로 고친다. 이것이 이 변경의 유일한 파괴적 지점이다.

## 하지 않는 것

- **evaluator 를 게이트로 만들지 않는다.** 어떤 전이도 새로 막지 않는다.
- **회신 전송 계층을 고치지 않는다.** 클라이언트의 것이고 REAP 밖이다.
  다만 **REAP 이 그것에 의존하지 않도록** 경로를 하나 더 낸다 (FR7).
- **`reap-evolve` agent 정의는 건드리지 않는다.** 이번 goal 의 인과 밖이다.
- **milestone 파일을 수정하지 않는다.** 이 세대는 어느 milestone 의 Generations 목록에도 없다.

## Additional Findings

- `EvaluatorConcern.stage` 는 `"validation" | "fitness"` union 인데 **fitness producer 가
  코드에 없다.** `report-evaluator` 가 validation 단계로 게이트돼 있기 때문 (validation.ts:17).
  FR5 가 이 union 의 나머지 절반을 처음으로 실체화한다.
- cruise auto-abort 는 `evaluatorConcerns.filter(severity === "high")` 를 본다
  (completion.ts:176). `unreachable` 이 concern 을 만들지 **않는** 것은 의도다 —
  회신 부재로 cruise 를 중단시키면 그것이 곧 게이트가 된다.

## 인간 확인 — 승인 (2026-08-22, coordinator 경유)

**"승인. 이대로 구현하라."** 추가 주문 넷을 계획에 편입한다:

- [ ] **T015** (주문 1) **원인 불명을 결함 없음으로 적지 마라.** 회신 경로가 왜 끊기는지
      REAP 이 고칠 수 없는 것이라면 **그것을 결론으로** 04-validation·05-completion 에 적는다.
      *"조사했으나 원인이 클라이언트 하네스 쪽이고 REAP 이 할 수 있는 것은 관측 가능하게
      만드는 것뿐이다"* 는 정직한 결과다.
- [ ] **T016** (주문 3) **negative 를 반드시 돌린다.** 특히 세 상태가 지금 바이트 동일하다는
      것이 이 세대의 발견이므로, **수정 후에 실제로 구분되는지를 관측으로 증명**한다.
      그리고 **부재 단언은 스스로 먼저 증명한다** — "기록이 없다"가 크래시·필드명 변경과
      구분되는지 확인한다 (상태·개수를 먼저 요구).
- [ ] **T017** (주문 4) **`unreachable` 신설은 반환값 union 확장이다.**
      genome application.md 의 표가 이 종류를 gen-077 사례로 지목한다.
      **그 union 을 읽는 곳을 `grep` 으로 전수 확인**한다 — 한 곳만 늘리면 gen-077 재발.
      대상: `severity` 를 읽는 모든 분기 + `EvaluatorConcern.severity` 소비처.
- (주문 2) FR7/T007/T008 이 이미 담고 있다 — prompt 와 **배포 원본**
  `src/templates/agents/reap-evaluate.md` 둘 다. dog-fooding 규칙.

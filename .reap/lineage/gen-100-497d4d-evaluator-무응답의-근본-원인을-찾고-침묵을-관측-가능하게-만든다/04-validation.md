# 04 Validation — gen-100-497d4d

**Goal**: evaluator 무응답의 근본 원인을 찾고 침묵을 관측 가능하게 만든다

근거 표기: `[실행]` 이 세대에서 명령을 직접 돌렸다 · `[negative]` 일부러 깨뜨려 fail 을
확인했다 · `[독해]` 코드를 읽고 판단했다.

## 1. 검사 결과 `[실행]`

| 검사 | 명령 | 결과 |
|---|---|---|
| typecheck | `npx tsc --noEmit` | pass |
| build | `npm run build` | pass — `index.js` 0.68 MB, grammars 15 |
| unit | `npm run test:unit` | **818 pass / 0 fail** (baseline 791, +27) |
| e2e | `npm run test:e2e` | **391 pass / 0 fail** (baseline 379, +12) |
| scenario | `npm run test:scenario` | **62 pass / 0 fail** (baseline 62, 변동 없음) |
| carrier 형식 | `bash scripts/list-carriers.sh --check` | pass — 80 marker / 14 id |
| carrier 고아 | `bash scripts/list-carriers.sh --orphans` | 고아 0 (14 id 스캔) |
| 자기진단 | `bash scripts/check-self-diagnosis.sh` | **8절 전부 pass** (v0.17.7) |
| 프로젝트 무결성 | `reap fix --check` | error 0 / warning 2 (gen-052 상속분, baseline 그대로) |

**전 스위트를 `tee` 로 남기고 grep 은 로그에 대고 했다** — gen-099 hints 2 가 지목한 습관.
`(fail)` 줄이 파이프에서 버려지지 않았다.

## 2. Completion Criteria

| | 기준 | 근거 |
|---|---|---|
| **C1** | 아무도 `report-evaluator` 를 안 부르면 `not-reported` 가 남는다 | `[실행]` e2e `evaluator-silence.test.ts` "C1/C5" |
| **C2** | `--severity none` 이 state 를 바꾼다 (`clean`) | `[실행]` unit + e2e "C2" |
| **C3** | `unreachable` 이 run 을 남기고 **concern 은 안 만든다** | `[실행]` e2e "C3" |
| **C4** | `evaluator: false` 는 run 을 하나도 안 만든다 (회귀) | `[실행]` e2e "C4" — `evaluatorRuns` 가 **`undefined`** 임을 요구 |
| **C5** | 어떤 전이도 막히지 않는다 | `[실행]` e2e "C1/C5" 가 **같은 실행에서** `nextStage === "completion"` 단언 |
| **C6** | fitness prompt 가 미검토를 알린다 | `[실행]` e2e "C6" + **"C6 negative"** (검토받은 세대는 경고 안 받음) |
| **C7** | 3 스위트 baseline 유지 + 게이트 통과 | `[실행]` 위 표 |

**7/7 충족.**

## 3. Negative — 검사가 실제로 결함을 잡는가 `[negative]`

genome: *"검사를 만든 뒤 곧바로 통과하는 것을 확인하면 그 검사가 실제로 결함을 잡는지 알 수
없다."* **10회 되돌렸고 10회 전부 red.**

| # | 되돌린 것 | red |
|---|---|---|
| N1 | `hasEvaluatorRun` 이 stage 를 무시 | 2건 |
| N2 | `enabled` 가드 제거 | 1건 |
| N3 | `not-reported` 를 미검토로 안 셈 | 2건 |
| N4 | `clean` 이 "보고됨"에서 빠짐 | 1건 |
| E-N1 | **자동 `not-reported` 제거 — gen-099 가 실제로 있던 상태** | 2건 |
| E-N2 | `--severity none` 을 no-op 으로 되돌림 | 2건 |
| E-N3 | 미검토 경고를 무조건 출력 | 1건 |
| E-N4 | complete 에서 opt-out 무시 | 1건 |
| E-N5 | `"Skip the report-evaluator CLI call"` 복원 | 1건 |
| E-N6 | fitness 채널 제거 (gen-090 L7 회귀) | 1건 |

**E-N1 이 이 세대의 핵심 증거다.** gen-099 상태로 되돌리면 red 가 된다는 것이
*"세 상태가 이제 실제로 구분된다"* 의 관측적 증명이다. 코드를 읽고 내린 판단이 아니다.

되돌린 파일은 백업에서 복원했고 `diff -q` 로 **바이트 동일**을 확인한 뒤 재빌드했다 —
negative 가 소스에 새지 않았다.

### 부재 단언은 스스로 먼저 증명했다

genome: *"'경고가 없다'는 크래시·필드명 변경과 구분되지 않는다."* 이 세대의 부재 단언 셋 전부
앞에 존재 단언을 뒀다:

- C1 은 `not-reported` 를 읽기 **전에** `stage === "validation"` 과 `evaluatorRuns` 길이 0 을
  단언한다 — 빈 필드가 크래시가 아님을 그 자리에서 보인다
- prompt 텍스트 테스트는 `"Skip the ..."` **부재**를 읽기 전에 `prompt.length > 500` 과
  `"Evaluator Subagent Invocation"` **존재**를 단언한다 — prompt 가 통째로 비어도 통과하는 일이 없다
- "C6 negative" 는 경고 부재를 읽기 전에 `"[clean] (validation,"` 존재를 단언한다 —
  절 자체가 안 나온 것과 경고만 안 나온 것을 가른다

## 4. 근본 원인 — 결론 (인간 주문 1)

> *"원인 불명을 결함 없음으로 적지 마라."*

**원인은 밝혀졌고, 그 일부는 REAP 밖이다. 둘을 나눠 적는다.**

### 4-a. REAP 밖 — 회신 전송 계층 (고치지 않았다, 고칠 수 없다) `[실행]`

learning E1~E3 이 측정한 것: `reap-evaluate` 는 **정상적으로 spawn 되고, 메시지를 받고,
지시를 13초 만에 실행한다.** 도달하지 않는 것은 **agent → 호출자 방향의 회신뿐**이다.

이것은 클라이언트(agent harness)의 메시지 전달 계층이고 REAP 의 코드가 아니다.
**REAP 이 이 결함을 고칠 수단은 없다.** 그러므로 이 세대는 그것을 고치지 않았고,
고쳤다고 적지도 않는다.

**이것이 gen-099 침묵의 필요조건이었다.** 그리고 gen-099 의 관측
("응답 없음, idle 로 전환")은 정확했으나 **그 해석("evaluator 가 아무것도 하지 않았다")은
틀렸다** — 돌고 있었다.

### 4-b. REAP 안 — 침묵을 만든 세 가지 (고쳤다)

회신이 유실돼도 **흔적은 남았어야 했다.** 남지 않은 것은 REAP 자신의 결함 셋 때문이다:

1. **fallback 이 흔적을 남기지 말라고 명시적으로 지시했다** —
   `"- Skip the \`report-evaluator\` CLI call (no concern was generated)."`
   gen-099 가 흔적을 남긴 것은 이 지시를 **어겼기** 때문이다.
2. **`--severity none` 이 no-op 이었다** — "검토받고 clean"과 "아무도 검토 안 함"이
   `current.yml` 에서 바이트 단위로 같았다.
3. **판정이 회신 경로에만 매달려 있었다** — evaluator → (회신) → builder → CLI.
   링크 하나가 끊기면 전부 유실된다. evaluator 가 `Bash` 를 갖고 있는데도 그 경로를 쓰지
   않았고, 오히려 **evaluator 의 HARD-GATE 가 `reap run` 을 금지해 막고 있었다.**

셋 다 고쳤다. 3번이 근본 대응이고 — **회신 유실이 다시 일어나도 판정은 state 에 남는다.**

### 4-c. 그래서 실패 양상이 어떻게 바뀌는가

| | 이전 | 이후 |
|---|---|---|
| 회신 유실 시 builder 가 아는 것 | 아무것도 (기다리다 포기) | 동일 — **회신 계층은 그대로다** |
| 회신 유실 시 **state 에 남는 것** | **아무것도** | evaluator 자신이 쓴 `concern`/`clean`, 또는 `unreachable`, 또는 REAP 이 쓴 `not-reported` |
| fitness 를 주는 사람이 아는 것 | builder 가 손으로 적었을 때만 | prompt 가 **항상** 싣는다 |
| lineage 에 남는 것 | 없음 | adapt prompt 가 artifact 에 적으라고 지시 |

## 5. 게이트가 되지 않았음 `[실행]` `[독해]`

longterm `Subagent calls as lifecycle gates` 는 "advisor + fallback, never gate" 를 요구하고
그 근거는 **환경에 Agent 도구가 없을 수 있다**는 것이다. 이 세대의 발견은 그 근거를 더
강하게 만든다 — 도구가 있고 성공을 반환하고 실제로 돌면서도 아무것도 돌아오지 않을 수 있다.

- `[실행]` e2e C1/C5 — `not-reported` 가 기록된 **같은 실행에서** `nextStage === "completion"`
- `[독해]` `not-reported`·`unreachable` 은 `EvaluatorConcern` 을 만들지 않으므로
  cruise auto-abort (`completion.ts` 의 `severity === "high"` 필터)에 **도달할 수 없다**
- `[실행]` e2e C4 — `evaluator: false` 면 필드 자체가 생기지 않는다

## 6. 이 세대의 검사가 **못 보는 것**

genome: *"통과는 '검사 범위 안에서 문제없음'일 뿐이다."*

- **회신 전송 계층 자체를 보는 검사는 없다.** 4-a 의 측정은 이 세대 learning 의 수동 실험이고
  자동 회귀 검사가 아니다. 회신이 다시 도달하기 시작해도, 다시 끊겨도, 어떤 검사도 모른다.
- **evaluator 가 실제로 `report-evaluator` 를 호출하는지를 보는 검사는 없다.** prompt 에 지시가
  실렸는지는 e2e 가 보지만(문자열), 그 지시를 agent 가 따르는지는 **모델 행동**이고 이 저장소에
  그것을 보는 하네스가 없다. gen-091 이 층2 게이트에 대해 기록한 것과 같은 한계다.
- **`~/.claude/agents/` 로 실제 설치된 정의를 보는 자동 검사는 없다.** 이 세대는 `diff` 로
  손으로 확인했다. 자기진단 § 7 은 OpenCode 쪽만 나열을 요구한다.
- **cruise 경로의 새 절은 e2e 가 supervised 경로만 지난다.** 세 경로 전부에 같은
  `evaluatorHistorySection` 을 `push` 하지만(`[독해]`), 실행되는 것은 supervised 다.
- **stage 를 벗어나지 않는 재작업은 미검토로 보이지 않는다** (라운드2 R2-B, 실측).
  `roundStartedAt` 은 timeline 을 읽으므로 **stage 재진입**만 라운드 경계로 삼는다.
  `reap run back` 경로는 닫혔지만, validation 안에서 제자리 수정하면 — **이 세대가 실제로
  한 것이 그것이다** — 라운드1 의 판정이 라운드2 를 대신한다.
  **닫을 수 없다**: REAP 은 판정 이후 코드가 바뀌었는지 알 방법이 없고, 안다고 가정하면
  "검토를 다시 받아라"가 되어 게이트가 된다. 완화는 렌더된 `recordedAt` 하나뿐이며,
  그것으로 사람이 "이 판정이 무엇을 보고 내려진 것인가"를 판단한다.

## 7. 실제 evaluator 재시도 (T014) — **가장 중요한 결과**

**실제로 태웠다. 회신은 이번에도 오지 않았고, 판정은 남았다.**

`reap-evaluate` 를 두 라운드 띄웠다. **두 라운드 다 회신은 도달하지 않았다** — 4-a 의
전송 계층 결함은 그대로다. 그런데 **판정은 두 번 다 `current.yml` 에 남았다.** evaluator 가
`Bash` 로 직접 `report-evaluator` 를 쳤기 때문이다.

이것이 이 세대가 만든 것의 유일하게 결정적인 증거다. 같은 환경, 같은 침묵, 다른 결과.

### 라운드 1 — concern 3건, 전부 실측, 전부 진짜

| | evaluator 가 지적한 것 | 조치 |
|---|---|---|
| E1 | **shipped agent template 의 Phase 6 + HARD-GATE 예외를 통째로 지워도 unit/e2e 전부 green.** dogfood 사본이 `prompt.ts` 와 표식으로도 묶여 있지 않다 | carrier `evaluator-self-report-bc56fe66` 를 양쪽 4곳에 심고 `tests/unit/evaluator-self-report-shipped.test.ts` **8 케이스** 신설. Phase 6 삭제 → 4 red, 예외 삭제 → 1 red `[negative]` |
| E2 | **재검증 라운드가 미검토로 안 보인다** — `back`→implementation→validation 후 라운드1 의 `clean` 이 남아 `not-reported` 가 안 써지고, fitness prompt 는 timestamp 를 렌더하지 않는다 | `roundStartedAt()` 신설 — 해당 stage 의 **마지막** timeline 항목으로 경계를 잡는다. `formatEvaluatorRun` 이 `recordedAt` 을 렌더한다. unit **4 케이스** 추가 |
| E3 | **낡은 산문 둘** — `tests/e2e/validation-report-evaluator.test.ts` 가 `severity=none` 을 여전히 `"no-op, state unchanged"` 로 명명·서술(계획이 지목한 **유일한 파괴 지점**), `README.md:301` 이 gen-100 이전 모델을 서술 | 둘 다 고쳤다. e2e 테스트에는 `clean` run 단언을 **추가**했다 — 기존 단언들은 아무것도 안 하는 분기에도 통과한다 |

**E1 이 가장 값어치 있다.** 배포되는 사본이 통째로 사라져도 초록인 상태였고, 저장소 자신의
세대는 `buildEvaluatorPrompt` 가 같은 텍스트를 런타임에 공급해 **가려주고 있었다.**
"기능을 지우면 무엇이 여전히 초록인가"의 정확한 사례다.

### 라운드 2 — concern 3건, **전부 라운드 1 의 수정 안에 있었다**

genome longterm 이 세 세대 연속 관측한 것이 네 번째로 성립했다.

| | evaluator 가 지적한 것 | 조치 |
|---|---|---|
| R2-A | **04-validation 의 `[실행]` 수치 둘이 라운드1 수정 후 낡았다** (unit 806→실측 818, carrier 75/13→실측 80/14). §3 이 인용한 `"[clean] (validation)"` 은 timestamp 추가로 **어떤 테스트에도 없다**. §7 이 비어 있고 03 의 파일 목록이 라운드1 추가분을 빠뜨렸다 | 전부 재측정해 고쳤다. genome 이 gen-095 에 대해 적은 것 그대로 — **"내가 방금 바꾼 것을 측정한 앞 문장"** 이다 |
| R2-B | **`roundStartedAt` 은 stage 재진입만 경계로 삼는다** — `back` 없이 validation 안에서 제자리 수정하면(**gen-100 자신의 경우**) 라운드1 판정이 라운드2 를 대신한다 | **닫지 않았다.** 아래 § 6 에 한계로 명시한다 — REAP 은 코드가 바뀌었는지 알 방법이 없다. 렌더된 timestamp 가 유일한 완화이고, evaluator 자신도 그렇게 판정했다 |
| R2-C | **라운드1 수정의 잔여물 셋** — `validation.ts` 새 주석이 **없는 순서를 서술한다**(가드는 위에 있고 phase 조건으로 면제된다) / `EvaluatorConcern` import 가 미사용으로 남았다 / **completion 에서 호출해도 출력 envelope 의 `command` 가 `"validation"`** | 셋 다 고쳤다. envelope 은 `s.stage` 로 정하고 e2e 2 케이스가 양쪽 철자를 단언한다. `[negative]` R-N6 — 하드코딩으로 되돌리니 red |

**R2-A 가 이 세대에서 가장 부끄러운 종류다.** 라운드1 수정이 내 검증 기록을 낡게 만들었고,
나는 수치를 재측정하지 않았다. 그리고 §3 의 인용은 **내가 방금 바꾼 포맷의 옛 형태**였다 —
gen-095 가 정확히 그렇게 걸렸고, longterm 이 그것을 적어뒀는데도 반복했다.

### 라운드 2 negative (전부 red 확인) `[negative]`

| # | 되돌린 것 | red |
|---|---|---|
| R-N1 | round 경계가 **첫** timeline 항목을 씀 | 2건 |
| R-N2 | fitness 를 validation 항목으로 경계 지음 | 1건 |
| R-N3 | round 경계 제거 (E2 가 보고한 결함) | 2건 |
| R-N4 | **shipped Phase 6 삭제** (E1 이 보고한 그 결함) | 4건 |
| R-N5 | HARD-GATE 예외 삭제 | 1건 |
| R-N6 | envelope `command` 하드코딩 복원 | 1건 |

**총 negative 16회, 전부 red.**

### 라운드 3 를 돌리지 않은 이유

genome 은 "2회 이상 예산에 넣어라"를 요구하고 둘을 돌렸다. 라운드 3 를 돌리지 않은 것은
수렴했다고 판단해서가 **아니다** — 라운드 2 의 수정 안에 결함이 있을 확률은 여전히 높고,
이 세대의 관측이 그것을 네 번 확인했다. **fitness 를 보는 사람이 이 사실을 알고 결정해야
한다.** `report-evaluator --severity low` 로 그대로 기록했다.

## 재검증 후 최종 수치 `[실행]`

typecheck pass · build pass · **unit 818 / e2e 391 / scenario 62, 전부 0 fail** ·
carrier `--check` 80 marker / 14 id · `--orphans` 0 ·
`check-self-diagnosis.sh` **8절 전부 pass** (v0.17.7) · `reap fix --check` error 0 / warning 2.

신규 테스트 **39 케이스** — unit 19(`evaluator-run`) + unit 8(`evaluator-self-report-shipped`)
+ e2e 12(`evaluator-silence`).

## Verdict

**pass** — 완료 조건 7개 충족, 전 검사 green, negative 16회로 검사의 유효성을 확보,
독립 검토 2라운드를 **실제로 받았고** 지적 6건을 전부 처리했다.

미해결로 남긴 것은 R2-B 하나이며 **닫을 수 없는 종류**다(§ 6). 그것을 결함 없음으로 적지 않는다.

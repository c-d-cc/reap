# 01 Learning — gen-100-497d4d

**Goal**: evaluator 무응답의 근본 원인을 찾고 침묵을 관측 가능하게 만든다

## Project Overview

REAP 는 `evaluator: true` (opt-in) 일 때 validation 과 fitness 에서 독립 검토자
`reap-evaluate` 를 띄우도록 **agent 에게 지시**한다. gen-099 에서 그 지시가 수행됐고
(builder 가 확인 2회 + 부분 보고 요청 1회 발송) **한 건도 회신하지 않았다.**
그 세대의 적대적 검토는 전부 builder 자신이 했고, fitness 가 이것을 최우선 조사 항목으로
지목했다.

## Key Findings

### F1. agent 정의는 설치돼 있고 소스와 동일하다 — **원인이 아니다** `[실행]`

```
ls -la ~/.claude/agents/          → reap-evaluate.md, reap-evolve.md 둘 다 존재
diff ~/.claude/agents/reap-evaluate.md src/templates/agents/reap-evaluate.md → 차이 없음
diff ~/.claude/agents/reap-evolve.md   src/templates/agents/reap-evolve.md   → 차이 없음
```

gen-099 hints 가 지목한 조사 방향 셋 중 첫째(gen-064 형태의 설치 갭)는 **기각**된다.
`registerSessionIntegration` 과 `installSkills` 양쪽이 갱신하는지를 더 볼 필요가 없다 —
결과물이 이미 최신이다.

### F2. REAP 은 evaluator 가 돌았는지 알 수단이 **하나도 없다**

`src/cli/commands/run/validation.ts:194-230` 이 하는 일의 전부:

1. `config.evaluator === true` 확인
2. `buildEvaluatorPrompt()` 로 prompt 문자열 생성
3. `context.evaluator.prompt` 에 실어 stdout 으로 내보냄
4. prompt 본문에 "Agent 도구로 `reap-evaluate` 를 띄워라" 라고 **문장으로** 지시

**실제 호출은 agent 가 한다.** REAP 프로세스는 그 시점에 이미 종료돼 있다.
따라서 "띄웠는가 / 회신했는가"를 REAP 이 관측할 방법이 구조적으로 없다.
hints 가 "그것 자체가 결함 후보다" 라고 적은 것이 맞다.

### F3. **fallback 이 "흔적을 남기지 마라"고 명시한다** — 침묵의 직접 원인

`validation.ts:227-230`:

```
"**Fallback** — if the evaluator subagent fails (tool unavailable, model error, malformed reply):"
"- Tell the user the evaluator could not run and why."
"- Continue normal validation. The evaluator is opt-in advice, not a gate."
"- Skip the `report-evaluator` CLI call (no concern was generated)."
```

마지막 줄이 결함이다. 실패했을 때 **state 에 아무것도 쓰지 말라고 지시한다.**
"Tell the user" 는 대화창에만 남고 `current.yml` 에도 lineage 에도 남지 않는다.

gen-099 가 흔적을 남긴 것은 이 지시를 **어겼기** 때문이다 — builder 가 손으로
`--severity low` 를 쳐서 넣었다. 지시를 따르는 세대는 아무 흔적도 남기지 않는다.

genome (gen-099 adapt): **"fallback 이 조용하면 그것은 fallback 이 아니라 침묵이다."**

### F4. `--severity none` 도 state 를 건드리지 않는다 — 세 상태가 두 개로 접힌다

`validation.ts:47-59`: `sev === "none"` 이면 `emitOutput` 만 하고 `gm.save()` 를 호출하지 않는다
(`"Explicit no-op ... State is untouched"`). 그 결과 `current.yml` 에서 구분 가능한 것은 둘뿐이다:

| 실제로 일어난 일 | `state.evaluatorConcerns` |
|---|---|
| 돌았고 concern 있음 | 항목 존재 |
| 돌았고 clean | **없음** |
| 안 돌았음 / 무응답 / 도구 부재 | **없음** |

아래 두 줄이 **바이트 단위로 같다.** longterm 이 규정한 그 실패다 —
*"An assertion of absence has to prove itself first"*. 빈 `evaluatorConcerns` 는
"검토받고 깨끗했다"와 "검토를 못 받았다"를 구분하지 못한다.

### F5. fitness 쪽은 더 나쁘다 — 기록 채널 자체가 없다

`completion.ts:201`:
```
"**Fallback** — if the evaluator subagent fails, document the failure and continue. Fitness phase is not gated on the evaluator."
```

"document" 할 대상이 지정돼 있지 않고, fitness 에는 `report-evaluator` 같은 side-channel 이
아예 없다 (`report-evaluator` 는 `stage: "validation"` 만 기록한다 — `EvaluatorConcern.stage`
는 `"validation" | "fitness"` union 인데 fitness 쪽 producer 가 없다).

### F6. 실패 사례 열거가 실제로 일어난 것을 담지 못한다

fallback 이 이름 붙인 실패는 셋이다 — `tool unavailable, model error, malformed reply`.
gen-099 에서 일어난 것은 **"띄웠는데 아무 회신도 오지 않았다"** 이고, 이것은 셋 중 어디에도
없다. 열거는 다음에 나올 종류를 담지 못한다 (genome application.md 가 carrier 목록에 대해
내린 것과 같은 판정).

## Backlog

pending 없음 (`--no-backlog` 로 시작). 잔여 8건은 `vision/design/backlogs_v0.17_residual/` 에
있고 plugin 전환 이후 재검토 대상이라 이 세대와 무관하다.

## Context

- **milestone**: `reap run start` 가 main(`v018-배포-형태를-plugin-으로`)을 자동 부여했으나
  이 세대는 그 milestone 의 Generations 목록에 없다. 사용자가 gen-099 fitness 에서
  "다음 세대가 조사" 로 지시한 항목이다. **milestone 파일은 수정하지 않는다.**
- **type**: embryo — genome 직접 수정 가능
- **금지**: evaluator 를 게이트로 만들지 말 것. longterm 의
  `Subagent calls as lifecycle gates` 가 "advisor + fallback, never gate" 를 요구하며
  그 근거는 환경에 Agent 도구가 없을 수 있다는 것이다.
  바꿔야 할 것은 **"안 돌았다는 사실이 보이는가"** 이지 "반드시 돌아야 하는가" 가 아니다.

## Clarity Level

**HIGH** — 목표가 구체적이고, 조사 방향 셋이 hints 에 적혀 있으며, 그중 하나(F1)는 이미 실측으로
기각됐고 나머지 둘은 코드에서 확인됐다. 설계 판단 하나만 남는다: 침묵을 무엇으로 관측 가능하게
만들 것인가.

## F7. **재현했다 — 그리고 원인은 agent 가 아니라 회신 경로다** `[실행]`

이 세대가 learning 중에 실험 셋을 돌렸다 (2026-08-22 05:41~05:46).

| # | 한 일 | 관측 |
|---|---|---|
| E1 | 최상위에서 `Agent(subagent_type: "reap-evaluate")` 를 한 줄 프롬프트로 spawn | `Spawned successfully` → 곧바로 **idle**. 회신 **없음** |
| E2 | 같은 agent 에 `SendMessage` 로 확인 2회 | 회신 **없음** (gen-099 가 본 것과 동일) |
| E3 | 같은 agent 에 **"Bash 로 파일을 하나 써라"** 지시 | **13초 만에 파일이 생겼다** |

E3 이 결정적이다. 파일 내용 `PROBE-RAN 2026-08-22T05:45:43+09:00`, 지시를 보낸 시각으로부터
13초. 즉:

- agent 정의는 **설치돼 있고** (F1)
- agent 는 **spawn 되고**
- agent 는 **메시지를 받고**
- agent 는 **지시를 실행한다**
- **agent → 호출자 방향의 회신만 도달하지 않는다**

**gen-099 의 침묵은 evaluator 가 놀고 있어서가 아니었다. 그동안 내내 돌고 있었고, 그 결과가
builder 에게 오지 않은 것이다.** builder 가 보낸 3회는 전부 전달됐을 가능성이 높다.

이것이 longterm 의 `Subagent calls as lifecycle gates` 가 말한 것보다 **나쁜 형태**다.
그 항목은 "환경에 Agent 도구가 없을 수 있다"를 근거로 든다. 도구가 없으면 **에러가 난다** —
관측 가능하다. 여기서는 도구가 있고, `Spawned successfully` 를 반환하고, 실제로 실행되고,
그런데도 아무것도 돌아오지 않는다. **성공을 반환하는 침묵이 부재보다 위험하다.**

## F8. 그래서 REAP 이 고칠 수 있는 것과 없는 것이 갈린다

회신 전송 계층은 클라이언트(harness)의 것이고 REAP 이 고칠 수 없다. REAP 이 고칠 수 있는 것 둘:

1. **회신 경로에 의존하지 않는 보고 경로를 준다.** `reap-evaluate` 의 tools 에는 **`Bash` 가
   있다** (`Read, Glob, Grep, Bash`). 즉 evaluator 는 **스스로**
   `reap run validation --phase report-evaluator ...` 를 칠 수 있다. 그러면 회신이 유실돼도
   판정은 `current.yml` 에 남는다. 지금 설계는 "evaluator 가 builder 에게 말한다 →
   builder 가 요약해 CLI 를 친다" 로 **끊어진 링크 아래에 전부 매달려 있다.**
2. **아무 보고도 없었다는 사실을 REAP 자신이 기록한다.** REAP 은 "agent 를 띄웠는가"는 알 수
   없지만 **"이 세대에 report-evaluator 가 한 번이라도 불렸는가"는 안다.** 그리고 관측 가능해야
   하는 사실이 정확히 그것이다.

둘 다 게이트가 아니다. 아무것도 막지 않는다.

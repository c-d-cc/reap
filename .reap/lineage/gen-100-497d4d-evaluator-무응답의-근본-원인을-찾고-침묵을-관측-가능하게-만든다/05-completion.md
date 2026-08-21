# 05 Completion — gen-100-497d4d

**Goal**: evaluator 무응답의 근본 원인을 찾고 침묵을 관측 가능하게 만든다
**Verdict**: pass

## Reflect — 이 세대가 실제로 한 것

### 원인은 밝혀졌고, 절반은 REAP 밖이다

gen-099 는 `evaluator: true` 로 `reap-evaluate` 를 띄우고 확인 3회를 보냈으나 한 건도
회신받지 못했다. **그 관측은 정확했고 해석이 틀렸다.**

learning 이 실험 셋으로 갈랐다 `[실행]`:

| | 한 일 | 관측 |
|---|---|---|
| E1 | 최상위에서 `Agent(reap-evaluate)` spawn | `Spawned successfully` → 즉시 idle, 회신 없음 |
| E2 | `SendMessage` 확인 2회 | 회신 없음 (gen-099 와 동일) |
| E3 | **"Bash 로 파일 하나 써라"** 지시 | **13초 만에 파일이 생겼다** |

E3 이 결정적이다. agent 는 **내내 돌고 있었다.** 도달하지 않는 것은
**agent → 호출자 방향의 회신뿐**이다.

**이 전송 계층은 클라이언트의 것이고 REAP 이 고칠 수 없다. 고쳤다고 적지 않는다.**
그리고 이것은 longterm 의 `Subagent calls as lifecycle gates` 가 상정한 것보다 나쁜 형태다 —
그 항목은 "환경에 Agent 도구가 없을 수 있다"를 근거로 든다. 도구가 없으면 **에러가 나고**
관측 가능하다. 여기서는 도구가 있고, 성공을 반환하고, 실제로 실행되고, 그런데도 아무것도
돌아오지 않는다. **성공을 반환하는 침묵이 부재보다 위험하다.**

### REAP 안의 결함 셋 — 회신이 유실돼도 흔적은 남았어야 했다

1. **fallback 이 흔적을 남기지 말라고 명시적으로 지시했다.**
   `"- Skip the \`report-evaluator\` CLI call (no concern was generated)."`
   gen-099 가 흔적을 남긴 것은 이 지시를 **어겼기** 때문이고, 지시를 따르는 세대는
   아무것도 남기지 않는다.
2. **`--severity none` 이 no-op 이었다.** "검토받고 clean" · "회신 유실" · "아무도 안 부름"
   셋이 `current.yml` 에서 **바이트 단위로 같았다.**
3. **판정이 회신 경로에만 매달려 있었다.** evaluator → (회신) → builder → CLI.
   링크 하나가 끊기면 전부 유실된다.

셋 다 고쳤다. **3번이 근본 대응이다** — evaluator 는 `Bash` 를 갖고 있으므로 스스로
`report-evaluator` 를 친다. 그런데 **evaluator 의 HARD-GATE 가
`"You MUST NOT run \`reap run\` commands"` 로 그 유일한 생존 경로를 막고 있었다.**
예외를 명시적으로 뚫지 않았다면 evaluator 는 상반된 두 지시를 받았을 것이고
**금지 쪽이 이겼을 것이다.**

### 그리고 그 fix 로 실제로 독립 검토를 2라운드 받았다

**두 라운드 다 회신은 오지 않았다. 판정은 두 번 다 `current.yml` 에 남았다.**
같은 환경, 같은 침묵, 다른 결과. 이것이 이 세대가 만든 것의 유일하게 결정적인 증거이며,
코드 독해로 얻을 수 있는 것이 아니다.

지적 **6건 전부 진짜**였고 전부 처리했다. 상세는 04-validation § 7.
**라운드2 의 셋은 전부 라운드1 의 수정 안에 있었다** — genome longterm 이 세 세대 연속
관측한 것의 **네 번째 성립**이다.

## 무엇이 바뀌었나

| 축 | 이전 | 이후 |
|---|---|---|
| 회신 유실 시 state | **아무것도 없음** | evaluator 자신이 쓴 `concern`/`clean`, 또는 `unreachable`, 또는 REAP 이 쓴 `not-reported` |
| "검토받고 clean" vs "검토 못 받음" | **바이트 동일** | `evaluatorRuns` 의 outcome 으로 구분 |
| fitness 를 주는 사람 | builder 가 손으로 적었을 때만 앎 | prompt 가 **항상** 싣는다 (3 경로 전부) |
| fitness 단계 판정 채널 | **없음** (gen-090 L7) | `run completion --phase report-evaluator` |
| evaluator 의 보고 수단 | 회신 하나 | 회신 + **CLI**(회신 독립) |
| 게이트 여부 | — | **변함없이 게이트 아님.** 전이는 그대로 |

## 검증 요약 `[실행]`

typecheck · build pass · **unit 818 / e2e 391 / scenario 62, 전부 0 fail** (baseline 791/379/62,
신규 39 케이스) · carrier `--check` 80 marker / 14 id · `--orphans` 0 ·
`check-self-diagnosis.sh` 8절 전부 pass · `reap fix --check` error 0 / warning 2 (상속분).

**negative 16회 전부 red** `[negative]` — 그중 R-N4 는 라운드1 evaluator 가 보고한 그 결함,
E-N1 은 **gen-099 가 실제로 있던 상태**다.

## 닫지 못한 것 — 결함 없음으로 적지 않는다

1. **회신 전송 계층** (04-validation § 4-a). REAP 밖. 자동 회귀 검사도 없다 —
   다시 도달하기 시작해도, 다시 끊겨도 아무 검사가 모른다.
2. **stage 재진입 없는 제자리 재작업은 미검토로 보이지 않는다** (라운드2 R2-B, 실측).
   `roundStartedAt` 은 timeline 을 읽으므로 `reap run back` 경로는 닫혔지만
   validation 안에서 고치면 — **이 세대가 실제로 한 것** — 라운드1 판정이 라운드2 를 대신한다.
   **닫으면 게이트가 된다**(REAP 이 코드 변경을 알 수 없으므로 "다시 검토받아라"가 된다).
   완화는 렌더된 `recordedAt` 하나.
3. **라운드 3 를 돌리지 않았다.** 수렴 판단이 아니라 예산이다. 이 세대 자신이 "직전 라운드
   수정 안에 결함"을 두 번 관측했으므로 세 번째를 기대하는 것이 합리적이다.
   `report-evaluator --severity low` 로 기록했다.
4. **evaluator 가 실제로 CLI 를 호출하는지를 보는 자동 검사는 없다.** prompt 에 지시가
   실렸는지는 e2e 가 보지만 그것을 따르는지는 모델 행동이고, 이 저장소에 하네스가 없다.

## Adapt

### genome 변경 1건 — 늘리지 않고 **교체**했다

`evolution.md § 독립 검토는 한 번으로 수렴하지 않는다` 의 마지막 항목을 갈아끼웠다.
gen-099 가 적은 *"evaluator 가 회신하지 않으면 `report-evaluator` 로 남겨라"* 는
**전제가 틀렸다** — 회신이 안 오는 것이 예외가 아니라 **기본값**이다. 새 항목은
"회신을 기다리지 마라, state 를 polling 하라"를 지시한다.

`evolution.md` 297 → **299**/300 (2줄 증가, 항목 하나를 대체). `application.md` 249/250 변동 없음.
**사용자가 "genome 을 또 한 줄 늘리는 것은 이미 실패한 방법"이라 했으므로 아래 § 판정의
교훈은 genome 에 넣지 않았다.**

### 판정 — artifact 의 `[실행]` 수치가 낡았는지 기계가 물을 수 있는가 (사용자 지시)

**세 갈래로 갈린다. 하나는 가능하고 싸다. 하나는 가능하나 비싸다. 하나는 불가능하다.**

| | 질문 | 기계가 답할 수 있는가 | 비용 |
|---|---|---|---|
| **A** | *이 측정이 내 마지막 편집보다 앞서는가* | **예** | 거의 0 |
| **B** | *이 수치가 지금도 맞는가* | 예 | 스위트 재실행 (분 단위) |
| **C** | *이 인용 문자열이 아직 존재하는가* | **아니오** | — |

**A 가 실제 결함이고, 답할 수 있다.** 이 세대가 걸린 것은 "806 이 틀렸다"가 아니라
**"806 을 잰 뒤에 코드를 고쳤고 다시 재지 않았다"** 이다. 그것은 재실행 없이 답한다 —
`[실행]` 을 쓸 때 **그 시점의 worktree 상태를 함께 박으면** 된다:

```
| unit | `npm run test:unit` | **818 pass / 0 fail** | [실행 @ 4f2a1c9+dirty:a31e] |
```

`completion --phase commit` 이 그 표식을 걷어 현재 worktree 해시와 대조하고,
다르면 **"이 측정은 지금 커밋하려는 트리를 재지 않았다"** 를 경고한다. 게이트가 아니라 경고다 —
정당하게 낡는 경우가 있다(adapt 가 genome 을 고치는 것은 설계된 순서이며 gen-099 가 이미
그 경우를 손으로 주석했다).

**B 는 가능하지만 만들면 안 된다.** 커밋 직전에 스위트를 다시 돌리는 것은 A 가 공짜로 주는
답을 분 단위 비용으로 사는 것이고, 그 비용은 사람이 검사를 끄게 만든다
(genome: *"끄는 스위치를 두지 않는다 — 비용이 문제면 실행 시점을 옮겨라"*).

**C 는 불가능하다, 그리고 그 이유가 중요하다.** 이 세대가 낡힌 것 중 하나는 수치가 아니라
**인용문**이었다 — `"[clean] (validation)"` 이 timestamp 추가로 어떤 테스트에도 없게 됐다.
기계가 이것을 잡으려면 *그 문자열이 무엇을 인용한 것인지* 알아야 하는데, artifact 는
그것을 선언하지 않고 선언하게 만들면 **모든 인용에 출처를 달라는 지시**가 되어 —
바로 그 "지시문으로는 안 막힌다"로 되돌아간다. **A 가 이것도 부분적으로 덮는다**:
인용이 낡는 것도 편집 후에 일어나므로, "재지 않았다" 경고가 재검토를 유발한다.

**결론: A 를 만들 값어치가 있다. B 는 만들면 안 된다. C 는 A 로 간접 커버한다.**
아래 hints 1.

### 이번 세대에 genome 을 더 고치지 않은 이유

`fix --check` 는 error 0 / warning 2(gen-052 상속분)로 baseline 그대로다.
`application.md` 는 `EvaluatorRun` 을 서술할 자리가 아니다 — 그것은 **현재 상태**이므로
`environment/summary.md § Types` 와 `source-map.md` 가 가져갔다 (genome vs environment 경계).

## Next Generation Hints

> genome Critical Rule 6 — 여기 적힌 것 중 무엇이 backlog 가 될지는 인간이 정한다.
> adapt phase 에서 `reap make backlog` 를 실행하지 않았다.

### 1. (사용자가 요청한 판정의 결론) `[실행]` 측정에 worktree 지문을 박고 commit 이 대조한다

위 § 판정 A. 설계는 이미 확정적이다:

- `[실행]` 표기 옆에 측정 시점의 지문 — `git rev-parse HEAD` + tracked 파일 diff 해시
- `completion --phase commit` 이 artifact 에서 지문을 걷어 현재와 대조, 다르면 **경고**
- **게이트 아님.** adapt 가 genome 을 고치는 것은 설계된 순서이고 정당하게 낡는다
- 자체 negative: 지문을 박고 파일 하나를 고친 뒤 경고가 나오는지 확인 (**이 세대가 실제로
  한 실수를 재현하는 것**이 그 검사의 유효성 근거다)

**주의**: 지문 형식을 artifact 템플릿과 phase prompt 양쪽이 알게 되면 carrier 가 하나 는다.
가능하면 REAP 이 지문을 **써주고**(`reap stamp` 같은 것) 사람이 형식을 몰라도 되게 하는 편이
낫다 — genome 의 *"표식보다 공유가 낫다"*.

### 2. evaluator 회신 경로 — 전송 계층을 보는 검사가 하나도 없다

이 세대의 E1~E3 은 learning 의 **수동 실험**이고 자동 회귀 검사가 아니다.
회신이 다시 도달하기 시작해도, 다시 끊겨도 아무 검사가 모른다.
가능한 형태: `check-agent-integration.sh`(층2, ~$0.25)에 절을 하나 더해 —
agent 를 띄워 파일을 쓰게 하고(도달 확인) 회신을 받는지(회신 확인) **둘을 따로** 판정한다.
**이 세대의 실험이 그대로 스크립트가 된다.** 값어치는 "고칠 수 있어서"가 아니라
**"언제 고쳐졌는지 알 수 있어서"** 다.

### 3. stage 재진입 없는 재작업 — R2-B, 닫지 않았다

`roundStartedAt` 은 timeline 을 읽으므로 `reap run back` 경로만 닫힌다.
**닫으면 게이트가 된다.** 다만 hints 1 의 worktree 지문이 있으면 이것도 같은 방식으로
답할 수 있다 — 판정 시점의 지문과 commit 시점의 지문을 비교하면
"이 판정은 지금 코드를 보지 않았다"가 나온다. **1 과 3 은 같은 기계장치다.**

### 4. `reap-evolve` 에게도 자기보고 경로가 필요한가

이 세대는 `reap-evaluate` 만 고쳤다. `/reap.evolve` 의 autoSubagent 는 `reap-evolve` 를
띄우는데, **그 회신도 같은 이유로 유실된다.** 이 세대가 lifecycle 을 직접 돌린 것은
그래서이기도 하다. `reap-evolve` 는 `current.yml` 을 통해 이미 진행 상태를 남기므로
증상이 덜하지만, **"subagent 가 끝났는지 호출자가 아는 수단"** 은 여전히 없다.
plugin 전환(main milestone)이 배포 표면을 바꾸므로 그 뒤에 판단하는 것이 맞다.

### 5. 이월 — gen-099 hints 중 미처리

`e2e flake 이름 잡기`(hints 2, 이 세대는 `tee` 를 썼고 flake 재현 없음),
`shipped reap-guide.md 가 없는 스크립트를 가리킨다`(hints 3, plugin 전환 후),
`carrier 형식 변경이 기존 프로젝트에 도달하지 않았다`(hints 4, v0.18 릴리즈 세대),
`bash 게이트용 테스트 하네스`(hints 5) — 전부 그대로 유효하다.

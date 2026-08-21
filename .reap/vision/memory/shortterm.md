# Shortterm Memory

## 세션 요약 (gen-100, 2026-08-22)

### evaluator 무응답의 원인 — agent 가 아니라 **회신 경로**였다

learning 에서 실험 셋으로 갈랐다. `reap-evaluate` 는 spawn 되고, 메시지를 받고, 지시를
**13초 만에 실행한다**(Bash 로 파일을 쓰게 해서 확인). 도달하지 않는 것은
**agent → 호출자 방향의 회신뿐**이다. gen-099 의 evaluator 는 놀고 있던 게 아니라
내내 돌고 있었다 — 그 세대의 관측은 정확했고 **해석이 틀렸다.**

**전송 계층은 클라이언트의 것이고 REAP 이 고칠 수 없다.** 고친 것은 REAP 안의 셋:
fallback 이 흔적을 남기지 말라고 **명시적으로 지시**하던 줄 · `--severity none` 이 no-op 이라
"검토받고 clean"과 "검토 못 받음"이 바이트 동일하던 것 · 판정이 **회신 경로에만** 매달려
있던 것. 셋째가 근본 대응이다 — evaluator 는 `Bash` 를 갖고 있으니 스스로 CLI 를 친다.

**그러려면 evaluator 의 HARD-GATE 에 예외를 뚫어야 했다** — `"You MUST NOT run reap run"`
이 유일한 생존 경로를 막고 있었다. 지시만 추가했다면 금지 쪽이 이겼을 것이다.

### 그리고 그 fix 로 **실제로 독립 검토를 2라운드 받았다**

두 라운드 다 **회신은 오지 않았다.** 판정은 두 번 다 `current.yml` 에 남았다.
같은 환경, 같은 침묵, 다른 결과 — 이것이 이 세대의 유일하게 결정적인 증거다.

지적 6건 전부 진짜였고 전부 처리했다. **라운드2 의 셋은 전부 라운드1 의 수정 안에 있었다**
(genome 이 세 세대 연속 관측한 것의 네 번째 성립). 그중 하나는 **내 04-validation 의
`[실행]` 수치가 라운드1 수정으로 낡은 것** — gen-095 가 정확히 그렇게 걸렸고 longterm 에
적혀 있는데도 반복했다.

### 지금 상태

- unit **818** / e2e **391** / scenario **62**, 전부 0 fail (신규 39 케이스)
- typecheck · build · self-diagnosis(8절) · `--check`(80 marker/14 id) · `--orphans` 통과
- `fix --check` 0 error / 2 warning (gen-052 상속분)
- negative **16회 전부 red** 확인
- 미푸시 커밋 수는 `git log --oneline origin/main..HEAD | wc -l` 로 볼 것. push 는 사용자 확인 후

### 다음 세션이 알아야 할 것

- **`evaluator: true` 인데 판정이 없으면 이제 `current.yml` 에 `not-reported` 가 남는다.**
  fitness prompt 가 그 사실을 사람에게 말한다. **게이트가 아니다** — 전이는 그대로다
- **evaluator 를 띄울 때 회신을 기다리지 마라.** 오지 않는다. `current.yml` 의
  `evaluatorRuns`/`evaluatorConcerns` 를 폴링하는 것이 맞는 방법이다
  (`until grep -q evaluatorRuns .reap/life/current.yml`)
- **닫지 못한 것 하나**: stage 재진입 없이 validation 안에서 제자리 수정하면 라운드1 판정이
  라운드2 를 대신한다. 렌더된 `recordedAt` 이 유일한 완화다. 닫으려면 게이트가 되므로
  닫지 않았다 (04-validation § 6)
- **라운드 3 를 돌리지 않았다** — 수렴 판단이 아니라 예산이다. `report-evaluator --severity low`
  로 기록했다

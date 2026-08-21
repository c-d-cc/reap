# Midterm Memory

> Ongoing multi-generation tracks. A track that has no next step belongs in lineage, not here.
>
> **계획에 속하는 것은 여기가 아니라 `vision/milestones/` 다** (gen-097). 무엇을 언제 어떤
> 순서로, 무엇이 범위 밖인지, 얼마나 남았는지는 milestone 파일이 갖는다. 여기는 계획에 담기지
> 않는 진행 맥락만 — 보류된 판단, 합의된 방향, 아직 milestone 이 없는 트랙.

## 릴리즈 — 0.17.7 발행 완료, 검토 두 건이 남았다

0.17.7 은 npm 에 발행됐고 reap.cc 도 배포됐다(gen-088~096 + 문서 정리). 상세는 lineage 가 소유한다.

**남은 것 둘 — 둘 다 "검토를 안 받았다"이지 결함이 아니다**:
1. **층2 게이트**(`check-agent-integration.sh`, ~$0.25) 재실행. gen-091 이후 소스가 계속 바뀌었다
2. **gen-096 의 4차 수정분(F1~F6)이 검토받지 않았다.** 그 세대에서 "직전 라운드의 수정 안에 결함이
   있다"가 네 번 연속 성립했으므로 다섯 번째를 기대하는 것이 합리적이다

**발행 문서 수정 규칙 (사용자 승인, 2026-08-21)**: 예외 기준은 *역사성*이 아니라 **실행 가능성**이다 —
따라 하면 실패하는 지시는 고치되 버전 항목은 남긴다.

**release note 작성 규칙 (사용자 지시, 2026-08-21)**: docs 사이트 관련 설명은 넣지 않는다.
실제 사용자에게 의미가 있는 것만 쓴다. 사용자에게 달라진 것이 전혀 없으면
`<!-- no-user-facing-change -->` 로 선언하고 항목을 만들지 않는다.

## 0.18 — milestone 이 생겼으므로 계획은 milestone 파일로 옮긴다

gen-097 이 milestone 을 도입했다. **다음 할 일은 v0.18 milestone 을 만들어 그 계획을 담는 것**이며,
`vision/design/backlogs_v0.18/` 6건이 그 generation 목록의 원본이다.

**순서** (`plugin 전환` 이 앞인 이유는 새 skill 2개가 어느 배포 구조에서 태어날지 먼저 확정돼야
하기 때문): plugin 전환 → **지식 축 경계 통합 설계(milestone·plan·idea·memory 4축)** →
memory 재설계 + plan·idea 자리 → interview → `/reap.plan` → 문서.

경계 설계를 한 세대에 몰아넣는 이유는 따로 하면 genome·reap-guide·5 로케일·migration note 에서
경계가 어긋나기 때문이다. gen-097 이 4축 중 하나(milestone↔midterm)를 이미 그었다.

**별도 브랜치로 간다** — 중간 상태가 main 에 있으면 사용자가 반쯤 바뀐 구조를 받는다.
gen-097(milestone)은 배포 형태와 무관하므로 main 에 있고, plugin 브랜치가 그것을 상속한다.

**미결 셋**: (a) **A/B 배포 형태 확정** — `command` source 발견(2026-08-20)이 판단을 뒤집는다.
명령이 세션마다 재실행되므로 `npm i -g` 한 번으로 CLI 와 plugin 이 동시에 갱신되고, 따라서
auto-update 가 plugin 갱신의 유일한 경로가 된다. 근거·측정은 `vision/design/plugin-distribution.md`
§ 4 가 소유하며 **미독 절 3개**(결정 대기 / 미측정 / plugin cache)가 남아 있다.
(b) **update 관련 backlog 4건 삭제 여부** — (a)에 종속. (c) migration note 를 건별로 쓸지 한 번에 쓸지.

**v0.18 릴리즈 세대가 반드시 해야 하는 것 둘** (gen-097 이 의도적으로 미룬 것):
`src/templates/migration/v0.18.0.md` (기존 프로젝트에 규칙이 도달하는 유일한 채널) ·
**docs 5 로케일에 milestone 문서**. 후자는 미발행 기능을 사이트에 띄우지 않으려고 미뤘다.

## 0.17 잔여 backlog 9건 — plugin 전환 이후에 재검토

`vision/design/backlogs_v0.17_residual/` 로 이관했다(README 가 항목별 재검토 질문과 소멸 후보
여부를 갖는다). **7건이 REAP 자기 기계장치에 대한 것**이고, plugin 전환 후 어느 것이 살아남는지
판정하기 전에 고치면 헛일이 된다.

## Embryo → Normal transition

전환 조건은 오래전에 충족됐으나 사용자 판단(2026-03-26)으로 **embryo 유지** — REAP 자신이
self-evolving 중이라 예기치 못한 genome 변경이 더 있을 수 있다. gen-097 이 그 판단의 값을 실증했다
(milestone 도입이 genome 3파일을 직접 고쳤다). 다음 판단은 사용자가 명시 검토할 때.

## Evaluator Agent 트랙 — Vision/Goal 위임만 남음

**남은 1 항목**: adapt phase 에서 evaluator 가 gap 분석 + 다음 goal 추천. 트랙의 마지막 큰 항목이며
`vision/design/evaluator-agent.md` 의 잔여 절이다. **gen-097 이 이 항목의 성격을 바꿨다** —
milestone 이 있으면 다음 goal 은 추천이 아니라 계획에서 나온다. 위임할 것이 무엇으로 남는지
다시 볼 것.

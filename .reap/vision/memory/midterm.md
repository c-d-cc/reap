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
따라 하면 실패하는 지시는 고치되 버전 항목은 남긴다. (release note 작성 규칙은
`.claude/commands/reapdev.versionBump.md` 가 소유한다.)

## 0.18 — milestone 둘로 나뉘었다. 계획은 milestone 파일이 갖는다

**계획 자체를 여기 옮겨 적지 않는다** — `vision/milestones/` 두 파일이 소유한다.
여기는 그 파일에 담기지 않는 것만.

- `v018-배포-형태를-plugin-으로` (**main**) — 리서치 → 구현(별도 브랜치) → 릴리즈
- `v018-지식-축-정리` — ~~참조·ID 체계~~(gen-098) → ~~carrier hash8~~(gen-099) → **경계 설계(3축)**
  → memory → idea → interview

**나눈 이유**: 완료 조건이 서로를 뒷받침하지 않고(memory 가 flat 인 것은 REAP 이 한 도구로 보이는
증거가 아니다), goal 이 다르고, 브랜치가 다르다. **`plan` 을 빼자 둘이 순차가 아니라 병렬이 됐다** —
plugin 에 의존하는 것은 `interview` 하나뿐이다.

**`.reap/plan/` 과 `/reap.plan` 은 v0.18 에서 제외**(사용자, 2026-08-21).
`vision/design/backlogs_plan-track/` 이 두 backlog 와 재검토 포인트를 갖는다.
그래서 경계 설계는 **4축이 아니라 3축**이다.

**참조 ID 체계는 gen-098 이 끝냈다** — `.reap/sequence/<type>.md` append-only, milestone→goal 이
첫 소비자. **`ds-`·`idea-`·`mem-` 은 prefix 만 예약**됐고 실제 부여는 소비자가 생기는 세대가 한다
(design 은 frontmatter 도 읽는 코드도 없어 지금 부여하면 닻을 못 내린다).

**미결 둘**: (a) **A/B 배포 형태 확정** — `command` source 발견(2026-08-20)이 판단을 뒤집는다.
명령이 세션마다 재실행되므로 `npm i -g` 한 번으로 CLI 와 plugin 이 동시에 갱신되고, 따라서
auto-update 가 plugin 갱신의 유일한 경로가 된다. `vision/design/plugin-distribution.md` § 4 가
근거를 소유하며 **미독 절 3개**(결정 대기 / 미측정 / plugin cache)가 남아 있다.
(b) **update 관련 backlog 4건 삭제 여부** — (a)에 종속.

## 0.17 잔여 backlog 8건 — plugin 전환 이후에 재검토

`vision/design/backlogs_v0.17_residual/` + README(항목별 재검토 질문·소멸 후보 여부).
**대부분이 REAP 자기 기계장치**라, plugin 전환 후 무엇이 살아남는지 판정하기 전에 고치면 헛일이 된다.
gen-099 가 `list-carriers.sh 산문 오탐` 을 해소해 **8건**이다 — carrier 형식을 바꾸느라 어차피
같은 파일을 만졌기 때문이며, 그것이 곁다리 처리의 조건이다(따로 했으면 형식 검사가 그 오탐을
경고에서 에러로 승격시켰을 것이다).

## Embryo → Normal transition

전환 조건은 오래전에 충족됐으나 사용자 판단(2026-03-26)으로 **embryo 유지** — REAP 자신이
self-evolving 중이라 예기치 못한 genome 변경이 더 있을 수 있다. gen-097 이 그 판단의 값을 실증했다
(milestone 도입이 genome 3파일을 직접 고쳤다). 다음 판단은 사용자가 명시 검토할 때.

## Evaluator Agent 트랙 — Vision/Goal 위임만 남음

**남은 1 항목**: adapt phase 에서 evaluator 가 gap 분석 + 다음 goal 추천. 트랙의 마지막 큰 항목이며
`vision/design/evaluator-agent.md` 의 잔여 절이다. **gen-097 이 이 항목의 성격을 바꿨다** —
milestone 이 있으면 다음 goal 은 추천이 아니라 계획에서 나온다. 위임할 것이 무엇으로 남는지
다시 볼 것.

---
id: gen-0031-exec
slug: carve-milestone
type: exec
backlog: bk-1ebbd3
title: carve-milestone skill을 만든다
startedAt: 2026-08-23T04:41:32Z
startCommit: 67a8b1d
status: closed
closedAt: 2026-08-23T04:44:47Z
endCommit: 24803f4
---

## Intent

`bk-1ebbd3`을 소비한다. `carve-milestone` skill을 만든다. milestone을 넷 자르며 배운 것이 **어디에도 안 적혀 있고 세대 기록과 함께 archive로 내려갔다** — `ms-003`이 세운 규칙대로면 그것이 규율할 자리가 이 skill이다.

## Outcome

**`plugin/skills/carve-milestone/SKILL.md`가 생겼다. skill은 4종이다.**

담은 것은 넷을 자르며 실제로 겪은 것들이다.

| 절 | 근거가 된 경험 |
|---|---|
| **자르기 전에 전제를 실제 흔적에 대본다** | `gen-0022-plan`. 로드맵이 `build-context`를 적었는데 그것이 관리할 문서가 21세대 동안 0바이트였다. `wc -l` 한 줄이면 알 수 있었다 |
| **크기 — task 넷 안팎, 세대 여섯에서 열** | fitness 세 번이 같은 답("이 정도로 유지")을 줬다. 실측 열·아홉·여섯 |
| **Exit Criteria는 사람이 판정할 수 있는 상태로** | 정량 지표가 없다는 spec의 전제 |
| **Out of Scope가 안쪽만큼 중요** | `ms-003`이 `doctor`·`seq`를 명시적으로 밖에 둔 것이 범위 번짐을 막았다 |
| **fitness 질문을 자를 때 미리 쓴다** | 넷 다 그렇게 했다. `ms-001`은 닫을 때 fitness를 못 받아 다음 plan 세대에서 뒤늦게 받았다 |
| **자른 것은 계획에서 내린다** | `gen-0022-plan`이 증분 2를 내리고 왜 바뀌었는지를 머리말에 남긴 것 |
| **부르지 않는 경우** | `ms-004`의 시작이 그 잘못이었다 — backlog 항목 하나로 충분한 일에 milestone을 만들려 했다 |
| **종료 절차** | fitness → `cleanup` → `mark milestone --closed`. 다섯 번 돌린 순서 |

## 중복을 하나 걷어냈다

**`complete`가 종료 절차 전체를 담고 있었다.** `06-agent.md:111`이 그것을 `carve-milestone`의 몫이라고 이미 적어뒀으므로, `complete`는 **가리키기만** 하도록 줄였다. 두 곳에 있으면 어긋난다.

`06-agent.md`의 skill 표도 실제 내용에 맞췄다 — 전제 검증이 첫 동작이라는 것과, `complete`가 옮겨 적지 않는다는 것.

## 검증

- `bun test` 112 · `hook.test.sh` 통과 · `build` 정상
- 플러그인 재설치 후 **실제 새 세션에서 `reap:carve-milestone`이 뜨는 것을 확인**했다. skill 4종
- skill 안의 상대 링크 셋(`evolve`·`cleanup`·`record-vocabulary`)이 전부 실재한다

## 남은 것

`bk-21931c` — `make milestone`이 focus를 안 붙여 자른 직후 상태 줄에 안 보인다. skill이 "`--focus`는 따로 쳐야 한다"고 적어 **우회는 문서화됐지만 마찰은 그대로다.**

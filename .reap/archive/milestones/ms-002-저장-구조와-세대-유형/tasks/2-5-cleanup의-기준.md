# Task 2.5 — `cleanup`의 기준을 참고 가치로 바꾼다

규범은 [저장 구조](../../../../../docs/superpowers/specs/reap/03-storage.md)의 **"`life/generations/`는 작업 세트다"** 절이 소유한다. 그 절을 먼저 읽는다. `gen-0019-plan`이 썼다.

**코드는 바뀌지 않는다.** `mark generation --closed`도 `--archived`도 지금 동작이 맞다. 바뀌는 것은 **문서가 말하는 기준**이다.

## 왜 이 task가 생겼나

`gen-0016-exec`가 만든 `cleanup`은 **milestone 소속**을 기준으로 삼았다 — "이 milestone에 속한 닫힌 exec가 기본, plan·fix는 사람 판단, 애매하면 남긴다."

그러면 plan 세대는 영영 안 옮겨진다. `gen-0018-plan`이 그것을 "닫히는 즉시 archive"로 고치려 했는데 **그것도 틀렸다** — `life/generations/`는 열린 것만 담는 곳이 아니다. 근거는 `gen-0019-plan`의 기록에 있다.

## 바뀌는 것

**`plugin/skills/cleanup/SKILL.md`** — 판단 기준을 바꾼다.

- **묻는 것은 하나다: "이 세대를 앞으로 볼 일이 있는가."** milestone 소속이 아니다
- plan 세대 — 그 plan이 **실제로 반영됐으면** 끝난 것이니 내린다. 아직 반영 중이면 남긴다
- exec 세대 — 그 일이 milestone과 함께 끝났으면 내린다
- **아직 살아 있는 결정이나 막다른 길을 담고 있으면 남긴다.** 그것이 `life/generations/`가 존재하는 이유다
- 열린 세대는 옮기지 않는다 (기존 그대로)
- **`life/generations/`가 작업 세트라는 것을 skill이 말해야 한다.** 왜 훑는지 모르면 기준도 못 쓴다

**`src/templates/map.md`와 `.reap/map.md`** — `life/`를 "하는 중"이라고 설명한 부분을 고친다. 둘은 **byte-identical해야 한다**(`gen-0017-exec`가 그렇게 만들었다).

**`plugin/skills/complete/SKILL.md`** — `cleanup`을 가리키는 문장이 새 기준과 어긋나지 않는지 본다.

## 무엇이 참이어야 하는가

- 살아 있는 문서 어디에도 "milestone에 속한 것을 옮긴다"가 남지 않는다
- `map.md`가 `life/`를 "열린 것만 있는 곳"으로 읽히게 하지 않는다
- `src/templates/map.md`와 `.reap/map.md`가 같다
- 기존 테스트가 전부 그대로 통과한다 (동작 변경이 없으므로)

## 하지 않는 것

- **spec을 고치지 마라.** `gen-0019-plan`이 이미 고쳤다
- **코드를 고치지 마라.** `--closed`·`--archived`·`markMilestone` 전부 지금이 맞다
- **역사적 기록을 고치지 마라.** `archive/generations/`의 옛 세대 기록과 `gen-0018-plan`의 내용은 그때의 사실이다

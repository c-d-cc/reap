---
id: gen-0018-plan
slug: 닫히는-즉시-archive
type: plan
title: 닫히는 즉시 archive로 — 판단을 소멸시킨다
startedAt: 2026-08-23T01:47:56Z
startCommit: 56225aa
status: closed
closedAt: 2026-08-23T01:49:52Z
endCommit: ba331b6
---

## Intent

**`mark generation --closed`가 파일을 `archive/generations/`로 옮긴다.** `life/generations/`에는 열린 것만 남는다.

사람이 물었다 — "milestone이 닫힐 때 관련된 exec만 옮기는 거라면 `life/generations`에 있는 게 다 archive 될 거라 기대해도 되나?" 답은 아니오였다. plan·fix는 milestone 필드가 없어 `cleanup`이 기계적으로 관련을 못 정하고, "애매하면 남긴다"가 규칙이라 **닫힌 plan 세대가 영영 `life/`에 쌓인다.** 지금 이 리포만 봐도 닫힌 세대 11개가 전부 `life/`에 있다.

**이 변경은 판단을 옮기는 게 아니라 소멸시킨다.** "어느 세대가 이 milestone과 관련된 것인가"를 아무도 안 물어도 되고, 그러면 plan·fix가 예외가 되는 문제도 함께 사라진다. 그리고 파일 배치는 원래 spec이 **확정 층(CLI)**의 일로 정해둔 것이다 — 지금 구조가 그것을 판단 층으로 잘못 올려놨다.

**끝나면:** spec 넷이 뒤집혀 있고, ms-002에 그것을 구현할 task가 있다. **구현은 하지 않는다.**

## References

- `.reap/life/backlog/bk-15780b-milestone-없는-세대의-archive-경로.md` — 이 문제를 남긴 backlog
- ps-4f2a91 `03-storage.md`의 "옮기는 시점을 도구가 정하지 않는다" — 이번에 뒤집히는 문장
- `.reap/archive/generations/gen-0016-exec-fix-유형과-cleanup-skill.md` — `cleanup`을 만든 세대

## Outcome

spec 넷을 뒤집었다.

- **`03-storage.md`** — "옮기는 시점을 도구가 정하지 않는다"를 **"세대는 닫히는 즉시 내려간다"**로 바꾸고, **왜 여기에 판단이 없는지**를 적었다. "어느 세대가 이 milestone과 관련된 것인가"는 애초에 답이 없는 질문이다 — plan은 milestone에 속하지 않고 fix는 무관하므로 milestone을 기준 삼는 한 그 둘은 매번 예외가 되고 결국 아무 데도 못 간다. **닫혔는가만 물으면 예외가 사라지고, 그것은 판단이 아니라 사실이다.**
- **`02-flow.md`** — "정리" 행 삭제, "세대 닫기"의 남는 것에 이동 추가
- **`04-commands.md`** — `--archived` 삭제, `--closed`에 이동 명시
- **`06-agent.md`** — skill 8종 → **7종**, `cleanup` 행 삭제

ms-002에 **Task 2.5**를 더했다. 계획에 없던 다섯 번째다.

## Dead Ends — 두 세대 만에 되돌린 것

`gen-0016-exec`가 만든 `cleanup` skill과 `mark generation --archived`를 지운다. **만든 지 두 세대밖에 안 됐다.**

낭비로 보이지만 그렇지 않다. `cleanup`을 실제로 만들어 놓고 나서야 **"이 milestone과 관련된 세대"라는 개념이 성립하지 않는다**는 것이 드러났다. skill 문서에 "plan과 fix는 사람이 판단할 일이다… 애매하면 옮기지 않는다"라고 쓰는 순간, 그것이 곧 "plan은 영영 안 옮겨진다"는 뜻이라는 게 보였다. **쓰기 전에는 안 보였다.**

사람이 물어서 드러났다 — "그럼 milestone이 끝날 때 `life/generations`에 있는 게 다 archive 될 거라고 기대해도 되나?" 답이 "아니오"인 순간 설계가 틀린 것이었다.

**남겨두면 archive로 가는 길이 둘이 되고, 둘은 언젠가 어긋난다.**

## Notes

이 세대는 `--archived`를 없애기로 정하면서 **`doctor`가 나중에 "닫혔는데 `life/`에 있는 세대"를 보고할 때 고칠 수단이 없어지는 것**을 알고 있다. 그때 필요가 실제로 관측되면 그때 만든다 — 지금은 REAP를 쓰는 프로젝트가 자기 자신뿐이고, 마이그레이션은 일회성이다.

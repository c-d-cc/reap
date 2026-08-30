---
id: gen-0033-fix
slug: ms-005-보정
type: fix
title: ms-005를 backlog로 되돌리고 번호를 보정한다
startedAt: 2026-08-23T04:58:41Z
startCommit: 9430702
status: closed
closedAt: 2026-08-23T05:02:21Z
endCommit: bfe13f0
---

## Intent

**`ms-005`(carve-milestone skill)는 milestone이 아니었어야 한다.** 세대 하나로 끝났고 task도 하나였다 — backlog 항목 하나면 충분했다.

**되돌아갈 곳은 내가 방금 쓴 skill 자신이다.** `carve-milestone`의 크기 절이 이미 *"task가 여덟이면 둘로 자를 것이 하나로 묶인 것이고, 하나면 backlog 항목이었어야 할 것이다"*라고 적어뒀는데, **그것을 쓴 세대가 그 규칙을 어기며 잘렸다.**

사람이 규칙을 더 날카롭게 못 박았다 — **단일 세대로 끝나는 작업을 milestone으로 만들지 않는다.** 그리고 **이미 만든 artifact의 sequence를 바꿔 보정하는 것을 허용했다.**

**무엇이 되면 끝인가:** `ms-005`가 backlog 항목이 되고, `ms-006`~`ms-009`가 `ms-005`~`ms-008`로 당겨지고, 모든 참조가 맞고, skill이 이 규칙을 다시 못 박는다.

## References

- 되돌릴 대상: `plugin/skills/carve-milestone/SKILL.md`의 "크기" 절
- `sequence/milestone.md` — append-only 규칙의 예외. 사람이 허용했고 그 사실을 레지스트리에 남긴다

## Outcome

**`ms-005`(carve-milestone skill)가 backlog 항목 `bk-1ebbd3`이 됐고, 열려 있던 넷이 한 칸씩 당겨졌다.**

| 옛 | 새 |
|---|---|
| `ms-005` carve-milestone skill | **`bk-1ebbd3`** (consumed by `gen-0031-exec`) |
| `ms-006` plan 축을 완성한다 | `ms-005` |
| `ms-007` 위생 — doctor와 seq | `ms-006` |
| `ms-008` interview | `ms-007` |
| `ms-009` orchestrate | `ms-008` |

**append-only 규칙에 예외를 뒀다.** 사람이 허용했고, 그 사실과 매핑을 `sequence/milestone.md`의 주석에 남겼다 — `sequence/generation.md`가 id 계열을 합칠 때 한 것과 같은 방식이다. **커밋 메시지는 다시 쓰지 않으므로**(`lessons.md`) `feat: ms-005를 자른다` 같은 옛 커밋이 영영 옛 뜻을 가리키고, 레지스트리 주석이 그것을 푸는 유일한 곳이다.

`gen-0031-exec`의 frontmatter도 `milestone: ms-005`에서 **`backlog: bk-1ebbd3`**으로 바뀌었다. 근거가 milestone이 아니라 backlog였던 것이 이제 기록에 맞다.

## 규칙을 skill에 못 박았다

`carve-milestone`의 크기 절이 원래 이렇게 적혀 있었다 — *"task가 여덟이면 둘로 자를 것이 하나로 묶인 것이고, 하나면 backlog 항목이었어야 할 것이다."* **신호로만 적혀 있었고, 그 문장을 쓴 세대가 그것을 어기며 잘렸다.**

그래서 아래쪽을 **신호에서 규칙으로** 올렸다.

> **단일 세대로 끝나는 일은 milestone이 아니다.** 자르기 전에 "이게 몇 세대짜리인가"를 먼저 답한다 — 하나라고 답이 나오면 `make backlog`로 항목을 만들고 `--backlog` 근거로 연다.

그리고 **이 규칙이 어떻게 생겼는지도 함께 적었다.** 기준을 쓰면서 그 기준을 어긴 사례이므로, 근거 없이 규칙만 두면 다음에 또 신호로 읽힌다.

## 함께 드러난 것

**`focus`가 붙은 milestone이 하나도 없어져 상태 줄에서 milestone 줄이 통째로 사라졌다.** 옛 `ms-005`만 `focus: true`였고 그것을 지웠기 때문이다. 열린 milestone이 넷인데 새 세션이 하나도 못 보는 상태였다 — `bk-21931c`(`make milestone`이 focus를 안 붙인다)가 **다른 방향에서 한 번 더 나타난 것**이다. `ms-005`에 focus를 붙여 풀었다.

## 검증

- `ms-009`가 남은 자리는 셋뿐이고 전부 **의도된 이력**이다(레지스트리 매핑 주석 · 이 기록)
- `bun test` 112 · `hook.test.sh` 통과 · `build` 정상 · 플러그인 캐시본 차이 없음
- 옛 `ms-005`를 가리키던 참조 아홉을 개별로 정정했다 — 기계적 치환으로는 **번호가 당겨진 것과 뜻이 바뀐 것을 구별할 수 없어서** 하나씩 봤다

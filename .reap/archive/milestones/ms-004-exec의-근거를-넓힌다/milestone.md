---
id: ms-004
slug: exec의-근거를-넓힌다
title: exec의 근거를 넓힌다 — milestone 또는 backlog
refs:
  - ps-4f2a91:02-flow.md
status: closed
openedAt: 2026-08-23T04:11:57Z
closedAt: 2026-08-23T04:31:24Z
---

## Background

**사람이 물어서 드러났다.** backlog 항목 둘(`bk-c92489`·`bk-ce5006`)을 소비하려는데 그것이 새 명령을 짓는 일이라 exec이고, `evolve`는 "exec은 반드시 milestone에 속한다"고 한다. 그래서 milestone을 자르려다 사람이 물었다 — *"이미 backlog 있는걸 소비하는데 왜 milestone 을 만드는거지?"*

물음이 맞았다. **backlog 항목은 이미 경계·근거·손댈 곳·정해야 할 것을 담고 있다.** milestone을 만들면 그것을 한 번 더 적게 되고, 그것은 방금 `ms-003`이 `decisions.md`를 없앤 이유("두 곳에 있으면 어긋난다")와 같은 잘못이다.

**사람이 정했다: `evolve`는 근거가 있으면 된다 — milestone이든 backlog든.**

원래 규칙의 목적을 다시 보면 이 확장이 그것을 깨지 않는다. milestone이 필수인 이유는 *"실행은 경계 없이 떠돌지 않는다"*였다(`02-flow.md`). **경계를 주는 것이 milestone뿐이라고 전제한 것이 좁았다** — backlog 항목도 경계다. 하나의 항목이 하나의 일을 정의하고, 그것을 소비하면 끝난다.

## 왜 이것이 milestone을 갖는가

이것은 backlog 소비가 아니라 **REAP의 축 규칙 자체를 바꾸는 일**이다. 새 의도이고 근거가 될 backlog 항목이 없다.

부트스트랩 순서도 걸린다 — `--backlog`를 만드는 첫 세대는 그 근거를 쓸 수 없다. 그래서 이 milestone 하나가 규칙을 세우고, **그다음부터 backlog 항목은 milestone 없이 소비된다.** `bk-c92489`·`bk-ce5006`이 그 첫 실행이다.

## Exit Criteria

1. **`reap make generation --backlog <bk-id>`가 exec 세대를 연다.** frontmatter가 `backlog: <bk-id>`를 담고, `--milestone`과 함께 줄 수 없다
2. **`evolve`가 근거를 둘로 설명한다.** 어느 것을 근거로 삼을지의 판단 기준이 skill에 있다
3. **spec이 바뀐 규칙을 담는다.** `02-flow.md`의 "두 축이 만나는 지점"과 "fix는 예외가 아니다"가 새 규칙과 어긋나지 않는다
4. **`bk-c92489`·`bk-ce5006`이 `--backlog` 근거로 소비된다** — 이 milestone 밖에서, 새 규칙의 첫 실행으로
5. `bun test` 통과 · `typecheck` 0 · `hook.test.sh` 통과 · 실제 새 세션 확인

## Out of Scope

- **backlog의 수명 주기 자체**(`archive/backlog/` · `mark backlog`) — `bk-c92489`·`bk-ce5006`이 담고 있고, 새 규칙대로 **milestone 없이** 소비된다. 그것이 종료 조건 4다
- **`--plan`·`--fix`의 근거** — 둘은 milestone에 속하지 않는 축이고 이번 변경과 무관하다

## Plan Items

| | 갈래 | 무엇이 참이어야 하는가 |
|---|---|---|
| 4.1 | `--backlog` 근거 | `make generation`이 `--milestone`·`--backlog`·`--plan`·`--fix` 중 정확히 하나를 받는다. 앞의 둘은 exec, 나머지는 각자의 유형 |
| 4.2 | 규범과 skill | `02-flow.md`·`06-agent.md`·`evolve` SKILL이 "근거는 milestone 또는 backlog"를 말한다. **어느 것을 고르는가의 기준**까지 |

## Constraints

- 구현 전에 실패하는 테스트를 먼저 쓴다
- 코드와 이 리포를 같은 세대에서 함께 옮긴다 — 도구가 죽어 있을 수 없다
- **`--backlog`는 exec만이다.** `--plan`·`--fix`에 근거를 요구하지 않는다. 요구하면 milestone 무소속 축의 존재 이유가 사라진다

## Open Questions

- **`--backlog`가 가리키는 항목이 `consumed`면 거부하는가.** 이미 소비된 것을 다시 근거로 삼는 것이 정상인지. 4.1에서 정한다
- **세대가 닫힐 때 backlog를 자동으로 `consumed`로 표시하는가.** 표시가 `mark backlog`인데 그것은 `bk-ce5006`의 것이다 — 여기서 정하면 두 곳에서 정하게 된다. **미룬다**

## 이 milestone이 끝나면 물어볼 것

1. **근거를 고르는 판단이 쉬웠는가?** milestone인지 backlog인지 헷갈린 순간이 있었는가.
2. **backlog 근거로 연 세대가 실제로 경계를 지켰는가?** 항목 밖으로 번지지 않았는가.
3. **milestone이 필요 없어진 만큼 milestone을 덜 만들게 됐는가**, 아니면 backlog를 남발하게 됐는가.

## Fitness

**닫는 시점에 사람이 답했다.**

**1. 근거를 고르는 판단** — **쉬웠다. 경계가 적혀 있느냐로 갈렸다.**

그리고 사람이 **빠진 것을 짚었다** — *"exec generation이 milestone 내에 있으면서 동시에 특정 backlog에 의해서 만들어질 수 있다."* `gen-0028-exec`이 근거를 "정확히 하나"로 못 박은 것이 틀렸고, `gen-0030-exec`이 되돌렸다.

**배타로 못 박은 것이 왜 틀렸는지가 남는다.** "근거는 하나"라는 대칭이 깔끔해 보였지만 **milestone과 backlog는 같은 층이 아니다** — milestone은 갈래를 주고 backlog 항목은 그 갈래 안의 구체적 일을 준다. 층이 다른 둘을 배타로 두면 하나를 버려야 한다. 이 리포에 이미 사례가 있었다(`gen-0026-exec` ↔ `bk-c3321b`).

**2. backlog 근거로 연 세대가 경계를 지켰는가** — **지켰다. 둘을 묶은 것도 맞다.**

`gen-0029-exec`이 `bk-c92489`·`bk-ce5006`을 함께 소비했다. 둘 다 `mark backlog`라는 **같은 명령 표면**을 요구해 나누면 반쪽 명령이 남는다. 사람이 그 판단을 확인했고, **`evolve`에 규범으로 반영했다** — 겹치는 항목은 묶되, 겹치지 않는 항목을 편의로 묶는 것과는 다르다.

**3. milestone을 덜 만들게 됐는가** — 표본이 이르다. 다만 이 milestone 안에서 이미 **backlog 근거 세대가 하나 나왔고**(`gen-0029-exec`), 그것 때문에 milestone을 만들지 않았다.

---

**남는 것:** `fix` 축의 뒷문이 좁아졌다. 전에는 "작은 새 기능인데 milestone까지는 과하다"가 fix로 미는 압력이었는데, **근거가 backlog 항목 하나면 되므로 이제 비싸지 않다.**

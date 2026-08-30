---
id: bk-ce5006
slug: mark-backlog가-없어-consumed를-손으로-찍는다
type: design
title: mark backlog가 없어 consumed를 손으로 찍는다
from: gen-0026-exec
createdAt: 2026-08-23T03:56:00Z
status: consumed
consumedBy: gen-0029-exec
---

> **해결됨 — `gen-0029-exec`.** `mark backlog <bk-id> --consumed [--by <gen-id>]`가 생겼다. `--by`를 안 주면 **바인딩된 세대**를 쓴다 — 닫는 세대가 곧 그 세대이므로 사람이 매번 적을 이유가 없다. `bk-c92489`와 **같은 세대에서 함께 소비했다**: 둘 다 `mark backlog`라는 같은 명령 표면을 요구해서 나누면 반쪽 명령이 남기 때문이다. 이것이 새 규칙(exec의 근거는 milestone 또는 backlog)의 첫 피드백이다 — **항목 둘이 같은 표면을 건드리면 경계가 겹친다.** 아래 본문은 고치지 않는다.

## 무엇이 문제인가

**`make backlog`는 생겼는데 `mark backlog`가 없다.** `05-knowledge.md`가 "`mark backlog --consumed`는 표시만 하고 소비 시점을 정하지 않는다"고 규범을 적어두었지만 구현이 없다.

그래서 이 세대에서 `bk-394d82`와 `bk-c3321b`를 닫을 때 frontmatter의 `status: open`을 **손으로 `consumed`로 고치고 `consumedBy`를 손으로 붙였다.** `gen-0021-fix`가 `make backlog`가 없어 항목을 손으로 쓴 것과 정확히 같은 종류의 마찰이고, 이번에는 만드는 쪽만 고쳐졌다.

`bk-c92489`(backlog가 archive로 내려갈 길이 없다)와 **같은 뿌리**다 — backlog의 수명 주기에서 만드는 것만 도구가 갖고 나머지(표시·이동)는 아직 사람이 한다.

## 정해야 할 것

- **`mark backlog <id> --consumed [--by <gen-id>]`인가, `--by`를 세션 바인딩에서 가져오는가.** `make backlog --from`은 사람이 주지만 `mark`는 닫는 세대가 곧 바인딩된 세대다
- **`bk-c92489`와 함께 볼 것.** `--archived`도 같이 정해야 표시와 이동이 갈라지지 않는다
- **`idea`도 같은 것이 필요한가.** `idea`는 졸업하거나 삭제되므로 `consumed` 개념이 다를 수 있다

## 근거

- `docs/superpowers/specs/reap/05-knowledge.md` — `mark backlog --consumed`를 규범으로 적은 자리
- `.reap/life/backlog/bk-c92489-backlog-archiving.md` — 같은 뿌리의 다른 증상
- 이 세대가 손으로 닫은 둘: `bk-394d82` · `bk-c3321b`

---
id: bk-c3321b
slug: frontmatter-시간-형식
type: design
title: frontmatter의 시간 형식이 종류마다 다르다 — ISO 타임스탬프로 통일한다
createdAt: 2026-08-23T03:02:50Z
status: consumed
consumedBy: gen-0026-exec
---

> **해결됨 — `gen-0026-exec`.** 이 항목이 스스로 적은 대로 `make backlog`와 함께 왔다. 정한 것 넷: **범위**는 frontmatter만이다(sequence 레지스트리 `createdAt` 칸은 frontmatter가 아니라 사람이 읽는 표이므로 날짜를 유지한다) · **소급**은 후보 (b), 이미 쓰인 값을 그 파일을 만든 커밋의 시각으로 채웠다(`T00:00:00Z`는 거짓이지만 커밋 시각은 확인 가능한 사실이다) · **스키마**는 손으로 쓴 넷을 그대로 따랐다 · **`doctor`**는 증분 4다. 규범은 `04-commands.md`의 "frontmatter의 시간은 초 단위 ISO다" 절에 있다. 아래 본문은 고치지 않는다.

## 무엇이 문제인가

**frontmatter의 시간 필드가 세 갈래로 갈려 있다.** 사람이 요구한 것은 하나다 — *frontmatter의 시간은 ISO 시간으로만 쓴다*.

| 어디 | 필드 | 지금 값 | 형식 |
|---|---|---|---|
| generation | `startedAt` · `closedAt` | `2026-08-23T02:54:40Z` | 초 단위 ISO 타임스탬프 |
| milestone | `openedAt` · `closedAt` | `2026-08-22` | 날짜만 |
| sequence 레지스트리 | `createdAt` 칸 | `2026-08-22` | 날짜만 |
| backlog | `createdAt` | `2026-08-23` | **규범 없음** (손으로 쓴 것) |

날짜만 있는 값도 ISO 8601이긴 하다. 그러나 **같은 이름의 필드가 파일 종류에 따라 다른 정밀도를 갖는 것**이 문제다 — 읽는 쪽이 매번 "이건 어느 쪽이더라"를 물어야 하고, 두 기록의 순서를 시간으로 비교할 수 없다.

## 원인 — 셋이 겹쳤다

1. **spec이 시간 형식을 한 번도 정하지 않았다.** `04-commands.md`는 예시 frontmatter를 두 개 보여주는데, generation 쪽(95~96행)은 초 단위 타임스탬프이고 milestone 쪽(137행)은 날짜다. 규범을 적은 문장이 없으므로 이 두 예시가 사실상의 규범이 됐고, 서로 어긋난다.

2. **구현이 그 어긋남을 그대로 굳혔다.** `src/entries.ts:154`의 `today(now) = now.slice(0, 10)`이 milestone의 `openedAt`·`closedAt`과 레지스트리의 `createdAt`을 잘라낸다. generation만 `src/cli.ts:189`이 만든 `opts.now`를 통째로 쓴다. 자르는 이유는 코드 어디에도 적혀 있지 않다.

3. **backlog는 아직 손으로 쓴다.** `reap make backlog`는 `04-commands.md:32`에 있지만 구현은 증분 3에 있다(`09-roadmap.md:49`). 그래서 backlog frontmatter에는 스탬프하는 주체가 없고, 쓰는 사람이 가장 가까운 예시를 베낀다 — 그것이 하필 날짜만 쓰는 milestone 예시였다. **기존 두 항목(`bk-15780b`·`bk-394d82`)의 `createdAt: 2026-08-23`은 여기서 나왔다.** 이 파일은 통일된 형식으로 쓴다.

`evolution.md`가 말한 "손으로 하면서 느끼는 마찰이 곧 CLI가 무엇을 자동화해야 하는지 알려주는 신호"의 한 사례다 — 스탬프를 사람이 하면 형식은 반드시 갈린다.

## 왜 지금 안 고치는가

`make backlog`가 없는 채로 형식만 통일하면, 그 형식을 지키는 주체가 여전히 사람이라 다음에 또 갈린다. **형식 규범과 `make backlog`는 같이 와야 한다** — 증분 3의 것이다.

## 정해야 할 것

- **범위.** frontmatter의 모든 시간 필드를 `YYYY-MM-DDTHH:MM:SSZ`로 통일한다는 것은 정해졌다. 남은 것은 **sequence 레지스트리의 `createdAt` 칸도 포함하는가**다. 레지스트리는 append-only라 과거 행은 못 고치므로, 바꾸면 한 표 안에 두 형식이 섞인다.
- **소급.** 이미 쓰인 파일(milestone 셋, backlog 둘)을 고칠 것인가. 고치면 실제 시각을 모르므로 `T00:00:00Z`는 거짓이 된다. 후보: (a) 그대로 두고 앞으로만 (b) 해당 파일을 만든 커밋의 시각으로 채운다 (c) 날짜만 있는 값을 그 자체로 유효하게 읽도록 규범에 명시한다.
- **backlog frontmatter 스키마.** `make backlog`가 무엇을 찍는지. 지금 손으로 쓴 두 파일이 사실상의 스키마다 — `id` · `slug` · `type` · `title` · `from`(선택) · `createdAt` · `status` · `consumedBy`(선택).
- **`doctor`가 형식을 검사하는가.** 검사하면 소급 결정이 곧 doctor의 경고 규칙이 된다.

## 고칠 곳

- `docs/superpowers/specs/reap/04-commands.md` — 시간 형식 규범 한 줄, milestone 예시(137행) 정정
- `docs/superpowers/specs/reap/03-storage.md` — 레지스트리 표(137~139행) 예시
- `src/entries.ts` — `today()` 제거 또는 축소, `tests/entries.test.ts` 기대값
- `.reap/life/backlog/` 기존 두 항목 — 소급 결정에 따라

## 근거

- `docs/superpowers/specs/reap/04-commands.md:32,95-96,137`
- `docs/superpowers/specs/reap/03-storage.md:137-139`
- `docs/superpowers/specs/reap/09-roadmap.md:49` — 증분 3이 backlog를 포함한다
- `src/entries.ts:23,32,62,117,154` · `src/cli.ts:189`

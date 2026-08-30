---
id: gen-0029-exec
slug: backlog-archiving
type: exec
backlog: bk-c92489
title: backlog가 archive로 내려갈 길을 낸다
startedAt: 2026-08-23T04:19:57Z
startCommit: fc0dd7d
status: closed
closedAt: 2026-08-23T04:24:26Z
endCommit: d043078
---

## Intent

`bk-c92489`를 소비한다 — **backlog가 archive로 내려갈 길을 낸다.** `.reap/archive/backlog/`를 셋째 형제로 두고, `mark backlog --consumed --by` · `--archived`를 만들고, `listEntries`가 두 곳을 읽게 하고, `cleanup`에 backlog 절을 더한다.

**`bk-ce5006`도 함께 소비한다.** 그것이 요구하는 `mark backlog --consumed`는 `bk-c92489`의 "무엇을 더하는가"에도 들어 있다 — **같은 명령 표면이라 나누면 반쪽 명령이 남는다.**

이것 자체가 새 규칙(exec의 근거는 milestone 또는 backlog)에 대한 첫 피드백이다: **항목 둘이 같은 표면을 건드리면 경계가 겹친다.** `ms-004`의 fitness 2번이 물을 것에 대한 첫 표본이므로 여기 적어둔다.

## Working Plan — `bk-c92489`가 열어둔 물음 셋에 답한다

- **`consumed`면 곧바로 내리는가** → **아니다.** `03-storage.md`가 상태와 위치를 갈랐으므로 backlog에도 같은 질문을 묻는다 — *앞으로 이것을 볼 일이 있는가*. `consumed`는 기본 후보일 뿐이고 판단은 `cleanup`이 한다. `bk-15780b`이 실례다: consumed지만 "무엇을 물었고 답이 어떻게 뒤집혔는지"를 담고 있다
- **`dropped` 같은 상태가 필요한가** → **필요 없다.** `consumed`는 "이 항목의 물음이 끝났다"는 뜻이고, 답이 *하지 않기로 했다*여도 끝난 것이다. 왜 그랬는지는 본문이 담는다. 상태를 늘리면 판단이 늘고 검사할 것이 는다
- **언제 도는가** → `cleanup`이 milestone을 닫을 때 함께 훑는다. 별도 트리거는 YAGNI이고, `cleanup` skill이 이미 "사람이 정리해줘라고 할 때"도 부를 수 있다고 말한다

## Outcome

**backlog에 나가는 문이 생겼다.** `bk-c92489`·`bk-ce5006` 둘 다 소비했다.

```
mark backlog <bk-id> --consumed [--by <gen-id>]   # 표시. 위치는 그대로
mark backlog <bk-id> --archived                   # 이동. status는 건드리지 않는다
```

`--by`를 안 주면 **바인딩된 세대**를 쓴다 — 닫는 세대가 곧 그 세대이므로 사람이 매번 적을 이유가 없다.

| 층 | 무엇 |
|---|---|
| 경로 | `store.ts`에 `archive/backlog`와 `paths().archiveBacklog` |
| 조회 | `doc.ts`의 `listEntries("backlog")`가 두 곳을 읽는다. **이걸 같이 안 하면 옮긴 항목을 id로 못 찾는다** — 참조는 경로가 아니라 id다 |
| 명령 | `entries.ts`의 `markBacklog` · `cli.ts` 디스패치와 사용법 |
| skill | `cleanup`에 backlog 절. `life/backlog/`도 작업 세트라는 것부터 설명한다 |
| spec | `03-storage`(레이아웃 · **"`life/generations/`는 작업 세트다" → "`life/`는 작업 세트다"**) · `04-commands`(mark 목록) · `05-knowledge`(backlog 절) |
| 씨앗 | `map.md` 둘. byte-identical 유지 |
| 테스트 | 넷 추가. `mark`의 거부 테스트가 하필 `backlog`를 예로 썼기에 `idea`로 바꿨다 — `bk-c92489`가 미리 짚어둔 것이다 |

## 새 규칙에 대한 첫 피드백

**항목 둘을 한 세대에서 소비했다.** `bk-ce5006`이 요구하는 `mark backlog --consumed`가 `bk-c92489`의 "무엇을 더하는가"에도 들어 있어, 나누면 반쪽 명령이 남는다.

**"항목 하나가 경계 하나"라는 새 규칙의 첫 예외다.** 항목 둘이 **같은 명령 표면**을 건드리면 경계가 겹치고, 그때는 묶는 것이 맞다. `ms-004`의 fitness 2번("backlog 근거로 연 세대가 경계를 지켰는가")이 물을 것에 대한 첫 표본이므로 기록해둔다.

## 검증

- 실패하는 테스트 넷을 먼저 쓰고 빨간 것을 확인한 뒤 구현했다
- `bun test` 110 pass / 0 fail(넷 늘었다) · `typecheck` 0 · `build` 정상
- **`mark backlog --consumed`를 실제로 불러 다섯 항목의 상태를 찍었다** — `gen-0021-fix` 이후 손으로 하던 일이다

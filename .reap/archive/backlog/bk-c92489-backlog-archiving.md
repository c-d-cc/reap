---
id: bk-c92489
slug: backlog-archiving
type: design
title: backlog는 archive로 내려갈 길이 없다 — cleanup에 backlog 절과 archive/backlog/를 더한다
createdAt: 2026-08-23T03:06:05Z
status: consumed
consumedBy: gen-0029-exec
---

> **해결됨 — `gen-0029-exec`.** 열어둔 물음 셋에 이렇게 답했다. **(1) `consumed`면 곧바로 내리는가** → 아니다. 상태와 위치는 다른 질문이므로 `cleanup`이 "앞으로 볼 일이 있는가"를 묻는다. `consumed`는 기본 후보일 뿐이다. **(2) `dropped` 같은 상태** → 두지 않는다. "하지 않기로 했다"도 그 항목의 물음이 끝났다는 점에서 소비이고, 왜 그랬는지는 본문이 담는다. 상태를 늘리면 판단이 늘고 검사할 것이 는다. **(3) 언제 도는가** → `cleanup`이 milestone 종료 때 함께 훑는다. skill이 이미 "사람이 정리해줘 할 때"도 부를 수 있다고 말하므로 별도 트리거는 YAGNI다. 규범은 `03-storage.md`의 "`life/`는 작업 세트다"와 `05-knowledge.md`의 backlog 절에 있다. 아래 본문은 고치지 않는다.

## 확인한 것 — backlog archiving은 어디에도 없다

`cleanup`이 backlog를 어떻게 다루는지 확인했다. **다루지 않는다.** 다섯 군데 전부에서 없다:

1. **skill** — `plugin/skills/cleanup/SKILL.md`는 `life/generations/`만 훑는다. backlog라는 낱말이 한 번도 안 나온다
2. **경로** — `archive/`에는 `generations/`와 `milestones/`뿐이다. `src/store.ts:55-57`의 레이아웃, `paths()`(`store.ts:101-103`), spec 레이아웃(`03-storage.md:32-36`), `map.md:10` 전부 둘만 안다
3. **명령** — `mark`는 generation과 milestone만 받고 나머지는 거부한다(`src/cli.ts:126`). spec에 있는 `mark backlog --consumed --by <gen-id>`(`04-commands.md:54`)조차 아직 구현이 없다
4. **조회** — `listEntries(root, "backlog")`는 `life/backlog/`만 읽는다(`src/doc.ts:73-74`). generation·milestone은 life와 archive를 둘 다 읽는데 backlog만 한 곳이다
5. **살아 있는 증거** — `bk-15780b`은 `status: consumed`, `consumedBy: gen-0020-exec`인데 아직 `life/backlog/`에 있다. 내려갈 곳이 없어서다

즉 **backlog는 한 번 쓰이면 영원히 `life/`에 쌓인다.** 이것은 `03-storage.md:61`이 세운 규범과 정면으로 어긋난다 — *`life/`는 "열려 있는 것"이 아니라 "아직 참고할 값이 있는 것"이다.* 세대에는 그 경계를 관리하는 `cleanup`이 있는데 backlog에는 없다.

## 원인

**backlog는 처음부터 나가는 문 없이 설계됐다.** `05-knowledge.md:126`은 "REAP처럼 특정 단계에서 소비되도록 강제되지 않는다"고 소비 *시점*의 자유를 말하지만, 소비된 뒤 어디로 가는지는 말하지 않는다. `cleanup`은 milestone 종료 절차에서 태어났고 milestone에 매달린 것(세대)만 보게 설계됐다 — backlog는 milestone에 매달리지 않으므로 그 시야에 들어온 적이 없다.

`bk-15780b`·`bk-394d82`가 남긴 것과 같은 뿌리다: **milestone에 매달리지 않은 것은 구조에서 자리를 못 얻는다.** 이것으로 셋째다.

## 무엇을 더하는가

경로는 `.reap/archive/backlog/`다. `03-storage.md:65`가 말한 대로 archive의 디렉토리들은 서로를 담지 않으므로, `generations/`·`milestones/`와 나란한 셋째가 된다.

- `src/store.ts` — 레이아웃에 `archive/backlog`, `paths()`에 `archiveBacklog`
- `src/entries.ts` · `src/cli.ts` — `mark backlog <bk-id> --archived`(이동), 그리고 spec에 이미 있는 `--consumed --by <gen-id>`(표시). 세대와 같이 **`status`는 건드리지 않는다** — archive는 상태가 아니라 위치다
- `src/doc.ts:73-74` — `listEntries("backlog")`가 `archiveBacklog`도 읽게 한다. **이걸 같이 안 하면 옮긴 항목을 id로 못 찾는다** — 참조는 경로가 아니라 id인데 조회가 한 곳만 보면 그 약속이 깨진다
- `plugin/skills/cleanup/SKILL.md` — backlog 절. 무엇을 내리는지의 기준
- `docs/superpowers/specs/reap/03-storage.md` 레이아웃 · `04-commands.md` mark 목록 · `.reap/map.md:10`
- `tests/entries.test.ts:258` — "mark의 kind가 generation도 milestone도 아니면 거부한다"가 하필 `backlog`를 예로 쓴다. backlog가 유효해지면 다른 kind로 바꿔야 한다

## 정해야 할 것

- **`consumed`면 곧바로 내리는가.** 그렇지 않다고 본다 — `03-storage.md:61`이 상태와 위치를 갈랐으므로 backlog에도 같은 질문("앞으로 이것을 볼 일이 있는가")을 물어야 한다. `bk-15780b`이 실례다: consumed지만 본문 맨 위에 "무엇을 물었고 답이 어떻게 뒤집혔는지"를 남겨 뒀고, 그것은 아직 읽을 값이 있을 수 있다. 다만 이 판단을 매번 하게 할지, `consumed`를 기본 후보로 삼고 예외만 남길지는 정해야 한다
- **하지 않기로 최종 결정한 항목의 상태.** 지금 backlog `status`는 `open`·`consumed` 둘뿐이다. "소비되지 않고 버려진 것"을 나타낼 값(`dropped` 등)이 필요한지, 아니면 그냥 archive로 내리는 것으로 충분한지
- **언제 도는가.** `cleanup`은 milestone이 닫힐 때 돈다. backlog는 milestone에 매달리지 않으므로 그 시점에 같이 훑는 것이 맞는지, 별도 트리거가 필요한지. 같이 훑는 쪽이 싸 보이지만, milestone이 오래 안 닫히면 backlog는 그동안 계속 쌓인다

## 근거

- `plugin/skills/cleanup/SKILL.md` — 전체
- `src/store.ts:54-57,100-103` · `src/cli.ts:95-126` · `src/doc.ts:60-82`
- `docs/superpowers/specs/reap/03-storage.md:30-36,61,65` · `04-commands.md:54` · `05-knowledge.md:126`
- `docs/superpowers/specs/reap/09-roadmap.md:49` — 증분 3이 backlog를 포함한다
- `.reap/life/backlog/bk-15780b-*.md` · `bk-394d82-*.md` — **같은 뿌리.** milestone 무소속인 것이 구조에서 빠지는 자리로 이것이 셋째다

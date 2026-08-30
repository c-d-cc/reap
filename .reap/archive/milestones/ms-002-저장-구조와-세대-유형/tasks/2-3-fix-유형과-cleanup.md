# Task 2.3 — fix 유형 · `cleanup` skill · `mark --archived`

규범은 [개념](../../../../../docs/superpowers/specs/reap/01-concepts.md)과 [흐름](../../../../../docs/superpowers/specs/reap/02-flow.md)이 소유한다. **"fix는 예외가 아니다" 절을 먼저 읽는다.**

## 공개 인터페이스

```bash
reap make generation --fix --title "<t>" [--slug <s>]
reap mark generation <gen-id> --archived
reap mark milestone <ms-id> --focus
reap mark milestone <ms-id> --closed      # archive/milestones/로 이동
```

**`mark milestone`은 통째로 없다.** spec의 `04-commands.md`에 `--focus`도 `--closed`도 적혀 있지만 `mark`는 generation만 안다 — `ms-002`에 focus를 붙이는 것도 손으로 했다. 새 archive 레이아웃에서 milestone을 닫는 것이 곧 `archive/milestones/`로 옮기는 일이므로 여기서 함께 만든다.

`make generation`은 `--milestone` · `--plan` · `--fix` **중 정확히 하나**를 받는다.

## 무엇이 참이어야 하는가

- 셋 중 둘 이상을 주면 거부한다. 하나도 안 주면 거부한다. **거부 메시지가 무엇을 줘야 하는지 말한다**
- fix 세대에는 `milestone` 필드가 없다. plan과 같은 모양이다
- `--archived`는 파일을 `archive/generations/`로 옮기고 **`status`를 건드리지 않는다.** archive는 상태가 아니라 위치다
- 옮긴 뒤에도 id로 찾을 수 있다. 기록끼리의 참조는 경로가 아니라 id이므로 이동이 아무것도 깨뜨리지 않아야 한다
- `ctx`의 "열린 세대" 탐지가 fix를 본다. **이것을 빼먹으면 열린 fix 세대가 상태 줄에 안 나오고, 세션이 죽었을 때 `evolve`가 그 위에 새 세대를 연다** — `openGeneration`의 주석이 경고하는 바로 그 상황이다

## `cleanup` skill

**이 절의 기준은 Task 2.5가 대체했다.** `cleanup`이 묻는 것은 milestone 소속이 아니라 "이 세대를 앞으로 볼 일이 있는가"다. 현재 규범은 `03-storage.md`의 "`life/generations/`는 작업 세트다"에 있다.

여덟 번째 skill이다. milestone을 닫은 뒤 agent가 부른다.

무엇을 하는가 — 어느 닫힌 세대가 이 milestone과 관련된 것인지 정하고 `mark generation --archived`를 호출한다. **관련 판단은 skill의 것이다.** CLI는 이동만 한다.

skill이 말해야 하는 것: 열린 세대는 옮기지 않는다 · milestone에 속한 exec 세대가 기본이고 plan·fix는 사람이 판단할 일이다 · 옮긴 목록을 `handoff.md`에 남긴다.

## `evolve`와 `complete`

`evolve`는 축 판단이 셋이 된다. 안티패턴이 하나 는다 — **작다는 이유로 새 기능을 fix로 짓는 것.** 그리고 fix 기록은 무엇의 의도로 되돌리는지를 `References`에 적어야 한다. 그것이 이 유형의 유일한 경계이므로 skill이 반드시 요구해야 한다.

`complete`는 커밋 규칙이 그대로다. `handoff.md`가 milestone 소유라 fix·plan에는 갱신 대상이 없다 — 기존 취급을 따른다.

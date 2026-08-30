---
id: gen-0028-exec
slug: backlog-근거
type: exec
milestone: ms-004
title: make generation --backlog
startedAt: 2026-08-23T04:15:47Z
startCommit: f1c3290
status: closed
closedAt: 2026-08-23T04:19:46Z
endCommit: 2ecd360
---

## Intent

`ms-004` task 4.1. `make generation --backlog <bk-id>`가 exec 세대를 연다. **근거는 milestone 또는 backlog다.**

**무엇이 되면 끝인가:** `--milestone`·`--backlog`·`--plan`·`--fix` 중 정확히 하나를 받고, `--backlog`면 frontmatter가 `backlog: <bk-id>`를 담는다.

**정한 것 — `consumed`인 항목은 근거로 거부한다.** 이미 소비된 항목은 경계가 아니다. 그 일은 끝났다고 표시돼 있는데 그 위에 다시 일하면 다음 사람이 왜 다시 했는지 모른다. 소비가 불완전했다면 **새 항목을 쓰는 것이 맞다** — 무엇이 남았는지가 그 항목에 적히기 때문이다. 존재 검사(`resolveMilestone`)와 같은 층의 검사이고, 흐름을 막는 게이트가 아니라 **가리키는 것이 근거가 못 되는 경우**다.

## Outcome

**exec의 근거가 둘이 됐다 — milestone 또는 backlog 항목.**

```
make generation --milestone <ms-id> | --backlog <bk-id> | --plan | --fix
```

넷 중 정확히 하나. 앞의 둘은 exec의 근거이고, `--backlog`면 frontmatter가 `backlog: <bk-id>`를 담는다. milestone에 속하지 않으므로 세션 바인딩에도 milestone이 들어가지 않는다.

**규칙의 목적을 다시 읽은 것이 이 변경의 전부다.** `02-flow.md`가 요구한 것은 *"실행은 경계 없이 떠돌지 않는다"*였고, **경계를 주는 것이 milestone뿐이라는 전제가 좁았다.** backlog 항목도 경계다 — 하나의 항목이 하나의 일을 정의하고 소비하면 끝난다.

가르는 기준을 spec과 skill 양쪽에 표로 넣었다. **크기가 아니라 "경계가 이미 적혀 있는가"**다. 여러 갈래로 나뉘면 항목 하나가 갈래를 못 담으므로 여전히 milestone이다.

### 정한 것 — `consumed`는 근거가 되지 못한다

끝났다고 표시된 것 위에 다시 일하면 다음 사람이 왜 다시 했는지 모른다. 소비가 불완전했다면 **무엇이 남았는지를 담은 새 항목**을 만드는 것이 맞다 — 그래야 남은 것이 어디엔가 적힌다.

이것은 흐름을 막는 게이트가 아니라 **가리키는 것이 근거가 못 되는 경우**다. `resolveMilestone`이 없는 milestone을 거부하는 것과 같은 층이다.

### 부수 효과 하나

`fix` 축의 뒷문이 더 좁아졌다. 전에는 "작은 새 기능인데 milestone까지 만들긴 과하다"가 fix로 미는 압력이었는데, **근거가 backlog 항목 하나면 되므로 이제 비싸지 않다.** 그 문장을 `evolve`와 `06-agent.md`의 안티패턴에 넣었다.

## 검증

- 실패하는 테스트 셋을 먼저 쓰고 빨간 것을 확인한 뒤 구현했다 — 근거로 열림 · `--milestone`과 동시 지정 거부 · `consumed` 거부
- `bun test` 106 pass / 0 fail(셋 늘었다) · `typecheck` 0 · `hook.test.sh` 통과 · `build` 정상
- spec 셋(`02-flow`·`04-commands`·`06-agent`)과 `evolve` skill이 같은 규칙을 말한다

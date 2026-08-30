---
id: gen-0030-exec
slug: 근거-겸용
type: exec
milestone: ms-004
title: 근거는 둘을 함께 가질 수 있다
startedAt: 2026-08-23T04:27:51Z
startCommit: b3ba56b
status: closed
closedAt: 2026-08-23T04:29:48Z
endCommit: 2d3da9a
---

## Intent

`gen-0028-exec`이 exec의 근거를 `--milestone`과 `--backlog` 중 **정확히 하나**로 못 박았다. **그게 틀렸다.**

사람이 짚었다 — *"exec generation이 milestone 내에 있으면서 동시에 특정 backlog에 의해서 만들어질 수 있다."*

**이 리포에 이미 그 사례가 있다.** `gen-0026-exec`은 `--milestone ms-003`으로 열렸고 `bk-c3321b`(frontmatter 시간 형식)를 소비했다. 그 backlog 항목이 스스로 *"형식 통일은 `make backlog`와 같이 와야 한다"*고 적어 그 task를 규정했는데, **연결은 frontmatter에 없고 산문에만 있다.**

`milestone`과 `backlog`는 배타가 아니다. **둘 다 근거이고, 함께 있을 수 있다** — milestone이 갈래를 주고 backlog 항목이 그 갈래 안의 구체적 일을 준다.

**무엇이 되면 끝인가:** `--milestone`과 `--backlog`를 함께 줄 수 있고 frontmatter가 둘을 다 담는다. `--plan`·`--fix`는 여전히 홀로다. spec과 skill이 같은 것을 말한다.

## Outcome

**근거 둘은 배타가 아니다.** `--milestone`과 `--backlog`를 함께 줄 수 있고 frontmatter가 둘을 다 담는다.

검증 규칙이 "정확히 하나"에서 이렇게 바뀌었다.

- `--plan`·`--fix`는 **유형**이고 홀로 온다. 서로도, 근거와도 함께 못 온다
- `--milestone`·`--backlog`는 exec의 **근거**이고 **하나 이상**이면 된다
- 유형도 근거도 없으면 거부한다

**배타로 못 박은 것이 왜 틀렸는지가 요점이다.** 나는 "근거는 하나"라는 대칭이 깔끔해 보여 그렇게 짰는데, **milestone과 backlog는 같은 층의 것이 아니다** — milestone은 갈래를 주고 backlog 항목은 그 갈래 안의 구체적 일을 준다. 층이 다른 둘을 배타로 두면 하나를 버려야 한다.

## 되돌아보니 이미 있던 사례

`gen-0026-exec`은 `--milestone ms-003`으로 열렸고 `bk-c3321b`를 소비했다. 그 항목이 스스로 *"형식 통일은 `make backlog`와 같이 와야 한다"*고 적어 그 task를 규정했는데, **연결은 frontmatter에 없고 산문에만 있다.**

**소급해서 넣지 않았다.** frontmatter는 도구가 찍는 기계적 사실인데 그때 도구가 그것을 몰랐다. 손으로 넣으면 도구가 찍은 척이 된다. 대신 **연결은 이미 반대 방향으로 남아 있다** — `bk-c3321b`의 `consumedBy: gen-0026-exec`. 앞으로는 양방향이 된다.

## 검증

- 실패하는 테스트 셋(겸용 허용 · `--plan`은 근거와 못 옴 · 근거 없는 exec 거부)을 먼저 쓰고 확인한 뒤 구현했다
- `bun test` 112 pass / 0 fail · `typecheck` 0 · `build` 정상
- spec 둘(`02-flow`·`04-commands`)과 `evolve` skill이 같은 규칙을 말한다

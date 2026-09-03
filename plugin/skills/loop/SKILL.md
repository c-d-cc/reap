---
name: loop
description: Use when making new intent in a REAP project - planning, designing, shaping UI/UX, or holding an idea that has no home yet. Opens or continues a loop (the plan-axis cycle, separate from generations), writes to the plan source, records the dialogue, and closes the loop by carving a milestone. Trigger on "기획", "설계", "loop 열기", "무엇을 만들지 정하자", "plan을 쓰자", or whenever evolve finds the work is making intent rather than realizing it, in a repo containing .reap/.
---

# loop — 새 의도를 만든다

## 언제 부르는가

**새 의도를 만드는 일이면 전부 여기다.** 기획(`plan`), 설계(`design`), 화면·흐름(`uiux`), 아직 자리 없는 것(`idea`). `evolve`가 "실현하는가, 되돌리는가"를 가르는데 그 어느 쪽도 아니면 이쪽이다 — **generation이 아니라 loop다.** `make generation --plan`은 없다.

loop는 generation과 **다른 사이클**이다. 세션에 바인딩되지 않고, 여러 세션에 걸치는 것이 정상이고, 여럿이 나란히 열린다. 규범은 spec(`02-flow.md`의 `plan 축의 단위는 loop다`, `06-agent.md`의 `loop` 절)이 소유한다 — 여기는 절차다.

## 먼저: 열린 loop를 본다

상태 줄이 `열린 loop:`를 한 줄씩 낸다. 없으면 `.reap/life/loops/`를 직접 본다 — 닫힌 것도 최근 10개까지 거기 남아 있다.

**같은 물음을 다루는 loop가 열려 있으면 거기 잇는다.** 새로 열면 논의가 두 기록으로 갈라진다. 그 기록의 `Question`과 `Dialogue`를 읽고, 어디까지 갔는지 안 뒤에 계속한다.

**닫힌 loop도 읽을 것이 있다.** 지금 물음을 앞의 loop가 이미 다뤘을 수 있고 `Dead Ends`가 그것을 말한다 — 이 리포에서 plan arc가 두 번 뒤집혔고, 같은 자리를 세 번 잘못 채웠다. 앞의 것을 안 읽으면 네 번째가 된다.

## 연다

```bash
reap make loop --type plan|design|uiux|idea --title "<제목>" [--slug <s>] [--from <id>] [--ref <ps-id>:<경로>]
```

**유형은 산출물이 갈 자리로 정한다.** 기획 문서면 `plan`, 설계 문서면 `design`, 화면·흐름이면 `uiux`, 어디로 갈지 아직 모르면 `idea`. 유형이 곧 *무엇이 되면 닫히는가*를 정한다.

**`--from`은 출처다, 권한이 아니다.** 계획 부족으로 막힌 exec 세대(`gen-0043-exec`), 앞 loop, plan source의 문서(`ps-xxx:path`) — 있으면 적고 없어도 된다. 도구가 검사하지 않는다.

**본문은 비어 있다.** `Question`을 먼저 적는다 — 무엇을 정하려는가. 이것이 loop가 여러 세션에 걸치는 동안 기록을 쓸모 있게 만드는 유일한 것이다.

## 그리고 논의한다

REAP는 여기서부터 관여하지 않는다. 탐색하고, 사고실험하고, 접근을 세웠다 접는다. 사람과 갈린 지점이 있으면 **묻는다 — 묻는 법은 [interview](../interview/SKILL.md)의 것이다.** 이 skill은 무엇을 묻는지도 어떻게 묻는지도 갖지 않는다.

**`Dialogue`를 기록에 남긴다.** 갈린 지점마다 한 행 — 무엇이 갈렸고, 선택지가 무엇이었고, 사람이 무엇을 골랐고, 추천을 채택했는지 다른 답을 냈는지. 전사가 아니라 갈린 지점이다. 이것이 없으면 다음 세션이 같은 것을 다시 묻거나, 사람이 고른 것을 agent가 정한 것으로 읽는다.

**쓰기 전에 그 소스가 아직 살아 있는지 본다.** 규약(`conventions/<ps-id>-*.md`)의 `수명` 절이 "소비 완료"를 말하거나, 이 loop의 물음이 그 소스의 주제를 **잇는 것이지 넓히는 것이 아니면** 그 소스에 쓰지 않는다. 실제로 그럴 뻔했다 — 귀환 작전(loop-0003)을 소비 완료된 설계 spec에 쓰려다 사람이 막았다. 갈림은 둘이다: 기존 소스를 **확장**하는가, 새 문서 세트를 **신설**해 `make plan-source`로 등록하는가. 문서 체계는 사업 판단이라 **애매하면 사람에게 묻는다**(interview) — 분명하면 정하고 `Dialogue`에 근거를 남긴다. 소스가 소비 완료가 되는 시점(마지막 milestone이 닫힐 때)에는 그 규약의 `수명` 절을 갱신한다 — 그것이 다음 loop가 읽는 표지다.

**plan source에 쓴다.** 그것이 이 loop의 산출이다. 쓸 때의 판단은 spec의 여섯이다 — 어느 소스에 쓰는가, 규약(`conventions/`)을 먼저 읽는다, 새로 쓸 것인가 기존을 고칠 것인가, **규약 자체를 갱신한다**, 결론 안 난 것은 plan에 쓰지 않는다, 커밋 규칙이 그 소스에 적용되는가. 각각의 이유는 `06-agent.md`에 있고 여기 옮겨 적지 않는다.

**규범을 loop 기록에 두지 않는다.** 정한 것은 plan source·`genome/`·`map.md`로 간다. 기록에는 *왜 그렇게 정했는가*와 *접은 길*만 남는다. 기록에만 있는 결정은 안 정해진 것이다.

## 닫는다 — 산출물이 자리를 찾았을 때

| 유형 | 자리를 찾았다는 것 |
|---|---|
| `plan` · `design` · `uiux` | plan source에 썼고, 실행할 것이 있으면 [carve-milestone](../carve-milestone/SKILL.md)으로 잘랐다 |
| `idea` | `idea/research/`에 남겼거나, 다른 유형의 loop로 졸업했다 |

```bash
reap mark loop <loop-id> --closed [--milestone <ms-id>]...
```

`--milestone`에 이 loop가 낳은 milestone을 적는다. milestone 쪽 `from:`도 이 loop를 가리켜야 한다 — `carve-milestone`이 `--from <loop-id>`로 적는다.

**닫기 전에 `Dead Ends`와 `Outcome`을 성실히 적는다.** 닫힌 loop는 `life/loops/`에 남아 그 milestone을 실행하는 세대가 읽는다. 10개를 넘으면 오래된 것이 도구에 의해 archive로 내려간다 — 여기서 정할 것이 없다.

**못 찾았으면 열린 채 둔다.** 그것이 정상이다. 다음 세션이 `Question`과 `Dialogue`를 읽고 잇는다. 방향 자체가 죽었으면 `--aborted`로 지우되, 접은 이유는 `idea/research/`로 보낸다 — 지운 기록은 아무도 못 읽는다.

**커밋 규칙은 같다.** plan source에 쓴 것이 커밋돼야 닫는다. 소스가 리포 밖이면 그쪽 리포에서 확인하고, git이 아니면 적용하지 않으며 **적용하지 않았다고 말한다.**

## 바이너리가 없으면 손으로 한다

`loop-0001`이 그렇게 열렸다. `sequence/loop.md`에 행을 붙이고 frontmatter를 손으로 찍는다 — 파일에 남는 결과는 같아야 한다. 마찰은 `make backlog`로 남긴다.

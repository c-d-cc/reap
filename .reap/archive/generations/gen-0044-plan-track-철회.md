---
id: gen-0044-plan
slug: track-철회
type: plan
title: track을 걷어낸다 — plan을 만드는 일은 묶음이 아니다
startedAt: 2026-08-23T06:58:39Z
startCommit: 1fd4c1c
status: closed
closedAt: 2026-08-23T07:06:40Z
endCommit: 1563f63
---
## Intent

**`track`을 spec·코드·skill에서 전부 걷어낸다.**

`gen-0040-plan`이 세운 track의 정의가 틀렸다. 사람의 원래 요구는 *"plan을 만드는 과정도 여러 세대에 걸쳐야 할 수 있다"*였는데, 내가 그것을 **`vision/memory/tracks.md`와 이름이 같다는 이유로** 그 파일의 성격(관측·물음 모음)으로 끌고 갔다. 그래서 나온 것이 `Question`·`Settled`·`Dead Ends` — **"물음을 정한다"** 어휘였고, milestone의 plan판 grouping이었다.

**사람이 말한 것:** *"plan을 만드는 과정은 단순 grouping과 좀 다르다. 복합적인 관점, 다양한 탐색, 사고실험과 취소 등을 거치면서 plan이라는 산출물이 나온다."*

**묶음이 아니다.** 그러니 milestone을 plan 축으로 복사한 track은 애초에 틀린 모양이었다.

**끝나는 조건:** `track`이라는 이름이 spec·코드·skill·씨앗 어디에도 없다. `plan/` 최상위는 남는다 — 그 논거(plan source는 리포 밖을 가리키는 등록부라 시간축에 얹히지 않는다)는 track과 무관하게 서고 사람이 유지하라고 했다.

## Dead Ends

**track = plan 세대를 묶는 경계.** milestone : exec = track : plan이라는 대칭이 깔끔해 보였고 실제로 구현까지 갔다(`gen-0042`·`gen-0043`). **대칭이 성립하지 않는 이유는 두 축이 하는 일이 다르기 때문이다** — exec은 이미 정해진 것을 실현하므로 "무엇을 만들면 끝인가"로 묶이지만, plan은 정하는 일 자체라 **묶기 전에 무엇을 정할지가 아직 없다.**

**`Dead Ends`가 track의 존재 이유다.** 근거로 댄 것은 이 리포의 plan arc 둘이 뒤집혔다는 것(`gen-0006`이 `gen-0005`를, `gen-0019`가 `gen-0018`을)이었는데, **둘 다 "이미 접은 길을 다시 걸은 것"이 아니라 "살아 있던 결론을 뒤집은 것"이다.** 근거가 주장을 안 받쳤다. 사람이 짚었다.

**`backlog`와 track을 세대 수로 가르기.** `04-commands.md`에 *"한 번에 정할 수 있으면 backlog, 여러 세대면 track"*이라고 썼는데 **축이 다른 둘을 비교한 것이다** — backlog는 exec의 근거, track은 plan의 경계다. `02-flow.md`가 세운 대칭과 자기모순이었다. 사람이 짚었다.

## Outcome

**`track`이라는 이름이 spec·코드·skill·씨앗 어디에도 없다.** 걷어낸 것: `id.ts`의 `tr` 계열 · `doc.ts`의 `track` case · `entries.ts`의 `makeTrack`/`markTrack`/`--track` · `cli.ts`의 `make|mark track` · `ctx.ts`의 `열린 track` 줄 · `templates/track.md` · `plan/tracks/` · `archive/tracks/` · spec 넷 · skill 넷 · 씨앗 `map.md` 둘 · 테스트 열둘.

**빈칸을 빈칸으로 기록했다.** `02-flow.md`의 `두 축은 각자의 경계를 갖는다`를 **`plan 축에는 아직 경계가 없다`**로 바꿨다. 지웠다고 문제가 없어지는 것이 아니라 — plan 세대는 여전히 무소속이고 arc 둘이 뒤집힌 사실도 그대로다. **없다는 것을 적어두지 않으면 다음에 또 milestone을 복사하게 된다.**

**두 track 파일 → `idea/research/`** (`idea-ab1955` 결정 로그 규칙 · `idea-4b85f7` backlog 묶는 기준). 사람이 *"idea성이며 track이라고 볼 수 없다"*고 했다. 어휘를 `무엇이 미정인가`·`무엇이 정해지면 졸업하는가`·`출처`·`졸업하면 어디로`로 갈아끼웠다. **32세대 만에 `idea/`의 첫 항목이다** — `ms-006`이 *"검사할 대상이 없는 채로 idea 검사를 만든다"*고 적어둔 것이 이제 아니다.

**`idea-ab1955`의 관측이 뒤집혀서 더 말이 된다.** `ms-010`의 판단 넷이 전부 갈 자리를 찾았는데 **둘은 그 자리째로 틀렸다.** 규율할 자리에 반영하는 것은 판단이 살아남게 하지만 **옳은지는 보증하지 않는다.** 로그였다면 남았을 텐데 spec이라 함께 지워졌고, 그것을 받은 것이 이 세대 기록이다.

**딸린 정리:** `carve-milestone`의 "유보한 답은 track으로" → `idea/research/`로, `complete`의 "plan 세대가 track에 속하면" → "이을 자리가 없으니 `Dead Ends`를 성실히", `ms-005`의 track 전제 삭제, `ms-006`·`ms-007`·`ms-008`·`lessons.md`의 `tracks.md` 언급 정리.

**검증:** `bun test` 116통과 · `typecheck` 0 · `hook.test.sh` 전부 통과.

## References

- 사람의 원 요구: `gen-0040-plan`의 Intent에 인용된 것
- 걷어낼 대상: `gen-0040-plan`(spec) · `gen-0042-exec`(코드) · `gen-0043-exec`(skill·이주)
- 남기는 것: `gen-0041-exec`(`plan/` 최상위) — 사람이 *"낫다 — 이대로 유지한다"*

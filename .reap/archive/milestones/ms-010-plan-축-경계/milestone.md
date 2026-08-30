---
id: ms-010
slug: plan-축-경계
title: plan 축의 경계 — track
from: gen-0040-plan
refs:
  - ps-4f2a91:02-flow.md
  - ps-4f2a91:04-commands.md
status: closed
openedAt: 2026-08-23T05:51:55Z
closedAt: 2026-08-23T07:05:22Z
---

## Background

**plan 축에 경계가 없었다.** exec 축은 milestone이 "무엇을 만들면 끝인가"를 잡아주는데 plan 세대는 아무 데도 안 속한 채 떠 있었다.

`gen-0040-plan`이 spec에 **track**을 세웠다(`02-flow.md`의 `두 축은 각자의 경계를 갖는다`, `04-commands.md`의 `## track`). **이 milestone은 그것을 짓는다.**

**근거는 이 리포의 이력이다.** plan 세대 11개 중 여러 세대에 걸친 논의가 둘이었고 **둘 다 뒤집혔다** — `gen-0004`~`0007`(ctx 조립, `0006`이 `0005`를 되돌림)과 `gen-0018`~`0019`(archive 시점, `0019`가 `0018`을 되돌림). 묶는 자리가 없어 다음 세대가 앞 세대의 전제를 안 보고 새로 판단했다.

**사람이 정한 것 셋.** track을 1급으로 올린다 · cold start에서 plan source는 첫 track이 돌면서 만든다 · **`vision/plan/`을 `.reap/plan/`으로 올린다**(track이 거기 들어가면 `plan/`이 기획 축의 전부가 된다).

**지금 spec과 리포가 어긋나 있다.** `gen-0040-plan`이 spec을 `.reap/plan/`으로 고쳤지만 `src/store.ts`는 `vision/plan`을 그대로 만든다 — plan 세대가 코드를 손대지 않기 때문이다. **10.1이 그것을 맞춘다.**

## Exit Criteria

1. **`.reap/plan/`이 최상위다.** `sources.yml`·`conventions/`·`tracks/`가 거기 있고 코드·씨앗·이 리포가 전부 맞는다
2. **`reap make track --title "<t>"`가 `tr-<hash6>`를 발급한다**
3. **`reap mark track <tr-id> --settled | --abandoned | --archived`가 있다.** `--archived`는 이동만, `status`는 안 건드린다 — backlog·generation과 같다
4. **`reap make generation --plan --track <tr-id>`가 track을 근거로 담는다.** **선택이다** — 한 세대로 정해지는 것에 track을 요구하지 않는다
5. **`vision/memory/tracks.md`의 다섯이 이주했다.** 물음 셋은 track 파일로, 관측 둘은 갈 곳을 정해서
6. **`evolve`가 track을 다룬다** — 언제 열고 언제 안 여는지
7. **빈 프로젝트에서 cold start 앞단이 돈다** — `init` → `make track` → `make generation --plan --track`
8. `bun test` 통과 · `typecheck` 0 · `hook.test.sh` 통과 · 새 세션 확인

## Out of Scope

- **`make plan-source`·`author-plan`·`plan sources|convention`** — `ms-005`의 것이다. **cold start 전체 왕복(plan source 등록까지)은 그쪽 종료 조건으로 옮긴다** — 여기서는 track까지만 확인한다
- **track에 fitness를 묻는 것** — track이 답하는 것은 *정해졌는가*이고 검증 가능하다. *옳았는가*는 그 track이 낳은 milestone의 fitness가 답한다
- **`idea/research/`를 손대는 것** — track과 성격이 다르다(재료 vs 정하려는 것). 32세대 0개인 것은 `ms-006`의 fitness가 묻는다

## Plan Items

| | 갈래 | 무엇이 참이어야 하는가 |
|---|---|---|
| 10.1 | `plan/`을 최상위로 | `store.ts`의 `DIRS`·`paths()`, 씨앗 `map.md` 둘, **이 리포의 실제 디렉토리**가 함께 옮겨진다 |
| 10.2 | `make track` · `mark track` | id `tr-<hash6>`, 레지스트리 없음. `--settled`·`--abandoned`는 표시, `--archived`는 이동 |
| 10.3 | `--track` 근거 | `make generation --plan --track <tr-id>`. 선택이며 `--milestone`·`--backlog`와 함께 올 수 없다 |
| 10.4 | `tracks.md` 이주 | 물음 셋 → track 파일. 관측 둘(부트스트랩 마찰, 레이아웃 바꾸면 도구가 죽는다)의 갈 곳을 정한다 |
| 10.5 | `evolve`와 `cleanup` | `evolve`가 track을 고르는 법, `cleanup`이 닫힌 track을 내리는 법 |

**10.1이 먼저다** — 지금 spec과 코드가 어긋나 있고, 그 위에 `make track`을 지으면 어긋남이 하나 더 는다.

## Constraints

- **코드와 이 리포를 같은 세대에서 함께 옮긴다.** REAP는 자기 자신으로 만들어지므로 도구가 여러 task 동안 죽어 있을 수 없다
- **track을 요구하는 방향으로 짓지 않는다.** 한 세대로 정해지는 것에 track을 만들면 `ms-005`가 저지른 것(단일 세대에 경계를 만든다)을 되풀이한다
- 구현 전에 실패하는 테스트를 먼저 쓴다

## Open Questions

- **track 쓰는 법을 어느 skill이 갖는가.** `evolve`가 고르는 법을, `author-plan`(`ms-005`)이 쓰는 법을 갖는 것이 자연스러운데 **`author-plan`이 아직 없다.** 새 skill을 만들면 "언제 부르는가"가 하나 는다. 10.5에서 정한다
- **`tracks.md`의 관측 둘이 어디로 가는가.** "레이아웃을 바꾸면 도구가 죽는다"는 이 리포 고유의 제약이라 `genome/`일 수 있고, "부트스트랩 마찰 기록"은 누적 관측이라 `lessons.md`나 `environment/`일 수 있다. 10.4에서 정한다
- **닫힌 track을 언제 내리는가.** `cleanup`이 milestone 종료 때 함께 훑는데, track은 milestone에 안 매달린다. `backlog`와 같은 문제이고 같은 답(`cleanup`이 함께 훑는다)이면 되는지 10.5에서 본다

## 이 milestone이 끝나면 물어볼 것

1. **track을 실제로 열게 됐는가?** 아니면 plan 세대를 그냥 여는 습관이 그대로인가.
2. **`Dead Ends`가 쓰였는가?** track의 존재 이유가 그것인데, 안 쓰이면 다른 이유로 track이 서 있는 것이다.
3. **track과 backlog를 고르는 판단이 헷갈렸는가?** "한 번에 정할 수 있으면 backlog"라는 기준이 실제로 갈랐는가.
4. **`plan/`을 올린 것이 나은가?** 기획 축이 한자리에 모인 것이 실제로 읽기 쉬웠는가.
5. **cold start를 흉내 내봤는가?** 빈 프로젝트에서 track부터 시작하는 것이 자연스러웠는가.

---

## Fitness

**전제가 틀린 milestone이었다.** 자르기 전에 검증했어야 할 것을 검증하지 않았다.

**사람이 준 것**

- **`plan/`을 최상위로 올린 것** — *"낫다 — 이대로 유지한다."* 10.1은 산다
- **track** — *"track에 대한 정의 자체가 완전 틀린 것 같다. 처음부터 다시 한다."* 10.2~10.5는 `gen-0044-plan`이 전부 걷어냈다
- **두 track 파일** — *"idea성이며 track이라고 볼 수 없다."* `idea/research/`로 갔다(`idea-ab1955`·`idea-4b85f7`)
- **`04-commands.md`의 backlog 비교** — *"track은 plan을 구축하기 위한 여러 세대 task이고 backlog는 execution의 근거인데 이게 왜 비교대상인지 모르겠다."* 축이 다른 둘을 비교한 것이 맞다
- **`Dead Ends`** — *"dead ends는 exec gen을 하면서 막다른 길에 다다랐을 때 기록하는 것 아니었는가."* 근거로 댄 arc 둘은 "접은 길을 다시 걸은 것"이 아니라 "살아 있던 결론을 뒤집은 것"이라 주장을 안 받쳤다

**무엇이 잘못됐나 — 이름이 정의를 끌고 갔다**

`gen-0040-plan`이 track을 세울 때 이주 대상으로 `vision/memory/tracks.md`를 잡았다. 그 파일은 *"milestone을 가로지르는 진행 중인 트랙"* — **관측과 물음을 모아두던 곳**이었고, **이름만 같았다.** 그런데 이주 대상이 정해지는 순간 track의 어휘가 그 파일의 성격으로 끌려갔다: `Question`·`Settled`·`Dead Ends`. 사람이 요구한 것(*"plan을 발전시키는 과정"*)이 아니라 **물음 관리 장치**가 나왔다.

**`carve-milestone`이 요구하는 전제 검증을 이 milestone에는 안 했다.** 다른 다섯을 자를 때는 로드맵의 전제를 실제 흔적에 대봤는데, `ms-010`은 바로 앞 세대가 방금 쓴 spec을 전제로 삼았다. **방금 쓴 것은 가장 검증이 덜 된 것이다.**

**남는 것**

`plan/` 최상위(10.1)와, 그 과정에서 실제로 밟아 고친 결함 하나 — `mark milestone --focus`가 초점을 더하기만 하던 것. 둘 다 track과 무관하게 산다.

**빈칸은 그대로다.** *"plan을 만드는 과정은 단순 grouping과 다르다 — 복합적인 관점, 다양한 탐색, 사고실험과 취소를 거쳐 산출물이 나온다."* 그 자리를 무엇이 채울지는 아직 안 정해졌고, `02-flow.md`의 `plan 축에는 아직 경계가 없다`가 그 사실을 갖는다.

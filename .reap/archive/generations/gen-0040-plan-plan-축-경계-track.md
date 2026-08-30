---
id: gen-0040-plan
slug: plan-축-경계-track
type: plan
title: plan 축의 경계를 세운다 — track
startedAt: 2026-08-23T05:47:50Z
startCommit: 8721750
status: closed
closedAt: 2026-08-23T05:52:45Z
endCommit: dde8e7f
---

## Intent

**plan 축에 경계가 없다.** exec 축은 milestone이 "무엇을 만들면 끝인가"를 잡아주는데, plan 축은 세대가 그냥 떠 있다. 사람이 둘을 짚었다 — **여러 세대에 걸친 plan 발전**과 **plan이 0인 상태에서의 cold start**.

**둘은 같은 구멍이다.** cold start는 *plan이 0인 상태에서 쌓는 일*이고 plan 발전은 *있는 상태에서 더 쌓는 일*이다. 둘 다 여러 세대에 걸쳐 무언가를 정해가는 일이고, 그것을 담는 자리가 없다.

## 증거

**하나 — plan 세대 11개 중 여러 세대에 걸친 논의가 둘이었고 둘 다 뒤집혔다.**

- `gen-0004`~`0007` *"ctx가 무엇을 조립하는가"* — 넷. `gen-0006`이 `gen-0005`를 되돌렸다
- `gen-0018`~`0019` *"세대를 언제 archive하는가"* — 둘. `gen-0019`가 `gen-0018`을 되돌렸다

**묶는 것이 없어서 뒤집힌 것에 가깝다.** "무엇을 정하려는가"와 "무엇을 이미 접었는가"가 어디에도 없으면 다음 세대가 앞 세대의 전제를 안 보고 새로 판단한다. `gen-0019`가 졸업시킨 교훈이 정확히 그것이다 — *"구조를 적을 때 그 구조의 목적도 적는다."*

**둘 — 논의를 담는 자리가 셋으로 흩어져 있다.** `backlog`의 "정해야 할 것" · `tracks.md`의 물음 · `idea/research/`의 졸업 조건. **어느 것도 세대를 묶지 못한다.** `tracks.md` 다섯 중 셋은 물음이고 둘은 관측이라 한 파일에 두 종류가 섞여 있다.

**셋 — `idea/`가 32세대 동안 0개다.** 그 일을 backlog가 대신하고 있다.

## 사람이 정한 것 둘

- **`track`을 1급으로 올린다.** `tracks.md`가 이미 *"milestone을 가로지르는 진행 중 트랙"*이라 정의돼 있으므로 **새 개념이 아니라 있는 것의 형식화**다
- **cold start에서 plan source는 첫 track이 돌면서 만든다.** `init`은 빈 자리만 놓는다 — `context.md`가 21세대 0바이트였던 것과 같은 모양을 되풀이하지 않는다

## Outcome

**plan 축에 경계가 생겼다 — `track`.** spec에 세웠고 `ms-010`으로 잘랐다.

### 축의 대칭 (`02-flow.md`)

| | exec 축 | plan 축 |
|---|---|---|
| 경계 | milestone | **track** |
| 묻는 것 | 무엇을 **만들면** 끝인가 | 무엇을 **정하면** 끝인가 |
| 종료 판정 | 사람의 **fitness** | **반영됐는가** — 검증 가능하다 |

**`"실행 단위에 갇히지 않는다"는 "경계가 없다"가 아니다.** 그 둘을 구별하지 않은 것이 원래 잘못이었고, 그 문장을 `02-flow.md`에 넣었다.

**종료 판정이 다른 것이 설계의 중심이다.** milestone은 "됐는가"를 사람만 판정할 수 있지만, track은 `ms-003`이 세운 규칙(*정해진 것은 규율할 자리에 반영되어야만 살아남는다*)으로 **절반을 기계가 판정한다.** 그리고 **그 결론이 옳았는지는 track이 낳은 milestone의 fitness가 답한다** — track은 *정해졌는가*를, milestone은 *옳았는가*를 묻는다.

### track은 근거가 아니라 묶음이다

**exec의 근거는 필수이고 plan의 track은 선택이다.** 비대칭에 이유가 있다 — **exec의 근거는 권한**(무엇을 만들지 이미 누군가 정했다는 증거)이고, **plan은 정하는 일 자체**이므로 "이미 정해진 것"을 근거로 요구할 수 없다.

### 어휘의 중심은 `Dead Ends`다

`Question`·`Exit`·`Settled`·`Open`·`Dead Ends`·`Evidence` 여섯 중 **`Dead Ends`가 track의 존재 이유다.** arc 둘이 뒤집힌 것이 접은 답이 어디에도 없었기 때문이다.

### `plan/`을 최상위로 (사람이 정함)

`vision/plan/` → `.reap/plan/`. **`tracks/`가 거기 들어가면 `plan/`이 기획 축의 전부가 된다** — 어디에 쓰는가(`sources.yml`·`conventions/`)와 무엇을 정하는 중인가(`tracks/`)가 한자리다. 3단(vision·life·archive) 밖인 이유도 적었다: plan source는 **리포 밖을 가리키는 등록부**라 시간축에 안 얹힌다.

**`memory`가 `lessons.md` 하나로 줄었다.** 진행 중인 물음은 track이 갖는다 — **물음은 닫히는 것이고 교훈은 쌓이는 것이라, 한 파일에 섞으면 어느 쪽도 정리되지 않는다.**

### cold start는 track의 첫 회다

`init` 직후 plan이 0이면 첫 일은 *"무엇을 만들 것인가"* track을 여는 것이다. 그 track이 돌면서 `make plan-source`로 쓸 자리가 정해지고, 결론이 서면 `carve-milestone`이 자른다. **`init`이 씨앗 plan 문서를 놓지 않는다** — 안 쓰는 프로젝트에 빈 문서가 생기는 것은 `context.md`가 21세대 0바이트였던 것과 같은 모양이다.

## 남긴 어긋남 하나

**spec은 `.reap/plan/`이라 하는데 `src/store.ts`는 아직 `vision/plan`을 만든다.** plan 세대가 코드를 손대지 않기 때문이고, `ms-010`의 **10.1이 첫 task**다 — 그 위에 `make track`을 지으면 어긋남이 하나 더 는다.

`ms-005`(plan 축 완성)에 순서를 적었다 — `ms-010`이 먼저이고, **cold start 전체 왕복은 `ms-005`의 종료 조건으로 옮겼다**(`make plan-source`가 거기 있으므로).

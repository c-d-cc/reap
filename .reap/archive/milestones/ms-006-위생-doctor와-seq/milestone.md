---
id: ms-006
slug: 위생-doctor와-seq
title: 위생 — doctor와 seq
from: gen-0032-plan
refs:
  - ps-4f2a91:04-commands.md
status: closed
openedAt: 2026-08-23T04:49:27Z
closedAt: 2026-08-30T17:00:36Z
---

## Background

로드맵 **증분 4(위생)의 남은 것**이다. 절반은 이미 됐다 — `mark backlog`와 backlog가 archive로 내려가는 길은 `ms-004`가, milestone 종료/아카이브/fitness는 `ms-002`~`ms-004`가 가져갔다.

**남은 것은 `doctor` · `seq` · `carrier` · idea가 내려갈 길이다.**

**`carrier`는 로드맵 어느 증분에도 없던 것을 `gen-0037-fix`가 붙였다.** `doctor`가 표식의 형식·고아·충돌을 보는 것이므로 같은 milestone이 맞다. 갈 곳이 없던 것이 원래 문제였다.

**전제 검증:** 로드맵이 `doctor`를 여기까지 미룬 이유는 *"검사 항목과 크기 안내선 숫자를 실제로 쌓인 데이터에 대고 정해야 한다. 지금 정하면 REAP에서 베낀 숫자를 상상에 대고 튜닝하게 된다"*였다. **이제 충족됐다** — 세대 32, milestone 5, backlog 6, lessons 13, spec 문서 10.

`doctor`가 재는 것이 하나 더 있다. `02-flow.md`가 *"막지 않는 대신 `doctor`가 사후에 본다 — 이것이 REAP의 근본 거래다"*라고 못 박았고, **그 거래의 성적표가 `doctor`의 보고 빈도다.** 지금은 성적표가 없다.

**새 사실 하나: `idea/`가 32세대 동안 0개다.** `05-knowledge.md`가 긴 절을 할애했고 `ctx` 상태 줄이 개수를 내는데 아무도 안 썼다. `context.md`(21세대 0바이트)와 같은 모양으로 보이지만 **다르다** — `make idea`는 `ms-003`에서야 생겼다. 다만 backlog는 도구 없이도 손으로 넷이 쓰였는데 idea는 0이다. **`doctor`의 idea 검사 항목은 검사할 대상이 없는 채로 만들어진다** — 그 사실을 fitness가 묻는다.

## Exit Criteria

1. **`reap doctor`가 있고 보고만 한다.** `genome/invariants.md`가 못 박은 것이다 — **파일을 쓰지 않는다**
2. **검사 항목이 실제 데이터에 대고 정해졌다.** `04-commands.md`가 나열한 것들(커밋 없이 닫힌 generation, 고아 참조, 크기 안내선, 누적 경고, `map.md` 씨앗 불일치, idea 졸업 조건)을 **이 리포에 돌려보고** 무엇이 실제로 잡히는지 확인한 뒤 확정한다
3. **크기 안내선 숫자가 상상이 아니라 측정에서 나온다.** 지금 genome 셋·`summary.md`·`lessons.md`의 실제 크기가 근거다
4. **`reap seq [type|id]`가 레지스트리를 조회한다**
5. **`reap carrier new <slug>`가 미사용 해시로 표식을 발급하고 `carrier list [--orphans|--check]`가 조회한다.** 표식은 `reap:carrier-<hash6>-<slug>` — id 부분이 다른 것들과 같은 형식이다
6. **idea가 `archive/idea/`로 내려간다.** `cleanup`에 idea 절. backlog와 같은 모양 — 상태와 위치는 다른 질문이다
7. **`doctor`를 이 리포에 실제로 돌려 보고를 본다.** 무엇이 잡히고 무엇이 안 잡히는지가 fitness의 재료다
8. `bun test` 통과 · `typecheck` 0 · `hook.test.sh` 통과

## Out of Scope

- **보고를 고치는 것** — `doctor`는 보고만 한다. 자동 수정은 `invariants.md`가 금한다
- **게이트로 되돌리는 것** — `doctor`가 자주 보고하면 그 지점만 게이트로 되돌린다는 것이 spec의 계획이지만, **판단의 재료를 만드는 것이 이 milestone이고 판단은 다음이다**

## Plan Items

| | 갈래 | 무엇이 참이어야 하는가 |
|---|---|---|
| 6.1 | `seq` | 레지스트리 셋(generation·milestone·source)을 조회한다. 이스케이프를 되돌려 보여준다 |
| 6.2 | `carrier` | `new <slug>`가 미사용 해시를 뽑는다 — **표식 자체가 레지스트리이므로 기존 표식을 훑어 뽑는다.** `list`·`--orphans`·`--check` |
| 6.3 | idea가 내려갈 길 | `archive/idea/`와 `mark idea --archived`, `cleanup`의 idea 절. backlog와 같은 모양 |
| 6.4 | `doctor` — 확정 가능한 검사 | 커밋 없이 닫힌 generation, 고아 참조(`from`·`refs`·`consumedBy`), **기록 안 상대 링크의 깨짐**, `map.md` 씨앗 불일치, **carrier 형식·고아·충돌** |
| 6.5 | `doctor` — 안내선 | 크기·누적 경고. **숫자를 이 리포의 실측에서 정한다** |
| 6.6 | 이 리포에 돌려본다 | 보고를 읽고, 잡히지 않아야 할 것이 잡히거나 잡혀야 할 것이 안 잡히면 고친다 |

**부트스트랩 마찰 하나가 여기로 왔다.** 부트스트랩 마찰 기록에 *"기록 안의 상대 링크 깊이를 손으로 센다 — 아무 경고가 없다"*로 앉아 있던 것이다. 세대가 `life/generations/` 한 곳에 모여 깊이가 고정된 뒤로 덜 틀리지만 여전히 검사가 없고, **확정 가능한 사실**이라 6.4가 맞다. `gen-0043-exec`이 그 파일을 내리며 배정했다.

## Constraints

- **`doctor`는 파일을 쓰지 않는다**(`genome/invariants.md`). 사람만 수정하는 제약이다
- **숫자를 상상으로 정하지 않는다.** 안내선은 이 리포의 실측에서 나온다
- 구현 전에 실패하는 테스트를 먼저 쓴다

## Open Questions

- ~~고아 참조를 어디까지 보는가~~ — 둘 다 본다. `make`는 그 시점의 실재를, `doctor`는 사후에 사라졌는가를. 시점이 달라 중복이 아니다(`gen-0057`)
- ~~`idea/`가 계속 0이면~~ — 자를 때 0이었는데 지금 4개다(`gen-0044`가 둘, `ms-012` fitness가 하나, 사람이 하나). 검사 대상이 생겼다
- ~~carrier 표식을 이 리포에 실제로 심을 것인가~~ — 심었다. `map-seed`(`gen-0056`). 씨앗 내용에 넣으면 모든 사용자 프로젝트에 고아 표식이 퍼지므로 REAP 리포 쪽 세 자리(spec 레이아웃·`store.ts`·`templates.ts`)에만

## 이 milestone이 끝나면 물어볼 것

1. **carrier 표식을 실제로 심게 됐는가?** 안 심었으면 그 관례가 필요 없었던 것이다.
2. **`doctor`가 실제로 무엇을 잡았는가?** 잡힌 것 중 몰랐던 것이 있었는가.
3. **"커밋 없이 닫힌 generation"이 얼마나 보고되는가?** 이것이 spec의 근본 거래(게이트를 없애고 사후 검증)의 성적표다.
4. **안내선 숫자가 쓸모 있었는가**, 아니면 매번 무시하게 되는 잡음이었는가.
5. **`idea/`를 쓰게 됐는가?** 여전히 0이면 그 자리 자체를 다시 봐야 한다.

## Fitness

(사람, 2026-08-31) **1 심었다** — `map-seed`. 씨앗 본문에 넣으면 사용자 프로젝트로 퍼진다는 것을 테스트가 잡아 REAP 리포 쪽 세 자리로 옮겼다. **2** `doctor`는 이 리포에서 결함 0·참고 0. 잡힌 유일한 것은 `carrier --check`의 spec 예시 해시 불일치 — 몰랐던 것. **3 커밋 없이 닫힌 generation 0/57** — 근본 거래의 첫 성적표. **4** 실사용 뒤. **5** 자를 때 0 → 4.

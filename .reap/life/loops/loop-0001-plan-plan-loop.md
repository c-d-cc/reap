---
id: loop-0001-plan
slug: plan-loop
type: plan
title: plan loop — plan 축의 사이클을 세운다
from: gen-0046-plan
refs:
  - ps-4f2a91:02-flow.md
  - ps-4f2a91:06-agent.md
startedAt: 2026-08-30T14:20:00Z
startCommit: 5b16215
status: closed
closedAt: 2026-08-30T14:51:26Z
milestones:
  - ms-012
---
## Question

**plan을 만드는 일은 어떤 사이클로 도는가.** `gen-0044`가 track을 걷어내며 남긴 빈칸이고, `gen-0045`가 *"경계는 REAP 밖(`reap-plan`)"*으로 답했던 것을 사람이 되돌렸다 — REAP가 기획을 직접 쓴다.

**손으로 연 첫 loop다.** `make loop`가 없으므로 id·frontmatter·레지스트리를 손으로 했다(`genome/evolution.md`의 부트스트랩 규칙). 마찰은 backlog로.

## Dialogue

`gen-0046`(init·interview 설계)을 닫은 직후 사람이 되돌렸다. 앞선 넷(init 경계·기록 방식·invariants·검증 유예)은 `gen-0046` 기록에 있다.

| # | 갈린 것 | 선택지 | 사람의 답 |
|---|---|---|---|
| 0 | `gen-0045`(기획을 `reap-plan`으로 내보냄)를 어떻게 하나 | 되돌린다 / 둘 다 둔다 | **셋을 지시** — `reap-plan` 삭제 · `author-plan` 개명 · **plan을 generation에서 분리해 `life/loops/`에 별도 사이클로** |
| 1 | loop 하나의 경계 | plan source에 씀 / 물음 하나 / **milestone을 낳으면** / 세션 | milestone을 낳으면 |
| 2 | milestone 못 낳은 loop | 닫힌다 / abort / **열린 채** | 열린 채 둔다 |
| 3 | `author-plan`의 새 이름 | write-plan / **loop** / design | loop |
| 4 | loop를 여는 skill | evolve가 둘 다 / **별도** | 별도 skill(`loop`) |
| 5 | 동시 열림 | **여럿** / 하나 | 여럿 가능 |
| 6 | 닫힌 loop의 자리 | `life/loops/`에 두고 cleanup / **바로 archive** | 닫히면 바로 `archive/loops/` |
| 7 | (사람이 더함) | — | **유형** `plan\|design\|uiux\|idea` · **근거는 선택**(plan source·generation·앞 loop) · **논의의 흐름을 기록에** |
| 9 | (닫은 뒤) 닫힌 loop의 자리 — 바로 archive하니 못 찾겠다 | 3 / 5 / **10** / config | 6의 답을 뒤집었다. `life/loops/`에 남기고 닫힌 것이 10개를 넘으면 오래된 것부터 archive. `mark`가 기계적으로 |
| 8 | 유형별 닫힘 | **산출물이 자리를 찾으면** / 전부 milestone / idea는 유형 아님 | 산출물이 자리를 찾으면 — 1의 답이 이것으로 일반화됐다 |

추천을 붙인 것은 0(A 추천 → 사람은 셋째 길)뿐. 나머지는 취향·구조 선택이라 추천 없이 물었다.

## Explored

- `gen-0045`가 뺀 것: `author-plan` 여섯 판단 · `conventions/`의 "쓰는 법" · `ms-005` 조건 3·6 · 증분 3 절반. 남긴 것: 소비 프로토콜(등록·읽기·인용·issue)
- 이 리포 genome이 45세대 동안 안 자란 것(`gen-0046` References)

## Dead Ends

**되돌리기 A(`author-plan` 복원, generation 안에서)와 B(쓰기+소비 공존).** 둘 다 plan을 여전히 generation의 한 유형으로 뒀다. 사람이 셋째 길을 냈다 — 사이클 자체를 가른다. **`gen-0045`가 틀린 지점은 소유가 아니라 사이클이었다** — "누가 쓰는가"로 읽어 밖으로 내보냈는데, 빈칸은 "어떤 사이클로 도는가"였다.

**닫히면 바로 archive(6의 답).** 첫 loop를 닫자마자 못 찾았다. 써보기 전의 답이었다.

**loop = milestone을 낳으면 닫힌다(1의 답).** 유형이 생기자 `idea` loop가 예외가 됐고 "산출물이 자리를 찾으면"으로 일반화됐다(8). 첫 답이 틀린 게 아니라 좁았다.

**`init`을 plan 세대로 연다(`gen-0046`).** loop가 생기며 첫 loop로 바뀌었다. `gen-0046`의 결정 중 이것 하나만 뒤집혔다.

## Outcome

**spec** — `02-flow.md`: `plan 축의 경계는 플러그인 경계다` → **`plan 축의 단위는 loop다`**(유형 표·generation과의 차이·같은 자리를 세 번 잘못 채운 이유·근거는 출처·Dialogue), 흐름도 둘, 개입 표. `04-commands.md`: `make loop`·`mark loop`, `--plan` 거부, `make issue` 삭제. `05-knowledge.md`: 프로토콜이 등록·읽기·**쓰기**·인용, `되돌려 보내기` 절 삭제, `conventions/`에 쓰는 법 복원. `06-agent.md`: `REAP는 기획을 쓰지 않는다` → **`loop — plan 축의 사이클`**(여닫기 둘 + 여섯 판단 + Dialogue), skill 8종, evolve 둘째 판단이 loop로 보낸다, `init`은 첫 loop. `03-storage.md`·`01-concepts.md`·`08-delivery.md`·`09-roadmap.md` 반영.

**리포** — `life/loops/`·`archive/loops/`·`sequence/loop.md`. `map.md`·`summary.md`. `ms-011`이 등록·읽기·인용 셋으로 줄고 issue가 빠졌다. `ms-007`의 `init`이 loop로 열린다. **`ms-012 loop`를 잘랐다** — 도구·상태 줄·skill.

**backlog** `bk-8800cc` — 손으로 한 마찰.

## Open Questions

`ms-012`로 — `gen-NNNN-plan` 파싱은 허용하고 발급만 막는 법, `from` 복수, loop의 handoff 필요 여부.

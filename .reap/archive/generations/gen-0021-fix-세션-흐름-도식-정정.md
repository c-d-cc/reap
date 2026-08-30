---
id: gen-0021-fix
slug: 세션-흐름-도식-정정
type: fix
title: 02-flow.md의 세션 흐름 도식을 현재 ctx의 의도에 맞춘다
startedAt: 2026-08-23T02:54:40Z
startCommit: 43f32dd
status: closed
closedAt: 2026-08-23T03:00:30Z
endCommit: feb99ed
---

## Intent

`02-flow.md`의 "한 세션의 흐름" 도식이 `SessionStart` 훅 주입을 이렇게 그린다.

```
[SessionStart 훅] --> reap ctx --> 맥락이 주입된다
   |                                 milestone(경계·context·decisions·handoff)
   |                                 genome / environment / memory
   |                                 plan source 규약 색인, idea 제목 목록
```

**셋 중 어느 것도 지금 주입되지 않는다.** `ctx.assemble`이 싣는 것은 `genome/*` · `environment/summary.md` · 상태 줄뿐이고, milestone 본문 · memory 본문 · plan source 색인 · idea 목록은 전부 상태 줄이 **경로만** 알린다.

되돌아갈 곳은 `gen-0006-plan`의 결정이다 — "ctx는 genome·environment/summary.md·상태 줄만 조립한다. 맥락 구성은 판단이고, 원칙 2가 도구에 주는 것은 확률에 의존하면 안 되는 것뿐이다." spec의 나머지(`06-agent.md`·`05-knowledge.md`·`03-storage.md`·`04-commands.md`)는 이미 그 결정을 따르고 있고, **이 도식 하나만 뒤처졌다.**

**무엇이 되면 끝인가:** 도식이 `ctx`가 실제로 싣는 것을 그린다. spec 안에서 같은 사실을 말하는 다른 대목과 어긋나지 않는다.

## References

- 되돌릴 대상: `gen-0006-plan`의 결정 — `.reap/archive/milestones/ms-001-한-세대-한-바퀴/decisions.md`
- 어긋난 곳: `docs/superpowers/specs/reap/02-flow.md` "한 세션의 흐름" 도식
- 이미 맞는 대목: `06-agent.md` "memory도 주입하지 않는다" · `05-knowledge.md:80,124` · `03-storage.md:91` · `04-commands.md:151`
- 구현: `src/ctx.ts` `assemble()`·`status()`

## Notes

이 세대는 `fix` 유형의 첫 실사용이다. `ms-002`의 handoff가 "fix가 실제로 쓰이는지 본다"를 남겼고, 그 관찰의 첫 표본이다.

같은 자리에서 미뤄져 있던 Minor 넷 중 **하나만 fix로 판정했다.** 나머지 셋(세대 괄호 밖 커밋 여섯 · `tests/store.test.ts`의 `paths()` 되읊기 · `record-vocabulary.md` 분할)은 되돌아갈 곳이 없어 fix가 아니다. 크기가 아니라 되돌리는가가 기준이라는 것을 이 판정이 지킨다.

## Outcome

**어긋난 곳이 셋이었다.** 하나를 고치러 들어가 손으로 둘을 더 찾았고, 그다음 전수 검사로 더 없음을 확인했다.

| 파일 | 무엇이 어긋났나 | 되돌아간 곳 |
|---|---|---|
| `02-flow.md` | 세션 흐름 도식이 milestone 본문·memory·plan source 색인·idea 목록을 주입한다고 그렸다 | `gen-0006-plan` — ctx는 genome·`environment/summary.md`·상태 줄만 조립한다 |
| `06-agent.md` | 상태 줄 예시의 `기억:` 줄이 둘째 파일 경로를 줄여 적어, **실제로 나올 수 없는 출력**을 그렸다 | `ctx.ts`의 `status()` — 두 파일 모두 root 기준 상대경로를 낸다 |
| `README.md` | 색인이 `skill 7종`(`cleanup` 추가 전 숫자)이고, 규약 파일을 `ps-4f2a91.md`로 인용했다 | `06-agent.md`의 skill 8종 표 · `sources.yml`의 `ps-4f2a91-reap.md` |

`README.md`의 `7종`은 `gen-0018-plan`이 남긴 것이 아니다. `git log -L`로 보니 **문서를 쪼갠 첫 커밋 `b45b714`부터 7이었고**, `ms-002`의 Task 2.3이 `cleanup`을 더하며 `06-agent.md`만 8로 올렸다. 색인은 아무도 다시 보지 않았다.

**재드리프트를 막는 한 줄을 도식 아래 두었다** — 주입 목록의 규범은 `06-agent.md`가 소유하고 `02-flow.md`가 그리는 것은 순서지 목록이 아니라는 것. 여기 목록을 다시 적어 고치는 쪽이 더 짧았지만, 그렇게 하면 **두 곳에 목록이 생겨 같은 일이 또 일어난다.** 어긋난 원인이 정확히 그것이었다.

## 검증

- spec의 상대 링크 **14개**와 백틱 안 리포 경로 **7개**를 프로그램으로 전수 검사 → 깨진 것 0. 검사기가 실제로 그 범위를 잡았는지도 따로 확인했다(0건은 검사가 안 돌았을 때도 나온다)
- `bun test` 97 pass / 0 fail · `bun run typecheck` 0 · `./tests/hook.test.sh` 전부 통과
- 코드는 한 줄도 바뀌지 않았다. 이 세대가 바꾼 것은 문서 셋뿐이다

## 남은 것

**`fix` 축의 첫 표본이 남긴 관찰 둘.**

1. **fix가 뒷문이 되지 않았다.** 미룬 Minor 넷 중 되돌아갈 곳이 있는 하나만 통과했고, 나머지 셋(세대 괄호 밖 커밋 · `paths()` 되읊기 · `record-vocabulary.md` 분할)은 크기가 작아도 새 의도라 걸러졌다. 기준이 실제로 작동한다
2. **milestone 밖에서는 결정을 적을 곳이 없다** → `bk-394d82`. `ms-002`가 닫힌 뒤 열린 첫 세대라 여기서 처음 드러났다. `bk-15780b`와 같은 뿌리다 — milestone 무소속 세대가 구조에서 빠지는 자리가 이것으로 둘이 됐다

**하지 않은 것:** `tests/store.test.ts`의 `paths()` 되읊기는 손대지 않았다. 되풀이처럼 보이지만 vision·life·archive 3단이라는 **계약을 못 박는** 값이 있고, 동작은 의도대로 돈다.

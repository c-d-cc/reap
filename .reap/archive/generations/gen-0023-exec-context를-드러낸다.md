---
id: gen-0023-exec
slug: context를-드러낸다
type: exec
milestone: ms-003
title: context.md와 build-context를 드러낸다
startedAt: 2026-08-23T03:17:29Z
startCommit: db5ea2a
status: closed
closedAt: 2026-08-23T03:22:09Z
endCommit: 62a0225
---

## Intent

`ms-003` task 3.1. `context.md`와 `build-context`를 코드·spec·테스트·씨앗에서 걷어낸다. skill은 8종에서 **7종**이 된다.

근거는 `gen-0022-plan`과 사람의 판정이다 — 두 milestone 21세대 동안 `context.md`가 0바이트였고, `06-agent.md:36`이 이미 "맥락을 조립하는 별도의 skill도 두지 않는다"고 못 박아 두었다.

**무엇이 되면 끝인가:** `make milestone`이 만드는 파일이 `decisions.md`·`handoff.md` 둘이다. skill 개수를 말하는 두 자리가 모두 7종이다. `context.md`·`build-context`가 남은 곳이 없거나, 남은 것이 의도적 이력임을 설명할 수 있다.

## References

- `.reap/vision/milestones/ms-003-세대가-남기는-것의-자리/tasks/3-1-context를-드러낸다.md` — 손댈 곳 13개 표

## Outcome

**`context.md`와 `build-context`가 사라졌다. skill은 7종이다.**

| 층 | 무엇 |
|---|---|
| 코드 | `entries.ts` — `make milestone`이 만드는 파일이 `decisions.md`·`handoff.md` 둘. `ctx.ts` — 상태 줄이 이름을 내는 목록에서 뺐다 |
| spec | `02-flow`(도식 한 줄·지점 표 한 행) · `03-storage`(레이아웃) · `04-commands`(안내선) · `05-knowledge`(3-tier 서술) · `06-agent`(조립 대상·상태 줄 예시·**8종→7종**·skill 표 행·`evolve`의 인계 서술) · `08-delivery`(플러그인 파일 목록) · `README`(색인) |
| 씨앗 | `src/templates/map.md`와 `.reap/map.md`. **여전히 byte-identical이다** |
| 테스트 | 셋을 고치고 하나를 더했다 |
| 데이터 | 빈 `context.md` 셋 삭제 |

## 계획에 없던 것을 둘 찾았다

- **`08-delivery.md`의 플러그인 파일 목록에 `cleanup`이 없었다.** `ms-002`가 `cleanup`을 더할 때 `06-agent.md`의 skill 표만 갱신하고 여기는 안 봤다. `build-context`를 빼면서 함께 넣었다 — 이제 일곱이 두 곳에서 같다
- **`05-knowledge.md:124`가 REAP의 midterm 역할을 `context.md`에 맡기고 있었다.** `handoff.md`와 `decisions.md`가 가져가는 것으로 고쳤다

## 정한 것

**빈 `context.md` 셋을 지웠다**(`ms-001`·`ms-002`·`ms-003`). 0바이트라 담은 정보가 없고, `ctx`의 `nonEmpty`가 이미 빈 파일을 없는 파일로 취급하므로 두어도 아무 데도 안 나온다. **"그때는 있었다"는 사실은 git 이력이 이미 갖는다** — 문서가 그 일을 두 번 할 이유가 없다.

## 검증

- 실패하는 테스트 둘을 먼저 쓰고 각각 **정확한 이유로 빨간 것을 확인한 뒤** 코드를 고쳤다
- `bun test` 98 pass / 0 fail(하나 늘었다) · `typecheck` 0 · `./tests/hook.test.sh` 전부 통과
- `bun run build` 후 **빈 임시 프로젝트에서 실제로 확인했다** — `init` → `make milestone`이 `milestone.md`·`decisions.md`·`handoff.md` 셋만 놓는다
- 이 리포의 상태 줄이 `milestone.md · decisions.md · handoff.md`를 낸다

## 남은 것

`08-delivery.md`가 `shared/references/`에 `record-vocabulary.md`와 `milestone-vocabulary.md` **둘**을 적는데 리포에는 `record-vocabulary.md` 하나가 두 어휘를 담고 있다. `ms-002`가 미룬 Minor 넷 중 하나였고 3.1의 범위가 아니다 — **task 3.4(정합)에서 본다.**

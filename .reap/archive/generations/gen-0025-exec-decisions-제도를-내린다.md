---
id: gen-0025-exec
slug: decisions-제도를-내린다
type: exec
milestone: ms-003
title: decisions 제도를 내린다
startedAt: 2026-08-23T03:41:30Z
startCommit: 92cab51
status: closed
closedAt: 2026-08-23T03:48:59Z
endCommit: 7415108
---

## Intent

`ms-003` task 3.2. **사람이 `decisions.md` 제도를 통째로 내리기로 했다.**

근거: 결정 로그는 spec 밖에 규범이 사는 둘째 자리를 만든다. `genome/application.md`가 이미 같은 것을 금한다 — "규범은 plan source가 소유한다. **여기에 옮겨 적지 않는다** — 두 곳에 있으면 어긋나고, 어긋난 쪽을 다음 세대가 읽는다." `gen-0021-fix`가 겪은 것이 정확히 그 어긋남이었다.

**그래서 규칙은 이렇게 바뀐다: 정해진 것은 그 자리(spec·genome·map)에 반영되어야만 살아남는다. 반영하지 않으면 안 정해진 것이다.** 출처는 git이 갖는다.

**지우기 전에 해야 하는 일이 있다.** 쌓인 29줄(ms-001 18 · ms-002 9 · ms-003 2)이 전부 반영됐는지 전수로 확인한다. **반영 안 된 것을 지우면 그건 잃는 것이고, 그 확인이 곧 새 규칙의 첫 실행이다.**

**무엇이 되면 끝인가:** 29줄이 전부 반영됐거나 반영됐고, `decisions.md`와 `reap decide`가 코드·spec·skill·씨앗·테스트 어디에도 없다.

## References

- `gen-0024-exec` — 같은 task를 결정 체제를 **짓는** 쪽으로 열었다가 abort했다. 사람의 판단이 반대였다

## Outcome

**결정 로그 제도가 사라졌다.** `decisions.md`도 `reap decide`도 코드·spec·skill·씨앗 어디에도 없다.

### 감사 결과 — 29줄 중 둘이 미반영이었다

지우기 전에 전수로 확인했다. **27줄은 이미 spec·genome·memory에 반영되어 있었다** — 그 자체가 "정해진 것은 반영된다"가 이미 대체로 돌고 있었다는 증거다. 미반영 둘은 먼저 spec에 올렸다.

| 미반영이던 것 | 올린 곳 |
|---|---|
| **레지스트리 셀은 HTML 엔티티로 이스케이프한다** (`&`→`&amp;` · `\|`→`&#124;` · 개행→`&#10;`) | `03-storage.md`. 이스케이프 **순서**까지 적었다 — 쓸 때 `&`를 먼저, 읽을 때 마지막에 되돌린다. 코드(`id.ts`)와 대조해 확인했다 |
| **훅의 타임아웃은 `hooks.json`이 선언하고 스크립트는 시간을 재지 않는다** | `08-delivery.md`. 스크립트 안에서 `timeout`을 쓰면 그 명령이 없는 환경에서 훅이 깨지고, 그것은 세션 시작을 막는 것과 같다 |

하나는 반영하지 않았다 — `gen-0005-plan`의 "ctx는 스코프 둘을 갖는다"는 `gen-0006-plan`이 뒤집었다. **뒤집힌 결정을 반영하는 것은 되살리는 것이다.**

### 새 규범을 세웠다

`05-knowledge.md`에 **"결정 로그를 두지 않는다"** 절을 더했다. 제도만 지우고 이유를 안 남기면 다음 세대가 다시 만든다.

핵심은 셋이다. **(1)** 27줄 중 milestone 안에서만 유효한 것은 사실상 0이었다 — 전부 spec에 있었어야 할 것이 밖에 있었다. **(2)** 로그는 어긋남을 **막은 것이 아니라 견딜 만하게 만들어** 오래 살렸다(`gen-0021-fix`가 고친 것이 그 어긋남이다). **(3)** 반영은 같은 자리를 고치는 일이라 **어긋남이 고칠 때 드러난다.**

### 걷어낸 곳

코드 둘(`entries.ts`·`ctx.ts`) · spec 여섯 · skill 셋(`evolve`·`complete`·`record-vocabulary`) · 씨앗 둘 · 테스트 둘 · 파일 셋.

**`evolve`와 `complete`에서 결정을 이월하라던 자리는 비우지 않고 대체 규칙을 넣었다** — 비우면 agent가 예전 습관으로 돌아간다. 이제 그 자리는 "정한 것은 그것이 규율할 자리에 **반영한다**. 로그에 적어두고 나중에 반영하는 길은 없다"라고 말한다.

`bk-394d82`를 닫았다 — **자리를 만들어서가 아니라 물음이 사라져서다.**

## 검증

- 실패하는 테스트 둘을 먼저 쓰고 각각 빨간 것을 확인한 뒤 코드를 고쳤다
- `bun test` 98 · `typecheck` 0 · `./tests/hook.test.sh` 통과
- `bun run build` 후 **빈 임시 프로젝트 왕복** — `init` → `make milestone`(`milestone.md`·`handoff.md` 둘) → `make generation` → `ctx` 상태 줄까지 확인
- `grep -rn 'decisions\.md|reap decide'`의 잔여는 전부 새 규범 서술이거나 회귀 방지 테스트다
- `src/templates/map.md`와 `.reap/map.md`는 여전히 byte-identical

## 남은 것

**플러그인이 낡았다.** `evolve`·`complete`·`record-vocabulary.md`가 바뀌었으므로 설치본이 리포와 다르다. 새 세션에만 영향을 주므로 **`ms-003`을 닫기 전에 `localUpdate`로 한 번에 반영한다** — task마다 재설치하면 왕복만 는다.

---
id: gen-0003-exec
slug: ctx-조립
type: exec
milestone: ms-001
title: ctx 조립
startedAt: 2026-08-22T15:52:28Z
startCommit: a2536ef
status: closed
closedAt: 2026-08-22T15:55:52Z
endCommit: e2c9f6d
---

## Intent

세션이 열릴 때 **읽을 것을 조립하는 쪽**을 만든다. 지금은 아무리 기록을 잘 남겨도 다음 세션이 그것을 자동으로 보지 못한다 — `ctx`가 없으면 REAP의 한 바퀴는 닫히지 않는다.

`ctx.ts`의 `assemble(root, milestone?)`와 `reap ctx [--milestone <ms-id>] [--hook]`.

**끝나는 지점:** `bun test` 통과 · `typecheck` 0 · `./dist/reap ctx --hook | python3 -c 'import json,sys; json.load(sys.stdin)'`이 통과하고, 이 리포에서 `ctx`가 ms-001의 맥락을 실제로 싣는다.

이 증분에서는 plan source 규약 색인과 `idea/` 목록을 싣지 않는다 — 둘 다 아직 없다.

## References

- ms-001 Task 1.3 — 인터페이스, 증명해야 할 동작, 완료 판정
- [agent가 REAP를 쓰는 법](../../../docs/superpowers/specs/reap/06-agent.md) — ctx가 조립하는 것과 그 이유
- gen-0002-exec (`52206c3`) — `doc.listEntries`/`findEntry`, `store.readSession`이 재료다

## Outcome

Task 1.3 완료 (`0f96dc0`). `bun test` 74개 통과 · `typecheck` 0 · `./dist/reap ctx --hook | python3 -c 'json.load(sys.stdin)'` 통과.

- `ctx.ts` — `assemble(root, milestone?)`와 `hookEnvelope(context)`
- 조립 순서: genome 전체 → `environment/summary.md` → memory 전체 → milestone 넷(`milestone.md`·`context.md`·`decisions.md`·`handoff.md`) → **바인딩된 열린 세대의 기록**
- 각 조각에 `<!-- 상대경로 -->` 출처를 붙인다. 어디서 온 문장인지 모르면 agent는 그것을 고칠 수도 없다
- 빈 파일은 싣지 않는다. 없는 파일과 같은 취급이다

**계획에 없었지만 넣은 것 — 바인딩된 열린 세대의 기록.** spec의 `ctx` 목록에는 없다. 넣은 근거는 [기록 어휘](../../../plugin/skills/shared/references/record-vocabulary.md)가 기록의 존재 이유로 못박은 문장이다: "세션이 중간에 죽거나 다른 세션으로 넘어갈 때 필요한 것이 정확히 이 세대가 무엇을 하려던 중이었나." 그것이 주입되지 않으면 Intent를 적는 값이 실현되지 않는다. 닫힌 기록은 싣지 않는다.

## Observations

**조립된 맥락이 17,346자다** (대략 6~8k 토큰). 분해하면 `milestone.md` 하나가 15,868자 — 전체의 92%다. ms-001이 Task 1.1~1.4의 인터페이스·함정·완료 판정을 전부 담은 큰 문서이기 때문이다.

이것이 증분 1이 끝나고 사람에게 물을 것 1번("주입되는 맥락이 너무 많은가, 적은가")의 실제 데이터다. 관찰만 남기고 지금 손대지 않는다 — 고칠 방향이 셋이나 되고(milestone을 잘게 자른다 / `ctx`가 milestone 본문을 요약한다 / 계획 상세를 별도 파일로 빼고 `ctx`는 빼둔다) **어느 쪽이 맞는지는 실제로 써본 사람만 안다.**

## Notes

`make milestone`은 `focus`를 세우지 않고(`mark milestone --focus`는 증분 1의 범위 밖) `make generation`이 세션에 바인딩하므로, 실제 흐름에서 milestone은 바인딩으로 잡힌다. focus는 사람이 손으로 세울 때를 위해 **읽는 쪽만** 있다.

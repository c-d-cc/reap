---
id: gen-0047-exec
slug: loop-도구
type: exec
milestone: ms-012
backlog: bk-8800cc
title: make loop · mark loop · --plan 거부
startedAt: 2026-08-30T14:26:27Z
startCommit: f2ca44f
status: closed
closedAt: 2026-08-30T14:30:29Z
endCommit: d13bce2
---
## Intent

`ms-012` 12.1·12.2 — `make loop`·`mark loop`·`--plan` 거부·상태 줄. `bk-8800cc`(손으로 한 마찰)를 소비한다. 손으로 쓴 `loop-0001`이 대조군이다.

## Outcome

- `id.ts` — `loop` 계열(`loop-NNNN-<plan|design|uiux|idea>`), 레지스트리 `sequence/loop.md`. `gen-NNNN-plan`은 파싱만 남고 발급은 `entries.ts`가 막는다
- `store.ts`·`doc.ts` — `plan/loops/`·`archive/loops/`, `listEntries("loop")`는 두 곳을 본다
- `entries.ts` — `makeLoop`(세션 바인딩 없음, `from`은 검사 안 함), `markLoop`(`--closed`는 파일을 남기고 닫힌 것이 `CLOSED_LOOPS_KEPT`=10을 넘으면 `closedAt` 순으로 archive, `--aborted`는 삭제). `make generation --plan`은 `make loop`를 가리키며 거부
- `ctx.ts` — `열린 loop: <id> <제목> — <경로>` 한 줄씩
- `doc.ts` — **빈 목록 왕복**. `milestones: []`를 쓰면 `key:`로 나가 읽을 때 사라졌다. `key: []`로 쓰고 읽는다 — `key:`(값 없음)와 `key: []`(빈 목록)를 가른다
- 템플릿 `loop.md`. 테스트 `tests/loop.test.ts` 12개, 기존 `--plan` 테스트 5개 정리. 127 통과
- 이 리포에서 `make loop --type idea` → 상태 줄 → `--aborted`로 한 바퀴 확인. `loop-0001`(손으로 쓴 것)을 `listEntries`가 그대로 읽는다

## Dead Ends

`milestones`를 만들 때 안 쓰고 닫을 때만 쓰는 길 — 손으로 쓴 `loop-0001`과 모양이 달라진다. 대조군을 따랐고 그래서 빈 목록 왕복을 고쳤다.

## Open Questions

`ms-012`의 것 그대로 — `from` 복수, loop의 handoff.

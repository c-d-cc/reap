---
id: gen-0041-exec
slug: plan-최상위
type: exec
milestone: ms-010
title: plan/을 최상위로 올린다
startedAt: 2026-08-23T06:20:40Z
startCommit: b50d575
status: closed
closedAt: 2026-08-23T06:24:09Z
endCommit: aca9c21
---
## Intent

`ms-010`의 10.1. **spec은 `.reap/plan/`인데 코드는 `vision/plan`을 만든다.** `gen-0040-plan`이 spec만 고치고 코드를 손대지 않아 생긴 어긋남이고, 그 위에 `make track`을 지으면 어긋남이 하나 더 는다.

**끝나는 조건:** `store.ts`의 `DIRS`·`paths()`, 씨앗 `map.md` 둘, 이 리포의 실제 `.reap/vision/plan/`이 함께 옮겨진다. `tracks/`와 `archive/tracks/` 자리도 함께 만든다 — 10.2가 쓸 자리다.

## Outcome

**`plan/`이 최상위로 섰다.** `store.ts`의 `DIRS`와 `paths()`, 이 리포의 실제 디렉토리(`git mv`), 씨앗 `map.md` 둘, `environment/summary.md`가 함께 옮겨졌다. **10.2가 쓸 자리도 함께 만들었다** — `plan/tracks/`와 `archive/tracks/`, 그리고 `paths().planTracks`·`archiveTracks`.

씨앗 `map.md` 둘은 **바이트 동일**을 유지했다(`diff` 확인). `vision/` 설명에서 `계획(plan)`을 빼고, 3단 밖인 이유를 한 문단으로 넣었다.

**`mark milestone --focus`가 초점을 더하기만 하던 것을 고쳤다.** `focusOn`이 다른 milestone의 `focus`를 지우고 대상에만 찍는다. `make milestone --focus`도 같은 길을 탄다. 이것을 실제로 밟은 것이 이 세대의 시작이었다 — `ms-005`에서 `ms-010`으로 초점을 옮기려는데 둘 다 켜진 채로 남았고, `ctx`의 `pickMilestone`은 `find`로 먼저 걸리는 것을 고르므로 **틀린 milestone을 싣고도 아무 데도 드러나지 않았을** 상황이었다.

곁가지로 잘못 놓인 doc 주석 하나를 옮겼다 — `markMilestone`을 설명하는 주석이 `markBacklog` 위에 얹혀 있었다.

**검증:** `bun test` 116통과 · `typecheck` 0 · `hook.test.sh` 전부 통과.

## Notes

**`mark milestone --focus`가 초점을 옮기지 않고 더한다.** `ms-010`으로 옮기려는데 `ms-005`의 `focus: true`가 그대로 남아 손으로 지웠다. `pickMilestone`은 `find`로 첫 개를 고르므로 둘이 켜져 있으면 조용히 엉뚱한 것을 고른다. **한 편집으로 끝나는 일이라 세대를 따로 열지 않고 여기서 함께 고친다.**

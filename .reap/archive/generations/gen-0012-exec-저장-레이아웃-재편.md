---
id: gen-0012-exec
slug: 저장-레이아웃-재편
type: exec
milestone: ms-002
title: 저장 레이아웃 재편 — vision·life·archive
startedAt: 2026-08-23T00:36:38Z
startCommit: 0f97ecd
status: closed
closedAt: 2026-08-23T00:43:14Z
endCommit: 1c01307
---

## Intent

Task 2.1 — `.reap/`의 레이아웃을 vision · life · archive 3단으로 바꾼다.

```
plan/ memory/ milestones/  →  vision/ 아래
backlog/                   →  life/ 아래
(신설) life/generations/       세대가 milestone 디렉토리에서 나온다
archive/<ms>/              →  archive/milestones/<ms>/ + archive/generations/
```

**끝나면:** `init`이 새 구조를 만들고, `bun test`·`typecheck`·`hook.test.sh`가 통과하고,
경로를 조립하는 곳이 `store.ts` 하나뿐이다.

**이 세대가 옮기지 않는 것:** 이 리포의 실제 `.reap/` 내용물. 그것은 Task 2.4이고
2.1~2.3이 다 선 뒤다. **옛 구조 위에서 새 구조를 만든다.**

id 계열(`gen-NNNN-type`)은 Task 2.2다. 여기서는 경로만 다룬다.

## References

- `tasks/2-1-저장-레이아웃-재편.md` — 함정과 판정
- ps-4f2a91 `03-storage.md` — "최상위를 가르는 것은 유형이 아니라 시간이다"

## Outcome

`.reap/`가 vision · life · archive 3단으로 섰다. **경로를 조립하는 production 코드가 `store.ts` 하나뿐이다** — 이것이 이 task의 실제 판정이었고, 시작할 때 셋(`id.ts` · `templates.ts` · `cli.ts`) 있던 것이 0이 됐다.

`cli.ts`에 남은 `.reap/...` 문자열 셋은 경로 조립이 아니라 **출력 문자열과 `.gitignore` 한 줄**이다. `SEEDS`의 키가 바뀌면 출력도 따라 바뀌므로 손댈 것이 없다.

**세대가 milestone 디렉토리에서 나왔다.** `makeGeneration`이 유형과 무관하게 `life/generations/`에 놓고, `listEntries`는 exec와 plan을 같은 두 곳(`life/generations` · `archive/generations`)에서 찾는다 — 유형을 가르는 것은 이제 디렉토리가 아니라 id다. `makeMilestone`도 `generations/` 하위를 만들지 않는다.

`bun test` 79 (77 → +2) · `typecheck` 0 · `hook.test.sh` 5/5.

손으로 한 바퀴: 빈 리포에서 `init` → 트리 확인 → `make milestone` → `make generation` exec·plan 둘 → 둘 다 `life/generations/`에 · milestone 디렉토리에는 문서 넷만 · `ctx`가 새 경로를 냄.

## Notes

**기존 테스트 21개가 깨졌고 전부 옛 경로를 손으로 만들던 것이었다.** 깨진 것이 곧 "경로를 아는 곳"의 목록이라 고칠 자리를 찾는 데 따로 품이 안 들었다.

빈 디렉토리 문제는 증분 1과 같은 방식을 따랐다 — `.gitkeep`을 두지 않는다. `init`이 만들고 git은 추적하지 않으며, 내용이 생기면 그때 추적된다.

## Dead Ends — "마이그레이션은 반드시 마지막"이 틀렸다

task 2.4를 마지막에 둔 전제는 *2.1~2.3 동안 이 리포가 옛 구조 위에서 굴러간다*는 것이었다. **굴러가지 않는다.**

`dist/reap`를 다시 빌드하는 순간 도구가 자기 리포를 못 읽는다. 확인한 것 셋:

```
reap ctx                        → 상태 줄이 비었다 (milestone도 기억도 없음)
reap make generation --milestone ms-002  → milestone을 찾지 못했습니다: ms-002
reap mark generation gen-0012-exec --closed   → generation을 찾지 못했습니다: gen-0012-exec
```

그래서 이 세대는 **손으로 닫았다.** 2.2·2.3 세대는 열 수조차 없다.

"빌드하지 않고 옛 바이너리를 쓰면 된다"는 답은 지킬 수 없다 — `reapdev.localUpdate` skill이 바로 그 빌드를 하고, 세 세대 동안 아무도 안 밟기를 기대하는 규율은 조용히 깨진다.

**REAP는 자기 자신으로 만들어진다.** 도구가 자기 리포에서 세 task 동안 죽어 있는 것은 부트스트랩의 전제를 부수는 것이다.

## 남은 것

`life/generations/`가 생겼지만 id는 아직 `gen-0001-exec`·`gen-0004-plan`이다. `gen-NNNN-type`은 Task 2.2다.

**플러그인 skill과 훅은 아직 옛 경로를 말한다.** 이 리포의 `.reap/`도 옛 구조 그대로이므로 지금은 서로 맞다. 둘을 함께 옮기는 것이 Task 2.4다.

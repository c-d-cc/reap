---
type: task
status: pending
priority: medium
createdAt: 2026-08-20T12:40:44.210Z
---

# checkAutoUpdateGuard 는 호출되는 곳이 없다 — 배선할 것인가 지울 것인가

## Problem

`checkAutoUpdateGuard()` (`src/cli/commands/check-version.ts`) 는 **`src/` 어디에서도 호출되지
않는다.** 확인:

```
$ grep -rn "checkAutoUpdateGuard" src
src/cli/commands/check-version.ts:  (정의부뿐)
```

그런데 같은 파일의 `execute()` doc comment 는 gen-092 가 고치기 전까지
*"Check autoUpdateMinVersion guard (fallback for non-autoUpdate projects)"* 라고 적어
**실행되는 것처럼 서술**하고 있었다. gen-092 는 주석만 사실에 맞췄고 배선 여부는 건드리지 않았다
(scope 밖).

따라서 `autoUpdateMinVersion` 하한은 실질적으로 `performAutoUpdate` 5단계에서만 강제된다.
그 단계에 도달하려면 **(a) dev/alpha 가 아니고 (b) 네트워크가 되고 (c) 더 새 버전이 존재**해야
하므로, **이미 최신인 사용자는 하한 경고를 영원히 보지 못한다.** "낡은 버전을 쓰는 사람에게
알린다"가 이 기능의 목적이었다면 그 목적은 지금 달성되지 않는다.

gen-085 의 테스트 주석도 이 함수를 *"the only guard this reaches"* 라고 부르며 살아있는 것으로
전제하고 있다 (`tests/unit/check-version.test.ts`).

## Solution

**둘 중 하나를 고르고 근거를 적을 것. 지금 상태(정의는 있고 호출은 없음)만은 유지하지 말 것.**

1. **배선한다** — `execute()` 에서 `performAutoUpdate` 가 upgrade 를 수행하지 **않은** 경우에만
   호출. 비용을 먼저 재라: `queryAutoUpdateMinVersion()` 은 `npm view` **네트워크 호출**이고
   `execute()` 는 **매 SessionStart 에 돈다**. `performAutoUpdate` 가 dev-build/네트워크 실패로
   일찍 반환한 경로에서 추가 네트워크 호출을 붙이는 것이 정당한지 판단해야 한다.
2. **지운다** — 하한 강제는 `performAutoUpdate` 5단계로 충분하다고 판단되면 함수와 그것을
   전제한 테스트 주석을 함께 정리한다.

판단 기준: **"최신 버전을 쓰고 있어서 auto-update 가 일어나지 않는 사용자에게 하한 경고를
보여줄 필요가 있는가?"** — 있다면 1, 없다면 2.

gen-092 가 남긴 것: 이 함수에는 이미 `GuardDeps` 주입 seam 과 unit test 3종이 있으므로
어느 쪽을 고르든 검증 비용은 낮다.

## Files to Change

- `src/cli/commands/check-version.ts` — `checkAutoUpdateGuard` / `execute()`
- `tests/unit/check-version.test.ts` — 선택에 따라 테스트 추가 또는 제거
  (gen-085 이 남긴 *"the only guard this reaches"* 주석도 함께 갱신)

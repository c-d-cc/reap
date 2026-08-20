---
type: task
status: pending
priority: low
createdAt: 2026-08-20T13:39:28.858Z
---

# reap uninstall 이 판정 불가를 판정으로 말한다 — 'a unknown install'

## Problem

`detectInstallKind` 가 `unknown` 을 돌려줄 때 `reap uninstall` 의 confirm prompt 가 이렇게 말한다
(gen-092 evaluator 가 npm 을 PATH 에서 빼고 실측):

```
"installKind": "unknown"
"… does NOT touch npm — this copy of REAP is a unknown install, so the package is
 left for you to remove with 'npm uninstall -g …'."
```

문제 둘:

1. **판정을 단정한다.** `unknown` 의 뜻은 *"어느 종류인지 알 수 없다"* 인데 문장은
   *"이 사본은 unknown 설치다"* 라고 **종류를 말한다**. 실측 당시 그 사본은 실제로는
   `local` 모양이었다. gen-091 이 층2 게이트에서 고친 것과 같은 모양 —
   **부재/미상을 원인으로 단정하는 문장.**
2. `a unknown` (관사).

**동작은 옳다** — 모든 비-`global` kind 에서 npm 을 부르지 않는 것은 보수적이고 정확하다.
`--confirm` 경로의 마지막 줄(*"If either package is still installed…"*)도 참이다.
틀린 것은 prompt 한 줄뿐이다.

**gen-090 이 쓴 문구이고 gen-092 는 건드리지 않았다** (`git diff` 로 확인). strictEdit 범위 밖이라
backlog 로 넘긴다.

## Solution

`unknown` 만 별도 문장을 갖게 한다. 나머지 넷은 종류를 말해도 참이다.

```
kind === "unknown"
  → "… does NOT touch npm — REAP could not determine how this copy was
     installed, so the package is left for you to remove with '<command>'."
```

그 외 kind 는 현재 문장 유지 + 관사만 정리(`a local` / `an npx` …). 하드코딩된 `a ${kind}` 를
kind 별 문구 함수로 바꾸는 것이 깔끔하다 — gen-092 가 `upgradeCommandFor(kind)` 를
같은 이유로 만들었으므로 그 패턴을 따를 것.

검증: `detectInstallKind` seam 으로 kind 를 주입해 각 문구를 단언. **`unknown` 문구가
kind 이름을 포함하지 않는 것**을 단언할 것 — 두 상태를 분리하는 형태여야 한다.

## Files to Change

- `src/cli/commands/uninstall.ts` — `execute()` 의 confirm prompt `message`
- `tests/unit/uninstall.test.ts` 또는 `tests/e2e/` — kind 별 문구 고정

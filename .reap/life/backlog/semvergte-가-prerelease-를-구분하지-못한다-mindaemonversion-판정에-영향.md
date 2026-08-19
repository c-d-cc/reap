---
type: task
status: pending
priority: low
createdAt: 2026-08-19T01:46:10.224Z
---

# semverGte 가 prerelease 를 구분하지 못한다 — MIN_DAEMON_VERSION 판정에 영향

## Problem

`semverGte` (`src/cli/commands/check-version.ts:12`) 는 `.` 으로 쪼개 `Number()` 로 비교한다:

```ts
const pa = a.split(".").map(Number);
```

`"0.2.0-beta.1"` 은 `[0, 2, NaN, 1]` 이 되고, `NaN` 비교가 전부 false 라 **`"0.2.0"` 과 동등하게 취급되어 통과**한다.

gen-083 이 이 helper 에 새 소비자를 붙였다 — `resolveDaemonAvailability` 의 `MIN_DAEMON_VERSION` 판정. 이 저장소는 실제로 alpha 를 발행하므로(`scripts/alpha-publish.sh`) 가상의 문제가 아니다: prerelease daemon 이 정식판과 구분되지 않는다.

기존 소비자(`autoUpdateMinVersion` 판정)도 같은 성질을 갖고 있으나 gen-083 이전에는 아무도 지적하지 않았다.

## Solution

두 방향이 있다.

- **(A) `semverGte` 를 prerelease 인지하게 고친다** — semver 규격상 prerelease 는 같은 버전의 정식판보다 **낮다**. 소비자 2곳(autoUpdate / daemon)이 모두 이 의미를 원하므로 helper 를 고치는 편이 옳다. 다만 autoUpdate 동작이 바뀌므로 회귀 확인 필요
- **(B) 소비자마다 정책을 정한다** — 복잡도만 늘어난다. 권하지 않음

(A) 를 택하되 **먼저 실패시킬 것**: `"0.2.0-beta.1" >= "0.2.0"` 이 현재 true 임을 unit 으로 고정한 뒤 고친다.

## Files to Change

- `src/cli/commands/check-version.ts` (`semverGte`, L12)
- `tests/unit/check-version.test.ts` — prerelease 케이스 추가
- 소비자 회귀 확인: `src/cli/commands/daemon/client.ts` (`resolveDaemonAvailability`), `check-version.ts` 내 autoUpdate 판정

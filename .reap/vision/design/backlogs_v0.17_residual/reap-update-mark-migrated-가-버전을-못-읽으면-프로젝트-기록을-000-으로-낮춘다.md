---
type: task
status: pending
priority: medium
createdAt: 2026-08-20T13:24:14.524Z
---

# reap update --mark-migrated 가 버전을 못 읽으면 프로젝트 기록을 0.0.0 으로 낮춘다

## Problem

`reap update --mark-migrated` 는 `packageVersion()` 을 그대로 기록한다
(`src/cli/commands/update.ts:207` → `markMigratedNow(paths, version)`, 기록은
`update.ts:148-159` 에서 **무조건** `config.lastMigratedVersion = version`).

`packageVersion()` 은 패키지 루트를 찾지 못하면 `UNKNOWN_VERSION`(`"0.0.0"`)을 돌려준다.
따라서 그 상황에서 `--mark-migrated` 는 프로젝트의 기록을 **낮춘다**. 그 다음부터
`detectPendingMigrations` (`src/core/migration.ts:113`) 가 **모든 migration note 를 다시**
surface 한다.

**회귀는 아니다** — gen-092 가 지운 `update.ts` 의 지역 `getPackageVersion()` 도 `"0.0.0"` 으로
폴백했고, `version` 필드가 없는 `package.json` 에서는 `undefined` 를 돌려줘 더 나빴다.
새로운 것은 **결함이 아니라 그것을 볼 수 있게 된 것**이다: gen-092 가 "행동을 결정하는 소비자는
placeholder 를 진짜 버전으로 읽으면 안 된다"를 `runningVersionOrNull` 로 명문화하면서,
**기록을 남기는 소비자**가 같은 모양으로 남아 있음이 드러났다 (evaluator round 2, L2).

## Solution

`markMigratedNow` 호출 지점에서 placeholder 를 **거절**한다. `core/package-info.ts` 에
`packageVersionOrNull()` 을 추가하거나(이미 `runningVersionOrNull` 이 같은 패턴이다),
호출부에서 `UNKNOWN_VERSION` 과 비교해 거절하고 그 사실을 `emitOutput` 으로 알린다.

**"기록하지 않는다"가 옳은 동작이다** — 버전을 모르는 채 "여기까지 migration 됨"을 적는 것은
사실이 아닌 것을 사용자 파일에 쓰는 것이다. 조용히 넘어가지 말고 status/message 로 말할 것.

검증: 주입 seam 으로 해석 불가능한 루트를 만들고 `--mark-migrated` 가 **기존 값을 낮추지 않는지**
단언. gen-092 가 `InstallKindDeps` seam 을 남겨놨으므로 비용이 낮다.

### 함께 판단할 것 — `"0.0.0"` 은 **서로 다른 두 사실**의 철자다

`grep -rn '"0\.0\.0"' src` 는 두 종류를 섞어서 보여준다:

| 의미 | 위치 |
|---|---|
| **버전을 알 수 없다** | `core/package-info.ts` 의 `UNKNOWN_VERSION`, `update.ts:318`(gen-092 가 상수로 교체), `migration.ts:111` 의 `currentVersion === "0.0.0"` |
| **한 번도 migration 되지 않았다** | `migration.ts:113`, `update.ts:156`, `update.ts:359`, `types/index.ts:123` |

**search-and-replace 로 통합하지 말 것.** 두 사실이 우연히 같은 철자를 쓸 뿐이며, 하나를 바꿔야
할 날 다른 하나가 따라가면 안 된다 (longterm: *"직전 세대의 처방을 닮은꼴에 재사용하지 마라"*).
정리한다면 **이름을 둘 주는 것**이 답이다 — 예: `UNKNOWN_VERSION` / `NEVER_MIGRATED`.

`migration.ts:111` 만은 첫 번째 의미이므로 `UNKNOWN_VERSION` 을 import 하는 것이 맞다.
gen-092 는 `migration.ts` 가 strictEdit 범위 밖이라 손대지 않았다.

## Files to Change

- `src/cli/commands/update.ts` — `markMigratedNow` 호출부 (`:207`), 필요 시 `:148-159`
- `src/core/package-info.ts` — `packageVersionOrNull()` (선택)
- `src/core/migration.ts` — `:111` 의 리터럴을 `UNKNOWN_VERSION` 으로, `:113` 은 **그대로 둘 것**
- `src/types/index.ts` — 두 이름을 분리한다면 `lastMigratedVersion` 주석
- `tests/unit/` + `tests/e2e/update-migration.test.ts` — 낮추지 않음을 고정

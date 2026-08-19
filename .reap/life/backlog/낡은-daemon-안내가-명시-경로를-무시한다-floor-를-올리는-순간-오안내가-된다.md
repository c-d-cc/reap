---
type: task
status: pending
priority: medium
createdAt: 2026-08-19T04:13:12.997Z
---

# 낡은 daemon 안내가 명시 경로를 무시한다 — floor 를 올리는 순간 오안내가 된다

## Problem

낡은 daemon 에 대한 안내가 세 곳(`src/core/integrity.ts`, `src/core/prompt.ts`, `src/cli/commands/daemon/index.ts`) 모두 무조건 `Upgrade with: npm i -g @c-d-cc/reap-daemon` 이라고 말한다.

**그런데 daemon 이 `daemonBin` / `REAP_DAEMON_BIN` 에서 온 것이라면 전역 업그레이드는 아무 효과가 없다.** reap 은 계속 그 명시 경로를 쓴다. 사용자는 안내대로 업그레이드하고, 다시 같은 경고를 받고, 무엇이 잘못됐는지 알 방법이 없다.

**현재는 도달 불가능하다** — `MIN_DAEMON_VERSION` 이 `0.2.0` 이고 0.2.0 이 daemon 의 최초 발행본이므로 "설치됨 + 낡음" 상태가 존재할 수 없다. **floor 를 0.3.0 으로 올리는 순간 실현된다.**

gen-084 의 evaluator 가 지적했고, gen-084 는 **의도적으로 고치지 않았다**: 도달 불가능한 분기라 어떤 테스트도 그것을 실행할 수 없어, 검증되지 않은 코드를 배포하게 된다. `MIN_DAEMON_VERSION` 을 올리는 세대가 함께 처리하는 것이 맞다.

## Solution

gen-084 가 이미 `DaemonAvailability.source` 를 값에 실어 놓았으므로 분기 하나면 된다.

- `source` 가 `"env"` 또는 `"config"` 면 → "그 경로의 daemon 이 낡았다. 그 위치를 업그레이드하거나 `daemonBin` 을 새 위치로 바꿔라" 로 말한다. `explicitMiss` 안내가 이미 쓰는 것과 같은 패턴(빗나감이면 경로를 지목, 아니면 일반 안내).
- `source` 가 `"package"` / `"checkout"` 이면 기존 문구 그대로.

**같이 처리할 것**: `MIN_DAEMON_VERSION` 을 올리면 "설치됨 + 낡음" 이 처음으로 도달 가능해지므로, 그때 게이트에 낡은 daemon 시나리오를 넣을 수 있다 — 지금은 넣을 수 없다.

**인접 backlog 2건과 묶어서 판단할 것**:
- `semvergte-가-prerelease-를-구분하지-못한다-...` — 같은 `resolveDaemonAvailability` 판정 영역
- `mindaemonversion-을-올릴-때-그-버전이-실제로-발행됐는지-검사하는-게이트` — 바로 그 floor 인상 시점의 게이트

셋이 전부 "floor 를 올릴 때" 발동하므로 한 세대에서 함께 닫는 것이 자연스럽다.

## Files to Change

- `src/core/integrity.ts` — `checkDaemonAvailability` 의 `outdated` 분기
- `src/core/prompt.ts` — "installed version too old" 절
- `src/cli/commands/daemon/index.ts` — `requireUsableDaemon` 의 `outdated` 분기
- `tests/unit/integrity-daemon.test.ts`, `tests/unit/prompt-daemon.test.ts` — `source` 별 문구 분기
- `scripts/check-self-diagnosis.sh` — floor 인상 후에야 가능한 낡은-daemon 시나리오

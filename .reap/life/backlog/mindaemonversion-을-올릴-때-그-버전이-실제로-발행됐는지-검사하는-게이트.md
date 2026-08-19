---
type: task
status: pending
priority: medium
createdAt: 2026-08-19T01:46:10.266Z
---

# MIN_DAEMON_VERSION 을 올릴 때 그 버전이 실제로 발행됐는지 검사하는 게이트

## Problem

gen-083 이 `MIN_DAEMON_VERSION` (`src/cli/commands/daemon/client.ts`) 을 도입했다. `daemon: true` 인데 설치된 daemon 이 이 값보다 낮으면 reap 이 **업그레이드하라고 지시**한다.

지금은 `MIN_DAEMON_VERSION` 과 daemon 의 실제 버전이 둘 다 `0.2.0` 이라 판정이 걸리는 경우가 없다. **위험은 그 반대 방향에 있다** — 하한을 올리면서 그 버전을 npm 에 발행하지 않으면, reap 이 모든 사용자에게 **존재하지 않는 버전으로 올리라고 지시**한다. 어떤 검사도 이것을 잡지 않는다.

이것은 gen-083 이 고친 결함과 **정확히 같은 종류**다: 설정이 가리키는 대상이 실재하지 않는데 그 사실을 아무도 확인하지 않는 상태. 하한이 유의미해지는 순간이 곧 틀릴 수 있게 되는 순간이다.

## Solution

릴리즈 게이트에 검사를 추가한다 — 지시문이 아니라 실행 가능한 검사여야 한다 (genome § *"반복 누락은 지시가 아니라 검사로 막는다"*).

- `scripts/check-docs-version.sh` 또는 신설 스크립트에서 `npm view @c-d-cc/reap-daemon versions` 를 조회해 `MIN_DAEMON_VERSION` 이 **발행된 버전 목록에 있는지** 확인
- `.github/workflows/release.yml` 의 reap `publish` job, `npm publish` **앞**에 배치
- 네트워크 실패 시 어떻게 할지 결정 필요 — 조용한 통과는 검사를 무력화한다. amber SKIP + 명시적 출력이 `check-self-diagnosis.sh` 의 기존 선례
- 값을 스크립트가 소스에서 읽게 할 것. 스크립트에 숫자를 복사하면 두 번째 소유자가 생겨 gen-083 이 피한 문제를 다시 만든다

**먼저 실패시킬 것**: `MIN_DAEMON_VERSION` 을 미발행 버전으로 임시 변경해 검사가 red 가 되는지 확인.

## Files to Change

- `scripts/check-docs-version.sh` (또는 신설 `scripts/check-daemon-floor.sh`)
- `.github/workflows/release.yml` — reap `publish` job
- `src/cli/commands/daemon/client.ts` — `MIN_DAEMON_VERSION` (읽기 대상, 수정 아님)

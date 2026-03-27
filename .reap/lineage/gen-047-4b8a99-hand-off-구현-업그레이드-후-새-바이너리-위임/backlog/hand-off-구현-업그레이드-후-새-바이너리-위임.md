---
type: task
status: consumed
consumedBy: gen-047-4b8a99
consumedAt: 2026-03-27T14:43:56.313Z
priority: high
createdAt: 2026-03-27T14:34:25.811Z
---

# hand-off 구현 — 업그레이드 후 새 바이너리 위임

## Problem

autoUpdate로 npm install이 성공해도, 현재 프로세스는 구 바이너리다. 구 코드가 프로젝트 동기화를 하면 새 버전의 변경사항이 반영되지 않는다. v0.15에서는 hand-off로 새 바이너리에 `--post-upgrade` 플래그를 넘겨 새 코드가 동기화를 수행했다.

## Solution

v0.15의 handOffToNewBinary() 패턴 이식:
1. `check-version.ts`의 `performAutoUpdate()`에서 npm install 성공 후: `reap update --post-upgrade`를 execSync로 실행 (stdio: inherit, timeout: 120s)
2. `update.ts`에 `--post-upgrade` 플래그 지원: selfUpgrade skip, 프로젝트 동기화만 수행
3. hand-off 실패 시 fallback: 현재 바이너리로 `reap update` 실행 (이미 있음)

v0.15 참조: ~/cdws/reap_v15/src/cli/commands/update.ts:105-117 (handOffToNewBinary)

## Files to Change

- src/cli/commands/check-version.ts — performAutoUpdate()에 hand-off 추가
- src/cli/commands/update.ts — --post-upgrade 플래그 지원
- src/cli/index.ts — update 명령에 --post-upgrade 옵션 추가

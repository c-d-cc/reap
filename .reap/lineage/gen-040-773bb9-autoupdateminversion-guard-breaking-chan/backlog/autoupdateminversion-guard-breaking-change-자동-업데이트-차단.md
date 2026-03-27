---
type: task
status: consumed
consumedBy: gen-040-773bb9
consumedAt: 2026-03-27T12:25:58.735Z
priority: high
createdAt: 2026-03-27T12:14:37.440Z
---

# autoUpdateMinVersion guard — breaking change 자동 업데이트 차단

## Problem

v0.15에는 npm registry의 `reap.autoUpdateMinVersion` 필드를 체크해서 breaking change가 포함된 버전으로 자동 업데이트를 차단하는 guard가 있었다. v0.16에는 이 기능이 없어서, breaking change가 있는 새 버전이 나오면 사용자가 인지하지 못한 채 업데이트될 위험이 있다.

## Solution

1. package.json에 `reap.autoUpdateMinVersion` 필드 추가 (npm registry 메타데이터로 활용)
2. postinstall 또는 SessionStart hook에서 설치된 버전 vs autoUpdateMinVersion 비교
3. 설치된 버전 < minVersion이면 경고 + `npm install -g @c-d-cc/reap@{minVersion}` 안내
4. v0.15 참조: `src/cli/commands/update.ts`의 `selfUpgrade()`, `forceUpgrade()`, `queryAutoUpdateMinVersion()`

## Files to Change

- `package.json` — `reap.autoUpdateMinVersion` 필드 추가
- `src/cli/commands/check-version.ts` — 버전 비교 + 경고 로직
- `src/adapters/claude-code/install.ts` — postinstall에서 guard 체크

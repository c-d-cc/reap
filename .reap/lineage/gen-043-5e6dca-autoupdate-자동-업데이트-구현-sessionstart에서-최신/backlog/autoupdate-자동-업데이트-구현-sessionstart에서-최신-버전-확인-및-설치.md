---
type: task
status: consumed
consumedBy: gen-043-5e6dca
consumedAt: 2026-03-27T13:18:38.116Z
priority: high
createdAt: 2026-03-27T13:07:23.149Z
---

# autoUpdate 자동 업데이트 구현 — SessionStart에서 최신 버전 확인 및 설치

## Problem

config.yml에 `autoUpdate: true` 필드가 있지만 실제 자동 업데이트 로직이 없다. v0.15에서는 SessionStart hook에서 npm registry 최신 버전을 확인하고 자동 설치했으나, v0.16에서는 미구현. 사용자가 수동으로 `npm install -g`를 해야만 업데이트됨.

## Solution

1. `check-version.ts`에 자동 업데이트 로직 추가 (SessionStart + postinstall에서 이미 호출됨):
   - `npm view @c-d-cc/reap version`으로 latest 버전 조회
   - 설치된 버전과 비교, 새 버전 있으면:
     - `autoUpdateMinVersion` guard 통과 확인
     - `npm install -g @c-d-cc/reap@latest` 실행
     - 설치 후 `reap update` 실행 (프로젝트 동기화)
   - config.yml의 `autoUpdate: false`이면 skip
2. +dev 빌드, alpha 버전에서는 자동 업데이트 skip
3. 네트워크 실패 시 silent skip (postinstall/hook 깨지면 안 됨)

## Files to Change

- `src/cli/commands/check-version.ts` — autoUpdate 로직 추가
- v0.15 참조: `~/cdws/reap_v15/src/cli/commands/update.ts` (selfUpgrade), `~/cdws/reap_v15/src/templates/hooks/session-start.cjs` (auto-update flow)

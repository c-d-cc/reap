---
type: task
status: consumed
consumedBy: gen-057-3ce703
consumedAt: 2026-03-30T06:27:14.822Z
priority: high
createdAt: 2026-03-30T06:26:34.880Z
---

# e2e-update-path-tests

0.16.4 release 기준으로 init 후 로컬 빌드 버전으로 update했을 때 gen-053~056 변경사항(load-context hook 등록, CLAUDE.md marker sync, registerSessionHooks in update)이 정상 동작하는지 E2E 테스트. sandbox 환경에서 프로젝트 설치→init→update→검증 시나리오.

## Problem

gen-053~056에서 SessionStart hook 등록, CLAUDE.md marker sync, `reap update`에 hook 등록 추가 등 주요 변경이 이루어졌지만, 이 "update path" (기존 프로젝트가 새 버전으로 업데이트되는 시나리오)에 대한 E2E 테스트가 없음.

검증 필요 항목:
1. `reap update` 후 `~/.claude/settings.json`에 `reap load-context` hook 등록 여부
2. `reap update` 후 CLAUDE.md가 marker 기반으로 교체되는지 (레거시 → 마커 업그레이드)
3. `reap load-context` 실행 시 `hookSpecificOutput.additionalContext` JSON 출력 여부
4. 비-REAP 디렉토리에서 `reap load-context` silent exit 여부
5. `reap update` 후 전체 lifecycle(start → learning → ... → completion) 정상 동작

## Solution

sandbox 환경에서 "0.16.4 상태 시뮬레이션 → 로컬 빌드로 update → 검증" E2E 테스트 작성.

기존 `tests/e2e/update.test.ts` 패턴을 따르되, 새 테스트 파일로 분리:
- `setupProject()`로 프로젝트 생성 후 0.16.4 상태를 시뮬레이션 (마커 없는 CLAUDE.md, hook 미등록)
- `cli(dir, "update")` 실행
- hook 등록, CLAUDE.md 마커, load-context 출력 검증
- 전체 lifecycle 실행 검증

## Files to Change

- `tests/e2e/update-path.test.ts` — 신규: update path E2E 테스트
- `tests/helpers/setup.ts` — 필요 시 helper 함수 추가

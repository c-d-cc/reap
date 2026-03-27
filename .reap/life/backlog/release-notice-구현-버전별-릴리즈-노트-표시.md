---
type: task
status: pending
priority: medium
createdAt: 2026-03-27T14:34:34.199Z
---

# release notice 구현 — 버전별 릴리즈 노트 표시

## Problem

업데이트 후 사용자에게 새 버전의 변경사항을 알려주는 메커니즘이 없다. v0.15에서는 RELEASE_NOTICE.md를 패키지에 포함하고, 업데이트/세션 시작 시 해당 버전의 노트를 다국어로 표시했다.

## Solution

1. `RELEASE_NOTICE.md` 파일을 패키지 루트에 생성 — 버전별/언어별 섹션 (`## v0.16.0` → `### en`, `### ko`)
2. `src/core/notice.ts` 신규 — `fetchReleaseNotice(version, language)`: RELEASE_NOTICE.md에서 해당 버전+언어 노트 추출
3. `reap update`에서 업데이트 성공 후 notice 표시
4. `check-version.ts`의 autoUpdate 성공 후에도 notice를 stderr로 출력
5. package.json files에 RELEASE_NOTICE.md 포함

v0.15 참조: ~/cdws/reap_v15/src/core/notice.ts (fetchReleaseNotice), ~/cdws/reap_v15/RELEASE_NOTICE.md

## Files to Change

- RELEASE_NOTICE.md — 신규 (패키지 루트)
- src/core/notice.ts — 신규 (fetchReleaseNotice)
- src/cli/commands/check-version.ts — autoUpdate 후 notice 표시
- src/cli/commands/update.ts — update 후 notice 표시
- package.json — files에 RELEASE_NOTICE.md 추가

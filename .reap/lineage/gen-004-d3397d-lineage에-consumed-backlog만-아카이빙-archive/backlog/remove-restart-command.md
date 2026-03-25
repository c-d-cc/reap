---
type: task
status: pending
priority: medium
---

# restart 명령어 제거, abort로 통합

## Problem
restart와 abort가 기능적으로 겹침. 사용자 혼란 방지를 위해 abort만 유지.

## Solution
- `src/cli/commands/run/restart.ts` 제거
- `src/cli/commands/run/index.ts`에서 restart handler 제거
- `src/adapters/claude-code/skills/reap.restart.md` 제거 또는 deprecated 안내
- abort에 restart 기능 통합이 필요하면 (예: --goal 옵션으로 새 generation 시작) abort 확장
- E2E에서 restart 참조 있으면 수정

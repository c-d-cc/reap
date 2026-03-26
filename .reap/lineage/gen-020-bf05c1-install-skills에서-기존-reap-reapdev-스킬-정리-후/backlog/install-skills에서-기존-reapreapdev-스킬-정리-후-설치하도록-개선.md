---
type: task
status: consumed
consumedBy: gen-020-bf05c1
consumedAt: 2026-03-26T04:23:20.572Z
priority: medium
createdAt: 2026-03-26T04:21:58.331Z
---

# install-skills에서 기존 reap/reapdev 스킬 정리 후 설치하도록 개선

## Problem

`installSkills()`가 새 스킬 파일을 복사만 하고, 기존에 설치된 reap/reapdev 스킬을 정리하지 않음.
- 이름이 변경된 스킬(reap.localInstall → reapdev.localInstall)의 구 파일이 남음
- 삭제된 스킬(reap.restart)이 계속 남아 유저에게 노출됨
- `~/.claude/commands/`에 stale 스킬이 누적되는 문제

## Solution

`installSkills()` 실행 시:
1. `~/.claude/commands/`에서 `reap.*.md` + `reapdev.*.md` 파일 목록 스캔
2. 새로 설치할 스킬 목록과 비교하여 불필요한 파일 삭제
3. 새 스킬 복사

## Files to Change

- `src/adapters/claude-code/install.ts` — installSkills()에 cleanup 로직 추가

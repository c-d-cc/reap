---
type: task
status: consumed
consumedBy: gen-038-1fb73f
consumedAt: 2026-03-26T17:51:20.546Z
priority: high
createdAt: 2026-03-26T17:50:23.330Z
---

# migrate/init에서 프로젝트 레벨 legacy commands/skills 정리 (.claude/commands/reap.*, .claude/skills/reap.*)

## Problem

v0.15에서는 프로젝트 레벨의 `.claude/commands/reap.*.md`와 `.claude/skills/reap.*/SKILL.md`에 커맨드를 설치.
v0.16 설치/migrate 후에도 이 파일들이 남아있어서:
- v0.15 스킬이 v0.16 스킬과 공존 → AI가 잘못된 command 실행
- reap.objective, reap.merge.detect 등 삭제된 command가 계속 노출

## Solution

migrate/init에서 프로젝트 레벨 legacy 파일 정리:
1. `.claude/commands/reap.*.md` — 모두 삭제 (v0.16에서는 user-level ~/.claude/commands/ 사용)
2. `.claude/skills/reap.*/` — 모두 삭제 (v0.15가 설치한 프로젝트 레벨 skills)
3. 삭제 전 목록을 migration 결과에 포함

## Files to Change

- `src/cli/commands/migrate.ts` — execute phase에 legacy cleanup 추가
- `src/cli/commands/init/common.ts` — init에서도 기존 legacy 정리 (있으면)

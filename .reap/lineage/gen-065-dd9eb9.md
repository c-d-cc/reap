---
id: gen-065-dd9eb9
type: normal
parents:
  - gen-064-0ddf20
goal: 스킬 로딩 최적화 Phase 2 — ~/.claude/commands/ redirect 삭제
genomeHash: 8db4246930c0
startedAt: 2026-03-20T07:08:02Z
completedAt: 2026-03-20T07:10:57Z
---

# gen-065-dd9eb9
- **Goal**: 스킬 로딩 최적화 Phase 2 — redirect 삭제
- **Result**: PASS
- **Key Changes**: installCommands에서 redirect 생성 제거, update 시 기존 redirect 자동 삭제

## Objective
스킬 로딩 최적화 Phase 2 — ~/.claude/commands/ redirect 삭제

## Completion Conditions
1. `reap update` 시 `~/.reap/commands/`가 존재하면 `~/.claude/commands/reap.*.md` redirect 파일을 삭제한다
2. `ClaudeCodeAdapter.installCommands()`에서 redirect 생성 로직을 제거한다
3. `update.ts`에서 redirect 동기화를 삭제 마이그레이션으로 교체한다
4. v0.7.0 미만에서 올라온 유저는 Phase 1(redirect 생성) → 다음 update에서 Phase 2(삭제) 순서로 동작
5. bun test, tsc, build 통과

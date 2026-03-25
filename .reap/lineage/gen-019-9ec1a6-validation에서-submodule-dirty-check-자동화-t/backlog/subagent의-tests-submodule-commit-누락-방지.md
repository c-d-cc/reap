---
type: task
status: consumed
consumedBy: gen-019-9ec1a6
consumedAt: 2026-03-25T18:00:47.377Z
priority: medium
createdAt: 2026-03-25T17:59:33.296Z
---

# subagent의 tests submodule commit 누락 방지

## Problem
gen-018에서 subagent가 tests/e2e/abort.test.ts를 작성했으나 tests/ submodule 내부에서 git commit을 하지 않음.
main repo에만 커밋되고 submodule은 untracked 상태로 남음.
tests/가 submodule이라는 것을 subagent prompt에 명시했지만 실제 commit 단계를 빠뜨림.

## Solution
1. evolve.ts subagent prompt에 tests/ submodule commit 규칙을 더 명확히:
   - "tests/ 파일 수정 후 반드시 `cd tests && git add -A && git commit` 실행"
   - "main repo commit 전에 submodule commit이 선행되어야 함"
2. 또는 validation stage에서 submodule dirty check 자동화:
   - `git submodule status`로 dirty 여부 확인
   - dirty면 validation fail

## Files to Change
- src/cli/commands/run/evolve.ts — subagent prompt에 submodule commit 규칙 강화
- src/cli/commands/run/validation.ts — submodule dirty check 추가 (선택)

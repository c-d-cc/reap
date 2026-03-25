# Implementation — gen-019-9ec1a6

## Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| T001 | git.ts — checkSubmoduleDirty() | Done (subagent) |
| T002 | completion.ts — commit phase dirty check | Done (subagent) |
| T003 | push.ts — dirty check | Done (subagent) |
| T004 | git-submodule.test.ts — 5 tests | Done (subagent + manual commit) |
| T005 | typecheck + build + 173 tests pass | Done |

## Changes
- `src/core/git.ts` — checkSubmoduleDirty() 추가
- `src/cli/commands/run/completion.ts` — commit 전 dirty check
- `src/cli/commands/run/push.ts` — push 전 dirty check
- `tests/unit/git-submodule.test.ts` — 5 unit tests

## Note
subagent가 tests/ submodule commit을 또 누락함 — 수동으로 commit + push 완료. 이 기능 자체가 이 문제를 방지하기 위한 것.

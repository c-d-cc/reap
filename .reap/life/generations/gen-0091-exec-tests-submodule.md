---
id: gen-0091-exec
slug: tests-submodule
type: exec
milestone: ms-023
title: tests submodule 전환 — reap-test v0.18 재동기, ci/release dispatch, skill·문서
startedAt: 2026-09-04T01:24:31Z
startCommit: 47ebe04
status: open
---
## Intent

ms-023 task 2 — ms-021이 고친 `tests/`를 scratchpad의 reap-test 클론 v0.18 브랜치에 다시 복사해 커밋하고, 이 리포의 `tests/`를 그 클론을 가리키는 submodule로(`.gitmodules` url은 GitHub, branch v0.18), `ci.yml`·`release.yml`을 dispatch 방식으로, `complete/SKILL.md` 한 줄, `environment/summary.md`·`06-release.md`·genome 갱신. `bun test`가 submodule 체크아웃에서 그대로 돈다. push는 사람.

## Delegation

brief로 subagent에게. worktree `../reap-wt-tests`(브랜치 `ms-023-tests`).

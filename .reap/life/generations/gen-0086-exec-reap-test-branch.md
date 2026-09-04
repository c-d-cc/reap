---
id: gen-0086-exec
slug: reap-test-branch
type: exec
milestone: ms-023
title: reap-test v0.18 브랜치와 dispatch 워크플로
startedAt: 2026-09-04T00:07:05Z
startCommit: 142c11e
status: open
---
## Intent

ms-023 task 1 — reap-test 로컬 클론에 `v0.18` 브랜치(이 리포 tests/ 전부 + dispatch 워크플로 + README 한 줄). 커밋만, push는 사람. task 2(submodule 전환)는 다음 세대.

수행: worktree `../reap-wt-tests`(브랜치 `ms-023-tests`)에서 subagent — 리포 쪽 변경은 없고 scratchpad의 reap-test 클론에 커밋한다.

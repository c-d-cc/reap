---
id: gen-0076-exec
slug: hooks-runner
type: exec
milestone: ms-017
title: 훅 실행기와 make hook — 파싱·조건·실행·템플릿
startedAt: 2026-09-03T14:44:37Z
startCommit: 1a3ba0c
status: open
---
## Intent

ms-017 task 1 — `src/hooks.ts`(listHooks·runHooks), `make hook`(여섯 이벤트만), 템플릿 셋(hook-md·hook-sh·condition-always). 끝은 tasks/1-runner-and-make.md의 완료 판정: 파싱·정렬·조건·실행·실패 비throw·이벤트 거부를 테스트가 덮고 `bun test` 전체 초록. 발화(task 2)는 이 세대가 아니다.

수행: worktree `../reap-wt-hooks`(브랜치 `ms-017-hooks`)에서 subagent가 한다. 주 세션은 조율만.

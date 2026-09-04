---
id: gen-0092-exec
slug: final-recheck
type: exec
milestone: ms-019
title: 최종 재검증 — en/ko 왕복 둘·발행 직전 체크·문서 정합
startedAt: 2026-09-04T01:33:58Z
startCommit: c396352
status: open
---
## Intent

ms-019 task 5 — tasks/5-final-recheck.md 전부: 왕복 1(en, 그리고 `REAP_LANG=ko`), 왕복 2(v0.17 표본 이주 → `language: ko` 프로젝트가 한국어 출력, `--plugin-dir` 세션이 한국어 상태 줄), 06-release "발행 직전 체크" 실제 실행, release-policy·06·README·upgrade agent·마켓플레이스 항목 정합 대조, orchestrate skill에 submodule worktree 한 줄. 어긋남은 이 세대에서 고친다. 끝은 출력 로그가 기록에 있고 doctor 0.

## Delegation

brief로 subagent에게 — **주 트리에서**(worktree 아님; submodule 체크아웃이 여기 있다). `make`·`mark` 금지.

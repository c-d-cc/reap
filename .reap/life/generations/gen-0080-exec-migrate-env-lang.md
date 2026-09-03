---
id: gen-0080-exec
slug: migrate-env-lang
type: exec
milestone: ms-018
title: 이주 매핑 보강 — environment/ 이주와 ctx 언어 줄, 실물 재검증
startedAt: 2026-09-03T15:09:27Z
startCommit: 9839459
status: open
---
## Intent

ms-018 task 1(environment/ 부분)·2 — migration-map에 `environment/` 매핑(#10)을 더하고, `ctx`가 `config.language`를 "응답 언어" 한 줄로 낸다. 실물(`~/cdws/reap_v17/.reap` 복사 표본)로 8단계를 다시 돌려 environment/가 옮겨지는 것을 확인한다. hooks 매핑은 ms-017 merge 뒤 다음 세대.

수행: worktree `../reap-wt-migrate`(브랜치 `ms-018-migrate`)에서 subagent.

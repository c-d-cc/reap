---
id: gen-0089-exec
slug: i18n-skills
type: exec
milestone: ms-021
title: skill 10종·어휘·템플릿·씨앗 en, doctor 판정어 합집합
startedAt: 2026-09-04T00:51:06Z
startCommit: 7412377
status: open
---
## Intent

ms-021 task 2 — plugin skill 10종·references·record-vocabulary·session-start.sh 주석·plugin.json description을 en으로, `src/templates/*` 씨앗 en(`config.yml` 씨앗 `language: en`), 상태 줄 라벨 인용을 handoff 대응표로 맞춤. **doctor의 idea 헤딩 판정어는 카탈로그 전 언어의 합집합**으로(ko 프로젝트의 en 씨앗 idea가 오판되지 않게). 이 리포의 `.reap/` 실물은 불가침. 끝은 `grep -rP '[가-힣]' plugin/ src/templates/`가 0, 테스트 초록, `--plugin-dir` 세션에서 skill 10종 확인.

## Delegation

brief로 subagent에게. worktree `../reap-wt-i18n`(브랜치 `ms-021-i18n`, v0.18과 동기).

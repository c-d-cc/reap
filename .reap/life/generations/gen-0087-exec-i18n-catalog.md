---
id: gen-0087-exec
slug: i18n-catalog
type: exec
milestone: ms-021
title: 메시지 카탈로그와 CLI en 전환 — src 문자열 전수, 테스트 en
startedAt: 2026-09-04T00:13:39Z
startCommit: 0606374
status: open
---
## Intent

ms-021 task 1 — `src/i18n.ts` 카탈로그(en·ko, `config.language` → `REAP_LANG` → en), `src/` 사용자 문자열 전수 전환, 테스트의 한국어 리터럴 단언 제거, `hook.test.sh`·`verify-package.sh`·`detect-version.sh` 출력 en. 상태 줄 라벨 목록을 handoff에 남긴다(task 2가 skill 인용을 맞춘다). 끝은 `REAP_LANG=ko`면 한국어 usage, 없으면 en, 전 검증 초록.

## Delegation

ms-020의 실물 — `evolve/references/delegate-brief.md`를 채워 subagent에게 준다. worktree `../reap-wt-i18n`(브랜치 `ms-021-i18n`). 주 세션이 검토·닫기.

---
id: gen-0090-exec
slug: i18n-docs
type: exec
milestone: ms-021
title: README en/ko·RELEASE_NOTES en·genome 규칙·0.17.8 노트 정정·왕복 재검증
startedAt: 2026-09-04T01:14:06Z
startCommit: 1cf8939
status: open
---
## Intent

ms-021 task 3 — `README.md` en(현재 본문은 `README.ko.md`로), `RELEASE_NOTES.md` 0.18.0 절 en("한국어 전용" 삭제, en 기본·ko 카탈로그), `.reap/genome/application.md` 문자열 규칙 갱신, `~/cdws/reap_v17`의 0.17.8 노트·NOTICE·로케일에서 "Korean-only" 문장 제거(문서 편집만, v0.17 바이너리 실행 금지), 왕복 1(`verify-package.sh` + `--plugin-dir` 1회)을 en으로 재확인. skill description의 한국어 트리거 예시는 그대로 둔다(한국어 사용자의 진입 문구).

## Delegation

brief로 subagent에게. worktree `../reap-wt-i18n`(브랜치 `ms-021-i18n`, v0.18과 동기).

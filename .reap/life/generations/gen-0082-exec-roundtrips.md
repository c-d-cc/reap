---
id: gen-0082-exec
slug: roundtrips
type: exec
milestone: ms-019
title: 왕복 검증 — tarball 설치 새 프로젝트, v0.17 표본 upgrade agent 경로 이주
startedAt: 2026-09-03T15:33:02Z
startCommit: e9dbda8
status: open
---
## Intent

ms-019 task 1·2 — Bun 없는 PATH에서 tarball 설치본으로 (1) 빈 리포 init→세대→complete 왕복과 `--plugin-dir` 세션의 상태 줄·skill 확인, (2) v0.17 표본을 upgrade agent 본문(1~5단계)대로 `/reap:migrate`까지. README·agent 본문·skill이 어긋나면 이 세대에서 고친다. 끝은 두 왕복의 수행 로그와 doctor 0.

수행: worktree `../reap-wt-verify`(브랜치 `ms-019-verify`)에서 subagent.

---
id: gen-0077-exec
slug: npm-package
type: exec
milestone: ms-016
title: npm 패키지 — node 호환 세 파일·패키지 모양·ci/release 워크플로
startedAt: 2026-09-03T14:46:33Z
startCommit: d54a758
status: open
---
## Intent

ms-016 task 1·2·3 — probe(02-distribution)가 실측한 세 파일 수정을 리포에 넣고, `@c-d-cc/reap` 0.18.0 패키지 모양(`build:node`·bin·files·engines)과 `.github/workflows/{ci,release}.yml`(`--tag next` 고정)을 만든다. 끝은 ms-016 Exit Criteria: Bun 없는 PATH에서 tarball 설치본이 명령 전부를 내고, Bun 쪽 테스트·컴파일이 그대로 초록.

수행: worktree `../reap-wt-package`(브랜치 `ms-016-package`)에서 subagent. 주 세션은 조율만.

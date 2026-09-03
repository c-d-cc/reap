---
id: gen-0079-exec
slug: hooks-fire
type: exec
milestone: ms-017
title: 훅 발화 여섯 지점·doctor 검사·init 씨앗·spec 갱신
startedAt: 2026-09-03T14:59:23Z
startCommit: 4024a94
status: open
---
## Intent

ms-017 task 2·3 — `make generation`·`mark generation --closed`·`make milestone`·`mark milestone --closed`·`orch claim`·`orch barrier`에서 발화하고 출력을 명령 결과 뒤에 붙인다. doctor가 hooks/ 규약을 검사하고, init이 `hooks/conditions/always.sh`를 놓는다. `detect-version.sh`의 표지가 conditions/ 때문에 mixed로 뒤집히지 않게 좁힌다. spec 07의 "아직 아니다"를 결정으로 갱신하고 map 씨앗을 맞춘다. 끝은 ms-017 Exit Criteria 전부.

보완: 조건 미충족은 failures가 아니라 `skipped`로 구분한다 — 실패가 아니다.

수행: worktree `../reap-wt-hooks`(브랜치 `ms-017-hooks`)에서 subagent.

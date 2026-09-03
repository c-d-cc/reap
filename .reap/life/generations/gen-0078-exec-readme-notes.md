---
id: gen-0078-exec
slug: readme-notes
type: exec
milestone: ms-018
title: README와 RELEASE_NOTES 0.18.0 — 설치·첫 사용·이주·제거
startedAt: 2026-09-03T14:47:50Z
startCommit: fd19707
status: closed
closedAt: 2026-09-03T14:57:28Z
endCommit: a91a526
---
## Intent

ms-018 task 3 — `README.md`(04-migrate-docs의 7절)와 `RELEASE_NOTES.md` 0.18.0 절. upgrade agent 3단계·migrate 8/8과 같은 설치 명령을 말해야 한다. 마켓플레이스 이름은 Q5 답 전이라 `reap@ctod-plugins`로 가정하고 handoff에 남긴다. 끝은 두 파일이 커밋되고, README만 읽고 설치→첫 세대까지 갈 수 있는 상태.

수행: worktree `../reap-wt-readme`(브랜치 `ms-018-readme`)에서 subagent.

## Outcome

`README.md`(533fb1d)와 `RELEASE_NOTES.md`(0813e0c) 신설. 각각 04-migrate-docs의 7절을 담는다.

README 절: 정의(한 문단) · 설치(npm next 태그·플러그인 마켓플레이스·확인) · 첫 사용(`/reap:init`→`/reap:evolve`→`/reap:complete`, 상태 줄) · v0.17에서 왔다면(이주 경로·잃는 것 요약, [01-gap.md](../../../../docs/reap-plan/reap_v_0_18_release/01-gap.md) 링크) · 명령 표면(skill 10종 표 + `reap` usage 안내) · 제거 · 개발.

RELEASE_NOTES `## v0.18.0` 절 하나. 바뀐 것(플러그인+CLI 두 산출물, 3단 저장소, loop/milestone/generation, doctor, index, hooks 6종) · 사라진 것(01-gap 요약) · 오는 법 · 알아둘 것(next 태그, 한국어 전용).

가정 목록은 `ms-018-v018-migrate-docs/handoff.md`에 남겼다 — Q5 미답, hooks/build:node는 다른 세대가 만드는 중.

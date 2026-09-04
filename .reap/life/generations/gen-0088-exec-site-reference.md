---
id: gen-0088-exec
slug: site-reference
type: exec
milestone: ms-022
title: 사이트 레퍼런스 일곱 쪽 — skill·CLI·hooks·index·orchestrate·이주·릴리스 노트
startedAt: 2026-09-04T00:17:08Z
startCommit: 9c5c6a0
status: closed
closedAt: 2026-09-04T00:25:16Z
endCommit: 2649cf4
---
## Intent

ms-022 task 2 — 레퍼런스 일곱 쪽(한국어). SKILL.md를 옮겨 적지 않는다(한 절 열 줄 넘으면 신호). 릴리스 노트는 리포 밖 include가 안 되므로 빌드 전 복사 스크립트. 끝은 sidebar에 열두 쪽 전부, dead link 0, handoff에 "사람 검수 대기".

## Delegation

brief를 채워 subagent에게. worktree `../reap-wt-site`(브랜치 `ms-022-site`, v0.18과 동기).

## Outcome

subagent가 worktree `../reap-wt-site`(브랜치 `ms-022-site`)에 커밋 셋을 남겼다.

- `85e605f` — 레퍼런스 여섯 쪽: `site/skills.md`(skill 10종 표 + skill마다 언제·무엇을·부르지 않는 경우)·`site/cli.md`(usage 원문 + 명령 계열별 두 줄)·`site/hooks.md`(이벤트 여섯·파일 규약·condition/order·`make hook`·md/sh 차이·훅 실패해도 명령 성공)·`site/code-index.md`(하위 명령·index vs grep·해석률 낮으면 "모름")·`site/orchestrate.md`(worktree로 가른다·claim·barrier·roster·id는 조율자 발급·메시지 kind 관례)·`site/migration.md`(0.17.8 → `reap update` → agent → `/reap:migrate` 8단계, `.reap-v0_17/` 보존과 되돌리기 한 줄, 01-gap "만들지 않는다" 요약)
- `ba10b17` — 릴리스 노트 쪽: `site/release-notes.md` + `site/package.json`의 `predev`/`prebuild`가 루트 `RELEASE_NOTES.md`를 `site/release-notes-content.md`로 복사(gitignore 처리, VitePress `<!--@include:-->`가 리포 밖을 못 가리켜서)
- `a612c09` — `site/.vitepress/config.ts`의 nav·sidebar에 열두 쪽 전부 배치(시작하기 넷 / 레퍼런스 여섯 / 릴리스 노트), `srcExclude`로 복사본이 독립 페이지가 되는 것을 막음

각 쪽 줄 수: skills.md 98줄 · cli.md 78줄 · hooks.md 44줄 · code-index.md 32줄 · orchestrate.md 58줄 · migration.md 49줄 · release-notes.md 5줄.

`bun run site:build` dead link 0(exit 0), `./dist/reap doctor` 결함 0(참고 1은 `gen-0087-exec` 바인딩 — 이 세대와 무관, 손대지 않음). 열두 개 html(`404.html` 제외)이 나온다.

남은 것: 사람 검수. 검수 뒤 en 확장은 ms-022 밖(ms-021 뒤).

## Dead Ends

없음.

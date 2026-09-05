---
id: gen-0106-exec
slug: skill-visibility
type: exec
milestone: ms-026
title: skill 노출 6/4 — user-invocable, 문서 표, 시작하기·두 축·판단확정사실 정리
startedAt: 2026-09-05T01:49:59Z
startCommit: b51b56b
status: closed
closedAt: 2026-09-05T01:53:00Z
endCommit: 8afe146
---

## Intent

ms-026 tasks/1 전부. 함께 싣는 ms-022 검수 피드백(사람, 2026-09-05): 시작하기에서 complete 설명 삭제, 두 축 페이지의 "선형이 아니라 두 축입니다" 절 삭제, 판단·확정·사실 페이지 삭제. 같은 `ko.ts`를 고치므로 한 세대.

끝나는 조건은 milestone Exit Criteria 넷. 게이트: plugin-skills 검사·check-docs-surface·check-docs-prerender(29쪽)·hook.test·bun test.

사람 추가(작업 중): interview는 사람도 부를 수 있게 — agent 전용은 셋.

## References

- code.claude.com/docs/en/skills.md — `user-invocable: false`: 메뉴 숨김·`/name` 무시, 설명은 문맥에 남고 Skill 도구로 호출 가능
- ms-026 milestone.md Background

## Outcome

commit 8afe146(주 트리)·tests aaeab69. plugin-skills.test 통과, check-docs-surface ok, prerender PASSED(29쪽), hook.test 통과, bun test 235 통과, doctor 결함 0, 플러그인 재설치(캐시 = 작업 트리).

- `user-invocable: false`: complete·carve-milestone·cleanup. interview는 작업 중 사람 지시로 되돌림(사람도 부른다)
- README en·ko skill 표에 "who calls it / 누가" 열(you|사람 / agent), 첫 사용에서 `/reap:complete` 블록 제거("agent가 닫는다"), 설치 확인 "메뉴에 7종". `setup.done` en·ko 같은 숫자
- 사이트 ko.ts: skills 표 3열(type `[string,string,string][]`)·intro, quickStart complete 단계 삭제 + evolve 설명 끝에 "일이 끝나면 agent가 세대를 닫습니다", installVerifyNote 7종, twoAxesPage shapeTitle/shapeDesc 삭제(TwoAxesPage.tsx 절 제거), threeLayersPage 타입·본문·nav·라우트·사이드바·페이지 파일 삭제
- `tests/plugin-skills.test.sh`: frontmatter name=디렉토리·description, agent 전용 3종만 user-invocable: false, README 둘·사이트 표가 같은 3종을 agent로 표시

## Dead Ends

- check-docs-prerender.sh는 빌드하지 않고 기존 `site/dist`를 검사한다 — 라우트를 지운 뒤 옛 빌드로 돌리면 "30쪽, 1쪽이 라우트 없음"으로 실패한다. `bun run site:build`를 먼저. 스크립트는 그대로 두었다(문서 워크플로가 빌드 뒤에 부른다)

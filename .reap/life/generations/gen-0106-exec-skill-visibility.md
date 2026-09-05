---
id: gen-0106-exec
slug: skill-visibility
type: exec
milestone: ms-026
title: skill 노출 6/4 — user-invocable, 문서 표, 시작하기·두 축·판단확정사실 정리
startedAt: 2026-09-05T01:49:59Z
startCommit: b51b56b
status: open
---

## Intent

ms-026 tasks/1 전부. 함께 싣는 ms-022 검수 피드백(사람, 2026-09-05): 시작하기에서 complete 설명 삭제, 두 축 페이지의 "선형이 아니라 두 축입니다" 절 삭제, 판단·확정·사실 페이지 삭제. 같은 `ko.ts`를 고치므로 한 세대.

끝나는 조건은 milestone Exit Criteria 넷. 게이트: plugin-skills 검사·check-docs-surface·check-docs-prerender(29쪽)·hook.test·bun test.

사람 추가(작업 중): interview는 사람도 부를 수 있게 — agent 전용은 셋.

## References

- code.claude.com/docs/en/skills.md — `user-invocable: false`: 메뉴 숨김·`/name` 무시, 설명은 문맥에 남고 Skill 도구로 호출 가능
- ms-026 milestone.md Background

---
id: ms-026
slug: skill-visibility
title: skill 노출 — 사람이 부르는 7종만 메뉴에, 나머지 3종은 agent 전용
from: loop-0004-plan
status: closed
openedAt: 2026-09-05T01:49:59Z
closedAt: 2026-09-05T02:40:12Z
---
## Background

사람 질문(2026-09-05): "`/reap:complete`를 사용자가 실행하는 스킬로 유지하는 게 맞나." 스킬 10종이 전부 `/` 메뉴에 나오지만 실제로 사람이 부르는 것은 시작을 지시하거나 사람이 개입하는 일곱(init·evolve·loop·interview·orchestrate·migrate·report-issue)이고, 나머지 셋(complete·carve-milestone·cleanup)은 작업 흐름 안에서 agent가 판단해 부른다. Claude Code 스킬 frontmatter `user-invocable: false`가 메뉴에서 숨기되 agent의 Skill 호출은 그대로 둔다(code.claude.com/docs/en/skills.md "Control who invokes a skill"). 사람 답: 이 방향으로, 단 interview는 사람도 부를 수 있게. 그리고 시작하기 페이지에서 complete 설명 자체를 뺀다.

## Exit Criteria

- complete·carve-milestone·cleanup의 SKILL.md에 `user-invocable: false`. 나머지 일곱은 그대로. 검사가 있다(`tests/plugin-skills.test.sh`)
- 사용자 문서(README en·ko·사이트 skill 레퍼런스)가 "누가 부르나"를 표시하고, 설치 확인 문구와 `setup.done`이 "/reap: skill 7종"을 말한다
- 시작하기(README 첫 사용·사이트 quickStart)에 `/reap:complete` 단계가 없다 — 닫는 것은 agent의 일
- 사이트: 두 축 페이지의 "선형이 아니라 두 축입니다" 절 삭제, 판단·확정·사실 페이지 삭제(라우트·사이드바·번역·prerender 29쪽)

## Out of Scope

- 상태 줄 `ctx.entry`("마무리하면 /reap:complete") — agent에게 주입되는 문장이라 그대로
- `disable-model-invocation` — 사용자 전용 스킬은 없다

## Plan Items

1. frontmatter·검사·문서·사이트 한 세대 (tasks/1)

## 이 milestone이 끝나면 물어볼 것

- 새 세션의 `/` 메뉴에 reap 항목이 일곱만 보이고 agent가 complete를 여전히 부르는가(실물)

## Fitness (사람, 2026-09-05)

"닫자." — `/` 메뉴에 reap 항목이 사람용만 보이고, `/reap:help`(ms-027)가 agent 전용 셋을 빼고 답하는 것을 사람이 확인. 물어볼 것("agent가 complete를 여전히 부르는가")은 이 세션의 gen-0104~0108 다섯 세대가 전부 complete 절차로 닫혔으므로 답이 "그렇다". Exit Criteria의 "7종"은 ms-027이 help를 더해 8종이 됐다.

크기 소급: 세대 하나(gen-0106). backlog 항목이면 충분했다.

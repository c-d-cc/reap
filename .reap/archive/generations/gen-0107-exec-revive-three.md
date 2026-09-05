---
id: gen-0107-exec
slug: revive-three
type: exec
milestone: ms-027
title: help skill·complete의 environment 갱신·독립 검증·문서 정합
startedAt: 2026-09-05T02:04:22Z
startCommit: 9950a35
status: closed
closedAt: 2026-09-05T02:07:12Z
endCommit: bfbfcf5
---

## Intent

ms-027 tasks/1·2·3 전부. 사람 판단(2026-09-05): v0.17에서 빠진 셋(help·knowledge의 갱신 판단·evaluate)은 삭제가 잘못됐다. cruise는 보류(idea-fe0953).

- `help` skill(사람이 부름): 상태 줄 재출력, skill 지도(사람 8 / agent 3), 상태에서 다음 행동 하나 제안. 아무것도 열거나 닫지 않는다
- `complete`에 두 절 — summary.md 갱신 판단(표 다섯 줄, 쓰는 법은 init §3.2), 닫기 전 독립 검증(새 subagent + `references/verify-brief.md`, 검증자는 편집 금지, 문서만 바꾼 세대는 생략을 명시)
- 수·문서 정합: skill 11종, 메뉴 8종 — README en·ko, 사이트(표·상세·nav·v018change·releaseNotes), `setup.done`, plugin-skills 검사, 01-gap 세 행

끝나는 조건은 milestone Exit Criteria 넷.

## References

- ms-027 milestone.md Background · idea-fe0953(cruise)
- `~/cdws/reap_v17/src/adapters/claude-code/skills/reap.help.md`·`reap.knowledge.md`, `src/templates/agents/reap-evaluate.md` — 원형

## Outcome

commit bfbfcf5(주 트리)·tests 30636cc. plugin-skills 검사·docs-surface·i18n 패리티·site typecheck·prerender(29쪽)·doctor 결함 0, 플러그인 재설치(캐시 = 작업 트리).

- `plugin/skills/help/SKILL.md` — 세 물음(어디·무엇을 부르나·다음)을 한 화면. 사람 8·agent 3 표, 상태→제안 표 일곱 줄
- `plugin/skills/complete/SKILL.md` — "summary.md가 낡았는가"(표 다섯 줄, 부분 재작성, Outcome 한 줄) · "닫기 전 독립 검증"(새 subagent + `references/verify-brief.md`, 검증자 편집 금지, 문서·기록만이면 생략 명시)
- 수: README en·ko 표에 help 행·"11 — eight/three"·설치 확인 8종, 사이트 표·상세·nav·소개 카드·v018change 행 넷·releaseNotes removed, `setup.done` en·ko 8, 01-gap 세 행
- cruise → idea-fe0953(research, 졸업 조건 셋 중 하나의 사람 답)
- summary.md: 해당 없음(코드 구조 변화 없음). 독립 검증: 생략 — skill 본문·문서만

## Dead Ends

- help를 agent 전용으로 두는 안 — 세 물음의 주어가 사람이라 메뉴에 있어야 한다
- 독립 검증을 별도 skill(`verify`)로 — 부르는 시점이 complete 안 한 곳뿐이라 절로. 검증자 지시문만 파일로 뺐다

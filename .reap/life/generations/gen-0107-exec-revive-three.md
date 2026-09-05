---
id: gen-0107-exec
slug: revive-three
type: exec
milestone: ms-027
title: help skill·complete의 environment 갱신·독립 검증·문서 정합
startedAt: 2026-09-05T02:04:22Z
startCommit: 9950a35
status: open
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

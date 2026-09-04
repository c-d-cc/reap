# 1 — evolve 위임 절과 brief 템플릿

## 손댈 곳

| 파일 | 무엇 |
|---|---|
| `plugin/skills/evolve/SKILL.md` | "그리고 일한다" 앞에 "직접 할 것인가, 위임할 것인가" 절. 신호 셋, 절차 다섯 줄, worktree 병렬 시 orchestrate로 넘김 |
| `plugin/skills/evolve/references/delegate-brief.md` (신규) | 템플릿. gen-0076~0082의 지시문(`.reap/archive/generations/`의 Intent와 이 loop의 수행 방식)에서 공통 규율을 추려 en이 아닌 **한국어**로(ms-021이 en으로 간다) |
| `plugin/skills/complete/SKILL.md` | "먼저: 무엇을 닫는지 안다" 뒤에 위임된 세대의 검토 절 |
| `docs/superpowers/specs/reap/06-agent.md` | evolve 절에 위임 판단. 관여하지 않음 유지 |
| `plugin/skills/shared/references/record-vocabulary.md` | 필요하면 `Delegation` 항목 — brief를 누구에게 줬고 무엇을 받았는지 (선택) |

## 함정

- brief가 길어지면 subagent가 안 읽는다. 한 화면. 읽을 파일은 경로로, 규율은 한 줄씩
- "닫지 마라"가 brief에 없으면 subagent가 `mark --closed`를 부른다 — 이 loop에서 그것을 매번 명시했다
- 같은 트리에서 subagent가 `make`를 부르면 `.session`이 subagent의 세대로 덮인다 — brief의 금지 항목 첫째

## 완료 판정

- skill 본문을 읽고 brief를 채워 subagent에게 줄 수 있다 (실물은 ms-021 첫 세대)
- `bun test`·doctor 변화 없음 (산문만)

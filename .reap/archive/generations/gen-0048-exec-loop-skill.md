---
id: gen-0048-exec
slug: loop-skill
type: exec
milestone: ms-012
title: loop skill · 어휘 · 기존 skill 정리
startedAt: 2026-08-30T14:30:40Z
startCommit: a7e3f42
status: closed
closedAt: 2026-08-30T14:33:13Z
endCommit: 687bd87
---
## Intent

`ms-012` 12.3 — `loop` skill, loop 어휘, `evolve`·`complete`·`carve-milestone`·`cleanup`에서 plan 세대 언급 정리, `map.md` 템플릿 동기화(12.8), `localUpdate`.

## Outcome

- **`plugin/skills/loop/SKILL.md`** — 언제(새 의도면 전부) · 열린 loop를 먼저 본다 · `make loop` · 논의하며 `Dialogue` · plan source에 쓴다(여섯 판단은 spec을 가리킴) · 유형별 닫힘 · `mark loop --closed --milestone` · 손으로 하는 법. **묻는 법은 한 줄도 없다** — `interview`를 가리킨다(아직 없다, `ms-007`)
- `record-vocabulary.md`에 loop 어휘 절(Question·Dialogue·Explored·Dead Ends·Outcome·Open Questions)
- `evolve` — 첫 물음이 "loop인가 generation인가". plan 축 절과 `--plan` 삭제, `loop`로 넘긴다
- `complete` — plan 세대 언급 삭제, loop는 `loop` skill이 닫는다고 가리킴
- `carve-milestone` — "loop 안에서", `--from <loop-id>`
- `cleanup` — 옛 `gen-NNNN-plan`만 다룬다고 명시
- `src/templates/map.md` = `.reap/map.md`. `summary.md` skill 5종
- `localUpdate` — 바이너리·플러그인 반영, 캐시 diff 없음, hook.test 통과

## Notes

새 세션 확인은 사람이 세션을 다시 열어야 한다. 이 세션에서는 파일과 캐시가 같다는 것까지만 확인했다.

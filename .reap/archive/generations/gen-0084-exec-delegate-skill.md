---
id: gen-0084-exec
slug: delegate-skill
type: exec
milestone: ms-020
title: evolve 위임 모드 — 판단 절·brief 템플릿·complete 검토·spec 06
startedAt: 2026-09-04T00:07:05Z
startCommit: 142c11e
status: closed
closedAt: 2026-09-04T00:13:38Z
endCommit: 0606374
---
## Intent

ms-020 task 1 — evolve에 "직접/위임" 판단과 절차, `references/delegate-brief.md` 템플릿(loop-0004의 subagent 지시문에서 추림), complete의 위임 세대 검토 절, 06-agent 갱신. 산문만. 실물은 ms-021 첫 세대가 이 모드로 돈다.

수행: worktree `../reap-wt-delegate`(브랜치 `ms-020-delegate`)에서 subagent.

## Outcome

네 곳 전부 손댔다. 커밋 셋:

- `d4f7d8a` `plugin/skills/evolve/SKILL.md`에 "직접 할 것인가, 위임할 것인가" 절("세대 기록을 연다"와 "그리고 일한다" 사이) — 기본은 직접, 위임 신호 셋, 절차 다섯 줄(Intent → brief → subagent → 검토 → complete), "REAP는 여기서부터 관여하지 않는다" 유지 문장. 같은 커밋에 `plugin/skills/evolve/references/delegate-brief.md`(신규, 한 화면) — gen-0076·0077·0079·0080·0082의 Intent 표현("수행: worktree `<path>`(브랜치 `<branch>`)에서 subagent")과 그 loop의 공통 규율(절대 경로·`make`/`mark` 호출 금지·`.reap/` 불가침 범위·파이프 없는 검증·빌드·이유 서술 주석 금지·커밋 규칙·push/rebase/amend 금지·닫지 않기·`git status --porcelain` 확인·보고 형식)을 추려 담았다. 채울 자리는 `{{gen-id}}`·`{{worktree 또는 리포 경로}}`·`{{읽을 것}}`·`{{범위}}`
- `bcce6b4` `plugin/skills/complete/SKILL.md`에 "위임된 세대라면 먼저 검토한다" 절("먼저: 무엇을 닫는지 안다" 뒤, 커밋 규칙 확인 앞) — Intent로 위임 여부를 식별하고, Outcome·Dead Ends를 읽고, `git diff <startCommit>..HEAD --stat`과 테스트를 주 세션이 직접 확인하고, brief 규율 위반 흔적(레지스트리 행·`.session`·닫힌 세대)을 본다. 어긴 흔적은 subagent 탓이 아니라 템플릿의 구멍으로 다룬다는 문장
- `6faf19c` `docs/superpowers/specs/reap/06-agent.md` — skill 표 evolve 행에 위임 판단 한 문장, "애매하면 interview를 먼저 부른다" 뒤·`## interview` 앞에 "evolve의 셋째 판단 — 직접 할 것인가, 위임할 것인가" 절. "여기서부터 관여하지 않는다"는 위임 뒤에도 유지된다는 문장을 반복하지 않고 규범 쪽에 못 박았다. 같은 커밋에 `record-vocabulary.md`의 세대 어휘 표에 선택 항목 `Delegation`

산문만이므로 `bun test` 214 pass(변화 없음, gen-0082 종료 시점과 동일 수), `./dist/reap doctor` 결함 0 — 참고 3(gen-0081·0085·0086, 전부 다른 세션 소유라 안 건드림).

## Dead Ends

없음.

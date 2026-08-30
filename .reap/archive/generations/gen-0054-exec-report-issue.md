---
id: gen-0054-exec
slug: report-issue
type: exec
backlog: bk-b8e496
title: report-issue skill
startedAt: 2026-08-30T16:47:06Z
startCommit: f91bd5f
status: closed
closedAt: 2026-08-30T16:48:29Z
endCommit: b1e3c4c
---
## Intent

`bk-b8e496` — `report-issue` skill. REAP를 쓰는 프로젝트에서 REAP 자체의 결함을 `c-d-cc/reap` issue로 올리는 통로.

## Outcome

- **`plugin/skills/report-issue/SKILL.md`** — 누구의 문제인가(REAP의 것만, 헷갈리면 backlog 먼저) → 재현 확정(안 되면 숨기지 않음) → 실을 것(REAP가 소유하는 사실만)과 안 실을 것(이 프로젝트의 코드·경로·기록 본문 — 공개 리포) → `gh issue create`, `gh` 없으면 본문을 사람에게 → URL을 이 프로젝트 backlog로. 닫힘은 추적 안 함
- **`reap --version`** — issue에 실을 바이너리 버전. `package.json`을 0.1.0으로(플러그인과 같게)
- backlog의 "정할 것" 셋에 답했다: `gh` 없으면 본문을 낸다 · spec skill 표 9종 · 사용자 프로젝트 사정은 파일 *이름*까지만
- `06-agent.md`·`08-delivery.md`·`04-commands.md`·`summary.md`. 139 통과, `localUpdate` 반영

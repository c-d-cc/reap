---
id: gen-0114-exec
slug: resolve-issue-33
type: exec
backlog: bk-b65f03
title: "resolve #33: complete에 genome 갱신 절차 추가"
startedAt: 2026-09-11T01:33:33Z
startCommit: 761458c
status: open
---

## Intent

`complete`가 `environment/summary.md` 낡음을 검사하듯 **genome 낡음도 같은 자리에서 검사한다.** 끝나는 조건은 issue의 expected 그대로다 — `complete`에 genome을 다루는 절차가 있고, `make backlog --type genome`을 **누가 언제 소비하는지**가 스킬 본문에 적혀 있다.

## References

- <https://github.com/c-d-cc/reap/issues/33> — "genome은 **매 세션 주입되는 파일**이라, 낡은 채로 두면 그 뒤 모든 세션이 틀린 전제로 시작한다. `summary.md`가 위험한 것과 정확히 같은 이유인데 검사는 `summary.md`에만 있다."
- 작성자가 남긴 판단 위임 — "별도 스킬(`sync-genome` 같은)로 빼는 편이 나을 수도 있다 … 어느 쪽이 맞는지는 REAP 쪽 판단"
- `plugin/skills/migrate/references/migration-map.md:40,43` — v0.17에서 오는 프로젝트에 `make backlog --type genome`을 약속한다. **소비자가 어느 스킬에도 없다.** 이 리포 안에서 이미 어긋나 있는 자리
- `plugin/skills/complete/SKILL.md:48` — `summary.md` 검사 표. genome 절은 이 표와 같은 모양이어야 한다
- `plugin/skills/carve-milestone/SKILL.md:83` — "check that everything this milestone settled has been reflected." genome을 이름으로 부르지 않는다

## Working Plan

별도 스킬을 만들지 않는다 — 스킬 표면을 늘리는 것은 방향이 바뀌는 변경이고, 이 공백은 기존 두 자리에 얹으면 메워진다.

1. `complete`에 `## Before closing: does `genome/` still hold?` 절 — `summary.md` 표와 같은 모양. 판정 기준은 `evolution.md`가 이미 가진 질문("다음 세션의 새 에이전트가 이 변화를 모르면 일을 제대로 할 수 있나"). `invariants.md`는 사람만 고친다는 선을 같이 긋는다
2. 같은 절에서 `--type genome` backlog를 소비한다 — 열린 것이 있으면 지금 반영하고 `mark backlog --consumed`
3. `carve-milestone`의 닫기 절에 genome 훑기 한 줄 — 세대별 판단이 어려운 다세대 구조 변경(issue의 실제 사례)을 잡는 자리
4. `plugin/` 변경이므로 localUpdate로 로컬 반영

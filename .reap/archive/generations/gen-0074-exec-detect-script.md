---
id: gen-0074-exec
slug: detect-script
type: exec
backlog: bk-a4d829
title: 판정을 스크립트로 — 표지 파일 명백 판정과 map 실행 위치 규칙
startedAt: 2026-08-31T22:46:53Z
startCommit: 4c2907b
status: closed
closedAt: 2026-08-31T23:00:20Z
endCommit: c5aab6e
---
## Intent

bk-a4d829 — ① migrate 1/8 판정을 skill 산문에서 **스크립트**(scripts/detect-version.sh)로 옮긴다: 0.18에서 새로 생긴 파일(map.md·sequence/generation.md)과 0.17에만 있는 파일(lineage/·shortterm.md·current.yml·hooks/·sequence/goal.md)로 명백 판정, mixed·unknown은 사람에게. ② map 공통 규칙에 실행 위치 규칙(reap의 상위 .reap 탐색 위험). ③ 혼입 의혹 확인 결과를 기록. 끝은 스크립트가 실물 6케이스(v017·v018·none·mixed 포함)를 전부 맞히는 것.

## Outcome

- **혼입 의혹의 진상**: reap-main의 sequence/·vision/milestones/는 v0.17 고유 추적 파일(sequence/goal.md는 8/21 gen-098). worktree 누수 아님. mixed 판정의 실제 원인은 **v0.18 init도 hooks/conditions를 만들기 때문** — 그리고 이것은 결함이 아니라 의도된 자리다(사람, 2026-09-01: v0.18도 hooks 제공 예정, lifecycle만 다름)
- **판정 스크립트** `scripts/detect-version.sh` (v0.18 36dd2bc·87791b6): 0.18 표지 map.md·sequence/generation.md / 0.17 표지 lineage/·shortterm.md·current.yml·**hooks 안의 파일**·sequence/goal.md. v018|v017|none|mixed|unknown, mixed·unknown은 사람에게. 6케이스(실물 v0.17·이주 표본·원본·개발 리포·빈·혼재) 전부 정답. SKILL 1/8은 스크립트 호출로 교체 — 판정은 스크립트가 소유
- map 공통 규칙에 실행 위치 규칙 추가(reap의 상위 .reap 탐색 위험)

## Dead Ends

- **v0.18 레이아웃에서 hooks/를 내리려던 접근** — spec 07의 "아직 안 만든다"를 근거로 삼았으나 사람이 뒤집음: 자리는 유지, 판정 표지만 파일 기반으로 좁힘. spec 07-orchestrate:70이 이미 "init이 만들지만 비어 있다"고 적고 있었다 — 먼저 읽었어야 했다

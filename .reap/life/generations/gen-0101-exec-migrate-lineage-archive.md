---
id: gen-0101-exec
slug: migrate-lineage-archive
type: exec
milestone: ms-024
title: lineage → archive/generations 승계 스크립트, 해소된 backlog → archive/backlog, 번호 이어가기
startedAt: 2026-09-04T16:52:37Z
startCommit: 602be5a
status: open
---
## Intent

사람(2026-09-05): "archive는 하나도 migration이 안 됐는데?" — `.reap-v0_17`을 지우면 47세대의 회고·결정·힌트가 작업 트리에서 사라진다. 매핑 #8 "승계하지 않는다"(gen-0070 위임 판정)를 뒤집는다: lineage를 v0.18 세대 기록 형식으로 `archive/generations/`에 옮기고 `sequence/generation.md`에 번호를 이어 등록해 다음 세대가 그 뒤 번호로 시작한다. 해소된 backlog는 `archive/backlog/`에 consumed로. 변환은 결정적이라 스크립트(`scripts/migrate-lineage.mjs`)가 한다. 끝은 selfview에서 46세대 + pre-reap-history가 archive에 있고 doctor 0, verify에 "lineage 승계" 검사가 더해져 통과.

## Delegation

brief로 subagent에게 — reap 주 트리에서 스크립트·map·verify 수정, selfview에서 실행(커밋은 주 세션).

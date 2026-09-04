---
id: gen-0100-exec
slug: migrate-skill-v2
type: exec
milestone: ms-024
title: migration-map·SKILL 개정 — 작업 상태 복원 매핑과 검증 스크립트
startedAt: 2026-09-04T15:59:41Z
startCommit: 07ad883
status: open
---
## Intent

ms-024 task 1 — tasks/1-skill-revision.md 전부: migration-map 매핑 #1·#2·#5·#6 재정의, #11·#12 신설, `scripts/verify-migration.sh`, SKILL 7/8·8/8 갱신, bk-d0eef8(하위 디렉토리·링크·분량 세기·backlog 재발급 방지)도 함께 소비. 끝은 skill 문서가 selfview 실물을 기준으로 실행 가능한 지시가 되는 것 — 검증은 task 2의 재이주.

## Delegation

brief로 subagent에게 — 주 트리. `make`·`mark` 금지(backlog 소비 표시는 주 세션이).

# Objective

## Goal
autoSubagent 모드 구현 — evolve 시 script가 subagent prompt까지 조립, parent는 Agent tool 호출만

## Completion Criteria
- config.yml에 autoSubagent 옵션 (기본값 true)
- reap run evolve가 autoSubagent: true일 때 subagentPrompt를 context에 포함한 JSON 출력
- reap.evolve.md가 autoSubagent 모드 감지 시 Agent tool 사용 지시
- reap update가 ~/.claude/commands/reap.*.md 레거시 정리
- 기존 524 tests 유지 + 신규

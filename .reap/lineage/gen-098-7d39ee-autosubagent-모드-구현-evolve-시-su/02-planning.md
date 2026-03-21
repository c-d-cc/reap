# Planning

## Tasks

### Task 1: config.yml — autoSubagent 옵션
- `src/types/index.ts` — ReapConfig에 `autoSubagent?: boolean` 추가
- `src/core/config.ts` — 기본값 true 처리
- `tests/core/config.test.ts` — 옵션 파싱 테스트

### Task 2: reap run evolve — subagent prompt 생성
- `src/cli/commands/run/evolve.ts` 수정:
  - config에서 autoSubagent 읽기
  - true일 때 phase: "delegate" 추가
  - context.subagentPrompt에 full prompt 조립:
    - genome 요약 (principles, conventions, constraints 핵심)
    - current state (goal, stage)
    - backlog 목록
    - lifecycle 실행 지시 (각 stage command + next)
    - hook 실행 규칙
    - completion + archiving 지시
  - false일 때 기존 동작 유지
- `tests/commands/run/evolve.test.ts` 업데이트

### Task 3: reap.evolve.md — Agent tool 위임 지시
- `src/templates/commands/reap.evolve.md` 수정:
  - 기존 1줄 wrapper 유지하되, autoSubagent 모드 안내 추가
  - 또는 evolve.ts의 prompt에서 parent에게 Agent tool 사용법 지시

### Task 4: user-level commands 정리
- `src/core/agents/claude-code.ts` — removeStaleCommands 또는 별도 cleanup 로직
  - `~/.claude/commands/reap.*.md` 감지 → 삭제
- `src/cli/commands/update.ts`에서 호출
- 테스트 추가

### Task 5: 통합 테스트
- evolve autoSubagent=true 시 subagentPrompt 포함 확인
- evolve autoSubagent=false 시 기존 동작 확인

## Dependencies
Task 1 먼저 → Task 2, 3, 4 병렬 → Task 5

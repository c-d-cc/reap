# REAP MANAGED — Do not modify directly. Use reap run commands.
# Planning

## Tasks

### Task 1: archiving 시 REAP MANAGED 헤더 strip (독립, 간단)
- `src/core/generation.ts` — complete() 메서드에서 artifact 복사 시 첫 줄 `# REAP MANAGED` strip
- 테스트 추가

### Task 2: AI migration agent (독립, 복잡)
- `src/cli/commands/run/update.ts` 또는 신규 `migrate.ts` — migration gap 감지 시 AI prompt 출력
- 최신 REAP 기대 구조 spec 조립:
  - ReapConfig 필드 목록 + 기본값
  - .reap/ 디렉토리 구조 (paths.ts 기반)
  - hooks 형식, artifact 형식
- 사용자의 실제 .reap/ 스캔 결과와 diff
- AI에게 migration 실행 지시
- 테스트

## Dependencies
Task 1, 2 독립, 병렬 실행 가능

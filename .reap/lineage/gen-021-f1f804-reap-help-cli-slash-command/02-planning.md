# Planning

## Summary
`reap help` CLI 명령어로 전체 레퍼런스를 출력하고, `/reap.help` 슬래시 커맨드로 현재 상태에 맞는 contextual 도움말을 AI가 제공한다.

## Technical Context
- **Tech Stack**: Commander.js (CLI), Markdown (슬래시 커맨드)
- **Constraints**: commander의 기본 --help와 충돌하지 않도록 별도 command로 구현

## Tasks

### Phase 1: CLI help 명령어 (FR-001)
- [ ] T001 `src/cli/index.ts` — `reap help` command 추가 (CLI 명령어 목록 + 슬래시 커맨드 목록 + workflow 요약)

### Phase 2: 슬래시 커맨드 (FR-002)
- [ ] T002 `src/templates/commands/reap.help.md` — contextual help 슬래시 커맨드 신규 생성
- [ ] T003 `src/cli/commands/init.ts` — COMMAND_NAMES에 "reap.help" 추가

### Phase 3: genome 업데이트
- [ ] T004 `.reap/genome/constraints.md` — Slash Commands 카운트 11→12로 업데이트

### Phase 4: 검증
- [ ] T005 `bun test`, `bunx tsc --noEmit`, 빌드 검증
- [ ] T006 `reap help` 실행 테스트

## Dependencies
T001 독립
T002 독립
T003은 T002 이후
T004는 Completion에서 처리 (genome immutability)

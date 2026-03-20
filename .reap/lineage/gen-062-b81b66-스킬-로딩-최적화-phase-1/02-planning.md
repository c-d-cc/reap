# Planning

## Summary
~/.reap/commands/에 커맨드 원본 설치, ~/.claude/commands/에 redirect 파일, session-start.cjs에서 프로젝트 .claude/commands/ symlink 생성.

## Technical Context
- **Tech Stack**: TypeScript, Node.js (session-start.cjs는 CommonJS)
- **Constraints**: 기존 유저 호환 필수 — redirect 병행, 즉시 삭제 금지

## Tasks

### Phase 1: 경로 + 어댑터
- [ ] T001 `src/core/paths.ts` — `static get userReapCommands()` 추가 (`~/.reap/commands/`)
- [ ] T002 `src/core/agents/claude-code.ts` — `installCommands()`를 수정: ~/.reap/commands/에 원본 설치 + ~/.claude/commands/에 redirect 파일 생성

### Phase 2: init/update 동기화
- [ ] T003 `src/cli/commands/init.ts` — ~/.reap/commands/ 설치 로직 (어댑터에 위임)
- [ ] T004 `src/cli/commands/update.ts` — 마이그레이션: 기존 ~/.claude/commands/ 원본 → redirect 교체

### Phase 3: Session hook symlink
- [ ] T005 `src/templates/hooks/session-start.cjs` — .reap/ 감지 시 프로젝트 .claude/commands/에 symlink 생성 + .gitignore 관리

### Phase 4: 검증
- [ ] T006 `bun test` + `bunx tsc --noEmit` + `npm run build`

## Dependencies
T001 → T002 → T003, T004 (순차)
T005 독립
T006은 T001~T005 완료 후

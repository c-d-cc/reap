# Planning

## Summary
`.claude/commands/reap.*` → `.claude/skills/{name}/SKILL.md` 마이그레이션. session-start.cjs와 update.ts 두 파일 수정.

## Technical Context
- **Tech Stack**: Node.js (session-start.cjs), TypeScript (update.ts)
- **Constraints**: session-start.cjs는 sync API만 사용, update.ts는 async/await, `src/core/fs.ts` 유틸 사용

## Tasks

### Phase 1: session-start.cjs 수정
- [x] T001 `src/templates/hooks/session-start.cjs` -- Step 0의 커맨드 설치 로직을 skills 디렉토리 형식으로 변경. frontmatter 파싱하여 SKILL.md 생성
- [x] T002 `src/templates/hooks/session-start.cjs` -- 레거시 `.claude/commands/reap.*` 파일 정리 로직 추가
- [x] T003 `src/templates/hooks/session-start.cjs` -- .gitignore 엔트리를 `.claude/skills/reap.*`로 변경 (기존 `.claude/commands/reap.*` 엔트리도 정리)

### Phase 2: update.ts 수정
- [x] T004 `src/cli/commands/update.ts` -- project-level sync (라인 182-210)를 `.claude/skills/` 사용으로 변경. frontmatter 파싱 + SKILL.md 생성
- [x] T005 `src/cli/commands/update.ts` -- 레거시 `.claude/commands/reap.*` 정리 로직 추가

### Phase 3: 검증
- [x] T006 빌드 및 테스트 -- `bunx tsc --noEmit`, `npm run build`, `bun test` 실행

## Dependencies
- T002, T003은 T001 이후 (같은 파일 내 순차 수정)
- T004, T005는 T001-T003과 독립 (다른 파일)
- T006은 T001-T005 모두 완료 후


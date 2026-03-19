# Planning

## Summary

3개 축: (1) completion 템플릿에 Hook Suggestion Phase 추가 (2) stale genome 문서 수정 (3) session-start.sh에 source-map drift 체크 추가. 모두 템플릿/문서 변경이며 TypeScript 코드 변경 없음.

## Technical Context
- **변경 대상**: slash command 템플릿, genome 문서, session-start.sh
- **Constraints**: genome 불변 원칙이지만 현재 active generation이므로 genome 직접 수정 → backlog로 처리하고 completion에서 반영

## Tasks

### Phase 1: Hook Suggestion (reap.completion.md)
- [ ] T001 `src/templates/commands/reap.completion.md` — Phase 5 (Hook Suggestion) 추가

### Phase 2: Stale Genome 수정 (backlog → completion에서 반영)
- [ ] T002 `.reap/life/backlog/hook-system-update.md` — domain/hook-system.md 파일 기반 구조 반영 backlog
- [ ] T003 `.reap/life/backlog/constraints-hooks-update.md` — constraints.md Hooks 섹션 반영 backlog

### Phase 3: Sync Level 1 체크
- [ ] T004 `src/templates/hooks/session-start.sh` — source-map drift 감지 로직 추가

### Phase 4: 빌드 + 검증
- [ ] T005 `npm run build` + source 기반 `reap update`
- [ ] T006 `bun test` + `bunx tsc --noEmit`

## Dependencies
T001~T004 독립 (병렬)
T005 → T001~T004 후
T006 → T005 후

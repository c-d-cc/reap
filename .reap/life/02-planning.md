# REAP MANAGED — Do not modify directly. Use reap run commands.
# Planning

## Summary
`update.ts`의 `.claude/skills/` sync 로직(lines 182-215)을 `src/core/skills.ts`로 추출하고, `init.ts`에서도 호출하여 init 직후 skills가 설치되도록 수정.

## Technical Context
- **Tech Stack**: TypeScript, Node.js fs/promises, `src/core/fs.ts` 유틸
- **Constraints**: 파일 I/O는 `src/core/fs.ts` 경유, `.claude/skills/{name}/SKILL.md` 구조

## Tasks

### Phase 1: 공통 함수 추출 및 적용
- [x] T001 `src/core/skills.ts` -- `syncSkillsToProject()` 함수 생성. `update.ts` lines 182-215의 로직을 이동. 반환값은 `{ installed: number, total: number }`.
- [x] T002 `src/cli/commands/update.ts` -- step 5의 인라인 skills sync 로직을 `syncSkillsToProject()` 호출로 교체
- [x] T003 `src/cli/commands/init.ts` -- step 6 (`installCommands` 루프) 이후에 `syncSkillsToProject(projectRoot)` 호출 추가

### Phase 2: 테스트
- [x] T004 `tests/` -- `syncSkillsToProject()` 단위 테스트 (frontmatter 파싱, SKILL.md 생성, 이미 존재 시 skip)

## Dependencies
- T002, T003은 T001에 의존
- T004는 T001에 의존
- T002와 T003은 병렬 가능

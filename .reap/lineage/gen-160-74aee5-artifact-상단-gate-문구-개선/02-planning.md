# Planning

## Summary
Artifact 템플릿(11개)과 `CURRENT_YML_HEADER` 상수의 gate 문구를 새 형식으로 변경. 검증/strip 로직은 `startsWith` 및 정규식 기반이므로 수정 불필요.

## Technical Context
- **Tech Stack**: TypeScript, Node.js
- **Constraints**: 기존 header 검증 로직(`startsWith("# REAP MANAGED")`)과 strip 정규식(`^# REAP MANAGED[^\n]*\n`) 호환 필요

## Tasks

### Phase 1: 소스 코드 변경
- [ ] T001 `src/core/generation.ts` -- `CURRENT_YML_HEADER` 상수의 gate 문구 변경
- [ ] T002 `src/templates/artifacts/01-objective.md` -- gate 문구 변경
- [ ] T003 `src/templates/artifacts/02-planning.md` -- gate 문구 변경
- [ ] T004 `src/templates/artifacts/03-implementation.md` -- gate 문구 변경
- [ ] T005 `src/templates/artifacts/04-validation.md` -- gate 문구 변경
- [ ] T006 `src/templates/artifacts/05-completion.md` -- gate 문구 변경
- [ ] T007 `src/templates/artifacts/merge/01-detect.md` -- gate 문구 변경
- [ ] T008 `src/templates/artifacts/merge/02-mate.md` -- gate 문구 변경
- [ ] T009 `src/templates/artifacts/merge/03-merge.md` -- gate 문구 변경
- [ ] T010 `src/templates/artifacts/merge/04-sync.md` -- gate 문구 변경
- [ ] T011 `src/templates/artifacts/merge/05-validation.md` -- gate 문구 변경
- [ ] T012 `src/templates/artifacts/merge/06-completion.md` -- gate 문구 변경

### Phase 2: 검증
- [ ] T013 기존 테스트 실행 및 통과 확인 (`bun test`)
- [ ] T014 현재 진행 중 artifact(01-objective.md, 02-planning.md)의 gate 문구도 새 형식 적용

## Dependencies
- T002~T012는 모두 독립적, 병렬 수행 가능
- T013은 T001~T012 완료 후 실행
- T014는 T013 통과 후 실행

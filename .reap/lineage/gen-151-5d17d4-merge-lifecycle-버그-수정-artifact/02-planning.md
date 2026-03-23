# Planning

## Summary

두 가지 merge lifecycle 버그를 수정한다:
1. merge stage `--phase complete`에서 artifact 존재 검증 누락 → 검증 추가
2. `MergeGenerationManager.complete()`에서 pending backlog carry-forward 누락 → normal lifecycle과 동일하게 수정

## Technical Context
- **Tech Stack**: TypeScript, Node.js fs/promises, Bun (test)
- **Constraints**: 파일 I/O는 `src/core/fs.ts` 유틸 경유

## Tasks

### Phase 1: Artifact 존재 검증 추가

- [ ] T001 `src/cli/commands/run/merge-mate.ts` -- `--phase complete` 핸들러에 `02-mate.md` 존재 검증 추가 (merge-validation 패턴과 동일)
- [ ] T002 `src/cli/commands/run/merge-merge.ts` -- `--phase complete` 핸들러에 `03-merge.md` 존재 검증 추가
- [ ] T003 `src/cli/commands/run/merge-sync.ts` -- `--phase complete` 핸들러에 `04-sync.md` 존재 검증 추가
- [ ] T004 `src/cli/commands/run/merge-validation.ts` -- 기존 `05-validation.md` 검증 확인 (변경 불필요)

### Phase 2: Backlog carry-forward 수정

- [ ] T005 `src/core/merge-generation.ts` -- `complete()` 메서드의 backlog 처리를 normal lifecycle(`GenerationManager.complete()`)과 동일하게 수정. `rename()` 대신 read → copy to lineage → consumed만 삭제

### Phase 3: 테스트

- [ ] T006 `tests/core/merge-mate-artifact.test.ts` -- merge-mate --phase complete 시 artifact 미존재 에러 테스트
- [ ] T007 `tests/core/merge-merge-artifact.test.ts` -- merge-merge --phase complete 시 artifact 미존재 에러 테스트
- [ ] T008 `tests/core/merge-sync-artifact.test.ts` -- merge-sync --phase complete 시 artifact 미존재 에러 테스트
- [ ] T009 `tests/core/merge-backlog-carry-forward.test.ts` -- merge completion backlog carry-forward 동작 테스트

### Phase 4: 검증

- [ ] T010 전체 테스트 실행 (`bun test`), 타입체크 (`bunx tsc --noEmit`), 빌드 (`npm run build`)

## Dependencies

- T001, T002, T003 — 병렬 가능 (서로 독립)
- T005 — T001~T003과 독립, 병렬 가능
- T006~T009 — T001~T005 완료 후 실행
- T010 — T006~T009 완료 후 실행

## E2E Test Scenarios

### Scenario 1: Merge artifact 검증
- Setup: merge generation 생성, detect 완료, mate stage 진입
- Action: artifact 파일 미생성 상태에서 `merge-mate --phase complete` 실행
- Assert: 에러 반환, stage 전환 안 됨

### Scenario 2: Backlog carry-forward
- Setup: merge generation 생성, backlog에 pending + consumed 항목 존재
- Action: `merge-completion --phase archive` 실행
- Assert: pending 항목이 `.reap/life/backlog/`에 유지, consumed 항목만 삭제

# Planning

## Summary

17개 slash command 마크다운 파일을 수정하여 책임을 재분배한다:
- `reap.next`: hook + archiving 제거, stage 전환 전용으로 축소
- `reap.completion` / `reap.merge.completion`: archiving 흡수 + hook 실행
- 나머지 stage command: 말단에 자기 hook 실행 추가
- `reap.evolve` / `reap.merge.evolve`: hook 자동 실행 안내

## Technical Context
- **Tech Stack**: 마크다운 템플릿 수정만 (TypeScript 소스 변경 없음)
- **Constraints**: `bunx tsc --noEmit`, `npm run build`, `bun test` 통과 필수

## Tasks

### Phase 1: reap.next 축소
- [ ] T001 `src/templates/commands/reap.next.md` — Hook Execution (Stage Transition) 섹션 전체 제거
- [ ] T002 `src/templates/commands/reap.next.md` — When Advancing from Completion (Archiving) 섹션 전체 제거
- [ ] T003 `src/templates/commands/reap.next.md` — Hook Execution (Generation Complete) 섹션 전체 제거
- [ ] T004 `src/templates/commands/reap.next.md` — Completion 섹션 단순화 (archiving 관련 문구 제거)

### Phase 2: reap.completion에 archiving 흡수
- [ ] T005 `src/templates/commands/reap.completion.md` — Phase 6 (Archiving) 추가: lineage 이동, meta.yml, backlog 처리, submodule 체크, 커밋
- [ ] T006 `src/templates/commands/reap.completion.md` — Phase 5 (Hook Suggestion)의 event 목록을 8개로 확장
- [ ] T007 `src/templates/commands/reap.completion.md` — onLifeCompleted hook 실행을 archiving 전(커밋 전)에 추가
- [ ] T008 `src/templates/commands/reap.completion.md` — Completion 섹션 수정: reap.next 대신 자체 archiving 완료 안내

### Phase 3: Normal stage command에 hook 추가
- [ ] T009 [P] `src/templates/commands/reap.objective.md` — Completion 섹션에 onLifeObjected hook 실행 추가
- [ ] T010 [P] `src/templates/commands/reap.planning.md` — Completion 섹션에 onLifePlanned hook 실행 추가
- [ ] T011 [P] `src/templates/commands/reap.implementation.md` — Completion 섹션에 onLifeImplemented hook 실행 추가
- [ ] T012 [P] `src/templates/commands/reap.validation.md` — Completion 섹션에 onLifeValidated hook 실행 추가

### Phase 4: Merge command에 hook 추가
- [ ] T013 [P] `src/templates/commands/reap.merge.start.md` — 말단에 onMergeStarted hook 실행 추가
- [ ] T014 [P] `src/templates/commands/reap.merge.detect.md` — 말단에 onMergeDetected hook 실행 추가
- [ ] T015 [P] `src/templates/commands/reap.merge.mate.md` — 말단에 onMergeMated hook 실행 추가
- [ ] T016 [P] `src/templates/commands/reap.merge.merge.md` — 말단에 onMergeMerged hook 실행 추가
- [ ] T017 [P] `src/templates/commands/reap.merge.sync.md` — 말단에 onMergeSynced hook 실행 추가
- [ ] T018 [P] `src/templates/commands/reap.merge.validation.md` — 말단에 onMergeValidated hook 실행 추가
- [ ] T019 `src/templates/commands/reap.merge.completion.md` — archiving 흡수 + onMergeCompleted hook (커밋 전) + 커밋

### Phase 5: Evolve + 기타 정리
- [ ] T020 `src/templates/commands/reap.evolve.md` — hook 자동 실행 안내 추가, archiving이 reap.completion에서 수행됨 반영
- [ ] T021 `src/templates/commands/reap.merge.evolve.md` — hook 자동 실행 안내 추가
- [ ] T022 `src/templates/commands/reap.objective.md` — backlog target 필드 형식 통일 (`target: genome/{file}`)

### Phase 6: Validation
- [ ] T023 `bunx tsc --noEmit` 통과 확인
- [ ] T024 `npm run build` 통과 확인
- [ ] T025 `bun test` 통과 확인

## E2E Test Scenarios

이번 변경은 마크다운 템플릿 수정이므로, 기존 E2E 시나리오(01-normal-lifecycle.mjs 등)는 AI가 템플릿을 읽고 실행하는 방식이라 직접적으로 깨지지 않음.
단, 기존 E2E가 "reap.next가 archiving을 수행한다"는 전제로 동작하는지 확인:
- 01-normal-lifecycle.mjs: `/reap.evolve`를 실행하며, 내부적으로 `reap.next`가 archiving을 하던 것이 이제 `reap.completion`이 수행. AI가 새 템플릿을 따르면 정상 동작.
- 02-basic-merge.mjs: `/reap.pull`→`/reap.merge.evolve` 실행. 마찬가지로 AI가 새 템플릿을 따르면 정상.

결론: 기존 E2E 시나리오 자체는 수정 불필요. AI가 올바른 템플릿을 읽으면 동작이 자연스럽게 변경됨.

## Dependencies

- T001~T004: 순차 (같은 파일 수정이므로 단일 작업으로 묶음 가능)
- T005~T008: 순차 (같은 파일)
- T009~T012: 병렬 가능
- T013~T019: 병렬 가능 (T019만 archiving 로직 포함이라 별도)
- T020~T022: 병렬 가능
- T023~T025: Phase 1~5 완료 후 순차

# Planning

## Summary
두 트랙 병렬 작업: (1) command 스크립트 + artifact 템플릿을 점진적 기록 방식으로 변경, (2) old lifecycle 테스트를 5단계에 맞게 수정. 두 트랙은 독립적이므로 병렬 가능.

## Technical Context
- **Tech Stack**: TypeScript, Bun, Commander.js
- **Constraints**: 기존 83개 통과 테스트 유지, src/ 코어 로직 변경 불필요

## Tasks

### Phase 1: Command 스크립트 — 점진적 기록 방식 전환

- [ ] T001 command 스크립트 6개 수정 — artifact를 stage 진입 시 즉시 생성하도록 변경
  - `reap.objective.md`: "Artifact Generation" → "Stage 진입 시 01-objective.md 즉시 생성, 작업 중 섹션별 업데이트"
  - `reap.planning.md`: 동일 패턴
  - `reap.implementation.md`: 태스크 완료 시마다 03-implementation.md에 즉시 기록 강조
  - `reap.validation.md`: 검증 항목마다 결과 즉시 기록
  - `reap.completion.md`: 동일 패턴
  - `reap.evolve.md`: 변경 없음 (stage 전환만 담당)
  - 대상: `src/templates/commands/` + `.reap/commands/` 동기화

- [ ] T002 artifact 템플릿 5개 수정 — 빈 상태에서도 유효한 구조로
  - 각 섹션에 placeholder 대신 빈 테이블/리스트 유지
  - "작업 중 이 섹션을 점진적으로 채우세요" 안내 제거 (구조 자체가 점진적 기록을 유도)
  - 대상: `src/templates/artifacts/`

### Phase 2: Old lifecycle 테스트 수정

- [ ] T003 `tests/core/lifecycle.test.ts` — 5단계 매핑
  - conception→objective, formation→planning 등
  - 8 stages → 5 stages

- [ ] T004 `tests/core/types.test.ts` — 5단계 + MutationRecord 제거
  - LifeCycleStage 8개 → 5개
  - MutationRecord import 제거

- [ ] T005 `tests/core/generation.test.ts` — 5단계 flow
  - conception→objective, formation→planning
  - advance 7회 → 4회 (5단계)
  - legacy stage 제거

- [ ] T006 `tests/core/mutation.test.ts` — 삭제
  - mutation 모듈 자체가 삭제됨

- [ ] T007 `tests/commands/evolve.test.ts` — 5단계 매핑

- [ ] T008 `tests/commands/status.test.ts` — conception→objective

- [ ] T009 `tests/integration/full-lifecycle.test.ts` — 5단계 flow + mutation import 제거

### Phase 3: 검증

- [ ] T010 전체 테스트 + 타입체크 통과 확인

## Dependencies
- T001, T002: 독립 (Phase 1)
- T003~T009: 독립, 병렬 가능 (Phase 2)
- T010: Phase 1 + Phase 2 전부 완료 후

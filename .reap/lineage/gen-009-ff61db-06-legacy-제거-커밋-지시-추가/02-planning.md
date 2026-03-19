# Planning

## Summary
3개 트랙: (1) 06-legacy.md 제거 + compression이 05-completion.md Summary를 참조, (2) reap.evolve.md에 generation 완료 커밋 지시, (3) reap.implementation.md gate 완화. 대부분 독립적이므로 병렬 가능.

## Technical Context
- **Tech Stack**: TypeScript, Bun, Commander.js
- **Constraints**: 기존 96개 테스트 유지

## Tasks

### Phase 1: 06-legacy.md 제거 + completion 통합

- [ ] T001 `src/templates/artifacts/05-completion.md` — Summary 섹션 추가 (goal, started, completed, genome version, key changes)
- [ ] T002 `src/templates/commands/reap.completion.md` — Summary 섹션 작성 지시 추가
- [ ] T003 `src/core/generation.ts` complete() — 06-legacy.md 생성 로직 제거
- [ ] T004 `src/core/compression.ts` compressLevel1() — 06-legacy.md 대신 05-completion.md의 Summary 섹션에서 메타데이터 추출. regex 패턴도 현재 영어 섹션명에 맞게 업데이트
- [ ] T005 관련 테스트 수정 — generation.test.ts, full-lifecycle.test.ts에서 06-legacy.md 기대 제거

### Phase 2: Generation 완료 시 커밋 지시

- [ ] T006 `src/templates/commands/reap.evolve.md` — "completion에서 advance 시" 섹션에 커밋 지시 추가: 코드+artifact를 함께 커밋, 메시지 형식 지정

### Phase 3: Implementation gate 완화

- [ ] T007 `src/templates/commands/reap.implementation.md` — gate의 "uncommitted changes → ERROR + STOP"을 "사용자에게 커밋할지 묻기"로 변경

### Phase 4: 동기화 + 검증

- [ ] T008 `.reap/commands/` 동기화 — src/templates/commands/ 변경분 반영
- [ ] T009 전체 테스트 + 타입체크 통과 확인

## Dependencies
- T001~T005: 순차 (T001→T002→T003→T004→T005)
- T006, T007: 독립, Phase 1과 병렬 가능
- T008: T001~T007 완료 후
- T009: 전체 완료 후

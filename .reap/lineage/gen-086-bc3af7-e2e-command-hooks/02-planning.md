# Planning

## Summary

단일 테스트 파일로 8개 시나리오를 구현. 각 시나리오는 src/templates/commands/*.md 파일을 읽어서 구조적 검증.

## Tasks

### Phase 1: 테스트 파일 작성
- [ ] T001 `tests/e2e/command-templates.test.ts` — 8개 시나리오 테스트 작성
  - S1: reap.next 축소 검증
  - S2: normal stage command hook 검증 (9개)
  - S3: reap.completion archiving 검증
  - S4: hook 타이밍 검증 (커밋 전)
  - S5: submodule 체크 검증
  - S6: merge command hook 검증 (7개+)
  - S7: reap.evolve hook auto-execution 안내 검증
  - S8: reap.back onLifeRegretted 검증

### Phase 2: 검증
- [ ] T002 `bun test` 전체 통과 확인
- [ ] T003 `bunx tsc --noEmit` 통과
- [ ] T004 `npm run build` 통과

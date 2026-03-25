# Planning — gen-014-79409d

## Goal
core 모듈 5개(backlog, nonce, generation, archive, compression)에 대한 unit test 작성. 기존 lifecycle.test.ts 패턴을 따라 bun:test 기반으로 구현.

## Completion Criteria
1. `tests/unit/backlog.test.ts` — toKebabCase, createBacklog, scanBacklog, consumeBacklog 테스트 통과
2. `tests/unit/nonce.test.ts` — generateToken, verifyToken 테스트 통과
3. `tests/unit/generation.test.ts` — GenerationManager (create, save/current, countLineage) 테스트 통과
4. `tests/unit/archive.test.ts` — archiveGeneration (artifact 복사, consumed/pending backlog 분리, life 정리) 테스트 통과
5. `tests/unit/compression.test.ts` — compressLineage (threshold 미만 skip, 오래된 것 압축, recent 보호) 테스트 통과
6. `bun test tests/unit/` 전체 통과 (기존 lifecycle 12개 + 신규)
7. tests/ submodule에 커밋 완료 (push는 유저 승인 후)

## Tasks
- [ ] T001 `tests/unit/backlog.test.ts` — toKebabCase 순수 함수 테스트 (한글, 특수문자, 공백 등)
- [ ] T002 `tests/unit/backlog.test.ts` — createBacklog (파일 생성, frontmatter 확인, 잘못된 type 에러)
- [ ] T003 `tests/unit/backlog.test.ts` — scanBacklog (여러 .md 파일 파싱, 빈 디렉토리)
- [ ] T004 `tests/unit/backlog.test.ts` — consumeBacklog (status 변경, consumedBy/consumedAt 추가)
- [ ] T005 `tests/unit/nonce.test.ts` — generateToken (nonce+hash 생성), verifyToken (정상/비정상 검증)
- [ ] T006 `tests/unit/generation.test.ts` — GenerationManager.create (ID 형식, state 저장)
- [ ] T007 `tests/unit/generation.test.ts` — save/current round-trip, countLineage
- [ ] T008 `tests/unit/archive.test.ts` — archiveGeneration (artifact 복사, consumed backlog 아카이브, pending 유지, life 정리)
- [ ] T009 `tests/unit/compression.test.ts` — compressLineage (threshold 미만, 압축 동작, recent 보호)
- [ ] T010 전체 unit test 실행 및 검증
- [ ] T011 tests/ submodule 커밋

## Scope
- 대상 파일: `tests/unit/{backlog,nonce,generation,archive,compression}.test.ts` (5개 신규)
- 기존 `tests/unit/lifecycle.test.ts`는 수정 없음
- 테스트 검증: `bun test tests/unit/`

## Dependencies
- T001~T004 → 독립 (backlog.test.ts 하나의 파일에 순차 작성)
- T005 → 독립
- T006~T007 → 독립
- T008 → T002~T004 패턴 참고
- T009 → 독립
- T010 → T001~T009 모두 완료 후
- T011 → T010 통과 후

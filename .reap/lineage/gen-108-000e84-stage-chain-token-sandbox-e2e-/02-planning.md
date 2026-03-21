# Planning

## Summary
Stage chain token E2E 테스트 2개 파일 작성: 셸 스크립트와 bun 테스트 파일.

## Technical Context
- **Tech Stack**: TypeScript, Bun test, Bash
- **Constraints**: tests/ 폴더는 private submodule, 기존 E2E 패턴 준수

## Tasks

### Task 1: `tests/e2e/stage-token-e2e.sh` 셸 스크립트 작성
- temp dir에 sandbox 프로젝트 생성 (git init + reap init)
- token chain 전체 흐름 테스트:
  - start --phase create -> expectedTokenHash 확인
  - next (no nonce) -> BLOCKED 확인
  - next wrongnonce -> BLOCKED 확인
  - objective --phase complete -> nonce 추출
  - next valid-nonce -> stage advance 확인
  - planning -> implementation -> validation -> completion 반복
- PASS/FAIL 출력, exit 0/1

### Task 2: `tests/e2e/stage-token-e2e.test.ts` bun 테스트 작성
- 기존 run-lifecycle.test.ts 패턴 따름
- createTestProject(), runWithCapture(), runNextWithNonce() 활용
- 테스트 케이스:
  - T1: start create 후 expectedTokenHash 존재 확인
  - T2: nonce 없이 next -> error
  - T3: 잘못된 nonce로 next -> error
  - T4: 올바른 nonce로 next -> 성공
  - T5: 전체 lifecycle token chain 통과

## Dependencies
- `tests/commands/run/_helpers.ts` — 기존 test helper 재사용
- `src/core/generation.ts` — generateStageToken, verifyStageToken
- `src/cli/commands/run/*.ts` — execute 함수들

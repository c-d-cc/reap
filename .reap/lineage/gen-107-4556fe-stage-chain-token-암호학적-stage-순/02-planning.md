# Planning

## Summary
Stage Chain Token 구현 — cryptographic nonce 기반 stage 순서 강제 메커니즘

## Technical Context
- **Tech Stack**: TypeScript, Bun, Node.js crypto
- **Constraints**: bun test, bunx tsc --noEmit 통과 필수

## Tasks

### Phase 1: Core Token Functions
- [ ] T001 `src/core/generation.ts` -- generateStageToken(genId, stage) 함수 추가: randomBytes(16) nonce 생성, SHA256(nonce+genId+stage) hash 계산, {nonce, hash} 반환
- [ ] T002 `src/core/generation.ts` -- verifyStageToken(token, genId, stage, expectedHash) 함수 추가: SHA256(token+genId+stage) === expectedHash 검증
- [ ] T003 `src/types/index.ts` -- GenerationState에 expectedTokenHash?: string 필드 추가

### Phase 2: Stage Command Integration
- [ ] T004 `src/cli/commands/run/start.ts` -- create phase에서 generateStageToken 호출, current.yml에 hash 저장, context에 stageToken emit
- [ ] T005 `src/cli/commands/run/objective.ts` -- complete phase에서 generateStageToken 호출, current.yml에 hash 저장, context에 stageToken emit
- [ ] T006 `src/cli/commands/run/planning.ts` -- complete phase에서 동일 패턴 적용
- [ ] T007 `src/cli/commands/run/implementation.ts` -- complete phase에서 동일 패턴 적용
- [ ] T008 `src/cli/commands/run/validation.ts` -- complete phase에서 동일 패턴 적용
- [ ] T009 `src/cli/commands/run/completion.ts` -- complete phase(retrospective)에서 동일 패턴 적용 (completion은 next 안 부르므로 선택적)

### Phase 3: Next Command Token Verification
- [ ] T010 `src/cli/commands/run/next.ts` -- --token 파라미터 또는 REAP_STAGE_TOKEN env var 읽기
- [ ] T011 `src/cli/commands/run/next.ts` -- verifyStageToken 호출, 실패 시 AI-facing 에러 메시지 emit
- [ ] T012 `src/cli/commands/run/next.ts` -- 검증 성공 후 새 token 생성, context에 stageToken 포함

### Phase 4: Evolve Prompt Update
- [ ] T013 `src/cli/commands/run/evolve.ts` -- buildSubagentPrompt에 token relay 규칙 추가

### Phase 5: Build & Test
- [ ] T014 빌드: bunx tsc --noEmit 통과 확인
- [ ] T015 테스트: generateStageToken/verifyStageToken unit test 작성 및 실행

## Dependencies
- T004~T009 → T001, T002, T003 (core 함수 먼저)
- T010~T012 → T001, T002, T003 (core 함수 먼저)
- T014, T015 → 모든 구현 완료 후

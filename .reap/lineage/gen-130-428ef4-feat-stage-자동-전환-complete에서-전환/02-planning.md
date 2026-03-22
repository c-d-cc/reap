# Planning

## Summary
`--phase complete`에서 stage 자동 전환을 수행하고, 다음 stage command 시작 시 token 검증을 추가한다. `/reap.next`는 유지하되, complete된 상태에서만 전환하도록 변경한다.

## Technical Context
- **Tech Stack**: TypeScript, esbuild, bun test
- **Constraints**: emitOutput이 process.exit(0)을 호출하므로 전환 로직은 emitOutput 전에 수행해야 함

## Tasks

### Phase 1: 공통 유틸리티 추출

- [ ] T001 `src/core/stage-transition.ts` -- next.ts의 전환 로직(stage 업데이트, timeline 추가, artifact template 복사, transition hook 실행)을 공통 함수로 추출
- [ ] T002 `src/core/stage-transition.ts` -- token 검증 공통 함수 추출 (lastNonce + expectedTokenHash 검증, lastNonce 삭제)

### Phase 2: Normal lifecycle -- complete에서 자동 전환

- [ ] T003 `src/cli/commands/run/objective.ts` -- complete phase에서 emitOutput 전에 자동 전환 로직 추가
- [ ] T004 `src/cli/commands/run/planning.ts` -- (1) work phase 시작 시 token 검증 추가 (2) complete phase에서 자동 전환 로직 추가
- [ ] T005 `src/cli/commands/run/implementation.ts` -- (1) work phase 시작 시 token 검증 추가 (2) complete phase에서 자동 전환 로직 추가
- [ ] T006 `src/cli/commands/run/validation.ts` -- (1) work phase 시작 시 token 검증 추가 (2) complete phase에서 자동 전환 로직 추가
- [ ] T007 `src/cli/commands/run/completion.ts` -- 시작 시 token 검증 추가

### Phase 3: Merge lifecycle -- complete에서 자동 전환

- [ ] T008 `src/cli/commands/run/merge-detect.ts` -- complete phase에 nonce 생성 + 자동 전환 추가
- [ ] T009 `src/cli/commands/run/merge-mate.ts` -- (1) 시작 시 token 검증 추가 (2) complete에 nonce 생성 + 자동 전환 추가
- [ ] T010 `src/cli/commands/run/merge-merge.ts` -- (1) 시작 시 token 검증 추가 (2) complete에 nonce 생성 + 자동 전환 추가
- [ ] T011 `src/cli/commands/run/merge-sync.ts` -- (1) 시작 시 token 검증 추가 (2) complete에 nonce 생성 + 자동 전환 추가
- [ ] T012 `src/cli/commands/run/merge-validation.ts` -- (1) 시작 시 token 검증 추가 (2) complete에 nonce 생성 + 자동 전환 추가
- [ ] T013 `src/cli/commands/run/merge-completion.ts` -- 시작 시 token 검증 추가

### Phase 4: next.ts 업데이트

- [ ] T014 `src/cli/commands/run/next.ts` -- lastNonce가 존재할 때만 전환, 없으면 에러

### Phase 5: 문서 업데이트

- [ ] T015 `src/templates/hooks/reap-guide.md` -- lifecycle 실행 흐름 업데이트 (2단계 흐름 반영)
- [ ] T016 `src/cli/commands/run/evolve.ts` -- subagentPrompt의 Stage Loop 단순화
- [ ] T017 `README.md`, `README.ko.md`, `README.ja.md`, `README.zh-CN.md` -- lifecycle 설명 업데이트

### Phase 6: 테스트

- [ ] T018 기존 단위 테스트 수정 (next.ts 관련 테스트)
- [ ] T019 `tests/e2e/stage-token-e2e.sh` -- E2E 테스트 작성 및 OpenShell sandbox 실행

## Dependencies
- T001, T002 → T003~T014 (공통 유틸리티가 먼저 필요)
- T003~T013 → T018, T019 (구현 후 테스트)
- T003~T014 → T015~T017 (구현 후 문서)

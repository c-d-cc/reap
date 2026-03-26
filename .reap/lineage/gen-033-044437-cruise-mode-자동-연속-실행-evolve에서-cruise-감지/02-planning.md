# Planning — gen-033-044437

## Goal
evolve 명령이 cruise mode를 인식하여, 1 generation 완료 후 자동으로 다음 generation을 시작하고 N회까지 연속 실행하는 기능 구현.

## Completion Criteria
1. `reap cruise 3` → `reap run evolve` 시, subagent prompt에 cruise loop 지시가 포함됨
2. evolve context에 cruiseMode, cruiseRemaining, cruiseTotal 정보 포함
3. buildBasePrompt에 cruise loop 실행 절차 섹션 추가
4. completion commit의 cruiseActive 결과에 따라 다음 generation 자동 시작 지시
5. suggestNextGoals() 기반 auto goal 선택 로직이 prompt에 포함
6. cruise 후보 없을 시 중단 지시 포함
7. unit test: cruise 관련 prompt 생성 로직
8. e2e test: cruise 설정 → evolve output 검증

## Approach

### 핵심 설계: Prompt-driven Cruise Loop

evolve.ts는 `emitOutput` 후 exit하므로, cruise loop를 코드로 직접 구현할 수 없음. 대신 subagent prompt에 cruise loop 실행 절차를 포함시켜, subagent가 generation 완료 후 자동으로 다음 generation을 시작하도록 유도.

**흐름:**
```
1. evolve.ts → cruise 감지 → subagentPrompt에 cruise loop 섹션 추가
2. subagent가 generation lifecycle 실행 (learning~completion)
3. completion commit → cruiseActive: true 반환
4. subagent가 결과 확인:
   - cruiseActive: true → suggestNextGoals로 goal 선택 → reap run start → 반복
   - cruiseActive: false → 종료
   - 에러/불확실성 → cruise 중단
```

### 변경 범위

1. **`src/cli/commands/run/evolve.ts`**: cruise 상태를 context에 추가, prompt에 cruise loop 지시 포함
2. **`src/core/prompt.ts`**: buildBasePrompt에 cruise loop 섹션 추가 (cruiseCount가 있을 때)
3. **`tests/unit/cruise-prompt.test.ts`**: cruise prompt 생성 로직 테스트
4. **`tests/e2e/cruise-evolve.test.ts`**: cruise 설정 → evolve output 검증

## Tasks
- [ ] T001 `src/core/prompt.ts` — buildBasePrompt에 Cruise Loop 섹션 추가: cruiseCount 파라미터가 있을 때 cruise loop 실행 절차, auto goal 선택, 중단 조건 등을 prompt에 포함
- [ ] T002 `src/cli/commands/run/evolve.ts` — cruise 상태를 context에 추가 (cruiseMode, cruiseCount 파싱 결과)
- [ ] T003 `src/cli/commands/run/evolve.ts` — prompt에 cruise loop 안내 추가 (completion 후 cruiseActive 확인 → 다음 generation 자동 시작)
- [ ] T004 `tests/unit/cruise-prompt.test.ts` — buildBasePrompt cruise 섹션 unit test (cruise 있을 때/없을 때 prompt 차이)
- [ ] T005 `tests/e2e/cruise-evolve.test.ts` — cruise 설정 후 evolve 실행 시 output 검증 (cruiseMode context, prompt 내용)
- [ ] T006 빌드 + 전체 테스트 실행으로 regression 확인

## Dependencies
- T001 → T002, T003 (prompt 먼저, evolve에서 활용)
- T001~T003 → T004, T005 (구현 후 테스트)
- T004, T005 → T006 (전체 검증)

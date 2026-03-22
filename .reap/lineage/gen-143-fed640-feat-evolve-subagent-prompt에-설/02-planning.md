# Planning

## Summary
`src/cli/commands/run/evolve.ts`의 두 prompt 영역에 설계 피벗 감지 및 artifact 일관성 검증 규칙을 추가한다.

## Technical Context
- **Tech Stack**: TypeScript, prompt 텍스트 변경만
- **Constraints**: 타입/로직 변경 없음, 단일 파일 수정

## Architecture Approach
두 곳에 동일한 개념의 규칙을 추가:
1. `buildSubagentPrompt()` (subagent mode) — "Interrupt Protection" 직전에 "Artifact Consistency" 섹션 삽입
2. non-subagent evolve prompt (lines ~276-279) — "Handling Issues" 섹션 확장

## Tasks

### Phase 1: Subagent Prompt 수정
- [ ] T001 `src/cli/commands/run/evolve.ts` buildSubagentPrompt() -- "Interrupt Protection" 섹션 직전에 "Artifact Consistency & Design Pivot Detection" 섹션 추가 (lines.push 호출 추가)

### Phase 2: Non-subagent Prompt 수정
- [ ] T002 `src/cli/commands/run/evolve.ts` non-subagent prompt -- "Handling Issues" 섹션에 artifact 불일치 및 design pivot regression 트리거 추가

### Phase 3: 검증
- [ ] T003 타입 체크 -- `bunx tsc --noEmit` 통과 확인
- [ ] T004 기존 테스트 -- `bun test` 통과 확인

## Dependencies
- T001, T002는 독립적 (병렬 가능)
- T003, T004는 T001+T002 완료 후 실행

## Detailed Changes

### T001: buildSubagentPrompt() 추가 내용
"Interrupt Protection" 직전 (line ~126 부근)에 다음 섹션 삽입:
```
## Artifact Consistency & Design Pivot Detection
- 새 stage로 진행하기 전, 이전 stage의 artifact가 현재 설계 방향과 일치하는지 검증하라.
- prompt context에 기존 artifact와 다른 설계 수정이 포함되어 있으면:
  1. prompt 지시를 goal text보다 우선한다.
  2. `/reap.back`으로 불일치 artifact가 있는 stage로 돌아가 수정한다.
- Regression 트리거 (아래 상황에서 `/reap.back` 사용):
  - artifact가 prompt의 설계 방향과 모순될 때
  - implementation이 objective/planning에 기술된 접근법과 다를 때
  - prompt에서 명시적 설계 변경을 지시했는데 이전 artifact가 old 설계를 반영할 때
```

### T002: non-subagent prompt "Handling Issues" 확장
기존:
```
- If validation fails: `/reap.back` to return to implementation (or earlier), then resume the loop
- If the human wants to pause: stop the loop
```
변경 후:
```
- If validation fails: `/reap.back` to return to implementation (or earlier), then resume the loop
- If artifacts contradict the design direction in the prompt: `/reap.back` to fix the inconsistent artifact
- If implementation approach differs from what objective/planning described: `/reap.back` to objective or planning
- If the prompt provides design corrections that differ from existing artifacts: prioritize prompt instructions, `/reap.back` to rewrite artifacts with the corrected design
- If the human wants to pause: stop the loop
```

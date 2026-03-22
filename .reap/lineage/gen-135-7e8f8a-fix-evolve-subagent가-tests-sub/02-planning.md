# Planning

## Summary
evolve.ts의 buildSubagentPrompt()와 merge-evolve.ts의 inline prompt에 Submodule Commit Rules 섹션을 추가하여, subagent가 tests/ submodule 변경사항을 올바르게 커밋+push하도록 지시한다.

## Technical Context
- **Tech Stack**: TypeScript, string array 기반 prompt 생성
- **Constraints**: prompt 텍스트 추가만, 런타임 로직 변경 없음

## Tasks
1. `evolve.ts`의 `buildSubagentPrompt()` — Commit Rules 섹션 뒤에 Submodule Commit Rules 섹션 추가
2. `merge-evolve.ts`의 inline prompt — Handling Issues 앞에 Submodule Commit Rules 추가
3. 타입체크 및 테스트 통과 확인

## Dependencies
- Task 3은 Task 1, 2 완료 후 실행


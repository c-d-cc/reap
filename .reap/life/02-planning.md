# Planning — gen-005-944652

## Goal
start에서 backlog consume 마킹 + learning artifact에 근거 참조

## Source Backlog
`start-backlog-consume.md`

## Implementation Plan

- [ ] T001: start.ts — `--backlog <filename>` 옵션 추가, consumeBacklog 호출, state.sourceBacklog 설정
- [ ] T002: learning.ts — sourceBacklog가 있으면 해당 backlog 내용을 context에 포함 + prompt에 근거 명시 안내
- [ ] T003: start.ts scan phase — backlog 선택 시 filename을 `--backlog`으로 전달하도록 prompt 수정
- [ ] T004: typecheck + build + e2e 통과

## Completion Criteria
1. `reap run start --backlog <filename> --goal "<goal>"` 실행 시 해당 backlog가 consumed로 마킹
2. consumed backlog에 `consumedBy: gen-xxx` 기록
3. GenerationState.sourceBacklog에 filename 저장
4. learning prompt에서 sourceBacklog 근거 참조 안내
5. 기존 e2e 통과

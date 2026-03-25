# Implementation — gen-005-944652

## Goal
start에서 backlog consume 마킹 + learning artifact에 근거 참조

## Source Backlog
`start-backlog-consume.md`

## Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| T001 | start.ts — --backlog 옵션, consumeBacklog 호출, state.sourceBacklog 설정 | Done |
| T002 | learning.ts — sourceBacklog context + prompt에 근거 명시 안내 | Done |
| T003 | start.ts scan phase — backlog filename을 --backlog으로 전달하도록 prompt 수정 | Done |
| T004 | typecheck + build + e2e (init 62, lifecycle 16) 통과 | Done |

## Changes
- `src/cli/commands/run/start.ts` — --backlog 옵션, consumeBacklog 호출, sourceBacklog 저장
- `src/cli/commands/run/index.ts` — options에 backlog 추가
- `src/cli/index.ts` — --backlog CLI 옵션 추가
- `src/cli/commands/run/learning.ts` — sourceBacklog content를 context에 포함, prompt에 Source Backlog 섹션 안내

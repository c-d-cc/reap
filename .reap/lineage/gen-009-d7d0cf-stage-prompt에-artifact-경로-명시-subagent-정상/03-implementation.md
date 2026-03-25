# Implementation — gen-009-d7d0cf

## Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| T001 | learning.ts — artifact 경로 + context.artifactPath | Done |
| T002 | implementation.ts — artifact 경로 + context.artifactPath | Done |
| T003 | validation.ts — artifact 경로 + context.artifactPath | Done |
| T004 | completion.ts — artifact 경로 + context.artifactPath | Done |
| T005 | detect, mate, merge, reconcile — merge stage artifact 경로 | Done |
| T006 | evolve.ts — subagent prompt에 artifact 경로 규칙 | Done |
| T007 | typecheck + build + e2e (init 62, lifecycle 16) | Done |

## Changes
- 10개 stage handler 수정: context.artifactPath + prompt에 `.reap/life/{NN}-{stage}.md` 명시
- evolve.ts: "All artifacts are at `.reap/life/{NN}-{stage}.md`" 규칙 추가

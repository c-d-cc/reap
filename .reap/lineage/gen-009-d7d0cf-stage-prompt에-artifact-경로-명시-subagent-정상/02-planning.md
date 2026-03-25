# Planning — gen-009-d7d0cf

## Goal
stage prompt에 artifact 경로 명시 — subagent 정상 동작 보장

## Tasks

- [ ] T001: learning.ts — prompt에 `### Artifact: .reap/life/01-learning.md` + context.artifactPath
- [ ] T002: implementation.ts — prompt에 `### Artifact: .reap/life/03-implementation.md` + context.artifactPath
- [ ] T003: validation.ts — prompt에 `### Artifact: .reap/life/04-validation.md` + context.artifactPath
- [ ] T004: completion.ts — prompt에 `### Artifact: .reap/life/05-completion.md` + context.artifactPath
- [ ] T005: detect.ts, mate.ts, merge.ts, reconcile.ts — merge stage artifact 경로
- [ ] T006: evolve.ts — subagent prompt에 "All artifacts at `.reap/life/{NN}-{stage}.md`" 규칙 추가
- [ ] T007: typecheck + build + e2e

## Completion Criteria
1. 모든 normal stage prompt에 `.reap/life/` 경로 포함
2. 모든 merge stage prompt에 `.reap/life/` 경로 포함
3. evolve.ts subagent prompt에 artifact 경로 규칙 명시
4. 각 stage의 context에 artifactPath 필드 포함
5. 기존 e2e 통과

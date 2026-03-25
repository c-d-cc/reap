# Completion — gen-009-d7d0cf

## Summary
모든 stage prompt에 artifact 경로(`.reap/life/{NN}-{stage}.md`)를 명시하고, context.artifactPath를 추가. evolve.ts subagent prompt에도 경로 규칙 명시. gen-003에서 발생한 subagent artifact 경로 오류의 근본 원인 해결.

### Changes
- 10개 stage handler (normal 5 + merge 4 + evolve 1) 수정
- v0.15 패턴 복원: prompt 텍스트 + context.artifactPath 2중 전달

### Validation: PASS (init 62, lifecycle 16)

## Lessons Learned
- v0.15에서 2중으로 경로를 전달한 것은 redundancy가 아니라 필수. AI는 context와 prompt 중 하나만 봐도 올바른 경로를 알아야 함.

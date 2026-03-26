---
id: gen-009-d7d0cf
type: embryo
goal: "stage prompt에 artifact 경로 명시 — subagent 정상 동작 보장"
parents: ["gen-008-e8af04"]
---
# gen-009-d7d0cf
모든 stage prompt에 artifact 경로(`.reap/life/{NN}-{stage}.md`)를 명시하고, context.artifactPath를 추가. evolve.ts subagent prompt에도 경로 규칙 명시. gen-003에서 발생한 subagent artifact 경로 오류의 근본 원인 해결.

### Changes
- 10개 stage handler (normal 5 + merge 4 + evolve 1) 수정
- v0.15 패턴 복원: prompt 텍스트 + context.artifactPath 2중 전달

### Validation: PASS (init 62, lifecycle 16)
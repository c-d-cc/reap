# Learning — gen-009-d7d0cf

## Source Backlog
`artifact-path-in-prompt.md` — v0.16의 stage prompt에 artifact 경로 미명시로 subagent가 잘못된 위치에 artifact 생성.

## Key Findings
- **현재 상태**: planning.ts만 `.reap/life/02-planning.md` 경로 명시. learning, implementation, validation, completion, merge stages 모두 누락.
- **evolve.ts**: 파일명만 표시 (e.g., "Artifact: 01-detect.md"), 경로 없음.
- **v0.15 패턴**: context.artifactPath (절대 경로) + prompt에 `.reap/life/{NN}-{stage}.md` 명시 (2중)

## 변경 범위
1. Normal stages (learning, implementation, validation, completion) — prompt에 artifact 경로 추가 + context.artifactPath
2. Merge stages (detect, mate, merge, reconcile) — 동일
3. evolve.ts — subagent prompt에 artifact 경로 규칙 명시

## Clarity Level: High

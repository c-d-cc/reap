---
id: gen-010-97f6fd
type: embryo
goal: "Validation + Planning + Implementation 테스트 전략 강화"
parents: ["gen-009-d7d0cf"]
---
# gen-010-97f6fd
v0.16의 planning, implementation, validation prompt에 테스트 전략을 강화했다.
4개 파일(planning.ts, implementation.ts, validation.ts, evolve.ts) 수정.

### Changes
- planning.ts: task decomposition에 테스트 계획 안내 2줄 추가
- implementation.ts: sequential implementation에 테스트 동시 구현 안내 3줄 추가
- validation.ts: 모호한 4줄 prompt를 HARD-GATE + Steps + Red Flags + Verdict 구조로 교체
- evolve.ts: subagent prompt에 Validation Rules 블록 추가

### Validation: PASS (init 62, lifecycle 16, typecheck, build)
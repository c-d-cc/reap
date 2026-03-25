# Completion — gen-010-97f6fd

## Summary

v0.16의 planning, implementation, validation prompt에 테스트 전략을 강화했다.
4개 파일(planning.ts, implementation.ts, validation.ts, evolve.ts) 수정.

### Changes
- planning.ts: task decomposition에 테스트 계획 안내 2줄 추가
- implementation.ts: sequential implementation에 테스트 동시 구현 안내 3줄 추가
- validation.ts: 모호한 4줄 prompt를 HARD-GATE + Steps + Red Flags + Verdict 구조로 교체
- evolve.ts: subagent prompt에 Validation Rules 블록 추가

### Validation: PASS (init 62, lifecycle 16, typecheck, build)

## Lessons Learned

- v0.15에서 v0.16으로 재작성할 때 prompt 품질 규칙(HARD-GATE, Red Flags)이 빠졌다.
  재작성 시 기존 버전의 품질 가드를 체크리스트로 확인해야 한다.
- validation prompt의 sycophancy 방지 문구는 AI agent가 "아마 통과할 것이다"라고
  스스로 판단하고 실행을 건너뛰는 것을 막는 핵심 장치.

## Next Generation Hints

- e2e 테스트 환경(scripts/e2e-*.sh 실행 방법)에 대한 안내를 genome 또는 environment에
  기록하는 작업은 별도 backlog로 남아 있음.

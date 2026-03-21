# Implementation

## Completed Tasks

| # | Task | Status |
|---|------|--------|
| T001 | tests/e2e/command-templates.test.ts — 8개 시나리오 + cross-check 테스트 작성 (58 tests) | Done |

## Implementation Notes

- 테스트 방식: src/templates/commands/*.md 파일을 직접 읽어서 구조적 검증
- S1 수정: reap.next.md가 onLifeObjected를 "예시"로 언급하는 것은 허용 (delegation note). Hook Execution 섹션 내에서만 stage-specific hook이 없는지 검증
- S7b 추가: reap.merge.evolve도 동일한 hook auto-execution 안내 검증 포함
- Cross-check 섹션 추가: pre-gen-085 패턴(reap.next에 archiving)이 없는지 검증

# Completion — gen-034-674857

## Summary

Clarity level 자동 판단 로직을 구현했다. `src/core/clarity.ts` 모듈을 신규 생성하여 vision goals, backlog, generation type, lineage, memory 상태를 기반으로 규칙 기반 clarity level(high/medium/low)을 계산한다. 결과는 evolve.ts에서 수집되어 subagent prompt에 주입된다.

### Changes
- `src/core/clarity.ts` — 신규: ClarityLevel, ClarityInput, ClarityResult 타입 + calculateClarity, getClarityGuide 함수
- `src/core/prompt.ts` — buildBasePrompt에 clarityResult 파라미터 추가, Clarity-driven Interaction 섹션에 계산된 level + signals 주입, 텍스트 기반 Clarity Signals 섹션 제거
- `src/cli/commands/run/evolve.ts` — collectClarityInput 함수로 데이터 수집, clarity 결과를 prompt 및 context에 포함
- `tests/unit/clarity.test.ts` — 신규: 20개 unit test

### Test Results
- 350 tests 전체 통과 (unit 206 + e2e 103 + scenario 41)

## Lessons Learned

- **maturity.ts 패턴 재활용**: 기존 detectMaturity 패턴(pure function, type export, prompt guide 분리)을 그대로 따르니 일관성 있는 코드가 나왔다. Pattern-first 원칙의 효과.
- **데이터 수집과 판단 분리**: calculateClarity는 pure function으로 I/O 없이 판단만 하고, 데이터 수집은 evolve.ts에서 담당. 테스트가 단순해지고 관심사가 명확히 분리됨.

## Next Generation Hints

- Embryo → Normal 전환 검토 (유저 승인 필요)
- README 재작성 (v0.16 기준)
- stage별 개별 handler에도 clarity 주입 검토 (현재는 evolve prompt에만)

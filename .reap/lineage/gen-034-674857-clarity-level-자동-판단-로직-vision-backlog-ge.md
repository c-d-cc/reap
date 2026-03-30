---
id: gen-034-674857
type: embryo
goal: "Clarity level 자동 판단 로직 — vision/backlog/genome 상태에서 코드 기반 계산"
parents: ["gen-033-044437"]
---
# gen-034-674857
Clarity level 자동 판단 로직을 구현했다. `src/core/clarity.ts` 모듈을 신규 생성하여 vision goals, backlog, generation type, lineage, memory 상태를 기반으로 규칙 기반 clarity level(high/medium/low)을 계산한다. 결과는 evolve.ts에서 수집되어 subagent prompt에 주입된다.

### Changes
- `src/core/clarity.ts` — 신규: ClarityLevel, ClarityInput, ClarityResult 타입 + calculateClarity, getClarityGuide 함수
- `src/core/prompt.ts` — buildBasePrompt에 clarityResult 파라미터 추가, Clarity-driven Interaction 섹션에 계산된 level + signals 주입, 텍스트 기반 Clarity Signals 섹션 제거
- `src/cli/commands/run/evolve.ts` — collectClarityInput 함수로 데이터 수집, clarity 결과를 prompt 및 context에 포함
- `tests/unit/clarity.test.ts` — 신규: 20개 unit test

### Test Results
- 350 tests 전체 통과 (unit 206 + e2e 103 + scenario 41)
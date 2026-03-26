# Implementation Log — gen-034-674857

## Completed Tasks

### T001-T003: `src/core/clarity.ts` 신규 생성
- `ClarityLevel` type: `"high" | "medium" | "low"`
- `ClarityInput` interface: uncheckedGoals, totalGoals, pendingBacklog, highPriorityBacklog, generationType, lineageCount, hasMemory
- `ClarityResult` interface: `{ level: ClarityLevel, signals: string[] }`
- `calculateClarity(input)` 함수: 규칙 기반 판단, 정량 점수 없음
  - High: unchecked goals >= 3 + high priority backlog, 또는 high priority >= 2, 또는 active backlog + vision goals
  - Low: early embryo + short lineage, 또는 no direction, 또는 vision but no concretization
  - Medium: 나머지 (mixed signals 또는 no strong signals)
- `getClarityGuide(result)` 함수: level별 prompt 텍스트 생성

### T004: `src/core/prompt.ts` 수정
- `buildBasePrompt`에 `clarityResult?: ClarityResult` 파라미터 추가
- Clarity-driven Interaction 섹션에 `getClarityGuide(result)` 결과 주입
- 기존 Clarity Signals 섹션 제거 (코드 계산 결과로 대체)
- Per-Stage Behavior 섹션은 유지

### T005: `src/cli/commands/run/evolve.ts` 수정
- `collectClarityInput(paths, generationType)` 함수 추가: vision, backlog, lineage, memory에서 데이터 수집
- clarity 계산 결과를 `buildBasePrompt`에 전달
- output context에 `clarity` 필드 추가

### T006-T009: `tests/unit/clarity.test.ts` 신규
- 20개 테스트 작성: high(4), low(4), medium(3), edge cases(5), getClarityGuide(4)

### T010: 검증
- typecheck 통과
- build 성공 (0.44MB)
- unit tests 206개 전체 통과 (기존 186 + 신규 20)

## Architecture Decisions

- **Pure function 패턴**: `calculateClarity`는 I/O 없는 pure function. 데이터 수집은 evolve.ts에서 담당.
- **기존 Clarity Signals 제거**: prompt.ts의 텍스트 기반 signals 섹션을 제거하고 코드 계산 결과로 대체. Per-Stage Behavior는 AI에게 여전히 유용하므로 유지.
- **evolve.ts에만 적용**: stage별 개별 handler(learning.ts, planning.ts 등)에는 적용하지 않음. evolve prompt가 전체 lifecycle의 진입점이므로 여기서 clarity를 주입.

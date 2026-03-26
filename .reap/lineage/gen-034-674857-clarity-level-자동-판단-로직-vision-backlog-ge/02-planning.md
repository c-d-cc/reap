# Planning — gen-034-674857

## Goal

`src/core/clarity.ts` 신규 모듈을 만들어 clarity level을 규칙 기반으로 자동 판단하고, 그 결과를 subagent prompt에 주입한다.

## Completion Criteria

1. `calculateClarity(params)` 함수가 `{ level: "high" | "medium" | "low", signals: string[] }` 반환
2. 규칙 기반 판단 — 정량적 점수 없음
3. prompt.ts의 Clarity-driven Interaction 섹션에 계산된 level + signals 표시
4. evolve.ts에서 clarity 계산에 필요한 데이터를 수집하여 전달
5. unit test: 최소 10개 케이스 (high/medium/low 각 조합)
6. 기존 테스트 regression 없음 (330개 통과)
7. typecheck 통과, build 성공

## Approach

`maturity.ts` 패턴을 따라 pure function 기반 모듈을 만든다. 외부 I/O 없이 이미 수집된 데이터를 입력으로 받아 판단한다.

### Clarity 판단 규칙 (evolution.md 기반)

**High 조건** (하나라도 만족):
- unchecked vision goals 3개 이상 AND pending backlog에 high priority 항목 존재
- pending backlog에 high priority 항목 2개 이상

**Low 조건** (하나라도 만족):
- generation type이 embryo AND lineage count < 5
- vision goals가 없거나 모두 checked AND pending backlog도 없음 (방향 없음)
- unchecked vision goals 있지만 pending backlog 없고 memory도 없음

**Medium**: High도 Low도 아닌 경우

각 규칙 매칭 시 이유를 signals 배열에 기록.

## Scope

### 변경 파일
- `src/core/clarity.ts` — 신규
- `src/core/prompt.ts` — buildBasePrompt 수정
- `src/cli/commands/run/evolve.ts` — clarity data 수집 추가
- `tests/unit/clarity.test.ts` — 신규

### Out of scope
- stage별 개별 prompt (learning.ts, planning.ts 등)에는 clarity 주입하지 않음 — evolve prompt에만 적용
- clarity 결과의 persistence (파일 저장) — prompt에만 주입

## Tasks

- [ ] T001 `src/core/clarity.ts` — ClarityLevel type, ClarityInput interface, ClarityResult interface 정의
- [ ] T002 `src/core/clarity.ts` — calculateClarity 함수 구현 (규칙 기반 판단)
- [ ] T003 `src/core/clarity.ts` — getClarityGuide 함수 구현 (level별 prompt 텍스트)
- [ ] T004 `src/core/prompt.ts` — buildBasePrompt에 clarity 결과 주입 (기존 Clarity-driven Interaction 섹션에 계산된 level 추가)
- [ ] T005 `src/cli/commands/run/evolve.ts` — clarity 계산을 위한 데이터 수집 및 buildBasePrompt에 전달
- [ ] T006 `tests/unit/clarity.test.ts` — high clarity 케이스 테스트
- [ ] T007 `tests/unit/clarity.test.ts` — medium clarity 케이스 테스트
- [ ] T008 `tests/unit/clarity.test.ts` — low clarity 케이스 테스트
- [ ] T009 `tests/unit/clarity.test.ts` — edge case 테스트 (empty inputs, boundary conditions)
- [ ] T010 typecheck + build + 전체 테스트 실행

## Dependencies

T001 → T002 → T003 → T004 → T005 → T006~T009 → T010

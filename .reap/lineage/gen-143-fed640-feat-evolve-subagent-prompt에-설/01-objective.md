# Objective

## Goal
evolve subagent prompt(`buildSubagentPrompt()`)와 non-subagent evolve prompt에 설계 피벗 감지 및 artifact 일관성 검증 규칙을 추가한다.

## Background
gen-138-26723a에서 evolve subagent가 prompt의 설계 수정사항(lastSyncedCommit -> lastSyncedGeneration)을 받았으나:
1. objective/planning은 기존(old) 설계로 작성
2. implementation은 prompt의 새(new) 설계로 구현
3. artifact 불일치를 감지하지 못하고 `/reap.back`을 사용하지 않음

근본 원인: `src/cli/commands/run/evolve.ts`의 `buildSubagentPrompt()`에 다음 가이드가 없음:
- prompt 지시와 기존 artifact 간 설계 불일치 감지
- 불일치 시 `/reap.back` 사용 지침
- "Handling Issues" 섹션이 validation 실패만 regression 트리거로 언급

## Completion Criteria
1. `buildSubagentPrompt()`에 "Artifact Consistency" 섹션이 추가되어 있다
2. non-subagent evolve prompt의 "Handling Issues"에 확장된 regression 트리거가 추가되어 있다
3. 두 prompt 모두 설계 피벗 감지 규칙을 포함한다
4. 기존 테스트가 깨지지 않는다 (prompt 텍스트 변경이므로 타입/로직 변경 없음)

## Requirements

### Functional Requirements
1. `buildSubagentPrompt()`에 "Artifact Consistency" 섹션 추가: 이전 artifact가 현재 설계 방향과 일치하는지 검증 규칙
2. "Design Pivot Detection" 규칙 추가: prompt context의 설계 변경이 기존 artifact와 모순될 때 `/reap.back` 사용 지침
3. "Handling Issues" 확장: artifact 불일치, implementation-planning 불일치를 regression 트리거로 추가
4. non-subagent evolve prompt (lines ~276-279)에도 동일한 규칙 추가

### Non-Functional Requirements
1. prompt 텍스트 변경만 수행 (타입, 인터페이스, 로직 변경 없음)
2. 단일 파일(`src/cli/commands/run/evolve.ts`)만 수정

## Design

### Selected Design
`buildSubagentPrompt()` 함수 내 "Interrupt Protection" 섹션 직전에 "Artifact Consistency" 섹션을 추가하고, non-subagent prompt의 "Handling Issues" 섹션을 확장한다.

추가할 규칙 3가지:
1. **Artifact Consistency Rule**: 새 stage 진행 전 이전 artifact가 현재 설계 방향과 일치하는지 검증. prompt가 기존 artifact와 모순되는 설계 수정을 포함하면 `/reap.back`으로 수정.
2. **Design Pivot Detection**: prompt context에 명시적 설계 변경이 있으면 prompt 지시를 goal text보다 우선. 이미 old 설계로 작성된 artifact가 있으면 regress하여 재작성.
3. **Expanded Regression Triggers**: "Handling Issues"에 추가:
   - artifact가 prompt의 설계 방향과 모순될 때: `/reap.back`
   - implementation이 objective/planning과 다를 때: `/reap.back`

## Scope
- **Related Genome Areas**: evolve subagent prompt, lifecycle regression rules
- **Expected Change Scope**: `src/cli/commands/run/evolve.ts` — prompt 텍스트만
- **Exclusions**: 타입 변경, 새 파일 생성, genome 변경 없음

## Genome Reference
- conventions.md: 함수 50줄 이하 권장, 단일 책임
- constraints.md: TypeScript strict mode

## Backlog (Genome Modifications Discovered)
None

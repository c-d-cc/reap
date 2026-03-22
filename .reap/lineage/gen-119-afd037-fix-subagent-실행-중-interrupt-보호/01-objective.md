# Objective

## Goal
fix: subagent 실행 중 interrupt 보호 + orchestrator 경고

## Completion Criteria
1. `evolve.ts`의 `buildSubagentPrompt()`에 interrupt protection 지시가 포함됨
2. `reap.evolve.md`에 subagent 실행 중 사용자 메시지 처리 규칙이 추가됨
3. `completion.ts`의 `impactPrompt` 변수가 실제로 prompt에 연결되어 unused variable 경고 해소
4. 기존 테스트/빌드가 통과함

## Requirements

### Functional Requirements
1. FR-1: subagent에게 interrupt 보호 지시를 전달하여 중간 메시지에 의한 작업 중단 방지
2. FR-2: orchestrator(evolve slash command)에 subagent 실행 중 사용자 메시지 처리 안내 추가
3. FR-3: completion.ts의 unused `impactPrompt` 변수를 feedKnowledge prompt에 연결

### Non-Functional Requirements
1. NFR-1: 기존 동작에 영향 없음 (추가 텍스트만 삽입)

## Design

### Selected Design
- evolve.ts: `buildSubagentPrompt()` 끝부분(Hook Prompt Execution 뒤)에 "## Interrupt Protection" 섹션 추가
- reap.evolve.md: 하단에 subagent 실행 중 메시지 처리 규칙 추가
- completion.ts: `impactPrompt`는 이미 line 210에서 prompt 문자열에 append되고 있음 → 실제로는 unused가 아닌지 재확인 필요

## Scope
- **Related Genome Areas**: conventions.md (개발 규칙)
- **Expected Change Scope**: evolve.ts, reap.evolve.md, completion.ts (3파일)
- **Exclusions**: 테스트 파일 변경 없음

## Genome Reference
- conventions.md: 함수 50줄 이하 권장, 단일 책임

## Backlog (Genome Modifications Discovered)
None

## Background
gen-118에서 completion.ts에 `detectGenomeImpact`와 `buildGenomeImpactPrompt` 함수를 추가했으나, `impactPrompt` 변수의 실제 사용 여부 확인이 필요. 또한 subagent 실행 중 사용자 interrupt로 인한 작업 중단 문제를 방지하기 위한 보호 지시가 필요.


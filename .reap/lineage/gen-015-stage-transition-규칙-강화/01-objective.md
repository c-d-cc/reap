# Objective

## Goal
stage 전환 시 current.yml 직접 수정 방지 — /reap.next 강제 사용 규칙 강화

## Completion Criteria
1. reap-guide.md에 "current.yml 직접 수정 금지" 규칙이 명시됨
2. reap.evolve.md에 HARD-GATE 수준의 경고가 추가됨
3. 각 stage command의 Gate에 이전 artifact 존재 확인이 포함됨 (이미 있는 것 확인, 누락 보완)
4. `bun test` 통과

## Requirements

### Functional Requirements
- FR-001: `reap-guide.md` Rules 섹션에 current.yml stage 직접 수정 금지 규칙 추가
- FR-002: `reap.evolve.md`에 HARD-GATE — current.yml 직접 수정 절대 금지 경고
- FR-003: `reap.objective.md` Gate에 stage=objective 확인 추가 (이미 있음, 확인)
- FR-004: 나머지 stage commands Gate 검증 (이미 있음, 일관성 확인)

### Non-Functional Requirements
- 기존 테스트 하위 호환 유지

## Scope
- **Expected Change Scope**: reap-guide.md, reap.evolve.md, stage command 프롬프트 일부
- **Exclusions**: CLI 코드 변경 없음

## Background
- gen-014에서 AI가 current.yml을 직접 수정하여 planning artifact 누락 발생
- backlog 03-enforce-stage-transition.md에서 이전

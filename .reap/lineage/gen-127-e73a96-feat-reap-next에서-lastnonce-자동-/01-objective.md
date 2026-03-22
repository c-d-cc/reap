# Objective

## Goal
feat: reap.next에서 lastNonce 자동 읽기

## Completion Criteria
1. 각 stage command의 `--phase complete`에서 nonce 생성 시 `current.yml`에 `lastNonce` 필드가 저장된다.
2. `reap run next`에 nonce argument 없이 호출하면 `state.lastNonce`에서 자동으로 읽는다.
3. 사용 후 `state.lastNonce`가 삭제되어 재사용이 방지된다.
4. 명시적 nonce argument가 있으면 기존 동작이 유지된다.
5. `GenerationState` 타입에 `lastNonce?: string` 필드가 존재한다.

## Requirements

### Functional Requirements
1. FR-001: objective/planning/implementation/validation의 `--phase complete`에서 nonce 생성 후 `state.lastNonce = nonce` 저장
2. FR-002: `next.ts`에서 argv에 nonce가 없으면 `state.lastNonce`에서 읽기
3. FR-003: nonce 사용 후 `state.lastNonce` 삭제 (재사용 방지)
4. FR-004: 명시적 argv nonce가 있으면 기존 동작 유지

### Non-Functional Requirements
1. NFR-001: 기존 테스트 호환성 유지
2. NFR-002: 타입 안전성 유지 (GenerationState 인터페이스 업데이트)

## Design

### Selected Design
각 stage command의 complete phase에서 nonce를 `state.lastNonce`에 저장하고, `next.ts`에서 argv nonce가 없을 때 fallback으로 `state.lastNonce`를 사용. 사용 후 삭제하여 재사용 방지.

## Scope
- **Related Genome Areas**: CLI commands, generation state
- **Expected Change Scope**: 6 files (types, objective, planning, implementation, validation, next)
- **Exclusions**: merge lifecycle stages, completion stage

## Genome Reference
- constraints.md: CLI Commands 목록
- conventions.md: Code Style, Naming Conventions

## Backlog (Genome Modifications Discovered)
None

## Background
현재 stage 전환 시 agent가 nonce를 수동으로 복사하여 `/reap.next <nonce>`에 전달해야 함. `lastNonce` 자동 저장/읽기로 이 과정을 자동화하여 UX 개선.

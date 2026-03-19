# Objective

## Goal
evolve 자율 실행 모드 + backlog 상태 관리 체계 도입

## Completion Criteria
1. `/reap.evolve`에서 호출 시 각 stage의 routine human confirmation을 skip하고 자율 진행한다
2. 진짜 판단이 필요한 경우(애매한 목표, 불확실한 기술 결정)에만 STOP한다
3. backlog frontmatter에 `status: pending | consumed` 필드가 존재한다
4. `/reap.start`에서 backlog 선택 시 `status: consumed`, `consumedBy: gen-XXX`로 마킹한다
5. `/reap.completion`에서 적용된 genome-change를 `status: consumed`로 마킹한다
6. `/reap.next` 아카이빙 시 consumed → lineage 이동, pending → 새 backlog 이월
7. `bun test` 통과, `bunx tsc --noEmit` 통과, 빌드 성공

## Requirements

### Functional Requirements
- FR-001: `reap.evolve.md` — 자율 실행 override 지시 추가 (각 stage의 routine confirmation skip)
- FR-002: `reap.objective.md` — evolve 컨텍스트 분기 (confirmation skip)
- FR-003: `reap.planning.md` — evolve 컨텍스트 분기 (confirmation skip)
- FR-004: `reap.completion.md` — evolve 컨텍스트 분기 (confirmation skip)
- FR-005: backlog frontmatter에 `status` 필드 추가 (`pending | consumed`)
- FR-006: `reap.start.md` — backlog 선택 시 consumed 마킹
- FR-007: `reap.completion.md` — 적용된 genome-change consumed 마킹
- FR-008: `reap.next.md` — 아카이빙 시 status 기반 분기 (consumed→lineage, pending→이월)

### Non-Functional Requirements
- 기존 backlog 파일에 status가 없으면 `pending`으로 간주

## Scope
- **Related Genome Areas**: domain/lifecycle-rules.md
- **Expected Change Scope**: src/templates/commands/ (evolve, objective, planning, completion, start, next)
- **Exclusions**: implementation, validation 스킬은 이미 자율적으로 동작하므로 수정 불필요

## Genome Reference
- domain/lifecycle-rules.md: stage 전환 규칙, artifact 규칙

## Backlog (Genome Modifications Discovered)
- domain/lifecycle-rules.md에 backlog status 관리 규칙 추가 필요

## Background
- gen-016에서 evolve 실행 시 매 단계 confirmation이 불필요하게 진행을 멈추는 문제 체감
- gen-016에서 미완료 backlog 항목(03-evolve-autonomous-mode.md)이 아카이빙 시 소실됨

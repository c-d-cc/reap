# Objective

## Goal
1) Artifact를 stage 완료 시 한번에 작성하는 방식에서, stage 진입 시 생성 + 작업 중 점진적 업데이트 방식으로 전환한다.
2) Old 7-stage lifecycle 테스트 17개 실패 + 2 errors를 현재 5단계에 맞게 수정한다.

## Completion Criteria
- [ ] 모든 command 스크립트(reap.objective~completion)에서 "stage 진입 시 artifact 생성, 작업 중 점진적 업데이트" 방식 반영
- [ ] artifact 템플릿이 점진적 기록에 적합한 구조로 수정
- [ ] old lifecycle 테스트 17개 + 2 errors 전부 수정
- [ ] `~/.bun/bin/bun test` 전체 통과 (0 fail)
- [ ] `~/.bun/bin/bunx tsc --noEmit` 전체 통과 (0 errors)

## Requirements

### Functional Requirements
- **FR-001**: command 스크립트 변경 — 각 stage command의 Artifact Generation 섹션을 "stage 진입 시 즉시 생성 + 작업 중 점진적 업데이트"로 변경
- **FR-002**: implementation command 강화 — 태스크 완료 시마다 03-implementation.md 업데이트 명시
- **FR-003**: artifact 템플릿 점진적 기록 친화 — 빈 섹션이 있어도 유효한 구조
- **FR-004**: old lifecycle 테스트 수정 — conception→objective, formation→planning, growth→implementation, adaptation→validation(해당시), birth→completion, legacy→제거
- **FR-005**: mutation.test.ts 삭제 또는 재작성 — 삭제된 mutation 모듈 참조
- **FR-006**: full-lifecycle.test.ts 수정 — 5단계 flow + mutation import 제거

### Non-Functional Requirements
- 기존 통과하던 83개 테스트가 깨지지 않아야 함

## Scope
- **Related Genome Areas**: conventions.md (Template Conventions)
- **Expected Change Scope**: `src/templates/commands/reap.*.md`, `src/templates/artifacts/*.md`, `tests/**/*.test.ts`
- **Exclusions**: src/ 코어 로직 변경 없음 (command 스크립트와 테스트만)

## Genome Reference
- conventions.md Template Conventions: artifact 템플릿 관리 규칙

## Backlog (Genome Modifications Discovered)
None

## Background
- gen-007에서 17개 테스트 실패를 backlog로 이월 (`backlog/01-old-lifecycle-test-cleanup.md`)
- artifact를 stage 완료 시 한번에 작성하면 중간 진행상황이 유실되고, 특히 implementation에서 컨텍스트 손실 발생
- 사용자 피드백: "작업 진행상황과 맞춰서 계속 기록하는 용도로 써야"

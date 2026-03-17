# Objective

## Goal
1) 06-legacy.md를 제거하고 05-completion.md에 Summary 섹션으로 통합한다.
2) Generation 완료 시 코드 + artifact를 함께 커밋하도록 command 스크립트에 지시를 추가한다.
3) Implementation 진입 시 uncommitted 변경이 많으면 사용자에게 커밋 여부를 묻도록 한다.

## Completion Criteria
- [ ] 06-legacy.md 생성 로직 제거 (`generation.ts`)
- [ ] compression.ts가 05-completion.md의 Summary 섹션을 참조하도록 변경
- [ ] 05-completion.md 템플릿에 Summary 섹션 추가
- [ ] reap.evolve.md에 generation 완료 후 커밋 지시 추가
- [ ] reap.implementation.md의 gate에서 uncommitted 변경 시 사용자에게 커밋 옵션 질문하도록 변경
- [ ] `~/.bun/bin/bun test` 전체 통과
- [ ] `~/.bun/bin/bunx tsc --noEmit` 전체 통과

## Requirements

### Functional Requirements
- **FR-001**: `generation.ts` complete() — 06-legacy.md 생성 로직 제거
- **FR-002**: `compression.ts` — Level 1 압축 시 06-legacy.md 대신 05-completion.md의 Summary 섹션 추출
- **FR-003**: `05-completion.md` 템플릿 — Summary 섹션 추가 (goal, started, completed, genome version, key changes)
- **FR-004**: `reap.completion.md` command — Summary 섹션 작성 지시 추가
- **FR-005**: `reap.evolve.md` command — "completion에서 advance 시 코드+artifact를 함께 커밋" 지시 추가. 커밋 메시지 형식: generation goal 기반
- **FR-006**: `reap.implementation.md` command — gate의 uncommitted 변경 처리를 "ERROR + STOP"에서 "사용자에게 커밋할지 물어보기"로 완화
- **FR-007**: 기존 lineage의 06-legacy.md는 보존 (이미 아카이빙된 것은 건드리지 않음)

### Non-Functional Requirements
- 기존 통과 테스트 유지

## Scope
- **Related Genome Areas**: conventions.md (Git Conventions — 커밋 타이밍)
- **Expected Change Scope**: `src/core/generation.ts`, `src/core/compression.ts`, `src/templates/commands/reap.evolve.md`, `src/templates/commands/reap.completion.md`, `src/templates/commands/reap.implementation.md`, `src/templates/artifacts/05-completion.md`, tests
- **Exclusions**: CLI 자체에 git 로직 추가 없음 (prompt 지시 방식)

## Genome Reference
- conventions.md Git Conventions: "커밋 타이밍" 규칙 → generation 완료 시 커밋으로 확장

## Backlog (Genome Modifications Discovered)
- conventions.md Git Conventions에 "generation 완료 시 커밋" 규칙 추가 필요

## Background
- 06-legacy.md는 05-completion.md와 내용이 중복되며 Summary 섹션으로 흡수 가능
- 자동 커밋은 CLI보다 prompt 지시가 적합 (코드+artifact 범위 판단을 에이전트가 수행)
- Implementation gate의 clean state 강제가 너무 엄격 — 기존 작업이 있을 수 있으므로 사용자 선택권 부여

# Objective

## Goal

slash command 전면 정리 — 책임 분리 + hook 배치 + 일관성

## Completion Criteria

1. `reap.next`에 hook 실행 로직과 archiving 로직이 없다 (stage 전환 + timeline + artifact 생성만)
2. 각 stage command(9개 normal + 7개 merge stage)가 말단에 자기 hook을 실행한다
3. `reap.completion`이 archiving + 커밋 + `onLifeCompleted` hook 실행을 포함한다
4. `reap.merge.completion`이 archiving + 커밋 + `onMergeCompleted` hook 실행을 포함한다
5. 모든 hook은 커밋 전 실행된다 (hook 결과물이 같은 커밋에 포함)
6. `reap.evolve`에 hook 자동 실행 안내가 있다
7. `bunx tsc --noEmit`, `npm run build`, `bun test` 모두 통과

## Requirements

### Functional Requirements

- FR-001: `reap.next` — hook 실행 섹션 제거, archiving 섹션 제거, stage 전환 + timeline + artifact 생성만 남김
- FR-002: `reap.start` — 기존 hook 실행 유지 (이미 있음, 순서만 명확화: backlog consumed → hook 실행)
- FR-003: `reap.objective` — Completion 섹션에 `onLifeObjected` hook 실행 추가
- FR-004: `reap.planning` — Completion 섹션에 `onLifePlanned` hook 실행 추가
- FR-005: `reap.implementation` — Completion 섹션에 `onLifeImplemented` hook 실행 추가
- FR-006: `reap.validation` — Completion 섹션에 `onLifeValidated` hook 실행 추가
- FR-007: `reap.completion` — archiving 로직 흡수 + `onLifeCompleted` hook (커밋 전) + 커밋
- FR-008: `reap.back` — 기존 `onLifeRegretted` hook 유지 (이미 있음)
- FR-009: `reap.evolve` — hook 자동 실행 안내 추가, archiving이 reap.completion에서 수행됨을 반영
- FR-010: Merge 7개 command — 각각 말단에 자기 merge hook 실행 추가

### Non-Functional Requirements

- hook 실행 로직을 공통 패턴으로 정의하여 중복 제거
- backlog target 필드 형식 통일 (`target: genome/{file}`)
- `reap.completion` Phase 5에서 8개 normal event 전체 나열

## Design

### Approaches Considered

| Aspect | A: 각 command에 full hook 로직 복사 | B: 공통 패턴 참조 + 간결한 hook 실행 |
|--------|-----------|-----------|
| Summary | 각 .md 파일에 hook 실행 절차 전체를 복사 | 공통 Hook Execution 패턴을 정의하고 각 command에서 간결하게 참조 |
| Pros | 각 파일만 보면 전체 절차가 보임 | 중복 제거, 유지보수 용이, 일관성 보장 |
| Cons | 17개 파일에 동일한 10줄+ 반복 | hook 시스템 문서를 별도로 봐야 함 |
| Recommendation | - | **선택** |

### Selected Design

**Approach B**: 공통 패턴 참조 방식

각 command 파일에서 hook 실행은 다음 형태로 간결하게 기술:
```
### Hook Execution
Execute hooks for event `{event}` following the Hook System protocol:
- Scan `.reap/hooks/` for `{event}.*` files
- Sort by frontmatter `order`, then alphabetically
- Evaluate `condition`, execute `.md` (AI prompt) or `.sh` (shell script)
- All hooks run BEFORE any commit (hook outputs included in the same commit)
```

`reap.completion`과 `reap.merge.completion`만 archiving + 커밋 로직을 포함하므로 hook 타이밍이 특수:
- 순서: Phase 작업 완료 → hook 실행 → archiving → 커밋

### Design Approval History

- Autonomous Override: backlog 분석 기반 자동 승인

## Scope
- **Related Genome Areas**: constraints.md (Slash Commands, Hooks 섹션)
- **Expected Change Scope**: Normal 9개 + Merge 8개 = 17개 command 마크다운 파일
- **Exclusions**: TypeScript 소스 코드 변경 없음 (슬래시 커맨드 템플릿만 수정), CLI 로직 변경 없음

## Genome Reference

- constraints.md: 16개 hook event 정의 (이미 최신)
- conventions.md: 해당 없음
- principles.md: 해당 없음

## Backlog (Genome Modifications Discovered)
None

## Background

`reap.next`가 3가지 역할(stage 전환, archiving, hook 실행)을 겸하고 있어 책임이 과부하됨.
각 stage command가 자기 hook을 실행하는 것이 자연스럽고, archiving은 completion에 속하는 것이 맞음.
backlog `refactor-reap-next-responsibilities.md`에서 8개 이슈와 변경 계획이 정의됨.

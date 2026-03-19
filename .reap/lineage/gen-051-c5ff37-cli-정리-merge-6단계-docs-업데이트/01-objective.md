# Objective

## Regression
- **From**: implementation
- **Reason**: merge lifecycle를 5단계에서 6단계로 변경 (Detect → Mate → Merge → Sync → Validation → Completion). stage 이름도 변경 (genome-resolve → mate, source-resolve → merge). objective/planning 범위 재설정 + 코드/docs 수정 필요.
- **Refs**: domain/merge-lifecycle.md, src/types/index.ts (MergeStage), merge artifact 템플릿, slash commands
- **Affected**: 02-planning.md, 03-implementation.md (범위 확대)

## Goal

CLI pull/push/merge 제거 + merge lifecycle 6단계 전환 (stage 이름 변경 포함) + slash command 정비 + README(4개 언어) + docs 업데이트

## Completion Criteria

1. `MergeStage` 타입: `"detect" | "mate" | "merge" | "sync" | "validation" | "completion"` (6단계)
2. `MergeLifeCycle` 클래스 + `MERGE_LIFECYCLE_ORDER` 6단계 반영
3. Merge artifact 템플릿 6종 (01-detect ~ 06-completion)
4. CLI merge/pull/push 삭제, `reap.pull`/`reap.push` slash command 전환
5. Slash commands: `reap.merge.mate`, `reap.merge.merge`, `reap.merge.sync`, `reap.merge.validation` 반영
6. `domain/merge-lifecycle.md` 6단계 반영
7. `constraints.md` slash commands 업데이트
8. README.md (en) + ko/ja/zh-CN 동기화
9. docs 앱 3페이지 (Overview, Merge Lifecycle, Merge Commands) 6단계 반영
10. `bunx tsc --noEmit`, `bun test`, `npm run build` 통과

## Requirements

### Functional Requirements

- **FR-001**: MergeStage 타입 변경 — genome-resolve → mate, source-resolve → merge, sync-test → sync, validation 추가
- **FR-002**: MERGE_LIFECYCLE_ORDER 6단계
- **FR-003**: MergeLifeCycle 클래스 업데이트 (labels 포함)
- **FR-004**: MergeGenerationManager — 6단계 advance 지원
- **FR-005**: Merge artifact 템플릿 6종 (기존 5종 → 6종, 번호 재배정)
- **FR-006**: CLI merge/pull/push 삭제 + index.ts 정리 (이미 완료)
- **FR-007**: reap.pull.md, reap.push.md slash command (이미 완료)
- **FR-008**: reap.merge.* slash command — mate, merge, sync, validation으로 변경
- **FR-009**: init.ts COMMAND_NAMES 업데이트
- **FR-010**: README + docs 전체 반영

### Non-Functional Requirements

- 기존 normal lifecycle 영향 없음
- 커밋은 사용자 명시적 ok 시만

## Scope
- **Related Genome Areas**: domain/merge-lifecycle.md, constraints.md, domain/hook-system.md
- **Expected Change Scope**: src/types/, src/core/merge-lifecycle.ts, src/core/merge-generation.ts, src/templates/, README*.md, docs/
- **Exclusions**: version bump, merge 핵심 로직(merge.ts) 변경 없음

## Genome Reference
- domain/merge-lifecycle.md: 5단계 → 6단계 변경 필요
- constraints.md: slash commands 목록 업데이트
- domain/collaboration.md: 기존 유지

## Backlog (Genome Modifications Discovered)
- domain/merge-lifecycle.md 6단계 반영 (Completion에서 적용)
- constraints.md slash commands 업데이트 (Completion에서 적용)

## Background
Implementation 중 sync test가 genome↔source 정합성 검증과 validation(테스트/빌드)을 혼용하고 있다는 문제 발견.
sync(genome↔source 일치 검증)과 validation(기계적 테스트)을 분리하기로 결정.
동시에 stage 이름을 생물학적 비유에 맞게 변경: genome-resolve → mate(교배), source-resolve → merge(병합).

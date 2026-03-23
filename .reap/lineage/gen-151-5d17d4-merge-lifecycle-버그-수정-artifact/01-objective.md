# Objective

## Goal

merge lifecycle 버그 수정: artifact 미생성 + backlog carry-forward

## Completion Criteria

1. merge stage(mate, merge, sync, validation)의 `--phase complete`가 해당 artifact 파일 존재를 검증한 후 transition
2. artifact 미존재 시 `--phase complete`가 에러를 반환하고 transition하지 않음
3. `merge-completion --phase archive`가 pending backlog 항목을 `.reap/life/backlog/`에 carry forward
4. consumed backlog만 lineage 이동 후 삭제 (normal lifecycle `complete()`와 동일 동작)
5. 기존 단위 테스트 통과 (`bun test`)
6. 타입체크 통과 (`bunx tsc --noEmit`)
7. 빌드 통과 (`npm run build`)

## Requirements

### Functional Requirements

1. **FR-1**: merge-mate `--phase complete` 실행 전 `02-mate.md` 존재 검증 추가
2. **FR-2**: merge-merge `--phase complete` 실행 전 `03-merge.md` 존재 검증 추가
3. **FR-3**: merge-sync `--phase complete` 실행 전 `04-sync.md` 존재 검증 추가
4. **FR-4**: merge-validation `--phase complete`는 이미 `05-validation.md` 검증 존재 — 확인만
5. **FR-5**: `MergeGenerationManager.complete()`의 backlog 처리를 `GenerationManager.complete()`와 동일하게 수정
   - pending backlog: lineage에 복사 + life/backlog에 유지 (carry forward)
   - consumed backlog: lineage에 복사 + life/backlog에서 삭제

### Non-Functional Requirements

1. merge-validation과 동일한 패턴으로 artifact 검증 추가 (일관성)
2. normal lifecycle의 backlog 처리 패턴을 merge lifecycle에 재사용

## Design

### Selected Design

**Bug 1 (artifact 미생성)**: merge-mate, merge-merge, merge-sync의 `--phase complete` 핸들러 시작부에 artifact 존재 검증 추가. merge-validation이 이미 `05-validation.md`를 검증하는 패턴과 동일.

**Bug 2 (backlog carry-forward)**: `MergeGenerationManager.complete()`의 backlog 섹션을 `GenerationManager.complete()`와 동일하게 변경. 현재는 `rename()`으로 전부 이동하지만, 수정 후에는:
- 각 backlog 항목을 읽어서 consumed 여부 판단
- lineage에 항상 복사
- consumed인 항목만 life/backlog에서 삭제
- pending 항목은 life/backlog에 유지 (carry forward)

## Scope
- **Related Genome Areas**: domain/merge-lifecycle
- **Expected Change Scope**: merge-mate.ts, merge-merge.ts, merge-sync.ts, merge-generation.ts
- **Exclusions**: normal lifecycle, merge-detect, merge-evolve

## Genome Reference

- `src/core/generation.ts` lines 229-245: normal lifecycle backlog 처리 (참조 구현)
- `src/cli/commands/run/merge-validation.ts` lines 81-83: artifact 검증 패턴

## Backlog (Genome Modifications Discovered)
None

## Background

gen-150-76c3fa에서 merge lifecycle 실행 중 발견된 두 가지 버그. GitHub Issue #9.


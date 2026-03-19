# Objective

## Goal

Merge Generation lifecycle 구현 — 멀티머신에서 분기된 generation을 병합하는 특수 lifecycle (Detect → Genome Resolve → Source Resolve → Sync Test → Completion)을 구현한다.

## Completion Criteria

1. `current.yml`에 `type: merge` generation 생성 가능 (parents 2개 이상)
2. Merge lifecycle 5단계 (detect → genome-resolve → source-resolve → sync-test → completion) stage 전환 동작
3. 각 단계의 artifact 템플릿 생성 및 설치 (01-detect.md ~ 05-completion.md)
4. Detect 단계: 공통 조상 식별, 양쪽 변경 요약 자동 생성
5. Genome Resolve 단계: genome diff 추출 및 conflict 보고서 생성
6. Sync Test 단계: genome ↔ source 정합성 검증 (validation commands 실행)
7. `bunx tsc --noEmit` 통과, `bun test` 통과

## Requirements

### Functional Requirements

- **FR-001**: Merge generation 생성 — `type: merge`, `parents`, `commonAncestor` 필드 포함
- **FR-002**: Merge lifecycle stage 정의 — detect, genome-resolve, source-resolve, sync-test, completion
- **FR-003**: `lifecycle.ts` 확장 — merge stage 순서, 전환 규칙, 라벨 지원
- **FR-004**: Detect artifact 자동 생성 — 공통 조상 찾기, 양쪽 genome/source 변경 요약
- **FR-005**: Genome Resolve — genome diff 추출, WRITE-WRITE / CROSS-FILE conflict 분류
- **FR-006**: Source Resolve — 확정된 genome 기준으로 source conflict 식별
- **FR-007**: Sync Test — validation commands 실행으로 정합성 검증
- **FR-008**: Merge artifact 템플릿 5종 작성 및 `~/.reap/templates/`에 설치
- **FR-009**: Merge stage에서의 regression 지원 (sync-test 실패 시 source-resolve 또는 genome-resolve로 회귀)

### Non-Functional Requirements

- 기존 normal lifecycle에 영향 없음 (하위 호환)
- Merge 로직은 로컬 파일시스템만 사용 (외부 의존 없음)

## Scope
- **Related Genome Areas**: `domain/lifecycle-rules.md`, `constraints.md`, `source-map.md`
- **Expected Change Scope**: `src/core/lifecycle.ts`, `src/types/index.ts`, `src/core/generation.ts`, `src/templates/artifacts/`, 새 파일 `src/core/merge.ts`
- **Exclusions**: slash command 템플릿 (별도 generation), README/문서 갱신 (별도 generation), reap CLI subcommand 추가

## Genome Reference

- `GenerationType = "normal" | "merge"` — 이미 정의됨 (src/types/index.ts)
- `GenerationState`에 `type`, `parents`, `genomeHash` 필드 — 이미 정의됨
- `GenerationMeta`에 type, parents — 이미 정의됨
- Lifecycle stage 전환 로직 — `src/core/lifecycle.ts` (현재 normal만 지원)

## Backlog (Genome Modifications Discovered)

- `domain/lifecycle-rules.md`에 merge lifecycle 규칙 추가 필요 (Completion에서 반영)
- `constraints.md`에 merge slash commands 추가 필요 (Completion에서 반영)
- `source-map.md`에 merge 모듈 반영 필요 (Completion에서 반영)

## Background

gen-042~045에서 DAG 기반 인프라 완성: hash ID, parents 배열, meta.yml, migration, compression DAG 호환.
이번 generation은 그 위에 merge generation runtime을 구현하는 것.
backlog `collaboration-architecture.md`의 설계를 기반으로 한다.

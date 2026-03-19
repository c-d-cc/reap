# Objective

## Goal

Merge/분산 협업 워크플로우 설계 확정 및 genome 지식 체계화. 코드 구현은 다음 generation으로.

## Completion Criteria

1. `domain/collaboration.md` 작성 — 분산 환경 아키텍처 (reap pull/push/merge, opt-in, git ref 기반)
2. `domain/merge-lifecycle.md` 작성 — merge 5단계 상세 명세 (git ref 읽기, genome-first 순서)
3. `domain/lifecycle-rules.md`에서 merge 섹션 제거 → merge-lifecycle.md로 분리 완료
4. `reap.merge.*` slash command namespace 설계 (genome에 기록)
5. Merge hook event 타이밍 정의 (genome에 기록)
6. 구현 로드맵을 backlog로 정리

## Requirements

### Functional Requirements

- **FR-001**: domain/collaboration.md — reap pull, reap push, reap merge 워크플로우 전체 설계
- **FR-002**: domain/merge-lifecycle.md — Detect~Completion 각 단계의 입력/출력/판단기준
- **FR-003**: reap.merge.* namespace — reap.merge.start, reap.merge.detect 등 커맨드 목록과 역할
- **FR-004**: Merge hook event — onMergeStart, onGenomeResolved 등 타이밍 정의
- **FR-005**: constraints.md 업데이트 — 새 CLI subcommand (pull, push, merge) 반영
- **FR-006**: lifecycle-rules.md 정리 — merge 규칙을 merge-lifecycle.md로 이관

### Non-Functional Requirements

- 코드 변경 없음 (genome-only generation)
- 기존 genome 100줄 한도 준수 (상세는 domain/으로)

## Scope
- **Related Genome Areas**: domain/, constraints.md, conventions.md
- **Expected Change Scope**: .reap/genome/ 파일들만
- **Exclusions**: 코드 구현, slash command 템플릿 파일, README/docs

## Genome Reference

- gen-046에서 구현된 코드: MergeGenerationManager, MergeLifeCycle, merge.ts, lineage.ts
- gen-046 completion에서 lifecycle-rules.md에 추가된 merge 섹션 (이관 대상)

## Backlog (Genome Modifications Discovered)
None

## Background

gen-046에서 merge generation runtime을 구현했으나, 실제 분산 환경 워크플로우(git ref 기반 읽기, reap pull/push)가 설계되지 않은 상태. 이번 generation에서 "어떻게 동작해야 하는가"를 genome에 확정하고, 이후 generation에서 순차 구현한다.

핵심 설계 결정:
- git pull/push는 항상 허용 (REAP이 간섭 안 함)
- reap pull/push/merge는 opt-in 추가 기능
- reap merge가 genome-first 순서로 git merge를 조율

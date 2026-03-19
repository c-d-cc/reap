# Objective

## Goal

Lineage compression DAG 호환성 개선 + OpenShell E2E 테스트 필수화

## Completion Criteria

- [ ] Level 1 압축 시 meta.yml 정보를 .md frontmatter로 보존
- [ ] 압축된 .md에서도 parents/genomeHash 읽기 가능
- [ ] genNum 기반 정렬 → completedAt 기반 정렬로 전환
- [ ] DAG leaf nodes 기준 보호 로직
- [ ] Genome constraints.md에 OpenShell E2E 테스트 validation command 추가
- [ ] E2E 테스트 실행 시 OpenShell 환경 미구축이면 명확한 에러 메시지 출력
- [ ] 기존 테스트 통과 + compression 관련 신규 테스트

## Requirements

### Functional Requirements

- Compression Level 1: 디렉토리 → .md 변환 시 frontmatter에 DAG 메타 보존
  ```yaml
  ---
  id: gen-042-a3f8c2
  type: normal
  parents: [gen-041-7b2e1f]
  genomeHash: abc12345
  completedAt: 2026-03-19T10:00:00Z
  ---
  ```
- Compression 정렬: completedAt 기반 (meta.yml 또는 frontmatter에서 읽기)
- 보호 로직: DAG leaf node (자식이 없는 generation) 기준으로 최근 N개 보호
- listMeta(): 압축된 .md 파일의 frontmatter에서도 메타 읽기
- E2E 테스트: `openshell` CLI 없으면 skip이 아니라 에러 + 안내 메시지

### Non-Functional Requirements

- 기존 압축된 .md 파일과의 backward compat (frontmatter 없는 경우 graceful)

## Scope
- **Related Genome Areas**: source-map.md (compression.ts), constraints.md (validation commands)
- **Expected Change Scope**: src/core/compression.ts, src/core/generation.ts, tests/core/compression.test.ts, tests/e2e/migration-e2e.sh, genome
- **Exclusions**: Merge generation lifecycle, genome-conflicts.md

## Genome Reference

- constraints.md: Validation Commands 섹션
- source-map.md: Compression 컴포넌트

## Backlog (Genome Modifications Discovered)
None

## Background

gen-042에서 DAG lineage를 도입했으나, 기존 compression 로직이 DAG 구조와 호환되지 않음. 압축 시 meta.yml이 소실되어 parent chain이 끊기고, genNum 기반 정렬이 병렬 generation에서 비결정적. 또한 OpenShell 기반 E2E 테스트를 프로젝트 필수 validation으로 격상하여, 다른 머신에서 작업 시에도 호환성 테스트가 보장되도록 함.

# Objective

## Goal

Generation ID hash 기반 전환 + DAG lineage + backward compatibility/migration (v0.4.0)

## Completion Criteria

- [ ] Generation ID가 `gen-{seq}-{hash}` 형식으로 생성됨
- [ ] current.yml 스키마에 type, parents 필드 추가
- [ ] Lineage가 DAG 구조로 저장/조회 가능
- [ ] 기존 선형 lineage(gen-001 ~ gen-041)가 DAG 형식으로 마이그레이션됨
- [ ] 구 ID 형식(gen-NNN)과의 backward compatibility 유지
- [ ] 기존 테스트 통과 + 새 기능 테스트 추가
- [ ] Minor version bump: 0.3.4 → 0.4.0

## Requirements

### Functional Requirements

- Generation ID: content hash 기반 (`gen-{seq}-{hash}`)
  - hash 입력: parents, goal, genomeHash, machineId, startedAt
  - seq: 로컬 DAG 순회로 계산 (표시용)
  - hash가 진짜 ID, seq 중복 허용
- current.yml 스키마 확장:
  - `type`: normal | merge (기본값: normal)
  - `parents`: 부모 generation ID 배열
- DAG lineage: 선형 체인 → 부모 참조 그래프
- Migration: 기존 `gen-NNN` → `gen-NNN-{hash}` 변환 + parents 자동 설정 (이전 gen을 parent로)
- Backward compat: 구 ID 참조 시 매핑 테이블로 resolve

### Non-Functional Requirements

- 기존 프로젝트의 `.reap/` 데이터 무손실 마이그레이션
- 성능: lineage 100개 이하에서 DAG 순회 <1초

## Scope
- **Related Genome Areas**: source-map.md (generation.ts, lifecycle.ts, types), constraints.md, conventions.md
- **Expected Change Scope**: src/core/generation.ts, src/types/index.ts, src/core/lifecycle.ts, src/commands/status.ts, 슬래시 커맨드 템플릿
- **Exclusions**: Merge generation lifecycle (다음 generation), genome-conflicts.md 생성, Sync test 명령어

## Genome Reference

- ADR-001: TypeScript + Node.js 호환
- constraints.md: "외부 서비스 의존 없음 — 로컬 파일시스템만 사용" (유지)
- conventions.md: 커밋 메시지 `feat(gen-NNN): [goal]` → `feat(gen-NNN-hash): [goal]` 변경 필요

## Backlog (Genome Modifications Discovered)
None

## Background

멀티머신/멀티에이전트 협업을 위한 기반 작업. 현재 REAP은 "한 머신, 한 Generation" 전제로 설계되어 있어 병렬 작업 시 ID 충돌, 상태 충돌이 발생함. 블록체인의 hash chain + DAG 개념에서 영감을 받아 설계. 이번 generation은 데이터 구조/기반 변경에 집중하고, 실제 협업 기능(merge generation)은 다음 generation에서 구현.

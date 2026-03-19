# Objective

## Goal

v0.3.0 docs full scan 갱신 + docs-update hook 버전 수준별 동작 규칙 추가

## Completion Criteria

- CC-1: README.md (en) 기준 full scan → 7개 stale 항목 모두 반영
- CC-2: README.ko.md, README.ja.md, README.zh-CN.md가 en 기준으로 동기화
- CC-3: docs/src/i18n/translations/ 4개 언어 파일 업데이트
- CC-4: docs/src/pages/ 4개 페이지 업데이트 (HookReference, CoreConcepts, Advanced, Workflow)
- CC-5: docs-update hook에 버전 수준별 규칙 + en 기준 i18n 동기화 규칙 포함
- CC-6: 기존 테스트 통과 + tsc + 빌드

## Requirements

### Functional Requirements

- FR-001: README.md (en) full scan — hooks 파일 기반 구조, source-map.md, hook suggestion, source-map drift, compression 5000/3, version bump, staleness 필터링 반영
- FR-002: README.ko.md, README.ja.md, README.zh-CN.md — en 변경사항 동기화
- FR-003: docs/src/i18n/translations/ — en.ts 기준 스캔 후 ko.ts, ja.ts, zh-CN.ts 동기화
- FR-004: docs/src/pages/ — HookReferencePage, CoreConceptsPage, AdvancedPage, WorkflowPage 업데이트
- FR-005: `.reap/hooks/onGenerationComplete.docs-update.md` hook 내용 개선:
  - patch: 변경된 기능의 해당 섹션만 확인
  - minor 이상: README(en) + docs 전체 full scan, 모든 변경사항 대조
  - README 수정 시: en 기준으로 스캔 → ko, ja, zh-CN에 동기화
  - docs translations 수정 시: en.ts 기준으로 스캔 → 다른 언어 동기화

### Non-Functional Requirements

- i18n 동기화 시 각 언어의 자연스러운 표현 유지 (기계적 직역 금지)

## Scope
- **Expected Change Scope**: README 4개, docs translations 4개, docs pages 4개, .reap/hooks/onGenerationComplete.docs-update.md
- **Exclusions**: reap-guide.md (이미 gen-031/032에서 업데이트 완료)

## Background
- gen-029~033에서 5개 generation 진행했으나 docs-update hook을 대부분 skip 처리
- v0.3.0 minor bump에 해당하므로 full scan 필요
- README 4개 언어, docs translations 4개 언어 모두 갱신 필요

# Objective

## Goal
integrity check에서 source-map.md 줄수 경고 제외.
source-map.md는 sync 시 AI가 최대한 압축해서 작성하며, 코드베이스가 커지면 자연스럽게 늘어나므로 줄수 경고가 의미 없다.

## Completion Criteria
1. `reap fix --check` 실행 시 source-map.md에 대한 줄수 경고가 발생하지 않는다
2. `src/core/integrity.ts`의 genome 줄수 검사에서 source-map.md가 제외된다
3. `.reap/genome/source-map.md`에서 "줄 수 한도" 관련 문구가 제거된다
4. 기존 테스트가 모두 통과한다

## Requirements

### Functional Requirements
1. `integrity.ts`의 `checkGenome` 함수에서 source-map.md를 `GENOME_LINE_WARNING_THRESHOLD` 검사 대상에서 제외
2. `source-map.md` 상단 설명에서 "줄 수 한도: ~150줄" 문구 제거

### Non-Functional Requirements
1. 다른 genome 파일(principles.md, conventions.md, constraints.md)의 줄수 검사는 유지

## Design

### Selected Design
`checkGenome` 함수 내 `l1Files` 순회 시 source-map.md에 대해서만 줄수 검사를 건너뛴다. 가장 간단하고 명확한 방법으로, 줄수 검사 조건문에 파일명 예외 처리를 추가한다.

## Scope
- **Related Genome Areas**: source-map.md (줄수 한도 문구)
- **Expected Change Scope**: `src/core/integrity.ts`, `.reap/genome/source-map.md`
- **Exclusions**: genome 줄수 검사 로직 자체의 변경 없음 (source-map.md만 제외)

## Genome Reference
- constraints.md: 파일 I/O는 src/core/fs.ts 유틸 사용

## Backlog (Genome Modifications Discovered)
None

## Background
source-map.md는 C4 Container/Component 수준의 프로젝트 구조 맵으로, 코드베이스가 성장하면 자연스럽게 길어진다. 현재 128줄로 이미 100줄 임계값을 초과하여 매번 경고가 발생하고 있으나, 이는 의도된 증가이므로 경고가 무의미하다.


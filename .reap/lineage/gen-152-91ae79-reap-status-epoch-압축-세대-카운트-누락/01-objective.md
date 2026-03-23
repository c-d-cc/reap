# Objective

## Goal
`reap status`의 "Completed Generations" 카운트가 epoch 압축된 세대를 누락하는 버그 수정

## Completion Criteria
1. `listCompleted()`가 epoch.md 내 세대 수를 포함한 전체 카운트를 반환
2. `reap status`에서 정확한 세대 수 표시
3. `nextSeq()` 등 `listCompleted()` 의존 함수의 기존 동작 유지
4. 단위 테스트 통과

## Requirements

### Functional Requirements
1. `listCompleted()`가 lineage/ 내 gen-* 디렉토리/파일 + epoch.md 내 generations 수를 합산
2. epoch.md가 없는 경우 기존 동작과 동일
3. epoch.md의 generations 배열이 비어있거나 파싱 실패 시 안전하게 0 반환

### Non-Functional Requirements
1. 기존 `listCompleted()` 반환 타입(`string[]`) 변경 시 호출부 영향 최소화

## Design

### Approaches Considered

| Aspect | Approach A: listCompleted 반환값 유지 + 별도 카운트 함수 | Approach B: completedCount() 도입 |
|--------|-----------|-----------|
| Summary | listCompleted()는 gen-* 목록 반환 유지, 별도로 epochCount() 추가. status.ts에서 합산 | listCompleted()는 그대로 두고, completedCount() 함수를 새로 만들어 gen-* + epoch 합산 |
| Pros | listCompleted() 시그니처 불변, 기존 호출부 영향 없음 | 단일 함수 호출로 정확한 카운트 |
| Cons | 호출부에서 두 함수 조합 필요 | listCompleted()를 쓰는 곳이 의미 혼동 가능 |
| Recommendation | **채택** — 기존 API 안정성 우선 | |

### Selected Design
**Approach A**: `listCompleted()`는 기존대로 gen-* 목록을 반환. `countEpochGenerations()` 함수를 `lineage.ts`에 추가하여 epoch.md 내 세대 수를 반환. `status.ts`에서 `completedGens.length + epochCount`로 합산.

단, `nextSeq()`도 epoch 세대를 고려해야 하므로, `countEpochGenerations()` 대신 epoch 내 세대 ID 목록을 반환하는 `listEpochGenerations()`를 만들고, `nextSeq()`에서도 활용.

### Design Approval History
- 자율 결정 (단순 버그픽스)

## Scope
- **Related Genome Areas**: source-map.md (core/lineage 모듈)
- **Expected Change Scope**: `src/core/lineage.ts`, `src/cli/commands/status.ts`, 테스트 파일
- **Exclusions**: compression.ts 로직 변경 없음

## Genome Reference
- conventions.md: 함수 단일 책임, 50줄 이하
- constraints.md: 파일 I/O는 fs.ts 유틸 경유

## Backlog (Genome Modifications Discovered)
None

## Background
Level 2 lineage 압축 후 gen-* 디렉토리가 epoch.md로 통합되면서, `listCompleted()`가 gen-*만 카운트하여 실제보다 적은 수를 보고함. 현재 프로젝트: epoch.md에 92세대, gen-* 59개 → status는 59만 표시.

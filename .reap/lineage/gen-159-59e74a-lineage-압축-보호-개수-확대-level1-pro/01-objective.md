# Objective

## Goal
Lineage 압축 보호 개수를 확대하여 최근 20개 세대의 원본을 유지한다.
현재 `LEVEL1_PROTECTED_COUNT = 3`으로 최근 3세대만 원본 유지되어 155+ 세대에서 원본 9개(~6%)만 남아있어 원본 참조가 어려운 문제를 해결한다.

## Completion Criteria
1. `LEVEL1_PROTECTED_COUNT`가 3에서 20으로 변경됨
2. `LINEAGE_MAX_LINES`가 원본 20개를 수용할 수 있도록 조정됨
3. 기존 테스트가 모두 통과함
4. 관련 테스트의 기대값이 새 상수에 맞게 업데이트됨

## Requirements

### Functional Requirements
1. `LEVEL1_PROTECTED_COUNT`를 3에서 20으로 변경
2. `LINEAGE_MAX_LINES`를 적절히 증가시켜 원본 20개가 압축 없이 유지되도록 조정
3. Level 2 압축 관련 상수(`LEVEL2_PROTECTED_COUNT`, `LEVEL2_MIN_LEVEL1_COUNT`)도 필요시 검토

### Non-Functional Requirements
1. 기존 compression 로직의 동작 흐름 변경 없음 (상수 값만 변경)
2. 테스트 통과

## Design

### Approaches Considered

| Aspect | Approach A: 상수만 변경 | Approach B: config 기반 설정 |
|--------|-----------|-----------|
| Summary | 코드 내 상수값만 조정 | reap.config에서 설정 가능하게 |
| Pros | 단순, 즉시 적용 | 유연성 |
| Cons | 변경 시 코드 수정 필요 | 오버엔지니어링, 이 세대 범위 초과 |
| Recommendation | 채택 | 미채택 |

### Selected Design
Approach A: 상수만 변경. `LEVEL1_PROTECTED_COUNT`를 20으로, `LINEAGE_MAX_LINES`를 적절히 증가.

현재 LINEAGE_MAX_LINES=5000이며, 원본 디렉토리 1개당 약 200-300줄 가정 시 20개 = 4000-6000줄.
안전 마진을 두어 `LINEAGE_MAX_LINES`를 10000으로 확대한다.

### Design Approval History
- 2026-03-23: 상수 변경 방식 채택

## Scope
- **Related Genome Areas**: `src/core/compression.ts`
- **Expected Change Scope**: 상수 2개 변경 (`LEVEL1_PROTECTED_COUNT`, `LINEAGE_MAX_LINES`), 관련 테스트 업데이트
- **Exclusions**: config 기반 설정, Level 2 압축 로직 변경

## Genome Reference
- `constraints.md`: 파일 I/O는 src/core/fs.ts 유틸 사용

## Backlog (Genome Modifications Discovered)
None

## Background
155+ 세대가 누적된 프로젝트에서 원본(비압축) 세대가 9개(~6%)만 남아있어 이전 세대의 상세 내용 참조가 어려움. 보호 개수를 20으로 확대하여 최근 20개 세대의 전체 artifact를 유지한다.


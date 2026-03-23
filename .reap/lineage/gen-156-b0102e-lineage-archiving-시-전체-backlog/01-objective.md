# Objective

## Goal
Lineage archiving 시 전체 backlog 복사 버그 수정.
`src/core/generation.ts`의 archiving 로직에서 status에 관계없이 모든 backlog를 lineage에 복사하는 버그를 수정한다.

## Completion Criteria
1. lineage에는 해당 generation에서 consumed된 backlog 항목만 복사된다.
2. pending/deferred 상태의 backlog 항목은 lineage에 복사되지 않는다.
3. consumed된 backlog 항목은 기존과 동일하게 `life/backlog/`에서 삭제된다.
4. 기존 테스트가 모두 통과한다.
5. 빌드(`npm run build`)와 타입체크(`bunx tsc --noEmit`)가 성공한다.

## Requirements

### Functional Requirements
1. `archiveGeneration()` 내 backlog 복사 로직에서 `isConsumed` 조건 추가
2. consumed 항목만 lineage의 `backlog/` 디렉토리에 복사
3. pending/deferred 항목은 `life/backlog/`에만 유지 (복사하지 않음)

### Non-Functional Requirements
1. 기존 동작(consumed 항목 삭제)에 영향 없음
2. 코드 변경은 최소한으로 유지 (조건문 1줄 추가)

## Design

### Approaches Considered

| Aspect | Approach A: if 조건 추가 | Approach B: 필터 후 반복 |
|--------|-----------|-----------|
| Summary | 기존 루프 내 `writeTextFile` 앞에 `if (isConsumed)` 조건 추가 | `backlogEntries`를 먼저 필터링 후 consumed만 반복 |
| Pros | 최소 변경, 기존 구조 유지 | 의도가 더 명확 |
| Cons | 없음 | 불필요한 리팩토링, 삭제 로직 분리 필요 |
| Recommendation | 선택 | - |

### Selected Design
Approach A: 기존 루프에서 `writeTextFile` 호출을 `if (isConsumed)` 블록 안으로 이동.
변경 전: 무조건 복사 후 consumed만 삭제.
변경 후: consumed만 복사하고 삭제.

### Design Approval History
- 2026-03-23: 단순 조건문 추가 방식 선택

## Scope
- **Related Genome Areas**: `src/core/generation.ts` (archiveGeneration)
- **Expected Change Scope**: 1개 파일, 2줄 변경 (조건문 추가 + 들여쓰기)
- **Exclusions**: lineage 압축 로직, backlog 파싱 로직

## Genome Reference
- conventions.md: 함수는 단일 책임, 50줄 이하 권장
- constraints.md: 파일 I/O는 src/core/fs.ts 유틸 사용

## Backlog (Genome Modifications Discovered)
None

## Background
gen-155에서 Codex CLI 지원을 추가한 후 발견된 버그.
lineage에 모든 backlog가 복사되면 세대별 변경 추적이 불가능하고, lineage 디렉토리가 불필요하게 비대해진다.

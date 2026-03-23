# Objective

## Goal
`reap run pull --phase check`에서 lineage meta 기반으로만 비교하던 로직을 `git rev-list --left-right --count`로 대체하여 ahead/behind/diverged/up-to-date 4가지 상태를 정확히 구분한다.

## Completion Criteria
1. check phase에서 `git rev-list --left-right --count HEAD...{target}` 결과 기반으로 분류한다
2. ahead > 0 && behind == 0 → "ahead" 상태, push 안내 메시지 출력
3. ahead == 0 && behind > 0 → "behind" 상태, fast-forward 시도 안내
4. ahead > 0 && behind > 0 → "diverged" 상태, 기존 merge 로직 안내
5. 둘 다 0 → "up-to-date" 상태
6. 기존 lineage meta 기반 비교 로직 제거 또는 대체
7. 타입체크 통과 (`bunx tsc --noEmit`)
8. 기존 테스트 통과 (`bun test`)

## Requirements

### Functional Requirements
1. FR-01: check phase 진입 시 `git rev-list --left-right --count HEAD...{target}` 실행하여 ahead/behind 카운트를 얻는다
2. FR-02: ahead only → phase "ahead"로 출력, push 안내
3. FR-03: behind only → phase "fast-forward"로 출력, `git merge --ff` 안내
4. FR-04: both ahead and behind → phase "start-merge"로 출력, merge generation 안내
5. FR-05: both zero → phase "up-to-date"로 출력
6. FR-06: git rev-list 실패 시 적절한 에러 메시지 출력

### Non-Functional Requirements
1. NFR-01: 기존 pull.ts 구조 유지, check phase 내부만 변경
2. NFR-02: execSync 사용 (이미 import됨)

## Design

### Approaches Considered

| Aspect | Approach A: git rev-list 기반 | Approach B: lineage meta + git rev-list 혼합 |
|--------|------------------------------|---------------------------------------------|
| Summary | lineage 비교를 완전히 git rev-list로 대체 | lineage 비교 후 git rev-list로 보충 |
| Pros | 단순, 정확, git 표준 방식 | 기존 로직 유지 |
| Cons | lineage 정보 미사용 | 복잡, 두 소스 충돌 가능 |
| Recommendation | 채택 | - |

### Selected Design
**Approach A**: `git rev-list --left-right --count HEAD...{target}` 결과만으로 4가지 상태를 분류한다. 기존 lineage meta 비교 및 canFastForward 로직을 제거하고, git 커밋 그래프 기반으로 판단한다.

### Design Approval History
- 2026-03-24: 초기 설계 확정

## Scope
- **Related Genome Areas**: source-map.md (CLI commands 섹션)
- **Expected Change Scope**: `src/cli/commands/run/pull.ts` — check phase 내부 로직 변경
- **Exclusions**: fetch phase, merge generation 로직 자체는 변경하지 않음

## Genome Reference
- conventions.md: 함수 단일 책임, 50줄 이하 권장
- constraints.md: TypeScript strict mode, Node.js fs 사용

## Backlog (Genome Modifications Discovered)
None

## Background
현재 pull check phase는 lineage meta(generation 완료 시각)를 기반으로 local과 remote의 최신 generation을 비교하고 `canFastForward()`로 판단한다. 하지만 이 방식은 git 커밋 그래프를 고려하지 않아 local이 ahead인 경우도 diverged로 잘못 판단하는 문제가 있다.

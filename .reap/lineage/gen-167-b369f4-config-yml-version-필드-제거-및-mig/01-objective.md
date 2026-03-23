# Objective

## Goal
config.yml의 `version` 필드를 제거하고, migration 실행 로직에서 version 비교를 제거한다.
각 migration의 `check()` 함수가 이미 idempotent하게 필요 여부를 판단하므로 version 필드가 불필요하며,
`reap update` 시 version 갱신으로 인한 uncommitted changes 문제를 해소한다.

## Completion Criteria
1. `config.yml`에 `version` 필드가 존재하지 않는다
2. `ReapConfig` 타입에서 `version` 필드가 제거되었다
3. migration 실행 시 version 비교 없이 모든 migration을 `check()`하고 필요한 것만 실행한다
4. migration 완료 후 `config.version` 갱신 코드가 제거되었다
5. `reap config`에서 version 줄이 제거되었다 (또는 패키지 버전으로 대체)
6. `reap status`에서 version이 패키지 버전(`__REAP_VERSION__`)으로 대체되었다
7. `integrity.ts`에서 version 검증이 제거되었다
8. `MigrationRunResult`에서 `fromVersion`/`toVersion` 필드가 제거되었다
9. `Migration` 인터페이스에서 `fromVersion`/`toVersion` 필드가 제거되었다
10. 기존 테스트가 모두 통과한다

## Requirements

### Functional Requirements
1. **FR-01**: `ReapConfig` 타입에서 `version` 필드 제거
2. **FR-02**: `init.ts`에서 config 생성 시 `version` 필드 미포함
3. **FR-03**: `MigrationRunner.run()`에서 version 비교 로직 제거 — 모든 migration을 매번 `check()`
4. **FR-04**: migration 완료 후 `config.version` 갱신 코드 제거
5. **FR-05**: `integrity.ts`의 `checkConfig()`에서 version 관련 검증 제거
6. **FR-06**: `run/config.ts`에서 version 표시를 패키지 버전으로 대체
7. **FR-07**: `status.ts`에서 version을 패키지 버전(`__REAP_VERSION__`)으로 대체
8. **FR-08**: `MigrationRunResult`에서 `fromVersion`/`toVersion` 제거
9. **FR-09**: `Migration` 인터페이스에서 `fromVersion`/`toVersion` 제거, 개별 migration 파일도 정리
10. **FR-10**: 이 프로젝트의 `.reap/config.yml`에서 `version` 행 제거

### Non-Functional Requirements
1. **NFR-01**: 기존 테스트 모두 통과
2. **NFR-02**: 빌드 성공 (tsc + esbuild)

## Design

### Approaches Considered

| Aspect | Approach A: version 완전 제거 | Approach B: version 유지 + 비교 비활성화 |
|--------|-----------|-----------|
| Summary | version 필드를 타입/코드/config에서 완전 제거 | version 필드는 유지하되 migration 비교에 사용하지 않음 |
| Pros | 깔끔, 근본적 해결 | 기존 호환성 유지 |
| Cons | 기존 config.yml과 호환성 주의 필요 | version 필드가 여전히 갱신되며 uncommitted changes 발생 가능 |
| Recommendation | **선택** | - |

### Selected Design
**Approach A**: version 필드 완전 제거. `check()` 기반 idempotent migration은 version 없이도 동작.
- `MigrationRunner.run()` 시그니처에서 `currentPackageVersion` 파라미터 제거
- `Migration` 인터페이스에서 `fromVersion`/`toVersion` 제거 → `description`과 `check()`/`up()`만 유지
- `MigrationRunResult`에서 `fromVersion`/`toVersion` 제거
- `compareSemver`, `normalizeVersion` 헬퍼 함수 제거
- status에서는 `__REAP_VERSION__` 패키지 버전을 표시

### Design Approval History
- 2026-03-23: 초기 설계 확정

## Scope
- **Related Genome Areas**: constraints.md (Tech Stack — config format)
- **Expected Change Scope**: 7개 파일 수정, config.yml 수정
- **Exclusions**: migration 자체의 check()/up() 로직 변경 없음

## Genome Reference
- constraints.md: YAML config format
- conventions.md: 커밋 규칙, 코드 스타일

## Backlog (Genome Modifications Discovered)
None

## Background
`reap update` 실행 시 migration이 `config.yml`의 `version`을 현재 패키지 버전으로 갱신하여
git에 uncommitted changes가 발생하는 문제. 각 migration의 `check()` 함수가 이미
실행 필요 여부를 idempotent하게 판단하므로 version 기반 필터링이 불필요.

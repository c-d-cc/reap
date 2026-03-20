# Objective

## Goal

E2E 테스트: MigrationRunner — 4개 시나리오 (init version, legacy migration, already latest, dry-run)

## Completion Criteria

1. `tests/core/migrations.test.ts` 파일이 존재하고 4개 테스트 시나리오를 포함
2. Scenario 1 (init version): 신규 프로젝트 config.yml version이 0.0.0으로 정규화되어 migration 실행 후 최신 버전으로 갱신됨을 검증
3. Scenario 2 (legacy migration): version 0.1.0(legacy) -> 현재 버전으로 migration 실행되고 lineage DAG 변환됨을 검증
4. Scenario 3 (already latest): 이미 최신 버전이면 migration 스킵됨을 검증
5. Scenario 4 (dry-run): dry-run 모드에서 실제 변경 없이 결과 보고됨을 검증
6. `bun test` 전체 통과
7. `bunx tsc --noEmit` 통과
8. `npm run build` 통과

## Requirements

### Functional Requirements

- FR1: MigrationRunner.run()을 sandbox 환경에서 호출하여 각 시나리오별 동작 검증
- FR2: 각 테스트는 독립적 temp 디렉토리에서 실행 (격리)
- FR3: config.yml version 필드가 migration 후 올바르게 갱신되는지 검증
- FR4: dry-run 모드에서 config.yml이 변경되지 않음을 검증

### Non-Functional Requirements

- NFR1: 기존 migration.test.ts와 일관된 패턴 사용
- NFR2: 테스트 실행 시간 1초 미만

## Design

### Approaches Considered

| Aspect | Approach A: MigrationRunner 직접 호출 | Approach B: CLI 레벨 E2E |
|--------|-----------|-----------|
| Summary | MigrationRunner.run() 직접 임포트하여 테스트 | reap update CLI 명령 실행 후 결과 검증 |
| Pros | 빠르고 격리된 테스트, 세밀한 assertion 가능 | 실제 사용자 시나리오에 가까움 |
| Cons | CLI 통합 경로 미검증 | 느리고 외부 의존성 있음 |
| Recommendation | **채택** | 별도 CLI E2E에서 커버 |

### Selected Design

MigrationRunner.run()을 직접 호출하는 방식. sandbox(temp dir)에서 .reap 구조를 직접 셋업하고, MigrationRunner.run()을 호출하여 결과를 assertion. 기존 migration.test.ts 패턴(beforeEach/afterEach + temp dir)을 재활용.

### Design Approval History

- 2026-03-21: MigrationRunner 직접 호출 방식 채택

## Scope
- **Related Genome Areas**: constraints.md (Test Infrastructure), conventions.md (Testing Conventions)
- **Expected Change Scope**: tests/core/migrations.test.ts 신규 생성
- **Exclusions**: CLI 레벨 E2E, migration 로직 자체 변경 없음

## Genome Reference

- constraints.md: Test Infrastructure (private submodule), Validation Commands
- conventions.md: Testing Conventions (E2E sandbox 패턴)

## Backlog (Genome Modifications Discovered)
None

## Background

gen-082-399b16에서 MigrationRunner를 구현했으나 E2E 테스트가 deferred됨. tests/ private submodule에 E2E 테스트를 추가.

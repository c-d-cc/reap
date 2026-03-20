# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T1 | 테스트 파일 생성 (tests/core/migrations.test.ts) — sandbox setup + imports | Yes |
| T2 | Scenario 1: init version (0.0.0 -> 0.10.0) | Yes |
| T3 | Scenario 2: legacy migration (0.1.0 -> 0.10.0) + lineage DAG 변환 검증 | Yes |
| T4 | Scenario 3: already latest — 스킵 검증 | Yes |
| T5 | Scenario 4: dry-run — [dry-run] 접두사 + 미변경 검증 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- 기존 migration.test.ts (lineage migration 단위 테스트)와 별도로 MigrationRunner.run() E2E 테스트를 migrations.test.ts에 구현
- normalizeVersion("0.1.0") = "0.0.0" 동작을 활용하여 legacy version 시나리오 커버
- Scenario 1에서 empty lineage일 때 migration check()가 false 반환하여 skipped 처리되지만, config.yml version은 정상 갱신됨을 확인

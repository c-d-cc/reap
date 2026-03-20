## What's New

- MigrationRunner: `reap update` 시 config.yml version 기반 자동 migration 시스템
- config.yml version이 실제 REAP 패키지 버전을 추적 (`reap init` 시 기록)
- Migration 실패 시 `autoIssueReport` 활성화된 경우 GitHub issue 자동 생성
- MigrationRunner E2E 테스트 4개 시나리오 추가

## Generations

- **gen-082-399b16**: Migration Agent — version 기반 자동 migration 시스템 구축
- **gen-083-b9727c**: E2E 테스트 MigrationRunner — init version, legacy migration, already latest, dry-run

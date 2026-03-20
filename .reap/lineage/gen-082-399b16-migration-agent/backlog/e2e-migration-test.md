---
type: task
status: pending
---
# E2E 테스트: MigrationRunner

MigrationRunner의 E2E 테스트 추가 (tests/ private submodule):
- Scenario 1: 신규 프로젝트 init → config.yml version 검증
- Scenario 2: version 0.1.0 → 현재 버전 migration
- Scenario 3: 이미 최신 → 스킵
- Scenario 4: dry-run 모드

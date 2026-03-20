# Planning

## Summary

MigrationRunner E2E 테스트 4개 시나리오를 `tests/core/migrations.test.ts`에 구현. 기존 `migration.test.ts` 패턴(sandbox temp dir + beforeEach/afterEach)을 따르되, MigrationRunner.run()을 직접 호출하여 config.yml version 기반 migration flow를 검증.

## Technical Context
- **Tech Stack**: TypeScript, Bun test runner, YAML
- **Constraints**: tests/는 private submodule. Node.js fs/promises 사용. sandbox temp dir에서 .reap 구조 셋업.

## Tasks

1. **T1: 테스트 파일 생성** — `tests/core/migrations.test.ts`
   - sandbox setup: temp dir + .reap 디렉토리 구조 (config.yml, lineage/, life/, genome/)
   - MigrationRunner, ConfigManager, ReapPaths import
2. **T2: Scenario 1 — init version**
   - config.yml에 version 없음 (또는 "0.0.0") 상태에서 MigrationRunner.run("0.10.0") 호출
   - migration 실행 후 config.yml version이 "0.10.0"으로 갱신됨 검증
3. **T3: Scenario 2 — legacy migration (0.1.0 -> current)**
   - config.yml version: "0.1.0" + legacy lineage 디렉토리 존재
   - migration 실행 후 lineage가 DAG 포맷으로 변환되고 config.yml version 갱신됨 검증
4. **T4: Scenario 3 — already latest**
   - config.yml version이 이미 "0.10.0"
   - MigrationRunner.run("0.10.0") → migrated 0개, 변경 없음 검증
5. **T5: Scenario 4 — dry-run**
   - legacy 상태에서 dryRun=true
   - migrated에 "[dry-run]" 접두사 포함, config.yml 변경 없음 검증

## Dependencies

- `src/core/migrations/index.ts` — MigrationRunner 클래스
- `src/core/config.ts` — ConfigManager
- `src/core/paths.ts` — ReapPaths
- `src/core/migration.ts` — needsMigration, migrateLineage (0.0.0->0.10.0 migration에서 사용)

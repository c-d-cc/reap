# Implementation

## Changes

### T001: `src/core/migrations/types.ts` (신규)
- `Migration` 인터페이스: `fromVersion`, `toVersion`, `description`, `check()`, `up()`
- `MigrationRunResult` 인터페이스: `migrated[]`, `skipped[]`, `errors[]`, `fromVersion`, `toVersion`

### T002: `src/core/migrations/index.ts` (신규)
- `MigrationRunner` 클래스 — registry + semver 비교/정렬 + 순차 실행 엔진
- `normalizeVersion()` — legacy `"0.1.0"` → `"0.0.0"` 변환, `+dev` suffix 제거
- `compareSemver()` — 3-part semver 비교
- 실패 시 즉시 중단 (NFR2), dry-run 지원 (FR7)
- 성공 시 `config.yml` version 자동 갱신 (FR6)

### T003: `src/core/migrations/0.0.0-to-0.10.0.ts` (신규)
- 기존 `migration.ts`의 `needsMigration` + `migrateLineage`를 registry migration으로 래핑
- 에러 발생 시 throw (runner가 catch)

### T004: `src/cli/commands/init.ts:71`
- `version: "0.1.0"` → `version: process.env.__REAP_VERSION__ || "0.0.0"`

### T005: `src/cli/commands/update.ts`
- import 변경: `needsMigration`/`migrateLineage` → `MigrationRunner`
- lineage migration 직접 호출 코드 → `MigrationRunner.run()` 단일 호출로 교체
- migration 결과를 `UpdateResult`에 통합

### T010: `src/cli/commands/update.ts` (실패 report)
- migration 실패 + `config.autoIssueReport` true → `gh issue create` 자동 실행
- best-effort (실패해도 무시)

## Verification
- `bunx tsc --noEmit` — 통과
- `npm run build` — 통과 (102 modules, 0.38 MB)
- `bun test` — 159 pass, 0 fail

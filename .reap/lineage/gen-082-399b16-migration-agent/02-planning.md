# Planning

## Summary

Migration registry 패턴을 도입하여 `reap update` 시 `.reap/` 프로젝트 파일을 자동 마이그레이션.
- `config.yml`의 `version`을 실제 REAP 패키지 버전으로 관리
- 버전별 migration 함수를 registry에 등록, semver 범위로 순차 실행
- 기존 `migration.ts`의 lineage migration을 registry로 통합

## Technical Context
- **Tech Stack**: TypeScript, Node.js fs/promises, YAML, `src/core/fs.ts` 유틸
- **Constraints**:
  - 파일 I/O는 `readTextFile`/`writeTextFile` 경유
  - `__REAP_VERSION__`은 빌드 타임 주입 (소스 하드코딩 금지)
  - 기존 `reap update` CLI 인터페이스 유지 (breaking change 없음)

## Tasks

### Phase 1: Migration 인프라

- [ ] T001 `src/core/migrations/types.ts` 생성 — `Migration` 인터페이스 정의 (`fromVersion`, `toVersion`, `check`, `up`, `description`)
- [ ] T002 `src/core/migrations/index.ts` 생성 — `MigrationRunner` 클래스 (registry, `run(paths, currentVersion, dryRun)`, semver 비교/정렬, 결과 보고, 실패 시 `/reap.report` 연동)
- [ ] T003 [P] `src/core/migrations/0.0.0-to-0.10.0.ts` 생성 — 기존 lineage migration을 registry migration으로 래핑 (`needsMigration` + `migrateLineage` 호출)

### Phase 2: 기존 코드 통합

- [ ] T004 `src/cli/commands/init.ts:71` 수정 — `version: "0.1.0"` → `version: process.env.__REAP_VERSION__ || "0.0.0"` 으로 변경
- [ ] T005 `src/cli/commands/update.ts` 수정 — `updateProject()` 함수 끝(lineage migration 대체)에 `MigrationRunner.run()` 호출 추가. 기존 lineage migration 직접 호출 코드(184-197줄) 제거
- [ ] T006 `src/core/migration.ts` — 파일 유지 (registry migration에서 import). 삭제하지 않음

### Phase 3: 테스트

- [ ] T007 `tests/core/migrations.test.ts` 생성 — MigrationRunner 단위 테스트 (registry 정렬, 범위 필터, dry-run, 이미 최신, 실패 중단)
- [ ] T008 `tests/core/migrations.test.ts` — 0.0.0→0.10.0 migration 통합 테스트 (legacy lineage 있는 sandbox에서 실행)
- [ ] T009 타입체크 + 빌드 + 전체 테스트 통과 확인

### Phase 4: 실패 시 자동 Report

- [ ] T010 `src/core/migrations/index.ts` — migration 실패 시 `config.autoIssueReport`가 true이면 `reap report` 자동 실행 (에러 상세 + 실패한 migration 정보 포함)

## Dependencies

```
T001 → T002 → T005
T001 → T003 → T005
T004 (독립)
T006 (독립 — 변경 없음)
T005 → T007 → T008 → T009
```

## E2E 시나리오

### Scenario 1: 신규 프로젝트 init
- **Setup**: 빈 디렉토리에서 `reap init`
- **Action**: config.yml 확인
- **Assertion**: `version` 필드가 현재 패키지 버전과 일치

### Scenario 2: 기존 프로젝트 update (version: 0.1.0)
- **Setup**: sandbox에 `.reap/` 생성, `config.yml`에 `version: 0.1.0` + legacy lineage 디렉토리
- **Action**: `MigrationRunner.run()` 실행
- **Assertion**: lineage migration 실행됨, config.yml version이 현재 버전으로 갱신

### Scenario 3: 이미 최신 버전
- **Setup**: sandbox에 `.reap/` 생성, `config.yml`에 현재 패키지 버전
- **Action**: `MigrationRunner.run()` 실행
- **Assertion**: migration 0개 실행, version 변경 없음

### Scenario 4: dry-run
- **Setup**: Scenario 2와 동일
- **Action**: `MigrationRunner.run(paths, version, true)` 실행
- **Assertion**: 파일 변경 없음, 실행될 migration 목록만 반환

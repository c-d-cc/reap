# Planning

## Goal

REAP가 새 버전을 배포할 때 기존 프로젝트에서 일하던 agent가 "이 버전에서 무엇을 마이그레이션해야 하는지"를 자동으로 인지할 수 있도록, 버전별 migration instruction layer를 신설한다. `reap update` + SessionStart context 양쪽에서 pending migration을 surface 하고, agent는 처리 후 `reap update --mark-migrated`로 완료 시그널을 보낸다.

본 generation 완료 시:
- `src/templates/migration/v0.17.1.md` 가 첫 migration note로 존재 (gen-070의 vision memory 재분류 dogfooding)
- 기존 사용자가 v0.17.0 → v0.17.1 npm update 후 `reap update`를 실행하면 이 instruction이 출력됨
- 본 REAP 자체 프로젝트도 `lastMigratedVersion: 0.17.1` 으로 mark되어 self-test 통과

## Completion Criteria

1. `ReapConfig.lastMigratedVersion?: string` 타입 추가, `VALID_CONFIG_FIELDS` 에 포함, `backfillConfig` 가 미설정 시 `"0.0.0"` 으로 backfill.
2. `src/templates/migration/v0.17.1.md` 존재, 본문이 "vision memory content-type 재분류" 지시 포함.
3. `reap update` 출력의 `context.pendingMigrations` 가 gap 있는 버전만 정확히 노출, gap 없으면 빈 배열.
4. `reap update --mark-migrated` 가 `config.yml`의 `lastMigratedVersion` 을 현재 패키지 버전으로 갱신, 다음 `reap update`에서 gap 0 확인.
5. SessionStart (`reap load-context`) + sync dump (`reap dump-state`) 가 pending migration 있을 때 `# Pending Migrations` 섹션 출력, gap 없으면 섹션 omit (byte-identical guarantee 유지).
6. Unit test: `detectPendingMigrations` (semver gap 계산 + 파일 읽기) 단위 검증.
7. E2E test: `reap update` → `--mark-migrated` 흐름 / SessionStart 주입 / config 영속화.

## Background

backlog (`reap-migration-instruction-layer-...`) 와 학습 단계 분석 참조. 핵심: REAP가 self-evolving (gen-070이 memory 분류 기준을 바꿈) 하면서, **다른 사용자 프로젝트가 그 변경을 어떻게 따라잡아야 하는지** 알려줄 채널이 없었다. reap-guide.md 가이드 갱신만으로는 "기존 artifact를 다시 분류하라"는 행동 지시가 안 닿는다.

## Approach

### 단일 헬퍼 + 두 진입점 공유

migration detection 로직 (`detectPendingMigrations`) 을 `src/core/migration.ts` 신설 모듈에 둔다. 이 헬퍼를:
- `src/cli/commands/update.ts` (CLI)
- `src/cli/commands/load-context.ts` (SessionStart async)
- `src/core/dump-state-sync.ts` (lifecycle sync dump)

세 caller가 공유. async 한 곳 + sync 두 곳이 byte-identical output을 유지하기 위해, 헬퍼는 **sync 버전**으로 작성 (파일 디스크 읽기뿐이므로 sync로 충분, async 변형 불요). 기존 daemon 패턴 (`buildDaemonStaticSection()`) 과 동일한 sharing 패턴.

### 파일 형식

`src/templates/migration/v{version}.md` 단순 마크다운. `vX.Y.Z` 패턴만 매칭. 본문은 그대로 출력 (가공 없음). 파일명에서 버전 추출 → semver gte 비교.

### CLI 인터페이스

`reap update --mark-migrated` flag. `src/cli/index.ts` 의 update 라우팅에 flag 파싱 추가. update.ts `execute()` 시그니처에 `markMigrated?: boolean` 추가. flag 있을 시 backfillConfig 직후 lastMigratedVersion = currentPackageVersion 저장, pending migration detection은 skip (이미 처리됐다고 선언).

### 자기-참조 self-test

본 generation의 implementation/validation에서 직접 사용:
- v0.17.1.md 생성 → `reap update` 실행 → output에 v0.17.1 instruction 보임 확인
- `reap update --mark-migrated` 실행 → config.yml의 lastMigratedVersion: "0.17.1" 확인
- `reap update` 재실행 → pendingMigrations: [] 확인

## Risk Assessment

| Risk | 평가 | 대응 |
|---|---|---|
| YAML.parse 패턴이 사용자 config의 주석/순서 손상 | 낮음 (기존 backfillConfig 가 이미 같은 패턴 사용) | 기존 패턴 답습. 별도 위험 없음. |
| migration 파일 읽기 실패 시 fail-open | 가능 | try/catch 후 silent skip + console.error에 noticing (lifecycle blocking 금지) |
| dist/dev path 분기 잘못 | 가능 | gen-068 daemon static section과 동일 분기 helper (`migrationTemplatesDir()`) 사용 — 패턴 검증됨 |
| 사용자가 mark-migrated 안 부르고 무한 재주입 | 의도된 동작 | best-effort 명시. agent prompt에 호출 안내 포함. |
| pendingMigrations 가 lifecycle blocking | 절대 금지 | 어떤 경우에도 `reap update`/`load-context`가 error로 종료되지 않음. detection 실패 = 빈 배열. |

## Scope

### 포함 (본 generation에서 변경)
- `src/types/index.ts` — `ReapConfig.lastMigratedVersion?` 필드
- `src/core/migration.ts` — 신규 모듈 (`detectPendingMigrations`, `migrationTemplatesDir`, `buildPendingMigrationsSection`, semverGt 헬퍼)
- `src/cli/commands/update.ts` — `VALID_CONFIG_FIELDS` 확장 + `CONFIG_DEFAULTS` 에 `lastMigratedVersion: "0.0.0"` + pending migration detection 호출 + `--mark-migrated` 분기 + 출력 context 확장
- `src/cli/commands/load-context.ts` — `buildPendingMigrationsSection` 호출 후 sections에 push
- `src/core/dump-state-sync.ts` — 동일 호출
- `src/cli/index.ts` — `update` 라우팅에 `--mark-migrated` flag 파싱
- `src/templates/migration/v0.17.1.md` — 첫 migration 콘텐츠
- `src/templates/reap-guide.md` — § Migration Instruction Layer 추가 (사용법)
- `.reap/reap-guide.md` + `~/.reap/reap-guide.md` + (자동) `dist/templates/reap-guide.md` — sync
- `tests/unit/migration-detection.test.ts` — 신규 (semver gap, 파일 매칭, missing dir)
- `tests/e2e/update-migration.test.ts` — 신규 (full flow + --mark-migrated + idempotency)

### 제외
- 사용자 프로젝트의 migration 파일 강제 push (npm install로 자동)
- code-level migration 자동 실행 (agent 책임)
- migration history (config의 `lastMigratedVersion` 단일 필드만 — 이력은 git/lineage로)
- `reap update` 가 migration을 실행하지 않음 (안내만)

## Tasks

### Phase 1 — 타입/코어 모듈
- [ ] T001 `src/types/index.ts` — `ReapConfig.lastMigratedVersion?: string` 필드 + 문서 주석 (gen-071, opt-in 안내). 테스트: typecheck.
- [ ] T002 `src/core/migration.ts` — 신규 파일. exports: `migrationTemplatesDir()` (dist/dev 분기), `parseVersionFromFilename(name): string | null`, `semverGt(a, b): boolean`, `detectPendingMigrations(paths, currentVersion): { version, instructions }[]`, `buildPendingMigrationsSection(paths, config, currentVersion): string | null`. 테스트: unit (T011).

### Phase 2 — update.ts 통합
- [ ] T003 `src/cli/commands/update.ts` — `VALID_CONFIG_FIELDS` 에 `lastMigratedVersion` 추가, `CONFIG_DEFAULTS` 에 `lastMigratedVersion: "0.0.0"` 추가. backfillConfig 자동으로 신규 필드 backfill. 테스트: typecheck + unit가 backfill 검증.
- [ ] T004 `src/cli/commands/update.ts` — `execute(phase?, postUpgrade?, markMigrated?)` 시그니처 확장. `markMigrated === true` 분기에서 config의 `lastMigratedVersion` 을 `getPackageVersion()` 결과로 set + write + OK emit + return. 테스트: e2e (T012).
- [ ] T005 `src/cli/commands/update.ts` — 정상 흐름 (markMigrated 미설정) 에 `detectPendingMigrations(paths, getPackageVersion())` 호출 → `context.pendingMigrations` 노출 + message에 count 안내 + agent 호출 가이드 (`Run: reap update --mark-migrated`). 테스트: e2e (T012).

### Phase 3 — SessionStart 통합
- [ ] T006 `src/cli/commands/load-context.ts` — `buildPendingMigrationsSection` import + sections 마지막에 push (gap 있을 때만). 테스트: e2e (T013).
- [ ] T007 `src/core/dump-state-sync.ts` — 동일 헬퍼 import + push. async/sync byte-identical 유지 확인. 테스트: unit (기존 byte-identical 테스트 확장 또는 신규).

### Phase 4 — CLI flag 파싱
- [ ] T008 `src/cli/index.ts` — `update` 라우팅에 `--mark-migrated` flag 파싱 추가, execute에 전달. 기존 `--post-upgrade` 옵션과 같은 패턴. 테스트: e2e (T012).

### Phase 5 — Migration content + guide sync
- [ ] T009 `src/templates/migration/v0.17.1.md` — 신규. 가이드 구조: What changed / Required actions for AI agent / Reference. gen-070의 vision memory content-type 재분류 지시.
- [ ] T010 `src/templates/reap-guide.md` — § Migration Instruction Layer 절 추가 (사용법, --mark-migrated, idempotency 설명). `.reap/reap-guide.md` + `~/.reap/reap-guide.md` 동기 (build.sh가 dist/templates도 자동 sync). 테스트: 수동 grep으로 4 위치 일치 확인.

### Phase 6 — 테스트
- [ ] T011 `tests/unit/migration-detection.test.ts` — `parseVersionFromFilename`, `semverGt`, `detectPendingMigrations` (없는 디렉토리, 파일 없음, lastMigratedVersion < currentVersion 일 때 매칭, 같을 때 빈 배열). bun:test.
- [ ] T012 `tests/e2e/update-migration.test.ts` — sandbox project: `reap init` → 가짜 migration 파일 배치 → `reap update` 출력에 pendingMigrations 확인 → `reap update --mark-migrated` → config의 lastMigratedVersion 확인 → 재실행 시 빈 배열. bun:test.
- [ ] T013 `tests/e2e/update-migration.test.ts` 동일 파일에서 `reap load-context` (or `reap dump-state --stdout`) 의 # Pending Migrations 섹션 노출 확인. gap 없을 때 섹션 omit 확인.

### Phase 7 — Self-test
- [ ] T014 본 REAP 프로젝트에서 `npm run build` 후 `reap update` 실행 → v0.17.1 instruction 보임 확인. `reap update --mark-migrated` 후 `.reap/config.yml` 의 `lastMigratedVersion: 0.17.1` 확인. 재실행 시 pendingMigrations 빈 배열 확인. 본 generation의 dogfooding 완료. 테스트: 수동 (validation에서 검증).

## Dependencies

- T001 → T002 → T003 → T004,T005
- T002 → T006, T007
- T004,T005 → T008
- T002 → T011
- T004,T005,T008 → T012
- T006,T007 → T013
- T009 → T014 (콘텐츠 있어야 self-test 가능)
- T010: 다른 task와 독립 (가이드 문서)

## Additional Findings

(없음 — learning에서 이미 충분히 파악)

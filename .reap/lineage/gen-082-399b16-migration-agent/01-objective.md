# Objective

## Goal

Migration Agent — `reap update` 후 `.reap/` 프로젝트 파일을 자동 마이그레이션하는 시스템 구축. `config.yml` version을 실제 REAP 버전으로 관리.

## Completion Criteria

1. `reap init` 시 `config.yml`의 `version`에 실제 REAP 패키지 버전이 기록됨
2. `reap update` 실행 시 `config.yml` version과 현재 패키지 버전을 비교하여 필요한 migration을 자동 실행
3. migration registry 패턴으로 버전별 migration 함수를 등록/실행할 수 있음
4. 기존 `migration.ts`의 lineage migration이 새 registry에 통합됨
5. migration 실행 결과가 유저에게 보고됨
6. dry-run 지원
7. E2E 테스트 통과

## Requirements

### Functional Requirements

- FR1: `config.yml`의 `version` 필드에 REAP 패키지 버전(`__REAP_VERSION__`) 기록
- FR2: `reap init` 시 현재 패키지 버전으로 config.version 설정
- FR3: `reap update` 시 config.version < 패키지 버전이면 해당 범위의 migration 순차 실행
- FR4: migration registry — 각 migration은 `{ fromVersion, toVersion, check, up }` 인터페이스
- FR5: 기존 lineage migration (`migration.ts`)을 registry의 `0.0.0 → 0.9.0` migration으로 통합
- FR6: migration 완료 후 config.version을 현재 패키지 버전으로 갱신
- FR7: dry-run 모드 — 변경 없이 "이런 migration이 실행됩니다" 보고
- FR8: 이미 최신 버전이면 migration 스킵

### Non-Functional Requirements

- NFR1: migration은 멱등해야 함 (같은 migration 재실행 시 안전)
- NFR2: 개별 migration 실패 시 에러 보고 후 중단 (partial migration 허용하지 않음)
- NFR3: 기존 `reap update` CLI 인터페이스 유지 (breaking change 없음)

## Design

### Approaches Considered

| Aspect | A: Registry 패턴 | B: 단일 함수 체인 |
|--------|------------------|-------------------|
| Summary | 버전별 migration 파일을 registry에 등록, semver 범위로 실행 | migration.ts에 if-else로 버전별 분기 |
| Pros | 확장 용이, 각 migration 독립적, 테스트 용이 | 구현 단순, 파일 수 적음 |
| Cons | 초기 구조 비용 | 스파게티화 위험, 테스트 어려움 |
| Recommendation | **선택** | |

### Selected Design

**Registry 패턴**

```
src/core/migrations/
├── index.ts              # MigrationRunner: registry + 실행 엔진
├── types.ts              # Migration 인터페이스
├── 0.0.0-to-0.10.0.ts    # 기존 lineage migration 통합
└── (향후 버전별 추가)
```

**핵심 흐름:**
1. `update.ts`의 `updateProject()` 끝에서 `MigrationRunner.run(projectPath, dryRun)` 호출
2. Runner가 `config.yml` version 읽기 → 현재 패키지 버전과 비교
3. 해당 범위의 migration들을 semver 순서로 실행
4. 완료 후 `config.yml` version 갱신

**version 관리:**
- `init.ts`: `version: "0.1.0"` → `version: process.env.__REAP_VERSION__`로 변경
- 기존 프로젝트: `version: "0.1.0"` → migration agent가 `0.0.0`으로 취급 (모든 migration 실행)

### Design Approval History

- Autonomous evolve: registry 패턴 선택 (확장성 + 테스트 용이성)

## Scope
- **Related Genome Areas**: constraints.md (CLI Subcommands), conventions.md (Testing Conventions)
- **Expected Change Scope**: `src/core/migrations/`, `src/cli/commands/update.ts`, `src/cli/commands/init.ts`, `src/core/config.ts`, `src/types/index.ts`
- **Exclusions**: CLI subcommand 추가 없음, config.yml 스키마의 다른 필드 변경 없음

## Genome Reference

- ADR-009: Node.js 호환 빌드 — `__REAP_VERSION__` 빌드 타임 주입
- conventions.md: E2E 테스트 필수, 1 generation = 1 commit

## Backlog (Genome Modifications Discovered)
None

## Background

현재 `config.yml`의 `version: "0.1.0"`은 init 때 하드코딩된 의미 없는 값. migration.ts에는 lineage format migration만 존재. 버전 간 `.reap/` 구조 변경을 자동 처리하는 인프라가 없음.

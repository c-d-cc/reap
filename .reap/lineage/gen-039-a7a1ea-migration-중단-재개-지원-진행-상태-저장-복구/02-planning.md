# Planning -- gen-039-a7a1ea

## Goal

migration 중단/재개 지원. `reap init --migrate`가 중간에 중단되어도 진행 상태를 `.reap/migration-state.yml`에 저장하고, 재시작 시 중단 지점부터 이어서 진행할 수 있게 한다.

## Completion Criteria

1. `.reap/migration-state.yml`에 현재 phase와 완료된 step 목록이 저장된다
2. execute phase 중단 후 재실행 시 이미 완료된 step을 skip하고 나머지를 진행한다
3. migration 완료(complete phase) 시 state 파일이 삭제된다
4. `reap init --migrate` 실행 시 state 파일이 존재하면 재개 안내 prompt를 반환한다
5. 기존 migration 테스트가 모두 통과한다
6. 중단/재개 시나리오를 검증하는 테스트가 추가된다

## Approach

### State 파일 설계

```yaml
# .reap/migration-state.yml
phase: execute          # 현재 진행 중인 phase
completedSteps:         # 완료된 step 목록
  - backup
  - create-dirs
  - config-migrate
startedAt: 2026-03-27T10:00:00Z
updatedAt: 2026-03-27T10:01:23Z
```

### 멱등성 전략

execute phase의 각 step을 개별 함수로 추출하고, 각 step 실행 전에 `completedSteps`를 체크. 완료 후 state에 step을 추가하고 파일에 저장.

- **backup**: v15 디렉토리 존재 여부로 판단 (이미 있으면 skip)
- **create-dirs**: ensureDir은 이미 멱등적
- **config-migrate**: config.yml에 agentClient 필드 존재 여부로 판단
- **environment-copy, lineage-copy, backlog-copy, hooks-map**: 대상 파일 존재 여부
- **legacy-cleanup**: 이미 삭제된 파일은 skip
- **vision-create, claude-md, reap-guide**: 파일 존재 여부

### 재개 흐름

1. `reap init --migrate` (phase 미지정) 실행 시:
   - migration-state.yml 존재 → resume prompt 반환 (현재 phase, 완료된 steps 표시)
   - 없음 → 기존 confirm 흐름
2. `reap init --migrate --phase execute` 실행 시:
   - migration-state.yml 존재 → completedSteps를 읽고 남은 step만 실행
   - 없음 → 새로 state 생성 후 전체 실행

## Scope

### 변경 파일
- `src/cli/commands/migrate.ts` -- state 저장/로드, step 단위 실행, 재개 로직
- `src/core/paths.ts` -- `migrationState` 경로 추가

### 테스트 파일
- `tests/e2e/migrate.test.ts` -- 중단/재개 테스트 추가

### Out of scope
- MigrationState 별도 타입 정의 (migrate.ts 내 interface로 충분)
- init/common.ts 변경 (migrate만 대상)

## Tasks

- [ ] T001 `src/core/paths.ts` -- ReapPaths에 `migrationState` 경로 추가
- [ ] T002 `src/cli/commands/migrate.ts` -- MigrationState interface 정의 + loadState/saveState/clearState 함수
- [ ] T003 `src/cli/commands/migrate.ts` -- executeMain을 step 단위로 분리, 각 step 전후에 state 저장
- [ ] T004 `src/cli/commands/migrate.ts` -- executePreCheck에 state 파일 감지 + resume prompt 추가
- [ ] T005 `src/cli/commands/migrate.ts` -- executeComplete에서 state 파일 삭제
- [ ] T006 `tests/e2e/migrate.test.ts` -- 중단/재개 테스트: execute 중간 중단 시뮬레이션 후 재실행
- [ ] T007 `tests/e2e/migrate.test.ts` -- resume prompt 테스트: state 파일 존재 시 재개 안내 확인
- [ ] T008 빌드 + 전체 테스트 실행

## Dependencies

T001 → T002 → T003 (순차)
T004, T005는 T002 이후 병렬 가능
T006, T007은 T003~T005 이후
T008은 마지막

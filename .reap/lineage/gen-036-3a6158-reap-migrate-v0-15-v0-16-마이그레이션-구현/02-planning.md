# Planning — gen-036-3a6158

## Goal
v0.15 사용자가 v0.16을 설치했을 때 `reap init --migrate` 또는 `/reap.migrate`로 기존 .reap/ 구조를 v0.16 구조로 안전하게 전환하는 마이그레이션 기능 구현.

## Completion Criteria
1. `reap init --migrate` 명령이 v0.15 .reap/ 구조를 감지하고 multi-phase migration을 수행
2. 기존 .reap/ 내용이 .reap/v15/로 백업됨
3. config.yml이 v0.16 형식으로 변환됨 (제거 필드 5개, 추가 필드 1개)
4. genome 원본 4파일 내용이 JSON prompt에 포함되어 AI 기반 재구성 유도
5. environment, lineage, backlog이 올바른 경로로 복사됨
6. hooks 이벤트명이 자동 매핑됨 (onMergeSynced → onMergeReconciled 등)
7. 모든 v0.16 CLI 명령에서 v0.15 감지 시 migrate 안내 메시지 표시
8. `/reap.migrate` 스킬 파일이 존재
9. e2e 테스트가 v0.15 구조 생성 → migration → 결과 검증 흐름을 커버
10. postinstall에서 v0.15 감지 시 안내 메시지 출력

## Approach
migration-plan.md에 정의된 multi-phase 핑퐁 구조 그대로 구현:
- Phase 1 (pre-check): git clean, v0.15 감지, active gen 확인 → JSON prompt 반환
- Phase 3 (execute): 백업 + 구조 변환 + genome prompt 반환
- Phase 4 (vision): vision interaction 안내 prompt 반환
- v0.15 감지 gate는 `detectV15()` 함수로 추출하여 각 CLI 진입점에 삽입

## Scope

### 신규 파일
- `src/cli/commands/migrate.ts` — migration 핵심 로직
- `src/cli/commands/check-version.ts` — postinstall용 v0.15 감지
- `src/adapters/claude-code/skills/reap.migrate.md` — slash command
- `tests/e2e/migrate.test.ts` — e2e 테스트

### 수정 파일
- `src/cli/index.ts` — `--migrate` 옵션, `check-version` 명령 등록
- `src/cli/commands/init/index.ts` — migrate 분기 추가
- `src/core/integrity.ts` — `detectV15()` 함수 추가
- `src/cli/commands/run/index.ts` — v0.15 gate
- `src/cli/commands/status.ts` — v0.15 gate
- `src/cli/commands/fix.ts` — v0.15 gate
- `src/cli/commands/make.ts` — v0.15 gate
- `src/cli/commands/cruise.ts` — v0.15 gate
- `src/cli/commands/destroy.ts` — v0.15 gate
- `src/cli/commands/clean.ts` — v0.15 gate
- `package.json` — postinstall 확장

### Out of Scope
- genome AI 재구성 로직 (AI가 prompt 기반으로 수행)
- vision goals.md 내용 채우기 (AI + 유저 interaction)
- v0.14 이하 지원
- .reap/v15/ 자동 삭제 (별도 backlog)

## Tasks
- [ ] T001 `src/core/integrity.ts` — `detectV15(paths)` 함수 추가: principles.md 존재 여부로 v0.15 감지
- [ ] T002 `src/cli/commands/migrate.ts` — 신규. Phase 1 (pre-check): git clean, v0.15 감지, active gen 확인, 구조 스캔, JSON prompt 반환
- [ ] T003 `src/cli/commands/migrate.ts` — Phase 3 (execute): 백업, 디렉토리 생성, config 변환, environment/lineage/backlog 복사, hooks 매핑, vision/memory 생성, CLAUDE.md 생성, genome prompt 반환
- [ ] T004 `src/cli/commands/migrate.ts` — Phase 4 (vision): vision interaction 안내 prompt 반환
- [ ] T005 `src/cli/commands/init/index.ts` — `--migrate` 옵션 분기 추가 (migrate execute 호출)
- [ ] T006 `src/cli/index.ts` — `--migrate` 옵션과 `--phase` 옵션을 init 명령에 등록
- [ ] T007 `src/cli/commands/run/index.ts` — v0.15 gate 추가 (detectV15 호출)
- [ ] T008 `src/cli/commands/status.ts` — v0.15 gate 추가
- [ ] T009 `src/cli/commands/fix.ts` — v0.15 gate 추가
- [ ] T010 `src/cli/commands/make.ts` — v0.15 gate 추가
- [ ] T011 `src/cli/commands/cruise.ts` — v0.15 gate 추가
- [ ] T012 `src/cli/commands/destroy.ts` — v0.15 gate 추가
- [ ] T013 `src/cli/commands/clean.ts` — v0.15 gate 추가
- [ ] T014 `src/cli/commands/check-version.ts` — 신규. postinstall용 v0.15 감지 + 안내 메시지
- [ ] T015 `package.json` — postinstall에 check-version 추가
- [ ] T016 `src/adapters/claude-code/skills/reap.migrate.md` — 신규. 1줄 CLI 호출 스킬
- [ ] T017 `tests/e2e/migrate.test.ts` — 신규. v0.15 구조 생성 → migration → 검증 테스트
- [ ] T018 빌드 및 전체 테스트 검증 — `npm run build && bun test tests/e2e/migrate.test.ts`

## Dependencies
- T001 먼저 (T007~T013, T002~T004에서 사용)
- T002~T004 순차 (같은 파일)
- T005~T006 순차 (init에서 migrate 호출)
- T007~T013 병렬 (각각 독립)
- T014~T015 순차
- T017은 T001~T016 완료 후
- T018은 마지막

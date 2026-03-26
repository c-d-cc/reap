# Implementation Log — gen-036-3a6158

## Completed Tasks

### T001: `src/core/integrity.ts` — detectV15() 함수 추가
- `detectV15(paths)` 함수: `fileExists(join(paths.genome, "principles.md"))` 기반 v0.15 감지
- 기존 integrity.ts에 추가하여 일관성 유지

### T002~T004: `src/cli/commands/migrate.ts` — 핵심 migration 로직 (신규 파일, ~400 lines)
- **Phase 1 (pre-check)**: git clean 확인, v0.15 감지, active gen 확인, v15 백업 존재 확인, 구조 스캔 → JSON prompt 반환
- **Phase 3 (execute)**: .reap/v15/로 백업(rename), 새 디렉토리 생성, config 변환(5 필드 제거 + agentClient 추가), environment/lineage/backlog 복사, hooks 이벤트명 자동 매핑, vision/memory 생성, CLAUDE.md 생성, genome 원본 포함 AI prompt 반환
- **Phase 4 (vision)**: vision interaction 안내 prompt 반환
- **Phase 5 (complete)**: 결과 요약 JSON 반환
- Hook mapping: onMergeSynced→onMergeReconciled, onLifeObjected→onLifeLearned(기본), passthrough 이벤트 목록

### T005: `src/cli/commands/init/index.ts` — migrate 분기 추가
- execute() 시그니처에 migrate, phase 파라미터 추가
- migrate 분기에서 migrateExecute(paths, phase) 호출

### T006: `src/cli/index.ts` — CLI 옵션 등록
- init 명령에 `--migrate`, `--phase` 옵션 추가
- `check-version` 명령 등록

### T007~T013: v0.15 gate 추가 (7개 파일)
- run/index.ts, status.ts, fix.ts, make.ts, cruise.ts, destroy.ts, clean.ts
- 각 진입점에서 detectV15() 호출 → emitError로 `/reap.migrate` 안내

### T014: `src/cli/commands/check-version.ts` — postinstall용 v0.15 감지 (신규)
- .reap/genome/principles.md 존재 시 경고 메시지 출력 (plain text, JSON 아님)
- 비-reap 프로젝트는 silent exit

### T015: `package.json` — postinstall 확장
- `check-version` 명령 추가: `node dist/cli/index.js check-version 2>/dev/null || true`

### T016: `src/adapters/claude-code/skills/reap.migrate.md` — slash command 스킬 (신규)
- 1줄 CLI 호출: `reap init --migrate`

### T017: `tests/e2e/migrate.test.ts` — e2e 테스트 (신규, 20 tests)
- v0.15 구조 생성 helper 함수 (`createV15Structure`)
- pre-check 테스트: v0.15 감지, 비-reap 에러, v0.16 에러, active gen 에러
- execute 테스트: 백업 확인, config 변환, 디렉토리 구조, environment 복사, source-map 이동, domain 복사, lineage/backlog 복사, hooks 매핑, vision 파일 생성
- v0.15 gate 테스트: status/run 명령에서 v0.15 에러
- complete 테스트: 결과 요약

### T018: 빌드 + 전체 테스트 검증
- 빌드 성공 (0.46 MB bundle)
- 206 unit tests + 124 e2e tests = 330 tests 전부 통과

## Architecture Decisions
- **migrate.ts를 별도 파일로 분리**: init/index.ts 내부가 아닌 별도 커맨드 파일로 구현. init 시그니처 변경 최소화, migrate 로직의 독립성 확보.
- **rename으로 백업**: cp + rm 대신 rename(mv) 사용. 파일 시스템 내 atomic 연산으로 안전성 확보.
- **Hook mapping 로직을 migrate.ts에 인라인**: 별도 모듈로 추출하지 않음 — migration은 1회성 기능이므로 분리 불필요.

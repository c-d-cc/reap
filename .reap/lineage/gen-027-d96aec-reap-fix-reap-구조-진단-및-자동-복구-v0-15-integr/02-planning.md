# REAP MANAGED — DO NOT EDIT MANUALLY

# Planning — gen-027-d96aec

## Goal
`reap fix` CLI 명령 구현 — `.reap/` 디렉토리 구조 진단 및 자동 복구.
v0.15 integrity.ts를 v16 구조에 맞게 포팅.

## Completion Criteria
1. `reap fix --check` 실행 시 `.reap/` 구조의 errors/warnings를 JSON으로 출력 (수정 없음)
2. `reap fix` 실행 시 자동 복구 가능한 항목을 수정하고 결과를 JSON으로 출력
3. 디렉토리 구조 검증 (genome/, environment/, life/, lineage/, vision/, hooks/)
4. config.yml 유효성 검증 (v16 필드: project, language 등)
5. current.yml 검증 (활성 generation 존재 시)
6. lineage 엔트리 검증 (meta.yml, frontmatter)
7. genome 파일 검증 (application.md, evolution.md, invariants.md)
8. backlog 항목 검증 (frontmatter format)
9. Unit test 통과
10. E2E test 통과

## Approach
v15 integrity.ts의 구조를 그대로 따르되, v16의 차이점을 반영:
- `checkIntegrity()` — read-only 진단 함수 (core 모듈)
- `checkUserLevelArtifacts()` — 사용자 레벨 레거시 파일 감지
- `fixProject()` — 자동 복구 (누락 디렉토리 생성, 손상 파일 리셋)
- `checkProject()` — check-only 모드 wrapper
- CLI handler에서 `--check` 옵션에 따라 분기

## Scope
### In Scope
- `src/core/integrity.ts` — 신규
- `src/cli/commands/fix.ts` — 신규
- `src/cli/index.ts` — fix 명령 등록
- `tests/unit/integrity.test.ts` — 신규
- `tests/e2e/fix.test.ts` — 신규

### Out of Scope
- genome 파일 템플릿 복원 (init에서 이미 처리)
- hooks/conditions/ 자동 생성 (hooks.ts에서 필요 시 처리)
- artifact 검증 (v15에 있었으나, 현재 stage에 따른 artifact 유무는 복잡도가 높아 후속 작업으로)

## Tasks
- [ ] T001 `src/core/integrity.ts` — IntegrityResult 타입 + checkIntegrity() 구현 (디렉토리 구조, config, current.yml, lineage, genome, backlog 검증)
- [ ] T002 `src/core/integrity.ts` — checkUserLevelArtifacts() 구현 (레거시 파일 감지)
- [ ] T003 `src/cli/commands/fix.ts` — checkProject(), fixProject(), execute() 구현
- [ ] T004 `src/cli/index.ts` — `reap fix` 명령 등록 (`--check` 옵션 포함)
- [ ] T005 `npm run build` — 빌드 및 typecheck 통과 확인
- [ ] T006 `tests/unit/integrity.test.ts` — checkIntegrity 단위 테스트
- [ ] T007 `tests/e2e/fix.test.ts` — reap fix / reap fix --check E2E 테스트
- [ ] T008 전체 테스트 실행 및 기존 테스트 회귀 확인

## Dependencies
T001 → T002 → T003 → T004 → T005 → T006, T007 (병렬) → T008

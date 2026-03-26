# REAP MANAGED — DO NOT EDIT MANUALLY

# Validation Report — gen-027-d96aec

## Result
pass

## Checks

### Build & Typecheck
- [x] `npm run build` — 성공 (bundle 0.42MB)
- [x] `npm run typecheck` — tsc --noEmit 통과

### Tests
- [x] Unit tests: 148 pass (기존 126 + 신규 integrity 22)
- [x] E2E tests: 84 pass (기존 78 + 신규 fix 6)
- [x] 전체: 232 tests, 0 fail

### Completion Criteria
1. [x] `reap fix --check` — JSON으로 errors/warnings 출력, 수정 없음
2. [x] `reap fix` — 자동 복구 후 결과 JSON 출력
3. [x] 디렉토리 구조 검증 (genome/, environment/, life/, lineage/, vision/, hooks/)
4. [x] config.yml 유효성 검증 (project 필수, language/strict/autoUpdate 등 타입 체크)
5. [x] current.yml 검증 (id, goal, stage, type, parents)
6. [x] lineage 엔트리 검증 (meta.yml, frontmatter, timeline)
7. [x] genome 파일 검증 (application.md, evolution.md, invariants.md)
8. [x] backlog 항목 검증 (frontmatter type/status/consumedBy)
9. [x] Unit tests 통과
10. [x] E2E tests 통과

### Manual Verification
- [x] 실제 프로젝트에서 `reap fix --check` 실행 — 0 errors, 19 warnings (레거시 파일)
- [x] 실제 프로젝트에서 `reap fix` 실행 — 0 issues, 0 fixed

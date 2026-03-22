# REAP MANAGED — Do not modify directly. Use reap run commands.
# Validation Report

## Result: pass

## Completion Criteria Check
| Criterion | Result | Notes |
|-----------|--------|-------|
| 1. src/core/integrity.ts 존재 + checkIntegrity export | pass | 신규 생성, IntegrityResult 타입 포함 |
| 2. config.yml 필수 필드 검증 | pass | project, entryMode, 타입 검증 구현 |
| 3. current.yml 필수 필드 검증 | pass | id, goal, stage, genomeVersion, startedAt, timeline, type, parents 검증 |
| 4. lineage 구조 검증 | pass | meta.yml 존재, 필수 필드, completedAt ISO, parents 참조, 압축 .md frontmatter |
| 5. genome L1 파일 존재 + 경고 | pass | 존재 검증, ~100줄 초과 경고, placeholder 감지 |
| 6. backlog frontmatter 검증 | pass | type/status 필수, 유효값, consumed→consumedBy |
| 7. artifact 구조 검증 | pass | 이전 stage artifact 존재, REAP MANAGED 헤더 |
| 8. reap fix --check CLI | pass | 실제 실행 확인 (errors/warnings 정상 출력) |
| 9. onLifeCompleted hook 설치 | pass | 템플릿 생성, init.ts 설치 로직 추가 |
| 10. bun test + tsc 통과 | pass | 600 tests pass, tsc 0 errors |

## Test Results

### Type Check (bunx tsc --noEmit)
- Exit code: 0
- No errors

### Unit Tests (bun test)
- 600 pass, 0 fail
- 2115 expect() calls
- 61 test files
- Duration: 5.90s

### CLI Test (bun src/cli/index.ts fix --check)
- Exit code: 1 (정상 — 실제 프로젝트에 1개 error 존재)
- Error 출력: lineage/gen-057-0c8c9d-e2e-테스트-대폭-보강: missing meta.yml
- Warning 출력: genome/source-map.md: 127 lines (exceeds ~100 line guideline)
- 정상 동작 확인

## Deferred Items
None

## Minor Fixes (Fixed Directly in This Stage)
| File | Change | Reason |
|------|--------|--------|

## Issues Discovered
None

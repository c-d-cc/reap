# Implementation Log

## Completed Tasks

| Task | File | Description |
|------|------|-------------|
| T001 | `src/core/paths.ts` | ReapPaths 인터페이스에 `environmentResources`, `environmentDocs` 추가. createPaths에서 `join(environment, "resources")`, `join(environment, "docs")` 경로 생성. |
| T002 | `src/cli/commands/init/common.ts` | initCommon에서 `ensureDir(paths.environmentResources)`, `ensureDir(paths.environmentDocs)` 추가. environmentDomain 바로 아래에 배치. |
| T003 | `src/cli/commands/migrate.ts` | environment-copy step에 v0.15 resources/, docs/ 디렉토리 복사 로직 추가. create-dirs step에도 새 디렉토리 생성 추가. |
| T004 | `src/core/integrity.ts` | checkDirectoryStructure의 optionalDirs에 environmentResources, environmentDocs 추가. |
| T005 | `src/templates/reap-guide.md` | .reap/ Structure 섹션에 resources/, docs/ 항목 추가 (on-demand 표기). |
| T006 | `.reap/reap-guide.md` | 프로젝트 로컬 복사본도 동일하게 업데이트. |
| T007 | build + test | 빌드 및 테스트 실행. |

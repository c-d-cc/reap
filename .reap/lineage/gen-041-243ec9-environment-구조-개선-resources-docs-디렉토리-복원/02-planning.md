# Planning

## Goal

environment 구조에 resources/, docs/ 디렉토리를 추가하여 외부 문서(API docs, SDK 스펙 등)와 참고 문서를 저장할 공간을 확보. init/migration/integrity/reap-guide 전체에 반영.

## Completion Criteria

1. `createPaths()`가 `environmentResources`, `environmentDocs` 경로를 반환
2. `reap init`이 `environment/resources/`, `environment/docs/` 디렉토리를 생성
3. `reap init --migrate --phase execute`가 v0.15의 `environment/resources/`, `environment/docs/`를 v0.16으로 복사 (존재할 경우)
4. integrity check에서 resources/, docs/가 optional dirs로 검증됨
5. reap-guide.md의 `.reap/ Structure` 섹션에 resources/, docs/ 포함
6. 기존 테스트 전체 통과 + 새 테스트 추가
7. `npm run build` 성공

## Scope

변경 파일:
- `src/core/paths.ts` -- 경로 추가
- `src/cli/commands/init/common.ts` -- 디렉토리 생성
- `src/cli/commands/migrate.ts` -- 복사 로직
- `src/core/integrity.ts` -- optional dirs 추가
- `src/templates/reap-guide.md` -- 구조 설명
- `.reap/reap-guide.md` -- 프로젝트 로컬 복사본 (embryo)

범위 밖:
- docs/ 페이지 (EnvironmentPage.tsx, i18n) -- 별도 generation
- prompt.ts 수정 (온디맨드 로딩이라 summary.md에서 언급만 하면 됨)

## Tasks

- [ ] T001 `src/core/paths.ts` -- ReapPaths 인터페이스에 environmentResources, environmentDocs 추가 + createPaths에서 경로 생성
- [ ] T002 `src/cli/commands/init/common.ts` -- initCommon에서 resources/, docs/ 디렉토리 생성
- [ ] T003 `src/cli/commands/migrate.ts` -- executeMain의 environment-copy step에 resources/docs 복사 로직 추가
- [ ] T004 `src/core/integrity.ts` -- checkDirectoryStructure의 optionalDirs에 resources/, docs/ 추가
- [ ] T005 `src/templates/reap-guide.md` -- .reap/ Structure 섹션에 resources/, docs/ 추가
- [ ] T006 `.reap/reap-guide.md` -- 프로젝트 로컬 복사본도 동일하게 업데이트
- [ ] T007 빌드 (`npm run build`) + 전체 테스트 (`npm test`)

## Dependencies

T001 먼저 (paths가 다른 파일에서 참조됨) -> T002, T003, T004 병렬 가능 -> T005, T006 병렬 가능 -> T007 마지막.

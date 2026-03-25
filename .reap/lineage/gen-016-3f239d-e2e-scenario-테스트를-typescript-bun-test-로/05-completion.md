# Completion — gen-016-3f239d

## Summary

e2e 7개, scenario 4개 bash 테스트를 TypeScript(bun:test)로 전환 완료. 공통 setup helper(`tests/helpers/setup.ts`)를 도입하여 테스트 작성 간소화. 기존 .sh 파일 15개 삭제, package.json scripts 업데이트.

### Changes
- tests/helpers/setup.ts: 공통 헬퍼 (cli, setupProject, setupGitProject, advanceStage, completeGeneration 등)
- tests/e2e/: 7개 .test.ts (63 tests, 119 assertions)
- tests/scenario/: 4개 .test.ts (41 tests, 68 assertions)
- package.json: test:e2e, test:scenario → bun test 기반
- 15개 .sh 파일 삭제 (7 e2e + run.sh, 4 scenario + run.sh)

### Validation: PASS (typecheck, build, unit 55/55, e2e 63/63, scenario 41/41 = 159 tests)

## Lessons Learned

- `Bun.$` shell literal는 non-zero exit에서 throw하므로 exit code 검사 시 try/catch 필요. `cliExitCode()` 헬퍼로 추상화.
- CLI JSON 출력의 필드 위치가 일관적이지 않음 (init은 `context.mode`, status는 `context.generation.stage`). bash에서는 grep으로 무시되던 부분이 TypeScript에서는 정확한 경로가 필요해서 실제 출력 구조 확인이 필수였음.
- `advanceStage()`와 `completeGeneration()` 헬퍼 도입으로 scenario 테스트(lifecycle, multi-gen)의 코드량이 bash 대비 크게 감소.
- bun:test 파일 단위 병렬 실행으로 e2e 11개 파일이 약 2.4초에 완료. bash 순차 실행 대비 체감 속도 대폭 향상.

## Next Generation Hints

- tests/ submodule 커밋 + 푸시 필요
- CLI JSON 출력 필드 구조 일관성 개선 여지 (mode, stage 등의 top-level vs nested 위치)
- 새 기능 추가 시 tests/helpers/setup.ts의 헬퍼를 활용하면 테스트 작성이 간편

# Completion — gen-026-4e8861

## Summary

`reap init --repair` 옵션을 추가하여 기존 reap 프로젝트에 CLAUDE.md를 자동 보충하는 기능을 구현.

### Changes
- `src/cli/commands/init/common.ts` — CLAUDE.md 처리 로직을 `ensureClaudeMd()` 함수로 추출 (initCommon과 repair에서 공유)
- `src/cli/commands/init/repair.ts` — 신규. repair 로직 (config 읽기 → CLAUDE.md 보충 → JSON 결과)
- `src/cli/commands/init/index.ts` — `--repair` 분기 추가
- `src/cli/index.ts` — `--repair` 옵션 등록
- `tests/e2e/init-repair.test.ts` — 6개 e2e 테스트

### Test Results
- 245 tests 전체 통과 (unit 126 + e2e 78 + scenario 41)

## Lessons Learned

- 기존 코드에 이미 CLAUDE.md 처리 로직이 있어서, 별도 함수로 추출만 하면 재사용이 쉬웠음. `getClaudeMdSection()`도 이미 export되어 있었음.
- repair 패턴은 확장 가능: 향후 다른 누락 파일(evolution.md 등)도 repair 대상에 추가할 수 있는 구조.
- `ensureClaudeMd()`가 반환값으로 액션("created", "appended", "skipped")을 돌려주도록 설계하여, 호출자가 결과를 리포팅할 수 있게 함.

## Next Generation Hints

- repair가 현재 CLAUDE.md만 처리. 향후 evolution.md 템플릿 업데이트, config 마이그레이션 등도 repair 대상으로 확장 가능.
- postinstall에서 자동 repair를 실행하는 것은 cwd 문제가 있어 보류. 사용자가 명시적으로 `reap init --repair`를 실행하는 방식이 더 안전.

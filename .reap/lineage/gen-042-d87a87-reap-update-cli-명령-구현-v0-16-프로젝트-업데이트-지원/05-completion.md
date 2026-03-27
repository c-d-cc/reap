# Completion -- gen-042-d87a87

## Summary

`reap update` CLI 명령을 구현했다. v0.15 프로젝트는 기존 migrate로 위임하고, v0.16 프로젝트는 config 누락 필드 backfill, 디렉토리 보충, CLAUDE.md 보수를 수행한다.

### 주요 변경
- `src/cli/commands/update.ts`: 신규. v0.15/v0.16 분기 + 동기화 로직
- `src/cli/index.ts`: `reap update` 명령 라우팅 추가
- `src/adapters/claude-code/skills/reap.update.md`: `reap update` 호출로 변경
- `tests/e2e/update.test.ts`: 5개 e2e 테스트

테스트: 411 pass (기존 406 + 신규 5)

## Lessons Learned

- update 명령은 initCommon()을 재사용하지 않고, 필요한 부분만 개별 호출했다. initCommon()은 config 덮어쓰기 + 기본 파일 전체 작성을 하므로 기존 데이터를 보존해야 하는 update에는 부적합.
- ensureDir은 idempotent하므로 디렉토리 존재 여부를 확인할 필요 없이 호출 가능하지만, "무엇이 변경되었는지" 보고하려면 사전 존재 여부 확인이 필요.

## Next Generation Hints

- `reap update`를 postinstall에서 자동 실행하면 npm install만으로 프로젝트 동기화 완료 가능 (현재는 수동 실행 필요)
- environment/summary.md에 `update` 명령 설명 추가 필요 (이번 reflect에서 수행)

# Completion — gen-021-82a4a0

## Summary

v15의 hook-engine 고급 기능을 v16에 포팅 완료. `src/core/hooks.ts`를 전면 교체하여 조건부 실행, 순서 제어, 상세 결과 추적을 지원하도록 개선.

### Changes
- `src/types/index.ts`: `HookResult` (9 fields), `ReapHookEvent` (14 events) 타입 추가
- `src/core/hooks.ts`: `runHooks()` → `executeHooks()`로 전면 교체 (61줄 → 185줄)
  - 조건부 실행: `conditions/` 하위 .sh 스크립트 기반
  - 순서 제어: `order` 메타데이터 (기본값 50)
  - 메타데이터 파싱: .md YAML frontmatter, .sh 주석 헤더
  - 상세 결과: status(executed/skipped), exitCode, stdout, stderr, content, skipReason
- `src/core/stage-transition.ts`, `src/cli/commands/run/completion.ts`, `src/cli/commands/run/start.ts`: import/호출 변경
- `tests/unit/hooks.test.ts`: 13개 unit test 신규 작성

### Test Results
- 195 tests 전체 통과 (unit 82 + e2e 72 + scenario 41)

## Lessons Learned

- v15 코드가 잘 구조화되어 있어서 포팅이 원활했음. 명확한 함수 분리(scanHooks, parseHookMeta, evaluateCondition, executeShHook, executeMdHook)가 테스트 작성도 용이하게 만듦.
- v16의 모든 호출부에서 hook 결과를 무시(catch 무시)하므로 API 변경이 안전했음. 향후 hook 결과를 CLI output에 포함시키면 디버깅에 유용할 것.

## Next Generation Hints

- hook 결과를 CLI output context에 포함시키는 기능을 고려 (현재는 결과가 무시됨)
- `onLifeLearned` 이벤트가 stage-transition.ts의 STAGE_EVENTS에 정의되어 있지만, 실제 hook 파일 작성 가이드가 없음

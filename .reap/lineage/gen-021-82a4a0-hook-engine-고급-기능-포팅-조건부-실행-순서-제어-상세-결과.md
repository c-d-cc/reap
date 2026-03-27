---
id: gen-021-82a4a0
type: embryo
goal: "hook-engine 고급 기능 포팅 (조건부 실행, 순서 제어, 상세 결과)"
parents: ["gen-020-bf05c1"]
---
# gen-021-82a4a0
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
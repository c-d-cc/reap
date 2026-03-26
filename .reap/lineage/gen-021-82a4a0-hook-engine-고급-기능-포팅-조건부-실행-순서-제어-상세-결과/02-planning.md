# Planning — gen-021-82a4a0

## Goal
v15의 hook-engine 고급 기능을 v16에 포팅하여 조건부 실행, 순서 제어, 상세 결과 추적을 지원한다.

## Completion Criteria
1. `executeHooks()` 함수가 `conditions/` 디렉토리의 .sh 스크립트를 사용한 조건부 실행을 지원한다
2. hook 메타데이터의 `order` 필드(기본값 50)로 실행 순서를 제어한다
3. .md 파일은 YAML frontmatter, .sh 파일은 주석 헤더에서 메타데이터를 파싱한다
4. `HookResult`가 name, event, type, status, exitCode, stdout, stderr, content, skipReason을 포함한다
5. `ReapHookEvent` 타입이 v16 라이프사이클 이벤트를 정의한다
6. 메타데이터가 없는 hook 파일도 기본값(condition=always, order=50)으로 정상 동작한다
7. 기존 3개 호출부(stage-transition, completion, start)가 새 API로 전환된다
8. 빌드 성공 및 기존 테스트 통과
9. hook-engine unit test 추가

## Approach
v15의 `hook-engine.ts`를 v16 코드베이스에 맞게 포팅. v15 코드를 거의 그대로 사용하되, v16의 import 경로와 이벤트 이름만 조정.

## Scope
### In Scope
- `src/types/index.ts` — HookResult, ReapHookEvent 타입 추가
- `src/core/hooks.ts` — hook-engine 로직으로 전면 교체
- `src/core/stage-transition.ts` — import/호출 변경
- `src/cli/commands/run/completion.ts` — import/호출 변경
- `src/cli/commands/run/start.ts` — import/호출 변경
- `tests/unit/hooks.test.ts` — hook-engine unit test 추가

### Out of Scope
- hook 실행 결과를 CLI output에 포함시키는 기능 (향후 별도 작업)

## Tasks
- [ ] T001 `src/types/index.ts` — HookResult, ReapHookEvent 타입 추가
- [ ] T002 `src/core/hooks.ts` — v15 hook-engine 로직으로 전면 교체 (executeHooks, scanHooks, parseHookMeta, evaluateCondition, executeShHook, executeMdHook)
- [ ] T003 `src/core/stage-transition.ts` — `runHooks` → `executeHooks` import/호출 변경
- [ ] T004 `src/cli/commands/run/completion.ts` — `runHooks` → `executeHooks` import/호출 변경
- [ ] T005 `src/cli/commands/run/start.ts` — `runHooks` → `executeHooks` import/호출 변경
- [ ] T006 빌드 확인 (`npm run build`)
- [ ] T007 `tests/unit/hooks.test.ts` — hook-engine unit test 작성 (scanHooks, parseHookMeta, evaluateCondition, executeHooks 전체 흐름)
- [ ] T008 기존 테스트 실행 확인

## Dependencies
T001 → T002 → T003, T004, T005 (병렬) → T006 → T007 → T008

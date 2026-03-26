---
type: task
status: consumed
consumedBy: gen-021-82a4a0
consumedAt: 2026-03-26T05:03:25.547Z
priority: high
createdAt: 2026-03-26T05:02:48.994Z
---

# hook-engine 고급 기능 포팅 (조건부 실행, 순서 제어, 상세 결과)

## Problem

v16의 `runHooks()`는 단순 파일 매칭 + 실행만 지원. v15의 hook-engine.ts가 제공하던 고급 기능이 빠져있음:
- 조건부 실행 (`.reap/hooks/conditions/` 디렉토리의 .sh 스크립트로 평가)
- 실행 순서 제어 (order 메타데이터, 기본값 50)
- YAML frontmatter (.md) / 주석 (.sh) 기반 메타데이터 파싱
- 상세 결과 추적 (executed/skipped, exitCode, stdout/stderr, skipReason)
- HookResult 타입 확장 (name, event, status 등)
- ReapHookEvent 타입 정의

## Solution

v15의 `hook-engine.ts`를 v16에 포팅:
1. `src/core/hooks.ts`를 v15의 hook-engine.ts 수준으로 교체
2. `src/types/index.ts`에 HookResult, ReapHookEvent 타입 추가
3. 기존 `runHooks()` 호출부를 새 `executeHooks()`로 교체 (stage-transition.ts, completion.ts, start.ts)
4. 기존 테스트 수정 + 신규 테스트 추가

## Files to Change

- `src/core/hooks.ts` — hook-engine 로직으로 교체
- `src/types/index.ts` — HookResult, ReapHookEvent 타입 추가
- `src/core/stage-transition.ts` — runHooks → executeHooks
- `src/cli/commands/run/completion.ts` — runHooks → executeHooks
- `src/cli/commands/run/start.ts` — runHooks → executeHooks
- `tests/unit/` — hook 관련 테스트 추가/수정

## Reference

- v15 소스: `~/cdws/reap_v15/src/core/hook-engine.ts` (185줄)
- v15 타입: `~/cdws/reap_v15/src/types/index.ts` (HookResult, ReapHookEvent)

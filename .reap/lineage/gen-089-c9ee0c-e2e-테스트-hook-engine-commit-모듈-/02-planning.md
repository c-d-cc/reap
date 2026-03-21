# Planning

## Summary
hook-engine + commit 모듈의 E2E 테스트를 구현한다. gen-088에서 deferred된 T-008 시나리오 10개를 `tests/e2e/hook-engine.test.ts`로 작성한다. `executeHooks()` core 함수를 직접 호출하여 검증하며, CLI 통합 시나리오(5, 6, 10)도 core 함수 수준에서 테스트한다.

## Technical Context
- **Tech Stack**: TypeScript 5.x, bun:test, Node.js >=18
- **테스트 대상**: `src/core/hook-engine.ts`의 `executeHooks()`
- **Constraints**: `process.exit()` 호출하는 CLI 함수 직접 테스트 불가 -> core 함수 테스트로 대체

## Tasks

### T-001: `tests/e2e/hook-engine.test.ts` 작성 — 10개 시나리오

- **설명**: gen-088 Planning T-008에 정의된 10개 시나리오 구현
- **영향 파일**: `tests/e2e/hook-engine.test.ts` (신규)
- **복잡도**: M

**시나리오 목록**:
1. Hook 스캔 — event 매칭 hook 발견
2. Hook condition false -> skip
3. `.md` hook — 내용 반환
4. Hook order 정렬
5. `reap run next` — hookResults in output (core 함수 수준)
6. `reap run start --phase create` — onLifeStarted hook (core 함수 수준)
7. Submodule status 확인 (commit 모듈)
8. 매칭 hook 없는 경우
9. Condition 스크립트 미존재 -> skip
10. `reap run back --phase apply` — onLifeRegretted hook (core 함수 수준)

### T-002: 테스트 전체 통과 확인

- **설명**: `bunx tsc --noEmit`, `npm run build`, `bun test` 전체 통과
- **의존성**: T-001
- **복잡도**: S

## 구현 순서
T-001 -> T-002

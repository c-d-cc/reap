# Shortterm Memory

## 세션 요약 (2026-03-30)

### gen-056: reap update에 SessionStart hook 등록 로직 추가
- `registerSessionHooks()` export 변경 (install.ts)
- `update.ts`에서 v0.16 sync 시 `registerSessionHooks()` 호출 추가
- silent 호출 (updated 배열 미포함) — idempotent + best-effort

### 다음 세션
- Evaluator 코드 통합 (prompt.ts, completion.ts)
- Daemon E2E 테스트 보강
- Pre-existing test failures 수정 (integrity/cleanupLegacyProjectSkills 4건, update/vision-docs 1건)

### Backlog 상태
- `daemon-e2e-tests.md` (task, medium)
- `fix-migrate-update-tests.md` (task, medium)
- `strict-merge-mode-bypass-for-merge-gen.md` (task, medium)

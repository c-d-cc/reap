# Shortterm Memory

## 세션 요약 (2026-03-30)

### gen-058: strict merge mode bypass for merge generation
- `buildStrictSection()`에 `generationType?` 파라미터 추가
- merge generation이면 HARD-GATE 대신 BYPASSED 안내 (git merge 허용, pull/push 계속 제한)
- `prompt.ts` + `load-context.ts` 양쪽 수정, 테스트 6건 추가 (21 pass)

### 다음 세션
- Evaluator 코드 통합 (prompt.ts, completion.ts)
- Pre-existing test failures 수정 (integrity 4건)
- Daemon E2E 테스트 보강

### Backlog 상태
- `daemon-e2e-tests.md` (task, medium)
- `fix-migrate-update-tests.md` (task, medium)
- `strict-merge-mode-bypass-for-merge-gen.md` (task, medium) — gen-058에서 consumed 예정

# Shortterm Memory

## 세션 요약 (2026-03-30)

### gen-053: SessionStart hook for mandatory knowledge loading
- `reap load-context` CLI command 구현 — SessionStart hook으로 REAP knowledge를 Claude Code system context에 자동 주입
- `src/cli/commands/load-context.ts` 신규 생성, `install.ts`에 hook 등록 추가
- CLAUDE.md 간소화 (자동 주입 안내 + manual fallback)
- 8개 unit test 작성, 전체 통과

### 다음 세션
- Evaluator 코드 통합 (prompt.ts, completion.ts — fitness 위임 로직)
- Daemon E2E 테스트 보강 (backlog: daemon-e2e-tests.md)
- Pre-existing test failures 수정 (integrity/cleanupLegacyProjectSkills 4건)

### Backlog 상태
- `daemon-e2e-tests.md` (task) — daemon E2E 테스트 보강 (medium)
- `fix-migrate-update-tests.md` (task) — integrity/migrate/update 관련 pre-existing test failure
- `strict-merge-mode-bypass-for-merge-gen.md` (task) — merge gen에서 strict merge 자동 bypass
- `evolve-subagent-continuation.md` (task) — evolve subagent 반환 후 SendMessage 재개 (high)

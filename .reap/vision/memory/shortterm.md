# Shortterm Memory

## 세션 요약 (2026-03-30)

### gen-059: migrate/update 테스트 8건 수정
- `integrity.ts`: LEGACY_PREFIX_PATTERN -> LEGACY_COMMAND_PATTERN + LEGACY_SKILL_PATTERN 분리 (reapdev.* 지원)
- `migrate.ts`: vision/docs -> vision/design 경로 수정
- `update.test.ts`: vision/docs -> vision/design 경로 수정
- 결과: unit 342 pass, e2e 147 pass, 1 pre-existing failure (init-repair)

### 다음 세션
- `init-repair.test.ts` "skips when REAP section already present" pre-existing failure 수정
- Evaluator 코드 통합 (prompt.ts, completion.ts)
- Daemon E2E 테스트 보강

### Backlog 상태
- `daemon-e2e-tests.md` (task, medium)
- `fix-migrate-update-tests.md` (task, medium) — gen-059에서 consumed
- `strict-merge-mode-bypass-for-merge-gen.md` (task, medium) — gen-058에서 consumed

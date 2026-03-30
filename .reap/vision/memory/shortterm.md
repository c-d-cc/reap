# Shortterm Memory

## 세션 요약 (2026-03-30)

### gen-060: daemon E2E 테스트 보강
- 4개 테스트 파일 신규: incremental, error-cases, worktree-diverge, idle-timeout
- 1개 소스 수정: server.ts에 idleCheckIntervalMs 옵션 추가
- daemon: 130 tests (기존 114 + 신규 16), main unit: 342 pass

### 다음 세션
- `init-repair.test.ts` pre-existing failure 수정
- Evaluator 코드 통합 (prompt.ts, completion.ts)
- API 레벨 incremental indexing 지원 검토

### Backlog 상태
- `daemon-e2e-tests.md` (task, medium) -- gen-060에서 consumed 예정
- `fix-migrate-update-tests.md` -- gen-059에서 consumed
- `strict-merge-mode-bypass-for-merge-gen.md` -- gen-058에서 consumed

# Shortterm Memory

## 세션 요약 (2026-03-30)

### gen-057: update path E2E 테스트 작성
- `tests/e2e/update-path.test.ts` 신규 작성 (5 tests, 전체 pass)
- load-context: REAP 프로젝트 JSON 출력 + 비-REAP silent exit
- update: 레거시 CLAUDE.md -> 마커 교체, 이미 최신이면 skip, 사용자 커스텀 보존
- `cliRaw()`로 load-context raw output 캡처하는 패턴 확립

### 다음 세션
- Evaluator 코드 통합 (prompt.ts, completion.ts)
- Pre-existing test failures 수정 (integrity 4건, update/vision-docs 1건)
- Daemon E2E 테스트 보강

### Backlog 상태
- `daemon-e2e-tests.md` (task, medium)
- `fix-migrate-update-tests.md` (task, medium)
- `strict-merge-mode-bypass-for-merge-gen.md` (task, medium)

# Shortterm Memory

## 세션 요약 (2026-03-30)

### gen-054: CLAUDE.md REAP section template sync
- `ensureClaudeMd()`에 마커 기반 변경 감지/교체 메커니즘 추가
- `<!-- reap:start {hash} -->` / `<!-- reap:end -->` 마커로 REAP 섹션 경계 명시
- SHA256 해시 비교로 템플릿 변경 감지, 불일치 시 자동 교체
- 레거시 하위 호환 (마커 없는 기존 CLAUDE.md도 업그레이드)
- 12개 unit test 추가

### 다음 세션
- Evaluator 코드 통합 (prompt.ts, completion.ts)
- Daemon E2E 테스트 보강
- Pre-existing test failures 수정 (integrity/cleanupLegacyProjectSkills 4건)

### Backlog 상태
- `daemon-e2e-tests.md` (task, medium)
- `fix-migrate-update-tests.md` (task, medium)
- `strict-merge-mode-bypass-for-merge-gen.md` (task, medium)
- `evolve-subagent-continuation.md` (task, high)

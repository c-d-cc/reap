# Shortterm Memory

## 세션 요약 (2026-05-25)

### gen-062: CLAUDE.md `@` reference + load-context 정/동 분리 (Issue #17 해결)

Claude Code native `@` import 메커니즘 활용 + SessionStart hook 출력 dynamic-only 분리.

- 신규: 정/동 분리 패턴 — static 9개(genome×3 + env summary + vision goals + memory×3 + reap-guide)는 CLAUDE.md `@` ref로 Claude Code가 로드, dynamic 3개(Current State + Strict Mode + Language)는 hook이 inject.
- 수정: `src/templates/claude-md-section.md` (Static Knowledge `@` 블록), `src/cli/commands/load-context.ts` (`buildKnowledgeContext()` dynamic-only), unit/e2e 테스트 갱신/추가.
- migration: gen-054 marker-hash sync 로직 활용. template 한 줄도 추가 코드 없이 모든 사용자(plain-path / marker-stale 둘 다) 자동 처리. T9 dog-fooding으로 본 프로젝트 CLAUDE.md도 자동 갱신됨.
- 결과: hook 출력 ~17KB → 1814 bytes(~89% 감소), 정보량 동일(`@` import lazy load). unit 364 / e2e 173 pass (1 pre-existing fail).
- 부가 작업: `.reap/reap-guide.md` 와 `src/templates/reap-guide.md` 동기화(7 line drift 발견 → cp 적용).

### 다음 세션

- **Gen-N+1 권장 source**: `opencode-adapter.md` (pending). 본 generation의 dynamic-only `buildKnowledgeContext()` 가 그대로 `reap dump-state` 기반이 됨. natural follow-up.
- **deferred 후보 4건** (echo chamber 방지로 backlog 자동 등록 안 함, 사용자 판단):
  1. `.reap/reap-guide.md` 자동 sync hook (onLifeCompleted.dogfood-sync.sh 등)
  2. `detectLegacyReapSection` heading-less detection 강화 → init-repair pre-existing fail 해결
  3. `.claude/CLAUDE.md` 와 root `/CLAUDE.md` 공존 시 동작 안내 / 통합 가이드
  4. evaluator agent 코드 통합 (longstanding, gen-061부터 deferred)
- init-repair 1건 failure 는 여전히 pre-existing (gen-060부터).

### Backlog 상태

- `claude-md-knowledge-loading-separation.md` (task, medium) — gen-062에서 **consumed**.
- `opencode-adapter.md` (pending) — **Gen-N+1 source 후보**.
- `daemon-e2e-tests.md` — gen-060 consumed.
- `early-close-lifecycle.md` — gen-061 consumed.
- `fix-migrate-update-tests.md` — gen-059 consumed.
- `strict-merge-mode-bypass-for-merge-gen.md` — gen-058 consumed.

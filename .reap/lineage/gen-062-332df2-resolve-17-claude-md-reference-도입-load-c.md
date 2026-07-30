---
id: gen-062-332df2
type: normal
goal: "resolve #17: CLAUDE.md @ reference 도입 + load-context 정/동 분리 (Claude Code)"
parents: ["gen-061-386e6c"]
---
# gen-062-332df2
Issue #17 해결: CLAUDE.md `@` reference 도입 + load-context 정/동 분리 (Claude Code).

### 변경 내용

수정:
- `src/templates/claude-md-section.md` — "Manual Reference (fallback)" plain-path 블록 → "Static Knowledge (auto-imported)" `@` ref 9개. Knowledge Loading 안내문 정/동 분리 반영. Termination Paths / Agent 절 보존.
- `src/cli/commands/load-context.ts` — `buildKnowledgeContext()` 가 9 static 파일 read를 제거하고 dynamic-only (Current State + Strict Mode + Language) 출력. 시그니처 유지.
- `tests/unit/load-context.test.ts` — 정적 inject 검증 제거, SENTINEL 미포함 + ≤2KB size 검증 신규.
- `tests/e2e/init-claude-md.test.ts` — `@` ref 9개 포함 검증 + legacy 형식 부재 검증 신규.
- `tests/e2e/update.test.ts` — legacy plain-path → `@` ref migration 케이스 2건 신규.
- `.reap/reap-guide.md` — `src/templates/reap-guide.md` 와 동기화.

dog-fooding 자동 적용:
- `/Users/hichoi/cdws/reap/CLAUDE.md` — `node dist/cli/index.js update` 호출로 marker hash `4f4c9ee4` → `e20588a0` 갱신. 9 `@` ref + Termination Paths(gen-061 누락분도 자연 보강) + Agent 절 포함.

### 결과

- 7 completion criteria 모두 충족. 13 backlog verification 항목 모두 충족.
- unit 364 pass (10 신규) / e2e 173 pass + 1 pre-existing fail (init-repair, 본 작업 무관).
- Hook 출력 크기: ~17KB → 1814 bytes (~89% 감소).
- 회귀 0건.
- migration 검증: legacy plain-path + marker-stale 두 케이스 모두 자동 처리, user 커스터마이즈 보존.
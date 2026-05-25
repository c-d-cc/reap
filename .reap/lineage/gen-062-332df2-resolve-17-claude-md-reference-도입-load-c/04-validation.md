# Validation Report

## Result

**pass** (1 pre-existing fail 무관).

## Checks

| 항목 | 결과 | 비고 |
|---|---|---|
| `npm run typecheck` | ✓ pass | tsc --noEmit, 0 errors. |
| `npm run build` | ✓ pass | 144 modules, 0.53MB. dist/cli/index.js + dist/templates/claude-md-section.md 갱신. |
| `bun test tests/unit/` | ✓ pass | 364 pass / 0 fail, 949 expect() calls. |
| `bun test tests/e2e/` | △ 173 pass / **1 pre-existing fail** | init-repair.test.ts:103 "skips when REAP section already present" — gen-060부터 known issue, 본 작업 무관(detectLegacyReapSection 자체 한계: heading 없는 plain mention 검출 불가). |
| `node dist/cli/index.js load-context` (live) | ✓ pass | 출력 1814 bytes (≤ 2KB criterion). Current State + Strict Mode + Language 3 섹션만 포함. static 9 파일 sentinel 없음. |
| `node dist/cli/index.js update` (live dog-fooding) | ✓ pass | `/CLAUDE.md` marker hash `4f4c9ee4` → `e20588a0` 갱신. 9 `@` ref + Termination Paths + Agent 절 모두 포함. 한국어 인트로 line + marker 보존. |

### Completion Criteria 검증 (Planning §Completion Criteria)

| # | Criterion | 검증 방법 | 결과 |
|---|---|---|---|
| 1 | 신규 init에 9 `@` ref 자동 포함 | tests/e2e/init-claude-md.test.ts 신규 케이스 2건 | ✓ pass |
| 2 | 기존 사용자 plain-path + marker-stale 모두 migration | tests/e2e/update.test.ts 신규 케이스 2건 | ✓ pass |
| 3 | Hook 출력 dynamic-only (≤ 2KB) | tests/unit/load-context.test.ts SENTINEL 검증 + size 검증 + live `reap load-context` 호출 | ✓ pass (live: 1814 bytes) |
| 4 | 회귀 없음 | unit 364 / e2e 173 pass | ✓ pass (pre-existing 1건 제외) |
| 5 | Dog-fooding: `/CLAUDE.md` 자동 갱신 | `node dist/cli/index.js update` 실행 → 파일 inspect | ✓ pass (hash e20588a0, 형식 확인) |
| 6 | 문서 동기화 | `.reap/reap-guide.md` ↔ template diff 0 라인 | ✓ pass (T009에서 sync) |
| 7 | 신규 테스트 추가 | unit 2건 (SENTINEL, ≤2KB) + e2e 5건 (init `@` ref ×2, update migration ×2, 기존 보존 1건) | ✓ pass |

### Backlog Verification (claude-md-knowledge-loading-separation.md §Verification 기준)

| 항목 | 결과 |
|---|---|
| `src/templates/claude-md-section.md`에 `@` reference 9개 포함 | ✓ |
| `load-context.ts`가 dynamic-only 출력 (≤ 2KB) | ✓ (1814 bytes) |
| `reap init` 신규 프로젝트에서 CLAUDE.md에 `@` refs 자동 포함 | ✓ |
| `reap update` 기존 사용자 프로젝트에서 plain path → `@` refs 자동 migration | ✓ |
| migration 시 marker 밖 사용자 커스터마이즈 보존 | ✓ (2 e2e 케이스 모두 검증) |
| SessionStart hook 출력이 정적 9개 파일 내용 미포함 | ✓ (SENTINEL 검증) |
| Hook 동작 환경에서 `@` refs + hook dynamic 합쳐 정보량 ≥ 기존 | ✓ (정보 손실 없음, 단지 위치만 이동) |
| Hook 미동작 환경에서도 static knowledge가 `@` refs로 auto-load | ✓ (CLAUDE.md `@` ref 9개 보장) |
| reap-guide.md / claude-md-section.md / docs 문서 갱신 | ✓ (template + 본 dot-reap 동기화) |
| dog-fooding: `src/templates/reap-guide.md` ↔ `.reap/reap-guide.md` | ✓ |
| Unit / E2E 테스트 추가 | ✓ (unit 2 + e2e 5) |
| 기존 init / update / load-context 회귀 없음 | ✓ (pre-existing 1 제외) |
| 본 generation 자체 dog-fooding 검증 | ✓ (`/CLAUDE.md` 갱신 확인) |

## Performance Notes

`buildKnowledgeContext()` 출력 크기 비교:
- **Before** (gen-061 시점): ~17KB (9 static + 3 dynamic)
- **After**: 1814 bytes (3 dynamic only)
- **감소율**: ~89%.

이 감소는 SessionStart hook이 inject하는 토큰만 측정한 값. Claude Code의 `@` import는 lazy하지만 매 세션 동일 파일을 로드해야 하므로 총 정보량은 동일. 차이는 (a) hook 출력 토큰 중복 제거, (b) Claude Code의 import dedup/캐싱 활용 가능성.

## Edge Cases

### 1. `.claude/CLAUDE.md` 가 함께 존재할 때

본 프로젝트에 root `/CLAUDE.md` 외에 `.claude/CLAUDE.md` 가 있다. `ensureClaudeMd` 는 root를 먼저 검사 → 매칭되면 거기서 return. `.claude/CLAUDE.md` 는 갱신 안 됨. 이는 pre-existing 동작이며 본 generation에서 변경 없음. 사용자 마이그레이션 가이드에서 둘 다 존재할 경우 주의 안내 필요할 수 있으나 별도 backlog 사안.

### 2. legacy CLAUDE.md heading 매칭 한계

`detectLegacyReapSection` 은 `^#{1,3}\s+.*REAP.*` 정규식으로 markdown heading 검출. heading 없이 본문에 `.reap/genome/` 만 mention하는 CLAUDE.md (예: init-repair test fixture)는 검출 불가 → 새 section이 append됨. 이는 init-repair test 의 pre-existing fail 원인. 본 작업 무관.

### 3. `@~/.reap/reap-guide.md` 의 file 부재 시

`~/.reap/reap-guide.md` 가 install되지 않은 환경(예: 신규 사용자, npm 글로벌 install 후 첫 호출 전)에서는 Claude Code가 `@` import 실패 메시지를 보일 수 있음. integrity.ts 는 이를 검출하고 `reap fix` 가 복구 가능. 본 작업과 무관한 별도 robustness 사안.

## Issues

### Pre-existing (본 작업 무관)
- **init-repair.test.ts:103** — "skips when REAP section already present" fail. gen-060 부터 알려진 이슈. test fixture가 markdown heading 없이 본문 mention만 가지고 있어 `detectLegacyReapSection` 매칭 안 됨. 해결책: heading-less detection 추가 또는 test fixture 보강. **본 generation 무관, 별도 backlog 후보**.

### 신규 (해결됨)
- 없음. 모든 작업이 계획대로 완료. backlog Verification 13항목 모두 충족.

## Verdict

**PASS** — 모든 completion criteria + backlog verification 13항목 충족. 회귀 없음(pre-existing 1건 제외). Dog-fooding 검증 완료. completion phase로 진행.

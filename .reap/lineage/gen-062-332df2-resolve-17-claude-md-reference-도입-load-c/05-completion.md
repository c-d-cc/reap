# Completion

## Summary

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

## Lessons Learned

### 잘된 점

- **기존 sync infra 재활용**: gen-054에서 도입된 marker-hash sync 로직(`extractReapSection` + `detectLegacyReapSection` + `updateClaudeMdFile`)이 그대로 작동 → migration 전용 코드 추가 0. template만 수정해도 모든 사용자 자동 처리. 사전 설계(planning)에서 이를 확인했기 때문에 implementation이 최소 변경으로 끝남.
- **dog-fooding 즉시 검증**: `npm run build` 직후 `node dist/cli/index.js update` 호출로 본 프로젝트 CLAUDE.md 자동 갱신 → 사용자 시나리오와 동일한 경로로 즉석 검증. 별도 통합 테스트 시나리오 없이도 end-to-end 신뢰성 확보.
- **signature 유지를 통한 test 호환성**: `buildKnowledgeContext()` 의 매개변수/반환 타입 그대로 두고 내부만 변경 → 기존 test 호출 사이트(`tests/unit/load-context.test.ts:5`) 변경 없이 expectation만 갱신.

### 발견/개선

- **`.reap/reap-guide.md` 가 `src/templates/reap-guide.md` 와 7 lines drift**: T009 검토 중 발견. 본 작업 scope 외였으나 즉시 sync 처리. 이는 dogfooding 동기화가 자동화되지 않은 영역이라는 신호 — 다음 generation에서 자동 sync hook (예: `onLifeCompleted.dogfood-sync.sh`) 추가 고려 가치 있음.
- **`detectLegacyReapSection` 매칭 한계 재확인**: heading 없이 본문 mention만 가진 CLAUDE.md는 검출 불가 → init-repair pre-existing fail 의 원인. 본 작업과 무관하지만 별도 generation에서 해결 가치.
- **`.claude/CLAUDE.md` 와 root `/CLAUDE.md` 공존 시 단일 파일만 갱신**: `ensureClaudeMd` 가 root 우선 처리 → `.claude/CLAUDE.md` 보존. 의도된 동작이나 사용자 인지 부족 가능. 별도 사안.

## Next Generation Hints

### 다음 generation 확정 (사용자 fitness에서 명시)

- **OpenCode adapter** (source: `opencode-adapter.md`). 본 generation의 dynamic-only `buildKnowledgeContext()` 가 그대로 `reap dump-state` 기반이 됨. 예상 작업:
  - `src/adapters/opencode/` 신설
  - `opencode.json` 자동 관리 (`instructions` 필드에 static 파일 + dump 파일 등록)
  - `reap dump-state` 신규 명령 — load-context의 dynamic 부분을 `.reap/.session-state.md`로 기록
  - OpenCode plugin (`.opencode/plugins/reap.ts`) — `session.created` hook에서 dump-state 호출, `tool.execute.before` hook으로 resume 케이스 fallback
  - `AGENTS.md` template (CLAUDE.md 대응)
  - 본 generation의 정/동 분리 원칙(application.md에 명문화됨)을 그대로 따를 것.

### 사용자가 추후 별도 판단할 follow-up (본 generation에서 backlog 등록 안 함)

1. `.reap/reap-guide.md` 자동 sync hook — dog-fooding drift 차단. `onLifeCompleted.dogfood-sync.sh` 후보.
2. `detectLegacyReapSection` heading-less detection 강화 — init-repair pre-existing fail 해결. heading 없이 본문에 `.reap/genome/` mention만 가진 CLAUDE.md 검출 추가.
3. `.claude/CLAUDE.md` 와 root `/CLAUDE.md` 공존 시 동작 안내 — README 또는 init 메시지에 명시.
4. evaluator agent 코드 통합 (longstanding, gen-061부터 deferred).

### 인사이트

- **gen-054 marker sync infra의 가치**: 본 generation이 추가 migration 코드 없이 완료된 것은 gen-054의 hash-based sync 덕분. template 단일 변경으로 모든 사용자 시점 자동 처리 → "template = single source of truth" 패턴이 다른 dog-fooding 동기화 영역(reap-guide.md 등)에도 확대 가능.
- **Claude Code `@` import의 정/동 분리 효과**: hook 부담 89% 감소. 단 정보 손실 없음(Claude Code가 lazy import). 향후 추가될 static knowledge(예: 새 design doc)는 `@` ref만 추가하면 됨.
- **embryo + mechanism 결정의 항구화**: type=normal이나 사용자 합의로 embryo 유지 중. mechanism 수준 결정(정/동 분리)을 application.md에 적극 명문화함으로써 type 전환과 무관하게 패턴이 다음 세대에 자동 계승됨.

### Out of scope (본 generation에서 다루지 않음)

- daemon, indexer 관련.
- early-close / abort / fitness 동작 변경.
- Codex adapter.
- 본 generation의 변경에서 발견된 follow-up 후보 4건은 사용자 판단 후 별도 backlog로 등록 (echo chamber 방지: adapt phase에서 backlog 자동 생성 금지 원칙 준수).

## Change Proposals

### Genome (adapt phase에서 적용됨)
- `application.md` 에 "Knowledge Loading — Static / Dynamic 분리" 절 추가. 본 generation에서 채택한 정/동 분리 원칙(static = `@` ref, dynamic = hook)을 항구적 규칙으로 명문화. 새 static 파일/dynamic context 추가 시 따를 가이드 포함. 다음 세대 agent가 같은 분리 원칙을 자동으로 따르도록 함.
- `invariants.md` 변경 없음.
- `evolution.md` 변경 없음 (AI 행동 방식 자체에는 영향 없음 — 단지 knowledge가 어떻게 도달하는지의 mechanism 변경).

### Environment (reflect phase에서 적용됨)
- `summary.md` 의 `src/cli/commands/load-context.ts` 설명 갱신 — 정/동 분리, dynamic-only 출력 명시.

### 관련 backlog
- 본 generation은 `claude-md-knowledge-loading-separation.md` (consumed) 1건만 처리. 새 backlog 자동 생성 없음 (echo chamber 방지).
- 다음 generation source 확정: `opencode-adapter.md` (pending) — 사용자가 본 generation 직후 바로 진행 예정.

## Project Diagnosis (adapt 평가)

- **Core functionality**: 정/동 분리 도입 후에도 전 기능 작동(unit 364 / e2e 173 pass). hook 출력 89% 감소.
- **Architecture stability**: gen-053(hook) → gen-054(marker-sync) → gen-062(`@` 분리)로 knowledge loading 영역이 안정 단계 진입. 다음 dynamic 추가가 있어도 같은 패턴 적용 가능.
- **Modularity**: `buildKnowledgeContext()` signature 유지로 외부 호환성 보장. 시그니처가 곧 인터페이스 계약.
- **Error handling**: 본 generation 변경 영역에서 새 에러 path 없음. config/current.yml parse 실패 시 graceful (기존 그대로).
- **Test coverage**: 신규 unit 2건(SENTINEL + ≤2KB), e2e 4건(init `@` ref 2 + update migration 2) 추가. dynamic 분리의 핵심 동작 모두 cover.
- **Documentation**: CLAUDE.md template + application.md + memory 3-tier 갱신. README는 라인 234가 여전히 유효(의미 불변)하여 갱신 불필요. docs/src에는 CLAUDE.md 예시 없음.
- **Performance/Security/Deployment/UX/Visual**: 본 generation 범위 외(메커니즘 변경).
- **Integration layer**: Claude Code `@` import는 외부 의존(Claude Code 자체 메커니즘). 공식 docs 기준으로 안전하나 client 동작 변경 시 영향 가능 — 별도 모니터링 가치.
- **Domain maturity**: knowledge loading 영역의 domain 모델이 명확해짐(static/dynamic 이분법). application.md 에 명문화됨.
- **Governance compliance**: REAP lifecycle 엄수 (learning → planning → implementation → validation → completion). echo chamber 방지 원칙 준수(자동 backlog 생성 없음, 사용자 판단 영역만 hints).
- **Genome stability**: gen-053부터 gen-062까지 9 세대에 걸친 knowledge loading 영역의 안정화. embryo 유지지만 mechanism 수준 결정은 항구적 패턴으로 자리 잡음.

## Vision Auto-Suggested Completions — 검토 결과

엔진이 텍스트 매칭으로 다음 3개 완료 후보를 제안했으나, **모두 실제 완료 아님** — check off 하지 않음.

| 후보 | 실제 검토 | 처리 |
|---|---|---|
| Validation에서 자기 CLI 검증 가능 | 본 작업은 knowledge loading 분리 영역. validation 메커니즘 자체 변경 없음. | check off X |
| Update agent Phase 2: 프로젝트 동기화 | `reap update` 의 CLAUDE.md sync가 일부 진전 보였으나 vision의 "Update agent"는 별개 agent 컨셉. | check off X |
| 세대별 작업 기록 및 다음 작업 할당 | evaluator agent 영역. 본 작업과 무관. | check off X |

vision/goals.md 수정 없음.

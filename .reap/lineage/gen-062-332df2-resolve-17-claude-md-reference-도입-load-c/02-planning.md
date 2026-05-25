# Planning

## Goal

CLAUDE.md의 file references를 Claude Code native `@` import syntax로 전환하고, SessionStart hook(`reap load-context`) 출력에서 static 9개 파일 inject를 제거해 **정/동 분리**를 구현한다. 기존 사용자는 `reap update` 실행 시 자동 migration (gen-054 sync 마커 활용).

## Background

- Issue #17: Claude Code의 native `@` import를 활용하지 못해 hook 미설치 환경에서 fallback이 무력.
- gen-053 hook은 9 static + 3 dynamic을 inject. Static을 `@` ref로 옮기면 한쪽으로 일원화 가능.
- gen-054 marker sync 로직(`<!-- reap:start {hash} -->`)이 이미 존재 → template만 수정해도 자동 migration 작동.

## Approach

**채택**: 정/동 분리 전면 적용. CLAUDE.md template = static 9 `@` refs + 정/동 분리 안내문 + 기존 Termination Paths/Agent 절. `load-context.ts` `buildKnowledgeContext()` = dynamic 3섹션 (Current State / Strict Mode / Language) only.

**대안 검토** (사용자 합의 결과 이미 결정됨, 기록 목적):
| 옵션 | 채택 여부 | 사유 |
|---|---|---|
| 정/동 분리 (현 안) | **✓** | 중복 0, robust fallback, Claude Code native 활용 |
| `@` ref만 추가, hook 그대로 | 기각 | 세션당 ~16KB 중복 inject |
| `@` ref 없이 hook만 유지 | 기각 | 타 client / hook 미설치 환경 fallback 부재 (Issue #17 미해결) |

## Completion Criteria

1. **신규 init**: `reap init` 시 CLAUDE.md에 `@` ref 9개 자동 포함 (`@~/.reap/reap-guide.md` + 8 project-local).
2. **기존 마이그레이션**: legacy plain-path CLAUDE.md, marker-wrapped CLAUDE.md 모두 `reap update`로 새 `@` ref 형식으로 교체. marker 밖 사용자 커스터마이즈는 보존.
3. **Hook 출력 dynamic-only**: `buildKnowledgeContext()` 결과가 static 9 파일 내용을 미포함, dynamic 3 섹션(Current State + Strict Mode + Language)만 포함. 출력 크기 ≤ 2KB.
4. **회귀 없음**: 기존 unit/e2e 테스트 갱신 후 전체 pass (pre-existing init-repair 1건은 known, 미반영).
5. **Dog-fooding 반영**: 본 프로젝트의 `/CLAUDE.md`도 새 형식으로 자동 갱신 (template 변경 → `reap update`로 적용).
6. **문서 동기화**: `src/templates/reap-guide.md` ↔ `.reap/reap-guide.md`, README, docs/src 의 CLAUDE.md 예시 갱신.
7. **신규 테스트 추가**: unit (load-context dynamic-only) + e2e (init `@` ref / update migration / hook output).

## Scope

### In scope
- `src/templates/claude-md-section.md` — `@` ref 도입 + 정/동 분리 안내문.
- `src/cli/commands/load-context.ts` — `buildKnowledgeContext()` dynamic-only.
- `tests/unit/load-context.test.ts` — expectation 갱신.
- `tests/e2e/init-claude-md.test.ts` — `@` ref 포함 검증 추가.
- `tests/e2e/update.test.ts` — legacy → `@` migration 검증 추가.
- `tests/unit/claude-md-sync.test.ts` — `@` ref 포함 sample 검증 1건 추가 (선택적).
- `.reap/reap-guide.md` — template과 동기화.
- 본 프로젝트 `/CLAUDE.md` — `reap update` 호출로 자동 갱신.
- `README.md` 등 docs의 CLAUDE.md 예시 — 영향 받는 line 만.

### Out of scope
- `reap dump-state` 신규 명령 (Gen-N+1, OpenCode).
- OpenCode/Codex adapter.
- early-close / abort / fitness 동작.
- daemon, indexer.

## Tasks

- [ ] T001 `src/templates/claude-md-section.md` — `Manual Reference (fallback)` 블록을 `Static Knowledge (@ refs)` 블록으로 교체. 9개 `@` ref (한 줄당 하나, description 제거). `Knowledge Loading` 안내문 정/동 분리 반영. `Termination Paths` / `Agent` 절 보존.
- [ ] T002 `src/cli/commands/load-context.ts` — `buildKnowledgeContext()`에서 reapGuide/application/evolution/invariants/envSummary/visionGoals/memoryLongterm/memoryMidterm/memoryShortterm 9개 read 제거. genome/env/vision/memory sections.push 로직 제거. signature 유지, `Current State` + Strict Mode + Language 3 섹션만 출력.
- [ ] T003 `tests/unit/load-context.test.ts` — 정적 파일 내용 (Test app genome 등) 포함 expectation 제거 + dynamic-only 검증 추가 (출력 크기 ≤ 2KB, static content 미포함, Current State header 포함).
- [ ] T004 `tests/e2e/init-claude-md.test.ts` — CLAUDE.md에 `@.reap/genome/application.md` 등 `@` ref 포함 검증 신규 테스트. plain backtick path 부재 검증.
- [ ] T005 `tests/e2e/update.test.ts` — legacy plain-path CLAUDE.md → `reap update` → `@` ref 포함 검증 신규 케이스. marker 밖 사용자 커스터마이즈 보존 검증.
- [ ] T006 `npm run build` — dist/cli/index.js + dist/templates/claude-md-section.md 갱신.
- [ ] T007 `npm run test:unit && npm run test:e2e` — 전체 회귀 확인.
- [ ] T008 본 프로젝트 dog-fooding: `node dist/cli/index.js update` 실행 → `/CLAUDE.md` 자동 갱신 확인.
- [ ] T009 `.reap/reap-guide.md` ↔ `src/templates/reap-guide.md` 동기화 확인 (현재 일부 절 누락된 듯하나 본 generation 스코프 외 변경은 보류).
- [ ] T010 README.md / README.ko.md / README.de.md / README.ja.md / README.zh-CN.md — `CLAUDE.md` 언급 라인 검토 후 필요 시 갱신 (실제 영향 line만).

## Dependencies

- T001 (template) → T006 (build) → T008 (dog-fooding update).
- T002 (load-context) → T003 (load-context test) → T007.
- T004/T005 (e2e tests) → T006 (build) → T007.
- T009 (reap-guide sync) 독립 — 변경 폭이 큰 경우 별도 backlog로 분리 검토.

## Risk Assessment

- **Risk 1: Claude Code의 `@` import가 cwd 기준이 아닌 다른 위치 기준일 수 있음** → docs에서 `@.reap/genome/application.md` 형식이 working dir 기준임을 확인. CLAUDE.md가 프로젝트 root에 있으면 안전.
- **Risk 2: marker hash 변경으로 `reap update`가 모든 기존 사용자 CLAUDE.md를 새로 쓰게 됨** → marker 밖 사용자 커스터마이즈는 보존되므로 안전. 사용자가 marker 안을 수동 편집한 경우(드물지만 가능) 덮어쓰기 됨 — 변경 시 ChangeLog로 안내.
- **Risk 3: load-context.ts의 dynamic-only 출력이 작아지면서 hook 동작 환경에서 information loss** → static은 `@` ref로 자동 로드되므로 정보 총량은 동일 이상.
- **Risk 4: test 회귀** → 기존 load-context.test.ts의 7건 모두 정적 파일 검증을 포함하므로 갱신 필수. e2e 일부도 영향. T003/T004/T005에서 처리.

## Additional Findings

### `tests/unit/load-context.test.ts` 영향 분석
기존 케이스 7건 중:
- "returns null for non-REAP directory" — 영향 없음.
- "returns null when .reap exists but no config.yml" — 영향 없음.
- "returns context string for valid REAP project" — **영향 큼**: 모든 expect("Test app genome." 등)을 제거하고 dynamic-only 검증으로 변경.
- "includes generation state when current.yml exists" — 영향 없음 (Current State 검증).
- "includes language section from config" — 영향 없음.
- "includes strict mode section when strictEdit is true" — 영향 없음.
- "shows no active generation when current.yml is absent" — 영향 없음.
- "handles missing optional files gracefully" — 영향 적음. content 포함 검증 없으므로 그대로 OK.

→ 1건 갱신 + 1건 신규 추가 (output size 검증).

### 본 generation 자체 self-evolving 적용
본 prompt에 사용된 CLAUDE.md(`/Users/hichoi/cdws/reap/CLAUDE.md`)도 마지막 단계에서 새 형식으로 갱신됨. 이는 dog-fooding 검증의 일부.

다음 stage: implementation.

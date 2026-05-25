# Learning

## Project Overview

REAP v0.16.0 — self-evolving AI 개발 파이프라인. embryo 단계 유지 중. gen-061까지 진행되며 lifecycle termination paths(abort/early-close/completion) 3종이 정착됨. 본 generation은 **Issue #17** 해결: Claude Code의 native `@` import 메커니즘과 REAP의 SessionStart hook 출력 간 중복/누락 문제를 정/동 분리로 해결.

## Source Backlog

Goal source: `.reap/life/backlog/claude-md-knowledge-loading-separation.md` (consumed by gen-062).

요약:
- Issue #17은 CLAUDE.md의 file references가 backtick-wrapped plain path(예: `` `.reap/genome/application.md` ``)여서 Claude Code의 auto-import(`@` syntax)를 활용하지 못한다고 지적.
- gen-053에서 도입된 SessionStart hook이 작동하지 않는 환경(hook 미등록, 타 client)에서 fallback이 무력.
- hook은 이미 9개 정적 파일을 inject + dynamic context(Current State, Strict, Language) 생성을 함께 수행. 단순히 CLAUDE.md에 `@` ref만 추가하면 정적 9개가 양쪽에서 inject되어 세션당 ~16KB 토큰 중복.

합의된 방향 (2026-05-25):
- Static knowledge (genome×3, env summary, vision goals, memory×3, reap-guide)는 CLAUDE.md `@` ref로 Claude Code 자체가 로드.
- Dynamic knowledge (Current State, Strict, Language)만 hook이 inject.
- 기존 사용자는 `reap update`로 자동 migration (gen-054 sync 마커 활용).

## Key Findings

### `src/templates/claude-md-section.md` (현재 형상)
- gen-061에서 `Termination Paths` 절이 추가됨. `@` ref 도입 시 이 절을 **보존**해야 함.
- 현 `Manual Reference (fallback)` 절은 9개 plain path bullet 목록 + 각 line description. `@` ref로 교체하되 description 텍스트는 제거 (파일 본문에 헤더가 있음).

### `src/cli/commands/load-context.ts` (현재 형상)
- 11개 파일을 `Promise.all` 로 병렬 read: 9 static (reapGuide, application, evolution, invariants, envSummary, visionGoals, memoryLongterm, memoryMidterm, memoryShortterm) + 2 dynamic state-bearing (config.yml, current.yml).
- 4개 dynamic section 생성: (1) Current State (current.yml 가공), (2) Strict Mode (`buildStrictSection`), (3) Language 지시, (4) genome/env/vision/memory 헤더로 묶인 static 본문.
- **정/동 분리 후 남길 것**: config + current 읽기, Current State, Strict Mode, Language. **제거할 것**: 9 static 파일 read + sections.push로 합치는 로직.
- `buildKnowledgeContext()` 시그니처 유지 → test 호환성.
- `execute()` 흐름은 그대로: non-REAP 디렉토리는 `null` → silent exit; valid이면 `hookSpecificOutput` JSON 출력.

### `src/cli/commands/init/common.ts` — CLAUDE.md sync 로직 (gen-054)
- `wrapWithMarkers(content)` → `<!-- reap:start {hash} -->\n{content}\n<!-- reap:end -->` 형식.
- `ensureClaudeMd(root, projectName)` 흐름:
  1. dist/templates/claude-md-section.md 읽기 → `stripMarkers` 적용 → 내용으로 hash + wrap.
  2. CLAUDE.md 또는 .claude/CLAUDE.md 찾아서 `extractReapSection` 또는 `detectLegacyReapSection` 매칭.
  3. 매칭되면 marker 밖은 보존하고 marker 안만 새 wrappedSection으로 교체.
- → **template만 수정하면, `reap init`/`reap update` 시 자동 migration 작동**. 추가 코드 불요.

### 기존 테스트 현황
- `tests/unit/load-context.test.ts` — 정적 파일 inject 검증 7건. 새 정/동 분리 후 **expectation 갱신 필요**. "Test app genome." 같은 static content 포함 검증을 제거해야 함.
- `tests/unit/claude-md-sync.test.ts` — marker / hash / extract 유틸리티 검증. **갱신 불필요** (내부 로직).
- `tests/e2e/init-claude-md.test.ts` — CLAUDE.md에 `.reap/genome/` 포함 + `## REAP` 헤더 검증. **신규 케이스 추가 필요**: `@.reap/genome/application.md` 같은 `@` ref 포함 확인.
- `tests/e2e/update.test.ts` — CLAUDE.md repair 검증 (단순 파일 부재 케이스). **신규 케이스 추가 필요**: legacy plain path CLAUDE.md → `@` ref 자동 migration.

### 본 프로젝트 CLAUDE.md (dog-fooding)
- `/Users/hichoi/cdws/reap/CLAUDE.md` 의 REAP section은 marker로 감싸진 상태(`<!-- reap:start 4f4c9ee4 -->`).
- gen-061의 Termination Paths 절이 누락된 상태 — 본 generation에서 template 수정 후 dog-fooding 적용 시 자연 보강됨.

### Claude Code `@` import 동작 (가설 검증 결과)
- `~/.reap/reap-guide.md` 처리: `@~/.reap/reap-guide.md` 가 공식 지원 형식. Claude Code memory docs (https://code.claude.com/docs/en/memory) 명시.
- max 5 hops, recursive. 본 작업에서는 1-hop (CLAUDE.md → 9 refs) 만 사용 → 안전.

## Previous Generation Reference

- gen-061: early-close lifecycle path 도입 완료. fitness "전반적으로 만족". `feature/gen-061-386e6c` 머지 → main. 
- 본 generation은 그 위에 빌드. early-close 관련 코드 변경 없음 — 단지 template과 load-context.ts 만 영향.
- gen-061 fitness에서 거론된 4건(init-repair fix, evaluator 통합, daemon test disable, early-close 실사용 관찰)은 본 generation scope 밖.

## Backlog Review

Pending backlog 6건:
- `claude-md-knowledge-loading-separation.md` — **본 generation source (consumed)**
- `daemon-e2e-tests.md` — 이전 세대 consumed (메타데이터 상)
- `early-close-lifecycle.md` — gen-061 consumed
- `fix-migrate-update-tests.md` — gen-059 consumed
- `opencode-adapter.md` — **Gen-N+1 source 예정**. 본 작업의 dynamic-only `buildKnowledgeContext()`를 dump-state가 활용.
- `strict-merge-mode-bypass-for-merge-gen.md` — gen-058 consumed

Action: 모두 consumed 상태 또는 별도 generation 대상. 본 generation은 source backlog 하나에만 집중.

## Technical Deep-Dive

### 토큰 절약 effect 검증

기존 `buildKnowledgeContext()` 출력 = 9 static (~16KB) + 3 dynamic (~1KB) = **~17KB**.
새 출력 = 3 dynamic only = **~1KB**.
Claude Code `@` import는 lazy하지만 우리 9개 파일은 어차피 매 세션 로드 필요 → 결국 같은 정보량. 단 hook 중복 제거 + Claude Code 캐싱/dedup 활용 가능.

### Migration robustness

기존 사용자 시나리오:
1. plain path CLAUDE.md (gen-054 이전, no markers) → `detectLegacyReapSection` 로 legacy section 검출 → 새 wrapped section 으로 교체.
2. marker-wrapped CLAUDE.md (old content hash) → `extractReapSection` 로 매칭 → 새 hash와 다름 확인 → 교체.
3. 이미 새 형식 (current hash) → skipped.

세 경우 모두 `reap update` 한 번 호출로 처리. 사용자 커스터마이즈는 marker 밖이라 보존.

### Hook 호환성

`load-context.ts`의 `execute()` 흐름은 변경 없음 → `hookSpecificOutput` JSON format 유지 → SessionStart hook 설치 코드(`registerSessionHooks`) 변경 불요.

## Context for This Generation

### Clarity Level: **High**

근거:
- backlog 본문에 verification 13개 기준 + 확정된 설계 결정 표 포함.
- 사용자가 2026-05-25 세션에서 합의 완료, 본 prompt에 핵심 결정 정리됨.
- 코드 변경 scope는 한정적: claude-md-section.md template + load-context.ts + 테스트 추가.
- migration은 기존 sync 로직(gen-054)이 처리 → 추가 코드 불요.

### 작업 원칙

1. **artifact before implementation** — planning에서 design artifact 작성 → implementation.
2. **dogfooding** — `src/templates/claude-md-section.md` 수정 후 본 프로젝트 `/CLAUDE.md` 도 새 형식 반영. `src/templates/reap-guide.md` ↔ `.reap/reap-guide.md` 동기화 점검 (현재 `.reap/reap-guide.md` 에 일부 절 누락).
3. **no workarounds** — plain path 유지 같은 우회 금지. 사용자 합의대로 정/동 분리 전면 적용.
4. **stale build 방지** — src 변경 후 `npm run build` 필수.
5. **embryo 자유** — invariants 안 건드리는 한 genome/template/code 자유 수정.

### Out of Scope

- `reap dump-state` 신규 명령 — Gen-N+1 (OpenCode).
- `src/adapters/opencode/` — Gen-N+1.
- Codex adapter, daemon, early-close 동작 변경.

다음 stage: planning (design + task decomposition).

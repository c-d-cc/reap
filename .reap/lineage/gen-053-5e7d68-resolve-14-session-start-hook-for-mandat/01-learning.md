# Learning — gen-053-5e7d68

## Goal
resolve #14: Session-start hook for mandatory knowledge loading

## Project Overview

REAP v0.16은 SessionStart hook에서 `reap check-version`만 실행하며, genome/environment/vision 등 mandatory knowledge를 세션 시작 시 자동 주입하지 않는다. CLAUDE.md에 "반드시 읽으라"고 명시해도 AI가 자동 실행하지 않아, genome 무지로 인한 실수(backlog 직접 생성, stage 전환 규칙 무시 등)가 발생한다.

v0.15에는 `session-start.cjs` + `genome-loader.cjs`로 완전한 SessionStart knowledge injection이 있었으나, v0.16 rewrite 시 이 기능이 빠졌다.

## Key Findings

### 현재 상태
1. **SessionStart hook**: `~/.claude/settings.json`에 `reap check-version 2>/dev/null || true` 등록. auto-update + legacy cleanup만 수행.
2. **CLAUDE.md**: genome 3종 + environment + vision + memory 파일 경로를 나열하고 "필수 숙지"라고 명시하지만 강제력 없음.
3. **`.claude/CLAUDE.md`**: "Session-start hook loads project knowledge on session start"라고 적혀있으나 실제로는 knowledge loading이 없음 (미구현 상태).
4. **`/reap.knowledge reload`**: 수동으로 knowledge 재로딩 가능하지만 매 세션마다 수동 실행 필요.

### v0.15 참조
- `session-start.cjs`: REAP guide + genome + environment + generation state + strict mode + staleness + session init display 한번에 주입
- 출력 방식: `hookSpecificOutput.additionalContext`로 JSON stdout → Claude Code가 system-reminder로 주입
- 크기 관리: L1 500줄 budget, L2 domain/ 200줄 budget

### Claude Code Hook 동작 방식 (v2.1.86)
- `settings.json`의 `hooks.SessionStart`에 command 등록
- command의 stdout이 system context에 주입됨
- `hookSpecificOutput.additionalContext` JSON 형식으로 출력하면 system-reminder로 삽입
- stderr는 디버그/로그용 (사용자에게 표시)

### v0.16에서의 차이점
- Genome 구조: 3파일 (application/evolution/invariants) — v0.15(4+domain)보다 단순
- Vision/Memory 추가: shortterm, midterm, longterm — v0.15에 없었던 항목
- CLI 패턴: `emitOutput` JSON 패턴 vs v0.15의 독립 CJS 스크립트
- reap-guide.md: `~/.reap/reap-guide.md`에 설치됨 (약 300줄)

### 기존 코드 재활용 가능한 부분
- `src/core/prompt.ts`: `buildStrictSection()` (strict mode)
- `src/core/paths.ts`: 모든 경로 상수 이미 정의됨
- `src/core/generation.ts`: `GenerationManager.current()` — generation state 파싱
- `src/core/fs.ts`: `readTextFile()`, `fileExists()` — 파일 읽기 유틸리티

## Previous Generation Reference

gen-052 (merge generation): self-evolve 브랜치(evaluator agent gen-050~051)와 origin/main(daemon Phase 1~4)을 병합 완료. Fitness: "merge 깔끔하게 완료. environment 업데이트도 잘 반영됨."

## Backlog Review

| Item | Type | Priority | 이번 gen 관련성 |
|------|------|----------|----------------|
| session-start-knowledge-loading | task | high | **직접 대상** — 이 backlog이 곧 goal |
| daemon-e2e-tests | task | medium | 무관 |
| fix-migrate-update-tests | task | medium | 무관 |
| strict-merge-mode-bypass-for-merge-gen | task | medium | 무관 |

## Technical Deep-Dive

### 구현 구조
1. **새 CLI command `reap load-context`**: REAP 프로젝트 감지 → mandatory knowledge stdout 출력
2. **기존 check-version과 분리**: 관심사 분리. check-version은 모든 디렉토리에서 실행, load-context는 REAP 프로젝트에서만
3. **hook 등록**: `install.ts`의 `registerCleanupHook()`에 `reap load-context` 추가 등록
4. **출력 형식**: `hookSpecificOutput.additionalContext` JSON → system-reminder 주입

### 주입 대상
- `~/.reap/reap-guide.md` (전문, ~300줄)
- `.reap/genome/application.md` (전문)
- `.reap/genome/evolution.md` (전문)
- `.reap/genome/invariants.md` (전문)
- `.reap/environment/summary.md` (전문)
- `.reap/vision/goals.md` (전문)
- `.reap/vision/memory/shortterm.md` (전문)
- `.reap/vision/memory/midterm.md` (전문)
- `.reap/vision/memory/longterm.md` (전문)
- Generation state (current.yml 파싱)
- Strict mode (config.yml 기반)
- Language 설정

### 변경 대상 파일
- `src/cli/index.ts` — `load-context` command 라우팅 추가
- `src/cli/commands/load-context.ts` — **신규**: knowledge 파일 읽기 + stdout 출력
- `src/adapters/claude-code/install.ts` — SessionStart hook에 load-context 등록
- `CLAUDE.md` — knowledge hook 자동 로딩 안내로 간소화
- `.claude/CLAUDE.md` — 설명 업데이트 (미구현 → 구현됨)
- `src/templates/claude-md-section.md` — dogfooding 동기화

## Context for This Generation

### 미결정 사항
1. **Context 크기**: 전체 주입 시 예상 800-1200줄. Claude Code system context 한도와의 관계 — 현재 이미 CLAUDE.md(~40줄) + system prompt가 주입되는 상태이므로 추가 1000줄 정도는 문제 없을 것으로 판단.
2. **CLAUDE.md 간소화**: knowledge가 자동 주입되면 파일 목록이 중복. 하지만 context가 compact되거나 hook이 실패한 경우를 대비해 CLAUDE.md에 최소한의 가이드(수동 재로딩 방법)는 유지해야 함.

### Clarity Level
**HIGH** — Goal 명확 (GitHub issue #14), backlog에 상세 solution 설계 완료, v0.15 참조 코드 파악 완료, 기존 코드 재활용 포인트 명확.

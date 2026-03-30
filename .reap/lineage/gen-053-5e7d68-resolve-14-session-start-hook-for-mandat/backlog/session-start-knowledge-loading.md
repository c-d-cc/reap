---
type: task
status: consumed
consumedBy: gen-053-5e7d68
priority: high
createdAt: 2026-03-30T05:14:17.081Z
---

# session-start-knowledge-loading

resolve #14: SessionStart hook에서 mandatory knowledge(genome, environment, guide)를 자동으로 컨텍스트에 주입. 현재 hook은 check-version만 실행하며 knowledge loading 없음. 새 CLI command 추가하여 hook stdout으로 핵심 knowledge를 출력, Claude Code가 system-reminder로 자동 주입하도록 구현.

## Problem

CLAUDE.md에 "세션 시작 시 반드시 읽으라"고 명시된 파일들(genome 3종, environment/summary, reap-guide, vision/memory 3종)이 실제로는 자동 로딩되지 않음.

- CLAUDE.md의 지시는 AI 컨텍스트에 주입되지만, "이 파일을 읽어라"는 행동 지시를 AI가 자동 실행하지 않음
- 현재 SessionStart hook은 `reap check-version`만 실행 — knowledge loading 없음
- 결과: backlog CLI 규칙 무시, stage 전환 규칙 건너뛰기 등 genome 무지로 인한 실수 발생
- `/reap.knowledge reload`로 수동 로딩 가능하나, 매 세션마다 수동 실행 필요

GitHub Issue: https://github.com/c-d-cc/reap/issues/14

## v0.15 참고

v0.15에는 `session-start.cjs` + `genome-loader.cjs`로 구현된 완전한 SessionStart knowledge injection이 있었음.

**v0.15가 주입한 것:**
- REAP guide 전문
- Genome 전체 (principles, conventions, constraints, source-map — L1: 500줄 budget, L2: domain/ 200줄 budget)
- Environment summary
- Generation state + strict mode + staleness 감지
- Session init display (emoji 상태 라인)
- `<REAP_WORKFLOW>` 태그로 래핑, JSON `hookSpecificOutput.additionalContext`로 출력

**v0.16에서 달라진 점 (반영 필요):**
- Genome 구조: principles/conventions/constraints/source-map → application/evolution/invariants (3파일, domain/ 없음)
- Vision/Memory 추가: shortterm, midterm, longterm — v0.15에는 없었으나 v0.16에서 세션 시작 시 필수
- CLI 패턴: v0.15는 독립 CJS 스크립트 → v0.16은 CLI command + `emitOutput` JSON 패턴
- Hook 등록: v0.15는 CJS 파일 경로 직접 등록 → v0.16은 `reap` CLI command 실행
- check-version이 이미 auto-update + legacy cleanup 담당 → knowledge loading만 분리

## Solution

새 CLI command `reap load-context`를 만들어 SessionStart hook에 등록.

### 1. `reap load-context` command

REAP 프로젝트에서만 동작하며, mandatory knowledge를 stdout으로 출력하여 Claude Code가 system-reminder로 주입.

**주입 대상 (v0.16 기준):**
- `~/.reap/reap-guide.md` — REAP 사용법 (v0.15와 동일하게 전문 주입)
- `.reap/genome/application.md` — 프로젝트 아키텍처, 컨벤션
- `.reap/genome/evolution.md` — AI 행동 가이드
- `.reap/genome/invariants.md` — 절대 제약
- `.reap/environment/summary.md` — 기술 스택, 소스 구조
- `.reap/vision/goals.md` — 프로젝트 목표
- `.reap/vision/memory/shortterm.md` — 다음 세션 핸드오프
- `.reap/vision/memory/midterm.md` — 진행 중 작업 맥락
- `.reap/vision/memory/longterm.md` — 프로젝트 교훈 (v0.15에 없던 항목)

**추가 주입:**
- Generation state (current.yml 파싱 — 활성 gen ID, stage, goal)
- Strict mode 판단 (config.yml의 strict 설정 + 현재 stage)
- Language 설정 (config.yml)

### 2. 출력 형식

v0.15와 달리 `hookSpecificOutput` JSON이 아닌, Claude Code의 현재 hook stdout 주입 방식에 맞춤.
hook stdout이 그대로 system-reminder로 들어가므로 plain text 또는 적절한 구조화된 텍스트 출력.
(구체적 형식은 implementation에서 Claude Code hook stdout 동작 검증 후 결정)

### 3. Context 크기 관리

v0.15의 line budget 접근을 계승하되, v0.16 genome 구조에 맞게 조정:
- v0.16 genome은 3파일로 v0.15(4+domain)보다 작으므로 전문 주입 가능할 수 있음
- Memory 3종은 "간결하게 유지" 규칙이 있으므로 전문 주입
- reap-guide.md는 ~300줄 — 전문 주입 vs 핵심 섹션만 추출 결정 필요
- 전체 주입 시 예상 크기 측정 후, 과도하면 truncation 적용

### 4. REAP 프로젝트 감지

- `.reap/config.yml` 존재 여부로 판별 (v0.15의 `.reap/` 디렉토리 감지와 동일)
- 비-REAP 디렉토리에서는 silent exit (stdout 출력 없음, exit 0)

### 5. SessionStart hook 등록

- `install.ts`의 `registerSessionHook()`에서 `reap load-context` hook 추가
- 기존 `reap check-version`과 별도 hook entry로 등록
- 실행 순서: check-version(업데이트) → load-context(knowledge 주입)

### 6. 기존 check-version과의 관계

- check-version: auto-update + legacy cleanup (유지)
- load-context: knowledge injection (신규)
- 분리하는 이유: 관심사 분리 + check-version은 모든 디렉토리에서 실행되지만 load-context는 REAP 프로젝트에서만

## Files to Change

- `src/cli/index.ts` — `load-context` command 라우팅 추가
- `src/cli/commands/load-context.ts` — 신규: knowledge 파일 읽기 + stdout 출력 + project 감지 + strict mode + generation state
- `src/adapters/claude-code/install.ts` — `registerSessionHook()`에 load-context hook 추가, `getHookEntry()` 수정 또는 별도 entry
- `src/core/prompt.ts` — `loadReapKnowledge()`, `buildStrictSection()` 등 기존 로직 재활용 검토
- `src/core/paths.ts` — 필요 시 경로 상수 참조 (대부분 이미 정의됨)

# Learning — gen-057

## Goal

e2e: update path 테스트 — 0.16.4에서 현재 버전으로 업데이트되는 시나리오를 E2E로 검증

## Source Backlog

`e2e-update-path-tests.md` (priority: high)

gen-053~056에서 SessionStart hook 등록, CLAUDE.md marker sync, `reap update`에 hook 등록 추가 등 주요 변경이 이루어졌지만, "update path" (기존 프로젝트가 새 버전으로 업데이트되는 시나리오)에 대한 E2E 테스트가 없음.

## Key Findings

### 테스트 대상 기능 분석

1. **`reap load-context`** (`src/cli/commands/load-context.ts`)
   - REAP 프로젝트: `hookSpecificOutput.additionalContext` JSON 출력
   - 비-REAP 디렉토리: silent exit (출력 없이 exit 0)
   - `buildKnowledgeContext()` 함수가 export되어 unit test도 존재 (`tests/unit/load-context.test.ts`)

2. **`reap update`** (`src/cli/commands/update.ts`)
   - config backfill, 디렉토리 보충, CLAUDE.md repair, `registerSessionHooks()` 호출
   - 기존 E2E: `tests/e2e/update.test.ts` — up-to-date, config backfill, dirs, CLAUDE.md repair, no-project

3. **CLAUDE.md marker system** (`src/cli/commands/init/common.ts`)
   - `<!-- reap:start {hash} -->` ... `<!-- reap:end -->` 마커
   - `ensureClaudeMd()`: created/appended/skipped/updated 반환
   - `extractReapSection()`: 마커 기반 섹션 추출
   - `detectLegacyReapSection()`: 마커 없는 레거시 REAP 헤딩 감지 -> 교체
   - `computeSectionHash()`: SHA256 8자로 content hash

4. **`registerSessionHooks()`** (`src/adapters/claude-code/install.ts`)
   - `~/.claude/settings.json`에 `reap check-version` + `reap load-context` hook 등록
   - user-level 파일이므로 E2E에서 직접 수정 시 위험

### 테스트 인프라 패턴

- `setupProject()`: temp dir + `reap init` -> CLAUDE.md 마커가 이미 포함된 상태
- `setupGitProject()`: + git init/commit -> lifecycle 테스트용
- `cli()`: JSON 파싱, `cliRaw()`: raw text 반환
- `afterAll`로 cleanup
- bun:test 기반

### 제약사항

- `registerSessionHooks()`는 `~/.claude/settings.json`을 수정 -- 실제 user 파일이므로 E2E에서 직접 테스트하면 side effect 위험
- `load-context`는 `process.stdout.write` + `process.exit(0)` -> `cliRaw()`로 raw output 캡처 후 JSON.parse

## Previous Generation Reference

gen-056: `reap update` 실행 시 `registerSessionHooks()` 호출 추가. fitness: "simple fix, correctly applied".
이번 generation은 gen-056에서 추가된 기능의 E2E 검증.

## Backlog Review

- `fix-migrate-update-tests.md` (medium) -- pre-existing test failure 5건. 이번 generation에서 새 테스트만 작성하되, 기존 failure에 영향받지 않도록 별도 파일로 분리.
- `daemon-e2e-tests.md`, `strict-merge-mode-bypass-for-merge-gen.md` -- 이번과 무관.

## Context for This Generation

### Clarity Level: HIGH

목표 명확, backlog에 검증 항목이 구체적으로 정의됨, 기존 패턴 확인 완료.

### 테스트 전략

| # | 검증 항목 | 방법 | 파일 |
|---|----------|------|------|
| 1 | `load-context` REAP 프로젝트에서 JSON 출력 | `cliRaw(dir, "load-context")` -> JSON.parse -> hookSpecificOutput 확인 | update-path.test.ts |
| 2 | `load-context` 비-REAP에서 silent exit | `cliRaw(tmpDir, "load-context")` -> 빈 출력 | update-path.test.ts |
| 3 | CLAUDE.md legacy -> marker 업그레이드 | setupProject -> 마커 제거 (레거시 형태) -> update -> 마커 존재 확인 | update-path.test.ts |
| 4 | CLAUDE.md 이미 최신이면 skip | update 2회 실행 -> changes 비어있음 | update-path.test.ts |
| 5 | CLAUDE.md 사용자 커스텀 내용 보존 | 마커 앞/뒤에 사용자 내용 추가 -> update -> 보존 확인 | update-path.test.ts |
| 6 | 전체 lifecycle 정상 동작 | 이미 `tests/scenario/lifecycle.test.ts`에서 커버 -> 중복 불필요 | - |
| 7 | `registerSessionHooks` | user-level 파일 문제 -> scope 외 (unit test는 이미 충분) | - |

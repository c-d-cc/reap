# Learning

## Project Overview

REAP는 AI-인간 협업 개발 파이프라인. 이번 generation은 `reap update` 실행 시 CLAUDE.md의 REAP 섹션이 템플릿 변경을 반영하지 못하는 문제를 해결한다.

## Source Backlog

**claude-md-template-sync.md** (medium priority)

`ensureClaudeMd()`는 CLAUDE.md에 `.reap/genome/` 문자열이 존재하면 "skipped"을 반환하여, 템플릿이 변경되어도 기존 REAP 섹션이 업데이트되지 않는다. gen-053에서 CLAUDE.md 내용이 크게 변경되었으나 (SessionStart 자동 로딩 안내로 전환) 기존 프로젝트에 전파되지 않는다.

## Key Findings

### 현재 동작

1. **`ensureClaudeMd()`** (`src/cli/commands/init/common.ts:147`):
   - 템플릿 `src/templates/claude-md-section.md`를 읽음
   - root CLAUDE.md와 `.claude/CLAUDE.md` 양쪽을 확인
   - **어느 쪽이든 `.reap/genome/` 문자열이 포함되어 있으면 "skipped" 반환** -- 내용 비교 없음
   - 호출 위치: `initCommon()`, `update.ts`, `repair.ts`, `fix.ts`, `migrate.ts`

2. **CLAUDE.md 위치**: 두 곳 존재 가능
   - `CLAUDE.md` (root) -- 현재 REAP 자체 프로젝트에서 사용 (full content)
   - `.claude/CLAUDE.md` -- 현재 간략 안내만 존재

3. **템플릿** (`src/templates/claude-md-section.md`): REAP 섹션 내용 (~30줄). `## REAP` 헤더로 시작. 경계 마커 없음.

4. **fix.ts의 감지 로직** (line 165): `.reap/genome/` 포함 여부로 판단 -- ensureClaudeMd와 동일한 패턴

### 문제점

- 템플릿이 변경되어도 기존 CLAUDE.md의 REAP 섹션이 갱신되지 않음
- REAP 섹션의 경계가 명시되지 않아 교체 범위를 알 수 없음
- fix.ts도 같은 감지 패턴 사용하므로 동일 문제

### 해결 방향 (backlog에서 제안)

1. 템플릿에 `<!-- reap:start -->` / `<!-- reap:end -->` 경계 마커 추가
2. 마커에 컨텐츠 해시를 포함하여 변경 감지: `<!-- reap:start v{hash} -->`
3. `ensureClaudeMd()`에서: 마커 존재 시 해시 비교 -> 불일치 시 섹션 교체
4. 사용자 커스텀 내용 (마커 밖)은 보존

### 영향 범위

- `src/templates/claude-md-section.md` -- 마커 추가
- `src/cli/commands/init/common.ts` -- `ensureClaudeMd()` 로직 개선, 반환값에 "updated" 추가
- `src/cli/commands/update.ts` -- "updated" 반환값 처리
- `src/cli/commands/fix.ts` -- 감지 로직을 마커 기반으로 변경
- `CLAUDE.md` (root) -- dogfooding: 마커 적용
- `.claude/CLAUDE.md` -- dogfooding: 마커 적용
- 테스트: `ensureClaudeMd`에 대한 unit test 신규 작성

### 기존 프로젝트 하위 호환성

- 마커가 없는 기존 CLAUDE.md: 레거시 감지 (`## REAP` 또는 `.reap/genome/`) -> 해당 영역을 마커 포함 새 섹션으로 교체
- 마커가 있지만 해시 일치: skip
- 마커가 있고 해시 불일치: 마커 사이 내용만 교체

## Previous Generation Reference

gen-053에서 SessionStart hook (`reap load-context`) 구현 완료. CLAUDE.md 내용을 크게 변경 (파일 목록 9개 -> 자동 로딩 안내 + fallback). 이 변경이 기존 프로젝트에 전파되지 않는 것이 이번 문제의 직접 원인.

## Backlog Review

| Item | Type | Priority |
|------|------|----------|
| daemon-e2e-tests | task | medium |
| evolve-subagent-continuation | task | high |
| fix-migrate-update-tests | task | medium |
| strict-merge-mode-bypass-for-merge-gen | task | medium |

이번 generation과 직접 관련 없음.

## Context for This Generation

- **Clarity**: HIGH -- backlog에 문제/해결책이 구체적이고, 변경 대상 파일이 명확
- **Generation type**: embryo -- genome 자유 수정 가능
- **Dogfooding 주의**: `src/templates/claude-md-section.md` <-> `CLAUDE.md` 동기화 필수 (application.md Dog-fooding 섹션)

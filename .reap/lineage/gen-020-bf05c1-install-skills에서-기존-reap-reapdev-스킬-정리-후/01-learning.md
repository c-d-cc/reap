# Learning — gen-020-bf05c1

## Source Backlog

**install-skills에서 기존 reap/reapdev 스킬 정리 후 설치하도록 개선**

`installSkills()`가 새 스킬 파일을 복사만 하고, 기존에 설치된 reap/reapdev 스킬을 정리하지 않음.
- 이름이 변경된 스킬(reap.localInstall → reapdev.localInstall)의 구 파일이 남음
- 삭제된 스킬(reap.restart)이 계속 남아 유저에게 노출됨
- `~/.claude/commands/`에 stale 스킬이 누적되는 문제

## Project Overview

REAP CLI의 `install-skills` 커맨드는 `src/adapters/claude-code/install.ts`의 `installSkills()` 함수를 호출하여 `src/adapters/claude-code/skills/` 디렉토리의 `.md` 스킬 파일들을 `~/.claude/commands/`에 복사한다.

## Key Findings

### 현재 코드 분석 (`install.ts`)

1. **SKILLS_DIR 결정**: bundled(`dist/`) vs dev(`src/`) 모드에 따라 소스 디렉토리를 결정
2. **단순 복사만 수행**: `readdir` → `.md` 필터 → `cp`로 덮어쓰기. cleanup 로직 없음
3. **사용하는 fs API**: `readdir`, `cp` (from `fs/promises`), `ensureDir` (from `core/fs.ts`)

### 현재 스킬 파일 목록 (21개)

- `reap.*.md` — 16개 (abort, back, config, evolve, help, init, knowledge, merge, next, pull, push, refreshKnowledge, run, start, status, sync)
- `reapdev.*.md` — 5개 (docsUpdate, localInstall, npmInstall, resolveIssue, versionBump)

### 관련 파일 구조

- `src/adapters/claude-code/install.ts` — 수정 대상
- `src/cli/commands/install-skills.ts` — CLI 커맨드 (단순 위임, 변경 불필요)
- `src/core/fs.ts` — `ensureDir`, `fileExists` 등 유틸리티
- `tests/` — 기존 install 관련 테스트 없음 (신규 작성 필요)

### 해결 방안

`installSkills()` 실행 시 새 스킬 복사 전에:
1. `~/.claude/commands/`에서 `reap.*.md` + `reapdev.*.md` 패턴의 기존 파일 스캔
2. 해당 파일들 삭제 (stale 파일 정리)
3. 새 스킬 파일 복사

`fs/promises`의 `unlink`를 사용하여 삭제. 패턴 매칭은 `readdir` 결과에서 정규식으로 필터링.

## Previous Generation Reference

gen-019에서 submodule dirty check 스크립트 로직 구현. completion + push에서 강제 차단. 164 tests 통과.

## Backlog Review

- [task] 기존 reap 프로젝트에 CLAUDE.md 추가 (migration) — 이번 generation과 무관

## Context for This Generation

- **Clarity**: High — 목표가 명확하고 변경 범위가 좁음 (단일 함수 수정)
- **Maturity**: embryo
- **Risk**: 낮음. 기존 파일 삭제 후 새 파일 복사하는 단순한 로직 변경

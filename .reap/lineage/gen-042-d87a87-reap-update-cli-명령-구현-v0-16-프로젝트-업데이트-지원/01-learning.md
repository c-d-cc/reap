# Learning

## Project Overview

REAP v0.16.0 CLI 도구. `reap update` 명령이 아직 없다. 현재 `/reap.update` skill은 `reap init --migrate`를 직접 호출하는데, 이는 v0.15->v0.16 migration만 처리한다. v0.16 프로젝트가 새 REAP 버전으로 업데이트했을 때 프로젝트 동기화(config 새 필드, 새 디렉토리, CLAUDE.md 보수 등)가 필요하지만 이를 수행하는 명령이 없다.

## Key Findings

### 현재 상태
- `src/cli/index.ts`: 10개 명령 라우팅 (init, status, run, make, cruise, install-skills, fix, destroy, clean, check-version). `update` 명령 없음.
- `reap.update.md` skill: 단순히 `reap init --migrate` 실행 안내만 제공.
- `postinstall.sh`: `install-skills` + `check-version` 실행. skills 재설치와 reap-guide 갱신은 여기서 이미 처리됨.

### 재사용 가능 코드
- `src/cli/commands/init/common.ts`:
  - `ensureClaudeMd()` -- CLAUDE.md REAP 섹션 확인/보수 (created/appended/skipped 반환)
  - `initCommon()` -- 디렉토리 생성 + 기본 파일 작성 (init 전용, update에는 부분만 필요)
- `src/core/integrity.ts`:
  - `detectV15()` -- v0.15 감지 (principles.md 존재 여부)
  - `checkIntegrity()` -- 구조 진단 (디렉토리, 파일, config 등)
- `src/core/paths.ts`: `createPaths()` -- 모든 경로 상수
- `src/core/fs.ts`: `ensureDir()`, `readTextFile()`, `writeTextFile()`, `fileExists()`

### config.yml 현재 필드
`ReapConfig` 인터페이스: `project`, `language`, `autoSubagent`, `strict`, `agentClient`, `autoUpdate`, `cruiseCount?`

### v0.16 필수 디렉토리 (initCommon 기준)
genome, environment, environment/domain, environment/resources, environment/docs, life, life/backlog, lineage, vision, vision/docs, vision/memory, hooks

### postinstall이 이미 처리하는 것
- skills 재설치 (install-skills)
- reap-guide.md 갱신 (installReapGuide in install.ts)
- agent definitions 설치 (installAgents)
- legacy cleanup hooks

## Previous Generation Reference

gen-041: environment에 resources/, docs/ 디렉토리 추가. paths.ts에 경로 추가, init/migrate에서 해당 디렉토리 생성. 406 tests pass.

## Backlog Review

소비 대상: `reap-update-cli-명령-구현-v016-프로젝트-업데이트-지원.md` (task, pending, high)

## Context for This Generation

**Clarity: HIGH** -- backlog에 구체적인 solution, files to change, key references가 모두 명시됨.

### update 명령이 해야 할 일 (postinstall이 안 하는 것)
1. v0.15 감지 시 `reap init --migrate`로 위임
2. v0.16 감지 시 프로젝트 동기화:
   - config.yml 새 필드 backfill (누락 필드에 기본값 추가)
   - 새 디렉토리 생성 (있으면 skip)
   - CLAUDE.md REAP 섹션 확인/보수
3. 이미 최신이면 "nothing to update" 메시지

### 주의사항
- postinstall에서 이미 처리되는 skills/reap-guide는 update에서 skip
- embryo generation이므로 genome 자유 수정 가능
- tests/ submodule -- 테스트 추가 시 submodule 안에서 먼저 commit

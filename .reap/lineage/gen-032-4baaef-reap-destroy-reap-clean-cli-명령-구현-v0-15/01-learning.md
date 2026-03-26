# Learning — gen-032-4baaef

## Project Overview

REAP v0.16.0 — TypeScript CLI 도구. file-based state, nonce 기반 lifecycle 무결성, JSON stdout output. 현재 7개 커맨드: init, status, run, make, cruise, install-skills, fix.

## Goal

`reap destroy`와 `reap clean` CLI 명령 구현 (v0.15 패리티).

## Source Backlog

`reap-destroy-reap-완전-제거-명령.md` — REAP 완전 제거 명령. v0.15에서 존재했던 destroy/clean 명령을 v0.16에 포팅.

## Key Findings

### 1. v0.15 destroy 패턴 (97줄)
- `.reap/` 디렉토리 삭제
- Agent adapter를 통한 프로젝트 파일 정리 (CLAUDE.md 등)
- `.gitignore`에서 REAP 관련 항목 제거
- `DestroyResult { removed, skipped }` 인터페이스

### 2. v0.15 clean 패턴 (191줄)
- `CleanOptions { lineage, hooks, genome, backlog }` — 4가지 영역 선택적 정리
- Lineage: compress (epoch 압축) / delete (전체 삭제)
- Life: current.yml + artifact 파일 삭제 (backlog는 별도)
- Hooks: reset (삭제 후 재생성) / keep
- Backlog: delete / keep
- `CleanResult { actions, warnings }` 인터페이스

### 3. v0.16 아키텍처 차이점
- v0.16은 `ReapPaths` 인터페이스 + `createPaths()` 팩토리 (v0.15는 class 기반)
- v0.16은 `AgentRegistry` 없음 — CLAUDE.md 정리를 직접 구현해야 함
- v0.16 fs 유틸리티: `readTextFile`, `writeTextFile`, `fileExists`, `ensureDir`
- v0.16 output: `emitOutput(ReapOutput)`, `emitError(command, message)`
- v0.16 `ReapOutput`은 `status: "prompt"` 지원 — JSON prompt로 확인 요청 가능

### 4. 현재 CLI 등록 패턴 (index.ts)
- `import { execute as xxxExecute } from "./commands/xxx.js"`
- `program.command(...).description(...).option(...).action(async (args) => { await xxxExecute(args); })`
- 모든 command는 `execute()` 함수 export

### 5. 기존 명령 패턴 (fix.ts 참조)
- 비즈니스 로직 함수 + `execute()` CLI entry point 분리
- `execute()`에서 `emitOutput()` 호출
- `--check` 옵션처럼 모드 분기

### 6. CLAUDE.md 정리 방법
- init에서 `getClaudeMdSection()` → `.reap/genome/` 포함 여부로 REAP 섹션 감지
- destroy 시: REAP 섹션(# REAP Project 블록)을 식별하여 제거

### 7. 테스트 패턴 (tests/e2e/fix.test.ts 참조)
- `bun:test` 기반 (describe, test, expect)
- `setupProject()` → temp dir에 init된 프로젝트 생성
- `cli()` → JSON output 파싱
- `afterAll` → `cleanup()` 실행
- 실제 filesystem 사용 (mock 없음)

### 8. 구현 범위 결정

**destroy 명령:**
- `--confirm` 옵션으로 확인 제어
- 확인 없이 실행 시 prompt 반환 (status: "prompt")
- `--confirm` 시 실행: .reap/ 삭제, CLAUDE.md REAP 섹션 제거, .gitignore REAP 항목 제거

**clean 명령:**
- `--lineage`, `--life`, `--backlog`, `--hooks` 옵션으로 직접 지정
- 옵션 없이 실행 시 prompt 반환 (사용 가능한 옵션 안내)
- genome/environment/vision은 건드리지 않음 (프로젝트 지식 보호)

## Previous Generation Reference

gen-031 — Vision Memory 3-tier 시스템 도입 완료. 기존 패턴 활용이 구현 속도를 높인다는 교훈.

## Backlog Review

현재 pending backlog 없음.

## Context for This Generation

- **Clarity**: High — goal이 명확하고 v0.15 reference가 존재하며, 패턴이 잘 확립됨
- **Type**: embryo
- **파일 추가 계획**: `src/cli/commands/destroy.ts`, `src/cli/commands/clean.ts`, `tests/e2e/destroy.test.ts`, `tests/e2e/clean.test.ts`
- **파일 수정 계획**: `src/cli/index.ts` (커맨드 등록)

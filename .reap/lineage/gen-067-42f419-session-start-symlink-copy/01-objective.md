# Objective

## Goal
session-start.cjs에서 Claude Code 프로젝트 커맨드 설치 시 symlink 대신 파일 복사(cp)로 변경

## Completion Criteria
- session-start.cjs의 Step 0에서 `fs.symlinkSync` 대신 `fs.copyFileSync` 사용
- 기존 symlink가 있는 경우 정상적으로 실제 파일로 교체
- 세션 시작 시 프로젝트 `.claude/commands/`에 실제 파일이 설치되어 슬래시 커맨드 인식됨

## Requirements

### Functional Requirements
- `fs.symlinkSync(src, dest)` → `fs.copyFileSync(src, dest)`로 변경
- 기존 symlink 존재 시 삭제 후 복사 (하위 호환)
- 파일 내용이 동일하면 복사 스킵 (불필요한 I/O 방지)

### Non-Functional Requirements
- 기존 로직의 .gitignore 관리는 유지

## Scope
- **Related Genome Areas**: constraints.md (hooks), conventions.md (template conventions)
- **Expected Change Scope**: `src/templates/hooks/session-start.cjs` (Step 0 블록만)
- **Exclusions**: postinstall.cjs, init.ts 등 다른 설치 경로는 변경하지 않음

## Genome Reference
- constraints.md: "Hook 스크립트: src/templates/hooks/"

## Backlog (Genome Modifications Discovered)
None

## Background
Claude Code는 `.claude/commands/`에서 symlink를 따라가지 않고 실제 파일만 인식함.
현재 session-start.cjs가 symlink를 생성하고 있어 슬래시 커맨드가 인식되지 않는 버그 발생.

# Objective

## Goal
스킬 로딩 최적화 Phase 1 — ~/.reap/commands + session hook symlink

## Completion Criteria
1. `~/.reap/commands/`에 커맨드 파일이 설치된다 (reap init/update)
2. `~/.claude/commands/reap.*.md`가 redirect 파일로 교체된다 (기존 유저 호환)
3. session-start.cjs가 REAP 프로젝트에서 `.claude/commands/`에 symlink를 생성한다
4. non-REAP 프로젝트에서 reap 스킬이 project-level로 로딩되지 않는다
5. 기존 버전 → 새 버전 update 시 커맨드가 정상 동작한다
6. `bun test` 전체 통과
7. `bunx tsc --noEmit` 통과
8. `npm run build` 성공

## Requirements

### Functional Requirements
- **FR-001**: `ReapPaths`에 `~/.reap/commands/` 경로 추가
- **FR-002**: `ClaudeCodeAdapter.installCommands()`가 `~/.reap/commands/`에 원본 설치 + `~/.claude/commands/`에 redirect 파일 생성
- **FR-003**: `session-start.cjs`에서 .reap/ 감지 시 프로젝트 `.claude/commands/`에 `~/.reap/commands/reap.*.md` symlink 생성
- **FR-004**: `reap update` 시 기존 `~/.claude/commands/reap.*.md` (원본)을 redirect로 교체하는 마이그레이션
- **FR-005**: 프로젝트 `.gitignore`에 `.claude/commands/reap.*` 자동 추가 (symlink가 git에 들어가지 않도록)

### Non-Functional Requirements
- **NFR-001**: 기존 유저가 update 시 즉시 broken 되지 않아야 함 (redirect로 병행)
- **NFR-002**: symlink 생성은 session start 시에만 (런타임 비용 최소)

## Scope
- **Related Genome Areas**: constraints.md (CLI), conventions.md (Template Conventions)
- **Expected Change Scope**: `src/core/paths.ts`, `src/core/agents/claude-code.ts`, `src/cli/commands/init.ts`, `src/cli/commands/update.ts`, `src/templates/hooks/session-start.cjs`
- **Exclusions**: Phase 2 (redirect 삭제)는 다음 minor에서 처리. OpenCode adapter는 이번 범위 외.

## Genome Reference
- `constraints.md` — Agent adapters, postinstall
- `conventions.md` — Template Conventions

## Backlog (Genome Modifications Discovered)
None

## Background
- 24개 reap.*.md가 ~/.claude/commands/에 설치 → non-REAP 프로젝트에서도 스킬 매칭 비용
- 유저와 합의: ~/.reap/commands/ 소스 + session hook symlink + Phase 1 redirect 병행

# Objective

## Goal
CLI 에이전트 추상화 레이어(AgentAdapter) 구축 + OpenCode 지원 추가

CLI client(Claude Code, OpenCode, Codex CLI 등)를 추상화하여, 다양한 AI 코딩 에이전트를 플러그인 방식으로 지원하는 구조로 리팩토링한다. 버전 0.2.0 릴리스.

## Completion Criteria
1. `AgentAdapter` 인터페이스가 정의되고, Claude Code / OpenCode 구현체가 존재
2. `reap init` 시 설치된 에이전트를 자동 감지하여 해당 에이전트에 커맨드/훅 설치
3. `reap update` 시 감지된 모든 에이전트에 동기화
4. OpenCode에서 `/reap.status` 슬래시 커맨드가 정상 동작
5. 기존 Claude Code 사용자의 동작이 변경 없이 유지 (하위 호환)
6. `bun test` 통과, `bunx tsc --noEmit` 통과, `npm run build` 성공

## Requirements

### Functional Requirements
- **FR-001**: `AgentAdapter` 인터페이스 — 커맨드 설치/제거, 훅 등록/해제, 설정 읽기 추상화
- **FR-002**: `ClaudeCodeAdapter` — 기존 로직을 어댑터로 이관
- **FR-003**: `OpenCodeAdapter` — `~/.config/opencode/commands/`, 플러그인 시스템 지원
- **FR-004**: 에이전트 자동 감지 — `which claude`, `which opencode` 등으로 설치 여부 판단
- **FR-005**: `reap init`/`update` 멀티 에이전트 설치 — 감지된 모든 에이전트에 커맨드/훅 설치
- **FR-006**: `config.yml`에 `agents` 필드 추가 (선택적 오버라이드)
- **FR-007**: 향후 확장 지원 — 새 어댑터 추가 시 인터페이스 구현만으로 가능한 구조

### Non-Functional Requirements
- 하위 호환: Claude Code만 사용하는 기존 프로젝트가 동일하게 동작
- Validation은 사용자가 수동으로 확인

## Scope
- **Related Genome Areas**: principles.md (ADR-004), conventions.md (Template Conventions), constraints.md (Constraints)
- **Expected Change Scope**: `src/core/` (새 adapter 모듈), `src/cli/commands/init.ts`, `update.ts`, `src/core/paths.ts`, `src/core/hooks.ts`, `src/templates/hooks/`
- **Exclusions**: Codex CLI 등 다른 에이전트의 실제 구현 (구조만 확장 가능하게), 슬래시 커맨드 내용 변경

## Genome Reference
- principles.md: ADR-004 (Claude Code 하드코딩 → 멀티 에이전트 추상화 필요)
- conventions.md: Template Conventions (에이전트별 경로 분리 필요)
- constraints.md: Constraints 섹션 (에이전트별 경로 분리 필요)
- domain/hook-system.md: SessionStart hook 등록 방식 에이전트별 분기 필요

## Backlog (Genome Modifications Discovered)
- `genome-adr004-multi-agent.md` — ADR-004 멀티 에이전트 추상화로 변경
- `genome-constraints-multi-agent.md` — constraints.md Claude Code 하드코딩 제거
- `genome-conventions-multi-agent.md` — conventions.md Template Conventions 멀티 에이전트 반영

## Background
- gen-024: README 번역 + 릴리스 (v0.1.3)
- 현재 REAP는 Claude Code에 완전 종속 — `~/.claude/commands/`, `~/.claude/settings.json` 하드코딩
- OpenCode가 유사한 구조(markdown 슬래시 커맨드, 플러그인 훅)를 제공하여 추상화 가능
- 향후 Codex CLI 등 추가 에이전트 지원을 고려한 확장 가능 설계 필요

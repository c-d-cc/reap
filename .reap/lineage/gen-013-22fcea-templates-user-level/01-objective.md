# Objective

## Goal
artifact templates + domain guide를 ~/.reap/templates/로 이전

## Completion Criteria
1. `reap init` 시 artifact templates가 `~/.reap/templates/`에 복사됨
2. `reap update` 시 templates가 최신으로 동기화됨
3. 모든 slash command 프롬프트가 `~/.reap/templates/`를 참조
4. `reap init` 시 프로젝트 `.reap/genome/domain/`에 README.md를 더 이상 복사하지 않음
5. domain guide가 `~/.reap/templates/domain-guide.md`에 설치됨
6. `bun test` 통과

## Requirements

### Functional Requirements
- FR-001: `~/.reap/templates/` 경로를 paths.ts에 추가
- FR-002: init 시 artifact templates(01~05) + domain-guide.md를 `~/.reap/templates/`에 복사
- FR-003: update 시 `~/.reap/templates/` 동기화
- FR-004: init 시 프로젝트 `domain/README.md` 복사 제거
- FR-005: 5개 slash command 프롬프트의 `.reap/templates/` → `~/.reap/templates/` 경로 변경
- FR-006: completion 프롬프트의 domain guide 참조 경로 변경

### Non-Functional Requirements
- 기존 테스트 하위 호환 유지

## Scope
- **Related Genome Areas**: constraints.md
- **Expected Change Scope**: paths.ts, init.ts, update.ts, reap.objective.md, reap.planning.md, reap.implementation.md, reap.validation.md, reap.completion.md
- **Exclusions**: reap-guide.md 변경 없음

## Background
- backlog 01-templates-user-level.md에서 이전

# Objective

## Goal

Genome staleness 감지 로직 개선 — 소스 코드와 무관한 커밋(docs, README 등)이 staleness 카운트에 포함되어 오탐이 발생하는 문제를 수정한다.

## Completion Criteria

- CC-1: docs-only 커밋이 10개 이상 쌓여도 staleness 경고가 발생하지 않는다
- CC-2: src/ 또는 코드 관련 파일이 변경된 커밋이 10개 이상일 때만 경고가 발생한다
- CC-3: 기존 테스트가 모두 통과한다 (`bun test`)
- CC-4: TypeScript 컴파일이 성공한다 (`bunx tsc --noEmit`)

## Requirements

### Functional Requirements

- FR-001: `session-start.sh`의 staleness 감지 시 `git rev-list --count`에 코드 관련 경로 필터를 적용한다
- FR-002: 필터 대상 경로: `src/`, `tests/`, `package.json`, `tsconfig.json`, `scripts/` 등 코드 관련 파일
- FR-003: v0.2.2 version bump (package.json) 및 템플릿 동기화

### Non-Functional Requirements

- 기존 hook 성능(10x 최적화된 상태)을 유지한다
- session-start.sh의 추가 실행 시간이 무시할 수 있는 수준이어야 한다

## Scope
- **Related Genome Areas**: constraints.md (Validation Commands), domain/hook-system.md
- **Expected Change Scope**: `src/templates/hooks/session-start.sh` (staleness 감지 로직), `package.json` (version bump)
- **Exclusions**: reap-guide.md 변경 없음, 다른 hook 이벤트 변경 없음

## Genome Reference

- domain/hook-system.md: SessionStart Hook 규칙
- constraints.md: Validation Commands

## Backlog (Genome Modifications Discovered)
None

## Background

- 최근 13 커밋 중 대부분이 docs 변경이었으나 staleness 경고가 발생
- 현재 로직: `git log -1 --format="%H" -- ".reap/genome/"` → `git rev-list --count "${last_genome_commit}..HEAD"`
- 문제: 모든 커밋을 카운트하여 코드 무관 커밋도 포함
- gen-026에서 session-start hook 10x 성능 최적화가 이루어진 상태

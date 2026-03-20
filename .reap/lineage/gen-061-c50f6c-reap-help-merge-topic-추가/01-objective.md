# Objective

## Goal
reap.help merge/collaboration topic 추가 + help 최신화 hook

## Completion Criteria
1. `/reap.help merge`가 merge 워크플로우 설명을 출력한다
2. `/reap.help pull`, `/reap.help push`가 해당 커맨드 설명을 출력한다
3. Basic Help 커맨드 테이블에 collaboration 커맨드가 포함된다
4. `docs-update` hook에서 `reap.help.md` topic 최신화도 함께 수행한다
5. `bun test` 통과
6. `bunx tsc --noEmit` 통과
7. `npm run build` 성공

## Requirements

### Functional Requirements
- **FR-001**: `reap.help.md` topic 목록에 merge, pull, push, collaboration topic 추가
- **FR-002**: Basic Help 커맨드 테이블에 collaboration 커맨드 (pull, push, merge) 추가
- **FR-003**: `docs-update` hook에 help topic 최신화 체크 항목 추가

### Non-Functional Requirements
없음

## Scope
- **Related Genome Areas**: constraints.md (Slash Commands)
- **Expected Change Scope**: `src/templates/commands/reap.help.md`, `.reap/hooks/onGenerationComplete.docs-update.md`
- **Exclusions**: merge 커맨드 자체 변경 없음

## Genome Reference
- `constraints.md` — Slash Commands 목록

## Backlog (Genome Modifications Discovered)
None

## Background
- `/reap.help merge` 실행 시 "Unknown topic" 응답 — merge/collaboration topic 누락
- 커맨드 테이블에 collaboration 커맨드 없음 (pull, push, merge.*)
- help topic은 수동 관리 → docs-update hook에서 자동 체크 필요

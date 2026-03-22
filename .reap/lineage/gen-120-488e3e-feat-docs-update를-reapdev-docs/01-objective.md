# Objective

## Goal
`onLifeCompleted.docs-update.md` hook의 docs 업데이트 로직을 `reapdev.docsUpdate` 독립 스킬로 추출하고, 기존 hook은 해당 스킬을 호출하는 1줄 wrapper로 변경.

## Completion Criteria
1. `src/templates/commands/reapdev.docsUpdate.md` 파일이 생성되어 기존 hook body 내용을 포함
2. `.reap/hooks/onLifeCompleted.docs-update.md`가 스킬 호출 1줄 wrapper로 변경 (frontmatter 유지)
3. `src/cli/commands/init.ts`의 COMMAND_NAMES에 `"reapdev.docsUpdate"` 추가
4. 기존 docs-update 로직의 모든 섹션이 스킬에 보존됨

## Requirements

### Functional Requirements
1. FR-1: 새 스킬 파일 `reapdev.docsUpdate.md` 생성 (description frontmatter 포함)
2. FR-2: hook body를 스킬로 이동 (버전 수준별 동작, Full Scan, Help Topic, i18n, 프리뷰 등 전체)
3. FR-3: hook을 `/reapdev.docsUpdate` 스킬 호출 wrapper로 변경
4. FR-4: COMMAND_NAMES 배열에 등록

### Non-Functional Requirements
1. NFR-1: hook의 condition/order frontmatter 유지

## Design

### Selected Design
단순 추출: hook body → 스킬 파일로 이동, hook은 1줄 호출로 대체. 기존 패턴과 동일.

## Scope
- **Related Genome Areas**: hooks, commands
- **Expected Change Scope**: 3개 파일 (신규 1, 수정 2)
- **Exclusions**: 로직 변경 없음, 순수 추출만

## Genome Reference
없음 (단순 리팩터링)

## Backlog (Genome Modifications Discovered)
None

## Background
`reapdev.*` 스킬은 REAP 개발용 커맨드로, hook에서 독립적으로도 실행 가능하게 분리하는 패턴.

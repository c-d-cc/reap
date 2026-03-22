# Objective

## Goal
fix: docs에서 reapdev.* 커맨드 제거 — 개발자 전용 커맨드는 공개 문서에 포함하면 안 됨

## Completion Criteria
1. CC-1: README.md, README.ko.md, README.ja.md, README.zh-CN.md에 reapdev.* 관련 행 및 "Dev Commands" 소섹션이 없음
2. CC-2: src/templates/help/en.txt, ko.txt에 reapdev.* 관련 줄이 없음
3. CC-3: docs/src/i18n/translations/{en,ko,ja,zh-CN}.ts에 reapdev.* 항목이 없음
4. CC-4: reap.refreshKnowledge는 모든 파일에서 유지됨
5. CC-5: src/templates/commands/reapdev.*.md 파일 자체는 삭제되지 않음

## Requirements

### Functional Requirements
1. FR-1: README 4개 파일에서 "Dev Commands" 소섹션(헤더, 테이블 헤더, reapdev 행, 빈 줄) 제거
2. FR-2: help 텍스트 2개 파일에서 reapdev.docsUpdate, reapdev.versionBump 줄 제거
3. FR-3: docs i18n translations 4개 파일에서 reapdev.* 배열 항목 제거

### Non-Functional Requirements
없음

## Design

### Selected Design
단순 텍스트 제거 작업. 10개 파일에서 reapdev.* 관련 내용만 정확히 제거.

## Scope
- **Related Genome Areas**: constraints.md (Slash Commands 섹션에 reapdev.* 기록 있으나, genome은 이번에 수정하지 않음)
- **Expected Change Scope**: README 4개, help 2개, i18n translations 4개 = 10개 파일
- **Exclusions**: src/templates/commands/reapdev.*.md 파일 삭제 금지, src/cli/commands/init.ts의 COMMAND_NAMES 유지

## Genome Reference
constraints.md: reapdev.docsUpdate, reapdev.versionBump은 개발자 전용 커맨드

## Backlog (Genome Modifications Discovered)
None

## Background
gen-123에서 /reapdev.docsUpdate, /reapdev.versionBump를 공개 문서에 추가했으나, reapdev.* 커맨드는 REAP 개발자 전용이므로 공개 문서에 포함하면 안 됨.

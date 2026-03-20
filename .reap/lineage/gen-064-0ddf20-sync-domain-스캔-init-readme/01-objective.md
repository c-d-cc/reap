# Objective

## Goal
reap.sync domain 스캔 카테고리 추가 + init domain README 생성

## Completion Criteria
1. reap.sync Step 2에 Domain Knowledge 분석 카테고리가 포함된다
2. reap.sync Step 3에 Domain gaps 항목이 포함된다
3. reap init adoption 시 domain/README.md 힌트 파일이 생성된다
4. bun test, tsc, build 통과

## Requirements

### Functional Requirements
- **FR-001**: reap.sync.md에 Domain Knowledge 스캔 카테고리 추가
- **FR-002**: genome-sync.ts에 domain/README.md 자동 생성

## Scope
- **Expected Change Scope**: `src/templates/commands/reap.sync.md`, `src/core/genome-sync.ts`

## Background
- reap-marketing에서 reap.sync 실행 시 genome/domain/ 생성이 누락됨
- AI가 domain/가 비어있으면 "불필요"로 판단하고 건너뛰는 문제

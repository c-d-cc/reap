# Objective

## Goal
env var → $ARGUMENTS argv 마이그레이션

## Completion Criteria
- 모든 process.env.REAP_* 참조가 source에서 완전 제거
- argv 기반 positional/flag 파싱으로 대체
- slash command 템플릿이 $ARGUMENTS 패턴 사용
- 모든 테스트 통과
- genome conventions.md 업데이트

## Requirements

### Functional Requirements
- argv 기반 goal/branch/stage 전달
- flag 기반 option 전달

### Non-Functional Requirements
- 하위 호환 불필요

## Design

### Selected Design
CLI entry point에서 argv를 수집하여 command에 전달, 각 command에서 positional/flag 파싱

## Scope
- **Related Genome Areas**: conventions.md line 54
- **Expected Change Scope**: 6 source, 6 template, tests
- **Exclusions**: 다른 run commands

## Genome Reference
conventions.md line 54

## Backlog (Genome Modifications Discovered)
None

## Background
$ARGUMENTS argv 지원이 더 자연스러운 인터페이스

# Objective

## Goal

docs 구조를 개선한다. Advanced 페이지에서 "다른 도구와의 비교" 섹션을 별도 Comparison 페이지로 분리하고, sidebar 메뉴 구조를 재구성한다.

## Completion Criteria

- [ ] Comparison 페이지가 독립 페이지로 존재하고 en/ko 번역 완료
- [ ] Advanced 페이지에서 비교 섹션 제거
- [ ] Sidebar 메뉴 구조 변경: Guide 그룹 (Core Concepts, Workflow, Advanced), 기타 그룹 (Configuration)
- [ ] 모든 라우트 정상 동작

## Requirements

### Functional Requirements

1. Comparison 페이지: `/docs/comparison` 경로, Advanced에서 비교 관련 번역 키 이동
2. Sidebar 그룹 재구성:
   - Getting Started: Introduction, Quick Start
   - Guide: Core Concepts, Workflow, Advanced
   - Reference: CLI Reference, Command Reference, Hook Reference, Comparison
   - 기타: Configuration

### Non-Functional Requirements

없음

## Scope
- **Expected Change Scope**: `docs/src/` 내 페이지 추가, sidebar 구조 변경, 번역 파일 수정
- **Exclusions**: docs 외 소스코드

## Backlog (Genome Modifications Discovered)
None

## Background

gen-021에서 i18n 구현 완료. 이번 Generation은 문서 구조 개선.

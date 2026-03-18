# Objective

## Goal

Generation complete 시 자동 version bump 판단 — patch는 AI 자동, minor/major는 유저 확인

## Completion Criteria

- CC-1: `onGenerationComplete` hook에 version bump 판단 prompt가 추가되어 있다
- CC-2: patch 수준 변경 시 AI가 자동으로 `npm version patch --no-git-tag-version` 실행
- CC-3: minor/major 수준 변경 시 AI가 유저에게 확인을 요청
- CC-4: version bump hook이 기존 hook들(reap update, docs, release notes) 앞에 위치
- CC-5: 기존 테스트 통과 (`bun test`)

## Requirements

### Functional Requirements

- FR-001: `.reap/config.yml`의 `onGenerationComplete` hooks 첫 번째 항목으로 version bump 판단 prompt 추가
- FR-002: prompt 내용: 최근 generation의 lineage artifacts를 읽고, 변경 유형을 분류(patch/minor/major)
- FR-003: patch → 자동 적용, minor/major → 유저 확인 후 적용
- FR-004: `npm version {type} --no-git-tag-version`으로 package.json만 수정 (커밋/태그 생성 안 함)

### Non-Functional Requirements

- 기존 hook 순서(reap update → docs → release notes) 유지
- version bump 결과를 후속 hook이 참조 가능해야 함 (release notes가 버전 차이 감지)

## Scope
- **Related Genome Areas**: domain/hook-system.md, conventions.md (Release Conventions)
- **Expected Change Scope**: `.reap/config.yml` (hook 추가)
- **Exclusions**: REAP 패키지 소스 코드 변경 없음. 이 프로젝트의 config.yml 변경만.

## Genome Reference

- domain/hook-system.md: onGenerationComplete event 규칙
- conventions.md: Release Conventions — 릴리스 흐름, 버전 주입

## Backlog (Genome Modifications Discovered)
None

## Background

- gen-029에서 수동으로 v0.2.2 version bump 수행
- 매 generation마다 수동 판단은 비효율적
- onGenerationComplete hook의 prompt로 AI가 판단하면 자동화 가능
- 현재 hook 순서: reap update → docs update → release notes
- version bump는 이들 앞에 위치해야 후속 hook이 새 버전 참조 가능

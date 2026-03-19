# Objective

## Goal

Hook suggestion 로직 + stale genome 수정 + sync Level 1 기계적 체크

## Completion Criteria

- CC-1: `reap.completion.md`에 Hook Suggestion Phase가 추가되고, 반복 패턴 감지 시 유저에게 동작/조건을 상세히 물어 확인받는 플로우가 포함
- CC-2: `domain/hook-system.md`가 파일 기반 hooks 구조({event}.{name}.{ext})를 반영
- CC-3: `constraints.md`의 Hooks 섹션이 파일 기반 구조를 반영
- CC-4: `session-start.sh`에 source-map component count drift 체크가 추가
- CC-5: 기존 테스트 통과 + tsc + 빌드

## Requirements

### Functional Requirements

- FR-001: `reap.completion.md`에 Phase 5 (Hook Suggestion) 추가
  - 최근 3개 generation의 completion artifacts 분석
  - 반복 패턴 감지 시 유저에게 질문:
    1. "이 작업을 hook으로 자동화할까요?"
    2. "어떤 이벤트에서 실행할까요?" (onGenerationComplete, onStageTransition 등)
    3. "실행 조건은 무엇인가요?" (always, has-code-changes, version-bumped, 커스텀)
    4. "실행 내용을 확인해주세요" (생성될 hook 파일 내용 미리보기)
  - 유저 확인 후 `.reap/hooks/{event}.{name}.md` 생성
- FR-002: `domain/hook-system.md` — 파일 기반 hooks 구조로 업데이트
- FR-003: `constraints.md` Hooks 섹션 — 파일 기반 구조 반영
- FR-004: `session-start.sh` — source-map drift 감지 (core/ 파일 수 vs source-map Component 수 비교)

### Non-Functional Requirements

- Hook suggestion은 completion에서만 1회, 최근 3개 generation만 분석 (과부하 방지)

## Scope
- **Related Genome Areas**: domain/hook-system.md, constraints.md, source-map.md
- **Expected Change Scope**: reap.completion.md, domain/hook-system.md, constraints.md, session-start.sh
- **Exclusions**: sync 명령 자체 리팩토링은 별도 generation

## Genome Reference
- domain/hook-system.md (stale — config.yml 기반 기술 중)
- constraints.md (Hooks 섹션 stale)

## Backlog (Genome Modifications Discovered)
None

## Background
- gen-031/032에서 hooks를 파일 기반으로 전환했으나 genome 문서가 미반영
- sync는 현재 AI 전적 주관 — Level 1 기계적 체크로 drift 힌트 제공 가능
- hook suggestion은 completion 단계에서 경량 분석으로 과부하 없이 구현

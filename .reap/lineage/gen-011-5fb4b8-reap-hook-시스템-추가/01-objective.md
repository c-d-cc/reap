# Objective

## Summary
- **Goal**: REAP hook 시스템 추가 + reap-wf onGenerationComplete hook으로 auto-update 적용

## Goal
REAP lifecycle 이벤트에 프로젝트별 hook을 정의할 수 있는 시스템을 추가한다. 이를 활용하여 reap-wf 프로젝트에서 generation 완료 시 자동으로 `reap update`를 실행하도록 한다.

## Completion Criteria
- [ ] `.reap/config.yml`에 hooks 섹션 지원 (onGenerationStart, onStageTransition, onGenerationComplete, onRegression)
- [ ] slash command 스크립트(reap.next, reap.start, reap.back)에서 해당 시점에 hook 실행 지시
- [ ] reap-wf 프로젝트의 `.reap/config.yml`에 onGenerationComplete hook 등록 (reap update)
- [ ] `.claude/hooks.json`의 기존 Bash hook 제거
- [ ] `~/.bun/bin/bun test` 전체 통과
- [ ] `~/.bun/bin/bunx tsc --noEmit` 통과

## Requirements

### Functional Requirements
- **FR-001**: config.yml hooks 스키마 — hooks 섹션에 4개 이벤트 지원, 각 이벤트에 command 배열
- **FR-002**: `/reap.start.md` — generation 생성 후 `onGenerationStart` hook 실행 지시 추가
- **FR-003**: `/reap.next.md` — stage 전환 후 `onStageTransition` hook, archiving 완료 후 `onGenerationComplete` hook 실행 지시 추가
- **FR-004**: `/reap.back.md` — regression 후 `onRegression` hook 실행 지시 추가
- **FR-005**: `/reap.evolve.md` — hook 실행은 개별 command에 위임 (evolve 자체는 변경 불필요할 수 있음)
- **FR-006**: reap-wf `.reap/config.yml`에 onGenerationComplete hook 등록
- **FR-007**: reap-wf `.claude/hooks.json`에서 기존 Bash hook 제거
- **FR-008**: types/index.ts에 ReapConfig hooks 타입 추가
- **FR-009**: reap-guide.md에 hook 시스템 설명 추가

### Non-Functional Requirements
- 기존 테스트 유지
- hook 실행은 에이전트가 수행 (CLI에 실행 로직 불필요)

## Scope
- **Expected Change Scope**: `src/types/index.ts`, `src/templates/commands/reap.start.md`, `src/templates/commands/reap.next.md`, `src/templates/commands/reap.back.md`, `src/templates/hooks/reap-guide.md`, `.reap/config.yml`, `.claude/hooks.json`
- **Exclusions**: CLI 코어에 hook 실행 로직 추가 없음 (slash command에서 에이전트가 실행)

## Background
- Claude Code hooks로는 REAP lifecycle 이벤트를 정확히 감지하기 어려움 (모든 Bash 실행마다 트리거)
- REAP 자체 hook 시스템으로 프로젝트별 lifecycle 이벤트 처리를 깔끔하게 해결
- 첫 번째 사용 사례: reap-wf에서 generation 완료 시 auto-update

# Objective

## Summary
- **Goal**: CLI evolve 제거 + slash command 체계 개편 (evolve/next/back/start)

## Goal
CLI에서 `reap evolve` 명령어를 제거하고, stage 전환과 generation 관리를 slash command로 이전한다. `/reap.evolve`는 전체 lifecycle 순회 명령어로 재정의한다.

## Completion Criteria
- [ ] CLI에서 `reap evolve` 명령어 제거
- [ ] `/reap.start` slash command 추가 — 새 generation 시작
- [ ] `/reap.next` slash command 추가 — 다음 stage 전환 (current.yml 직접 수정)
- [ ] `/reap.back` slash command 추가 — 이전 stage 전환 (micro loop)
- [ ] `/reap.evolve` slash command 재정의 — 전체 lifecycle 순회
- [ ] 기존 stage command(`/reap.objective` ~ `/reap.completion`) 유지
- [ ] `~/.bun/bin/bun test` 전체 통과
- [ ] `~/.bun/bin/bunx tsc --noEmit` 전체 통과

## Requirements

### Functional Requirements
- **FR-001**: CLI `reap evolve` 제거 — `src/cli/index.ts`에서 evolve command 삭제
- **FR-002**: `src/cli/commands/evolve.ts` 제거 또는 리팩토링 — stage 전환 로직은 유지하되 CLI 진입점만 제거. 로직 자체는 slash command에서 에이전트가 current.yml 직접 수정으로 대체 가능
- **FR-003**: `/reap.start` command 생성 — generation 생성 (기존 evolve의 "Start New Generation" 로직)
- **FR-004**: `/reap.next` command 생성 — stage 전환 (기존 evolve --advance). completion에서 next 시 아카이빙 + 커밋 지시 포함
- **FR-005**: `/reap.back` command 생성 — regression (기존 evolve --back). reason/refs 기록
- **FR-006**: `/reap.evolve` command 재정의 — 전체 lifecycle 순회: 현재 stage 확인 → 해당 stage slash command 실행 → next → 반복 → completion까지
- **FR-007**: `init.ts` COMMAND_NAMES 업데이트 — start, next, back 추가, evolve 유지 (재정의)
- **FR-008**: 테스트 업데이트 — evolve CLI 테스트 → 제거 또는 로직 테스트로 변환

### Non-Functional Requirements
- 기존 통과 테스트 유지 (evolve CLI 테스트 제외)
- generation.ts, lifecycle.ts 등 코어 로직은 변경 없음

## Scope
- **Expected Change Scope**: `src/cli/index.ts`, `src/cli/commands/evolve.ts`, `src/templates/commands/reap.evolve.md`, `src/templates/commands/` (new: reap.start.md, reap.next.md, reap.back.md), `src/cli/commands/init.ts` (COMMAND_NAMES), tests
- **Exclusions**: generation.ts, lifecycle.ts 코어 로직 변경 없음

## Background
- `reap evolve`는 generation 시작/stage 전환/regression 3가지를 하나의 CLI 명령에 담고 있어 복잡
- slash command로 이전하면 에이전트가 더 자연스럽게 workflow를 제어
- `/reap.evolve`를 전체 lifecycle 순회로 재정의하면 사용자는 "목표"만 주고 에이전트가 전체를 관리

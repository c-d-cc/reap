# Planning

## Summary
CLI evolve 제거 + 3개 slash command 신규 (start/next/back) + evolve 재정의. 코어 로직(generation.ts, lifecycle.ts)은 변경 없이 slash command 레벨에서만 변경.

## Technical Context
- **Tech Stack**: TypeScript, Bun, Commander.js
- **Constraints**: generation.ts, lifecycle.ts 코어 로직 변경 없음. slash command는 에이전트가 current.yml을 직접 수정.

## Tasks

### Phase 1: Slash command 생성

- [ ] T001 `src/templates/commands/reap.start.md` 생성 — 새 generation 시작. lineage 확인 → genomeVersion 결정 → current.yml 작성 → 01-objective.md 즉시 생성
- [ ] T002 `src/templates/commands/reap.next.md` 생성 — 다음 stage 전환. current.yml의 stage + timeline 업데이트. completion에서 next 시 아카이빙 + 커밋 지시
- [ ] T003 `src/templates/commands/reap.back.md` 생성 — regression. 사용자에게 reason 요청 → current.yml 업데이트 (from, reason, refs) → 대상 artifact에 Regression 섹션 추가
- [ ] T004 `src/templates/commands/reap.evolve.md` 재정의 — 전체 lifecycle 순회 (현재 stage 확인 → 해당 command 실행 → /reap.next → 반복)

### Phase 2: CLI 변경

- [ ] T005 `src/cli/index.ts` — `evolve` command 제거
- [ ] T006 `src/cli/commands/init.ts` — COMMAND_NAMES에 start, next, back 추가
- [ ] T007 `src/cli/commands/evolve.ts` — 삭제 (로직은 slash command에서 에이전트가 직접 수행)

### Phase 3: 테스트 + hook 업데이트

- [ ] T008 `tests/commands/evolve.test.ts` — 삭제 (CLI evolve 제거)
- [ ] T009 `tests/integration/full-lifecycle.test.ts` — evolve import 변경 (generation.ts 직접 사용)
- [ ] T010 `src/templates/hooks/session-start.sh` — next_cmd 매핑 업데이트 (/reap.evolve → /reap.start)
- [ ] T011 기존 command에서 "reap evolve --advance" 참조 → "/reap.next"로 변경
- [ ] T012 전체 테스트 + 타입체크 통과 확인

## Dependencies
- T001~T004: 독립, 병렬 가능
- T005~T007: 독립, Phase 1과 병렬 가능
- T008~T011: Phase 1, 2 완료 후
- T012: 전체 완료 후

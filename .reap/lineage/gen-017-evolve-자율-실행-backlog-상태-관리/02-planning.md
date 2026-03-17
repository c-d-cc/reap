# Planning

## Summary
evolve에서 호출 시 routine confirmation을 skip하도록 override 지시를 추가하고, backlog frontmatter에 status 필드를 도입하여 아카이빙 시 기계적 이월/삭제 처리를 가능하게 한다. 모든 변경은 슬래시 커맨드 템플릿(md 파일)에 대한 것이며, TypeScript 코드 변경은 없다.

## Technical Context
- **Tech Stack**: Markdown 슬래시 커맨드 템플릿 수정만
- **Constraints**: 코드 변경 없음 → tsc/build는 기존 통과 상태 유지

## Tasks

### Phase 1: evolve 자율 실행 모드 (FR-001~004)
- [ ] T001 `src/templates/commands/reap.evolve.md` — Autonomous Override 섹션 추가: "evolve 컨텍스트에서 각 stage를 호출할 때 routine human confirmation은 skip하고 자율 진행. 판단이 필요한 경우에만 STOP."
- [ ] T002 `src/templates/commands/reap.objective.md` — Completion 섹션에 evolve 분기 추가: "evolve에서 호출된 경우 artifact 확인을 skip하고 자동 진행"
- [ ] T003 `src/templates/commands/reap.planning.md` — 동일 분기 추가
- [ ] T004 `src/templates/commands/reap.completion.md` — evolve 분기 추가 (genome 변경은 자동 적용, validation commands 실행 후 자동 진행)

### Phase 2: backlog 상태 관리 (FR-005~008)
- [ ] T005 `src/templates/commands/reap.start.md` — backlog 선택 시 `status: consumed`, `consumedBy: gen-XXX` 마킹 단계 추가
- [ ] T006 `src/templates/commands/reap.completion.md` — 적용된 genome-change/environment-change에 `status: consumed` 마킹 추가
- [ ] T007 `src/templates/commands/reap.next.md` — 아카이빙 backlog 처리 변경: consumed→lineage, pending→이월
- [ ] T008 `src/templates/commands/reap.objective.md` — 새 backlog 생성 시 `status: pending` 기본값 명시

### Phase 3: 검증
- [ ] T009 `bun test`, `bunx tsc --noEmit`, 빌드 검증

## Dependencies
- T001~T004 독립 (Phase 1 내에서 병렬 가능)
- T005~T008 독립 (Phase 2 내에서 병렬 가능)
- T009는 모든 변경 후

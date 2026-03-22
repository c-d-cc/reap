# Planning

## Summary
Recovery generation 개념을 REAP에 추가. `type: "recovery"` 타입, `recovers` 필드, `/reap.evolve.recovery` 명령어, genome domain 문서화.

## Technical Context
- **Tech Stack**: TypeScript 5.x, Node.js >=18, Commander.js, YAML
- **기존 패턴**: merge generation (`type: "merge"`, `createMergeGeneration()`) 참조
- **Genome 불변 원칙**: 소스 코드 변경은 implementation, genome 반영은 completion에서 backlog consume

## Tasks

### Phase 1: 타입 시스템 확장
- [ ] T001 `src/types/index.ts` -- `GenerationType`에 `"recovery"` 추가, `GenerationState`에 `recovers?: string[]` 추가, `GenerationMeta`에 `recovers?: string[]` 추가

### Phase 2: Generation 생성 로직
- [ ] T002 `src/core/generation.ts` -- `createRecoveryGeneration(goal, genomeVersion, recovers)` 메서드 추가. `type: "recovery"`, `recovers` 필드 설정

### Phase 3: evolve-recovery 명령어
- [ ] T003 `src/cli/commands/run/evolve-recovery.ts` -- 신규 파일. phase 1(review): 대상 generation lineage artifact 로드 + 검토 prompt. phase 2(create): 교정 필요 시 recovery generation 개시 / 불필요 시 종료
- [ ] T004 `src/cli/commands/run/index.ts` -- evolve-recovery 명령어를 run dispatcher에 등록

### Phase 4: 슬래시 커맨드 템플릿
- [ ] T005 `src/templates/commands/reap.evolve.recovery.md` -- 신규. 커맨드 템플릿
- [ ] T006 `src/cli/commands/init.ts` -- `COMMAND_NAMES`에 `"reap.evolve.recovery"` 추가

### Phase 5: Lineage 지원
- [ ] T007 `src/core/generation.ts` -- archive 시 recovery type의 `meta.yml`에 `recovers` 필드 포함

### Phase 6: Genome 반영 (Completion에서 genome-change backlog consume)
- [ ] T008 `.reap/genome/domain/recovery-generation.md` -- 신규. 정의·트리거·프로세스·검토 기준·명령어 흐름
- [ ] T009 `.reap/genome/constraints.md` -- Slash Commands에 `reap.evolve.recovery` 추가
- [ ] T010 `.reap/genome/domain/lifecycle-rules.md` -- recovery type stage 전환 규칙 추가
- [ ] T011 `.reap/genome/source-map.md` -- evolve-recovery.ts 컴포넌트 추가

## Dependencies
- T002 → T001 (타입 먼저)
- T003 → T001, T002 (타입 + generation 생성)
- T004 → T003
- T005, T006 병렬
- T007 → T001
- T008~T011은 **Completion 단계에서만** 실행 (genome-change backlog consume)

## Notes
- implementation에서는 T001~T007 (소스 코드)만 수행
- T008~T011은 completion 단계의 genome consume에서 실행

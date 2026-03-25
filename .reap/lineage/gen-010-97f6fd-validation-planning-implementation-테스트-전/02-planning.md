# Planning — gen-010-97f6fd

## Goal

v0.16의 planning, implementation, validation prompt에 테스트 전략을 강화한다.
v0.15에 있던 HARD-GATE, Red Flags, Minor Fix 패턴을 복원하고,
planning/implementation에 테스트 계획/구현 안내를 추가한다.

## Completion Criteria

1. planning.ts prompt에 테스트 계획 안내가 포함됨
2. implementation.ts prompt에 테스트 동시 구현 안내가 포함됨
3. validation.ts prompt에 HARD-GATE, Red Flags, Minor Fix, Verdict 기준이 포함됨
4. evolve.ts subagent prompt에 validation 품질 규칙이 포함됨
5. `npm run typecheck` 통과
6. `npm run build` 통과
7. `bash scripts/e2e-init.sh` 통과

## Scope

변경 파일:
- `src/cli/commands/run/planning.ts`
- `src/cli/commands/run/implementation.ts`
- `src/cli/commands/run/validation.ts`
- `src/cli/commands/run/evolve.ts`

범위 외: genome/environment 직접 수정, 새 e2e 테스트 추가

## Tasks

- [ ] T001 `src/cli/commands/run/planning.ts` — Task decomposition 섹션에 테스트 계획 안내 2줄 추가
- [ ] T002 `src/cli/commands/run/implementation.ts` — Sequential Implementation 섹션에 테스트 구현 안내 3줄 추가
- [ ] T003 `src/cli/commands/run/validation.ts` — prompt 전면 교체: HARD-GATE, Steps, Minor Fix, Red Flags, Verdict
- [ ] T004 `src/cli/commands/run/evolve.ts` — Completion 섹션 앞에 Validation Rules 블록 추가
- [ ] T005 TypeCheck + Build + e2e 검증

## Dependencies

T001~T004 독립적, T005는 T001~T004 완료 후 실행.

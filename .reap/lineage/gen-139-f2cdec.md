---
id: gen-139-f2cdec
type: normal
parents:
  - gen-138-26723a
goal: "feat: recovery generation 개념 정의 — genome/domain에 recovery generation 프로세스 문서화"
genomeHash: be30670f
startedAt: 2026-03-22T13:21:00.506Z
completedAt: 2026-03-22T14:06:39.969Z
---

# gen-139-f2cdec
- **Goal**: Recovery generation 개념 정의 — genome/domain에 recovery generation 프로세스 문서화
- **Period**: 2026-03-22 ~ 2026-03-22
- **Genome Version**: v48 → v49
- **Result**: pass
- **Key Changes**:
  - `src/types/index.ts` — `GenerationType`에 `"recovery"` 추가, `GenerationState`/`GenerationMeta`에 `recovers` 필드 추가
  - `src/core/generation.ts` — `createRecoveryGeneration()` 메서드 추가, `complete()`에서 recovery type 처리
  - `src/cli/commands/run/evolve-recovery.ts` — 신규 파일. review/create 2-phase 구조
  - `src/cli/commands/run/index.ts` — evolve-recovery 명령어 등록
  - `src/templates/commands/reap.evolve.recovery.md` — 슬래시 커맨드 템플릿 신규
  - `src/cli/commands/init.ts` — COMMAND_NAMES에 reap.evolve.recovery 추가

## Objective
Recovery Generation 개념 정의 — genome/domain에 recovery generation 프로세스 문서화

기존 generation에 오류/불일치가 있을 때, 정정된 흐름으로 산출물을 검토·교정하는 특수 generation 타입("recovery")을 REAP lifecycle에 추가한다. `/reap.evolve.recovery` 명령어와 함께 domain 문서, type 시스템, current.yml 확장을 정의한다.

## Completion Conditions
1. `genome/domain/recovery-generation.md` 문서가 존재하며, recovery generation의 정의·트리거·프로세스·artifact 규칙을 포함한다
2. `constraints.md`에 `reap.evolve.recovery` 명령어가 Slash Commands 목록에 추가된다
3. `domain/lifecycle-rules.md`에 recovery type에 대한 stage 전환 규칙이 추가된다
4. `ReapConfig`/`GenerationState` 타입에 `type: "recovery"` 및 `recovers: string[]` 필드가 정의된다
5. `reap.evolve.recovery` 슬래시 커맨드 템플릿이 존재한다
6. `src/cli/commands/run/evolve-recovery.ts`에 검토→판정→generation 개시 로직이 구현된다
7. 모든 기존 테스트 통과

## Result: pass
[...truncated]
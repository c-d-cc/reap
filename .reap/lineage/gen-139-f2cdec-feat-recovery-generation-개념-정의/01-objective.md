# Objective

## Regression
- **From**: planning → objective
- **Reason**: objective artifact가 비어있음 — 유저와 합의한 내용을 artifact에 기록 필요

## Goal
Recovery Generation 개념 정의 — genome/domain에 recovery generation 프로세스 문서화

기존 generation에 오류/불일치가 있을 때, 정정된 흐름으로 산출물을 검토·교정하는 특수 generation 타입("recovery")을 REAP lifecycle에 추가한다. `/reap.evolve.recovery` 명령어와 함께 domain 문서, type 시스템, current.yml 확장을 정의한다.

## Completion Criteria
1. `genome/domain/recovery-generation.md` 문서가 존재하며, recovery generation의 정의·트리거·프로세스·artifact 규칙을 포함한다
2. `constraints.md`에 `reap.evolve.recovery` 명령어가 Slash Commands 목록에 추가된다
3. `domain/lifecycle-rules.md`에 recovery type에 대한 stage 전환 규칙이 추가된다
4. `ReapConfig`/`GenerationState` 타입에 `type: "recovery"` 및 `recovers: string[]` 필드가 정의된다
5. `reap.evolve.recovery` 슬래시 커맨드 템플릿이 존재한다
6. `src/cli/commands/run/evolve-recovery.ts`에 검토→판정→generation 개시 로직이 구현된다
7. 모든 기존 테스트 통과

## Requirements

### Functional Requirements
1. **FR-01**: `current.yml`에 `type: recovery`, `recovers: [gen-XXX, ...]` 필드 지원. `parents`는 기존 DAG 유지, `recovers`는 별도 필드
2. **FR-02**: `/reap.evolve.recovery <target-gen-id> [, <target-gen-id>...]` 명령어 추가
3. **FR-03**: evolve.recovery 실행 시 대상 generation의 lineage artifact를 자동 로드하여 검토 수행
4. **FR-04**: 검토 기준 3가지: (a) 동일 generation 내 artifact 간 불일치, (b) artifact의 구조적 결함 (누락 섹션, 불완전 내용), (c) 사람이 직접 지정한 교정 사항
5. **FR-05**: 교정 사항 발견 시 → recovery generation 자동 개시 (`type: recovery`)
6. **FR-06**: 교정 사항 없음 → "no recovery needed"로 종료 (generation 미생성)
7. **FR-07**: recovery generation의 objective에 대상 generation의 원본 objective + completion 자동 인용 및 검토 결과 요약 포함
8. **FR-08**: recovery generation의 lifecycle은 동일 5단계. 각 단계 목적이 교정에 맞게 조정됨

### Non-Functional Requirements
1. 기존 normal/merge generation에 영향 없음
2. lineage 압축 시 recovery generation도 동일 규칙 적용

## Design

### Approaches Considered

| Aspect | A: 새 type으로 lifecycle 확장 | B: 기존 normal type에 recovers 필드만 추가 |
|--------|------------------------------|------------------------------------------|
| Summary | `type: recovery` 전용 타입 추가 | normal type에 optional recovers 필드 |
| Pros | 명확한 구분, 단계별 목적 분리 가능 | 기존 코드 변경 최소 |
| Cons | type 분기 코드 추가 | recovery 특화 로직 구분 어려움 |
| Recommendation | **선택** | - |

### Selected Design
**Approach A**: `type: recovery`를 별도 타입으로 추가. normal/merge/recovery 3가지 타입. recovery generation의 각 stage는 기존 stage command를 재사용하되, `evolve.recovery`가 검토→판정→개시를 orchestrate.

### Stage 목적 비교

| Stage | Normal | Recovery |
|-------|--------|----------|
| Objective | 새 목표 정의 | 정정된 목표/설계 재정의 (원본 인용 + 검토 결과) |
| Planning | 태스크 분해 | 검토 대상 파일/로직 목록 + 검증 기준 |
| Implementation | 코드 작성 | 기존 코드 검토 & 교정 |
| Validation | 검증 | 교정 후 검증 |
| Completion | 회고 | 회고 + 원본 generation에 대한 정정 기록 |

### 명령어 흐름
```
/reap.evolve.recovery gen-138-26723a
  → 대상 generation lineage artifact 로드
  → 3가지 기준으로 검토 수행
  → 교정 사항 발견 → recovery generation 자동 개시
  → 교정 사항 없음 → "no recovery needed" 종료
```

### Design Approval History
- 2026-03-22: 유저와 brainstorm을 통해 설계 확정

## Scope
- **Related Genome Areas**: domain/lifecycle-rules.md, domain/collaboration.md (merge 패턴 참조), constraints.md
- **Expected Change Scope**: `src/types/`, `src/cli/commands/run/evolve-recovery.ts` (신규), `src/core/generation.ts`, `src/templates/commands/reap.evolve.recovery.md` (신규), `.reap/genome/domain/recovery-generation.md` (신규), `.reap/genome/domain/lifecycle-rules.md`, `.reap/genome/constraints.md`
- **Exclusions**: normal/merge lifecycle 로직 변경 없음

## Genome Reference
- domain/lifecycle-rules.md: stage 전환 규칙
- domain/collaboration.md: merge generation 패턴 참조
- constraints.md: slash command 목록

## Backlog (Genome Modifications Discovered)
- `genome-recovery-generation.md` (type: genome-change) — recovery generation 개념을 genome에 반영 (domain/recovery-generation.md 신규, constraints.md·lifecycle-rules.md·source-map.md 수정). Completion 단계에서 consume 예정.

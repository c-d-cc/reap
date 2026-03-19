# Lifecycle Rules

> 5단계 lifecycle의 stage 전환 규칙, artifact 생성 규칙, 불변 원칙

## Stage Order

```
Objective → Planning → Implementation ⟷ Validation → Completion
```

## Stage Transition Rules

- stage 전환은 반드시 `/reap.next` (전진) 또는 `/reap.back` (회귀)을 통해서만 수행
- `current.yml`을 직접 수정하여 stage를 변경하는 것은 **금지**
- `/reap.next` 실행 시 다음 stage의 artifact를 `~/.reap/templates/`에서 생성

## Artifact Rules

| Stage | Artifact | Gate (이전 artifact 필수) |
|-------|----------|--------------------------|
| Objective | 01-objective.md | - |
| Planning | 02-planning.md | 01-objective.md |
| Implementation | 03-implementation.md | 02-planning.md |
| Validation | 04-validation.md | 03-implementation.md |
| Completion | 05-completion.md | 04-validation.md |

- Progressive Recording: stage 진입 즉시 artifact 생성, 작업 진행 중 점진적 업데이트
- 완료 대기 후 일괄 작성 금지

## Regression (Micro Loop)

- 어떤 stage에서든 이전 stage로 회귀 가능
- 회귀 사유는 timeline에 기록 + target artifact에 `## Regression` 섹션 추가
- Artifact 처리: target 이전 보존, target은 덮어쓰기 (implementation은 append), target 이후 보존 → 재진입 시 덮어쓰기

## Immutability Principles

- **Genome 불변**: 현재 generation에서 genome 직접 수정 금지. backlog에 기록 → Completion에서 반영
- **Environment 불변**: 동일. backlog에 기록 → Completion에서 반영
- **예외**: 첫 generation의 Objective에서 genome 초기 셋업 허용

## Backlog Status Management

- 모든 backlog 항목은 frontmatter에 `status` 필드를 가진다
- `status: pending` — 미처리 항목 (기본값, 없으면 pending으로 간주)
- `status: consumed` — 처리 완료 항목 (`consumedBy: gen-XXX-{hash}` 필수)
- **마킹 시점**:
  - `/reap.start`: goal로 선택된 backlog → consumed
  - `/reap.completion`: 적용된 genome-change/environment-change → consumed
- **아카이빙 시점** (`/reap.next` from completion):
  - consumed → lineage로 이동
  - pending → lineage에 복사 + 새 backlog로 이월

## Minor Fix

- 5분 이내, 설계 변경 없는 사소한 수정 (typo, lint error)
- stage 전환 없이 현재 artifact에 기록

## Merge Generation Lifecycle

→ `domain/merge-lifecycle.md` 참조

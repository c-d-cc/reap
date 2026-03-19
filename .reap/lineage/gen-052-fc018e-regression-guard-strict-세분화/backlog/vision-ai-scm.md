---
type: task
status: pending
---

# Vision: REAP as AI-era Source Control Management

> Git은 결정론적 소스코드의 분산 버전 관리. REAP은 AI 개발 시대의 SCM이 되어야 한다.

## 핵심 관찰

Git은 **"파일 diff의 DAG 이력"**을 관리한다. 모든 파일이 동등하게 취급된다.
AI 개발에서는 **spec(의도)과 code(구현) 사이의 인과 관계**가 존재하지만, git은 이 관계를 모른다.

```
spec 변경 → 코드가 따라가야 함    (spec이 상위)
코드 변경 → spec에 반영해야 함    (역방향 추적 필요)
```

## REAP이 이미 풀고 있는 것

| Git | REAP |
|-----|------|
| 파일 diff 추적 | 의도(spec)와 구현의 인과 관계 |
| 텍스트 기반 merge | Genome-first 계층적 merge |
| 커밋 = 스냅샷 | Generation = 목표 단위 lifecycle |
| 모든 파일 동등 | Genome > Source 우선순위 |
| 누가 언제 바꿨나 | 왜 바꿨나 (objective → completion 추적) |

## 아직 없는 것 (탐색 대상)

- **Spec-code linkage** — genome 규칙 ↔ 코드 양방향 추적. 현재는 generation 단위 묶음만 존재
- **Semantic conflict detection** — 텍스트가 안 겹쳐도 의미적으로 충돌하는 경우 (예: A가 "REST" 원칙 추가, B가 "GraphQL" 구현). AI가 감지할 수 있는 영역
- **Generation-level cherry-pick/rebase** — "이 목표의 결과물만 가져오기"
- **Genome versioning** — genome 자체의 독립적 버전 이력 (현재는 genomeHash만 존재)

## Git과의 관계

대체가 아닌 **git 위의 의미 계층**. Git이 잘하는 것 (content-addressable storage, 분산 복제, branch/merge)은 그대로 사용하고, git이 못하는 의미론적 추적을 REAP이 채운다.

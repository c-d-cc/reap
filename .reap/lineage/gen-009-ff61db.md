---
id: gen-009-ff61db
type: normal
parents:
  - gen-008-5b811d
goal: "06-legacy.md 제거 (completion에 통합) + generation 완료 시 커밋 지시 추가"
genomeHash: legacy
startedAt: "2026-03-17T16:30:00.000Z"
completedAt: "2026-03-17"
---

# gen-009-ff61db: 06-legacy 제거 + 커밋 지시 추가

## 결과: pass
- 06-legacy.md 생성 제거, compression이 05-completion.md Summary 참조하도록 변경
- reap.evolve.md에 generation 완료 시 커밋 지시 추가
- reap.implementation.md gate 완화

## 주요 변경
- Genome v8 -> v9: conventions.md Git 커밋 타이밍 -> generation 완료 시 1 commit

---
id: gen-007-d50dfb
type: normal
parents:
  - gen-006-d9ca51
goal: "프로젝트별 commands/templates 복사 제거 — user-level 설치로 전환"
genomeHash: legacy
startedAt: "2026-03-17T15:10:00.000Z"
completedAt: "2026-03-17"
---

# gen-007-d50dfb: 프로젝트별 commands/templates 복사 제거

## 결과: pass
- init/update에서 프로젝트 내 commands/templates/hooks 복사 제거
- ~/.claude/ user-level 설치로 전환
- session-start.sh를 cwd 기반으로 변경
- reap.implementation.md에 Step 3b(backlog 기록) 추가

## 주요 변경
- Genome v7 -> v8: conventions.md(Template Conventions -> user-level), constraints.md(설치 대상 분리)
- paths.ts 경로 시스템 변경, legacy 경로 @deprecated 보존
- Deferred: old lifecycle 테스트 17개 정리 (backlog)

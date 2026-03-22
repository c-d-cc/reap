---
type: task
status: pending
priority: high
---

# completion phase "genome" → "feedKnowledge" 리네이밍 + genome/environment 영향 자동 감지

## 1. Phase 리네이밍

`completion.ts`의 phase `"genome"` → `"feedKnowledge"`로 변경.
- genome/environment 변경 모두 처리하는 단계이므로 "genome"은 부정확
- 호출하는 모든 곳(completion script, slash command template 등) 동기화 필요

## 2. Genome/Environment 영향 자동 감지

### 문제
implementation 중 genome에 영향을 주는 변경(새 커맨드 추가, 아키텍처 변경 등)을 했을 때,
AI가 자발적으로 `type: genome-change` backlog를 작성해야 하지만 실제로는 거의 하지 않음.
completion은 backlog에 있는 것만 consume할 뿐, 누락 감지를 하지 않음.

### 실제 사례
- gen-114: `refreshKnowledge` 커맨드 추가 → constraints.md의 Slash Commands 목록 outdated → backlog 미생성
- gen-112: `.claude/skills/` 마이그레이션 → environment summary outdated → backlog 미생성

### 개선 방향
completion의 feedKnowledge phase에서:
1. 현재 generation의 변경 파일 목록(git diff)을 스캔
2. genome 파일들(constraints.md, conventions.md, principles.md, source-map.md)의 내용과 대조
3. 불일치 가능성이 있으면 AI에게 "genome-change backlog를 작성할지 검토하라" prompt
4. environment summary도 동일하게 검토
5. 단순 매칭이 아닌, 구조적 변경(새 커맨드, 새 파일 패턴, 새 의존성 등)을 감지

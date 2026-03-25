---
type: task
status: consumed
consumedBy: gen-010-97f6fd
consumedAt: 2026-03-25T15:18:16.281Z
priority: high
---

# Validation + Planning + Implementation 테스트 전략 강화 (v0.15 패턴 복원)

## Problem
v0.16의 validation/planning/implementation prompt에 테스트 전략이 부재:
1. **Validation prompt**: "Run tests if the project has them" — 너무 모호. HARD-GATE, Red Flags, Minor Fix 없음
2. **Planning prompt**: unit test / e2e test 계획을 세우라는 안내 없음
3. **Implementation prompt**: 소스 구현과 테스트 구현을 같이 하라는 안내 없음
4. **기존 테스트 수정**: 로직 변경 시 관련 테스트를 찾아서 업데이트하라는 지시 없음

## v0.15 Reference
validation.ts:
- HARD-GATE: "실행 없이 pass 선언 금지", "이전 결과 재사용 금지"
- constraints.md에서 검증 커맨드 읽어서 ALL 실행 (Test → Lint → Build → Type check)
- Convention Compliance Check (conventions.md 기반)
- Minor Fix 단계 (사소한 문제 즉시 수정 + 재검증)
- Red Flags ("It will probably pass" → Run it, "It passed before" → Run it again)
- Verdict: pass/partial/fail 명확 구분

## Solution

### 1. planning.ts prompt 수정
- Task decomposition에 테스트 계획 포함 필수: "각 task에 대한 테스트 방법 명시"
- "기존 테스트 중 이번 변경에 영향받는 것이 있으면 수정 계획에 포함"

### 2. implementation.ts prompt 수정
- "소스 구현과 테스트 구현을 같이 수행"
- "기존 테스트가 변경된 로직에 영향받으면 해당 테스트를 찾아서 수정"
- "새 기능에 대한 테스트 추가 (unit test 또는 e2e test)"

### 3. validation.ts prompt 강화
- HARD-GATE 복원: "실행 없이 pass 선언 금지"
- 검증 순서 명확화: Test → Build → TypeCheck → Completion Criteria
- Minor Fix 단계 추가
- Red Flags 추가 (sycophancy 방지)
- Verdict 기준 명확화 (pass/partial/fail)

### 4. evolve.ts subagent prompt에도 동일 규칙 반영

### 5. e2e 테스트 환경 기록
- openshell 기반 e2e 테스트 실행 환경에 대한 정보를 environment 또는 genome에 기록
- AI가 e2e 테스트를 어떻게 실행해야 하는지 (어떤 스크립트, 어떤 환경, 어떤 순서) 알 수 있도록
- 현재: scripts/e2e-*.sh 4개 존재하지만 실행 방법/환경에 대한 안내가 prompt에 없음

## Files to Change
- src/cli/commands/run/planning.ts — 테스트 계획 안내
- src/cli/commands/run/implementation.ts — 테스트 구현 안내
- src/cli/commands/run/validation.ts — HARD-GATE, Minor Fix, Red Flags
- src/cli/commands/run/evolve.ts — subagent prompt

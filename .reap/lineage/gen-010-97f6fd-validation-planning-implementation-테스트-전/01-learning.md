# Learning — gen-010-97f6fd

> Validation + Planning + Implementation 테스트 전략 강화

## Project Overview

REAP v0.16.0. TypeScript CLI 기반 자기진화형 개발 파이프라인.
각 stage handler(planning.ts, implementation.ts, validation.ts)는 prompt 문자열을 생성하여 AI agent에게 지시.
evolve.ts는 subagent에게 전달할 전체 lifecycle prompt를 구성.

## Source Backlog

**validation-prompt-enhance.md** — v0.16의 prompt에 테스트 전략이 부재:
1. Validation: "Run tests if the project has them" 너무 모호. HARD-GATE, Red Flags, Minor Fix 없음
2. Planning: test 계획 안내 없음
3. Implementation: 소스+테스트 동시 구현 안내 없음
4. 기존 테스트 수정 지시 없음

## Key Findings

### 현재 상태 분석 (4개 파일)

**planning.ts** (L37-73):
- Task decomposition에 테스트 관련 안내가 전혀 없음
- "각 task에 대한 검증 방법"을 명시하라는 지시 부재

**implementation.ts** (L38-65):
- "Sequential Implementation" 지시만 있음
- 테스트 작성/수정에 대한 언급 없음

**validation.ts** (L36-56):
- 가장 큰 문제: HARD-GATE가 빠져 있음
- "Run tests if the project has them" — 모호한 한 줄
- Minor Fix, Red Flags 없음
- v0.15에 있던 sycophancy 방지 문구가 모두 빠짐

**evolve.ts** (L84-131):
- Stage Loop 설명만 있고, validation 품질 규칙 없음
- Completion 섹션에 validation 관련 규칙 없음

### v0.15 참조 패턴

v0.15 validation prompt에는 다음이 있었음:
- HARD-GATE: 실행 없이 pass 금지, 이전 결과 재사용 금지
- Steps: Test → Lint → Build → Type check 순서 실행
- Minor Fix: 사소한 문제 5분 이내 수정 후 재검증
- Red Flags: sycophancy 방지 3가지 경고문
- Verdict: pass/partial/fail 기준

## Previous Generation Reference

gen-009: artifact 경로 명시 완료. 10개 stage handler 수정. e2e 통과.
교훈: AI에게 정보를 전달할 때 prompt + context 2중 전달이 필수.

## Backlog Review

pending backlog 7개 중 이번 generation과 직접 관련된 것 없음.
모두 별도 scope.

## Context for This Generation

**Clarity: High** — 목표 명확, 변경 대상 파일 4개 확정, v0.15 참조 패턴 존재.

수정 대상:
1. `src/cli/commands/run/planning.ts` — 테스트 계획 안내 추가
2. `src/cli/commands/run/implementation.ts` — 테스트 동시 구현 안내 추가
3. `src/cli/commands/run/validation.ts` — HARD-GATE, Minor Fix, Red Flags 복원
4. `src/cli/commands/run/evolve.ts` — subagent prompt에 validation 규칙 반영

검증: `npm run build && bash scripts/e2e-init.sh && bash scripts/e2e-lifecycle.sh`

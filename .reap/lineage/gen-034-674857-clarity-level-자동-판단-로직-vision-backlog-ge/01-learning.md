# Learning — gen-034-674857

## Goal

Clarity level 자동 판단 로직 — vision/backlog/genome 상태에서 코드 기반 계산

## Project Overview

REAP v0.16.0. 330개 테스트 통과 상태. Clarity-driven Interaction은 evolution.md에 원칙으로 정의되어 있고, prompt.ts의 buildBasePrompt에서 텍스트 가이드로 주입되지만, 실제 level 판단은 AI 주관에 의존. 코드 기반 자동 계산 로직이 없음.

## Key Findings

### 현재 Clarity 관련 코드 상태
1. **evolution.md**: Clarity 판단 기준이 명시됨 (vision goals, backlog, genome stability, lineage)
2. **prompt.ts**: buildBasePrompt에서 "Clarity-driven Interaction" 섹션을 텍스트로 주입 (L260-280). Clarity Levels + Signals + Per-Stage Behavior 안내가 있으나, 실제 level 판단은 없음.
3. **vision.ts**: parseGoals로 goals 파싱 가능 (checked/unchecked count 제공). suggestNextGoals로 backlog 교차 분석.
4. **backlog.ts**: scanBacklog로 pending items 조회. priority(high/medium/low), status 제공.
5. **maturity.ts**: detectMaturity(type, cruiseCount) → bootstrap/growth/cruise. 패턴 참고용.

### 입력 데이터 소스
- **Vision goals**: parseGoals → VisionGoal[] (checked/unchecked, section)
- **Backlog**: scanBacklog → BacklogItem[] (pending/consumed, priority)
- **Generation type**: state.type (embryo/normal/merge)
- **Lineage**: lineage 디렉토리의 파일 수 (generation count)
- **Memory**: memory 파일 존재 여부 (shortterm/midterm/longterm)

### 기존 코드 패턴
- `maturity.ts`의 `detectMaturity`: type + cruiseCount → MaturityLevel 단순 규칙 기반
- 타입 export + 함수 export 패턴, pure function, 외부 의존성 없음
- prompt.ts에서 결과를 받아 prompt에 주입하는 패턴 (maturity behavior guide처럼)

### 설계 결정
- **규칙 기반 판단** (if-else), 정량적 점수 금지 (Goodhart's Law)
- 입력: vision goals 상태, pending backlog 상태, generation type, lineage count, memory 존재 여부
- 출력: `{ level: "high" | "medium" | "low", signals: string[] }`
- prompt.ts에서 clarity 결과를 subagent prompt에 주입

## Backlog Review

pending backlog 없음.

## Context for This Generation

- **Generation type**: embryo
- **Lineage**: 33 generations (gen-001 ~ gen-033)
- **Clarity Level**: High — 목표 명확 (vision/goals.md에 체크되지 않은 goal로 등록), 구현 지시사항 구체적, 기존 코드 패턴 충분히 파악됨.

## Implementation Direction

1. `src/core/clarity.ts` 신규 생성 — ClarityLevel type, ClarityResult interface, calculateClarity 함수
2. `src/core/prompt.ts` 수정 — clarity 계산 결과를 subagent prompt에 포함 (기존 텍스트 가이드에 계산된 level 추가)
3. `src/cli/commands/run/evolve.ts` 수정 — clarity 계산을 위한 데이터 수집 및 전달
4. `tests/unit/clarity.test.ts` 신규 — 다양한 입력 조합 테스트

# Learning — gen-033-044437

## Goal
Cruise mode 자동 연속 실행 — evolve에서 cruise 감지 시 N generation 자동 순회

## Project Overview

REAP v0.16.0. 319 tests 통과 (unit 180 + e2e 98 + scenario 41). TypeScript, Bun build, Node.js execution.

## Key Findings

### 현재 Cruise 구현 상태
1. **`src/core/cruise.ts`** — 4개 함수 존재:
   - `parseCruiseCount(config)` — "N/M" 포맷 파싱
   - `advanceCruise(configPath)` — count 증가, cruise 완료 시 false 반환 + cruiseCount 삭제
   - `clearCruise(configPath)` — cruiseCount 제거
   - `setCruise(configPath, total)` — "1/N" 설정

2. **`src/cli/commands/cruise.ts`** — `reap cruise <N>` CLI 등록

3. **`src/cli/commands/run/completion.ts`** commit phase에서:
   - `advanceCruise(paths.config)` 호출
   - 결과를 `cruiseActive` context로 반환
   - 메시지에 "Cruise mode active — start next generation." 포함

4. **`src/cli/commands/run/evolve.ts`** — 현재 구조:
   - config 로드 → knowledge 로드 → subagentPrompt 빌드 → emit
   - **cruise loop 없음** — 1회 실행 후 종료
   - prompt에 cruiseCount 전달하지만 자동 반복은 없음

### 핵심 아키텍처 이해

**evolve의 역할**: evolve는 단일 generation lifecycle을 subagent에 위임하는 진입점. `emitOutput`으로 prompt를 반환하면 skill 레이어(reap.evolve.md)가 subagent를 실행.

**문제점**: evolve는 CLI 명령으로 1회 `emitOutput` 후 `process.exit(0)`. cruise loop를 evolve.ts 내부에서 구현하면 첫 generation에서 exit됨.

**해결 방향**: cruise loop는 subagent prompt를 통해 처리:
- evolve.ts가 cruise 상태를 감지하여 context에 `cruiseMode: true, cruiseRemaining: N` 전달
- subagentPrompt에 cruise loop 실행 지시 포함
- subagent가 completion commit 후 `cruiseActive: true`를 확인하면:
  1. suggestNextGoals()로 다음 goal 자동 선택
  2. `reap run start --phase create --goal "..."` 실행
  3. 다음 generation lifecycle 실행 (learning~completion)
  4. 반복

### suggestNextGoals() 분석
- `vision.ts`의 `suggestNextGoals()` — unchecked vision goals + pending backlog 교차 분석
- 우선순위: backlog 관련 goal > 독립 goal, top 3 반환
- adapt phase에서 buildVisionGapAnalysis()를 통해 이미 활용 중

### 설계 결정 사항

1. **Cruise loop 위치**: evolve.ts의 subagent prompt에 cruise loop 지시 포함
   - completion commit 결과의 `cruiseActive`를 확인 → true면 다음 cycle 시작
   - subagent 내에서 순회하므로 프로세스 재시작 불필요

2. **Auto goal 선택**: suggestNextGoals() 첫 번째 후보 사용
   - 후보 없으면 cruise 중단 + 인간 피드백 요청

3. **불확실성 감지**: fitness self-assessment에서 uncertain/risky 판단 시 cruise 중단
   - 이미 fitness phase에서 cruise mode self-assessment prompt 존재

4. **evolve.ts 변경 범위**:
   - cruise mode 상태를 context에 추가
   - subagentPrompt에 cruise loop 실행 지시 추가
   - prompt.ts의 buildBasePrompt에 cruise loop 섹션 추가

## Previous Generation Reference
- gen-032: destroy/clean 구현 완료, 319 tests 통과, v0.15 패리티 달성
- Embryo → Normal 전환 준비 완료 상태

## Backlog Review
- 관련 pending backlog 없음

## Context for This Generation
- Generation type: embryo
- Clarity level: **High** — goal 명확, 구현 방향 구체적, 관련 코드 모두 파악됨
- 핵심 변경 파일: `src/cli/commands/run/evolve.ts`, `src/core/prompt.ts`
- 테스트: unit (cruise loop 로직) + e2e (cruise 설정 → evolve → 자동 연속 실행)

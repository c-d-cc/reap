# Learning — gen-035-45b5c5

## Goal
Memory 갱신을 reflect phase 워크플로우에 통합 — 트리거 + criteria 명시

## Project Overview
REAP v0.16.0. Memory 시스템(3-tier: shortterm/midterm/longterm)은 이미 구현되어 있으나, "자유롭게 쓸 수 있다"는 지시만으로는 실제 갱신이 이루어지지 않는 문제가 있다. 명시적 트리거와 criteria가 필요.

## Key Findings

### 현재 Memory 관련 코드 상태

1. **completion.ts reflect phase prompt** (line 82):
   - `"3. Update memory ... if applicable"` — "if applicable"이 모호. 구체적 criteria 없음.

2. **evolution.md (프로젝트 genome)** Memory 섹션 (line 38-47):
   - 규칙이 "자유롭게 읽기/쓰기", "간결하게 유지" 수준 — 언제 무엇을 써야 하는지 criteria 부재.

3. **템플릿 evolution.md** (line 93-101):
   - 프로젝트 genome과 동일한 구조. Memory rules 섹션도 같은 수준의 모호한 지시.

4. **reap-guide.md** Memory 섹션 (line 25-49):
   - 3-tier 구조, Rules, When to Update 섹션 존재. "Reflect phase: Natural moment to update memory (prompted but not forced)" — 역시 구체적 criteria 없음.

5. **prompt.ts** buildBasePrompt (line 130-142):
   - Memory를 로딩하여 subagent prompt에 주입하지만, 갱신 지시에 대한 criteria는 없음.

### 변경 대상 파일 5개
- `src/cli/commands/run/completion.ts` — reflect phase prompt 강화
- `.reap/genome/evolution.md` — Memory criteria 추가
- `src/templates/evolution.md` — 새 프로젝트 템플릿에도 동일 criteria
- `src/templates/reap-guide.md` — Memory 섹션 criteria 추가
- `src/core/prompt.ts` — subagent prompt에 memory criteria 포함

### 변경 내용 요약
각 tier별 갱신 criteria:
- **Shortterm** (매 generation 갱신 — 필수): 이번 gen 요약, 다음 세션 맥락, 미결정 사항, backlog 상태
- **Midterm** (맥락 변경 시): 큰 작업 흐름, 멀티 gen 계획, 유저 합의 방향성
- **Longterm** (교훈 발생 시만): 설계 교훈, 아키텍처 결정 배경, 프로젝트 전환 교훈
- **갱신 안 할 것**: 코드 변경 상세(environment), 테스트 수치(artifact), genome 중복

## Backlog Review
- 관련 pending backlog 없음.

## Context for This Generation
- Clarity: **High** — goal이 구체적이고, 변경 대상 파일과 내용이 명확함.
- embryo generation이므로 genome 직접 수정 가능.
- 테스트: prompt 변경이므로 e2e 테스트가 적절 (reflect prompt에 memory 갱신 지시 포함 여부 확인).

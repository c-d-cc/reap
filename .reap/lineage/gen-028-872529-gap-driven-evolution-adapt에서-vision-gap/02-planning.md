# Planning — gen-028-872529

## Goal
Vision gap 분석을 코드 수준에서 자동화하여, adapt phase에서 구조화된 다음 goal 제안과 완료 goal 체크 마킹을 제공한다.

## Completion Criteria
1. `src/core/vision.ts`에 `parseGoals()` 함수가 goals.md를 파싱하여 `VisionGoal[]` 반환
2. `findCompletedGoals()` 함수가 현재 generation goal과 매칭되는 vision goal 탐지
3. `suggestNextGoals()` 함수가 미완료 goal + pending backlog에서 후보 3개 추출
4. `buildVisionGapAnalysis()` 함수가 adapt prompt에 주입할 구조화된 분석 텍스트 생성
5. completion.ts adapt phase에서 기존 원문 삽입 대신 구조화된 분석 결과 주입
6. unit tests 통과 (parseGoals, findCompletedGoals, suggestNextGoals, buildVisionGapAnalysis)
7. 빌드 성공, 기존 테스트 전체 통과

## Approach

### 핵심 설계 원칙
- **파싱은 deterministic**: goals.md의 마크다운 체크리스트를 정규식으로 파싱. AI 판단 불필요.
- **매칭은 keyword-based**: generation goal 텍스트와 vision goal 텍스트를 단어 단위로 비교. 정확한 매칭보다 "관련성 점수"를 계산.
- **제안은 구조화**: 미완료 goal을 섹션별로 그룹화, pending backlog와 교차하여 우선순위 부여.
- **prompt 주입**: adapt phase의 기존 "Current Vision Goals" 섹션을 구조화된 분석으로 대체.

### 매칭 알고리즘 (findCompletedGoals)
- generation goal 텍스트를 토큰화 (공백 분리, 불용어 제거)
- 각 미완료 vision goal과 토큰 겹침 비율 계산
- threshold 이상인 항목을 "완료 후보"로 제안
- genResult(completion artifact 요약)도 추가 매칭 소스로 활용

### suggestNextGoals 로직
1. 미완료 vision goals 추출
2. pending backlog 항목과 텍스트 유사도 교차 확인
3. backlog에 대응하는 vision goal이 있으면 우선순위 상승
4. 상위 3개를 `NextGoalCandidate`로 반환 (title, reason, relatedBacklog)

## Scope

### 변경 파일
- `src/core/vision.ts` — 신규
- `src/cli/commands/run/completion.ts` — adapt phase 수정
- `tests/unit/vision.test.ts` — 신규

### Out of Scope
- goals.md 자동 수정 (체크마킹은 제안만, 실제 수정은 subagent가 수행)
- clarity level 자동 계산 로직 (별도 goal)
- vision/goals.md 구조 변경

## Tasks
- [ ] T001 `src/core/vision.ts` — VisionGoal, NextGoalCandidate 타입 정의 + parseGoals() 구현
- [ ] T002 `src/core/vision.ts` — findCompletedGoals() 구현 (keyword 매칭)
- [ ] T003 `src/core/vision.ts` — suggestNextGoals() 구현 (미완료 goal + backlog 교차)
- [ ] T004 `src/core/vision.ts` — buildVisionGapAnalysis() 구현 (prompt용 텍스트 빌더)
- [ ] T005 `src/cli/commands/run/completion.ts` — adapt phase에서 vision.ts 함수 호출 및 prompt 주입
- [ ] T006 `tests/unit/vision.test.ts` — parseGoals unit tests
- [ ] T007 `tests/unit/vision.test.ts` — findCompletedGoals unit tests
- [ ] T008 `tests/unit/vision.test.ts` — suggestNextGoals unit tests
- [ ] T009 `tests/unit/vision.test.ts` — buildVisionGapAnalysis unit tests
- [ ] T010 빌드 + 전체 테스트 실행

## Dependencies
- T001 → T002 → T003 → T004 (순차)
- T005는 T004 이후
- T006-T009는 T001-T004 이후 (병렬 가능)
- T010은 마지막

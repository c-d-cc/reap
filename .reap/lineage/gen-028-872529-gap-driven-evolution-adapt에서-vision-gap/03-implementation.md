# Implementation Log — gen-028-872529

## Completed Tasks

### T001-T004: src/core/vision.ts (신규 모듈)
- `VisionGoal`, `NextGoalCandidate` 타입 정의
- `parseGoals()`: goals.md 마크다운 체크리스트를 정규식으로 파싱, `### ` 섹션 헤더 추적
- `findCompletedGoals()`: generation goal 텍스트와 unchecked vision goal의 keyword overlap 매칭 (threshold 0.3)
- `suggestNextGoals()`: 미완료 goal을 pending backlog와 cross-reference, priority 점수 부여, 상위 3개 반환
- `buildVisionGapAnalysis()`: 위 함수들을 조합하여 adapt prompt에 주입할 구조화된 텍스트 생성
  - Section 1: 완료 후보 goal 체크 제안
  - Section 2: 진행률 요약 (완료/잔여, 섹션별 그룹)
  - Section 3: 다음 generation 후보 3개
- `tokenize()`: 텍스트를 소문자 토큰으로 분리, 한/영 불용어 필터링

### T005: completion.ts adapt phase 수정
- `scanBacklog`, `parseGoals`, `buildVisionGapAnalysis` import 추가
- 기존 원문 삽입(`visionGoals.slice(0, 1000)`)을 구조화된 gap 분석으로 대체
- completion artifact도 로딩하여 `genResult`로 매칭 정확도 향상
- "Vision Auto-Update" 지시는 유지

### T006-T009: tests/unit/vision.test.ts (신규)
- parseGoals: 7 tests (파싱, 섹션, raw, 빈 입력, 헤더 없는 항목)
- findCompletedGoals: 5 tests (매칭, 미매칭, 이미 체크된 항목 제외, genResult 활용)
- suggestNextGoals: 5 tests (최대 3개, backlog 우선순위 부여, 빈 goal, 섹션 정보, consumed 필터)
- buildVisionGapAnalysis: 6 tests (진행률, 섹션별 잔여, 완료 제안, 후보, 빈 입력, backlog 교차)

### T010: 빌드 + 전체 테스트
- TypeScript 타입 체크 통과
- 빌드 성공 (0.42 MB)
- Unit tests: 171개 전체 통과 (기존 148 + 신규 23)

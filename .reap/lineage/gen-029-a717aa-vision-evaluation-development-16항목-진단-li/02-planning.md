# Planning — gen-029-a717aa

## Goal
Vision evaluation & development — adapt phase에서 AI가 프로젝트의 현재 수준을 구조적으로 진단하고, lineage 편향을 분석하고, vision 발전 제안을 생성할 수 있게 한다.

## Completion Criteria
1. adapt phase prompt에 16항목 진단 프레임워크가 주입되어, AI가 각 기준별 정성적 평가를 구조화된 형태로 작성하도록 유도된다
2. lineage의 모든 generation(compressed 포함) goal을 읽어 vision section별 분포를 분석하는 함수가 존재한다
3. 편향 분석 결과가 adapt prompt에 포함되어 AI가 편중/방치 영역을 인식한다
4. 16항목 진단 + 편향 분석을 종합한 vision development 제안이 prompt에 포함된다
5. 정량적 점수 없음 — 모든 평가는 정성적 서술
6. vision 자동 수정 없음 — 제안만 (인간 판단)
7. 관련 unit test 통과

## Background
gen-028에서 vision gap 분석의 기초(파싱, 체크 제안, 다음 후보 추천)는 구현됨.
이번 gen은 그 위에 3가지 기능을 추가하여 REAP의 self-evolving 능력을 강화:
- 프로젝트 현재 수준의 구조적 진단
- 세대 간 작업 편향 감지
- vision 자체의 발전 제안

## Approach

### 기능 1: 프로젝트 진단 프레임워크
- `vision.ts`에 `buildDiagnosisPrompt()` 함수 추가
- SOFTWARE_COMPLETION_CRITERIA 16항목을 prompt 구조로 변환
- AI에게 각 항목별 간결한 정성적 평가를 요청하는 형식
- completion.ts adapt phase에서 호출하여 prompt에 주입
- 모든 maturity level에서 사용 (bootstrap뿐 아니라)

### 기능 2: Lineage 편향 분석
- `lineage.ts`에 `readAllLineageGoals()` 함수 추가 — meta.yml + compressed md frontmatter 모두 읽기
- `vision.ts`에 `analyzeLineageBias()` 함수 추가
  - 최근 N gen의 goal을 vision section별로 매핑 (tokenize + overlap 재사용)
  - 편중/방치 영역 감지 → 경고 텍스트 생성
- completion.ts adapt phase에서 호출

### 기능 3: Vision development 제안
- `vision.ts`에 `buildVisionDevelopmentSuggestions()` 함수 추가
  - 16항목 기준 중 vision goal에 매핑되지 않는 영역 감지 → "누락 영역" 제안
  - unchecked goal 중 lineage에서 관련 작업이 없는 것 → "미착수 검토" 제안
  - 편향 분석 결과와 연계 → "방치 영역" 제안
- prompt 텍스트로만 출력 (자동 수정 없음)

### Prompt 통합
- completion.ts adapt phase에서 기존 vision gap analysis 뒤에 3가지 분석 결과를 순서대로 주입
- 기존 bootstrap-only 16항목 텍스트 주입(line 208-217) → 새 진단 프레임워크로 대체

## Tasks
- [ ] T001 `src/core/lineage.ts` — `readAllLineageGoals()` 함수 추가: lineage 디렉토리에서 모든 gen의 {id, goal}을 추출 (meta.yml + compressed md frontmatter)
- [ ] T002 `src/core/vision.ts` — `buildDiagnosisPrompt()` 함수 추가: 16항목 기준별 진단 요청 prompt 텍스트 생성
- [ ] T003 `src/core/vision.ts` — `analyzeLineageBias()` 함수 추가: 최근 N gen의 goal을 vision section별로 매핑, 편향 경고 생성
- [ ] T004 `src/core/vision.ts` — `buildVisionDevelopmentSuggestions()` 함수 추가: 누락 영역, 미착수, 방치 영역 제안 텍스트 생성
- [ ] T005 `src/cli/commands/run/completion.ts` — adapt phase에서 T002~T004 결과를 prompt에 주입. 기존 bootstrap-only 16항목 주입을 새 프레임워크로 대체
- [ ] T006 `tests/unit/vision.test.ts` — 새 함수들의 unit test 추가
- [ ] T007 `tests/unit/lineage.test.ts` — readAllLineageGoals() unit test 추가
- [ ] T008 Build + TypeCheck + 전체 테스트 실행

## Dependencies
- T001 → T003, T004 (lineage goal 데이터가 필요)
- T002, T003, T004 → T005 (vision.ts 함수들이 먼저 구현되어야 completion.ts에서 호출)
- T001~T005 → T006, T007 (테스트)
- T006, T007 → T008 (빌드 + 전체 테스트)

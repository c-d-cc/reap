# Learning — gen-029-a717aa

## Goal
Vision evaluation & development — 16항목 진단 + lineage 편향 분석 + vision 자동 제안

## Source Backlog
`vision-evaluation-development-16항목-완성-기준-기반-프로젝트-진단-vision-자동-제안.md` (high priority)

gen-028에서 vision gap 파싱/체크/추천까지 구현됨. 이번 gen은 한 단계 더 나아가:
1. 16항목 완성 기준별 프로젝트 진단 프레임워크
2. Lineage 편향 분석 (최근 N gen goal 분포)
3. Vision development 제안 (누락 영역, 분할, 미착수 검토)

## Project Overview

### 현재 아키텍처 이해
- **vision.ts** (gen-028): parseGoals, findCompletedGoals, suggestNextGoals, buildVisionGapAnalysis 구현 (~243줄)
  - adapt phase에서 vision gap 분석 텍스트를 생성하여 prompt에 주입
  - keyword overlap 기반 매칭 (tokenize → overlap score)
- **maturity.ts**: SOFTWARE_COMPLETION_CRITERIA 16개 항목 상수 정의, formatCompletionCriteria()로 텍스트 생성
  - 현재 bootstrap maturity에서만 adapt prompt에 텍스트로 주입 (completion.ts line 208-217)
  - 평가 결과가 구조화되지 않아 lineage에 보존 불가
- **lineage.ts**: readLineageMetas() — lineage 디렉토리에서 meta.yml을 읽어 LineageMeta[] 반환
  - LineageMeta: { id, type, goal, parents, dirName }
  - compressed .md 파일은 읽지 않음 (디렉토리만 스캔)
- **compression.ts**: L1 (dir→md, threshold 20), L2 (md→epoch, threshold 100)
  - compressed md의 frontmatter에 id, type, goal, parents 보존

### 데이터 흐름
1. completion.ts adapt phase에서:
   - maturity 감지 → bootstrap이면 16항목 텍스트 주입
   - vision/goals.md 파싱 → buildVisionGapAnalysis() 호출 → prompt에 주입
2. AI가 adapt에서 평가/제안을 생성하지만 구조화되지 않음
3. completion artifact에 기록은 되지만 일관된 형식 없음
4. archiveGeneration()에서 life/ → lineage/로 복사, meta.yml 생성

### Lineage 구조
- 28 generation 존재 (gen-001 ~ gen-028)
- gen-001 ~ gen-008: L1 compressed (.md 파일, frontmatter에 메타데이터)
- gen-009 ~ gen-028: 디렉토리 (meta.yml + artifacts)
- readLineageMetas()는 디렉토리만 읽음 → compressed lineage 접근 불가
- compressed md의 frontmatter도 동일한 구조 (id, type, goal, parents)

### Vision Goals 현재 상태
- 9개 섹션: Core Stability, Clarity-driven Interaction, Maturity System, Gap-driven Evolution, Test Infrastructure, Self-Hosting, Distribution, Agent Client 확장, Genome/Environment
- 체크됨: ~22개, 미체크: ~11개
- 미체크 집중 영역: Self-Hosting (4), Distribution (5), Agent Client (2)

## Key Findings

### 1. 진단 프레임워크 구현 포인트
- `vision.ts`에 새 함수 추가: 16항목 기준별 진단 prompt 구조 생성
- completion.ts adapt에서 호출하여 prompt에 주입
- AI가 생성한 평가 결과는 completion artifact의 구조화된 섹션으로 기록
- **정량적 점수 금지** — 정성적 서술만 (Goodhart's Law)

### 2. Lineage 편향 분석 구현 포인트
- compressed .md 파일의 frontmatter도 파싱 필요 → 전체 lineage 커버
- goal → vision section 매핑은 tokenize + overlap 패턴 재사용
- 결과: "최근 N gen 중 X개가 Y 영역" 형태의 편향 경고

### 3. Vision development 제안 구현 포인트
- 16항목 진단 + 편향 분석을 결합하여 제안 텍스트 생성
- 누락 영역: 16항목 중 vision goal에 매핑되지 않는 기준 감지
- 분할 제안: scope가 큰 goal 감지
- 미착수 검토: unchecked goal 중 lineage에서 관련 작업이 없는 것

### 4. 기존 패턴 활용
- tokenize() 함수: vision.ts에 이미 존재 (STOP_WORDS 기반)
- buildVisionGapAnalysis() 패턴: 분석 결과를 prompt 텍스트로 빌드
- readLineageMetas() 패턴: 디렉토리 스캔 → 파싱 → 구조화

## Previous Generation Reference
- gen-028: vision gap 파싱 + 체크 제안 + 다음 후보 추천 구현
- Fitness feedback: "vision evaluation/development는 다음 generation으로 분리"
- Lesson: keyword overlap 매칭의 한계 인지, prompt 크기 관리 중요

## Backlog Review
- `reap clean` / `reap destroy`: 이번 gen과 무관. 보류.

## Technical Deep-Dive

### readLineageMetas() 확장 vs 별도 함수
- 기존 readLineageMetas()는 디렉토리만 스캔 → compressed md 미포함
- 옵션 A: readLineageMetas() 수정 → 기존 사용처 영향 위험
- 옵션 B: 별도 함수 `readAllLineageGoals()` → meta.yml + compressed md 모두 읽기
- **옵션 B 채택**: 기존 함수 영향 범위를 좁혀 안전. lineage.ts에 추가.

### Prompt 크기 관리
- 진단(16항목) + 편향(N gen) + 제안이 모두 합쳐지면 prompt 길어짐
- 편향 분석은 최근 10 gen으로 제한
- 제안은 top 3-5개로 제한
- 진단은 항목별 한 줄 간결 평가 요청

### 진단 결과 artifact 포맷
- completion artifact에 `## Project Diagnosis` 섹션 추가
- 16항목 각각에 대해: `- **{name}**: {정성적 평가}` 형식
- 이 형식을 prompt에서 AI에게 요청

## Context for This Generation
- **Clarity Level**: High — goal이 구체적이고, 수정할 파일과 구현 방향이 명확
- **Maturity**: Bootstrap (embryo)
- **Lineage**: 28 generations, 충분한 컨텍스트
- **Previous gen feedback**: vision evaluation/development를 다음 gen으로 분리하라는 명시적 지시

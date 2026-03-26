---
type: task
status: consumed
consumedBy: gen-029-a717aa
consumedAt: 2026-03-26T09:07:56.129Z
priority: high
createdAt: 2026-03-26T09:07:22.015Z
---

# Vision evaluation & development — 16항목 완성 기준 기반 프로젝트 진단 + vision 자동 제안

## Problem

gen-028에서 vision gap 파싱 + 체크 제안 + 다음 후보 추천은 구현됨.
하지만 vision 자체를 평가하고 발전시키는 능력이 없음:
- 16항목 완성 기준(maturity.ts)이 prompt에 텍스트로만 주입됨 — 구조화된 평가 결과가 남지 않음
- 프로젝트 현재 수준과 vision goal의 괴리 감지 불가
- lineage 분석으로 편향 감지 불가 (최근 N gen이 한 영역에만 집중했는지)
- vision에 누락된 영역 자동 제안 불가

## Solution

### 1. 프로젝트 진단 — 16항목 기준별 현재 수준 평가
- adapt phase에서 16개 완성 기준 각각에 대해 현재 프로젝트 상태를 정성적으로 평가
- 평가 결과를 구조화된 형태로 completion artifact에 기록
- 다음 generation에서 참조 가능하도록 lineage에 보존

### 2. Vision과 대조
- 16개 기준 중 취약한 항목을 vision/goals.md와 매핑
- "Documentation이 취약한데 vision에 관련 goal이 없다" → vision 추가 제안
- vision goal이 있지만 최근 작업이 없는 항목 → 우선순위 올리기 제안

### 3. Lineage 편향 분석
- 최근 N generation의 goal/section 분포 분석
- 특정 영역에 편중되어 있으면 경고 ("최근 5 gen 모두 Distribution 영역")

### 4. Vision development 제안
- 위 분석 결과를 종합하여 vision goal 추가/분할/수정 제안
- 제안만 하고 실제 수정은 인간 승인 후 (Genome Immutability 원칙과 동일)

## Files to Change

- `src/core/vision.ts` — 진단 + 편향 분석 + vision development 로직 추가
- `src/core/maturity.ts` — 16항목 기준을 진단 함수에서 활용
- `src/core/lineage.ts` — 최근 N generation goal 추출 함수
- `src/cli/commands/run/completion.ts` — adapt prompt에 진단 결과 주입
- tests 추가

---
description: "REAP Planning — 구현 계획을 수립하고 태스크를 분해합니다"
---

# Planning (계획 수립)

<HARD-GATE>
01-objective.md를 읽지 않고 계획을 세우지 마라.
Genome(conventions.md, constraints.md)을 읽지 않고 기술 결정을 하지 마라.
</HARD-GATE>

## Gate (전제조건)
- `.reap/life/current.yml`을 읽고 stage가 `planning`인지 확인하라
- `.reap/life/01-objective.md`가 존재하는지 확인하라
- 미충족 시: ERROR — 사유를 알리고 **중단**

## Context (세대 정보)
- `.reap/life/current.yml`에서 현재 세대 정보를 읽어라 (id, goal, genomeVersion)

## Re-entry 확인
- `.reap/life/02-planning.md`가 이미 존재하면 **회귀로 인한 재진입**이다
- 기존 산출물을 읽고, `## Regression` 섹션이 있으면 회귀 사유를 파악하라
- 기존 내용을 참고하되, 회귀 사유에 맞게 수정하여 덮어쓰기하라
- 이미 `03-implementation.md`가 존재하면 구현 진행 상황도 참고하라 (완료된 태스크를 유지할지 판단)

## Steps

### 1. Objective 읽기
- `.reap/life/01-objective.md`에서 요구사항과 수용 기준을 읽어라
- 각 FR에 대해 어떻게 구현할지 구상하라

### 2. Genome 참조
- `.reap/genome/constraints.md`에서 기술 제약과 Validation Commands를 확인하라
- `.reap/genome/conventions.md`에서 개발 규칙과 Enforced Rules를 확인하라
- `.reap/genome/principles.md`의 Core Beliefs와 Architecture Decisions를 확인하라

### 3. 구현 계획 수립
- 아키텍처 접근법과 기술 선택을 결정하라
- constraints.md의 Tech Stack을 존중하라
- **불확실한 기술 결정이 있으면 멈추고 인간에게 물어라**

### 4. 태스크 분해
- 태스크는 `- [ ] T001 설명` 형식의 체크리스트로 작성
- **제한**: 태스크는 최대 20개. 20개를 초과하면 Phase로 분리하라.
- 각 태스크는 **하나의 논리적 변경 단위**여야 한다
- 태스크 간 의존관계와 병렬 가능 여부를 명시하라

### 5. 인간 확인
- 인간과 함께 계획을 확정하라

## 태스크 형식

```
### Phase 1: [Phase 이름]
- [ ] T001 [구체적 행동] — [대상 파일/모듈]
- [ ] T002 [P] [구체적 행동] — [대상 파일/모듈]

### Phase 2: [Phase 이름]
- [ ] T003 [구체적 행동] — [대상 파일/모듈]
```

- `[P]`: 병렬 실행 가능 표시
- 각 태스크에 대상 파일/모듈을 명시하라

❌ 나쁜 태스크: "- [ ] T001 인증 구현"
✅ 좋은 태스크: "- [ ] T001 `src/lib/auth.ts` — NextAuth Google OAuth 설정 + authOptions 정의"

## 자기 검증
산출물 저장 전에 확인하라:
- [ ] 모든 FR에 대응하는 태스크가 있는가?
- [ ] 태스크 간 의존관계가 명시되어 있는가?
- [ ] 각 태스크에 대상 파일/모듈이 명시되어 있는가?
- [ ] Phase 분류가 논리적인가?

## 산출물 생성
- `.reap/templates/02-planning.md`를 읽어라
- 위 Steps의 결과를 반영하여 채워라
- `.reap/life/02-planning.md`에 저장하라

## 완료
- 인간에게 산출물을 보여주고 확인을 받아라
- 확인 후: "`reap evolve --advance`로 Implementation 단계로 진행하세요." 안내

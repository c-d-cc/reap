# Evaluator Agent 설계

> 2026-03-28 합의, 템플릿 정의 완료. 상태: 템플릿 확정, 코드 통합 전.

## 동기

현재 reap-evolve agent가 코드 작성과 검증을 모두 수행한다.
Self-review bias가 존재하며, fitness 평가는 전적으로 인간에 의존한다.
독립된 evaluator agent를 도입하여 검증 품질을 높이고 인간 부담을 줄인다.

## 템플릿 위치

`src/templates/agents/reap-evaluate.md`

## 핵심 설계 결정 (gen-051 확정)

### 1. Tool 접근: Read + Bash
- Read, Glob, Grep, Bash 허용 (테스트 실행으로 독립 검증)
- Write, Edit 금지 (코드 수정은 behavior rule로 차단)
- Git 읽기 명령만 허용 (diff, log, status), 수정 명령 금지

### 2. 에스컬레이션 매트릭스

| Confidence | Impact | Action |
|------------|--------|--------|
| High | Low | 직접 판단 |
| High | High | 에스컬레이션 (판단 포함) |
| Low | Any | 에스컬레이션 (판단 유보) |

### 3. Cross-generation 맥락: REAP Memory 활용
- 기존 3-tier memory(shortterm/midterm/longterm)를 evolve agent와 공유
- 평가 기록은 completion artifact에 포함 (별도 파일 아님)
- Memory 쓰기 허용하되, evolve agent가 작성한 항목 덮어쓰기는 인간 승인 필요

### 4. 정량적 메트릭 금지
- Goodhart's Law 원칙 엄수
- 수치 점수, 백분율, 등급 일체 금지
- 모든 평가는 정성적: 서술적, 논리적, 맥락 기반

## Evaluator Agent 역할

### 1. Independent Verification
- 테스트 독립 실행 (build, unit, e2e, scenario)
- 코드 변경 vs 계획 대조
- Artifact 완성도 검증
- 계획-결과 gap 식별

### 2. Fitness 1차 평가
6가지 평가 차원 (모두 정성적):
1. Goal Achievement -- 목표 달성 여부
2. Code Quality -- genome convention 준수
3. Regression Safety -- 기존 기능 보전
4. Artifact Quality -- 다음 세대를 위한 핸드오프 품질
5. Vision Alignment -- vision goals 방향 일치
6. Cross-Generation Coherence -- 최근 세대와의 흐름 적합성

### 3. Vision/Goal 관리
- 세대별 goal 달성 추적
- Vision gap 기반 다음 goal 추천
- 정체된/무관해진 goal 식별
- Memory tier 승격/정리 제안

### 4. Cross-Generation 기록
- 각 세대의 프로젝트 진화 기여도 기록
- 개별 evolve agent가 갖지 못하는 연속적 맥락 유지
- 패턴 감지: 반복 이슈, 개선 추세, 지속적 gap

## Evaluation Workflow

```
Phase 1: Context Loading
  ├── genome/environment/vision/memory 로딩
  ├── 현재 세대 artifact 전체 읽기 (01~04)
  └── 최근 lineage 참조 (트렌드)

Phase 2: Independent Verification
  ├── 테스트 실행 (unit/e2e/scenario)
  ├── 빌드 확인
  ├── git diff 기반 코드 리뷰
  └── artifact 완성도 검증

Phase 3: Fitness Assessment
  ├── 6가지 차원별 정성적 평가
  └── 에스컬레이션 필요 여부 판단

Phase 4: Escalation Decision
  ├── 모든 차원 명확 + 긍정적 → 직접 판단
  ├── High-impact 우려 → 판단 포함 에스컬레이션
  └── Low-confidence → 사실만 전달 에스컬레이션

Phase 5: Output
  ├── 요약 (1-2문장)
  ├── 차원별 평가
  ├── 에스컬레이션 항목
  ├── 다음 goal 추천
  └── memory 업데이트 제안
```

## 다른 Agent와의 관계

- **reap-evolve**: evaluator는 evolve의 결과를 평가. 세대 중 evolve의 작업을 지시하지 않음. REAP memory 공유.
- **Human**: 최종 fitness 판단자. Evaluator 평가는 인간의 의사결정을 가속하는 보조 역할.

## 선행 작업 (완료)

### Nonce 시스템 리팩토링 (gen-050)
- Transition graph 기반 multi-nonce 발행 완료
- Evaluator가 validation-implementation micro-loop 등 유연한 전이를 활용할 수 있는 기반 마련

## 후속 작업 (미구현)

### 코드 통합 (후속 generation)

> gen-052에서 learning 완료 후 abort. 아래 설계 결정은 승인됨.

#### 승인된 설계 결정 (2026-03-29)

1. **Config 플래그**: `ReapConfig`에 `evaluator?: boolean` (기본 `false`) 추가. Opt-in 방식. REAP 자체는 `evaluator: true`로 dog-fooding.
2. **Evaluator 호출 위치**: fitness phase 첫 호출 시 evaluator subagent launch 지시를 prompt에 포함
3. **Cruise mode**: evaluator 사용. High confidence + Low impact → 자동 진행, 에스컬레이션 → cruise 중단

#### 수정 대상 파일

**`src/core/prompt.ts` — `buildEvaluatorPrompt()` 추가**
- `buildBasePrompt()`와 유사하되 evaluator 전용 context 조립
- 포함: generation state (id, goal, type), vision goals, memory, project path, artifacts (01~04) 요약, 코드 변경 정보
- 제외: strict mode, cruise loop, clarity guide, maturity behavior guide

**`src/cli/commands/run/completion.ts` — fitness phase 변경**

현재 flow:
- Cruise mode: self-assessment prompt → evolve agent 자체 평가 → `--feedback` 제출
- Supervised mode: 인간에게 피드백 요청 prompt 출력

변경 후 flow (evaluator 활성화 시):
1. `reap run completion --phase fitness` (feedback 없이 호출)
2. `buildEvaluatorPrompt()` 호출 → evaluator launch 지시 포함 prompt 반환
3. Evolve agent가 `Agent` tool로 `subagent_type: "reap-evaluate"` subagent spawn
4. Evaluator가 독립 검증 + 평가 수행, 결과를 text로 반환
5. Evolve agent가 evaluator 결과를 인간에게 전달
6. 인간이 최종 feedback 결정 → `reap run completion --phase fitness --feedback "..."` 실행

**`src/types/index.ts` — ReapConfig 타입 확장**
```typescript
interface ReapConfig {
  // ... 기존 필드
  evaluator?: boolean;  // evaluator agent 활성화 여부 (기본 false)
}
```

#### Subagent 패턴

`evolve.ts`의 기존 패턴과 동일:
- `buildEvaluatorPrompt()` → `evaluatorPrompt`로 context에 포함
- Evolve agent가 `Agent` tool로 `subagent_type: "reap-evaluate"` launch

#### 테스트

- `buildEvaluatorPrompt()` 단위 테스트 (context 포함 여부)
- completion fitness phase에서 evaluator prompt 반환 확인
- config `evaluator: false`일 때 기존 flow 유지 확인

### Fitness 위임 (후속 generation)
- Evaluator 1차 평가 → 인간 에스컬레이션 흐름 구현
- Cruise mode에서 evaluator 자동 판단 지원

### Vision/Goal 관리 위임 (후속 generation)
- Adapt phase에서 evaluator가 vision gap 분석 수행
- Goal 추천 로직 evaluator에 위임

## 설계 원칙

- 정량적 fitness 메트릭 금지 (Goodhart's Law) -- evaluator도 정성적 판단만
- 인간의 최종 결정권 보장 -- evaluator는 제안/판단, 인간이 override 가능
- 생물학적 메타포 유지 -- fitness evaluation은 환경(외부)이 수행
- Self-fitness 금지 -- evaluator는 자기 평가 품질을 평가하지 않음

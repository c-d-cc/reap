# Evaluator Agent 설계

> 2026-03-28 합의, 템플릿 정의 완료. 상태: **validation 통합 완료 (gen-066)**. fitness 통합 + cruise escalation 자동 중단은 후속 (`cruise-mode-evaluator-escalation-통합-validationfitness.md` backlog).

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

## 구현 상태

### Validation 통합 — 완료 (gen-066, Issue #20)

승인된 설계 결정 (gen-052, 2026-03-29) 중 다음 항목을 gen-066 에서 실현:

1. **Config 플래그**: `ReapConfig.evaluator?: boolean` (기본 `false`) 추가됨. REAP 자체는 `.reap/config.yml` 에 `evaluator: true` 로 dog-fooding 시작.
2. **Evaluator 호출 위치 — validation 우선**: 원래 design 은 fitness 단계만 가정했으나, Issue #20 의 요청에 따라 **validation work phase** 에서 먼저 호출. fitness 통합은 후속 backlog 로 분리.
3. **Advisor 관계 명시**: evaluator 결과는 builder 의 verdict 를 override 하지 않고 user 에게 surface (Q3 결정). escalation matrix 인용.
4. **양 adapter agent 배치**: Claude Code (`~/.claude/agents/`) + OpenCode (`~/.config/opencode/agent/`) 모두 `installSkills` + `registerSessionIntegration` 양쪽 caller 에서 silent helper 로 호출. `reap update` 만으로도 sync.

구현된 모듈:
- `src/core/prompt.ts` — `buildEvaluatorPrompt(knowledge, paths, state, { stage })` 신설. stage = `"validation" | "fitness"` (fitness 분기는 후속 generation 이 사용).
- `src/cli/commands/run/validation.ts` — config 조건부 분기 + evaluator 절 + `context.evaluator.prompt` emit. `evaluator: false` 일 때 기존 prompt 와 byte-identical.
- `src/adapters/claude-code/install.ts` — `installAgents(home?)` export, prefix-anchored cleanup (`^reap-.+\.md$`).
- `src/adapters/opencode/install.ts` — `installAgents(home?)` 신설, target `~/.config/opencode/agent/` (singular).

테스트:
- `tests/unit/evaluator-prompt.test.ts` — 10 케이스 (validation/fitness 분기, merge/normal, defensive null/empty).
- `tests/e2e/validation-evaluator.test.ts` — 3 케이스 (false/true/absent 옵트인 분기).
- `tests/e2e/install-agents.test.ts` — 6 케이스 (양 adapter × `install-skills`/`update` × prefix anchor 보호).

### Fitness 통합 + Cruise escalation — 완료 (gen-067)

backlog `cruise-mode-evaluator-escalation-통합-validationfitness.md` 의 두 항목 (Fitness 통합, Cruise 자동 중단) 을 gen-067 에서 한 묶음 처리. Vision/Goal 위임은 별도 트랙 (아래 "후속 작업" 절) 으로 분리됨.

구현된 메커니즘:
1. **State 채널 — `GenerationState.evaluatorConcerns?: EvaluatorConcern[]`** — 단일 진실원 (`.reap/life/current.yml`). validation 단계에서 raised → fitness 단계에서 read. archive 시 lineage 에 자연 보존.
2. **`reap run validation --phase report-evaluator --severity <high|low|none> --summary "..."`** — side-channel CLI 신설. transition graph 외부 (nonce 검증/발급 없음). work phase prompt 에 builder 가 evaluator 응답 후 본 CLI 호출하라는 지시 자동 포함.
3. **Fitness phase evaluator 호출** — `completion.ts` 의 fitness work 분기 (cruise + supervised 양쪽) 에서 `config.evaluator === true` 시 `buildEvaluatorPrompt({ stage: "fitness" })` + `context.evaluator.{enabled, prompt}` emit. evaluator off 시 byte-identical (회귀 보장).
4. **Cruise auto-abort** — fitness work 분기에서 `state.evaluatorConcerns` 에 `severity: "high"` 가 하나라도 있으면 `clearCruise()` 호출 + 별도 fallback prompt emit (`cruiseAborted: true`, `previousCruiseCount`, `completed: [..., "cruise-aborted"]`). self-loop nonce 보존 — builder 가 supervised feedback 으로 재호출 가능.
5. **Prior concerns surfacing** — `evaluatorConcerns` 비어있지 않으면 fitness prompt 에 "Prior Evaluator Concerns" 절 추가 (양 분기 공통).

구현된 모듈:
- `src/types/index.ts` — `EvaluatorConcern` interface + `GenerationState.evaluatorConcerns?` 추가.
- `src/cli/index.ts` + `src/cli/commands/run/index.ts` — `--severity` / `--summary` 옵션 + JSON forward.
- `src/cli/commands/run/validation.ts` — `report-evaluator` phase 분기 + work prompt builder 지시 추가.
- `src/cli/commands/run/completion.ts` — fitness 분기 재작성 (evaluator section + priorConcernsSection + cruise-aborted branch).

테스트:
- `tests/unit/evaluator-concerns-state.test.ts` — 5 케이스 (yaml round-trip, 특수문자, append).
- `tests/e2e/validation-report-evaluator.test.ts` — 7 케이스 (severity high/low/none, 누적 append, severity missing/invalid, summary missing).
- `tests/e2e/completion-cruise-abort.test.ts` — 4 케이스 (cruise+high → abort, cruise+low → no abort, cruise+none → 정상, supervised+high → no abort).

## 후속 작업 (미구현 — 별도 backlog/generation)

### Vision/Goal 관리 위임 — 다음 트랙
- Adapt phase 에서 evaluator 가 vision gap 분석 수행.
- Goal 추천 로직 evaluator 에 위임.
- gen-067 fitness 통합이 prerequisite — vision 위임은 adapt phase 의 다른 layer 이므로 분리.

## 설계 원칙

- 정량적 fitness 메트릭 금지 (Goodhart's Law) -- evaluator도 정성적 판단만
- 인간의 최종 결정권 보장 -- evaluator는 제안/판단, 인간이 override 가능
- 생물학적 메타포 유지 -- fitness evaluation은 환경(외부)이 수행
- Self-fitness 금지 -- evaluator는 자기 평가 품질을 평가하지 않음

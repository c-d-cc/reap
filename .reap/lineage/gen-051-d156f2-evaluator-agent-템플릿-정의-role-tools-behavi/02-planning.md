# Planning

## Goal

Evaluator agent 템플릿(`src/templates/agents/reap-evaluate.md`) 정의 및 설계 문서 갱신.
이번 generation이 끝나면 evaluator agent의 role, tools, behavior rules, cross-generation orchestration 방식이 확정된 템플릿 파일이 존재한다.

## Completion Criteria

1. `src/templates/agents/reap-evaluate.md` 파일이 존재하고, reap-evolve.md와 동일한 frontmatter 구조(name, description, tools, model, memory)를 갖는다
2. 템플릿에 다음 섹션이 모두 포함: Role, Mandatory Files, Agent Mindset, Behavior Rules (에스컬레이션 기준 포함), Tool Usage Rules, Evaluation Workflow
3. 승인된 설계 결정 4가지가 모두 템플릿에 반영됨
4. `.reap/vision/design/evaluator-agent.md` 설계 문서가 템플릿 구조를 반영하여 갱신됨
5. 빌드 성공 (`npm run build`)
6. 기존 테스트 regression 없음

## Background

현재 reap-evolve agent가 코드 작성과 검증을 모두 수행하여 self-review bias가 존재한다. 독립된 evaluator agent를 도입하여 검증 품질을 높이고, 인간의 fitness 평가 부담을 줄이며, cross-generation 맥락 기반으로 더 정확한 vision/goal 관리를 위임한다.

gen-050에서 nonce transition graph 리팩토링이 완료되어 evaluator가 validation-implementation micro-loop 등 유연한 전이를 활용할 수 있는 기반이 마련되었다.

## Approach

### 승인된 설계 결정 반영

1. **Tool 접근: Read + Bash** -- 테스트 실행으로 독립 검증 가능, 코드 수정은 behavior rule로 금지
2. **에스컬레이션 기준**: confidence x impact 매트릭스 (High conf + Low impact -> 직접 판단, High conf + High impact -> 에스컬레이션(판단 포함), Low conf -> 에스컬레이션(판단 유보))
3. **Cross-generation 맥락: REAP Memory 활용** -- 기존 3-tier memory 공유, 평가 기록은 completion artifact에
4. **산출물 범위**: reap-evaluate.md 템플릿 + evaluator-agent.md 설계 문서 갱신. 코드 수정 없음.

### 템플릿 구조

reap-evolve.md 패턴을 따르되, evaluator 고유의 역할에 맞게 조정:
- Frontmatter: `name: reap-evaluate`, tools는 `Read, Bash, Glob, Grep` (Write/Edit 제외)
- Role: 독립 검증자, fitness 1차 평가, vision/goal 관리
- Behavior Rules: 코드 수정 금지, 에스컬레이션 매트릭스, 정량적 메트릭 금지
- Evaluation Workflow: fitness 평가 → 에스컬레이션 판단 → 인간 피드백 통합

## Scope

### In Scope
- `src/templates/agents/reap-evaluate.md` -- 신규 생성
- `.reap/vision/design/evaluator-agent.md` -- 갱신 (구체적 템플릿 구조 반영)

### Out of Scope
- `src/core/prompt.ts` 수정 (evaluator용 dynamic context 빌드)
- `src/cli/commands/run/completion.ts` 수정 (evaluator 호출 로직)
- `src/types/index.ts` 수정 (evaluator 관련 타입)
- 테스트 코드 작성 (템플릿 파일은 기능 테스트 대상이 아님)

## Tasks

- [ ] T001 `src/templates/agents/reap-evaluate.md` -- evaluator agent 템플릿 작성 (frontmatter + role + mindset + behavior rules + tool usage + evaluation workflow)
- [ ] T002 `.reap/vision/design/evaluator-agent.md` -- 설계 문서 갱신 (템플릿 구조 반영, 진행 상태 업데이트)
- [ ] T003 빌드 검증 (`npm run build`)
- [ ] T004 기존 테스트 regression 확인 (`npm run test:unit`)

## Dependencies

- T001 완료 후 T002 (설계 문서는 템플릿 내용을 참조하여 갱신)
- T003, T004는 T001 이후 언제든 실행 가능

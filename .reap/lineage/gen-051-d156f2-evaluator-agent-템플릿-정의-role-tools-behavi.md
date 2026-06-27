---
id: gen-051-d156f2
type: embryo
goal: "Evaluator agent 템플릿 정의 — role, tools, behavior rules, cross-generation orchestration 기반 설계"
parents: ["gen-050-c33074"]
---
# gen-051-d156f2
Evaluator agent 템플릿(`src/templates/agents/reap-evaluate.md`)을 정의하고 설계 문서를 갱신했다.

**산출물**:
- `src/templates/agents/reap-evaluate.md` -- 신규 생성. Role, Mindset, Behavior Rules, Tool Usage, Evaluation Workflow 포함.
- `.reap/vision/design/evaluator-agent.md` -- 전면 갱신. 템플릿 구조 반영, 설계 결정 문서화, 후속 작업 구체화.

**핵심 설계 결정 반영**:
1. Tool 접근: Read + Bash (코드 수정은 behavior rule로 금지)
2. 에스컬레이션: confidence x impact 매트릭스
3. Cross-generation 맥락: REAP Memory 공유, 평가 기록은 completion artifact에
4. 정량적 메트릭 금지 (Goodhart's Law)

코드 수정 없음. 빌드/테스트 regression 없음.
# Shortterm Memory

## 세션 요약 (2026-03-28)

### gen-051: Evaluator Agent 템플릿 정의
- `src/templates/agents/reap-evaluate.md` 신규 생성
- `.reap/vision/design/evaluator-agent.md` 전면 갱신
- 설계 결정 4가지 반영: Tool(Read+Bash), 에스컬레이션 매트릭스, REAP Memory, 정량 메트릭 금지
- 코드 수정 없음, 빌드/테스트 regression 없음
- environment/summary.md Source Structure에 agents/ 디렉토리 추가

### 다음 세션
- Evaluator 코드 통합 (prompt.ts, completion.ts 수정)
- Fitness 위임 로직 (evaluator 1차 평가 -> 인간 에스컬레이션)
- Pre-existing test failures 수정 (integrity 관련 4개)
- vision/goals.md에서 "Evaluator agent 템플릿 정의" 완료 마킹

### Backlog 상태
- `fix-migrate-update-tests` (task) -- integrity/migrate/update 관련 8개 pre-existing test failure

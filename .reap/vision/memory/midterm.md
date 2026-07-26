# Midterm Memory

> Ongoing multi-generation tracks. A track that has no next step belongs in lineage, not here.

## Embryo → Normal transition

31+ generations, genome 안정, abort 거의 없음 — 전환 조건은 충족. 사용자 판단(2026-03-26)으로 embryo 유지: REAP 자체가 self-evolving 중이고 예기치 못한 genome 변경이 더 있을 수 있어 보수적. 배포 후 사용자 프로젝트면 전환 시점이지만 REAP 자신은 더 관찰.

다음 판단 시점: 사용자가 embryo→normal 전환을 명시 검토할 때.

## Evaluator Agent 트랙 — Vision/Goal 위임만 남음

설계 문서: `vision/design/evaluator-agent.md`. 템플릿: `src/templates/agents/reap-evaluate.md`.

완료 (gen-050~067):
- nonce transition graph + multi-nonce 발행
- evaluator agent 템플릿 정의
- 설계 결정 확정 (opt-in flag / advisor / 코드 통합 plan)
- Validation 단계 통합 (`ReapConfig.evaluator?: boolean` + `buildEvaluatorPrompt({ stage })`)
- Fitness 단계 통합 + `priorConcernsSection`
- Cruise mode high-severity escalation 자동 중단 (`EvaluatorConcern` state 채널 + `report-evaluator` CLI)

남은 1 항목:
- **Vision/Goal management 위임** — adapt phase에서 evaluator가 gap 분석 + 다음 goal 추천. 트랙 마지막 큰 항목. design 문서의 잔여 절.

## Daemon 트랙 — 유저 판단으로 일시 보류 (2026-07-26)

코어: `daemon/` 별도 앱, localhost:17224 HTTP API, Tree-sitter WASM 15개 언어, SQLite write-through.
완료 (gen-060/068/069): incremental, worktree, idle-timeout + config opt-in + 4 lifecycle 진입점 + lastIndexedCommit + 21 e2e + 격리 인프라.

**2026-07-26 세션에서 결정/발견된 것** (backlog 2건에 상술):

- **배포가 깨져 있다** — `dependencies` 는 `file:./daemon` 인데 `files` 에 `daemon/` 이 없고 npm 미발행. npm 설치 시 끊긴 심링크가 되어 **`daemon: true` 사용자가 daemon 을 아예 쓸 수 없다**. 소스 트리 dog-fooding 이라 여태 드러나지 않음. 실측 확인
- **분리 방향 = npm 독립 발행** — 번들(zero-dependency 파괴) / optionalDependencies(대상 부재라 무효) 모두 기각
- **SCIP 채택 확정** (유저 결정). Tree-sitter 를 대체가 아니라 baseline 으로 두고 SCIP 이 있으면 승격하는 하이브리드. 핵심 난제는 **노드 ID 통합**(`file::name` vs SCIP symbol ID)
- **실측 평가는 취소** (유저 판단) — 대형 코드베이스 확보가 비현실적. 코드 독해 기반 분석으로 대체
- MCP wrapper 는 계속 보류 (2026-06-28 결정)

**순서**: 배포 결함 → SCIP 설계. 착수는 0.17.2 릴리즈 이후, 유저가 재개를 지시할 때.

기존 잔여 항목(가이드 문서 강화 / dist queries path / `.js` strip / 자동 staleness)은 위 두 backlog 에 흡수 여부를 판단할 것.

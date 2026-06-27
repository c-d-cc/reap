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

## Daemon Indexer 트랙 — 남은 작업

코어: `daemon/` 별도 앱, localhost:17224 HTTP API, Tree-sitter WASM 15개 언어, SQLite write-through.
완료 (gen-060/068/069): incremental, worktree, idle-timeout 검증 + config opt-in + 4 lifecycle 진입점 + lastIndexedCommit 노출 + 21 e2e + 격리 인프라.

남은 작업:
- **daemon 가이드 문서 강화** — MCP wrapper 대신 HTTP API 직접 활용 가이드를 docs/reap-guide.md에 충실히 기술. curl 패턴, 주요 쿼리 시나리오 포함.
- **daemon dist queries path resolution fix** — gen-064 패턴 (`__dirname.includes("dist")` 분기) 적용. npm postinstall auto-spawn 영향.
- **import-resolver `.js` extension 자동 strip** — TS ESM 규약 (`import { x } from "./foo.js"`)이 IMPORTS edge에 잡히도록.
- **자동 staleness 판단 + 자동 reindex** — 현재는 `lastIndexedCommit` 노출까지만. CLI 비교 + reindex trigger는 향후.

MCP server wrapper는 보류 (2026-06-28 사용자 결정): 가이드 문서 강화로 충분, 별도 프로세스 복잡도 불필요.

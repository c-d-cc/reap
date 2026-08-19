# Midterm Memory

> Ongoing multi-generation tracks. A track that has no next step belongs in lineage, not here.

## 릴리즈 배분 — 0.17.5 / 0.18 (유저 결정 2026-08-19)

pending backlog 8건을 두 릴리즈로 가른다.

- **0.17.5 — daemon 2건**: 배포 결함 수정(npm 독립 발행) → SCIP 설계. 순서 고정
- **0.18 — 나머지 6건**: plugin 전환 · interview skill · milestone · idea · plan(자리) · `/reap.plan` skill

**0.18 작업에는 migration 계획을 함께 만든다.** 6건 중 다수가 `.reap/` 구조와 지식 축을 바꾸므로, 템플릿·코드만 고치면 **이미 존재하는 프로젝트에는 아무것도 도달하지 않는다** (gen-072). `src/templates/migration/v0.18.x.md` 를 각 건과 함께 설계할 것. idea·plan 이 둘 다 최상위 자리를 추가하므로 **migration note 를 건별로 쓸지 한 번에 쓸지**를 먼저 정한다.

**0.18 은 README 와 문서 페이지에 별도 항목을 만든다.** changelog 한 줄이 아니라 **무엇이 추가됐고 어떻게 쓰는가**를 담는 절이다. 지식 축이 셋에서 넷(+idea)으로 늘고 skill 이 둘 늘어나므로, 기존 사용자가 "그래서 뭘 어떻게 하라는 건가"를 읽을 자리가 필요하다. 대상: `README*.md` + `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` **5개 로케일 전부**.

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

**순서**: 배포 결함 → SCIP 설계. **0.17.5 로 배정** (위 § 릴리즈 배분). 착수는 유저가 재개를 지시할 때.

기존 잔여 항목(가이드 문서 강화 / dist queries path / `.js` strip / 자동 staleness)은 위 두 backlog 에 흡수 여부를 판단할 것.

# Midterm Memory

> Ongoing multi-generation tracks. A track that has no next step belongs in lineage, not here.

## 릴리즈 — 0.17.5 발행 완료, 다음은 0.17.6 (daemon 폐기)

**0.17.5 는 발행됐다** — `2026-08-19T21:34Z`, 태그 `v0.17.5`(c65284d)에서. npm `latest` 다. gen-083~087 이 전부 들어갔다. **이미 나간 문서는 손대지 않는다** — changelog 는 역사 기록이다 (유저 결정 2026-08-20).

**다음은 0.17.6 이고 내용은 둘이다**:
- gen-088 `reap uninstall` — 없던 명령이고 증상이 "지워도 안 지워진다"라 기존 사용자 전원 해당. 같은 세대가 auto-update 다운그레이드도 고쳤다
- **daemon 폐기 + indexer 내장** — 아래 트랙 참조

**backlog 정리 (유저 지시 2026-08-19)**: gen-083~085 파생 11건을 1건으로 합치고 나머지를 버렸다(18 → 8). gen-086 이 그 1건을 닫았다. 기준은 하나였다 — **지금 존재하는 사용자에게 실제로 일어나는가.** 다시 쌓이면 같은 기준으로 자를 것.

### 0.18 — 별도 브랜치, 6건

plugin 전환 · interview skill · milestone · idea · plan(자리) · `/reap.plan` skill.

**별도 브랜치인 이유**: 지식 축 3건(idea/plan/milestone)과 plugin 전환이 `.reap/` 구조와 배포 형태를 동시에 바꾼다. 중간 상태가 main 에 있으면 사용자가 반쯤 바뀐 구조를 받는다. 병합 시 `/reap.merge` 사용 여부는 그 시점에 판단.

**순서**: plugin 리서치·설계 → plugin 전환 구현 → **지식 축 경계 통합 설계**(idea·plan·milestone 의 Open Decisions 15개를 한 세대에서 닫는다. backlog 에 없는 신설 세대 — 셋이 genome·reap-guide·5 로케일·migration note 를 같이 건드려 따로 하면 경계가 어긋난다) → `.reap/plan/` + `.reap/idea/` 자리 → milestone → interview skill → `/reap.plan` skill → 문서. **plugin 전환이 앞에 오는 이유**: 새 skill 2개가 어느 배포 구조에서 태어날지 먼저 확정돼야 한다.

**migration 계획을 함께 만든다.** 템플릿·코드만 고치면 **이미 존재하는 프로젝트에는 아무것도 도달하지 않는다**(gen-072). idea·plan 이 둘 다 최상위 자리를 추가하므로 **migration note 를 건별로 쓸지 한 번에 쓸지**를 먼저 정한다.

**README 와 문서 페이지에 별도 항목을 만든다** — changelog 한 줄이 아니라 "무엇이 추가됐고 어떻게 쓰는가". 지식 축이 셋에서 넷으로 늘고 skill 이 둘 느는데, 기존 사용자가 읽을 자리가 없다. 대상: `README*.md` + 5개 로케일 **전부**.

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

## Daemon 트랙 — 폐기 결정 (2026-08-20)

**상주 프로세스를 폐기하고 indexer 를 reap 에 내장한다.** backlog: `daemon-폐기-및-indexer-내장-…md`. 0.17.6 대상.

계기는 Discussion #10 의 외부 제안이었고, 결정 근거는 그 자리에서 잰 수치다 — incremental 이 HTTP 로 **도달 불가**여서 매번 full reindex, 그 6.2초의 **92%가 파일별 `git log` 233회 fork**, 그리고 **blast radius 가 표준 TS ESM 프로젝트에서 항상 0을 반환**(import 341개 중 0개 해석 / `.js` specifier 미처리). 상주가 준다는 이점 넷은 현재 규모에서 전부 0에 수렴한다.

**가장 중요한 교훈**: 검사 전부가 *"인덱싱이 돌았는가"* 를 물었고 *"결과가 말이 되는가"* 는 아무도 묻지 않았다. E2E 130개·자기진단·CI 전부 초록인 채로 5개월. **소비자가 없으면 결함도 발견되지 않는다** — `.reap/plan/`·`.reap/idea/` 처럼 "자리를 먼저 만드는" 0.18 설계 전부에 그대로 적용된다.

`@c-d-cc/reap-daemon` 은 npm **deprecated 처리 완료**(다운로드 0회). SCIP 은 보류 유지 — 조사 결론은 `vision/design/daemon/scip-and-scale.md`. MCP wrapper 도 보류(프로세스 재도입이라 폐기 결정과 상충).


# Midterm Memory

> Ongoing multi-generation tracks. A track that has no next step belongs in lineage, not here.

## 릴리즈 — 0.17.6 은 태그·발행만 남음

**0.17.5 는 발행됐다** (`2026-08-19T21:34Z`, 태그 `v0.17.5`). **이미 나간 문서는 손대지 않는다** —
changelog 는 역사 기록이다 (유저 결정 2026-08-20).

**0.17.6 내용**: `reap uninstall`(gen-088) · **daemon 폐기 + indexer 내장**(gen-089) ·
source-map 규칙 전파(gen-090) · 층2 게이트 판정 수정(gen-091) ·
**auto-update 가 자기 버전을 읽고 자기만 업그레이드한다**(gen-092). 문서 3종 + 5 로케일에
전부 반영됐고 문서 게이트가 통과한다.

**남은 것은 태그 push 뿐이고, OIDC 로 발행하는 첫 시도**가 된다.
**릴리즈 전 수동 절차**: `scripts/check-agent-integration.sh`(층2, ~$0.25). gen-091 에서
통과했으나 **그 뒤 gen-092 가 소스를 바꿨으므로 재실행이 필요**하다 (team lead 가 수행).
검증 조합이 "0.17.6 소스 + 0.17.5 설치본"이므로 **발행 후 재실행이 더 정확한 검사**다.

**릴리즈 직전 판단이 하나 남아 있다** — `config.autoUpdate` 가 **읽히지 않는다**(backlog).
0.17.6 이 "사용자가 언급한 적 없는 설치를 바꾸지 않는다"를 고치는 릴리즈인데, **끄는 스위치가
동작하지 않는 절반**이 그대로다. 같이 넣을지 인간이 정한다.

**backlog 는 12건이다.** gen-092 가 5건을 추가했다(그중 위 `autoUpdate` 건과 `--mark-migrated` 가
기록을 낮추는 건이 사용자 대면). 정리 기준은 2026-08-19 유저 지시 그대로 — **지금 존재하는
사용자에게 실제로 일어나는가.** 다시 쌓이면 같은 기준으로 자를 것.

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

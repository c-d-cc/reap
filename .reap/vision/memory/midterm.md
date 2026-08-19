# Midterm Memory

> Ongoing multi-generation tracks. A track that has no next step belongs in lineage, not here.

## 릴리즈 — 0.17.5 는 태그만 남았고, 0.18 은 별도 브랜치 (유저 결정 2026-08-19)

**0.17.5 에 전부 합친다.** 별도 0.17.6 을 내지 않는다. daemon 배포 결함(gen-083) · 위치 명시 경로(gen-084) · 버전 판정(gen-085) 이 전부 여기 들어간다. `@c-d-cc/reap-daemon@0.2.0` 은 **발행됐고 동작이 확인됐다**.

**남은 것**: RELEASE_NOTES / NOTICE / 5 로케일을 gen-084·085·086·**087** 내용으로 **보강**(지금 쓰인 것은 daemon 배포·위치조회 범위뿐) → 태그 push. 태그 `v0.17.5` 는 이미 있으나 그 release run 이 게이트에서 실패했고 **아무것도 발행되지 않았다** — 태그를 옮겨야 한다. **밀면 OIDC 로 발행하는 첫 시도**가 된다.

gen-087 은 릴리즈 문서에서 **한 줄보다 큰 자리**가 필요할 수 있다 — 증상이 "npm 12 사용자에게 REAP 가 아예 안 붙는다"이고, 이미 그 상태로 0.17.4 를 설치한 사용자가 존재한다. 다만 그들은 `reap` 을 한 번 부르면 스스로 복구되므로 안내는 "무엇이 고쳐졌는가"이지 "무엇을 하라"가 아니다.

**backlog 정리 (유저 지시)**: gen-083~085 가 파생시킨 backlog 11건을 1건으로 합치고 나머지는 버렸다(18 → 8). **gen-086 이 그 1건을 소비해 닫았다** — 남은 pending 7건은 전부 0.18 또는 daemon SCIP 이며 **daemon 파생 트랙은 끝났다.**

정리의 기준은 하나였다 — **지금 존재하는 사용자에게 실제로 일어나는가.** 다시 쌓이기 시작하면 같은 기준으로 다시 자를 것. 버린 항목과 이유는 그 backlog 의 표에 남아 있다.

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

## Daemon 트랙 — 종료 (2026-08-19)

gen-083 배포 분리 → gen-084 위치 명시 지정 → gen-085 버전 판정 → gen-086 파생 결함 3건. `@c-d-cc/reap-daemon@0.2.0` 발행됐고 격리 환경에서 node 로 기동·응답까지 확인했다.

**SCIP 은 착수하지 않기로 했다.** 조사 결론은 `vision/design/daemon/scip-and-scale.md` 로 옮기고 backlog 를 닫았다. 요지: SCIP 은 구조적 한계 4가지 중 **1번(이름 기반 call resolution)만** 풀고 2·3·4(인메모리 그래프 / 단일 repo 가정 / incremental 정합성)는 그대로 남으며, 그 대가로 사용자 저장소에 빌드 가능한 툴체인을 요구한다 — 패키징으로 없앨 수 없는 비용이다. 착수 근거였던 "외부 확산 시 대형 코드베이스"가 아직 성립하지 않는다.

**재검토 조건**은 그 문서에 적었다 — 실사용자가 call resolution 정확도에 불만을 제기하거나, 메모리·스캔 상한에 실제로 부딪힐 때. **추측으로 재개하지 말 것.**

MCP wrapper 는 계속 보류 (2026-06-28 결정).

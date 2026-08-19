# Midterm Memory

> Ongoing multi-generation tracks. A track that has no next step belongs in lineage, not here.

## 릴리즈 배분 — 0.17.5 / 0.18 (유저 결정 2026-08-19)

pending backlog 8건을 두 릴리즈로 가른다.

- **0.17.5 — daemon**: 배포 결함 수정 **(gen-083 완료)** → 위치 명시 지정 경로 **(gen-084 완료)** → **`daemon-v0.2.0` 발행(유저가 태그 push)** → 릴리즈. **선행조건은 전부 끝났고 발행만 남았다.** daemon SCIP 설계는 코드를 내지 않으므로 릴리즈와 순서 무관
- **0.18 — 나머지 6건**: plugin 전환 · interview skill · milestone · idea · plan(자리) · `/reap.plan` skill

**0.18 작업에는 migration 계획을 함께 만든다.** 6건 중 다수가 `.reap/` 구조와 지식 축을 바꾸므로, 템플릿·코드만 고치면 **이미 존재하는 프로젝트에는 아무것도 도달하지 않는다** (gen-072). `src/templates/migration/v0.18.x.md` 를 각 건과 함께 설계할 것. idea·plan 이 둘 다 최상위 자리를 추가하므로 **migration note 를 건별로 쓸지 한 번에 쓸지**를 먼저 정한다.

**브랜치 전략 (유저 결정 2026-08-19)**: 0.17.5 는 **main 에서 진행하고 완료 즉시 릴리즈**한다. 0.18 은 **별도 브랜치**에서 전체를 진행하고 충분한 테스트를 거친 뒤 main 에 반영한다 — 지식 축 3건(idea/plan/milestone)과 plugin 전환이 `.reap/` 구조와 배포 형태를 동시에 바꾸므로, 중간 상태가 main 에 있으면 사용자가 반쯤 바뀐 구조를 받게 된다. 브랜치 병합 시 `/reap.merge` 사용 여부를 그 시점에 판단할 것.

**세대 시퀀스 (2026-08-19 확정)**: gen-085 plugin 리서치·설계 → gen-086 plugin 전환 구현 → **gen-087 지식 축 경계 통합 설계**(idea·plan·milestone 3건의 Open Decisions 15개를 한 세대에서 닫는다. backlog 에 없는 신설 세대 — 셋이 genome·reap-guide·5 로케일·migration note 를 같이 건드려 따로 하면 경계가 어긋난다) → gen-088 `.reap/plan/` + `.reap/idea/` 자리 → gen-089 milestone → gen-090 interview skill → gen-091 `/reap.plan` skill → gen-092 문서. **plugin 전환이 앞에 오는 이유**: 새 skill 2개(interview, `/reap.plan`)가 어느 배포 구조에서 태어날지 먼저 확정되어야 한다.

**0.18 은 README 와 문서 페이지에 별도 항목을 만든다.** changelog 한 줄이 아니라 **무엇이 추가됐고 어떻게 쓰는가**를 담는 절이다. 지식 축이 셋에서 넷(+idea)으로 늘고 skill 이 둘 늘어나므로, 기존 사용자가 "그래서 뭘 어떻게 하라는 건가"를 읽을 자리가 필요하다. 대상: `README*.md` + `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` **5개 로케일 전부**.

## 0.17.5 / 0.17.6 (유저 결정 2026-08-19)

**0.17.5 — 커밋 완료, 태그 보류.** 버전 bump·RELEASE_NOTES 승격·NOTICE·5 로케일·migration note `v0.17.5.md` 모두 커밋됨. 문서 게이트 통과, 층2(agent 통합) 통과. **태그를 밀면 OIDC 로 발행하는 첫 시도**가 된다 — 실패해도 태그를 옮기거나 재실행하면 복구된다. 유저가 0.17.6 범위를 보고 다시 판단하기로 함.

**0.17.6 — gen-083/084 작업에서 파생된 8건.** 전부 오늘 드러난 결함이며 서로 맞물려 있다.

세대 배분 (backlog 이 명시한 결합을 따름):

- **gen-085 — floor 3건**: `semverGte` prerelease 미구분 / `MIN_DAEMON_VERSION` 인상 시 발행 여부 검사 게이트 / 낡은 daemon 안내가 명시 경로를 무시. **셋 다 "floor 를 올릴 때" 발동**하므로 한 세대에서 닫는다(낡은-안내 backlog 명시). gen-084 는 그 분기가 도달 불가라 의도적으로 고치지 않았다 — 검증할 수 없는 코드를 배포하지 않으려고
- **gen-086 — typecheck·빌드 책임 3건**: daemon typecheck 상시 red(`bun:sqlite` 타입 부재) → `noUnusedLocals` 도입 → e2e 가 daemon 빌드를 전제하는 문제. **순서가 강제된다** — 상시 red 인 곳에 규칙을 더하는 것은 무의미하다(noUnusedLocals backlog 명시)
- **gen-087 — lifecycle 도구 2건**: `reap run push` 가 실패 원인을 삼킴 / validation work phase 재실행 불가(evaluator prompt 회수 불가). 둘 다 이번 세션에서 **실제로 겪은** 것이다

**0.18 은 여전히 별도 브랜치**이며 이것들과 독립이다(아래 § 릴리즈 배분).

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

## Daemon 트랙 — 배포·위치조회 완료, SCIP 설계만 남음

코어: `daemon/` 별도 앱, localhost:17224 HTTP API, Tree-sitter WASM 15개 언어, SQLite write-through.
완료 (gen-060/068/069): incremental, worktree, idle-timeout + config opt-in + 4 lifecycle 진입점 + lastIndexedCommit + 21 e2e + 격리 인프라.

**배포 결함은 gen-083 에서 해소** — npm 독립 발행 형태 확정, dist queries path 수정, 네이티브 의존 external 화, 미설치 UX, 배포 산출물 게이트. 가이드 문서 강화도 함께 처리. 남은 잔여는 `.js` strip / 자동 staleness 뿐이며 SCIP 설계에 흡수 여부를 판단한다.

**위치 조회 (gen-084 완료)**: `daemonBin` / `REAP_DAEMON_BIN` 으로 명시 지정. 그 과정에서 **backlog 의 전제가 반증됐다** — pnpm 과 Yarn PnP 는 정상 동작하고, 깨지는 조건은 **reap 과 daemon 이 서로 다른 resolution root 에 설치되는 것**이다. gen-083 lineage 항목은 반증된 주장을 담고 있으니 그것을 직접 읽는 사람은 주의할 것.

**남은 것 — SCIP 설계**:
- **SCIP 채택은 확정** (유저 결정). Tree-sitter 를 대체가 아니라 baseline 으로 두고 SCIP 이 있으면 승격하는 하이브리드. 핵심 난제는 **노드 ID 통합**(`file::name` vs SCIP symbol ID)
- **실측 평가는 취소** (유저 판단) — 대형 코드베이스 확보가 비현실적. 코드 독해 기반 분석으로 대체
- **새 설계 항목 (gen-083 발견)**: daemon 이 `queries/` 를 **런타임 자산**으로 들고 다닌다. SCIP 인덱서를 붙이면 그 자산 구조와 패키지 크기가 어떻게 되는지 설계에 포함할 것
- MCP wrapper 는 계속 보류 (2026-06-28 결정)

**floor 3건은 § 0.17.6 gen-085 가 소유한다.**

# Midterm Memory

> Ongoing multi-generation tracks. A track that has no next step belongs in lineage, not here.

## 릴리즈 — 0.17.5 는 태그만 남았고, 0.18 은 별도 브랜치 (유저 결정 2026-08-19)

**0.17.5 에 전부 합친다.** 별도 0.17.6 을 내지 않는다. daemon 배포 결함(gen-083) · 위치 명시 경로(gen-084) · 버전 판정(gen-085) 이 전부 여기 들어간다. `@c-d-cc/reap-daemon@0.2.0` 은 **발행됐고 동작이 확인됐다**.

**남은 것**: RELEASE_NOTES / NOTICE / 5 로케일을 gen-084·085 내용으로 **보강**(지금 쓰인 것은 daemon 배포·위치조회 범위뿐) → 태그 push. **태그를 밀면 OIDC 로 발행하는 첫 시도**가 된다 — 실패해도 태그를 옮기거나 재실행하면 복구된다.

**남은 세대 (backlog 이 명시한 결합을 따름. 번호는 실행 순서가 아니라 묶음이다)**:

- **typecheck·빌드 책임 3건**: daemon typecheck 상시 red(`bun:sqlite` 타입 부재) → `noUnusedLocals` 도입 → e2e 가 daemon 빌드를 전제하는 문제. **순서가 강제된다** — 상시 red 인 곳에 규칙을 더하는 것은 무의미하다
- **lifecycle 도구 2건**: `reap run push` 가 실패 원인을 삼킴 / validation work phase 재실행 불가(evaluator prompt 회수 불가). 둘 다 **여러 세션에서 실제로 겪었다**
- **gen-085 신설 3건**: `checkout` 분기가 dog-fooding 에서 죽어 있음(가장 값어치 있음) / `sort -V` prerelease 역전 / `DaemonNotInstalledError` 가 명시 경로 무시. 배분 미정

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

**버전 판정 축은 gen-085 에서 닫혔다** — 비교기 통합(`src/core/semver.ts`), 하한 발행 게이트(`scripts/check-version-floors.sh`), 출처별 낡은-daemon 안내. `MIN_DAEMON_VERSION` 은 0.2.0 그대로다.

# Midterm Memory

> Ongoing multi-generation tracks. A track that has no next step belongs in lineage, not here.

## 릴리즈 — 0.17.6 은 발행됐고, 그 뒤 문서 정리가 얹혔다 (사용자 판단 대기)

**0.17.6 은 발행됐다.** 내용: `reap uninstall`(gen-088) · daemon 폐기 + indexer 내장(gen-089) ·
source-map 규칙 전파(gen-090) · 층2 게이트 판정 수정(gen-091) · auto-update 가 자기 버전을 읽고
자기만 업그레이드(gen-092) · `autoUpdate: false` 가 실제로 끈다(gen-093).

**gen-094 가 그 뒤에 문서를 고쳤다** — 사용자 대면 daemon 서술 전면 제거 + 배포되던 오지시
(`migration/v0.17.5.md` 의 `npm i -g @c-d-cc/reap-daemon`) 삭제. **버전 bump 없음.**

**gen-095 가 그 아래층을 고쳤다** — 게이트·워크플로·빌드 스크립트의 daemon 회고 주석,
`/docs/daemon` → `/docs/code-intelligence` 개명(리다이렉트 없음), 설계 문서 7파일 삭제,
죽은 이름 3종(`daemon-sample` fixture 디렉토리 · `MIN_DAEMON_VERSION` 주석 · `REAP_DAEMON_PORT`).
**트리 전체를 훑는 검사를 신설**해 다음에 다시 생기면 red 가 된다. **버전 bump 없음.**

**발행 문서 수정 규칙 (사용자 승인, 2026-08-21)**: "이미 나간 문서는 손대지 않는다"가 원칙이되
예외 기준은 *역사성*이 아니라 **실행 가능성**이다 — 따라 하면 실패하는 지시를 담고 있으면 그 부분은
고치되 **버전 항목 자체는 남긴다**. gen-094 가 이 기준으로 v0.17.5·v0.17.0 을 처리했다.

**남은 것**:
1. **0.17.7 patch 릴리즈** — 태그 이동 안 한다(npm 이 같은 버전 재발행을 거부하고 provenance
   와 어긋난다). gen-094 는 `package.json` 을 **0.17.6 그대로 두었다**. bump·5 로케일 changelog
   신설·태그·발행은 `reapdev.versionBump` 로 별도 진행
2. 층2 게이트(`check-agent-integration.sh`, ~$0.25) 재실행 — gen-091 이후 소스가 계속 바뀌었다
   (team lead 수행)

**backlog pending 16건** (gen-095 가 `reap.cc/docs/* 전부 404` 를 priority high 로 1건 추가). 정리 기준은 2026-08-19 유저 지시 그대로 — **지금 존재하는 사용자에게
실제로 일어나는가.** gen-092 가 지목한 것 중 `--mark-migrated` 가 기록을 `0.0.0` 으로 낮추는
건이 남아 있다.

### 0.18 — 별도 브랜치, 6건

plugin 전환 · interview skill · milestone · idea · plan(자리) · `/reap.plan` skill.

**`command` source 발견 (2026-08-20) — 배포 형태 판단을 뒤집는다. 아직 결정 안 됨.**
명령이 세션마다 재실행되므로 `npm i -g` 한 번으로 CLI 와 plugin 이 동시에 갱신된다 —
"두 채널이 된다"는 앞선 판단이 무너진다. 근거·버전·측정은
`vision/design/plugin-distribution.md` § 4 가 소유한다. 따라서 **auto-update 는 사라지지 않고
plugin 갱신의 유일한 경로가 되며**, gen-093 이 고친 `autoUpdate` 는 그때 **더** 중요해진다.

**미결 셋**: (a) **A/B 배포 형태 확정** (b) **update 관련 backlog 4건 삭제 여부** — (a) 에
종속된다 (c) `plugin-distribution.md` 의 **미독 절 3개**(결정 대기 / 미측정 / plugin cache)를
읽고 판단할 것.

**0.18 최우선을 plugin 전환으로 둘지 사용자가 검토 중** (근거: 최근 12세대 중 6세대가 사용자
레벨 자산 관리였고 전환과 함께 그 코드의 상당 부분이 사라진다). **별도 브랜치인 이유**: 지식 축
3건과 plugin 전환이 `.reap/` 구조와 배포 형태를 동시에 바꾸므로, 중간 상태가 main 에 있으면
사용자가 반쯤 바뀐 구조를 받는다.

**순서**: plugin 리서치·설계 → plugin 전환 구현 → **지식 축 경계 통합 설계**(idea·plan·milestone 의 Open Decisions 15개를 한 세대에서 닫는다 — 셋이 genome·reap-guide·5 로케일·migration note 를 같이 건드려 따로 하면 경계가 어긋난다) → `.reap/plan/` + `.reap/idea/` 자리 → milestone → interview skill → `/reap.plan` skill → 문서. **plugin 전환이 앞에 오는 이유**: 새 skill 2개가 어느 배포 구조에서 태어날지 먼저 확정돼야 한다.

**migration 계획을 함께 만든다** — 템플릿·코드만 고치면 기존 프로젝트에 아무것도 도달하지 않는다(gen-072). idea·plan 이 둘 다 최상위 자리를 추가하므로 **note 를 건별로 쓸지 한 번에 쓸지**를 먼저 정한다. **README + 5 로케일에 별도 항목**도 만든다 — changelog 한 줄이 아니라 "무엇이 추가됐고 어떻게 쓰는가".

## Embryo → Normal transition

31+ generations, genome 안정, abort 거의 없음 — 전환 조건은 충족. 사용자 판단(2026-03-26)으로 embryo 유지: REAP 자체가 self-evolving 중이고 예기치 못한 genome 변경이 더 있을 수 있어 보수적. 배포 후 사용자 프로젝트면 전환 시점이지만 REAP 자신은 더 관찰.

다음 판단 시점: 사용자가 embryo→normal 전환을 명시 검토할 때.

## Evaluator Agent 트랙 — Vision/Goal 위임만 남음

설계 문서: `vision/design/evaluator-agent.md`. 템플릿: `src/templates/agents/reap-evaluate.md`.
완료분(gen-050~067)은 lineage 와 design 문서가 소유한다.

**남은 1 항목 — Vision/Goal management 위임**: adapt phase 에서 evaluator 가 gap 분석 +
다음 goal 추천. 트랙의 마지막 큰 항목이며 design 문서의 잔여 절이다.

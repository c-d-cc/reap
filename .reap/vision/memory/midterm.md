# Midterm Memory

> Ongoing multi-generation tracks. A track that has no next step belongs in lineage, not here.

## 릴리즈 — 0.17.6 은 발행됐고, 그 뒤 문서 정리가 얹혔다 (사용자 판단 대기)

**0.17.6 은 발행됐다** (gen-088~093: uninstall · daemon 폐기 + indexer 내장 · source-map 규칙 전파 ·
층2 판정 · auto-update 버전 판독 · `autoUpdate` 배선). **그 뒤 세 세대가 bump 없이 얹혔다** —
gen-094·095(daemon 흔적 제거, 재발 검사 신설) · **gen-096**(문서 사이트 **115 페이지 prerender** +
로케일 URL 분리, 게이트 2종 신설). 상세는 lineage 가 소유한다.

**gen-096 의 미해결** — `404.html` 이 이제 28 KB 영어 홈 + `canonical=사이트 루트` + OG=홈 이다
(워크플로 `cp` 유지 지시 때문). 세 선택지가 그 세대 completion artifact § Next Generation Hints 에 있다.

**발행 문서 수정 규칙 (사용자 승인, 2026-08-21)**: "이미 나간 문서는 손대지 않는다"가 원칙이되 예외
기준은 *역사성*이 아니라 **실행 가능성**이다 — 따라 하면 실패하는 지시는 고치되 버전 항목은 남긴다.

**남은 것**:
1. **0.17.7 patch 릴리즈** — `package.json` 은 0.17.6 그대로다. 태그 이동은 하지 않는다(npm 이 같은
   버전 재발행을 거부한다). bump·5 로케일 changelog·태그·발행은 `reapdev.versionBump` 로 별도 진행
2. 층2 게이트(`check-agent-integration.sh`, ~$0.25) 재실행 — gen-091 이후 소스가 계속 바뀌었다
   (team lead 수행)
3. **배포 직후 `scripts/check-docs-live.sh` 를 실제 reap.cc 에 돌린다** — gen-096 이 PASS 를 관측하지
   못한 유일한 대상이다. `docs/**` 가 main 에 push 되면 `docs.yml` 이 자동 배포하므로 자연히 기회가 온다
4. **gen-096 의 2차 독립 검토가 미응답으로 끝났다.** 그 세대의 수정은 한 라운드분만 검토받았고
   1차가 낸 blocking 이 설계 주장 안쪽에 있었다. push 전에 받아볼 가치가 있다

**backlog pending 9건** (16 → 9: 0.18 기획 6건이 `vision/design/backlogs_v0.18/` 로 이동, gen-096 이
docs 건 소비). 정리 기준은 2026-08-19 유저 지시 — **지금 존재하는 사용자에게 실제로 일어나는가.**
gen-092 가 지목한 `--mark-migrated` 가 기록을 `0.0.0` 으로 낮추는 건이 남아 있다.

### 0.18 — 별도 브랜치, 6건

plugin 전환 · interview skill · milestone · idea · plan(자리) · `/reap.plan` skill.

**`command` source 발견 (2026-08-20) — 배포 형태 판단을 뒤집는다. 아직 결정 안 됨.** 명령이 세션마다
재실행되므로 `npm i -g` 한 번으로 CLI 와 plugin 이 동시에 갱신된다 — "두 채널이 된다"는 앞선 판단이
무너진다. 따라서 **auto-update 는 plugin 갱신의 유일한 경로가 되고** gen-093 의 `autoUpdate` 는 그때
더 중요해진다. 근거·버전·측정은 `vision/design/plugin-distribution.md` § 4 가 소유한다.

**미결 셋**: (a) **A/B 배포 형태 확정** (b) **update 관련 backlog 4건 삭제 여부** — (a) 에
종속된다 (c) `plugin-distribution.md` 의 **미독 절 3개**(결정 대기 / 미측정 / plugin cache)를
읽고 판단할 것.

**0.18 최우선을 plugin 전환으로 둘지 사용자가 검토 중** (최근 12세대 중 6이 사용자 레벨 자산
관리였고 전환과 함께 그 코드의 상당 부분이 사라진다). **별도 브랜치**로 간다 — 지식 축 3건과 plugin
전환이 `.reap/` 구조와 배포 형태를 동시에 바꿔, 중간 상태가 main 에 있으면 사용자가 반쯤 바뀐 구조를 받는다.

**순서**: plugin 리서치·설계 → plugin 전환 구현 → **지식 축 경계 통합 설계**(idea·plan·milestone 의
Open Decisions 15개를 한 세대에서 닫는다 — 따로 하면 genome·reap-guide·5 로케일·migration note 에서
경계가 어긋난다) → `.reap/plan/`·`.reap/idea/` 자리 → milestone → interview skill → `/reap.plan` → 문서.
**plugin 전환이 앞에 오는 이유**: 새 skill 2개가 어느 배포 구조에서 태어날지 먼저 확정돼야 한다.
항목별 상세는 `vision/design/backlogs_v0.18/` 6개 파일이 소유한다.

**함께 정할 둘**: migration note 를 건별로 쓸지 한 번에 쓸지 (템플릿·코드만 고치면 기존 프로젝트에
아무것도 도달하지 않는다 — gen-072) · README + 5 로케일에 **별도 항목**을 만들지.

## Embryo → Normal transition

전환 조건은 오래전에 충족됐으나 사용자 판단(2026-03-26)으로 **embryo 유지** — REAP 자신이
self-evolving 중이라 예기치 못한 genome 변경이 더 있을 수 있다. 다음 판단은 사용자가 명시 검토할 때.

## Evaluator Agent 트랙 — Vision/Goal 위임만 남음

설계 문서: `vision/design/evaluator-agent.md`. 템플릿: `src/templates/agents/reap-evaluate.md`.
완료분(gen-050~067)은 lineage 와 design 문서가 소유한다.

**남은 1 항목 — Vision/Goal management 위임**: adapt phase 에서 evaluator 가 gap 분석 +
다음 goal 추천. 트랙의 마지막 큰 항목이며 design 문서의 잔여 절이다.

---
id: ms-015
slug: v018-migration-skill
title: migration skill — v0.17을 v0.18로 옮긴다
from: loop-0003-plan
refs:
  - ps-4b485d:04-migration-skill.md
status: closed
openedAt: 2026-08-31T14:08:16Z
closedAt: 2026-08-31T14:28:10Z
---

## Background

loop-0003의 M3. 근거는 `ps-4b485d:04-migration-skill.md`(요구 8건 — 판정·차단·고지·격리 `.reap-v0_17/`·subagent 강제·진행 표시와 기록·doctor 검증). 전제 실측: 실물 v0.17 데이터는 reap 리포 main의 `.reap/`(lineage 40+·memory 3단·goals.md·design/·backlogs)이고, v0.17 config.yml 지문은 `autoSubagent`·`agentClient`·`autoUpdate`·`lastMigratedVersion` 등의 필드다(v0.18 config와 형태가 다르다). ms-014가 만든 upgrade agent stub(main `docs/upgrade-agent/reap-upgrade.md`)의 본문이 이 milestone의 산출물을 부른다.

## Exit Criteria

- v0.18 플러그인에 migration skill이 있고, 그 절차가 요구 8건을 전부 갖췄다 — 판정(구조 지문), uncommitted 시 block, 토큰 고지와 동의, `.reap-v0_17/` 격리, subagent 이주, 단계별 진행 표시, 기록 파일, `doctor` 결함 0 검증
- 이주 매핑의 미결 3건(열린 generation 처리·vision/design 거취·lineage/sequence 승계)이 확정돼 04-migration-skill.md에 미결 표기가 없다
- 홈 자산 정리 절차가 skill에 있다 — gen-088 allowlist 원칙(사용자 소유물 보존) 승계
- main의 upgrade agent 본문이 placeholder가 아니다 — npm @next 설치·검증·migration skill 호출까지의 흐름을 담는다
- **실물 검증**: reap main의 `.reap/` 사본 프로젝트에서 migration 절차를 실제로 수행해 `doctor` 결함 0과 기록 파일이 나왔다

## Out of Scope

- **발행 전부** — 0.17.8·0.18 publish, upgrade agent가 실제 네트워크로 배포되는 것
- **홈 자산 정리의 자동 실행** — skill은 절차를 갖되, 실제 사용자 홈을 건드리는 검증은 하지 않는다 (이 머신의 홈은 개발 환경이다)
- **plan source 자동 등록** — design/·goals의 plan source 승격은 안내까지만. 등록은 사용자의 판단이다

## Plan Items

1. skill 골격과 판정·차단·격리 — [tasks/1-skill-core.md](tasks/1-skill-core.md). 매핑 미결 3건도 여기서 확정
2. 이주 매핑 지시문과 홈 자산 정리 — [tasks/2-mapping.md](tasks/2-mapping.md)
3. upgrade agent 본문 완성 (main) — [tasks/3-agent-body.md](tasks/3-agent-body.md). 1·2 다음인 이유: agent의 마지막 단계가 skill 호출이므로 skill이 먼저 서야 한다
4. 실물 검증 — [tasks/4-live-migration.md](tasks/4-live-migration.md)

## Constraints

- skill 문서는 v0.18 플러그인 규약을 따른다 — 사용자 문자열 한국어, 다른 skill과 같은 톤
- migration은 **원본 비파괴**가 불변식이다: `.reap-v0_17/`이 남는 한 언제든 되돌릴 수 있어야 하고, skill의 어느 단계도 그 디렉토리를 수정하지 않는다

## Open Questions — task 1이 위임 하에 확정한다

- 열린 generation(`life/current.yml`)이 있으면 — block하고 구 도구로 닫으라고 안내하는가(uncommitted와 동일 원칙), 아니면 기록만 남기고 진행하는가
- `vision/design/` — `idea/files/`로 보내고 plan source 승격은 안내만 하는가
- `lineage/`·`sequence/` — 승계하지 않고(원본이 `.reap-v0_17/`에 남는 것이 이력) v0.18 세대를 1번부터 시작하는가

## 이 milestone이 끝나면 물어볼 것

- 실물 검증에서 이주된 결과물(lessons 선별·backlog 변환)의 품질이 쓸 만한가 — migration의 존재 이유는 "데이터가 살아서 넘어오는 것"이다
- `.reap-v0_17/` 격리 방식이 실제로 안심되는가 — 되돌리기를 시험해봤는가
- skill 지시문만으로 subagent가 절차를 지켰는가 — 강제가 아니라 지시라서 새는 지점이 있었는가

## Fitness (2026-08-31, 사람)

1. 실물 이주 결과물 품질 — **"쓸 만하다"**
2. 격리·되돌리기 — **"안심된다"**
3. 지시문만의 subagent — **"충분하다"** (샌 지점은 skill 밖 단계의 language 형식 1건, 즉시 반영)

읽기: 셋 다 확정. 실물 검증을 Exit Criteria에 넣은 것이 language 마찰을 배포 전에 잡았다 — 앞으로도 skill류 milestone은 실물 수행을 종료 조건에 넣는다.

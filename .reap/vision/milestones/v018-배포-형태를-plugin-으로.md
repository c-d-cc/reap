---
id: ms-001
goal: goal-004
status: open
main: true
createdAt: 2026-08-21T00:00:00.000Z
---

# v0.18 — 배포 형태를 plugin 으로

## Exit Criteria
- 사용자의 클라이언트에서 REAP 이 **하나의 도구로 보인다** — skill 19줄이 아니라 plugin 한 줄로,
  켜고 끄기·버전·출처가 함께
- **`reap install-skills` 가 사용자 홈 디렉토리에 파일을 흩뿌리지 않는다.** adapter 의 사용자 레벨
  설치 코드와 그것을 지키던 자기진단 게이트 절이 사라진다
- 이미 skill 형태로 쓰던 사용자가 update 했을 때 **중복 노출되지 않는다** — 구 경로 19개가
  누구에 의해 언제 지워지는지가 코드로 정해져 있다
- plugin 을 disable 한 상태에서 CLI 를 쓰면 **무엇이 일어나는지 사용자가 안다** (실패 양상 + 안내)
- 0.18 이 발행되고 `migration/v0.18.0.md` 가 기존 프로젝트에 규칙 변경을 전달한다

## Out of Scope
- **지식 축 정리** — 별도 milestone(`v018-지식-축-정리`). 브랜치가 다르고 goal 이 다르다
- **`.reap/plan/` 과 `/reap.plan`** — v0.18 에서 제외 (사용자, 2026-08-21).
  `vision/design/backlogs_plan-track/`
- **Cell (다중 pipeline)** — 공간축이고 이것은 배포 형태다
- **`backlogs_v0.17_residual/` 9건** — 전환 후 무엇이 살아남는지 판정하고 나서.
  그중 3~4건은 이 milestone 이 끝나면 소멸 후보다
- **indexer 기능**(community detection / process tracing)

## Generations
- [x] gen-097 — milestone 도입 (main 에 있고, plugin 브랜치가 상속한다)
- [ ] plugin 전환 구현 (별도 브랜치)
- [ ] 0.18 릴리즈 — bump + migration note + docs 5 로케일 (셋은 분리 불가)

<!-- 항목은 한 줄이어야 한다 — `readGenerations` 가 `- [ ]` 줄만 읽어 이어진 줄을 버린다.
     상세는 여기 아래에 둔다.

     리서치·설계는 generation 이 아니라 `vision/design/plugin-distribution.md` 한 파일이
       소유한다 (사용자, 2026-08-22). 실측 12건 + 결정 9건이 그 문서에 닫혀 있고,
       구현 세대는 그 문서의 § 1(무엇을 만드는가)과 § 4(반드시 지킬 것)부터 읽는다.
     구현이 별도 브랜치인 이유: 중간 상태가 main 에 있으면 사용자가 반쯤 바뀐 구조를 받는다.
     릴리즈 셋이 분리 불가인 이유: `check-docs-version.sh` § 5 가 note 버전 > 패키지 버전을 막는다. -->

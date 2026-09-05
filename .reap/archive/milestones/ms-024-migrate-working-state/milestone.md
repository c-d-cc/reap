---
id: ms-024
slug: migrate-working-state
title: "migrate 2차 — 작업 상태 복원: milestone·backlog·plan 재구성, genome·CLAUDE.md 갱신"
from: loop-0004-plan
status: closed
openedAt: 2026-09-04T15:59:41Z
focus: true
closedAt: 2026-09-05T01:04:47Z
---
## Background

selfview 실물 이주(2026-09-05)를 사람이 검수: "폴더·파일 구조만 맞춘 것 아닌가. `.reap-v0_17`을 지우면 프로젝트를 무리 없이 이어갈 수 있는가." 대조 결과 — 새 `.reap`에 milestone·loop·backlog가 없고(원본 shortterm·gen-046 completion에 다음 세대 후보 4개가 구체적으로 있었다), 실행 중 설계(team-mode 10문서)가 idea로 갔고, goals가 등록 안 됐고, genome이 v0.17 절차를 명령하고, CLAUDE.md가 지워진 reap-guide·agent를 가리킨다. 구조 이주는 됐지만 **작업 상태 이주**가 없다.

## Exit Criteria — "원본을 지워도 다음 세션이 이어서 일한다"

- 원본에 진행 중 트랙이 있으면(shortterm·midterm·goals·마지막 lineage의 Next Generation Hints) 새 `.reap`에 **focus milestone**(Background에 트랙 요약, tasks에 다음 세대 후보)과 **backlog**(트랙 밖 잔여 항목)가 있다. 상태 줄이 그것을 보여 준다
- 살아 있는 goals와 그것이 참조하는 설계 문서군은 **plan으로 리포 안에 옮겨져 등록**(`make plan-source`)되고 규약 파일이 있다. 채택되지 않은 설계만 idea/files로
- genome 3종에 v0.17 절차 어휘(embryo·normal·adapt·reflect·completion artifact·lifecycle stage·genome-change backlog·autoSubagent·cruise·environment refresh at completion)가 없다. 프로젝트 고유 규칙은 보존됐고, 바꾼 대목은 기록 파일에 diff 요약으로
- CLAUDE.md의 REAP 절이 v0.18 것으로 바뀌었다(reap-guide·reap-evolve·`@` import 없음, plugin·skill·상태 줄 안내)
- migration-map에 위가 매핑으로 적혀 있고, SKILL 7/8에 "작업 상태 복원 검사"가 있다(자동화 가능한 것은 `detect`처럼 스크립트로)
- selfview를 **처음부터 다시** 이주해 위를 전부 만족하고, 사람이 "지워도 된다"고 판정한다

## Out of Scope

- lineage 47 전체 이주 — 이력은 git과 `.reap-v0_17`에 있다. 마지막 세대의 hints만
- 0.17.8 다리·upgrade agent 본문 — 변경 없음

## Plan Items

1. migration-map·SKILL 개정 — 매핑 #2·#5·#6 재정의, #11(lineage hints)·#12(CLAUDE.md)·genome 재작성 규칙, 7/8 검사 (tasks/1)
2. selfview 재이주 + 대조 (tasks/2) — 만족할 때까지 1↔2 반복

## 이 milestone이 끝나면 물어볼 것

- 사람이 `.reap-v0_17`을 지우겠다고 했는가
- 첫 세션의 evolve가 묻지 않고 milestone의 다음 task로 갔는가

## Fitness (사람, 2026-09-05)

"ms-024는 완료했어." — selfview 재이주 결과를 사람이 직접 검수하고 만족으로 판정. 이주 후 개정(issue #25·#30, 홈 정리 스크립트)까지 이 milestone에 실렸다.

물어볼 것 두 질문의 읽기:
- `.reap-v0_17`을 지우겠다고 했는가 — **답 대신 기제로**: 사람이 "이 판단을 물을 수 있게 migrate 완료 후 적어 두자"고 해서, 8/8이 focus milestone의 handoff `## 미결`과 backlog 항목으로 남기게 했다(다음 세대)
- 첫 세션의 evolve가 묻지 않고 다음 task로 갔는가 — **아직 모름**. selfview에서 이주 뒤 첫 evolve가 아직 돌지 않았다 → `idea/research/`로

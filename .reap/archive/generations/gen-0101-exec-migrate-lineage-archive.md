---
id: gen-0101-exec
slug: migrate-lineage-archive
type: exec
milestone: ms-024
title: lineage → archive/generations 승계 스크립트, 해소된 backlog → archive/backlog, 번호 이어가기
startedAt: 2026-09-04T16:52:37Z
startCommit: 602be5a
status: closed
closedAt: 2026-09-04T17:09:24Z
endCommit: 35d2be5
---
## Intent

사람(2026-09-05): "archive는 하나도 migration이 안 됐는데?" — `.reap-v0_17`을 지우면 47세대의 회고·결정·힌트가 작업 트리에서 사라진다. 매핑 #8 "승계하지 않는다"(gen-0070 위임 판정)를 뒤집는다: lineage를 v0.18 세대 기록 형식으로 `archive/generations/`에 옮기고 `sequence/generation.md`에 번호를 이어 등록해 다음 세대가 그 뒤 번호로 시작한다. 해소된 backlog는 `archive/backlog/`에 consumed로. 변환은 결정적이라 스크립트(`scripts/migrate-lineage.mjs`)가 한다. 끝은 selfview에서 46세대 + pre-reap-history가 archive에 있고 doctor 0, verify에 "lineage 승계" 검사가 더해져 통과.

## Delegation

brief로 subagent에게 — reap 주 트리에서 스크립트·map·verify 수정, selfview에서 실행(커밋은 주 세션).
## Outcome

- `scripts/migrate-lineage.mjs`: 46세대(단일 파일 26·디렉토리 20) + pre-reap-history(gen-0000) → `archive/generations/`, 본문 원문 그대로(머리에 "v0.17에서 옮긴 기록" 한 줄), 레지스트리 append(재실행 안전). selfview에서 47파일, doctor 0, verify 9/9(검사 8·9 신설: 세대 수 일치·번호 연속). startedAt을 못 찾은 초기 3세대는 생략(경고 출력)
- `src/doctor.ts`: 글자·숫자가 없는 링크 target(`![...](...)` 같은 문법 예시)은 링크로 세지 않는다 — 승계 본문 실물의 오탐
- 검사 6(옛 경로 참조)은 `archive/generations/`를 제외 — 옮긴 이력의 경로는 당시 것이다
- map #8을 승계로, #3에 해소된 backlog → `archive/backlog/`(make → consumed --by → archived) 지시. **selfview의 backlog 8건 archive 처리는 사람이 직접 이주를 돌릴 때 수행된다** — subagent가 사람 요청으로 중단됨

## Dead Ends

- 사람이 "직접 해보겠다"고 해 subagent를 중단 — 이후 selfview는 dev로 되돌리고, 사람이 skill 전체를 처음부터 돌린다

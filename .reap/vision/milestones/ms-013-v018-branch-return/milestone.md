---
id: ms-013
slug: v018-branch-return
title: v0.18 브랜치 신설과 귀환
from: loop-0003-plan
refs:
  - ps-4b485d:02-branch-return.md
status: open
focus: true
openedAt: 2026-08-30T23:12:25Z
---

## Background

loop-0003이 낳았다. 근거는 `ps-4b485d:02-branch-return.md`. 자르기 전 전제 확인 (2026-08-31 실측):

- reap 트리는 건강하다 — `bun test` 172 전체 통과
- reap 리포에 `v0.18` 브랜치는 없다
- 개명 규모 — "reap" 표기: src 11파일 69곳 · plugin 11파일 83곳 · tests 157곳 · carrier 표식 17곳

## Exit Criteria

- reap 리포에 `v0.18` 브랜치가 있고, 첫 두 커밋이 **apocalypse**(구 소스 전부 삭제)와 **snapshot**(reap 적재)이다
- 브랜치에서 이름이 **reap**이다 — 바이너리 `reap`, 플러그인 `reap`, skill `/reap:*`, store `.reap/` — 그리고 `bun test` 전체와 `hook.test.sh`가 통과한다
- 사용자에게 보이는 곳(CLI 출력·플러그인·skill·훅)에 "reap" 표기가 남아 있지 않다 — grep으로 판정
- ms-002와 gen-101이 사유를 적은 커밋으로 닫혔고, 승계물(F1~F12 실측 · 0.17.8 다리 설계 · gen-088 uninstall 로직)이 v0.18 브랜치의 자리에 있다
- `claude --plugin-dir`로 로드한 세션에서 `/reap:evolve`가 동작한다

## Out of Scope

- **차단 이중화 구현과 기능 잔여 판단 6건** — M2. 브랜치가 서야 그 위에서 정할 수 있다
- **migration skill** — M3. M2의 판단(goal·uninstall 경계)에 걸려 있다
- **발행·배포 전부** — 이 계획 전체의 범위 밖
- **main(0.17.x) 쪽 변경** — 0.17.8 다리를 포함해 M2에서 다룬다. 이 milestone은 v0.18 브랜치만 만든다

## Plan Items

1. 승계물 추출과 apocalypse·snapshot — [tasks/1-apocalypse-snapshot.md](tasks/1-apocalypse-snapshot.md)
2. 개명 reap → reap — [tasks/2-rename.md](tasks/2-rename.md). 1 다음인 이유: 개명은 reap 리포 위에서 해야 코드와 리포가 같은 세대에서 움직인다 (genome의 마이그레이션 규칙)
3. 구 기획 정리 — [tasks/3-legacy-close.md](tasks/3-legacy-close.md)
4. 검증 — [tasks/4-verify.md](tasks/4-verify.md)

## Constraints

- 각 task의 산출 커밋은 **reap 리포에** 생긴다. 세대 기록은 이 리포(.reap)에 남으므로, 기록의 `References`에 reap 쪽 커밋 해시를 적는다 — `startCommit`·`endCommit`(이 리포 기준)만으로는 실제 작업이 안 보인다
- snapshot 직후 세션에서 개명까지 간다 — 이름이 갈라진 중간 상태를 브랜치에 오래 두지 않는다

## Open Questions — 답함 (gen-0061, 사람의 전체 위임 하에 agent가 결정)

- `.reap/` 기록: 스냅샷에 **포함**하되 자기관리 정본은 M1~M3 동안 **reap 리포**에 유지. 작전 종료 시 브랜치로 최종 동기화 — 두 곳이 동시에 살면 어긋난다
- 브랜치 자기관리: 새로 init하지 않고 스냅샷의 기록을 이어받는다. 구 `.reap/`(v0.17 데이터)는 apocalypse가 지운다 — main이 역사를 보존한다

## 이 milestone이 끝나면 물어볼 것

- apocalypse·snapshot 두 커밋 구조가 "무엇이 사라졌는가"를 실제로 읽게 해줬는가
- 전수 grep 개명에서 놓친 표기가 나왔는가 — 나왔다면 어떤 종류였는가
- 작업 리포(reap)와 기록 리포(reap)가 갈라진 상태가 어디서 아팠는가 — M2·M3 진행 방식에 반영할 것
- task 넷 크기가 맞았는가

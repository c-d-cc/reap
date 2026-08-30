---
id: gen-0013-exec
slug: 리포-레이아웃-이관
type: exec
milestone: ms-002
title: 이 리포를 새 레이아웃으로 옮긴다
startedAt: 2026-08-23T00:46:32Z
startCommit: 58a5b4f
status: closed
closedAt: 2026-08-23T00:49:16Z
endCommit: 5049e3b
---

## Intent

`gen-0012-exec`이 코드를 새 레이아웃으로 옮겼고, 그 순간 이 리포에서 `reap`가 죽었다. **도구가 자기 저장소를 못 읽는다.**

`.reap/`의 실제 내용물을 새 레이아웃으로 옮겨 도구를 살린다.

**끝나면:** `reap ctx`가 ms-002와 기억을 다시 내고, `make`·`mark`가 동작한다. 이 세대 자신이 도구로 닫힌다 — 그것이 판정이다.

**여기서 하지 않는 것:** id 재번호(`gen-NNNN-type`)는 Task 2.2, `cleanup` skill은 2.3. 이 세대는 **경로만** 옮긴다.

## References

- `generations/gen-0012-exec-저장-레이아웃-재편.md` — "마이그레이션은 반드시 마지막"이 왜 틀렸는지
- `.reap/memory/tracks.md` — 같은 발견

## Outcome

**도구가 살아났다.** `reap ctx`가 ms-002와 열린 세대와 기억을 다시 낸다.

옮긴 것 — `plan/`·`memory/`·`milestones/` → `vision/` · 세대 12개 → `life/generations/`(열린 것)와 `archive/generations/`(ms-001의 여섯) · `archive/ms-001-*/` → `archive/milestones/`. **`git status`가 전부 `R`(rename)로 잡는다.**

경로를 말하던 살아 있는 문서도 함께 고쳤다 — `evolve` SKILL(세대 경로), `complete` SKILL(archive 분리), `environment/summary.md`(3단 레이아웃).

`bun test` 79 · `hook.test.sh` 5/5.

## Dead Ends

**`git mv`에 글롭을 주면 하나가 실패할 때 전체가 취소된다.** `gen-0013-exec`의 기록 파일이 아직 추적 안 된 상태였는데, 같은 글롭에 있던 `gen-0012-exec`까지 안 옮겨졌다. 에러는 실패한 파일만 말했고 `rmdir`가 "Directory not empty"로 걸려서야 드러났다.

**옮긴 뒤 목록을 눈으로 본다.** 이동 명령의 성공 여부로 판단하지 않는다.

## Notes — 계획을 고쳤다

Task 2.4가 들고 있던 "이 리포 마이그레이션"이 각 task로 흩어졌다. 2.4에는 **앞의 셋이 다 선 뒤에야 할 수 있는 것**만 남았다 — skill·훅 최종 갱신, id 인용 치환, 전체 검증.

`milestone.md`의 작업 갈래에 그 근거를 적었다.

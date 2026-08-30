---
id: gen-0052-exec
slug: loops-위치
type: exec
backlog: bk-126614
title: plan/loops를 life/loops로
startedAt: 2026-08-30T14:49:36Z
startCommit: c900710
status: closed
closedAt: 2026-08-30T14:51:26Z
endCommit: 296530d
---
## Intent

`bk-126614` — `plan/loops/` → `life/loops/`. 코드와 리포를 같은 세대에서 옮긴다.

## Outcome

- `store.ts` — `loops: join(life, "loops")`, `DIRS`에 `life/loops`. `doc.ts`·`entries.ts`·`ctx.ts`는 `paths()`를 쓰므로 그대로
- `loop-0001` 파일을 `life/loops/`로 `git mv`. 새 바이너리로 `mark loop --closed`를 다시 돌려 그 자리에서 읽히는 것을 확인. `init --force`가 `life/loops/`를 만든다
- spec(`01`·`02`·`03`·`04`·`06`·`09`)·`map.md`(+템플릿)·skill(`loop`·`init`·`interview`)·`summary.md`의 경로. `03-storage.md`에 **왜 옮겼는가** — `plan/`을 3단 밖에 둔 논거는 등록부의 것이지 loop의 것이 아니다
- 테스트 138 통과, `localUpdate` 반영

## Dead Ends

없음. `loop-0001`이 `plan/loops/`를 고를 때 빌린 논거가 틀렸다는 것이 전부다 — 그 기록은 `03-storage.md`에 있다.

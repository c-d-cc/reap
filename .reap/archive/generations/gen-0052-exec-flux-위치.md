---
id: gen-0052-exec
slug: flux-위치
type: exec
backlog: bk-126614
title: plan/flux를 life/flux로
startedAt: 2026-08-30T14:49:36Z
startCommit: c900710
status: closed
closedAt: 2026-08-30T14:51:26Z
endCommit: 296530d
---
## Intent

`bk-126614` — flux 기록을 `plan/` 아래에서 `life/`로 옮긴다. 코드와 리포를 같은 세대에서 옮긴다.

## Outcome

- `store.ts` — `flux: join(life, "flux")`, `DIRS`에 `life/flux`. `doc.ts`·`entries.ts`·`ctx.ts`는 `paths()`를 쓰므로 그대로
- `flux-0001` 파일을 `life/flux/`로 `git mv`. 새 바이너리로 `mark flux --closed`를 다시 돌려 그 자리에서 읽히는 것을 확인. `init --force`가 `life/flux/`를 만든다
- spec(`01`·`02`·`03`·`04`·`06`·`09`)·`map.md`(+템플릿)·skill(`flux`·`init`·`interview`)·`summary.md`의 경로. `03-storage.md`에 **왜 옮겼는가** — `plan/`을 3단 밖에 둔 논거는 등록부의 것이지 flux의 것이 아니다
- 테스트 138 통과, `localUpdate` 반영

## Dead Ends

없음. `flux-0001`이 `plan/flux/`를 고를 때 빌린 논거가 틀렸다는 것이 전부다 — 그 기록은 `03-storage.md`에 있다.

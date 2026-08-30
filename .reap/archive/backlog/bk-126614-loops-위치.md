---
id: bk-126614
slug: loops-위치
type: structure
title: plan/loops를 life/loops로 옮긴다 — loop는 시간축에 얹힌다
createdAt: 2026-08-30T14:49:36Z
status: consumed
consumedBy: gen-0052-exec
---
## 무엇

`plan/loops/` → `life/loops/`. `plan/`을 3단 밖에 둔 논거(리포 밖을 가리키는 등록부라 시간축에 안 얹힘)는 `sources.yml`·`conventions/`의 것이지 loop의 것이 아니다. loop는 열리고 닫히고 archive로 간다 — `life/`의 정의("아직 참고할 값이 있는 것") 그대로이고 `archive/loops/`와 짝이 맞는다.

코드(`store.ts`)와 리포(`loop-0001` 이동)·spec·map·skill을 한 세대에서 같이 옮긴다.

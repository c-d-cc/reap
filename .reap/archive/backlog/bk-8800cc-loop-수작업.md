---
id: bk-8800cc
slug: loop-수작업
type: friction
title: make loop 없이 첫 loop를 손으로 열었다 — id·레지스트리·archive 이동이 전부 수작업
from: loop-0001-plan
createdAt: 2026-08-30T14:16:59Z
status: consumed
consumedBy: gen-0047-exec
---
## 무엇

`loop-0001`을 열며 손으로 한 것: `plan/loops/`·`archive/loops/` 디렉토리 생성, `sequence/loop.md` 헤더와 행, frontmatter 전부(`startCommit`은 `git rev-parse`로), 닫을 때 `closedAt`·`milestones` 기입과 `archive/loops/`로 `git mv`. `make milestone --from loop-0001-plan`은 검증 없이 받았다 — 그건 맞는 동작이지만 오타를 못 잡는다.

## 왜 남기나

`ms-012`의 12.1이 이것을 소비한다. 손으로 한 모양이 곧 도구가 내야 할 모양이다.

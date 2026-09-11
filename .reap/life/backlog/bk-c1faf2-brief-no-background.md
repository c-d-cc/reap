---
id: bk-c1faf2
slug: brief-no-background
type: fix
title: subagent brief에 백그라운드 금지가 없다 — 멈춤의 알려진 원인이 규율에 안 닿았다
createdAt: 2026-09-11T23:30:09Z
status: open
---

`lessons.md`가 이미 원인을 적고 있다 — *"두 세대(gen-0081·gen-0092)에서 subagent가 `bun test`·`claude -p`를 백그라운드로 돌리고 완료 알림을 기다리다 20~40분 멈췄다. 프로세스는 이미 끝나 있었다."*

**그런데 그 규율이 subagent가 읽는 문서에 없다.** `delegate-brief.md`는 *"Don't pipe verification commands. Take the exit code directly"*까지만 말하고 백그라운드는 안 막는다. `verify-brief.md`는 둘 다 없다.

교훈이 **규율할 자리에 안 닿은 것**이다. 사람이 겪는 "subagent가 종종 멈춘다"가 무작위 불안정이 아니라 이 한 줄의 부재일 수 있다.

할 일 — 두 brief에 넣는다.

- **백그라운드로 돌리지 않는다.** 검증도 빌드도 포그라운드에서 exit code를 직접 받는다
- 오래 걸리는 것은 상한을 건다 — macOS에 `timeout`이 없으므로 `perl -e 'alarm 300; exec @ARGV' -- <명령>`
- 알림을 기다리지 않는다

ralph(어느 구조든)는 subagent가 안정적으로 끝나는 데 기댄다. 이 항목이 그 전제다.

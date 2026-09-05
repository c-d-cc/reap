---
id: gen-0109-exec
slug: archive-on-close-cli
type: exec
milestone: ms-028
title: CLI — closed·consumed가 곧 archive 이동, loop overflow 삭제
startedAt: 2026-09-05T08:32:28Z
startCommit: f8b655f
status: open
---

## Intent

ms-028 tasks/1. `mark generation --closed`·`mark loop --closed`·`mark backlog --consumed`가 표시와 함께 `archive/`로 옮긴다(사람 결정 2026-09-05). `--aborted`는 삭제 그대로. `--archived`는 옛 규칙으로 life에 남은 것을 내리는 용도로 남기되 이미 archive면 거부. `CLOSED_LOOPS_KEPT`·overflow 삭제. 테스트가 세 이동과 재이동 없음을 검사한다. skill·spec·문서는 tasks/2·3.

## References

- ms-028 milestone.md Background · `src/entries.ts` markGeneration/markLoop/markBacklog(개정 전)

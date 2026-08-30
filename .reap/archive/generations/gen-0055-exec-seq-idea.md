---
id: gen-0055-exec
slug: seq-idea
type: exec
milestone: ms-006
title: seq와 idea가 내려갈 길
startedAt: 2026-08-30T16:48:48Z
startCommit: a598e38
status: closed
closedAt: 2026-08-30T16:50:07Z
endCommit: 2a78357
---
## Intent

`ms-006` 6.1 `seq` · 6.3 idea가 내려갈 길.

## Outcome

- `reap seq [계열|id]` — 레지스트리 넷(milestone·generation·loop·source)을 이스케이프를 되돌려 낸다. backlog·idea는 레지스트리가 없다고 말한다
- `mark idea --archived` → `archive/idea/<kind>/`. status는 그대로(backlog와 같은 모양). `listEntries("idea")`가 archive도 본다. `init`이 `archive/idea/`를 만든다
- `cleanup`에 idea 절, spec `03`·`04`, `map.md`+템플릿, `summary.md`. 143 통과

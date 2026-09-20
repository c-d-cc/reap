---
condition: always
order: 50
---
닫힌 것은 한 항목이다. **남은 것이 있으면 보고로 턴을 끝내지 말고 곧바로 `/reap:evolve`로 간다.**

남았는지 보는 곳 — 사람이 이번에 맡긴 목록, `.reap/life/backlog/`의 열린 항목, focus milestone의 `tasks/`와 `handoff.md`의 미결.

멈추는 것이 맞는 경우는 넷이다. 남은 것이 없을 때, 사람이 건 멈춤 조건이 충족됐을 때, 커밋 규칙이 어긋났을 때, 그리고 **사람의 것**일 때 — milestone fitness, `git push`, 방향을 바꾸는 개선. 이 넷이면 멈추고 말한다.

---
id: gen-0123-exec
slug: resolve-issue-34
type: exec
backlog: bk-d46db0
title: "resolve #34: 한 항목을 닫은 뒤 다음으로 넘어갈 의무를 적어 둘 자리가 없다"
startedAt: 2026-09-20T22:43:06Z
startCommit: 72cf374
status: open
---

## Intent

자율 실행 중 한 항목을 닫은 뒤 다음으로 넘어갈 의무를 REAP가 적어 둘 자리를
만든다. **새 저장 개념 없이** — `complete`의 규율 한 절과, 이미 있으나 어디서도
가리키지 않는 `gen.closed` 훅을 드러내는 것으로 한다.

끝나는 조건은 issue의 expected 그대로다 — *"남은 항목이 있는 한 에이전트가
계속 다음 항목으로 넘어간다."* 이 세대가 그것을 보장하지는 못한다(스킬
텍스트는 턴을 만들지 못한다). 이 세대가 책임지는 것은 **그 의무를 적을 자리가
있고, 에이전트가 닫는 순간 그것을 읽는다**까지다.

## References

- github.com/c-d-cc/reap/issues/34 — *"REAP에는 '아직 끝나지 않았으니 넘기지
  말라'를 표현할 자리가 없다. (…) complete가 끝나면 그 다음을 가리키는 것이
  아무것도 없다."*
- 같은 issue의 2026-09-11 코멘트 둘 — `life/run` 설계를 수락했다가 세 세대
  만에 통째로 물린 경위. 사람의 판단은 **"이 상태를 아예 기록하지 않는다"**
  였고, `gen.closed` 훅을 *"the honest answer"*로 지목했다
- bk-d46db0 — 이 세대의 근거. 사람이 2026-09-21에 고쳐 잡은 진단(턴이 끝나는
  조건은 "말했다"가 아니라 "도구 호출 없이 메시지를 냈다")이 거기 있다
- ps-4f2a91:06-agent.md · 02-flow.md — 규범이 갈 자리
- src/entries.ts:186 · src/cli.ts:449 — 훅이 발화하고 출력이 닫힘 메시지 뒤로
  붙는 실물 지점

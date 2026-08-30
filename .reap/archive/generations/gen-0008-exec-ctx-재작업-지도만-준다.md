---
id: gen-0008-exec
slug: ctx-재작업-지도만-준다
type: exec
milestone: ms-001
title: ctx 재작업 — 지도만 준다
startedAt: 2026-08-22T16:49:32Z
startCommit: 310bce9
status: closed
closedAt: 2026-08-22T16:52:34Z
endCommit: 1209e3a
---

## Intent

`ctx`를 gen-0006-plan·004가 정한 규범에 맞춘다. **대부분이 빼는 일이다** — gen-0003-exec이 넣은 milestone 넷 · `memory/` · 세대 기록 본문을 뺀다. 넣을 것은 **상태 줄** 하나다.

**끝나는 지점:** `bun test` 통과 · `typecheck` 0 · `./dist/reap ctx --hook | python3 -c 'json.load(sys.stdin)'` 통과, 그리고 이 리포에서 조립된 맥락에 **`handoff.md`의 문장이 한 줄도 없고 상태 줄의 파일 목록이 실제 `ls`와 일치한다.**

## References

- `tasks/1-3-ctx.md` — 명세와 증명해야 할 동작 열하나
- [agent 층](../../../docs/superpowers/specs/reap/06-agent.md) — 상태 줄, 이름 vs 개수
- gen-0003-exec (`0f96dc0`) — 여기서 넣은 것의 대부분을 뺀다

## Outcome

Task 1.3 재작업 완료 (`9aaca78`). `bun test` 76개 통과 · `typecheck` 0 · `ctx --hook`이 유효한 JSON.

**조립된 맥락: 15,882 → 6,022바이트.** 그리고 `handoff.md`·`decisions.md`·`tasks/`·`memory/`·세대 기록의 본문은 한 글자도 실리지 않는다 — 각 파일 본문에만 있는 문자열로 검사한다.

- `assemble`은 이제 genome 전체 · `environment/summary.md` · 상태 줄만 잇는다
- `status()`가 지도를 만든다. milestone 문서와 `tasks/`와 `memory/`는 **이름**, `idea/`는 **개수**
- `nonEmpty()` — 빈 파일은 지도에 이름을 내지 않는다. 빈 디렉토리는 줄 자체가 없다
- 열린 세대는 id·기록 경로·시작 시각·시작 커밋. 닫히면 줄이 사라진다

**테스트를 반대로 다시 썼다.** gen-0003-exec의 ctx 테스트는 "milestone 본문이 실린다"를 증명하고 있었다. 규범이 바뀌었으므로 그것들은 지킬 대상이 아니라 고칠 대상이었다 — 이제 "실리지 않는다"를 증명한다.

**gen-0007-plan의 졸업 규약을 처음 적용했다.** `lessons.md`의 "실행해보지 않은 코드를…"은 `evolution.md`에 이미 규칙으로 있었다. 대기실에서 지웠고 규칙은 그대로 남아 있다.

## Notes

**지금까지 기록에 "N자"라고 적은 수치는 전부 바이트였다.** `wc -c`의 출력이다. 한글은 UTF-8에서 3바이트이므로 문자 수는 그보다 훨씬 적다 — 지금 맥락은 6,022바이트이지만 3,601자다. 상대 비교는 일관되게 바이트였으므로 유효하지만, **토큰을 어림할 때 바이트를 문자로 읽으면 두세 배를 틀린다.**

## 남은 것

Task 1.4(플러그인·훅)가 증분 1의 마지막이다.

---
id: gen-0060-exec
slug: bind
type: exec
backlog: bk-52af4d
title: bind — 열린 세대에 세션을 다시 묶는다
startedAt: 2026-08-30T17:16:37Z
startCommit: 45dac32
status: closed
closedAt: 2026-08-30T17:16:59Z
endCommit: 6305dd5
---
## Intent

`bk-52af4d` — abort 뒤 잃은 바인딩을 복원할 수단이 필요한가. **만든다.** `doctor`가 "열린 채 바인딩 안 된 generation"을 참고로 내는데 고칠 손이 없었고, `bindSession`이 이미 있어 명령 하나다.

## Outcome

`reap bind <gen-id>` — 열린 세대에 이 세션을 묶는다(milestone도 따라온다). 닫힌 세대는 거부. `doctor`의 참고 문구가 `bind`/`--aborted`를 가리키고, `evolve`에 "열린 세대가 있는데 상태 줄에 안 나오면" 절. 이전 바인딩을 *복원*하는 것이 아니라 *지정*하는 것이다 — 이력을 안 두므로 복원할 것이 없고, 지정이면 충분하다.

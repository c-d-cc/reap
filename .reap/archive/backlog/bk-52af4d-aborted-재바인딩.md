---
id: bk-52af4d
slug: aborted-재바인딩
type: design
title: mark --aborted가 이전 바인딩을 복원하지 않는다
from: gen-0043-exec
createdAt: 2026-08-23T06:31:43Z
status: consumed
consumedBy: gen-0060-exec
---
## 무엇

`mark generation --aborted`는 `.session`의 바인딩을 비운다. 지워진 기록을 가리키지 않으려는 것이니 맞지만, **직전에 무엇이 바인딩돼 있었는지는 잃는다.** `gen-0009-exec`에서 `.session`을 손으로 고쳐야 했다.

## 정할 것

재바인딩 수단(`reap bind <gen-id>` 같은)이 필요한가, 아니면 abort가 드물어서 손으로 고치는 것이 싼가. **한 번에 정할 수 있다** — 겪은 사례가 하나뿐이라 표본이 더 쌓이길 기다릴 이유는 없고, 만들지 않기로 정하는 것도 답이다.

`ms-006`(위생)에 얹기 좋다 — `doctor`가 `.session`이 없는 세대를 가리키는지도 같은 자리에서 본다.

## 출처

`memory/tracks.md`의 부트스트랩 마찰 기록에 있던 셋 중 하나. `gen-0043-exec`이 그 파일을 내리며 갈 곳을 정했다.

---
id: bk-1dcea1
slug: release-policy의-0-17-사용자의-길-1단계가-코드가-하지-않는
type: fix
title: release-policy의 '0.17 사용자의 길' 1단계가 코드가 하지 않는 일을 사실로 적고 있다
createdAt: 2026-09-12T04:16:14Z
status: open
---

`docs/release-policy.md`의 "0.17 사용자의 길" 1번은 "세션 시작 시 위 blocked 메시지를 본다"고 적는다. 사용자는 그것을 보지 못한다.

reap_v17(v0.17 브랜치) 실측:

- `src/adapters/claude-code/install.ts`의 `REAP_SESSION_HOOKS` 두 줄이 `reap check-version 2>/dev/null || true`·`reap load-context 2>/dev/null || true`다. 표준 에러를 버린다
- `src/cli/commands/check-version.ts`의 출력 호출은 264·407·482·492 넷이고 전부 `console.error`다. 이 파일에 `console.log`도 `process.stdout`도 없다. 392행 docblock이 스스로 "emit a warning to stderr"라고 적는다
- 그래서 floor 가드(298행)가 찍는 `[REAP] Breaking change detected …`는 셸에서 사라진다. 손으로 `reap check-version`을 쳐야만 보인다

ms-025가 이 단계를 확정할 때 삼은 근거를 찾았으나 없다. milestone 본문이 서술로 단정했고 출력 채널을 확인한 흔적이 없다.

무엇이 참이어야 하는가: 그 문서가 **코드가 실제로 하는 일**만 적고, 안내가 사용자에게 닿지 않는다는 공백을 열린 채로 표시한다.

**처방은 여기 쓰지 않는다.** 그 공백을 어떻게 메울지는 사람 결정 대기다 — (a) 0.17.7 위에 출력 채널만 고친 최소 패치를 0.18보다 먼저 발행, (b) 이 리포의 `autoUpdateMinVersion`을 낮춰 0.17 사용자를 0.18로 끌어옴, (c) 둘 다 안 함. 결정이 나면 정정과 처방을 같은 세대에서 쓴다. 정정 자체는 결정과 독립이다 (reap-v17 세션과 합의, 2026-09-12).

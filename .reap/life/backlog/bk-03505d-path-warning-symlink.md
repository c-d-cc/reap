---
id: bk-03505d
slug: path-warning-symlink
type: fix
title: local-install.sh의 PATH 경고가 심링크 경유지를 못 본다 — 틀린 reap를 통과시킨다
createdAt: 2026-09-20T05:50:01Z
status: open
---

`scripts/local-install.sh`의 PATH 검사가 `readlink -f`로 **최종 대상만** 본다.

```sh
resolved="$(readlink -f "$(command -v reap)")"
case "$resolved" in
  "$ROOT"/dist/*) say "reap → $resolved" ;;
  *) say "warning: 'reap' on PATH is $resolved, not this tree" ;;
esac
```

이 머신에서 실제로 일어난 일 — PATH 앞쪽의 `~/cdws/reap2/dist/reap`가 심링크로 이 리포의 `dist/reap`를 가리키고 있었다. `readlink -f`가 최종 대상을 주므로 `$ROOT/dist/*`에 매치되어 **통과했다.** 그런데 실제로 도는 것은 `npm link`가 의도한 `dist/node/reap.js`가 아니라 컴파일 바이너리였다.

버전도 동작도 같아서 아무도 눈치채지 못한다. 깨지는 것은 **"사용자가 npm으로 받는 것과 같은 산출물로 개발한다"는 전제** 하나뿐이고, 그것이 깨졌다는 사실이 어디에도 드러나지 않는다.

할 일 — 검사가 **경유지**까지 본다.

- `command -v reap`가 내놓은 경로 자체가 `$ROOT` 밖이면, 최종 대상이 맞더라도 그 사실을 말한다
- `package.json`의 `bin`이 가리키는 파일(`dist/node/reap.js`)과 실제로 도는 파일이 같은지 본다. 다르면 무엇이 도는지 알린다

이 머신에서는 그 심링크를 지워 해소했다(2026-09-20). 스크립트의 구멍은 그대로다.

---
type: task
status: pending
priority: medium
createdAt: 2026-08-19T12:44:49.770Z
---

# 이 저장소의 dog-fooding 은 daemon checkout 분기를 한 번도 밟지 않는다

## Problem

`locateDaemon` 은 네 경로를 갖는다 — `env` / `config` / `package` / `checkout`. `checkout` 은 "reap 이 자기 저장소에서 돌고 있고 daemon/ 이 옆에 있다"를 위한 것이며, **이 저장소가 그 상태의 유일한 대표**다.

그런데 실측하면 여기서도 `checkout` 이 아니라 `package` 가 잡힌다:

```
$ cd dist/cli && node -e 'console.log(require.resolve("@c-d-cc/reap-daemon/dist/index.js"))'
/Users/hichoi/cdws/reap/daemon/dist/index.js
$ ls -l node_modules/@c-d-cc/
reap-daemon -> ../../daemon
```

`package.json` 의 `workspaces: ["daemon"]` 이 만드는 심링크다. `require.resolve` 가 성공하므로 `locateDaemon` 은 `checkout` 후보를 **시도조차 하지 않는다**.

결과: `checkout` 분기는 unit 테스트(주입)에서만 실행되고, **실제 프로세스에서는 아무도 밟지 않는다.** gen-083 이 이 분기를 만든 이유가 "dog-fooding 을 유지하기 위해"였는데, 정작 dog-fooding 은 다른 경로로 동작하고 있다.

gen-085 가 `staleDaemonRemedy` 에 `checkout` 전용 문구를 넣었으나 그 문구도 같은 이유로 실물에서 확인되지 않았다.

## Solution

세 가지를 판단해야 한다.

1. **`checkout` 분기가 여전히 필요한가** — workspace 심링크가 항상 존재한다면 죽은 경로일 수 있다. 단, 소비자가 `npm i @c-d-cc/reap` 로 받은 트리에는 심링크가 없으므로 "reap 소스를 clone 해서 쓰는 사람"에게는 살아 있다.
2. **자기진단 게이트에서 실물로 밟게 할 수 있는가** — 격리 설치본에는 daemon 이 없으므로 `daemon/` 을 옆에 복사한 가짜 체크아웃을 만들면 가능하다. `5d-bis (g)` 가 쓴 방법과 같은 계열.
3. **`workspaces` 심링크가 `package` 로 잡히는 것이 의도인가** — 의도라면 `checkout` 후보 주석의 "Only the `file:` symlink made dog-fooding work" 서술을 갱신해야 한다. 그 서술은 `file:` 의존이 제거된 지금 사실이 아니다.

## Files to Change

- `src/cli/commands/daemon/client.ts` — `locateDaemon` 의 checkout 후보 + 주석
- `scripts/check-self-diagnosis.sh` — checkout 시나리오 추가 여부
- `.reap/environment/summary.md` — workspaces 서술

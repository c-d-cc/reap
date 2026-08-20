---
type: task
status: consumed
priority: medium
createdAt: 2026-08-20T15:51:44.694Z
consumedBy: gen-094-61a545
consumedAt: 2026-08-20T16:26:16.991Z
---

# package-lock.json 이 아직 daemon workspace 를 선언한다 — 버전도 0.17.5 에 멈춰 있다

## Problem

gen-089 가 daemon 을 폐기하면서 `package.json` 에서 `workspaces` 를 지웠지만 **`package-lock.json` 은 갱신되지 않았다.** 5세대가 지났고 아무도 눈치채지 못했다.

```jsonc
{
  "version": "0.17.5",              // package.json 은 0.17.6
  "packages": {
    "": {
      "workspaces": ["daemon"],     // daemon/ 디렉토리는 존재하지 않는다
      "dependencies": { "yaml": "^2.0.0" }   // web-tree-sitter 가 없다
    },
    "daemon": { "name": "@c-d-cc/reap-daemon", ... better-sqlite3 ... },
    "node_modules/@c-d-cc/reap-daemon": { "resolved": "daemon", "link": true }
  }
}
```

**왜 지금까지 안 깨졌는가** (gen-094 가 실측): `npm ci --dry-run --ignore-scripts` 는 npm 10.9.4 에서 실패하지 않고 `remove @c-d-cc/reap-daemon` 외 40 패키지 제거를 보고한다. root 의 `web-tree-sitter` 요구는 daemon workspace 아래 항목이 우연히 만족시킨다. **오늘은 초록이다.**

**왜 그래도 고쳐야 하는가**: `ci.yml` 과 `release.yml` 이 `npm ci` 를 돌린다. lock 이 존재하지 않는 workspace 를 가리키고 root 의존 목록이 실제와 다른 상태는 **npm 버전이 바뀌는 날 조용히 깨진다.** 그 날 실패 원인은 코드가 아니라 5세대 전에 갱신하지 않은 lock 이 되고, 그것을 찾는 데 시간이 든다.

gen-094 는 이것을 **산문이 아니므로** 자기 goal(사용자 대면 문서의 daemon 서술 제거) 밖으로 분리했다. 검증도 인과로 묶이지 않았다 — gen-094 의 게이트는 lock 을 읽지 않는다.

## Solution

`npm install` 로 lock 을 재생성하고 diff 를 검토한다. 확인 항목:

1. `"version"` 이 `package.json` 과 일치하는가
2. `workspaces` 항목이 사라졌는가
3. `daemon` / `@c-d-cc/reap-daemon` / `better-sqlite3` / `tree-sitter-wasms` 및 그 전이 의존이 전부 사라졌는가
4. root `dependencies` 에 `web-tree-sitter` 와 `yaml` 이 **직접** 있는가
5. `npm ci --dry-run --ignore-scripts` 가 **"remove" 를 하나도 보고하지 않는가** — 지금은 40개를 보고한다. 이것이 이 작업의 완료 판정이다

**주의 — 게이트를 먼저 실패시킬 것.** 재생성 후 통과만 확인하면 그 검사가 결함을 잡는지 알 수 없다. 수정 **전에** 위 5번을 돌려 40개 remove 를 먼저 기록하고, 수정 후 0 이 되는 것으로 판정한다.

부수 확인: `npm ci` 후 `npm run build` + 세 스위트가 baseline 을 유지하는가. lock 재생성은 전이 의존 버전을 움직일 수 있다.

## Files to Change

- `package-lock.json` — 재생성 (직접 편집하지 말 것)

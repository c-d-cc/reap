---
type: task
status: pending
priority: medium
createdAt: 2026-08-19T01:46:10.181Z
---

# daemon typecheck 상시 red — storage.ts 의 bun:sqlite 타입 부재

## Problem

`cd daemon && npm run typecheck` 는 항상 2건의 에러로 실패한다:

```
src/indexer/storage.ts(4,33): TS7017 — Element implicitly has an 'any' type
                                       because typeof globalThis has no index signature
src/indexer/storage.ts(21,39): TS2307 — Cannot find module 'bun:sqlite'
```

gen-083 이전부터 존재하며(`git stash` 후 재실행으로 확인), 런타임 동작에는 영향이 없다 — `storage.ts` 는 bun 과 node 를 런타임에 분기하고 node 경로는 `better-sqlite3` 를 쓴다.

**지금 문제가 되는 이유**: gen-083 이 `@c-d-cc/reap-daemon` 을 npm 에 독립 발행하기로 하면서, 발행 워크플로(`.github/workflows/release.yml` 의 `publish-daemon` job)에 typecheck 를 넣을 수 없었다. 상시 red 라 넣으면 발행이 항상 막힌다. **결과적으로 daemon 은 타입 게이트 없이 발행된다.**

빨간불이 상시화되면 아무도 보지 않는다 — gen-078 이 19개 경고에 대해 확인한 것과 같은 구조다.

## Solution

두 에러의 성격이 다르므로 따로 다룬다.

- **TS2307 (`bun:sqlite`)**: bun 전용 모듈이라 node 타입 환경에 없다. `@types/bun` 이 devDependency 에 있으므로 `tsconfig.json` 의 `types` 에 `"bun"` 을 추가하면 해소될 가능성이 높다 — 현재는 `["node"]` 만 있다. 확인 필요
- **TS7017 (`globalThis` index signature)**: 런타임 분기를 `typeof globalThis` 인덱싱으로 감지하고 있다. `declare global` 로 선언하거나 `"bun" in globalThis` 형태의 타입 가드로 바꾼다

해소 후 `publish-daemon` job 에 typecheck 단계를 추가해 **두 번 다시 게이트 없이 발행되지 않게** 한다.

## Files to Change

- `daemon/src/indexer/storage.ts` (L4, L21)
- `daemon/tsconfig.json` — `types` 배열
- `.github/workflows/release.yml` — `publish-daemon` job 에 typecheck 단계 추가

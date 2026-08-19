---
type: task
status: pending
priority: low
createdAt: 2026-08-19T12:44:49.400Z
---

# DaemonNotInstalledError 가 명시 경로를 무시한다 — 미설치 안내의 마지막 소비처

## Problem

gen-084 는 daemon 미설치 안내 3곳(`integrity.ts` / `prompt.ts` / `daemon/index.ts`)이 `explicitMiss` 를 반영하게 했다. gen-085 는 **낡은 daemon** 안내에 같은 처리를 했다.

`src/cli/commands/daemon/client.ts` 의 `DaemonNotInstalledError` 는 **어느 쪽에도 들어가지 않았다**:

```ts
export class DaemonNotInstalledError extends Error {
  constructor(readonly installCommand: string = DAEMON_INSTALL_COMMAND) {
    super(`The REAP daemon is not installed. Install it with: ${installCommand}`);
```

`ensureDaemon` 이 `resolveDaemonBin() === null` 일 때 던진다. `daemonBin` 을 빈 경로로 지정한 사용자가 이 메시지를 받으면 gen-084 가 없앤 바로 그 상황이 된다 — 자기가 지정한 경로가 비었다는 사실을 듣지 못한 채 전역 설치를 안내받는다.

**도달성은 낮다.** `daemon` 서브커맨드는 `requireUsableDaemon()` 이 먼저 걸러내고, lifecycle 진입점의 daemon 호출은 전부 silent-fail 이다. 그래서 gen-084 도 gen-085 도 놓쳤다 — 부류 훑기에서 빠진 인스턴스다.

## Solution

`locateDaemon()` 결과를 받아 `explicitMiss` 가 있으면 그 경로를 말한다. `staleDaemonRemedy` 와 같은 형태의 helper 를 미설치 쪽에도 두는 편이 낫다 — 지금은 세 소비처가 각자 문장을 조립하고 있고 이 네 번째만 빠졌다.

**먼저 확인할 것**: 이 에러 메시지가 실제로 사용자에게 도달하는 경로가 있는가. 없다면 삭제가 옳은 처방일 수 있다(`noUnusedLocals` backlog 와 함께 판단).

## Files to Change

- `src/cli/commands/daemon/client.ts` — `DaemonNotInstalledError`, `ensureDaemon`
- `tests/unit/daemon-availability.test.ts`

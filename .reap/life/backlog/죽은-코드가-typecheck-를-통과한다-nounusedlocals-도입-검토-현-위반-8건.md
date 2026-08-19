---
type: task
status: pending
priority: low
createdAt: 2026-08-19T04:22:33.887Z
---

# 죽은 코드가 typecheck 를 통과한다 — noUnusedLocals 도입 검토 (현 위반 8건)

## Problem

`tsconfig.json` 에 `noUnusedLocals` / `noUnusedParameters` 가 없어 **선언만 되고 어디서도 읽히지 않는 심볼이 `npm run typecheck` 를 통과한다.** IDE 만 잡고 프로젝트 게이트는 보지 않는다.

발견 경위: gen-084 에서 IDE 진단이 `src/cli/commands/daemon/client.ts` 의 `PID_PATH` 를 잡았다. `git show HEAD:...` 로 확인하니 **gen-083 커밋 시점에 이미 죽어 있었고** gen-084 는 위치만 밀었다. 즉 이 부류는 최소 한 세대를 통과해 살아남았다.

**측정 (gen-084, `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`)** — `src/` 전체 **8건**:

```
src/cli/commands/daemon/client.ts(71)  PID_PATH
src/cli/commands/migrate.ts(1)         mkdir
src/cli/commands/migrate.ts(136)       genomeDir
src/cli/commands/migrate.ts(274)       config
src/cli/commands/migrate.ts(746)       paths
src/cli/commands/run/back.ts(33)       targetPhase
src/libs/cli.ts(156)                   _executableHandler
src/libs/cli.ts(158)                   _addHelpCommand
```

**8건은 균질하지 않다.** 최소 세 부류가 섞여 있다:

- **순수 죽은 코드** — `PID_PATH`. 지우면 그만 (아래 참조)
- **미사용 매개변수** — `back.ts:33` 의 `targetPhase`, `migrate.ts:274/746` 의 `config`/`paths`. 시그니처 계약의 일부일 수 있어 지우는 것이 옳지 않을 수 있다. `_` prefix 규칙(`noUnusedParameters` 는 `_` 로 시작하면 넘어간다)을 쓸지 결정 필요
- **의도적 placeholder** — `libs/cli.ts` 의 `_executableHandler` / `_addHelpCommand` 는 **이미 `_` prefix 를 달고 있는데도** 잡혔다. `noUnusedParameters` 의 `_` 면제는 **매개변수에만** 적용되고 지역 변수·필드에는 적용되지 않기 때문이다. 이 둘은 별도 판단이 필요하다

## Solution

**두 층위를 분리해서 처리할 것. 하나를 다른 하나로 대신하지 마라.**

### (1) 인스턴스 정리 — `PID_PATH`

`src/cli/commands/daemon/client.ts` 의 `PID_PATH` 는 선언만 되고 읽히지 않는다.

- **두 줄이다, 한 줄이 아니다.** `DAEMON_ROOT`(같은 파일 15행)의 **유일한 소비처가 `PID_PATH`** 이므로 함께 죽는다
- **파일 자체는 실재한다** — daemon 이 `daemon/src/index.ts:29` 에서 `writePid`, `:34` 에서 `removePid` 로 관리한다. reap 쪽이 그것을 **읽지 않을 뿐**이다 (`daemon stop` 은 `/health` 로 pid 를 받아 `process.kill`). 즉 "쓸모없는 파일"이 아니라 "reap 이 안 쓰는 경로 상수"다. 지우기 전에 pidfile 을 읽는 편이 나은 시나리오가 있는지(예: daemon 이 응답하지 않을 때의 강제 종료) 한 번 판단할 것

**gen-084 에서 지우지 않은 이유**: (a) `strictEdit: true` 이고 발견 시점이 completion 단계라 코드 수정이 HARD-GATE 로 막혀 있었고, (b) 본 세대 goal(daemon 위치 지정)과 **인과로 묶여 있지 않다** — genome § Echo Chamber 방지.

### (2) 게이트 — `noUnusedLocals` 도입 여부

**이쪽이 본질이다.** `PID_PATH` 하나를 지우는 것은 인스턴스 제거일 뿐 게이트는 여전히 같은 부류를 놓친다.

절차:
1. 위 8건을 **부류별로 분류**하고 각각의 처방을 정한다 (삭제 / `_` prefix / `void` / 의도적 유지 + 주석)
2. `noUnusedParameters` 를 함께 켤지 별도 판단 — 매개변수는 시그니처 계약이라 성격이 다르다
3. 켠 뒤 **일부러 죽은 심볼을 넣어 typecheck 가 red 가 되는지 확인**한다 (genome § "검사를 만들 때 — 먼저 실패시켜라")
4. `daemon/` 은 별도 `tsconfig` 이며 **typecheck 가 이미 상시 red** 다(별도 backlog `daemon-typecheck-상시-red-...`). 그쪽과 순서를 정할 것 — 상시 red 인 곳에 규칙을 더하는 것은 의미가 없다

**하지 않을 것**: 8건을 일괄 삭제하고 플래그를 켜는 것. 위 분류에서 보듯 최소 3부류이고 그중 일부는 삭제가 정답이 아니다.

## Files to Change

- `tsconfig.json` — `noUnusedLocals` / `noUnusedParameters`
- `src/cli/commands/daemon/client.ts` — `PID_PATH` + `DAEMON_ROOT`
- `src/cli/commands/migrate.ts`, `src/cli/commands/run/back.ts`, `src/libs/cli.ts` — 나머지 6건
- `daemon/tsconfig.json` — 별도 판단 (그쪽 typecheck 가 먼저 초록이 되어야 한다)

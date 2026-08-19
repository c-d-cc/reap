---
type: task
status: pending
priority: medium
createdAt: 2026-08-19T04:56:45.880Z
---

# reap run push 가 git 의 실제 실패 원인을 삼킨다 — 'Check remote configuration and network' 로 뭉갠다

## Problem

`gitPush`(`src/core/git.ts:252`)는 `execSync("git push")` 를 `try/catch` 로 감싸고 **실패 시 `false` 만 돌려준다.** stderr 는 `"pipe"` 로 잡아두고 **버린다.** `run/push.ts` 는 그 boolean 을 받아 고정 문구를 낸다:

```
git push failed. Check remote configuration and network.
```

**실제로 겪은 사례 (gen-084 commit 직후)**: 진짜 원인은 원격도 네트워크도 아니었다.

```
! [remote rejected] main -> main (refusing to allow an OAuth App to create or
  update workflow `.github/workflows/release.yml` without `workflow` scope)
```

즉 **자격증명 scope 문제**였고, 안내 문구가 지목한 두 가지(원격 설정·네트워크)는 **둘 다 정상**이었다. `git push --dry-run` 은 성공까지 한다 — 거부가 서버 측 수신 시점에 일어나기 때문이다. 사용자는 문구를 따라가면 **엉뚱한 곳을 본다**.

이것은 REAP 이 두 세대에 걸쳐 싸워온 것과 같은 부류다 — **원인을 아는 코드가 그것을 버리고, 사용자에게는 일반론이 남는다.** gen-083 의 "미설치와 미실행이 같아 보였다", gen-084 의 "빗나간 경로가 조용히 무시됐다" 와 같은 형태다.

`gitCommit`·`gitPull` 등 같은 파일의 다른 `execSync` 래퍼도 **같은 모양인지 함께 확인**할 것. 하나만 고치면 다음 사람이 다른 것에서 같은 시간을 쓴다.

## Solution

**stderr 를 버리지 말고 호출부까지 올린다.**

- `gitPush` 가 `boolean` 대신 `{ ok: true } | { ok: false, stderr: string }` 을 돌려주거나, 실패 시 stderr 를 담아 throw 한다. 전자가 기존 호출부(`pushSubmodules` 가 boolean 을 쓴다)에 덜 침습적이다
- `run/push.ts` 는 그 stderr 를 **`message` 나 `context` 에 그대로 싣는다.** git 의 원문이 REAP 의 추측보다 낫다
- 고정 문구를 유지하려면 **원문 뒤에 붙인다** — 대체하지 않는다

**같이 볼 것**: `src/core/git.ts` 의 다른 `catch { return false }` 들. 최소 `gitCommit`, `gitPull`, `gitFetch` 를 확인한다.

**검증**: 실패를 인위적으로 만들어 원문이 출력에 나타나는지 확인한다 (예: 존재하지 않는 원격으로 push, 또는 읽기 전용 원격). genome § "검사를 만들 때 — 먼저 실패시켜라" 대로 **먼저 실패시켜 원문이 안 나오는 것을 확인**한 뒤 고친다.

## Files to Change

- `src/core/git.ts` — `gitPush` 및 같은 모양의 다른 래퍼
- `src/cli/commands/run/push.ts` — 에러 전달
- `tests/e2e/` — push 실패 시 원문이 출력에 실리는지 (신규)

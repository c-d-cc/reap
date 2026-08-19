# Learning

> gen-086 — REAP 이 자기 사용자에게 잘못 말하거나 자기 문서를 못 지키는 결함 3건.

## Project Overview

REAP 은 자기 자신을 `.reap/` lifecycle 위에서 진화시키는 CLI(`@c-d-cc/reap`, 현재 `package.json` 0.17.5, 태그 미발행)다. gen-083~085 가 daemon 을 별도 npm 패키지로 분리하고(위치 지정 `daemonBin`/`REAP_DAEMON_BIN`, 버전 하한 판정) 그 과정에서 인접 갭이 계속 드러나 backlog 이 18건까지 쌓였다. 유저 판단으로 **11건을 1건으로 합치고 8건을 버렸으며**, 남긴 기준은 하나 — "지금 존재하는 사용자에게 실제로 일어나는가".

본 세대는 그 합친 1건을 소비한다. **범위는 세 건으로 고정**이며, 인접 갭을 발견해도 backlog 을 만들지 않고 완료 artifact 에 한 줄로 적는다(유저 지시).

## Source Backlog

`daemon-작업에서-파생된-reap-자체-결함-남은-3건.md` (consumed by gen-086-e484fa).

세 건 모두 **REAP 이 자기 사용자에게 잘못 말하거나 자기 문서를 못 지키는 경우**다:

1. `reap run push` 가 git 의 실제 실패 원인을 삼킨다
2. validation work phase 를 재실행할 수 없다 — 자기 문서의 중단 복구 절차와 모순
3. `DaemonNotInstalledError` 가 명시 경로를 무시한다

backlog 의 § "정리하며 버린 것" 표는 의도적으로 버린 8건과 이유를 담는다. **되살리지 않는다.**

## Key Findings

### 1. `gitPush` — 원인을 아는 코드가 그것을 버린다

`src/core/git.ts:252` `gitPush(cwd): boolean`. `execSync("git push", { stdio: ["pipe","pipe","pipe"] })` 로 stderr 를 잡아두고 `catch { return false }` 로 **버린다**. 소비처는 둘:

- `src/cli/commands/run/push.ts:39` — 실패 시 `emitError("push", "git push failed. Check remote configuration and network.")`
- `src/core/git.ts:269` `pushSubmodules` — `{ name, success }` 만 모으고, `push.ts:35` 가 `"Failed to push submodule(s): … Check remote configuration."`

**[실행] 재현** (sandbox, upstream 미설정 remote):

```
$ git push
fatal: The current branch main has no upstream branch.
To push the current branch and set the remote as upstream, use
    git push --set-upstream origin main

$ reap run push
{ "status": "error", "message": "git push failed. Check remote configuration and network." }
```

git 은 **정확히 무엇을 치라고** 말했고 REAP 은 그것을 버린 뒤 무관한 두 가지(remote 설정 / 네트워크)를 짚었다. backlog 이 기록한 2026-08-19 실사례(OAuth 토큰의 `workflow` scope 부재)에서는 그 두 가지가 **모두 정상**이었고, `git push --dry-run` 은 성공까지 해서 안내를 따랐다면 엉뚱한 곳을 팠을 것이다.

`execSync` 가 던지는 에러 객체는 `stderr` 필드를 갖는다(`encoding: "utf-8"` 이므로 문자열). 즉 **정보는 이미 손 안에 있고 버려지는 중**이다.

같은 파일의 다른 `catch { return false }` 래퍼들(`gitFetchAll`, `gitPullFfOnly`, `gitResetHard` 등)도 같은 형태지만, **본 세대 범위는 push 경로**다 — backlog 이 지목한 것이고 실제 사례가 있는 것이 그것이다.

### 2. validation work 재진입 — REAP 이 자기가 낸 `nextCommand` 를 거부한다

`src/core/lifecycle.ts:14` `"validation:entry": ["validation:complete", "implementation:entry"]` — **자기 자신이 없다.**

흐름: `validation.ts:98` `verifyTransition("validation", s, "validation:entry")` 가 entry 티켓을 **소비**(`state.pendingTransitions = undefined`)하고, `:104` `setTransitionNonces(s, "validation:entry")` 가 위 목록으로 새 nonce 를 발급한다. 목록에 `validation:entry` 가 없으므로 **두 번째 `reap run validation` 은 검증에서 막힌다.**

**[실행] 재현 1 — 단순 재실행**:

```
$ reap run validation            # 1st: status prompt, phase work
$ reap run validation            # 2nd
{ "status": "error",
  "message": "No pending transition for validation:entry (current phase: entry). Available: [validation:complete, implementation:entry]. Re-run the previous phase." }
```

`genome/evolution.md` § *중단된 Generation 복구* 는 "중단된 시점의 phase 부터 다시 실행"하라고 지시한다. **그 지시가 validation work 에서는 성립하지 않는다.** gen-084 는 evaluator prompt 를 회수하지 못해 손으로 재구성했고, gen-085 는 `/tmp` 에 저장해 두는 것으로 대응했다.

**[실행] 재현 2 — 더 강한 형태.** artifact 미작성 분기(`validation.ts:107~136`)는 스스로 `nextCommand: "reap run validation"` 을 내보낸다:

```
$ reap run validation
status: artifact-incomplete   nextCommand: reap run validation
$ reap run validation          # 시킨 대로 따랐다
error | No pending transition for validation:entry …
```

**REAP 이 내보낸 다음 명령을 REAP 이 거부한다.** 이 분기는 evaluator 와 무관하므로, 결함은 evaluator 사용자에게만 있는 것이 아니다.

**self-loop 은 이미 있다** — `"completion:fitness": [..., "completion:fitness", ...]` (`lifecycle.ts:17`). `setTransitionNonces` 가 매 호출마다 목록대로 재발급하므로 self-loop 은 **nonce 무결성을 깨지 않고** 반복 진입을 허용하는 확립된 수단이다. 새 메커니즘이 필요 없다.

재진입 안전성 확인: `copyArtifactTemplate` (`src/core/template.ts:37`) 은 **파일이 있으면 즉시 return** 한다 — 재실행이 작성 중인 `04-validation.md` 를 덮어쓰지 않는다. work phase 는 그 외에 상태를 변형하지 않는다(nonce 재발급뿐).

`prepareStageEntry` 는 `getTransitions` 결과에서 **같은 stage 를 걸러내므로**(`stage-transition.ts:127~130`) self-loop 추가가 그 경로에 영향을 주지 않는다.

### 3. `DaemonNotInstalledError` — 셋 중 둘만 갈린다

gen-084 가 `locateDaemon` 에 네 출처(`explicit` / `package` / `checkout` / 없음)와 `explicitMiss`(사용자가 지정했는데 그 자리가 빈 경우)를 도입했고, gen-085 가 `staleDaemonRemedy` 로 **낡은** daemon 안내를 출처별로 갈랐다.

**미설치** 안내의 현재 상태:

| 소비처 | 갈리는가 |
|---|---|
| `src/core/integrity.ts:745` (`reap fix --check`) | ○ `explicitMiss` 로 분기 |
| `src/cli/commands/daemon/index.ts:38` (`reap daemon status/index/query`) | ○ `explicitMiss` 로 분기 |
| `src/cli/commands/daemon/client.ts:76` `DaemonNotInstalledError` | ✗ `installCommand` 기본값 고정 |

`ensureDaemon` (`client.ts:117~121`) 은 `resolveDaemonBin()` 을 부른다 — 이것은 `locateDaemon(...).bin` 만 꺼내고 **`source` / `explicitMiss` 를 버린다**. 그래서 `daemonBin` 을 설정했는데 그 자리가 비어 있는 사용자도 "전역 설치하라"는 무관한 안내를 받는다.

**[독해] 현재 사용자 도달 범위 — 과장하지 않고 적는다.** `daemonRequest` 의 모든 소비처를 훑은 결과, 이 에러 메시지가 **오늘 사용자 화면에 그대로 뜨는 경로는 없다**:

- `daemon status` / `index` / `query` → `requireUsableDaemon()` 이 앞서 걸러 자체 메시지를 낸다
- `daemon stop` → `catch` 로 "Daemon is not running"
- `lifecycle.ts` `triggerIndexing` / `ensureRegistered`, `findProjectId` → 의도적 silent-fail

`src/cli/index.ts` 에 전역 catch 는 없으므로 **새 소비처가 하나만 생겨도 그대로 노출된다.** 즉 오늘의 증상이 아니라 **짝이 맞지 않는 상태**이며, backlog 도 그렇게 적고 있다("세 소비처 중 둘이 갈리고 하나가 안 갈린 상태라 짝이 맞지 않는다"). 수정은 작고, 값어치는 "다음 소비처가 이미 갈린 안내를 물려받는다"에 있다. **이 판단을 계획·검증에 그대로 반영한다 — 실행 증거를 낼 수 없는 항목에 `[실행]` 태그를 붙이지 않는다.**

## Previous Generation Reference

gen-085 (`b8bb6c8`) — daemon 버전 판정 3건. fitness 피드백의 핵심:

> 작업이 필요 이상으로 깊어지고 있다. … 검증을 강화하는 일 자체가 새 작업을 낳는 순환에 들어갔다.

본 세대에 그대로 적용되는 제약이다. **backlog 추가 금지 / 게이트·스크립트 신설 금지 / diff 를 작게.**

gen-085 가 남긴 방법론 중 본 세대가 쓰는 것:

- **증거 태그 구분** — `[실행]`(명령을 댈 수 있음) / `[negative]`(일부러 깨뜨려 fail 확인) / `[독해]`. gen-085 는 "되돌리면 3건 red" 를 근거로 삼았다가 그 3건이 방금 쓴 테스트였음을 뒤늦게 발견했다. red 개수는 근거가 아니다.
- **주장보다 누락이 안전하다** — gen-085 는 코드를 읽지 않고 "이 함수가 X 를 쓴다"에서 결론까지 갔다가 틀렸다. 위 3번의 도달 범위를 직접 훑어 적은 이유다.

## Backlog Review

pending 7건 — 전부 **0.18 별도 브랜치** 또는 daemon SCIP 설계로 배정되어 있다(midterm § 릴리즈). 본 goal 과 관련 없으며 소비하지 않는다.

## Context for This Generation

- **버전 bump 금지.** 본 작업은 0.17.5 안에 들어간다. 릴리즈 문서 보강은 세대 밖(main agent) 소관.
- **push / publish / tag 금지.** commit phase 의 로컬 커밋만 정상.
- 전역 `reap` 은 발행된 0.17.4 다 — 검증은 반드시 `node dist/cli/index.js`.
- baseline: unit 538 / e2e 279 / scenario 44 / daemon 130, 전부 0 fail. (shortterm 은 unit 545 로 적고 있으나 상위 지시가 538 을 준다 — planning 에서 실측으로 확정한다.)
- `tests/` 는 private submodule. 커밋 phase 전에 submodule 내부 커밋 + `git add tests`.
- genome immutable (embryo 이나 본 세대는 규칙 변경 사안이 없다).

## Clarity Level

**HIGH.** 세 결함 모두 파일·행 번호까지 지목돼 있고, 셋 다 재현했거나(1·2 `[실행]`) 코드로 확인했다(3 `[독해]`). 범위는 유저가 고정했다. 질문 없이 실행하되, 3번의 "오늘 사용자에게 보이지 않는다"는 사실만은 완료 보고에 명시한다 — 그것이 이 항목의 값어치를 정직하게 말하는 유일한 방법이다.

---
type: task
status: pending
priority: medium
createdAt: 2026-08-19T13:15:26.982Z
---

# daemon 작업에서 파생된 REAP 자체 결함 — 남은 3건

placeholder

## Problem

gen-083~085(daemon 배포 분리·위치 지정·버전 판정)를 진행하면서 인접 갭이 계속 드러났고, 그때마다 개별 backlog 가 생겨 10건이 쌓였다. **검증을 강화하는 일이 새 작업을 낳는 순환**에 들어간 상태였고, 상당수는 prerelease·대체 패키지 매니저·기여자처럼 **아직 존재하지 않는 상황**을 방어하는 항목이었다.

유저 판단(2026-08-19)으로 **꼭 해야 하는 것만 남기고 한 건으로 합쳤다.** 남긴 기준은 하나다 — **지금 존재하는 사용자에게 실제로 일어나는가.**

## Solution

### 1. `reap run push` 가 git 의 실제 실패 원인을 삼킨다 — 우선순위 높음

`gitPush` (`src/core/git.ts:252`) 가 `stdio: ["pipe","pipe","pipe"]` 로 stderr 를 잡아두고 `catch { return false }` 로 버린다. 사용자는 `"git push failed. Check remote configuration and network."` 만 받는데, **2026-08-19 실제 사례에서 그 두 가지가 모두 정상이었다** — 진짜 원인은 OAuth 토큰에 `workflow` scope 가 없어 워크플로 파일 변경이 거부된 것이었고, 직접 `git push` 를 쳐야 드러났다. `git push --dry-run` 은 성공까지 해서(거부가 서버 수신 시점) 안내 문구를 따라갔다면 엉뚱한 곳을 팠을 것이다.

이 저장소가 통째로 싸워온 실패 형태와 같다 — **원인을 아는 코드가 그것을 버리고 사용자에게는 일반론이 남는다.**

- `src/core/git.ts` 의 `gitPush` 가 stderr 를 반환하도록 (같은 파일의 다른 `catch { return false }` 래퍼도 함께 볼 것)
- `src/cli/commands/run/push.ts` 가 그것을 `emitError` 에 실어 보낼 것
- 검사: 일부러 실패시켜(예: 없는 remote) 실제 원인 문자열이 출력에 나오는지

### 2. validation work phase 를 재실행할 수 없다 — 중단 복구 절차와 모순

`reap run validation` 두 번째 호출이 막혀 **evaluator prompt 를 다시 얻을 수 없다.** gen-084 가 실제로 겪어 손으로 재구성했다. `genome/evolution.md` § *중단된 Generation 복구* 는 "중단된 시점의 phase 부터 다시 실행"하라고 지시하는데 그것이 성립하지 않는다 — **REAP 이 자기 문서를 지키지 못하는 상태.**

- work phase 재진입을 허용하되 nonce 무결성을 깨지 않는 형태를 찾을 것 (self-loop 은 이미 transition graph 에 있다)
- 검사: validation work 를 두 번 호출해 두 번째도 evaluator prompt 를 포함한 동일 출력을 내는지

### 3. `DaemonNotInstalledError` 가 명시 경로를 무시한다

gen-085 가 `avail.staleRemedy` 로 **outdated** 안내를 source 별로 갈랐지만(`daemonBin` 으로 온 daemon 에 전역 업그레이드를 시키지 않음), **미설치** 경로의 `DaemonNotInstalledError` (`src/cli/commands/daemon/client.ts:76`) 는 `installCommand` 기본값이 고정이라 같은 구분이 없다. `daemonBin` 을 설정했는데 그 자리가 비어 있으면 사용자는 "전역 설치하라"는 무관한 안내를 받는다.

세 소비처 중 둘이 갈리고 하나가 안 갈린 상태라 **짝이 맞지 않는다.** 수정은 `ensureDaemon` 이 `locateDaemon` 의 결과(`source` / `explicitMiss`)를 에러에 실어 보내는 것으로 충분해 보인다.

## 정리하며 버린 것 — 되살릴 근거가 생기면 git history 에 있다

| 항목 | 버린 이유 |
|---|---|
| `sort -V 는 prerelease 를 역전시킨다` | 릴리즈 문서 게이트 내부 비교기. **prerelease 문서 항목이 존재한 적이 없다** |
| `죽은 코드가 typecheck 를 통과한다` (`noUnusedLocals`) | 위반 8건이 균질하지 않고(순수 죽은 코드 / 시그니처 계약 / `_` prefix), 죽은 심볼 1건에서 파생됐다. 기여자가 없는 동안 값이 낮다 |
| `daemon typecheck 상시 red` | 개발 위생. daemon 은 자체 테스트 130건이 green 이고 red 는 `bun:sqlite` 타입 부재 하나다 |
| `이 저장소의 dog-fooding 은 checkout 분기를 밟지 않는다` | 커버리지 불안이지 결함이 아니다. workspaces 심링크 때문에 이 저장소는 구조적으로 `package` 경로로 간다 |
| `list-carriers 가 산문 속 예시를 carrier 로 센다` | `--orphans` 오탐 1건. 사람이 읽고 무시하면 되는 수준 |
| `e2e 가 daemon 빌드를 전제한다` | reap-test CI 는 `ae57a46` 으로 해소됐다. 남은 것은 갓 클론한 기여자가 보는 실패인데 **현재 기여자가 없다** |
| `MIN_DAEMON_VERSION 발행 검사 게이트` | **gen-085 에서 해소** — `scripts/check-version-floors.sh` |
| `낡은 daemon 안내가 명시 경로를 무시한다` | **gen-085 에서 해소** — `avail.staleRemedy` |

## Files to Change

- `src/core/git.ts` — `gitPush` 가 stderr 를 돌려주도록
- `src/cli/commands/run/push.ts` — 원인을 `emitError` 로
- `src/cli/commands/run/validation.ts` + `src/core/lifecycle.ts` — work phase 재진입
- `src/cli/commands/daemon/client.ts` — `DaemonNotInstalledError` 가 `source`/`explicitMiss` 를 받도록
- tests: 각 항목의 negative test (일부러 실패시켜 확인)

## 판단 메모

**세 건 다 REAP 이 자기 사용자에게 잘못 말하거나 자기 문서를 못 지키는 경우다.** 그 외의 "이론적 취약함"은 위 표로 내보냈다. 다시 쌓이기 시작하면 같은 기준으로 다시 잘라낼 것 — 기준은 **"지금 존재하는 사용자에게 일어나는가"** 하나다.

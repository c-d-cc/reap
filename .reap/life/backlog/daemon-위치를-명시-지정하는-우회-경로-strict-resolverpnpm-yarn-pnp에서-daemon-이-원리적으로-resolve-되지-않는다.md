---
type: task
status: pending
priority: high
createdAt: 2026-08-19T02:03:21.097Z
---

# daemon 위치를 명시 지정하는 우회 경로 — strict resolver(pnpm, Yarn PnP)에서 daemon 이 원리적으로 resolve 되지 않는다

> **0.17.5 릴리즈 하드 선행조건 (유저 결정 2026-08-19).** gen-083 이 pnpm / Yarn PnP 사용자에게는 상황을 **더 나쁘게** 만들었으므로, 이것을 해소하기 전에 0.17.5 를 내지 않는다. 순서: gen-083(완료) → **본 backlog** → `daemon-v0.2.0` 발행 → 0.17.5.

## Problem

gen-083 이 `@c-d-cc/reap-daemon` 을 reap 의 dependency 에서 **의도적으로 제거**했다. reap 은 이제 `require.resolve("@c-d-cc/reap-daemon/dist/index.js")` 로 daemon 을 찾는다.

**strict resolver 에서는 이 조회가 원리적으로 실패한다.** pnpm 의 기본 격리 store 나 Yarn PnP 는 *선언되지 않은 패키지*에 대한 접근을 설계상 차단한다. daemon 은 선언되지 않는 것이 맞으므로(그것이 이번 수정의 요점), 두 요구가 충돌한다.

**이것은 "미검증"이 아니라 "알려진 파손"이다.** 그리고 원래보다 엄밀히 더 나쁘다:

- 그 사용자는 daemon 을 정상 설치하고도 **영구히 "설치하라"는 안내**를 받는다 — 이미 가진 것을 설치하라는 안내다
- 자기진단 게이트 § 5e 는 `npm i -g --prefix` 레이아웃만 검사하므로 **seam 이 건강하다고 보고한다**
- 이전 결함(끊긴 심링크)은 최소한 조용했다. 지금은 **틀린 안내를 확신을 갖고 한다**

같은 계열의 다른 조합과 각각 무엇이 깨지는지:

| 조합 | 무엇이 깨지는가 |
|---|---|
| pnpm 기본 store / Yarn PnP | 위 — resolve 원리적 실패, 틀린 안내 |
| reap 전역 + daemon 로컬 프로젝트 의존 | 전역 bundle 의 조회 경로에 프로젝트 `node_modules` 가 없어 미설치 판정 |
| reap 과 daemon 을 서로 다른 매니저·prefix 로 설치 | 조회 경로가 갈려 미설치 판정 |
| nvm 등으로 node 버전 전환 후 prefix 변경 | reap 은 남고 daemon 만 사라지거나 그 반대. 판정은 정확하나 사용자에게는 갑작스러움 |
| Windows | 전 경로 미검증. 경로 구분자·전역 prefix 구조가 다르다 |

## Solution

**명시 지정 경로를 연다.** 자동 탐색이 실패할 수 있는 이상, 사용자가 위치를 직접 알려줄 수 있어야 한다.

두 채널을 검토:
- `REAP_DAEMON_BIN` env var — 임시·CI 용. `REAP_DAEMON_PORT` 선례가 있다
- `.reap/config.yml` 의 `daemonBin:` — 영속적. `daemon: true` 와 같은 자리라 발견 가능성이 높다

`resolveDaemonBin` 의 **1순위**로 넣는다 (명시 > 패키지 조회 > 체크아웃 > null). `DaemonResolveDeps` seam 이 이미 있으므로 unit 은 그대로 확장된다.

**미설치 안내 문구도 함께 바꿔야 한다** — 지금은 무조건 "설치하라"고 한다. 명시 경로가 생기면 *"설치했는데도 이 메시지가 보이면 `daemonBin` 으로 위치를 알려주세요"* 가 함께 나와야 한다. 그렇지 않으면 파손된 사용자는 여전히 막다른 길에 있다.

**검증**: pnpm 프로젝트를 fixture 로 만들어 (a) 우회 없이 미설치로 판정되고 (b) `daemonBin` 지정 시 동작하는지 확인. 자기진단 게이트에 넣을지는 비용을 보고 판단 — pnpm 설치가 추가된다.

## Files to Change

- `src/cli/commands/daemon/client.ts` — `resolveDaemonBin` 우선순위, `DaemonResolveDeps`
- `src/types/index.ts` — `ReapConfig.daemonBin?: string`
- `src/cli/commands/daemon/index.ts` + `src/core/integrity.ts` + `src/core/prompt.ts` — 안내 문구
- `src/templates/reap-guide.md` + `.reap/reap-guide.md`, `docs/src/i18n/translations/*.ts` (5), `README*.md`
- `tests/unit/daemon-availability.test.ts` — 우선순위 케이스
- `scripts/check-self-diagnosis.sh` — pnpm 레이아웃 검사 (비용 판단 후)

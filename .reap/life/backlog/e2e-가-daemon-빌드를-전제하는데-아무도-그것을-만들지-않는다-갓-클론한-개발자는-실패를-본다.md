---
type: task
status: pending
priority: medium
createdAt: 2026-08-19T05:19:17.587Z
---

# e2e 가 daemon 빌드를 전제하는데 아무도 그것을 만들지 않는다 — 갓 클론한 개발자는 실패를 본다

gen-084 push 후 reap-test CI 가 e2e 1건으로 red 가 됐다. `daemon-config.test.ts` case 4 가 `daemonInstalled` 를 true 로 못박는데(이 체크아웃에 daemon/ 이 옆에 있으므로 없다고 보고하면 회귀 — gen-083/084 가 고친 바로 그 결함), 러너에는 `daemon/dist/index.js` 가 없었다.

재현: `daemon/dist/index.js` 를 지우고 `bun test tests/e2e/daemon-config.test.ts` → 같은 1건 실패. 되돌리면 통과. 러너 조건을 로컬에서 정확히 재현한 것이며 추론이 아니다.

원인: `.gitignore:3` 이 `daemon/dist/` 를 제외하고, reap 의 `npm run build`(`scripts/build.sh`)는 daemon 을 빌드하지 않는다. gen-083 이 `file:./daemon` dependency 를 제거하고 npm workspaces 로 바꾸면서 **daemon/dist 빌드 책임이 명시적으로 어디에도 없게 됐다.**

**응급 처치는 끝났으나 근본은 남아 있다.** reap-test 워크플로에 `npm run build --workspace daemon` 단계를 추가해(reap-test `ae57a46`) CI 는 green 이다. 그러나 **갓 클론한 개발자가 `npm ci && npm run build && npm run test:e2e` 를 하면 같은 실패를 본다.** 테스트가 문서화되지 않은 전제를 갖고 있고, 그 전제를 만족시키는 명령이 어디에도 적혀 있지 않다.

검토할 선택지:
1. reap 의 `npm run build` 가 workspace 까지 빌드 — workspaces 규약에 맞고 전제가 사라진다. 다만 bun 의존이 reap 빌드에 추가되고 빌드 시간이 늘어난다
2. e2e 가 필요 시 daemon 을 빌드 — 테스트가 자기 전제를 스스로 만든다. 다만 테스트가 빌드를 돌리는 것은 층위 위반
3. 전제를 문서화만 — 가장 약하다. genome § '반복 누락은 지시가 아니라 검사로 막는다' 에 정면으로 어긋난다

**판단 시 물을 것**: 이 저장소를 처음 클론한 사람이 README 대로 따라했을 때 초록을 보는가. 지금은 아니다.

관련: gen-083(workspaces 전환), gen-084(locateDaemon 체크아웃 후보), reap-test `ae57a46`

## Problem

gen-084 push 후 reap-test CI 가 e2e 1건으로 red 가 됐다. `daemon-config.test.ts` case 4 가 `daemonInstalled` 를 true 로 못박는데 — 이 체크아웃에 `daemon/` 이 옆에 있으므로 없다고 보고하면 회귀이고, 그것이 gen-083/084 가 고친 바로 그 결함이다 — 러너에는 `daemon/dist/index.js` 가 없었다.

**재현했다** (추론이 아니다): `daemon/dist/index.js` 를 지우고 `bun test tests/e2e/daemon-config.test.ts` → 같은 1건 실패. 되돌리면 통과. 러너 조건을 로컬에서 정확히 만든 것이다.

원인은 셋의 조합이다:

- `.gitignore:3` 이 `daemon/dist/` 를 제외한다 (정상 — 빌드 산출물이다)
- reap 의 `npm run build` (`scripts/build.sh`) 는 daemon 을 빌드하지 않는다
- gen-083 이 `file:./daemon` dependency 를 제거하고 npm workspaces 로 바꾸면서 **`daemon/dist` 를 만들 책임이 명시적으로 어디에도 없게 됐다**

그 전에는 `file:./daemon` 심링크가 상황을 가려주고 있었다.

**응급 처치는 끝났고 근본은 남아 있다.** reap-test 워크플로에 `npm run build --workspace daemon` 을 추가해(reap-test `ae57a46`) CI 는 green 이다 (unit 523 / e2e 279 / scenario 44, 0 fail). 그러나 **갓 클론한 개발자가 `npm ci && npm run build && npm run test:e2e` 를 하면 같은 실패를 본다.** 테스트가 문서화되지 않은 전제를 갖고 있고, 그 전제를 만족시키는 명령이 어디에도 적혀 있지 않다.

`daemon/dist` 를 한 번이라도 빌드한 머신에서는 영원히 통과하므로, **이 결함은 로컬에서 스스로 드러나지 않는다.** longterm § *"한 환경에서의 green 은 표본 크기 1"*.

## Solution

세 선택지가 있고 트레이드오프가 다르다.

| # | 안 | 장점 | 단점 |
|---|---|---|---|
| 1 | reap 의 `npm run build` 가 workspace 까지 빌드 | workspaces 규약에 맞고 **전제가 사라진다** | reap 빌드에 bun 의존과 시간이 추가된다 |
| 2 | e2e 가 필요 시 daemon 을 빌드 | 테스트가 자기 전제를 스스로 만든다 | 테스트가 빌드를 돌리는 것은 층위 위반 |
| 3 | 전제를 문서화만 | 비용 0 | 가장 약하다. genome § *"반복 누락은 지시가 아니라 검사로 막는다"* 에 정면으로 어긋난다 |

1번이 유력하나 빌드 시간 증가를 실측하고 정할 것.

**판단 기준**: 이 저장소를 처음 클론한 사람이 README 대로 따라했을 때 초록을 보는가. **지금은 아니다.**

**검사 먼저**: 고치기 전에 `daemon/dist` 가 없는 상태에서 실패를 확인하고(위 재현 절차 그대로), 고친 뒤 통과를 확인한다. 이미 재현 경로가 있으므로 negative test 는 공짜다.

## Files to Change

- `scripts/build.sh` — 1번 채택 시 daemon 빌드 추가. `daemon/scripts/build.sh` 를 호출할지 `npm run build --workspace daemon` 을 쓸지 결정
- `package.json` — `build` 스크립트 정의가 바뀌면
- `tests/e2e/daemon-config.test.ts` — 2번 채택 시. 1번이면 무변경
- `README.md` / `README.ko.md` — 개발 셋업 절이 있으면 갱신
- `.reap/environment/summary.md` — npm scripts 절에 daemon 빌드 책임 명시
- (참고, 별도 repo) `reap-test/.github/workflows/test.yml` — 1번 채택 시 `ae57a46` 이 추가한 단계가 **중복이 되므로 제거 검토**. 남겨두면 두 곳이 같은 책임을 지게 된다

## Related

- gen-083 — workspaces 전환으로 이 조건을 만들었다
- gen-084 — `locateDaemon` 이 체크아웃 후보로 `daemon/dist/index.js` 를 본다
- reap-test `ae57a46` — 응급 처치 커밋

---
type: task
status: consumed
priority: medium
createdAt: 2026-07-27T16:21:46.565Z
consumedBy: gen-081-a3e18e
consumedAt: 2026-07-28T12:58:44.206Z
---

# CI 에서 테스트 실행 — private submodule(reap-test) 접근 토큰 설정

## Problem

`.github/workflows/ci.yml` 의 job 이름은 `test` 인데 **테스트를 돌리지 않는다.** `npm ci` + `npm run build` + (gen-078부터) 자기진단이 전부다.

원인은 접근 권한이다:

```
.gitmodules:  tests → https://github.com/c-d-cc/reap-test.git
gh repo view c-d-cc/reap-test → "isPrivate": true
```

`actions/checkout@v4` 는 기본적으로 submodule 을 가져오지 않고, `submodules: recursive` 를 켜도 기본 `GITHUB_TOKEN` 은 **다른 저장소에 접근할 수 없다.** private 이므로 인증 없이는 clone 이 실패한다.

### 방치의 실제 대가

e2e 1건 실패가 **6세대(gen-072~077) 방치**됐다. 매 세대 validation 에서 "pre-existing 인가 회귀인가"를 사람이 판단해야 했고, gen-077 에서야 backlog 화되어 고쳐졌다.

CI 가 테스트를 돌렸다면 첫 세대에서 red 로 드러났을 것이다. **테스트가 있는데 아무도 강제하지 않으면 없는 것과 크게 다르지 않다.**

gen-078 이 자기진단을 CI 에 넣었으므로 "CI 가 아무것도 검증하지 않는" 상태는 벗어났으나, 테스트는 여전히 로컬 실행에만 의존한다.

## Out of Scope

- 자기진단 게이트 → gen-078 에서 완료 (tests/ 불필요하므로 CI 에 이미 들어감)
- 테스트 자체의 수정 → 현재 전 스위트 green (470-0 / 272-0 / 44-0)

## Solution — D (실행 주체 뒤집기) 확정

**`reap-test` 를 private 으로 둔 이유** (유저 확인 2026-07-28): REAP 본체는 오픈소스로 공개하되 **테스트셋은 비공개로 유지해 최소한의 복제 guard** 를 두려는 것.

이 의도가 선택지를 정리한다:

| 안 | 판정 |
|---|---|
| B. public 전환 | **탈락** — guard 의도를 정면으로 무너뜨린다 |
| C. 본 저장소로 이동 | **탈락** — 본 저장소가 공개이므로 B 와 같은 결과 |
| A. PAT + secret (reap 에서 실행) | **탈락** — 아래 |
| **D. reap-test 에서 실행** | **채택** (유저 확인 2026-07-28) |

### A 가 탈락한 이유 — 공개 로그가 guard 를 무력화한다

`c-d-cc/reap` 은 **PUBLIC** 이다. public 저장소의 Actions 로그와 artifact 는 **누구나 열람·다운로드할 수 있다.** `bun test` 는 기본적으로 테스트 이름을 전부 출력하므로, A 안을 켜는 순간 공개 로그에 다음이 남는다:

- 테스트 파일 구조와 전체 테스트 이름 (470 + 278 + 44건)
- 실패 시 assertion 메시지 — 기대값/실제값 그대로

소스 자체는 아니지만 테스트셋의 상당 부분이 노출된다. **복제 guard 를 위해 private 으로 둔 저장소를 공개 로그로 새게 하는 셈**이라 목적과 정면 충돌한다. 그리고 **한 번 공개된 로그는 되돌릴 수 없다** — 나중에 D 로 바꿔도 이미 나간 것은 남는다. 그래서 처음부터 D 로 간다.

### D 의 구조 — 로그가 private 저장소에 남는다

| | A (reap 에서 실행) | **D (reap-test 에서 실행)** |
|---|---|---|
| job 이 도는 곳 | reap (public) | reap-test (private) |
| tests 접근 | reap-test 읽기 PAT 필요 | 자기 자신 — 토큰 불필요 |
| reap 소스 접근 | 자기 자신 | reap 이 public 이라 토큰 불필요 |
| **로그 가시성** | **공개** | **비공개** |
| 필요한 secret | reap-test 읽기 PAT | reap → reap-test dispatch 토큰 |

### 구현

1. `c-d-cc/reap-test` 에 `repository_dispatch` 를 보낼 수 있는 fine-grained PAT 발급 → `c-d-cc/reap` secret 에 등록 (**사용자 수동 작업**, agent 불가)
2. `reap/.github/workflows/ci.yml` — push to main 시 reap-test 로 `repository_dispatch` 전송 (커밋 SHA 를 payload 로)
3. `reap-test/.github/workflows/*.yml` (신규) — dispatch 수신 → 해당 SHA 의 reap checkout(public, 토큰 불필요) → 자기 자신을 `tests/` 로 배치 → `npm ci` + build → 테스트 실행

### fork PR — D 에서는 문제가 발생하지 않는다

A 안은 fork PR 에서 `secrets.*` 가 비어 submodule checkout 이 실패해 **모든 외부 PR 이 red** 가 되는 새 문제를 만든다. D 는 reap 쪽에 test job 자체가 없으므로 그런 일이 없다 — fork PR 은 기존대로 build + 자기진단만 받고, 이 둘은 secret 이 필요 없어 정상 동작한다.

테스트 신호의 공백은 **유저가 merge 전 수동 검증**으로 메운다 (유저 판단 2026-07-28): 검토 중 필요하면 테스트 코드를 직접 추가한다. 현재 이 저장소의 **PR 은 0건**이고 외부 기여는 issue 3건이 전부이므로, 존재하지 않는 시나리오를 위해 설계를 비틀지 않는다.

필요해지면 reap-test 워크플로에 `workflow_dispatch` 입력(PR 번호 또는 ref)을 추가해 검토 중 수동 실행할 수 있다. 로그는 여전히 private 에 남는다. **지금은 만들지 않는다.**

### 트레이드오프 — 사후 감지

테스트가 merge 이후에 돌므로 잘못된 merge 는 main 에 들어간 다음 red 가 된다. 다만 현재는 사후 감지조차 없다 — e2e 1건이 6세대 방치된 것이 그 결과다. **사후에라도 자동으로 red 가 뜨는 것 자체가 개선**이며, merge 전 검증은 REAP lifecycle 의 validation 단계가 이미 담당한다.

### 단계적 도입 — 한 번에 다 넣지 않는다

유저 우려(2026-07-28): *"CI 에서 reap test 를 다 할 수 있을지 모르겠어."* 타당하며, 실제로 걸릴 만한 지점이 있다. 한 번에 넣고 실패하면 원인 분리가 어려우므로 순서대로 넣는다.

| 단계 | 대상 | 위험 |
|---|---|---|
| 1 | `test:unit` (470건, ~8s) | 낮음 — 외부 의존 없음 |
| 2 | `test:e2e` 중 daemon 제외 (~250건) | 중간 — HOME 격리가 리눅스에서 동작하는지. `os.homedir()` 는 POSIX 에서 `$HOME` 을 따르므로 될 것으로 보이나 실측 필요 |
| 3 | daemon e2e 4파일 (~21건) | **높음** — `better-sqlite3` 네이티브 빌드 + tree-sitter WASM 로드 + 포트 바인딩(17225) |
| 4 | `test:scenario` (44건, ~7s) | 낮음 — git 사용하나 러너에 있고 테스트가 user.email/name 을 직접 설정 |

**3단계가 실패해도 1·2·4 는 유지한다.** daemon 이 리눅스 CI 에서 안 되면 그 파일만 CI 에서 제외하고 로컬 실행에 남긴다 — 전부 아니면 전무로 갈 이유가 없다. 제외할 경우 **제외 사실과 이유를 `ci.yml` 주석에 남겨** 다음 사람이 "왜 daemon 테스트가 없지"로 재조사하지 않게 한다.

총 소요는 약 1분(unit 8s + e2e 45s + scenario 7s)으로 CI 시간 부담은 없다.

## Files to Change

- `reap/.github/workflows/ci.yml` — push to main 시 dispatch 전송 단계 추가
- `reap-test/.github/workflows/` — 신규 워크플로 (dispatch 수신 → reap checkout → 테스트)
- 저장소 secret (dispatch 토큰) — **사용자 수동 작업**
- `.reap/environment/summary.md` — CI 가 무엇을 어디서 검증하는지

## Acceptance

1. reap 의 main push 가 reap-test 워크플로를 트리거하고, 실패 시 red
2. 현재 baseline(470-0 / 278-0 / 44-0)이 CI 에서 재현됨
3. **로그가 public 에 남지 않음** — reap 의 Actions 로그에 테스트 이름·assertion 이 나타나지 않아야 한다. 이것이 D 를 택한 이유이므로 눈으로 확인한다
4. 토큰 만료 시 증상이 명확 — dispatch 실패로 즉시 드러나야 하며, 조용히 건너뛰면 안 된다
5. fork PR 이 red 가 되지 않음 — build + 자기진단만 돌고 통과
6. e2e 가 CI 환경에서도 HOME 격리를 지키는지 확인 (gen-076/077 의 격리가 리눅스 러너에서도 동작)

## Open Decisions

- [x] **A/B/C/D = D(뒤집기)** — private 유지 이유가 복제 guard 인데 reap 이 public 이라 A 의 로그가 guard 를 무력화 (유저 확인 2026-07-28)
- [x] **fork PR = 유저 수동 검증** — PR 0건이므로 사전 신호 장치는 만들지 않음 (유저 판단 2026-07-28)
- [x] **단계적 도입** — unit → e2e(daemon 제외) → daemon → scenario
- [ ] daemon e2e 가 리눅스 러너에서 동작하는지 — 3단계에서 실측. 안 되면 CI 제외 + 사유 주석
- [ ] reap-test 워크플로가 reap 소스와 tests 를 어떤 디렉토리 배치로 합칠지 — submodule 관계가 반대 방향이 되므로 checkout 순서/경로 설계 필요

---
type: task
status: pending
priority: medium
createdAt: 2026-07-27T16:21:46.565Z
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

## Solution — A (PAT) 확정

**`reap-test` 를 private 으로 둔 이유** (유저 확인 2026-07-28): REAP 본체는 오픈소스로 공개하되 **테스트셋은 비공개로 유지해 최소한의 복제 guard** 를 두려는 것.

이 의도가 선택지를 정리한다:

| 안 | 판정 |
|---|---|
| B. public 전환 | **탈락** — guard 의도를 정면으로 무너뜨린다 |
| C. 본 저장소로 이동 | **탈락** — 본 저장소가 공개이므로 B 와 같은 결과 |
| **A. PAT + secret** | **유일한 선택** |

### 구현

1. `c-d-cc/reap-test` read 권한 fine-grained PAT 발급 → `c-d-cc/reap` secret 에 `SUBMODULE_TOKEN` 등록 (**사용자 수동 작업**, agent 불가)
2. `ci.yml`:

```yaml
- uses: actions/checkout@v4
  with:
    submodules: recursive
    token: ${{ secrets.SUBMODULE_TOKEN }}
```

3. 테스트 실행 단계 추가 (`oven-sh/setup-bun@v2` 는 이미 있음)

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

- `.github/workflows/ci.yml` — checkout 옵션 + 테스트 실행 단계
- (A 채택 시) 저장소 secret — **사용자 수동 작업**
- `.reap/environment/summary.md` — CI 가 무엇을 검증하는지

## Acceptance

1. CI 가 unit/e2e/scenario 를 실행하고 실패 시 red
2. 현재 baseline(470-0 / 272-0 / 44-0)이 CI 에서 재현됨
3. 토큰 만료 시 증상이 명확 — checkout 실패로 즉시 드러나야 하며, 조용히 테스트를 건너뛰면 안 된다
4. e2e 가 CI 환경에서도 HOME 격리를 지키는지 확인 (gen-076/077 의 격리가 리눅스 러너에서도 동작)

## Open Decisions

- [x] **A/B/C = A(PAT)** — private 유지 이유가 복제 guard 이므로 B/C 탈락 (유저 확인 2026-07-28)
- [x] **단계적 도입** — unit → e2e(daemon 제외) → daemon → scenario
- [ ] daemon e2e 가 리눅스 러너에서 동작하는지 — 3단계에서 실측. 안 되면 CI 제외 + 사유 주석
- [ ] PAT 만료 대응 — 만료 시 checkout 이 실패해 CI 가 red 가 되는지(조용히 건너뛰지 않는지) 확인 필요

# Implementation Log

## Completed Tasks

### T001 `tests/.github/workflows/test.yml` — 신규 (reap-test 저장소)

reap-test 의 첫 워크플로다 (기존 `.github/` 없음).

트리거 3종:
- `repository_dispatch: [reap-push]` — reap 이 보내는 것. 두 SHA 를 payload 로 받는다
- `push: [main]` — 테스트 자체가 바뀌었을 때, reap main 에 대해 검증
- `workflow_dispatch` — 수동

핵심은 **디렉토리 배치 재현**이다. 테스트가 `import.meta.dir/../..` 와 `../../src/...` 로 자기 위치를 하드코딩하므로, checkout 두 번으로 `<reap>/tests/` 를 만든다. reap 을 submodule 없이 checkout 하면 `tests/` 가 빈 디렉토리로 남고 그 자리에 이 저장소를 넣는다. **테스트 코드는 한 줄도 수정하지 않는다.**

SHA 결정은 별도 step 으로 분리해 `$GITHUB_OUTPUT` 에 넣었다. payload 값은 env 를 거쳐 읽는다 (템플릿을 셸에 직접 전개하지 않음). dispatch 인데 SHA 가 비어 있으면 **명시적으로 실패**한다 — 빈 ref 로 checkout 하면 조용히 기본 브랜치가 잡혀 엉뚱한 조합을 테스트하게 된다.

1단계이므로 `test:unit` 만 실행한다.

### T002 `.github/workflows/ci.yml` — dispatch job 추가 + job 이름 정정

**job 이름 `test` → `build`.** 테스트를 돌리지 않는데 이름이 `test` 인 것이 backlog 가 지적한 상태였다. 브랜치 보호가 없어(확인함) required check 를 깨뜨리지 않는다.

`dispatch-tests` job 신설:
- `needs: build` — 빌드가 깨졌으면 테스트를 요청할 이유가 없다
- `if: push && ref == main` — **PR 제외**. fork PR 은 secret 을 받지 못하므로 이 job 이 PR 에서 돌면 모든 외부 기여가 red 가 된다. push 한정으로 두면 fork PR 은 build + 자기진단만 받고, 둘 다 secret 이 필요 없어 정상 통과한다
- 토큰 부재 시 `::error::` + `exit 1` — **조용히 건너뛰지 않는다.** 테스트가 안 돌았는데 초록불이 뜨는 것이 빨간불보다 나쁘다
- `git ls-tree HEAD tests` 로 **submodule pointer** 추출 (유저 확인). 로컬 검증 완료 — `8a68919` 반환
- `curl -f` 로 HTTP 에러를 non-zero exit 로 전환 — 만료·권한부족 토큰이 조용히 지나가지 않는다

두 워크플로 모두 YAML 파싱 검증 통과.

## Architecture Decisions

### dispatch 를 PR 에서 제외한 것

계획 단계에서는 "fork PR 이 red 가 되지 않는다"를 완료 기준으로만 적었는데, 구현에서 이것이 `if:` 조건 하나로 **구조적으로 보장**됨을 확인했다. reap 쪽에 테스트 job 자체가 없으므로 fork 가 secret 을 못 받는 상황이 아예 발생하지 않는다. A안(reap 에서 실행)이었다면 별도 우회 로직이 필요했을 지점이다.

### PAT 없이도 1단계를 측정할 수 있다 — 계획 대비 변경

계획은 T003(PAT) 이 T004~T009 전부를 차단한다고 봤으나, 그렇지 않다.

`repository_dispatch` 는 토큰이 필요하지만 **`push` 트리거는 필요 없다.** 워크플로를 reap-test main 에 올리는 것만으로 `push` 경로가 발화하고, 그것이 곧 **디렉토리 배치 + unit 실행의 실측**이다. reap 은 public 이라 기본 토큰으로 checkout 된다.

따라서 차단 범위가 줄어든다:

| 항목 | PAT 필요 | 언제 |
|---|---|---|
| 디렉토리 배치 동작 (T004) | **불필요** | 워크플로 push 즉시 |
| 단계 2·3·4 (T005~T007) | **불필요** | 각 push 마다 |
| negative test (T008) | 불필요 | 스위트 완성 후 |
| **dispatch 경로 자체** | 필요 | reap main push 시 |

즉 PAT 은 **마지막 한 고리**만 막는다. 나머지는 먼저 검증할 수 있고, 그 편이 낫다 — PAT 이 붙었을 때 실패하면 원인이 토큰인지 배치인지 섞이기 때문이다.

### T004~T007 단계적 실측 — 위험 예측이 반대로 빗나갔다

계획은 daemon e2e(네이티브 `better-sqlite3` 빌드 + tree-sitter WASM + 포트 바인딩)를 **최고 위험**으로, unit 을 **최저 위험**으로 봤다. 실제로는 정반대였다:

| 스위트 | 예측 | 결과 |
|---|---|---|
| unit | 낮음 | **잠복 버그 3종** |
| e2e (daemon 포함) | 높음 | 무수정 통과 |
| scenario | 낮음 | 1건 (같은 계열) |

daemon 제외 조치는 필요 없었다. 단계적 도입 자체는 값을 했다 — 실패가 어느 스위트에서 왔는지 즉시 분리됐다.

### T003 PAT 등록 + dispatch 전 경로 검증

토큰 등록 후 reap main 에 빈 커밋으로 확인. 첫 시도는 **실패했고 그것이 설계가 맞다는 증거였다** — reap 의 submodule pointer 가 아직 수정 전 tests(`8a68919`)를 가리켜 그 조합을 테스트했다. pointer 갱신(T011) 후:

```
reap  29d0a91   (그 커밋)
tests c27f5ac    (그 커밋이 가리키는 pointer)
unit 470-0 · e2e 278-0 · scenario 44-0
```

## Discovered Issues

### 테스트 스위트가 개발자 머신 상태에 의존하고 있었다 — 3종

CI 를 붙이자마자 드러났다. 셋 다 **로컬에서만 돌리는 한 영원히 보이지 않는** 종류다.

**(1) git identity 미설정.** 테스트가 저장소를 만들고 commit 하는데 identity 를 설정하지 않는다. 개발자 머신은 global config 가 채워주지만 러너는 없다. `git clone` 과 `submodule add` 로 생긴 저장소는 각각 별도로 필요하다는 점이 한 번에 안 드러나 3회에 걸쳐 수정했다.

**(2) `init.defaultBranch` 의존.** `git init --bare` 의 HEAD 가 머신 설정을 따른다. 미설정이면 `master` 라 clone 이 미탄생 브랜치에 떨어지고 `push main` 이 실패한다. `merge.test.ts` 는 `checkout main` 을 직접 했다. **직후 `checkout -b` 로 갈아타 무해한 곳까지 포함해 전부 `-b main` 을 명시**했다 — 무해 여부를 매번 판단하게 두면 다음에 또 걸린다.

**(3) `mock.module` 의 프로세스 전역 누수 — 가장 심각.** `pull.test.ts` 가 `git.ts` / `generation.ts` / `output.ts` 를 교체하는데, bun 의 module mock 은 되돌릴 수 없고 이후 로드되는 모든 파일에 남는다. 결과:

- `gitCurrentBranch` 가 실제 함수 대신 이 파일의 canned `"main"` 을 반환
- `GenerationManager` 가 `create` 없는 stub 으로 축소

**bun 의 디렉토리 순회 순서에 따라 터진다.** macOS 는 통과하고 리눅스는 실패했다. 즉 **순서에 우연히 기대어 통과하던 스위트**였다.

## Architecture Decisions

### dispatch 를 PR 에서 제외한 것

계획 단계에서는 "fork PR 이 red 가 되지 않는다"를 완료 기준으로만 적었는데, 구현에서 이것이 `if:` 조건 하나로 **구조적으로 보장**됨을 확인했다. reap 쪽에 테스트 job 자체가 없으므로 fork 가 secret 을 못 받는 상황이 아예 발생하지 않는다. A안(reap 에서 실행)이었다면 별도 우회 로직이 필요했을 지점이다.

### mock 누수 해법 — 세 후보 중 실측으로 선택

| 후보 | 판정 |
|---|---|
| `afterAll` 에서 실제 모듈 복구 | **기각 — 실측으로 무효 확인.** bun 은 모든 테스트 파일을 로드한 뒤 실행하므로 afterAll 시점엔 이미 늦다 |
| `execute()` 에 의존성 주입 | 확실하나 production 코드 변경 동반. output.ts 캡처까지 주입해야 누수가 사라져 범위가 커진다 |
| **`--isolate`** | **채택.** 파일마다 새 global. 러너에서 470-0 확인 |

`--isolate` 는 로컬 bun 1.3.10 의 `--help` 에 없지만 **실행은 정상**(470-0)이라 개발자 환경을 깨뜨리지 않는다.

복구 코드는 **동작하지 않음을 확인했으므로 남기지 않았다.** 대신 위험을 설명하는 주석만 파일 상단에 남겼다 — 다음 사람이 같은 해법을 다시 시도하지 않도록 "afterAll 은 안 된다"를 근거와 함께 적었다.

### 디버깅 루프를 CI 에서 로컬 docker 로 옮긴 것

CI 왕복은 1회 ~1분이고 로그 조회까지 하면 더 걸린다. `oven/bun:1.3.14-debian` + git 이미지를 만들어 `GIT_CONFIG_GLOBAL=/dev/null` 로 러너 조건을 재현했다.

**첫 시도는 잘못된 결론으로 갈 뻔했다** — `oven/bun` 기본 이미지에 **git 이 없어서** 전혀 다른 원인의 실패를 보고 있었다. 재현 환경이 대상 환경과 어디까지 같은지 확인하지 않으면 재현이 아니라 새 변수를 하나 더 만드는 것이다.

## Deferred Items

- **reap 로의 commit status 역전송** — 실패 알림은 GitHub 기본 알림(저장소 소유자)에 의존한다. 유지보수자가 1인이라 충분하다고 판단. 필요해지면 토큰 권한 추가 + reap-test 워크플로에 status API 호출 1단계
- **fork PR 사전 검증** — 유저 판단(PR 0건). 필요해지면 `workflow_dispatch` 입력으로 PR ref 를 받아 수동 실행

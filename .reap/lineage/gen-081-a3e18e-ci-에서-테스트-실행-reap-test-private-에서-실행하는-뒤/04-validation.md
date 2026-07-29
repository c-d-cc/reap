# Validation Report

## Result

**pass**

## Checks

### 계획의 완료 기준 6항목

| # | 기준 | 결과 | 근거 |
|---|---|---|---|
| 1 | reap 의 main push 가 reap-test 워크플로를 트리거 | ✅ | run `30465560200` (event: `repository_dispatch`) — `reap 29d0a91` / `tests c27f5ac` 를 로그가 명시 |
| 2 | baseline 470-0 / 278-0 / 44-0 재현 | ✅ | 리눅스 러너에서 세 스위트 전부 0 fail. **daemon e2e 제외 없음** |
| 3 | reap 공개 로그에 테스트 내용 없음 | ✅ | reap CI 로그에서 `(pass)`/`(fail)`/`expect()` 문자열 **0건** |
| 4 | 깨진 상태에서 red | ✅ | 아래 별도 절 |
| 5 | 토큰 부재/만료 시 명확히 실패 | ✅ | 아래 별도 절 |
| 6 | fork PR 이 red 가 되지 않음 | ✅ | reap 쪽에 test job 자체가 없음 — `if: push && ref == main` |

### 기준 4 — 검사가 실제로 무언가를 잡는가

genome 은 "검사를 만들면 먼저 실패시켜라"를 요구한다. **인위적으로 깨뜨릴 필요가 없었다 — 붙이자마자 실제 결함 3종을 red 로 잡았다.**

| CI run | 결과 | 잡은 것 |
|---|---|---|
| 1차 | 22 fail | git identity 미설정 |
| 2차 | 17 fail | clone/submodule 저장소의 identity |
| 3차 | 17 fail | `mock.module` 전역 누수 (환경 수정으로는 안 사라짐 → 별개 원인임이 드러남) |
| 4차 | 16 fail | `afterAll` 복구가 무효임을 확인 |
| 5차 | 1 fail | `init.defaultBranch` 의존 |
| 6차~ | **0 fail** | — |

인위적 negative test 보다 강한 증거다. 각 단계에서 **실패가 어느 스위트/어느 파일에서 왔는지 즉시 귀속**됐고, 그것이 단계적 도입의 값이었다.

### 기준 5 — 토큰 실패가 조용히 지나가지 않는가

토큰 등록 **전** reap CI 를 실측:

```
##[error]TEST_DISPATCH_TOKEN is not set — the test suite did NOT run.
##[error]Process completed with exit code 1.
```

job 이 red 가 되고 사유가 명시된다. HTTP 실패(만료·권한부족)는 `curl -f` 가 non-zero exit 로 전환한다.

**토큰 교체도 실측했다.** 사용자가 재발급 후 secret 을 갱신 → 빈 커밋 push → dispatch 정상 발화, 470/278/44 전부 0 fail.

### 표준 검사

| 항목 | 결과 |
|---|---|
| `npm run typecheck` | pass (에러 없음) |
| `npm run build` | pass |
| unit / e2e / scenario (로컬 macOS) | 470-0 / 278-0 / 44-0 |
| unit (docker 리눅스, `GIT_CONFIG_GLOBAL` 미설정) | 470-0 |
| `scripts/check-docs-version.sh` | pass |
| `scripts/list-carriers.sh --orphans` | orphan 0 |

## Edge Cases

### submodule pointer 가 낡았을 때 — 설계대로 실패했다

dispatch 첫 시도가 실패했고 **그것이 설계가 맞다는 증거였다.** reap 의 pointer 가 아직 수정 전 tests(`8a68919`)를 가리켜 그 조합을 테스트했다. pointer 갱신 후 통과.

즉 "그 커밋이 실제로 가리키는 조합"을 검증한다는 의도가 동작한다. main HEAD 를 썼다면 이 불일치가 **감춰졌을** 것이다.

### 재현 환경이 대상 환경과 다를 때

디버깅용 docker 이미지의 첫 선택(`oven/bun`)에 **git 이 없었다.** 전혀 다른 원인의 실패를 보며 "mock 이 원인"이라는 잘못된 결론에 근접했다. git 을 넣은 뒤에야 원인이 둘로 분리됐다.

## Issues

### 검사가 보지 못하는 것 (한계 명시)

genome 은 "검사가 못 잡는 것을 결과와 함께 기록하라"를 요구한다.

- **merge 전 신호가 없다.** 테스트는 main push 이후에 돈다. 잘못된 merge 는 들어간 다음 red 가 된다. 유저 판단(수동 검증)으로 수용
- **fork PR 은 테스트를 받지 않는다.** build + 자기진단만 돈다
- **실패 알림이 능동적이지 않다.** GitHub 기본 알림에 의존. reap 의 PR/커밋 화면에는 표시되지 않는다
- **리눅스 단일 플랫폼.** macOS/Windows 러너는 쓰지 않는다. macOS 고유 회귀는 로컬에서만 드러난다
- **PAT 만료는 red 로 드러나지만 사전 경고는 없다.** fine-grained PAT 은 최대 1년

### 남은 위험 — 이 세대가 만든 것은 아니나 기록

`--isolate` 는 로컬 bun 1.3.10 의 `--help` 에 없다. 실행은 정상이나 **더 낮은 버전에서의 동작은 확인하지 않았다.** 만약 무시된다면 그 환경에서는 순서 의존이 남는다 — 다만 CI 가 항상 격리 실행하므로 누수는 CI 에서 잡힌다.

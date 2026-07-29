# Planning

## Goal

reap 의 main push 가 **reap-test(private) 저장소의 CI 에서** 전체 테스트 스위트를 실행하게 한다. 로그는 private 에 남아 복제 guard 가 유지된다.

완료 시 달라지는 것: 지금은 테스트가 로컬에서만 돌고 아무도 강제하지 않는다. 이후에는 main 에 들어간 회귀가 **사람의 기억과 무관하게** red 로 드러난다.

## Background

e2e 1건 실패가 6세대(gen-072~077) 방치됐다. 원인은 테스트 부재가 아니라 **강제 장치의 부재**다. genome 의 원칙 그대로다 — *"같은 절차가 두 번 이상 누락되면, 지시문을 더 자세히 쓰는 것은 이미 실패한 방법이다. 검사를 만들어라."*

gen-078 이 자기진단을 CI 에 넣어 첫 검사를 세웠고, 본 generation 이 테스트를 잇는다.

## Approach

### 왜 뒤집는가 — 로그가 되돌릴 수 없기 때문

`c-d-cc/reap` 은 PUBLIC 이고 public 저장소의 Actions 로그·artifact 는 누구나 열람 가능하다. `bun test` 는 테스트 이름을 전부 출력하므로, reap 에서 테스트를 돌리면 private 으로 지킨 테스트셋이 공개 로그로 샌다.

**되돌릴 수 없다는 점이 결정적이다.** 나중에 구조를 바꿔도 이미 나간 로그는 남는다. 그래서 처음부터 실행 주체를 private 쪽에 둔다.

### 구조

```
reap (public)                      reap-test (private)
  push to main                       
    └─ ci.yml: build + 자기진단        
    └─ dispatch ──────────────────▶  test.yml (repository_dispatch)
                                       ├─ checkout reap@sha    → ./reap
                                       ├─ checkout self@ptr    → ./reap/tests
                                       ├─ npm ci + build
                                       └─ unit / e2e / scenario
                                     (로그는 여기 남는다)
```

### 디렉토리 배치 — 재현이지 재구성이 아니다

테스트는 `<reap>/tests/` 배치를 하드코딩한다 (`import.meta.dir/../..`, `from "../../src/core/*.ts"`). 따라서 **테스트 코드는 한 줄도 고치지 않고** checkout 두 번으로 같은 배치를 만든다. reap 을 submodule 없이 checkout 하면 `tests/` 는 빈 디렉토리로 남으므로 그 자리에 덮어쓴다.

### SHA 조합 — 결정

| 트리거 | reap | tests | 근거 |
|---|---|---|---|
| reap push | 그 커밋 SHA | **submodule pointer** | 개발자가 실제로 검증한 조합을 재현. "이 커밋이 뭔가 깨뜨렸는가"에 답하려면 커밋이 가리키는 조합이어야 한다 |
| reap-test push | **main HEAD** | 그 커밋 SHA | "내 테스트 변경이 현재 reap 에서 통과하는가"에 답한다 |

pointer 대신 tests main HEAD 를 쓰면 개발자가 본 적 없는 조합을 테스트하게 되어, 실패했을 때 원인이 코드인지 테스트인지 분리되지 않는다. 그리고 pointer 는 매 generation commit 에서 갱신되므로 실무상 최신과 거의 같다.

### 결과 통지 — 별도 장치를 만들지 않는다

reap 에 commit status 를 역으로 쏘려면 토큰과 권한이 하나 더 필요하다. GitHub 은 워크플로 실패 시 저장소 소유자에게 기본 알림을 보내고, 현재 유지보수자는 1인이므로 그것으로 충분하다. **필요해지면 그때 추가한다.**

## Completion Criteria

1. reap 의 main push 가 reap-test 워크플로를 트리거한다
2. baseline **470-0 / 278-0 / 44-0** 이 리눅스 러너에서 재현된다 (daemon 제외 시 그만큼 차감된 수치 + 제외 사유 기록)
3. **reap 의 Actions 로그에 테스트 이름·assertion 이 나타나지 않는다** — D 를 택한 이유이므로 눈으로 확인한다
4. 의도적으로 깨뜨린 상태에서 red 가 된다 (검사를 먼저 실패시킨다 — genome 원칙)
5. 토큰 부재/만료 시 dispatch 단계가 실패해 드러난다. 조용히 건너뛰지 않는다
6. fork PR 이 red 가 되지 않는다 (reap 쪽에 test job 이 없으므로 구조적으로 보장되나 확인)

## Risk Assessment

| 위험 | 확인 방법 | 실패 시 |
|---|---|---|
| 빈 submodule 디렉토리에 checkout 이 안 될 수 있음 | 실측 | `path: reap/tests` 대신 별도 경로 checkout 후 이동 |
| daemon: `better-sqlite3` 네이티브 빌드 실패 | 실측 (3단계) | 해당 4파일만 CI 제외 + **사유 주석** |
| daemon: darwin 가정 (`daemon-indexing.test.ts`) | 실측 | 위와 동일 |
| HOME 격리가 리눅스에서 다르게 동작 | 2단계 실측 | 원인 추적 (workaround 금지) |
| PAT 미발급 상태 | — | **차단**. 워크플로 작성까지 진행 후 대기 |

**추론으로 결론내지 않는다** (gen-080 교훈). 위 4건은 전부 CI 를 실제로 돌려야 답이 나온다.

## Scope

대상:
- `reap/.github/workflows/ci.yml` — dispatch 전송 job 추가
- `reap-test/.github/workflows/test.yml` — 신규
- `.reap/environment/summary.md` — CI 가 무엇을 어디서 검증하는지

범위 밖:
- 테스트 코드 수정 (현재 전 스위트 green — 배치를 재현하므로 수정 불필요)
- fork PR 사전 검증 장치 (유저 판단: 수동 검증, PR 0건)
- reap 으로의 commit status 역전송

## Tasks

- [ ] T001 `reap-test/.github/workflows/test.yml` — 신규. `repository_dispatch` + `push` 트리거, checkout 2회로 배치 재현, npm ci + build, **unit 만** 실행 (1단계)
- [ ] T002 `reap/.github/workflows/ci.yml` — dispatch 전송 job 추가 (push to main 한정, PR 제외). 토큰 부재 시 실패하도록
- [ ] T003 유저에게 PAT 발급 + secret 등록 요청 → **대기**
- [ ] T004 1단계 실측 — dispatch 트리거 + unit 470-0 확인. 배치가 동작하는지 여기서 판명
- [ ] T005 2단계 — e2e 추가 (daemon 4파일 제외). HOME 격리 동작 확인
- [ ] T006 3단계 — daemon e2e 4파일 추가. 실패 시 제외 + **사유 주석** (다음 사람이 재조사하지 않도록)
- [ ] T007 4단계 — scenario 추가. 최종 baseline 재현 확인
- [ ] T008 검사가 실제로 잡는지 확인 — 일부러 깨뜨린 커밋으로 red 확인 후 복원 (negative test)
- [ ] T009 reap 의 Actions 로그에 테스트 내용이 없음을 육안 확인 (완료 기준 3)
- [ ] T010 `.reap/environment/summary.md` — CI/Release 게이트 절 갱신
- [ ] T011 reap-test submodule pointer 갱신 + 커밋 (tests/ 별도 처리)

## Dependencies

- T003 이 T004~T009 를 차단한다 (유저 수동 작업)
- T004 → T005 → T006 → T007 순차. 한 번에 넣으면 실패 시 원인 분리가 안 된다
- T008 은 T007 이후 (전체 스위트가 붙은 상태에서 검증해야 의미가 있다)
- T006 실패는 T007 을 막지 않는다 — **전부 아니면 전무로 가지 않는다**

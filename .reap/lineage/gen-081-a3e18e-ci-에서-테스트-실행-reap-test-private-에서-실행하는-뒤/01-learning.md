# Learning

## Project Overview

REAP v0.17.3 (방금 릴리즈). 자기진화형 개발 파이프라인, `@c-d-cc/reap`.

본 generation 은 **CI 가 테스트를 돌리지 않는 상태**를 해소한다. gen-078 이 자기진단을 CI 에 넣어 "CI 가 아무것도 검증하지 않는" 상태는 벗어났으나, 470+278+44건의 테스트는 여전히 로컬 실행에만 의존한다.

## Source Backlog

`ci-에서-테스트-실행-private-submodulereap-test-접근-토큰-설정.md` (2026-07-27 생성, 2026-07-28 D안으로 갱신)

### Problem

`.github/workflows/ci.yml` 의 job 이름은 `test` 인데 테스트를 돌리지 않는다. 원인은 접근 권한:

```
.gitmodules:  tests → https://github.com/c-d-cc/reap-test.git   (PRIVATE)
```

`actions/checkout@v4` 의 기본 `GITHUB_TOKEN` 은 다른 저장소에 접근할 수 없다.

### 방치의 대가

e2e 1건 실패가 6세대(gen-072~077) 방치됐다. 매 세대 validation 에서 "pre-existing 인가 회귀인가"를 사람이 판단해야 했다. **테스트가 있는데 아무도 강제하지 않으면 없는 것과 크게 다르지 않다.**

### 채택된 해법 — D (실행 주체 뒤집기)

`reap-test` 가 private 인 이유는 **복제 guard** (유저 확인). 그런데 `c-d-cc/reap` 은 PUBLIC 이고, **public 저장소의 Actions 로그·artifact 는 누구나 열람 가능**하다. `bun test` 는 테스트 이름을 전부 출력하므로 A안(reap 에서 실행)은 guard 를 로그로 새게 한다 — 그리고 **한 번 나간 로그는 되돌릴 수 없다.**

따라서 실행 주체를 뒤집는다: 테스트를 **reap-test(private)의 CI 에서** 돌려 로그가 private 에 남게 한다.

| | A (reap 에서) | **D (reap-test 에서)** |
|---|---|---|
| 로그 가시성 | 공개 | **비공개** |
| tests 접근 | PAT 필요 | 자기 자신 |
| reap 접근 | 자기 자신 | public 이라 토큰 불필요 |
| fork PR | secret 없음 → **항상 red** | test job 이 없음 → **영향 없음** |

## Key Findings

### 1. 테스트는 `<reap>/tests/` 배치를 하드코딩한다 — 뒤집기의 핵심 제약

```ts
// tests/helpers/setup.ts:10
const PROJECT_ROOT = join(import.meta.dir, "../..");
const CLI_PATH = join(PROJECT_ROOT, "dist/cli/index.js");
```

unit 테스트도 전부 `from "../../src/core/*.ts"` 형태다.

즉 reap-test 의 워크플로는 **디렉토리 배치를 그대로 재현**해야 한다. submodule 관계가 반대가 되는 게 아니라, **checkout 두 번으로 같은 배치를 만드는 것**이다:

```yaml
- uses: actions/checkout@v4        # reap → ./reap
  with: { repository: c-d-cc/reap, path: reap }
- uses: actions/checkout@v4        # reap-test → ./reap/tests
  with: { path: reap/tests }
```

reap 을 submodule 없이 checkout 하면 `tests/` 는 빈 디렉토리로 남으므로 그 자리에 덮어쓰면 된다. **이 배치가 실제로 동작하는지는 실측 대상** (빈 submodule 디렉토리에 checkout 이 되는지).

### 2. 어느 SHA 조합을 테스트할 것인가 — 결정 필요

reap 의 커밋은 submodule pointer 로 tests 의 SHA 를 고정한다 (현재 `8a68919`). 트리거 경로가 둘이므로 조합도 둘이다:

| 트리거 | reap | tests |
|---|---|---|
| reap push | 그 커밋 SHA | submodule pointer? 아니면 main HEAD? |
| reap-test push | main HEAD | 그 커밋 SHA |

submodule pointer 를 쓰면 **개발자가 실제로 검증한 조합**이 재현된다. main HEAD 를 쓰면 최신 테스트로 검증하지만 개발자가 못 본 조합이 될 수 있다. planning 에서 결정한다.

### 3. daemon 테스트의 리눅스 위험 — 실측 필요

```
daemon deps: better-sqlite3 ^11 (네이티브), tree-sitter-wasms, web-tree-sitter
tests/e2e/daemon-*.test.ts — 4 파일
```

- `better-sqlite3` 는 네이티브 빌드. prebuilt 가 있으면 통과, 없으면 빌드 도구 필요
- `daemon-indexing.test.ts` 는 **tests/ 중 유일하게 darwin 문자열을 포함**한다. genome 에 기록된 `/var` → `/private/var` symlink 문제 — 리눅스엔 그 symlink 가 없으므로 오히려 더 잘 될 가능성도 있다
- 포트 17225 바인딩, HOME 격리 (helper 가 자식 프로세스에 `HOME` env 전달 → POSIX 에서 동작할 것으로 보이나 실측)

backlog 의 단계적 도입 원칙: **3단계(daemon)가 실패해도 1·2·4 는 유지**한다. 제외 시 사유를 워크플로 주석에 남긴다.

### 4. reap-test 에는 워크플로가 하나도 없다

```
gh api repos/c-d-cc/reap-test/contents/.github/workflows → 404
```

전부 신규 작성이다. 그리고 **reap-test 는 이 저장소의 submodule 이므로 커밋 절차가 다르다** (tests/ 는 별도 처리 필요).

### 5. 사용자 수동 작업이 선행 조건

`c-d-cc/reap-test` 에 `repository_dispatch` 를 보낼 fine-grained PAT → `c-d-cc/reap` secret 등록. **agent 가 할 수 없다.** 이것 없이는 트리거 검증이 불가능하므로, 워크플로 작성까지는 진행하고 그 지점에서 대기한다.

### 6. 현재 baseline

| 스위트 | 결과 |
|---|---|
| unit | 470 pass / 0 fail |
| e2e | 278 pass / 0 fail |
| scenario | 44 pass / 0 fail |

세 스위트 모두 0 fail (gen-077 에서 마지막 pre-existing 해소). CI 에서 이 수치가 재현되어야 한다. backlog 본문의 "272-0" 은 gen-080 이전 값으로 낡았다.

## Previous Generation Reference

gen-080 의 교훈 중 본 generation 에 직접 걸리는 것:

- **문서 대조 ≠ 실측.** backlog 가 "4개 필드가 틀렸다"고 했으나 실제 오류는 1개였다. 본 generation 에도 실측 대상이 둘(디렉토리 배치, daemon on linux) 있으며, **추론으로 결론내지 않는다.**
- **deferred 는 "나중에 해도 되는 것"이 아니라 "지금 위험이 열려 있다는 기록"이다.** daemon 테스트를 CI 에서 제외하기로 한다면 그 사실과 이유를 워크플로 주석에 남긴다.

## Backlog

pending 3건 — 모두 본 generation 과 무관하므로 승계하지 않는다.

- interview 기능 추가 (gen-076 에서 abort 된 트랙, 재설계 필요)
- daemon 배포 결함 수정 (npm 설치 시 daemon 동작 불가)
- daemon 개선 검토 (SCIP)

뒤 2건은 유저 판단으로 보류 중인 daemon 트랙이다.

## Context

**차단 요인**: PAT 발급이 유저 수동 작업이라, 실제 트리거 검증은 그 이후에만 가능하다.

미결은 두 가지이며 둘 다 **실측으로 답이 나오는 것**이다:
1. 디렉토리 배치가 CI 에서 동작하는가
2. daemon 테스트가 리눅스에서 동작하는가

여기에 planning 에서 결정할 것 하나(SHA 조합)가 추가된다.

## Clarity Level

**high**

- backlog 가 구체적이고, A/B/C/D 선택이 유저 확인으로 확정됨
- fork PR 처리 방침도 유저 판단으로 확정 (수동 검증, 사전 장치 미구축)
- 단계적 도입 순서 명시
- 남은 미결은 설계 모호성이 아니라 실측 항목

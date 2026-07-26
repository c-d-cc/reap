# Implementation Log

## Completed Tasks

| # | 내용 |
|---|---|
| T001 | gate prompt 실제 응답 형식 확인 — 임시 프로젝트에서 직접 실행. `status: "prompt"` / `phase: "select-backlog"` / `context.pendingBacklog[].filename` / `nextCommand` 확인. `--backlog` 재호출 시 `completed` 에 `backlog-consumed` 추가 + frontmatter 에 `status: consumed` + `consumedBy` + `consumedAt` |
| T002 | `gen2: start` 1개 test → gate 흐름 3개로 분해 (gated → `--backlog` 소비 → consumed frontmatter 검증) |
| T003 | `gen2: backlog carried over`(파일 존재만 확인) → consumed frontmatter + 본문 보존 검증으로 강화 |
| T004 | `--no-backlog` 경로를 독립 describe 로 추가 (별도 temp 프로젝트, 2 case) |
| T005 | `bun test tests/scenario/` → **44 pass / 0 fail** (기존 40 → 신규 4 추가) |
| T006 | unit 454-0 / e2e 263-1 — 회귀 없음 |
| T007 | environment scenario baseline 갱신 → reflect phase 에서 수행 |

## Verification Results

| 기준 | 결과 |
|---|---|
| 1. scenario 전체 green | **pass** — 44 pass / 0 fail (multi-generation 17, 나머지 3파일 27) |
| 2. gate prompt 검증 | **pass** — `status`/`phase`/`pendingBacklog[0].filename` + **generation 미생성**(`current.yml` 부재)까지 확인 |
| 3. `--backlog` 소비 | **pass** — `completed` 에 `backlog-consumed`, `sourceBacklog` 일치, frontmatter `status: consumed` + `consumedBy: gen-002-*` |
| 4. `--no-backlog` 경로 | **pass** — generation 생성되나 `backlog-consumed` 없음, 항목은 `status: pending` 유지 + `consumedBy` 없음 |
| 5. environment baseline | reflect 에서 |
| 6. unit/e2e 회귀 | **pass** — 454-0 / 263-1 (동일 pre-existing) |

## Architecture Decisions

### 소스를 고치지 않고 테스트를 현재 동작에 맞췄다

gen-065 gate 는 의도적으로 도입된 올바른 동작이고 실사용 경로다. 테스트가 낡은 것이지 CLI 가 틀린 게 아니다. "테스트가 실패하니 코드를 되돌린다"는 판단은 여기서 정반대다.

### 우회(`--no-backlog` 만 붙이기)가 아니라 gate 를 시나리오에 편입했다

backlog 가 제시한 A안(`--no-backlog` 한 줄 추가)이 가장 적은 변경이지만, 그러면 **gate 자체는 영원히 scenario 로 검증되지 않는다.** scenario test 의 목적은 실제 사용 흐름 재현이고, 사용자가 실제로 겪는 것은 "막힘 → 판단 → 재호출"이다.

그래서 B안으로 gate 흐름을 그대로 따라가되, **A안이 커버하려던 `--no-backlog` 경로도 별도 case 로 추가**했다. gate 는 출구가 둘이므로 하나만 검증하면 절반만 본 것이다.

### `--no-backlog` 는 독립 프로젝트에서 검증

이 플래그는 의도적으로 항목을 pending 으로 남긴다. 순차 흐름인 기존 describe 안에 끼워 넣으면 뒤따르는 test 의 전제(pending 0)가 깨진다. 별도 temp 프로젝트를 쓰는 것이 상태 격리 측면에서 맞다.

### assertion 을 추측이 아니라 실제 출력에서 작성했다

T001 에서 임시 프로젝트로 gate 를 실제 실행해 응답 JSON 을 확인한 뒤 assertion 을 썼다. `phase` 값, `pendingBacklog` 구조, `completed` 배열 원소명, frontmatter 필드명 모두 실측값이다.

longterm 의 "Verify framework semantics with a minimal repro" 를 적용한 것으로, 1분 투자로 잘못된 assertion 을 예방했다.

## Discovered Issues

없음. 다른 scenario 파일 3종(`merge` / `lifecycle` / `init-start-status`)은 learning 단계에서 점검했고 backlog 파일을 생성하지 않아 동일 취약성이 없음을 확인했다.

## Deferred Items

- **환경 의존성 자체의 취약성** — 이 유형의 실패는 "pending backlog 유무에 따라 통과/실패가 갈리는" 구조에서 온다. 현재는 multi-generation 만 backlog 를 만들어 문제가 국소적이지만, 향후 다른 scenario 가 backlog 를 만들면 같은 일이 반복될 수 있다. gate 를 명시적으로 다루는 본 세대의 패턴이 참고 사례가 된다. 별도 조치는 불필요하다고 판단

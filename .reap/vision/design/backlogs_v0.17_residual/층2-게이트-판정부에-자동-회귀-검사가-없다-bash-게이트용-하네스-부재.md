---
type: task
status: pending
priority: medium
createdAt: 2026-08-20T08:25:48.774Z
---

# 층2 게이트 판정부에 자동 회귀 검사가 없다 — bash 게이트용 하네스 부재

## Problem

gen-091 이 `scripts/check-agent-integration.sh` 의 판정부를 재구성했다. 이제 그 판정부는
**8개 분기**를 갖는다 (pass / 잘못된 goal / agent 실행 실패 / 파싱 불가 / gen-063 토큰 /
권한 SKIP(필드) / 권한 SKIP(토큰) / 원인 불명 FAIL).

**그중 어느 것도 자동으로 재검증되지 않는다.** gen-091 은 canned fixture 18종을 손으로
통과시켰고 그 fixture 는 scratchpad 에 있었으며 커밋되지 않았다. 다음 사람이 이 스크립트를
고치면 어느 분기가 깨졌는지 알 방법이 없다 — 유일한 실행 경로가 **$0.25 짜리 라이브 agent** 이고,
그 라이브 실행은 18종 중 1~2개 분기만 지난다.

genome 은 *"반복 누락은 지시가 아니라 검사로 막는다"* 고 한다. 지금 이 게이트는 자기 자신에
대해 그 규율 밖에 있다. `check-self-diagnosis.sh` / `check-version-floors.sh` /
`check-docs-version.sh` 도 마찬가지다 — **저장소에 bash 스크립트용 테스트 하네스가 없다.**

동반 사실 하나: gen-091 은 권한 거부를 on-demand 로 재현하지 못했다
(`--disallowedTools` 는 도구를 아예 주지 않고, `--permission-mode manual` 은 헤드리스에서
거부하지 않는다). 그래서 그 분기의 negative 는 **합성 fixture 로만** 가능하다 — 하네스가
있으면 그 fixture 가 자산이 되고, 없으면 매번 다시 만들어야 한다.

## Solution

`AGENT_JSON` 같은 **외부 입력을 주입 가능한 지점**을 게이트마다 하나씩 노출하고, 그 지점에
fixture 를 먹여 분기를 도는 테스트를 만든다. 세 가지 방향:

- **A. 판정부를 함수/별도 파일로 추출** — `scripts/lib/agent-verdict.sh` 를 게이트와 테스트가
  공유. 가장 깨끗하지만 게이트가 "한 파일을 읽으면 전부 알 수 있는" 성질을 잃는다.
- **B. `bats` 도입** — 표준 bash 테스트 프레임워크. 의존이 하나 늘고, `tests/` 가 submodule 이라
  어디에 둘지 판단이 필요하다.
- **C. bun test 에서 subprocess 로 스크립트를 돌린다** — 이미 e2e 가 쓰는 방식.
  의존 0. fixture 는 `tests/fixtures/agent-json/` 에 둔다.

**C 가 유력하다** — 기존 e2e 패턴과 같고 새 의존이 없다. 다만 **주입 지점을 어떻게 열 것인가**가
남는다. 환경변수 스위치는 genome 이 금하는 "끄는 스위치"와 모양이 같으므로,
"라이브 호출을 건너뛰는 스위치"가 아니라 **판정부만 부르는 별도 진입점**이어야 한다.

## Files to Change

- `scripts/check-agent-integration.sh` — 주입 지점(또는 판정부 추출)
- `tests/e2e/` 또는 `tests/unit/` — 새 테스트 (submodule 이므로 그쪽 먼저 커밋)
- `tests/fixtures/agent-json/` — 합성 fixture. **gen-091 이 18종을 만들었고 lineage 압축에
  살아남지 않을 scratchpad 에 있다. 아래 표가 그 정본이다.**
- `.reap/environment/summary.md` — 하네스가 생기면 "자동 회귀 검사 없음" 서술 제거

## gen-091 fixture 18종 — 기대 exit code 정본

**11종은 evaluator 가 만들었고, 그 세대의 결정적 결함 둘을 전부 그쪽이 잡았다.**
주입 방법: `AGENT_JSON=$(...)` 한 줄을 `AGENT_JSON=$(cat "$FIXTURE")` 로 치환한 사본에 먹인다
(치환은 정규식 1회 + `assert n == 1` — 원본과 어긋날 수 없다).

| fixture | 입력의 요점 | exit | 무엇을 고정하는가 |
|---|---|---|---|
| `denied` | 거부 명령이 `reap run start …` | **0 SKIP** | 거부 → 측정 실패 |
| `blocked-token` | result 가 지정 토큰, denials 0 | **0 SKIP** | 토큰 경로가 필드와 독립 |
| `slash-unavailable` | result 가 gen-063 토큰 | 1 FAIL | gen-063 경로 |
| `agent-error` | `is_error: true`, turn limit | 1 FAIL | agent 실행 실패 선단언 |
| `unparseable` | JSON 아님 | 1 FAIL | 파싱 불가 |
| `silent` | 성공 · 거부 0 · 토큰 없음 | 1 FAIL | 원인 열거, 단정 없음 |
| `eval-unrelated-denial` | 무관한 WebFetch 거부 + "커맨드를 못 찾았다"는 산문 | 1 FAIL | 무관한 거부가 변명이 되지 않는다 |
| `eval-r2-diagnostic-denial` | 거부 명령이 커맨드 디렉토리를 grep 하는 것 | 1 FAIL | **역선택 방지 — 가장 중요** |
| `eval-r2-webfetch-reapcc` | 프로젝트 자신의 도메인 | 1 FAIL | 도메인이 용서하지 않는다 |
| `eval-r2-opaque-denial` | 진짜 차단이나 항목에 명령문 없음 | 1 FAIL + 항목 | 반대 방향 실패가 보인다 |
| `eval-r3-reap-status` | 거부 명령이 다른 reap 하위명령 | 1 FAIL | **과하게 넓지 않다** |
| `eval-r3-argv-shape` | 명령이 argv 배열로 쪼개짐 | 1 FAIL | 인접성 가정의 한계(보수적) |
| `eval-r3-linebreak-shape` | 두 단어 사이에서 줄바꿈 | 1 FAIL | 같은 한계 |
| `eval-r3-buried-hit` | 거부 7건, 매칭이 마지막 | **0 SKIP + 최상단** | 순서 — 판정 항목이 안 잘린다 |
| `eval-r3-seven` | 거부 7건 | **0 SKIP** | 말줄임 표기 |
| `eval-r4-truncated-hit` | 긴 접두사 뒤 165번째 문자에 매칭 | **0 SKIP + 창 이동** | 잘림이 근거를 감추지 않는다 |
| `eval-r4-buried` | 순서 독립 재현 | **0 SKIP** | 순서 |
| `eval-r4-nonarray` | `permission_denials` 가 배열이 아님 | **0 SKIP, 출력 없음** | 안 깨진다 |

**`eval-r3-reap-status` 와 `denied` 의 쌍이 핵심이다** — 올바르게 좁힌 매칭과 과하게
좁힌/넓힌 매칭을 가르는 경계선이 정확히 그 둘 사이에 있다.

## 함께 판단할 것 1 — 남아 있는 진짜 구멍

게이트의 주 판정은 여전히 **파일**이고, agent 가 sentinel 없이 CLI 로 우회하면 통과한다.
gen-079 1차에서 실제로 일어났고, gen-091 이 슬래시 커맨드 비활성·실삭제 양쪽으로 재확인했으나
**agent 의 준수에 의존한다는 사실은 변하지 않았다.**

`--output-format stream-json` 은 매 메시지를 내보내므로 **슬래시 커맨드 확장이 실제로
일어났는지를 구조적으로** 볼 수 있을지 모른다. 하네스를 만들 때 함께 조사할 가치가 있다 —
그것이 되면 sentinel 은 설명으로 남고 판정이 진짜로 결정적이 된다.

## 함께 판단할 것 2 — field leg 를 유지할 것인가 (gen-091 이 열어둔 trade)

evaluator 관찰: 다른 reap 하위명령 / argv 분할 / 줄바꿈 셋이 field leg 를 비껴가고
**전부 token leg 가 잡는다.** 즉 field leg 의 고유 가치는
**"비순응 agent + 단일 문자열 명령 + 매칭 문자열을 그대로 포함"** 이라는 좁은 경우로 축소됐다.

SKIP 조건에서 field leg 를 빼고 `DENIALS` 를 보고용으로만 남기면
**fail-open (ii) 와 인접성 가정이 통째로 사라진다.** gen-091 은 유지를 택했다 —
0.17.6 사고의 정확한 모양이고 비용이 0 이라서. **요구가 아니라 판단이었고, 다시 판단해도 된다.**

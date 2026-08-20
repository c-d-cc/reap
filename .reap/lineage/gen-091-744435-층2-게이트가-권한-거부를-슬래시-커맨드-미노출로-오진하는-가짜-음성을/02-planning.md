# Planning

## Goal + Spec

층2 게이트가 `current.yml` 부재를 **하나의 원인으로 단정하는** 것을 멈춘다. 그리고 그 단정이
실제로 틀렸던 원인(권한 거부)을 **애초에 발생하지 않게** 한다.

이 세대의 실체는 한 문장이다 — **검사가 실패한 것과 검사가 아무것도 측정하지 못한 것은 다르다.**
전자는 FAIL, 후자는 SKIP 이다. 지금 스크립트는 둘을 구분하지 않고 전부 FAIL 로, 그것도
gen-063 이라는 **특정 원인을 지목해서** 보고한다.

Clarity **high** (01-learning.md). Brainstorming 생략, 바로 분해한다.

## Requirements (FR)

- **FR1** 임시 프로젝트에서 `reap` CLI 호출이 권한 분류기에 차단되지 않는다.
- **FR2** 권한이 차단된 상태로 실행되면 게이트는 **FAIL 이 아니라 SKIP/amber** 를 내고, 문구가
  권한을 지목하며, "검증되지 않았음"을 기존 SKIP 2종과 같은 강도로 말한다.
- **FR3** `current.yml` 부재를 보고할 때 **단일 원인을 단정하지 않는다.** 가능한 원인을 열거하고
  agent 의 응답을 함께 싣는다. `This is the gen-063 failure exactly` 문장을 제거한다.
- **FR4** agent 실행 자체의 성공(`subtype` / `is_error` / 파싱 가능)을 **선단언한 뒤에야**
  디스크 상태를 해석한다.
- **FR5** 슬래시 커맨드가 실제로 노출되지 않는 조건에서는 게이트가 **여전히 FAIL** 한다.
  FR1 의 권한 개방이 이 검출력을 파괴하지 않아야 한다.
- **FR6** 스크립트 주석에 남아 있는 **틀린 전제**("If the slash command had not been recognised,
  current.yml simply would not exist")를 고친다. 그 문장이 결함의 출처다.
- **FR7** 게이트의 동작 변화가 그것을 **읽는 사람과 부르는 절차**에 도달한다
  (environment / reap-guide 쌍 / `reapdev.versionBump` Step 5-2).

## Completion Criteria

1. 게이트를 그대로 돌리면 **통과**하고 생성된 generation id 를 출력한다.
2. 슬래시 커맨드를 못 쓰게 만든 조건에서 **FAIL** 한다 (두 가지 방식으로 각각 확인).
3. `permission_denials` 가 비어있지 않은 입력에서 **SKIP/amber**, exit 0, 문구가 권한을 지목.
4. `is_error: true` 입력에서 FAIL, 그리고 그 FAIL 이 gen-063 을 지목하지 않는다.
5. 부재 FAIL 문구에 `gen-063 failure exactly` 가 **없고** 원인 열거가 있다.
6. 수정 전 코드가 같은 입력에 **틀린 답을 내는 것**을 먼저 보인다.
7. 세 스위트 baseline 유지 (unit 585 / e2e 329 / scenario 44, 0 fail), `fix --check` 회귀 없음.

## 설계 판단

### D1. 권한은 `settings.local.json` 과 `--allowedTools` **둘 다**로 준다

backlog 의 수동 재현이 통과한 조합이 정확히 그 쌍이다. 하나로 좁히면 "검사 범위를 좁히면 기준이
통과로 바뀐다"(genome § 게이트에 대해 쓰는 문장의 규율)에 해당한다. 허용 범위는 `Bash(reap:*)`
**하나로 좁게** — `Bash(*)` 는 agent 에게 무엇이든 허용한다.

임시 프로젝트 안에만 쓴다. 스크립트가 이미 지키는 성질(현재 설치를 읽기만 한다)을 유지한다.

### D2. 판정 순서를 바꾼다 — 두 곳의 fail-open 을 없앤다

현재 구조는 토큰 검사(§2c) → 디스크 검사(§3) 다. 여기에 `permission_denials` 를 §2 에 얹으면
**"거부가 있었지만 결국 성공한" 실행이 SKIP 으로 새어나간다.** 반대로 디스크 검사를 먼저 두면
**"슬래시 커맨드 없이 CLI 로 우회해 파일만 만든" 실행이 통과한다** — gen-079 에서 실제로 일어난 일.

그래서 순서를 이렇게 고정한다:

```
1. agent 실행 자체가 성공했는가            → 아니면 FAIL            (FR4)
2. SLASH_COMMAND_UNAVAILABLE 토큰이 있는가 → 있으면 FAIL (gen-063)  ← 디스크보다 앞
3. current.yml 이 있는가
   ├ 있음 → goal 일치? → PASS / FAIL(잘못된 goal)
   └ 없음 → 원인 분류
        ├ permission_denials 비어있지 않음  → SKIP/amber           (FR2)
        ├ PERMISSION_BLOCKED 토큰           → SKIP/amber           (FR2)
        └ 그 외 → FAIL, 원인 열거 + agent 응답 (단정 없음)         (FR3)
```

2번이 3번보다 앞인 것이 핵심이다 — agent 가 "커맨드가 없다"고 말했는데 파일이 생겼다면
그것은 통과가 아니라 **우회**다.

### D3. `permission_denials` 하나에 얹지 않는다 — 지정 토큰을 하나 더 둔다

이 세대에서 측정한 것: **거부를 on-demand 로 재현할 수 없고**(P1/P2/P3, 01-learning.md),
**오늘의 실패 실행에서 그 필드가 채워졌는지는 알 수 없다.** agent 는 산문으로는 분명히
차단을 보고했다. 그러므로 이미 있는 `SLASH_COMMAND_UNAVAILABLE` 과 **같은 방식**으로
`PERMISSION_BLOCKED` 를 지시한다. 우리가 불러준 토큰을 맞춰보는 것은 산문 파싱이 아니다.

**이것은 fail-open 을 하나 만든다** — agent 가 토큰을 헛되이 뱉으면 FAIL 이어야 할 것이 SKIP 이 된다.
정당화: (a) 그 분기는 `current.yml` 이 없을 때만 도달하고, (b) SKIP 은 amber 로 "검증되지 않았음"을
크게 말하므로 통과로 읽히지 않으며, (c) 그 대가로 없애는 것은 **매 릴리즈마다 나오는 틀린 FAIL** 이다.
genome 이 요구하는 대로 **명시적으로 정당화해야 하는 예외**로 기록한다.

### D4. SKIP 의 exit code 는 0

기존 SKIP 2종(`claude` 부재 / `reap` 부재)이 exit 0 이다. 비-0 은 호출부에서 FAIL 로 읽힌다.
대신 문구를 기존 SKIP 과 **같은 형태**로 낸다 — `agent integration was NOT verified`.

### D5. 릴리즈 문서(RELEASE_NOTES / NOTICE / 5 로케일)는 **건드리지 않는다**

이 스크립트는 개발자만 돌린다. 사용자가 경험하는 것이 하나도 바뀌지 않으므로 changelog 항목의
대상이 아니다. `check-docs-version.sh` 는 버전 정합성만 보므로 게이트도 통과한다.
(판단 근거를 남긴다 — 다음 세대가 "왜 안 적었나"를 다시 묻지 않도록.)

### D6. 자동 검사는 만들지 않는다 — backlog 로 넘긴다

genome 은 "반복 누락은 검사로 막는다"고 한다. 그러나 이 판정부에 자동 회귀 검사를 붙이려면
**bash 스크립트용 테스트 하네스**가 필요하고, 이 저장소에는 그것이 없다
(`check-self-diagnosis.sh` 도 없다). 스코프 밖이므로 backlog 로 넘기고, 이번 세대는
canned fixture 를 **손으로** 통과시켜 각 분기를 보인다. 그 fixture 는 `tests/fixtures/` 가 아니라
scratchpad 에 두고 커밋하지 않는다 — 커밋하면 아무도 돌리지 않는 자산이 된다.

## Files to Change (strictEdit — 이 목록 밖은 건드리지 않는다)

| 파일 | 무엇을 |
|---|---|
| `scripts/check-agent-integration.sh` | 본체 — § 헤더 주석 / § 1 권한 파일 / § 2 호출·프롬프트·파싱 / § 3 판정 |
| `.reap/environment/summary.md` | 74행 층2 서술 + 게이트 표 아래 "무엇을 못 잡는가" |
| `src/templates/reap-guide.md` | § Verifying a Release — 측정 실패와 검사 실패의 구분 |
| `.reap/reap-guide.md` | 위와 **바이트 동일** 유지 (dogfooding 쌍) |
| `.claude/commands/reapdev.versionBump.md` | Step 5-2 — 새 SKIP 사유를 읽는 법 |
| `.reap/life/*.md` | artifact (02~05) |
| `.reap/vision/memory/*.md` | reflect phase |
| `.reap/life/backlog/*` | `reap make backlog` 로만 생성 |

**건드리지 않는 것**: `src/**`, `RELEASE_NOTES.md`, `RELEASE_NOTICE.md`, `docs/**`,
`package.json`, `scripts/check-self-diagnosis.sh`, 다른 게이트 스크립트, `tests/`.

## Tasks

- [ ] T001 § 1 — `reap init` 직후 임시 프로젝트에 `.claude/settings.local.json` 을 쓴다
      (`{"permissions":{"allow":["Bash(reap:*)"],"deny":[]}}`). 왜 임시 디렉토리 안에만 쓰는지 주석.
- [ ] T002 § 2 — `claude -p` 호출에 `--allowedTools "Bash(reap:*)"` 추가.
- [ ] T003 § 2 — 프롬프트에 `PERMISSION_BLOCKED` 토큰 지시 추가 (기존 토큰 지시와 같은 형태).
- [ ] T004 § 2 — node 파서가 `permission_denials` 개수와 요약을 함께 뽑는다.
      `subtype !== "success"` 도 FAIL 로 (현재는 `is_error` 만 본다).
- [ ] T005 § 3 — D2 의 순서로 판정 재구성. 부재 분기 안에서 원인 분류.
      SKIP 경로 신설, FAIL 문구는 원인 열거 + agent 응답. `gen-063 failure exactly` 삭제.
- [ ] T006 헤더 주석 — 틀린 전제 문장 교체. 왜 틀렸는지(역이 성립하지 않음)를 그 자리에 적는다.
- [ ] T007 `.reap/environment/summary.md` 갱신.
- [ ] T008 `src/templates/reap-guide.md` + `.reap/reap-guide.md` 갱신 (동일성 유지).
- [ ] T009 `.claude/commands/reapdev.versionBump.md` Step 5-2 갱신.
- [ ] T010 검증 실행 (아래 표) + 비용 기록.
- [ ] T011 스코프 밖 발견을 `reap make backlog` 로 등록.

의존: T001~T006 은 같은 파일이므로 순차. T007~T009 는 독립. T010 은 T001~T006 이후.

## 검증 계획 — 무엇을 어떻게, 얼마에

`[실행]` 을 붙이려면 명령을 지목할 수 있어야 한다(genome). 아래는 그 명령이다.

| # | 무엇을 | 어떻게 (지목 가능한 명령) | 기대 | 비용 |
|---|---|---|---|---|
| N0 | **수정 전이 틀린 답을 낸다** | `git stash` 로 수정 되돌린 뒤 fixture(부재+거부) 투입 | 옛 문구가 gen-063 을 단정 | $0 |
| N1 | 권한 거부 분기 | fixture: `permission_denials` 1건 | **SKIP/amber**, exit 0, 권한 지목 | $0 |
| N2 | 토큰 기반 거부 분기 | fixture: result 에 `PERMISSION_BLOCKED` | SKIP/amber | $0 |
| N3 | gen-063 토큰 분기 | fixture: result 에 `SLASH_COMMAND_UNAVAILABLE` | FAIL, gen-063 경로 | $0 |
| N4 | agent 실행 실패 분기 | fixture: `is_error: true` | FAIL, 원인 단정 없음 | $0 |
| N5 | 원인 불명 부재 분기 | fixture: 성공·거부 0·토큰 없음 | FAIL, **원인 열거** | $0 |
| V1 | **정상 통과** | `bash scripts/check-agent-integration.sh` 무수정 | PASS + gen id | ~$0.25 |
| V2 | **슬래시 커맨드 비활성** | 호출에 `--disable-slash-commands` 를 임시 삽입 | **FAIL** | ~$0.25 |
| V3 | **슬래시 커맨드 실제 삭제** | `~/.claude/commands/reap.*.md` 를 옮겼다가 즉시 복구 | **FAIL** | ~$0.25 |

fixture 투입 방법: `AGENT_JSON=$(cd "$PROJECT" && claude -p ...)` 행을
`AGENT_JSON=$(cat "$FIXTURE")` 로 **임시 치환**하고 실행 후 `git checkout` 으로 되돌린다.
어디를 어떻게 깨뜨렸는지 03-implementation.md 에 **행 번호와 함께** 적는다 (gen-090 L5).

**V2/V3 이 이 세대의 유일한 진짜 위험이다.** 권한을 열면 agent 가 슬래시 커맨드 없이도 CLI 로
우회할 수 있고, 그러면 게이트는 진짜 gen-063 결함에도 통과한다. gen-079 에서 이미 일어났다.
둘 다 FAIL 해야 하며, 하나라도 통과하면 **수정이 검사를 파괴한 것**이므로 판정을 다시 설계한다.

V3 의 부수 위험: 이 세션에 다른 agent 가 살아 있다. 삭제 창을 **수십 초로 최소화**하고
복구는 원본 파일을 되돌려 놓는 방식(`mv` 왕복)으로 한다 — `reap install-skills` 재설치에
의존하지 않는다(전역 0.17.5 가 자기 번들 내용을 쓰므로 내용이 달라질 수 있다).

이미 지출: 탐색 P1~P3 **$0.4229** (01-learning.md 표). 계획 총액 **약 $1.17**.

## 기존 테스트 영향

`grep -rn "check-agent-integration" tests/` → **0건**. 이 스크립트를 부르는 테스트는 없다.
`src/**` 를 건드리지 않으므로 unit/e2e/scenario 어느 쪽도 영향받지 않는다 —
그럼에도 baseline 확인은 validation 에서 **돌려서** 한다(추측 금지, gen-090 L1).

## Additional Findings

- `~/.claude/settings.json` 의 `permissions.defaultMode` 가 `"auto"` — backlog 의 전제가
  이 머신에서 사실. 다른 개발자 머신이 `manual`/`acceptEdits` 면 증상이 다를 수 있으나
  S1 은 어느 쪽에서도 무해하다.
- `--disallowedTools` 는 도구를 **아예 제공하지 않으므로** `permission_denials` 를 만들지 않는다.
  `--permission-mode manual` 도 헤드리스에서 거부를 만들지 않았다. 그래서 N1 은 fixture 다.
- `.reap/reap-guide.md` 와 `src/templates/reap-guide.md` 는 현재 **바이트 동일**. 유지한다.
- `~/.reap/reap-guide.md`(설치본)는 0.17.5 시점이라 낡았다. 이것은 소스가 아니라
  `install-skills` 산출물이므로 이번 세대의 수정 대상이 아니다.

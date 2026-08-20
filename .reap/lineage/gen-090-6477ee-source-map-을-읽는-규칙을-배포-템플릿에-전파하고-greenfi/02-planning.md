# Planning

## Goal

source-map 을 읽는 규칙을 배포 템플릿에 전파하고, greenfield 로 init 한 프로젝트에서도 정상 동작하게 만든다.

## Spec

### 채택 방향 — S2 + S1 의 생존성 (두 개의 열린 판단을 닫는다)

사용자 지시("greenfield 일때도 정상동작 해야 한다")로 **S2 채택**은 확정이다.
남은 판단은 S1 의 조건부 문구를 함께 둘 것인가였고, **둔다.** 단 backlog 가 쓴 형태 그대로는 아니다.

backlog 의 S1 문구는 *"source-map 이 있으면 읽는다. 없으면 summary.md 가 갖고 있다"* 로,
**부재를 정상 상태로 축복한다.** S2 를 함께 채택하면 그 문장은 자기모순이 된다 — 한쪽은 파일을
항상 만들고 다른 쪽은 없어도 괜찮다고 말한다. 그래서 순서를 뒤집는다:

> **명령형이 먼저, 부재는 예외이고, 예외에 대한 답은 "괜찮다"가 아니라 "만들어라"다.**

이렇게 하면 (a) 신규 프로젝트는 파일이 항상 있으므로 규칙이 무조건 참이고,
(b) 0.17.6 이전에 greenfield 로 init 한 프로젝트나 사용자가 파일을 지운 경우에도 agent 가
막히지 않으며, (c) 그 경우의 지시가 "무시하라"가 아니라 "summary.md 를 읽고, 그것이 커지면
source-map 을 만들어라"가 된다.

### 이 규칙은 세 곳이 안다 — carrier 를 심는다

| 파일 | 언어 | 역할 |
|---|---|---|
| `src/templates/evolution.md` | 영어 | 신규 프로젝트가 받는 정본 |
| `src/templates/migration/v0.17.6.md` | 영어 | 기존 프로젝트 도달 채널 (원본+신형 전문을 실음) |
| `.reap/genome/evolution.md` | 한국어 | REAP 자신의 규칙 |

산문이고 번역이 섞여 있어 **공유가 불가능하다** → `reap:carrier(source-map-read-rule)` 표식.
다만 앞의 둘은 **같은 영어 문자열**이므로 표식에 더해 **테스트로 동일성을 강제**한다
(genome § "공유 가능하면 표식보다 공유가 낫다" 의 정신 — 여기서는 공유 대신 검사).

### greenfield 스텁이 담을 것

코드가 없는 프로젝트의 source-map 이므로 `generateSourceMap(scan)` 은 쓸 수 없다 (스캔할 것이 없다).
**빈 트리보다 "이 파일이 무엇을 위한 것인지 가르치는 스텁"이 낫다.**

제약 (F2): heading / `>` blockquote / `<!--` 이외의 **실질 라인을 반드시 포함**한다.
현재 placeholder 검사는 genome 3파일에만 걸리지만, 검사가 environment 로 확장돼도 통과하도록
지금 만족시켜 둔다 — 비용 0.

## Requirements

### FR

- **FR1** `src/templates/evolution.md` 의 `## Code Quality Principles` 첫 항목으로 source-map
  읽기 규칙이 들어간다. 명령형 + 부재 시 행동 지시를 포함한다.
- **FR2** `reap init`(greenfield) 이 `.reap/environment/source-map.md` 를 생성한다. 내용은 실질
  라인을 포함하며, `fix --check` 에 어떤 findings 도 추가하지 않는다.
- **FR3** greenfield 대화 prompt(PHASE 6)가 source-map 을 채우도록 지시한다.
- **FR4** `src/templates/migration/v0.17.6.md` 에 §6 이 추가된다. genome 편집은
  `application.md` 의 **3분기 판정**을 따르고, 판정 가능하도록 **배포 원본 전문**을 싣는다.
  source-map 이 없는 프로젝트에 그것을 만드는 지시도 포함한다.
- **FR5** `.reap/genome/evolution.md` 의 기존 규칙을 신형과 같은 의미로 맞추고 carrier 표식을 단다.
- **FR6** 세 carrier 중 **영어 둘의 동일성**을 unit test 가 강제한다.
- **FR7** 릴리즈 문서 3종(NOTES / NOTICE / 5 로케일)의 **기존 0.17.6 항목**에 이 변경이 실린다.
  새 버전 섹션을 만들지 않는다.

### 완료 기준 (검증 가능)

- **C1** `tests/e2e/init-basic.test.ts` 의 신규 케이스가 **수정 전 RED / 수정 후 GREEN**.
- **C2** `tests/unit/shipped-source-map-rule.test.ts` 가 **수정 전 RED / 수정 후 GREEN**.
- **C3** 세 스위트 전부 0 fail, 개수는 baseline(unit 575 / e2e 326 / scenario 44) **이상**.
- **C4** `bash scripts/check-self-diagnosis.sh` 전 절 통과. §3 의 신규 assertion 이
  **greenfield 수정 전에 fail 하는 것을 먼저 확인**한다.
- **C5** `bash scripts/check-docs-version.sh` 통과.
- **C6** `npm run typecheck` + `npm run build` 성공, `cd docs && npx vite build` 성공.
- **C7** `reap fix --check` 가 상속한 3 warning 외에 **새 findings 를 만들지 않는다**.

## Implementation Plan

### 순서 — 검사를 먼저 RED 로 만든다

- [ ] **T001** `tests/e2e/init-basic.test.ts` 에 greenfield source-map 케이스 추가 →
      **실행해 RED 확인** (파일 부재). *검증: `npm run test:e2e` (해당 파일)*
- [ ] **T002** `tests/unit/shipped-source-map-rule.test.ts` 신설 →
      **실행해 RED 확인** (템플릿에 규칙 없음). *검증: `npm run test:unit` (해당 파일)*
- [ ] **T003** `scripts/check-self-diagnosis.sh` §3 에 "init 직후 source-map.md 가 존재하고
      실질 라인을 갖는다" assertion 추가 → **게이트를 돌려 fail 확인**. *검증: `[실행]` 게이트*
- [ ] **T004** `src/templates/evolution.md` — FR1 규칙 삽입 + carrier 표식.
- [ ] **T005** `src/cli/commands/init/greenfield.ts` — 스텁 상수 + `writeTextFile(paths.sourceMap, …)`
      + `completed[]` 에 `write-source-map` 추가 + PHASE 6 지시(FR3).
- [ ] **T006** `src/templates/migration/v0.17.6.md` — §6 추가 (원본 전문 + 신형 전문 + 3분기 판정
      + source-map 부재 시 생성 지시) + carrier 표식.
- [ ] **T007** `.reap/genome/evolution.md` — 문구 정렬 + carrier 표식 (FR5).
- [ ] **T008** `npm run build` → T001~T003 재실행하여 **GREEN 전환 확인**.
- [ ] **T009** negative test — T002 의 동일성 검사가 실제로 잡는지 확인:
      템플릿 문구를 한 글자 바꿔 RED 를 보고 복원한다.
- [ ] **T010** 릴리즈 문서 — `RELEASE_NOTES.md` What's New 에 항목 1개,
      `RELEASE_NOTICE.md` v0.17.6 en/ko 에 문장 1개, 5개 로케일 0.17.6 `notes` 에 문장 1개.
- [ ] **T011** `cd docs && npx vite build` + `bash scripts/check-docs-version.sh`.
- [ ] **T012** 전체 스위트 3종 + typecheck + 자기진단 게이트 최종 실행, 수치 기록.

### 테스트 상세

| 대상 | 레벨 | 근거 |
|---|---|---|
| greenfield init 이 source-map 생성 | **e2e** | CLI command 동작 변경 (genome § 테스트 레벨 기준) |
| 배포 템플릿 ↔ migration note 문자열 동일성 | **unit** | 파일 내용 순수 비교, 외부 의존 없음 |
| 설치 tarball 에서도 생성되는가 | **자기진단 게이트** | e2e 는 소스 트리를 본다. 배포 산출물은 게이트만 본다 |

**T002 의 동일성 검사 방식**: migration note 본문이 템플릿의 `## Code Quality Principles` 절 전문을
**부분 문자열로 포함**하는지 본다 (note 안에 fenced block 으로 flush-left 로 싣는다). 블록 파싱
규칙을 만들지 않으므로 note 의 서술이 바뀌어도 깨지지 않고, **규칙 문구가 한쪽만 바뀌면 반드시 깨진다.**

**self-proving**: 모든 assertion 앞에 대상 파일이 실재하고 절을 추출할 수 있음을 먼저 요구한다
(`shipped-docs-no-daemon.test.ts` 의 패턴). 부재 assertion 이 크래시·경로 오타로 통과하는 것을 막는다.

### 영향받는 기존 테스트

- `tests/e2e/init-basic.test.ts` — **추가만.** 기존 케이스의 기대값은 바뀌지 않는다
  (greenfield 가 만드는 파일이 하나 늘 뿐, 없어지는 것이 없다).
- `tests/e2e/init-repair.test.ts` / `update*.test.ts` — repair·update 경로는 **건드리지 않는다**
  (아래 § 의도적 제외). 기대값 변화 없음.
- `tests/unit/integrity*.test.ts` — integrity 를 수정하지 않으므로 영향 없음.

## 의도적 제외 — 그리고 그 근거

### `reap fix --check` 에 "source-map 없음" 경고를 넣지 않는다

넣으면 규칙 문구와 **정면으로 모순된다.** FR1 의 문구는 부재를 예외로 다루고 대응 행동을 준다 —
그런데 checker 가 부재를 경고하면 "없어도 진행할 수 있다"와 "없으면 문제다"를 REAP 이 동시에 말한다.
issue #22 가 정확히 그 형태였다(installer 와 checker 가 서로를 부정). 게다가 0.17.6 이전에
greenfield 로 init 한 모든 프로젝트가 즉시 경고를 받는다 — genome § "항상 무언가를 보고하는 검사는
필터링된다".

**대신 backlog 로 남긴다** (strictEdit 의 out-of-scope 처리). 규칙을 무조건형으로 굳히기로 결정하는
미래 세대가 그때 함께 판단할 항목이다.

### `reap init --repair` / `reap update` 가 source-map 을 보충하지 않는다

- `repair.ts` 의 현재 책임은 **CLAUDE.md 하나**다 (client 통합 파일). environment 콘텐츠는 그 범주가 아니다.
- `update.ts` 의 `ensureDirectories` 는 **디렉토리만** 만든다. 파일을 만드는 선례가 없다.
- 무엇보다 **기존 프로젝트에는 코드가 있다.** 코드가 있는 프로젝트에 빈 스텁을 던지는 것은
  greenfield 스텁과 달리 **틀린 내용을 쓰는 것**이다. migration note 를 따르는 agent 는 코드베이스를
  읽고 실제 내용을 채울 수 있다 — 그쪽이 옳은 채널이다.
- 부수 효과: 사용자가 의도적으로 지운 파일을 `update` 가 매번 되살리게 된다.

### `src/templates/reap-guide.md` 에 규칙을 넣지 않는다

guide 는 **REAP 도구 사용법**이고 행동 규칙의 집은 genome 이다. 넣으면 carrier 가 4개가 된다.
guide 의 `.reap/` 구조 표에 이미 `source-map.md ... (on-demand)` 가 있으며 그것으로 충분하다.

## Additional Findings

- `repair.ts` 는 CLAUDE.md 만 다룬다 (`repair.ts:12-51`) — 위 제외 판단의 근거 `[독해]`.
- zsh 에서 `$var:path` 형태가 `bad substitution` 으로 죽는다. git 이력 반복 조회는
  **bash 스크립트로** 실행해야 한다 (learning F4 에서 실제로 걸렸다).
- `scripts/check-docs-version.sh` 는 **본문 텍스트를 비교하지 않는다** (learning F7). 0.17.6 항목에
  문장을 덧붙이는 것은 게이트를 건드리지 않지만, **덧붙였는지 여부도 게이트가 보지 못한다** —
  T010 은 사람이 확인해야 하는 항목이며 그렇게 표기한다.

## 변경 대상 파일 (strictEdit)

```
src/templates/evolution.md
src/templates/migration/v0.17.6.md
src/cli/commands/init/greenfield.ts
scripts/check-self-diagnosis.sh
tests/e2e/init-basic.test.ts
tests/unit/shipped-source-map-rule.test.ts        (신규)
RELEASE_NOTES.md
RELEASE_NOTICE.md
docs/src/i18n/translations/en.ts
docs/src/i18n/translations/ko.ts
docs/src/i18n/translations/ja.ts
docs/src/i18n/translations/de.ts
docs/src/i18n/translations/zh-CN.ts
.reap/genome/evolution.md
.reap/environment/summary.md                      (reflect)
.reap/vision/memory/shortterm.md                  (reflect)
.reap/vision/memory/midterm.md                    (reflect)
.reap/vision/memory/longterm.md                   (reflect)
.reap/life/01-learning.md ~ 05-completion.md      (artifacts)
.reap/life/backlog/*.md                           (out-of-scope 항목 등록)
```

`package.json` 은 건드리지 않는다 (0.17.6 유지). `dist/` 는 빌드 산출물.

## 인간 확인

clarity **high** — 사용자가 S2 를 이미 지시했고 backlog 가 변경 대상을 지목한다.
planning 에서 새로 연 판단 두 가지(문구의 방향, 검사 미추가)는 근거를 위에 명시했으며,
둘 다 **사용자 지시를 좁히거나 넓히지 않는다.** 이 계획대로 진행한다.

---

# 계획 수정 (2026-08-20, fitness 직전 발견 → 사용자 결정 B)

**원 계획은 위에 그대로 둔다.** 아래는 추가분이며, 무엇이 왜 늘었는지 남기기 위해 덮어쓰지 않았다.

## 왜 수정하는가

fitness 단계에서 evaluator 가 지적하고 내가 4곳 전부 확인한 결함: **읽기 규칙을 추가하면서
대응하는 쓰기 의무를 남기지 않았다.** 배포되는 genome 이 동시에 두 가지를 말한다 —

- (새로 추가) *"코드를 고치기 전에 `environment/source-map.md` 를 읽어라"*
- (기존) *"reflect 에서 `summary.md` 의 **Source Structure** 를 갱신하라"*

결과: 신규 프로젝트의 스텁이 `(not recorded yet)` 로 영원히 남을 수 있고, 규칙은 매 작업마다
agent 를 그리로 보낸다 — **본 세대의 migration note 가 스스로 "부재보다 나쁘다"고 부르는 상태**다.
REAP 자신도 이미 그 안에 있다: gen-089 가 `Source Structure` 를 포인터로 비웠으므로,
`.reap/genome/evolution.md:290` 을 문자 그대로 따르는 다음 세대는 그 절을 다시 키운다.

**본 세대의 변경이 직접 만든 결함이므로 인과 범위 안이다** (genome § 인과로 묶인 fix).

## Scope — 못박는다

**모순만 멈춘다. 소유 모델은 정하지 않는다.**

*"source-map 을 누가 언제 유지하는가"* 는 05-completion.md hint 2 가 이미 다음 세대로 미룬 경계
질문이고, 여기서 정하면 genome § *"fix 가 큰 design 변경을 동반하면 backlog 화"* 에 걸린다.
두 조항은 충돌하지 않는다 — **모순 제거는 본 세대, 소유 모델은 다음 세대**를 가리킨다.

구체적으로: "갱신 대상"을 서술하는 문장이 **두 파일을 함께 지목하도록** 고친다. 새 규칙도,
새 phase 도, 새 검사도 만들지 않는다.

## 추가 FR

- **FR8** 배포 genome 의 `Environment Refresh at Completion` 과 `Genome vs Environment Boundary` 가
  `summary.md` 와 `source-map.md` 를 **함께** 지목한다.
- **FR9** reflect prompt(`completion.ts`)가 같은 사실을 말한다. `application.md` 는 규칙 텍스트와
  `run/*.ts` prompt 문자열을 **하나의 사실**로 규정한다 — #21 이 이 집합의 일부만 갱신해서 생겼다.
- **FR10** 규칙의 **absence clause 를 조건형으로** 고친다. 현재 문구
  *"a project that has none **keeps** its structure description in `summary.md`"* 는 지시가 아니라
  **사실 주장**이고, 0.17.6 이전 greenfield 프로젝트에는 보장되지 않는다 — 이 세대가 고치는 결함이
  한 조항 옆에서 반복된 형태다.
- **FR11** 위 전부가 **기존 프로젝트에 도달**한다 (migration note §6 확장, 3분기 판정 유지).
- **FR12** 새 carrier 집합에 표식을 심는다 (`reap:carrier(environment-refresh-targets)`).

## 추가 완료 기준

- **C8** `bash scripts/list-carriers.sh` 가 `environment-refresh-targets` 를 **4개 파일**로 보고한다
  (`.reap/genome/evolution.md` 는 adapt 에서 합류하므로 그 시점에 재확인).
- **C9** 규칙 문구 변경이 migration note 의 설치 블록과 **byte-identical** 로 유지된다 —
  기존 unit 검사가 이것을 강제하므로, 한쪽만 고치면 red 가 난다 `[negative]`.
- **C10** 세 스위트 0 fail, 두 게이트 통과, `fix --check` 새 findings 0.

## 추가 task

- [ ] **T101** `src/templates/evolution.md` — FR8 + FR10 + 표식
- [ ] **T102** `src/cli/commands/run/completion.ts` — FR9 + 표식
- [ ] **T103** `src/templates/migration/v0.17.6.md` — FR11 (§6 확장 + 설치 블록 동기화)
- [ ] **T104** 재검증: 세 스위트 · typecheck · build · 두 게이트 · `fix --check` · docs build
- [ ] **T105** `[negative]` C9 확인 — 한쪽만 고친 상태에서 unit 이 red 인지
- [ ] **T106** `.reap/genome/evolution.md` (ko) — **adapt phase**. FR5 와 같은 자리에서 처리

## 변경 대상 파일 — 추가분

```
src/cli/commands/run/completion.ts        ← 원 목록에 없었다. 이것을 정직하게 만드는 것이 B 를 고른 이유
```

나머지(`src/templates/evolution.md`, `src/templates/migration/v0.17.6.md`,
`.reap/genome/evolution.md`)는 원 목록에 이미 있다.

`completion.ts` 의 변경은 **prompt 문자열 한 줄**이다. genome § 테스트 레벨 기준의
*"prompt 변경 — 기능적 영향 있으면 e2e, 없으면 skip"* 에 따라 신규 테스트는 만들지 않되,
전체 스위트로 회귀 없음을 확인한다.
